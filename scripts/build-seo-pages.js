const fs = require('node:fs');
const path = require('node:path');
const { siteBaseUrl } = require('../site-config');

const root = path.resolve(__dirname, '..');
const baseUrl = siteBaseUrl();
const socialImageUrl = `${baseUrl}/assets/current-issue-snapshot.png`;
const stripeCheckoutUrl = 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q';
const checkoutUrl = `${baseUrl}/checkout.html`;
const sampleCsvUrl = `${baseUrl}/sample/nyc-construction-activity-preview.csv`;
const sampleJsonUrl = `${baseUrl}/sample/nyc-construction-activity-preview.json`;
const sampleJsonlUrl = `${baseUrl}/sample/nyc-construction-activity-preview.jsonl`;
const sampleBriefUrl = `${baseUrl}/sample/nyc-weekly-construction-activity-sample.md`;
const fullIssueCsvPath = path.join(root, '..', 'package', 'nyc-construction-activity-preview.csv');
const publicPreviewCsvPath = path.join(root, 'sample', 'nyc-construction-activity-preview.csv');
const sampleCsvPath = fs.existsSync(fullIssueCsvPath)
  ? fullIssueCsvPath
  : publicPreviewCsvPath;
const manualPages = require('./seo-pages.json').map((page) => ({ ...page, group: 'core' }));
const boroughExpansionPages = [
  {
    boroughName: 'Queens',
    pageSlug: 'queens-construction-permit-activity',
    requestSource: 'queens-permit-activity-request',
    zipExamples: '11101, 11375, 11432, or another Queens ZIP',
  },
  {
    boroughName: 'Bronx',
    pageSlug: 'bronx-construction-permit-activity',
    requestSource: 'bronx-permit-activity-request',
    zipExamples: '10451, 10458, 10467, or another Bronx ZIP',
  },
  {
    boroughName: 'Staten Island',
    pageSlug: 'staten-island-construction-permit-activity',
    requestSource: 'staten-island-permit-activity-request',
    zipExamples: '10301, 10306, 10314, or another Staten Island ZIP',
  },
];

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

function updateGeneratedPageMetadata(pages) {
  const topicUrls = pages.map((page) => `${baseUrl}/topics/${page.slug}.html`);
  const currentIssuePath = path.join(root, 'current-issue.json');
  const dataPackagePath = path.join(root, 'data-package.json');

  if (fs.existsSync(currentIssuePath)) {
    const currentIssue = JSON.parse(fs.readFileSync(currentIssuePath, 'utf8'));
    currentIssue.generatedPages = currentIssue.generatedPages || {};
    currentIssue.generatedPages.totalTopicPages = pages.length;
    currentIssue.generatedPages.urls = topicUrls;
    writeJson('current-issue.json', currentIssue);
  }

  if (fs.existsSync(dataPackagePath)) {
    const dataPackage = JSON.parse(fs.readFileSync(dataPackagePath, 'utf8'));
    dataPackage.generated_topic_pages = dataPackage.generated_topic_pages || {};
    dataPackage.generated_topic_pages.count = pages.length;
    dataPackage.generated_topic_pages.segment_hub_url = `${baseUrl}/sample-segments.html`;
    dataPackage.generated_topic_pages.all_urls = topicUrls;
    writeJson('data-package.json', dataPackage);
  }
}

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

