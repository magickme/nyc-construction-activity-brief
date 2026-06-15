const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const socialImageUrl = `${baseUrl}/assets/current-issue-snapshot.png`;
const stripeCheckoutUrl = 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q';
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

const workTypeLandingPages = [
  {
    workType: 'Mechanical Systems',
    pageSlug: 'nyc-mechanical-systems-permits',
    checkoutSource: 'mechanical-systems-permits',
    title: 'NYC Mechanical Systems Permits | Current DOB Activity',
    ogTitle: 'NYC Mechanical Systems Permits | Current DOB Activity',
    description:
      'NYC mechanical systems permits page for buyers screening selected public DOB mechanical activity by ZIP, issued date, status, cost bucket, and source link.',
    headline: 'NYC mechanical systems permits in the current issue.',
    rowLabel: 'Mechanical systems',
    audience: [
      'Mechanical contractors checking selected public permit activity.',
      'HVAC suppliers and building-systems vendors sorting by ZIP and issued date.',
      'Construction researchers building a short manual source-check list.',
    ],
    topicHref: '/topics/nyc-mechanical-permit-activity.html',
    topicText: 'Mechanical permit topic page',
    contractorHref: '/topics/mechanical-systems-contractor-permit-research-nyc.html',
  },
  {
    workType: 'Supported Scaffold',
    pageSlug: 'nyc-supported-scaffold-permits',
    checkoutSource: 'supported-scaffold-permits',
    title: 'NYC Supported Scaffold Permits | Current DOB Activity',
    ogTitle: 'NYC Supported Scaffold Permits | Current DOB Activity',
    description:
      'NYC supported scaffold permits page for buyers screening selected public DOB scaffold activity by ZIP, issued date, status, cost bucket, and source link.',
    headline: 'NYC supported scaffold permits in the current issue.',
    rowLabel: 'Supported scaffold',
    audience: [
      'Supported scaffold contractors checking selected public permit activity.',
      'Site-access vendors and construction suppliers sorting by ZIP and issued date.',
      'Construction support teams building a short manual source-check list.',
    ],
    topicHref: '/topics/nyc-supported-scaffold-permits.html',
    topicText: 'Supported scaffold topic page',
    contractorHref: '/topics/supported-scaffold-contractor-permit-research-nyc.html',
  },
  {
    workType: 'Structural',
    pageSlug: 'nyc-structural-permits',
    checkoutSource: 'structural-permits',
    title: 'NYC Structural Permits | Current DOB Activity',
    ogTitle: 'NYC Structural Permits | Current DOB Activity',
    description:
      'NYC structural permits page for buyers screening selected public DOB structural activity by ZIP, issued date, status, cost bucket, and source link.',
    headline: 'NYC structural permits in the current issue.',
    rowLabel: 'Structural',
    audience: [
      'Structural contractors checking selected public permit activity.',
      'Construction suppliers and inspection-adjacent vendors sorting by ZIP and issued date.',
      'Construction researchers building a short manual source-check list.',
    ],
    topicHref: '/topics/nyc-structural-permit-activity.html',
    topicText: 'Structural permit topic page',
    contractorHref: '/topics/structural-contractor-permit-research-nyc.html',
  },
  {
    workType: 'Construction Fence',
    pageSlug: 'nyc-construction-fence-permits',
    checkoutSource: 'construction-fence-permits',
    title: 'NYC Construction Fence Permits | Current DOB Activity',
    ogTitle: 'NYC Construction Fence Permits | Current DOB Activity',
    description:
      'NYC construction fence permits page for buyers screening selected public DOB construction fence activity by ZIP, issued date, status, cost bucket, and source link.',
    headline: 'NYC construction fence permits in the current issue.',
    rowLabel: 'Construction fence',
    audience: [
      'Construction fence vendors checking selected public permit activity.',
      'Temporary site-service suppliers and exterior-work teams sorting by ZIP and issued date.',
      'Construction support teams building a short manual source-check list.',
    ],
    topicHref: '/topics/nyc-construction-fence-permits.html',
    topicText: 'Construction fence topic page',
    contractorHref: '/topics/construction-fence-contractor-permit-research-nyc.html',
  },
];

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

function topicCheckoutSource(page) {
  return `topic-${page.slug}`.slice(0, 80);
}

function conversionBar(source) {
  return `    <aside class="conversion-bar" data-conversion-bar>
      <p><strong>$9.50</strong> current issue ZIP. Instant Stripe checkout and browser download.</p>
      <div class="conversion-actions">
        <a class="button secondary" href="#sample-request">Sample request</a>
        <a class="button" href="${checkoutHref(source)}">Buy ZIP</a>
      </div>
    </aside>
`;
}

const coreConversionPages = [
  ['', 'home-sticky'],
  ['preview.html', 'preview-sticky'],
  ['current-issue.html', 'current-issue-sticky'],
  ['pricing.html', 'pricing-sticky'],
  ['inside-the-zip.html', 'inside-the-zip-sticky'],
  ['free-vs-paid.html', 'free-vs-paid-sticky'],
  ['buyer-guide.html', 'buyer-guide-sticky'],
  ['csv-field-guide.html', 'csv-field-guide-sticky'],
  ['delivery.html', 'delivery-sticky'],
  ['support.html', 'support-sticky'],
  ['sample-request.html', 'sample-request-sticky'],
  ['nyc-dob-permit-csv.html', 'nyc-dob-permit-csv-sticky'],
  ['weekly-nyc-construction-permit-report.html', 'weekly-nyc-construction-report-sticky'],
  ['dob-now-permit-search-alternative.html', 'dob-now-alternative-sticky'],
  ['nyc-construction-permit-leads.html', 'permit-leads-sticky'],
  ['nyc-sidewalk-shed-permits.html', 'sidewalk-shed-permits-sticky'],
  ['nyc-plumbing-permits.html', 'plumbing-permits-sticky'],
  ['nyc-sprinkler-permits.html', 'sprinkler-permits-sticky'],
  ['nyc-mechanical-systems-permits.html', 'mechanical-systems-permits-sticky'],
  ['nyc-supported-scaffold-permits.html', 'supported-scaffold-permits-sticky'],
  ['nyc-structural-permits.html', 'structural-permits-sticky'],
  ['nyc-construction-fence-permits.html', 'construction-fence-permits-sticky'],
  ['methodology.html', 'methodology-sticky'],
  ['time-saved-calculator.html', 'time-saved-calculator-sticky'],
  ['who-should-buy.html', 'who-should-buy-sticky'],
  ['permit-research-workflow.html', 'permit-research-workflow-sticky'],
  ['contractor-supplier-permit-research.html', 'contractor-supplier-sticky'],
  ['broker-developer-permit-research.html', 'broker-developer-sticky'],
  ['permit-expediter-research.html', 'permit-expediter-sticky'],
  ['sample-segments.html', 'sample-segments-sticky'],
];

function applyCoreConversionBars() {
  for (const [relativePath, source] of coreConversionPages) {
    const filePath = path.join(root, relativePath || 'index.html');
    let html = fs.readFileSync(filePath, 'utf8');
    html = html.replace(/\s+<aside class="conversion-bar" data-conversion-bar>[\s\S]*?<\/aside>\n(?=\s*<\/body>)/, '\n');
    html = html.replace(/<body(?![^>]*class=)>/, '<body class="has-conversion-bar">');
    html = html.replace(/<body class="([^"]*)">/, (_match, className) => {
      const classes = new Set(className.split(/\s+/).filter(Boolean));
      classes.add('has-conversion-bar');
      return `<body class="${[...classes].join(' ')}">`;
    });
    html = html.replace(/\s*<\/body>/, `\n${conversionBar(source)}  </body>`);
    fs.writeFileSync(filePath, html);
  }
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

