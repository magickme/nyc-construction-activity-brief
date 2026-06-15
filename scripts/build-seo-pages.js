const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const socialImageUrl = `${baseUrl}/assets/current-issue-snapshot.png`;
const stripeCheckoutUrl = 'https://buy.stripe.com/7sY7sLaHv9TI2Yn5f9cAo0P';
const checkoutUrl = `${baseUrl}/checkout.html`;
const fullIssueCsvPath = path.join(root, '..', 'package', 'nyc-construction-activity-preview.csv');
const publicPreviewCsvPath = path.join(root, 'sample', 'nyc-construction-activity-preview.csv');
const sampleCsvPath = fs.existsSync(fullIssueCsvPath)
  ? fullIssueCsvPath
  : publicPreviewCsvPath;
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

const buyerPersonas = [
  {
    slug: 'nyc-sidewalk-shed-vendor-permit-research',
    title: 'NYC Sidewalk Shed Vendor Permit Research',
    description:
      'Weekly NYC DOB permit activity page for sidewalk shed vendors screening selected shed, scaffold, and construction fence rows by ZIP and issued date.',
    h1: 'NYC permit research for sidewalk shed vendors.',
    lede:
      'A buyer-focused view of the current issue for vendors watching sidewalk shed, supported scaffold, and construction fence activity.',
    audience:
      'Sidewalk shed vendors, scaffold firms, site access suppliers, and exterior-work service providers checking selected public permit activity.',
    workTypes: ['Sidewalk Shed', 'Supported Scaffold', 'Construction Fence'],
    workTypeRequest: 'Sidewalk Shed, Supported Scaffold, Construction Fence',
    territoryRequest: 'NYC',
    sampleLineLabel: 'site access work',
  },
  {
    slug: 'nyc-plumbing-supplier-permit-research',
    title: 'NYC Plumbing Supplier Permit Research',
    description:
      'Weekly NYC DOB permit activity page for plumbing suppliers and service firms screening selected plumbing rows by ZIP, borough, and source link.',
    h1: 'NYC permit research for plumbing suppliers.',
    lede:
      'A buyer-focused view of the current issue for suppliers and service firms watching selected plumbing permit activity.',
    audience:
      'Plumbing suppliers, plumbing service firms, local distributors, and specialty subcontractors checking selected public permit rows.',
    workTypes: ['Plumbing'],
    workTypeRequest: 'Plumbing',
    territoryRequest: 'NYC',
    sampleLineLabel: 'plumbing work',
  },
  {
    slug: 'nyc-fire-protection-permit-research',
    title: 'NYC Fire Protection Permit Research',
    description:
      'Weekly NYC DOB permit activity page for fire-protection teams screening selected sprinkler rows by ZIP, borough, issued date, and cost bucket.',
    h1: 'NYC permit research for fire-protection teams.',
    lede:
      'A buyer-focused view of the current issue for teams watching selected sprinkler permit activity across the sample.',
    audience:
      'Sprinkler contractors, fire-protection suppliers, inspection-adjacent service providers, and local B2B sellers.',
    workTypes: ['Sprinklers'],
    workTypeRequest: 'Sprinklers',
    territoryRequest: 'NYC',
    sampleLineLabel: 'sprinkler work',
  },
  {
    slug: 'nyc-hvac-mechanical-permit-research',
    title: 'NYC HVAC Mechanical Permit Research',
    description:
      'Weekly NYC DOB permit activity page for HVAC and mechanical vendors screening selected mechanical systems rows by ZIP, borough, and status.',
    h1: 'NYC permit research for HVAC and mechanical vendors.',
    lede:
      'A buyer-focused view of the current issue for vendors watching selected mechanical systems permit activity.',
    audience:
      'Mechanical contractors, HVAC suppliers, building-systems vendors, and local service providers checking selected public rows.',
    workTypes: ['Mechanical Systems'],
    workTypeRequest: 'Mechanical Systems',
    territoryRequest: 'NYC',
    sampleLineLabel: 'mechanical systems work',
  },
  {
    slug: 'nyc-construction-supplier-permit-research',
    title: 'NYC Construction Supplier Permit Research',
    description:
      'Weekly NYC DOB permit activity page for construction suppliers screening selected permit rows by work type, ZIP, issued date, and source link.',
    h1: 'NYC permit research for construction suppliers.',
    lede:
      'A buyer-focused view of the current issue for suppliers that want a fast screen before checking DOB NOW source records.',
    audience:
      'Construction suppliers, local B2B service firms, specialty vendors, and subcontractors reviewing selected public permit activity.',
    workTypes: ['Construction Fence', 'Mechanical Systems', 'Plumbing', 'Sidewalk Shed', 'Sprinklers', 'Structural', 'Supported Scaffold'],
    workTypeRequest: 'Selected DOB work types',
    territoryRequest: 'NYC',
    sampleLineLabel: 'selected construction work',
  },
];

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

function checkoutHref(source = 'site') {
  return `${checkoutUrl}?source=${encodeURIComponent(source)}`;
}

function analyticsSnippet() {
  return `<script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>`;
}

