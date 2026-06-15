const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const checkoutUrl = 'https://buy.stripe.com/dRmdR9aHv3vk6az8rlcAo0N';
const fullIssueCsvPath = path.join(root, '..', 'package', 'nyc-construction-activity-preview.csv');
const publicPreviewCsvPath = path.join(root, 'sample', 'nyc-construction-activity-preview.csv');
const sampleCsvPath = fs.existsSync(fullIssueCsvPath)
  ? fullIssueCsvPath
  : publicPreviewCsvPath;
const manifestPath = path.join(root, 'scripts', 'generated-pages-manifest.json');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

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

function countBy(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || String(left[0]).localeCompare(String(right[0])));
}

function issueStats(rows) {
  const issuedDates = rows.map((row) => String(row.issued_date || '').slice(0, 10)).filter(Boolean).sort();
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  return {
    sourceFetchDate: fetchDate,
    firstIssuedDate: issuedDates[0] || '',
    latestIssuedDate: issuedDates[issuedDates.length - 1] || '',
    rowCount: rows.length,
    workTypes: countBy(rows, (row) => row.work_type).map(([name, count]) => ({ name, count })),
    zipCodes: countBy(rows, (row) => row.zip_code).map(([zipCode, count]) => ({ zipCode, count })),
    boroughs: countBy(rows, (row) => row.borough).map(([name, count]) => ({ name, count })),
    costBuckets: countBy(rows, (row) => row.estimated_job_cost_bucket).map(([name, count]) => ({ name, count })),
  };
}

function publicPreviewRowCount() {
  if (!fs.existsSync(publicPreviewCsvPath)) return null;
  const text = fs.readFileSync(publicPreviewCsvPath, 'utf8').trim();
  if (!text) return 0;
  return Math.max(0, text.split(/\r?\n/).length - 1);
}

function buildCurrentIssueJson(rows, manifest) {
  const stats = issueStats(rows);
  const previewRows = publicPreviewRowCount() ?? stats.rowCount;
  return {
    product: 'NYC Weekly Construction Activity Brief',
    issue: 'current',
    source: {
      name: 'NYC DOB NOW: Build - Approved Permits',
      datasetId: 'rbx6-tga4',
      url: 'https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4',
      fetchDate: stats.sourceFetchDate,
      firstIssuedDate: stats.firstIssuedDate,
      latestIssuedDate: stats.latestIssuedDate,
    },
    publicPreview: {
      rowCount: previewRows,
      fullIssueRowCount: stats.rowCount,
      csvUrl: `${baseUrl}/sample/nyc-construction-activity-preview.csv`,
      sampleBriefUrl: `${baseUrl}/sample/nyc-weekly-construction-activity-sample.md`,
      methodologyUrl: `${baseUrl}/methodology.html`,
      segmentHubUrl: `${baseUrl}/sample-segments.html`,
      checkoutUrl,
      priceUsd: 49,
    },
    paidZip: {
      checkoutUrl,
      priceUsd: 49,
      rowCount: stats.rowCount,
      files: [
        'README.md',
        'nyc-construction-activity-preview.csv',
        'nyc-construction-activity-preview.md',
        'nyc-weekly-construction-activity-sample.md',
        'buyer-workbook.md',
        'buyer-priority-slices.csv',
        'buyer-readme.md',
        'source-registry.md',
        'privacy-and-claims-boundary.md',
        'qa-report.json',
        'version.txt',
      ],
    },
    counts: {
      workTypes: stats.workTypes,
      zipCodes: stats.zipCodes,
      boroughs: stats.boroughs,
      costBuckets: stats.costBuckets,
    },
    generatedPages: {
      totalTopicPages: manifest.totalTopicPages,
      urls: manifest.slugs.map((slug) => `${baseUrl}/topics/${slug}.html`),
    },
    boundary: {
      includesPrivateContactData: false,
      includesOwnerNames: false,
      includesApplicantNames: false,
      includesFullStreetAddresses: false,
      sendsEmailFulfillment: false,
      agencyEndorsed: false,
      leadGuarantee: false,
    },
  };
}

