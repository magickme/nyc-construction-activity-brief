const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { siteBaseUrl } = require('../site-config');

const root = path.resolve(__dirname, '..');
const baseUrl = siteBaseUrl();
const socialImageUrl = `${baseUrl}/assets/current-issue-snapshot.png`;
const stripeCheckoutUrl = 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q';
const checkoutUrl = `${baseUrl}/checkout.html?source=current-issue`;
const buyUrl = `${baseUrl}/buy.html`;
const dataPackageUrl = `${baseUrl}/data-package.json`;
const productFeedUrl = `${baseUrl}/product-feed.xml`;
const jsonFeedUrl = `${baseUrl}/feed.json`;
const launchPriceUsd = 9.5;
const standardPriceUsd = 49;
const highIntentTopicPages = [
  ['nyc-permit-data-for-architects', 'NYC permit data for architects'],
  ['nyc-permit-data-for-engineers', 'NYC permit data for engineers'],
  ['nyc-permit-research-for-project-managers', 'NYC permit research for project managers'],
  ['nyc-construction-permit-data-for-proptech', 'NYC construction permit data for proptech'],
  ['nyc-building-permit-data-for-vendors', 'NYC building permit data for vendors'],
  ['nyc-dob-permit-data-for-contractors', 'NYC DOB permit data for contractors'],
  ['nyc-subcontractor-prospecting-permit-data', 'NYC subcontractor prospecting permit data'],
  ['nyc-construction-sales-prospecting', 'NYC construction sales prospecting'],
  ['nyc-construction-market-research-csv', 'NYC construction market research CSV'],
  ['nyc-commercial-renovation-permits', 'NYC commercial renovation permits'],
  ['nyc-construction-permit-monitoring-for-suppliers', 'NYC construction permit monitoring for suppliers'],
  ['nyc-construction-permit-data-for-suppliers', 'NYC construction permit data for suppliers'],
  ['nyc-dob-permit-alerts-for-subcontractors', 'NYC DOB permit alerts for subcontractors'],
  ['nyc-construction-permit-data-for-journalists', 'NYC construction permit data for journalists'],
  ['nyc-real-estate-investor-permit-research', 'NYC real estate investor permit research'],
  ['nyc-building-permit-export-csv', 'NYC building permit export CSV'],
];
const boroughDemandPages = [
  {
    boroughName: 'Queens',
    title: 'Queens construction permit activity request',
    path: 'queens-construction-permit-activity.html',
  },
  {
    boroughName: 'Bronx',
    title: 'Bronx construction permit activity request',
    path: 'bronx-construction-permit-activity.html',
  },
  {
    boroughName: 'Staten Island',
    title: 'Staten Island construction permit activity request',
    path: 'staten-island-construction-permit-activity.html',
  },
];
const productFeedSegments = [
  {
    id: 'nyc-construction-activity-brief-sidewalk-shed',
    title: 'NYC sidewalk shed permit activity ZIP',
    workTypes: ['Sidewalk Shed'],
    url: `${baseUrl}/buy.html?source=product-feed-sidewalk-shed`,
    productType: 'Digital data download > NYC permit activity > Sidewalk shed',
    customLabel: 'sidewalk-shed-permit-activity',
    description: (count, rowCount) => `One-time $${launchPriceUsd.toFixed(2)} digital ZIP download for buyers screening ${count} selected NYC sidewalk shed permit rows inside the current ${rowCount}-row public-record permit activity package. Includes source links, CSV files, buyer workbook, priority slices, QA report, and boundary notes.`,
  },
  {
    id: 'nyc-construction-activity-brief-plumbing',
    title: 'NYC plumbing permit activity ZIP',
    workTypes: ['Plumbing'],
    url: `${baseUrl}/buy.html?source=product-feed-plumbing`,
    productType: 'Digital data download > NYC permit activity > Plumbing',
    customLabel: 'plumbing-permit-activity',
    description: (count, rowCount) => `One-time $${launchPriceUsd.toFixed(2)} digital ZIP download for buyers screening ${count} selected NYC plumbing permit rows inside the current ${rowCount}-row public-record permit activity package. Includes source links, CSV files, buyer workbook, priority slices, QA report, and boundary notes.`,
  },
  {
    id: 'nyc-construction-activity-brief-exterior-access',
    title: 'NYC exterior-access permit activity ZIP',
    workTypes: ['Sidewalk Shed', 'Supported Scaffold', 'Construction Fence', 'Structural'],
    url: `${baseUrl}/buy.html?source=product-feed-exterior-access`,
    productType: 'Digital data download > NYC permit activity > Exterior access',
    customLabel: 'exterior-access-permit-activity',
    description: (count, rowCount) => `One-time $${launchPriceUsd.toFixed(2)} digital ZIP download for buyers screening ${count} selected NYC exterior-access permit rows, including sidewalk shed, supported scaffold, construction fence, and structural activity inside the current ${rowCount}-row public-record permit package.`,
  },
];
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
      jsonUrl: `${baseUrl}/sample/nyc-construction-activity-preview.json`,
      jsonlUrl: `${baseUrl}/sample/nyc-construction-activity-preview.jsonl`,
      sampleBriefUrl: `${baseUrl}/sample/nyc-weekly-construction-activity-sample.md`,
      dataPackageUrl,
      productFeedUrl,
      jsonFeedUrl,
      pricingUrl: `${baseUrl}/pricing.html`,
      timeSavedCalculatorUrl: `${baseUrl}/time-saved-calculator.html`,
      whoShouldBuyUrl: `${baseUrl}/who-should-buy.html`,
      faqUrl: `${baseUrl}/faq.html`,
      freeVsPaidUrl: `${baseUrl}/free-vs-paid.html`,
      researchWorkflowUrl: `${baseUrl}/permit-research-workflow.html`,
      contractorGuideUrl: `${baseUrl}/contractor-permit-research.html`,
      contractorSupplierGuideUrl: `${baseUrl}/contractor-supplier-permit-research.html`,
      materialSupplierGuideUrl: `${baseUrl}/material-supplier-permit-research.html`,
      buildingServiceVendorGuideUrl: `${baseUrl}/building-service-vendor-permit-research.html`,
      subcontractorGuideUrl: `${baseUrl}/subcontractor-permit-research.html`,
      brokerDeveloperGuideUrl: `${baseUrl}/broker-developer-permit-research.html`,
      realEstateInvestorGuideUrl: `${baseUrl}/real-estate-investor-permit-research.html`,
      constructionConsultantGuideUrl: `${baseUrl}/construction-consultant-permit-research.html`,
      constructionRiskGuideUrl: `${baseUrl}/construction-risk-permit-research.html`,
      permitExpediterGuideUrl: `${baseUrl}/permit-expediter-research.html`,
      propertyManagerGuideUrl: `${baseUrl}/property-manager-permit-research.html`,
      insideZipUrl: `${baseUrl}/inside-the-zip.html`,
      csvFieldGuideUrl: `${baseUrl}/csv-field-guide.html`,
      buildingPermitsUrl: `${baseUrl}/nyc-building-permits.html`,
      buildingPermitDataUrl: `${baseUrl}/nyc-building-permit-data.html`,
      permitDataDownloadUrl: `${baseUrl}/nyc-dob-permit-data-download.html`,
      dobApprovedPermitsUrl: `${baseUrl}/nyc-dob-approved-permits.html`,
      dobNowApprovedPermitsUrl: `${baseUrl}/nyc-dob-now-approved-permits.html`,
      dobNowBuildApprovedPermitsUrl: `${baseUrl}/dob-now-build-approved-permits.html`,
      dobPermitAlertsUrl: `${baseUrl}/nyc-dob-permit-alerts.html`,
      dobPermitTrackerUrl: `${baseUrl}/nyc-dob-permit-tracker.html`,
      dobPermitMonitoringUrl: `${baseUrl}/nyc-dob-permit-monitoring.html`,
      dobPermitWatchlistUrl: `${baseUrl}/nyc-dob-permit-watchlist.html`,
      dobPermitSearchUrl: `${baseUrl}/nyc-dob-permit-search.html`,
      constructionPermitSearchUrl: `${baseUrl}/nyc-construction-permit-search.html`,
      dobPermitLookupUrl: `${baseUrl}/nyc-dob-permit-lookup.html`,
      permitCsvUrl: `${baseUrl}/nyc-dob-permit-csv.html`,
      permitDataApiAlternativeUrl: `${baseUrl}/nyc-permit-data-api-alternative.html`,
      weeklyPermitReportUrl: `${baseUrl}/weekly-nyc-construction-permit-report.html`,
      dobNowAlternativeUrl: `${baseUrl}/dob-now-permit-search-alternative.html`,
      permitLeadsUrl: `${baseUrl}/nyc-construction-permit-leads.html`,
      permitActivityByZipUrl: `${baseUrl}/nyc-permit-activity-by-zip.html`,
      manhattanPermitActivityUrl: `${baseUrl}/manhattan-construction-permit-activity.html`,
      brooklynPermitActivityUrl: `${baseUrl}/brooklyn-construction-permit-activity.html`,
      sidewalkShedPermitsUrl: `${baseUrl}/nyc-sidewalk-shed-permits.html`,
      sidewalkShedPermitLeadsUrl: `${baseUrl}/nyc-sidewalk-shed-permit-leads.html`,
      plumbingPermitLeadsUrl: `${baseUrl}/nyc-plumbing-permit-leads.html`,
      plumbingPermitsUrl: `${baseUrl}/nyc-plumbing-permits.html`,
      sprinklerPermitLeadsUrl: `${baseUrl}/nyc-sprinkler-permit-leads.html`,
      sprinklerPermitsUrl: `${baseUrl}/nyc-sprinkler-permits.html`,
      mechanicalSystemsPermitLeadsUrl: `${baseUrl}/nyc-mechanical-systems-permit-leads.html`,
      mechanicalSystemsPermitsUrl: `${baseUrl}/nyc-mechanical-systems-permits.html`,
      supportedScaffoldPermitsUrl: `${baseUrl}/nyc-supported-scaffold-permits.html`,
      supportedScaffoldPermitLeadsUrl: `${baseUrl}/nyc-supported-scaffold-permit-leads.html`,
      structuralPermitLeadsUrl: `${baseUrl}/nyc-structural-permit-leads.html`,
      structuralPermitsUrl: `${baseUrl}/nyc-structural-permits.html`,
      constructionFencePermitLeadsUrl: `${baseUrl}/nyc-construction-fence-permit-leads.html`,
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
      stripeFallbackUrl: stripeCheckoutUrl,
      priceUsd: launchPriceUsd,
      standardPriceUsd,
    },
    paidZip: {
      purchaseUrl: buyUrl,
      buyUrl,
      checkoutBridgeUrl: checkoutUrl,
      checkoutUrl,
      stripeFallbackUrl: stripeCheckoutUrl,
      imageUrl: socialImageUrl,
      pricingUrl: `${baseUrl}/pricing.html`,
      dataPackageUrl,
      productFeedUrl,
      jsonFeedUrl,
      timeSavedCalculatorUrl: `${baseUrl}/time-saved-calculator.html`,
      whoShouldBuyUrl: `${baseUrl}/who-should-buy.html`,
      faqUrl: `${baseUrl}/faq.html`,
      freeVsPaidUrl: `${baseUrl}/free-vs-paid.html`,
      researchWorkflowUrl: `${baseUrl}/permit-research-workflow.html`,
      contractorGuideUrl: `${baseUrl}/contractor-permit-research.html`,
      contractorSupplierGuideUrl: `${baseUrl}/contractor-supplier-permit-research.html`,
      materialSupplierGuideUrl: `${baseUrl}/material-supplier-permit-research.html`,
      buildingServiceVendorGuideUrl: `${baseUrl}/building-service-vendor-permit-research.html`,
      subcontractorGuideUrl: `${baseUrl}/subcontractor-permit-research.html`,
      brokerDeveloperGuideUrl: `${baseUrl}/broker-developer-permit-research.html`,
      realEstateInvestorGuideUrl: `${baseUrl}/real-estate-investor-permit-research.html`,
      constructionConsultantGuideUrl: `${baseUrl}/construction-consultant-permit-research.html`,
      constructionRiskGuideUrl: `${baseUrl}/construction-risk-permit-research.html`,
      permitExpediterGuideUrl: `${baseUrl}/permit-expediter-research.html`,
      propertyManagerGuideUrl: `${baseUrl}/property-manager-permit-research.html`,
      insideZipUrl: `${baseUrl}/inside-the-zip.html`,
      csvFieldGuideUrl: `${baseUrl}/csv-field-guide.html`,
      buildingPermitsUrl: `${baseUrl}/nyc-building-permits.html`,
      buildingPermitDataUrl: `${baseUrl}/nyc-building-permit-data.html`,
      permitDataDownloadUrl: `${baseUrl}/nyc-dob-permit-data-download.html`,
      dobApprovedPermitsUrl: `${baseUrl}/nyc-dob-approved-permits.html`,
      dobNowApprovedPermitsUrl: `${baseUrl}/nyc-dob-now-approved-permits.html`,
      dobNowBuildApprovedPermitsUrl: `${baseUrl}/dob-now-build-approved-permits.html`,
      dobPermitAlertsUrl: `${baseUrl}/nyc-dob-permit-alerts.html`,
      dobPermitTrackerUrl: `${baseUrl}/nyc-dob-permit-tracker.html`,
      dobPermitMonitoringUrl: `${baseUrl}/nyc-dob-permit-monitoring.html`,
      dobPermitWatchlistUrl: `${baseUrl}/nyc-dob-permit-watchlist.html`,
      dobPermitSearchUrl: `${baseUrl}/nyc-dob-permit-search.html`,
      constructionPermitSearchUrl: `${baseUrl}/nyc-construction-permit-search.html`,
      dobPermitLookupUrl: `${baseUrl}/nyc-dob-permit-lookup.html`,
      permitCsvUrl: `${baseUrl}/nyc-dob-permit-csv.html`,
      permitDataApiAlternativeUrl: `${baseUrl}/nyc-permit-data-api-alternative.html`,
      weeklyPermitReportUrl: `${baseUrl}/weekly-nyc-construction-permit-report.html`,
      dobNowAlternativeUrl: `${baseUrl}/dob-now-permit-search-alternative.html`,
      permitLeadsUrl: `${baseUrl}/nyc-construction-permit-leads.html`,
      permitActivityByZipUrl: `${baseUrl}/nyc-permit-activity-by-zip.html`,
      manhattanPermitActivityUrl: `${baseUrl}/manhattan-construction-permit-activity.html`,
      brooklynPermitActivityUrl: `${baseUrl}/brooklyn-construction-permit-activity.html`,
      sidewalkShedPermitsUrl: `${baseUrl}/nyc-sidewalk-shed-permits.html`,
      sidewalkShedPermitLeadsUrl: `${baseUrl}/nyc-sidewalk-shed-permit-leads.html`,
      plumbingPermitLeadsUrl: `${baseUrl}/nyc-plumbing-permit-leads.html`,
      plumbingPermitsUrl: `${baseUrl}/nyc-plumbing-permits.html`,
      sprinklerPermitLeadsUrl: `${baseUrl}/nyc-sprinkler-permit-leads.html`,
      sprinklerPermitsUrl: `${baseUrl}/nyc-sprinkler-permits.html`,
      mechanicalSystemsPermitLeadsUrl: `${baseUrl}/nyc-mechanical-systems-permit-leads.html`,
      mechanicalSystemsPermitsUrl: `${baseUrl}/nyc-mechanical-systems-permits.html`,
      supportedScaffoldPermitsUrl: `${baseUrl}/nyc-supported-scaffold-permits.html`,
      supportedScaffoldPermitLeadsUrl: `${baseUrl}/nyc-supported-scaffold-permit-leads.html`,
      structuralPermitLeadsUrl: `${baseUrl}/nyc-structural-permit-leads.html`,
      structuralPermitsUrl: `${baseUrl}/nyc-structural-permits.html`,
      constructionFencePermitLeadsUrl: `${baseUrl}/nyc-construction-fence-permit-leads.html`,
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

function buildDataPackageJson(rows, manifest) {
  const stats = issueStats(rows);
  const previewRows = publicPreviewRowCount() ?? stats.rowCount;
  const sampleUrls = {
    csv: `${baseUrl}/sample/nyc-construction-activity-preview.csv`,
    json: `${baseUrl}/sample/nyc-construction-activity-preview.json`,
    jsonl: `${baseUrl}/sample/nyc-construction-activity-preview.jsonl`,
    markdown_brief: `${baseUrl}/sample/nyc-weekly-construction-activity-sample.md`,
  };
  return {
    product: 'NYC Weekly Construction Activity Brief',
    issue: 'current',
    generated_at_source_fetch_date: stats.sourceFetchDate,
    url: dataPackageUrl,
    source: {
      name: 'NYC DOB NOW: Build - Approved Permits',
      dataset_id: 'rbx6-tga4',
      url: 'https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4',
      first_issued_date: stats.firstIssuedDate,
      latest_issued_date: stats.latestIssuedDate,
    },
    public_preview: {
      rows: previewRows,
      sample_urls: sampleUrls,
      current_issue_url: `${baseUrl}/current-issue.html`,
      preview_page_url: `${baseUrl}/preview.html`,
      field_guide_url: `${baseUrl}/csv-field-guide.html`,
    },
    paid_zip: {
      rows: stats.rowCount,
      price_usd: launchPriceUsd.toFixed(2),
      standard_price_usd: standardPriceUsd.toFixed(2),
      buy_url: `${baseUrl}/buy.html?source=data-package`,
      checkout_bridge_url: `${baseUrl}/checkout.html?source=data-package`,
      stripe_payment_link_fallback: stripeCheckoutUrl,
      product_feed_url: productFeedUrl,
      json_feed_url: jsonFeedUrl,
      delivery: 'Instant browser download after completed Stripe checkout.',
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
    buyer_pages: [
      `${baseUrl}/who-should-buy.html`,
      `${baseUrl}/faq.html`,
      `${baseUrl}/share-kit.html`,
      `${baseUrl}/invoice-request.html`,
      `${baseUrl}/partner-inquiry.html`,
      `${baseUrl}/team-license.html`,
      `${baseUrl}/custom-research.html`,
      `${baseUrl}/free-vs-paid.html`,
      `${baseUrl}/permit-research-workflow.html`,
      `${baseUrl}/inside-the-zip.html`,
      `${baseUrl}/nyc-building-permits.html`,
      `${baseUrl}/nyc-building-permit-data.html`,
      `${baseUrl}/nyc-dob-permit-data-download.html`,
      `${baseUrl}/nyc-dob-approved-permits.html`,
      `${baseUrl}/nyc-dob-now-approved-permits.html`,
      `${baseUrl}/dob-now-build-approved-permits.html`,
      `${baseUrl}/nyc-dob-permit-alerts.html`,
      `${baseUrl}/nyc-dob-permit-tracker.html`,
      `${baseUrl}/nyc-dob-permit-monitoring.html`,
      `${baseUrl}/nyc-dob-permit-watchlist.html`,
      `${baseUrl}/nyc-dob-permit-search.html`,
      `${baseUrl}/nyc-construction-permit-search.html`,
      `${baseUrl}/nyc-dob-permit-lookup.html`,
      `${baseUrl}/nyc-permit-data-api-alternative.html`,
      `${baseUrl}/nyc-sidewalk-shed-permit-leads.html`,
      `${baseUrl}/nyc-supported-scaffold-permit-leads.html`,
      `${baseUrl}/nyc-plumbing-permit-leads.html`,
      `${baseUrl}/nyc-sprinkler-permit-leads.html`,
      `${baseUrl}/nyc-mechanical-systems-permit-leads.html`,
      `${baseUrl}/nyc-structural-permit-leads.html`,
      `${baseUrl}/nyc-construction-fence-permit-leads.html`,
      `${baseUrl}/contractor-permit-research.html`,
      `${baseUrl}/subcontractor-permit-research.html`,
      `${baseUrl}/material-supplier-permit-research.html`,
      `${baseUrl}/building-service-vendor-permit-research.html`,
    ],
    counts: {
      work_types: stats.workTypes,
      zip_codes: stats.zipCodes,
      boroughs: stats.boroughs,
      cost_buckets: stats.costBuckets,
    },
    generated_topic_pages: {
      count: manifest.totalTopicPages,
      segment_hub_url: `${baseUrl}/sample-segments.html`,
      sample_urls: manifest.slugs.slice(0, 25).map((slug) => `${baseUrl}/topics/${slug}.html`),
      all_urls: manifest.slugs.map((slug) => `${baseUrl}/topics/${slug}.html`),
    },
    boundaries: {
      includes_private_contact_data: false,
      includes_owner_names: false,
      includes_applicant_names: false,
      includes_full_street_addresses: false,
      sends_email_fulfillment: false,
      agency_endorsed: false,
      lead_guarantee: false,
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
      description: `ZIP, borough, work type, issued-date, cost-bucket, and curated buyer-intent pages for the current ${stats.rowCount}-row paid issue.`,
    },
    {
      title: 'Dataset catalog for current NYC permit data',
      url: `${baseUrl}/dataset-catalog.html`,
      description: `Catalog page for the current ${stats.rowCount}-row paid ZIP, ${previewRows}-row public preview, source dataset id rbx6-tga4, fields, formats, and claims boundary.`,
    },
    {
      title: 'Share kit for newsletters and community posts',
      url: `${baseUrl}/share-kit.html`,
      description: `Copy-safe newsletter and community-post notes for linking to the current ${stats.rowCount}-row NYC construction activity brief without overstating coverage, results, or lead guarantees.`,
    },
    {
      title: 'Invoice request for procurement-blocked buyers',
      url: `${baseUrl}/invoice-request.html`,
      description: 'Request-only invoice and procurement help page for buyers blocked by internal purchase-order, invoice, or approval workflows tied to the current NYC construction activity brief.',
    },
    {
      title: 'Partner inquiry for newsletter and bundle ideas',
      url: `${baseUrl}/partner-inquiry.html`,
      description: 'Request-only partner inquiry page for newsletters, communities, sponsorship discussions, and product-bundle ideas tied to the current NYC construction activity brief.',
    },
    {
      title: 'Team license request for multi-issue access',
      url: `${baseUrl}/team-license.html`,
      description: 'Request-only team license page for multi-user, multi-issue, recurring-access, and procurement-review interest tied to the current NYC construction activity brief.',
    },
    {
      title: 'Custom research request for filtered permit briefs',
      url: `${baseUrl}/custom-research.html`,
      description: 'Request-only custom research page for filtered briefs, priority-row reviews, client notes, and source-review interest tied to the current NYC construction activity brief.',
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
      title: 'Buyer FAQ for the current issue',
      url: `${baseUrl}/faq.html`,
      description: `Plain answers on price, files, instant download delivery, source limits, privacy boundary, and support for the current ${stats.rowCount}-row ZIP.`,
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
      title: 'Contractor permit research guide',
      url: `${baseUrl}/contractor-permit-research.html`,
      description: `Buyer-focused guide for contractors and small construction teams screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Contractor and supplier permit research guide',
      url: `${baseUrl}/contractor-supplier-permit-research.html`,
      description: `Buyer-focused guide for contractors, suppliers, subcontractors, and local service firms screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Material supplier permit research guide',
      url: `${baseUrl}/material-supplier-permit-research.html`,
      description: `Buyer-focused guide for material suppliers, distributors, rental desks, and local B2B vendors screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Building-service vendor permit research guide',
      url: `${baseUrl}/building-service-vendor-permit-research.html`,
      description: `Buyer-focused guide for building-service vendors, maintenance firms, equipment rental desks, and local B2B operators screening the current ${stats.rowCount}-row issue.`,
    },
    {
      title: 'Subcontractor permit research guide',
      url: `${baseUrl}/subcontractor-permit-research.html`,
      description: `Buyer-focused guide for subcontractors, specialty trades, and small construction teams screening the current ${stats.rowCount}-row issue.`,
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
      title: 'NYC building permit data preview',
      url: `${baseUrl}/nyc-building-permit-data.html`,
      description: `Free 25-row NYC building permit data preview with source links, CSV samples, package metadata, and the full ${stats.rowCount}-row paid ZIP path.`,
    },
    {
      title: 'NYC building permits',
      url: `${baseUrl}/nyc-building-permits.html`,
      description: `Search-focused buyer page for reviewing selected NYC building permit rows from the current ${stats.rowCount}-row weekly CSV ZIP.`,
    },
    {
      title: 'NYC DOB permit CSV preview',
      url: `${baseUrl}/nyc-dob-permit-csv.html`,
      description: `Preview the public ${previewRows}-row NYC DOB permit CSV before buying the full ${stats.rowCount}-row current issue ZIP.`,
    },
    {
      title: 'NYC DOB permit data download',
      url: `${baseUrl}/nyc-dob-permit-data-download.html`,
      description: `Download-focused buyer page with public preview files, data package metadata, delivery steps, and the full ${stats.rowCount}-row paid ZIP path.`,
    },
    {
      title: 'NYC DOB approved permits',
      url: `${baseUrl}/nyc-dob-approved-permits.html`,
      description: `Source-focused buyer page for reviewing selected DOB approved permit rows from the current ${stats.rowCount}-row weekly CSV ZIP.`,
    },
    {
      title: 'NYC DOB NOW approved permits',
      url: `${baseUrl}/nyc-dob-now-approved-permits.html`,
      description: `Exact-source buyer page for reviewing selected DOB NOW approved permit rows from the current ${stats.rowCount}-row weekly CSV ZIP.`,
    },
    {
      title: 'DOB NOW Build approved permits',
      url: `${baseUrl}/dob-now-build-approved-permits.html`,
      description: `Dataset-name buyer page for reviewing selected DOB NOW: Build approved permit rows from the current ${stats.rowCount}-row weekly CSV ZIP.`,
    },
    {
      title: 'NYC DOB permit alerts alternative',
      url: `${baseUrl}/nyc-dob-permit-alerts.html`,
      description: `Alert-style buyer page for using the current ${stats.rowCount}-row ZIP as a weekly screening file without real-time alerts or private contact data.`,
    },
    {
      title: 'NYC DOB permit tracker alternative',
      url: `${baseUrl}/nyc-dob-permit-tracker.html`,
      description: `Tracker-style buyer page for using the current ${stats.rowCount}-row ZIP as a weekly source-linked spreadsheet without live monitoring or private contact data.`,
    },
    {
      title: 'NYC DOB permit monitoring alternative',
      url: `${baseUrl}/nyc-dob-permit-monitoring.html`,
      description: `Monitoring-style buyer page for using the current ${stats.rowCount}-row ZIP as a weekly source-linked review file without live monitoring, alerts, or private contact data.`,
    },
    {
      title: 'NYC DOB permit watchlist alternative',
      url: `${baseUrl}/nyc-dob-permit-watchlist.html`,
      description: `Watchlist-style buyer page for using the current ${stats.rowCount}-row ZIP as a weekly source-linked review file without live alerts, private contact data, or lead guarantees.`,
    },
    {
      title: 'NYC DOB permit search companion',
      url: `${baseUrl}/nyc-dob-permit-search.html`,
      description: `Search-focused buyer page for using the current ${stats.rowCount}-row ZIP as a weekly companion to manual NYC DOB permit source checks.`,
    },
    {
      title: 'NYC construction permit search companion',
      url: `${baseUrl}/nyc-construction-permit-search.html`,
      description: `Search-focused buyer page for using the current ${stats.rowCount}-row ZIP as a weekly companion to manual NYC construction permit source checks.`,
    },
    {
      title: 'NYC DOB permit lookup companion',
      url: `${baseUrl}/nyc-dob-permit-lookup.html`,
      description: `Lookup-focused buyer page for using the current ${stats.rowCount}-row ZIP as a weekly companion to manual NYC DOB permit lookup checks.`,
    },
    {
      title: 'NYC permit data API alternative',
      url: `${baseUrl}/nyc-permit-data-api-alternative.html`,
      description: `Buyer-focused page for proptech operators and analysts comparing the current ${stats.rowCount}-row weekly CSV ZIP with building a raw permit data pipeline.`,
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
      title: 'NYC sidewalk shed permit leads',
      url: `${baseUrl}/nyc-sidewalk-shed-permit-leads.html`,
      description: `Current sidewalk shed permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Sidewalk Shed') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
    },
    {
      title: 'NYC plumbing permits',
      url: `${baseUrl}/nyc-plumbing-permits.html`,
      description: `Current plumbing permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC plumbing permit leads',
      url: `${baseUrl}/nyc-plumbing-permit-leads.html`,
      description: `Current plumbing permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Plumbing') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
    },
    {
      title: 'NYC sprinkler permits',
      url: `${baseUrl}/nyc-sprinkler-permits.html`,
      description: `Current sprinkler permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC sprinkler permit leads',
      url: `${baseUrl}/nyc-sprinkler-permit-leads.html`,
      description: `Current sprinkler permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Sprinklers') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
    },
    {
      title: 'NYC mechanical systems permit leads',
      url: `${baseUrl}/nyc-mechanical-systems-permit-leads.html`,
      description: `Current mechanical systems permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Mechanical Systems') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
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
      title: 'NYC supported scaffold permit leads',
      url: `${baseUrl}/nyc-supported-scaffold-permit-leads.html`,
      description: `Current supported scaffold permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Supported Scaffold') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
    },
    {
      title: 'NYC structural permits',
      url: `${baseUrl}/nyc-structural-permits.html`,
      description: `Current structural permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC structural permit leads',
      url: `${baseUrl}/nyc-structural-permit-leads.html`,
      description: `Current structural permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Structural') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
    },
    {
      title: 'NYC construction fence permits',
      url: `${baseUrl}/nyc-construction-fence-permits.html`,
      description: `Current construction fence permit screening page for buyers reviewing selected public DOB rows before checkout.`,
    },
    {
      title: 'NYC construction fence permit leads',
      url: `${baseUrl}/nyc-construction-fence-permit-leads.html`,
      description: `Current construction fence permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Construction Fence') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
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
    ...boroughDemandPages.map((page) => ({
      title: page.title,
      url: `${baseUrl}/${page.path}`,
      description: `${page.boroughName} demand-capture page for buyers who need future NYC DOB permit samples by borough, ZIP, work type, and issued date. The current paid issue does not include ${page.boroughName} rows.`,
    })),
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

function buildProductFeedXml(rows) {
  const stats = issueStats(rows);
  const previewRows = publicPreviewRowCount() ?? stats.rowCount;
  const description = `One-time $${launchPriceUsd.toFixed(2)} digital ZIP download with the current ${stats.rowCount}-row NYC DOB permit CSV, buyer workbook, priority-slices CSV, source registry, QA report, and public-record boundary notes. The free preview has ${previewRows} rows.`;
  const itemXml = (item) => `    <item>
      <g:id>${escapeHtml(item.id)}</g:id>
      <title>${escapeHtml(item.title)}</title>
      <description>${escapeHtml(item.description)}</description>
      <link>${escapeHtml(item.url)}</link>
      <g:image_link>${socialImageUrl}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${launchPriceUsd.toFixed(2)} USD</g:price>
      <g:brand>NYC Weekly Construction Activity Brief</g:brand>
      <g:product_type>${escapeHtml(item.productType)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:custom_label_0>public-record-permit-data</g:custom_label_0>
      <g:custom_label_1>${escapeHtml(item.customLabel)}</g:custom_label_1>
      <g:custom_label_2>${stats.rowCount}-row-paid-zip</g:custom_label_2>
      <g:custom_label_3>${previewRows}-row-free-preview</g:custom_label_3>
    </item>`;
  const items = [
    {
      id: 'nyc-construction-activity-brief-current',
      title: 'NYC Weekly Construction Activity Brief current ZIP',
      description,
      url: `${baseUrl}/buy.html?source=product-feed`,
      productType: 'Digital data download',
      customLabel: 'current-issue',
    },
    ...productFeedSegments.map((segment) => {
      const count = rows.filter((row) => segment.workTypes.includes(row.work_type)).length;
      return {
        id: segment.id,
        title: segment.title,
        description: segment.description(count, stats.rowCount),
        url: segment.url,
        productType: segment.productType,
        customLabel: `${segment.customLabel}-${count}-rows`,
      };
    }),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>NYC Weekly Construction Activity Brief product feed</title>
    <link>${baseUrl}/</link>
    <description>Product feed for the current NYC Weekly Construction Activity Brief ZIP.</description>
${items.map(itemXml).join('\n')}
  </channel>
</rss>
`;
}

function buildJsonFeed(rows, manifest) {
  const stats = issueStats(rows);
  const previewRows = publicPreviewRowCount() ?? stats.rowCount;
  const generatedAt = `${stats.sourceFetchDate || new Date().toISOString().slice(0, 10)}T12:00:00Z`;
  const topWorkTypes = stats.workTypes.slice(0, 5).map((item) => `${item.name} ${item.count}`).join(' | ');
  const highIntentTopicItems = highIntentTopicPages
    .filter(([slug]) => manifest.slugs.includes(slug))
    .map(([slug, title]) => ({
      id: `${baseUrl}/topics/${slug}.html`,
      url: `${baseUrl}/topics/${slug}.html`,
      title,
      content_text: `High-intent topic page for buyers comparing the current ${stats.rowCount}-row NYC DOB permit ZIP, source-linked preview files, and sample-request path.`,
      date_published: generatedAt,
    }));
  const fallbackTopicItems = manifest.slugs
    .filter((slug) => !highIntentTopicPages.some(([topicSlug]) => topicSlug === slug))
    .slice(0, 12)
    .map((slug) => ({
      id: `${baseUrl}/topics/${slug}.html`,
      url: `${baseUrl}/topics/${slug}.html`,
      title: slug.replace(/-/g, ' '),
      content_text: 'Current source-linked NYC construction permit activity page from the public preview.',
      date_published: generatedAt,
    }));
  const boroughDemandItems = boroughDemandPages.map((page) => ({
    id: `${baseUrl}/${page.path}`,
    url: `${baseUrl}/${page.path}`,
    title: page.title,
    content_text: `${page.boroughName} sample request page for buyers who need future NYC DOB permit samples by borough, ZIP, work type, and issued date. The current paid issue does not include ${page.boroughName} rows.`,
    date_published: generatedAt,
  }));
  const items = [
    {
      id: `${baseUrl}/current-issue.html`,
      url: `${baseUrl}/current-issue.html`,
      title: `Current NYC construction activity brief: ${stats.rowCount} paid issue rows`,
      content_text: `Current paid issue has ${stats.rowCount} source-linked rows. The free CSV preview has ${previewRows} rows. Launch price is $${launchPriceUsd.toFixed(2)}. Standard price is $${standardPriceUsd}. Issued dates run ${stats.firstIssuedDate} through ${stats.latestIssuedDate}. Top work types: ${topWorkTypes}.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/buy.html?source=json-feed`,
      url: `${baseUrl}/buy.html?source=json-feed`,
      title: 'Buy the current NYC construction activity ZIP',
      content_text: `One-time $${launchPriceUsd.toFixed(2)} Stripe checkout for the current ${stats.rowCount}-row ZIP. Automated browser download follows a paid Checkout Session.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/sample-segments.html`,
      url: `${baseUrl}/sample-segments.html`,
      title: 'Browse current permit activity and buyer-intent pages',
      content_text: `Segment hub for ZIP, borough, work type, issued-date, cost-bucket, and curated buyer-intent pages tied to the current ${stats.rowCount}-row paid issue.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/dataset-catalog.html`,
      url: `${baseUrl}/dataset-catalog.html`,
      title: 'Dataset catalog for current NYC permit data',
      content_text: `Catalog page for the current ${stats.rowCount}-row paid ZIP, ${previewRows}-row public preview, source dataset id rbx6-tga4, fields, formats, and claims boundary.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/share-kit.html`,
      url: `${baseUrl}/share-kit.html`,
      title: 'Share kit for newsletters and community posts',
      content_text: `Copy-safe newsletter and community-post notes for linking to the current ${stats.rowCount}-row NYC construction activity brief without overstating coverage, results, or lead guarantees.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/invoice-request.html`,
      url: `${baseUrl}/invoice-request.html`,
      title: 'Invoice request for procurement-blocked buyers',
      content_text: 'Request-only invoice and procurement help page for buyers blocked by internal purchase-order, invoice, or approval workflows tied to the current NYC construction activity brief.',
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/partner-inquiry.html`,
      url: `${baseUrl}/partner-inquiry.html`,
      title: 'Partner inquiry for newsletter and bundle ideas',
      content_text: 'Request-only partner inquiry page for newsletters, communities, sponsorship discussions, and product-bundle ideas tied to the current NYC construction activity brief.',
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/team-license.html`,
      url: `${baseUrl}/team-license.html`,
      title: 'Team license request for multi-issue access',
      content_text: 'Request-only team license page for multi-user, multi-issue, recurring-access, and procurement-review interest tied to the current NYC construction activity brief.',
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/custom-research.html`,
      url: `${baseUrl}/custom-research.html`,
      title: 'Custom research request for filtered permit briefs',
      content_text: 'Request-only custom research page for filtered briefs, priority-row reviews, client notes, and source-review interest tied to the current NYC construction activity brief.',
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/preview.html`,
      url: `${baseUrl}/preview.html`,
      title: `Free ${previewRows}-row preview`,
      content_text: 'Free public preview with source-linked sample rows, CSV, JSON, JSONL, and a Markdown sample brief.',
      date_published: generatedAt,
    },
    {
      id: dataPackageUrl,
      url: dataPackageUrl,
      title: 'Data package manifest',
      content_text: 'Machine-readable manifest with source, row counts, sample URLs, buyer pages, paid ZIP contents, price, delivery path, and claims boundary.',
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/sample-request.html`,
      url: `${baseUrl}/sample-request.html`,
      title: 'Request a future sample cut',
      content_text: 'Product-specific sample request form for work types, ZIPs, boroughs, and buyer views not covered by the current preview.',
      date_published: generatedAt,
    },
    ...boroughDemandItems,
    {
      id: `${baseUrl}/nyc-building-permits.html`,
      url: `${baseUrl}/nyc-building-permits.html`,
      title: 'NYC building permits',
      content_text: `Search-focused buyer page for reviewing selected NYC building permit rows from the current ${stats.rowCount}-row weekly CSV ZIP.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-dob-approved-permits.html`,
      url: `${baseUrl}/nyc-dob-approved-permits.html`,
      title: 'NYC DOB approved permits',
      content_text: `Source-focused buyer page for reviewing selected DOB approved permit rows from the current ${stats.rowCount}-row weekly CSV ZIP.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-dob-now-approved-permits.html`,
      url: `${baseUrl}/nyc-dob-now-approved-permits.html`,
      title: 'NYC DOB NOW approved permits',
      content_text: `Exact-source buyer page for reviewing selected DOB NOW approved permit rows from the current ${stats.rowCount}-row weekly CSV ZIP.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/dob-now-build-approved-permits.html`,
      url: `${baseUrl}/dob-now-build-approved-permits.html`,
      title: 'DOB NOW Build approved permits',
      content_text: `Dataset-name buyer page for reviewing selected DOB NOW: Build approved permit rows from the current ${stats.rowCount}-row weekly CSV ZIP.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-dob-permit-alerts.html`,
      url: `${baseUrl}/nyc-dob-permit-alerts.html`,
      title: 'NYC DOB permit alerts alternative',
      content_text: `Alert-style buyer page for using the current ${stats.rowCount}-row ZIP as a weekly screening file without real-time alerts or private contact data.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-dob-permit-tracker.html`,
      url: `${baseUrl}/nyc-dob-permit-tracker.html`,
      title: 'NYC DOB permit tracker alternative',
      content_text: `Tracker-style buyer page for using the current ${stats.rowCount}-row ZIP as a weekly source-linked spreadsheet without live monitoring or private contact data.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-dob-permit-monitoring.html`,
      url: `${baseUrl}/nyc-dob-permit-monitoring.html`,
      title: 'NYC DOB permit monitoring alternative',
      content_text: `Monitoring-style buyer page for using the current ${stats.rowCount}-row ZIP as a weekly source-linked review file without live monitoring, alerts, or private contact data.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-dob-permit-watchlist.html`,
      url: `${baseUrl}/nyc-dob-permit-watchlist.html`,
      title: 'NYC DOB permit watchlist alternative',
      content_text: `Watchlist-style buyer page for using the current ${stats.rowCount}-row ZIP as a weekly source-linked review file without live alerts, private contact data, or lead guarantees.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-dob-permit-search.html`,
      url: `${baseUrl}/nyc-dob-permit-search.html`,
      title: 'NYC DOB permit search companion',
      content_text: `Search-focused buyer page for using the current ${stats.rowCount}-row ZIP as a weekly companion to manual NYC DOB permit source checks.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-construction-permit-search.html`,
      url: `${baseUrl}/nyc-construction-permit-search.html`,
      title: 'NYC construction permit search companion',
      content_text: `Search-focused buyer page for using the current ${stats.rowCount}-row ZIP as a weekly companion to manual NYC construction permit source checks.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-dob-permit-lookup.html`,
      url: `${baseUrl}/nyc-dob-permit-lookup.html`,
      title: 'NYC DOB permit lookup companion',
      content_text: `Lookup-focused buyer page for using the current ${stats.rowCount}-row ZIP as a weekly companion to manual NYC DOB permit lookup checks.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-plumbing-permit-leads.html`,
      url: `${baseUrl}/nyc-plumbing-permit-leads.html`,
      title: 'NYC plumbing permit leads',
      content_text: `Current plumbing permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Plumbing') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-sprinkler-permit-leads.html`,
      url: `${baseUrl}/nyc-sprinkler-permit-leads.html`,
      title: 'NYC sprinkler permit leads',
      content_text: `Current sprinkler permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Sprinklers') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-mechanical-systems-permit-leads.html`,
      url: `${baseUrl}/nyc-mechanical-systems-permit-leads.html`,
      title: 'NYC mechanical systems permit leads',
      content_text: `Current mechanical systems permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Mechanical Systems') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-structural-permit-leads.html`,
      url: `${baseUrl}/nyc-structural-permit-leads.html`,
      title: 'NYC structural permit leads',
      content_text: `Current structural permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Structural') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
      date_published: generatedAt,
    },
    {
      id: `${baseUrl}/nyc-construction-fence-permit-leads.html`,
      url: `${baseUrl}/nyc-construction-fence-permit-leads.html`,
      title: 'NYC construction fence permit leads',
      content_text: `Current construction fence permit lead-research page for buyers screening ${(stats.workTypes.find((item) => item.name === 'Construction Fence') || {}).count || 0} selected public DOB rows without private contacts or guaranteed sales.`,
      date_published: generatedAt,
    },
    ...highIntentTopicItems,
    ...fallbackTopicItems,
  ];
  return `${JSON.stringify({
    version: 'https://jsonfeed.org/version/1.1',
    title: 'NYC Weekly Construction Activity Brief',
    home_page_url: `${baseUrl}/`,
    feed_url: jsonFeedUrl,
    description: 'Current source-linked NYC construction permit activity pages, buyer-intent topic hub, sample CSV, and paid ZIP checkout.',
    icon: socialImageUrl,
    favicon: socialImageUrl,
    authors: [{ name: 'NYC Weekly Construction Activity Brief', url: baseUrl }],
    language: 'en',
    items,
  }, null, 2)}\n`;
}

function buildLlmsTxt(rows, manifest) {
  const stats = issueStats(rows);
  const highIntentTopics = highIntentTopicPages
    .filter(([slug]) => manifest.slugs.includes(slug))
    .map(([slug, title]) => `- ${title}: ${baseUrl}/topics/${slug}.html`)
    .join('\n');
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
- Stripe fallback link: ${stripeCheckoutUrl}
- Social image: ${socialImageUrl}
- Price: $${launchPriceUsd.toFixed(2)} one-time ZIP download
- Standard price: $${standardPriceUsd}
- Promo code required: no
- Buyer-only files: buyer-workbook.md, buyer-priority-slices.csv

Primary pages:
- Home: ${baseUrl}/
- Current issue page: ${baseUrl}/current-issue.html
- Dataset catalog: ${baseUrl}/dataset-catalog.html
- Share kit: ${baseUrl}/share-kit.html
- Invoice request: ${baseUrl}/invoice-request.html
- Partner inquiry: ${baseUrl}/partner-inquiry.html
- Team license request: ${baseUrl}/team-license.html
- Custom research request: ${baseUrl}/custom-research.html
- Current issue JSON: ${baseUrl}/current-issue.json
- Data package JSON: ${dataPackageUrl}
- Product feed XML: ${productFeedUrl}
- RSS feed: ${baseUrl}/feed.xml
- JSON Feed: ${jsonFeedUrl}
- Public preview: ${baseUrl}/preview.html
- Pricing: ${baseUrl}/pricing.html
- Time saved calculator: ${baseUrl}/time-saved-calculator.html
- Who should buy: ${baseUrl}/who-should-buy.html
- Buyer FAQ: ${baseUrl}/faq.html
- Free preview vs paid ZIP: ${baseUrl}/free-vs-paid.html
- Research workflow: ${baseUrl}/permit-research-workflow.html
- Contractor guide: ${baseUrl}/contractor-permit-research.html
- Contractor and supplier guide: ${baseUrl}/contractor-supplier-permit-research.html
- Material supplier guide: ${baseUrl}/material-supplier-permit-research.html
- Building-service vendor guide: ${baseUrl}/building-service-vendor-permit-research.html
- Subcontractor guide: ${baseUrl}/subcontractor-permit-research.html
- Broker and developer guide: ${baseUrl}/broker-developer-permit-research.html
- Real estate investor guide: ${baseUrl}/real-estate-investor-permit-research.html
- Construction consultant guide: ${baseUrl}/construction-consultant-permit-research.html
- Construction risk guide: ${baseUrl}/construction-risk-permit-research.html
- Permit expediter guide: ${baseUrl}/permit-expediter-research.html
- Property manager guide: ${baseUrl}/property-manager-permit-research.html
- Inside the ZIP: ${baseUrl}/inside-the-zip.html
- CSV field guide: ${baseUrl}/csv-field-guide.html
- NYC building permits: ${baseUrl}/nyc-building-permits.html
- NYC building permit data: ${baseUrl}/nyc-building-permit-data.html
- NYC DOB permit data download: ${baseUrl}/nyc-dob-permit-data-download.html
- NYC DOB approved permits: ${baseUrl}/nyc-dob-approved-permits.html
- NYC DOB NOW approved permits: ${baseUrl}/nyc-dob-now-approved-permits.html
- DOB NOW Build approved permits: ${baseUrl}/dob-now-build-approved-permits.html
- NYC DOB permit alerts alternative: ${baseUrl}/nyc-dob-permit-alerts.html
- NYC DOB permit tracker alternative: ${baseUrl}/nyc-dob-permit-tracker.html
- NYC DOB permit monitoring alternative: ${baseUrl}/nyc-dob-permit-monitoring.html
- NYC DOB permit watchlist alternative: ${baseUrl}/nyc-dob-permit-watchlist.html
- NYC DOB permit search companion: ${baseUrl}/nyc-dob-permit-search.html
- NYC construction permit search companion: ${baseUrl}/nyc-construction-permit-search.html
- NYC DOB permit lookup companion: ${baseUrl}/nyc-dob-permit-lookup.html
- NYC DOB permit CSV: ${baseUrl}/nyc-dob-permit-csv.html
- NYC permit data API alternative: ${baseUrl}/nyc-permit-data-api-alternative.html
- Weekly NYC construction permit report: ${baseUrl}/weekly-nyc-construction-permit-report.html
- DOB NOW permit search alternative: ${baseUrl}/dob-now-permit-search-alternative.html
- NYC construction permit leads alternative: ${baseUrl}/nyc-construction-permit-leads.html
- NYC permit activity by ZIP: ${baseUrl}/nyc-permit-activity-by-zip.html
- Manhattan construction permit activity: ${baseUrl}/manhattan-construction-permit-activity.html
- Brooklyn construction permit activity: ${baseUrl}/brooklyn-construction-permit-activity.html
${boroughDemandPages.map((page) => `- ${page.title}: ${baseUrl}/${page.path}`).join('\n')}
- NYC sidewalk shed permits: ${baseUrl}/nyc-sidewalk-shed-permits.html
- NYC sidewalk shed permit leads: ${baseUrl}/nyc-sidewalk-shed-permit-leads.html
- NYC plumbing permit leads: ${baseUrl}/nyc-plumbing-permit-leads.html
- NYC plumbing permits: ${baseUrl}/nyc-plumbing-permits.html
- NYC sprinkler permit leads: ${baseUrl}/nyc-sprinkler-permit-leads.html
- NYC sprinkler permits: ${baseUrl}/nyc-sprinkler-permits.html
- NYC mechanical systems permit leads: ${baseUrl}/nyc-mechanical-systems-permit-leads.html
- NYC mechanical systems permits: ${baseUrl}/nyc-mechanical-systems-permits.html
- NYC supported scaffold permits: ${baseUrl}/nyc-supported-scaffold-permits.html
- NYC supported scaffold permit leads: ${baseUrl}/nyc-supported-scaffold-permit-leads.html
- NYC structural permit leads: ${baseUrl}/nyc-structural-permit-leads.html
- NYC structural permits: ${baseUrl}/nyc-structural-permits.html
- NYC construction fence permit leads: ${baseUrl}/nyc-construction-fence-permit-leads.html
- NYC construction fence permits: ${baseUrl}/nyc-construction-fence-permits.html
- Buyer guide: ${baseUrl}/buyer-guide.html
- Delivery steps: ${baseUrl}/delivery.html
- Support and refunds: ${baseUrl}/support.html
- Sample request: ${baseUrl}/sample-request.html
- Sample CSV: ${baseUrl}/sample/nyc-construction-activity-preview.csv
- Sample JSON: ${baseUrl}/sample/nyc-construction-activity-preview.json
- Sample JSONL: ${baseUrl}/sample/nyc-construction-activity-preview.jsonl
- Sample brief: ${baseUrl}/sample/nyc-weekly-construction-activity-sample.md
- Segment hub: ${baseUrl}/sample-segments.html
- Methodology: ${baseUrl}/methodology.html

Current counts:
${stats.workTypes.map((item) => `- ${item.name}: ${item.count}`).join('\n')}

High-intent topic pages:
${highIntentTopics}

Boundaries:
- No owner names, applicant names, phone numbers, emails, full street addresses, or enriched contact data.
- No guaranteed leads.
- Not affiliated with or endorsed by NYC, DOB, or any agency.
- Source records can be incomplete, delayed, revised, duplicated, or mislabeled.

Generated topic page count: ${manifest.totalTopicPages}
`;
}

function buildDatasetCatalogHtml(rows) {
  const stats = issueStats(rows);
  const previewRows = publicPreviewRowCount() ?? stats.rowCount;
  const temporalCoverage = `${stats.firstIssuedDate}/${stats.latestIssuedDate}`;
  const workTypes = stats.workTypes.map((item) => item.name).join(', ');
  const zips = stats.zipCodes.map((item) => item.zipCode).join(', ');
  const description = 'Dataset catalog for the NYC Weekly Construction Activity Brief public preview, current paid ZIP, source window, fields, formats, and claims boundary.';
  const datasetJson = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'NYC Weekly Construction Activity Brief dataset catalog',
    description,
    url: `${baseUrl}/dataset-catalog.html`,
    isBasedOn: {
      '@type': 'Dataset',
      name: 'NYC DOB NOW: Build - Approved Permits',
      url: 'https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4',
      identifier: 'rbx6-tga4',
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
    temporalCoverage,
    dateModified: stats.sourceFetchDate,
    keywords: [
      'NYC DOB permits',
      'NYC building permit data',
      'construction permit CSV',
      'DOB NOW approved permits',
      ...stats.workTypes.map((item) => item.name),
      ...stats.zipCodes.map((item) => `ZIP ${item.zipCode}`),
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
        name: 'Public JSON preview',
        encodingFormat: 'application/json',
        contentUrl: `${baseUrl}/sample/nyc-construction-activity-preview.json`,
      },
      {
        '@type': 'DataDownload',
        name: 'Public JSONL preview',
        encodingFormat: 'application/x-ndjson',
        contentUrl: `${baseUrl}/sample/nyc-construction-activity-preview.jsonl`,
      },
      {
        '@type': 'DataDownload',
        name: 'Data package metadata',
        encodingFormat: 'application/json',
        contentUrl: dataPackageUrl,
      },
    ],
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/buy.html?source=dataset-catalog`,
      priceCurrency: 'USD',
      price: launchPriceUsd.toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NYC Construction Permit Dataset Catalog | DOB Brief</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${baseUrl}/dataset-catalog.html">
    <link rel="alternate" type="application/rss+xml" title="NYC Weekly Construction Activity Brief RSS" href="${baseUrl}/feed.xml">
    <link rel="alternate" type="application/feed+json" title="NYC Weekly Construction Activity Brief JSON Feed" href="${jsonFeedUrl}">
    <link rel="alternate" type="application/json" title="NYC Weekly Construction Activity Brief current issue" href="${baseUrl}/current-issue.json">
    <meta property="og:type" content="website">
    <meta property="og:title" content="NYC Construction Permit Dataset Catalog | DOB Brief">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${baseUrl}/dataset-catalog.html">
    <meta property="og:image" content="${socialImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${socialImageUrl}">
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${JSON.stringify(datasetJson)}</script>
    <script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
  </head>
  <body class="has-conversion-bar">
    <main>
      <nav><a href="/">NYC Construction Activity Brief</a></nav>
      <h1>NYC construction permit dataset catalog.</h1>
      <p class="lede">A current catalog for the public preview, paid ZIP, source dataset, formats, fields, and use limits.</p>
      <p>
        <a class="button" href="${baseUrl}/buy.html?source=dataset-catalog">Buy $${launchPriceUsd.toFixed(2)} ZIP</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">Download free CSV preview</a>
      </p>
      <p class="fine">Use this page to inspect the row shape and source boundary before buying.</p>

      <section class="grid">
        <div class="card">
          <h2>Current source window</h2>
          <p>${stats.firstIssuedDate} to ${stats.latestIssuedDate}. Source fetch date: ${stats.sourceFetchDate}.</p>
        </div>
        <div class="card">
          <h2>Rows</h2>
          <p>${previewRows} free preview rows. ${stats.rowCount} rows in the paid ZIP.</p>
        </div>
        <div class="card">
          <h2>Formats</h2>
          <p>CSV, JSON, JSONL, Markdown sample brief, data package JSON, product feed XML, and current issue JSON.</p>
        </div>
      </section>

      <section class="section card">
        <h2>Source and coverage</h2>
        <p>Source: NYC DOB NOW: Build - Approved Permits, dataset id rbx6-tga4.</p>
        <p>Current work types: ${escapeHtml(workTypes)}.</p>
        <p>Current ZIP codes: ${escapeHtml(zips)}.</p>
        <p><a class="button secondary" href="https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4">Open source dataset</a></p>
      </section>

      <section class="section card">
        <h2>Fields</h2>
        <ul>
          <li>source_url, source_fetch_date, borough, zip_code, work_type, issued_date, permit_status.</li>
          <li>estimated_job_cost_bucket, permit_id, work_permit, job_filing_number, job_description_short.</li>
          <li>source_caveat for row-level notes about public-record limits.</li>
        </ul>
      </section>

      <section class="section card">
        <h2>Downloads and feeds</h2>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.csv">CSV preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.json">JSON preview</a>
        <a class="button secondary" href="/sample/nyc-construction-activity-preview.jsonl">JSONL preview</a>
        <a class="button secondary" href="/data-package.json">Data package JSON</a>
        <a class="button secondary" href="/current-issue.json">Current issue JSON</a>
        <a class="button secondary" href="/product-feed.xml">Product feed XML</a>
        <a class="button secondary" href="/feed.json">JSON Feed</a>
      </section>

      <section class="section card">
        <h2>Paid ZIP</h2>
        <p>The paid ZIP includes the full ${stats.rowCount}-row source-linked CSV, Markdown brief, buyer workbook, priority-slices CSV, source registry, QA report, version file, buyer README, and claims boundary.</p>
        <a class="button" href="${baseUrl}/buy.html?source=dataset-catalog-paid-zip">Buy instant ZIP</a>
        <a class="button secondary" href="/inside-the-zip.html">See ZIP contents</a>
        <a class="button secondary" href="/sample-request.html?source=dataset-catalog">Request a future sample cut</a>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No owner names, applicant names, phone numbers, email addresses, full street addresses, or enriched contact data are included. No guaranteed leads. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
    <aside class="conversion-bar" data-conversion-bar>
      <p><strong>$${launchPriceUsd.toFixed(2)}</strong> current issue ZIP. Instant Stripe checkout and browser download.</p>
      <div class="conversion-actions">
        <a class="button secondary" href="/sample-request.html?source=dataset-catalog-bar">Sample request</a>
        <a class="button" href="${baseUrl}/checkout.html?source=dataset-catalog">Buy ZIP</a>
      </div>
    </aside>
  </body>
</html>
`;
}

function insertHeadLinks(html) {
  const links = `    <link rel="alternate" type="application/rss+xml" title="NYC Weekly Construction Activity Brief RSS" href="${baseUrl}/feed.xml">
    <link rel="alternate" type="application/feed+json" title="NYC Weekly Construction Activity Brief JSON Feed" href="${jsonFeedUrl}">
    <link rel="alternate" type="application/json" title="NYC Weekly Construction Activity Brief current issue" href="${baseUrl}/current-issue.json">`;
  const withoutDiscoveryLinks = html.replace(
    /    <link rel="alternate" type="application\/(?:rss\+xml|feed\+json|json)" title="NYC Weekly Construction Activity Brief [^"]+" href="[^"]+">\n/g,
    '',
  );
  return withoutDiscoveryLinks.replace(/(    <link rel="canonical" href="[^"]+">\n)/, `$1${links}\n`);
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
JSON-Feed: ${jsonFeedUrl}
Current-Issue: ${baseUrl}/current-issue.json
Data-Package: ${dataPackageUrl}
Product-Feed: ${productFeedUrl}
Dataset-Catalog: ${baseUrl}/dataset-catalog.html
Share-Kit: ${baseUrl}/share-kit.html
Invoice-Request: ${baseUrl}/invoice-request.html
Partner-Inquiry: ${baseUrl}/partner-inquiry.html
Team-License: ${baseUrl}/team-license.html
Custom-Research: ${baseUrl}/custom-research.html
`;
  fs.writeFileSync(robotsPath, text);
}

function updateSitemap(lastmod) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const extraUrls = ['current-issue.html', 'dataset-catalog.html', 'share-kit.html', 'invoice-request.html', 'partner-inquiry.html', 'team-license.html', 'custom-research.html', 'preview.html', 'buy.html', 'pricing.html', 'time-saved-calculator.html', 'who-should-buy.html', 'faq.html', 'free-vs-paid.html', 'permit-research-workflow.html', 'contractor-permit-research.html', 'contractor-supplier-permit-research.html', 'material-supplier-permit-research.html', 'building-service-vendor-permit-research.html', 'subcontractor-permit-research.html', 'broker-developer-permit-research.html', 'real-estate-investor-permit-research.html', 'construction-consultant-permit-research.html', 'construction-risk-permit-research.html', 'permit-expediter-research.html', 'property-manager-permit-research.html', 'inside-the-zip.html', 'csv-field-guide.html', 'nyc-building-permits.html', 'nyc-building-permit-data.html', 'nyc-dob-permit-data-download.html', 'nyc-dob-approved-permits.html', 'nyc-dob-now-approved-permits.html', 'dob-now-build-approved-permits.html', 'nyc-dob-permit-alerts.html', 'nyc-dob-permit-tracker.html', 'nyc-dob-permit-monitoring.html', 'nyc-dob-permit-watchlist.html', 'nyc-dob-permit-search.html', 'nyc-construction-permit-search.html', 'nyc-dob-permit-lookup.html', 'nyc-dob-permit-csv.html', 'nyc-permit-data-api-alternative.html', 'weekly-nyc-construction-permit-report.html', 'dob-now-permit-search-alternative.html', 'nyc-construction-permit-leads.html', 'nyc-permit-activity-by-zip.html', 'manhattan-construction-permit-activity.html', 'brooklyn-construction-permit-activity.html', 'queens-construction-permit-activity.html', 'bronx-construction-permit-activity.html', 'staten-island-construction-permit-activity.html', 'nyc-sidewalk-shed-permits.html', 'nyc-sidewalk-shed-permit-leads.html', 'nyc-supported-scaffold-permit-leads.html', 'nyc-plumbing-permit-leads.html', 'nyc-plumbing-permits.html', 'nyc-sprinkler-permit-leads.html', 'nyc-sprinkler-permits.html', 'nyc-mechanical-systems-permit-leads.html', 'nyc-mechanical-systems-permits.html', 'nyc-supported-scaffold-permits.html', 'nyc-structural-permit-leads.html', 'nyc-structural-permits.html', 'nyc-construction-fence-permit-leads.html', 'nyc-construction-fence-permits.html', 'buyer-guide.html', 'delivery.html', 'support.html', 'sample-request.html', 'sample/nyc-construction-activity-preview.csv', 'sample/nyc-construction-activity-preview.json', 'sample/nyc-construction-activity-preview.jsonl', 'sample/nyc-weekly-construction-activity-sample.md', 'feed.xml', 'feed.json', 'current-issue.json', 'data-package.json', 'product-feed.xml', 'llms.txt'];
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
fs.writeFileSync(path.join(root, 'data-package.json'), `${JSON.stringify(buildDataPackageJson(rows, manifest), null, 2)}\n`);
fs.writeFileSync(path.join(root, 'feed.xml'), buildFeedXml(rows, manifest));
fs.writeFileSync(path.join(root, 'feed.json'), buildJsonFeed(rows, manifest));
fs.writeFileSync(path.join(root, 'product-feed.xml'), buildProductFeedXml(rows));
fs.writeFileSync(path.join(root, 'llms.txt'), buildLlmsTxt(rows, manifest));
fs.writeFileSync(path.join(root, 'dataset-catalog.html'), buildDatasetCatalogHtml(rows));
updateHtmlAlternates();
updateRobots();
updateSitemap(stats.sourceFetchDate || new Date().toISOString().slice(0, 10));
execFileSync(process.execPath, [path.join(__dirname, 'rewrite-site-base-url.js')], { stdio: 'inherit' });

console.log(`generated discovery feeds for ${rows.length} rows and ${manifest.totalTopicPages} topic pages`);