function socialImageMeta() {
  return `    <meta property="og:image" content="${socialImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${socialImageUrl}">`;
}

function sampleRequestScript() {
  return `<script>
      document.addEventListener('submit', async (event) => {
        const form = event.target.closest('[data-sample-request-form]');
        if (!form) return;
        event.preventDefault();
        const status = form.querySelector('[data-sample-request-status]');
        const button = form.querySelector('button[type="submit"]');
        const data = Object.fromEntries(new FormData(form).entries());
        data.consent = form.querySelector('[name="consent"]').checked;
        if (status) status.textContent = 'Saving request...';
        if (button) button.disabled = true;
        try {
          const response = await fetch('/api/sample-request', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('request failed');
          form.reset();
          try {
            window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
            window.va('event', { name: 'sample_request_saved', data: { source: 'sample-request-form' } });
          } catch (error) {}
          if (status) {
            status.innerHTML = 'Request saved. I will use this to choose future sample cuts. If the current ZIP fits, <a href="/checkout.html?source=sample-request-success">buy the instant ZIP</a>.';
          }
        } catch (error) {
          if (status) status.textContent = 'Request was not saved. Try again, or buy the current ZIP if it already fits.';
        } finally {
          if (button) button.disabled = false;
        }
      });
    </script>`;
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

function previewRows(rows) {
  return sortRows(rows).map((row) => ({
    workType: row.work_type,
    borough: titleCase(row.borough),
    zipCode: row.zip_code,
    issuedDate: row.issued_date.slice(0, 10),
    status: row.permit_status,
    costBucket: costBucketLabel(row.estimated_job_cost_bucket),
    sourceUrl: row.source_url,
  }));
}

function sampleRange(rows) {
  const dates = rows.map((row) => formatDate(row.issued_date)).filter(Boolean).sort();
  return {
    firstIssuedDate: dates[0] || '',
    latestIssuedDate: dates[dates.length - 1] || '',
  };
}

function productJsonLd(description, url = checkoutUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'NYC Weekly Construction Activity Brief - Current Issue',
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
      price: '24.50',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

function checkoutHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Opening Stripe Checkout | NYC Construction Activity Brief</title>
    <meta name="robots" content="noindex">
    <link rel="canonical" href="${baseUrl}/checkout.html">
    <link rel="stylesheet" href="/styles.css">
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <section class="section card">
        <h1>Opening Stripe checkout.</h1>
        <p class="lede">You are being sent to Stripe for the current NYC Weekly Construction Activity Brief ZIP.</p>
        <p class="fine">If the redirect does not start, use the button below. The current launch price is $24.50. No promo code is required.</p>
        <a id="stripe-link" class="button" href="${stripeCheckoutUrl}">Continue to Stripe</a>
      </section>
    </main>
    <script>
      const params = new URLSearchParams(window.location.search);
      const rawSource = params.get('source') || 'site';
      const source = /^[a-z0-9._-]{1,80}$/i.test(rawSource) ? rawSource : 'site';
      const stripeUrl = '${stripeCheckoutUrl}';
      const link = document.getElementById('stripe-link');
      link.href = stripeUrl;
      try {
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
        window.va('event', { name: 'checkout_intent', data: { source } });
      } catch (error) {}
      window.setTimeout(() => {
        window.location.replace(stripeUrl);
      }, 220);
    </script>
  </body>
</html>
`;
}

function datasetJsonLd(rows) {
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypes = [...countBy(rows, (row) => row.work_type).keys()].filter(Boolean).sort();
  const territories = [...countBy(rows, (row) => row.zip_code).keys()].filter(Boolean).sort();
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'NYC Weekly Construction Activity Brief - Current Issue Public Preview',
    description:
      'Selected NYC DOB NOW approved permit rows packaged as a weekly public-record construction activity CSV preview and buyer brief.',
    url: `${baseUrl}/methodology.html`,
    isBasedOn: {
      '@type': 'Dataset',
      name: 'NYC DOB NOW: Build - Approved Permits',
      url: 'https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4',
    },
    creator: {
      '@type': 'Organization',
      name: 'NYC Weekly Construction Activity Brief',
      url: baseUrl,
    },
    spatialCoverage: {
      '@type': 'Place',
      name: 'New York City',
    },
    temporalCoverage: `${range.firstIssuedDate}/${range.latestIssuedDate}`,
    dateModified: fetchDate,
    keywords: [
      'NYC DOB permits',
      'construction permit activity',
      'building permit CSV',
      'permit alerts',
      ...workTypes,
      ...territories.map((zipCode) => `ZIP ${zipCode}`),
    ],
    variableMeasured: [
      'source_url',
      'source_fetch_date',
      'borough',
      'zip_code',
      'work_type',
      'issued_date',
      'permit_status',
      'estimated_job_cost_bucket',
      'permit_id',
      'work_permit',
      'job_filing_number',
      'job_description_short',
      'source_caveat',
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'Public CSV preview',
        encodingFormat: 'text/csv',
        contentUrl: `${baseUrl}/sample/nyc-construction-activity-preview.csv`,
      },
      {
        '@type': 'DataDownload',
        name: 'Public Markdown sample brief',
        encodingFormat: 'text/markdown',
        contentUrl: `${baseUrl}/sample/nyc-weekly-construction-activity-sample.md`,
      },
    ],
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

function sampleRequestSection(context = {}) {
  const workType = escapeHtml(context.workType || '');
  const territory = escapeHtml(context.territory || '');
  return `      <section id="sample-request" class="section card sample-request">
        <h2>Request a future sample cut</h2>
        <p>If this page is close but not the exact territory or work type you need, send one request. I will use these requests to choose future public previews.</p>
        <form data-sample-request-form>
          <label>
            Email
            <input name="email" type="email" autocomplete="email" required>
          </label>
          <label>
            Work type requested
            <input name="work_type_requested" value="${workType}" placeholder="Plumbing, sidewalk shed, structural..." required>
          </label>
          <label>
            ZIP codes or borough
            <input name="territory_requested" value="${territory}" placeholder="11201, Brooklyn, Manhattan..." required>
          </label>
          <label>
            Buyer type
            <select name="buyer_type" required>
              <option value="">Choose one</option>
              <option value="construction-support-vendor">Construction-support vendor</option>
              <option value="specialty-subcontractor">Specialty subcontractor</option>
              <option value="supplier">Supplier</option>
              <option value="local-b2b-service-provider">Local B2B service provider</option>
              <option value="data-buyer">Data buyer</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            What do you want to monitor?
            <textarea name="monitoring_goal" rows="3" placeholder="Example: sprinkler permits in Brooklyn each week" required></textarea>
          </label>
          <label class="checkbox">
            <input name="consent" type="checkbox" required>
            You may reply about this public-record sample request.
          </label>
          <input class="hp" name="website" tabindex="-1" autocomplete="off">
          <button class="button" type="submit">Send sample request</button>
          <p class="fine" data-sample-request-status>This does not join the MagickMe newsletter. No guaranteed leads, owner contact data, or agency-endorsed information.</p>
        </form>
      </section>

`;
}

function sampleTable(page) {
  if (!page.rows || !page.rows.length) return '';
  return `      <section class="section card">
        <h2>Example rows from the current issue sample</h2>
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
${socialImageMeta()}
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
          <h2>Paid ZIP</h2>
          <p>CSV, Markdown brief, source registry, buyer README, QA report, version file, and claims boundary in one instant download.</p>
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
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('topic')}">Buy instant ZIP</a>
      </section>

${sampleStats(page)}${sampleTable(page)}${sampleRequestSection({
    workType: page.workTypeRequest,
    territory: page.territoryRequest,
  })}${faqSection(page)}      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, or full street addresses are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function hubHtml(pages) {
  const description = 'Browse data-backed NYC construction permit activity pages generated from the current paid issue by ZIP, borough, work type, date, and cost bucket.';
  const product = productJsonLd(description, checkoutHref('segment-hub'));
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
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>NYC permit activity segments from the current issue.</h1>
      <p class="lede">These pages are generated from the 142-row paid issue. The free CSV preview is limited to 25 rows. Each page keeps counts, source links, buyer use cases, and claims boundaries visible.</p>

      <section class="section card">
        <h2>Get the current issue</h2>
        <p>The paid ZIP includes the CSV, Markdown brief, source registry, buyer README, QA report, version file, and claims boundary for the 2026-06-09 to 2026-06-15 issue. Current launch price is $24.50.</p>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download public CSV preview</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Read sample brief</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('segment-hub')}">Buy instant ZIP</a>
      </section>

${section('ZIP pages', pages.filter((page) => page.group === 'zip'))}
${section('Borough and work type pages', pages.filter((page) => page.group === 'borough-work-type'))}
${section('ZIP and work type pages', pages.filter((page) => page.group === 'zip-work-type'))}
${section('Work type sample pages', pages.filter((page) => page.group === 'work-type'))}
${section('Buyer persona pages', pages.filter((page) => page.group === 'buyer-persona'))}
${section('Buyer research pages', pages.filter((page) => page.group === 'buyer'))}
${section('Cost bucket pages', pages.filter((page) => page.group === 'cost-bucket'))}
${section('Issued date pages', pages.filter((page) => page.group === 'issued-date'))}
${sampleRequestSection()}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function methodologyHtml(rows) {
  const description = 'How the NYC Weekly Construction Activity Brief uses selected NYC DOB NOW public permit records, removes private-contact fields, and keeps source caveats visible.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const dataset = datasetJsonLd(rows);
  const workTypes = [...countBy(rows, (row) => row.work_type).entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([name, count]) => `          <li>${escapeHtml(name)}: ${count} rows</li>`)
    .join('\n');
  const territories = [...countBy(rows, (row) => `${titleCase(row.borough)} ${row.zip_code}`).entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([name, count]) => `          <li>${escapeHtml(name)}: ${count} rows</li>`)
    .join('\n');

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where does the permit data come from?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The current issue uses selected rows from NYC DOB NOW: Build - Approved Permits, published through NYC Open Data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the brief include owner contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The public package excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this a live alert service?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The first product is a weekly CSV and Markdown brief. It is not a live alert feed, full permit database, API, or CRM sync.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Methodology | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/methodology.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Construction Activity Brief Methodology">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/methodology.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(dataset)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Methodology and source boundary.</h1>
      <p class="lede">The current issue is a small source-linked screening file, not a complete permit database or a contact-enriched lead list.</p>

      <section class="grid">
        <div class="card">
          <h2>Source</h2>
          <p>NYC DOB NOW: Build - Approved Permits, published through NYC Open Data.</p>
        </div>
        <div class="card">
          <h2>Current issue</h2>
          <p>${escapeHtml(rows.length)} paid issue rows. Query window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}. Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</p>
        </div>
        <div class="card">
          <h2>Delivery</h2>
          <p>One ZIP after Stripe checkout: CSV, Markdown brief, source registry, buyer README, QA report, version file, and claims boundary.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Included fields</h2>
        <p>The public CSV includes source name, source URL, source fetch date, borough, ZIP, work type, issued date, permit status, cost bucket, permit ID, work permit, job filing number, short description, and source caveat.</p>
      </section>

      <section class="section card">
        <h2>Excluded fields</h2>
        <p>The public package excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data. A private QA file may exist locally during build checks, but it is not included in the buyer ZIP or public site.</p>
      </section>

      <section class="grid">
        <div class="card">
          <h2>Work type mix</h2>
          <ul>
${workTypes}
          </ul>
        </div>
        <div class="card">
          <h2>Territory mix</h2>
          <ul>
${territories}
          </ul>
        </div>
        <div class="card">
          <h2>What it is not</h2>
          <ul>
            <li>Not a live alert feed.</li>
            <li>Not a full DOB permit database.</li>
            <li>Not an API or CRM sync.</li>
            <li>Not a lead guarantee.</li>
          </ul>
        </div>
      </section>

      <section class="section card">
        <h2>Source caveat</h2>
        <p>No guaranteed leads. Source records can be incomplete, delayed, revised, duplicated, or mislabeled. This product is not affiliated with or endorsed by NYC, DOB, or any agency.</p>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download public CSV preview</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button" href="${checkoutHref('methodology')}">Buy instant ZIP</a>
      </section>
    </main>
  </body>
</html>
`;
}

function buyerGuideHtml(rows) {
  const description = 'A plain buying guide for the current NYC construction activity ZIP: who it fits, what files are included, what to check first, and what is excluded.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const product = productJsonLd(description);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who should buy the current ZIP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Buy it if you need a spreadsheet-friendly weekly screen of selected NYC DOB permit activity by work type, ZIP, issued date, status, and cost bucket.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who should use the free preview instead?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the free preview first if you only need to inspect the fields, sample rows, source boundary, or current work-type mix.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the paid ZIP include private contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The paid ZIP excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Buyer Guide | NYC Construction Activity ZIP</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/buyer-guide.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Buyer Guide | NYC Construction Activity ZIP">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/buyer-guide.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Buyer guide for the current NYC construction activity ZIP.</h1>
      <p class="lede">Use this page to decide whether the paid ZIP fits your weekly permit research before opening Stripe checkout.</p>

      <section class="grid">
        <div class="card">
          <h2>Buy it for</h2>
          <p>Weekly spreadsheet review by work type, borough, ZIP, issued date, permit status, source link, and cost bucket.</p>
        </div>
        <div class="card">
          <h2>Use the preview for</h2>
          <p>Checking fields, sample rows, territory mix, work-type mix, and source limits before paying.</p>
        </div>
        <div class="card">
          <h2>Skip it if</h2>
          <p>You need a live alert feed, owner contacts, a full DOB database, an API, CRM sync, or guaranteed sales leads.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>What the ZIP includes</h2>
        <ul>
          <li>Full ${escapeHtml(rows.length)}-row CSV for the current issue.</li>
          <li>Markdown brief and public sample notes.</li>
          <li>Buyer workbook for a fast review pass.</li>
          <li>Priority-slices CSV grouped by work type, borough, ZIP, row count, latest issued date, cost-bucket mix, status mix, and source URL.</li>
          <li>Source registry, QA report, version file, buyer README, and privacy/claims boundary.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Fast check before buying</h2>
        <ol>
          <li>Open the free CSV preview and confirm the fields are useful for your workflow.</li>
          <li>Check the segment hub for your ZIP, borough, work type, or cost bucket.</li>
          <li>Read the delivery steps and methodology page if source limits matter for your use case.</li>
          <li>Buy the ZIP only if the current issue saves enough sorting time to justify a one-time $49 purchase.</li>
        </ol>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="/methodology.html">Read methodology</a>
        <a class="button" href="${checkoutHref('buyer-guide')}">Buy instant ZIP</a>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
  </body>
</html>
`;
}