function buildFeedXml(rows, manifest) {
  const stats = issueStats(rows);
  const previewRows = publicPreviewRowCount() ?? stats.rowCount;
  const pubDate = new Date(`${stats.sourceFetchDate || new Date().toISOString().slice(0, 10)}T12:00:00Z`).toUTCString();
  const topWorkTypes = stats.workTypes.slice(0, 5).map((item) => `${item.name} ${item.count}`).join(' | ');
  const items = [
    {
      title: `Current NYC construction activity brief: ${stats.rowCount} paid issue rows`,
      url: `${baseUrl}/`,
      description: `Current paid issue has ${stats.rowCount} source-linked rows. The free CSV preview has ${previewRows} rows. Issued dates run ${stats.firstIssuedDate} through ${stats.latestIssuedDate}. Top work types: ${topWorkTypes}.`,
    },
    {
      title: 'Browse current permit activity segments',
      url: `${baseUrl}/sample-segments.html`,
      description: `ZIP, borough, work type, issued-date, cost-bucket, and buyer research pages generated from the current ${stats.rowCount}-row paid issue.`,
    },
    {
      title: 'Methodology and source boundary',
      url: `${baseUrl}/methodology.html`,
      description: 'Source, privacy boundary, excluded fields, buyer ZIP contents, and claims limits for the current issue.',
    },
    ...manifest.slugs.slice(0, 12).map((slug) => ({
      title: slug.replace(/-/g, ' '),
      url: `${baseUrl}/topics/${slug}.html`,
      description: 'Current source-linked NYC construction permit activity page from the public preview.',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>NYC Weekly Construction Activity Brief</title>
    <link>${baseUrl}/</link>
    <description>Current source-linked NYC construction permit activity pages, sample CSV, and paid ZIP checkout.</description>
    <lastBuildDate>${pubDate}</lastBuildDate>
${items.map((item) => `    <item>
      <title>${escapeHtml(item.title)}</title>
      <link>${escapeHtml(item.url)}</link>
      <guid>${escapeHtml(item.url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeHtml(item.description)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`;
}

function buildLlmsTxt(rows, manifest) {
  const stats = issueStats(rows);
  return `# NYC Weekly Construction Activity Brief

Source-linked weekly NYC DOB NOW construction permit activity brief.

Current issue:
- Paid issue rows: ${stats.rowCount}
- Paid ZIP rows: ${stats.rowCount}
- Free CSV preview rows: ${publicPreviewRowCount() ?? stats.rowCount}
- Source fetch date: ${stats.sourceFetchDate}
- Issued dates in preview: ${stats.firstIssuedDate} to ${stats.latestIssuedDate}
- Checkout: ${checkoutUrl}
- Price: $49 one-time ZIP download
- Buyer-only files: buyer-workbook.md, buyer-priority-slices.csv

Primary pages:
- Home: ${baseUrl}/
- Current issue JSON: ${baseUrl}/current-issue.json
- RSS feed: ${baseUrl}/feed.xml
- Sample CSV: ${baseUrl}/sample/nyc-construction-activity-preview.csv
- Sample brief: ${baseUrl}/sample/nyc-weekly-construction-activity-sample.md
- Segment hub: ${baseUrl}/sample-segments.html
- Methodology: ${baseUrl}/methodology.html

Current counts:
${stats.workTypes.map((item) => `- ${item.name}: ${item.count}`).join('\n')}

Boundaries:
- No owner names, applicant names, phone numbers, emails, full street addresses, or enriched contact data.
- No guaranteed leads.
- Not affiliated with or endorsed by NYC, DOB, or any agency.
- Source records can be incomplete, delayed, revised, duplicated, or mislabeled.

Generated topic page count: ${manifest.totalTopicPages}
`;
}

function insertHeadLinks(html) {
  const links = `    <link rel="alternate" type="application/rss+xml" title="NYC Weekly Construction Activity Brief RSS" href="${baseUrl}/feed.xml">
    <link rel="alternate" type="application/json" title="NYC Weekly Construction Activity Brief current issue" href="${baseUrl}/current-issue.json">`;
  if (html.includes('href="https://nyc-construction-activity-brief.vercel.app/feed.xml"')) return html;
  return html.replace(/(    <link rel="canonical" href="[^"]+">\n)/, `$1${links}\n`);
}

function updateHtmlAlternates() {
  const files = [
    path.join(root, 'index.html'),
    path.join(root, 'sample-segments.html'),
    path.join(root, 'methodology.html'),
    ...fs.readdirSync(path.join(root, 'topics'))
      .filter((file) => file.endsWith('.html'))
      .map((file) => path.join(root, 'topics', file)),
  ];
  for (const file of files) {
    fs.writeFileSync(file, insertHeadLinks(fs.readFileSync(file, 'utf8')));
  }
}

function updateRobots() {
  const robotsPath = path.join(root, 'robots.txt');
  const text = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
Feed: ${baseUrl}/feed.xml
Current-Issue: ${baseUrl}/current-issue.json
`;
  fs.writeFileSync(robotsPath, text);
}

function updateSitemap(lastmod) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const extraUrls = ['feed.xml', 'current-issue.json', 'llms.txt'];
  const insert = extraUrls
    .filter((url) => !sitemap.includes(`<loc>${baseUrl}/${url}</loc>`))
    .map((url) => `  <url>
    <loc>${baseUrl}/${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`)
    .join('\n');
  if (insert) {
    sitemap = sitemap.replace('</urlset>', `${insert}\n</urlset>`);
    fs.writeFileSync(sitemapPath, sitemap);
  }
}

const rows = parseCsv(fs.readFileSync(sampleCsvPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const stats = issueStats(rows);

fs.writeFileSync(path.join(root, 'current-issue.json'), `${JSON.stringify(buildCurrentIssueJson(rows, manifest), null, 2)}\n`);
fs.writeFileSync(path.join(root, 'feed.xml'), buildFeedXml(rows, manifest));
fs.writeFileSync(path.join(root, 'llms.txt'), buildLlmsTxt(rows, manifest));
updateHtmlAlternates();
updateRobots();
updateSitemap(stats.sourceFetchDate || new Date().toISOString().slice(0, 10));

console.log(`generated discovery feeds for ${rows.length} rows and ${manifest.totalTopicPages} topic pages`);