function alternateDiscoveryLinks() {
  return `    <link rel="alternate" type="application/rss+xml" title="NYC Weekly Construction Activity Brief RSS" href="${baseUrl}/feed.xml">
    <link rel="alternate" type="application/json" title="NYC Weekly Construction Activity Brief current issue" href="${baseUrl}/current-issue.json">`;
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
        data.source_path = window.location.pathname;
        const requestSource = ['sample-request', window.location.pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'].join('-').slice(0, 80);
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
            window.va('event', { name: 'sample_request_saved', data: { source: requestSource } });
          } catch (error) {}
          if (status) {
            status.innerHTML = 'Request saved. I will use this to choose future sample cuts. If the current ZIP fits, <a href="/checkout.html?source=' + encodeURIComponent(requestSource) + '">buy the instant ZIP</a>.';
          }
        } catch (error) {
          try {
            window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
            window.va('event', { name: 'sample_request_failed', data: { source: requestSource } });
          } catch (trackingError) {}
          if (status) {
            status.innerHTML = 'Request was not saved. Try again, or <a href="/checkout.html?source=' + encodeURIComponent(requestSource) + '">buy the current ZIP</a> if it already fits.';
          }
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
      price: '9.50',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

function checkoutHtml(rows) {
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
        <p class="fine">If the redirect does not start, use the button below. The current launch price is $9.50. No promo code is required.</p>
        <div class="grid">
          <div class="card">
            <h2>What you get</h2>
            <p>Full ${escapeHtml(rows.length)}-row CSV, buyer workbook, priority-slices CSV, source registry, QA report, buyer README, and version file.</p>
          </div>
          <div class="card">
            <h2>Delivery</h2>
            <p>After Stripe confirms payment, the success page starts the ZIP download in your browser and keeps a manual download button as fallback.</p>
          </div>
          <div class="card">
            <h2>Boundary</h2>
            <p>Public-record screening file only. No private contacts, full street addresses, agency endorsement, guaranteed leads, or revenue estimate.</p>
          </div>
        </div>
        <ul>
          <li>Instant browser download after completed Stripe checkout.</li>
          <li>Current ZIP includes the CSV, buyer workbook, priority slices, source registry, QA report, and claims boundary.</li>
          <li>No private contact data, owner names, applicant names, phone numbers, email addresses, or full street addresses.</li>
        </ul>
        <a id="stripe-link" class="button" href="${stripeCheckoutUrl}?utm_source=nyc_construction_activity_brief&amp;utm_medium=owned_site&amp;utm_campaign=current_issue_launch&amp;utm_content=checkout_static&amp;client_reference_id=ncab_checkout_static">Continue to Stripe</a>
        <p>
          <a class="button secondary" href="/preview.html">Check preview</a>
          <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
          <a class="button secondary" href="/support.html">Support and refunds</a>
        </p>
        <p class="fine">Stripe handles payment. The success page uses the paid Checkout Session to unlock the ZIP.</p>
        <noscript>
          <p class="fine">JavaScript is off, so automatic redirect is disabled. The button above opens the same Stripe checkout.</p>
        </noscript>
      </section>
    </main>
    <script>
      const params = new URLSearchParams(window.location.search);
      const rawSource = params.get('source') || 'site';
      const source = /^[a-z0-9._-]{1,80}$/i.test(rawSource) ? rawSource : 'site';
      const stripeParams = new URLSearchParams({
        utm_source: 'nyc_construction_activity_brief',
        utm_medium: 'owned_site',
        utm_campaign: 'current_issue_launch',
        utm_content: source,
        client_reference_id: ['ncab', source.replace(/[^a-z0-9_-]/gi, '_'), Date.now().toString(36)].join('_').slice(0, 200),
      });
      const stripeUrl = '${stripeCheckoutUrl}?' + stripeParams.toString();
      const link = document.getElementById('stripe-link');
      link.href = stripeUrl;
      link.addEventListener('click', () => {
        try {
          window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
          window.va('event', { name: 'checkout_continue_clicked', data: { source } });
        } catch (error) {}
      });
      try {
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
        window.va('event', { name: 'checkout_intent', data: { source } });
      } catch (error) {}
      window.setTimeout(() => {
        try {
          window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
          window.va('event', { name: 'checkout_auto_redirect', data: { source } });
        } catch (error) {}
        window.location.replace(stripeUrl);
      }, 1800);
    </script>
  </body>
</html>
`;
}

function buyHtml(rows) {
  const source = 'buy-page';
  const checkout = checkoutHref(source);
  const description = 'Buy the current NYC Weekly Construction Activity Brief ZIP with source-linked DOB NOW rows, buyer workbook, priority slices, and instant browser download.';
  const product = productJsonLd(description, checkout);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Buy Current Issue | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/buy.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Buy Current Issue | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/buy.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <section class="section card">
        <h1>Buy the current issue ZIP.</h1>
        <p class="lede">One current-issue ZIP for buyers who want the selected NYC DOB NOW rows packaged for spreadsheet review.</p>
        <p class="fine">$9.50 one-time launch price. Instant browser download after completed Stripe checkout. No promo code is required.</p>
        <div class="grid">
          <div class="card">
            <h2>Included</h2>
            <p>Full ${escapeHtml(rows.length)}-row CSV, buyer workbook, priority-slices CSV, source registry, QA report, buyer README, and version file.</p>
          </div>
          <div class="card">
            <h2>Worth checking</h2>
            <p>At $75/hour, the $9.50 launch price breaks even at about 8 minutes of avoided manual sorting.</p>
          </div>
          <div class="card">
            <h2>Boundary</h2>
            <p>No private contacts, owner names, applicant names, full street addresses, agency endorsement, guaranteed leads, or revenue estimate.</p>
          </div>
        </div>
        <a id="buy-link" class="button" href="${checkout}">Continue to checkout</a>
        <p>
          <a class="button secondary" href="/preview.html">Check preview</a>
          <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
          <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
          <a class="button secondary" href="/support.html">Support and refunds</a>
        </p>
        <p class="fine">No guaranteed leads, owner contact data, or agency-endorsed information.</p>
        <noscript>
          <p class="fine">JavaScript is off, so automatic redirect is disabled. The button above opens the same tracked checkout path.</p>
        </noscript>
      </section>
    </main>
    <script>
      const checkoutUrl = '${checkout}';
      const link = document.getElementById('buy-link');
      link.addEventListener('click', () => {
        try {
          window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
          window.va('event', { name: 'buy_page_continue_clicked', data: { source: '${source}' } });
        } catch (error) {}
      });
      try {
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
        window.va('event', { name: 'buy_page_viewed', data: { source: '${source}' } });
      } catch (error) {}
      window.setTimeout(() => {
        try {
          window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
          window.va('event', { name: 'buy_page_auto_redirect', data: { source: '${source}' } });
        } catch (error) {}
        window.location.replace(checkoutUrl);
      }, 1200);
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
              <option value="real-estate-investor">Real estate investor or acquisition researcher</option>
              <option value="broker-developer">Broker or developer</option>
              <option value="permit-expediter">Permit expediter or filing consultant</option>
              <option value="risk-researcher">Risk, lending, or compliance researcher</option>
              <option value="consultant-analyst">Consultant or analyst</option>
              <option value="property-manager">Property manager or facilities team</option>
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
  const trackedCheckoutUrl = checkoutHref(topicCheckoutSource(page));
  const product = productJsonLd(page.description, trackedCheckoutUrl);
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
    <link rel="alternate" type="application/rss+xml" title="NYC Weekly Construction Activity Brief RSS" href="${baseUrl}/feed.xml">
    <link rel="alternate" type="application/json" title="NYC Weekly Construction Activity Brief current issue" href="${baseUrl}/current-issue.json">
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
  <body class="has-conversion-bar">
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
        <a class="button" href="${trackedCheckoutUrl}">Buy instant ZIP</a>
      </section>

${sampleStats(page)}${sampleTable(page)}${sampleRequestSection({
    workType: page.workTypeRequest,
    territory: page.territoryRequest,
  })}${faqSection(page)}      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, or full street addresses are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
${conversionBar(topicCheckoutSource(page))}
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
    <link rel="alternate" type="application/rss+xml" title="NYC Weekly Construction Activity Brief RSS" href="${baseUrl}/feed.xml">
    <link rel="alternate" type="application/json" title="NYC Weekly Construction Activity Brief current issue" href="${baseUrl}/current-issue.json">
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
        <p>The paid ZIP includes the CSV, Markdown brief, source registry, buyer README, QA report, version file, and claims boundary for the 2026-06-09 to 2026-06-15 issue. Current launch price is $9.50.</p>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download public CSV preview</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Read sample brief</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
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
${alternateDiscoveryLinks()}
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
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('methodology')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
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
${alternateDiscoveryLinks()}
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
          <li>Buy the ZIP only if the current issue saves enough sorting time to justify the one-time $9.50 launch price.</li>
        </ol>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="/methodology.html">Read methodology</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('buyer-guide')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function csvFieldGuideHtml(rows) {
  const description = 'Column-by-column guide to the NYC construction activity CSV preview and paid ZIP fields, with source limits, excluded data, and checkout links.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const product = productJsonLd(description, checkoutHref('csv-field-guide'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What columns are in the CSV?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The CSV includes source name, source URL, source fetch date, jurisdiction, borough, ZIP code, work type, issued date, permit status, cost bucket, permit ID, work permit, job filing number, short description, and source caveat.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the CSV include private contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
      {
        '@type': 'Question',
        name: 'How should buyers use source_url?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use source_url to open the public source record and verify any row before outreach, quoting, routing, or planning.',
        },
      },
    ],
  };

  const fields = [
    ['source_name', 'Names the public dataset used for the row.'],
    ['source_url', 'Public source-record URL for manual checks before acting on the row.'],
    ['source_fetch_date', 'Date the source data was pulled into this issue.'],
    ['jurisdiction', 'Public jurisdiction label for the source row.'],
    ['borough', 'NYC borough label from the source record.'],
    ['zip_code', 'ZIP code used for sorting territory and route checks.'],
    ['work_type', 'Selected DOB work type included in the current issue.'],
    ['issued_date', 'Permit issue date in the source record.'],
    ['permit_status', 'Status value from the source record.'],
    ['estimated_job_cost_bucket', 'Bucketed cost range used for quick screening; it is not a bid value.'],
    ['permit_id', 'Permit identifier from the source data when available.'],
    ['work_permit', 'Work permit value from the source record when available.'],
    ['job_filing_number', 'Filing number for matching the row back to DOB records.'],
    ['job_description_short', 'Short, cleaned description for first-pass review.'],
    ['source_caveat', 'Reminder that source rows can be incomplete, delayed, revised, duplicated, or mislabeled.'],
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CSV Field Guide | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/csv-field-guide.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="CSV Field Guide | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/csv-field-guide.html">
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
      <h1>CSV field guide for the current NYC construction activity issue.</h1>
      <p class="lede">Use this guide to check the free preview columns before buying the full ${escapeHtml(rows.length)}-row ZIP.</p>

      <section class="grid">
        <div class="card">
          <h2>Free preview</h2>
          <p>25 rows with the same public-facing columns used in the paid CSV.</p>
        </div>
        <div class="card">
          <h2>Paid ZIP</h2>
          <p>${escapeHtml(rows.length)} source-linked rows plus buyer workbook, priority slices, QA report, and source registry.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>No subscription or promo code is required.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue scope</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>CSV columns</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Column</th>
                <th>How to read it</th>
              </tr>
            </thead>
            <tbody>
${fields.map(([name, use]) => `              <tr>
                <td><code>${escapeHtml(name)}</code></td>
                <td>${escapeHtml(use)}</td>
              </tr>`).join('\n')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section card">
        <h2>Suggested sort order</h2>
        <ol>
          <li>Filter by <code>work_type</code> for the service line you care about.</li>
          <li>Filter by <code>zip_code</code> or <code>borough</code> for territory fit.</li>
          <li>Sort by <code>issued_date</code> to review the newest rows first.</li>
          <li>Use <code>estimated_job_cost_bucket</code> as a rough screen, not as a quote value.</li>
          <li>Open <code>source_url</code> before outreach, quoting, routing, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Excluded data</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Read sample brief</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/buyer-guide.html">Read buyer guide</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('csv-field-guide')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function permitCsvHtml(rows) {
  const description = 'NYC DOB permit CSV preview and paid weekly ZIP for screening selected construction activity by work type, ZIP, borough, issued date, and source link.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const product = productJsonLd(description, checkoutHref('nyc-dob-permit-csv'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I preview the NYC DOB permit CSV before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The public preview has 25 rows with the same public-facing field structure as the paid current issue CSV.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid CSV add?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The paid ZIP adds the full ${rows.length}-row current issue CSV, buyer workbook, priority-slices CSV, source registry, QA report, and package notes.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Does the CSV include owner or applicant contacts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC DOB Permit CSV | Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-dob-permit-csv.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC DOB Permit CSV | Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-dob-permit-csv.html">
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
      <h1>NYC DOB permit CSV for weekly construction activity research.</h1>
      <p class="lede">Preview 25 public rows before buying the full ${escapeHtml(rows.length)}-row current issue ZIP.</p>

      <section class="grid">
        <div class="card">
          <h2>Free preview</h2>
          <p>25 source-linked rows with work type, borough, ZIP, issued date, status, cost bucket, and DOB NOW source links.</p>
        </div>
        <div class="card">
          <h2>Paid ZIP</h2>
          <p>${escapeHtml(rows.length)} current issue rows plus buyer workbook, priority slices, QA report, and source registry.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>Instant browser download after completed Stripe checkout.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current CSV scope</h2>
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
        <h2>Common CSV checks</h2>
        <ol>
          <li>Filter by <code>work_type</code> for the trade or filing category you care about.</li>
          <li>Filter by <code>zip_code</code> or <code>borough</code> for territory fit.</li>
          <li>Sort by <code>issued_date</code> to review recent source rows first.</li>
          <li>Use <code>source_url</code> to verify any row before outreach, quoting, routing, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>What is excluded</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Read sample brief</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/buyer-guide.html">Read buyer guide</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-dob-permit-csv')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function weeklyPermitReportHtml(rows) {
  const description = 'Weekly NYC construction permit report with selected DOB activity by work type, ZIP, borough, issued date, status, cost bucket, and source link.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const product = productJsonLd(description, checkoutHref('weekly-nyc-construction-report'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is in the weekly construction permit report?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The current paid ZIP includes ${rows.length} selected public DOB permit rows, a Markdown brief, buyer workbook, priority-slices CSV, source registry, QA report, and package notes.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Can I inspect the report before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The public preview, sample brief, segment pages, field guide, methodology, and delivery page are available before checkout.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this a live alert feed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The product is a current issue ZIP for weekly screening. It is not a live alert feed, API, CRM sync, or complete DOB database.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Weekly NYC Construction Permit Report | DOB Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/weekly-nyc-construction-permit-report.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Weekly NYC Construction Permit Report | DOB Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/weekly-nyc-construction-permit-report.html">
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
      <h1>Weekly NYC construction permit report for source-linked review.</h1>
      <p class="lede">Use the free preview to check the current report format before buying the full ${escapeHtml(rows.length)}-row ZIP.</p>

      <section class="grid">
        <div class="card">
          <h2>Current report</h2>
          <p>${escapeHtml(rows.length)} selected DOB permit rows for ${escapeHtml(range.firstIssuedDate)} through ${escapeHtml(fetchDate || range.latestIssuedDate)}.</p>
        </div>
        <div class="card">
          <h2>Review fields</h2>
          <p>Work type, borough, ZIP, issued date, status, cost bucket, filing identifiers, short description, and source link.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current report snapshot</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>How buyers use it</h2>
        <ol>
          <li>Check the public preview for field fit and source limits.</li>
          <li>Use the segment hub to inspect relevant ZIP, borough, work type, and cost-bucket pages.</li>
          <li>Buy the ZIP if the full current issue saves enough weekly sorting time.</li>
          <li>Open source links before outreach, quoting, routing, underwriting, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Delivery steps</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('weekly-nyc-construction-report')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function dobNowAlternativeHtml(rows) {
  const description = 'Compare manual DOB NOW permit search with the NYC construction activity ZIP for weekly source-linked screening by work type, ZIP, date, and source link.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const product = productJsonLd(description, checkoutHref('dob-now-alternative'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a replacement for DOB NOW?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Use the ZIP as a weekly screening file, then open DOB NOW or NYC Open Data source links before acting on a row.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why buy this if DOB records are public?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The ZIP packages ${rows.length} selected rows, a buyer workbook, priority slices, source registry, and QA notes so buyers can reduce repeated weekly sorting work.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP include private contact fields?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
    ],
  };
  const comparisonRows = [
    ['Manual DOB NOW search', 'Useful for direct source checks and individual record review.', 'Slower for repeated weekly sorting across work types, ZIPs, issued dates, and cost buckets.'],
    ['Public preview', 'Free 25-row sample with the same public-facing field structure.', 'Limited sample size; buyer-only workbook and priority slices are not included.'],
    ['Paid ZIP', `${rows.length} source-linked rows plus buyer workbook, priority slices, QA report, source registry, and package notes.`, 'Still requires source checks before outreach, quoting, routing, underwriting, or planning.'],
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>DOB NOW Permit Search Alternative | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/dob-now-permit-search-alternative.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="DOB NOW Permit Search Alternative | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/dob-now-permit-search-alternative.html">
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
      <h1>DOB NOW permit search alternative for weekly screening.</h1>
      <p class="lede">Use the free preview to check the file shape, then buy the ZIP if the current issue saves enough manual sorting time.</p>

      <section class="grid">
        <div class="card">
          <h2>Manual search</h2>
          <p>Best for checking individual source records and confirming current DOB details before acting.</p>
        </div>
        <div class="card">
          <h2>Packaged screen</h2>
          <p>Best for reviewing selected rows by work type, ZIP, borough, issued date, status, cost bucket, and source link.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Comparison</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Option</th>
                <th>Good for</th>
                <th>Limit</th>
              </tr>
            </thead>
            <tbody>
${comparisonRows.map(([option, goodFor, limit]) => `              <tr>
                <td>${escapeHtml(option)}</td>
                <td>${escapeHtml(goodFor)}</td>
                <td>${escapeHtml(limit)}</td>
              </tr>`).join('\n')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section card">
        <h2>Use this order</h2>
        <ol>
          <li>Open the free preview and confirm the fields match your weekly screen.</li>
          <li>Check the CSV field guide if you need to inspect columns before buying.</li>
          <li>Use the segment hub to check your ZIP, borough, work type, issued date, or cost bucket.</li>
          <li>Buy the ZIP only if the full current issue saves enough repeated sorting time.</li>
          <li>Open source links before outreach, quoting, routing, underwriting, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, or filing advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Delivery steps</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('dob-now-alternative')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function permitLeadsHtml(rows) {
  const description = 'NYC construction permit leads alternative for buyers who need source-linked weekly permit screening without private contacts, lead scores, or sales guarantees.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('permit-leads'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a construction lead list?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a source-linked public-record screening file. It does not include private contacts, lead scores, or guaranteed sales opportunities.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can vendors use it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vendors can filter the weekly CSV by work type, ZIP, issued date, status, and cost bucket, then verify any useful row at its public source URL.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid ZIP add?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The paid ZIP adds the full ${rows.length}-row current issue CSV, buyer workbook, priority-slices CSV, source registry, QA report, and package notes.`,
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC Construction Permit Leads | Source-Linked Screening</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-construction-permit-leads.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Construction Permit Leads | Source-Linked Screening">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-construction-permit-leads.html">
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
      <h1>NYC construction permit leads alternative.</h1>
      <p class="lede">Use this as a source-linked weekly screening file, not a contact list or sales guarantee.</p>

      <section class="grid">
        <div class="card">
          <h2>For vendors</h2>
          <p>Screen selected permit activity by trade, territory, issued date, status, cost bucket, and source link.</p>
        </div>
        <div class="card">
          <h2>For researchers</h2>
          <p>Build a short manual review list before opening individual DOB NOW records.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>What buyers get</h2>
        <ul>
          <li>A weekly CSV for selected public permit rows.</li>
          <li>Source links for manual verification.</li>
          <li>Buyer workbook and priority slices for choosing rows to review first.</li>
          <li>QA report, source registry, version file, and claims boundary.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>What buyers do not get</h2>
        <ul>
          <li>No private contact data.</li>
          <li>No owner names, applicant names, phone numbers, email addresses, or full street addresses.</li>
          <li>No guaranteed leads. No lead scores, buying-intent scores, outreach automation, CRM sync, or guaranteed sales opportunities.</li>
          <li>No agency endorsement, legal advice, filing advice, underwriting advice, or complete DOB database.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Use this order</h2>
        <ol>
          <li>Open the free preview and confirm the fields fit your screening process.</li>
          <li>Check work types, ZIPs, cost buckets, and issued dates against the current issue facts.</li>
          <li>Buy the ZIP if the full file saves enough weekly sorting time.</li>
          <li>Verify source records before outreach, quoting, routing, underwriting, or planning.</li>
        </ol>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/dob-now-permit-search-alternative.html">DOB NOW alternative</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('permit-leads')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function sidewalkShedPermitsHtml(rows) {
  const sidewalkRows = rows.filter((row) => row.work_type === 'Sidewalk Shed');
  const description = 'NYC sidewalk shed permits page for buyers screening selected public DOB sidewalk shed activity by ZIP, issued date, status, cost bucket, and source link.';
  const range = sampleRange(sidewalkRows.length ? sidewalkRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(sidewalkRows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(sidewalkRows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(sidewalkRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('sidewalk-shed-permits'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does the current issue include sidewalk shed permits?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. The current paid issue includes ${sidewalkRows.length} selected sidewalk shed permit rows from the public DOB source file.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Can vendors use this as a lead list?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use it as a public-record screening file before manual source checks. It does not include private contacts, lead scores, or guaranteed sales opportunities.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid ZIP add?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The paid ZIP includes the full ${rows.length}-row current issue CSV, buyer workbook, priority-slices CSV, QA report, source registry, and package notes.`,
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC Sidewalk Shed Permits | Current DOB Activity</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-sidewalk-shed-permits.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Sidewalk Shed Permits | Current DOB Activity">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-sidewalk-shed-permits.html">
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
      <h1>NYC sidewalk shed permits in the current issue.</h1>
      <p class="lede">Use the public preview to check field fit, then buy the ZIP if the current sidewalk shed slice saves enough weekly sorting time.</p>

      <section class="grid">
        <div class="card">
          <h2>Sidewalk shed rows</h2>
          <p>${escapeHtml(sidewalkRows.length)} selected rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Review fields</h2>
          <p>ZIP, borough, issued date, status, cost bucket, permit identifiers, short description, and source link.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current sidewalk shed facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest sidewalk shed row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Sidewalk shed rows: ${escapeHtml(sidewalkRows.length)}.</li>
          <li>Top ZIPs for sidewalk shed rows: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Who this page is for</h2>
        <ul>
          <li>Sidewalk shed vendors checking selected public permit activity.</li>
          <li>Exterior-work suppliers and site-access firms sorting by ZIP and issued date.</li>
          <li>Construction support teams building a short manual source-check list.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Use this order</h2>
        <ol>
          <li>Open the free preview and confirm the CSV fields match your review process.</li>
          <li>Check the sidewalk shed count, ZIP mix, borough mix, and issued-date range.</li>
          <li>Buy the ZIP if the full current issue saves enough weekly sorting time.</li>
          <li>Open source links before outreach, quoting, routing, underwriting, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, or filing advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/topics/nyc-sidewalk-shed-permits.html">Sidewalk shed topic page</a>
        <a class="button secondary" href="/topics/sidewalk-shed-contractor-permit-research-nyc.html">Contractor research page</a>
        <a class="button secondary" href="/nyc-construction-permit-leads.html">Permit leads alternative</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('sidewalk-shed-permits')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Sidewalk Shed',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function plumbingPermitsHtml(rows) {
  const plumbingRows = rows.filter((row) => row.work_type === 'Plumbing');
  const description = 'NYC plumbing permits page for buyers screening selected public DOB plumbing activity by ZIP, issued date, status, cost bucket, and source link.';
  const range = sampleRange(plumbingRows.length ? plumbingRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(plumbingRows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(plumbingRows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(plumbingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('plumbing-permits'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does the current issue include plumbing permits?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. The current paid issue includes ${plumbingRows.length} selected plumbing permit rows from the public DOB source file.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Who should review the plumbing slice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Plumbing suppliers, plumbing contractors, local service firms, and construction researchers can use it to build a short manual source-check list.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this include private contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes private contact data, owner names, applicant names, phone numbers, email addresses, and full street addresses.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC Plumbing Permits | Current DOB Activity</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-plumbing-permits.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Plumbing Permits | Current DOB Activity">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-plumbing-permits.html">
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
      <h1>NYC plumbing permits in the current issue.</h1>
      <p class="lede">Use the public preview to check field fit, then buy the ZIP if the current plumbing slice saves enough weekly sorting time.</p>

      <section class="grid">
        <div class="card">
          <h2>Plumbing rows</h2>
          <p>${escapeHtml(plumbingRows.length)} selected rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Review fields</h2>
          <p>ZIP, borough, issued date, status, cost bucket, permit identifiers, short description, and source link.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current plumbing facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest plumbing row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Plumbing rows: ${escapeHtml(plumbingRows.length)}.</li>
          <li>Top ZIPs for plumbing rows: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Who this page is for</h2>
        <ul>
          <li>Plumbing suppliers checking selected public permit activity.</li>
          <li>Plumbing contractors and service firms sorting by ZIP and issued date.</li>
          <li>Construction researchers building a short manual source-check list.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Use this order</h2>
        <ol>
          <li>Open the free preview and confirm the CSV fields match your review process.</li>
          <li>Check the plumbing count, ZIP mix, borough mix, and issued-date range.</li>
          <li>Buy the ZIP if the full current issue saves enough weekly sorting time.</li>
          <li>Open source links before outreach, quoting, routing, underwriting, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, or filing advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/topics/nyc-plumbing-permit-activity.html">Plumbing topic page</a>
        <a class="button secondary" href="/topics/plumbing-contractor-permit-research-nyc.html">Contractor research page</a>
        <a class="button secondary" href="/nyc-construction-permit-leads.html">Permit leads alternative</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('plumbing-permits')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Plumbing',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function sprinklerPermitsHtml(rows) {
  const sprinklerRows = rows.filter((row) => row.work_type === 'Sprinklers');
  const description = 'NYC sprinkler permits page for buyers screening selected public DOB sprinkler activity by ZIP, issued date, status, cost bucket, and source link.';
  const range = sampleRange(sprinklerRows.length ? sprinklerRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(sprinklerRows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(sprinklerRows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(sprinklerRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('sprinkler-permits'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does the current issue include sprinkler permits?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. The current paid issue includes ${sprinklerRows.length} selected sprinkler permit rows from the public DOB source file.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Who should review the sprinkler slice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sprinkler contractors, fire-protection suppliers, inspection-adjacent service providers, and construction researchers can use it to build a short manual source-check list.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this include private contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes private contact data, owner names, applicant names, phone numbers, email addresses, and full street addresses.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC Sprinkler Permits | Current DOB Activity</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-sprinkler-permits.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Sprinkler Permits | Current DOB Activity">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-sprinkler-permits.html">
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
      <h1>NYC sprinkler permits in the current issue.</h1>
      <p class="lede">Use the public preview to check field fit, then buy the ZIP if the current sprinkler slice saves enough weekly sorting time.</p>

      <section class="grid">
        <div class="card">
          <h2>Sprinkler rows</h2>
          <p>${escapeHtml(sprinklerRows.length)} selected rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Review fields</h2>
          <p>ZIP, borough, issued date, status, cost bucket, permit identifiers, short description, and source link.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current sprinkler facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest sprinkler row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Sprinkler rows: ${escapeHtml(sprinklerRows.length)}.</li>
          <li>Top ZIPs for sprinkler rows: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Who this page is for</h2>
        <ul>
          <li>Sprinkler contractors checking selected public permit activity.</li>
          <li>Fire-protection suppliers and service firms sorting by ZIP and issued date.</li>
          <li>Construction researchers building a short manual source-check list.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Use this order</h2>
        <ol>
          <li>Open the free preview and confirm the CSV fields match your review process.</li>
          <li>Check the sprinkler count, ZIP mix, borough mix, and issued-date range.</li>
          <li>Buy the ZIP if the full current issue saves enough weekly sorting time.</li>
          <li>Open source links before outreach, quoting, routing, underwriting, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, or filing advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/topics/nyc-sprinkler-permit-activity.html">Sprinkler topic page</a>
        <a class="button secondary" href="/topics/sprinkler-contractor-permit-research-nyc.html">Contractor research page</a>
        <a class="button secondary" href="/nyc-construction-permit-leads.html">Permit leads alternative</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('sprinkler-permits')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Sprinklers',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function workTypePermitsHtml(rows, config) {
  const matchingRows = rows.filter((row) => row.work_type === config.workType);
  const lowerLabel = config.rowLabel.toLowerCase();
  const description = config.description;
  const range = sampleRange(matchingRows.length ? matchingRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(matchingRows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(matchingRows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref(config.checkoutSource));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Does the current issue include ${lowerLabel} permits?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. The current paid issue includes ${matchingRows.length} selected ${lowerLabel} permit rows from the public DOB source file.`,
        },
      },
      {
        '@type': 'Question',
        name: `Who should review the ${lowerLabel} slice?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${config.audience[0].replace(/\.$/, '')}, local suppliers, and construction researchers can use it to build a short manual source-check list.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Does this include private contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes private contact data, owner names, applicant names, phone numbers, email addresses, and full street addresses.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(config.title)}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/${config.pageSlug}.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(config.ogTitle)}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/${config.pageSlug}.html">
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
      <h1>${escapeHtml(config.headline)}</h1>
      <p class="lede">Use the public preview to check field fit, then buy the ZIP if the current ${escapeHtml(lowerLabel)} slice saves enough weekly sorting time.</p>

      <section class="grid">
        <div class="card">
          <h2>${escapeHtml(config.rowLabel)} rows</h2>
          <p>${escapeHtml(matchingRows.length)} selected rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Review fields</h2>
          <p>ZIP, borough, issued date, status, cost bucket, permit identifiers, short description, and source link.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current ${escapeHtml(lowerLabel)} facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest ${escapeHtml(lowerLabel)} row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>${escapeHtml(config.rowLabel)} rows: ${escapeHtml(matchingRows.length)}.</li>
          <li>Top ZIPs for ${escapeHtml(lowerLabel)} rows: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Who this page is for</h2>
        <ul>
${config.audience.map((item) => `          <li>${escapeHtml(item)}</li>`).join('\n')}
        </ul>
      </section>

      <section class="section card">
        <h2>Use this order</h2>
        <ol>
          <li>Open the free preview and confirm the CSV fields match your review process.</li>
          <li>Check the ${escapeHtml(lowerLabel)} count, ZIP mix, borough mix, and issued-date range.</li>
          <li>Buy the ZIP if the full current issue saves enough weekly sorting time.</li>
          <li>Open source links before outreach, quoting, routing, underwriting, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, or filing advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="${escapeHtml(config.topicHref)}">${escapeHtml(config.topicText)}</a>
        <a class="button secondary" href="${escapeHtml(config.contractorHref)}">Contractor research page</a>
        <a class="button secondary" href="/nyc-construction-permit-leads.html">Permit leads alternative</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref(config.checkoutSource)}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: config.workType,
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function freeVsPaidHtml(rows) {
  const description = 'Compare the free NYC construction activity preview with the paid ZIP, including row counts, files, field coverage, source limits, and checkout path.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const product = productJsonLd(description, checkoutHref('free-vs-paid'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is free before checkout?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The free preview includes 25 public rows, the CSV field structure, a sample Markdown brief, segment pages, methodology, and the current issue summary.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid ZIP add?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The paid ZIP adds the full ${rows.length}-row current issue CSV, Markdown brief, buyer workbook, priority-slices CSV, source registry, QA report, version file, buyer README, and claims boundary.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Should I use the free preview first?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Check the free preview first if you need to confirm field names, source limits, row shape, or whether the current work-type and ZIP mix fits your use case.',
        },
      },
    ],
  };

  const rowsHtml = [
    ['Rows', '25 sample rows', `${rows.length} source-linked rows`],
    ['CSV fields', 'Same public-facing field structure', 'Same fields across the full current issue'],
    ['Source links', 'Visible on sample rows', 'Visible across all paid rows'],
    ['Buyer workbook', 'Not included', 'Included as `buyer-workbook.md`'],
    ['Priority slices', 'Segment pages only', 'Included as `buyer-priority-slices.csv`'],
    ['QA and registry', 'Methodology page and public sample notes', 'QA report, source registry, version file, and buyer README'],
    ['Delivery', 'Browser pages and sample downloads', 'Instant ZIP after completed Stripe checkout'],
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Free Preview vs Paid ZIP | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/free-vs-paid.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Free Preview vs Paid ZIP | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/free-vs-paid.html">
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
      <h1>Free preview and paid ZIP comparison.</h1>
      <p class="lede">Check what you can inspect before checkout and what the $9.50 paid ZIP adds for the current issue.</p>

      <section class="grid">
        <div class="card">
          <h2>Free preview</h2>
          <p>25 rows, sample brief, field guide, segment pages, methodology, and source boundary.</p>
        </div>
        <div class="card">
          <h2>Paid ZIP</h2>
          <p>${escapeHtml(rows.length)} rows plus buyer workbook, priority slices, QA report, source registry, and package notes.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time ZIP download after paid Stripe checkout.</p>
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
        <h2>Comparison</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Free preview</th>
                <th>Paid ZIP</th>
              </tr>
            </thead>
            <tbody>
${rowsHtml.map(([item, freeValue, paidValue]) => `              <tr>
                <td>${escapeHtml(item)}</td>
                <td>${escapeHtml(freeValue)}</td>
                <td>${escapeHtml(paidValue)}</td>
              </tr>`).join('\n')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section card">
        <h2>When the paid ZIP is worth it</h2>
        <p>The current launch price is $9.50. At $75/hour, break-even is about 8 minutes of avoided manual sorting.</p>
        <p>Buy if you need the full ${escapeHtml(rows.length)}-row issue, buyer workbook, and priority-slices CSV now. Use the free preview first if you only need field names, row shape, or source boundary.</p>
        <a class="button secondary" href="/time-saved-calculator.html">Check break-even time</a>
        <a class="button" href="${checkoutHref('free-vs-paid-break-even')}">Buy instant ZIP</a>
      </section>

      <section class="section card">
        <h2>Use this order</h2>
        <ol>
          <li>Open the free CSV preview and confirm the row shape.</li>
          <li>Read the CSV field guide if a column name is unclear.</li>
          <li>Use the segment hub to check your ZIP, borough, work type, or cost bucket.</li>
          <li>Use the paid ZIP only if the full current issue saves enough sorting time.</li>
        </ol>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('free-vs-paid')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
    workType: 'Selected DOB work types',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function researchWorkflowHtml(rows) {
  const description = 'A practical workflow for using the NYC construction activity preview, paid ZIP, buyer workbook, priority slices, and source links for weekly permit research.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const product = productJsonLd(description, checkoutHref('permit-research-workflow'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How should I use the free preview?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the free preview to check field names, sample row shape, work-type mix, ZIP coverage, and source limits before buying the full ZIP.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should I do after buying the ZIP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Open the buyer workbook, pick a priority slice, filter the full CSV, and verify each useful row at its public source URL before acting on it.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can this workflow replace source checks?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The workflow is for faster sorting. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Permit Research Workflow | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/permit-research-workflow.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Permit Research Workflow | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/permit-research-workflow.html">
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
      <h1>Weekly permit research workflow for the current issue.</h1>
      <p class="lede">Use this order to inspect the free preview, decide whether the paid ZIP is worth buying, and review source-linked rows after checkout.</p>

      <section class="grid">
        <div class="card">
          <h2>Preview pass</h2>
          <p>Check 25 rows, field names, work types, ZIPs, source links, and source caveats before paying.</p>
        </div>
        <div class="card">
          <h2>Paid pass</h2>
          <p>Use the ${escapeHtml(rows.length)}-row CSV, buyer workbook, and priority slices for a faster weekly review.</p>
        </div>
        <div class="card">
          <h2>Source pass</h2>
          <p>Open source links before outreach, quoting, routing, publishing, or planning.</p>
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
        <h2>Fifteen-minute workflow</h2>
        <ol>
          <li>Open the public preview and check whether the row shape fits your weekly screen.</li>
          <li>Use the CSV field guide to confirm what each column means.</li>
          <li>Browse segment pages for your ZIP, borough, work type, issued date, or cost bucket.</li>
          <li>Use the free versus paid comparison to decide whether the full ZIP is worth the $9.50 launch price.</li>
          <li>After checkout, open <code>buyer-workbook.md</code> and pick the first slice to review.</li>
          <li>Filter the full CSV by that slice, then open <code>source_url</code> for any row you may act on.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Good use cases</h2>
        <ul>
          <li>Weekly sorting by work type, ZIP, borough, permit status, issued date, and cost bucket.</li>
          <li>Finding rows worth manual source checks.</li>
          <li>Preparing a short internal review list for a sales, supplier, broker, or research workflow.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('permit-research-workflow')}">Buy instant ZIP</a>
      </section>
${sampleRequestSection({
    workType: 'Selected DOB work types',
    territory: 'NYC',
  })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function contractorSupplierHtml(rows) {
  const description = 'A buyer-focused guide for contractors, subcontractors, suppliers, and local service firms using the NYC construction activity ZIP for weekly permit research.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('contractor-supplier-permit-research'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who is this page for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It is for contractors, subcontractors, suppliers, and local B2B service firms that screen public NYC DOB permit activity before doing manual source checks.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP include sales contacts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes private contact data, owner names, applicant names, phone numbers, email addresses, and full street addresses.',
        },
      },
      {
        '@type': 'Question',
        name: 'How should a vendor use it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Start with the free preview, check work types and ZIPs, buy the ZIP only if the full file saves sorting time, then verify useful rows at the source URL.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Contractor and Supplier Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/contractor-supplier-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Contractor and Supplier Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/contractor-supplier-permit-research.html">
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
      <h1>NYC permit research for contractors and suppliers.</h1>
      <p class="lede">Use the current issue to screen selected public DOB NOW permit rows by work type, ZIP, issued date, status, cost bucket, and source link before doing manual source checks.</p>

      <section class="grid">
        <div class="card">
          <h2>Contractors</h2>
          <p>Check selected work-type activity before opening individual DOB NOW records.</p>
        </div>
        <div class="card">
          <h2>Suppliers</h2>
          <p>Sort current rows by ZIP, work type, cost bucket, and source link for a faster weekly screen.</p>
        </div>
        <div class="card">
          <h2>Local service firms</h2>
          <p>Use the buyer workbook and priority slices to decide which rows deserve manual review first.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Vendor review path</h2>
        <ol>
          <li>Open the public preview and confirm the file has useful fields for your weekly screen.</li>
          <li>Check the buyer-intent pages for your work type, ZIP, or supplier category.</li>
          <li>Use the free versus paid comparison and time-saved calculator before checkout.</li>
          <li>After buying, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before acting on a row, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful buyer pages</h2>
        <ul>
          <li><a href="/topics/nyc-construction-supplier-permit-research.html">NYC construction supplier permit research</a></li>
          <li><a href="/topics/nyc-plumbing-supplier-permit-research.html">NYC plumbing supplier permit research</a></li>
          <li><a href="/topics/nyc-hvac-mechanical-permit-research.html">NYC HVAC mechanical permit research</a></li>
          <li><a href="/topics/nyc-fire-protection-permit-research.html">NYC fire protection permit research</a></li>
          <li><a href="/topics/nyc-sidewalk-shed-vendor-permit-research.html">NYC sidewalk shed vendor permit research</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Selected DOB work types',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/sample-segments.html">Browse buyer-intent pages</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('contractor-supplier-permit-research')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function brokerDeveloperHtml(rows) {
  const description = 'A buyer-focused guide for brokers, small developers, consultants, and permit researchers using the NYC construction activity ZIP for weekly market screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const product = productJsonLd(description, checkoutHref('broker-developer-permit-research'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who is this page for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It is for brokers, small developers, consultants, and permit researchers who need a faster weekly screen of selected public NYC DOB permit rows.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can this replace source research?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Use it to narrow a review list, then verify rows at the public source URL before making decisions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP include private contacts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Broker and Developer Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/broker-developer-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Broker and Developer Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/broker-developer-permit-research.html">
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
      <h1>NYC permit research for brokers and small developers.</h1>
      <p class="lede">Use the current issue to screen selected DOB NOW permit rows by borough, ZIP, work type, issued date, status, cost bucket, and source link before deeper market research.</p>

      <section class="grid">
        <div class="card">
          <h2>Brokers</h2>
          <p>Scan recent permit activity before neighborhood checks, owner research, or client prep.</p>
        </div>
        <div class="card">
          <h2>Small developers</h2>
          <p>Review work-type and ZIP clusters before deciding which source records deserve a closer look.</p>
        </div>
        <div class="card">
          <h2>Consultants</h2>
          <p>Use the buyer workbook to prepare a short research list without sorting the raw source export first.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Research pass</h2>
        <ol>
          <li>Open the free preview and confirm the row fields fit your weekly screen.</li>
          <li>Use the current issue page to check the borough, ZIP, work-type, and cost-bucket mix.</li>
          <li>Buy the ZIP only if the full file saves enough sorting time for this week's review.</li>
          <li>After checkout, use <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code> to pick rows for manual checks.</li>
          <li>Before using any row in a recommendation, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful research pages</h2>
        <ul>
          <li><a href="/topics/nyc-commercial-renovation-permits.html">NYC commercial renovation permits</a></li>
          <li><a href="/topics/nyc-contractor-market-research.html">NYC contractor market research</a></li>
          <li><a href="/topics/nyc-dob-permit-monitoring.html">NYC DOB permit monitoring</a></li>
          <li><a href="/topics/nyc-permit-activity-by-zip.html">NYC permit activity by ZIP</a></li>
          <li><a href="/topics/nyc-renovation-permit-leads.html">NYC renovation permit research</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Selected DOB work types',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, valuation advice, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/current-issue.html">Current issue highlights</a>
        <a class="button secondary" href="/sample-segments.html">Browse buyer-intent pages</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('broker-developer-permit-research')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function permitExpediterHtml(rows) {
  const description = 'A buyer-focused guide for permit expediters, filing consultants, and construction researchers using the NYC construction activity ZIP for weekly filing review.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const product = productJsonLd(description, checkoutHref('permit-expediter-research'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who is this page for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It is for permit expediters, filing consultants, and construction researchers who review selected public NYC DOB permit activity by work type, ZIP, issued date, status, and source link.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this include filing advice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a public-record screening file. It does not include filing advice, legal advice, or agency endorsement.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should an expediter verify?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the CSV to narrow a review list, then open the source URL for any row that may affect research, client prep, or filing work.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Permit Expediter Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/permit-expediter-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Permit Expediter Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/permit-expediter-research.html">
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
      <h1>NYC permit research for expediters and filing consultants.</h1>
      <p class="lede">Use the current issue to screen selected DOB NOW permit rows by work type, ZIP, issued date, permit status, cost bucket, and source link before opening individual records.</p>

      <section class="grid">
        <div class="card">
          <h2>Expediters</h2>
          <p>Check recent filing activity slices before opening source records one by one.</p>
        </div>
        <div class="card">
          <h2>Filing consultants</h2>
          <p>Sort by work type, ZIP, status, issued date, and source link for a faster weekly review.</p>
        </div>
        <div class="card">
          <h2>Research teams</h2>
          <p>Use the buyer workbook and priority slices to prepare a short source-check list.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</li>
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Expediter review pass</h2>
        <ol>
          <li>Open the public preview and confirm the current issue covers useful work types or ZIPs.</li>
          <li>Check the CSV field guide before relying on a column in your review notes.</li>
          <li>Use the free versus paid comparison and time-saved calculator before checkout.</li>
          <li>After buying, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before acting on any row, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful filing research pages</h2>
        <ul>
          <li><a href="/topics/nyc-dob-now-public-records.html">NYC DOB NOW public records</a></li>
          <li><a href="/topics/nyc-dob-permit-monitoring.html">NYC DOB permit monitoring</a></li>
          <li><a href="/topics/nyc-dob-approved-permits-open-data.html">NYC DOB approved permits open data</a></li>
          <li><a href="/topics/nyc-dob-permit-csv.html">NYC DOB permit CSV</a></li>
          <li><a href="/topics/nyc-permit-activity-by-zip.html">NYC permit activity by ZIP</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'DOB permit filing research',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No filing advice, legal advice, agency endorsement, owner names, applicant names, phone numbers, email addresses, full street addresses, or enriched contact data are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/current-issue.html">Current issue highlights</a>
        <a class="button secondary" href="/sample-segments.html">Browse buyer-intent pages</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/broker-developer-permit-research.html">Broker and developer guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('permit-expediter-research')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function currentIssueHtml(rows) {
  const description = 'Current NYC Weekly Construction Activity Brief issue with source window, top work types, top ZIPs, free preview links, and instant ZIP checkout.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('current-issue-page'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is in the current issue?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The current paid issue has ${rows.length} selected source-linked NYC DOB permit rows plus buyer workbook, priority-slices CSV, QA report, source registry, buyer README, version file, and claims boundary.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Can I inspect the issue before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The public preview includes 25 rows, a sample Markdown brief, generated segment pages, and the file manifest.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the current issue include private contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Current Issue | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/current-issue.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Current Issue | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/current-issue.html">
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
      <h1>Current NYC construction activity brief.</h1>
      <p class="lede">The current issue packages ${escapeHtml(rows.length)} selected NYC DOB NOW permit rows for a fast weekly spreadsheet review.</p>

      <section class="grid">
        <div class="card">
          <h2>Source window</h2>
          <p>${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}. Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</p>
        </div>
        <div class="card">
          <h2>Rows</h2>
          <p>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</p>
        </div>
        <div class="card">
          <h2>Price</h2>
          <p>$9.50 one-time launch price. Instant browser download after completed Stripe checkout.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current issue snapshot</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>What buyers get</h2>
        <ul>
          <li>Full ${escapeHtml(rows.length)}-row source-linked CSV.</li>
          <li>Buyer workbook for a fast review pass.</li>
          <li>Priority-slices CSV grouped by work type, borough, ZIP, count, latest issued date, cost-bucket mix, status mix, and source URL.</li>
          <li>Markdown brief, source registry, QA report, version file, buyer README, and privacy/claims boundary.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Check before buying</h2>
        <p>Use the free preview, segment pages, buyer-fit page, and file manifest before checkout. Buy only if the current issue saves enough sorting time for your use case.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('current-issue-page')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
    workType: 'Selected DOB work types',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function timeSavedCalculatorHtml(rows) {
  const description = 'A simple time-saved calculator for deciding whether the NYC Weekly Construction Activity Brief current issue ZIP is worth the launch price.';
  const product = productJsonLd(description, checkoutHref('time-saved-calculator'));
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does the calculator measure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It compares the one-time $9.50 launch price with an estimated hourly value of manual research time. It is a time-saved check only.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this estimate sales or lead value?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It does not estimate sales, leads, conversion, project value, or revenue. It only compares price against manual sorting time.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should I inspect before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Check the free preview, current issue page, buyer fit page, and ZIP manifest before opening Stripe checkout.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Time Saved Calculator | NYC Construction Activity ZIP</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/time-saved-calculator.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Time Saved Calculator | NYC Construction Activity ZIP">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/time-saved-calculator.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Time saved calculator for the current issue ZIP.</h1>
      <p class="lede">Use this arithmetic check before checkout. It compares the $9.50 launch price with the manual sorting time you expect the prepared files to save.</p>

      <section class="grid">
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One current-issue ZIP. No subscription. No promo code required.</p>
        </div>
        <div class="card">
          <h2>Current issue</h2>
          <p>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</p>
        </div>
        <div class="card">
          <h2>Files that save sorting</h2>
          <p>Buyer workbook, priority-slices CSV, source-linked full CSV, and QA/source notes.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Calculate break-even time</h2>
        <div class="grid">
          <label>
            Hourly value of your research time
            <input id="hourly-rate" type="number" min="1" step="1" value="75">
          </label>
          <label>
            Minutes you expect to save
            <input id="minutes-saved" type="number" min="0" step="5" value="20">
          </label>
          <div class="card">
            <h3>Result</h3>
            <p id="calculator-result" class="price">$25.00 value</p>
            <p id="calculator-detail">At $75/hour, 20 minutes is about $25.00 of time.</p>
          </div>
        </div>
        <p class="fine">This is a time-saved estimate only. It is not a lead, sales, project-value, or revenue estimate.</p>
      </section>

      <section class="section card">
        <h2>Common break-even examples</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hourly value</th>
                <th>Minutes to cover $9.50</th>
                <th>What to check first</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$50/hour</td>
                <td>About 12 minutes</td>
                <td>Free preview fields and segment pages</td>
              </tr>
              <tr>
                <td>$75/hour</td>
                <td>About 8 minutes</td>
                <td>Buyer workbook and priority-slices file</td>
              </tr>
              <tr>
                <td>$100/hour</td>
                <td>About 6 minutes</td>
                <td>Top ZIP and work-type mix for the current issue</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section card">
        <h2>Check the issue before buying</h2>
        <p>Open the public preview and current issue page before checkout. Buy only if the prepared CSV and buyer files save enough manual sorting time for your workflow.</p>
        <a class="button secondary" href="/current-issue.html">Current issue highlights</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('time-saved-calculator')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    <script>
      const price = 9.5;
      const rate = document.getElementById('hourly-rate');
      const minutes = document.getElementById('minutes-saved');
      const result = document.getElementById('calculator-result');
      const detail = document.getElementById('calculator-detail');
      function money(value) {
        return '$' + value.toFixed(2);
      }
      function updateCalculator() {
        const hourly = Math.max(1, Number(rate.value) || 1);
        const saved = Math.max(0, Number(minutes.value) || 0);
        const value = hourly * (saved / 60);
        const breakEven = Math.ceil((price / hourly) * 60);
        result.textContent = money(value) + ' value';
        detail.textContent = 'At ' + money(hourly) + '/hour, ' + saved + ' minutes is about ' + money(value) + ' of time. Break-even is about ' + breakEven + ' minutes.';
      }
      rate.addEventListener('input', updateCalculator);
      minutes.addEventListener('input', updateCalculator);
      updateCalculator();
    </script>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function whoShouldBuyHtml(rows) {
  const description = 'A buyer fit checklist for the NYC Weekly Construction Activity Brief current issue ZIP, including good-fit buyers, poor-fit use cases, and a pre-purchase review path.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const product = productJsonLd(description, checkoutHref('who-should-buy'));
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who is the current issue for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It fits buyers who want a weekly spreadsheet screen of selected NYC DOB permit activity by work type, borough, ZIP, issued date, status, cost bucket, and source link.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who should not buy it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Skip it if you need private contacts, owner names, a live alert feed, a full DOB database, an API, CRM sync, or guaranteed leads.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should I check before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Open the free preview, check the segment hub for your ZIP or work type, review the file manifest, and compare the price with the time you expect to save.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Who Should Buy | NYC Construction Activity ZIP</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/who-should-buy.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Who Should Buy | NYC Construction Activity ZIP">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/who-should-buy.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Who should buy the current NYC construction activity ZIP.</h1>
      <p class="lede">Use this fit checklist before checkout. The product is a compact public-record screening file, not a contact list or live alert service.</p>

      <section class="grid">
        <div class="card">
          <h2>Good fit</h2>
          <p>Construction-support vendors, specialty subcontractors, suppliers, brokers, researchers, and local service firms that want a weekly spreadsheet screen.</p>
        </div>
        <div class="card">
          <h2>Current issue</h2>
          <p>${escapeHtml(rows.length)} paid rows for ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}. Free preview rows: 25.</p>
        </div>
        <div class="card">
          <h2>Price</h2>
          <p>One current-issue ZIP for $9.50. No subscription and no promo code required.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Buy it if these are true</h2>
        <ul>
          <li>You check selected NYC DOB permit activity often enough that a prepared CSV saves sorting time.</li>
          <li>You care about work type, borough, ZIP, issued date, permit status, source link, and cost bucket.</li>
          <li>You can use a spreadsheet-friendly file without private contact data.</li>
          <li>You are comfortable opening DOB NOW source links before making business decisions from any row.</li>
          <li>You want the buyer workbook and priority-slices CSV to decide which work types or ZIPs deserve manual review first.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Do not buy it for these jobs</h2>
        <ul>
          <li>Owner names, applicant names, phone numbers, email addresses, or full street addresses.</li>
          <li>A live alert feed, complete DOB database, API, CRM sync, or custom territory scrape.</li>
          <li>Guaranteed leads, buying intent, agency endorsement, legal advice, or project-value certainty.</li>
          <li>Historical backfills or boroughs, ZIPs, and work types outside the current issue sample.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Current issue fit signals</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Paid package files include the full CSV, buyer workbook, priority-slices CSV, source registry, QA report, buyer README, version file, and claims boundary.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Three-minute pre-purchase check</h2>
        <ol>
          <li>Open the public preview and confirm the fields match your workflow.</li>
          <li>Browse the segment hub for your ZIP, work type, cost bucket, or buyer page.</li>
          <li>Read the file manifest and delivery page if you need to confirm exactly what the ZIP includes.</li>
          <li>Buy only if the $9.50 ZIP saves enough sorting time to be useful for the current issue.</li>
        </ol>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/buyer-guide.html">Read buyer guide</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('who-should-buy')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
    workType: 'Selected DOB work types',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    ${sampleRequestScript()}
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
${alternateDiscoveryLinks()}
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
          <p>Completed checkout redirects to <code>/success.html?session_id={CHECKOUT_SESSION_ID}</code>, where the ZIP download starts automatically.</p>
        </div>
        <div class="card">
          <h2>3. Download ZIP</h2>
          <p><code>/api/download</code> verifies the paid Checkout Session before the automatic or manual download serves the current ZIP file.</p>
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
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('delivery')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
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
          text: 'The current issue launch price is a one-time $9.50 ZIP purchase. The standard price is $49.',
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
${alternateDiscoveryLinks()}
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
          <p class="price">$9.50</p>
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
                <th>Break-even at $9.50</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$50/hour</td>
                <td>About 59 minutes saved</td>
                <td>About 12 minutes saved</td>
              </tr>
              <tr>
                <td>$75/hour</td>
                <td>About 40 minutes saved</td>
                <td>About 8 minutes saved</td>
              </tr>
              <tr>
                <td>$100/hour</td>
                <td>About 30 minutes saved</td>
                <td>About 6 minutes saved</td>
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
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/buyer-guide.html">Read buyer guide</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('pricing')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
    workType: 'Selected DOB work types',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, or enriched contact data are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    ${sampleRequestScript()}
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
${alternateDiscoveryLinks()}
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
          <p class="price">$9.50</p>
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
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('inside-the-zip')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function supportHtml(rows) {
  const description = 'Support, download troubleshooting, and refund boundary for the NYC Weekly Construction Activity Brief current issue ZIP.';
  const range = sampleRange(rows);
  const product = productJsonLd(description, checkoutHref('support'));
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does download support work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The success page uses the Stripe Checkout Session ID to call the download endpoint. The endpoint serves the ZIP only after Stripe confirms a paid completed session for this product.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should I keep if the download fails?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Keep the Stripe receipt email, the success-page URL with the session_id value, the approximate purchase time, and any browser error shown by the download page.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are refunds guaranteed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The product is a digital ZIP. Refund review should be based on duplicate charge, failed paid-session delivery, or a product file problem, not a lead or revenue outcome.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Support and Refunds | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/support.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Support and Refunds | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/support.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Support and refund boundary for the current issue.</h1>
      <p class="lede">The product is a digital ZIP delivered by the browser after Stripe confirms payment. This page explains what to check if the download does not appear.</p>

      <section class="grid">
        <div class="card">
          <h2>Delivery path</h2>
          <p>Stripe redirects completed buyers to <code>/success.html?session_id={CHECKOUT_SESSION_ID}</code>, where the ZIP download starts automatically.</p>
        </div>
        <div class="card">
          <h2>Download gate</h2>
          <p><code>/api/download</code> verifies a paid completed Stripe Checkout Session before serving the ZIP.</p>
        </div>
        <div class="card">
          <h2>Current ZIP</h2>
          <p>${escapeHtml(rows.length)} source-linked rows for the ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(rows[0]?.source_fetch_date || range.latestIssuedDate)} source window.</p>
        </div>
      </section>

      <section class="section card">
        <h2>If download fails</h2>
        <ol>
          <li>Return to the Stripe confirmation page and use the success-page link with <code>session_id</code> in the URL.</li>
          <li>Use the same browser session if the first download attempt was interrupted.</li>
          <li>Keep the Stripe receipt email, success-page URL, approximate purchase time, and any visible error message.</li>
          <li>Do not send card numbers, bank details, passwords, or private account credentials.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Common download responses</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Response</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>missing_or_invalid_session_id</code></td>
                <td>The success page URL is missing the Stripe session ID or the value is malformed.</td>
              </tr>
              <tr>
                <td><code>payment_required</code></td>
                <td>Stripe did not confirm a paid completed Checkout Session for an accepted Payment Link.</td>
              </tr>
              <tr>
                <td><code>session_verification_failed</code></td>
                <td>The server could not verify the Stripe session at that moment.</td>
              </tr>
              <tr>
                <td><code>download_not_configured</code></td>
                <td>The paid ZIP is not configured on the server and should be treated as a delivery issue.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section card">
        <h2>Refund boundary</h2>
        <p>This is a one-time digital ZIP purchase. Refund review should be based on duplicate charge, failed paid-session delivery, or a product file problem. No guaranteed leads. The ZIP does not include private contact data, owner names, applicant names, phone numbers, email addresses, full street addresses, or agency-endorsed information.</p>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('support')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function sampleRequestHtml(rows) {
  const description = 'Request a future NYC construction activity sample cut by work type, ZIP, borough, or buyer use case. Product-specific request only.';
  const range = sampleRange(rows);
  const product = productJsonLd(description, checkoutHref('sample-request-page'));
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What can I request?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can request a future sample cut by work type, ZIP, borough, or buyer use case when the current preview does not match your research need.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this add me to a newsletter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The request is product-specific and is not added to a MagickMe course list, global newsletter, campaign, form, email, or unrelated segment.',
        },
      },
      {
        '@type': 'Question',
        name: 'Will this trigger manual fulfillment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Paid buyers use the automated Stripe success page and download endpoint. Sample requests help choose future public previews.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Request a Sample Cut | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/sample-request.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Request a Sample Cut | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/sample-request.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Request a future sample cut.</h1>
      <p class="lede">Send one product-specific request for a work type, territory, or buyer view that is not covered by the current preview.</p>

      <section class="grid">
        <div class="card">
          <h2>What to request</h2>
          <p>Ask for a sample by DOB work type, ZIP code, borough, or buyer use case.</p>
        </div>
        <div class="card">
          <h2>Where it goes</h2>
          <p>Requests are used only for this product's buyer segment and future preview planning.</p>
        </div>
        <div class="card">
          <h2>Current ZIP</h2>
          <p>${escapeHtml(rows.length)} source-linked rows for ${escapeHtml(range.firstIssuedDate)} through ${escapeHtml(range.latestIssuedDate)}. If that fits, buy the instant ZIP.</p>
        </div>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'NYC',
      })}

      <section class="section card">
        <h2>Before you request</h2>
        <ul>
          <li>Check the free public preview and segment hub first.</li>
          <li>Use the current ZIP if you need the complete source-linked issue now.</li>
          <li>Do not send private account details, card numbers, passwords, or confidential client data.</li>
        </ul>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample-segments.html">Browse sample segments</a>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('sample-request-page')}">Buy instant ZIP</a>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    ${sampleRequestScript()}
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
${alternateDiscoveryLinks()}
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
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button" href="${checkoutHref('preview')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection()}      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, or enriched contact data are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/buyer-guide.html">Read buyer guide</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="/methodology.html">Read methodology</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function sitemapXml(pages) {
  const urls = ['', 'current-issue.html', 'preview.html', 'buy.html', 'pricing.html', 'time-saved-calculator.html', 'who-should-buy.html', 'free-vs-paid.html', 'permit-research-workflow.html', 'contractor-supplier-permit-research.html', 'broker-developer-permit-research.html', 'permit-expediter-research.html', 'inside-the-zip.html', 'csv-field-guide.html', 'nyc-dob-permit-csv.html', 'weekly-nyc-construction-permit-report.html', 'dob-now-permit-search-alternative.html', 'nyc-construction-permit-leads.html', 'nyc-sidewalk-shed-permits.html', 'nyc-plumbing-permits.html', 'nyc-sprinkler-permits.html', 'nyc-mechanical-systems-permits.html', 'nyc-supported-scaffold-permits.html', 'nyc-structural-permits.html', 'nyc-construction-fence-permits.html', 'buyer-guide.html', 'delivery.html', 'support.html', 'sample-request.html', 'sample-segments.html', 'methodology.html', 'feed.xml', 'current-issue.json', 'llms.txt', ...pages.map((page) => `topics/${page.slug}.html`)];
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
        <p><a class="button secondary" href="/current-issue.html">Current issue highlights</a></p>
        <p><a class="button secondary" href="/who-should-buy.html">Who should buy</a></p>
        <p><a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a></p>
        <p><a class="button secondary" href="/free-vs-paid.html">Free vs paid</a></p>
        <p><a class="button secondary" href="/permit-research-workflow.html">Research workflow</a></p>
        <p><a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a></p>
        <p><a class="button secondary" href="/broker-developer-permit-research.html">Broker and developer guide</a></p>
        <p><a class="button secondary" href="/permit-expediter-research.html">Permit expediter guide</a></p>
        <p><a class="button secondary" href="/pricing.html">Check pricing and break-even</a></p>
        <p><a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a></p>
        <p><a class="button secondary" href="/csv-field-guide.html">CSV field guide</a></p>
        <p><a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a></p>
        <p><a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a></p>
        <p><a class="button secondary" href="/dob-now-permit-search-alternative.html">DOB NOW permit search alternative</a></p>
        <p><a class="button secondary" href="/nyc-construction-permit-leads.html">NYC construction permit leads alternative</a></p>
        <p><a class="button secondary" href="/nyc-sidewalk-shed-permits.html">NYC sidewalk shed permits</a></p>
        <p><a class="button secondary" href="/nyc-plumbing-permits.html">NYC plumbing permits</a></p>
        <p><a class="button secondary" href="/nyc-sprinkler-permits.html">NYC sprinkler permits</a></p>
        <p><a class="button secondary" href="/nyc-mechanical-systems-permits.html">NYC mechanical systems permits</a></p>
        <p><a class="button secondary" href="/nyc-supported-scaffold-permits.html">NYC supported scaffold permits</a></p>
        <p><a class="button secondary" href="/nyc-structural-permits.html">NYC structural permits</a></p>
        <p><a class="button secondary" href="/nyc-construction-fence-permits.html">NYC construction fence permits</a></p>
        <p><a class="button secondary" href="/buyer-guide.html">Read buyer guide</a></p>
        <p><a class="button secondary" href="/delivery.html">Read delivery steps</a></p>
        <p><a class="button secondary" href="/support.html">Support and refunds</a></p>
        <p><a class="button secondary" href="/sample-request.html">Request a future sample cut</a></p>
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
fs.writeFileSync(path.join(root, 'csv-field-guide.html'), csvFieldGuideHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-permit-csv.html'), permitCsvHtml(rows));
fs.writeFileSync(path.join(root, 'weekly-nyc-construction-permit-report.html'), weeklyPermitReportHtml(rows));
fs.writeFileSync(path.join(root, 'dob-now-permit-search-alternative.html'), dobNowAlternativeHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-construction-permit-leads.html'), permitLeadsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-sidewalk-shed-permits.html'), sidewalkShedPermitsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-plumbing-permits.html'), plumbingPermitsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-sprinkler-permits.html'), sprinklerPermitsHtml(rows));
for (const page of workTypeLandingPages) {
  fs.writeFileSync(path.join(root, `${page.pageSlug}.html`), workTypePermitsHtml(rows, page));
}
fs.writeFileSync(path.join(root, 'free-vs-paid.html'), freeVsPaidHtml(rows));
fs.writeFileSync(path.join(root, 'permit-research-workflow.html'), researchWorkflowHtml(rows));
fs.writeFileSync(path.join(root, 'contractor-supplier-permit-research.html'), contractorSupplierHtml(rows));
fs.writeFileSync(path.join(root, 'broker-developer-permit-research.html'), brokerDeveloperHtml(rows));
fs.writeFileSync(path.join(root, 'permit-expediter-research.html'), permitExpediterHtml(rows));
fs.writeFileSync(path.join(root, 'current-issue.html'), currentIssueHtml(rows));
fs.writeFileSync(path.join(root, 'time-saved-calculator.html'), timeSavedCalculatorHtml(rows));
fs.writeFileSync(path.join(root, 'who-should-buy.html'), whoShouldBuyHtml(rows));
fs.writeFileSync(path.join(root, 'delivery.html'), deliveryHtml(rows));
fs.writeFileSync(path.join(root, 'pricing.html'), pricingHtml(rows));
fs.writeFileSync(path.join(root, 'inside-the-zip.html'), insideZipHtml(rows));
fs.writeFileSync(path.join(root, 'support.html'), supportHtml(rows));
fs.writeFileSync(path.join(root, 'sample-request.html'), sampleRequestHtml(rows));
fs.writeFileSync(path.join(root, 'preview.html'), previewHtml(rows));
fs.writeFileSync(path.join(root, 'checkout.html'), checkoutHtml(rows));
fs.writeFileSync(path.join(root, 'buy.html'), buyHtml(rows));
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
applyCoreConversionBars();

console.log(`generated ${pages.length} SEO pages from ${rows.length} source rows`);