function deliveryHtml(rows) {
  const description = 'How instant download delivery works for the NYC Weekly Construction Activity Brief after Stripe checkout.';
  const range = sampleRange(rows);
  const product = productJsonLd(description);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I get the ZIP after payment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Stripe redirects completed buyers to the success page with a Checkout Session ID. The download endpoint verifies that paid session before serving the ZIP.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is delivery handled by email?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Delivery is an instant browser download after a completed Stripe checkout. No fulfillment email is required.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens if the session is missing or unpaid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The download endpoint rejects missing, invalid, or unpaid sessions and does not serve the ZIP.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Delivery | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/delivery.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Delivery | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/delivery.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Instant ZIP delivery after paid Stripe checkout.</h1>
      <p class="lede">The current issue is delivered by the browser after Stripe confirms payment. There is no manual email fulfillment step.</p>

      <section class="grid">
        <div class="card">
          <h2>1. Pay in Stripe</h2>
          <p>Use the hosted Stripe checkout link. The current Payment Link is product-scoped to the NYC Weekly Construction Activity Brief.</p>
        </div>
        <div class="card">
          <h2>2. Return to success page</h2>
          <p>Completed checkout redirects to <code>/success.html?session_id={CHECKOUT_SESSION_ID}</code>.</p>
        </div>
        <div class="card">
          <h2>3. Download ZIP</h2>
          <p><code>/api/download</code> verifies the paid Checkout Session before serving the current ZIP file.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current package</h2>
        <ul>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(rows[0]?.source_fetch_date || range.latestIssuedDate)}.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Package file name: <code>nyc-weekly-construction-activity-brief-current.zip</code>.</li>
          <li>Buyer files include the full CSV, Markdown brief, buyer workbook, priority-slices CSV, source registry, buyer README, QA report, version file, and claims boundary.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Download gate</h2>
        <p>The download endpoint rejects missing, invalid, or unpaid sessions. A direct visit without a valid paid session returns an error instead of the ZIP.</p>
        <p class="fine">No physical item ships. This public-record permit signal brief is not a guaranteed lead list and is not affiliated with or endorsed by NYC, DOB, or any agency.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/buyer-guide.html">Read buyer guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button" href="${checkoutHref('delivery')}">Buy instant ZIP</a>
      </section>
    </main>
  </body>