const boroughLandingPages = [
  {
    borough: 'MANHATTAN',
    boroughName: 'Manhattan',
    pageSlug: 'manhattan-construction-permit-activity',
    checkoutSource: 'manhattan-permit-activity',
    title: 'Manhattan Construction Permit Activity | Current DOB Brief',
    ogTitle: 'Manhattan Construction Permit Activity | Current DOB Brief',
    description:
      'Manhattan construction permit activity page for buyers screening selected public DOB rows by ZIP, work type, issued date, status, cost bucket, and source link.',
    headline: 'Manhattan construction permit activity in the current issue.',
    audience: [
      'Brokers, developers, and permit researchers checking selected Manhattan DOB activity.',
      'Contractors and suppliers sorting current Manhattan rows by work type and ZIP.',
      'Local service teams building a short manual source-check list before deeper review.',
    ],
    topicHref: '/topics/manhattan-construction-permit-activity.html',
    topicText: 'Manhattan topic page',
  },
  {
    borough: 'BROOKLYN',
    boroughName: 'Brooklyn',
    pageSlug: 'brooklyn-construction-permit-activity',
    checkoutSource: 'brooklyn-permit-activity',
    title: 'Brooklyn Construction Permit Activity | Current DOB Brief',
    ogTitle: 'Brooklyn Construction Permit Activity | Current DOB Brief',
    description:
      'Brooklyn construction permit activity page for buyers screening selected public DOB rows by ZIP, work type, issued date, status, cost bucket, and source link.',
    headline: 'Brooklyn construction permit activity in the current issue.',
    audience: [
      'Brokers, developers, and permit researchers checking selected Brooklyn DOB activity.',
      'Contractors and suppliers sorting current Brooklyn rows by work type and ZIP.',
      'Local service teams building a short manual source-check list before deeper review.',
    ],
    topicHref: '/topics/brooklyn-construction-permit-activity.html',
    topicText: 'Brooklyn topic page',
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
  return `${baseUrl}/buy.html?source=${encodeURIComponent(source)}`;
}

function checkoutBridgeHref(source = 'site') {
  return `${checkoutUrl}?source=${encodeURIComponent(source)}`;
}

function topicCheckoutSource(page) {
  return `topic-${page.slug}`.slice(0, 80);
}

function conversionBar(source) {
  const buyHref = checkoutBridgeHref(source);
  return `    <aside class="conversion-bar" data-conversion-bar>
      <p><strong>$9.50</strong> current issue ZIP. Instant Stripe checkout and browser download.</p>
      <div class="conversion-actions">
        <a class="button secondary" href="#sample-request">Sample request</a>
        <a class="button" href="${buyHref}">Buy ZIP</a>
      </div>
    </aside>
`;
}

function boroughRequestConversionBar(config) {
  return `    <aside class="conversion-bar" data-conversion-bar>
      <p>Current issue: selected Manhattan and Brooklyn rows only. Request a future ${escapeHtml(config.boroughName)} sample if that is your territory.</p>
      <div class="conversion-actions">
        <a class="button" href="#sample-request">Request ${escapeHtml(config.boroughName)} sample</a>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
      </div>
    </aside>
`;
}

function topPurchaseCta(source) {
  return `      <p>
        <a class="button" href="${checkoutBridgeHref(source)}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
      </p>
      <p class="fine">Stripe checkout opens after your click. Use the CSV preview first if you need to confirm the row shape.</p>

`;
}

const coreConversionPages = [
  ['', 'home-sticky'],
  ['preview.html', 'preview-sticky'],
  ['current-issue.html', 'current-issue-sticky'],
  ['pricing.html', 'pricing-sticky'],
  ['inside-the-zip.html', 'inside-the-zip-sticky'],
  ['faq.html', 'faq-sticky'],
  ['free-vs-paid.html', 'free-vs-paid-sticky'],
  ['buyer-guide.html', 'buyer-guide-sticky'],
  ['csv-field-guide.html', 'csv-field-guide-sticky'],
  ['delivery.html', 'delivery-sticky'],
  ['support.html', 'support-sticky'],
  ['sample-request.html', 'sample-request-sticky'],
  ['nyc-dob-permit-data-download.html', 'nyc-dob-permit-data-download-sticky'],
  ['nyc-building-permit-data.html', 'building-permit-data-sticky'],
  ['nyc-dob-permit-csv.html', 'nyc-dob-permit-csv-sticky'],
  ['nyc-dob-now-approved-permits.html', 'nyc-dob-now-approved-permits-sticky'],
  ['dob-now-build-approved-permits.html', 'dob-now-build-approved-permits-sticky'],
  ['nyc-dob-permit-alerts.html', 'nyc-dob-permit-alerts-sticky'],
  ['nyc-dob-permit-tracker.html', 'nyc-dob-permit-tracker-sticky'],
  ['nyc-dob-permit-monitoring.html', 'nyc-dob-permit-monitoring-sticky'],
  ['nyc-dob-permit-watchlist.html', 'nyc-dob-permit-watchlist-sticky'],
  ['nyc-construction-permit-search.html', 'nyc-construction-permit-search-sticky'],
  ['nyc-dob-permit-lookup.html', 'nyc-dob-permit-lookup-sticky'],
  ['nyc-permit-data-api-alternative.html', 'nyc-permit-data-api-alternative-sticky'],
  ['weekly-nyc-construction-permit-report.html', 'weekly-nyc-construction-report-sticky'],
  ['dob-now-permit-search-alternative.html', 'dob-now-alternative-sticky'],
  ['nyc-construction-permit-leads.html', 'permit-leads-sticky'],
  ['nyc-permit-activity-by-zip.html', 'permit-activity-by-zip-sticky'],
  ['nyc-sidewalk-shed-permits.html', 'sidewalk-shed-permits-sticky'],
  ['nyc-sidewalk-shed-permit-leads.html', 'sidewalk-shed-permit-leads-sticky'],
  ['nyc-supported-scaffold-permit-leads.html', 'supported-scaffold-permit-leads-sticky'],
  ['nyc-plumbing-permit-leads.html', 'plumbing-permit-leads-sticky'],
  ['nyc-plumbing-permits.html', 'plumbing-permits-sticky'],
  ['nyc-sprinkler-permit-leads.html', 'sprinkler-permit-leads-sticky'],
  ['nyc-sprinkler-permits.html', 'sprinkler-permits-sticky'],
  ['nyc-mechanical-systems-permit-leads.html', 'mechanical-systems-permit-leads-sticky'],
  ['nyc-mechanical-systems-permits.html', 'mechanical-systems-permits-sticky'],
  ['nyc-supported-scaffold-permits.html', 'supported-scaffold-permits-sticky'],
  ['nyc-structural-permit-leads.html', 'structural-permit-leads-sticky'],
  ['nyc-structural-permits.html', 'structural-permits-sticky'],
  ['nyc-construction-fence-permit-leads.html', 'construction-fence-permit-leads-sticky'],
  ['nyc-construction-fence-permits.html', 'construction-fence-permits-sticky'],
  ['methodology.html', 'methodology-sticky'],
  ['time-saved-calculator.html', 'time-saved-calculator-sticky'],
  ['who-should-buy.html', 'who-should-buy-sticky'],
  ['permit-research-workflow.html', 'permit-research-workflow-sticky'],
  ['contractor-permit-research.html', 'contractor-sticky'],
  ['contractor-supplier-permit-research.html', 'contractor-supplier-sticky'],
  ['broker-developer-permit-research.html', 'broker-developer-sticky'],
  ['real-estate-investor-permit-research.html', 'real-estate-investor-sticky'],
  ['construction-consultant-permit-research.html', 'construction-consultant-sticky'],
  ['construction-risk-permit-research.html', 'construction-risk-sticky'],
  ['permit-expediter-research.html', 'permit-expediter-sticky'],
  ['property-manager-permit-research.html', 'property-manager-sticky'],
  ['material-supplier-permit-research.html', 'material-supplier-sticky'],
  ['building-service-vendor-permit-research.html', 'building-service-vendor-sticky'],
  ['subcontractor-permit-research.html', 'subcontractor-sticky'],
  ['sample-segments.html', 'sample-segments-sticky'],
];

const coreTopCtaPages = [
  ['preview.html', 'preview-top'],
  ['current-issue.html', 'current-issue-top'],
  ['faq.html', 'faq-top'],
  ['csv-field-guide.html', 'csv-field-guide-top'],
  ['sample-request.html', 'sample-request-top'],
  ['methodology.html', 'methodology-top'],
  ['permit-research-workflow.html', 'permit-research-workflow-top'],
  ['nyc-dob-permit-data-download.html', 'nyc-dob-permit-data-download-top'],
  ['nyc-building-permit-data.html', 'building-permit-data-top'],
  ['nyc-building-permits.html', 'nyc-building-permits-top'],
  ['nyc-dob-approved-permits.html', 'nyc-dob-approved-permits-top'],
  ['nyc-dob-permit-csv.html', 'nyc-dob-permit-csv-top'],
  ['nyc-dob-now-approved-permits.html', 'nyc-dob-now-approved-permits-top'],
  ['dob-now-build-approved-permits.html', 'dob-now-build-approved-permits-top'],
  ['nyc-dob-permit-alerts.html', 'nyc-dob-permit-alerts-top'],
  ['nyc-dob-permit-tracker.html', 'nyc-dob-permit-tracker-top'],
  ['nyc-dob-permit-monitoring.html', 'nyc-dob-permit-monitoring-top'],
  ['nyc-dob-permit-watchlist.html', 'nyc-dob-permit-watchlist-top'],
  ['nyc-dob-permit-search.html', 'nyc-dob-permit-search-top'],
  ['nyc-construction-permit-search.html', 'nyc-construction-permit-search-top'],
  ['nyc-dob-permit-lookup.html', 'nyc-dob-permit-lookup-top'],
  ['nyc-permit-data-api-alternative.html', 'nyc-permit-data-api-alternative-top'],
  ['weekly-nyc-construction-permit-report.html', 'weekly-nyc-construction-report-top'],
  ['dob-now-permit-search-alternative.html', 'dob-now-alternative-top'],
  ['nyc-construction-permit-leads.html', 'permit-leads-top'],
  ['nyc-permit-activity-by-zip.html', 'permit-activity-by-zip-top'],
  ['manhattan-construction-permit-activity.html', 'manhattan-permit-activity-top'],
  ['brooklyn-construction-permit-activity.html', 'brooklyn-permit-activity-top'],
  ['nyc-sidewalk-shed-permits.html', 'sidewalk-shed-permits-top'],
  ['nyc-sidewalk-shed-permit-leads.html', 'sidewalk-shed-permit-leads-top'],
  ['nyc-supported-scaffold-permit-leads.html', 'supported-scaffold-permit-leads-top'],
  ['nyc-plumbing-permit-leads.html', 'plumbing-permit-leads-top'],
  ['nyc-plumbing-permits.html', 'plumbing-permits-top'],
  ['nyc-sprinkler-permit-leads.html', 'sprinkler-permit-leads-top'],
  ['nyc-sprinkler-permits.html', 'sprinkler-permits-top'],
  ['nyc-mechanical-systems-permit-leads.html', 'mechanical-systems-permit-leads-top'],
  ['nyc-mechanical-systems-permits.html', 'mechanical-systems-permits-top'],
  ['nyc-supported-scaffold-permits.html', 'supported-scaffold-permits-top'],
  ['nyc-structural-permit-leads.html', 'structural-permit-leads-top'],
  ['nyc-structural-permits.html', 'structural-permits-top'],
  ['nyc-construction-fence-permit-leads.html', 'construction-fence-permit-leads-top'],
  ['nyc-construction-fence-permits.html', 'construction-fence-permits-top'],
  ['contractor-permit-research.html', 'contractor-top'],
  ['contractor-supplier-permit-research.html', 'contractor-supplier-top'],
  ['broker-developer-permit-research.html', 'broker-developer-top'],
  ['real-estate-investor-permit-research.html', 'real-estate-investor-top'],
  ['construction-consultant-permit-research.html', 'construction-consultant-top'],
  ['construction-risk-permit-research.html', 'construction-risk-top'],
  ['permit-expediter-research.html', 'permit-expediter-top'],
  ['property-manager-permit-research.html', 'property-manager-top'],
  ['material-supplier-permit-research.html', 'material-supplier-top'],
  ['building-service-vendor-permit-research.html', 'building-service-vendor-top'],
  ['subcontractor-permit-research.html', 'subcontractor-top'],
  ['invoice-request.html', 'invoice-request-buy-top'],
  ['sample-segments.html', 'sample-segments-top'],
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

function applyCoreTopCtas() {
  for (const [relativePath, source] of coreTopCtaPages) {
    const filePath = path.join(root, relativePath);
    let html = fs.readFileSync(filePath, 'utf8');
    const expectedHref = checkoutBridgeHref(source);
    if (html.includes(`href="${expectedHref}">Buy $9.50 ZIP</a>`)) {
      continue;
    }
    const updated = html.replace(
      /(<p class="lede">[\s\S]*?<\/p>\n)/,
      `$1${topPurchaseCta(source)}`,
    );
    if (updated === html) {
      throw new Error(`could not insert top purchase CTA in ${relativePath}`);
    }
    fs.writeFileSync(filePath, updated);
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
    <link rel="alternate" type="application/feed+json" title="NYC Weekly Construction Activity Brief JSON Feed" href="${baseUrl}/feed.json">
    <link rel="alternate" type="application/json" title="NYC Weekly Construction Activity Brief current issue" href="${baseUrl}/current-issue.json">`;
}

function sampleRequestScript() {
  return `<script>
      function trackSampleRequestEvent(name, data) {
        try {
          window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
          window.va('event', { name, data });
        } catch (error) {}
      }
      function sampleRequestEventPrefix(form) {
        const prefix = form && form.dataset.eventPrefix ? form.dataset.eventPrefix : '';
        return /^[a-z0-9_]{1,40}$/i.test(prefix) ? prefix : 'sample_request';
      }
      function sampleRequestFallbackHref(data, source, form) {
        const subject = form && form.dataset.fallbackSubject
          ? form.dataset.fallbackSubject
          : 'NYC Construction Brief sample request';
        const lines = [
          (form && form.dataset.fallbackSourceLabel ? form.dataset.fallbackSourceLabel : 'Sample request source') + ': ' + source,
          'Email: ' + (data.email || ''),
          'Work type: ' + (data.work_type_requested || ''),
          'Territory: ' + (data.territory_requested || ''),
          'Buyer type: ' + (data.buyer_type || ''),
          'Entry source: ' + (data.entry_source || ''),
          'Monitoring goal: ' + (data.monitoring_goal || ''),
        ];
        const supportAddress = ['support', 'magick.me'].join('@');
        return 'mailto:' + supportAddress + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\\n'));
      }
      document.addEventListener('submit', async (event) => {
        const form = event.target.closest('[data-sample-request-form]');
        if (!form) return;
        event.preventDefault();
        const status = form.querySelector('[data-sample-request-status]');
        const button = form.querySelector('button[type="submit"]');
        const data = Object.fromEntries(new FormData(form).entries());
        data.consent = form.querySelector('[name="consent"]').checked;
        data.source_path = window.location.pathname;
        const rawEntrySource = new URLSearchParams(window.location.search).get('source') || '';
        data.entry_source = /^[a-z0-9._-]{1,80}$/i.test(rawEntrySource) ? rawEntrySource : '';
        const requestSource = ['sample-request', window.location.pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'].join('-').slice(0, 80);
        const fallbackHref = sampleRequestFallbackHref(data, requestSource, form);
        const eventPrefix = sampleRequestEventPrefix(form);
        trackSampleRequestEvent(eventPrefix + '_submitted', {
          source: requestSource,
          request_only: form.dataset.currentIssueCta === 'false',
          entry_source: data.entry_source || '',
        });
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
          trackSampleRequestEvent(eventPrefix + '_saved', { source: requestSource });
          if (status) {
            const successCopy = form.dataset.successCopy || 'Request saved. I will use this to choose future sample cuts.';
            if (form.dataset.currentIssueCta === 'false') {
              status.textContent = successCopy;
            } else {
              status.innerHTML = successCopy + ' If the current ZIP fits, <a href="/buy.html?source=' + encodeURIComponent(requestSource) + '">buy the instant ZIP</a>.';
            }
          }
        } catch (error) {
          trackSampleRequestEvent(eventPrefix + '_failed', { source: requestSource });
          if (status) {
            const failedCopy = form.dataset.failedCopy || 'Request was not saved.';
            const emailLabel = form.dataset.emailFallbackLabel || 'Email this request';
            if (form.dataset.currentIssueCta === 'false') {
              status.innerHTML = failedCopy + ' <a href="' + fallbackHref + '">' + emailLabel + '</a>.';
            } else {
              status.innerHTML = failedCopy + ' <a href="' + fallbackHref + '">' + emailLabel + '</a>, or <a href="/buy.html?source=' + encodeURIComponent(requestSource) + '">buy the current ZIP</a> if it already fits.';
            }
          }
        } finally {
          if (button) button.disabled = false;
        }
      });
      document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href="#sample-request"]');
        if (!link) return;
        const source = ['sample-request-cta', window.location.pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'].join('-').slice(0, 80);
        const form = document.querySelector('[data-sample-request-form]');
        const eventPrefix = sampleRequestEventPrefix(form);
        trackSampleRequestEvent(eventPrefix + '_cta_clicked', {
          source,
          text: (link.textContent || '').trim().slice(0, 80),
          path: window.location.pathname,
        });
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

function buySampleRows(rows, limit = 3) {
  const selected = [];
  const usedRows = new Set();
  const workTypes = new Set();
  const areas = new Set();
  const orderedRows = sortRows(rows);
  const push = (row) => {
    const index = orderedRows.indexOf(row);
    if (usedRows.has(index)) return;
    usedRows.add(index);
    selected.push(row);
    workTypes.add(row.work_type);
    areas.add(`${row.borough}|${row.zip_code}`);
  };

  for (const row of orderedRows) {
    if (selected.length >= limit) break;
    if (!workTypes.has(row.work_type)) push(row);
  }
  for (const row of orderedRows) {
    if (selected.length >= limit) break;
    if (!areas.has(`${row.borough}|${row.zip_code}`)) push(row);
  }
  for (const row of orderedRows) {
    if (selected.length >= limit) break;
    push(row);
  }

  return selected.map((row) => ({
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
        <p class="fine">Review the purchase details, then use the button below. The current launch price is $9.50. No promo code is required.</p>
        <p class="fine">This is a one-time ZIP purchase. It does not create a subscription, account, or recurring charge.</p>
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
        <section class="section" data-checkout-source-fit="buy-page-source-sidewalk-shed" hidden>
          <h2>Sidewalk shed checkout check</h2>
          <p>This checkout path is for the 40 selected sidewalk shed rows in the current ZIP. The same download also includes the full 142-row issue and buyer workbook.</p>
        </section>
        <section class="section" data-checkout-source-fit="buy-page-source-plumbing" hidden>
          <h2>Plumbing checkout check</h2>
          <p>This checkout path is for the 29 selected plumbing rows in the current ZIP. The same download also includes the full 142-row issue and buyer workbook.</p>
        </section>
        <section class="section" data-checkout-source-fit="buy-page-source-exterior-access" hidden>
          <h2>Exterior-access checkout check</h2>
          <p>This checkout path is for the 74 selected exterior-access rows across sidewalk shed, supported scaffold, construction fence, and structural activity. The same download also includes the full 142-row issue.</p>
        </section>
        <a id="stripe-link" class="button" href="#stripe-checkout">Continue to Stripe</a>
        <p>
          <a id="invoice-help-link" class="button secondary" href="/invoice-request.html?source=checkout-bridge">Need invoice help?</a>
          <a id="sample-help-link" class="button secondary" href="/sample-request.html?source=checkout-bridge-sample">Need a different sample?</a>
          <a class="button secondary" href="/preview.html">Check preview</a>
          <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
          <a class="button secondary" href="/support.html">Support and refunds</a>
        </p>
        <p class="fine">If the current work type or ZIP mix is close but not exact, send a product-specific sample request before paying.</p>
        <p class="fine">Stripe handles payment. The success page uses the paid Checkout Session to unlock the ZIP.</p>
        <noscript>
          <p class="fine">JavaScript is off, so use this Stripe Payment Link fallback instead of the checkout bridge.</p>
          <p><a class="button" href="${stripeCheckoutUrl}?utm_source=nyc_construction_activity_brief&amp;utm_medium=owned_site&amp;utm_campaign=current_issue_launch&amp;utm_content=checkout_static_fallback&amp;client_reference_id=ncab_checkout_static_fallback">Continue with Stripe fallback</a></p>
        </noscript>
      </section>
${sampleRequestSection({
  heading: 'Request a fit check before paying',
  intro: 'If you reached checkout but are not sure the current ZIP matches your work type, territory, or buyer use case, send a short fit request instead of abandoning the page.',
  workType: 'Current issue checkout fit',
  territory: 'NYC',
  monitoringGoal: 'I reached checkout and want to confirm whether the current issue fits my work type, ZIP, or buyer use case.',
  buttonCopy: 'Send fit request',
  fallbackSubject: 'NYC Construction Brief checkout fit request',
  fallbackSourceLabel: 'Checkout fit request source',
  successCopy: 'Fit request saved. I will use this to choose future sample cuts.',
  failedCopy: 'Fit request was not saved.',
})}
    </main>
    ${sampleRequestScript()}
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
      const fallbackUrl = '${stripeCheckoutUrl}?' + stripeParams.toString();
      const link = document.getElementById('stripe-link');
      const invoiceHelpLink = document.getElementById('invoice-help-link');
      const sampleHelpLink = document.getElementById('sample-help-link');
      link.dataset.fallbackUrl = fallbackUrl;
      const checkoutSourceFitPanel = document.querySelector('[data-checkout-source-fit="' + source + '"]');
      if (checkoutSourceFitPanel) {
        checkoutSourceFitPanel.hidden = false;
        trackEvent('checkout_source_fit_viewed', { source });
      }
      if (invoiceHelpLink) {
        const invoiceSource = [source, 'invoice'].join('-').slice(0, 80);
        invoiceHelpLink.href = '/invoice-request.html?source=' + encodeURIComponent(invoiceSource);
        invoiceHelpLink.addEventListener('click', () => {
          trackEvent('checkout_invoice_help_clicked', { source });
        });
      }
      if (sampleHelpLink) {
        const sampleSource = [source, 'sample'].join('-').slice(0, 80);
        sampleHelpLink.href = '/sample-request.html?source=' + encodeURIComponent(sampleSource);
        sampleHelpLink.addEventListener('click', () => {
          trackEvent('checkout_sample_help_clicked', { source });
        });
      }
      function trackEvent(name, data) {
        try {
          window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
          window.va('event', { name, data });
        } catch (error) {}
      }
      async function createCheckoutUrl() {
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ source }),
          });
          if (!response.ok) throw new Error('checkout session request failed');
          const data = await response.json();
          if (!data || typeof data.url !== 'string' || !/^https:\\/\\/checkout\\.stripe\\.com\\//.test(data.url)) {
            throw new Error('checkout session response invalid');
          }
          trackEvent('checkout_session_created', { source });
          return data.url;
        } catch (error) {
          trackEvent('checkout_session_fallback', { source });
          return fallbackUrl;
        }
      }
      link.addEventListener('click', async (event) => {
        event.preventDefault();
        trackEvent('checkout_continue_clicked', { source });
        link.setAttribute('aria-busy', 'true');
        window.location.assign(await createCheckoutUrl());
      });
      trackEvent('checkout_intent', { source });
    </script>
  </body>
</html>
`;
}

function buyHtml(rows) {
  const defaultSource = 'buy-page';
  const topCheckout = checkoutBridgeHref('buy-page-top');
  const sampleCheckout = checkoutBridgeHref('buy-page-after-sample');
  const description = 'Buy the current NYC Weekly Construction Activity Brief ZIP with source-linked DOB NOW rows, buyer workbook, priority slices, and instant browser download.';
  const product = productJsonLd(description, `${baseUrl}/buy.html`);
  const buySamples = buySampleRows(rows, 3);
  const sampleTableRows = buySamples
    .map(
      (row) => `<tr data-buy-sample-row data-buy-sample-work-type="${escapeHtml(row.workType)}">
                <td>${escapeHtml(row.workType)}</td>
                <td>${escapeHtml(row.borough)} ${escapeHtml(row.zipCode)}</td>
                <td>${escapeHtml(row.issuedDate)}</td>
                <td>${escapeHtml(row.status)}</td>
                <td>${escapeHtml(row.costBucket)}</td>
                <td><a href="${escapeHtml(row.sourceUrl)}">DOB NOW row</a></td>
              </tr>`,
    )
    .join('\n');
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
        <p class="fine">No account setup, subscription, or recurring charge.</p>
        <img class="issue-snapshot buy-page-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <p>
          <a data-buy-link="top" class="button" href="${topCheckout}">Buy $9.50 ZIP on Stripe</a>
          <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Open free CSV preview</a>
          <a class="button secondary" href="/invoice-request.html?source=buy-page-top">Need invoice help?</a>
        </p>
        <section class="section" data-source-fit="product-feed-sidewalk-shed" hidden>
          <h2>Sidewalk shed buyer view</h2>
          <p>You opened the sidewalk shed product-feed link. The current ZIP includes 40 selected sidewalk shed rows, source URLs, ZIPs, boroughs, issued dates, status, cost buckets, and the same buyer workbook.</p>
          <p>
            <a data-buy-link="source-sidewalk-shed" class="button" href="${checkoutBridgeHref('buy-page-source-sidewalk-shed')}">Buy sidewalk shed ZIP</a>
            <a class="button secondary" href="/nyc-sidewalk-shed-permit-leads.html">Review sidewalk shed page</a>
          </p>
        </section>
        <section class="section" data-source-fit="product-feed-plumbing" hidden>
          <h2>Plumbing buyer view</h2>
          <p>You opened the plumbing product-feed link. The current ZIP includes 29 selected plumbing rows, source URLs, ZIPs, boroughs, issued dates, status, cost buckets, and the same buyer workbook.</p>
          <p>
            <a data-buy-link="source-plumbing" class="button" href="${checkoutBridgeHref('buy-page-source-plumbing')}">Buy plumbing ZIP</a>
            <a class="button secondary" href="/nyc-plumbing-permit-leads.html">Review plumbing page</a>
          </p>
        </section>
        <section class="section" data-source-fit="product-feed-exterior-access" hidden>
          <h2>Exterior-access buyer view</h2>
          <p>You opened the exterior-access product-feed link. The current ZIP includes 74 selected exterior-access rows across sidewalk shed, supported scaffold, construction fence, and structural activity.</p>
          <p>
            <a data-buy-link="source-exterior-access" class="button" href="${checkoutBridgeHref('buy-page-source-exterior-access')}">Buy exterior-access ZIP</a>
            <a class="button secondary" href="/topics/nyc-exterior-work-permit-research.html">Review exterior-access page</a>
          </p>
        </section>
        <section class="section" data-current-best-fit>
          <h2>Best fit this week</h2>
          <p>The current issue is strongest for sidewalk shed, plumbing, sprinkler, and exterior-access screening: 40 sidewalk shed rows, 29 plumbing rows, 21 sprinkler rows, 13 supported scaffold rows, 9 construction fence rows, and 12 structural rows.</p>
          <p>
            <a class="button secondary" href="/nyc-sidewalk-shed-permit-leads.html">Check sidewalk shed leads</a>
            <a class="button secondary" href="/nyc-plumbing-permit-leads.html">Check plumbing leads</a>
            <a class="button secondary" href="/nyc-sprinkler-permit-leads.html">Check sprinkler leads</a>
            <a class="button secondary" href="/nyc-mechanical-systems-permit-leads.html">Check mechanical leads</a>
            <a class="button secondary" href="/nyc-structural-permit-leads.html">Check structural leads</a>
            <a class="button secondary" href="/nyc-construction-fence-permit-leads.html">Check fence leads</a>
            <a class="button secondary" href="/topics/nyc-exterior-work-permit-research.html">Check exterior-access fit</a>
          </p>
          <p>
            <a data-buy-link="sidewalk-shed-fit" class="button" href="${checkoutBridgeHref('buy-page-sidewalk-shed-fit')}">Buy for sidewalk shed review</a>
            <a data-buy-link="plumbing-fit" class="button" href="${checkoutBridgeHref('buy-page-plumbing-fit')}">Buy for plumbing review</a>
            <a data-buy-link="exterior-access-fit" class="button" href="${checkoutBridgeHref('buy-page-exterior-access-fit')}">Buy for exterior-access review</a>
          </p>
        </section>
        <section class="section" data-first-use-plan>
          <h2>Use it in the first 15 minutes</h2>
          <ul>
            <li>Filter the priority-slices CSV to sidewalk shed, plumbing, sprinkler, supported scaffold, construction fence, or structural rows.</li>
            <li>Sort by ZIP, borough, work type, issued date, and cost bucket before assigning manual follow-up.</li>
            <li>Open the source URL for any row worth a second pass, then keep or discard it in your own CRM or spreadsheet.</li>
          </ul>
          <p class="fine">The ZIP is for fast public-record screening. It is not a contact list, outreach automation, or permit filing service.</p>
        </section>
        <section class="section" data-checkout-cancelled hidden>
          <h2>Checkout was not completed</h2>
          <p>If card checkout was blocked by invoice or purchase-order approval, send an invoice request. If the current work type or ZIP mix was the blocker, request a future sample cut. If the current ZIP fits, retry checkout from the matching segment.</p>
          <p>
            <a data-buy-link="cancelled-retry" class="button" href="${checkoutBridgeHref('buy-page-cancelled-retry')}">Retry Stripe checkout</a>
            <a data-buy-link="cancelled-sidewalk-shed" class="button" href="${checkoutBridgeHref('buy-page-cancelled-sidewalk-shed')}">Buy sidewalk shed ZIP</a>
            <a data-buy-link="cancelled-plumbing" class="button" href="${checkoutBridgeHref('buy-page-cancelled-plumbing')}">Buy plumbing ZIP</a>
            <a class="button secondary" href="/invoice-request.html">Request invoice help</a>
            <a class="button secondary" href="/sample-request.html?source=buy-page-cancelled-sample">Request a different sample</a>
            <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Open free CSV preview</a>
          </p>
        </section>
        <p class="fine">Checkout opens after your click. The success page verifies payment before serving the ZIP.</p>
        <section class="section" data-buy-confidence>
          <h2>Before you pay</h2>
          <ul>
            <li>Open the free preview if you need to confirm the row shape first.</li>
            <li>Use the support page for the refund boundary and download troubleshooting steps.</li>
            <li>Keep the Stripe receipt and success-page URL if the browser download is interrupted.</li>
            <li>Buy only if the full ${escapeHtml(rows.length)}-row file saves enough manual sorting time.</li>
          </ul>
        </section>
        <section class="section" data-buyer-fit-check>
          <h2>Fast buyer-fit check</h2>
          <p>Use the free CSV preview first if you need to see the columns. Buy when these public DOB fields are enough for your review pass: work type, borough, ZIP, issued date, status, cost bucket, short job description, and source URL.</p>
          <p class="fine">The paid ZIP adds the full current issue, buyer workbook, priority slices, source registry, QA report, and README. It does not add private contacts or lead scoring.</p>
        </section>
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
        <section class="section">
          <h2>Sample rows before checkout</h2>
          <p>These are examples from the free public preview. The paid ZIP keeps the same buyer-safe field shape across ${escapeHtml(rows.length)} rows.</p>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Work type</th>
                  <th>Area</th>
                  <th>Issued</th>
                  <th>Status</th>
                  <th>Cost bucket</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                ${sampleTableRows}
              </tbody>
            </table>
          </div>
        </section>
        <a data-buy-link="after-sample" class="button" href="${sampleCheckout}">Buy $9.50 ZIP on Stripe</a>
        <p class="fine">Stripe creates the paid session, then the success page unlocks the ZIP in your browser.</p>
        <section class="section">
          <h2>Inspect before checkout</h2>
          <p>Use the samples and package manifest before paying. The manifest is a JSON summary of the source, preview files, paid ZIP contents, price, delivery path, and claims boundary.</p>
          <p>
            <a class="button secondary" href="/data-package.json">Data package JSON</a>
            <a class="button secondary" href="/delivery.html">Delivery steps</a>
            <a class="button secondary" href="/pricing.html">Pricing</a>
          </p>
        </section>
        <p class="fine">Want to inspect the public row shape first? Open the sample files before paying.</p>
        <p>
          <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">CSV sample</a>
          <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">JSON sample</a>
          <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">JSONL sample</a>
          <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Sample brief</a>
          <a class="button secondary" href="/preview.html">Check preview</a>
          <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
          <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
          <a class="button secondary" href="/support.html">Support and refunds</a>
          <a class="button secondary" href="#sample-request">Request sample cut</a>
        </p>
        <p class="fine">No guaranteed leads, owner contact data, or agency-endorsed information.</p>
        <section class="section" data-procurement-intent>
          <h2>Card blocked by procurement?</h2>
          <p>If Stripe checkout is blocked by an internal approval or invoice process, use the invoice request page. This captures product interest only; paid ZIP delivery still requires a completed Stripe Checkout Session.</p>
          <p>
            <a class="button secondary" href="/invoice-request.html">Request invoice help</a>
            <a class="button secondary" href="/support.html">Check support boundary</a>
          </p>
        </section>
${sampleRequestSection({ workType: 'Selected DOB work types', territory: 'NYC' })}
        <noscript>
          <p class="fine">JavaScript is off, so automatic redirect is disabled. The button above opens the same Stripe checkout. You can also use the <a href="${topCheckout}">checkout bridge</a>.</p>
        </noscript>
      </section>
    </main>
    ${sampleRequestScript()}
    <script>
      const params = new URLSearchParams(window.location.search);
      const rawSource = params.get('source') || '${defaultSource}';
      const pageSource = /^[a-z0-9._-]{1,80}$/i.test(rawSource) ? rawSource : '${defaultSource}';
      const links = [...document.querySelectorAll('[data-buy-link]')];
      const invoiceHelpLinks = [...document.querySelectorAll('a[href^="/invoice-request.html"]')];
      const sampleHelpLinks = [...document.querySelectorAll('a[href="#sample-request"], a[href^="/sample-request.html"]')];
      const cancelledPanel = document.querySelector('[data-checkout-cancelled]');
      const sourceFitPanel = document.querySelector('[data-source-fit="' + pageSource + '"]');
      if (sourceFitPanel) {
        sourceFitPanel.hidden = false;
        trackEvent('buy_source_fit_viewed', { source: pageSource });
      }
      if (params.get('checkout') === 'cancelled' && cancelledPanel) {
        cancelledPanel.hidden = false;
        trackEvent('checkout_cancelled_return', { source: pageSource });
      }
      function linkSource(link) {
        const url = new URL(link.href, window.location.href);
        const rawLinkSource = url.searchParams.get('source') || pageSource;
        return /^[a-z0-9._-]{1,80}$/i.test(rawLinkSource) ? rawLinkSource : pageSource;
      }
      function fallbackUrlFor(source) {
        const stripeParams = new URLSearchParams({
          utm_source: 'nyc_construction_activity_brief',
          utm_medium: 'owned_site',
          utm_campaign: 'current_issue_launch',
          utm_content: source,
          client_reference_id: ['ncab', source.replace(/[^a-z0-9_-]/gi, '_'), Date.now().toString(36)].join('_').slice(0, 200),
        });
        return '${stripeCheckoutUrl}?' + stripeParams.toString();
      }
      function trackEvent(name, data) {
        try {
          window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
          window.va('event', { name, data });
        } catch (error) {}
      }
      async function createCheckoutUrl(source) {
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ source }),
          });
          if (!response.ok) throw new Error('checkout session request failed');
          const data = await response.json();
          if (!data || typeof data.url !== 'string' || !/^https:\\/\\/checkout\\.stripe\\.com\\//.test(data.url)) {
            throw new Error('checkout session response invalid');
          }
          trackEvent('buy_page_checkout_session_created', { source });
          return data.url;
        } catch (error) {
          trackEvent('buy_page_checkout_session_fallback', { source });
          return fallbackUrlFor(source);
        }
      }
      links.forEach((link) => {
        link.addEventListener('click', async (event) => {
          event.preventDefault();
          const source = linkSource(link);
          trackEvent('buy_page_continue_clicked', { source, position: link.dataset.buyLink || 'unknown' });
          link.setAttribute('aria-busy', 'true');
          window.location.assign(await createCheckoutUrl(source));
        });
      });
      invoiceHelpLinks.forEach((link) => {
        link.addEventListener('click', () => {
          trackEvent('buy_page_invoice_help_clicked', { source: linkSource(link) });
        });
      });
      sampleHelpLinks.forEach((link) => {
        link.addEventListener('click', () => {
          trackEvent('buy_page_sample_help_clicked', { source: linkSource(link) });
        });
      });
      trackEvent('buy_page_viewed', { source: pageSource });
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
        contentUrl: sampleCsvUrl,
      },
      {
        '@type': 'DataDownload',
        name: 'Public JSON preview',
        encodingFormat: 'application/json',
        contentUrl: sampleJsonUrl,
      },
      {
        '@type': 'DataDownload',
        name: 'Public JSONL preview',
        encodingFormat: 'application/x-ndjson',
        contentUrl: sampleJsonlUrl,
      },
      {
        '@type': 'DataDownload',
        name: 'Public Markdown sample brief',
        encodingFormat: 'text/markdown',
        contentUrl: sampleBriefUrl,
      },
    ],
  };
}

function topicDatasetJsonLd(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${page.h1.replace(/\.$/, '')} - current issue sample`,
    description: page.description,
    url: `${baseUrl}/topics/${page.slug}.html`,
    isPartOf: {
      '@type': 'Dataset',
      name: 'NYC Weekly Construction Activity Brief - Current Issue Public Preview',
      url: `${baseUrl}/methodology.html`,
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
    keywords: [
      'NYC DOB permits',
      'construction permit activity',
      page.h1.replace(/\.$/, ''),
      page.sampleLine,
    ].filter(Boolean),
    variableMeasured: [
      'source_url',
      'borough',
      'zip_code',
      'work_type',
      'issued_date',
      'permit_status',
      'estimated_job_cost_bucket',
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'Public CSV preview',
        encodingFormat: 'text/csv',
        contentUrl: sampleCsvUrl,
      },
      {
        '@type': 'DataDownload',
        name: 'Public JSON preview',
        encodingFormat: 'application/json',
        contentUrl: sampleJsonUrl,
      },
    ],
  };
}

function itemListJsonLd(name, url, pages) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: pages.length,
    itemListElement: pages.map((page, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: page.linkText || page.h1.replace(/\.$/, ''),
      url: `${baseUrl}/topics/${page.slug}.html`,
    })),
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
  const buyerType = context.buyerType || '';
  const monitoringGoal = escapeHtml(context.monitoringGoal || '');
  const heading = escapeHtml(context.heading || 'Request a future sample cut');
  const intro = escapeHtml(
    context.intro ||
      'If this page is close but not the exact territory or work type you need, send one request. I will use these requests to choose future public previews.',
  );
  const consentCopy = escapeHtml(context.consentCopy || 'You may reply about this public-record sample request.');
  const buttonCopy = escapeHtml(context.buttonCopy || 'Send sample request');
  const statusCopy = escapeHtml(context.statusCopy || 'This does not join the MagickMe newsletter. No guaranteed leads, owner contact data, or agency-endorsed information.');
  const formAttributes = [
    'data-sample-request-form',
    context.fallbackSubject ? `data-fallback-subject="${escapeHtml(context.fallbackSubject)}"` : '',
    context.fallbackSourceLabel ? `data-fallback-source-label="${escapeHtml(context.fallbackSourceLabel)}"` : '',
    context.successCopy ? `data-success-copy="${escapeHtml(context.successCopy)}"` : '',
    context.failedCopy ? `data-failed-copy="${escapeHtml(context.failedCopy)}"` : '',
    context.emailFallbackLabel ? `data-email-fallback-label="${escapeHtml(context.emailFallbackLabel)}"` : '',
    context.eventPrefix ? `data-event-prefix="${escapeHtml(context.eventPrefix)}"` : '',
    context.currentIssueCta === false ? 'data-current-issue-cta="false"' : '',
  ].filter(Boolean).join(' ');
  const buyerOption = (value, label) => {
    const selected = buyerType === value ? ' selected' : '';
    return `<option value="${value}"${selected}>${label}</option>`;
  };
  return `      <section id="sample-request" class="section card sample-request">
        <h2>${heading}</h2>
        <p>${intro}</p>
        <form ${formAttributes}>
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
              ${buyerOption('construction-support-vendor', 'Construction-support vendor')}
              ${buyerOption('specialty-subcontractor', 'Specialty subcontractor')}
              ${buyerOption('supplier', 'Supplier')}
              ${buyerOption('local-b2b-service-provider', 'Local B2B service provider')}
              ${buyerOption('real-estate-investor', 'Real estate investor or acquisition researcher')}
              ${buyerOption('broker-developer', 'Broker or developer')}
              ${buyerOption('permit-expediter', 'Permit expediter or filing consultant')}
              ${buyerOption('risk-researcher', 'Risk, lending, or compliance researcher')}
              ${buyerOption('consultant-analyst', 'Consultant or analyst')}
              ${buyerOption('property-manager', 'Property manager or facilities team')}
              ${buyerOption('data-buyer', 'Data buyer')}
              ${buyerOption('other', 'Other')}
            </select>
          </label>
          <label>
            What do you want to monitor?
            <textarea name="monitoring_goal" rows="3" placeholder="Example: sprinkler permits in Brooklyn each week" required>${monitoringGoal}</textarea>
          </label>
          <label class="checkbox">
            <input name="consent" type="checkbox" required>
            ${consentCopy}
          </label>
          <input class="hp" name="website" tabindex="-1" autocomplete="off">
          <button class="button" type="submit">${buttonCopy}</button>
          <p class="fine" data-sample-request-status>${statusCopy}</p>
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
  const dataset = topicDatasetJsonLd(page);
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
    <link rel="alternate" type="application/feed+json" title="NYC Weekly Construction Activity Brief JSON Feed" href="${baseUrl}/feed.json">
    <link rel="alternate" type="application/json" title="NYC Weekly Construction Activity Brief current issue" href="${baseUrl}/current-issue.json">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapedTitle}">
    <meta property="og:description" content="${escapedDescription}">
    <meta property="og:url" content="${url}">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(dataset)}</script>
    <script type="application/ld+json">${jsonScript(breadcrumb)}</script>
${faq ? `    <script type="application/ld+json">${jsonScript(faq)}</script>\n` : ''}
    ${analyticsSnippet()}
  </head>
  <body class="has-conversion-bar">
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lede">${escapeHtml(page.lede)}</p>
      <p>
        <a class="button" href="${trackedCheckoutUrl}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
      </p>
      <p class="fine">The buy page shows sample rows first. Stripe checkout starts after your next click.</p>

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
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Download JSON preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Download JSONL preview</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Read sample brief</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${trackedCheckoutUrl}">Buy instant ZIP</a>
      </section>

${sampleStats(page)}${sampleTable(page)}${sampleRequestSection({
    workType: page.workTypeRequest,
    territory: page.territoryRequest,
    buyerType: page.buyerTypeRequest,
    monitoringGoal: page.monitoringGoalRequest,
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

function hubHtml(pages, curatedPages = []) {
  const description = 'Browse data-backed NYC construction permit activity pages and buyer-intent pages from the current paid issue by ZIP, borough, work type, date, and cost bucket.';
  const product = productJsonLd(description, checkoutBridgeHref('segment-hub'));
  const itemList = itemListJsonLd('NYC permit activity and buyer-intent pages', `${baseUrl}/sample-segments.html`, [...pages, ...curatedPages]);
  const section = (heading, rows) => rows.length ? `      <section class="section card">
        <h2>${escapeHtml(heading)}</h2>
        <ul>
