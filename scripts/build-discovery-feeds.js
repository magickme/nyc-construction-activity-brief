const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const socialImageUrl = `${baseUrl}/assets/current-issue-snapshot.png`;
const stripeCheckoutUrl = 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q';
const checkoutUrl = `${baseUrl}/checkout.html?source=current-issue`;
const buyUrl = `${baseUrl}/buy.html`;
const launchPriceUsd = 9.5;
const standardPriceUsd = 49;
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
      currentIssueUrl: `${baseUrl}/current-issue.html`,
      previewUrl: `${baseUrl}/preview.html`,
      csvUrl: `${baseUrl}/sample/nyc-construction-activity-preview.csv`,
      sampleBriefUrl: `${baseUrl}/sample/nyc-weekly-construction-activity-sample.md`,
      pricingUrl: `${baseUrl}/pricing.html`,
      timeSavedCalculatorUrl: `${baseUrl}/time-saved-calculator.html`,
      whoShouldBuyUrl: `${baseUrl}/who-should-buy.html`,
      freeVsPaidUrl: `${baseUrl}/free-vs-paid.html`,
      researchWorkflowUrl: `${baseUrl}/permit-research-workflow.html`,
      contractorSupplierGuideUrl: `${baseUrl}/contractor-supplier-permit-research.html`,
      brokerDeveloperGuideUrl: `${baseUrl}/broker-developer-permit-research.html`,
      realEstateInvestorGuideUrl: `${baseUrl}/real-estate-investor-permit-research.html`,
      constructionConsultantGuideUrl: `${baseUrl}/construction-consultant-permit-research.html`,
      constructionRiskGuideUrl: `${baseUrl}/construction-risk-permit-research.html`,
      permitExpediterGuideUrl: `${baseUrl}/permit-expediter-research.html`,
      propertyManagerGuideUrl: `${baseUrl}/property-manager-permit-research.html`,
      insideZipUrl: `${baseUrl}/inside-the-zip.html`,
      csvFieldGuideUrl: `${baseUrl}/csv-field-guide.html`,
      permitCsvUrl: `${baseUrl}/nyc-dob-permit-csv.html`,
      weeklyPermitReportUrl: `${baseUrl}/weekly-nyc-construction-permit-report.html`,
      dobNowAlternativeUrl: `${baseUrl}/dob-now-permit-search-alternative.html`,
      permitLeadsUrl: `${baseUrl}/nyc-construction-permit-leads.html`,
      permitActivityByZipUrl: `${baseUrl}/nyc-permit-activity-by-zip.html`,
      manhattanPermitActivityUrl: `${baseUrl}/manhattan-construction-permit-activity.html`,
      brooklynPermitActivityUrl: `${baseUrl}/brooklyn-construction-permit-activity.html`,
      sidewalkShedPermitsUrl: `${baseUrl}/nyc-sidewalk-shed-permits.html`,
      plumbingPermitsUrl: `${baseUrl}/nyc-plumbing-permits.html`,
      sprinklerPermitsUrl: `${baseUrl}/nyc-sprinkler-permits.html`,
      mechanicalSystemsPermitsUrl: `${baseUrl}/nyc-mechanical-systems-permits.html`,
      supportedScaffoldPermitsUrl: `${baseUrl}/nyc-supported-scaffold-permits.html`,
      structuralPermitsUrl: `${baseUrl}/nyc-structural-permits.html`,
      constructionFencePermitsUrl: `${baseUrl}/nyc-construction-fence-permits.html`,
      buyerGuideUrl: `${baseUrl}/buyer-guide.html`,
      deliveryUrl: `${baseUrl}/delivery.html`,
      supportUrl: `${baseUrl}/support.html`,
      methodologyUrl: `${baseUrl}/methodology.html`,
      segmentHubUrl: `${baseUrl}/sample-segments.html`,
      sampleRequestUrl: `${baseUrl}/sample-request.html`,
      imageUrl: socialImageUrl,
      purchaseUrl: buyUrl,
      buyUrl,
      checkoutBridgeUrl: checkoutUrl,
      checkoutUrl,
      stripeCheckoutUrl,
      priceUsd: launchPriceUsd,
      standardPriceUsd,
    },
    paidZip: {
      purchaseUrl: buyUrl,
      buyUrl,
      checkoutBridgeUrl: checkoutUrl,
      checkoutUrl,
      stripeCheckoutUrl,
      imageUrl: socialImageUrl,
      pricingUrl: `${baseUrl}/pricing.html`,
      timeSavedCalculatorUrl: `${baseUrl}/time-saved-calculator.html`,
      whoShouldBuyUrl: `${baseUrl}/who-should-buy.html`,
      freeVsPaidUrl: `${baseUrl}/free-vs-paid.html`,
      researchWorkflowUrl: `${baseUrl}/permit-research-workflow.html`,
      contractorSupplierGuideUrl: `${baseUrl}/contractor-supplier-permit-research.html`,
      brokerDeveloperGuideUrl: `${baseUrl}/broker-developer-permit-research.html`,
      realEstateInvestorGuideUrl: `${baseUrl}/real-estate-investor-permit-research.html`,
      constructionConsultantGuideUrl: `${baseUrl}/construction-consultant-permit-research.html`,
      constructionRiskGuideUrl: `${baseUrl}/construction-risk-permit-research.html`,
      permitExpediterGuideUrl: `${baseUrl}/permit-expediter-research.html`,
      propertyManagerGuideUrl: `${baseUrl}/property-manager-permit-research.html`,
      insideZipUrl: `${baseUrl}/inside-the-zip.html`,
      csvFieldGuideUrl: `${baseUrl}/csv-field-guide.html`,
      permitCsvUrl: `${baseUrl}/nyc-dob-permit-csv.html`,
      weeklyPermitReportUrl: `${baseUrl}/weekly-nyc-construction-permit-report.html`,
      dobNowAlternativeUrl: `${baseUrl}/dob-now-permit-search-alternative.html`,
      permitLeadsUrl: `${baseUrl}/nyc-construction-permit-leads.html`,
      permitActivityByZipUrl: `${baseUrl}/nyc-permit-activity-by-zip.html`,
      manhattanPermitActivityUrl: `${baseUrl}/manhattan-construction-permit-activity.html`,
      brooklynPermitActivityUrl: `${baseUrl}/brooklyn-construction-permit-activity.html`,
      sidewalkShedPermitsUrl: `${baseUrl}/nyc-sidewalk-shed-permits.html`,
      plumbingPermitsUrl: `${baseUrl}/nyc-plumbing-permits.html`,
      sprinklerPermitsUrl: `${baseUrl}/nyc-sprinkler-permits.html`,
      mechanicalSystemsPermitsUrl: `${baseUrl}/nyc-mechanical-systems-permits.html`,
      supportedScaffoldPermitsUrl: `${baseUrl}/nyc-supported-scaffold-permits.html`,
      structuralPermitsUrl: `${baseUrl}/nyc-structural-permits.html`,
      constructionFencePermitsUrl: `${baseUrl}/nyc-construction-fence-permits.html`,
      buyerGuideUrl: `${baseUrl}/buyer-guide.html`,
      deliveryUrl: `${baseUrl}/delivery.html`,
      supportUrl: `${baseUrl}/support.html`,
      sampleRequestUrl: `${baseUrl}/sample-request.html`,
      priceUsd: launchPriceUsd,
      standardPriceUsd,
      rowCount: stats.rowCount,
      currentIssueUrl: `${baseUrl}/current-issue.html`,
      launchPricing: {
        priceUsd: launchPriceUsd,
        standardPriceUsd,
        promoCodeRequired: false,
      },
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
      url: `${baseUrl}/current-issue.html`,
      description: `Current paid issue has ${stats.rowCount} source-linked rows. The free CSV preview has ${previewRows} rows. Launch price is $${launchPriceUsd.toFixed(2)}. Standard price is $${standardPriceUsd}. Issued dates run ${stats.firstIssuedDate} through ${stats.latestIssuedDate}. Top work types: ${topWorkTypes}.`,
    },
    {
      title: 'Buy the current issue ZIP',
      url: buyUrl,
      description: `One-time $${launchPriceUsd.toFixed(2)} launch-price ZIP with the full ${stats.rowCount}-row CSV, buyer workbook, priority-slices CSV, source registry, QA report, and instant browser download after paid Stripe checkout.`,
    },
    {
      title: 'Browse current permit activity segments',
      url: `${baseUrl}/sample-segments.html`,
      description: `ZIP, borough, work type, issued-date, cost-bucket, and buyer research pages generated from the current ${stats.rowCount}-row paid issue.`,
    },
    {
      title: 'Browser preview for the current issue',
      url: `${baseUrl}/preview.html`,
      description: `Browse the free ${previewRows}-row public preview in the browser before buying the full ${stats.rowCount}-row ZIP.`,
    },
    {
      title: 'Pricing and break-even guide',
      url: `${baseUrl}/pricing.html`,
      description: `One-time $${launchPriceUsd.toFixed(2)} launch-price ZIP and simple time-saved examples for deciding whether the current issue is worth buying.`,
    },
    {
      title: 'Time saved calculator',
      url: `${baseUrl}/time-saved-calculator.html`,
      description: `Arithmetic calculator for comparing the $${launchPriceUsd.toFixed(2)} launch price with expected manual sorting time saved.`,
    },
    {
      title: 'Who should buy the current issue',
      url: `${baseUrl}/who-should-buy.html`,
      description: `Buyer fit checklist for deciding whether the current ${stats.rowCount}-row ZIP is useful before opening Stripe checkout.`,
    },
    {
      title: 'Free preview and paid ZIP comparison',
      url: `${baseUrl}/free-vs-paid.html`,
      description: `Compare the free ${previewRows}-row preview with the paid ${stats.rowCount}-row ZIP before opening checkout.`,
    },
    {
      title: 'Weekly permit research workflow',
      url: `${baseUrl}/permit-research-workflow.html`,
      description: `Practical review order for using the free preview, paid ${stats.rowCount}-row ZIP, buyer workbook, priority slices, and source links.`,
    },
    {
      title: 'Contractor and supplier permit research guide',
      url: `${baseUrl}/contractor-supplier-permit-research.html`,
      description: `Buyer-focused guide for contractors, suppliers, subcontractors, and local service firms screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Broker and developer permit research guide',
      url: `${baseUrl}/broker-developer-permit-research.html`,
      description: `Buyer-focused guide for brokers, small developers, consultants, and permit researchers screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Real estate investor permit research guide',
      url: `${baseUrl}/real-estate-investor-permit-research.html`,
      description: `Buyer-focused guide for real estate investors and acquisition researchers screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Construction consultant permit research guide',
      url: `${baseUrl}/construction-consultant-permit-research.html`,
      description: `Buyer-focused guide for construction consultants and permit researchers screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Construction risk permit research guide',
      url: `${baseUrl}/construction-risk-permit-research.html`,
      description: `Buyer-focused guide for risk, lending, compliance, and due-diligence researchers screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Permit expediter research guide',
      url: `${baseUrl}/permit-expediter-research.html`,
      description: `Buyer-focused guide for permit expediters, filing consultants, and construction researchers screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Property manager permit research guide',
      url: `${baseUrl}/property-manager-permit-research.html`,
      description: `Buyer-focused guide for property managers, building operators, and local service teams screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Inside the current paid ZIP',
      url: `${baseUrl}/inside-the-zip.html`,
      description: `File-by-file package manifest for the current ${stats.rowCount}-row ZIP, including the buyer workbook, priority-slices CSV, QA report, source registry, and claims boundary.`,
    },
    {
      title: 'CSV field guide',
      url: `${baseUrl}/csv-field-guide.html`,
      description: `Column-by-column guide to the public preview and paid CSV fields for the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'NYC DOB permit CSV preview',
      url: `${baseUrl}/nyc-dob-permit-csv.html`,
      description: `Preview the public ${previewRows}-row NYC DOB permit CSV before buying the full ${stats.rowCount}-row current issue ZIP.`,
    },
    {
      title: 'Weekly NYC construction permit report',
      url: `${baseUrl}/weekly-nyc-construction-permit-report.html`,
      description: `Source-linked weekly permit report for reviewing the current ${stats.rowCount}-row paid issue before checkout.`,
    },
    {
      title: 'DOB NOW permit search alternative',
      url: `${baseUrl}/dob-now-permit-search-alternative.html`,
      description: `Compare manual DOB NOW permit search with the current ${stats.rowCount}-row paid ZIP for weekly source-linked screening.`,
    },
    {
      title: 'NYC construction permit leads alternative',
      url: `${baseUrl}/nyc-construction-permit-leads.html`,
      description: `Source-linked permit screening page for buyers searching for NYC construction permit leads without private contacts or guaranteed sales opportunities.`,
    },
    {
      title: 'NYC permit activity by ZIP',
      url: `${baseUrl}/nyc-permit-activity-by-zip.html`,
      description: `Current ZIP-based permit activity page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'Manhattan construction permit activity',
      url: `${baseUrl}/manhattan-construction-permit-activity.html`,
      description: `Current Manhattan permit activity page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'Brooklyn construction permit activity',
      url: `${baseUrl}/brooklyn-construction-permit-activity.html`,
      description: `Current Brooklyn permit activity page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC sidewalk shed permits',
      url: `${baseUrl}/nyc-sidewalk-shed-permits.html`,
      description: `Current sidewalk shed permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC plumbing permits',
      url: `${baseUrl}/nyc-plumbing-permits.html`,
      description: `Current plumbing permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC sprinkler permits',
      url: `${baseUrl}/nyc-sprinkler-permits.html`,
      description: `Current sprinkler permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC mechanical systems permits',
      url: `${baseUrl}/nyc-mechanical-systems-permits.html`,
      description: `Current mechanical systems permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC supported scaffold permits',
      url: `${baseUrl}/nyc-supported-scaffold-permits.html`,
      description: `Current supported scaffold permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC structural permits',
      url: `${baseUrl}/nyc-structural-permits.html`,
      description: `Current structural permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC construction fence permits',
      url: `${baseUrl}/nyc-construction-fence-permits.html`,
      description: `Current construction fence permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'Buyer guide for the current ZIP',
      url: `${baseUrl}/buyer-guide.html`,
      description: `Who should buy the current ${stats.rowCount}-row ZIP, who should use the free ${previewRows}-row preview first, and what is excluded from the paid files.`,
    },
    {
      title: 'Instant ZIP delivery steps',
      url: `${baseUrl}/delivery.html`,
      description: 'How Stripe redirects completed buyers to the success page and how the paid-session download gate serves the ZIP.',
    },
    {
      title: 'Support and refund boundary',
      url: `${baseUrl}/support.html`,
      description: 'Download troubleshooting, Stripe session handling, common download errors, and refund boundary for the current digital ZIP.',
    },
    {
      title: 'Request a future sample cut',
      url: `${baseUrl}/sample-request.html`,
      description: 'Product-specific sample request form for work types, ZIPs, boroughs, and buyer views not covered by the current preview.',
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
- Primary purchase page: ${buyUrl}
- Buy page: ${buyUrl}
- Checkout bridge: ${checkoutUrl}
- Stripe Payment Link: ${stripeCheckoutUrl}
- Social image: ${socialImageUrl}
- Price: $${launchPriceUsd.toFixed(2)} one-time ZIP download
- Standard price: $${standardPriceUsd}
- Promo code required: no
- Buyer-only files: buyer-workbook.md, buyer-priority-slices.csv

Primary pages:
- Home: ${baseUrl}/
- Current issue page: ${baseUrl}/current-issue.html
- Current issue JSON: ${baseUrl}/current-issue.json
- RSS feed: ${baseUrl}/feed.xml
- Public preview: ${baseUrl}/preview.html
- Pricing: ${baseUrl}/pricing.html
- Time saved calculator: ${baseUrl}/time-saved-calculator.html
- Who should buy: ${baseUrl}/who-should-buy.html
- Free preview vs paid ZIP: ${baseUrl}/free-vs-paid.html
- Research workflow: ${baseUrl}/permit-research-workflow.html
- Contractor and supplier guide: ${baseUrl}/contractor-supplier-permit-research.html
- Broker and developer guide: ${baseUrl}/broker-developer-permit-research.html
- Real estate investor guide: ${baseUrl}/real-estate-investor-permit-research.html
- Construction consultant guide: ${baseUrl}/construction-consultant-permit-research.html
- Construction risk guide: ${baseUrl}/construction-risk-permit-research.html
- Permit expediter guide: ${baseUrl}/permit-expediter-research.html
- Property manager guide: ${baseUrl}/property-manager-permit-research.html
- Inside the ZIP: ${baseUrl}/inside-the-zip.html
- CSV field guide: ${baseUrl}/csv-field-guide.html
- NYC DOB permit CSV: ${baseUrl}/nyc-dob-permit-csv.html
- Weekly NYC construction permit report: ${baseUrl}/weekly-nyc-construction-permit-report.html
- DOB NOW permit search alternative: ${baseUrl}/dob-now-permit-search-alternative.html
- NYC construction permit leads alternative: ${baseUrl}/nyc-construction-permit-leads.html
- NYC permit activity by ZIP: ${baseUrl}/nyc-permit-activity-by-zip.html
- Manhattan construction permit activity: ${baseUrl}/manhattan-construction-permit-activity.html
- Brooklyn construction permit activity: ${baseUrl}/brooklyn-construction-permit-activity.html
- NYC sidewalk shed permits: ${baseUrl}/nyc-sidewalk-shed-permits.html
- NYC plumbing permits: ${baseUrl}/nyc-plumbing-permits.html
- NYC sprinkler permits: ${baseUrl}/nyc-sprinkler-permits.html
- NYC mechanical systems permits: ${baseUrl}/nyc-mechanical-systems-permits.html
- NYC supported scaffold permits: ${baseUrl}/nyc-supported-scaffold-permits.html
- NYC structural permits: ${baseUrl}/nyc-structural-permits.html
- NYC construction fence permits: ${baseUrl}/nyc-construction-fence-permits.html
- Buyer guide: ${baseUrl}/buyer-guide.html
- Delivery steps: ${baseUrl}/delivery.html
- Support and refunds: ${baseUrl}/support.html
- Sample request: ${baseUrl}/sample-request.html
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
  const extraUrls = ['current-issue.html', 'preview.html', 'buy.html', 'pricing.html', 'time-saved-calculator.html', 'who-should-buy.html', 'free-vs-paid.html', 'permit-research-workflow.html', 'contractor-supplier-permit-research.html', 'broker-developer-permit-research.html', 'real-estate-investor-permit-research.html', 'construction-consultant-permit-research.html', 'construction-risk-permit-research.html', 'permit-expediter-research.html', 'property-manager-permit-research.html', 'inside-the-zip.html', 'csv-field-guide.html', 'nyc-dob-permit-csv.html', 'weekly-nyc-construction-permit-report.html', 'dob-now-permit-search-alternative.html', 'nyc-construction-permit-leads.html', 'nyc-permit-activity-by-zip.html', 'manhattan-construction-permit-activity.html', 'brooklyn-construction-permit-activity.html', 'nyc-sidewalk-shed-permits.html', 'nyc-plumbing-permits.html', 'nyc-sprinkler-permits.html', 'nyc-mechanical-systems-permits.html', 'nyc-supported-scaffold-permits.html', 'nyc-structural-permits.html', 'nyc-construction-fence-permits.html', 'buyer-guide.html', 'delivery.html', 'support.html', 'sample-request.html', 'feed.xml', 'current-issue.json', 'llms.txt'];
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