</html>
`;
}

function pricingHtml(rows) {
  const description = 'Pricing and break-even guide for the NYC Weekly Construction Activity Brief current issue ZIP.';
  const range = sampleRange(rows);
  const product = productJsonLd(description, checkoutHref('pricing'));
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does the current issue cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The current issue launch price is a one-time $24.50 ZIP purchase. The standard price is $49.',
        },
      },
      {
        '@type': 'Question',
        name: 'When is the ZIP worth buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Buy it when a source-linked CSV, buyer workbook, and priority-slices file save enough manual sorting time to justify the price.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the price include leads or contacts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP is a public-record screening file. It does not include private contact data or guaranteed leads.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pricing and ROI | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/pricing.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Pricing and ROI | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/pricing.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Pricing for the current issue ZIP.</h1>
      <p class="lede">A one-time purchase for buyers who want the current ${escapeHtml(rows.length)}-row issue packaged for spreadsheet review instead of sorting selected DOB NOW rows manually.</p>

      <section class="grid">
        <div class="card">
          <h2>Launch price</h2>
          <p class="price">$24.50</p>
          <p>One current-issue ZIP. No subscription. No promo code is required.</p>
        </div>
        <div class="card">
          <h2>Standard price</h2>
          <p class="price">$49</p>
          <p>The current launch price is already applied in Stripe checkout.</p>
        </div>
        <div class="card">
          <h2>Delivery</h2>
          <p>Instant browser download after completed Stripe checkout.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue snapshot</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
      </section>

      <section class="section card">
        <h2>Break-even guide</h2>
        <p>Use this as a time-saved check before buying. These are arithmetic examples, not a lead or revenue guarantee.</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hourly value of research time</th>
                <th>Break-even at $49</th>
                <th>Break-even at $24.50</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$50/hour</td>
                <td>About 59 minutes saved</td>
                <td>About 30 minutes saved</td>
              </tr>
              <tr>
                <td>$75/hour</td>
                <td>About 40 minutes saved</td>
                <td>About 20 minutes saved</td>
              </tr>
              <tr>
                <td>$100/hour</td>
                <td>About 30 minutes saved</td>
                <td>About 15 minutes saved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section card">
        <h2>What the price buys</h2>
        <ul>
          <li>Full ${escapeHtml(rows.length)}-row current issue CSV for the ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(rows[0]?.source_fetch_date || range.latestIssuedDate)} source window.</li>
          <li>Buyer workbook for a fast review pass.</li>
          <li>Priority-slices CSV grouped by work type, borough, ZIP, count, latest issued date, cost-bucket mix, status mix, and source URL.</li>
          <li>Markdown brief, public sample notes, source registry, QA report, version file, buyer README, and claims boundary.</li>
        </ul>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/buyer-guide.html">Read buyer guide</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button" href="${checkoutHref('pricing')}">Buy instant ZIP</a>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, or enriched contact data are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
  </body>
</html>
`;
}

