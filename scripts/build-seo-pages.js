const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const checkoutUrl = 'https://buy.stripe.com/dRmdR9aHv3vk6az8rlcAo0N';
const sampleCsvPath = path.join(root, 'sample', 'nyc-construction-activity-preview.csv');
const manualPages = require('./seo-pages.json').map((page) => ({ ...page, group: 'core' }));

const workTypeCopy = {
  'Construction Fence': {
    slug: 'construction-fence',
    label: 'Construction Fence',
    lowerLabel: 'construction fence',
    buyer: 'construction fence and temporary site-service vendors',
  },
  'Mechanical Systems': {
    slug: 'mechanical-systems',
    label: 'Mechanical Systems',
    lowerLabel: 'mechanical systems',
    buyer: 'mechanical contractors, HVAC suppliers, and building-systems vendors',
  },
  Plumbing: {
    slug: 'plumbing',
    label: 'Plumbing',
    lowerLabel: 'plumbing',
    buyer: 'plumbing contractors, supply houses, and service firms',
  },
  'Sidewalk Shed': {
    slug: 'sidewalk-shed',
    label: 'Sidewalk Shed',
    lowerLabel: 'sidewalk shed',
    buyer: 'sidewalk shed vendors, scaffold firms, and exterior-work suppliers',
  },
  Sprinklers: {
    slug: 'sprinkler',
    label: 'Sprinkler',
    lowerLabel: 'sprinkler',
    buyer: 'sprinkler contractors, fire-protection suppliers, and service firms',
  },
  Structural: {
    slug: 'structural',
    label: 'Structural',
    lowerLabel: 'structural',
    buyer: 'structural contractors, construction suppliers, and inspection-adjacent vendors',
  },
  'Supported Scaffold': {
    slug: 'supported-scaffold',
    label: 'Supported Scaffold',
    lowerLabel: 'supported scaffold',
    buyer: 'supported scaffold contractors, site-access vendors, and suppliers',
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function jsonScript(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function analyticsSnippet() {
  return `<script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>`;
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sentenceCase(value) {
  const text = String(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(value) {
  return String(value).slice(0, 10);
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
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function describeCounts(rows, keyFn, limit = 4) {
  return [...countBy(rows, keyFn).entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([name, count]) => `${name} ${count}`)
    .join(' | ');
}

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const dateCompare = String(b.issued_date).localeCompare(String(a.issued_date));
    if (dateCompare) return dateCompare;
    return String(a.work_type).localeCompare(String(b.work_type));
  });
}

function sampleRows(rows) {
  return sortRows(rows)
    .slice(0, 5)
    .map((row) => ({
      workType: row.work_type,
      borough: titleCase(row.borough),
      zipCode: row.zip_code,
      issuedDate: row.issued_date.slice(0, 10),
      status: row.permit_status,
      costBucket: costBucketLabel(row.estimated_job_cost_bucket),
      sourceUrl: row.source_url,
    }));
}

function productJsonLd(description, url = checkoutUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'NYC Weekly Construction Activity Brief - First Issue',
    description,
    category: 'Digital construction permit activity brief',
    brand: {
      '@type': 'Brand',
      name: 'NYC Weekly Construction Activity Brief',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: '49.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

function breadcrumbJsonLd(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'NYC Construction Activity Brief',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.h1.replace(/\.$/, ''),
        item: `${baseUrl}/topics/${page.slug}.html`,
      },
    ],
  };
}

function faqJsonLd(page) {
  if (!page.faqs || !page.faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

function sampleStats(page) {
  if (!page.stats || !page.stats.length) return '';
  return `      <section class="section card">
        <h2>Sample counts</h2>
        <ul>
${page.stats.map((item) => `          <li>${escapeHtml(item)}</li>`).join('\n')}
        </ul>
      </section>

`;
}

function faqSection(page) {
  if (!page.faqs || !page.faqs.length) return '';
  return `      <section class="section card">
        <h2>Common questions</h2>
${page.faqs.map((faq) => `        <h3>${escapeHtml(faq.question)}</h3>
        <p>${escapeHtml(faq.answer)}</p>`).join('\n')}
      </section>

`;
}

function sampleTable(page) {
  if (!page.rows || !page.rows.length) return '';
  return `      <section class="section card">
        <h2>Example rows from the public preview</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Work type</th>
                <th>Territory</th>
                <th>Issued</th>
                <th>Status</th>
                <th>Cost bucket</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
${page.rows.map((row) => `              <tr>
                <td>${escapeHtml(row.workType)}</td>
                <td>${escapeHtml(`${row.borough} ${row.zipCode}`)}</td>
                <td>${escapeHtml(row.issuedDate)}</td>
                <td>${escapeHtml(row.status)}</td>
                <td>${escapeHtml(row.costBucket)}</td>
                <td><a href="${escapeHtml(row.sourceUrl)}">DOB NOW row</a></td>
              </tr>`).join('\n')}
            </tbody>
          </table>
        </div>
      </section>

`;
}

function pageHtml(page) {
  const url = `${baseUrl}/topics/${page.slug}.html`;
  const escapedTitle = escapeHtml(page.title);
  const escapedDescription = escapeHtml(page.description);
  const product = productJsonLd(page.description);
  const breadcrumb = breadcrumbJsonLd(page);
  const faq = faqJsonLd(page);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapedTitle}">
    <meta property="og:description" content="${escapedDescription}">
    <meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary">
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(breadcrumb)}</script>
${faq ? `    <script type="application/ld+json">${jsonScript(faq)}</script>\n` : ''}
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lede">${escapeHtml(page.lede)}</p>

      <section class="grid">
        <div class="card">
          <h2>Who it helps</h2>
          <p>${escapeHtml(page.audience)}</p>
        </div>
        <div class="card">
          <h2>What you get</h2>
          <p>Work type, ZIP, borough, issued date, status, cost bucket, source link, permit ID, filing number, and short description.</p>
        </div>
        <div class="card">
          <h2>Current sample</h2>
          <p>${escapeHtml(page.currentSample)}</p>
        </div>
      </section>

      <section class="section card">
        <h2>Use case</h2>
        <p>${escapeHtml(page.useCase)}</p>
        <div class="sample">${escapeHtml(page.sampleLine)}</div>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download public CSV preview</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Read sample brief</a>
        <a class="button" href="${checkoutUrl}">Buy first issue package</a>
      </section>

${sampleStats(page)}${sampleTable(page)}${faqSection(page)}      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, or full street addresses are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
  </body>
</html>
`;
}

function hubHtml(pages) {
  const description = 'Browse data-backed NYC construction permit activity pages generated from the current public CSV preview by ZIP, borough, work type, date, and cost bucket.';
  const product = productJsonLd(description, `${baseUrl}/sample-segments.html`);
  const section = (heading, rows) => rows.length ? `      <section class="section card">
        <h2>${escapeHtml(heading)}</h2>
        <ul>
${rows.map((page) => `          <li><a href="/topics/${escapeHtml(page.slug)}.html">${escapeHtml(page.linkText)}</a> <span class="fine">(${escapeHtml(page.count)} rows)</span></li>`).join('\n')}
        </ul>
      </section>` : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC Permit Activity Segments | ZIP and Work Type Pages</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/sample-segments.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Permit Activity Segments">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/sample-segments.html">
    <meta name="twitter:card" content="summary">
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>NYC permit activity segments from the current public preview.</h1>
      <p class="lede">These pages are generated from the 192-row public CSV preview. Each page keeps counts, source links, buyer use cases, and claims boundaries visible.</p>

${section('ZIP pages', pages.filter((page) => page.group === 'zip'))}
${section('Borough and work type pages', pages.filter((page) => page.group === 'borough-work-type'))}
${section('ZIP and work type pages', pages.filter((page) => page.group === 'zip-work-type'))}
${section('Work type sample pages', pages.filter((page) => page.group === 'work-type'))}
${section('Buyer research pages', pages.filter((page) => page.group === 'buyer'))}
${section('Cost bucket pages', pages.filter((page) => page.group === 'cost-bucket'))}
${section('Issued date pages', pages.filter((page) => page.group === 'issued-date'))}
    </main>
  </body>
</html>
`;
}

function sitemapXml(pages) {
  const urls = ['', 'sample-segments.html', ...pages.map((page) => `topics/${page.slug}.html`)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${baseUrl}/${url}</loc>
  </url>`).join('\n')}
</urlset>
`;
}

function manualPageLinks(pages) {
  return pages
    .map((page) => `          <li><a href="/topics/${escapeHtml(page.slug)}.html">${escapeHtml(page.h1.replace(/\.$/, ''))}</a></li>`)
    .join('\n');
}

function generatedPageLinks(pages) {
  return pages
    .map((page) => `            <li><a href="/topics/${escapeHtml(page.slug)}.html">${escapeHtml(page.linkText)}</a></li>`)
    .join('\n');
}

function updateIndex(manualPagesForLinks, generatedPagesForLinks) {
  const indexPath = path.join(root, 'index.html');
  let index = fs.readFileSync(indexPath, 'utf8');
  const replacement = `      <section class="section card">
        <h2>Permit topics</h2>
        <p class="fine">These pages explain the current sample by buyer search intent and link back to the same source-linked files.</p>
        <ul>
${manualPageLinks(manualPagesForLinks)}
        </ul>
        <p><a class="button secondary" href="/sample-segments.html">Browse segment and buyer-intent pages</a></p>
        <details>
          <summary>Generated data-backed pages</summary>
          <ul>
${generatedPageLinks(generatedPagesForLinks)}
          </ul>
        </details>
      </section>`;
  index = index.replace(
    /      <section class="section card">\n        <h2>Permit topics<\/h2>[\s\S]*?\n      <\/section>\n\n      <section class="section card">\n        <h2>What is not included<\/h2>/,
    `${replacement}\n\n      <section class="section card">\n        <h2>What is not included</h2>`,
  );
  fs.writeFileSync(indexPath, index);
}

function buildGeneratedPages(rows) {
  const pages = [];
  const dates = rows.map((row) => formatDate(row.issued_date)).filter(Boolean).sort();
  const range = `${dates[0]} to ${dates[dates.length - 1]}`;
  for (const [zipCode, count] of [...countBy(rows, (row) => row.zip_code).entries()].filter(([zip]) => zip).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    const matchingRows = rows.filter((row) => row.zip_code === zipCode);
    const boroughs = [...new Set(matchingRows.map((row) => titleCase(row.borough)))].join(' and ');
    pages.push({
      group: 'zip',
      slug: `nyc-dob-permits-zip-${zipCode}`,
      title: `NYC DOB Permits in ${zipCode} | Weekly Activity Brief`,
      description: `Review ${count} selected NYC DOB permit rows in ZIP ${zipCode} with work type, borough, issued date, status, source links, and cost buckets.`,
      h1: `NYC DOB permit activity in ZIP ${zipCode}.`,
      lede: `The current public preview includes ${count} selected DOB NOW permit rows for ${boroughs} ZIP ${zipCode}.`,
      audience: `Construction-support vendors and subcontractors watching permit activity in ${zipCode}.`,
      currentSample: `ZIP ${zipCode} has ${count} rows in the 2026-06-01 to 2026-06-08 public preview.`,
      useCase: `Use this page to check the ZIP ${zipCode} activity mix before buying the first issue package or reviewing source records manually.`,
      sampleLine: `ZIP ${zipCode} | top work types: ${describeCounts(matchingRows, (row) => row.work_type)}`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} public preview rows in ZIP ${zipCode}.`,
        `Top work types: ${describeCounts(matchingRows, (row) => row.work_type)}.`,
        `Cost buckets: ${describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket))}.`,
      ],
      faqs: [
        {
          question: `Does this include private contact data for ZIP ${zipCode}?`,
          answer: 'No. The package uses public permit fields and source links only. It does not include owner names, emails, phone numbers, or full street addresses.',
        },
        {
          question: 'What should I verify before using a row?',
          answer: 'Open the DOB NOW source link and check the current record state before making business decisions from any row.',
        },
      ],
      count,
      linkText: `ZIP ${zipCode} permit activity`,
    });
  }

  for (const [key, count] of [...countBy(rows, (row) => `${row.borough}|${row.work_type}`).entries()].filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    const [borough, workType] = key.split('|');
    const matchingRows = rows.filter((row) => row.borough === borough && row.work_type === workType);
    const boroughName = titleCase(borough);
    const work = workTypeCopy[workType] || {
      slug: slugify(workType),
      label: workType,
      lowerLabel: workType.toLowerCase(),
      buyer: 'construction vendors',
    };
    pages.push({
      group: 'borough-work-type',
      slug: `${slugify(boroughName)}-${work.slug}-permit-activity`,
      title: `${boroughName} ${work.label} Permits | Weekly NYC DOB Brief`,
      description: `Review ${count} selected ${boroughName} ${work.lowerLabel} permit rows with ZIP, issued date, status, source links, and cost buckets.`,
      h1: `${boroughName} ${work.lowerLabel} permit activity.`,
      lede: `The current public preview includes ${count} selected ${work.lowerLabel} rows in ${boroughName}.`,
      audience: `${sentenceCase(work.buyer)} watching ${boroughName} public permit activity.`,
      currentSample: `${boroughName} ${work.lowerLabel} has ${count} rows in the 2026-06-01 to 2026-06-08 public preview.`,
      useCase: `Use this page to review the ${boroughName} ${work.lowerLabel} sample before deciding whether the first issue package is worth buying.`,
      sampleLine: `${boroughName} | ${work.label} | ZIP | issued date | status | DOB NOW source link`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} public preview rows for ${work.lowerLabel} in ${boroughName}.`,
        `ZIP mix: ${describeCounts(matchingRows, (row) => row.zip_code)}.`,
        `Cost buckets: ${describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket))}.`,
      ],
      faqs: [
        {
          question: `Is this a ${work.lowerLabel} lead list?`,
          answer: 'No. It is a public-record screening file. It can help narrow manual research, but it does not provide private contacts or promise sales opportunities.',
        },
        {
          question: 'Why use the brief instead of searching DOB NOW manually?',
          answer: 'The brief packages selected rows into a spreadsheet-friendly file with source links still visible, which can reduce repeated weekly sorting work.',
        },
      ],
      count,
      linkText: `${boroughName} ${work.lowerLabel} permit activity`,
    });
  }

  for (const [key, count] of [...countBy(rows, (row) => `${row.zip_code}|${row.work_type}`).entries()].filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    const [zipCode, workType] = key.split('|');
    const matchingRows = rows.filter((row) => row.zip_code === zipCode && row.work_type === workType);
    const boroughName = titleCase(matchingRows[0].borough);
    const work = workTypeCopy[workType] || {
      slug: slugify(workType),
      label: workType,
      lowerLabel: workType.toLowerCase(),
      buyer: 'construction vendors',
    };
    pages.push({
      group: 'zip-work-type',
      slug: `${work.slug}-permits-zip-${zipCode}`,
      title: `${work.label} Permits in ${zipCode} | NYC DOB Activity`,
      description: `Review ${count} selected ${work.lowerLabel} permit rows in NYC ZIP ${zipCode} with issued date, status, source links, and cost buckets.`,
      h1: `${work.label} permit activity in ZIP ${zipCode}.`,
      lede: `The current public preview includes ${count} selected ${work.lowerLabel} rows for ${boroughName} ZIP ${zipCode}.`,
      audience: `${sentenceCase(work.buyer)} watching ZIP ${zipCode}.`,
      currentSample: `${work.label} in ZIP ${zipCode} has ${count} rows in the 2026-06-01 to 2026-06-08 public preview.`,
      useCase: `Use this page to scan ${work.lowerLabel} activity in ZIP ${zipCode} before opening the DOB NOW source records one by one.`,
      sampleLine: `${work.label} | ${zipCode} | ${boroughName} | issued date | status | source link`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} public preview rows for ${work.lowerLabel} in ZIP ${zipCode}.`,
        `Borough: ${boroughName}.`,
        `Cost buckets: ${describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket))}.`,
      ],
      faqs: [
        {
          question: `Can I use this to monitor ${work.lowerLabel} activity in ${zipCode}?`,
          answer: 'Yes, for screening selected public permit activity. Source records should still be checked directly before outreach, quoting, or planning.',
        },
        {
          question: 'How current is the sample?',
          answer: `The current public preview covers selected issued dates from ${range}.`,
        },
      ],
      count,
      linkText: `${work.label} permits in ${zipCode}`,
    });
  }

  for (const [workType, count] of [...countBy(rows, (row) => row.work_type).entries()].filter(([type]) => type).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    const matchingRows = rows.filter((row) => row.work_type === workType);
    const work = workTypeCopy[workType] || {
      slug: slugify(workType),
      label: workType,
      lowerLabel: workType.toLowerCase(),
      buyer: 'construction vendors',
    };
    pages.push({
      group: 'work-type',
      slug: `nyc-${work.slug}-permit-csv-sample`,
      title: `NYC ${work.label} Permit CSV Sample | DOB Activity`,
      description: `Review ${count} selected NYC ${work.lowerLabel} permit rows from the public CSV preview with ZIP, borough, issued date, status, and source links.`,
      h1: `NYC ${work.lowerLabel} permit CSV sample.`,
      lede: `The current public preview includes ${count} selected ${work.lowerLabel} rows from ${range}.`,
      audience: `${sentenceCase(work.buyer)} comparing public permit activity across selected NYC ZIP codes.`,
      currentSample: `${work.label} has ${count} rows in the current 192-row public preview.`,
      useCase: `Use this page to inspect the ${work.lowerLabel} sample before downloading the public CSV or buying the first issue package.`,
      sampleLine: `${work.label} | top ZIPs: ${describeCounts(matchingRows, (row) => row.zip_code)}`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} public preview rows for ${work.lowerLabel}.`,
        `ZIP mix: ${describeCounts(matchingRows, (row) => row.zip_code)}.`,
        `Issued dates: ${describeCounts(matchingRows, (row) => formatDate(row.issued_date))}.`,
      ],
      faqs: [
        {
          question: `What fields are included for ${work.lowerLabel} rows?`,
          answer: 'The preview includes work type, ZIP, borough, issued date, status, cost bucket, permit ID, filing number, short description, and source link.',
        },
        {
          question: 'Does the paid package include more private details?',
          answer: 'No. The paid package keeps the same public-record boundary. It packages selected source-linked activity for faster review.',
        },
      ],
      count,
      linkText: `NYC ${work.label} permit CSV sample`,
    });

    pages.push({
      group: 'buyer',
      slug: `${work.slug}-contractor-permit-research-nyc`,
      title: `NYC ${work.label} Contractor Permit Research`,
      description: `A source-linked NYC permit activity brief for reviewing selected ${work.lowerLabel} rows by ZIP, borough, issued date, status, and cost bucket.`,
      h1: `NYC ${work.lowerLabel} permit research for contractors and vendors.`,
      lede: `This page shows how the current ${work.lowerLabel} sample can support weekly research for ${work.buyer}.`,
      audience: `${sentenceCase(work.buyer)} that want a spreadsheet-friendly screen before opening individual DOB NOW records.`,
      currentSample: `${count} selected ${work.lowerLabel} rows appear in the ${range} public preview.`,
      useCase: `Use the brief to reduce repeated sorting work when checking selected public permit activity. It does not replace manual source verification or provide private contacts.`,
      sampleLine: `${work.label} research fields | ZIP | borough | issued date | status | cost bucket | source link`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} selected ${work.lowerLabel} rows in the current preview.`,
        `Top territories: ${describeCounts(matchingRows, (row) => `${titleCase(row.borough)} ${row.zip_code}`)}.`,
        `Cost buckets: ${describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket))}.`,
      ],
      faqs: [
        {
          question: 'Can this be imported into a CRM?',
          answer: 'The CSV can be opened in spreadsheet tools. It is not packaged as a CRM integration and it does not include private contact records.',
        },
        {
          question: 'Does this predict buying intent?',
          answer: 'No. It shows selected public permit activity and source links. Any sales or research judgment stays manual.',
        },
      ],
      count,
      linkText: `${work.label} contractor permit research`,
    });
  }

  for (const [bucket, count] of [...countBy(rows, (row) => row.estimated_job_cost_bucket).entries()].filter(([item]) => item).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    const matchingRows = rows.filter((row) => row.estimated_job_cost_bucket === bucket);
    const label = costBucketLabel(bucket);
    pages.push({
      group: 'cost-bucket',
      slug: `nyc-construction-permits-${slugify(label)}`,
      title: `NYC Construction Permits ${label} | DOB Sample`,
      description: `Review ${count} selected NYC construction permit rows in the ${label} cost bucket with work type, ZIP, borough, issued date, and source links.`,
      h1: `NYC construction permit activity in the ${label} cost bucket.`,
      lede: `The current public preview includes ${count} selected permit rows marked in the ${label} estimated job cost bucket.`,
      audience: 'Construction-support vendors and subcontractors screening public permit activity by estimated job cost range.',
      currentSample: `${count} rows in the ${range} public preview use the ${label} cost bucket.`,
      useCase: `Use this page to see whether the selected sample includes enough ${label} activity to justify deeper source-record review.`,
      sampleLine: `${label} | top work types: ${describeCounts(matchingRows, (row) => row.work_type)}`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} public preview rows in the ${label} cost bucket.`,
        `Work type mix: ${describeCounts(matchingRows, (row) => row.work_type)}.`,
        `ZIP mix: ${describeCounts(matchingRows, (row) => row.zip_code)}.`,
      ],
      faqs: [
        {
          question: 'Are cost buckets exact project values?',
          answer: 'No. They are broad screening buckets from the source sample and should be checked against the current DOB NOW source record.',
        },
        {
          question: 'Why filter by cost bucket?',
          answer: 'Cost buckets can help a vendor decide which rows are worth manual review first, but they do not prove project value or buying intent.',
        },
      ],
      count,
      linkText: `NYC construction permits ${label}`,
    });
  }

  for (const [issuedDate, count] of [...countBy(rows, (row) => formatDate(row.issued_date)).entries()].filter(([date]) => date).sort((a, b) => b[0].localeCompare(a[0]))) {
    const matchingRows = rows.filter((row) => formatDate(row.issued_date) === issuedDate);
    pages.push({
      group: 'issued-date',
      slug: `nyc-dob-permits-issued-${issuedDate}`,
      title: `NYC DOB Permits Issued ${issuedDate} | Sample`,
      description: `Review ${count} selected NYC DOB permit rows issued on ${issuedDate} with work type, ZIP, borough, status, cost bucket, and source links.`,
      h1: `NYC DOB permit rows issued on ${issuedDate}.`,
      lede: `The current public preview includes ${count} selected DOB NOW permit rows issued on ${issuedDate}.`,
      audience: 'Construction-support vendors checking recent permit activity by issue date before opening individual source records.',
      currentSample: `${issuedDate} has ${count} selected rows in the current public preview.`,
      useCase: `Use this page to scan one issued-date slice of the sample before sorting the full CSV by work type or territory.`,
      sampleLine: `${issuedDate} | top work types: ${describeCounts(matchingRows, (row) => row.work_type)}`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} public preview rows issued on ${issuedDate}.`,
        `Work type mix: ${describeCounts(matchingRows, (row) => row.work_type)}.`,
        `Territory mix: ${describeCounts(matchingRows, (row) => `${titleCase(row.borough)} ${row.zip_code}`)}.`,
      ],
      faqs: [
        {
          question: 'Can issued-date pages become outdated?',
          answer: 'Yes. This page describes the current first issue sample only. Use the source link for the current public record state.',
        },
        {
          question: 'Why include issued-date pages?',
          answer: 'Some buyers screen by recency first, then narrow by ZIP or work type. These pages make that slice visible before purchase.',
        },
      ],
      count,
      linkText: `NYC DOB permits issued ${issuedDate}`,
    });
  }

  return pages;
}

fs.mkdirSync(path.join(root, 'topics'), { recursive: true });
const rows = parseCsv(fs.readFileSync(sampleCsvPath, 'utf8'));
const generatedPages = buildGeneratedPages(rows);
const pages = [...manualPages, ...generatedPages];
for (const page of pages) {
  fs.writeFileSync(path.join(root, 'topics', `${page.slug}.html`), pageHtml(page));
}
fs.writeFileSync(path.join(root, 'sample-segments.html'), hubHtml(generatedPages));
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemapXml(pages));
fs.writeFileSync(
  path.join(root, 'scripts', 'generated-pages-manifest.json'),
  `${JSON.stringify({
    sourceFetchDate: rows[0] && rows[0].source_fetch_date,
    source: 'sample/nyc-construction-activity-preview.csv',
    sourceRows: rows.length,
    manualPages: manualPages.length,
    generatedPages: generatedPages.length,
    totalTopicPages: pages.length,
    slugs: pages.map((page) => page.slug),
  }, null, 2)}\n`,
);
updateIndex(manualPages, generatedPages);

console.log(`generated ${pages.length} SEO pages from ${rows.length} source rows`);
