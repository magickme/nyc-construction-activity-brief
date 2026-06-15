const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packageDir = path.resolve(root, '..', 'package');
const sampleCsvPath = path.join(root, 'sample', 'nyc-construction-activity-preview.csv');

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function parseCsv(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function costBucketLabel(value) {
  return {
    under_10k: 'under $10k',
    '10k_to_50k': '$10k to $50k',
    '50k_to_100k': '$50k to $100k',
    '100k_to_250k': '$100k to $250k',
    '250k_to_1m': '$250k to $1m',
    '1m_plus': '$1m plus',
  }[value] || titleCase(String(value).replace(/_/g, ' '));
}

function countBy(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || String(left[0]).localeCompare(String(right[0])));
}

function latestDate(rows) {
  return rows.map((row) => String(row.issued_date || '').slice(0, 10)).filter(Boolean).sort().at(-1) || '';
}

function topCounts(rows, keyFn, limit = 5) {
  return countBy(rows, keyFn).slice(0, limit).map(([name, count]) => `${name}: ${count}`).join(' | ');
}

function buildSlices(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = `${row.work_type}|${row.zip_code}|${row.borough}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()]
    .map(([key, groupRows]) => {
      const [workType, zipCode, borough] = key.split('|');
      return {
        work_type: workType,
        borough: titleCase(borough),
        zip_code: zipCode,
        row_count: groupRows.length,
        latest_issued_date: latestDate(groupRows),
        cost_bucket_mix: topCounts(groupRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 4),
        permit_status_mix: topCounts(groupRows, (row) => row.permit_status, 3),
        sample_source_url: groupRows[0].source_url,
        suggested_first_filter: `work_type=${workType}; zip_code=${zipCode}`,
      };
    })
    .sort((left, right) => right.row_count - left.row_count || left.work_type.localeCompare(right.work_type) || left.zip_code.localeCompare(right.zip_code));
}

function writePrioritySlices(rows) {
  const headers = [
    'work_type',
    'borough',
    'zip_code',
    'row_count',
    'latest_issued_date',
    'cost_bucket_mix',
    'permit_status_mix',
    'sample_source_url',
    'suggested_first_filter',
  ];
  const lines = [
    headers.join(','),
    ...buildSlices(rows).map((slice) => headers.map((header) => csvEscape(slice[header])).join(',')),
  ];
  fs.writeFileSync(path.join(packageDir, 'buyer-priority-slices.csv'), `${lines.join('\n')}\n`);
}

function writeWorkbook(rows) {
  const issuedDates = rows.map((row) => String(row.issued_date || '').slice(0, 10)).filter(Boolean).sort();
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const slices = buildSlices(rows).slice(0, 12);
  const markdown = `# Buyer Workbook

This workbook is for reviewing the current NYC Weekly Construction Activity Brief after purchase.

## Current Issue

- Public preview rows in package: ${rows.length}
- Source fetch date: ${fetchDate}
- Issued dates in file: ${issuedDates[0]} to ${issuedDates.at(-1)}
- Source: NYC DOB NOW: Build - Approved Permits

## Fast Review Path

1. Open \`buyer-priority-slices.csv\`.
2. Pick one work type and ZIP slice with enough rows to justify manual review.
3. Open \`nyc-construction-activity-preview.csv\`.
4. Filter by the suggested work type and ZIP.
5. Open source links before making any business decision from a row.

## Top Work Types

${countBy(rows, (row) => row.work_type).map(([name, count]) => `- ${name}: ${count}`).join('\n')}

## Top ZIP Codes

${countBy(rows, (row) => row.zip_code).map(([zipCode, count]) => `- ${zipCode}: ${count}`).join('\n')}

## Top Buyer Slices

${slices.map((slice, index) => `${index + 1}. ${slice.work_type} in ${slice.borough} ${slice.zip_code}: ${slice.row_count} rows, latest issued date ${slice.latest_issued_date}. First filter: \`${slice.suggested_first_filter}\`.`).join('\n')}

## Review Questions

- Which work type matters to your business this week?
- Which ZIP codes are realistic for your service area?
- Which rows have enough source detail to justify opening the DOB NOW record?
- Which rows should be ignored because the cost bucket, work type, or description does not fit?

## Boundaries

This package does not include owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, lead scores, sales predictions, legal advice, tax advice, insurance advice, or compliance advice.

Source records can be incomplete, delayed, revised, duplicated, or mislabeled. Use the source links and your own review before taking action.
`;
  fs.writeFileSync(path.join(packageDir, 'buyer-workbook.md'), markdown);
}

function insertUniqueLine(text, anchor, line) {
  if (text.includes(line)) return text;
  if (!text.includes(anchor)) return `${text.trimEnd()}\n${line}\n`;
  return text.replace(anchor, `${anchor}\n${line}`);
}

function updatePackageDocs() {
  const readmePath = path.join(packageDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    readme = insertUniqueLine(readme, '- `buyer-readme.md`', '- `buyer-workbook.md`');
    readme = insertUniqueLine(readme, '- `buyer-workbook.md`', '- `buyer-priority-slices.csv`');
    readme = readme.replace(
      'CSV, Markdown brief, source registry, buyer README, QA report, version file, and claims boundary',
      'CSV, Markdown brief, buyer workbook, priority-slice CSV, source registry, buyer README, QA report, version file, and claims boundary',
    );
    fs.writeFileSync(readmePath, readme);
  }

  const buyerReadmePath = path.join(packageDir, 'buyer-readme.md');
  if (fs.existsSync(buyerReadmePath)) {
    let buyerReadme = fs.readFileSync(buyerReadmePath, 'utf8');
    buyerReadme = insertUniqueLine(buyerReadme, '- A short Markdown digest with counts by work type, ZIP, and borough.', '- A buyer workbook with a fast review path and top slices.');
    buyerReadme = insertUniqueLine(buyerReadme, '- A buyer workbook with a fast review path and top slices.', '- A priority-slices CSV for work type and ZIP screening.');
    fs.writeFileSync(buyerReadmePath, buyerReadme);
  }

  const versionPath = path.join(packageDir, 'version.txt');
  if (fs.existsSync(versionPath)) {
    let version = fs.readFileSync(versionPath, 'utf8');
    version = version
      .replace(/\n- buyer-workbook\.md/g, '')
      .replace(/\n- buyer-priority-slices\.csv/g, '');
    if (!version.includes('Included package files:')) {
      version = version.replace(
        '\nValidation commands:',
        `\nIncluded package files:
- nyc-construction-activity-preview.csv
- nyc-construction-activity-preview.md
- nyc-weekly-construction-activity-sample.md
- buyer-workbook.md
- buyer-priority-slices.csv
- buyer-readme.md
- source-registry.md
- privacy-and-claims-boundary.md
- qa-report.json
- version.txt

Validation commands:`,
      );
    }
    version = insertUniqueLine(version, '- node scripts/build-seo-pages.js', '- node scripts/build-buyer-package-addons.js');
    version = insertUniqueLine(version, '- node scripts/build-buyer-package-addons.js', '- node scripts/validate-buyer-package.js');
    fs.writeFileSync(versionPath, version);
  }
}

fs.mkdirSync(packageDir, { recursive: true });
const rows = parseCsv(fs.readFileSync(sampleCsvPath, 'utf8'));
writePrioritySlices(rows);
writeWorkbook(rows);
updatePackageDocs();

console.log(`generated buyer package add-ons for ${rows.length} rows`);
