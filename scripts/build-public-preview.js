const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const packageDir = path.resolve(root, '..', 'package');
const fullCsvPath = path.join(packageDir, 'nyc-construction-activity-preview.csv');
const publicCsvPath = path.join(root, 'sample', 'nyc-construction-activity-preview.csv');
const publicJsonPath = path.join(root, 'sample', 'nyc-construction-activity-preview.json');
const publicJsonlPath = path.join(root, 'sample', 'nyc-construction-activity-preview.jsonl');
const publicMarkdownPath = path.join(root, 'sample', 'nyc-weekly-construction-activity-sample.md');
const previewLimit = 25;

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

function countBy(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || String(left[0]).localeCompare(String(right[0])));
}

function formatCounts(rows, keyFn) {
  return countBy(rows, keyFn).map(([name, count]) => `- ${name}: ${count}`).join('\n');
}

function markdownTable(rows) {
  const sampleRows = rows.slice(0, 10);
  const header = '| issued_date | borough | zip_code | work_type | estimated_job_cost_bucket | permit_status | job_description_short |\n|---|---|---|---|---|---|---|';
  const body = sampleRows.map((row) => `| ${row.issued_date} | ${row.borough} | ${row.zip_code} | ${row.work_type} | ${row.estimated_job_cost_bucket} | ${row.permit_status} | ${String(row.job_description_short || '').replaceAll('|', '/')} |`).join('\n');
  return `${header}\n${body}`;
}

function writePublicCsv(headers, rows) {
  const previewRows = rows.slice(0, previewLimit);
  const lines = [
    headers.join(','),
    ...previewRows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];
  fs.writeFileSync(publicCsvPath, `${lines.join('\n')}\n`);
}

function writePublicJson(headers, rows) {
  const previewRows = rows.slice(0, previewLimit);
  const issuedDates = rows.map((row) => String(row.issued_date || '').slice(0, 10)).filter(Boolean).sort();
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const payload = {
    product: 'NYC Weekly Construction Activity Brief',
    issue: 'current',
    source: 'NYC DOB NOW: Build - Approved Permits',
    source_url: 'https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4',
    source_fetch_date: fetchDate,
    first_issued_date: issuedDates[0] || null,
    latest_issued_date: issuedDates.at(-1) || null,
    public_preview_rows: previewRows.length,
    paid_zip_rows: rows.length,
    purchase: {
      buy_url: `${baseUrl}/buy.html?source=sample-json`,
      pricing_url: `${baseUrl}/pricing.html`,
      support_url: `${baseUrl}/support.html`,
      price_usd: '9.50',
      delivery: 'Instant browser download after completed Stripe checkout.',
    },
    sample_urls: {
      csv: `${baseUrl}/sample/nyc-construction-activity-preview.csv`,
      json: `${baseUrl}/sample/nyc-construction-activity-preview.json`,
      jsonl: `${baseUrl}/sample/nyc-construction-activity-preview.jsonl`,
      markdown_brief: `${baseUrl}/sample/nyc-weekly-construction-activity-sample.md`,
      preview_page: `${baseUrl}/preview.html`,
    },
    paid_zip: {
      rows: rows.length,
      files: [
        'nyc-construction-activity-preview.csv',
        'nyc-construction-activity-preview.md',
        'buyer-workbook.md',
        'buyer-priority-slices.csv',
        'source-registry.md',
        'qa-report.json',
        'buyer-readme.md',
        'privacy-and-claims-boundary.md',
        'version.txt',
      ],
    },
    boundary: {
      no_private_contact_data: true,
      no_owner_names: true,
      no_applicant_names: true,
      no_full_street_addresses: true,
      no_guaranteed_leads: true,
    },
    fields: headers,
    rows: previewRows,
  };
  fs.writeFileSync(publicJsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  fs.writeFileSync(publicJsonlPath, `${previewRows.map((row) => JSON.stringify(row)).join('\n')}\n`);
}

function writePublicMarkdown(rows) {
  const previewRows = rows.slice(0, previewLimit);
  const issuedDates = rows.map((row) => String(row.issued_date || '').slice(0, 10)).filter(Boolean).sort();
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const markdown = `# NYC Weekly Construction Activity Preview

Generated: ${fetchDate}
Date range: ${issuedDates[0]} to ${issuedDates.at(-1)}
Source: NYC DOB NOW: Build - Approved Permits
Rows in free public preview: ${previewRows.length}
Rows in paid ZIP: ${rows.length}

This is a public-record permit signal preview, not a lead list. It excludes owner names, applicant names, phone numbers, email addresses, and full street addresses.

Buy the current issue ZIP: ${baseUrl}/buy.html?source=sample-md
Pricing: ${baseUrl}/pricing.html
Support and refunds: ${baseUrl}/support.html
Current launch price: $9.50. The paid ZIP includes ${rows.length} rows, buyer workbook, priority-slices CSV, source registry, QA report, buyer README, and version file.

## Included Work Types

${countBy(rows, (row) => row.work_type).map(([name]) => `- ${name}`).join('\n')}

## Top Counts By Work Type In Paid Issue

${formatCounts(rows, (row) => row.work_type)}

## Top Counts By ZIP In Paid Issue

${formatCounts(rows, (row) => row.zip_code)}

## Counts By Borough In Paid Issue

${formatCounts(rows, (row) => row.borough)}

## Example Rows From Free Preview

${markdownTable(previewRows)}

## Source Caveat

Public DOB NOW approved-permit records can be incomplete, delayed, revised, duplicated, or mislabeled. Not affiliated with or endorsed by NYC or DOB.

Use source links and your own professional judgment before making decisions.
`;
  fs.writeFileSync(publicMarkdownPath, markdown);
}

function cleanPublicCopy() {
  const replacements = [
    [/142-row public CSV preview/g, '142-row paid issue'],
    [/142-row public preview/g, '142-row paid issue'],
    [/142 public preview rows/g, '142 paid-issue rows'],
    [/Public preview rows: 142/g, 'Free preview rows: 25. Paid ZIP rows: 142'],
    [/public CSV preview includes 142 rows/gi, 'paid ZIP includes 142 rows'],
    [/public preview includes 142/gi, 'paid issue includes 142'],
    [/current public preview includes 142/gi, 'current paid issue includes 142'],
    [/generated from the current public CSV preview/gi, 'generated from the current paid issue'],
    [/generated from the 142-row public CSV preview/gi, 'generated from the current 142-row paid issue'],
  ];
  const files = [
    path.join(root, 'index.html'),
    path.join(root, 'sample-segments.html'),
    path.join(root, 'methodology.html'),
    path.join(root, 'llms.txt'),
    path.join(root, 'feed.xml'),
    ...fs.readdirSync(path.join(root, 'topics')).filter((file) => file.endsWith('.html')).map((file) => path.join(root, 'topics', file)),
  ];
  for (const file of files) {
    let text = fs.readFileSync(file, 'utf8');
    for (const [pattern, replacement] of replacements) {
      text = text.replace(pattern, replacement);
    }
    fs.writeFileSync(file, text);
  }
}

if (!fs.existsSync(fullCsvPath)) {
  throw new Error(`Missing full paid issue CSV: ${fullCsvPath}`);
}

const raw = fs.readFileSync(fullCsvPath, 'utf8').trim();
const lines = raw.split(/\r?\n/);
const headers = parseCsvLine(lines[0]);
const rows = parseCsv(raw);

writePublicCsv(headers, rows);
writePublicJson(headers, rows);
writePublicMarkdown(rows);
cleanPublicCopy();

console.log(`generated ${previewLimit}-row public preview from ${rows.length}-row paid issue`);