${rows.map((page) => `          <li><a href="/topics/${escapeHtml(page.slug)}.html">${escapeHtml(page.linkText)}</a> <span class="fine">(${escapeHtml(page.count)} rows)</span></li>`).join('\n')}
        </ul>
      </section>` : '';
  const curatedSection = (heading, rows) => rows.length ? `      <section class="section card">
        <h2>${escapeHtml(heading)}</h2>
        <ul>
${rows.map((page) => `          <li><a href="/topics/${escapeHtml(page.slug)}.html">${escapeHtml(page.h1.replace(/\.$/, ''))}</a></li>`).join('\n')}
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
    <link rel="alternate" type="application/feed+json" title="NYC Weekly Construction Activity Brief JSON Feed" href="${baseUrl}/feed.json">
    <link rel="alternate" type="application/json" title="NYC Weekly Construction Activity Brief current issue" href="${baseUrl}/current-issue.json">
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Permit Activity Segments">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/sample-segments.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(itemList)}</script>
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
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Download JSON preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Download JSONL preview</a>
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
        <a class="button" href="${checkoutBridgeHref('segment-hub')}">Buy instant ZIP</a>
      </section>

${section('ZIP pages', pages.filter((page) => page.group === 'zip'))}
${section('Borough and work type pages', pages.filter((page) => page.group === 'borough-work-type'))}
${section('ZIP and work type pages', pages.filter((page) => page.group === 'zip-work-type'))}
${section('Work type sample pages', pages.filter((page) => page.group === 'work-type'))}
${section('Buyer persona pages', pages.filter((page) => page.group === 'buyer-persona'))}
${section('Buyer research pages', pages.filter((page) => page.group === 'buyer'))}
${section('Cost bucket pages', pages.filter((page) => page.group === 'cost-bucket'))}
${section('Issued date pages', pages.filter((page) => page.group === 'issued-date'))}
${curatedSection('Curated buyer-intent pages', curatedPages.filter((page) => page.group === 'core'))}
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
      <p>
        <a class="button" href="${checkoutBridgeHref('buyer-guide-top')}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/free-vs-paid.html">Compare free vs paid</a>
      </p>
      <p class="fine">Stripe checkout opens after your click. Use the CSV preview first if you need to confirm the row shape.</p>

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
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Download JSON preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Download JSONL preview</a>
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
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Download JSON preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Download JSONL preview</a>
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

function permitDataApiAlternativeHtml(rows) {
  const description = 'A buyer-focused page for proptech operators and analysts comparing a simple weekly NYC DOB permit CSV ZIP with building a raw permit data pipeline.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const product = productJsonLd(description, checkoutHref('nyc-permit-data-api-alternative'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who should use this instead of building an API workflow?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It fits proptech operators, analysts, consultants, and small teams that need a weekly source-linked CSV before deciding whether a raw data pipeline is worth building.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this an API?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a weekly ZIP with CSV and worksheet files. Use it when a downloadable file is enough for the current review.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should technical buyers verify?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Check field names, row scope, source links, issue date range, and whether the CSV saves enough setup time for the current research task.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC Permit Data API Alternative | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-permit-data-api-alternative.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Permit Data API Alternative | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-permit-data-api-alternative.html">
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
      <h1>NYC permit data API alternative for weekly CSV research.</h1>
      <p class="lede">Use the current issue when a source-linked CSV is enough and a custom DOB data pipeline would slow down this week's review.</p>

      <section class="grid">
        <div class="card">
          <h2>CSV first</h2>
          <p>Start with a weekly file that can be opened in a spreadsheet, script, notebook, CRM import check, or research worksheet.</p>
        </div>
        <div class="card">
          <h2>Source-linked rows</h2>
          <p>Each public-facing row keeps a source URL so technical and research teams can verify records before using them.</p>
        </div>
        <div class="card">
          <h2>Low setup</h2>
          <p>Buy the ZIP only when the current issue saves more time than setting up a one-off pull, parser, or manual export.</p>
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
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>When the ZIP fits</h2>
        <ol>
          <li>You need this week's selected permit rows in a spreadsheet or scriptable CSV.</li>
          <li>You want to test buyer, vendor, contractor, ZIP, or work-type filters before building a repeat data pull.</li>
          <li>You need source URLs in the file so a human can verify rows before client work, routing, enrichment, or analysis.</li>
          <li>You want a buyer workbook and priority-slices CSV instead of starting from a blank export.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Technical review pass</h2>
        <ol>
          <li>Download the free preview CSV and check field names, row format, and source URLs.</li>
          <li>Open the CSV field guide and confirm the columns match your import or analysis needs.</li>
          <li>Check the current issue facts for row count, date range, work-type mix, ZIP mix, and status mix.</li>
          <li>Buy the ZIP only if the full current issue saves enough setup time.</li>
          <li>Before using any row in a product, report, data enrichment job, or client deliverable, verify the public source record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Related data pages</h2>
        <ul>
          <li><a href="/topics/nyc-construction-permit-data-api-alternative.html">NYC construction permit data API alternative</a></li>
          <li><a href="/topics/nyc-building-permit-export-csv.html">NYC building permit export CSV</a></li>
          <li><a href="/topics/nyc-construction-market-research-csv.html">NYC construction market research CSV</a></li>
          <li><a href="/topics/nyc-dob-now-public-records.html">NYC DOB NOW public records</a></li>
          <li><a href="/topics/nyc-construction-permit-data-for-proptech.html">NYC construction permit data for proptech</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'NYC permit data API alternative',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, enriched contact data, agency endorsement, data pipeline warranty, legal advice, compliance advice, or filing advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Download JSON preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Download JSONL preview</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Read sample brief</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/dob-now-permit-search-alternative.html">DOB NOW search alternative</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-permit-data-api-alternative')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function permitDataDownloadHtml(rows) {
  const description = 'Download the current NYC DOB permit data ZIP after Stripe checkout, with a free 25-row CSV preview, JSON samples, source links, and buyer notes.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const product = productJsonLd(description, checkoutHref('nyc-dob-permit-data-download'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I inspect the NYC DOB permit data before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The public preview includes 25 rows plus CSV, JSON, JSONL, Markdown sample, and data package metadata.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is in the paid download?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The paid ZIP includes the full ${rows.length}-row current issue CSV, buyer workbook, priority-slices CSV, source registry, QA report, and buyer notes.`,
        },
      },
      {
        '@type': 'Question',
        name: 'How is the ZIP delivered?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After Stripe confirms payment, the success page verifies the paid Checkout Session and unlocks the ZIP in the browser.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC DOB Permit Data Download | Current Issue ZIP</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-dob-permit-data-download.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC DOB Permit Data Download | Current Issue ZIP">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-dob-permit-data-download.html">
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
      <h1>NYC DOB permit data download for weekly CSV review.</h1>
      <p class="lede">Inspect the free 25-row preview, then buy the full ${escapeHtml(rows.length)}-row current issue ZIP when the data fits your review.</p>

      <section class="grid">
        <div class="card">
          <h2>Free files</h2>
          <p>Preview CSV, JSON, JSONL, Markdown sample brief, and data package metadata are public before checkout.</p>
        </div>
        <div class="card">
          <h2>Paid ZIP</h2>
          <p>Full current issue CSV, buyer workbook, priority-slices CSV, source registry, QA report, and buyer notes.</p>
        </div>
        <div class="card">
          <h2>Delivery</h2>
          <p>Stripe checkout redirects to the success page, which verifies the paid session before serving the ZIP.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current download facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
          <li>Current price: $9.50 one-time ZIP download.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Inspect before checkout</h2>
        <p>Use the public files to check field names, row shape, source links, and claims boundary before buying.</p>
        <a class="button secondary" href="/preview.html">Browser preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Preview CSV</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Preview JSON</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Preview JSONL</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Sample brief</a>
        <a class="button secondary" href="/data-package.json">Data package JSON</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/inside-the-zip.html">Inside the ZIP</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
      </section>

      <section class="section card">
        <h2>Download path</h2>
        <ol>
          <li>Open the free preview files and confirm the row format is useful.</li>
          <li>Use the buy page when the current issue is worth the $9.50 price.</li>
          <li>Stripe creates the paid session and redirects back to the success page.</li>
          <li>The download endpoint verifies the paid session before serving the ZIP.</li>
          <li>Open <code>source_url</code> before using any row for outreach, quoting, routing, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, filing advice, or compliance advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/nyc-permit-data-api-alternative.html">API alternative page</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/buyer-guide.html">Buyer guide</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-dob-permit-data-download')}">Buy $9.50 ZIP</a>
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

function buildingPermitDataHtml(rows) {
  const description = 'NYC building permit data page with a free 25-row DOB preview, source links, CSV samples, and a paid current issue ZIP for weekly review.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const product = productJsonLd(description, checkoutHref('nyc-building-permit-data'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I preview the NYC building permit data before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The public preview includes 25 selected DOB NOW rows, CSV, JSON, JSONL, a Markdown sample brief, and source links.',
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
      {
        '@type': 'Question',
        name: 'Does this include building owner or applicant contacts?',
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
    <title>NYC Building Permit Data | Current DOB Preview</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-building-permit-data.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Building Permit Data | Current DOB Preview">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-building-permit-data.html">
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
      <h1>NYC building permit data for weekly construction research.</h1>
      <p class="lede">Start with the free DOB preview, then buy the full current issue ZIP when the row scope fits your spreadsheet review.</p>

      <section class="grid">
        <div class="card">
          <h2>Free preview</h2>
          <p>25 public sample rows with source links, CSV, JSON, JSONL, and a Markdown sample brief.</p>
        </div>
        <div class="card">
          <h2>Paid issue</h2>
          <p>${escapeHtml(rows.length)} source-linked rows plus buyer workbook, priority slices, QA report, source registry, and package notes.</p>
        </div>
        <div class="card">
          <h2>Checkout</h2>
          <p>$9.50 one-time launch price. Stripe checkout unlocks an instant browser download after payment.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current data facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Use the preview first</h2>
        <p>Check the row format before paying. The preview keeps the same public-facing field shape used in the paid CSV.</p>
        <a class="button secondary" href="/preview.html">Browser preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Preview CSV</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Preview JSON</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Preview JSONL</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Sample brief</a>
        <a class="button secondary" href="/data-package.json">Data package JSON</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/sample-segments.html">Segment pages</a>
      </section>

      <section class="section card">
        <h2>When the paid ZIP fits</h2>
        <ol>
          <li>You want the full current issue in a spreadsheet-friendly CSV.</li>
          <li>You need source URLs kept next to each row for manual verification.</li>
          <li>You want buyer slices by work type, borough, ZIP, row count, latest issued date, status mix, and cost-bucket mix.</li>
          <li>You need a small weekly file, not a live API, CRM sync, or full permit database.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, filing advice, or compliance advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/nyc-dob-permit-data-download.html">Data download page</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/nyc-permit-data-api-alternative.html">API alternative page</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/faq.html">Buyer FAQ</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-building-permit-data')}">Buy $9.50 ZIP</a>
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

function dobPermitAlertsHtml(rows) {
  const description = 'NYC DOB permit alerts alternative for weekly source-linked screening by work type, ZIP, borough, issued date, status, cost bucket, and source link.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('nyc-dob-permit-alerts'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a real-time NYC DOB permit alert service?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a current issue ZIP for weekly permit screening. It does not send real-time alerts, push notifications, email alerts, API webhooks, or CRM syncs.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the current issue include?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The paid ZIP includes ${rows.length} selected public DOB NOW rows, buyer workbook, priority-slices CSV, source registry, QA report, buyer README, version file, and claims boundary.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Can I inspect the alert-style sample before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The public preview, sample brief, current issue page, segment hub, field guide, and delivery page are available before checkout.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC DOB Permit Alerts Alternative | Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-dob-permit-alerts.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC DOB Permit Alerts Alternative | Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-dob-permit-alerts.html">
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
      <h1>NYC DOB permit alerts alternative for weekly review.</h1>
      <p class="lede">Use the current issue as an alert-style weekly screening file: selected public DOB NOW rows with ZIP, borough, work type, issued date, status, cost bucket, and source link.</p>

      <section class="grid">
        <div class="card">
          <h2>Current issue</h2>
          <p>${escapeHtml(rows.length)} selected DOB NOW rows for ${escapeHtml(range.firstIssuedDate)} through ${escapeHtml(fetchDate || range.latestIssuedDate)}.</p>
        </div>
        <div class="card">
          <h2>Alert-style fields</h2>
          <p>Work type, borough, ZIP, issued date, status, cost bucket, filing identifiers, short description, and source URL.</p>
        </div>
        <div class="card">
          <h2>Checkout</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with browser download after payment.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current alert-style snapshot</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Use it as a weekly alert pass</h2>
        <ol>
          <li>Open the free preview and confirm the fields match the alert view you want.</li>
          <li>Check segment pages for the ZIPs, boroughs, and work types you care about.</li>
          <li>Buy the ZIP only if the full current issue saves enough sorting time.</li>
          <li>After checkout, use <code>buyer-priority-slices.csv</code> and <code>buyer-workbook.md</code> to review likely rows first.</li>
          <li>Before outreach, quoting, routing, underwriting, or planning, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>What this is not</h2>
        <p>This is not a live alert feed, email alert service, webhook, complete DOB database, CRM sync, agency system, or lead guarantee. It is a weekly current-issue ZIP for faster manual screening.</p>
      </section>

${sampleRequestSection({
        workType: 'NYC DOB permit alerts alternative',
        territory: 'NYC',
      })}

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, real-time monitoring, legal advice, or procurement advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/nyc-dob-permit-search.html">DOB permit search companion</a>
        <a class="button secondary" href="/nyc-dob-permit-lookup.html">DOB permit lookup companion</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Delivery steps</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-dob-permit-alerts')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function dobPermitTrackerHtml(rows) {
  const description = 'NYC DOB permit tracker alternative for weekly source-linked review by work type, ZIP, borough, issued date, status, cost bucket, and source link.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const product = productJsonLd(description, checkoutHref('nyc-dob-permit-tracker'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a live NYC DOB permit tracker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a current issue ZIP for weekly permit tracking and manual review. It does not provide live monitoring, push alerts, API access, CRM syncs, or a complete DOB database.',
        },
      },
      {
        '@type': 'Question',
        name: 'What fields can I track in the ZIP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The public-facing fields include source URL, source fetch date, borough, ZIP, work type, issued date, permit status, cost bucket, filing identifiers, short description, and source caveat.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the tracker include contacts or addresses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, and enriched contact data.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC DOB Permit Tracker Alternative | Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-dob-permit-tracker.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC DOB Permit Tracker Alternative | Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-dob-permit-tracker.html">
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
      <h1>NYC DOB permit tracker alternative for weekly review.</h1>
      <p class="lede">Use the current issue as a spreadsheet-friendly tracker for selected public DOB NOW permit rows, with source links kept visible for manual verification.</p>

      <section class="grid">
        <div class="card">
          <h2>Current tracker file</h2>
          <p>${escapeHtml(rows.length)} selected DOB NOW rows for ${escapeHtml(range.firstIssuedDate)} through ${escapeHtml(fetchDate || range.latestIssuedDate)}.</p>
        </div>
        <div class="card">
          <h2>Tracker fields</h2>
          <p>ZIP, borough, work type, issued date, permit status, cost bucket, filing identifiers, short description, source caveat, and source URL.</p>
        </div>
        <div class="card">
          <h2>Delivery</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with browser download after payment.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current tracker snapshot</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</li>
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Weekly tracker workflow</h2>
        <ol>
          <li>Use the public preview to confirm the tracker field shape.</li>
          <li>Check segment pages for relevant ZIPs, boroughs, work types, and issue dates.</li>
          <li>Buy the ZIP only if the full current issue saves enough spreadsheet sorting time.</li>
          <li>Use <code>buyer-priority-slices.csv</code> to start with the grouped rows.</li>
          <li>Before outreach, quoting, routing, underwriting, or planning, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Tracker boundary</h2>
        <p>This is not live monitoring, a DOB account, an agency service, a complete database, an API, a CRM sync, or a contact list. It is a weekly source-linked screening file for manual review.</p>
      </section>

${sampleRequestSection({
        workType: 'NYC DOB permit tracker alternative',
        territory: 'NYC',
      })}

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, or procurement advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/nyc-dob-permit-alerts.html">DOB permit alerts alternative</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/nyc-dob-permit-search.html">DOB permit search companion</a>
        <a class="button secondary" href="/nyc-dob-permit-lookup.html">DOB permit lookup companion</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Delivery steps</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-dob-permit-tracker')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function dobPermitMonitoringHtml(rows) {
  const description = 'NYC DOB permit monitoring alternative for weekly source-linked review by work type, ZIP, borough, issued date, status, cost bucket, and source link.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const product = productJsonLd(description, checkoutHref('nyc-dob-permit-monitoring'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this real-time NYC DOB permit monitoring?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a current issue ZIP for weekly permit monitoring and manual review. It does not provide live monitoring, push alerts, email alerts, API access, CRM syncs, or a complete DOB database.',
        },
      },
      {
        '@type': 'Question',
        name: 'What can I monitor in the weekly ZIP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The public-facing fields include source URL, source fetch date, borough, ZIP, work type, issued date, permit status, cost bucket, filing identifiers, short description, and source caveat.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it include people, phone numbers, emails, or full addresses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, and enriched contact data.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC DOB Permit Monitoring Alternative | Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-dob-permit-monitoring.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC DOB Permit Monitoring Alternative | Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-dob-permit-monitoring.html">
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
      <h1>NYC DOB permit monitoring alternative for weekly review.</h1>
      <p class="lede">Use the current issue as a weekly monitoring pass for selected public DOB NOW permit rows, with source links kept visible for verification before business use.</p>

      <section class="grid">
        <div class="card">
          <h2>Current monitoring file</h2>
          <p>${escapeHtml(rows.length)} selected DOB NOW rows for ${escapeHtml(range.firstIssuedDate)} through ${escapeHtml(fetchDate || range.latestIssuedDate)}.</p>
        </div>
        <div class="card">
          <h2>Monitoring fields</h2>
          <p>ZIP, borough, work type, issued date, permit status, cost bucket, filing identifiers, short description, source caveat, and source URL.</p>
        </div>
        <div class="card">
          <h2>Delivery</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with browser download after payment.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current monitoring snapshot</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</li>
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Weekly monitoring workflow</h2>
        <ol>
          <li>Use the public preview to confirm the monitoring field shape.</li>
          <li>Check segment pages for relevant ZIPs, boroughs, work types, and issue dates.</li>
          <li>Buy the ZIP only if the full current issue saves enough spreadsheet sorting time.</li>
          <li>Use <code>buyer-priority-slices.csv</code> to start with grouped rows.</li>
          <li>Before outreach, quoting, routing, underwriting, or planning, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Monitoring boundary</h2>
        <p>This is not live monitoring, a DOB account, an agency service, a complete database, an API, a CRM sync, an email alert service, or a contact list. It is a weekly source-linked screening file for manual review.</p>
      </section>

${sampleRequestSection({
        workType: 'NYC DOB permit monitoring alternative',
        territory: 'NYC',
      })}

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, or procurement advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/nyc-dob-permit-alerts.html">DOB permit alerts alternative</a>
        <a class="button secondary" href="/nyc-dob-permit-tracker.html">DOB permit tracker alternative</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/nyc-dob-permit-search.html">DOB permit search companion</a>
        <a class="button secondary" href="/nyc-dob-permit-lookup.html">DOB permit lookup companion</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Delivery steps</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-dob-permit-monitoring')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function dobPermitWatchlistHtml(rows) {
  const description = 'NYC DOB permit watchlist alternative for weekly source-linked review by work type, ZIP, borough, issued date, status, cost bucket, and source link.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('nyc-dob-permit-watchlist'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a live NYC DOB permit watchlist?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a current issue ZIP for weekly watchlist-style review. It does not provide live alerts, push notifications, email alerts, API access, CRM syncs, or a complete DOB database.',
        },
      },
      {
        '@type': 'Question',
        name: 'What can I put on my watchlist?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Buyers can filter the weekly CSV by borough, ZIP, work type, issued date, permit status, cost bucket, filing identifiers, short description, and source URL.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the watchlist include private contacts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, and enriched contact data.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC DOB Permit Watchlist Alternative | Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-dob-permit-watchlist.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC DOB Permit Watchlist Alternative | Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-dob-permit-watchlist.html">
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
      <h1>NYC DOB permit watchlist alternative for weekly review.</h1>
      <p class="lede">Use the current issue to build a weekly watchlist from selected public DOB NOW permit rows, then verify each source record before using it for outreach, quoting, planning, or research.</p>

      <section class="grid">
        <div class="card">
          <h2>Current watchlist file</h2>
          <p>${escapeHtml(rows.length)} selected DOB NOW rows for ${escapeHtml(range.firstIssuedDate)} through ${escapeHtml(fetchDate || range.latestIssuedDate)}.</p>
        </div>
        <div class="card">
          <h2>Watchlist fields</h2>
          <p>ZIP, borough, work type, issued date, permit status, cost bucket, filing identifiers, short description, source caveat, and source URL.</p>
        </div>
        <div class="card">
          <h2>Delivery</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with browser download after payment.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current watchlist snapshot</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}. Free preview rows: 25.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Weekly watchlist workflow</h2>
        <ol>
          <li>Use the public preview to confirm the watchlist field shape.</li>
          <li>Pick the ZIPs, boroughs, work types, issue dates, and cost buckets that match your research.</li>
          <li>Buy the ZIP only if the full current issue saves enough sorting time.</li>
          <li>Use <code>buyer-priority-slices.csv</code> to start with grouped rows.</li>
          <li>Before outreach, quoting, routing, underwriting, or planning, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Watchlist boundary</h2>
        <p>This is not a live watchlist, a DOB account, an agency service, a complete database, an API, a CRM sync, an email alert service, or a contact list. It is a weekly source-linked screening file for manual review.</p>
      </section>