function insideZipHtml(rows) {
  const description = 'File-by-file contents of the current NYC construction activity ZIP, including CSV rows, buyer workbook, priority slices, QA report, and source boundary.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const product = productJsonLd(description, checkoutHref('inside-the-zip'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What files are in the paid ZIP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The paid ZIP includes the full current CSV, Markdown brief, public sample notes, buyer workbook, priority-slices CSV, buyer README, source registry, privacy and claims boundary, QA report, and version file.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP include private contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the buyer workbook for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The buyer workbook gives a fast review path for sorting the current issue by work type, ZIP, status, cost bucket, and source link before manual source checks.',
        },
      },
    ],
  };

  const files = [
    {
      name: 'README.md',
      use: 'Start here for package scope, source window, file list, and claims boundary.',
    },
    {
      name: 'nyc-construction-activity-preview.csv',
      use: `Full ${rows.length}-row current issue CSV with source links, work type, ZIP, borough, issued date, status, cost bucket, permit ID, filing number, short description, and source caveat.`,
    },
    {
      name: 'nyc-construction-activity-preview.md',
      use: 'Markdown view of the current issue for quick reading outside a spreadsheet.',
    },
    {
      name: 'nyc-weekly-construction-activity-sample.md',
      use: 'Public sample brief with the source and privacy boundary visible.',
    },
    {
      name: 'buyer-workbook.md',
      use: 'Step-by-step buyer review path for deciding which rows deserve manual source checks.',
    },
    {
      name: 'buyer-priority-slices.csv',
      use: 'Grouped slices by work type, borough, ZIP, row count, latest issued date, cost-bucket mix, status mix, and source URL.',
    },
    {
      name: 'buyer-readme.md',
      use: 'Short buyer notes for using the files without treating them as a contact list.',
    },
    {
      name: 'source-registry.md',
      use: 'Source dataset, source URL, fetch date, and source caveats.',
    },
    {
      name: 'privacy-and-claims-boundary.md',
      use: 'Excluded fields, privacy limits, agency boundary, and no-lead-guarantee language.',
    },
    {
      name: 'qa-report.json',
      use: 'Machine-readable QA checks for row count, source fields, package contents, and excluded private-contact fields.',
    },
    {
      name: 'version.txt',
      use: 'Package version and issue identifier.',
    },
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Inside the ZIP | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/inside-the-zip.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Inside the ZIP | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/inside-the-zip.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(dataset)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>What is inside the current paid ZIP.</h1>
      <p class="lede">The paid ZIP is an instant browser download after Stripe checkout. It contains the full current CSV, buyer workbook, priority slices, and source-boundary files for manual review.</p>

      <section class="grid">
        <div class="card">
          <h2>Paid rows</h2>
          <p>${escapeHtml(rows.length)} source-linked rows.</p>
        </div>
        <div class="card">
          <h2>Free preview</h2>
          <p>25 rows for checking fields before purchase.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$24.50</p>
          <p>No promo code is required.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>File manifest</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
${files.map((file) => `              <tr>
                <td><code>${escapeHtml(file.name)}</code></td>
                <td>${escapeHtml(file.use)}</td>
              </tr>`).join('\n')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section card">
        <h2>Fast review path</h2>
        <ol>
          <li>Open <code>buyer-workbook.md</code> for the suggested review order.</li>
          <li>Use <code>buyer-priority-slices.csv</code> to pick the work type, ZIP, or borough slice worth checking first.</li>
          <li>Open the full CSV and filter by the slice you chose.</li>
          <li>Use source links to verify any row before outreach, quoting, routing, or planning.</li>
        </ol>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button" href="${checkoutHref('inside-the-zip')}">Buy instant ZIP</a>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
  </body>
</html>
`;
}

function previewHtml(fullRows) {
  const publicRows = parseCsv(fs.readFileSync(publicPreviewCsvPath, 'utf8'));
  const rows = previewRows(publicRows);
  const range = sampleRange(fullRows);
  const fetchDate = fullRows[0] && fullRows[0].source_fetch_date;
  const description = `Browse the ${rows.length}-row public preview for the current NYC construction activity brief before buying the full ${fullRows.length}-row ZIP.`;
  const product = productJsonLd(description, checkoutHref('preview'));
  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'NYC Weekly Construction Activity Brief - Public Preview',
    description,
    url: `${baseUrl}/preview.html`,
    isBasedOn: {
      '@type': 'Dataset',
      name: 'NYC DOB NOW: Build - Approved Permits',
      url: 'https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4',
    },
    temporalCoverage: `${range.firstIssuedDate}/${range.latestIssuedDate}`,
    dateModified: fetchDate,
    distribution: {
      '@type': 'DataDownload',
      name: 'Public CSV preview',
      encodingFormat: 'text/csv',
      contentUrl: `${baseUrl}/sample/nyc-construction-activity-preview.csv`,
    },
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Public Preview | NYC Construction Activity Brief</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${baseUrl}/preview.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Public Preview | NYC Construction Activity Brief">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${baseUrl}/preview.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(dataset)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Public preview for the current NYC construction activity brief.</h1>
      <p class="lede">Review the ${rows.length}-row browser preview before buying the full ${fullRows.length}-row ZIP. The paid ZIP adds the complete current CSV, buyer workbook, priority-slices CSV, QA report, source registry, and buyer README.</p>

      <section class="grid">
        <div class="card">
          <h2>Preview rows</h2>
          <p>${rows.length} rows from the current public preview.</p>
        </div>
        <div class="card">
          <h2>Paid ZIP rows</h2>
          <p>${fullRows.length} source-linked rows in the current issue.</p>
        </div>
        <div class="card">
          <h2>Source window</h2>
          <p>${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}. Latest issued row: ${escapeHtml(range.latestIssuedDate)}.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue snapshot</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
      </section>

      <section class="section card">
        <h2>Sample rows</h2>
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
${rows.map((row) => `              <tr>
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
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download preview CSV</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Read sample brief</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button" href="${checkoutHref('preview')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection()}      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, or enriched contact data are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/buyer-guide.html">Read buyer guide</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="/methodology.html">Read methodology</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function sitemapXml(pages) {
  const urls = ['', 'checkout.html', 'preview.html', 'pricing.html', 'inside-the-zip.html', 'buyer-guide.html', 'delivery.html', 'sample-segments.html', 'methodology.html', ...pages.map((page) => `topics/${page.slug}.html`)];
  const rows = parseCsv(fs.readFileSync(sampleCsvPath, 'utf8'));
  const lastmod = (rows[0] && rows[0].source_fetch_date) || new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${baseUrl}/${url}</loc>
    <lastmod>${lastmod}</lastmod>
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
        <p><a class="button secondary" href="/preview.html">View public preview</a></p>
        <p><a class="button secondary" href="/pricing.html">Check pricing and break-even</a></p>
        <p><a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a></p>
        <p><a class="button secondary" href="/buyer-guide.html">Read buyer guide</a></p>
        <p><a class="button secondary" href="/delivery.html">Read delivery steps</a></p>
        <p><a class="button secondary" href="/sample-segments.html">Browse segment and buyer-intent pages</a></p>
        <p><a class="button secondary" href="/methodology.html">Read methodology and source boundary</a></p>
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
      lede: `The current paid issue includes ${count} selected DOB NOW permit rows for ${boroughs} ZIP ${zipCode}.`,
      audience: `Construction-support vendors and subcontractors watching permit activity in ${zipCode}.`,
      currentSample: `ZIP ${zipCode} has ${count} rows in the 2026-06-09 to 2026-06-15 paid issue.`,
      useCase: `Use this page to check the ZIP ${zipCode} activity mix before buying the current issue package or reviewing source records manually.`,
      sampleLine: `ZIP ${zipCode} | top work types: ${describeCounts(matchingRows, (row) => row.work_type)}`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} paid issue rows in ZIP ${zipCode}.`,
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
      lede: `The current paid issue includes ${count} selected ${work.lowerLabel} rows in ${boroughName}.`,
      audience: `${sentenceCase(work.buyer)} watching ${boroughName} public permit activity.`,
      currentSample: `${boroughName} ${work.lowerLabel} has ${count} rows in the 2026-06-09 to 2026-06-15 paid issue.`,
      useCase: `Use this page to review the ${boroughName} ${work.lowerLabel} sample before deciding whether the current issue package is worth buying.`,
      sampleLine: `${boroughName} | ${work.label} | ZIP | issued date | status | DOB NOW source link`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} paid issue rows for ${work.lowerLabel} in ${boroughName}.`,
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
      lede: `The current paid issue includes ${count} selected ${work.lowerLabel} rows for ${boroughName} ZIP ${zipCode}.`,
      audience: `${sentenceCase(work.buyer)} watching ZIP ${zipCode}.`,
      currentSample: `${work.label} in ZIP ${zipCode} has ${count} rows in the 2026-06-09 to 2026-06-15 paid issue.`,
      useCase: `Use this page to scan ${work.lowerLabel} activity in ZIP ${zipCode} before opening the DOB NOW source records one by one.`,
      sampleLine: `${work.label} | ${zipCode} | ${boroughName} | issued date | status | source link`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} paid issue rows for ${work.lowerLabel} in ZIP ${zipCode}.`,
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
          answer: `The current paid issue covers selected issued dates from ${range}.`,
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
      description: `Review ${count} selected NYC ${work.lowerLabel} permit rows from the current paid issue with ZIP, borough, issued date, status, and source links.`,
      h1: `NYC ${work.lowerLabel} permit CSV sample.`,
      lede: `The current paid issue includes ${count} selected ${work.lowerLabel} rows from ${range}.`,
      audience: `${sentenceCase(work.buyer)} comparing public permit activity across selected NYC ZIP codes.`,
      currentSample: `${work.label} has ${count} rows in the current 142-row paid issue. The free CSV preview is limited to 25 rows.`,
      useCase: `Use this page to inspect the ${work.lowerLabel} sample before downloading the public CSV or buying the current issue package.`,
      sampleLine: `${work.label} | top ZIPs: ${describeCounts(matchingRows, (row) => row.zip_code)}`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} paid issue rows for ${work.lowerLabel}.`,
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
      currentSample: `${count} selected ${work.lowerLabel} rows appear in the ${range} paid issue.`,
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

  for (const persona of buyerPersonas) {
    const matchingRows = rows.filter((row) => persona.workTypes.includes(row.work_type));
    const count = matchingRows.length;
    if (!count) continue;
    pages.push({
      group: 'buyer-persona',
      slug: persona.slug,
      title: persona.title,
      description: persona.description,
      h1: persona.h1,
      lede: persona.lede,
      audience: persona.audience,
      currentSample: `${count} selected rows match this buyer view in the ${range} paid issue. The free CSV preview is limited to 25 rows.`,
      useCase: `Use this page to see whether the current issue has enough ${persona.sampleLineLabel} to justify buying the ZIP before opening individual DOB NOW source records.`,
      sampleLine: `${persona.sampleLineLabel} | top ZIPs: ${describeCounts(matchingRows, (row) => row.zip_code)} | top cost buckets: ${describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 3)}`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} paid issue rows match this buyer view.`,
        `Work type mix: ${describeCounts(matchingRows, (row) => row.work_type, 6)}.`,
        `Territory mix: ${describeCounts(matchingRows, (row) => `${titleCase(row.borough)} ${row.zip_code}`)}.`,
        `Cost buckets: ${describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket))}.`,
      ],
      faqs: [
        {
          question: 'Does this page prove a company is ready to buy?',
          answer: 'No. It only groups selected public permit activity for faster screening. Any outreach, quoting, or purchasing judgment stays manual.',
        },
        {
          question: 'Does the ZIP include contacts for these rows?',
          answer: 'No. The ZIP excludes owner names, applicant names, phone numbers, emails, full street addresses, and enriched contact data.',
        },
      ],
      workTypeRequest: persona.workTypeRequest,
      territoryRequest: persona.territoryRequest,
      count,
      linkText: persona.title,
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
      lede: `The current paid issue includes ${count} selected permit rows marked in the ${label} estimated job cost bucket.`,
      audience: 'Construction-support vendors and subcontractors screening public permit activity by estimated job cost range.',
      currentSample: `${count} rows in the ${range} paid issue use the ${label} cost bucket.`,
      useCase: `Use this page to see whether the selected sample includes enough ${label} activity to justify deeper source-record review.`,
      sampleLine: `${label} | top work types: ${describeCounts(matchingRows, (row) => row.work_type)}`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} paid issue rows in the ${label} cost bucket.`,
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
      lede: `The current paid issue includes ${count} selected DOB NOW permit rows issued on ${issuedDate}.`,
      audience: 'Construction-support vendors checking recent permit activity by issue date before opening individual source records.',
      currentSample: `${issuedDate} has ${count} selected rows in the current paid issue.`,
      useCase: `Use this page to scan one issued-date slice of the sample before sorting the full CSV by work type or territory.`,
      sampleLine: `${issuedDate} | top work types: ${describeCounts(matchingRows, (row) => row.work_type)}`,
      rows: sampleRows(matchingRows),
      stats: [
        `${count} paid issue rows issued on ${issuedDate}.`,
        `Work type mix: ${describeCounts(matchingRows, (row) => row.work_type)}.`,
        `Territory mix: ${describeCounts(matchingRows, (row) => `${titleCase(row.borough)} ${row.zip_code}`)}.`,
      ],
      faqs: [
        {
          question: 'Can issued-date pages become outdated?',
          answer: 'Yes. This page describes the current issue sample only. Use the source link for the current public record state.',
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
fs.writeFileSync(path.join(root, 'methodology.html'), methodologyHtml(rows));
fs.writeFileSync(path.join(root, 'buyer-guide.html'), buyerGuideHtml(rows));
fs.writeFileSync(path.join(root, 'delivery.html'), deliveryHtml(rows));
fs.writeFileSync(path.join(root, 'pricing.html'), pricingHtml(rows));
fs.writeFileSync(path.join(root, 'inside-the-zip.html'), insideZipHtml(rows));
fs.writeFileSync(path.join(root, 'preview.html'), previewHtml(rows));
fs.writeFileSync(path.join(root, 'checkout.html'), checkoutHtml());
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemapXml(pages));
fs.writeFileSync(
  path.join(root, 'scripts', 'generated-pages-manifest.json'),
  `${JSON.stringify({
    sourceFetchDate: rows[0] && rows[0].source_fetch_date,
    source: path.relative(root, sampleCsvPath),
    sourceRows: rows.length,
    manualPages: manualPages.length,
    generatedPages: generatedPages.length,
    totalTopicPages: pages.length,
    slugs: pages.map((page) => page.slug),
  }, null, 2)}\n`,
);
updateIndex(manualPages, generatedPages);

console.log(`generated ${pages.length} SEO pages from ${rows.length} source rows`);