${sampleRequestSection({
        workType: 'NYC DOB permit watchlist alternative',
        territory: 'NYC',
      })}

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, or procurement advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/nyc-dob-permit-alerts.html">DOB permit alerts alternative</a>
        <a class="button secondary" href="/nyc-dob-permit-tracker.html">DOB permit tracker alternative</a>
        <a class="button secondary" href="/nyc-dob-permit-monitoring.html">DOB permit monitoring alternative</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/nyc-dob-permit-search.html">DOB permit search companion</a>
        <a class="button secondary" href="/nyc-dob-permit-lookup.html">DOB permit lookup companion</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/delivery.html">Delivery steps</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-dob-permit-watchlist')}">Buy instant ZIP</a>
      </section>
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

function dobPermitSearchHtml(rows) {
  const description = 'NYC DOB permit search companion page with a free 25-row preview, source links, CSV samples, and a paid current issue ZIP for weekly screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const product = productJsonLd(description, checkoutHref('nyc-dob-permit-search'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this an official NYC DOB permit search?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is an independent weekly screening ZIP built from public DOB NOW approved permit data. Use DOB NOW or NYC Open Data source links for official record checks.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I inspect the permit search data before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The public preview includes 25 rows plus CSV, JSON, JSONL, a Markdown sample brief, and source links.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid ZIP add?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The paid ZIP adds the full ${rows.length}-row current issue CSV, buyer workbook, priority-slices CSV, source registry, QA report, and buyer notes.`,
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC DOB Permit Search | Weekly CSV Companion</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-dob-permit-search.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC DOB Permit Search | Weekly CSV Companion">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-dob-permit-search.html">
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
      <h1>NYC DOB permit search companion for weekly CSV screening.</h1>
      <p class="lede">Use the free preview to check selected DOB NOW rows before buying the full ${escapeHtml(rows.length)}-row current issue ZIP.</p>

      <section class="grid">
        <div class="card">
          <h2>Search companion</h2>
          <p>Spreadsheet-friendly screen by work type, borough, ZIP, issued date, status, cost bucket, and source link.</p>
        </div>
        <div class="card">
          <h2>Source checks stay required</h2>
          <p>Open the DOB source link before outreach, quoting, routing, underwriting, filing, or planning.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with browser download after payment.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current permit search facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Use the free preview first</h2>
        <p>Check field names, row shape, source links, and claims boundary before paying.</p>
        <a class="button secondary" href="/preview.html">Browser preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Preview CSV</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Preview JSON</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Preview JSONL</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Sample brief</a>
        <a class="button secondary" href="/data-package.json">Data package JSON</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
      </section>

      <section class="section card">
        <h2>When the ZIP fits</h2>
        <ol>
          <li>You repeatedly sort DOB NOW approved permit rows for a narrow weekly screen.</li>
          <li>You want a current CSV with source links kept beside each row.</li>
          <li>You need buyer slices by work type, borough, ZIP, latest issued date, status mix, and cost-bucket mix.</li>
          <li>You are comfortable checking official source records before acting on any row.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, filing advice, or compliance advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/dob-now-permit-search-alternative.html">DOB NOW alternative</a>
        <a class="button secondary" href="/nyc-dob-permit-data-download.html">Data download page</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-dob-permit-search')}">Buy $9.50 ZIP</a>
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

function dobPermitLookupHtml(rows) {
  return dobPermitSearchHtml(rows)
    .replaceAll('NYC DOB Permit Search | Weekly CSV Companion', 'NYC DOB Permit Lookup | Weekly CSV Companion')
    .replaceAll('nyc-dob-permit-search.html', 'nyc-dob-permit-lookup.html')
    .replaceAll('nyc-dob-permit-search', 'nyc-dob-permit-lookup')
    .replaceAll('NYC DOB permit search companion', 'NYC DOB permit lookup companion')
    .replaceAll('permit search data', 'permit lookup data')
    .replaceAll('Search companion', 'Lookup companion')
    .replaceAll('manual NYC DOB permit source checks', 'manual NYC DOB permit lookup checks');
}

function constructionPermitSearchHtml(rows) {
  return dobPermitSearchHtml(rows)
    .replaceAll('NYC DOB Permit Search | Weekly CSV Companion', 'NYC Construction Permit Search | Weekly DOB CSV')
    .replaceAll('nyc-dob-permit-search.html', 'nyc-construction-permit-search.html')
    .replaceAll('nyc-dob-permit-search', 'nyc-construction-permit-search')
    .replaceAll('NYC DOB permit search companion', 'NYC construction permit search companion')
    .replaceAll('NYC DOB permit source checks', 'NYC construction permit source checks')
    .replaceAll('Is this an official NYC DOB permit search?', 'Is this an official NYC construction permit search?')
    .replaceAll('Search companion', 'Construction permit search companion');
}

function dobApprovedPermitsHtml(rows) {
  const description = 'NYC DOB approved permits page with a free public preview, source links, current issue facts, and a paid weekly CSV ZIP for screening selected permit activity.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const product = productJsonLd(description, checkoutHref('nyc-dob-approved-permits'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What source is used for these approved permits?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The current issue uses NYC DOB NOW: Build - Approved Permits public records and keeps source links for manual verification.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the file include every approved permit in NYC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a selected weekly screening file for the current issue, not a complete DOB database or official agency export.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is included after checkout?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The paid ZIP includes the full ${rows.length}-row CSV, buyer workbook, priority-slices CSV, source registry, QA report, buyer README, and claims boundary notes.`,
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC DOB Approved Permits | Weekly CSV Preview</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-dob-approved-permits.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC DOB Approved Permits | Weekly CSV Preview">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-dob-approved-permits.html">
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
      <h1>NYC DOB approved permits packaged for weekly CSV review.</h1>
      <p class="lede">Start with the free preview, then buy the full current issue ZIP if the selected approved-permit rows fit your weekly screen.</p>

      <section class="grid">
        <div class="card">
          <h2>Public source</h2>
          <p>Built from NYC DOB NOW: Build - Approved Permits and packaged with source links for manual checks.</p>
        </div>
        <div class="card">
          <h2>Current issue</h2>
          <p>${escapeHtml(rows.length)} selected rows across work type, borough, ZIP, issued date, status, cost bucket, and source link.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with browser download after payment.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current approved-permit facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Inspect before checkout</h2>
        <p>Use the public files to check field names, row shape, source links, and package boundary before paying.</p>
        <a class="button secondary" href="/preview.html">Browser preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Preview CSV</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Preview JSON</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Preview JSONL</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Sample brief</a>
        <a class="button secondary" href="/data-package.json">Data package JSON</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
      </section>

      <section class="section card">
        <h2>Good fit</h2>
        <ol>
          <li>You want selected DOB approved-permit rows in a spreadsheet-friendly current issue.</li>
          <li>You need source URLs beside each row for verification.</li>
          <li>You want buyer slices without building your own weekly data pull.</li>
          <li>You understand the file is a screening aid, not an official record system.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, filing advice, or compliance advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/nyc-dob-permit-search.html">DOB permit search companion</a>
        <a class="button secondary" href="/dob-now-permit-search-alternative.html">DOB NOW alternative</a>
        <a class="button secondary" href="/nyc-dob-permit-data-download.html">Data download page</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-dob-approved-permits')}">Buy $9.50 ZIP</a>
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

function dobNowApprovedPermitsHtml(rows) {
  return dobApprovedPermitsHtml(rows)
    .replaceAll('NYC DOB Approved Permits | Weekly CSV Preview', 'NYC DOB NOW Approved Permits | Weekly CSV')
    .replaceAll('NYC DOB approved permits page', 'NYC DOB NOW approved permits page')
    .replaceAll('nyc-dob-approved-permits.html', 'nyc-dob-now-approved-permits.html')
    .replaceAll('nyc-dob-approved-permits', 'nyc-dob-now-approved-permits')
    .replaceAll('NYC DOB approved permits packaged', 'NYC DOB NOW approved permits packaged')
    .replaceAll('What source is used for these approved permits?', 'What source is used for these DOB NOW approved permits?')
    .replaceAll('Current approved-permit facts', 'Current DOB NOW approved-permit facts')
    .replaceAll('DOB approved-permit rows', 'DOB NOW approved-permit rows');
}

function dobNowBuildApprovedPermitsHtml(rows) {
  return dobApprovedPermitsHtml(rows)
    .replaceAll('NYC DOB Approved Permits | Weekly CSV Preview', 'DOB NOW Build Approved Permits | NYC CSV')
    .replaceAll('NYC DOB approved permits page', 'DOB NOW Build approved permits page')
    .replaceAll('nyc-dob-approved-permits.html', 'dob-now-build-approved-permits.html')
    .replaceAll('nyc-dob-approved-permits', 'dob-now-build-approved-permits')
    .replaceAll('NYC DOB approved permits packaged', 'DOB NOW: Build approved permits packaged')
    .replaceAll('What source is used for these approved permits?', 'What source is used for these DOB NOW: Build approved permits?')
    .replaceAll('Current approved-permit facts', 'Current DOB NOW: Build approved-permit facts')
    .replaceAll('DOB approved-permit rows', 'DOB NOW: Build approved-permit rows')
    .replaceAll('selected approved-permit rows', 'selected DOB NOW: Build approved-permit rows');
}

function buildingPermitsHtml(rows) {
  const description = 'NYC building permits page with a free public preview, source links, current issue facts, and a paid weekly CSV ZIP for screening selected construction activity.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const product = productJsonLd(description, checkoutHref('nyc-building-permits'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I preview the NYC building permits before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The public preview includes 25 selected rows, source links, CSV, JSON, JSONL, and a Markdown sample brief.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this a complete NYC building permits database?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a selected weekly screening file for the current issue, not a complete DOB database or official agency export.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid ZIP include?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The paid ZIP includes the full ${rows.length}-row CSV, buyer workbook, priority-slices CSV, source registry, QA report, buyer README, and claims boundary notes.`,
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC Building Permits | Weekly CSV Preview</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-building-permits.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Building Permits | Weekly CSV Preview">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-building-permits.html">
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
      <h1>NYC building permits packaged for weekly CSV review.</h1>
      <p class="lede">Use the free preview to check the selected permit rows, then buy the full current issue ZIP if it fits your weekly review.</p>

      <section class="grid">
        <div class="card">
          <h2>Free preview</h2>
          <p>25 selected rows with source links, CSV, JSON, JSONL, and a Markdown sample brief.</p>
        </div>
        <div class="card">
          <h2>Paid issue</h2>
          <p>${escapeHtml(rows.length)} selected rows plus buyer workbook, priority slices, source registry, QA report, and package notes.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with browser download after payment.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current building permit facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Inspect before checkout</h2>
        <p>Use the public files to check fields, row shape, source links, and package boundary before paying.</p>
        <a class="button secondary" href="/preview.html">Browser preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Preview CSV</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Preview JSON</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Preview JSONL</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Sample brief</a>
        <a class="button secondary" href="/data-package.json">Data package JSON</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, filing advice, or compliance advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/nyc-building-permit-data.html">Building permit data</a>
        <a class="button secondary" href="/nyc-dob-approved-permits.html">DOB approved permits</a>
        <a class="button secondary" href="/nyc-dob-permit-search.html">DOB permit search companion</a>
        <a class="button secondary" href="/nyc-dob-permit-data-download.html">Data download page</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('nyc-building-permits')}">Buy $9.50 ZIP</a>
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

function sidewalkShedPermitLeadsHtml(rows) {
  const sidewalkRows = rows.filter((row) => row.work_type === 'Sidewalk Shed');
  const description = 'NYC sidewalk shed permit leads page for teams screening public DOB sidewalk shed activity by ZIP, issued date, status, cost bucket, and source link.';
  const range = sampleRange(sidewalkRows.length ? sidewalkRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(sidewalkRows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(sidewalkRows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(sidewalkRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('sidewalk-shed-permit-leads'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a sidewalk shed lead list?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a public-record screening file for manual research. It does not include private contacts, outreach automation, lead scoring, or guaranteed sales.',
        },
      },
      {
        '@type': 'Question',
        name: 'What sidewalk shed data is visible before purchase?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `This page shows the current sidewalk shed row count, top ZIP mix, borough mix, cost buckets, public preview links, and source boundaries before checkout.`,
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid ZIP add for sidewalk shed research?',
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
    <title>NYC Sidewalk Shed Permit Leads | Public DOB Signals</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-sidewalk-shed-permit-leads.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Sidewalk Shed Permit Leads | Public DOB Signals">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-sidewalk-shed-permit-leads.html">
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
      <h1>NYC sidewalk shed permit leads from public DOB signals.</h1>
      <p class="lede">Use this page to check whether the current sidewalk shed slice is worth buying for your own manual research.</p>

      <section class="grid">
        <div class="card">
          <h2>Current sidewalk shed slice</h2>
          <p>${escapeHtml(sidewalkRows.length)} selected sidewalk shed rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Best first sort</h2>
          <p>Start with ZIP, borough, issued date, status, and cost bucket before opening source records.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current sidewalk shed lead-research facts</h2>
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
        <h2>Use it for manual lead research</h2>
        <ol>
          <li>Open the free preview and confirm the field shape.</li>
          <li>Buy the ZIP if 40 current sidewalk shed rows are enough to save sorting time.</li>
          <li>Filter the priority-slices CSV to sidewalk shed rows.</li>
          <li>Open source URLs for rows that fit your territory before any follow-up.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>This is a public-record screening file, not a finished lead list. No private contacts, owner names, applicant names, phone numbers, email addresses, full street addresses, lead scores, outreach automation, agency endorsement, legal advice, filing advice, or guaranteed sales are included.</p>
        <a class="button secondary" href="/nyc-sidewalk-shed-permits.html">Sidewalk shed permits page</a>
        <a class="button secondary" href="/topics/nyc-sidewalk-shed-permits.html">Sidewalk shed topic page</a>
        <a class="button secondary" href="/topics/sidewalk-shed-contractor-permit-research-nyc.html">Contractor research page</a>
        <a class="button secondary" href="/topics/nyc-sidewalk-shed-vendor-permit-research.html">Vendor research page</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('sidewalk-shed-permit-leads')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Sidewalk Shed',
        territory: 'NYC',
        buyerType: 'construction-support-vendor',
        monitoringGoal: 'Sidewalk shed permit activity for manual lead research in NYC.',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function supportedScaffoldPermitLeadsHtml(rows) {
  const scaffoldRows = rows.filter((row) => row.work_type === 'Supported Scaffold');
  const description = 'NYC supported scaffold permit leads page for teams screening public DOB supported scaffold activity by ZIP, issued date, status, cost bucket, and source link.';
  const range = sampleRange(scaffoldRows.length ? scaffoldRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(scaffoldRows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(scaffoldRows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(scaffoldRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('supported-scaffold-permit-leads'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a supported scaffold lead list?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a public-record screening file for manual research. It does not include private contacts, outreach automation, lead scoring, or guaranteed sales.',
        },
      },
      {
        '@type': 'Question',
        name: 'What supported scaffold data is visible before purchase?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This page shows the current supported scaffold row count, top ZIP mix, borough mix, cost buckets, public preview links, and source boundaries before checkout.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid ZIP add for supported scaffold research?',
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
    <title>NYC Supported Scaffold Permit Leads | Public DOB Signals</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-supported-scaffold-permit-leads.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Supported Scaffold Permit Leads | Public DOB Signals">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-supported-scaffold-permit-leads.html">
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
      <h1>NYC supported scaffold permit leads from public DOB signals.</h1>
      <p class="lede">Use this page to check whether the current supported scaffold slice is worth buying for your own manual research.</p>

      <section class="grid">
        <div class="card">
          <h2>Current supported scaffold slice</h2>
          <p>${escapeHtml(scaffoldRows.length)} selected supported scaffold rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Best first sort</h2>
          <p>Start with ZIP, borough, issued date, status, and cost bucket before opening source records.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current supported scaffold lead-research facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest supported scaffold row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Supported scaffold rows: ${escapeHtml(scaffoldRows.length)}.</li>
          <li>Top ZIPs for supported scaffold rows: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Use it for manual lead research</h2>
        <ol>
          <li>Open the free preview and confirm the field shape.</li>
          <li>Buy the ZIP if 13 current supported scaffold rows are enough to save sorting time.</li>
          <li>Filter the priority-slices CSV to supported scaffold rows.</li>
          <li>Open source URLs for rows that fit your territory before any follow-up.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>This is a public-record screening file, not a finished lead list. No private contacts, owner names, applicant names, phone numbers, email addresses, full street addresses, lead scores, outreach automation, agency endorsement, legal advice, filing advice, or guaranteed sales are included.</p>
        <a class="button secondary" href="/nyc-supported-scaffold-permits.html">Supported scaffold permits page</a>
        <a class="button secondary" href="/topics/nyc-supported-scaffold-permits.html">Supported scaffold topic page</a>
        <a class="button secondary" href="/topics/supported-scaffold-contractor-permit-research-nyc.html">Contractor research page</a>
        <a class="button secondary" href="/nyc-sidewalk-shed-permit-leads.html">Sidewalk shed lead-research page</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('supported-scaffold-permit-leads')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Supported Scaffold',
        territory: 'NYC',
        buyerType: 'construction-support-vendor',
        monitoringGoal: 'Supported scaffold permit activity for manual lead research in NYC.',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function plumbingPermitLeadsHtml(rows) {
  const plumbingRows = rows.filter((row) => row.work_type === 'Plumbing');
  const description = 'NYC plumbing permit leads page for teams screening public DOB plumbing activity by ZIP, issued date, status, cost bucket, and source link.';
  const range = sampleRange(plumbingRows.length ? plumbingRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(plumbingRows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(plumbingRows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(plumbingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('plumbing-permit-leads'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a plumbing lead list?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a public-record screening file for manual research. It does not include private contacts, outreach automation, lead scoring, or guaranteed sales.',
        },
      },
      {
        '@type': 'Question',
        name: 'What plumbing data is visible before purchase?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This page shows the current plumbing row count, top ZIP mix, borough mix, cost buckets, public preview links, and source boundaries before checkout.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid ZIP add for plumbing research?',
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
    <title>NYC Plumbing Permit Leads | Public DOB Signals</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-plumbing-permit-leads.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Plumbing Permit Leads | Public DOB Signals">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-plumbing-permit-leads.html">
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
      <h1>NYC plumbing permit leads from public DOB signals.</h1>
      <p class="lede">Use this page to check whether the current plumbing slice is worth buying for your own manual research.</p>

      <section class="grid">
        <div class="card">
          <h2>Current plumbing slice</h2>
          <p>${escapeHtml(plumbingRows.length)} selected plumbing rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Best first sort</h2>
          <p>Start with ZIP, borough, issued date, status, and cost bucket before opening source records.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current plumbing lead-research facts</h2>
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
        <h2>Use it for manual lead research</h2>
        <ol>
          <li>Open the free preview and confirm the field shape.</li>
          <li>Buy the ZIP if 29 current plumbing rows are enough to save sorting time.</li>
          <li>Filter the priority-slices CSV to plumbing rows.</li>
          <li>Open source URLs for rows that fit your territory before any follow-up.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>This is a public-record screening file, not a finished lead list. No private contacts, owner names, applicant names, phone numbers, email addresses, full street addresses, lead scores, outreach automation, agency endorsement, legal advice, filing advice, or guaranteed sales are included.</p>
        <a class="button secondary" href="/nyc-plumbing-permits.html">Plumbing permits page</a>
        <a class="button secondary" href="/topics/nyc-plumbing-permit-activity.html">Plumbing topic page</a>
        <a class="button secondary" href="/topics/plumbing-contractor-permit-research-nyc.html">Contractor research page</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('plumbing-permit-leads')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Plumbing',
        territory: 'NYC',
        buyerType: 'specialty-subcontractor',
        monitoringGoal: 'Plumbing permit activity for manual lead research in NYC.',
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

function sprinklerPermitLeadsHtml(rows) {
  const sprinklerRows = rows.filter((row) => row.work_type === 'Sprinklers');
  const description = 'NYC sprinkler permit leads page for teams screening public DOB sprinkler activity by ZIP, issued date, status, cost bucket, and source link.';
  const range = sampleRange(sprinklerRows.length ? sprinklerRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(sprinklerRows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(sprinklerRows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(sprinklerRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('sprinkler-permit-leads'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a sprinkler lead list?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a public-record screening file for manual research. It does not include private contacts, outreach automation, lead scoring, or guaranteed sales.',
        },
      },
      {
        '@type': 'Question',
        name: 'What sprinkler data is visible before purchase?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This page shows the current sprinkler row count, top ZIP mix, borough mix, cost buckets, public preview links, and source boundaries before checkout.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the paid ZIP add for sprinkler research?',
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
    <title>NYC Sprinkler Permit Leads | Public DOB Signals</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-sprinkler-permit-leads.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Sprinkler Permit Leads | Public DOB Signals">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-sprinkler-permit-leads.html">
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
      <h1>NYC sprinkler permit leads from public DOB signals.</h1>
      <p class="lede">Use this page to check whether the current sprinkler slice is worth buying for your own manual research.</p>

      <section class="grid">
        <div class="card">
          <h2>Current sprinkler slice</h2>
          <p>${escapeHtml(sprinklerRows.length)} selected sprinkler rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Best first sort</h2>
          <p>Start with ZIP, borough, issued date, status, and cost bucket before opening source records.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current sprinkler lead-research facts</h2>
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
        <h2>Use it for manual lead research</h2>
        <ol>
          <li>Open the free preview and confirm the field shape.</li>
          <li>Buy the ZIP if 21 current sprinkler rows are enough to save sorting time.</li>
          <li>Filter the priority-slices CSV to sprinkler rows.</li>
          <li>Open source URLs for rows that fit your territory before any follow-up.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>This is a public-record screening file, not a finished lead list. No private contacts, owner names, applicant names, phone numbers, email addresses, full street addresses, lead scores, outreach automation, agency endorsement, legal advice, filing advice, or guaranteed sales are included.</p>
        <a class="button secondary" href="/nyc-sprinkler-permits.html">Sprinkler permits page</a>
        <a class="button secondary" href="/topics/nyc-sprinkler-permit-activity.html">Sprinkler topic page</a>
        <a class="button secondary" href="/topics/sprinkler-contractor-permit-research-nyc.html">Contractor research page</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('sprinkler-permit-leads')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Sprinklers',
        territory: 'NYC',
        buyerType: 'specialty-subcontractor',
        monitoringGoal: 'Sprinkler permit activity for manual lead research in NYC.',
      })}
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function tradePermitLeadsHtml(rows, config) {
  const matchingRows = rows.filter((row) => row.work_type === config.workType);
  const range = sampleRange(matchingRows.length ? matchingRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(matchingRows, (row) => row.zip_code, 6);
  const boroughMix = describeCounts(matchingRows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const description = `NYC ${config.labelLower} permit leads page for teams screening public DOB ${config.labelLower} activity by ZIP, issued date, status, cost bucket, and source link.`;
  const product = productJsonLd(description, checkoutHref(config.checkoutSource));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is this a ${config.labelLower} lead list?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a public-record screening file for manual research. It does not include private contacts, outreach automation, lead scoring, or guaranteed sales.',
        },
      },
      {
        '@type': 'Question',
        name: `What ${config.labelLower} data is visible before purchase?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `This page shows the current ${config.labelLower} row count, top ZIP mix, borough mix, cost buckets, public preview links, and source boundaries before checkout.`,
        },
      },
      {
        '@type': 'Question',
        name: `What does the paid ZIP add for ${config.labelLower} research?`,
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
    <title>NYC ${escapeHtml(config.titleLabel)} Permit Leads | Public DOB Signals</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/${config.pageSlug}.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC ${escapeHtml(config.titleLabel)} Permit Leads | Public DOB Signals">
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
      <h1>NYC ${escapeHtml(config.labelLower)} permit leads from public DOB signals.</h1>
      <p class="lede">Use this page to check whether the current ${escapeHtml(config.labelLower)} slice is worth buying for your own manual research.</p>

      <section class="grid">
        <div class="card">
          <h2>Current ${escapeHtml(config.labelLower)} slice</h2>
          <p>${escapeHtml(matchingRows.length)} selected ${escapeHtml(config.labelLower)} rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Best first sort</h2>
          <p>Start with ZIP, borough, issued date, status, and cost bucket before opening source records.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current ${escapeHtml(config.labelLower)} lead-research facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest ${escapeHtml(config.labelLower)} row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>${escapeHtml(config.titleLabel)} rows: ${escapeHtml(matchingRows.length)}.</li>
          <li>Top ZIPs for ${escapeHtml(config.labelLower)} rows: ${escapeHtml(zipMix)}.</li>
          <li>Borough mix: ${escapeHtml(boroughMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Use it for manual lead research</h2>
        <ol>
          <li>Open the free preview and confirm the field shape.</li>
          <li>Buy the ZIP if ${escapeHtml(matchingRows.length)} current ${escapeHtml(config.labelLower)} rows are enough to save sorting time.</li>
          <li>Filter the priority-slices CSV to ${escapeHtml(config.labelLower)} rows.</li>
          <li>Open source URLs for rows that fit your territory before any follow-up.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>This is a public-record screening file, not a finished lead list. No private contacts, owner names, applicant names, phone numbers, email addresses, full street addresses, lead scores, outreach automation, agency endorsement, legal advice, filing advice, or guaranteed sales are included.</p>
        <a class="button secondary" href="/${escapeHtml(config.permitsPage)}.html">${escapeHtml(config.titleLabel)} permits page</a>
        <a class="button secondary" href="/${escapeHtml(config.topicPath)}">Topic page</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref(config.checkoutSource)}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: config.workType,
        territory: 'NYC',
        buyerType: config.buyerType,
        monitoringGoal: `${config.titleLabel} permit activity for manual lead research in NYC.`,
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

function boroughPermitsHtml(rows, config) {
  const matchingRows = rows.filter((row) => row.borough === config.borough);
  const lowerName = config.boroughName.toLowerCase();
  const description = config.description;
  const range = sampleRange(matchingRows.length ? matchingRows : rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipMix = describeCounts(matchingRows, (row) => row.zip_code, 6);
  const workTypeMix = describeCounts(matchingRows, (row) => row.work_type, 7);
  const statusMix = describeCounts(matchingRows, (row) => row.permit_status, 5);
  const costMix = describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const sample = sampleRows(matchingRows);
  const product = productJsonLd(description, checkoutHref(config.checkoutSource));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Does the current issue include ${config.boroughName} permit activity?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. The current paid issue includes ${matchingRows.length} selected ${config.boroughName} rows from the public DOB source file.`,
        },
      },
      {
        '@type': 'Question',
        name: `Who should review the ${config.boroughName} slice?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${config.audience[0].replace(/\.$/, '')}, contractors, suppliers, and local service teams can use it to build a short manual source-check list.`,
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
  <body class="has-conversion-bar">
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>${escapeHtml(config.headline)}</h1>
      <p class="lede">Use the public preview to check field fit, then buy the ZIP if the current ${escapeHtml(lowerName)} slice saves enough weekly sorting time.</p>

      <section class="grid">
        <div class="card">
          <h2>${escapeHtml(config.boroughName)} rows</h2>
          <p>${escapeHtml(matchingRows.length)} selected rows in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Review fields</h2>
          <p>Work type, ZIP, issued date, status, cost bucket, permit identifiers, short description, and source link.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current ${escapeHtml(config.boroughName)} facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest ${escapeHtml(config.boroughName)} row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>${escapeHtml(config.boroughName)} rows: ${escapeHtml(matchingRows.length)}.</li>
          <li>ZIP mix: ${escapeHtml(zipMix)}.</li>
          <li>Work type mix: ${escapeHtml(workTypeMix)}.</li>
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Example ${escapeHtml(config.boroughName)} rows</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Work type</th>
                <th>ZIP</th>
                <th>Issued</th>
                <th>Status</th>
                <th>Cost bucket</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
${sample.map((row) => `              <tr>
                <td>${escapeHtml(row.workType)}</td>
                <td>${escapeHtml(row.zipCode)}</td>
                <td>${escapeHtml(row.issuedDate)}</td>
                <td>${escapeHtml(row.status)}</td>
                <td>${escapeHtml(row.costBucket)}</td>
                <td><a href="${escapeHtml(row.sourceUrl)}">DOB NOW row</a></td>
              </tr>`).join('\n')}
            </tbody>
          </table>
        </div>
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
          <li>Check the ${escapeHtml(config.boroughName)} row count, ZIP mix, work-type mix, and issued-date range.</li>
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
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
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
        workType: 'Selected DOB work types',
        territory: config.boroughName,
      })}
    </main>
${conversionBar(`${config.checkoutSource}-sticky`)}
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function zipActivityHtml(rows) {
  const description = 'NYC permit activity by ZIP page for screening selected public DOB rows by ZIP code, borough, work type, issued date, status, cost bucket, and source link.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const zipEntries = [...countBy(rows, (row) => row.zip_code).entries()]
    .filter(([zip]) => zip)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const product = productJsonLd(description, checkoutHref('permit-activity-by-zip'));
  const dataset = datasetJsonLd(rows);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I review NYC permit activity by ZIP before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. This page shows current issue ZIP counts and links to source-backed ZIP sample pages before checkout.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this a live building permit alert feed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a weekly ZIP package for screening selected public DOB rows. It is not a live alert feed, API, CRM sync, or complete DOB database.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP file include private contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
    ],
  };
  const tableRows = zipEntries.map(([zip, count]) => {
    const matchingRows = rows.filter((row) => row.zip_code === zip);
    const boroughs = [...new Set(matchingRows.map((row) => titleCase(row.borough)))].join(', ');
    const latestIssued = matchingRows.map((row) => formatDate(row.issued_date)).sort().at(-1);
    return {
      zip,
      count,
      boroughs,
      latestIssued,
      workTypes: describeCounts(matchingRows, (row) => row.work_type, 4),
      costBuckets: describeCounts(matchingRows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 3),
      topicHref: `/topics/nyc-dob-permits-zip-${zip}.html`,
    };
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC Permit Activity by ZIP | Current DOB Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/nyc-permit-activity-by-zip.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Permit Activity by ZIP | Current DOB Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/nyc-permit-activity-by-zip.html">
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
      <h1>NYC permit activity by ZIP in the current issue.</h1>
      <p class="lede">Use this ZIP view to check whether the current issue covers the territories you care about before buying the full ${escapeHtml(rows.length)}-row ZIP.</p>

      <section class="grid">
        <div class="card">
          <h2>ZIP codes covered</h2>
          <p>${escapeHtml(zipEntries.length)} ZIP codes in the paid issue.</p>
        </div>
        <div class="card">
          <h2>Review fields</h2>
          <p>ZIP, borough, work type, issued date, status, cost bucket, permit identifiers, short description, and source link.</p>
        </div>
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time Stripe checkout with instant browser download.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Current ZIP facts</h2>
        <img class="issue-snapshot" src="/assets/current-issue-snapshot.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">
        <ul>
          <li>Source: NYC DOB NOW: Build - Approved Permits.</li>
          <li>Source window: ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</li>
          <li>Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}.</li>
          <li>Free preview rows: 25.</li>
          <li>Paid ZIP rows: ${escapeHtml(rows.length)}.</li>
          <li>Top ZIPs: ${escapeHtml(describeCounts(rows, (row) => row.zip_code, 8))}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>ZIP slices in the current issue</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ZIP</th>
                <th>Borough</th>
                <th>Rows</th>
                <th>Top work types</th>
                <th>Latest issued</th>
                <th>Cost buckets</th>
                <th>Sample page</th>
              </tr>
            </thead>
            <tbody>
${tableRows.map((row) => `              <tr>
                <td>${escapeHtml(row.zip)}</td>
                <td>${escapeHtml(row.boroughs)}</td>
                <td>${escapeHtml(row.count)}</td>
                <td>${escapeHtml(row.workTypes)}</td>
                <td>${escapeHtml(row.latestIssued)}</td>
                <td>${escapeHtml(row.costBuckets)}</td>
                <td><a href="${escapeHtml(row.topicHref)}">Review ZIP slice</a></td>
              </tr>`).join('\n')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section card">
        <h2>Use this order</h2>
        <ol>
          <li>Check the ZIP table for territory fit.</li>
          <li>Open the matching ZIP sample page and inspect example rows.</li>
          <li>Use the free preview to confirm the CSV fields match your review process.</li>
          <li>Buy the ZIP if the full current issue saves enough weekly sorting time.</li>
          <li>Open source links before outreach, quoting, routing, underwriting, or planning.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, legal advice, or filing advice are included. This is not a live alert feed. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/current-issue.html">Current issue</a>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a>
        <a class="button secondary" href="/manhattan-construction-permit-activity.html">Manhattan activity</a>
        <a class="button secondary" href="/brooklyn-construction-permit-activity.html">Brooklyn activity</a>
        <a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('permit-activity-by-zip')}">Buy instant ZIP</a>
      </section>

${sampleRequestSection({
        workType: 'Selected DOB work types',
        territory: 'ZIP codes in the current issue',
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
      <p>
        <a class="button" href="${checkoutBridgeHref('free-vs-paid-top')}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
      </p>
      <p class="fine">Stripe checkout opens after your click. Use the CSV preview first if you need to confirm the row shape.</p>

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

function materialSupplierHtml(rows) {
  const description = 'A buyer-focused guide for material suppliers, distributors, rental desks, and local B2B vendors using the NYC construction activity ZIP for weekly permit screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('material-supplier-permit-research'));
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
          text: 'It is for material suppliers, distributors, rental desks, and local B2B vendors that screen selected public NYC DOB permit activity before doing manual territory research.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP include contacts for contractors or owners?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
      {
        '@type': 'Question',
        name: 'How should a supplier use it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the public preview to check fit, buy the ZIP only if the full file saves sorting time, then verify useful rows at the DOB NOW source URL before acting.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Material Supplier Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/material-supplier-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Material Supplier Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/material-supplier-permit-research.html">
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
      <h1>NYC permit research for material suppliers.</h1>
      <p class="lede">Use the current issue to screen selected DOB NOW permit rows by work type, ZIP, issued date, status, cost bucket, and source link before building a weekly territory review list.</p>

      <section class="grid">
        <div class="card">
          <h2>Material suppliers</h2>
          <p>Check selected public permit activity before deciding which work types or territories deserve source-record review.</p>
        </div>
        <div class="card">
          <h2>Distributors</h2>
          <p>Sort the current issue by ZIP, work type, issued date, and cost bucket without starting from the raw source export.</p>
        </div>
        <div class="card">
          <h2>Rental desks</h2>
          <p>Use the buyer workbook and priority slices to build a short manual review list for equipment or materials demand checks.</p>
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
        <h2>Supplier review pass</h2>
        <ol>
          <li>Open the free preview and confirm the current issue has useful fields for your weekly screen.</li>
          <li>Check supplier, ZIP, work-type, and cost-bucket pages before checkout.</li>
          <li>Buy the ZIP only if the full current issue saves enough sorting time for this week's review.</li>
          <li>After checkout, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before using any row for territory planning, outreach, quoting, or inventory notes, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful supplier research pages</h2>
        <ul>
          <li><a href="/topics/nyc-construction-material-suppliers.html">NYC construction permit signals for material suppliers</a></li>
          <li><a href="/topics/nyc-construction-supplier-permit-research.html">NYC construction supplier permit research</a></li>
          <li><a href="/topics/nyc-construction-permit-monitoring-for-suppliers.html">NYC construction permit monitoring for suppliers</a></li>
          <li><a href="/topics/nyc-plumbing-supplier-permit-research.html">NYC plumbing supplier permit research</a></li>
          <li><a href="/topics/nyc-hvac-mechanical-permit-research.html">NYC HVAC mechanical permit research</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Material supplier permit research',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, contractor contacts, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, procurement advice, inventory advice, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/current-issue.html">Current issue highlights</a>
        <a class="button secondary" href="/sample-segments.html">Browse buyer-intent pages</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/nyc-permit-activity-by-zip.html">Permit activity by ZIP</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('material-supplier-permit-research')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function subcontractorHtml(rows) {
  const description = 'A buyer-focused guide for subcontractors, specialty trades, and small construction teams using the NYC construction activity ZIP for weekly permit screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('subcontractor-permit-research'));
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
          text: 'It is for subcontractors, specialty trades, and small construction teams that screen selected public NYC DOB permit activity before doing manual source checks.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP include general contractor contacts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes owner names, applicant names, contractor contacts, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
      {
        '@type': 'Question',
        name: 'How should a subcontractor use it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the preview to check work-type and territory fit, buy the ZIP only if the full file saves sorting time, then verify useful rows at the source URL.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Subcontractor Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/subcontractor-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Subcontractor Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/subcontractor-permit-research.html">
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
      <h1>NYC permit research for subcontractors.</h1>
      <p class="lede">Use the current issue to screen selected public DOB NOW permit rows by work type, ZIP, issued date, status, cost bucket, and source link before building a short manual review list.</p>

      <section class="grid">
        <div class="card">
          <h2>Specialty trades</h2>
          <p>Check selected permit activity before deciding which work types or territories deserve source-record review.</p>
        </div>
        <div class="card">
          <h2>Small construction teams</h2>
          <p>Sort by ZIP, work type, issued date, status, and cost bucket before opening individual DOB NOW records.</p>
        </div>
        <div class="card">
          <h2>Estimating and ops</h2>
          <p>Use the buyer workbook and priority slices to build a focused weekly review pass without sorting the raw source export first.</p>
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
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Subcontractor review pass</h2>
        <ol>
          <li>Open the free preview and confirm the selected fields fit your weekly screen.</li>
          <li>Check subcontractor, ZIP, work-type, and cost-bucket pages before checkout.</li>
          <li>Buy the ZIP only if the full current issue saves enough sorting time for this week's review.</li>
          <li>After checkout, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before using any row for estimating, routing, outreach, or account research, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful subcontractor research pages</h2>
        <ul>
          <li><a href="/topics/nyc-dob-permit-alerts-for-subcontractors.html">NYC DOB permit alerts for subcontractors</a></li>
          <li><a href="/topics/nyc-subcontractor-prospecting-permit-data.html">NYC subcontractor prospecting permit data</a></li>
          <li><a href="/topics/nyc-dob-permit-data-for-contractors.html">NYC DOB permit data for contractors</a></li>
          <li><a href="/topics/nyc-permit-intelligence-for-contractors.html">NYC permit intelligence for contractors</a></li>
          <li><a href="/topics/nyc-commercial-renovation-permits.html">NYC commercial renovation permits</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Subcontractor permit research',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, contractor contacts, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, estimating advice, procurement advice, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/current-issue.html">Current issue highlights</a>
        <a class="button secondary" href="/sample-segments.html">Browse buyer-intent pages</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/material-supplier-permit-research.html">Material supplier permit research</a>
        <a class="button secondary" href="/nyc-permit-activity-by-zip.html">Permit activity by ZIP</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('subcontractor-permit-research')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function contractorHtml(rows) {
  const description = 'A buyer-focused guide for contractors and small construction teams using the NYC construction activity ZIP for weekly permit screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('contractor-permit-research'));
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
          text: 'It is for contractors and small construction teams that screen selected public NYC DOB permit activity before opening individual source records.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP include owner or applicant contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes owner names, applicant names, contractor contacts, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
      {
        '@type': 'Question',
        name: 'How should a contractor use it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the preview to check work-type and territory fit, buy the ZIP only if the full file saves sorting time, then verify useful rows at the source URL.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Contractor Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/contractor-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Contractor Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/contractor-permit-research.html">
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
      <h1>NYC permit research for contractors.</h1>
      <p class="lede">Use the current issue to screen selected public DOB NOW permit rows by work type, ZIP, issued date, status, cost bucket, and source link before deciding which records deserve manual review.</p>

      <section class="grid">
        <div class="card">
          <h2>Contractor research</h2>
          <p>Check selected public permit activity before opening individual DOB NOW records.</p>
        </div>
        <div class="card">
          <h2>Territory review</h2>
          <p>Sort by ZIP, borough, work type, issued date, status, and cost bucket for a weekly screen.</p>
        </div>
        <div class="card">
          <h2>Ops and estimating</h2>
          <p>Use the buyer workbook and priority slices to build a short source-check list without sorting the raw source export first.</p>
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
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Contractor review pass</h2>
        <ol>
          <li>Open the free preview and confirm the selected fields fit your weekly screen.</li>
          <li>Check contractor, work-type, ZIP, borough, and cost-bucket pages before checkout.</li>
          <li>Buy the ZIP only if the full current issue saves enough sorting time for this week's review.</li>
          <li>After checkout, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before using any row for estimating, planning, outreach, or account research, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful contractor research pages</h2>
        <ul>
          <li><a href="/topics/nyc-dob-permit-data-for-contractors.html">NYC DOB permit data for contractors</a></li>
          <li><a href="/topics/nyc-permit-intelligence-for-contractors.html">NYC permit intelligence for contractors</a></li>
          <li><a href="/topics/nyc-contractor-market-research.html">NYC contractor market research</a></li>
          <li><a href="/topics/sidewalk-shed-contractor-permit-research-nyc.html">Sidewalk shed contractor permit research NYC</a></li>
          <li><a href="/topics/plumbing-contractor-permit-research-nyc.html">Plumbing contractor permit research NYC</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Contractor permit research',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, contractor contacts, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, estimating advice, procurement advice, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/current-issue.html">Current issue highlights</a>
        <a class="button secondary" href="/sample-segments.html">Browse buyer-intent pages</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/subcontractor-permit-research.html">Subcontractor permit research</a>
        <a class="button secondary" href="/nyc-permit-activity-by-zip.html">Permit activity by ZIP</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('contractor-permit-research')}">Buy instant ZIP</a>
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

function realEstateInvestorHtml(rows) {
  const description = 'A buyer-focused guide for real estate investors and acquisition researchers using the NYC construction activity ZIP for weekly permit screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('real-estate-investor-permit-research'));
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
          text: 'It is for real estate investors, acquisition researchers, small developers, and analysts who screen selected public NYC DOB permit activity before deeper source research.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can this replace due diligence?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Use it to narrow a weekly review list, then verify rows at the public source URL before making investment, underwriting, outreach, or planning decisions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP include owner contacts or full addresses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, and enriched contact data.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Real Estate Investor Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/real-estate-investor-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Real Estate Investor Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/real-estate-investor-permit-research.html">
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
      <h1>NYC permit research for real estate investors.</h1>
      <p class="lede">Use the current issue to screen selected DOB NOW permit rows by borough, ZIP, work type, issued date, status, cost bucket, and source link before deeper property or market research.</p>

      <section class="grid">
        <div class="card">
          <h2>Acquisition screens</h2>
          <p>Check where selected public permit activity is clustering before deciding which records deserve manual review.</p>
        </div>
        <div class="card">
          <h2>Market research</h2>
          <p>Sort the current issue by borough, ZIP, work type, issued date, and cost bucket without starting from the raw source export.</p>
        </div>
        <div class="card">
          <h2>Source checks</h2>
          <p>Use the buyer workbook to build a short list, then open the public source URL for each row that matters.</p>
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
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Investor review pass</h2>
        <ol>
          <li>Open the public preview and confirm the fields fit your weekly screen.</li>
          <li>Check the ZIP, borough, work-type, and cost-bucket pages for territory fit.</li>
          <li>Buy the ZIP only if the full current issue saves enough sorting time for this week's review.</li>
          <li>After checkout, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before using any row in underwriting, outreach, or planning, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful investor research pages</h2>
        <ul>
          <li><a href="/topics/nyc-real-estate-investor-permit-research.html">NYC real estate investor permit research</a></li>
          <li><a href="/topics/nyc-commercial-renovation-permits.html">NYC commercial renovation permits</a></li>
          <li><a href="/topics/nyc-renovation-permit-leads.html">NYC renovation permit research</a></li>
          <li><a href="/topics/nyc-construction-market-research-csv.html">NYC construction market research CSV</a></li>
          <li><a href="/topics/nyc-permit-activity-by-zip.html">NYC permit activity by ZIP</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Real estate investor permit research',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, enriched contact data, agency endorsement, valuation advice, investment advice, legal advice, or filing advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/current-issue.html">Current issue highlights</a>
        <a class="button secondary" href="/sample-segments.html">Browse buyer-intent pages</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/broker-developer-permit-research.html">Broker and developer guide</a>
        <a class="button secondary" href="/nyc-permit-activity-by-zip.html">Permit activity by ZIP</a>
        <a class="button secondary" href="/manhattan-construction-permit-activity.html">Manhattan activity</a>
        <a class="button secondary" href="/brooklyn-construction-permit-activity.html">Brooklyn activity</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('real-estate-investor-permit-research')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function constructionConsultantHtml(rows) {
  const description = 'A buyer-focused guide for construction consultants and permit researchers using the NYC construction activity ZIP for weekly source-backed permit screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('construction-consultant-permit-research'));
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
          text: 'It is for construction consultants, permit researchers, and local market research teams that screen selected public NYC DOB permit activity before client research or market scans.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can this replace source review?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Use it to narrow a weekly review list, then verify rows at the public source URL before using them in client work, outreach, planning, or analysis.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the ZIP include private contacts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, and enriched contact data.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Construction Consultant Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/construction-consultant-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Construction Consultant Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/construction-consultant-permit-research.html">
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
      <h1>NYC permit research for construction consultants.</h1>
      <p class="lede">Use the current issue to screen selected DOB NOW permit rows by borough, ZIP, work type, issued date, status, cost bucket, and source link before client research or market scans.</p>

      <section class="grid">
        <div class="card">
          <h2>Client research</h2>
          <p>Build a short weekly source-check list before adding permit activity to client notes or research memos.</p>
        </div>
        <div class="card">
          <h2>Market scans</h2>
          <p>Sort the current issue by borough, ZIP, work type, issued date, and cost bucket without starting from the raw source export.</p>
        </div>
        <div class="card">
          <h2>Source checks</h2>
          <p>Use the buyer workbook and priority slices to decide which rows deserve manual review at the public source URL.</p>
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
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Consultant review pass</h2>
        <ol>
          <li>Open the public preview and confirm the fields fit this week's client or market research screen.</li>
          <li>Check the ZIP, borough, work-type, and cost-bucket pages for territory fit.</li>
          <li>Buy the ZIP only if the full current issue saves enough sorting time for the review.</li>
          <li>After checkout, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before using any row in client work, outreach, planning, or analysis, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful consultant research pages</h2>
        <ul>
          <li><a href="/topics/nyc-permit-data-for-construction-consultants.html">NYC permit data for construction consultants</a></li>
          <li><a href="/topics/nyc-construction-market-research-csv.html">NYC construction market research CSV</a></li>
          <li><a href="/topics/nyc-contractor-market-research.html">NYC contractor market research</a></li>
          <li><a href="/topics/nyc-dob-permit-monitoring.html">NYC DOB permit monitoring</a></li>
          <li><a href="/topics/nyc-permit-activity-by-zip.html">NYC permit activity by ZIP</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Construction consultant permit research',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, enriched contact data, agency endorsement, valuation advice, investment advice, legal advice, client advice, or filing advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
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
        <a class="button secondary" href="/real-estate-investor-permit-research.html">Real estate investor permit research</a>
        <a class="button secondary" href="/nyc-permit-activity-by-zip.html">Permit activity by ZIP</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('construction-consultant-permit-research')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function constructionRiskHtml(rows) {
  const description = 'A buyer-focused guide for risk, lending, compliance, and due-diligence researchers using the NYC construction activity ZIP for weekly public-record screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const boroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('construction-risk-permit-research'));
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
          text: 'It is for insurance teams, lenders, compliance researchers, due-diligence analysts, and consultants who screen selected public NYC DOB permit activity before manual source review.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this include underwriting, legal, or compliance advice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a public-record screening file. It does not include underwriting advice, legal advice, compliance advice, insurance advice, valuation advice, or agency endorsement.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should a risk researcher verify?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the CSV to narrow a review list, then open the public source URL for any row that may affect research, reporting, diligence, or routing decisions.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Construction Risk Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/construction-risk-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Construction Risk Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/construction-risk-permit-research.html">
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
      <h1>NYC construction risk permit research.</h1>
      <p class="lede">Use the current issue to screen selected DOB NOW permit rows by borough, ZIP, work type, issued date, status, cost bucket, and source link before risk, lending, compliance, or due-diligence review.</p>

      <section class="grid">
        <div class="card">
          <h2>Risk screens</h2>
          <p>Build a short source-check list before adding permit activity to internal research notes.</p>
        </div>
        <div class="card">
          <h2>Lending research</h2>
          <p>Sort selected public rows by territory, work type, issued date, status, and cost bucket before deeper review.</p>
        </div>
        <div class="card">
          <h2>Diligence support</h2>
          <p>Use the buyer workbook and priority slices to decide which source records need manual verification first.</p>
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
          <li>Status mix: ${escapeHtml(statusMix)}.</li>
          <li>Top ZIPs: ${escapeHtml(zipMix)}.</li>
          <li>Top work types: ${escapeHtml(workTypeMix)}.</li>
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Risk review pass</h2>
        <ol>
          <li>Open the public preview and confirm the fields fit this week's research screen.</li>
          <li>Check the ZIP, borough, work-type, status, and cost-bucket pages for review fit.</li>
          <li>Buy the ZIP only if the full current issue saves enough sorting time for the review.</li>
          <li>After checkout, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before using any row in research, reporting, diligence, or routing decisions, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful risk research pages</h2>
        <ul>
          <li><a href="/topics/nyc-construction-risk-permit-research.html">NYC construction risk permit research</a></li>
          <li><a href="/topics/nyc-dob-permit-monitoring.html">NYC DOB permit monitoring</a></li>
          <li><a href="/topics/nyc-construction-market-research-csv.html">NYC construction market research CSV</a></li>
          <li><a href="/topics/nyc-dob-now-public-records.html">NYC DOB NOW public records</a></li>
          <li><a href="/topics/nyc-permit-activity-by-zip.html">NYC permit activity by ZIP</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Construction risk permit research',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, enriched contact data, agency endorsement, underwriting advice, insurance advice, valuation advice, investment advice, legal advice, compliance advice, or filing advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/current-issue.html">Current issue highlights</a>
        <a class="button secondary" href="/sample-segments.html">Browse buyer-intent pages</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/construction-consultant-permit-research.html">Construction consultant permit research</a>
        <a class="button secondary" href="/real-estate-investor-permit-research.html">Real estate investor permit research</a>
        <a class="button secondary" href="/nyc-permit-activity-by-zip.html">Permit activity by ZIP</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('construction-risk-permit-research')}">Buy instant ZIP</a>
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

function propertyManagerHtml(rows) {
  const description = 'A buyer-focused guide for property managers, building operators, and local service teams using the NYC construction activity ZIP for weekly permit screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const product = productJsonLd(description, checkoutHref('property-manager-permit-research'));
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
          text: 'It is for property managers, building operators, maintenance vendors, and local service teams that review selected public NYC DOB permit activity by ZIP, work type, issued date, status, and source link.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this include tenant, owner, or applicant contacts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes owner names, applicant names, phone numbers, email addresses, full street addresses, tenant data, and enriched contact data.',
        },
      },
      {
        '@type': 'Question',
        name: 'How should a property manager use it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the CSV to narrow a weekly review list by ZIP, work type, status, and source URL, then verify relevant rows in the public source record before routing work or contacting anyone.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Property Manager Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/property-manager-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Property Manager Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/property-manager-permit-research.html">
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
      <h1>NYC permit research for property managers.</h1>
      <p class="lede">Use the current issue to screen selected public DOB NOW permit rows by ZIP, borough, work type, issued date, status, cost bucket, and source link before building a maintenance or vendor review list.</p>

      <section class="grid">
        <div class="card">
          <h2>Property managers</h2>
          <p>Check selected public permit activity around managed ZIPs before opening individual DOB NOW records.</p>
        </div>
        <div class="card">
          <h2>Building operators</h2>
          <p>Sort by work type, status, issued date, and source link for a faster weekly operations screen.</p>
        </div>
        <div class="card">
          <h2>Service teams</h2>
          <p>Use the buyer workbook and priority slices to decide which rows deserve source-record review first.</p>
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
        <h2>Property management review pass</h2>
        <ol>
          <li>Open the public preview and confirm the selected ZIPs or work types match your current review area.</li>
          <li>Use the segment hub to check ZIP, borough, work-type, and issued-date pages before checkout.</li>
          <li>Buy the ZIP only if the full file saves enough sorting time for this week's review.</li>
          <li>After checkout, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before routing work or contacting anyone, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful property research pages</h2>
        <ul>
          <li><a href="/topics/nyc-property-manager-permit-research.html">NYC property manager permit research</a></li>
          <li><a href="/topics/nyc-building-services-permit-research.html">NYC building services permit research</a></li>
          <li><a href="/topics/nyc-building-permit-alerts-by-zip.html">NYC building permit alerts by ZIP</a></li>
          <li><a href="/topics/nyc-dob-permit-monitoring.html">NYC DOB permit monitoring</a></li>
          <li><a href="/topics/nyc-permit-activity-by-zip.html">NYC permit activity by ZIP</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Property management permit research',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No tenant data, owner names, applicant names, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, property management advice, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
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
        <a class="button secondary" href="/permit-expediter-research.html">Permit expediter guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('property-manager-permit-research')}">Buy instant ZIP</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function buildingServiceVendorHtml(rows) {
  const description = 'A buyer-focused guide for building-service vendors, maintenance firms, equipment rental desks, and local B2B operators using the NYC construction activity ZIP for weekly permit screening.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 5);
  const statusMix = describeCounts(rows, (row) => row.permit_status, 5);
  const costMix = describeCounts(rows, (row) => costBucketLabel(row.estimated_job_cost_bucket), 6);
  const product = productJsonLd(description, checkoutHref('building-service-vendor-permit-research'));
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
          text: 'It is for security, cleaning, waste, equipment rental, maintenance, and other building-service vendors that screen selected public NYC DOB permit activity before manual source checks.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this include building owner or contractor contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The ZIP excludes owner names, applicant names, contractor contacts, phone numbers, email addresses, full street addresses, tenant data, and enriched contact data.',
        },
      },
      {
        '@type': 'Question',
        name: 'How should a local service firm use it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the preview to check territory and work-type fit, buy the ZIP only if the full file saves sorting time, then verify useful rows at the source URL.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Building-Service Vendor Permit Research | NYC Construction Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/building-service-vendor-permit-research.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Building-Service Vendor Permit Research | NYC Construction Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/building-service-vendor-permit-research.html">
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
      <h1>NYC permit research for building-service vendors.</h1>
      <p class="lede">Use the current issue to screen selected public DOB NOW permit rows by ZIP, borough, work type, issued date, status, cost bucket, and source link before building a weekly territory review list.</p>

      <section class="grid">
        <div class="card">
          <h2>Local service vendors</h2>
          <p>Check selected public permit activity before deciding which work types or ZIPs deserve source-record review.</p>
        </div>
        <div class="card">
          <h2>Equipment and maintenance teams</h2>
          <p>Sort by ZIP, work type, issued date, status, and cost bucket before opening individual DOB NOW records.</p>
        </div>
        <div class="card">
          <h2>Owner-operators</h2>
          <p>Use the buyer workbook and priority slices to build a short manual review list without sorting the raw source export first.</p>
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
          <li>Cost buckets: ${escapeHtml(costMix)}.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Vendor review pass</h2>
        <ol>
          <li>Open the free preview and confirm the selected fields fit your weekly screen.</li>
          <li>Check building-service, ZIP, work-type, and borough pages before checkout.</li>
          <li>Buy the ZIP only if the full current issue saves enough sorting time for this week's review.</li>
          <li>After checkout, open <code>buyer-workbook.md</code> and <code>buyer-priority-slices.csv</code>.</li>
          <li>Before using any row for territory planning, quoting, outreach, or routing notes, open <code>source_url</code> and verify the current public record.</li>
        </ol>
      </section>

      <section class="section card">
        <h2>Useful building-service research pages</h2>
        <ul>
          <li><a href="/topics/nyc-building-services-permit-research.html">NYC building services permit research</a></li>
          <li><a href="/topics/nyc-local-service-provider-permit-research.html">NYC permit research for local service providers</a></li>
          <li><a href="/topics/nyc-property-manager-permit-research.html">NYC property manager permit research</a></li>
          <li><a href="/topics/nyc-building-permit-alerts-by-zip.html">NYC building permit alerts by ZIP</a></li>
          <li><a href="/topics/nyc-permit-activity-by-zip.html">NYC permit activity by ZIP</a></li>
        </ul>
      </section>

${sampleRequestSection({
    workType: 'Building-service vendor permit research',
    territory: 'NYC',
  })}
      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No tenant data, owner names, applicant names, contractor contacts, phone numbers, email addresses, full street addresses, enriched contact data, agency endorsement, procurement advice, property management advice, or legal advice are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
        <a class="button secondary" href="/current-issue.html">Current issue highlights</a>
        <a class="button secondary" href="/sample-segments.html">Browse buyer-intent pages</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button secondary" href="/who-should-buy.html">Who should buy</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/property-manager-permit-research.html">Property manager permit research</a>
        <a class="button secondary" href="/nyc-permit-activity-by-zip.html">Permit activity by ZIP</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button" href="${checkoutHref('building-service-vendor-permit-research')}">Buy instant ZIP</a>
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
  const product = productJsonLd(description, checkoutBridgeHref('current-issue-page'));
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
        <a class="button" href="${checkoutBridgeHref('current-issue-page')}">Buy instant ZIP</a>
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
      <p>
        <a class="button" href="${checkoutBridgeHref('time-saved-calculator-top')}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/pricing.html">Check pricing</a>
      </p>
      <p class="fine">Stripe checkout opens after your click. Use the CSV preview first if you need to confirm the row shape.</p>

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
      <p>
        <a class="button" href="${checkoutBridgeHref('who-should-buy-top')}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
      </p>
      <p class="fine">Stripe checkout opens after your click. Use the CSV preview first if you need to confirm the row shape.</p>

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
      <p>
        <a class="button" href="${checkoutBridgeHref('delivery-top')}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
      </p>
      <p class="fine">Stripe checkout opens after your click. Use the CSV preview first if you need to confirm the row shape.</p>

      <section class="grid">
        <div class="card">
          <h2>1. Pay in Stripe</h2>
          <p>Use the buy page or checkout bridge. The site creates a product-scoped Stripe Checkout Session, with the hosted Payment Link kept as fallback.</p>
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
      <p>
        <a class="button" href="${checkoutBridgeHref('pricing-top')}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/free-vs-paid.html">Compare free vs paid</a>
      </p>
      <p class="fine">Stripe checkout opens after your click. Use the CSV preview first if you need to confirm the row shape.</p>

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
      <p>
        <a class="button" href="${checkoutBridgeHref('inside-the-zip-top')}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/free-vs-paid.html">Compare free vs paid</a>
      </p>
      <p class="fine">Stripe checkout opens after your click. Use the CSV preview first if you need to confirm the row shape.</p>

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
      <p>
        <a class="button" href="${checkoutBridgeHref('support-top')}">Buy $9.50 ZIP</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
      </p>
      <p class="fine">Stripe checkout opens after your click. Use the CSV preview first if you need to confirm the row shape.</p>

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
                <td>Stripe did not confirm a paid completed Checkout Session for this product.</td>
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
          <p>${escapeHtml(rows.length)} source-linked rows for the ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(rows[0]?.source_fetch_date || range.latestIssuedDate)} source window. Latest issued row in the file: ${escapeHtml(range.latestIssuedDate)}. If that fits, buy the instant ZIP.</p>
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

function invoiceRequestHtml(rows) {
  const description = 'Request product-specific invoice or procurement help for the NYC Weekly Construction Activity Brief current issue ZIP.';
  const range = sampleRange(rows);
  const product = productJsonLd(description, checkoutHref('invoice-request-page'));
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I request invoice help before buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Use this product-specific request page if card checkout is blocked by internal invoice, purchase order, or procurement approval.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this deliver the paid ZIP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Paid ZIP delivery still requires a completed Stripe Checkout Session and the verified success page.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens to the request?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The request is tagged for this product and used to identify invoice or procurement-blocked buyer interest.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Invoice Request | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/invoice-request.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="Invoice Request | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/invoice-request.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Request invoice help for the current issue.</h1>
      <p class="lede">Use this page when the $9.50 card checkout is blocked by an internal invoice, purchase order, or procurement approval process.</p>
      <p>
        <a class="button" href="${checkoutHref('invoice-request-top')}">Try card checkout</a>
        <a class="button secondary" href="#sample-request">Send invoice request</a>
        <a class="button secondary" href="/buy.html">Review buy page</a>
      </p>
      <p class="fine">This captures product interest only. Paid ZIP delivery still requires a completed Stripe Checkout Session.</p>

      <section class="grid">
        <div class="card">
          <h2>Current ZIP</h2>
          <p>${escapeHtml(rows.length)} source-linked rows for the ${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(rows[0]?.source_fetch_date || range.latestIssuedDate)} source window.</p>
        </div>
        <div class="card">
          <h2>Use this if</h2>
          <p>Your team needs invoice, purchase order, or procurement approval before using a card.</p>
        </div>
        <div class="card">
          <h2>Boundary</h2>
          <p>No private contacts, owner names, full street addresses, agency endorsement, guaranteed leads, or procurement advice.</p>
        </div>
      </section>

${sampleRequestSection({
        heading: 'Send invoice or procurement request',
        intro: 'Use this form when card checkout is blocked by invoice, purchase order, or procurement approval. The request is tagged for this product and does not deliver the paid ZIP.',
        workType: 'Selected DOB work types',
        territory: 'NYC',
        buyerType: 'data-buyer',
        monitoringGoal: 'Invoice or procurement approval needed before buying the current issue ZIP.',
        consentCopy: 'You may reply about this invoice or procurement request.',
        buttonCopy: 'Send invoice request',
        statusCopy: 'This does not join the MagickMe newsletter. Paid ZIP delivery still requires completed Stripe checkout.',
        fallbackSubject: 'NYC Construction Brief invoice request',
        fallbackSourceLabel: 'Invoice request source',
        successCopy: 'Invoice request saved. I will use this to follow up on procurement-blocked buyer interest.',
        failedCopy: 'Invoice request was not saved.',
        emailFallbackLabel: 'Email this invoice request',
        eventPrefix: 'invoice_request',
      })}

      <section class="section card">
        <h2>Before you request</h2>
        <ul>
          <li>Use Stripe checkout if a card purchase is allowed.</li>
          <li>Use the free preview if you need to confirm the row shape first.</li>
          <li>Do not send card numbers, bank details, passwords, or confidential client data.</li>
        </ul>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Open free CSV preview</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
      </section>
    </main>
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function faqHtml(rows) {
  const description = 'Plain answers about the current NYC construction activity ZIP, including price, files, delivery, source limits, privacy boundary, and support.';
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const workTypeMix = describeCounts(rows, (row) => row.work_type, 7);
  const zipMix = describeCounts(rows, (row) => row.zip_code, 6);
  const product = productJsonLd(description, checkoutHref('faq'));
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What do I get after buying the current issue?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You get a ZIP with the full ${rows.length}-row current issue CSV, buyer workbook, priority-slices CSV, source registry, QA report, buyer README, version file, and claims boundary.`,
        },
      },
      {
        '@type': 'Question',
        name: 'How is the ZIP delivered?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Stripe redirects completed buyers to the success page. The download endpoint verifies the paid Checkout Session before serving the ZIP in the browser.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I inspect the data before paying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The public preview includes 25 rows, CSV, JSON, JSONL, a Markdown sample brief, data package metadata, and segment pages.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the brief include private contact data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this a lead list?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. It is a public-record screening file. It does not guarantee leads, buying intent, project value, or sales outcomes.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should I verify before using a row?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Open the source URL and check the current public DOB record before outreach, quoting, routing, reporting, or planning.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FAQ | NYC Construction Activity Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/faq.html">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="FAQ | NYC Construction Activity Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/faq.html">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body>
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>Questions buyers ask before checkout.</h1>
      <p class="lede">Use this page to check price, files, source limits, delivery, privacy boundary, and support before buying the current issue ZIP.</p>

      <section class="grid">
        <div class="card">
          <h2>Current price</h2>
          <p class="price">$9.50</p>
          <p>One-time launch price for the current issue ZIP. No subscription or promo code is required.</p>
        </div>
        <div class="card">
          <h2>Current issue</h2>
          <p>${escapeHtml(rows.length)} paid rows from selected NYC DOB NOW approved permit activity. The free preview has 25 rows.</p>
        </div>
        <div class="card">
          <h2>Delivery</h2>
          <p>Instant browser download after Stripe confirms a paid Checkout Session for this product.</p>
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
        <h2>Payment and delivery</h2>
        <h3>What happens after I pay?</h3>
        <p>Stripe redirects the completed Checkout Session to the success page. The site verifies that paid session before serving the ZIP.</p>
        <h3>Is delivery handled by email?</h3>
        <p>No. Delivery is an instant browser download. The product does not rely on a fulfillment email.</p>
        <h3>What if the download does not start?</h3>
        <p>The success page keeps a manual download button. The support page explains common missing-session, unpaid-session, expired-session, and browser-download cases.</p>
      </section>

      <section class="section card">
        <h2>Files and preview</h2>
        <h3>What files are included?</h3>
        <p>The paid ZIP includes the full CSV, Markdown brief, buyer workbook, priority-slices CSV, source registry, QA report, buyer README, version file, and privacy/claims boundary.</p>
        <h3>Can I inspect the row shape before checkout?</h3>
        <p>Yes. Use the browser preview, CSV preview, JSON preview, JSONL preview, Markdown sample brief, field guide, and data package JSON before paying.</p>
        <h3>What is the difference between free and paid?</h3>
        <p>The free preview has 25 public rows. The paid ZIP has the full current issue and buyer files for a faster review pass.</p>
      </section>

      <section class="section card">
        <h2>Source and privacy boundary</h2>
        <h3>Where does the data come from?</h3>
        <p>The current issue uses selected rows from NYC DOB NOW: Build - Approved Permits, published through NYC Open Data.</p>
        <h3>Does it include contacts?</h3>
        <p>No. It excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data.</p>
        <h3>Is it a lead list?</h3>
        <p>No. It is a public-record screening file. It does not guarantee leads, buying intent, project value, or sales outcomes.</p>
      </section>

      <section class="section card">
        <h2>Before buying</h2>
        <ol>
          <li>Open the free preview and confirm the columns fit your work.</li>
          <li>Check the segment hub for your ZIP, borough, work type, date, or cost bucket.</li>
          <li>Read the file list and delivery page if you need a clear package boundary.</li>
          <li>Buy the ZIP only if the current issue saves enough manual sorting time.</li>
          <li>Verify source URLs before outreach, quoting, routing, reporting, or planning.</li>
        </ol>
        <a class="button secondary" href="/preview.html">View public preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download CSV preview</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/delivery.html">Read delivery steps</a>
        <a class="button secondary" href="/support.html">Support and refunds</a>
        <a class="button secondary" href="#sample-request">Request sample cut</a>
        <a class="button" href="${checkoutHref('faq')}">Buy instant ZIP</a>
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

function previewHtml(fullRows) {
  const publicRows = parseCsv(fs.readFileSync(publicPreviewCsvPath, 'utf8'));
  const rows = previewRows(publicRows);
  const range = sampleRange(fullRows);
  const fetchDate = fullRows[0] && fullRows[0].source_fetch_date;
  const workTypeOptions = [...new Set(rows.map((row) => row.workType))].sort();
  const zipOptions = [...new Set(rows.map((row) => row.zipCode))].sort();
  const description = `Browse the ${rows.length}-row public preview for the current NYC construction activity brief before buying the full ${fullRows.length}-row ZIP.`;
  const product = productJsonLd(description, checkoutBridgeHref('preview'));
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
        <div class="preview-filter" data-preview-filter>
          <div class="filter-grid">
            <label>
              Work type
              <select data-preview-work-type>
                <option value="">All work types</option>
${workTypeOptions.map((workType) => `                <option value="${escapeHtml(workType)}">${escapeHtml(workType)}</option>`).join('\n')}
              </select>
            </label>
            <label>
              ZIP
              <select data-preview-zip>
                <option value="">All ZIPs</option>
${zipOptions.map((zipCode) => `                <option value="${escapeHtml(zipCode)}">${escapeHtml(zipCode)}</option>`).join('\n')}
              </select>
            </label>
            <label>
              Keyword
              <input data-preview-query type="search" inputmode="search" placeholder="Search work type, ZIP, status, cost bucket">
            </label>
          </div>
          <p class="fine" data-preview-count>${rows.length} preview rows shown.</p>
        </div>
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
${rows.map((row) => `              <tr data-preview-row data-work-type="${escapeHtml(row.workType)}" data-zip="${escapeHtml(row.zipCode)}" data-search="${escapeHtml(`${row.workType} ${row.borough} ${row.zipCode} ${row.issuedDate} ${row.status} ${row.costBucket}`.toLowerCase())}">
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
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">Download JSON preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">Download JSONL preview</a>
        <a class="button secondary" href="/sample/nyc-weekly-construction-activity-sample.md">Read sample brief</a>
        <a class="button secondary" href="/sample-segments.html">Browse segment pages</a>
        <a class="button secondary" href="/free-vs-paid.html">Free vs paid</a>
        <a class="button secondary" href="/permit-research-workflow.html">Research workflow</a>
        <a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/csv-field-guide.html">CSV field guide</a>
        <a class="button" href="${checkoutBridgeHref('preview')}">Buy instant ZIP</a>
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
    <script>
      (() => {
        const rows = Array.from(document.querySelectorAll('[data-preview-row]'));
        const workType = document.querySelector('[data-preview-work-type]');
        const zip = document.querySelector('[data-preview-zip]');
        const query = document.querySelector('[data-preview-query]');
        const count = document.querySelector('[data-preview-count]');
        if (!rows.length || !workType || !zip || !query || !count) return;
        const track = (data) => {
          try {
            window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
            window.va('event', { name: 'preview_filter_changed', data });
          } catch (error) {}
        };
        let trackTimer;
        function applyFilters() {
          const selectedWorkType = workType.value;
          const selectedZip = zip.value;
          const term = query.value.trim().toLowerCase();
          let visible = 0;
          for (const row of rows) {
            const matchesWorkType = !selectedWorkType || row.dataset.workType === selectedWorkType;
            const matchesZip = !selectedZip || row.dataset.zip === selectedZip;
            const matchesTerm = !term || row.dataset.search.includes(term);
            const show = matchesWorkType && matchesZip && matchesTerm;
            row.hidden = !show;
            if (show) visible += 1;
          }
          count.textContent = visible + ' of ' + rows.length + ' preview rows shown.';
          window.clearTimeout(trackTimer);
          trackTimer = window.setTimeout(() => track({
            work_type: selectedWorkType || 'all',
            zip: selectedZip || 'all',
            has_query: Boolean(term),
            visible_rows: visible,
          }), 350);
        }
        workType.addEventListener('change', applyFilters);
        zip.addEventListener('change', applyFilters);
        query.addEventListener('input', applyFilters);
      })();
    </script>
  </body>
</html>
`;
}

function boroughExpansionHtml(rows, config) {
  const range = sampleRange(rows);
  const fetchDate = rows[0] && rows[0].source_fetch_date;
  const currentBoroughMix = describeCounts(rows, (row) => titleCase(row.borough), 5);
  const currentZipMix = describeCounts(rows, (row) => row.zip_code, 8);
  const description = `${config.boroughName} construction permit activity request page for buyers who need future NYC DOB permit samples by borough, ZIP, work type, and issued date.`;
  const pageUrl = `${baseUrl}/${config.pageSlug}.html`;
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${config.boroughName} Construction Permit Activity Request`,
    description,
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'NYC Weekly Construction Activity Brief',
      url: baseUrl,
    },
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Does the current issue include ${config.boroughName} permit rows?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `No. The current paid issue is limited to selected Manhattan and Brooklyn rows. This page collects ${config.boroughName} sample requests for future cuts.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I request ${config.boroughName} ZIP coverage?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. Send the ZIP codes, borough, work types, and review goal you want covered. Requests help choose future public preview cuts.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Does this add me to a newsletter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The sample request is product-specific and does not join the MagickMe newsletter.',
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(config.boroughName)} Construction Permit Activity Request | NYC Brief</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${pageUrl}">
${alternateDiscoveryLinks()}
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(config.boroughName)} Construction Permit Activity Request | NYC Brief">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${pageUrl}">
${socialImageMeta()}
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(webPage)}</script>
    <script type="application/ld+json">${jsonScript(datasetJsonLd(rows))}</script>
    <script type="application/ld+json">${jsonScript(faq)}</script>
    ${analyticsSnippet()}
  </head>
  <body class="has-conversion-bar">
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>${escapeHtml(config.boroughName)} construction permit activity request.</h1>
      <p class="lede">The current issue does not include ${escapeHtml(config.boroughName)} rows. Use this page to request a future ${escapeHtml(config.boroughName)} sample cut by ZIP, work type, and review goal.</p>
      <p>
        <a class="button" href="#sample-request">Request ${escapeHtml(config.boroughName)} sample cut</a>
        <a class="button secondary" href="/current-issue.html">Check current issue</a>
      </p>

      <section class="grid">
        <div class="card">
          <h2>Current boroughs</h2>
          <p>${escapeHtml(currentBoroughMix)}.</p>
        </div>
        <div class="card">
          <h2>Current ZIPs</h2>
          <p>${escapeHtml(currentZipMix)}.</p>
        </div>
        <div class="card">
          <h2>Current source window</h2>
          <p>${escapeHtml(range.firstIssuedDate)} to ${escapeHtml(fetchDate || range.latestIssuedDate)}.</p>
        </div>
      </section>

      <section class="section card">
        <h2>What to request</h2>
        <p>Send the ${escapeHtml(config.boroughName)} ZIPs and work types you would actually review each week. Useful requests name a territory, a trade, and what decision the CSV should help with.</p>
        <ul>
          <li>Example ZIPs: ${escapeHtml(config.zipExamples)}.</li>
          <li>Useful work types: sidewalk shed, plumbing, sprinkler, mechanical systems, supported scaffold, structural, or construction fence.</li>
          <li>Useful buyer context: contractor, supplier, property manager, broker, consultant, permit expediter, or local service provider.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Current coverage boundary</h2>
        <p>The paid ZIP available today covers selected Manhattan and Brooklyn records only. Do not buy it for ${escapeHtml(config.boroughName)} coverage unless the current issue page shows rows that fit your territory.</p>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download current CSV preview</a>
        <a class="button secondary" href="/manhattan-construction-permit-activity.html">Manhattan activity</a>
        <a class="button secondary" href="/brooklyn-construction-permit-activity.html">Brooklyn activity</a>
        <a class="button secondary" href="/nyc-permit-activity-by-zip.html">ZIP activity page</a>
        <a class="button secondary" href="/sample-request.html">General sample request</a>
      </section>

${sampleRequestSection({
        heading: `Request ${config.boroughName} sample cut`,
        intro: `Send one ${config.boroughName} request if this borough is the territory you need covered in a future public preview.`,
        workType: `${config.boroughName} construction permit activity`,
        territory: config.boroughName,
        monitoringGoal: `I need ${config.boroughName} permit activity by ZIP, work type, issued date, status, and source link.`,
        buttonCopy: `Send ${config.boroughName} request`,
        fallbackSubject: `NYC Construction Brief ${config.boroughName} sample request`,
        fallbackSourceLabel: `${config.boroughName} sample request source`,
        successCopy: `${config.boroughName} request saved. I will use this to choose future sample cuts.`,
        failedCopy: `${config.boroughName} request was not saved.`,
        currentIssueCta: false,
      })}
    </main>
${boroughRequestConversionBar(config)}
    ${sampleRequestScript()}
  </body>
</html>
`;
}

function sitemapXml(pages) {
  const urls = ['', 'current-issue.html', 'dataset-catalog.html', 'preview.html', 'buy.html', 'pricing.html', 'time-saved-calculator.html', 'who-should-buy.html', 'faq.html', 'free-vs-paid.html', 'permit-research-workflow.html', 'contractor-permit-research.html', 'contractor-supplier-permit-research.html', 'material-supplier-permit-research.html', 'building-service-vendor-permit-research.html', 'subcontractor-permit-research.html', 'broker-developer-permit-research.html', 'real-estate-investor-permit-research.html', 'construction-consultant-permit-research.html', 'construction-risk-permit-research.html', 'permit-expediter-research.html', 'property-manager-permit-research.html', 'inside-the-zip.html', 'csv-field-guide.html', 'nyc-dob-permit-data-download.html', 'nyc-building-permits.html', 'nyc-building-permit-data.html', 'nyc-dob-approved-permits.html', 'nyc-dob-now-approved-permits.html', 'dob-now-build-approved-permits.html', 'nyc-dob-permit-alerts.html', 'nyc-dob-permit-tracker.html', 'nyc-dob-permit-monitoring.html', 'nyc-dob-permit-watchlist.html', 'nyc-dob-permit-search.html', 'nyc-construction-permit-search.html', 'nyc-dob-permit-lookup.html', 'nyc-dob-permit-csv.html', 'nyc-permit-data-api-alternative.html', 'weekly-nyc-construction-permit-report.html', 'dob-now-permit-search-alternative.html', 'nyc-construction-permit-leads.html', 'nyc-permit-activity-by-zip.html', 'manhattan-construction-permit-activity.html', 'brooklyn-construction-permit-activity.html', 'queens-construction-permit-activity.html', 'bronx-construction-permit-activity.html', 'staten-island-construction-permit-activity.html', 'nyc-sidewalk-shed-permits.html', 'nyc-sidewalk-shed-permit-leads.html', 'nyc-supported-scaffold-permit-leads.html', 'nyc-plumbing-permit-leads.html', 'nyc-plumbing-permits.html', 'nyc-sprinkler-permit-leads.html', 'nyc-sprinkler-permits.html', 'nyc-mechanical-systems-permit-leads.html', 'nyc-mechanical-systems-permits.html', 'nyc-supported-scaffold-permits.html', 'nyc-structural-permit-leads.html', 'nyc-structural-permits.html', 'nyc-construction-fence-permit-leads.html', 'nyc-construction-fence-permits.html', 'buyer-guide.html', 'delivery.html', 'support.html', 'sample-request.html', 'invoice-request.html', 'sample-segments.html', 'methodology.html', 'sample/nyc-construction-activity-preview.csv', 'sample/nyc-construction-activity-preview.json', 'sample/nyc-construction-activity-preview.jsonl', 'sample/nyc-weekly-construction-activity-sample.md', 'feed.xml', 'feed.json', 'current-issue.json', 'data-package.json', 'product-feed.xml', 'llms.txt', ...pages.map((page) => `topics/${page.slug}.html`)];
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
  index = index.replace(
    /      <section class="section card">\n        <h2>Exterior access buyers<\/h2>\n[\s\S]*?      <\/section>\n\n/g,
    '',
  );
  const replacement = `      <section class="section card">
        <h2>Exterior access buyers</h2>
        <p>The current paid issue includes 40 selected sidewalk shed rows, 13 supported scaffold rows, 9 construction fence rows, and 12 structural rows for facade, masonry, restoration, and exterior-access screening.</p>
        <p><a class="button secondary" href="/topics/nyc-facade-restoration-permit-research.html">Facade restoration permit research</a></p>
        <p><a class="button secondary" href="/topics/nyc-masonry-contractor-permit-research.html">Masonry contractor permit research</a></p>
        <p><a class="button secondary" href="/topics/nyc-exterior-work-permit-research.html">Exterior work permit research</a></p>
        <p><a class="button" href="${checkoutHref('home-exterior-access')}">Buy exterior-access ZIP</a></p>
      </section>

      <section class="section card">
        <h2>Permit topics</h2>
        <p class="fine">These pages explain the current sample by buyer search intent and link back to the same source-linked files.</p>
        <ul>
${manualPageLinks(manualPagesForLinks)}
        </ul>
        <p><a class="button secondary" href="/preview.html">View public preview</a></p>
        <p><a class="button secondary" href="/current-issue.html">Current issue highlights</a></p>
        <p><a class="button secondary" href="/dataset-catalog.html">Dataset catalog</a></p>
        <p><a class="button secondary" href="/who-should-buy.html">Who should buy</a></p>
        <p><a class="button secondary" href="/time-saved-calculator.html">Time saved calculator</a></p>
        <p><a class="button secondary" href="/faq.html">Buyer FAQ</a></p>
        <p><a class="button secondary" href="/free-vs-paid.html">Free vs paid</a></p>
        <p><a class="button secondary" href="/permit-research-workflow.html">Research workflow</a></p>
        <p><a class="button secondary" href="/contractor-permit-research.html">Contractor permit research</a></p>
        <p><a class="button secondary" href="/contractor-supplier-permit-research.html">Contractor and supplier guide</a></p>
        <p><a class="button secondary" href="/material-supplier-permit-research.html">Material supplier permit research</a></p>
        <p><a class="button secondary" href="/building-service-vendor-permit-research.html">Building-service vendor permit research</a></p>
        <p><a class="button secondary" href="/subcontractor-permit-research.html">Subcontractor permit research</a></p>
        <p><a class="button secondary" href="/broker-developer-permit-research.html">Broker and developer guide</a></p>
        <p><a class="button secondary" href="/real-estate-investor-permit-research.html">Real estate investor permit research</a></p>
        <p><a class="button secondary" href="/construction-consultant-permit-research.html">Construction consultant permit research</a></p>
        <p><a class="button secondary" href="/construction-risk-permit-research.html">Construction risk permit research</a></p>
        <p><a class="button secondary" href="/permit-expediter-research.html">Permit expediter guide</a></p>
        <p><a class="button secondary" href="/pricing.html">Check pricing and break-even</a></p>
        <p><a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a></p>
        <p><a class="button secondary" href="/csv-field-guide.html">CSV field guide</a></p>
        <p><a class="button secondary" href="/nyc-building-permits.html">NYC building permits</a></p>
        <p><a class="button secondary" href="/nyc-dob-now-approved-permits.html">DOB NOW approved permits</a></p>
        <p><a class="button secondary" href="/dob-now-build-approved-permits.html">DOB NOW Build approved permits</a></p>
        <p><a class="button secondary" href="/nyc-building-permit-data.html">NYC building permit data</a></p>
        <p><a class="button secondary" href="/nyc-dob-permit-data-download.html">NYC DOB permit data download</a></p>
        <p><a class="button secondary" href="/nyc-dob-approved-permits.html">NYC DOB approved permits</a></p>
        <p><a class="button secondary" href="/nyc-dob-permit-search.html">NYC DOB permit search companion</a></p>
        <p><a class="button secondary" href="/nyc-dob-permit-alerts.html">NYC DOB permit alerts alternative</a></p>
        <p><a class="button secondary" href="/nyc-dob-permit-tracker.html">NYC DOB permit tracker alternative</a></p>
        <p><a class="button secondary" href="/nyc-dob-permit-monitoring.html">NYC DOB permit monitoring alternative</a></p>
        <p><a class="button secondary" href="/nyc-dob-permit-watchlist.html">NYC DOB permit watchlist alternative</a></p>
        <p><a class="button secondary" href="/nyc-construction-permit-search.html">NYC construction permit search companion</a></p>
        <p><a class="button secondary" href="/nyc-dob-permit-lookup.html">NYC DOB permit lookup companion</a></p>
        <p><a class="button secondary" href="/nyc-dob-permit-csv.html">NYC DOB permit CSV</a></p>
        <p><a class="button secondary" href="/nyc-permit-data-api-alternative.html">NYC permit data API alternative</a></p>
        <p><a class="button secondary" href="/weekly-nyc-construction-permit-report.html">Weekly permit report</a></p>
        <p><a class="button secondary" href="/dob-now-permit-search-alternative.html">DOB NOW permit search alternative</a></p>
        <p><a class="button secondary" href="/nyc-construction-permit-leads.html">NYC construction permit leads alternative</a></p>
        <p><a class="button secondary" href="/nyc-permit-activity-by-zip.html">NYC permit activity by ZIP</a></p>
        <p><a class="button secondary" href="/manhattan-construction-permit-activity.html">Manhattan construction permit activity</a></p>
        <p><a class="button secondary" href="/brooklyn-construction-permit-activity.html">Brooklyn construction permit activity</a></p>
        <p><a class="button secondary" href="/queens-construction-permit-activity.html">Queens construction permit activity request</a></p>
        <p><a class="button secondary" href="/bronx-construction-permit-activity.html">Bronx construction permit activity request</a></p>
        <p><a class="button secondary" href="/staten-island-construction-permit-activity.html">Staten Island construction permit activity request</a></p>
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
fs.writeFileSync(path.join(root, 'sample-segments.html'), hubHtml(generatedPages, manualPages));
fs.writeFileSync(path.join(root, 'methodology.html'), methodologyHtml(rows));
fs.writeFileSync(path.join(root, 'buyer-guide.html'), buyerGuideHtml(rows));
fs.writeFileSync(path.join(root, 'csv-field-guide.html'), csvFieldGuideHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-permit-data-download.html'), permitDataDownloadHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-building-permits.html'), buildingPermitsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-building-permit-data.html'), buildingPermitDataHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-approved-permits.html'), dobApprovedPermitsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-now-approved-permits.html'), dobNowApprovedPermitsHtml(rows));
fs.writeFileSync(path.join(root, 'dob-now-build-approved-permits.html'), dobNowBuildApprovedPermitsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-permit-alerts.html'), dobPermitAlertsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-permit-tracker.html'), dobPermitTrackerHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-permit-monitoring.html'), dobPermitMonitoringHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-permit-watchlist.html'), dobPermitWatchlistHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-permit-search.html'), dobPermitSearchHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-construction-permit-search.html'), constructionPermitSearchHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-permit-lookup.html'), dobPermitLookupHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-dob-permit-csv.html'), permitCsvHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-permit-data-api-alternative.html'), permitDataApiAlternativeHtml(rows));
fs.writeFileSync(path.join(root, 'weekly-nyc-construction-permit-report.html'), weeklyPermitReportHtml(rows));
fs.writeFileSync(path.join(root, 'dob-now-permit-search-alternative.html'), dobNowAlternativeHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-construction-permit-leads.html'), permitLeadsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-permit-activity-by-zip.html'), zipActivityHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-sidewalk-shed-permits.html'), sidewalkShedPermitsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-sidewalk-shed-permit-leads.html'), sidewalkShedPermitLeadsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-supported-scaffold-permit-leads.html'), supportedScaffoldPermitLeadsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-plumbing-permit-leads.html'), plumbingPermitLeadsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-plumbing-permits.html'), plumbingPermitsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-sprinkler-permit-leads.html'), sprinklerPermitLeadsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-sprinkler-permits.html'), sprinklerPermitsHtml(rows));
fs.writeFileSync(path.join(root, 'nyc-mechanical-systems-permit-leads.html'), tradePermitLeadsHtml(rows, {
  pageSlug: 'nyc-mechanical-systems-permit-leads',
  checkoutSource: 'mechanical-systems-permit-leads',
  workType: 'Mechanical Systems',
  titleLabel: 'Mechanical Systems',
  labelLower: 'mechanical systems',
  permitsPage: 'nyc-mechanical-systems-permits',
  topicPath: 'topics/nyc-mechanical-systems-permit-csv-sample.html',
  buyerType: 'specialty-subcontractor',
}));
fs.writeFileSync(path.join(root, 'nyc-construction-fence-permit-leads.html'), tradePermitLeadsHtml(rows, {
  pageSlug: 'nyc-construction-fence-permit-leads',
  checkoutSource: 'construction-fence-permit-leads',
  workType: 'Construction Fence',
  titleLabel: 'Construction Fence',
  labelLower: 'construction fence',
  permitsPage: 'nyc-construction-fence-permits',
  topicPath: 'topics/nyc-construction-fence-permits.html',
  buyerType: 'construction-support-vendor',
}));
fs.writeFileSync(path.join(root, 'nyc-structural-permit-leads.html'), tradePermitLeadsHtml(rows, {
  pageSlug: 'nyc-structural-permit-leads',
  checkoutSource: 'structural-permit-leads',
  workType: 'Structural',
  titleLabel: 'Structural',
  labelLower: 'structural',
  permitsPage: 'nyc-structural-permits',
  topicPath: 'topics/nyc-structural-permit-activity.html',
  buyerType: 'specialty-subcontractor',
}));
for (const page of boroughLandingPages) {
  fs.writeFileSync(path.join(root, `${page.pageSlug}.html`), boroughPermitsHtml(rows, page));
}
for (const page of boroughExpansionPages) {
  fs.writeFileSync(path.join(root, `${page.pageSlug}.html`), boroughExpansionHtml(rows, page));
}
for (const page of workTypeLandingPages) {
  fs.writeFileSync(path.join(root, `${page.pageSlug}.html`), workTypePermitsHtml(rows, page));
}
fs.writeFileSync(path.join(root, 'free-vs-paid.html'), freeVsPaidHtml(rows));
fs.writeFileSync(path.join(root, 'permit-research-workflow.html'), researchWorkflowHtml(rows));
fs.writeFileSync(path.join(root, 'contractor-permit-research.html'), contractorHtml(rows));
fs.writeFileSync(path.join(root, 'contractor-supplier-permit-research.html'), contractorSupplierHtml(rows));
fs.writeFileSync(path.join(root, 'material-supplier-permit-research.html'), materialSupplierHtml(rows));
fs.writeFileSync(path.join(root, 'subcontractor-permit-research.html'), subcontractorHtml(rows));
fs.writeFileSync(path.join(root, 'broker-developer-permit-research.html'), brokerDeveloperHtml(rows));
fs.writeFileSync(path.join(root, 'real-estate-investor-permit-research.html'), realEstateInvestorHtml(rows));
fs.writeFileSync(path.join(root, 'construction-consultant-permit-research.html'), constructionConsultantHtml(rows));
fs.writeFileSync(path.join(root, 'construction-risk-permit-research.html'), constructionRiskHtml(rows));
fs.writeFileSync(path.join(root, 'permit-expediter-research.html'), permitExpediterHtml(rows));
fs.writeFileSync(path.join(root, 'property-manager-permit-research.html'), propertyManagerHtml(rows));
fs.writeFileSync(path.join(root, 'building-service-vendor-permit-research.html'), buildingServiceVendorHtml(rows));
fs.writeFileSync(path.join(root, 'current-issue.html'), currentIssueHtml(rows));
fs.writeFileSync(path.join(root, 'time-saved-calculator.html'), timeSavedCalculatorHtml(rows));
fs.writeFileSync(path.join(root, 'who-should-buy.html'), whoShouldBuyHtml(rows));
fs.writeFileSync(path.join(root, 'delivery.html'), deliveryHtml(rows));
fs.writeFileSync(path.join(root, 'pricing.html'), pricingHtml(rows));
fs.writeFileSync(path.join(root, 'inside-the-zip.html'), insideZipHtml(rows));
fs.writeFileSync(path.join(root, 'faq.html'), faqHtml(rows));
fs.writeFileSync(path.join(root, 'support.html'), supportHtml(rows));
fs.writeFileSync(path.join(root, 'sample-request.html'), sampleRequestHtml(rows));
fs.writeFileSync(path.join(root, 'invoice-request.html'), invoiceRequestHtml(rows));
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
updateGeneratedPageMetadata(pages);
updateIndex(manualPages, generatedPages);
applyCoreConversionBars();
applyCoreTopCtas();

console.log(`generated ${pages.length} SEO pages from ${rows.length} source rows`);
