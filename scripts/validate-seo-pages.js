const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nycpermitbrief.com';
const checkoutUrl = 'https://nycpermitbrief.com/checkout.html\\?source=[a-z0-9._-]+';
const purchaseUrl = 'https://nycpermitbrief.com/buy.html\\?source=[a-z0-9._-]+';
const stripeCheckoutUrl = 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q';
const socialImageUrl = `${baseUrl}/assets/current-issue-snapshot.png`;
const socialImagePath = path.join(root, 'assets/current-issue-snapshot.png');
const pageData = require('./seo-pages.json');
const manifest = require('./generated-pages-manifest.json');
const pages = manifest.slugs.map((slug) => `topics/${slug}.html`);
const manualPages = pageData.map((page) => `topics/${page.slug}.html`);
const generatedPages = pages.filter((page) => !manualPages.includes(page));
const bannedCopyPatterns = [
  /\bdelve\b/i,
  /\bleverage\b/i,
  /\brobust\b/i,
  /\blandscape\b/i,
  /\btapestry\b/i,
  /\bserves as\b/i,
  /\bit's not\b/i,
  /\bhere's the thing\b/i,
  /\blet's break\b/i,
  /\bimagine a world\b/i,
];
const privateDataPatterns = [
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  /\b\d{3}[-. ]\d{3}[-. ]\d{4}\b/,
];
const rawCostBucketPattern = /\b(?:under_10k|10k_to_50k|50k_to_100k|100k_to_250k|250k_to_1m|1m_plus)\b/;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
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

function sourceDateRange() {
  const lines = fs.readFileSync(path.resolve(root, manifest.source), 'utf8').trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  const issuedDateIndex = headers.indexOf('issued_date');
  const dates = lines
    .map((line) => parseCsvLine(line)[issuedDateIndex])
    .filter(Boolean)
    .map((date) => date.slice(0, 10))
    .sort();
  return `${dates[0]}/${dates[dates.length - 1]}`;
}

function assertHtmlPage(relativePath) {
  const html = read(relativePath);
  assert.match(html, /<title>[^<]{25,70}<\/title>/, `${relativePath} needs a specific title`);
  assert.match(
    html,
    /<meta name="description" content="[^"]{80,170}">/,
    `${relativePath} needs a useful meta description`,
  );
  assert.match(
    html,
    new RegExp(`<link rel="canonical" href="${baseUrl}/${relativePath}">`),
    `${relativePath} needs a canonical URL`,
  );
  assert.match(html, new RegExp(`<link rel="alternate" type="application/rss\\+xml"[^>]+href="${baseUrl}/feed\\.xml">`), `${relativePath} links RSS feed`);
  assert.match(html, new RegExp(`<link rel="alternate" type="application/feed\\+json"[^>]+href="${baseUrl}/feed\\.json">`), `${relativePath} links JSON Feed`);
  assert.match(html, new RegExp(`<link rel="alternate" type="application/json"[^>]+href="${baseUrl}/current-issue\\.json">`), `${relativePath} links current issue JSON`);
  assert.match(html, /<meta property="og:title" content="[^"]+">/, `${relativePath} needs OG title`);
  assert.match(html, /<meta property="og:description" content="[^"]+">/, `${relativePath} needs OG description`);
  assert.match(html, new RegExp(`<meta property="og:image" content="${socialImageUrl}">`), `${relativePath} needs social image`);
  assert.match(html, /<meta property="og:image:width" content="1200">/, `${relativePath} needs social image width`);
  assert.match(html, /<meta property="og:image:height" content="630">/, `${relativePath} needs social image height`);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/, `${relativePath} needs large Twitter card`);
  assert.match(html, new RegExp(`<meta name="twitter:image" content="${socialImageUrl}">`), `${relativePath} needs Twitter image`);
  assert.match(html, /"@type":"Product"/, `${relativePath} needs Product structured data`);
  assert.match(html, /"@type":"Offer"/, `${relativePath} needs Offer structured data`);
  assert.match(html, /"price":"9.50"/, `${relativePath} needs current price structured data`);
  assert.match(html, /"@type":"Dataset"/, `${relativePath} needs Dataset structured data`);
  assert.match(html, /"isPartOf":{"@type":"Dataset"/, `${relativePath} needs current issue Dataset relationship`);
  assert.match(html, /"@type":"BreadcrumbList"/, `${relativePath} needs breadcrumb structured data`);
  assert.match(html, /\/_vercel\/insights\/script\.js/, `${relativePath} needs Web Analytics script`);
  assert.match(html, /<h1>[^<]+<\/h1>/, `${relativePath} needs one visible h1`);
  assert.match(html, /href="\/sample\/nyc-construction-activity-preview\.csv"/, `${relativePath} links sample CSV`);
  assert.match(html, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, `${relativePath} links sample brief`);
  assert.match(html, new RegExp(`href="${purchaseUrl}"`), `${relativePath} links tracked buy page`);
  const slug = relativePath.startsWith('topics/')
    ? relativePath.replace(/^topics\//, '').replace(/\.html$/, '')
    : null;
  const attributedPurchaseUrl = slug
    ? `${baseUrl}/buy.html?source=topic-${slug}`
    : null;
  const attributedCheckoutUrl = slug
    ? `${baseUrl}/checkout.html?source=topic-${slug}`
    : null;
  if (slug) {
    assert.match(
      html,
      new RegExp(`href="${attributedPurchaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
      `${relativePath} uses page-specific buy attribution`,
    );
    assert.match(
      html,
      new RegExp(`<p class="lede">[\\s\\S]+href="${attributedPurchaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]+The buy page shows sample rows first\\. Stripe checkout starts after your next click\\.[\\s\\S]+<section class="grid">`),
      `${relativePath} has an above-fold attributed buy CTA`,
    );
    assert.match(
      html,
      new RegExp(`"url":"${attributedPurchaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
      `${relativePath} Product schema uses page-specific buy attribution`,
    );
  }
  assert.match(html, /data-sample-request-form/, `${relativePath} needs sample request form`);
  assert.match(html, /\/api\/sample-request/, `${relativePath} posts sample requests to API`);
  assert.match(html, /data\.source_path = window\.location\.pathname;/, `${relativePath} sends source path with sample request`);
  assert.match(html, /data\.entry_source = \/\^\[a-z0-9\._-\]\{1,80\}\$\/i\.test\(rawEntrySource\) \? rawEntrySource : '';/, `${relativePath} sends safe entry source with sample request`);
  assert.match(html, /const requestSource = \['sample-request', window\.location\.pathname\.replace/, `${relativePath} builds page-specific sample request checkout source`);
  assert.match(html, /function sampleRequestEventPrefix\(form\)/, `${relativePath} resolves request analytics event prefix`);
  assert.match(html, /eventPrefix \+ '_submitted'/, `${relativePath} tracks sample request submit attempts`);
  assert.match(html, /eventPrefix \+ '_saved'/, `${relativePath} tracks saved sample requests`);
  assert.match(html, /eventPrefix \+ '_failed'/, `${relativePath} tracks failed sample requests`);
  assert.match(html, /eventPrefix \+ '_cta_clicked'/, `${relativePath} tracks sample request CTA clicks`);
  assert.match(html, /sampleRequestFallbackHref/, `${relativePath} builds email fallback for failed sample requests`);
  assert.match(html, /const supportAddress = \['support', 'magick\.me'\]\.join\('@'\);/, `${relativePath} email fallback uses support address without exposing it directly`);
  assert.match(html, /'mailto:' \+ supportAddress/, `${relativePath} email fallback builds mailto link`);
  assert.match(html, /NYC Construction Brief sample request/, `${relativePath} email fallback has product-specific subject`);
  assert.match(html, /Monitoring goal: /, `${relativePath} email fallback preserves request details`);
  assert.match(html, /Email this request/, `${relativePath} failed sample request copy preserves buyer intent`);
  assert.match(html, /encodeURIComponent\(requestSource\)/, `${relativePath} links buy page with page-specific sample request source`);
  assert.match(html, /class="has-conversion-bar"/, `${relativePath} uses sticky conversion bar layout`);
  assert.match(html, /data-conversion-bar/, `${relativePath} needs sticky conversion bar`);
  assert.match(html, /Sample request/, `${relativePath} conversion bar links sample request`);
  assert.match(
    html,
    new RegExp(`data-conversion-bar[\\s\\S]+href="${attributedCheckoutUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
    `${relativePath} conversion bar links attributed checkout bridge`,
  );
  assert.match(html, /This does not join the MagickMe newsletter\./, `${relativePath} needs list-separation copy`);
  assert.match(html, /No guaranteed leads\./, `${relativePath} keeps claims boundary visible`);
  if (generatedPages.includes(relativePath)) {
    assert.match(html, /<h2>Sample counts<\/h2>/, `${relativePath} needs sample counts`);
    assert.match(html, /<h2>Example rows from the current issue sample<\/h2>/, `${relativePath} needs example rows`);
    assert.match(html, /DOB NOW row/, `${relativePath} needs source row links`);
    assert.match(html, /<h2>Common questions<\/h2>/, `${relativePath} needs buyer-search FAQ copy`);
    assert.match(html, /"@type":"FAQPage"/, `${relativePath} needs FAQ structured data`);
  }
  for (const pattern of bannedCopyPatterns) {
    assert.doesNotMatch(html, pattern, `${relativePath} contains banned copy pattern ${pattern}`);
  }
  for (const pattern of privateDataPatterns) {
    assert.doesNotMatch(html, pattern, `${relativePath} contains private data pattern ${pattern}`);
  }
  assert.doesNotMatch(html, rawCostBucketPattern, `${relativePath} contains raw cost bucket labels`);
}

function assertSampleRequestForm(html, label, options = {}) {
  const subject = options.subject || 'NYC Construction Brief sample request';
  const failedLinkCopy = options.failedLinkCopy || 'Email this request';
  const statusCopy = options.statusCopy || 'This does not join the MagickMe newsletter.';
  const eventPrefix = options.eventPrefix || 'sample_request';
  assert.match(html, /href="#sample-request"/, `${label} links sample request form`);
  assert.match(html, /id="sample-request"/, `${label} has sample request form anchor`);
  assert.match(html, /data-sample-request-form/, `${label} needs sample request form`);
  assert.match(html, /\/api\/sample-request/, `${label} posts sample requests to API`);
  assert.match(html, /data\.source_path = window\.location\.pathname;/, `${label} sends source path with sample request`);
  assert.match(html, /data\.entry_source = \/\^\[a-z0-9\._-\]\{1,80\}\$\/i\.test\(rawEntrySource\) \? rawEntrySource : '';/, `${label} sends safe entry source with sample request`);
  assert.match(html, /function sampleRequestEventPrefix\(form\)/, `${label} resolves request analytics event prefix`);
  assert.match(html, /return \/\^\[a-z0-9_\]\{1,40\}\$\/i\.test\(prefix\) \? prefix : 'sample_request';/, `${label} falls back to sample request analytics events`);
  assert.match(html, /eventPrefix \+ '_submitted'/, `${label} tracks request submit attempts`);
  assert.match(html, /eventPrefix \+ '_saved'/, `${label} tracks saved requests`);
  assert.match(html, /eventPrefix \+ '_failed'/, `${label} tracks failed requests`);
  assert.match(html, /eventPrefix \+ '_cta_clicked'/, `${label} tracks request CTA clicks`);
  if (eventPrefix !== 'sample_request') {
    assert.match(html, new RegExp(`data-event-prefix="${eventPrefix}"`), `${label} tags custom analytics events`);
  }
  assert.match(html, /sampleRequestFallbackHref/, `${label} builds email fallback for failed sample requests`);
  assert.match(html, /const supportAddress = \['support', 'magick\.me'\]\.join\('@'\);/, `${label} email fallback uses support address without exposing it directly`);
  assert.match(html, /'mailto:' \+ supportAddress/, `${label} email fallback builds mailto link`);
  assert.match(html, new RegExp(subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${label} email fallback has product-specific subject`);
  assert.match(html, /Monitoring goal: /, `${label} email fallback preserves request details`);
  assert.match(html, new RegExp(failedLinkCopy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${label} failed sample request copy preserves buyer intent`);
  assert.match(html, new RegExp(statusCopy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${label} keeps list-separation copy`);
}

function assertConversionBar(html, label, source) {
  const expectedCheckout = `https://nycpermitbrief.com/checkout.html?source=${source}`;
  assert.match(html, /class="[^"]*has-conversion-bar[^"]*"/, `${label} uses sticky conversion bar layout`);
  assert.match(html, /data-conversion-bar/, `${label} needs sticky conversion bar`);
  assert.match(html, /Sample request/, `${label} conversion bar links sample request`);
  assert.match(
    html,
    new RegExp(`data-conversion-bar[\\s\\S]+href="${expectedCheckout.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
    `${label} conversion bar links attributed checkout`,
  );
}

function assertTopPurchaseCta(html, label, source) {
  const expectedCheckout = `https://nycpermitbrief.com/checkout.html?source=${source}`;
  assert.match(
    html,
    new RegExp(`<p class="lede">[\\s\\S]+href="${expectedCheckout.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">Buy \\$9\\.50 ZIP</a>[\\s\\S]+Stripe checkout opens after your click\\. Use the CSV preview first if you need to confirm the row shape\\.[\\s\\S]+<section`),
    `${label} has an above-fold attributed buy CTA`,
  );
}

const coreConversionPages = [
  ['index.html', 'home-sticky'],
  ['preview.html', 'preview-sticky'],
  ['current-issue.html', 'current-issue-sticky'],
  ['pricing.html', 'pricing-sticky'],
  ['inside-the-zip.html', 'inside-the-zip-sticky'],
  ['faq.html', 'faq-sticky'],
  ['free-vs-paid.html', 'free-vs-paid-sticky'],
  ['buyer-guide.html', 'buyer-guide-sticky'],
  ['csv-field-guide.html', 'csv-field-guide-sticky'],
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
  ['manhattan-construction-permit-activity.html', 'manhattan-permit-activity-sticky'],
  ['brooklyn-construction-permit-activity.html', 'brooklyn-permit-activity-sticky'],
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
  ['delivery.html', 'delivery-sticky'],
  ['support.html', 'support-sticky'],
  ['sample-request.html', 'sample-request-sticky'],
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

assert.equal(manifest.sourceRows, 142, 'manifest source row count changed unexpectedly');
assert.equal(manifest.manualPages, pageData.length, 'manifest manual page count must match seo-pages.json');
assert.ok(manifest.generatedPages >= 65, 'expected at least 65 generated long-tail pages');
assert.equal(manifest.totalTopicPages, pages.length, 'manifest topic page count must match slugs');

for (const page of pages) {
  assertHtmlPage(page);
}

for (const [page, source] of coreConversionPages) {
  assertConversionBar(read(page), page, source);
}

for (const [page, source] of coreTopCtaPages) {
  assertTopPurchaseCta(read(page), page, source);
}

const index = read('index.html');
assert.match(
  index,
  new RegExp(`<link rel="canonical" href="${baseUrl}/">`),
  'index needs a canonical URL',
);
assert.match(index, new RegExp(`<link rel="alternate" type="application/rss\\+xml"[^>]+href="${baseUrl}/feed\\.xml">`), 'index links RSS feed');
assert.match(index, new RegExp(`<link rel="alternate" type="application/feed\\+json"[^>]+href="${baseUrl}/feed\\.json">`), 'index links JSON Feed');
assert.match(index, new RegExp(`<link rel="alternate" type="application/json"[^>]+href="${baseUrl}/current-issue\\.json">`), 'index links current issue JSON');
assert.match(index, /<meta property="og:title" content="[^"]+">/, 'index needs OG title');
assert.match(index, new RegExp(`<meta property="og:image" content="${socialImageUrl}">`), 'index needs social image');
assert.match(index, /<meta property="og:image:width" content="1200">/, 'index needs social image width');
assert.match(index, /<meta property="og:image:height" content="630">/, 'index needs social image height');
assert.match(index, /<meta name="twitter:card" content="summary_large_image">/, 'index needs large Twitter card');
assert.match(index, new RegExp(`<meta name="twitter:image" content="${socialImageUrl}">`), 'index needs Twitter image');
assert.match(index, /<script type="application\/ld\+json">[^<]+"@type":"Product"/, 'index needs Product structured data');
assert.match(index, /https:\/\/nycpermitbrief\.com\/buy\.html\?source=home-schema/, 'index Product schema points to buy page');
assert.match(index, /"@type":"Dataset","name":"NYC Weekly Construction Activity Brief public preview"/, 'index needs public preview Dataset structured data');
assert.match(index, /"temporalCoverage":"2026-06-09\/2026-06-12"/, 'index Dataset schema needs current source date coverage');
assert.match(index, /"includedInDataCatalog":{"@type":"DataCatalog","name":"NYC Construction Activity Brief dataset catalog"/, 'index Dataset schema links data catalog');
assert.match(index, /"identifier":"rbx6-tga4"/, 'index Dataset schema identifies source dataset');
assert.match(index, /"@type":"DataDownload","encodingFormat":"text\/csv","contentUrl":"https:\/\/nycpermitbrief\.com\/sample\/nyc-construction-activity-preview\.csv"/, 'index Dataset schema links CSV preview');
assert.match(index, /"@type":"DataDownload","encodingFormat":"application\/json","contentUrl":"https:\/\/nycpermitbrief\.com\/sample\/nyc-construction-activity-preview\.json"/, 'index Dataset schema links JSON preview');
assert.match(index, /"@type":"DataDownload","encodingFormat":"application\/x-ndjson","contentUrl":"https:\/\/nycpermitbrief\.com\/sample\/nyc-construction-activity-preview\.jsonl"/, 'index Dataset schema links JSONL preview');
assert.match(index, /"@type":"FAQPage"/, 'index needs FAQPage structured data');
assert.match(index, /"name":"How is the current issue delivered\?"/, 'index FAQ schema answers delivery');
assert.match(index, /"name":"What files are in the paid ZIP\?"/, 'index FAQ schema answers ZIP contents');
assert.match(index, /"name":"Does the brief include owner names, emails, phone numbers, or lead scores\?"/, 'index FAQ schema answers contact-data boundary');
assert.match(index, /"@type":"Organization"/, 'index needs Organization structured data');
assert.match(index, /"@type":"WebSite"/, 'index needs WebSite structured data');
assert.match(index, /"publisher":{"@type":"Organization","name":"NYC Weekly Construction Activity Brief"/, 'index WebSite schema names publisher');
assert.match(index, /\/_vercel\/insights\/script\.js/, 'index needs Web Analytics script');
assert.match(index, /<link rel="preload" as="image" href="\/assets\/nyc-construction-worker-hero\.jpg">/, 'index preloads hero image');
assert.match(index, /url\("\/assets\/nyc-construction-worker-hero\.jpg"\)/, 'index uses human worksite hero image');
assert.match(index, /Photo: <a href="https:\/\/unsplash\.com\/@javiramos">Javier de la Maza<\/a>/, 'index credits hero image source');
assert.doesNotMatch(index, /Delivered by email after purchase/i, 'index must not promise email delivery');
assert.match(index, /Instant download after completed Stripe checkout/, 'index needs current automated delivery copy');
assert.match(index, /Buy instant ZIP/, 'index needs a clear instant ZIP checkout CTA');
assert.match(index, /href="\/buy\.html\?source=home-hero"/, 'index hero links buy page');
assert.match(index, /href="\/buy\.html\?source=home-card"/, 'index card links buy page');
assert.match(index, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=home-sticky"/, 'index sticky bar links checkout bridge');
assert.match(index, /window\.scrollY > 720/, 'index sticky bar should wait until after the first screen');
assert.match(index, /conversion-bar-visible/, 'index sticky bar should be scroll-revealed');
assert.match(index, /href="\/buy\.html\?source=' \+ encodeURIComponent\(requestSource\)/, 'index sample request fallback links tracked buy page');
assert.match(index, /Launch price is \$9\.50 for the current issue/, 'index needs launch price copy');
assert.match(index, /class="product-mockup"/, 'index needs skeuomorphic product mockup');
assert.match(index, /Mockup of the paid ZIP containing the weekly brief, CSV, workbook, and source notes/, 'index product mockup needs accessible label');
assert.match(index, /CSV \+ workbook \+ source notes/, 'index product mockup needs tangible ZIP contents');
assert.match(index, /What is in the paid ZIP/, 'index needs paid package contents');
assert.match(index, /Free preview rows: 25\. Paid ZIP rows: 142/, 'index needs free versus paid row counts');
assert.match(index, /src="\/assets\/current-issue-snapshot\.png"/, 'index needs current issue snapshot image');
assert.match(index, /Buyer workbook with a fast review path/, 'index needs buyer workbook offer copy');
assert.match(index, /Priority-slices CSV grouped by work type/, 'index needs priority-slices offer copy');
assert.match(index, /data-sample-request-form/, 'index needs sample request form');
assert.match(index, /\/api\/sample-request/, 'index posts sample requests to API');
assert.match(index, /data\.source_path = window\.location\.pathname;/, 'index sends source path with sample request');
assert.match(index, /data\.entry_source = \/\^\[a-z0-9\._-\]\{1,80\}\$\/i\.test\(rawEntrySource\) \? rawEntrySource : '';/, 'index sends safe entry source with sample request');
assert.match(index, /const requestSource = \['sample-request', window\.location\.pathname\.replace/, 'index builds page-specific sample request checkout source');
assert.match(index, /eventPrefix \+ '_submitted'/, 'index tracks sample request submit attempts');
assert.match(index, /eventPrefix \+ '_saved'/, 'index tracks saved sample requests');
assert.match(index, /eventPrefix \+ '_failed'/, 'index tracks failed sample requests');
assert.match(index, /eventPrefix \+ '_cta_clicked'/, 'index tracks sample request CTA clicks');
assert.match(index, /home_buyer_path_clicked/, 'index tracks homepage buyer-path clicks');
assert.match(index, /a\[href\*="source=home-buyer-paths"\]/, 'index tracks only the homepage buyer-path links');
assert.match(index, /destination: url\.pathname\.replace/, 'index tracks buyer-path destination');
assert.match(index, /sampleRequestFallbackHref/, 'index builds email fallback for failed sample requests');
assert.match(index, /const supportAddress = \['support', 'magick\.me'\]\.join\('@'\);/, 'index email fallback uses support address without exposing it directly');
assert.match(index, /'mailto:' \+ supportAddress/, 'index email fallback builds mailto link');
assert.match(index, /NYC Construction Brief sample request/, 'index email fallback has product-specific subject');
assert.match(index, /Monitoring goal: /, 'index email fallback preserves request details');
assert.match(index, /Email this request/, 'index failed sample request copy preserves buyer intent');
assert.match(index, /encodeURIComponent\(requestSource\)/, 'index links buy page with page-specific sample request source');
assert.match(index, /This does not join the MagickMe newsletter\./, 'index needs list-separation copy');
assert.match(index, /<title>NYC DOB Permit Data CSV \| Weekly Construction Brief<\/title>/, 'index needs focused SEO title');
assert.match(index, /Review NYC DOB permit activity before opening every record\./, 'index needs buyer-relevant H1');
assert.match(index, /For construction-support vendors, specialty subcontractors, and suppliers/, 'index hero names target audience');
assert.match(index, /Buy current issue - \$9\.50/, 'index hero has one clear primary CTA');
assert.match(index, /Preview 25 rows first/, 'index hero offers preview as a plain link');
assert.match(index, /DOB NOW source links/, 'index hero has source-linked proof point');
assert.match(index, /No contact enrichment/, 'index hero sets data boundary');
assert.doesNotMatch(index, /Request sample cut/, 'index hero should not include old competing sample-request button copy');
assert.doesNotMatch(index, /Check pricing/, 'index hero should not include old pricing button copy');
assert.doesNotMatch(index, /Download CSV/, 'index hero should not include old download button copy');
assert.doesNotMatch(index, /Read sample brief/, 'index hero should not include old sample-brief button copy');
assert.doesNotMatch(index, /How delivery works/, 'index hero should not include old delivery button copy');
const heroMatch = index.match(/<section class="hero"[\s\S]*?<\/section>/);
assert.ok(heroMatch, 'index needs hero section');
assert.equal((heroMatch[0].match(/class="button/g) || []).length, 1, 'index hero must have exactly one button-styled CTA');
assert.match(index, /Should you buy this issue\?/, 'index needs buyer-fit section');
assert.match(index, /Buy it if/, 'index needs positive buyer-fit criteria');
assert.match(index, /Skip it if/, 'index needs disqualifying buyer-fit criteria');
assert.match(index, /You need owner names, applicant names, emails, phone numbers, or full street addresses\./, 'index must set contact-data boundary before checkout');
assert.match(index, /Review all 25 free preview rows/, 'index links full free sample from sample table');
assert.match(index, /row-mshu~v8sw_r8ux/, 'index sample table includes a source-linked sidewalk shed row');
assert.match(index, /row-y4pj-r7ps_78ep/, 'index sample table includes a source-linked mechanical row');
assert.match(index, /row-uzb7-7ttv-cxgt/, 'index sample table includes a source-linked plumbing row');
assert.match(index, /Explore the permit data/, 'index needs compact exploration section');
assert.match(index, /The full topic archive stays available through the segment hub and XML sitemap\./, 'index should route the archive through hub and sitemap');
assert.match(index, /Quick answers before checkout/, 'index needs buyer FAQ section');
assert.match(index, /After a completed Stripe checkout, the success page verifies the paid Checkout Session/, 'index FAQ explains automated delivery');
assert.match(index, /The ZIP includes a 142-row source-linked CSV/, 'index FAQ explains paid ZIP contents');
assert.match(index, /The package excludes owner names, applicant names, phone numbers, emails/, 'index FAQ sets contact-data boundary');
assert.match(index, /Use the public preview, CSV field guide, and free-vs-paid page before buying\./, 'index FAQ routes format inspection');
assert.match(index, /href="\/preview\.html"/, 'index links public preview page');
assert.match(index, /href="\/free-vs-paid\.html"/, 'index links free vs paid page');
assert.match(index, /href="\/inside-the-zip\.html"/, 'index links inside the ZIP page');
assert.match(index, /href="\/csv-field-guide\.html"/, 'index links CSV field guide');
assert.match(index, /href="\/methodology\.html"/, 'index links methodology and source boundary');
assert.match(index, /href="\/topics\/nyc-sidewalk-shed-permits\.html"/, 'index links high-signal sidewalk shed topic');
assert.match(index, /href="\/topics\/nyc-plumbing-permit-activity\.html"/, 'index links high-signal plumbing topic');
assert.match(index, /href="\/topics\/nyc-sprinkler-permit-activity\.html"/, 'index links high-signal sprinkler topic');
assert.match(index, /href="\/topics\/nyc-mechanical-permit-activity\.html"/, 'index links high-signal mechanical topic');
assert.match(index, /href="\/topics\/nyc-construction-fence-permits\.html"/, 'index links high-signal construction fence topic');
assert.match(index, /href="\/support\.html"/, 'index links support page');
assert.match(index, /href="\/sample-request\.html"/, 'index links sample request page');
assert.match(index, /href="\/sample-segments\.html"/, 'index links segment hub');
assert.match(index, /href="\/sitemap\.xml"/, 'index links XML sitemap');
assert.match(index, /href="\/buyer-guide\.html"/, 'index links buyer guide');
assert.match(index, /Other buyer paths/, 'index exposes buyer-intent routes after the compact exploration section');
assert.match(index, /href="\/invoice-request\.html\?source=home-buyer-paths"/, 'index links invoice request route');
assert.match(index, /href="\/partner-inquiry\.html\?source=home-buyer-paths"/, 'index links partner inquiry route');
assert.match(index, /href="\/team-license\.html\?source=home-buyer-paths"/, 'index links team license route');
assert.match(index, /href="\/custom-research\.html\?source=home-buyer-paths"/, 'index links custom research route');
assert.doesNotMatch(index, /<h2>Permit topics<\/h2>/, 'index must not expose the old link-dump heading');
assert.doesNotMatch(index, /Generated data-backed pages/, 'index must not expose a generated-page dump');
assert.doesNotMatch(index, /href="\/topics\/nyc-dob-permits-zip-10003\.html"/, 'index must not link every generated ZIP page directly');
assert.ok((index.match(/href="\/topics\//g) || []).length <= 8, 'index should keep topic links curated');

for (const boroughPage of [
  ['queens-construction-permit-activity.html', 'Queens', 'queens-permit-activity-request'],
  ['bronx-construction-permit-activity.html', 'Bronx', 'bronx-permit-activity-request'],
  ['staten-island-construction-permit-activity.html', 'Staten Island', 'staten-island-permit-activity-request'],
]) {
  const [fileName, boroughName, requestSource] = boroughPage;
  const html = read(fileName);
  assert.match(html, new RegExp(`<title>${boroughName} Construction Permit Activity Request \\| NYC Brief</title>`), `${fileName} needs borough request title`);
  assert.match(html, new RegExp(`<link rel="canonical" href="${baseUrl}/${fileName}">`), `${fileName} needs canonical URL`);
  assert.match(html, new RegExp(`The current issue does not include ${boroughName} rows\\.`), `${fileName} must state current coverage gap`);
  assert.match(html, /Current boroughs/, `${fileName} must show current borough coverage`);
  assert.match(html, /Manhattan 74 \| Brooklyn 68/, `${fileName} must show current Manhattan and Brooklyn coverage`);
  assert.match(html, new RegExp(`Do not buy it for ${boroughName} coverage unless the current issue page shows rows that fit your territory\\.`), `${fileName} must avoid unsupported purchase claims`);
  assert.match(html, new RegExp(`Request ${boroughName} sample cut`), `${fileName} must route searchers to sample request`);
  assert.match(html, new RegExp(`Request ${boroughName} sample</a>`), `${fileName} must keep sticky CTA request-focused`);
  assert.match(html, /data-current-issue-cta="false"/, `${fileName} sample request form must stay request-only`);
  assert.doesNotMatch(html, /Buy ZIP/, `${fileName} must not show a buy CTA for unsupported borough coverage`);
  assert.doesNotMatch(html, /\$9\.50 current issue ZIP/, `${fileName} must not show generic paid ZIP sticky copy`);
  assert.doesNotMatch(html, new RegExp(`checkout\\.html\\?source=${requestSource}`), `${fileName} must not route unsupported borough demand to checkout`);
  assert.match(html, /form\.dataset\.currentIssueCta === 'false'[\s\S]*status\.textContent = successCopy/, `${fileName} must use request-only success handling`);
  assert.match(html, /form\.dataset\.currentIssueCta === 'false'[\s\S]*status\.innerHTML = failedCopy \+ ' <a href="' \+ fallbackHref \+ '">' \+ emailLabel \+ '<\/a>\.';/, `${fileName} must use request-only fallback handling`);
  assert.match(html, new RegExp(`value="${boroughName} construction permit activity"`), `${fileName} must seed borough work type request`);
  assert.match(html, new RegExp(`value="${boroughName}"`), `${fileName} must seed borough territory request`);
  assert.match(html, /\/api\/sample-request/, `${fileName} must post to sample request API`);
  assert.match(html, /eventPrefix \+ '_submitted'/, `${fileName} must track sample request submit attempts`);
  assert.match(html, /This does not join the MagickMe newsletter\./, `${fileName} must keep list separation clear`);
  assert.match(html, /eventPrefix \+ '_cta_clicked'/, `${fileName} must track sample request CTA clicks`);
  assert.match(html, /"@type":"FAQPage"/, `${fileName} needs FAQ structured data`);
}

const checkout = read('checkout.html');
assert.match(checkout, /<title>Opening Stripe Checkout \| NYC Construction Activity Brief<\/title>/, 'checkout page needs title');
assert.match(checkout, /<meta name="robots" content="noindex">/, 'checkout page must be noindex');
assert.match(checkout, /checkout_intent/, 'checkout page tracks checkout intent');
assert.match(checkout, new RegExp(stripeCheckoutUrl), 'checkout page keeps launch-price Stripe fallback');
assert.match(checkout, /utm_source: 'nyc_construction_activity_brief'/, 'checkout page passes UTM source to Stripe');
assert.match(checkout, /utm_medium: 'owned_site'/, 'checkout page passes UTM medium to Stripe');
assert.match(checkout, /utm_campaign: 'current_issue_launch'/, 'checkout page passes UTM campaign to Stripe');
assert.match(checkout, /utm_content: source/, 'checkout page passes source as UTM content to Stripe');
assert.match(checkout, /client_reference_id: \['ncab', source\.replace/, 'checkout page passes non-sensitive client reference to Stripe');
assert.match(checkout, /Continue to Stripe/, 'checkout page has fallback link');
assert.match(checkout, /id="stripe-link" class="button" href="#stripe-checkout"/, 'checkout page JS link does not default to Payment Link fallback');
assert.match(checkout, /Continue with Stripe fallback/, 'checkout page no-JavaScript fallback has explicit button');
assert.match(checkout, /client_reference_id=ncab_checkout_static_fallback/, 'checkout page static fallback has client reference');
assert.match(checkout, /id="invoice-help-link" class="button secondary" href="\/invoice-request\.html\?source=checkout-bridge"/, 'checkout page keeps invoice fallback link');
assert.match(checkout, /id="sample-help-link" class="button secondary" href="\/sample-request\.html\?source=checkout-bridge-sample"/, 'checkout page links sample request fallback');
assert.match(checkout, /const invoiceHelpLink = document\.getElementById\('invoice-help-link'\);/, 'checkout page finds invoice link');
assert.match(checkout, /const sampleHelpLink = document\.getElementById\('sample-help-link'\);/, 'checkout page finds sample request link');
assert.match(checkout, /const invoiceSource = \[source, 'invoice'\]\.join\('-'\)\.slice\(0, 80\);/, 'checkout page builds source-specific invoice attribution');
assert.match(checkout, /invoiceHelpLink\.href = '\/invoice-request\.html\?source=' \+ encodeURIComponent\(invoiceSource\);/, 'checkout page preserves source on invoice help link');
assert.match(checkout, /checkout_invoice_help_clicked/, 'checkout page tracks invoice fallback clicks');
assert.match(checkout, /const sampleSource = \[source, 'sample'\]\.join\('-'\)\.slice\(0, 80\);/, 'checkout page builds source-specific sample request attribution');
assert.match(checkout, /sampleHelpLink\.href = '\/sample-request\.html\?source=' \+ encodeURIComponent\(sampleSource\);/, 'checkout page preserves source on sample request link');
assert.match(checkout, /checkout_sample_help_clicked/, 'checkout page tracks sample request fallback clicks');
assert.match(checkout, /utm_content=checkout_static_fallback/, 'checkout page static fallback has UTM content');
assert.match(checkout, /\/api\/create-checkout-session/, 'checkout page creates first-party checkout sessions');
assert.match(checkout, /method: 'POST'/, 'checkout page posts checkout session request');
assert.match(checkout, /body: JSON\.stringify\(\{ source \}\)/, 'checkout page sends source to checkout session API');
assert.match(checkout, /checkout_session_created/, 'checkout page tracks first-party checkout session creation');
assert.match(checkout, /checkout_session_fallback/, 'checkout page tracks Payment Link fallback');
assert.match(checkout, /checkout_continue_clicked/, 'checkout page tracks manual continue clicks');
assert.match(checkout, /link\.addEventListener\('click', async \(event\)/, 'checkout page creates checkout sessions only after buyer click');
assert.match(checkout, /link\.setAttribute\('aria-busy', 'true'\);/, 'checkout page marks manual continue while creating checkout');
assert.match(checkout, /link\.dataset\.fallbackUrl = fallbackUrl;/, 'checkout page keeps fallback URL out of default JS link href');
assert.match(checkout, /window\.location\.assign\(await createCheckoutUrl\(\)\);/, 'checkout page sends manual buyers to first-party session or fallback URL');
assert.doesNotMatch(checkout, /const checkoutUrlPromise = createCheckoutUrl\(\);/, 'checkout page must not create checkout sessions on page load');
assert.doesNotMatch(checkout, /checkout_auto_redirect/, 'checkout page must not auto-redirect before buyer review');
assert.doesNotMatch(checkout, /window\.setTimeout\(async \(\) => \{[\s\S]*?window\.location\.replace/, 'checkout page must not auto-redirect to Stripe');
assert.match(checkout, /Instant browser download after completed Stripe checkout\./, 'checkout page has buyer reassurance copy');
assert.match(checkout, /This is a one-time ZIP purchase\. It does not create a subscription, account, or recurring charge\./, 'checkout page reassures buyers there is no subscription or account');
assert.match(checkout, /Full 142-row CSV/, 'checkout page states paid row count before Stripe');
assert.match(checkout, /data-checkout-source-fit="buy-page-source-sidewalk-shed" hidden/, 'checkout page has sidewalk shed source-fit panel');
assert.match(checkout, /This checkout path is for the 40 selected sidewalk shed rows/, 'checkout page source-fit panel states sidewalk shed count');
assert.match(checkout, /data-checkout-source-fit="buy-page-source-plumbing" hidden/, 'checkout page has plumbing source-fit panel');
assert.match(checkout, /This checkout path is for the 29 selected plumbing rows/, 'checkout page source-fit panel states plumbing count');
assert.match(checkout, /data-checkout-source-fit="buy-page-source-exterior-access" hidden/, 'checkout page has exterior-access source-fit panel');
assert.match(checkout, /This checkout path is for the 74 selected exterior-access rows/, 'checkout page source-fit panel states exterior-access count');
assert.match(checkout, /const checkoutSourceFitPanel = document\.querySelector\('\[data-checkout-source-fit="' \+ source \+ '"\]'\);/, 'checkout page finds source-fit panel from checkout source');
assert.match(checkout, /checkout_source_fit_viewed/, 'checkout page tracks source-fit panel views');
assert.match(checkout, /After Stripe confirms payment/, 'checkout page explains paid download before Stripe');
assert.match(checkout, /Public-record screening file only/, 'checkout page states source boundary before Stripe');
assert.match(checkout, /href="\/invoice-request\.html\?source=checkout-bridge">Need invoice help\?<\/a>/, 'checkout bridge routes procurement-blocked buyers to invoice help before Stripe');
assert.match(checkout, /href="\/sample-request\.html\?source=checkout-bridge-sample">Need a different sample\?<\/a>/, 'checkout bridge routes non-ready buyers to sample request before Stripe');
assert.match(checkout, /If the current work type or ZIP mix is close but not exact, send a product-specific sample request before paying\./, 'checkout page captures sample-fit hesitation before Stripe');
assert.match(checkout, /<h2>Request a fit check before paying<\/h2>/, 'checkout page embeds a fit request form before Stripe');
assert.match(checkout, /If you reached checkout but are not sure the current ZIP matches your work type, territory, or buyer use case/, 'checkout page explains checkout fit request path');
assert.match(checkout, /data-fallback-subject="NYC Construction Brief checkout fit request"/, 'checkout fit request has a checkout-specific email subject');
assert.match(checkout, /data-fallback-source-label="Checkout fit request source"/, 'checkout fit request labels fallback source');
assert.match(checkout, /value="Current issue checkout fit"/, 'checkout fit request seeds checkout work type');
assert.match(checkout, /Send fit request/, 'checkout fit request has specific button copy');
assert.match(checkout, /\/api\/sample-request/, 'checkout page posts fit requests to the sample request API');
assert.match(checkout, /href="\/preview\.html"/, 'checkout page links preview for buyer reassurance');
assert.match(checkout, /href="\/inside-the-zip\.html"/, 'checkout page links ZIP contents for buyer reassurance');
assert.match(checkout, /href="\/support\.html"/, 'checkout page links support and refund boundary');
assert.match(checkout, /Review the purchase details, then use the button below\./, 'checkout page gives buyers time to read reassurance before Stripe');
assert.match(checkout, /<noscript>/, 'checkout page has no-JavaScript fallback copy');
assert.match(checkout, /\/_vercel\/insights\/script\.js/, 'checkout page needs Web Analytics script');

const buy = read('buy.html');
assert.match(buy, /<title>Buy Current Issue \| NYC Construction Activity Brief<\/title>/, 'buy page needs title');
assert.doesNotMatch(buy, /<meta name="robots" content="noindex">/, 'buy page should be indexable');
assert.match(buy, /<meta name="description" content="Buy the current NYC Weekly Construction Activity Brief ZIP/, 'buy page needs meta description');
assert.match(buy, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/buy\.html">/, 'buy page needs canonical');
assert.match(buy, /<meta property="og:title" content="Buy Current Issue \| NYC Construction Activity Brief">/, 'buy page needs OG title');
assert.match(buy, /<meta property="og:url" content="https:\/\/nycpermitbrief\.com\/buy\.html">/, 'buy page needs OG URL');
assert.match(buy, /"@type":"Product"/, 'buy page needs Product structured data');
assert.match(buy, /"price":"9.50"/, 'buy page needs current price structured data');
assert.match(buy, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-top"/, 'buy page top CTA uses tracked checkout bridge source');
assert.match(buy, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-after-sample"/, 'buy page after-sample CTA uses tracked checkout bridge source');
assert.match(
  buy,
  /data-buy-link="cancelled-retry" class="button" href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-cancelled-retry"/,
  'buy page cancelled retry CTA uses tracked checkout bridge source',
);
assert.match(buy, /function linkSource\(link\)/, 'buy page reads the clicked CTA source before creating checkout');
assert.match(buy, /Buy \$9\.50 ZIP on Stripe/, 'buy page CTA states concrete purchase price');
assert.match(buy, /<a class="button secondary" href="\/sample\/nyc-construction-activity-preview\.csv">Open free CSV preview<\/a>/, 'buy page gives uncertain buyers an above-fold CSV preview CTA');
assert.match(buy, /href="\/invoice-request\.html\?source=buy-page-top">Need invoice help\?<\/a>/, 'buy page gives procurement-blocked buyers an above-fold invoice CTA');
assert.match(buy, /data-source-fit="product-feed-sidewalk-shed" hidden/, 'buy page has source-fit panel for sidewalk shed product-feed visitors');
assert.match(buy, /You opened the sidewalk shed product-feed link\./, 'buy page names sidewalk shed product-feed source');
assert.match(buy, /current ZIP includes 40 selected sidewalk shed rows/, 'buy page source-fit panel states sidewalk shed count');
assert.match(buy, /data-buy-link="source-sidewalk-shed" class="button" href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-source-sidewalk-shed">Buy sidewalk shed ZIP<\/a>/, 'buy page source-fit panel has sidewalk shed purchase CTA');
assert.match(buy, /data-source-fit="product-feed-plumbing" hidden/, 'buy page has source-fit panel for plumbing product-feed visitors');
assert.match(buy, /You opened the plumbing product-feed link\./, 'buy page names plumbing product-feed source');
assert.match(buy, /current ZIP includes 29 selected plumbing rows/, 'buy page source-fit panel states plumbing count');
assert.match(buy, /data-buy-link="source-plumbing" class="button" href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-source-plumbing">Buy plumbing ZIP<\/a>/, 'buy page source-fit panel has plumbing purchase CTA');
assert.match(buy, /data-source-fit="product-feed-exterior-access" hidden/, 'buy page has source-fit panel for exterior-access product-feed visitors');
assert.match(buy, /You opened the exterior-access product-feed link\./, 'buy page names exterior-access product-feed source');
assert.match(buy, /current ZIP includes 74 selected exterior-access rows/, 'buy page source-fit panel states exterior-access count');
assert.match(buy, /data-buy-link="source-exterior-access" class="button" href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-source-exterior-access">Buy exterior-access ZIP<\/a>/, 'buy page source-fit panel has exterior-access purchase CTA');
assert.match(buy, /const sourceFitPanel = document\.querySelector\('\[data-source-fit="' \+ pageSource \+ '"\]'\);/, 'buy page finds source-fit panel from entry source');
assert.match(buy, /buy_source_fit_viewed/, 'buy page tracks source-fit panel views');
assert.match(buy, /data-current-best-fit/, 'buy page names the best current buyer fit before checkout');
assert.match(buy, /40 sidewalk shed rows, 29 plumbing rows, 21 sprinkler rows, 13 supported scaffold rows, 9 construction fence rows, and 12 structural rows/, 'buy page states current strongest row counts before checkout');
assert.match(buy, /href="\/nyc-sidewalk-shed-permit-leads\.html">Check sidewalk shed leads<\/a>/, 'buy page links sidewalk shed leads page before checkout');
assert.match(buy, /href="\/nyc-plumbing-permit-leads\.html">Check plumbing leads<\/a>/, 'buy page links plumbing leads page before checkout');
assert.match(buy, /href="\/nyc-sprinkler-permit-leads\.html">Check sprinkler leads<\/a>/, 'buy page links sprinkler leads page before checkout');
assert.match(buy, /href="\/nyc-mechanical-systems-permit-leads\.html">Check mechanical leads<\/a>/, 'buy page links mechanical leads page before checkout');
assert.match(buy, /href="\/nyc-structural-permit-leads\.html">Check structural leads<\/a>/, 'buy page links structural leads page before checkout');
assert.match(buy, /href="\/nyc-construction-fence-permit-leads\.html">Check fence leads<\/a>/, 'buy page links construction fence leads page before checkout');
assert.match(buy, /href="\/topics\/nyc-exterior-work-permit-research\.html">Check exterior-access fit<\/a>/, 'buy page links exterior fit page before checkout');
assert.match(buy, /data-buy-link="sidewalk-shed-fit" class="button" href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-sidewalk-shed-fit">Buy for sidewalk shed review<\/a>/, 'buy page has sidewalk shed fit purchase CTA');
assert.match(buy, /data-buy-link="plumbing-fit" class="button" href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-plumbing-fit">Buy for plumbing review<\/a>/, 'buy page has plumbing fit purchase CTA');
assert.match(buy, /data-buy-link="exterior-access-fit" class="button" href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-exterior-access-fit">Buy for exterior-access review<\/a>/, 'buy page has exterior access purchase CTA');
assert.match(buy, /data-first-use-plan/, 'buy page gives buyers an immediate use plan before checkout');
assert.match(buy, /Filter the priority-slices CSV to sidewalk shed, plumbing, sprinkler, supported scaffold, construction fence, or structural rows\./, 'buy page explains the first action after download');
assert.match(buy, /It is not a contact list, outreach automation, or permit filing service\./, 'buy page keeps the first-use plan inside the public-record boundary');
assert.match(buy, /No account setup, subscription, or recurring charge\./, 'buy page reassures buyers before checkout bridge');
assert.match(buy, /<img class="issue-snapshot buy-page-snapshot" src="\/assets\/current-issue-snapshot\.png" alt="Current issue snapshot chart showing row counts, top work types, top ZIPs, and launch pricing">/, 'buy page shows current issue snapshot before checkout CTA');
assert.match(buy, /<p class="fine">\$9\.50 one-time launch price\. Instant browser download after completed Stripe checkout\. No promo code is required\.<\/p>\s*<p class="fine">No account setup, subscription, or recurring charge\.<\/p>\s*<img class="issue-snapshot buy-page-snapshot"[^>]+>\s*<p>\s*<a data-buy-link="top" class="button"/, 'buy page puts snapshot and purchase CTA above sample rows');
assert.match(buy, /data-buy-confidence/, 'buy page has pre-checkout confidence block');
assert.match(buy, /<h2>Before you pay<\/h2>/, 'buy page names pre-checkout checks');
assert.match(buy, /Open the free preview if you need to confirm the row shape first\./, 'buy page points uncertain buyers to the preview');
assert.match(buy, /Use the support page for the refund boundary and download troubleshooting steps\./, 'buy page surfaces support and refund boundary before checkout');
assert.match(buy, /Keep the Stripe receipt and success-page URL if the browser download is interrupted\./, 'buy page gives interrupted-download evidence steps before checkout');
assert.match(buy, /Buy only if the full 142-row file saves enough manual sorting time\./, 'buy page gives a clear paid-value threshold');
assert.match(buy, /data-buyer-fit-check/, 'buy page has a fast buyer-fit check before sample rows');
assert.match(buy, /work type, borough, ZIP, issued date, status, cost bucket, short job description, and source URL/, 'buy page states the fields buyers can evaluate before paying');
assert.match(buy, /It does not add private contacts or lead scoring\./, 'buy page keeps paid ZIP boundary near buyer-fit copy');
assert.match(buy, /data-buy-link="after-sample"/, 'buy page keeps a post-sample purchase CTA');
assert.match(buy, /data-checkout-cancelled hidden/, 'buy page has a hidden checkout-cancel recovery panel');
assert.match(buy, /Checkout was not completed/, 'buy page names the cancelled-checkout recovery state');
assert.match(buy, /If the current work type or ZIP mix was the blocker, request a future sample cut\./, 'buy page cancelled panel captures sample-fit blockers');
assert.match(buy, /data-buy-link="cancelled-retry"/, 'buy page has a retry CTA for cancelled Stripe sessions');
assert.match(buy, /data-buy-link="cancelled-sidewalk-shed" class="button" href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-cancelled-sidewalk-shed">Buy sidewalk shed ZIP<\/a>/, 'buy page cancelled panel has sidewalk shed retry CTA');
assert.match(buy, /data-buy-link="cancelled-plumbing" class="button" href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buy-page-cancelled-plumbing">Buy plumbing ZIP<\/a>/, 'buy page cancelled panel has plumbing retry CTA');
assert.match(buy, /Request invoice help/, 'buy page routes procurement-blocked buyers to invoice help after cancelled checkout');
assert.match(buy, /href="\/sample-request\.html\?source=buy-page-cancelled-sample">Request a different sample<\/a>/, 'buy page cancelled panel routes sample-fit blockers to sample request');
assert.equal((buy.match(/data-buy-link="/g) || []).length, 11, 'buy page has top, source-fit, segment-fit, post-sample, and cancelled-checkout purchase CTAs');
assert.match(buy, /Full 142-row CSV/, 'buy page states paid row count');
assert.match(buy, /breaks even at about 8 minutes/, 'buy page states launch price break-even');
assert.match(buy, /No private contacts/, 'buy page states buyer boundary');
assert.match(buy, /<h2>Sample rows before checkout<\/h2>/, 'buy page shows sample rows before Stripe');
assert.match(buy, /These are examples from the free public preview/, 'buy page explains sample row source');
assert.match(buy, /data-buy-sample-row/, 'buy page marks inline sample rows');
assert.match(buy, /DOB NOW row/, 'buy page links sample rows to public source rows');
assert.doesNotMatch(buy, rawCostBucketPattern, 'buy page contains raw cost bucket labels');
const buySampleWorkTypes = [...buy.matchAll(/data-buy-sample-work-type="([^"]+)"/g)].map((match) => match[1]);
assert.equal(buySampleWorkTypes.length, 3, 'buy page shows three inline sample rows');
assert.ok(new Set(buySampleWorkTypes).size >= 2, 'buy page inline sample rows should show varied work types');
assert.match(buy, /Stripe creates the paid session, then the success page unlocks the ZIP in your browser\./, 'buy page explains post-checkout delivery path');
assert.match(buy, /<h2>Inspect before checkout<\/h2>/, 'buy page has inspect-before-checkout section');
assert.match(buy, /href="\/data-package\.json"/, 'buy page links data package manifest');
assert.match(buy, /Data package JSON/, 'buy page labels data package manifest');
assert.match(buy, /href="\/delivery\.html"/, 'buy page links delivery steps');
assert.match(buy, /href="\/pricing\.html"/, 'buy page links pricing');
assert.match(buy, /buy_page_viewed/, 'buy page tracks page view');
assert.match(buy, /buy_page_continue_clicked/, 'buy page tracks manual continue click');
assert.match(buy, /const rawSource = params\.get\('source'\) \|\| 'buy-page';/, 'buy page reads source query');
assert.match(buy, /utm_source: 'nyc_construction_activity_brief'/, 'buy page passes UTM source to Stripe');
assert.match(buy, /utm_medium: 'owned_site'/, 'buy page passes UTM medium to Stripe');
assert.match(buy, /utm_campaign: 'current_issue_launch'/, 'buy page passes UTM campaign to Stripe');
assert.match(buy, /utm_content: source/, 'buy page passes source as UTM content to Stripe');
assert.match(buy, /client_reference_id: \['ncab', source\.replace/, 'buy page passes non-sensitive client reference to Stripe');
assert.match(buy, /\/api\/create-checkout-session/, 'buy page creates first-party checkout sessions');
assert.match(buy, /method: 'POST'/, 'buy page posts checkout session request');
assert.match(buy, /body: JSON\.stringify\(\{ source \}\)/, 'buy page sends source to checkout session API');
assert.match(buy, /buy_page_checkout_session_created/, 'buy page tracks first-party checkout session creation');
assert.match(buy, /buy_page_checkout_session_fallback/, 'buy page tracks Payment Link fallback');
assert.match(buy, /buy_page_invoice_help_clicked/, 'buy page tracks invoice-help clicks before checkout');
assert.match(buy, /buy_page_sample_help_clicked/, 'buy page tracks sample-fit help clicks before checkout');
assert.match(buy, /const requestPathLinks = \[\.\.\.document\.querySelectorAll\('a\[href\*="source=buy-page-request-paths"\]'\)\];/, 'buy page selects alternate request-path links');
assert.match(buy, /buy_page_request_path_clicked/, 'buy page tracks alternate request-path clicks');
assert.match(buy, /destination: url\.pathname\.replace/, 'buy page tracks request-path destination without PII');
assert.match(buy, /document\.querySelectorAll\('\[data-buy-link\]'\)/, 'buy page wires all purchase CTAs');
assert.doesNotMatch(buy, /links\.forEach\(\(link\) => \{\s*link\.href = fallbackUrl;\s*\}\);/, 'buy page must not rewrite visible CTAs to Payment Link fallback before click');
assert.match(buy, /link\.addEventListener\('click', async \(event\)/, 'buy page creates checkout sessions only after buyer click');
assert.match(buy, /position: link\.dataset\.buyLink \|\| 'unknown'/, 'buy page tracks CTA position without PII');
assert.match(buy, /window\.location\.assign\(await createCheckoutUrl\(source\)\);/, 'buy page sends clickers to first-party session or fallback URL with CTA source');
assert.doesNotMatch(buy, /buy_page_auto_redirect/, 'buy page must not auto-redirect indexed visitors');
assert.doesNotMatch(buy, /const checkoutUrlPromise = createCheckoutUrl\(\);/, 'buy page must not create checkout sessions on page load');
assert.doesNotMatch(buy, /window\.location\.replace\(stripeUrl\);/, 'buy page must not redirect directly to Payment Link JS URL');
assert.match(buy, /checkout\.html\?source=buy-page/, 'buy page keeps checkout bridge fallback for no-JavaScript users');
assert.match(buy, /Want to inspect the public row shape first/, 'buy page reassures buyers with direct sample files');
assert.match(buy, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'buy page links public CSV sample');
assert.match(buy, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'buy page links public JSON sample');
assert.match(buy, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'buy page links public JSONL sample');
assert.match(buy, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'buy page links sample brief');
assert.match(buy, /href="\/preview\.html"/, 'buy page links preview');
assert.match(buy, /href="\/inside-the-zip\.html"/, 'buy page links ZIP contents');
assert.match(buy, /href="\/free-vs-paid\.html"/, 'buy page links free vs paid page');
assert.match(buy, /href="\/support\.html"/, 'buy page links support');
assert.match(buy, /data-procurement-intent/, 'buy page captures procurement-blocked buyer intent');
assert.match(buy, /Card blocked by procurement\?/, 'buy page names procurement checkout blocker');
assert.match(buy, /href="\/invoice-request\.html"/, 'buy page routes invoice requests to dedicated request page');
assert.match(buy, /paid ZIP delivery still requires a completed Stripe Checkout Session/, 'buy page keeps fulfillment gate clear on procurement copy');
assert.match(buy, /Request invoice help/, 'buy page has invoice-help link');
assert.match(buy, /data-buy-request-paths/, 'buy page exposes alternate request paths near checkout');
assert.match(buy, /Need a different buying path\?/, 'buy page names alternate buying path section');
assert.match(buy, /href="\/team-license\.html\?source=buy-page-request-paths"/, 'buy page links team license request path');
assert.match(buy, /href="\/custom-research\.html\?source=buy-page-request-paths"/, 'buy page links custom research request path');
assert.match(buy, /href="\/partner-inquiry\.html\?source=buy-page-request-paths"/, 'buy page links partner inquiry request path');
assert.match(buy, /These request paths do not approve payment terms, recurring delivery, custom work, outreach, sponsorship, or fulfillment changes\./, 'buy page keeps alternate request paths approval-gated');
assertSampleRequestForm(buy, 'buy page');
assert.match(buy, /value="Selected DOB work types"/, 'buy page sample request seeds work type field');
assert.match(buy, /value="NYC"/, 'buy page sample request seeds territory field');

const invoiceRequest = read('invoice-request.html');
assert.match(invoiceRequest, /<title>Invoice Request \| NYC Construction Activity Brief<\/title>/, 'invoice request page needs title');
assert.match(invoiceRequest, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/invoice-request\.html">/, 'invoice request page needs canonical');
assert.match(invoiceRequest, /Request invoice help for the current issue\./, 'invoice request page names invoice help');
assert.match(invoiceRequest, /purchase order, or procurement approval/, 'invoice request page names procurement blocker');
assert.match(invoiceRequest, /Paid ZIP delivery still requires a completed Stripe Checkout Session/, 'invoice request page keeps fulfillment gate clear');
assertSampleRequestForm(invoiceRequest, 'invoice request page', {
  subject: 'NYC Construction Brief invoice request',
  failedLinkCopy: 'Email this invoice request',
  statusCopy: 'Paid ZIP delivery still requires completed Stripe checkout.',
  eventPrefix: 'invoice_request',
});
assert.match(invoiceRequest, /Send invoice or procurement request/, 'invoice request page labels invoice form');
assert.match(invoiceRequest, /data-event-prefix="invoice_request"/, 'invoice request page tags invoice analytics events');
assert.match(invoiceRequest, /Invoice request saved\. I will use this to follow up on procurement-blocked buyer interest\./, 'invoice request page has invoice-specific success copy');
assert.match(invoiceRequest, /Invoice request source/, 'invoice request fallback labels invoice source');
assert.match(invoiceRequest, /<option value="data-buyer" selected>Data buyer<\/option>/, 'invoice request page preselects data buyer type');
assert.match(invoiceRequest, /Invoice or procurement approval needed before buying the current issue ZIP\./, 'invoice request page seeds invoice procurement monitoring goal');
assert.match(invoiceRequest, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'invoice request page links free CSV preview');

const notFound = read('404.html');
assert.match(notFound, /<title>Page Not Found \| NYC Construction Activity Brief<\/title>/, '404 page needs title');
assert.match(notFound, /<meta name="robots" content="noindex">/, '404 page must be noindex');
assert.match(notFound, /href="\/buy\.html"/, '404 page links buy page');
assert.match(notFound, /href="\/current-issue\.html"/, '404 page links current issue');
assert.match(notFound, /href="\/preview\.html"/, '404 page links preview');
assert.match(notFound, /href="\/support\.html"/, '404 page links support');
assert.match(notFound, /not_found_recovery_viewed/, '404 page tracks recovery view');
assert.match(notFound, /window\.location\.pathname\.slice\(0, 120\)/, '404 page bounds path telemetry');

const success = read('success.html');
assert.match(success, /<meta name="robots" content="noindex">/, 'success page must be noindex');
assert.match(success, /The ZIP download starts automatically/, 'success page explains automatic download');
assert.match(success, /id="download-link"/, 'success page keeps manual download button');
assert.match(success, /id="download-status"/, 'success page shows automatic download status');
assert.match(success, /id="download-frame"/, 'success page uses hidden frame for auto download');
assert.match(success, /\/api\/download\?session_id=\$\{encodeURIComponent\(sessionId\)\}/, 'success page builds verified download URL');
assert.match(success, /download_auto_started/, 'success page tracks automatic download starts');
assert.match(success, /download_manual_clicked/, 'success page tracks manual download clicks');
assert.match(success, /download_session_missing/, 'success page tracks missing session');
assert.match(success, /has_session: true/, 'success page avoids sending full session id to analytics');
assert.doesNotMatch(success, /track\([^)]*sessionId/, 'success page must not send Stripe session id to analytics');

const preview = read('preview.html');
assert.match(preview, /<title>Public Preview \| NYC Construction Activity Brief<\/title>/, 'preview page needs title');
assert.match(preview, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/preview\.html">/, 'preview page needs canonical');
assert.match(preview, /<meta property="og:title" content="Public Preview \| NYC Construction Activity Brief">/, 'preview page needs OG title');
assert.match(preview, /src="\/assets\/current-issue-snapshot\.png"/, 'preview page needs current issue snapshot image');
assert.match(preview, /"@type":"Product"/, 'preview page needs Product structured data');
assert.match(preview, /"@type":"Dataset"/, 'preview page needs Dataset structured data');
assert.match(preview, /\/_vercel\/insights\/script\.js/, 'preview page needs Web Analytics script');
assert.match(preview, /25-row browser preview/, 'preview page needs public preview count');
assert.match(preview, /full 142-row ZIP/, 'preview page needs paid row count');
assert.match(preview, /<h2>Sample rows<\/h2>/, 'preview page needs sample rows section');
assert.match(preview, /data-preview-filter/, 'preview page needs filter UI');
assert.match(preview, /data-preview-work-type/, 'preview page needs work type filter');
assert.match(preview, /data-preview-zip/, 'preview page needs ZIP filter');
assert.match(preview, /data-preview-query/, 'preview page needs keyword filter');
assert.match(preview, /data-preview-count/, 'preview page needs visible row count');
assert.equal((preview.match(/<tr data-preview-row/g) || []).length, 25, 'preview page should mark 25 filterable rows');
assert.match(preview, /data-work-type="Sidewalk Shed"/, 'preview page marks work type row data');
assert.match(preview, /data-zip="10003"/, 'preview page marks ZIP row data');
assert.match(preview, /preview_filter_changed/, 'preview page tracks filter changes without row data');
assert.match(preview, /visible_rows/, 'preview filter tracking sends aggregate row count');
assert.equal((preview.match(/DOB NOW row/g) || []).length, 25, 'preview page should list 25 source-linked rows');
assert.match(preview, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'preview page links sample CSV');
assert.match(preview, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'preview page links sample JSON');
assert.match(preview, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'preview page links sample JSONL');
assert.match(preview, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'preview page links sample brief');
assert.match(preview, /href="\/sample-segments\.html"/, 'preview page links segment hub');
assert.match(preview, /href="\/free-vs-paid\.html"/, 'preview page links free vs paid page');
assert.match(preview, /href="\/permit-research-workflow\.html"/, 'preview page links research workflow page');
assert.match(preview, /href="\/inside-the-zip\.html"/, 'preview page links inside the ZIP page');
assert.match(preview, /href="\/pricing\.html"/, 'preview page links pricing page');
assert.match(preview, /href="\/support\.html"/, 'preview page links support page');
assert.match(preview, /"url":"https:\/\/nycpermitbrief\.com\/checkout\.html\?source=preview"/, 'preview page Product schema links checkout bridge');
assert.match(preview, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=preview"/, 'preview page post-review CTA links checkout bridge');
assert.match(preview, /data-sample-request-form/, 'preview page needs sample request form');
assert.match(preview, /\/api\/sample-request/, 'preview page posts sample requests to API');
assert.match(preview, /data\.source_path = window\.location\.pathname;/, 'preview page sends source path with sample request');
assert.match(preview, /data\.entry_source = \/\^\[a-z0-9\._-\]\{1,80\}\$\/i\.test\(rawEntrySource\) \? rawEntrySource : '';/, 'preview page sends safe entry source with sample request');
assert.match(preview, /const requestSource = \['sample-request', window\.location\.pathname\.replace/, 'preview page builds page-specific sample request checkout source');
assert.match(preview, /eventPrefix \+ '_submitted'/, 'preview page tracks sample request submit attempts');
assert.match(preview, /eventPrefix \+ '_saved'/, 'preview page tracks saved sample requests');
assert.match(preview, /eventPrefix \+ '_failed'/, 'preview page tracks failed sample requests');
assert.match(preview, /eventPrefix \+ '_cta_clicked'/, 'preview page tracks sample request CTA clicks');
assert.match(preview, /encodeURIComponent\(requestSource\)/, 'preview page links buy page with page-specific sample request source');
assert.match(preview, /No guaranteed leads\./, 'preview page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(preview, pattern, `preview.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(preview, pattern, `preview.html contains private data pattern ${pattern}`);
}

const pricing = read('pricing.html');
assert.match(pricing, /<title>Pricing and ROI \| NYC Construction Activity Brief<\/title>/, 'pricing page needs title');
assert.match(pricing, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/pricing\.html">/, 'pricing page needs canonical');
assert.match(pricing, /<meta property="og:title" content="Pricing and ROI \| NYC Construction Activity Brief">/, 'pricing page needs OG title');
assert.match(pricing, /src="\/assets\/current-issue-snapshot\.png"/, 'pricing page needs current issue snapshot image');
assert.match(pricing, /"@type":"Product"/, 'pricing page needs Product structured data');
assert.match(pricing, /"@type":"FAQPage"/, 'pricing page needs FAQ structured data');
assert.match(pricing, /\/_vercel\/insights\/script\.js/, 'pricing page needs Web Analytics script');
assert.match(pricing, /<h2>Break-even guide<\/h2>/, 'pricing page needs break-even section');
assert.match(pricing, /\$49/, 'pricing page needs standard price');
assert.match(pricing, /\$9\.50/, 'pricing page needs discounted price');
assert.match(pricing, /No promo code is required/, 'pricing page needs direct launch price copy');
assert.match(pricing, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=pricing-top"/, 'pricing page has above-fold checkout CTA');
assert.match(pricing, /Stripe checkout opens after your click\. Use the CSV preview first if you need to confirm the row shape\./, 'pricing page explains top CTA checkout path');
assert.match(pricing, /About 8 minutes saved/, 'pricing page needs current launch price break-even examples');
assert.match(pricing, /href="\/preview\.html"/, 'pricing page links public preview');
assert.match(pricing, /href="\/free-vs-paid\.html"/, 'pricing page links free vs paid page');
assert.match(pricing, /href="\/permit-research-workflow\.html"/, 'pricing page links research workflow page');
assert.match(pricing, /href="\/inside-the-zip\.html"/, 'pricing page links inside the ZIP page');
assert.match(pricing, /href="\/csv-field-guide\.html"/, 'pricing page links CSV field guide');
assert.match(pricing, /href="\/time-saved-calculator\.html"/, 'pricing page links time saved calculator');
assert.match(pricing, /href="\/buyer-guide\.html"/, 'pricing page links buyer guide');
assert.match(pricing, /href="\/delivery\.html"/, 'pricing page links delivery page');
assert.match(pricing, /href="\/support\.html"/, 'pricing page links support page');
assert.match(pricing, new RegExp(`href="${purchaseUrl}"`), 'pricing page links tracked buy page');
assertSampleRequestForm(pricing, 'pricing page');
assert.match(pricing, /No guaranteed leads\./, 'pricing page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(pricing, pattern, `pricing.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(pricing, pattern, `pricing.html contains private data pattern ${pattern}`);
}

const currentIssuePage = read('current-issue.html');
assert.match(currentIssuePage, /<title>Current Issue \| NYC Construction Activity Brief<\/title>/, 'current issue page needs title');
assert.match(currentIssuePage, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/current-issue\.html">/, 'current issue page needs canonical');
assert.match(currentIssuePage, /<meta property="og:title" content="Current Issue \| NYC Construction Activity Brief">/, 'current issue page needs OG title');
assert.match(currentIssuePage, /src="\/assets\/current-issue-snapshot\.png"/, 'current issue page needs current issue snapshot image');
assert.match(currentIssuePage, /"@type":"Product"/, 'current issue page needs Product structured data');
assert.match(currentIssuePage, /"@type":"Dataset"/, 'current issue page needs Dataset structured data');
assert.match(currentIssuePage, /"@type":"FAQPage"/, 'current issue page needs FAQ structured data');
assert.match(currentIssuePage, /"price":"9.50"/, 'current issue page needs current price structured data');
assert.match(currentIssuePage, /\/_vercel\/insights\/script\.js/, 'current issue page needs Web Analytics script');
assert.match(currentIssuePage, /Current NYC construction activity brief/, 'current issue page needs current issue headline');
assert.match(currentIssuePage, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'current issue page needs row counts');
assert.match(currentIssuePage, /Top work types: Sidewalk Shed 40/, 'current issue page needs work type mix');
assert.match(currentIssuePage, /Top ZIPs: 10003 37/, 'current issue page needs ZIP mix');
assert.match(currentIssuePage, /Status mix:/, 'current issue page needs status mix');
assert.match(currentIssuePage, /Cost buckets:/, 'current issue page needs cost bucket mix');
assert.match(currentIssuePage, /Buyer workbook for a fast review pass/, 'current issue page needs buyer workbook copy');
assert.match(currentIssuePage, /href="\/preview\.html"/, 'current issue page links preview');
assert.match(currentIssuePage, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'current issue page links sample CSV');
assert.match(currentIssuePage, /href="\/sample-segments\.html"/, 'current issue page links segment hub');
assert.match(currentIssuePage, /href="\/who-should-buy\.html"/, 'current issue page links who should buy page');
assert.match(currentIssuePage, /href="\/time-saved-calculator\.html"/, 'current issue page links time saved calculator');
assert.match(currentIssuePage, /href="\/free-vs-paid\.html"/, 'current issue page links free vs paid page');
assert.match(currentIssuePage, /href="\/permit-research-workflow\.html"/, 'current issue page links research workflow page');
assert.match(currentIssuePage, /href="\/contractor-supplier-permit-research\.html"/, 'current issue page links contractor and supplier guide');
assert.match(currentIssuePage, /href="\/inside-the-zip\.html"/, 'current issue page links inside ZIP');
assert.match(currentIssuePage, /href="\/csv-field-guide\.html"/, 'current issue page links CSV field guide');
assert.match(currentIssuePage, /href="\/pricing\.html"/, 'current issue page links pricing');
assert.match(currentIssuePage, /href="\/delivery\.html"/, 'current issue page links delivery');
assert.match(currentIssuePage, /href="\/support\.html"/, 'current issue page links support');
assert.match(currentIssuePage, /"url":"https:\/\/nycpermitbrief\.com\/checkout\.html\?source=current-issue-page"/, 'current issue page Product schema links checkout bridge');
assert.match(currentIssuePage, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=current-issue-page"/, 'current issue page post-review CTA links checkout bridge');
assertSampleRequestForm(currentIssuePage, 'current issue page');
assert.match(currentIssuePage, /No guaranteed leads\./, 'current issue page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(currentIssuePage, pattern, `current-issue.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(currentIssuePage, pattern, `current-issue.html contains private data pattern ${pattern}`);
}

const timeSavedCalculator = read('time-saved-calculator.html');
assert.match(timeSavedCalculator, /<title>Time Saved Calculator \| NYC Construction Activity ZIP<\/title>/, 'time saved calculator needs title');
assert.match(timeSavedCalculator, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/time-saved-calculator\.html">/, 'time saved calculator needs canonical');
assert.match(timeSavedCalculator, /<meta property="og:title" content="Time Saved Calculator \| NYC Construction Activity ZIP">/, 'time saved calculator needs OG title');
assert.match(timeSavedCalculator, /"@type":"Product"/, 'time saved calculator needs Product structured data');
assert.match(timeSavedCalculator, /"@type":"Offer"/, 'time saved calculator needs Offer structured data');
assert.match(timeSavedCalculator, /"price":"9.50"/, 'time saved calculator needs current price structured data');
assert.match(timeSavedCalculator, /"@type":"FAQPage"/, 'time saved calculator needs FAQ structured data');
assert.match(timeSavedCalculator, /\/_vercel\/insights\/script\.js/, 'time saved calculator needs Web Analytics script');
assert.match(timeSavedCalculator, /Time saved calculator for the current issue ZIP/, 'time saved calculator needs headline');
assert.match(timeSavedCalculator, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=time-saved-calculator-top"/, 'time saved calculator has above-fold checkout CTA');
assert.match(timeSavedCalculator, /Stripe checkout opens after your click\. Use the CSV preview first if you need to confirm the row shape\./, 'time saved calculator explains top CTA checkout path');
assert.match(timeSavedCalculator, /Calculate break-even time/, 'time saved calculator needs calculator section');
assert.match(timeSavedCalculator, /id="hourly-rate"/, 'time saved calculator needs hourly input');
assert.match(timeSavedCalculator, /id="minutes-saved"/, 'time saved calculator needs minutes input');
assert.match(timeSavedCalculator, /Break-even is about/, 'time saved calculator needs break-even output copy');
assert.match(timeSavedCalculator, /This is a time-saved estimate only/, 'time saved calculator keeps estimate boundary');
assert.match(timeSavedCalculator, /About 8 minutes/, 'time saved calculator needs current launch price common break-even examples');
assert.match(timeSavedCalculator, /href="\/current-issue\.html"/, 'time saved calculator links current issue page');
assert.match(timeSavedCalculator, /href="\/preview\.html"/, 'time saved calculator links preview');
assert.match(timeSavedCalculator, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'time saved calculator links sample CSV');
assert.match(timeSavedCalculator, /href="\/who-should-buy\.html"/, 'time saved calculator links who should buy page');
assert.match(timeSavedCalculator, /href="\/free-vs-paid\.html"/, 'time saved calculator links free vs paid page');
assert.match(timeSavedCalculator, /href="\/permit-research-workflow\.html"/, 'time saved calculator links research workflow page');
assert.match(timeSavedCalculator, /href="\/contractor-supplier-permit-research\.html"/, 'time saved calculator links contractor and supplier guide');
assert.match(timeSavedCalculator, /href="\/inside-the-zip\.html"/, 'time saved calculator links inside ZIP');
assert.match(timeSavedCalculator, /href="\/csv-field-guide\.html"/, 'time saved calculator links CSV field guide');
assert.match(timeSavedCalculator, /href="\/pricing\.html"/, 'time saved calculator links pricing');
assert.match(timeSavedCalculator, /href="\/support\.html"/, 'time saved calculator links support');
assert.match(timeSavedCalculator, new RegExp(`href="${purchaseUrl}"`), 'time saved calculator links tracked buy page');
assertSampleRequestForm(timeSavedCalculator, 'time saved calculator');
assert.match(timeSavedCalculator, /No guaranteed leads\./, 'time saved calculator keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(timeSavedCalculator, pattern, `time-saved-calculator.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(timeSavedCalculator, pattern, `time-saved-calculator.html contains private data pattern ${pattern}`);
}

const whoShouldBuy = read('who-should-buy.html');
assert.match(whoShouldBuy, /<title>Who Should Buy \| NYC Construction Activity ZIP<\/title>/, 'who should buy page needs title');
assert.match(whoShouldBuy, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/who-should-buy\.html">/, 'who should buy page needs canonical');
assert.match(whoShouldBuy, /<meta property="og:title" content="Who Should Buy \| NYC Construction Activity ZIP">/, 'who should buy page needs OG title');
assert.match(whoShouldBuy, /src="\/assets\/current-issue-snapshot\.png"/, 'who should buy page needs current issue snapshot image');
assert.match(whoShouldBuy, /"@type":"Product"/, 'who should buy page needs Product structured data');
assert.match(whoShouldBuy, /"@type":"Offer"/, 'who should buy page needs Offer structured data');
assert.match(whoShouldBuy, /"price":"9.50"/, 'who should buy page needs current price structured data');
assert.match(whoShouldBuy, /"@type":"FAQPage"/, 'who should buy page needs FAQ structured data');
assert.match(whoShouldBuy, /\/_vercel\/insights\/script\.js/, 'who should buy page needs Web Analytics script');
assert.match(whoShouldBuy, /Who should buy the current NYC construction activity ZIP/, 'who should buy page needs fit headline');
assert.match(whoShouldBuy, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=who-should-buy-top"/, 'who should buy page has above-fold checkout CTA');
assert.match(whoShouldBuy, /Stripe checkout opens after your click\. Use the CSV preview first if you need to confirm the row shape\./, 'who should buy page explains top CTA checkout path');
assert.match(whoShouldBuy, /Buy it if these are true/, 'who should buy page needs buy criteria');
assert.match(whoShouldBuy, /Do not buy it for these jobs/, 'who should buy page needs exclusion criteria');
assert.match(whoShouldBuy, /Three-minute pre-purchase check/, 'who should buy page needs pre-purchase check');
assert.match(whoShouldBuy, /Free preview rows: 25/, 'who should buy page needs free preview count');
assert.match(whoShouldBuy, /142 paid rows/, 'who should buy page needs paid row count');
assert.match(whoShouldBuy, /No subscription and no promo code required/, 'who should buy page needs direct launch price copy');
assert.match(whoShouldBuy, /href="\/preview\.html"/, 'who should buy page links public preview');
assert.match(whoShouldBuy, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'who should buy page links sample CSV');
assert.match(whoShouldBuy, /href="\/sample-segments\.html"/, 'who should buy page links segment hub');
assert.match(whoShouldBuy, /href="\/free-vs-paid\.html"/, 'who should buy page links free vs paid page');
assert.match(whoShouldBuy, /href="\/permit-research-workflow\.html"/, 'who should buy page links research workflow page');
assert.match(whoShouldBuy, /href="\/contractor-supplier-permit-research\.html"/, 'who should buy page links contractor and supplier guide');
assert.match(whoShouldBuy, /href="\/inside-the-zip\.html"/, 'who should buy page links inside the ZIP page');
assert.match(whoShouldBuy, /href="\/csv-field-guide\.html"/, 'who should buy page links CSV field guide');
assert.match(whoShouldBuy, /href="\/pricing\.html"/, 'who should buy page links pricing page');
assert.match(whoShouldBuy, /href="\/buyer-guide\.html"/, 'who should buy page links buyer guide');
assert.match(whoShouldBuy, /href="\/delivery\.html"/, 'who should buy page links delivery page');
assert.match(whoShouldBuy, /href="\/support\.html"/, 'who should buy page links support page');
assert.match(whoShouldBuy, new RegExp(`href="${purchaseUrl}"`), 'who should buy page links tracked buy page');
assertSampleRequestForm(whoShouldBuy, 'who should buy page');
assert.match(whoShouldBuy, /No guaranteed leads\./, 'who should buy page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(whoShouldBuy, pattern, `who-should-buy.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(whoShouldBuy, pattern, `who-should-buy.html contains private data pattern ${pattern}`);
}

const insideZip = read('inside-the-zip.html');
assert.match(insideZip, /<title>Inside the ZIP \| NYC Construction Activity Brief<\/title>/, 'inside ZIP page needs title');
assert.match(insideZip, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/inside-the-zip\.html">/, 'inside ZIP page needs canonical');
assert.match(insideZip, /<meta property="og:title" content="Inside the ZIP \| NYC Construction Activity Brief">/, 'inside ZIP page needs OG title');
assert.match(insideZip, /src="\/assets\/current-issue-snapshot\.png"/, 'inside ZIP page needs current issue snapshot image');
assert.match(insideZip, /"@type":"Product"/, 'inside ZIP page needs Product structured data');
assert.match(insideZip, /"@type":"Dataset"/, 'inside ZIP page needs Dataset structured data');
assert.match(insideZip, /"@type":"FAQPage"/, 'inside ZIP page needs FAQ structured data');
assert.match(insideZip, /\/_vercel\/insights\/script\.js/, 'inside ZIP page needs Web Analytics script');
assert.match(insideZip, /What is inside the current paid ZIP/, 'inside ZIP page needs package headline');
assert.match(insideZip, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=inside-the-zip-top"/, 'inside ZIP page has above-fold checkout CTA');
assert.match(insideZip, /Stripe checkout opens after your click\. Use the CSV preview first if you need to confirm the row shape\./, 'inside ZIP page explains top CTA checkout path');
assert.match(insideZip, /142 source-linked rows/, 'inside ZIP page needs paid row count');
assert.match(insideZip, /25 rows for checking fields before purchase/, 'inside ZIP page needs preview row count');
assert.match(insideZip, /\$9\.50/, 'inside ZIP page needs launch price');
assert.match(insideZip, /<h2>File manifest<\/h2>/, 'inside ZIP page needs file manifest');
assert.match(insideZip, /buyer-workbook\.md/, 'inside ZIP page lists buyer workbook');
assert.match(insideZip, /buyer-priority-slices\.csv/, 'inside ZIP page lists priority slices');
assert.match(insideZip, /qa-report\.json/, 'inside ZIP page lists QA report');
assert.match(insideZip, /privacy-and-claims-boundary\.md/, 'inside ZIP page lists claims boundary file');
assert.match(insideZip, /<h2>Fast review path<\/h2>/, 'inside ZIP page needs fast review path');
assert.match(insideZip, /href="\/preview\.html"/, 'inside ZIP page links preview');
assert.match(insideZip, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'inside ZIP page links sample CSV');
assert.match(insideZip, /href="\/free-vs-paid\.html"/, 'inside ZIP page links free vs paid page');
assert.match(insideZip, /href="\/permit-research-workflow\.html"/, 'inside ZIP page links research workflow page');
assert.match(insideZip, /href="\/csv-field-guide\.html"/, 'inside ZIP page links CSV field guide');
assert.match(insideZip, /href="\/pricing\.html"/, 'inside ZIP page links pricing');
assert.match(insideZip, /href="\/delivery\.html"/, 'inside ZIP page links delivery');
assert.match(insideZip, /href="\/support\.html"/, 'inside ZIP page links support page');
assert.match(insideZip, new RegExp(`href="${purchaseUrl}"`), 'inside ZIP page links tracked buy page');
assertSampleRequestForm(insideZip, 'inside ZIP page');
assert.match(insideZip, /No guaranteed leads\./, 'inside ZIP page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(insideZip, pattern, `inside-the-zip.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(insideZip, pattern, `inside-the-zip.html contains private data pattern ${pattern}`);
}

const csvFieldGuide = read('csv-field-guide.html');
assert.match(csvFieldGuide, /<title>CSV Field Guide \| NYC Construction Activity Brief<\/title>/, 'CSV field guide needs title');
assert.match(csvFieldGuide, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/csv-field-guide\.html">/, 'CSV field guide needs canonical');
assert.match(csvFieldGuide, /<meta property="og:title" content="CSV Field Guide \| NYC Construction Activity Brief">/, 'CSV field guide needs OG title');
assert.match(csvFieldGuide, /src="\/assets\/current-issue-snapshot\.png"/, 'CSV field guide needs current issue snapshot image');
assert.match(csvFieldGuide, /"@type":"Product"/, 'CSV field guide needs Product structured data');
assert.match(csvFieldGuide, /"@type":"Dataset"/, 'CSV field guide needs Dataset structured data');
assert.match(csvFieldGuide, /"@type":"FAQPage"/, 'CSV field guide needs FAQ structured data');
assert.match(csvFieldGuide, /"price":"9.50"/, 'CSV field guide needs current price structured data');
assert.match(csvFieldGuide, /\/_vercel\/insights\/script\.js/, 'CSV field guide needs Web Analytics script');
assert.match(csvFieldGuide, /CSV field guide for the current NYC construction activity issue/, 'CSV field guide needs headline');
assert.match(csvFieldGuide, /<h2>CSV columns<\/h2>/, 'CSV field guide needs column section');
assert.match(csvFieldGuide, /<code>source_url<\/code>/, 'CSV field guide explains source_url');
assert.match(csvFieldGuide, /<code>estimated_job_cost_bucket<\/code>/, 'CSV field guide explains cost bucket');
assert.match(csvFieldGuide, /<code>job_description_short<\/code>/, 'CSV field guide explains short description');
assert.match(csvFieldGuide, /Suggested sort order/, 'CSV field guide needs sort order');
assert.match(csvFieldGuide, /Free preview rows: 25/, 'CSV field guide needs free preview count');
assert.match(csvFieldGuide, /Paid ZIP rows: 142/, 'CSV field guide needs paid row count');
assert.match(csvFieldGuide, /href="\/preview\.html"/, 'CSV field guide links preview');
assert.match(csvFieldGuide, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'CSV field guide links sample CSV');
assert.match(csvFieldGuide, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'CSV field guide links sample JSON');
assert.match(csvFieldGuide, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'CSV field guide links sample JSONL');
assert.match(csvFieldGuide, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'CSV field guide links sample brief');
assert.match(csvFieldGuide, /href="\/free-vs-paid\.html"/, 'CSV field guide links free vs paid page');
assert.match(csvFieldGuide, /href="\/permit-research-workflow\.html"/, 'CSV field guide links research workflow page');
assert.match(csvFieldGuide, /href="\/inside-the-zip\.html"/, 'CSV field guide links inside ZIP');
assert.match(csvFieldGuide, /href="\/buyer-guide\.html"/, 'CSV field guide links buyer guide');
assert.match(csvFieldGuide, /href="\/who-should-buy\.html"/, 'CSV field guide links who should buy page');
assert.match(csvFieldGuide, /href="\/time-saved-calculator\.html"/, 'CSV field guide links time saved calculator');
assert.match(csvFieldGuide, /href="\/pricing\.html"/, 'CSV field guide links pricing');
assert.match(csvFieldGuide, /href="\/support\.html"/, 'CSV field guide links support');
assert.match(csvFieldGuide, new RegExp(`href="${purchaseUrl}"`), 'CSV field guide links tracked buy page');
assertSampleRequestForm(csvFieldGuide, 'CSV field guide');
assert.match(csvFieldGuide, /No guaranteed leads\./, 'CSV field guide keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(csvFieldGuide, pattern, `csv-field-guide.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(csvFieldGuide, pattern, `csv-field-guide.html contains private data pattern ${pattern}`);
}

const permitDataDownload = read('nyc-dob-permit-data-download.html');
assert.match(permitDataDownload, /<title>NYC DOB Permit Data Download \| Current Issue ZIP<\/title>/, 'permit data download page needs title');
assert.match(permitDataDownload, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-permit-data-download\.html">/, 'permit data download page needs canonical');
assert.match(permitDataDownload, /<meta property="og:title" content="NYC DOB Permit Data Download \| Current Issue ZIP">/, 'permit data download page needs OG title');
assert.match(permitDataDownload, /src="\/assets\/current-issue-snapshot\.png"/, 'permit data download page needs current issue snapshot image');
assert.match(permitDataDownload, /"@type":"Product"/, 'permit data download page needs Product structured data');
assert.match(permitDataDownload, /"@type":"Dataset"/, 'permit data download page needs Dataset structured data');
assert.match(permitDataDownload, /"@type":"FAQPage"/, 'permit data download page needs FAQ structured data');
assert.match(permitDataDownload, /"price":"9.50"/, 'permit data download page needs current price structured data');
assert.match(permitDataDownload, /\/_vercel\/insights\/script\.js/, 'permit data download page needs Web Analytics script');
assert.match(permitDataDownload, /NYC DOB permit data download for weekly CSV review/, 'permit data download page needs headline');
assert.match(permitDataDownload, /Inspect the free 25-row preview, then buy the full 142-row current issue ZIP/, 'permit data download page needs free and paid row counts');
assert.match(permitDataDownload, /Top work types: Sidewalk Shed 40/, 'permit data download page needs work type mix');
assert.match(permitDataDownload, /Top ZIPs: 10003 37/, 'permit data download page needs ZIP mix');
assert.match(permitDataDownload, /Status mix:/, 'permit data download page needs status mix');
assert.match(permitDataDownload, /href="\/preview\.html"/, 'permit data download page links preview');
assert.match(permitDataDownload, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'permit data download page links sample CSV');
assert.match(permitDataDownload, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'permit data download page links sample JSON');
assert.match(permitDataDownload, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'permit data download page links sample JSONL');
assert.match(permitDataDownload, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'permit data download page links sample brief');
assert.match(permitDataDownload, /href="\/data-package\.json"/, 'permit data download page links data package');
assert.match(permitDataDownload, /href="\/csv-field-guide\.html"/, 'permit data download page links CSV field guide');
assert.match(permitDataDownload, /href="\/inside-the-zip\.html"/, 'permit data download page links ZIP contents');
assert.match(permitDataDownload, /href="\/delivery\.html"/, 'permit data download page links delivery');
assert.match(permitDataDownload, /href="\/pricing\.html"/, 'permit data download page links pricing');
assert.match(permitDataDownload, /href="\/support\.html"/, 'permit data download page links support');
assert.match(permitDataDownload, /href="\/nyc-dob-permit-csv\.html"/, 'permit data download page links permit CSV page');
assert.match(permitDataDownload, /href="\/nyc-permit-data-api-alternative\.html"/, 'permit data download page links permit data API alternative page');
assert.match(permitDataDownload, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-permit-data-download"/, 'permit data download page links tracked buy page');
assert.match(permitDataDownload, /The download endpoint verifies the paid session before serving the ZIP\./, 'permit data download page explains download gate');
assertSampleRequestForm(permitDataDownload, 'permit data download page');
assert.match(permitDataDownload, /No guaranteed leads\./, 'permit data download page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(permitDataDownload, pattern, `nyc-dob-permit-data-download.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(permitDataDownload, pattern, `nyc-dob-permit-data-download.html contains private data pattern ${pattern}`);
}

const buildingPermitData = read('nyc-building-permit-data.html');
assert.match(buildingPermitData, /<title>NYC Building Permit Data \| Current DOB Preview<\/title>/, 'building permit data page needs title');
assert.match(buildingPermitData, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-building-permit-data\.html">/, 'building permit data page needs canonical');
assert.match(buildingPermitData, /<meta property="og:title" content="NYC Building Permit Data \| Current DOB Preview">/, 'building permit data page needs OG title');
assert.match(buildingPermitData, /src="\/assets\/current-issue-snapshot\.png"/, 'building permit data page needs current issue snapshot image');
assert.match(buildingPermitData, /"@type":"Product"/, 'building permit data page needs Product structured data');
assert.match(buildingPermitData, /"@type":"Dataset"/, 'building permit data page needs Dataset structured data');
assert.match(buildingPermitData, /"@type":"FAQPage"/, 'building permit data page needs FAQ structured data');
assert.match(buildingPermitData, /"price":"9.50"/, 'building permit data page needs current price structured data');
assert.match(buildingPermitData, /\/_vercel\/insights\/script\.js/, 'building permit data page needs Web Analytics script');
assert.match(buildingPermitData, /NYC building permit data for weekly construction research/, 'building permit data page needs headline');
assert.match(buildingPermitData, /25 public sample rows/, 'building permit data page needs free preview count');
assert.match(buildingPermitData, /142 source-linked rows/, 'building permit data page needs paid row count');
assert.match(buildingPermitData, /Borough mix: Manhattan 74/, 'building permit data page needs borough mix');
assert.match(buildingPermitData, /Top ZIPs: 10003 37/, 'building permit data page needs ZIP mix');
assert.match(buildingPermitData, /Top work types: Sidewalk Shed 40/, 'building permit data page needs work type mix');
assert.match(buildingPermitData, /href="\/preview\.html"/, 'building permit data page links preview');
assert.match(buildingPermitData, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'building permit data page links sample CSV');
assert.match(buildingPermitData, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'building permit data page links sample JSON');
assert.match(buildingPermitData, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'building permit data page links sample JSONL');
assert.match(buildingPermitData, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'building permit data page links sample brief');
assert.match(buildingPermitData, /href="\/data-package\.json"/, 'building permit data page links data package');
assert.match(buildingPermitData, /href="\/csv-field-guide\.html"/, 'building permit data page links CSV field guide');
assert.match(buildingPermitData, /href="\/sample-segments\.html"/, 'building permit data page links segment pages');
assert.match(buildingPermitData, /href="\/nyc-dob-permit-data-download\.html"/, 'building permit data page links data download page');
assert.match(buildingPermitData, /href="\/nyc-dob-permit-csv\.html"/, 'building permit data page links permit CSV page');
assert.match(buildingPermitData, /href="\/nyc-permit-data-api-alternative\.html"/, 'building permit data page links permit data API alternative page');
assert.match(buildingPermitData, /href="\/free-vs-paid\.html"/, 'building permit data page links free vs paid page');
assert.match(buildingPermitData, /href="\/inside-the-zip\.html"/, 'building permit data page links ZIP contents');
assert.match(buildingPermitData, /href="\/faq\.html"/, 'building permit data page links FAQ');
assert.match(buildingPermitData, /href="\/support\.html"/, 'building permit data page links support');
assert.match(buildingPermitData, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-building-permit-data"/, 'building permit data page links tracked buy page');
assertSampleRequestForm(buildingPermitData, 'building permit data page');
assert.match(buildingPermitData, /No guaranteed leads\./, 'building permit data page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(buildingPermitData, pattern, `nyc-building-permit-data.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(buildingPermitData, pattern, `nyc-building-permit-data.html contains private data pattern ${pattern}`);
}

const buildingPermits = read('nyc-building-permits.html');
assert.match(buildingPermits, /<title>NYC Building Permits \| Weekly CSV Preview<\/title>/, 'building permits page needs title');
assert.match(buildingPermits, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-building-permits\.html">/, 'building permits page needs canonical');
assert.match(buildingPermits, /<meta property="og:title" content="NYC Building Permits \| Weekly CSV Preview">/, 'building permits page needs OG title');
assert.match(buildingPermits, /src="\/assets\/current-issue-snapshot\.png"/, 'building permits page needs current issue snapshot image');
assert.match(buildingPermits, /"@type":"Product"/, 'building permits page needs Product structured data');
assert.match(buildingPermits, /"@type":"Dataset"/, 'building permits page needs Dataset structured data');
assert.match(buildingPermits, /"@type":"FAQPage"/, 'building permits page needs FAQ structured data');
assert.match(buildingPermits, /"price":"9.50"/, 'building permits page needs current price structured data');
assert.match(buildingPermits, /\/_vercel\/insights\/script\.js/, 'building permits page needs Web Analytics script');
assert.match(buildingPermits, /NYC building permits packaged for weekly CSV review/, 'building permits page needs headline');
assert.match(buildingPermits, /NYC DOB NOW: Build - Approved Permits/, 'building permits page names source dataset');
assert.match(buildingPermits, /Free preview rows: 25/, 'building permits page needs free preview count');
assert.match(buildingPermits, /Paid ZIP rows: 142/, 'building permits page needs paid row count');
assert.match(buildingPermits, /Borough mix: Manhattan 74/, 'building permits page needs borough mix');
assert.match(buildingPermits, /Top ZIPs: 10003 37/, 'building permits page needs ZIP mix');
assert.match(buildingPermits, /Top work types: Sidewalk Shed 40/, 'building permits page needs work type mix');
assert.match(buildingPermits, /No owner names, applicant names, phone numbers, email addresses, full street addresses/, 'building permits page needs private-data boundary');
assert.match(buildingPermits, /href="\/preview\.html"/, 'building permits page links preview');
assert.match(buildingPermits, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'building permits page links sample CSV');
assert.match(buildingPermits, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'building permits page links sample JSON');
assert.match(buildingPermits, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'building permits page links sample JSONL');
assert.match(buildingPermits, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'building permits page links sample brief');
assert.match(buildingPermits, /href="\/data-package\.json"/, 'building permits page links data package');
assert.match(buildingPermits, /href="\/csv-field-guide\.html"/, 'building permits page links CSV field guide');
assert.match(buildingPermits, /href="\/nyc-building-permit-data\.html"/, 'building permits page links building permit data page');
assert.match(buildingPermits, /href="\/nyc-dob-approved-permits\.html"/, 'building permits page links DOB approved permits page');
assert.match(buildingPermits, /href="\/nyc-dob-permit-search\.html"/, 'building permits page links DOB permit search page');
assert.match(buildingPermits, /href="\/nyc-dob-permit-data-download\.html"/, 'building permits page links data download page');
assert.match(buildingPermits, /href="\/weekly-nyc-construction-permit-report\.html"/, 'building permits page links weekly report page');
assert.match(buildingPermits, /href="\/sample-segments\.html"/, 'building permits page links segment hub');
assert.match(buildingPermits, /href="\/pricing\.html"/, 'building permits page links pricing');
assert.match(buildingPermits, /href="\/support\.html"/, 'building permits page links support');
assert.match(buildingPermits, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-building-permits"/, 'building permits page links tracked buy page');
assertSampleRequestForm(buildingPermits, 'building permits page');
assert.match(buildingPermits, /No guaranteed leads\./, 'building permits page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(buildingPermits, pattern, `nyc-building-permits.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(buildingPermits, pattern, `nyc-building-permits.html contains private data pattern ${pattern}`);
}

const permitCsv = read('nyc-dob-permit-csv.html');
assert.match(permitCsv, /<title>NYC DOB Permit CSV \| Construction Activity Brief<\/title>/, 'permit CSV page needs title');
assert.match(permitCsv, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-permit-csv\.html">/, 'permit CSV page needs canonical');
assert.match(permitCsv, /<meta property="og:title" content="NYC DOB Permit CSV \| Construction Activity Brief">/, 'permit CSV page needs OG title');
assert.match(permitCsv, /src="\/assets\/current-issue-snapshot\.png"/, 'permit CSV page needs current issue snapshot image');
assert.match(permitCsv, /"@type":"Product"/, 'permit CSV page needs Product structured data');
assert.match(permitCsv, /"@type":"Dataset"/, 'permit CSV page needs Dataset structured data');
assert.match(permitCsv, /"@type":"FAQPage"/, 'permit CSV page needs FAQ structured data');
assert.match(permitCsv, /"price":"9.50"/, 'permit CSV page needs current price structured data');
assert.match(permitCsv, /\/_vercel\/insights\/script\.js/, 'permit CSV page needs Web Analytics script');
assert.match(permitCsv, /NYC DOB permit CSV for weekly construction activity research/, 'permit CSV page needs headline');
assert.match(permitCsv, /Preview 25 public rows before buying the full 142-row current issue ZIP/, 'permit CSV page needs free and paid row counts');
assert.match(permitCsv, /Top work types: Sidewalk Shed 40/, 'permit CSV page needs work type mix');
assert.match(permitCsv, /Top ZIPs: 10003 37/, 'permit CSV page needs ZIP mix');
assert.match(permitCsv, /href="\/preview\.html"/, 'permit CSV page links preview');
assert.match(permitCsv, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'permit CSV page links sample CSV');
assert.match(permitCsv, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'permit CSV page links sample JSON');
assert.match(permitCsv, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'permit CSV page links sample JSONL');
assert.match(permitCsv, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'permit CSV page links sample brief');
assert.match(permitCsv, /href="\/csv-field-guide\.html"/, 'permit CSV page links CSV field guide');
assert.match(permitCsv, /href="\/free-vs-paid\.html"/, 'permit CSV page links free vs paid');
assert.match(permitCsv, /href="\/sample-segments\.html"/, 'permit CSV page links segment hub');
assert.match(permitCsv, /href="\/permit-research-workflow\.html"/, 'permit CSV page links research workflow');
assert.match(permitCsv, /href="\/inside-the-zip\.html"/, 'permit CSV page links ZIP contents');
assert.match(permitCsv, /href="\/buyer-guide\.html"/, 'permit CSV page links buyer guide');
assert.match(permitCsv, /href="\/pricing\.html"/, 'permit CSV page links pricing');
assert.match(permitCsv, /href="\/support\.html"/, 'permit CSV page links support');
assert.match(permitCsv, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-permit-csv"/, 'permit CSV page links tracked buy page');
assertSampleRequestForm(permitCsv, 'permit CSV page');
assert.match(permitCsv, /No guaranteed leads\./, 'permit CSV page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(permitCsv, pattern, `nyc-dob-permit-csv.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(permitCsv, pattern, `nyc-dob-permit-csv.html contains private data pattern ${pattern}`);
}

const permitDataApiAlternative = read('nyc-permit-data-api-alternative.html');
assert.match(permitDataApiAlternative, /<title>NYC Permit Data API Alternative \| NYC Construction Brief<\/title>/, 'permit data API alternative page needs title');
assert.match(permitDataApiAlternative, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-permit-data-api-alternative\.html">/, 'permit data API alternative page needs canonical');
assert.match(permitDataApiAlternative, /<meta property="og:title" content="NYC Permit Data API Alternative \| NYC Construction Brief">/, 'permit data API alternative page needs OG title');
assert.match(permitDataApiAlternative, /src="\/assets\/current-issue-snapshot\.png"/, 'permit data API alternative page needs current issue snapshot image');
assert.match(permitDataApiAlternative, /"@type":"Product"/, 'permit data API alternative page needs Product structured data');
assert.match(permitDataApiAlternative, /"@type":"Dataset"/, 'permit data API alternative page needs Dataset structured data');
assert.match(permitDataApiAlternative, /"@type":"FAQPage"/, 'permit data API alternative page needs FAQ structured data');
assert.match(permitDataApiAlternative, /"price":"9.50"/, 'permit data API alternative page needs current price structured data');
assert.match(permitDataApiAlternative, /\/_vercel\/insights\/script\.js/, 'permit data API alternative page needs Web Analytics script');
assert.match(permitDataApiAlternative, /NYC permit data API alternative for weekly CSV research/, 'permit data API alternative page needs headline');
assert.match(permitDataApiAlternative, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'permit data API alternative page needs row counts');
assert.match(permitDataApiAlternative, /Top work types: Sidewalk Shed 40/, 'permit data API alternative page needs work type mix');
assert.match(permitDataApiAlternative, /Top ZIPs: 10003 37/, 'permit data API alternative page needs ZIP mix');
assert.match(permitDataApiAlternative, /Status mix:/, 'permit data API alternative page needs status mix');
assert.match(permitDataApiAlternative, /When the ZIP fits/, 'permit data API alternative page needs fit section');
assert.match(permitDataApiAlternative, /Technical review pass/, 'permit data API alternative page needs technical review pass');
assert.match(permitDataApiAlternative, /href="\/topics\/nyc-construction-permit-data-api-alternative\.html"/, 'permit data API alternative page links API alternative topic');
assert.match(permitDataApiAlternative, /href="\/topics\/nyc-building-permit-export-csv\.html"/, 'permit data API alternative page links export CSV topic');
assert.match(permitDataApiAlternative, /href="\/topics\/nyc-construction-permit-data-for-proptech\.html"/, 'permit data API alternative page links proptech topic');
assert.match(permitDataApiAlternative, /href="\/preview\.html"/, 'permit data API alternative page links preview');
assert.match(permitDataApiAlternative, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'permit data API alternative page links sample CSV');
assert.match(permitDataApiAlternative, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'permit data API alternative page links sample JSON');
assert.match(permitDataApiAlternative, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'permit data API alternative page links sample JSONL');
assert.match(permitDataApiAlternative, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'permit data API alternative page links sample brief');
assert.match(permitDataApiAlternative, /href="\/csv-field-guide\.html"/, 'permit data API alternative page links CSV field guide');
assert.match(permitDataApiAlternative, /href="\/nyc-dob-permit-csv\.html"/, 'permit data API alternative page links permit CSV page');
assert.match(permitDataApiAlternative, /href="\/dob-now-permit-search-alternative\.html"/, 'permit data API alternative page links DOB NOW alternative page');
assert.match(permitDataApiAlternative, /href="\/free-vs-paid\.html"/, 'permit data API alternative page links free vs paid');
assert.match(permitDataApiAlternative, /href="\/permit-research-workflow\.html"/, 'permit data API alternative page links research workflow');
assert.match(permitDataApiAlternative, /href="\/inside-the-zip\.html"/, 'permit data API alternative page links ZIP contents');
assert.match(permitDataApiAlternative, /href="\/pricing\.html"/, 'permit data API alternative page links pricing');
assert.match(permitDataApiAlternative, /href="\/support\.html"/, 'permit data API alternative page links support');
assert.match(permitDataApiAlternative, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-permit-data-api-alternative"/, 'permit data API alternative page links tracked buy page');
assertSampleRequestForm(permitDataApiAlternative, 'permit data API alternative page');
assert.match(permitDataApiAlternative, /No guaranteed leads\./, 'permit data API alternative page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(permitDataApiAlternative, pattern, `nyc-permit-data-api-alternative.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(permitDataApiAlternative, pattern, `nyc-permit-data-api-alternative.html contains private data pattern ${pattern}`);
}

const weeklyPermitReport = read('weekly-nyc-construction-permit-report.html');
assert.match(weeklyPermitReport, /<title>Weekly NYC Construction Permit Report \| DOB Brief<\/title>/, 'weekly permit report page needs title');
assert.match(weeklyPermitReport, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/weekly-nyc-construction-permit-report\.html">/, 'weekly permit report page needs canonical');
assert.match(weeklyPermitReport, /<meta property="og:title" content="Weekly NYC Construction Permit Report \| DOB Brief">/, 'weekly permit report page needs OG title');
assert.match(weeklyPermitReport, /src="\/assets\/current-issue-snapshot\.png"/, 'weekly permit report page needs current issue snapshot image');
assert.match(weeklyPermitReport, /"@type":"Product"/, 'weekly permit report page needs Product structured data');
assert.match(weeklyPermitReport, /"@type":"Dataset"/, 'weekly permit report page needs Dataset structured data');
assert.match(weeklyPermitReport, /"@type":"FAQPage"/, 'weekly permit report page needs FAQ structured data');
assert.match(weeklyPermitReport, /"price":"9.50"/, 'weekly permit report page needs current price structured data');
assert.match(weeklyPermitReport, /\/_vercel\/insights\/script\.js/, 'weekly permit report page needs Web Analytics script');
assert.match(weeklyPermitReport, /Weekly NYC construction permit report for source-linked review/, 'weekly permit report page needs headline');
assert.match(weeklyPermitReport, /Free preview rows: 25/, 'weekly permit report page needs free preview count');
assert.match(weeklyPermitReport, /Paid ZIP rows: 142/, 'weekly permit report page needs paid row count');
assert.match(weeklyPermitReport, /Top work types: Sidewalk Shed 40/, 'weekly permit report page needs work type mix');
assert.match(weeklyPermitReport, /href="\/current-issue\.html"/, 'weekly permit report page links current issue');
assert.match(weeklyPermitReport, /href="\/preview\.html"/, 'weekly permit report page links preview');
assert.match(weeklyPermitReport, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'weekly permit report page links sample CSV');
assert.match(weeklyPermitReport, /href="\/nyc-dob-permit-csv\.html"/, 'weekly permit report page links permit CSV page');
assert.match(weeklyPermitReport, /href="\/sample-segments\.html"/, 'weekly permit report page links segment hub');
assert.match(weeklyPermitReport, /href="\/permit-research-workflow\.html"/, 'weekly permit report page links research workflow');
assert.match(weeklyPermitReport, /href="\/inside-the-zip\.html"/, 'weekly permit report page links ZIP contents');
assert.match(weeklyPermitReport, /href="\/pricing\.html"/, 'weekly permit report page links pricing');
assert.match(weeklyPermitReport, /href="\/delivery\.html"/, 'weekly permit report page links delivery');
assert.match(weeklyPermitReport, /href="\/support\.html"/, 'weekly permit report page links support');
assert.match(weeklyPermitReport, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=weekly-nyc-construction-report"/, 'weekly permit report page links tracked buy page');
assertSampleRequestForm(weeklyPermitReport, 'weekly permit report page');
assert.match(weeklyPermitReport, /No guaranteed leads\./, 'weekly permit report page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(weeklyPermitReport, pattern, `weekly-nyc-construction-permit-report.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(weeklyPermitReport, pattern, `weekly-nyc-construction-permit-report.html contains private data pattern ${pattern}`);
}

const dobPermitAlerts = read('nyc-dob-permit-alerts.html');
assert.match(dobPermitAlerts, /<title>NYC DOB Permit Alerts Alternative \| Construction Brief<\/title>/, 'DOB permit alerts page needs title');
assert.match(dobPermitAlerts, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-permit-alerts\.html">/, 'DOB permit alerts page needs canonical');
assert.match(dobPermitAlerts, /<meta property="og:title" content="NYC DOB Permit Alerts Alternative \| Construction Brief">/, 'DOB permit alerts page needs OG title');
assert.match(dobPermitAlerts, /src="\/assets\/current-issue-snapshot\.png"/, 'DOB permit alerts page needs current issue snapshot image');
assert.match(dobPermitAlerts, /"@type":"Product"/, 'DOB permit alerts page needs Product structured data');
assert.match(dobPermitAlerts, /"@type":"Dataset"/, 'DOB permit alerts page needs Dataset structured data');
assert.match(dobPermitAlerts, /"@type":"FAQPage"/, 'DOB permit alerts page needs FAQ structured data');
assert.match(dobPermitAlerts, /"price":"9.50"/, 'DOB permit alerts page needs current price structured data');
assert.match(dobPermitAlerts, /\/_vercel\/insights\/script\.js/, 'DOB permit alerts page needs Web Analytics script');
assert.match(dobPermitAlerts, /NYC DOB permit alerts alternative for weekly review/, 'DOB permit alerts page needs headline');
assert.match(dobPermitAlerts, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'DOB permit alerts page needs row counts');
assert.match(dobPermitAlerts, /Top work types: Sidewalk Shed 40/, 'DOB permit alerts page needs work type mix');
assert.match(dobPermitAlerts, /Top ZIPs: 10003 37/, 'DOB permit alerts page needs ZIP mix');
assert.match(dobPermitAlerts, /This is not a live alert feed/, 'DOB permit alerts page states live-alert boundary');
assert.match(dobPermitAlerts, /No guaranteed leads\./, 'DOB permit alerts page keeps claims boundary visible');
assert.match(dobPermitAlerts, /href="\/current-issue\.html"/, 'DOB permit alerts page links current issue');
assert.match(dobPermitAlerts, /href="\/preview\.html"/, 'DOB permit alerts page links preview');
assert.match(dobPermitAlerts, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB permit alerts page links sample CSV');
assert.match(dobPermitAlerts, /href="\/weekly-nyc-construction-permit-report\.html"/, 'DOB permit alerts page links weekly report');
assert.match(dobPermitAlerts, /href="\/nyc-dob-permit-csv\.html"/, 'DOB permit alerts page links permit CSV page');
assert.match(dobPermitAlerts, /href="\/nyc-dob-permit-search\.html"/, 'DOB permit alerts page links DOB search page');
assert.match(dobPermitAlerts, /href="\/nyc-dob-permit-lookup\.html"/, 'DOB permit alerts page links DOB lookup page');
assert.match(dobPermitAlerts, /href="\/sample-segments\.html"/, 'DOB permit alerts page links segment hub');
assert.match(dobPermitAlerts, /href="\/inside-the-zip\.html"/, 'DOB permit alerts page links ZIP contents');
assert.match(dobPermitAlerts, /href="\/pricing\.html"/, 'DOB permit alerts page links pricing');
assert.match(dobPermitAlerts, /href="\/delivery\.html"/, 'DOB permit alerts page links delivery');
assert.match(dobPermitAlerts, /href="\/support\.html"/, 'DOB permit alerts page links support');
assert.match(dobPermitAlerts, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-permit-alerts"/, 'DOB permit alerts page links tracked buy page');
assertSampleRequestForm(dobPermitAlerts, 'DOB permit alerts page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobPermitAlerts, pattern, `nyc-dob-permit-alerts.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobPermitAlerts, pattern, `nyc-dob-permit-alerts.html contains private data pattern ${pattern}`);
}

const dobPermitTracker = read('nyc-dob-permit-tracker.html');
assert.match(dobPermitTracker, /<title>NYC DOB Permit Tracker Alternative \| Construction Brief<\/title>/, 'DOB permit tracker page needs title');
assert.match(dobPermitTracker, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-permit-tracker\.html">/, 'DOB permit tracker page needs canonical');
assert.match(dobPermitTracker, /<meta property="og:title" content="NYC DOB Permit Tracker Alternative \| Construction Brief">/, 'DOB permit tracker page needs OG title');
assert.match(dobPermitTracker, /src="\/assets\/current-issue-snapshot\.png"/, 'DOB permit tracker page needs current issue snapshot image');
assert.match(dobPermitTracker, /"@type":"Product"/, 'DOB permit tracker page needs Product structured data');
assert.match(dobPermitTracker, /"@type":"Dataset"/, 'DOB permit tracker page needs Dataset structured data');
assert.match(dobPermitTracker, /"@type":"FAQPage"/, 'DOB permit tracker page needs FAQ structured data');
assert.match(dobPermitTracker, /"price":"9.50"/, 'DOB permit tracker page needs current price structured data');
assert.match(dobPermitTracker, /\/_vercel\/insights\/script\.js/, 'DOB permit tracker page needs Web Analytics script');
assert.match(dobPermitTracker, /NYC DOB permit tracker alternative for weekly review/, 'DOB permit tracker page needs headline');
assert.match(dobPermitTracker, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'DOB permit tracker page needs row counts');
assert.match(dobPermitTracker, /Status mix: Permit Issued 141/, 'DOB permit tracker page needs status mix');
assert.match(dobPermitTracker, /Top work types: Sidewalk Shed 40/, 'DOB permit tracker page needs work type mix');
assert.match(dobPermitTracker, /Top ZIPs: 10003 37/, 'DOB permit tracker page needs ZIP mix');
assert.match(dobPermitTracker, /This is not live monitoring/, 'DOB permit tracker page states live-monitoring boundary');
assert.match(dobPermitTracker, /No guaranteed leads\./, 'DOB permit tracker page keeps claims boundary visible');
assert.match(dobPermitTracker, /href="\/current-issue\.html"/, 'DOB permit tracker page links current issue');
assert.match(dobPermitTracker, /href="\/preview\.html"/, 'DOB permit tracker page links preview');
assert.match(dobPermitTracker, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB permit tracker page links sample CSV');
assert.match(dobPermitTracker, /href="\/nyc-dob-permit-alerts\.html"/, 'DOB permit tracker page links DOB alerts page');
assert.match(dobPermitTracker, /href="\/weekly-nyc-construction-permit-report\.html"/, 'DOB permit tracker page links weekly report');
assert.match(dobPermitTracker, /href="\/nyc-dob-permit-csv\.html"/, 'DOB permit tracker page links permit CSV page');
assert.match(dobPermitTracker, /href="\/nyc-dob-permit-search\.html"/, 'DOB permit tracker page links DOB search page');
assert.match(dobPermitTracker, /href="\/nyc-dob-permit-lookup\.html"/, 'DOB permit tracker page links DOB lookup page');
assert.match(dobPermitTracker, /href="\/sample-segments\.html"/, 'DOB permit tracker page links segment hub');
assert.match(dobPermitTracker, /href="\/inside-the-zip\.html"/, 'DOB permit tracker page links ZIP contents');
assert.match(dobPermitTracker, /href="\/pricing\.html"/, 'DOB permit tracker page links pricing');
assert.match(dobPermitTracker, /href="\/delivery\.html"/, 'DOB permit tracker page links delivery');
assert.match(dobPermitTracker, /href="\/support\.html"/, 'DOB permit tracker page links support');
assert.match(dobPermitTracker, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-permit-tracker"/, 'DOB permit tracker page links tracked buy page');
assertSampleRequestForm(dobPermitTracker, 'DOB permit tracker page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobPermitTracker, pattern, `nyc-dob-permit-tracker.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobPermitTracker, pattern, `nyc-dob-permit-tracker.html contains private data pattern ${pattern}`);
}

const dobPermitMonitoring = read('nyc-dob-permit-monitoring.html');
assert.match(dobPermitMonitoring, /<title>NYC DOB Permit Monitoring Alternative \| Construction Brief<\/title>/, 'DOB permit monitoring page needs title');
assert.match(dobPermitMonitoring, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-permit-monitoring\.html">/, 'DOB permit monitoring page needs canonical');
assert.match(dobPermitMonitoring, /<meta property="og:title" content="NYC DOB Permit Monitoring Alternative \| Construction Brief">/, 'DOB permit monitoring page needs OG title');
assert.match(dobPermitMonitoring, /src="\/assets\/current-issue-snapshot\.png"/, 'DOB permit monitoring page needs current issue snapshot image');
assert.match(dobPermitMonitoring, /"@type":"Product"/, 'DOB permit monitoring page needs Product structured data');
assert.match(dobPermitMonitoring, /"@type":"Dataset"/, 'DOB permit monitoring page needs Dataset structured data');
assert.match(dobPermitMonitoring, /"@type":"FAQPage"/, 'DOB permit monitoring page needs FAQ structured data');
assert.match(dobPermitMonitoring, /"price":"9.50"/, 'DOB permit monitoring page needs current price structured data');
assert.match(dobPermitMonitoring, /\/_vercel\/insights\/script\.js/, 'DOB permit monitoring page needs Web Analytics script');
assert.match(dobPermitMonitoring, /NYC DOB permit monitoring alternative for weekly review/, 'DOB permit monitoring page needs headline');
assert.match(dobPermitMonitoring, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'DOB permit monitoring page needs row counts');
assert.match(dobPermitMonitoring, /Status mix: Permit Issued 141/, 'DOB permit monitoring page needs status mix');
assert.match(dobPermitMonitoring, /Top work types: Sidewalk Shed 40/, 'DOB permit monitoring page needs work type mix');
assert.match(dobPermitMonitoring, /Top ZIPs: 10003 37/, 'DOB permit monitoring page needs ZIP mix');
assert.match(dobPermitMonitoring, /This is not live monitoring/, 'DOB permit monitoring page states live-monitoring boundary');
assert.match(dobPermitMonitoring, /No guaranteed leads\./, 'DOB permit monitoring page keeps claims boundary visible');
assert.match(dobPermitMonitoring, /href="\/current-issue\.html"/, 'DOB permit monitoring page links current issue');
assert.match(dobPermitMonitoring, /href="\/preview\.html"/, 'DOB permit monitoring page links preview');
assert.match(dobPermitMonitoring, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB permit monitoring page links sample CSV');
assert.match(dobPermitMonitoring, /href="\/nyc-dob-permit-alerts\.html"/, 'DOB permit monitoring page links DOB alerts page');
assert.match(dobPermitMonitoring, /href="\/nyc-dob-permit-tracker\.html"/, 'DOB permit monitoring page links DOB tracker page');
assert.match(dobPermitMonitoring, /href="\/weekly-nyc-construction-permit-report\.html"/, 'DOB permit monitoring page links weekly report');
assert.match(dobPermitMonitoring, /href="\/nyc-dob-permit-csv\.html"/, 'DOB permit monitoring page links permit CSV page');
assert.match(dobPermitMonitoring, /href="\/nyc-dob-permit-search\.html"/, 'DOB permit monitoring page links DOB search page');
assert.match(dobPermitMonitoring, /href="\/nyc-dob-permit-lookup\.html"/, 'DOB permit monitoring page links DOB lookup page');
assert.match(dobPermitMonitoring, /href="\/sample-segments\.html"/, 'DOB permit monitoring page links segment hub');
assert.match(dobPermitMonitoring, /href="\/inside-the-zip\.html"/, 'DOB permit monitoring page links ZIP contents');
assert.match(dobPermitMonitoring, /href="\/pricing\.html"/, 'DOB permit monitoring page links pricing');
assert.match(dobPermitMonitoring, /href="\/delivery\.html"/, 'DOB permit monitoring page links delivery');
assert.match(dobPermitMonitoring, /href="\/support\.html"/, 'DOB permit monitoring page links support');
assert.match(dobPermitMonitoring, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-permit-monitoring"/, 'DOB permit monitoring page links tracked buy page');
assertSampleRequestForm(dobPermitMonitoring, 'DOB permit monitoring page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobPermitMonitoring, pattern, `nyc-dob-permit-monitoring.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobPermitMonitoring, pattern, `nyc-dob-permit-monitoring.html contains private data pattern ${pattern}`);
}

const dobPermitWatchlist = read('nyc-dob-permit-watchlist.html');
assert.match(dobPermitWatchlist, /<title>NYC DOB Permit Watchlist Alternative \| Construction Brief<\/title>/, 'DOB permit watchlist page needs title');
assert.match(dobPermitWatchlist, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-permit-watchlist\.html">/, 'DOB permit watchlist page needs canonical');
assert.match(dobPermitWatchlist, /<meta property="og:title" content="NYC DOB Permit Watchlist Alternative \| Construction Brief">/, 'DOB permit watchlist page needs OG title');
assert.match(dobPermitWatchlist, /src="\/assets\/current-issue-snapshot\.png"/, 'DOB permit watchlist page needs current issue snapshot image');
assert.match(dobPermitWatchlist, /"@type":"Product"/, 'DOB permit watchlist page needs Product structured data');
assert.match(dobPermitWatchlist, /"@type":"Dataset"/, 'DOB permit watchlist page needs Dataset structured data');
assert.match(dobPermitWatchlist, /"@type":"FAQPage"/, 'DOB permit watchlist page needs FAQ structured data');
assert.match(dobPermitWatchlist, /"price":"9.50"/, 'DOB permit watchlist page needs current price structured data');
assert.match(dobPermitWatchlist, /\/_vercel\/insights\/script\.js/, 'DOB permit watchlist page needs Web Analytics script');
assert.match(dobPermitWatchlist, /NYC DOB permit watchlist alternative for weekly review/, 'DOB permit watchlist page needs headline');
assert.match(dobPermitWatchlist, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'DOB permit watchlist page needs row counts');
assert.match(dobPermitWatchlist, /Top work types: Sidewalk Shed 40/, 'DOB permit watchlist page needs work type mix');
assert.match(dobPermitWatchlist, /Top ZIPs: 10003 37/, 'DOB permit watchlist page needs ZIP mix');
assert.match(dobPermitWatchlist, /This is not a live watchlist/, 'DOB permit watchlist page states live-watchlist boundary');
assert.match(dobPermitWatchlist, /No guaranteed leads\./, 'DOB permit watchlist page keeps claims boundary visible');
assert.match(dobPermitWatchlist, /href="\/current-issue\.html"/, 'DOB permit watchlist page links current issue');
assert.match(dobPermitWatchlist, /href="\/preview\.html"/, 'DOB permit watchlist page links preview');
assert.match(dobPermitWatchlist, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB permit watchlist page links sample CSV');
assert.match(dobPermitWatchlist, /href="\/nyc-dob-permit-alerts\.html"/, 'DOB permit watchlist page links DOB alerts page');
assert.match(dobPermitWatchlist, /href="\/nyc-dob-permit-tracker\.html"/, 'DOB permit watchlist page links DOB tracker page');
assert.match(dobPermitWatchlist, /href="\/nyc-dob-permit-monitoring\.html"/, 'DOB permit watchlist page links DOB monitoring page');
assert.match(dobPermitWatchlist, /href="\/weekly-nyc-construction-permit-report\.html"/, 'DOB permit watchlist page links weekly report');
assert.match(dobPermitWatchlist, /href="\/nyc-dob-permit-csv\.html"/, 'DOB permit watchlist page links permit CSV page');
assert.match(dobPermitWatchlist, /href="\/nyc-dob-permit-search\.html"/, 'DOB permit watchlist page links DOB search page');
assert.match(dobPermitWatchlist, /href="\/nyc-dob-permit-lookup\.html"/, 'DOB permit watchlist page links DOB lookup page');
assert.match(dobPermitWatchlist, /href="\/sample-segments\.html"/, 'DOB permit watchlist page links segment hub');
assert.match(dobPermitWatchlist, /href="\/inside-the-zip\.html"/, 'DOB permit watchlist page links ZIP contents');
assert.match(dobPermitWatchlist, /href="\/pricing\.html"/, 'DOB permit watchlist page links pricing');
assert.match(dobPermitWatchlist, /href="\/delivery\.html"/, 'DOB permit watchlist page links delivery');
assert.match(dobPermitWatchlist, /href="\/support\.html"/, 'DOB permit watchlist page links support');
assert.match(dobPermitWatchlist, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-permit-watchlist"/, 'DOB permit watchlist page links tracked buy page');
assertSampleRequestForm(dobPermitWatchlist, 'DOB permit watchlist page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobPermitWatchlist, pattern, `nyc-dob-permit-watchlist.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobPermitWatchlist, pattern, `nyc-dob-permit-watchlist.html contains private data pattern ${pattern}`);
}

const dobNowAlternative = read('dob-now-permit-search-alternative.html');
assert.match(dobNowAlternative, /<title>DOB NOW Permit Search Alternative \| NYC Construction Brief<\/title>/, 'DOB NOW alternative page needs title');
assert.match(dobNowAlternative, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/dob-now-permit-search-alternative\.html">/, 'DOB NOW alternative page needs canonical');
assert.match(dobNowAlternative, /<meta property="og:title" content="DOB NOW Permit Search Alternative \| NYC Construction Brief">/, 'DOB NOW alternative page needs OG title');
assert.match(dobNowAlternative, /src="\/assets\/current-issue-snapshot\.png"/, 'DOB NOW alternative page needs current issue snapshot image');
assert.match(dobNowAlternative, /"@type":"Product"/, 'DOB NOW alternative page needs Product structured data');
assert.match(dobNowAlternative, /"@type":"Dataset"/, 'DOB NOW alternative page needs Dataset structured data');
assert.match(dobNowAlternative, /"@type":"FAQPage"/, 'DOB NOW alternative page needs FAQ structured data');
assert.match(dobNowAlternative, /"price":"9.50"/, 'DOB NOW alternative page needs current price structured data');
assert.match(dobNowAlternative, /\/_vercel\/insights\/script\.js/, 'DOB NOW alternative page needs Web Analytics script');
assert.match(dobNowAlternative, /DOB NOW permit search alternative for weekly screening/, 'DOB NOW alternative page needs headline');
assert.match(dobNowAlternative, /Free preview rows: 25/, 'DOB NOW alternative page needs free preview count');
assert.match(dobNowAlternative, /Paid ZIP rows: 142/, 'DOB NOW alternative page needs paid row count');
assert.match(dobNowAlternative, /Top work types: Sidewalk Shed 40/, 'DOB NOW alternative page needs work type mix');
assert.match(dobNowAlternative, /Top ZIPs: 10003 37/, 'DOB NOW alternative page needs ZIP mix');
assert.match(dobNowAlternative, /Manual DOB NOW search/, 'DOB NOW alternative page compares manual source search');
assert.match(dobNowAlternative, /href="\/current-issue\.html"/, 'DOB NOW alternative page links current issue');
assert.match(dobNowAlternative, /href="\/preview\.html"/, 'DOB NOW alternative page links preview');
assert.match(dobNowAlternative, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB NOW alternative page links sample CSV');
assert.match(dobNowAlternative, /href="\/nyc-dob-permit-csv\.html"/, 'DOB NOW alternative page links permit CSV page');
assert.match(dobNowAlternative, /href="\/weekly-nyc-construction-permit-report\.html"/, 'DOB NOW alternative page links weekly report page');
assert.match(dobNowAlternative, /href="\/sample-segments\.html"/, 'DOB NOW alternative page links segment hub');
assert.match(dobNowAlternative, /href="\/permit-research-workflow\.html"/, 'DOB NOW alternative page links research workflow');
assert.match(dobNowAlternative, /href="\/inside-the-zip\.html"/, 'DOB NOW alternative page links ZIP contents');
assert.match(dobNowAlternative, /href="\/csv-field-guide\.html"/, 'DOB NOW alternative page links CSV field guide');
assert.match(dobNowAlternative, /href="\/pricing\.html"/, 'DOB NOW alternative page links pricing');
assert.match(dobNowAlternative, /href="\/delivery\.html"/, 'DOB NOW alternative page links delivery');
assert.match(dobNowAlternative, /href="\/support\.html"/, 'DOB NOW alternative page links support');
assert.match(dobNowAlternative, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=dob-now-alternative"/, 'DOB NOW alternative page links tracked buy page');
assertSampleRequestForm(dobNowAlternative, 'DOB NOW alternative page');
assert.match(dobNowAlternative, /No guaranteed leads\./, 'DOB NOW alternative page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobNowAlternative, pattern, `dob-now-permit-search-alternative.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobNowAlternative, pattern, `dob-now-permit-search-alternative.html contains private data pattern ${pattern}`);
}

const dobPermitSearch = read('nyc-dob-permit-search.html');
assert.match(dobPermitSearch, /<title>NYC DOB Permit Search \| Weekly CSV Companion<\/title>/, 'DOB permit search page needs title');
assert.match(dobPermitSearch, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-permit-search\.html">/, 'DOB permit search page needs canonical');
assert.match(dobPermitSearch, /<meta property="og:title" content="NYC DOB Permit Search \| Weekly CSV Companion">/, 'DOB permit search page needs OG title');
assert.match(dobPermitSearch, /src="\/assets\/current-issue-snapshot\.png"/, 'DOB permit search page needs current issue snapshot image');
assert.match(dobPermitSearch, /"@type":"Product"/, 'DOB permit search page needs Product structured data');
assert.match(dobPermitSearch, /"@type":"Dataset"/, 'DOB permit search page needs Dataset structured data');
assert.match(dobPermitSearch, /"@type":"FAQPage"/, 'DOB permit search page needs FAQ structured data');
assert.match(dobPermitSearch, /"price":"9.50"/, 'DOB permit search page needs current price structured data');
assert.match(dobPermitSearch, /\/_vercel\/insights\/script\.js/, 'DOB permit search page needs Web Analytics script');
assert.match(dobPermitSearch, /NYC DOB permit search companion for weekly CSV screening/, 'DOB permit search page needs headline');
assert.match(dobPermitSearch, /Free preview rows: 25/, 'DOB permit search page needs free preview count');
assert.match(dobPermitSearch, /Paid ZIP rows: 142/, 'DOB permit search page needs paid row count');
assert.match(dobPermitSearch, /Top work types: Sidewalk Shed 40/, 'DOB permit search page needs work type mix');
assert.match(dobPermitSearch, /Top ZIPs: 10003 37/, 'DOB permit search page needs ZIP mix');
assert.match(dobPermitSearch, /Status mix: Permit Issued 141/, 'DOB permit search page needs status mix');
assert.match(dobPermitSearch, /No owner names, applicant names, phone numbers, email addresses, full street addresses/, 'DOB permit search page needs private-data boundary');
assert.match(dobPermitSearch, /href="\/current-issue\.html"/, 'DOB permit search page links current issue');
assert.match(dobPermitSearch, /href="\/dob-now-permit-search-alternative\.html"/, 'DOB permit search page links DOB NOW alternative');
assert.match(dobPermitSearch, /href="\/nyc-dob-permit-data-download\.html"/, 'DOB permit search page links data download page');
assert.match(dobPermitSearch, /href="\/nyc-dob-permit-csv\.html"/, 'DOB permit search page links permit CSV page');
assert.match(dobPermitSearch, /href="\/weekly-nyc-construction-permit-report\.html"/, 'DOB permit search page links weekly report page');
assert.match(dobPermitSearch, /href="\/sample-segments\.html"/, 'DOB permit search page links segment hub');
assert.match(dobPermitSearch, /href="\/permit-research-workflow\.html"/, 'DOB permit search page links research workflow');
assert.match(dobPermitSearch, /href="\/pricing\.html"/, 'DOB permit search page links pricing');
assert.match(dobPermitSearch, /href="\/support\.html"/, 'DOB permit search page links support');
assert.match(dobPermitSearch, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB permit search page links sample CSV');
assert.match(dobPermitSearch, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'DOB permit search page links sample JSON');
assert.match(dobPermitSearch, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'DOB permit search page links sample JSONL');
assert.match(dobPermitSearch, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'DOB permit search page links sample brief');
assert.match(dobPermitSearch, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-permit-search"/, 'DOB permit search page links tracked buy page');
assertSampleRequestForm(dobPermitSearch, 'DOB permit search page');
assert.match(dobPermitSearch, /No guaranteed leads\./, 'DOB permit search page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobPermitSearch, pattern, `nyc-dob-permit-search.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobPermitSearch, pattern, `nyc-dob-permit-search.html contains private data pattern ${pattern}`);
}

const constructionPermitSearch = read('nyc-construction-permit-search.html');
assert.match(constructionPermitSearch, /<title>NYC Construction Permit Search \| Weekly DOB CSV<\/title>/, 'construction permit search page needs title');
assert.match(constructionPermitSearch, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-construction-permit-search\.html">/, 'construction permit search page needs canonical');
assert.match(constructionPermitSearch, /<meta property="og:title" content="NYC Construction Permit Search \| Weekly DOB CSV">/, 'construction permit search page needs OG title');
assert.match(constructionPermitSearch, /src="\/assets\/current-issue-snapshot\.png"/, 'construction permit search page needs current issue snapshot image');
assert.match(constructionPermitSearch, /"@type":"Product"/, 'construction permit search page needs Product structured data');
assert.match(constructionPermitSearch, /"@type":"Dataset"/, 'construction permit search page needs Dataset structured data');
assert.match(constructionPermitSearch, /"@type":"FAQPage"/, 'construction permit search page needs FAQ structured data');
assert.match(constructionPermitSearch, /"price":"9.50"/, 'construction permit search page needs current price structured data');
assert.match(constructionPermitSearch, /\/_vercel\/insights\/script\.js/, 'construction permit search page needs Web Analytics script');
assert.match(constructionPermitSearch, /NYC construction permit search companion for weekly CSV screening/, 'construction permit search page needs headline');
assert.match(constructionPermitSearch, /Free preview rows: 25/, 'construction permit search page needs free preview count');
assert.match(constructionPermitSearch, /Paid ZIP rows: 142/, 'construction permit search page needs paid row count');
assert.match(constructionPermitSearch, /Top work types: Sidewalk Shed 40/, 'construction permit search page needs work type mix');
assert.match(constructionPermitSearch, /Top ZIPs: 10003 37/, 'construction permit search page needs ZIP mix');
assert.match(constructionPermitSearch, /Status mix: Permit Issued 141/, 'construction permit search page needs status mix');
assert.match(constructionPermitSearch, /No owner names, applicant names, phone numbers, email addresses, full street addresses/, 'construction permit search page needs private-data boundary');
assert.match(constructionPermitSearch, /href="\/current-issue\.html"/, 'construction permit search page links current issue');
assert.match(constructionPermitSearch, /href="\/dob-now-permit-search-alternative\.html"/, 'construction permit search page links DOB NOW alternative');
assert.match(constructionPermitSearch, /href="\/nyc-dob-permit-data-download\.html"/, 'construction permit search page links data download page');
assert.match(constructionPermitSearch, /href="\/nyc-dob-permit-csv\.html"/, 'construction permit search page links permit CSV page');
assert.match(constructionPermitSearch, /href="\/weekly-nyc-construction-permit-report\.html"/, 'construction permit search page links weekly report page');
assert.match(constructionPermitSearch, /href="\/sample-segments\.html"/, 'construction permit search page links segment hub');
assert.match(constructionPermitSearch, /href="\/permit-research-workflow\.html"/, 'construction permit search page links research workflow');
assert.match(constructionPermitSearch, /href="\/pricing\.html"/, 'construction permit search page links pricing');
assert.match(constructionPermitSearch, /href="\/support\.html"/, 'construction permit search page links support');
assert.match(constructionPermitSearch, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'construction permit search page links sample CSV');
assert.match(constructionPermitSearch, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'construction permit search page links sample JSON');
assert.match(constructionPermitSearch, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'construction permit search page links sample JSONL');
assert.match(constructionPermitSearch, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'construction permit search page links sample brief');
assert.match(constructionPermitSearch, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-construction-permit-search"/, 'construction permit search page links tracked buy page');
assertSampleRequestForm(constructionPermitSearch, 'construction permit search page');
assert.match(constructionPermitSearch, /No guaranteed leads\./, 'construction permit search page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(constructionPermitSearch, pattern, `nyc-construction-permit-search.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(constructionPermitSearch, pattern, `nyc-construction-permit-search.html contains private data pattern ${pattern}`);
}

const dobPermitLookup = read('nyc-dob-permit-lookup.html');
assert.match(dobPermitLookup, /<title>NYC DOB Permit Lookup \| Weekly CSV Companion<\/title>/, 'DOB permit lookup page needs title');
assert.match(dobPermitLookup, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-permit-lookup\.html">/, 'DOB permit lookup page needs canonical');
assert.match(dobPermitLookup, /<meta property="og:title" content="NYC DOB Permit Lookup \| Weekly CSV Companion">/, 'DOB permit lookup page needs OG title');
assert.match(dobPermitLookup, /src="\/assets\/current-issue-snapshot\.png"/, 'DOB permit lookup page needs current issue snapshot image');
assert.match(dobPermitLookup, /"@type":"Product"/, 'DOB permit lookup page needs Product structured data');
assert.match(dobPermitLookup, /"@type":"Dataset"/, 'DOB permit lookup page needs Dataset structured data');
assert.match(dobPermitLookup, /"@type":"FAQPage"/, 'DOB permit lookup page needs FAQ structured data');
assert.match(dobPermitLookup, /"price":"9.50"/, 'DOB permit lookup page needs current price structured data');
assert.match(dobPermitLookup, /\/_vercel\/insights\/script\.js/, 'DOB permit lookup page needs Web Analytics script');
assert.match(dobPermitLookup, /NYC DOB permit lookup companion for weekly CSV screening/, 'DOB permit lookup page needs headline');
assert.match(dobPermitLookup, /Free preview rows: 25/, 'DOB permit lookup page needs free preview count');
assert.match(dobPermitLookup, /Paid ZIP rows: 142/, 'DOB permit lookup page needs paid row count');
assert.match(dobPermitLookup, /Top work types: Sidewalk Shed 40/, 'DOB permit lookup page needs work type mix');
assert.match(dobPermitLookup, /Top ZIPs: 10003 37/, 'DOB permit lookup page needs ZIP mix');
assert.match(dobPermitLookup, /Status mix: Permit Issued 141/, 'DOB permit lookup page needs status mix');
assert.match(dobPermitLookup, /No owner names, applicant names, phone numbers, email addresses, full street addresses/, 'DOB permit lookup page needs private-data boundary');
assert.match(dobPermitLookup, /href="\/current-issue\.html"/, 'DOB permit lookup page links current issue');
assert.match(dobPermitLookup, /href="\/dob-now-permit-search-alternative\.html"/, 'DOB permit lookup page links DOB NOW alternative');
assert.match(dobPermitLookup, /href="\/nyc-dob-permit-data-download\.html"/, 'DOB permit lookup page links data download page');
assert.match(dobPermitLookup, /href="\/nyc-dob-permit-csv\.html"/, 'DOB permit lookup page links permit CSV page');
assert.match(dobPermitLookup, /href="\/weekly-nyc-construction-permit-report\.html"/, 'DOB permit lookup page links weekly report page');
assert.match(dobPermitLookup, /href="\/sample-segments\.html"/, 'DOB permit lookup page links segment hub');
assert.match(dobPermitLookup, /href="\/permit-research-workflow\.html"/, 'DOB permit lookup page links research workflow');
assert.match(dobPermitLookup, /href="\/pricing\.html"/, 'DOB permit lookup page links pricing');
assert.match(dobPermitLookup, /href="\/support\.html"/, 'DOB permit lookup page links support');
assert.match(dobPermitLookup, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB permit lookup page links sample CSV');
assert.match(dobPermitLookup, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'DOB permit lookup page links sample JSON');
assert.match(dobPermitLookup, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'DOB permit lookup page links sample JSONL');
assert.match(dobPermitLookup, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'DOB permit lookup page links sample brief');
assert.match(dobPermitLookup, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-permit-lookup"/, 'DOB permit lookup page links tracked buy page');
assertSampleRequestForm(dobPermitLookup, 'DOB permit lookup page');
assert.match(dobPermitLookup, /No guaranteed leads\./, 'DOB permit lookup page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobPermitLookup, pattern, `nyc-dob-permit-lookup.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobPermitLookup, pattern, `nyc-dob-permit-lookup.html contains private data pattern ${pattern}`);
}

const dobApprovedPermits = read('nyc-dob-approved-permits.html');
assert.match(dobApprovedPermits, /<title>NYC DOB Approved Permits \| Weekly CSV Preview<\/title>/, 'DOB approved permits page needs title');
assert.match(dobApprovedPermits, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-approved-permits\.html">/, 'DOB approved permits page needs canonical');
assert.match(dobApprovedPermits, /<meta property="og:title" content="NYC DOB Approved Permits \| Weekly CSV Preview">/, 'DOB approved permits page needs OG title');
assert.match(dobApprovedPermits, /src="\/assets\/current-issue-snapshot\.png"/, 'DOB approved permits page needs current issue snapshot image');
assert.match(dobApprovedPermits, /"@type":"Product"/, 'DOB approved permits page needs Product structured data');
assert.match(dobApprovedPermits, /"@type":"Dataset"/, 'DOB approved permits page needs Dataset structured data');
assert.match(dobApprovedPermits, /"@type":"FAQPage"/, 'DOB approved permits page needs FAQ structured data');
assert.match(dobApprovedPermits, /"price":"9.50"/, 'DOB approved permits page needs current price structured data');
assert.match(dobApprovedPermits, /\/_vercel\/insights\/script\.js/, 'DOB approved permits page needs Web Analytics script');
assert.match(dobApprovedPermits, /NYC DOB approved permits packaged for weekly CSV review/, 'DOB approved permits page needs headline');
assert.match(dobApprovedPermits, /NYC DOB NOW: Build - Approved Permits/, 'DOB approved permits page names source dataset');
assert.match(dobApprovedPermits, /Free preview rows: 25/, 'DOB approved permits page needs free preview count');
assert.match(dobApprovedPermits, /Paid ZIP rows: 142/, 'DOB approved permits page needs paid row count');
assert.match(dobApprovedPermits, /Borough mix: Manhattan 74/, 'DOB approved permits page needs borough mix');
assert.match(dobApprovedPermits, /Top ZIPs: 10003 37/, 'DOB approved permits page needs ZIP mix');
assert.match(dobApprovedPermits, /Top work types: Sidewalk Shed 40/, 'DOB approved permits page needs work type mix');
assert.match(dobApprovedPermits, /Status mix: Permit Issued 141/, 'DOB approved permits page needs status mix');
assert.match(dobApprovedPermits, /No owner names, applicant names, phone numbers, email addresses, full street addresses/, 'DOB approved permits page needs private-data boundary');
assert.match(dobApprovedPermits, /href="\/current-issue\.html"/, 'DOB approved permits page links current issue');
assert.match(dobApprovedPermits, /href="\/nyc-dob-permit-search\.html"/, 'DOB approved permits page links DOB permit search page');
assert.match(dobApprovedPermits, /href="\/dob-now-permit-search-alternative\.html"/, 'DOB approved permits page links DOB NOW alternative');
assert.match(dobApprovedPermits, /href="\/nyc-dob-permit-data-download\.html"/, 'DOB approved permits page links data download page');
assert.match(dobApprovedPermits, /href="\/nyc-dob-permit-csv\.html"/, 'DOB approved permits page links permit CSV page');
assert.match(dobApprovedPermits, /href="\/weekly-nyc-construction-permit-report\.html"/, 'DOB approved permits page links weekly report page');
assert.match(dobApprovedPermits, /href="\/sample-segments\.html"/, 'DOB approved permits page links segment hub');
assert.match(dobApprovedPermits, /href="\/permit-research-workflow\.html"/, 'DOB approved permits page links research workflow');
assert.match(dobApprovedPermits, /href="\/pricing\.html"/, 'DOB approved permits page links pricing');
assert.match(dobApprovedPermits, /href="\/support\.html"/, 'DOB approved permits page links support');
assert.match(dobApprovedPermits, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB approved permits page links sample CSV');
assert.match(dobApprovedPermits, /href="\/sample\/nyc-construction-activity-preview\.json"/, 'DOB approved permits page links sample JSON');
assert.match(dobApprovedPermits, /href="\/sample\/nyc-construction-activity-preview\.jsonl"/, 'DOB approved permits page links sample JSONL');
assert.match(dobApprovedPermits, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'DOB approved permits page links sample brief');
assert.match(dobApprovedPermits, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-approved-permits"/, 'DOB approved permits page links tracked buy page');
assertSampleRequestForm(dobApprovedPermits, 'DOB approved permits page');
assert.match(dobApprovedPermits, /No guaranteed leads\./, 'DOB approved permits page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobApprovedPermits, pattern, `nyc-dob-approved-permits.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobApprovedPermits, pattern, `nyc-dob-approved-permits.html contains private data pattern ${pattern}`);
}

const dobNowApprovedPermits = read('nyc-dob-now-approved-permits.html');
assert.match(dobNowApprovedPermits, /<title>NYC DOB NOW Approved Permits \| Weekly CSV<\/title>/, 'DOB NOW approved permits page needs title');
assert.match(dobNowApprovedPermits, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-dob-now-approved-permits\.html">/, 'DOB NOW approved permits page needs canonical');
assert.match(dobNowApprovedPermits, /<meta property="og:title" content="NYC DOB NOW Approved Permits \| Weekly CSV">/, 'DOB NOW approved permits page needs OG title');
assert.match(dobNowApprovedPermits, /"@type":"Product"/, 'DOB NOW approved permits page needs Product structured data');
assert.match(dobNowApprovedPermits, /"@type":"Dataset"/, 'DOB NOW approved permits page needs Dataset structured data');
assert.match(dobNowApprovedPermits, /"@type":"FAQPage"/, 'DOB NOW approved permits page needs FAQ structured data');
assert.match(dobNowApprovedPermits, /"price":"9.50"/, 'DOB NOW approved permits page needs current price structured data');
assert.match(dobNowApprovedPermits, /\/_vercel\/insights\/script\.js/, 'DOB NOW approved permits page needs Web Analytics script');
assert.match(dobNowApprovedPermits, /NYC DOB NOW approved permits packaged for weekly CSV review/, 'DOB NOW approved permits page needs headline');
assert.match(dobNowApprovedPermits, /NYC DOB NOW: Build - Approved Permits/, 'DOB NOW approved permits page names source dataset');
assert.match(dobNowApprovedPermits, /Free preview rows: 25/, 'DOB NOW approved permits page needs free preview count');
assert.match(dobNowApprovedPermits, /Paid ZIP rows: 142/, 'DOB NOW approved permits page needs paid row count');
assert.match(dobNowApprovedPermits, /Borough mix: Manhattan 74/, 'DOB NOW approved permits page needs borough mix');
assert.match(dobNowApprovedPermits, /Top ZIPs: 10003 37/, 'DOB NOW approved permits page needs ZIP mix');
assert.match(dobNowApprovedPermits, /Top work types: Sidewalk Shed 40/, 'DOB NOW approved permits page needs work type mix');
assert.match(dobNowApprovedPermits, /Status mix: Permit Issued 141/, 'DOB NOW approved permits page needs status mix');
assert.match(dobNowApprovedPermits, /No owner names, applicant names, phone numbers, email addresses, full street addresses/, 'DOB NOW approved permits page needs private-data boundary');
assert.match(dobNowApprovedPermits, /href="\/nyc-dob-permit-search\.html"/, 'DOB NOW approved permits page links DOB permit search page');
assert.match(dobNowApprovedPermits, /href="\/dob-now-permit-search-alternative\.html"/, 'DOB NOW approved permits page links DOB NOW alternative');
assert.match(dobNowApprovedPermits, /href="\/nyc-dob-permit-data-download\.html"/, 'DOB NOW approved permits page links data download page');
assert.match(dobNowApprovedPermits, /href="\/nyc-dob-permit-csv\.html"/, 'DOB NOW approved permits page links permit CSV page');
assert.match(dobNowApprovedPermits, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB NOW approved permits page links sample CSV');
assert.match(dobNowApprovedPermits, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=nyc-dob-now-approved-permits"/, 'DOB NOW approved permits page links tracked buy page');
assertSampleRequestForm(dobNowApprovedPermits, 'DOB NOW approved permits page');
assertConversionBar(dobNowApprovedPermits, 'DOB NOW approved permits page', 'nyc-dob-now-approved-permits-sticky');
assert.match(dobNowApprovedPermits, /No guaranteed leads\./, 'DOB NOW approved permits page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobNowApprovedPermits, pattern, `nyc-dob-now-approved-permits.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobNowApprovedPermits, pattern, `nyc-dob-now-approved-permits.html contains private data pattern ${pattern}`);
}

const dobNowBuildApprovedPermits = read('dob-now-build-approved-permits.html');
assert.match(dobNowBuildApprovedPermits, /<title>DOB NOW Build Approved Permits \| NYC CSV<\/title>/, 'DOB NOW Build approved permits page needs title');
assert.match(dobNowBuildApprovedPermits, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/dob-now-build-approved-permits\.html">/, 'DOB NOW Build approved permits page needs canonical');
assert.match(dobNowBuildApprovedPermits, /<meta property="og:title" content="DOB NOW Build Approved Permits \| NYC CSV">/, 'DOB NOW Build approved permits page needs OG title');
assert.match(dobNowBuildApprovedPermits, /"@type":"Product"/, 'DOB NOW Build approved permits page needs Product structured data');
assert.match(dobNowBuildApprovedPermits, /"@type":"Dataset"/, 'DOB NOW Build approved permits page needs Dataset structured data');
assert.match(dobNowBuildApprovedPermits, /"@type":"FAQPage"/, 'DOB NOW Build approved permits page needs FAQ structured data');
assert.match(dobNowBuildApprovedPermits, /"price":"9.50"/, 'DOB NOW Build approved permits page needs current price structured data');
assert.match(dobNowBuildApprovedPermits, /\/_vercel\/insights\/script\.js/, 'DOB NOW Build approved permits page needs Web Analytics script');
assert.match(dobNowBuildApprovedPermits, /DOB NOW: Build approved permits packaged for weekly CSV review/, 'DOB NOW Build approved permits page needs headline');
assert.match(dobNowBuildApprovedPermits, /NYC DOB NOW: Build - Approved Permits/, 'DOB NOW Build approved permits page names source dataset');
assert.match(dobNowBuildApprovedPermits, /Free preview rows: 25/, 'DOB NOW Build approved permits page needs free preview count');
assert.match(dobNowBuildApprovedPermits, /Paid ZIP rows: 142/, 'DOB NOW Build approved permits page needs paid row count');
assert.match(dobNowBuildApprovedPermits, /Borough mix: Manhattan 74/, 'DOB NOW Build approved permits page needs borough mix');
assert.match(dobNowBuildApprovedPermits, /Top ZIPs: 10003 37/, 'DOB NOW Build approved permits page needs ZIP mix');
assert.match(dobNowBuildApprovedPermits, /Top work types: Sidewalk Shed 40/, 'DOB NOW Build approved permits page needs work type mix');
assert.match(dobNowBuildApprovedPermits, /Status mix: Permit Issued 141/, 'DOB NOW Build approved permits page needs status mix');
assert.match(dobNowBuildApprovedPermits, /No owner names, applicant names, phone numbers, email addresses, full street addresses/, 'DOB NOW Build approved permits page needs private-data boundary');
assert.match(dobNowBuildApprovedPermits, /href="\/nyc-dob-permit-search\.html"/, 'DOB NOW Build approved permits page links DOB permit search page');
assert.match(dobNowBuildApprovedPermits, /href="\/dob-now-permit-search-alternative\.html"/, 'DOB NOW Build approved permits page links DOB NOW alternative');
assert.match(dobNowBuildApprovedPermits, /href="\/nyc-dob-permit-data-download\.html"/, 'DOB NOW Build approved permits page links data download page');
assert.match(dobNowBuildApprovedPermits, /href="\/nyc-dob-permit-csv\.html"/, 'DOB NOW Build approved permits page links permit CSV page');
assert.match(dobNowBuildApprovedPermits, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'DOB NOW Build approved permits page links sample CSV');
assert.match(dobNowBuildApprovedPermits, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=dob-now-build-approved-permits"/, 'DOB NOW Build approved permits page links tracked buy page');
assertSampleRequestForm(dobNowBuildApprovedPermits, 'DOB NOW Build approved permits page');
assertConversionBar(dobNowBuildApprovedPermits, 'DOB NOW Build approved permits page', 'dob-now-build-approved-permits-sticky');
assert.match(dobNowBuildApprovedPermits, /No guaranteed leads\./, 'DOB NOW Build approved permits page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobNowBuildApprovedPermits, pattern, `dob-now-build-approved-permits.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobNowBuildApprovedPermits, pattern, `dob-now-build-approved-permits.html contains private data pattern ${pattern}`);
}

const permitLeads = read('nyc-construction-permit-leads.html');
assert.match(permitLeads, /<title>NYC Construction Permit Leads \| Source-Linked Screening<\/title>/, 'permit leads page needs title');
assert.match(permitLeads, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-construction-permit-leads\.html">/, 'permit leads page needs canonical');
assert.match(permitLeads, /<meta property="og:title" content="NYC Construction Permit Leads \| Source-Linked Screening">/, 'permit leads page needs OG title');
assert.match(permitLeads, /src="\/assets\/current-issue-snapshot\.png"/, 'permit leads page needs current issue snapshot image');
assert.match(permitLeads, /"@type":"Product"/, 'permit leads page needs Product structured data');
assert.match(permitLeads, /"@type":"Dataset"/, 'permit leads page needs Dataset structured data');
assert.match(permitLeads, /"@type":"FAQPage"/, 'permit leads page needs FAQ structured data');
assert.match(permitLeads, /"price":"9.50"/, 'permit leads page needs current price structured data');
assert.match(permitLeads, /\/_vercel\/insights\/script\.js/, 'permit leads page needs Web Analytics script');
assert.match(permitLeads, /NYC construction permit leads alternative/, 'permit leads page needs headline');
assert.match(permitLeads, /Free preview rows: 25/, 'permit leads page needs free preview count');
assert.match(permitLeads, /Paid ZIP rows: 142/, 'permit leads page needs paid row count');
assert.match(permitLeads, /Top work types: Sidewalk Shed 40/, 'permit leads page needs work type mix');
assert.match(permitLeads, /Top ZIPs: 10003 37/, 'permit leads page needs ZIP mix');
assert.match(permitLeads, /No private contact data/, 'permit leads page needs contact boundary');
assert.match(permitLeads, /No lead scores/, 'permit leads page needs lead-score boundary');
assert.match(permitLeads, /href="\/current-issue\.html"/, 'permit leads page links current issue');
assert.match(permitLeads, /href="\/preview\.html"/, 'permit leads page links preview');
assert.match(permitLeads, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'permit leads page links sample CSV');
assert.match(permitLeads, /href="\/nyc-dob-permit-csv\.html"/, 'permit leads page links permit CSV page');
assert.match(permitLeads, /href="\/weekly-nyc-construction-permit-report\.html"/, 'permit leads page links weekly report page');
assert.match(permitLeads, /href="\/dob-now-permit-search-alternative\.html"/, 'permit leads page links DOB NOW alternative');
assert.match(permitLeads, /href="\/contractor-supplier-permit-research\.html"/, 'permit leads page links contractor supplier guide');
assert.match(permitLeads, /href="\/sample-segments\.html"/, 'permit leads page links segment hub');
assert.match(permitLeads, /href="\/permit-research-workflow\.html"/, 'permit leads page links research workflow');
assert.match(permitLeads, /href="\/inside-the-zip\.html"/, 'permit leads page links ZIP contents');
assert.match(permitLeads, /href="\/pricing\.html"/, 'permit leads page links pricing');
assert.match(permitLeads, /href="\/support\.html"/, 'permit leads page links support');
assert.match(permitLeads, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=permit-leads"/, 'permit leads page links tracked buy page');
assertSampleRequestForm(permitLeads, 'permit leads page');
assert.match(permitLeads, /No guaranteed leads\./, 'permit leads page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(permitLeads, pattern, `nyc-construction-permit-leads.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(permitLeads, pattern, `nyc-construction-permit-leads.html contains private data pattern ${pattern}`);
}

const zipActivity = read('nyc-permit-activity-by-zip.html');
assert.match(zipActivity, /<title>NYC Permit Activity by ZIP \| Current DOB Brief<\/title>/, 'ZIP activity page needs title');
assert.match(zipActivity, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-permit-activity-by-zip\.html">/, 'ZIP activity page needs canonical');
assert.match(zipActivity, /<meta property="og:title" content="NYC Permit Activity by ZIP \| Current DOB Brief">/, 'ZIP activity page needs OG title');
assert.match(zipActivity, /src="\/assets\/current-issue-snapshot\.png"/, 'ZIP activity page needs current issue snapshot image');
assert.match(zipActivity, /"@type":"Product"/, 'ZIP activity page needs Product structured data');
assert.match(zipActivity, /"@type":"Dataset"/, 'ZIP activity page needs Dataset structured data');
assert.match(zipActivity, /"@type":"FAQPage"/, 'ZIP activity page needs FAQ structured data');
assert.match(zipActivity, /"price":"9.50"/, 'ZIP activity page needs current price structured data');
assert.match(zipActivity, /\/_vercel\/insights\/script\.js/, 'ZIP activity page needs Web Analytics script');
assert.match(zipActivity, /NYC permit activity by ZIP in the current issue/, 'ZIP activity page needs headline');
assert.match(zipActivity, /ZIP codes covered/, 'ZIP activity page needs ZIP count card');
assert.match(zipActivity, /5 ZIP codes in the paid issue/, 'ZIP activity page needs current ZIP code count');
assert.match(zipActivity, /Free preview rows: 25/, 'ZIP activity page needs free preview count');
assert.match(zipActivity, /Paid ZIP rows: 142/, 'ZIP activity page needs paid row count');
assert.match(zipActivity, /Top ZIPs: 10003 37 \| 10011 37 \| 11201 26 \| 11206 22 \| 11211 20/, 'ZIP activity page needs top ZIP mix');
assert.match(zipActivity, /href="\/topics\/nyc-dob-permits-zip-10003\.html"/, 'ZIP activity page links 10003 slice');
assert.match(zipActivity, /href="\/topics\/nyc-dob-permits-zip-11201\.html"/, 'ZIP activity page links 11201 slice');
assert.match(zipActivity, /href="\/manhattan-construction-permit-activity\.html"/, 'ZIP activity page links Manhattan page');
assert.match(zipActivity, /href="\/brooklyn-construction-permit-activity\.html"/, 'ZIP activity page links Brooklyn page');
assert.match(zipActivity, /href="\/sample-segments\.html"/, 'ZIP activity page links segment hub');
assert.match(zipActivity, /href="\/pricing\.html"/, 'ZIP activity page links pricing');
assert.match(zipActivity, /href="\/support\.html"/, 'ZIP activity page links support');
assert.match(zipActivity, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=permit-activity-by-zip"/, 'ZIP activity page links tracked buy page');
assertSampleRequestForm(zipActivity, 'ZIP activity page');
assert.match(zipActivity, /No guaranteed leads\./, 'ZIP activity page keeps claims boundary visible');
assert.match(zipActivity, /This is not a live alert feed\./, 'ZIP activity page keeps alert boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(zipActivity, pattern, `nyc-permit-activity-by-zip.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(zipActivity, pattern, `nyc-permit-activity-by-zip.html contains private data pattern ${pattern}`);
}

const boroughLandingPages = [
  {
    path: 'manhattan-construction-permit-activity.html',
    title: 'Manhattan Construction Permit Activity | Current DOB Brief',
    headline: 'Manhattan construction permit activity in the current issue',
    rowText: 'Manhattan rows: 74',
    zipText: 'ZIP mix: 10003 37',
    workTypeText: 'Work type mix: Sidewalk Shed 23',
    topicHref: '/topics/manhattan-construction-permit-activity.html',
    checkoutSource: 'manhattan-permit-activity',
  },
  {
    path: 'brooklyn-construction-permit-activity.html',
    title: 'Brooklyn Construction Permit Activity | Current DOB Brief',
    headline: 'Brooklyn construction permit activity in the current issue',
    rowText: 'Brooklyn rows: 68',
    zipText: 'ZIP mix: 11201 26',
    workTypeText: 'Work type mix: Sidewalk Shed 17',
    topicHref: '/topics/brooklyn-construction-permit-activity.html',
    checkoutSource: 'brooklyn-permit-activity',
  },
];

for (const page of boroughLandingPages) {
  const html = read(page.path);
  const label = page.path.replace(/\.html$/, '');
  assert.match(html, new RegExp(`<title>${page.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/title>`), `${label} page needs title`);
  assert.match(html, new RegExp(`<link rel="canonical" href="${baseUrl}\\/${page.path.replace('.', '\\.')}">`), `${label} page needs canonical`);
  assert.match(html, new RegExp(`<meta property="og:title" content="${page.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), `${label} page needs OG title`);
  assert.match(html, /src="\/assets\/current-issue-snapshot\.png"/, `${label} page needs current issue snapshot image`);
  assert.match(html, /"@type":"Product"/, `${label} page needs Product structured data`);
  assert.match(html, /"@type":"Dataset"/, `${label} page needs Dataset structured data`);
  assert.match(html, /"@type":"FAQPage"/, `${label} page needs FAQ structured data`);
  assert.match(html, /"price":"9.50"/, `${label} page needs current price structured data`);
  assert.match(html, /\/_vercel\/insights\/script\.js/, `${label} page needs Web Analytics script`);
  assert.match(html, new RegExp(page.headline), `${label} page needs headline`);
  assert.match(html, /Free preview rows: 25/, `${label} page needs free preview count`);
  assert.match(html, /Paid ZIP rows: 142/, `${label} page needs paid row count`);
  assert.match(html, new RegExp(page.rowText), `${label} page needs borough row count`);
  assert.match(html, new RegExp(page.zipText), `${label} page needs ZIP mix`);
  assert.match(html, new RegExp(page.workTypeText), `${label} page needs work-type mix`);
  assert.match(html, new RegExp(`href="${page.topicHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `${label} page links topic page`);
  assert.match(html, /href="\/nyc-dob-permit-csv\.html"/, `${label} page links permit CSV page`);
  assert.match(html, /href="\/nyc-construction-permit-leads\.html"/, `${label} page links permit leads page`);
  assert.match(html, /href="\/weekly-nyc-construction-permit-report\.html"/, `${label} page links weekly report page`);
  assert.match(html, /href="\/sample-segments\.html"/, `${label} page links segment hub`);
  assert.match(html, /href="\/inside-the-zip\.html"/, `${label} page links ZIP contents`);
  assert.match(html, /href="\/pricing\.html"/, `${label} page links pricing`);
  assert.match(html, /href="\/support\.html"/, `${label} page links support`);
  assert.match(html, new RegExp(`href="${baseUrl}\\/buy\\.html\\?source=${page.checkoutSource}"`), `${label} page links tracked buy page`);
  assertSampleRequestForm(html, `${label} page`);
  assert.match(html, /No guaranteed leads\./, `${label} page keeps claims boundary visible`);
  for (const pattern of bannedCopyPatterns) {
    assert.doesNotMatch(html, pattern, `${page.path} contains banned copy pattern ${pattern}`);
  }
  for (const pattern of privateDataPatterns) {
    assert.doesNotMatch(html, pattern, `${page.path} contains private data pattern ${pattern}`);
  }
}

const sidewalkShedPermits = read('nyc-sidewalk-shed-permits.html');
assert.match(sidewalkShedPermits, /<title>NYC Sidewalk Shed Permits \| Current DOB Activity<\/title>/, 'sidewalk shed permits page needs title');
assert.match(sidewalkShedPermits, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-sidewalk-shed-permits\.html">/, 'sidewalk shed permits page needs canonical');
assert.match(sidewalkShedPermits, /<meta property="og:title" content="NYC Sidewalk Shed Permits \| Current DOB Activity">/, 'sidewalk shed permits page needs OG title');
assert.match(sidewalkShedPermits, /src="\/assets\/current-issue-snapshot\.png"/, 'sidewalk shed permits page needs current issue snapshot image');
assert.match(sidewalkShedPermits, /"@type":"Product"/, 'sidewalk shed permits page needs Product structured data');
assert.match(sidewalkShedPermits, /"@type":"Dataset"/, 'sidewalk shed permits page needs Dataset structured data');
assert.match(sidewalkShedPermits, /"@type":"FAQPage"/, 'sidewalk shed permits page needs FAQ structured data');
assert.match(sidewalkShedPermits, /"price":"9.50"/, 'sidewalk shed permits page needs current price structured data');
assert.match(sidewalkShedPermits, /\/_vercel\/insights\/script\.js/, 'sidewalk shed permits page needs Web Analytics script');
assert.match(sidewalkShedPermits, /NYC sidewalk shed permits in the current issue/, 'sidewalk shed permits page needs headline');
assert.match(sidewalkShedPermits, /Free preview rows: 25/, 'sidewalk shed permits page needs free preview count');
assert.match(sidewalkShedPermits, /Paid ZIP rows: 142/, 'sidewalk shed permits page needs paid row count');
assert.match(sidewalkShedPermits, /Sidewalk shed rows: 40/, 'sidewalk shed permits page needs sidewalk shed row count');
assert.match(sidewalkShedPermits, /Top ZIPs for sidewalk shed rows:/, 'sidewalk shed permits page needs ZIP mix');
assert.match(sidewalkShedPermits, /href="\/topics\/nyc-sidewalk-shed-permits\.html"/, 'sidewalk shed permits page links topic page');
assert.match(sidewalkShedPermits, /href="\/topics\/sidewalk-shed-contractor-permit-research-nyc\.html"/, 'sidewalk shed permits page links contractor topic page');
assert.match(sidewalkShedPermits, /href="\/nyc-construction-permit-leads\.html"/, 'sidewalk shed permits page links permit leads page');
assert.match(sidewalkShedPermits, /href="\/weekly-nyc-construction-permit-report\.html"/, 'sidewalk shed permits page links weekly report page');
assert.match(sidewalkShedPermits, /href="\/sample-segments\.html"/, 'sidewalk shed permits page links segment hub');
assert.match(sidewalkShedPermits, /href="\/inside-the-zip\.html"/, 'sidewalk shed permits page links ZIP contents');
assert.match(sidewalkShedPermits, /href="\/pricing\.html"/, 'sidewalk shed permits page links pricing');
assert.match(sidewalkShedPermits, /href="\/support\.html"/, 'sidewalk shed permits page links support');
assert.match(sidewalkShedPermits, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=sidewalk-shed-permits"/, 'sidewalk shed permits page links tracked buy page');
assertSampleRequestForm(sidewalkShedPermits, 'sidewalk shed permits page');
assert.match(sidewalkShedPermits, /No guaranteed leads\./, 'sidewalk shed permits page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(sidewalkShedPermits, pattern, `nyc-sidewalk-shed-permits.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(sidewalkShedPermits, pattern, `nyc-sidewalk-shed-permits.html contains private data pattern ${pattern}`);
}

const sidewalkShedPermitLeads = read('nyc-sidewalk-shed-permit-leads.html');
assert.match(sidewalkShedPermitLeads, /<title>NYC Sidewalk Shed Permit Leads \| Public DOB Signals<\/title>/, 'sidewalk shed permit leads page needs title');
assert.match(sidewalkShedPermitLeads, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-sidewalk-shed-permit-leads\.html">/, 'sidewalk shed permit leads page needs canonical');
assert.match(sidewalkShedPermitLeads, /<meta property="og:title" content="NYC Sidewalk Shed Permit Leads \| Public DOB Signals">/, 'sidewalk shed permit leads page needs OG title');
assert.match(sidewalkShedPermitLeads, /"@type":"Product"/, 'sidewalk shed permit leads page needs Product structured data');
assert.match(sidewalkShedPermitLeads, /"@type":"Dataset"/, 'sidewalk shed permit leads page needs Dataset structured data');
assert.match(sidewalkShedPermitLeads, /"@type":"FAQPage"/, 'sidewalk shed permit leads page needs FAQ structured data');
assert.match(sidewalkShedPermitLeads, /NYC sidewalk shed permit leads from public DOB signals/, 'sidewalk shed permit leads page needs headline');
assert.match(sidewalkShedPermitLeads, /Sidewalk shed rows: 40/, 'sidewalk shed permit leads page needs current sidewalk shed row count');
assert.match(sidewalkShedPermitLeads, /Top ZIPs for sidewalk shed rows:/, 'sidewalk shed permit leads page needs ZIP mix');
assert.match(sidewalkShedPermitLeads, /Use it for manual lead research/, 'sidewalk shed permit leads page needs use-case section');
assert.match(sidewalkShedPermitLeads, /This is a public-record screening file, not a finished lead list\./, 'sidewalk shed permit leads page keeps claims boundary visible');
assert.match(sidewalkShedPermitLeads, /href="\/nyc-sidewalk-shed-permits\.html"/, 'sidewalk shed permit leads page links sidewalk shed permits page');
assert.match(sidewalkShedPermitLeads, /href="\/topics\/nyc-sidewalk-shed-vendor-permit-research\.html"/, 'sidewalk shed permit leads page links vendor topic page');
assert.match(sidewalkShedPermitLeads, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'sidewalk shed permit leads page links CSV sample');
assert.match(sidewalkShedPermitLeads, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=sidewalk-shed-permit-leads"/, 'sidewalk shed permit leads page links tracked buy page');
assertSampleRequestForm(sidewalkShedPermitLeads, 'sidewalk shed permit leads page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(sidewalkShedPermitLeads, pattern, `nyc-sidewalk-shed-permit-leads.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(sidewalkShedPermitLeads, pattern, `nyc-sidewalk-shed-permit-leads.html contains private data pattern ${pattern}`);
}

const supportedScaffoldPermitLeads = read('nyc-supported-scaffold-permit-leads.html');
assert.match(supportedScaffoldPermitLeads, /<title>NYC Supported Scaffold Permit Leads \| Public DOB Signals<\/title>/, 'supported scaffold permit leads page needs title');
assert.match(supportedScaffoldPermitLeads, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-supported-scaffold-permit-leads\.html">/, 'supported scaffold permit leads page needs canonical');
assert.match(supportedScaffoldPermitLeads, /<meta property="og:title" content="NYC Supported Scaffold Permit Leads \| Public DOB Signals">/, 'supported scaffold permit leads page needs OG title');
assert.match(supportedScaffoldPermitLeads, /"@type":"Product"/, 'supported scaffold permit leads page needs Product structured data');
assert.match(supportedScaffoldPermitLeads, /"@type":"Dataset"/, 'supported scaffold permit leads page needs Dataset structured data');
assert.match(supportedScaffoldPermitLeads, /"@type":"FAQPage"/, 'supported scaffold permit leads page needs FAQ structured data');
assert.match(supportedScaffoldPermitLeads, /NYC supported scaffold permit leads from public DOB signals/, 'supported scaffold permit leads page needs headline');
assert.match(supportedScaffoldPermitLeads, /Supported scaffold rows: 13/, 'supported scaffold permit leads page needs current supported scaffold row count');
assert.match(supportedScaffoldPermitLeads, /Top ZIPs for supported scaffold rows:/, 'supported scaffold permit leads page needs ZIP mix');
assert.match(supportedScaffoldPermitLeads, /Use it for manual lead research/, 'supported scaffold permit leads page needs use-case section');
assert.match(supportedScaffoldPermitLeads, /This is a public-record screening file, not a finished lead list\./, 'supported scaffold permit leads page keeps claims boundary visible');
assert.match(supportedScaffoldPermitLeads, /href="\/nyc-supported-scaffold-permits\.html"/, 'supported scaffold permit leads page links supported scaffold permits page');
assert.match(supportedScaffoldPermitLeads, /href="\/topics\/supported-scaffold-contractor-permit-research-nyc\.html"/, 'supported scaffold permit leads page links contractor topic page');
assert.match(supportedScaffoldPermitLeads, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'supported scaffold permit leads page links CSV sample');
assert.match(supportedScaffoldPermitLeads, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=supported-scaffold-permit-leads"/, 'supported scaffold permit leads page links tracked buy page');
assertSampleRequestForm(supportedScaffoldPermitLeads, 'supported scaffold permit leads page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(supportedScaffoldPermitLeads, pattern, `nyc-supported-scaffold-permit-leads.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(supportedScaffoldPermitLeads, pattern, `nyc-supported-scaffold-permit-leads.html contains private data pattern ${pattern}`);
}

const plumbingPermitLeads = read('nyc-plumbing-permit-leads.html');
assert.match(plumbingPermitLeads, /<title>NYC Plumbing Permit Leads \| Public DOB Signals<\/title>/, 'plumbing permit leads page needs title');
assert.match(plumbingPermitLeads, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-plumbing-permit-leads\.html">/, 'plumbing permit leads page needs canonical');
assert.match(plumbingPermitLeads, /<meta property="og:title" content="NYC Plumbing Permit Leads \| Public DOB Signals">/, 'plumbing permit leads page needs OG title');
assert.match(plumbingPermitLeads, /"@type":"Product"/, 'plumbing permit leads page needs Product structured data');
assert.match(plumbingPermitLeads, /"@type":"Dataset"/, 'plumbing permit leads page needs Dataset structured data');
assert.match(plumbingPermitLeads, /"@type":"FAQPage"/, 'plumbing permit leads page needs FAQ structured data');
assert.match(plumbingPermitLeads, /NYC plumbing permit leads from public DOB signals/, 'plumbing permit leads page needs headline');
assert.match(plumbingPermitLeads, /Plumbing rows: 29/, 'plumbing permit leads page needs current plumbing row count');
assert.match(plumbingPermitLeads, /Top ZIPs for plumbing rows:/, 'plumbing permit leads page needs ZIP mix');
assert.match(plumbingPermitLeads, /Use it for manual lead research/, 'plumbing permit leads page needs use-case section');
assert.match(plumbingPermitLeads, /This is a public-record screening file, not a finished lead list\./, 'plumbing permit leads page keeps claims boundary visible');
assert.match(plumbingPermitLeads, /href="\/nyc-plumbing-permits\.html"/, 'plumbing permit leads page links plumbing permits page');
assert.match(plumbingPermitLeads, /href="\/topics\/plumbing-contractor-permit-research-nyc\.html"/, 'plumbing permit leads page links contractor topic page');
assert.match(plumbingPermitLeads, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'plumbing permit leads page links CSV sample');
assert.match(plumbingPermitLeads, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=plumbing-permit-leads"/, 'plumbing permit leads page links tracked buy page');
assertSampleRequestForm(plumbingPermitLeads, 'plumbing permit leads page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(plumbingPermitLeads, pattern, `nyc-plumbing-permit-leads.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(plumbingPermitLeads, pattern, `nyc-plumbing-permit-leads.html contains private data pattern ${pattern}`);
}

const sprinklerPermitLeads = read('nyc-sprinkler-permit-leads.html');
assert.match(sprinklerPermitLeads, /<title>NYC Sprinkler Permit Leads \| Public DOB Signals<\/title>/, 'sprinkler permit leads page needs title');
assert.match(sprinklerPermitLeads, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-sprinkler-permit-leads\.html">/, 'sprinkler permit leads page needs canonical');
assert.match(sprinklerPermitLeads, /<meta property="og:title" content="NYC Sprinkler Permit Leads \| Public DOB Signals">/, 'sprinkler permit leads page needs OG title');
assert.match(sprinklerPermitLeads, /"@type":"Product"/, 'sprinkler permit leads page needs Product structured data');
assert.match(sprinklerPermitLeads, /"@type":"Dataset"/, 'sprinkler permit leads page needs Dataset structured data');
assert.match(sprinklerPermitLeads, /"@type":"FAQPage"/, 'sprinkler permit leads page needs FAQ structured data');
assert.match(sprinklerPermitLeads, /NYC sprinkler permit leads from public DOB signals/, 'sprinkler permit leads page needs headline');
assert.match(sprinklerPermitLeads, /Sprinkler rows: 21/, 'sprinkler permit leads page needs current sprinkler row count');
assert.match(sprinklerPermitLeads, /Top ZIPs for sprinkler rows:/, 'sprinkler permit leads page needs ZIP mix');
assert.match(sprinklerPermitLeads, /Use it for manual lead research/, 'sprinkler permit leads page needs use-case section');
assert.match(sprinklerPermitLeads, /This is a public-record screening file, not a finished lead list\./, 'sprinkler permit leads page keeps claims boundary visible');
assert.match(sprinklerPermitLeads, /href="\/nyc-sprinkler-permits\.html"/, 'sprinkler permit leads page links sprinkler permits page');
assert.match(sprinklerPermitLeads, /href="\/topics\/sprinkler-contractor-permit-research-nyc\.html"/, 'sprinkler permit leads page links contractor topic page');
assert.match(sprinklerPermitLeads, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'sprinkler permit leads page links CSV sample');
assert.match(sprinklerPermitLeads, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=sprinkler-permit-leads"/, 'sprinkler permit leads page links tracked buy page');
assertSampleRequestForm(sprinklerPermitLeads, 'sprinkler permit leads page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(sprinklerPermitLeads, pattern, `nyc-sprinkler-permit-leads.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(sprinklerPermitLeads, pattern, `nyc-sprinkler-permit-leads.html contains private data pattern ${pattern}`);
}

const tradePermitLeadPages = [
  {
    file: 'nyc-mechanical-systems-permit-leads.html',
    label: 'mechanical systems',
    title: 'NYC Mechanical Systems Permit Leads | Public DOB Signals',
    rowText: 'Mechanical Systems rows: 18',
    permitsHref: '/nyc-mechanical-systems-permits.html',
    topicHref: '/topics/nyc-mechanical-systems-permit-csv-sample.html',
    source: 'mechanical-systems-permit-leads',
  },
  {
    file: 'nyc-structural-permit-leads.html',
    label: 'structural',
    title: 'NYC Structural Permit Leads | Public DOB Signals',
    rowText: 'Structural rows: 12',
    permitsHref: '/nyc-structural-permits.html',
    topicHref: '/topics/nyc-structural-permit-activity.html',
    source: 'structural-permit-leads',
  },
  {
    file: 'nyc-construction-fence-permit-leads.html',
    label: 'construction fence',
    title: 'NYC Construction Fence Permit Leads | Public DOB Signals',
    rowText: 'Construction Fence rows: 9',
    permitsHref: '/nyc-construction-fence-permits.html',
    topicHref: '/topics/nyc-construction-fence-permits.html',
    source: 'construction-fence-permit-leads',
  },
];

for (const page of tradePermitLeadPages) {
  const html = read(page.file);
  assert.match(html, new RegExp(`<title>${page.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/title>`), `${page.file} needs title`);
  assert.match(html, new RegExp(`<link rel="canonical" href="${baseUrl}\\/${page.file}">`), `${page.file} needs canonical`);
  assert.match(html, /"@type":"Product"/, `${page.file} needs Product structured data`);
  assert.match(html, /"@type":"Dataset"/, `${page.file} needs Dataset structured data`);
  assert.match(html, /"@type":"FAQPage"/, `${page.file} needs FAQ structured data`);
  assert.match(html, new RegExp(`NYC ${page.label} permit leads from public DOB signals`), `${page.file} needs headline`);
  assert.match(html, new RegExp(page.rowText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${page.file} needs current row count`);
  assert.match(html, new RegExp(`Top ZIPs for ${page.label} rows:`), `${page.file} needs ZIP mix`);
  assert.match(html, /Use it for manual lead research/, `${page.file} needs use-case section`);
  assert.match(html, /This is a public-record screening file, not a finished lead list\./, `${page.file} keeps claims boundary visible`);
  assert.match(html, new RegExp(`href="${page.permitsHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `${page.file} links permit page`);
  assert.match(html, new RegExp(`href="${page.topicHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `${page.file} links topic page`);
  assert.match(html, /href="\/sample\/nyc-construction-activity-preview\.csv"/, `${page.file} links CSV sample`);
  assert.match(html, new RegExp(`href="${baseUrl}\\/buy\\.html\\?source=${page.source}"`), `${page.file} links tracked buy page`);
  assertSampleRequestForm(html, page.file);
  for (const pattern of bannedCopyPatterns) {
    assert.doesNotMatch(html, pattern, `${page.file} contains banned copy pattern ${pattern}`);
  }
  for (const pattern of privateDataPatterns) {
    assert.doesNotMatch(html, pattern, `${page.file} contains private data pattern ${pattern}`);
  }
}

const plumbingPermits = read('nyc-plumbing-permits.html');
assert.match(plumbingPermits, /<title>NYC Plumbing Permits \| Current DOB Activity<\/title>/, 'plumbing permits page needs title');
assert.match(plumbingPermits, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-plumbing-permits\.html">/, 'plumbing permits page needs canonical');
assert.match(plumbingPermits, /<meta property="og:title" content="NYC Plumbing Permits \| Current DOB Activity">/, 'plumbing permits page needs OG title');
assert.match(plumbingPermits, /src="\/assets\/current-issue-snapshot\.png"/, 'plumbing permits page needs current issue snapshot image');
assert.match(plumbingPermits, /"@type":"Product"/, 'plumbing permits page needs Product structured data');
assert.match(plumbingPermits, /"@type":"Dataset"/, 'plumbing permits page needs Dataset structured data');
assert.match(plumbingPermits, /"@type":"FAQPage"/, 'plumbing permits page needs FAQ structured data');
assert.match(plumbingPermits, /"price":"9.50"/, 'plumbing permits page needs current price structured data');
assert.match(plumbingPermits, /\/_vercel\/insights\/script\.js/, 'plumbing permits page needs Web Analytics script');
assert.match(plumbingPermits, /NYC plumbing permits in the current issue/, 'plumbing permits page needs headline');
assert.match(plumbingPermits, /Free preview rows: 25/, 'plumbing permits page needs free preview count');
assert.match(plumbingPermits, /Paid ZIP rows: 142/, 'plumbing permits page needs paid row count');
assert.match(plumbingPermits, /Plumbing rows: 29/, 'plumbing permits page needs plumbing row count');
assert.match(plumbingPermits, /Top ZIPs for plumbing rows:/, 'plumbing permits page needs ZIP mix');
assert.match(plumbingPermits, /href="\/topics\/nyc-plumbing-permit-activity\.html"/, 'plumbing permits page links topic page');
assert.match(plumbingPermits, /href="\/topics\/plumbing-contractor-permit-research-nyc\.html"/, 'plumbing permits page links contractor topic page');
assert.match(plumbingPermits, /href="\/nyc-construction-permit-leads\.html"/, 'plumbing permits page links permit leads page');
assert.match(plumbingPermits, /href="\/weekly-nyc-construction-permit-report\.html"/, 'plumbing permits page links weekly report page');
assert.match(plumbingPermits, /href="\/sample-segments\.html"/, 'plumbing permits page links segment hub');
assert.match(plumbingPermits, /href="\/inside-the-zip\.html"/, 'plumbing permits page links ZIP contents');
assert.match(plumbingPermits, /href="\/pricing\.html"/, 'plumbing permits page links pricing');
assert.match(plumbingPermits, /href="\/support\.html"/, 'plumbing permits page links support');
assert.match(plumbingPermits, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=plumbing-permits"/, 'plumbing permits page links tracked buy page');
assertSampleRequestForm(plumbingPermits, 'plumbing permits page');
assert.match(plumbingPermits, /No guaranteed leads\./, 'plumbing permits page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(plumbingPermits, pattern, `nyc-plumbing-permits.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(plumbingPermits, pattern, `nyc-plumbing-permits.html contains private data pattern ${pattern}`);
}

const sprinklerPermits = read('nyc-sprinkler-permits.html');
assert.match(sprinklerPermits, /<title>NYC Sprinkler Permits \| Current DOB Activity<\/title>/, 'sprinkler permits page needs title');
assert.match(sprinklerPermits, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/nyc-sprinkler-permits\.html">/, 'sprinkler permits page needs canonical');
assert.match(sprinklerPermits, /<meta property="og:title" content="NYC Sprinkler Permits \| Current DOB Activity">/, 'sprinkler permits page needs OG title');
assert.match(sprinklerPermits, /src="\/assets\/current-issue-snapshot\.png"/, 'sprinkler permits page needs current issue snapshot image');
assert.match(sprinklerPermits, /"@type":"Product"/, 'sprinkler permits page needs Product structured data');
assert.match(sprinklerPermits, /"@type":"Dataset"/, 'sprinkler permits page needs Dataset structured data');
assert.match(sprinklerPermits, /"@type":"FAQPage"/, 'sprinkler permits page needs FAQ structured data');
assert.match(sprinklerPermits, /"price":"9.50"/, 'sprinkler permits page needs current price structured data');
assert.match(sprinklerPermits, /\/_vercel\/insights\/script\.js/, 'sprinkler permits page needs Web Analytics script');
assert.match(sprinklerPermits, /NYC sprinkler permits in the current issue/, 'sprinkler permits page needs headline');
assert.match(sprinklerPermits, /Free preview rows: 25/, 'sprinkler permits page needs free preview count');
assert.match(sprinklerPermits, /Paid ZIP rows: 142/, 'sprinkler permits page needs paid row count');
assert.match(sprinklerPermits, /Sprinkler rows: 21/, 'sprinkler permits page needs sprinkler row count');
assert.match(sprinklerPermits, /Top ZIPs for sprinkler rows:/, 'sprinkler permits page needs ZIP mix');
assert.match(sprinklerPermits, /href="\/topics\/nyc-sprinkler-permit-activity\.html"/, 'sprinkler permits page links topic page');
assert.match(sprinklerPermits, /href="\/topics\/sprinkler-contractor-permit-research-nyc\.html"/, 'sprinkler permits page links contractor topic page');
assert.match(sprinklerPermits, /href="\/nyc-construction-permit-leads\.html"/, 'sprinkler permits page links permit leads page');
assert.match(sprinklerPermits, /href="\/weekly-nyc-construction-permit-report\.html"/, 'sprinkler permits page links weekly report page');
assert.match(sprinklerPermits, /href="\/sample-segments\.html"/, 'sprinkler permits page links segment hub');
assert.match(sprinklerPermits, /href="\/inside-the-zip\.html"/, 'sprinkler permits page links ZIP contents');
assert.match(sprinklerPermits, /href="\/pricing\.html"/, 'sprinkler permits page links pricing');
assert.match(sprinklerPermits, /href="\/support\.html"/, 'sprinkler permits page links support');
assert.match(sprinklerPermits, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=sprinkler-permits"/, 'sprinkler permits page links tracked buy page');
assertSampleRequestForm(sprinklerPermits, 'sprinkler permits page');
assert.match(sprinklerPermits, /No guaranteed leads\./, 'sprinkler permits page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(sprinklerPermits, pattern, `nyc-sprinkler-permits.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(sprinklerPermits, pattern, `nyc-sprinkler-permits.html contains private data pattern ${pattern}`);
}

const workTypeLandingPages = [
  {
    path: 'nyc-mechanical-systems-permits.html',
    title: 'NYC Mechanical Systems Permits | Current DOB Activity',
    headline: 'NYC mechanical systems permits in the current issue',
    rowText: 'Mechanical systems rows: 18',
    zipHeading: 'Top ZIPs for mechanical systems rows:',
    topicHref: '/topics/nyc-mechanical-permit-activity.html',
    contractorHref: '/topics/mechanical-systems-contractor-permit-research-nyc.html',
    checkoutSource: 'mechanical-systems-permits',
  },
  {
    path: 'nyc-supported-scaffold-permits.html',
    title: 'NYC Supported Scaffold Permits | Current DOB Activity',
    headline: 'NYC supported scaffold permits in the current issue',
    rowText: 'Supported scaffold rows: 13',
    zipHeading: 'Top ZIPs for supported scaffold rows:',
    topicHref: '/topics/nyc-supported-scaffold-permits.html',
    contractorHref: '/topics/supported-scaffold-contractor-permit-research-nyc.html',
    checkoutSource: 'supported-scaffold-permits',
  },
  {
    path: 'nyc-structural-permits.html',
    title: 'NYC Structural Permits | Current DOB Activity',
    headline: 'NYC structural permits in the current issue',
    rowText: 'Structural rows: 12',
    zipHeading: 'Top ZIPs for structural rows:',
    topicHref: '/topics/nyc-structural-permit-activity.html',
    contractorHref: '/topics/structural-contractor-permit-research-nyc.html',
    checkoutSource: 'structural-permits',
  },
  {
    path: 'nyc-construction-fence-permits.html',
    title: 'NYC Construction Fence Permits | Current DOB Activity',
    headline: 'NYC construction fence permits in the current issue',
    rowText: 'Construction fence rows: 9',
    zipHeading: 'Top ZIPs for construction fence rows:',
    topicHref: '/topics/nyc-construction-fence-permits.html',
    contractorHref: '/topics/construction-fence-contractor-permit-research-nyc.html',
    checkoutSource: 'construction-fence-permits',
  },
];

for (const page of workTypeLandingPages) {
  const html = read(page.path);
  const label = page.path.replace(/\.html$/, '');
  assert.match(html, new RegExp(`<title>${page.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/title>`), `${label} page needs title`);
  assert.match(html, new RegExp(`<link rel="canonical" href="${baseUrl}\\/${page.path.replace('.', '\\.')}">`), `${label} page needs canonical`);
  assert.match(html, new RegExp(`<meta property="og:title" content="${page.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), `${label} page needs OG title`);
  assert.match(html, /src="\/assets\/current-issue-snapshot\.png"/, `${label} page needs current issue snapshot image`);
  assert.match(html, /"@type":"Product"/, `${label} page needs Product structured data`);
  assert.match(html, /"@type":"Dataset"/, `${label} page needs Dataset structured data`);
  assert.match(html, /"@type":"FAQPage"/, `${label} page needs FAQ structured data`);
  assert.match(html, /"price":"9.50"/, `${label} page needs current price structured data`);
  assert.match(html, /\/_vercel\/insights\/script\.js/, `${label} page needs Web Analytics script`);
  assert.match(html, new RegExp(page.headline), `${label} page needs headline`);
  assert.match(html, /Free preview rows: 25/, `${label} page needs free preview count`);
  assert.match(html, /Paid ZIP rows: 142/, `${label} page needs paid row count`);
  assert.match(html, new RegExp(page.rowText), `${label} page needs work-type row count`);
  assert.match(html, new RegExp(page.zipHeading), `${label} page needs ZIP mix`);
  assert.match(html, new RegExp(`href="${page.topicHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `${label} page links topic page`);
  assert.match(html, new RegExp(`href="${page.contractorHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `${label} page links contractor topic page`);
  assert.match(html, /href="\/nyc-construction-permit-leads\.html"/, `${label} page links permit leads page`);
  assert.match(html, /href="\/weekly-nyc-construction-permit-report\.html"/, `${label} page links weekly report page`);
  assert.match(html, /href="\/sample-segments\.html"/, `${label} page links segment hub`);
  assert.match(html, /href="\/inside-the-zip\.html"/, `${label} page links ZIP contents`);
  assert.match(html, /href="\/pricing\.html"/, `${label} page links pricing`);
  assert.match(html, /href="\/support\.html"/, `${label} page links support`);
  assert.match(html, new RegExp(`href="${baseUrl}\\/buy\\.html\\?source=${page.checkoutSource}"`), `${label} page links tracked buy page`);
  assertSampleRequestForm(html, `${label} page`);
  assert.match(html, /No guaranteed leads\./, `${label} page keeps claims boundary visible`);
  for (const pattern of bannedCopyPatterns) {
    assert.doesNotMatch(html, pattern, `${page.path} contains banned copy pattern ${pattern}`);
  }
  for (const pattern of privateDataPatterns) {
    assert.doesNotMatch(html, pattern, `${page.path} contains private data pattern ${pattern}`);
  }
}

const faqPage = read('faq.html');
assert.match(faqPage, /<title>FAQ \| NYC Construction Activity Brief<\/title>/, 'FAQ page needs title');
assert.match(faqPage, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/faq\.html">/, 'FAQ page needs canonical');
assert.match(faqPage, /<meta property="og:title" content="FAQ \| NYC Construction Activity Brief">/, 'FAQ page needs OG title');
assert.match(faqPage, /src="\/assets\/current-issue-snapshot\.png"/, 'FAQ page needs current issue snapshot image');
assert.match(faqPage, /"@type":"Product"/, 'FAQ page needs Product structured data');
assert.match(faqPage, /"@type":"FAQPage"/, 'FAQ page needs FAQ structured data');
assert.match(faqPage, /"price":"9.50"/, 'FAQ page needs current price structured data');
assert.match(faqPage, /Questions buyers ask before checkout/, 'FAQ page needs buyer-focused headline');
assert.match(faqPage, /Payment and delivery/, 'FAQ page needs payment and delivery section');
assert.match(faqPage, /Files and preview/, 'FAQ page needs files and preview section');
assert.match(faqPage, /Source and privacy boundary/, 'FAQ page needs source and privacy section');
assert.match(faqPage, /Stripe redirects the completed Checkout Session/, 'FAQ page needs Stripe delivery copy');
assert.match(faqPage, /No\. Delivery is an instant browser download/, 'FAQ page must not promise email delivery');
assert.match(faqPage, /excludes owner names, applicant names, phone numbers, email addresses, full street addresses, and enriched contact data/, 'FAQ page needs privacy boundary');
assert.match(faqPage, /does not guarantee leads, buying intent, project value, or sales outcomes/, 'FAQ page needs claims boundary');
assert.match(faqPage, /href="\/preview\.html"/, 'FAQ page links preview');
assert.match(faqPage, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'FAQ page links sample CSV');
assert.match(faqPage, /href="\/sample-segments\.html"/, 'FAQ page links segment hub');
assert.match(faqPage, /href="\/free-vs-paid\.html"/, 'FAQ page links free vs paid');
assert.match(faqPage, /href="\/inside-the-zip\.html"/, 'FAQ page links inside ZIP');
assert.match(faqPage, /href="\/delivery\.html"/, 'FAQ page links delivery');
assert.match(faqPage, /href="\/support\.html"/, 'FAQ page links support');
assert.match(faqPage, new RegExp(`href="${purchaseUrl}"`), 'FAQ page links tracked buy page');
assertSampleRequestForm(faqPage, 'FAQ page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(faqPage, pattern, `faq.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(faqPage, pattern, `faq.html contains private data pattern ${pattern}`);
}

const freeVsPaid = read('free-vs-paid.html');
assert.match(freeVsPaid, /<title>Free Preview vs Paid ZIP \| NYC Construction Brief<\/title>/, 'free vs paid page needs title');
assert.match(freeVsPaid, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/free-vs-paid\.html">/, 'free vs paid page needs canonical');
assert.match(freeVsPaid, /<meta property="og:title" content="Free Preview vs Paid ZIP \| NYC Construction Brief">/, 'free vs paid page needs OG title');
assert.match(freeVsPaid, /src="\/assets\/current-issue-snapshot\.png"/, 'free vs paid page needs current issue snapshot image');
assert.match(freeVsPaid, /"@type":"Product"/, 'free vs paid page needs Product structured data');
assert.match(freeVsPaid, /"@type":"Dataset"/, 'free vs paid page needs Dataset structured data');
assert.match(freeVsPaid, /"@type":"FAQPage"/, 'free vs paid page needs FAQ structured data');
assert.match(freeVsPaid, /"price":"9.50"/, 'free vs paid page needs current price structured data');
assert.match(freeVsPaid, /\/_vercel\/insights\/script\.js/, 'free vs paid page needs Web Analytics script');
assert.match(freeVsPaid, /Free preview and paid ZIP comparison/, 'free vs paid page needs headline');
assert.match(freeVsPaid, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=free-vs-paid-top"/, 'free vs paid page has above-fold checkout CTA');
assert.match(freeVsPaid, /Stripe checkout opens after your click\. Use the CSV preview first if you need to confirm the row shape\./, 'free vs paid page explains top CTA checkout path');
assert.match(freeVsPaid, /<h2>Comparison<\/h2>/, 'free vs paid page needs comparison section');
assert.match(freeVsPaid, /When the paid ZIP is worth it/, 'free vs paid page needs paid decision section');
assert.match(freeVsPaid, /break-even is about 8 minutes/, 'free vs paid page needs launch price break-even copy');
assert.match(freeVsPaid, /free-vs-paid-break-even/, 'free vs paid page needs tracked break-even checkout link');
assert.match(freeVsPaid, /25 sample rows/, 'free vs paid page needs preview row count');
assert.match(freeVsPaid, /142 source-linked rows/, 'free vs paid page needs paid row count');
assert.match(freeVsPaid, /buyer-workbook\.md/, 'free vs paid page mentions buyer workbook');
assert.match(freeVsPaid, /buyer-priority-slices\.csv/, 'free vs paid page mentions priority slices');
assert.match(freeVsPaid, /Use this order/, 'free vs paid page needs decision order');
assert.match(freeVsPaid, /href="\/preview\.html"/, 'free vs paid page links preview');
assert.match(freeVsPaid, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'free vs paid page links sample CSV');
assert.match(freeVsPaid, /href="\/csv-field-guide\.html"/, 'free vs paid page links CSV field guide');
assert.match(freeVsPaid, /href="\/permit-research-workflow\.html"/, 'free vs paid page links research workflow page');
assert.match(freeVsPaid, /href="\/contractor-supplier-permit-research\.html"/, 'free vs paid page links contractor and supplier guide');
assert.match(freeVsPaid, /href="\/sample-segments\.html"/, 'free vs paid page links segment hub');
assert.match(freeVsPaid, /href="\/inside-the-zip\.html"/, 'free vs paid page links inside ZIP');
assert.match(freeVsPaid, /href="\/who-should-buy\.html"/, 'free vs paid page links who should buy page');
assert.match(freeVsPaid, /href="\/time-saved-calculator\.html"/, 'free vs paid page links time saved calculator');
assert.match(freeVsPaid, /href="\/pricing\.html"/, 'free vs paid page links pricing');
assert.match(freeVsPaid, /href="\/support\.html"/, 'free vs paid page links support');
assert.match(freeVsPaid, new RegExp(`href="${purchaseUrl}"`), 'free vs paid page links tracked buy page');
assertSampleRequestForm(freeVsPaid, 'free vs paid page');
assert.match(freeVsPaid, /No guaranteed leads\./, 'free vs paid page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(freeVsPaid, pattern, `free-vs-paid.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(freeVsPaid, pattern, `free-vs-paid.html contains private data pattern ${pattern}`);
}

const researchWorkflow = read('permit-research-workflow.html');
assert.match(researchWorkflow, /<title>Permit Research Workflow \| NYC Construction Brief<\/title>/, 'research workflow page needs title');
assert.match(researchWorkflow, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/permit-research-workflow\.html">/, 'research workflow page needs canonical');
assert.match(researchWorkflow, /<meta property="og:title" content="Permit Research Workflow \| NYC Construction Brief">/, 'research workflow page needs OG title');
assert.match(researchWorkflow, /src="\/assets\/current-issue-snapshot\.png"/, 'research workflow page needs current issue snapshot image');
assert.match(researchWorkflow, /"@type":"Product"/, 'research workflow page needs Product structured data');
assert.match(researchWorkflow, /"@type":"Dataset"/, 'research workflow page needs Dataset structured data');
assert.match(researchWorkflow, /"@type":"FAQPage"/, 'research workflow page needs FAQ structured data');
assert.match(researchWorkflow, /"price":"9.50"/, 'research workflow page needs current price structured data');
assert.match(researchWorkflow, /\/_vercel\/insights\/script\.js/, 'research workflow page needs Web Analytics script');
assert.match(researchWorkflow, /Weekly permit research workflow for the current issue/, 'research workflow page needs headline');
assert.match(researchWorkflow, /Fifteen-minute workflow/, 'research workflow page needs workflow section');
assert.match(researchWorkflow, /buyer-workbook\.md/, 'research workflow page mentions buyer workbook');
assert.match(researchWorkflow, /source_url/, 'research workflow page mentions source_url');
assert.match(researchWorkflow, /Good use cases/, 'research workflow page needs use cases section');
assert.match(researchWorkflow, /href="\/preview\.html"/, 'research workflow page links preview');
assert.match(researchWorkflow, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'research workflow page links sample CSV');
assert.match(researchWorkflow, /href="\/csv-field-guide\.html"/, 'research workflow page links CSV field guide');
assert.match(researchWorkflow, /href="\/free-vs-paid\.html"/, 'research workflow page links free vs paid page');
assert.match(researchWorkflow, /href="\/sample-segments\.html"/, 'research workflow page links segment hub');
assert.match(researchWorkflow, /href="\/inside-the-zip\.html"/, 'research workflow page links inside ZIP');
assert.match(researchWorkflow, /href="\/who-should-buy\.html"/, 'research workflow page links who should buy page');
assert.match(researchWorkflow, /href="\/contractor-supplier-permit-research\.html"/, 'research workflow page links contractor and supplier guide');
assert.match(researchWorkflow, /href="\/time-saved-calculator\.html"/, 'research workflow page links time saved calculator');
assert.match(researchWorkflow, /href="\/pricing\.html"/, 'research workflow page links pricing');
assert.match(researchWorkflow, /href="\/support\.html"/, 'research workflow page links support');
assert.match(researchWorkflow, new RegExp(`href="${purchaseUrl}"`), 'research workflow page links tracked buy page');
assertSampleRequestForm(researchWorkflow, 'research workflow page');
assert.match(researchWorkflow, /No guaranteed leads\./, 'research workflow page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(researchWorkflow, pattern, `permit-research-workflow.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(researchWorkflow, pattern, `permit-research-workflow.html contains private data pattern ${pattern}`);
}

const contractor = read('contractor-permit-research.html');
assert.match(contractor, /<title>Contractor Permit Research \| NYC Construction Brief<\/title>/, 'contractor guide needs title');
assert.match(contractor, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/contractor-permit-research\.html">/, 'contractor guide needs canonical');
assert.match(contractor, /<meta property="og:title" content="Contractor Permit Research \| NYC Construction Brief">/, 'contractor guide needs OG title');
assert.match(contractor, /src="\/assets\/current-issue-snapshot\.png"/, 'contractor guide needs current issue snapshot image');
assert.match(contractor, /"@type":"Product"/, 'contractor guide needs Product structured data');
assert.match(contractor, /"@type":"Dataset"/, 'contractor guide needs Dataset structured data');
assert.match(contractor, /"@type":"FAQPage"/, 'contractor guide needs FAQ structured data');
assert.match(contractor, /"price":"9.50"/, 'contractor guide needs current price structured data');
assert.match(contractor, /\/_vercel\/insights\/script\.js/, 'contractor guide needs Web Analytics script');
assert.match(contractor, /NYC permit research for contractors/, 'contractor guide needs headline');
assert.match(contractor, /Contractor review pass/, 'contractor guide needs review path');
assert.match(contractor, /Useful contractor research pages/, 'contractor guide needs research page links');
assert.match(contractor, /buyer-workbook\.md/, 'contractor guide mentions buyer workbook');
assert.match(contractor, /buyer-priority-slices\.csv/, 'contractor guide mentions priority slices');
assert.match(contractor, /source_url/, 'contractor guide mentions source_url');
assert.match(contractor, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'contractor guide needs row counts');
assert.match(contractor, /Top work types: Sidewalk Shed 40/, 'contractor guide needs work type mix');
assert.match(contractor, /Status mix:/, 'contractor guide needs status mix');
assert.match(contractor, /Cost buckets:/, 'contractor guide needs cost bucket mix');
assert.match(contractor, /href="\/topics\/nyc-dob-permit-data-for-contractors\.html"/, 'contractor guide links contractor data topic');
assert.match(contractor, /href="\/topics\/nyc-permit-intelligence-for-contractors\.html"/, 'contractor guide links contractor permit intelligence topic');
assert.match(contractor, /href="\/topics\/nyc-contractor-market-research\.html"/, 'contractor guide links contractor market research topic');
assert.match(contractor, /href="\/topics\/sidewalk-shed-contractor-permit-research-nyc\.html"/, 'contractor guide links sidewalk shed contractor topic');
assert.match(contractor, /href="\/topics\/plumbing-contractor-permit-research-nyc\.html"/, 'contractor guide links plumbing contractor topic');
assert.match(contractor, /href="\/preview\.html"/, 'contractor guide links preview');
assert.match(contractor, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'contractor guide links sample CSV');
assert.match(contractor, /href="\/current-issue\.html"/, 'contractor guide links current issue page');
assert.match(contractor, /href="\/sample-segments\.html"/, 'contractor guide links segment hub');
assert.match(contractor, /href="\/who-should-buy\.html"/, 'contractor guide links who should buy page');
assert.match(contractor, /href="\/free-vs-paid\.html"/, 'contractor guide links free vs paid page');
assert.match(contractor, /href="\/permit-research-workflow\.html"/, 'contractor guide links research workflow page');
assert.match(contractor, /href="\/contractor-supplier-permit-research\.html"/, 'contractor guide links contractor and supplier guide');
assert.match(contractor, /href="\/subcontractor-permit-research\.html"/, 'contractor guide links subcontractor guide');
assert.match(contractor, /href="\/nyc-permit-activity-by-zip\.html"/, 'contractor guide links ZIP activity page');
assert.doesNotMatch(contractor, /href="\/contractor-permit-research\.html"/, 'contractor guide must not self-link');
assert.match(contractor, /href="\/inside-the-zip\.html"/, 'contractor guide links inside ZIP');
assert.match(contractor, /href="\/csv-field-guide\.html"/, 'contractor guide links CSV field guide');
assert.match(contractor, /href="\/time-saved-calculator\.html"/, 'contractor guide links time saved calculator');
assert.match(contractor, /href="\/pricing\.html"/, 'contractor guide links pricing');
assert.match(contractor, /href="\/support\.html"/, 'contractor guide links support');
assert.match(contractor, new RegExp(`href="${purchaseUrl}"`), 'contractor guide links tracked buy page');
assertSampleRequestForm(contractor, 'contractor guide');
assert.match(contractor, /No guaranteed leads\./, 'contractor guide keeps claims boundary visible');
assert.match(contractor, /No owner names/, 'contractor guide keeps private-contact boundary visible');
assert.match(contractor, /estimating advice/, 'contractor guide keeps advice boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(contractor, pattern, `contractor-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(contractor, pattern, `contractor-permit-research.html contains private data pattern ${pattern}`);
}

const contractorSupplier = read('contractor-supplier-permit-research.html');
assert.match(contractorSupplier, /<title>Contractor and Supplier Permit Research \| NYC Construction Brief<\/title>/, 'contractor and supplier guide needs title');
assert.match(contractorSupplier, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/contractor-supplier-permit-research\.html">/, 'contractor and supplier guide needs canonical');
assert.match(contractorSupplier, /<meta property="og:title" content="Contractor and Supplier Permit Research \| NYC Construction Brief">/, 'contractor and supplier guide needs OG title');
assert.match(contractorSupplier, /src="\/assets\/current-issue-snapshot\.png"/, 'contractor and supplier guide needs current issue snapshot image');
assert.match(contractorSupplier, /"@type":"Product"/, 'contractor and supplier guide needs Product structured data');
assert.match(contractorSupplier, /"@type":"Dataset"/, 'contractor and supplier guide needs Dataset structured data');
assert.match(contractorSupplier, /"@type":"FAQPage"/, 'contractor and supplier guide needs FAQ structured data');
assert.match(contractorSupplier, /"price":"9.50"/, 'contractor and supplier guide needs current price structured data');
assert.match(contractorSupplier, /\/_vercel\/insights\/script\.js/, 'contractor and supplier guide needs Web Analytics script');
assert.match(contractorSupplier, /NYC permit research for contractors and suppliers/, 'contractor and supplier guide needs headline');
assert.match(contractorSupplier, /Vendor review path/, 'contractor and supplier guide needs review path');
assert.match(contractorSupplier, /Useful buyer pages/, 'contractor and supplier guide needs buyer page links');
assert.match(contractorSupplier, /buyer-workbook\.md/, 'contractor and supplier guide mentions buyer workbook');
assert.match(contractorSupplier, /buyer-priority-slices\.csv/, 'contractor and supplier guide mentions priority slices');
assert.match(contractorSupplier, /source_url/, 'contractor and supplier guide mentions source_url');
assert.match(contractorSupplier, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'contractor and supplier guide needs row counts');
assert.match(contractorSupplier, /Top work types: Sidewalk Shed 40/, 'contractor and supplier guide needs work type mix');
assert.match(contractorSupplier, /href="\/topics\/nyc-construction-supplier-permit-research\.html"/, 'contractor and supplier guide links construction supplier topic');
assert.match(contractorSupplier, /href="\/topics\/nyc-plumbing-supplier-permit-research\.html"/, 'contractor and supplier guide links plumbing supplier topic');
assert.match(contractorSupplier, /href="\/topics\/nyc-hvac-mechanical-permit-research\.html"/, 'contractor and supplier guide links HVAC topic');
assert.match(contractorSupplier, /href="\/topics\/nyc-fire-protection-permit-research\.html"/, 'contractor and supplier guide links fire protection topic');
assert.match(contractorSupplier, /href="\/topics\/nyc-sidewalk-shed-vendor-permit-research\.html"/, 'contractor and supplier guide links sidewalk shed topic');
assert.match(contractorSupplier, /href="\/preview\.html"/, 'contractor and supplier guide links preview');
assert.match(contractorSupplier, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'contractor and supplier guide links sample CSV');
assert.match(contractorSupplier, /href="\/sample-segments\.html"/, 'contractor and supplier guide links segment hub');
assert.match(contractorSupplier, /href="\/who-should-buy\.html"/, 'contractor and supplier guide links who should buy page');
assert.match(contractorSupplier, /href="\/free-vs-paid\.html"/, 'contractor and supplier guide links free vs paid page');
assert.match(contractorSupplier, /href="\/permit-research-workflow\.html"/, 'contractor and supplier guide links research workflow page');
assert.doesNotMatch(contractorSupplier, /href="\/contractor-supplier-permit-research\.html"/, 'contractor and supplier guide must not self-link');
assert.match(contractorSupplier, /href="\/inside-the-zip\.html"/, 'contractor and supplier guide links inside ZIP');
assert.match(contractorSupplier, /href="\/csv-field-guide\.html"/, 'contractor and supplier guide links CSV field guide');
assert.match(contractorSupplier, /href="\/time-saved-calculator\.html"/, 'contractor and supplier guide links time saved calculator');
assert.match(contractorSupplier, /href="\/pricing\.html"/, 'contractor and supplier guide links pricing');
assert.match(contractorSupplier, /href="\/support\.html"/, 'contractor and supplier guide links support');
assert.match(contractorSupplier, new RegExp(`href="${purchaseUrl}"`), 'contractor and supplier guide links tracked buy page');
assertSampleRequestForm(contractorSupplier, 'contractor and supplier guide');
assert.match(contractorSupplier, /No guaranteed leads\./, 'contractor and supplier guide keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(contractorSupplier, pattern, `contractor-supplier-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(contractorSupplier, pattern, `contractor-supplier-permit-research.html contains private data pattern ${pattern}`);
}

const materialSupplier = read('material-supplier-permit-research.html');
assert.match(materialSupplier, /<title>Material Supplier Permit Research \| NYC Construction Brief<\/title>/, 'material supplier guide needs title');
assert.match(materialSupplier, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/material-supplier-permit-research\.html">/, 'material supplier guide needs canonical');
assert.match(materialSupplier, /<meta property="og:title" content="Material Supplier Permit Research \| NYC Construction Brief">/, 'material supplier guide needs OG title');
assert.match(materialSupplier, /src="\/assets\/current-issue-snapshot\.png"/, 'material supplier guide needs current issue snapshot image');
assert.match(materialSupplier, /"@type":"Product"/, 'material supplier guide needs Product structured data');
assert.match(materialSupplier, /"@type":"Dataset"/, 'material supplier guide needs Dataset structured data');
assert.match(materialSupplier, /"@type":"FAQPage"/, 'material supplier guide needs FAQ structured data');
assert.match(materialSupplier, /"price":"9.50"/, 'material supplier guide needs current price structured data');
assert.match(materialSupplier, /\/_vercel\/insights\/script\.js/, 'material supplier guide needs Web Analytics script');
assert.match(materialSupplier, /NYC permit research for material suppliers/, 'material supplier guide needs headline');
assert.match(materialSupplier, /Supplier review pass/, 'material supplier guide needs review path');
assert.match(materialSupplier, /Useful supplier research pages/, 'material supplier guide needs research page links');
assert.match(materialSupplier, /buyer-workbook\.md/, 'material supplier guide mentions buyer workbook');
assert.match(materialSupplier, /buyer-priority-slices\.csv/, 'material supplier guide mentions priority slices');
assert.match(materialSupplier, /source_url/, 'material supplier guide mentions source_url');
assert.match(materialSupplier, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'material supplier guide needs row counts');
assert.match(materialSupplier, /Top work types: Sidewalk Shed 40/, 'material supplier guide needs work type mix');
assert.match(materialSupplier, /Cost buckets:/, 'material supplier guide needs cost bucket mix');
assert.match(materialSupplier, /href="\/topics\/nyc-construction-material-suppliers\.html"/, 'material supplier guide links material supplier topic');
assert.match(materialSupplier, /href="\/topics\/nyc-construction-supplier-permit-research\.html"/, 'material supplier guide links construction supplier topic');
assert.match(materialSupplier, /href="\/topics\/nyc-construction-permit-monitoring-for-suppliers\.html"/, 'material supplier guide links supplier monitoring topic');
assert.match(materialSupplier, /href="\/topics\/nyc-plumbing-supplier-permit-research\.html"/, 'material supplier guide links plumbing supplier topic');
assert.match(materialSupplier, /href="\/topics\/nyc-hvac-mechanical-permit-research\.html"/, 'material supplier guide links HVAC topic');
assert.match(materialSupplier, /href="\/preview\.html"/, 'material supplier guide links preview');
assert.match(materialSupplier, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'material supplier guide links sample CSV');
assert.match(materialSupplier, /href="\/current-issue\.html"/, 'material supplier guide links current issue page');
assert.match(materialSupplier, /href="\/sample-segments\.html"/, 'material supplier guide links segment hub');
assert.match(materialSupplier, /href="\/who-should-buy\.html"/, 'material supplier guide links who should buy page');
assert.match(materialSupplier, /href="\/free-vs-paid\.html"/, 'material supplier guide links free vs paid page');
assert.match(materialSupplier, /href="\/permit-research-workflow\.html"/, 'material supplier guide links research workflow page');
assert.match(materialSupplier, /href="\/contractor-supplier-permit-research\.html"/, 'material supplier guide links contractor and supplier guide');
assert.match(materialSupplier, /href="\/nyc-permit-activity-by-zip\.html"/, 'material supplier guide links ZIP activity page');
assert.doesNotMatch(materialSupplier, /href="\/material-supplier-permit-research\.html"/, 'material supplier guide must not self-link');
assert.match(materialSupplier, /href="\/inside-the-zip\.html"/, 'material supplier guide links inside ZIP');
assert.match(materialSupplier, /href="\/csv-field-guide\.html"/, 'material supplier guide links CSV field guide');
assert.match(materialSupplier, /href="\/time-saved-calculator\.html"/, 'material supplier guide links time saved calculator');
assert.match(materialSupplier, /href="\/pricing\.html"/, 'material supplier guide links pricing');
assert.match(materialSupplier, /href="\/support\.html"/, 'material supplier guide links support');
assert.match(materialSupplier, new RegExp(`href="${purchaseUrl}"`), 'material supplier guide links tracked buy page');
assertSampleRequestForm(materialSupplier, 'material supplier guide');
assert.match(materialSupplier, /No guaranteed leads\./, 'material supplier guide keeps claims boundary visible');
assert.match(materialSupplier, /No owner names/, 'material supplier guide keeps private-contact boundary visible');
assert.match(materialSupplier, /procurement advice/, 'material supplier guide keeps advice boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(materialSupplier, pattern, `material-supplier-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(materialSupplier, pattern, `material-supplier-permit-research.html contains private data pattern ${pattern}`);
}

const brokerDeveloper = read('broker-developer-permit-research.html');
assert.match(brokerDeveloper, /<title>Broker and Developer Permit Research \| NYC Construction Brief<\/title>/, 'broker and developer guide needs title');
assert.match(brokerDeveloper, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/broker-developer-permit-research\.html">/, 'broker and developer guide needs canonical');
assert.match(brokerDeveloper, /<meta property="og:title" content="Broker and Developer Permit Research \| NYC Construction Brief">/, 'broker and developer guide needs OG title');
assert.match(brokerDeveloper, /src="\/assets\/current-issue-snapshot\.png"/, 'broker and developer guide needs current issue snapshot image');
assert.match(brokerDeveloper, /"@type":"Product"/, 'broker and developer guide needs Product structured data');
assert.match(brokerDeveloper, /"@type":"Dataset"/, 'broker and developer guide needs Dataset structured data');
assert.match(brokerDeveloper, /"@type":"FAQPage"/, 'broker and developer guide needs FAQ structured data');
assert.match(brokerDeveloper, /"price":"9.50"/, 'broker and developer guide needs current price structured data');
assert.match(brokerDeveloper, /\/_vercel\/insights\/script\.js/, 'broker and developer guide needs Web Analytics script');
assert.match(brokerDeveloper, /NYC permit research for brokers and small developers/, 'broker and developer guide needs headline');
assert.match(brokerDeveloper, /Research pass/, 'broker and developer guide needs research path');
assert.match(brokerDeveloper, /Useful research pages/, 'broker and developer guide needs research page links');
assert.match(brokerDeveloper, /buyer-workbook\.md/, 'broker and developer guide mentions buyer workbook');
assert.match(brokerDeveloper, /buyer-priority-slices\.csv/, 'broker and developer guide mentions priority slices');
assert.match(brokerDeveloper, /source_url/, 'broker and developer guide mentions source_url');
assert.match(brokerDeveloper, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'broker and developer guide needs row counts');
assert.match(brokerDeveloper, /Top work types: Sidewalk Shed 40/, 'broker and developer guide needs work type mix');
assert.match(brokerDeveloper, /href="\/topics\/nyc-commercial-renovation-permits\.html"/, 'broker and developer guide links commercial renovation topic');
assert.match(brokerDeveloper, /href="\/topics\/nyc-contractor-market-research\.html"/, 'broker and developer guide links contractor market research topic');
assert.match(brokerDeveloper, /href="\/topics\/nyc-dob-permit-monitoring\.html"/, 'broker and developer guide links DOB monitoring topic');
assert.match(brokerDeveloper, /href="\/topics\/nyc-permit-activity-by-zip\.html"/, 'broker and developer guide links ZIP activity topic');
assert.match(brokerDeveloper, /href="\/topics\/nyc-renovation-permit-leads\.html"/, 'broker and developer guide links renovation research topic');
assert.match(brokerDeveloper, /href="\/preview\.html"/, 'broker and developer guide links preview');
assert.match(brokerDeveloper, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'broker and developer guide links sample CSV');
assert.match(brokerDeveloper, /href="\/current-issue\.html"/, 'broker and developer guide links current issue page');
assert.match(brokerDeveloper, /href="\/sample-segments\.html"/, 'broker and developer guide links segment hub');
assert.match(brokerDeveloper, /href="\/who-should-buy\.html"/, 'broker and developer guide links who should buy page');
assert.match(brokerDeveloper, /href="\/free-vs-paid\.html"/, 'broker and developer guide links free vs paid page');
assert.match(brokerDeveloper, /href="\/permit-research-workflow\.html"/, 'broker and developer guide links research workflow page');
assert.match(brokerDeveloper, /href="\/contractor-supplier-permit-research\.html"/, 'broker and developer guide links contractor and supplier guide');
assert.doesNotMatch(brokerDeveloper, /href="\/broker-developer-permit-research\.html"/, 'broker and developer guide must not self-link');
assert.match(brokerDeveloper, /href="\/inside-the-zip\.html"/, 'broker and developer guide links inside ZIP');
assert.match(brokerDeveloper, /href="\/csv-field-guide\.html"/, 'broker and developer guide links CSV field guide');
assert.match(brokerDeveloper, /href="\/time-saved-calculator\.html"/, 'broker and developer guide links time saved calculator');
assert.match(brokerDeveloper, /href="\/pricing\.html"/, 'broker and developer guide links pricing');
assert.match(brokerDeveloper, /href="\/support\.html"/, 'broker and developer guide links support');
assert.match(brokerDeveloper, new RegExp(`href="${purchaseUrl}"`), 'broker and developer guide links tracked buy page');
assertSampleRequestForm(brokerDeveloper, 'broker and developer guide');
assert.match(brokerDeveloper, /No guaranteed leads\./, 'broker and developer guide keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(brokerDeveloper, pattern, `broker-developer-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(brokerDeveloper, pattern, `broker-developer-permit-research.html contains private data pattern ${pattern}`);
}

const realEstateInvestor = read('real-estate-investor-permit-research.html');
assert.match(realEstateInvestor, /<title>Real Estate Investor Permit Research \| NYC Construction Brief<\/title>/, 'real estate investor guide needs title');
assert.match(realEstateInvestor, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/real-estate-investor-permit-research\.html">/, 'real estate investor guide needs canonical');
assert.match(realEstateInvestor, /<meta property="og:title" content="Real Estate Investor Permit Research \| NYC Construction Brief">/, 'real estate investor guide needs OG title');
assert.match(realEstateInvestor, /src="\/assets\/current-issue-snapshot\.png"/, 'real estate investor guide needs current issue snapshot image');
assert.match(realEstateInvestor, /"@type":"Product"/, 'real estate investor guide needs Product structured data');
assert.match(realEstateInvestor, /"@type":"Dataset"/, 'real estate investor guide needs Dataset structured data');
assert.match(realEstateInvestor, /"@type":"FAQPage"/, 'real estate investor guide needs FAQ structured data');
assert.match(realEstateInvestor, /"price":"9.50"/, 'real estate investor guide needs current price structured data');
assert.match(realEstateInvestor, /\/_vercel\/insights\/script\.js/, 'real estate investor guide needs Web Analytics script');
assert.match(realEstateInvestor, /NYC permit research for real estate investors/, 'real estate investor guide needs headline');
assert.match(realEstateInvestor, /Investor review pass/, 'real estate investor guide needs review path');
assert.match(realEstateInvestor, /Useful investor research pages/, 'real estate investor guide needs research page links');
assert.match(realEstateInvestor, /buyer-workbook\.md/, 'real estate investor guide mentions buyer workbook');
assert.match(realEstateInvestor, /buyer-priority-slices\.csv/, 'real estate investor guide mentions priority slices');
assert.match(realEstateInvestor, /source_url/, 'real estate investor guide mentions source_url');
assert.match(realEstateInvestor, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'real estate investor guide needs row counts');
assert.match(realEstateInvestor, /Top work types: Sidewalk Shed 40/, 'real estate investor guide needs work type mix');
assert.match(realEstateInvestor, /Top ZIPs: 10003 37/, 'real estate investor guide needs ZIP mix');
assert.match(realEstateInvestor, /Cost buckets:/, 'real estate investor guide needs cost bucket mix');
assert.match(realEstateInvestor, /href="\/topics\/nyc-real-estate-investor-permit-research\.html"/, 'real estate investor guide links investor topic');
assert.match(realEstateInvestor, /href="\/topics\/nyc-commercial-renovation-permits\.html"/, 'real estate investor guide links commercial renovation topic');
assert.match(realEstateInvestor, /href="\/topics\/nyc-renovation-permit-leads\.html"/, 'real estate investor guide links renovation research topic');
assert.match(realEstateInvestor, /href="\/topics\/nyc-construction-market-research-csv\.html"/, 'real estate investor guide links market research CSV topic');
assert.match(realEstateInvestor, /href="\/topics\/nyc-permit-activity-by-zip\.html"/, 'real estate investor guide links ZIP activity topic');
assert.match(realEstateInvestor, /href="\/preview\.html"/, 'real estate investor guide links preview');
assert.match(realEstateInvestor, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'real estate investor guide links sample CSV');
assert.match(realEstateInvestor, /href="\/current-issue\.html"/, 'real estate investor guide links current issue page');
assert.match(realEstateInvestor, /href="\/sample-segments\.html"/, 'real estate investor guide links segment hub');
assert.match(realEstateInvestor, /href="\/who-should-buy\.html"/, 'real estate investor guide links who should buy page');
assert.match(realEstateInvestor, /href="\/free-vs-paid\.html"/, 'real estate investor guide links free vs paid page');
assert.match(realEstateInvestor, /href="\/permit-research-workflow\.html"/, 'real estate investor guide links research workflow page');
assert.match(realEstateInvestor, /href="\/broker-developer-permit-research\.html"/, 'real estate investor guide links broker and developer guide');
assert.match(realEstateInvestor, /href="\/nyc-permit-activity-by-zip\.html"/, 'real estate investor guide links ZIP activity page');
assert.match(realEstateInvestor, /href="\/manhattan-construction-permit-activity\.html"/, 'real estate investor guide links Manhattan page');
assert.match(realEstateInvestor, /href="\/brooklyn-construction-permit-activity\.html"/, 'real estate investor guide links Brooklyn page');
assert.doesNotMatch(realEstateInvestor, /href="\/real-estate-investor-permit-research\.html"/, 'real estate investor guide must not self-link');
assert.match(realEstateInvestor, /href="\/inside-the-zip\.html"/, 'real estate investor guide links inside ZIP');
assert.match(realEstateInvestor, /href="\/csv-field-guide\.html"/, 'real estate investor guide links CSV field guide');
assert.match(realEstateInvestor, /href="\/time-saved-calculator\.html"/, 'real estate investor guide links time saved calculator');
assert.match(realEstateInvestor, /href="\/pricing\.html"/, 'real estate investor guide links pricing');
assert.match(realEstateInvestor, /href="\/support\.html"/, 'real estate investor guide links support');
assert.match(realEstateInvestor, new RegExp(`href="${purchaseUrl}"`), 'real estate investor guide links tracked buy page');
assertSampleRequestForm(realEstateInvestor, 'real estate investor guide');
assert.match(realEstateInvestor, /No guaranteed leads\./, 'real estate investor guide keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(realEstateInvestor, pattern, `real-estate-investor-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(realEstateInvestor, pattern, `real-estate-investor-permit-research.html contains private data pattern ${pattern}`);
}

const constructionConsultant = read('construction-consultant-permit-research.html');
assert.match(constructionConsultant, /<title>Construction Consultant Permit Research \| NYC Construction Brief<\/title>/, 'construction consultant guide needs title');
assert.match(constructionConsultant, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/construction-consultant-permit-research\.html">/, 'construction consultant guide needs canonical');
assert.match(constructionConsultant, /<meta property="og:title" content="Construction Consultant Permit Research \| NYC Construction Brief">/, 'construction consultant guide needs OG title');
assert.match(constructionConsultant, /src="\/assets\/current-issue-snapshot\.png"/, 'construction consultant guide needs current issue snapshot image');
assert.match(constructionConsultant, /"@type":"Product"/, 'construction consultant guide needs Product structured data');
assert.match(constructionConsultant, /"@type":"Dataset"/, 'construction consultant guide needs Dataset structured data');
assert.match(constructionConsultant, /"@type":"FAQPage"/, 'construction consultant guide needs FAQ structured data');
assert.match(constructionConsultant, /"price":"9.50"/, 'construction consultant guide needs current price structured data');
assert.match(constructionConsultant, /\/_vercel\/insights\/script\.js/, 'construction consultant guide needs Web Analytics script');
assert.match(constructionConsultant, /NYC permit research for construction consultants/, 'construction consultant guide needs headline');
assert.match(constructionConsultant, /Consultant review pass/, 'construction consultant guide needs review path');
assert.match(constructionConsultant, /Useful consultant research pages/, 'construction consultant guide needs research page links');
assert.match(constructionConsultant, /buyer-workbook\.md/, 'construction consultant guide mentions buyer workbook');
assert.match(constructionConsultant, /buyer-priority-slices\.csv/, 'construction consultant guide mentions priority slices');
assert.match(constructionConsultant, /source_url/, 'construction consultant guide mentions source_url');
assert.match(constructionConsultant, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'construction consultant guide needs row counts');
assert.match(constructionConsultant, /Top work types: Sidewalk Shed 40/, 'construction consultant guide needs work type mix');
assert.match(constructionConsultant, /Top ZIPs: 10003 37/, 'construction consultant guide needs ZIP mix');
assert.match(constructionConsultant, /Cost buckets:/, 'construction consultant guide needs cost bucket mix');
assert.match(constructionConsultant, /href="\/topics\/nyc-permit-data-for-construction-consultants\.html"/, 'construction consultant guide links consultant topic');
assert.match(constructionConsultant, /href="\/topics\/nyc-construction-market-research-csv\.html"/, 'construction consultant guide links market research CSV topic');
assert.match(constructionConsultant, /href="\/topics\/nyc-contractor-market-research\.html"/, 'construction consultant guide links contractor market research topic');
assert.match(constructionConsultant, /href="\/topics\/nyc-dob-permit-monitoring\.html"/, 'construction consultant guide links DOB monitoring topic');
assert.match(constructionConsultant, /href="\/topics\/nyc-permit-activity-by-zip\.html"/, 'construction consultant guide links ZIP activity topic');
assert.match(constructionConsultant, /href="\/preview\.html"/, 'construction consultant guide links preview');
assert.match(constructionConsultant, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'construction consultant guide links sample CSV');
assert.match(constructionConsultant, /href="\/current-issue\.html"/, 'construction consultant guide links current issue page');
assert.match(constructionConsultant, /href="\/sample-segments\.html"/, 'construction consultant guide links segment hub');
assert.match(constructionConsultant, /href="\/who-should-buy\.html"/, 'construction consultant guide links who should buy page');
assert.match(constructionConsultant, /href="\/free-vs-paid\.html"/, 'construction consultant guide links free vs paid page');
assert.match(constructionConsultant, /href="\/permit-research-workflow\.html"/, 'construction consultant guide links research workflow page');
assert.match(constructionConsultant, /href="\/contractor-supplier-permit-research\.html"/, 'construction consultant guide links contractor and supplier guide');
assert.match(constructionConsultant, /href="\/broker-developer-permit-research\.html"/, 'construction consultant guide links broker and developer guide');
assert.match(constructionConsultant, /href="\/real-estate-investor-permit-research\.html"/, 'construction consultant guide links real estate investor guide');
assert.match(constructionConsultant, /href="\/nyc-permit-activity-by-zip\.html"/, 'construction consultant guide links ZIP activity page');
assert.doesNotMatch(constructionConsultant, /href="\/construction-consultant-permit-research\.html"/, 'construction consultant guide must not self-link');
assert.match(constructionConsultant, /href="\/inside-the-zip\.html"/, 'construction consultant guide links inside ZIP');
assert.match(constructionConsultant, /href="\/csv-field-guide\.html"/, 'construction consultant guide links CSV field guide');
assert.match(constructionConsultant, /href="\/time-saved-calculator\.html"/, 'construction consultant guide links time saved calculator');
assert.match(constructionConsultant, /href="\/pricing\.html"/, 'construction consultant guide links pricing');
assert.match(constructionConsultant, /href="\/support\.html"/, 'construction consultant guide links support');
assert.match(constructionConsultant, new RegExp(`href="${purchaseUrl}"`), 'construction consultant guide links tracked buy page');
assertSampleRequestForm(constructionConsultant, 'construction consultant guide');
assert.match(constructionConsultant, /No guaranteed leads\./, 'construction consultant guide keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(constructionConsultant, pattern, `construction-consultant-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(constructionConsultant, pattern, `construction-consultant-permit-research.html contains private data pattern ${pattern}`);
}

const constructionRisk = read('construction-risk-permit-research.html');
assert.match(constructionRisk, /<title>Construction Risk Permit Research \| NYC Construction Brief<\/title>/, 'construction risk guide needs title');
assert.match(constructionRisk, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/construction-risk-permit-research\.html">/, 'construction risk guide needs canonical');
assert.match(constructionRisk, /<meta property="og:title" content="Construction Risk Permit Research \| NYC Construction Brief">/, 'construction risk guide needs OG title');
assert.match(constructionRisk, /src="\/assets\/current-issue-snapshot\.png"/, 'construction risk guide needs current issue snapshot image');
assert.match(constructionRisk, /"@type":"Product"/, 'construction risk guide needs Product structured data');
assert.match(constructionRisk, /"@type":"Dataset"/, 'construction risk guide needs Dataset structured data');
assert.match(constructionRisk, /"@type":"FAQPage"/, 'construction risk guide needs FAQ structured data');
assert.match(constructionRisk, /"price":"9.50"/, 'construction risk guide needs current price structured data');
assert.match(constructionRisk, /\/_vercel\/insights\/script\.js/, 'construction risk guide needs Web Analytics script');
assert.match(constructionRisk, /NYC construction risk permit research/, 'construction risk guide needs headline');
assert.match(constructionRisk, /Risk review pass/, 'construction risk guide needs review path');
assert.match(constructionRisk, /Useful risk research pages/, 'construction risk guide needs research page links');
assert.match(constructionRisk, /buyer-workbook\.md/, 'construction risk guide mentions buyer workbook');
assert.match(constructionRisk, /buyer-priority-slices\.csv/, 'construction risk guide mentions priority slices');
assert.match(constructionRisk, /source_url/, 'construction risk guide mentions source_url');
assert.match(constructionRisk, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'construction risk guide needs row counts');
assert.match(constructionRisk, /Top work types: Sidewalk Shed 40/, 'construction risk guide needs work type mix');
assert.match(constructionRisk, /Top ZIPs: 10003 37/, 'construction risk guide needs ZIP mix');
assert.match(constructionRisk, /Status mix:/, 'construction risk guide needs status mix');
assert.match(constructionRisk, /Cost buckets:/, 'construction risk guide needs cost bucket mix');
assert.match(constructionRisk, /href="\/topics\/nyc-construction-risk-permit-research\.html"/, 'construction risk guide links risk topic');
assert.match(constructionRisk, /href="\/topics\/nyc-dob-permit-monitoring\.html"/, 'construction risk guide links DOB monitoring topic');
assert.match(constructionRisk, /href="\/topics\/nyc-construction-market-research-csv\.html"/, 'construction risk guide links market research CSV topic');
assert.match(constructionRisk, /href="\/topics\/nyc-dob-now-public-records\.html"/, 'construction risk guide links DOB NOW public records topic');
assert.match(constructionRisk, /href="\/topics\/nyc-permit-activity-by-zip\.html"/, 'construction risk guide links ZIP activity topic');
assert.match(constructionRisk, /href="\/preview\.html"/, 'construction risk guide links preview');
assert.match(constructionRisk, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'construction risk guide links sample CSV');
assert.match(constructionRisk, /href="\/current-issue\.html"/, 'construction risk guide links current issue page');
assert.match(constructionRisk, /href="\/sample-segments\.html"/, 'construction risk guide links segment hub');
assert.match(constructionRisk, /href="\/who-should-buy\.html"/, 'construction risk guide links who should buy page');
assert.match(constructionRisk, /href="\/free-vs-paid\.html"/, 'construction risk guide links free vs paid page');
assert.match(constructionRisk, /href="\/permit-research-workflow\.html"/, 'construction risk guide links research workflow page');
assert.match(constructionRisk, /href="\/construction-consultant-permit-research\.html"/, 'construction risk guide links construction consultant guide');
assert.match(constructionRisk, /href="\/real-estate-investor-permit-research\.html"/, 'construction risk guide links real estate investor guide');
assert.match(constructionRisk, /href="\/nyc-permit-activity-by-zip\.html"/, 'construction risk guide links ZIP activity page');
assert.doesNotMatch(constructionRisk, /href="\/construction-risk-permit-research\.html"/, 'construction risk guide must not self-link');
assert.match(constructionRisk, /href="\/inside-the-zip\.html"/, 'construction risk guide links inside ZIP');
assert.match(constructionRisk, /href="\/csv-field-guide\.html"/, 'construction risk guide links CSV field guide');
assert.match(constructionRisk, /href="\/time-saved-calculator\.html"/, 'construction risk guide links time saved calculator');
assert.match(constructionRisk, /href="\/pricing\.html"/, 'construction risk guide links pricing');
assert.match(constructionRisk, /href="\/support\.html"/, 'construction risk guide links support');
assert.match(constructionRisk, new RegExp(`href="${purchaseUrl}"`), 'construction risk guide links tracked buy page');
assertSampleRequestForm(constructionRisk, 'construction risk guide');
assert.match(constructionRisk, /No guaranteed leads\./, 'construction risk guide keeps claims boundary visible');
assert.match(constructionRisk, /No owner names/, 'construction risk guide keeps private-contact boundary visible');
assert.match(constructionRisk, /underwriting advice/, 'construction risk guide keeps advice boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(constructionRisk, pattern, `construction-risk-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(constructionRisk, pattern, `construction-risk-permit-research.html contains private data pattern ${pattern}`);
}

const permitExpediter = read('permit-expediter-research.html');
assert.match(permitExpediter, /<title>Permit Expediter Research \| NYC Construction Brief<\/title>/, 'permit expediter guide needs title');
assert.match(permitExpediter, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/permit-expediter-research\.html">/, 'permit expediter guide needs canonical');
assert.match(permitExpediter, /<meta property="og:title" content="Permit Expediter Research \| NYC Construction Brief">/, 'permit expediter guide needs OG title');
assert.match(permitExpediter, /src="\/assets\/current-issue-snapshot\.png"/, 'permit expediter guide needs current issue snapshot image');
assert.match(permitExpediter, /"@type":"Product"/, 'permit expediter guide needs Product structured data');
assert.match(permitExpediter, /"@type":"Dataset"/, 'permit expediter guide needs Dataset structured data');
assert.match(permitExpediter, /"@type":"FAQPage"/, 'permit expediter guide needs FAQ structured data');
assert.match(permitExpediter, /"price":"9.50"/, 'permit expediter guide needs current price structured data');
assert.match(permitExpediter, /\/_vercel\/insights\/script\.js/, 'permit expediter guide needs Web Analytics script');
assert.match(permitExpediter, /NYC permit research for expediters and filing consultants/, 'permit expediter guide needs headline');
assert.match(permitExpediter, /Expediter review pass/, 'permit expediter guide needs review path');
assert.match(permitExpediter, /Useful filing research pages/, 'permit expediter guide needs research page links');
assert.match(permitExpediter, /buyer-workbook\.md/, 'permit expediter guide mentions buyer workbook');
assert.match(permitExpediter, /buyer-priority-slices\.csv/, 'permit expediter guide mentions priority slices');
assert.match(permitExpediter, /source_url/, 'permit expediter guide mentions source_url');
assert.match(permitExpediter, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'permit expediter guide needs row counts');
assert.match(permitExpediter, /Top work types: Sidewalk Shed 40/, 'permit expediter guide needs work type mix');
assert.match(permitExpediter, /href="\/topics\/nyc-dob-now-public-records\.html"/, 'permit expediter guide links DOB NOW public records topic');
assert.match(permitExpediter, /href="\/topics\/nyc-dob-permit-monitoring\.html"/, 'permit expediter guide links DOB monitoring topic');
assert.match(permitExpediter, /href="\/topics\/nyc-dob-approved-permits-open-data\.html"/, 'permit expediter guide links approved permits open data topic');
assert.match(permitExpediter, /href="\/topics\/nyc-dob-permit-csv\.html"/, 'permit expediter guide links DOB CSV topic');
assert.match(permitExpediter, /href="\/topics\/nyc-permit-activity-by-zip\.html"/, 'permit expediter guide links ZIP activity topic');
assert.match(permitExpediter, /href="\/preview\.html"/, 'permit expediter guide links preview');
assert.match(permitExpediter, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'permit expediter guide links sample CSV');
assert.match(permitExpediter, /href="\/current-issue\.html"/, 'permit expediter guide links current issue page');
assert.match(permitExpediter, /href="\/sample-segments\.html"/, 'permit expediter guide links segment hub');
assert.match(permitExpediter, /href="\/who-should-buy\.html"/, 'permit expediter guide links who should buy page');
assert.match(permitExpediter, /href="\/free-vs-paid\.html"/, 'permit expediter guide links free vs paid page');
assert.match(permitExpediter, /href="\/permit-research-workflow\.html"/, 'permit expediter guide links research workflow page');
assert.match(permitExpediter, /href="\/contractor-supplier-permit-research\.html"/, 'permit expediter guide links contractor and supplier guide');
assert.match(permitExpediter, /href="\/broker-developer-permit-research\.html"/, 'permit expediter guide links broker and developer guide');
assert.doesNotMatch(permitExpediter, /href="\/permit-expediter-research\.html"/, 'permit expediter guide must not self-link');
assert.match(permitExpediter, /href="\/inside-the-zip\.html"/, 'permit expediter guide links inside ZIP');
assert.match(permitExpediter, /href="\/csv-field-guide\.html"/, 'permit expediter guide links CSV field guide');
assert.match(permitExpediter, /href="\/time-saved-calculator\.html"/, 'permit expediter guide links time saved calculator');
assert.match(permitExpediter, /href="\/pricing\.html"/, 'permit expediter guide links pricing');
assert.match(permitExpediter, /href="\/support\.html"/, 'permit expediter guide links support');
assert.match(permitExpediter, new RegExp(`href="${purchaseUrl}"`), 'permit expediter guide links tracked buy page');
assertSampleRequestForm(permitExpediter, 'permit expediter guide');
assert.match(permitExpediter, /No guaranteed leads\./, 'permit expediter guide keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(permitExpediter, pattern, `permit-expediter-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(permitExpediter, pattern, `permit-expediter-research.html contains private data pattern ${pattern}`);
}

const propertyManager = read('property-manager-permit-research.html');
assert.match(propertyManager, /<title>Property Manager Permit Research \| NYC Construction Brief<\/title>/, 'property manager guide needs title');
assert.match(propertyManager, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/property-manager-permit-research\.html">/, 'property manager guide needs canonical');
assert.match(propertyManager, /<meta property="og:title" content="Property Manager Permit Research \| NYC Construction Brief">/, 'property manager guide needs OG title');
assert.match(propertyManager, /src="\/assets\/current-issue-snapshot\.png"/, 'property manager guide needs current issue snapshot image');
assert.match(propertyManager, /"@type":"Product"/, 'property manager guide needs Product structured data');
assert.match(propertyManager, /"@type":"Dataset"/, 'property manager guide needs Dataset structured data');
assert.match(propertyManager, /"@type":"FAQPage"/, 'property manager guide needs FAQ structured data');
assert.match(propertyManager, /"price":"9.50"/, 'property manager guide needs current price structured data');
assert.match(propertyManager, /\/_vercel\/insights\/script\.js/, 'property manager guide needs Web Analytics script');
assert.match(propertyManager, /NYC permit research for property managers/, 'property manager guide needs headline');
assert.match(propertyManager, /Property management review pass/, 'property manager guide needs review path');
assert.match(propertyManager, /Useful property research pages/, 'property manager guide needs research page links');
assert.match(propertyManager, /buyer-workbook\.md/, 'property manager guide mentions buyer workbook');
assert.match(propertyManager, /buyer-priority-slices\.csv/, 'property manager guide mentions priority slices');
assert.match(propertyManager, /source_url/, 'property manager guide mentions source_url');
assert.match(propertyManager, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'property manager guide needs row counts');
assert.match(propertyManager, /Top work types: Sidewalk Shed 40/, 'property manager guide needs work type mix');
assert.match(propertyManager, /href="\/topics\/nyc-property-manager-permit-research\.html"/, 'property manager guide links property manager topic');
assert.match(propertyManager, /href="\/topics\/nyc-building-services-permit-research\.html"/, 'property manager guide links building services topic');
assert.match(propertyManager, /href="\/topics\/nyc-building-permit-alerts-by-zip\.html"/, 'property manager guide links building permit alerts topic');
assert.match(propertyManager, /href="\/topics\/nyc-dob-permit-monitoring\.html"/, 'property manager guide links DOB monitoring topic');
assert.match(propertyManager, /href="\/topics\/nyc-permit-activity-by-zip\.html"/, 'property manager guide links ZIP activity topic');
assert.match(propertyManager, /href="\/preview\.html"/, 'property manager guide links preview');
assert.match(propertyManager, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'property manager guide links sample CSV');
assert.match(propertyManager, /href="\/current-issue\.html"/, 'property manager guide links current issue page');
assert.match(propertyManager, /href="\/sample-segments\.html"/, 'property manager guide links segment hub');
assert.match(propertyManager, /href="\/who-should-buy\.html"/, 'property manager guide links who should buy page');
assert.match(propertyManager, /href="\/free-vs-paid\.html"/, 'property manager guide links free vs paid page');
assert.match(propertyManager, /href="\/permit-research-workflow\.html"/, 'property manager guide links research workflow page');
assert.match(propertyManager, /href="\/contractor-supplier-permit-research\.html"/, 'property manager guide links contractor and supplier guide');
assert.match(propertyManager, /href="\/broker-developer-permit-research\.html"/, 'property manager guide links broker and developer guide');
assert.match(propertyManager, /href="\/permit-expediter-research\.html"/, 'property manager guide links permit expediter guide');
assert.doesNotMatch(propertyManager, /href="\/property-manager-permit-research\.html"/, 'property manager guide must not self-link');
assert.match(propertyManager, /href="\/inside-the-zip\.html"/, 'property manager guide links inside ZIP');
assert.match(propertyManager, /href="\/csv-field-guide\.html"/, 'property manager guide links CSV field guide');
assert.match(propertyManager, /href="\/time-saved-calculator\.html"/, 'property manager guide links time saved calculator');
assert.match(propertyManager, /href="\/pricing\.html"/, 'property manager guide links pricing');
assert.match(propertyManager, /href="\/support\.html"/, 'property manager guide links support');
assert.match(propertyManager, new RegExp(`href="${purchaseUrl}"`), 'property manager guide links tracked buy page');
assertSampleRequestForm(propertyManager, 'property manager guide');
assert.match(propertyManager, /No guaranteed leads\./, 'property manager guide keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(propertyManager, pattern, `property-manager-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(propertyManager, pattern, `property-manager-permit-research.html contains private data pattern ${pattern}`);
}

const buildingServiceVendor = read('building-service-vendor-permit-research.html');
assert.match(buildingServiceVendor, /<title>Building-Service Vendor Permit Research \| NYC Construction Brief<\/title>/, 'building-service vendor guide needs title');
assert.match(buildingServiceVendor, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/building-service-vendor-permit-research\.html">/, 'building-service vendor guide needs canonical');
assert.match(buildingServiceVendor, /<meta property="og:title" content="Building-Service Vendor Permit Research \| NYC Construction Brief">/, 'building-service vendor guide needs OG title');
assert.match(buildingServiceVendor, /src="\/assets\/current-issue-snapshot\.png"/, 'building-service vendor guide needs current issue snapshot image');
assert.match(buildingServiceVendor, /"@type":"Product"/, 'building-service vendor guide needs Product structured data');
assert.match(buildingServiceVendor, /"@type":"Dataset"/, 'building-service vendor guide needs Dataset structured data');
assert.match(buildingServiceVendor, /"@type":"FAQPage"/, 'building-service vendor guide needs FAQ structured data');
assert.match(buildingServiceVendor, /"price":"9.50"/, 'building-service vendor guide needs current price structured data');
assert.match(buildingServiceVendor, /\/_vercel\/insights\/script\.js/, 'building-service vendor guide needs Web Analytics script');
assert.match(buildingServiceVendor, /NYC permit research for building-service vendors/, 'building-service vendor guide needs headline');
assert.match(buildingServiceVendor, /Vendor review pass/, 'building-service vendor guide needs review path');
assert.match(buildingServiceVendor, /Useful building-service research pages/, 'building-service vendor guide needs research page links');
assert.match(buildingServiceVendor, /buyer-workbook\.md/, 'building-service vendor guide mentions buyer workbook');
assert.match(buildingServiceVendor, /buyer-priority-slices\.csv/, 'building-service vendor guide mentions priority slices');
assert.match(buildingServiceVendor, /source_url/, 'building-service vendor guide mentions source_url');
assert.match(buildingServiceVendor, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'building-service vendor guide needs row counts');
assert.match(buildingServiceVendor, /Top work types: Sidewalk Shed 40/, 'building-service vendor guide needs work type mix');
assert.match(buildingServiceVendor, /Status mix:/, 'building-service vendor guide needs status mix');
assert.match(buildingServiceVendor, /Cost buckets:/, 'building-service vendor guide needs cost bucket mix');
assert.match(buildingServiceVendor, /href="\/topics\/nyc-building-services-permit-research\.html"/, 'building-service vendor guide links building services topic');
assert.match(buildingServiceVendor, /href="\/topics\/nyc-local-service-provider-permit-research\.html"/, 'building-service vendor guide links local service topic');
assert.match(buildingServiceVendor, /href="\/topics\/nyc-property-manager-permit-research\.html"/, 'building-service vendor guide links property manager topic');
assert.match(buildingServiceVendor, /href="\/topics\/nyc-building-permit-alerts-by-zip\.html"/, 'building-service vendor guide links building permit alerts topic');
assert.match(buildingServiceVendor, /href="\/topics\/nyc-permit-activity-by-zip\.html"/, 'building-service vendor guide links ZIP activity topic');
assert.match(buildingServiceVendor, /href="\/preview\.html"/, 'building-service vendor guide links preview');
assert.match(buildingServiceVendor, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'building-service vendor guide links sample CSV');
assert.match(buildingServiceVendor, /href="\/current-issue\.html"/, 'building-service vendor guide links current issue page');
assert.match(buildingServiceVendor, /href="\/sample-segments\.html"/, 'building-service vendor guide links segment hub');
assert.match(buildingServiceVendor, /href="\/who-should-buy\.html"/, 'building-service vendor guide links who should buy page');
assert.match(buildingServiceVendor, /href="\/free-vs-paid\.html"/, 'building-service vendor guide links free vs paid page');
assert.match(buildingServiceVendor, /href="\/permit-research-workflow\.html"/, 'building-service vendor guide links research workflow page');
assert.match(buildingServiceVendor, /href="\/contractor-supplier-permit-research\.html"/, 'building-service vendor guide links contractor and supplier guide');
assert.match(buildingServiceVendor, /href="\/property-manager-permit-research\.html"/, 'building-service vendor guide links property manager guide');
assert.match(buildingServiceVendor, /href="\/nyc-permit-activity-by-zip\.html"/, 'building-service vendor guide links ZIP activity page');
assert.doesNotMatch(buildingServiceVendor, /href="\/building-service-vendor-permit-research\.html"/, 'building-service vendor guide must not self-link');
assert.match(buildingServiceVendor, /href="\/inside-the-zip\.html"/, 'building-service vendor guide links inside ZIP');
assert.match(buildingServiceVendor, /href="\/csv-field-guide\.html"/, 'building-service vendor guide links CSV field guide');
assert.match(buildingServiceVendor, /href="\/time-saved-calculator\.html"/, 'building-service vendor guide links time saved calculator');
assert.match(buildingServiceVendor, /href="\/pricing\.html"/, 'building-service vendor guide links pricing');
assert.match(buildingServiceVendor, /href="\/support\.html"/, 'building-service vendor guide links support');
assert.match(buildingServiceVendor, new RegExp(`href="${purchaseUrl}"`), 'building-service vendor guide links tracked buy page');
assertSampleRequestForm(buildingServiceVendor, 'building-service vendor guide');
assert.match(buildingServiceVendor, /No guaranteed leads\./, 'building-service vendor guide keeps claims boundary visible');
assert.match(buildingServiceVendor, /No tenant data/, 'building-service vendor guide keeps private-contact boundary visible');
assert.match(buildingServiceVendor, /procurement advice/, 'building-service vendor guide keeps advice boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(buildingServiceVendor, pattern, `building-service-vendor-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(buildingServiceVendor, pattern, `building-service-vendor-permit-research.html contains private data pattern ${pattern}`);
}

const subcontractor = read('subcontractor-permit-research.html');
assert.match(subcontractor, /<title>Subcontractor Permit Research \| NYC Construction Brief<\/title>/, 'subcontractor guide needs title');
assert.match(subcontractor, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/subcontractor-permit-research\.html">/, 'subcontractor guide needs canonical');
assert.match(subcontractor, /<meta property="og:title" content="Subcontractor Permit Research \| NYC Construction Brief">/, 'subcontractor guide needs OG title');
assert.match(subcontractor, /src="\/assets\/current-issue-snapshot\.png"/, 'subcontractor guide needs current issue snapshot image');
assert.match(subcontractor, /"@type":"Product"/, 'subcontractor guide needs Product structured data');
assert.match(subcontractor, /"@type":"Dataset"/, 'subcontractor guide needs Dataset structured data');
assert.match(subcontractor, /"@type":"FAQPage"/, 'subcontractor guide needs FAQ structured data');
assert.match(subcontractor, /"price":"9.50"/, 'subcontractor guide needs current price structured data');
assert.match(subcontractor, /\/_vercel\/insights\/script\.js/, 'subcontractor guide needs Web Analytics script');
assert.match(subcontractor, /NYC permit research for subcontractors/, 'subcontractor guide needs headline');
assert.match(subcontractor, /Subcontractor review pass/, 'subcontractor guide needs review path');
assert.match(subcontractor, /Useful subcontractor research pages/, 'subcontractor guide needs research page links');
assert.match(subcontractor, /buyer-workbook\.md/, 'subcontractor guide mentions buyer workbook');
assert.match(subcontractor, /buyer-priority-slices\.csv/, 'subcontractor guide mentions priority slices');
assert.match(subcontractor, /source_url/, 'subcontractor guide mentions source_url');
assert.match(subcontractor, /Paid ZIP rows: 142\. Free preview rows: 25\./, 'subcontractor guide needs row counts');
assert.match(subcontractor, /Top work types: Sidewalk Shed 40/, 'subcontractor guide needs work type mix');
assert.match(subcontractor, /Status mix:/, 'subcontractor guide needs status mix');
assert.match(subcontractor, /Cost buckets:/, 'subcontractor guide needs cost bucket mix');
assert.match(subcontractor, /href="\/topics\/nyc-dob-permit-alerts-for-subcontractors\.html"/, 'subcontractor guide links subcontractor alerts topic');
assert.match(subcontractor, /href="\/topics\/nyc-subcontractor-prospecting-permit-data\.html"/, 'subcontractor guide links subcontractor prospecting topic');
assert.match(subcontractor, /href="\/topics\/nyc-dob-permit-data-for-contractors\.html"/, 'subcontractor guide links contractor data topic');
assert.match(subcontractor, /href="\/topics\/nyc-permit-intelligence-for-contractors\.html"/, 'subcontractor guide links contractor permit intelligence topic');
assert.match(subcontractor, /href="\/topics\/nyc-commercial-renovation-permits\.html"/, 'subcontractor guide links commercial renovation topic');
assert.match(subcontractor, /href="\/preview\.html"/, 'subcontractor guide links preview');
assert.match(subcontractor, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'subcontractor guide links sample CSV');
assert.match(subcontractor, /href="\/current-issue\.html"/, 'subcontractor guide links current issue page');
assert.match(subcontractor, /href="\/sample-segments\.html"/, 'subcontractor guide links segment hub');
assert.match(subcontractor, /href="\/who-should-buy\.html"/, 'subcontractor guide links who should buy page');
assert.match(subcontractor, /href="\/free-vs-paid\.html"/, 'subcontractor guide links free vs paid page');
assert.match(subcontractor, /href="\/permit-research-workflow\.html"/, 'subcontractor guide links research workflow page');
assert.match(subcontractor, /href="\/contractor-supplier-permit-research\.html"/, 'subcontractor guide links contractor and supplier guide');
assert.match(subcontractor, /href="\/material-supplier-permit-research\.html"/, 'subcontractor guide links material supplier guide');
assert.match(subcontractor, /href="\/nyc-permit-activity-by-zip\.html"/, 'subcontractor guide links ZIP activity page');
assert.doesNotMatch(subcontractor, /href="\/subcontractor-permit-research\.html"/, 'subcontractor guide must not self-link');
assert.match(subcontractor, /href="\/inside-the-zip\.html"/, 'subcontractor guide links inside ZIP');
assert.match(subcontractor, /href="\/csv-field-guide\.html"/, 'subcontractor guide links CSV field guide');
assert.match(subcontractor, /href="\/time-saved-calculator\.html"/, 'subcontractor guide links time saved calculator');
assert.match(subcontractor, /href="\/pricing\.html"/, 'subcontractor guide links pricing');
assert.match(subcontractor, /href="\/support\.html"/, 'subcontractor guide links support');
assert.match(subcontractor, new RegExp(`href="${purchaseUrl}"`), 'subcontractor guide links tracked buy page');
assertSampleRequestForm(subcontractor, 'subcontractor guide');
assert.match(subcontractor, /No guaranteed leads\./, 'subcontractor guide keeps claims boundary visible');
assert.match(subcontractor, /No owner names/, 'subcontractor guide keeps private-contact boundary visible');
assert.match(subcontractor, /estimating advice/, 'subcontractor guide keeps advice boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(subcontractor, pattern, `subcontractor-permit-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(subcontractor, pattern, `subcontractor-permit-research.html contains private data pattern ${pattern}`);
}

const buyerGuide = read('buyer-guide.html');
assert.match(buyerGuide, /<title>Buyer Guide \| NYC Construction Activity ZIP<\/title>/, 'buyer guide needs title');
assert.match(buyerGuide, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/buyer-guide\.html">/, 'buyer guide needs canonical');
assert.match(buyerGuide, /<meta property="og:title" content="Buyer Guide \| NYC Construction Activity ZIP">/, 'buyer guide needs OG title');
assert.match(buyerGuide, /src="\/assets\/current-issue-snapshot\.png"/, 'buyer guide needs current issue snapshot image');
assert.match(buyerGuide, /"@type":"Product"/, 'buyer guide needs Product structured data');
assert.match(buyerGuide, /"@type":"Offer"/, 'buyer guide needs Offer structured data');
assert.match(buyerGuide, /"price":"9.50"/, 'buyer guide needs current price structured data');
assert.match(buyerGuide, /"@type":"FAQPage"/, 'buyer guide needs FAQ structured data');
assert.match(buyerGuide, /\/_vercel\/insights\/script\.js/, 'buyer guide needs Web Analytics script');
assert.match(buyerGuide, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=buyer-guide-top"/, 'buyer guide has above-fold checkout CTA');
assert.match(buyerGuide, /Stripe checkout opens after your click\. Use the CSV preview first if you need to confirm the row shape\./, 'buyer guide explains top CTA checkout path');
assert.match(buyerGuide, /Free preview rows: 25\./, 'buyer guide needs free preview count');
assert.match(buyerGuide, /Paid ZIP rows: 142\./, 'buyer guide needs paid row count');
assert.match(buyerGuide, /Buyer workbook for a fast review pass/, 'buyer guide needs buyer workbook copy');
assert.match(buyerGuide, /Priority-slices CSV grouped by work type/, 'buyer guide needs priority-slices copy');
assert.match(buyerGuide, /href="\/preview\.html"/, 'buyer guide links public preview page');
assert.match(buyerGuide, /href="\/pricing\.html"/, 'buyer guide links pricing page');
assert.match(buyerGuide, /href="\/free-vs-paid\.html"/, 'buyer guide links free vs paid page');
assert.match(buyerGuide, /href="\/permit-research-workflow\.html"/, 'buyer guide links research workflow page');
assert.match(buyerGuide, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'buyer guide links sample CSV');
assert.match(buyerGuide, /href="\/sample-segments\.html"/, 'buyer guide links segment hub');
assert.match(buyerGuide, /href="\/inside-the-zip\.html"/, 'buyer guide links inside the ZIP page');
assert.match(buyerGuide, /href="\/csv-field-guide\.html"/, 'buyer guide links CSV field guide');
assert.match(buyerGuide, /href="\/delivery\.html"/, 'buyer guide links delivery page');
assert.match(buyerGuide, /href="\/support\.html"/, 'buyer guide links support page');
assert.match(buyerGuide, /href="\/methodology\.html"/, 'buyer guide links methodology');
assert.match(buyerGuide, /<h2>Buying paths<\/h2>/, 'buyer guide exposes alternate buying paths');
assert.match(buyerGuide, /href="\/invoice-request\.html\?source=buyer-guide-paths"/, 'buyer guide links invoice request path');
assert.match(buyerGuide, /href="\/team-license\.html\?source=buyer-guide-paths"/, 'buyer guide links team license path');
assert.match(buyerGuide, /href="\/custom-research\.html\?source=buyer-guide-paths"/, 'buyer guide links custom research path');
assert.match(buyerGuide, /href="\/partner-inquiry\.html\?source=buyer-guide-paths"/, 'buyer guide links partner inquiry path');
assert.match(buyerGuide, new RegExp(`href="${purchaseUrl}"`), 'buyer guide links tracked buy page');
assertSampleRequestForm(buyerGuide, 'buyer guide');
assert.match(buyerGuide, /No guaranteed leads\./, 'buyer guide keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(buyerGuide, pattern, `buyer-guide.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(buyerGuide, pattern, `buyer-guide.html contains private data pattern ${pattern}`);
}

const delivery = read('delivery.html');
assert.match(delivery, /<title>Delivery \| NYC Construction Activity Brief<\/title>/, 'delivery page needs title');
assert.match(delivery, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/delivery\.html">/, 'delivery page needs canonical');
assert.match(delivery, /<meta property="og:title" content="Delivery \| NYC Construction Activity Brief">/, 'delivery page needs OG title');
assert.match(delivery, /"@type":"Product"/, 'delivery page needs Product structured data');
assert.match(delivery, /"@type":"Offer"/, 'delivery page needs Offer structured data');
assert.match(delivery, /"@type":"FAQPage"/, 'delivery page needs FAQ structured data');
assert.match(delivery, /\/_vercel\/insights\/script\.js/, 'delivery page needs Web Analytics script');
assert.match(delivery, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=delivery-top"/, 'delivery page has above-fold checkout CTA');
assert.match(delivery, /Stripe checkout opens after your click\. Use the CSV preview first if you need to confirm the row shape\./, 'delivery page explains top CTA checkout path');
assert.match(delivery, /creates a product-scoped Stripe Checkout Session/, 'delivery page explains first-party checkout session');
assert.match(delivery, /Payment Link kept as fallback/, 'delivery page explains Payment Link fallback');
assert.doesNotMatch(delivery, /Payment Link is product-scoped/, 'delivery page must not describe Payment Link as the primary path');
assert.match(delivery, /success\.html\?session_id=\{CHECKOUT_SESSION_ID\}/, 'delivery page explains success redirect');
assert.match(delivery, /\/api\/download/, 'delivery page explains download endpoint');
assert.match(delivery, /Paid ZIP rows: 142\./, 'delivery page needs paid row count');
assert.match(delivery, /Free preview rows: 25\./, 'delivery page needs free preview count');
assert.match(delivery, /nyc-weekly-construction-activity-brief-current\.zip/, 'delivery page names ZIP file');
assert.match(delivery, /rejects missing, invalid, or unpaid sessions/i, 'delivery page explains download gate');
assert.match(delivery, /href="\/preview\.html"/, 'delivery page links public preview page');
assert.match(delivery, /href="\/pricing\.html"/, 'delivery page links pricing page');
assert.match(delivery, /href="\/buyer-guide\.html"/, 'delivery page links buyer guide');
assert.match(delivery, /href="\/inside-the-zip\.html"/, 'delivery page links inside the ZIP page');
assert.match(delivery, /href="\/free-vs-paid\.html"/, 'delivery page links free vs paid page');
assert.match(delivery, /href="\/permit-research-workflow\.html"/, 'delivery page links research workflow page');
assert.match(delivery, /href="\/csv-field-guide\.html"/, 'delivery page links CSV field guide');
assert.match(delivery, /href="\/support\.html"/, 'delivery page links support page');
assert.match(delivery, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'delivery page links sample CSV');
assert.match(delivery, new RegExp(`href="${purchaseUrl}"`), 'delivery page links tracked buy page');
assertSampleRequestForm(delivery, 'delivery page');
assert.match(delivery, /No physical item ships\./, 'delivery page explains digital delivery');
assert.match(delivery, /not a guaranteed lead list/, 'delivery page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(delivery, pattern, `delivery.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(delivery, pattern, `delivery.html contains private data pattern ${pattern}`);
}

const support = read('support.html');
assert.match(support, /<title>Support and Refunds \| NYC Construction Activity Brief<\/title>/, 'support page needs title');
assert.match(support, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/support\.html">/, 'support page needs canonical');
assert.match(support, /<meta property="og:title" content="Support and Refunds \| NYC Construction Activity Brief">/, 'support page needs OG title');
assert.match(support, /"@type":"Product"/, 'support page needs Product structured data');
assert.match(support, /"@type":"FAQPage"/, 'support page needs FAQ structured data');
assert.match(support, /\/_vercel\/insights\/script\.js/, 'support page needs Web Analytics script');
assert.match(support, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=support-top"/, 'support page has above-fold checkout CTA');
assert.match(support, /Stripe checkout opens after your click\. Use the CSV preview first if you need to confirm the row shape\./, 'support page explains top CTA checkout path');
assert.match(support, /success\.html\?session_id=\{CHECKOUT_SESSION_ID\}/, 'support page explains success redirect');
assert.match(support, /\/api\/download/, 'support page explains download gate');
assert.match(support, /missing_or_invalid_session_id/, 'support page explains missing session error');
assert.match(support, /payment_required/, 'support page explains unpaid session error');
assert.match(support, /Stripe did not confirm a paid completed Checkout Session for this product/, 'support page describes product-scoped payment gate');
assert.doesNotMatch(support, /accepted Payment Link/, 'support page must not describe Payment Link as the only accepted path');
assert.match(support, /session_verification_failed/, 'support page explains verification error');
assert.match(support, /download_not_configured/, 'support page explains configuration error');
assert.match(support, /Refund review should be based on duplicate charge, failed paid-session delivery, or a product file problem/, 'support page states refund boundary');
assert.match(support, /Do not send card numbers/, 'support page warns against sending sensitive payment data');
assert.match(support, /href="\/delivery\.html"/, 'support page links delivery');
assert.match(support, /href="\/inside-the-zip\.html"/, 'support page links inside ZIP');
assert.match(support, /href="\/free-vs-paid\.html"/, 'support page links free vs paid page');
assert.match(support, /href="\/permit-research-workflow\.html"/, 'support page links research workflow page');
assert.match(support, /href="\/csv-field-guide\.html"/, 'support page links CSV field guide');
assert.match(support, /href="\/preview\.html"/, 'support page links preview');
assert.match(support, new RegExp(`href="${purchaseUrl}"`), 'support page links tracked buy page');
assertSampleRequestForm(support, 'support page');
assert.match(support, /No guaranteed leads/, 'support page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(support, pattern, `support.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(support, pattern, `support.html contains private data pattern ${pattern}`);
}

const sampleRequest = read('sample-request.html');
assert.match(sampleRequest, /<title>Request a Sample Cut \| NYC Construction Activity Brief<\/title>/, 'sample request page needs title');
assert.match(sampleRequest, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/sample-request\.html">/, 'sample request page needs canonical');
assert.match(sampleRequest, /<meta property="og:title" content="Request a Sample Cut \| NYC Construction Activity Brief">/, 'sample request page needs OG title');
assert.match(sampleRequest, /"@type":"Product"/, 'sample request page needs Product structured data');
assert.match(sampleRequest, /"@type":"FAQPage"/, 'sample request page needs FAQ structured data');
assert.match(sampleRequest, /\/_vercel\/insights\/script\.js/, 'sample request page needs Web Analytics script');
assert.match(sampleRequest, /Request a future sample cut/, 'sample request page needs headline');
assert.match(sampleRequest, /Product-specific request only/, 'sample request page needs product-specific meta copy');
assert.match(sampleRequest, /work type, territory, or buyer view/, 'sample request page explains request scope');
assert.match(sampleRequest, /Requests are used only for this product's buyer segment/, 'sample request page states product-only routing');
assert.match(sampleRequest, /142 source-linked rows for the 2026-06-09 to 2026-06-15 source window\. Latest issued row in the file: 2026-06-12\./, 'sample request page states source window and latest issued row consistently');
assert.doesNotMatch(sampleRequest, /142 source-linked rows for 2026-06-09 through 2026-06-12/, 'sample request page must not confuse source window with latest issued row');
assert.match(sampleRequest, /Do not send private account details/, 'sample request page warns against sensitive data');
assert.match(sampleRequest, /href="\/preview\.html"/, 'sample request page links preview');
assert.match(sampleRequest, /href="\/sample-segments\.html"/, 'sample request page links segment hub');
assert.match(sampleRequest, /href="\/current-issue\.html"/, 'sample request page links current issue');
assert.match(sampleRequest, /href="\/inside-the-zip\.html"/, 'sample request page links inside ZIP');
assert.match(sampleRequest, /href="\/pricing\.html"/, 'sample request page links pricing');
assert.match(sampleRequest, /href="\/support\.html"/, 'sample request page links support');
assert.match(sampleRequest, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=sample-request-page"/, 'sample request page links tracked buy page');
assertSampleRequestForm(sampleRequest, 'sample request page');
assert.match(sampleRequest, /No guaranteed leads\./, 'sample request page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(sampleRequest, pattern, `sample-request.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(sampleRequest, pattern, `sample-request.html contains private data pattern ${pattern}`);
}

const hub = read('sample-segments.html');
assert.match(hub, /<title>NYC Permit Activity Segments \| ZIP and Work Type Pages<\/title>/, 'hub needs title');
assert.match(hub, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/sample-segments\.html">/, 'hub needs canonical');
assert.match(hub, /<link rel="alternate" type="application\/rss\+xml"[^>]+href="https:\/\/nycpermitbrief\.com\/feed\.xml">/, 'hub links RSS feed');
assert.match(hub, /<link rel="alternate" type="application\/feed\+json"[^>]+href="https:\/\/nycpermitbrief\.com\/feed\.json">/, 'hub links JSON Feed');
assert.match(hub, /<link rel="alternate" type="application\/json"[^>]+href="https:\/\/nycpermitbrief\.com\/current-issue\.json">/, 'hub links current issue JSON');
assert.match(hub, /\/_vercel\/insights\/script\.js/, 'hub needs Web Analytics script');
assert.match(hub, /src="\/assets\/current-issue-snapshot\.png"/, 'hub needs current issue snapshot image');
assert.match(hub, /data-sample-request-form/, 'hub needs sample request form');
assert.match(hub, /\/api\/sample-request/, 'hub posts sample requests to API');
assert.match(hub, /data\.source_path = window\.location\.pathname;/, 'hub sends source path with sample request');
assert.match(hub, /data\.entry_source = \/\^\[a-z0-9\._-\]\{1,80\}\$\/i\.test\(rawEntrySource\) \? rawEntrySource : '';/, 'hub sends safe entry source with sample request');
assert.match(hub, /const requestSource = \['sample-request', window\.location\.pathname\.replace/, 'hub builds page-specific sample request checkout source');
assert.match(hub, /eventPrefix \+ '_submitted'/, 'hub tracks sample request submit attempts');
assert.match(hub, /eventPrefix \+ '_saved'/, 'hub tracks saved sample requests');
assert.match(hub, /eventPrefix \+ '_failed'/, 'hub tracks failed sample requests');
assert.match(hub, /eventPrefix \+ '_cta_clicked'/, 'hub tracks sample request CTA clicks');
assert.match(hub, /encodeURIComponent\(requestSource\)/, 'hub links buy page with page-specific sample request source');
assert.match(hub, /href="\/preview\.html"/, 'hub links public preview page');
assert.match(hub, /href="\/pricing\.html"/, 'hub links pricing page');
assert.match(hub, /href="\/who-should-buy\.html"/, 'hub links who should buy page');
assert.match(hub, /href="\/free-vs-paid\.html"/, 'hub links free vs paid page');
assert.match(hub, /href="\/permit-research-workflow\.html"/, 'hub links research workflow page');
assert.match(hub, /href="\/inside-the-zip\.html"/, 'hub links inside the ZIP page');
assert.match(hub, /href="\/csv-field-guide\.html"/, 'hub links CSV field guide');
assert.match(hub, /href="\/support\.html"/, 'hub links support page');
assert.match(hub, /<h2>Popular search paths<\/h2>/, 'hub exposes popular search paths');
assert.match(hub, /data-segment-hub-search-path/, 'hub tags popular search path links');
assert.match(hub, /segment_hub_search_path_clicked/, 'hub tracks popular search path clicks');
assert.match(hub, /href="\/nyc-permit-activity-by-zip\.html"/, 'hub links ZIP search path');
assert.match(hub, /href="\/nyc-dob-permit-csv\.html"/, 'hub links CSV search path');
assert.match(hub, /href="\/nyc-construction-permit-leads\.html"/, 'hub links permit leads search path');
assert.match(hub, /href="\/weekly-nyc-construction-permit-report\.html"/, 'hub links weekly report search path');
assert.match(hub, /href="\/contractor-supplier-permit-research\.html"/, 'hub links contractor supplier search path');
assert.match(hub, /href="\/buyer-guide\.html"/, 'hub links buyer guide search path');
assert.match(hub, /<h2>Request paths<\/h2>/, 'hub exposes buyer request paths');
assert.match(hub, /data-segment-hub-request-path/, 'hub tags buyer request path links');
assert.match(hub, /segment_hub_path_clicked/, 'hub tracks buyer request path clicks');
assert.match(hub, /segmentHubDestination\(link\)/, 'hub normalizes click destinations');
assert.match(hub, /href="\/invoice-request\.html\?source=segment-hub-paths"/, 'hub links invoice request path');
assert.match(hub, /href="\/team-license\.html\?source=segment-hub-paths"/, 'hub links team request path');
assert.match(hub, /href="\/custom-research\.html\?source=segment-hub-paths"/, 'hub links custom research request path');
assert.match(hub, /href="\/partner-inquiry\.html\?source=segment-hub-paths"/, 'hub links partner request path');
assert.match(hub, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'hub links sample CSV');
assert.match(hub, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'hub links sample brief');
assert.match(hub, /"url":"https:\/\/nycpermitbrief\.com\/checkout\.html\?source=segment-hub"/, 'hub Product schema links checkout bridge');
assert.match(hub, /"@type":"ItemList"/, 'hub needs ItemList structured data');
assert.match(hub, new RegExp(`"numberOfItems":${pages.length}`), 'hub ItemList count matches all topic pages');
assert.match(hub, /"url":"https:\/\/nycpermitbrief\.com\/topics\/nyc-dob-permits-zip-10003\.html"/, 'hub ItemList includes generated segment URLs');
assert.match(hub, /<h2>Curated buyer-intent pages<\/h2>/, 'hub lists curated buyer-intent pages');
assert.match(hub, /href="\/topics\/nyc-construction-permit-data-for-journalists\.html"/, 'hub links journalist permit data topic page');
assert.match(hub, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=segment-hub"/, 'hub post-review CTA links checkout bridge');
for (const page of generatedPages) {
  assert.match(hub, new RegExp(`href="/${page}"`), `hub links ${page}`);
}
for (const page of pageData) {
  assert.match(hub, new RegExp(`href="/topics/${page.slug}\\.html"`), `hub links curated ${page.slug}`);
}

const journalistPermitData = read('topics/nyc-construction-permit-data-for-journalists.html');
assert.match(journalistPermitData, /<title>NYC Construction Permit Data for Journalists \| DOB Brief<\/title>/, 'journalist topic page needs title');
assert.match(journalistPermitData, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/topics\/nyc-construction-permit-data-for-journalists\.html">/, 'journalist topic page needs canonical');
assert.match(journalistPermitData, /Journalists, newsroom researchers, civic-data writers/, 'journalist topic page names audience');
assert.match(journalistPermitData, /It does not provide private contacts, full street addresses, legal advice, or a complete DOB database\./, 'journalist topic page keeps boundary clear');
assert.match(journalistPermitData, /value="Journalist permit research"/, 'journalist topic page seeds sample request work type');
assertSampleRequestForm(journalistPermitData, 'journalist topic page');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(journalistPermitData, pattern, `topics/nyc-construction-permit-data-for-journalists.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(journalistPermitData, pattern, `topics/nyc-construction-permit-data-for-journalists.html contains private data pattern ${pattern}`);
}

const datasetCatalog = read('dataset-catalog.html');
assert.match(datasetCatalog, /<title>NYC Construction Permit Dataset Catalog \| DOB Brief<\/title>/, 'dataset catalog needs title');
assert.match(datasetCatalog, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/dataset-catalog\.html">/, 'dataset catalog needs canonical');
assert.match(datasetCatalog, /"@type":"Dataset"/, 'dataset catalog needs Dataset structured data');
assert.match(datasetCatalog, /"identifier":"rbx6-tga4"/, 'dataset catalog names source dataset id');
assert.match(datasetCatalog, /"temporalCoverage":"2026-06-09\/2026-06-12"/, 'dataset catalog needs current source date range');
assert.match(datasetCatalog, /"@type":"DataDownload"/, 'dataset catalog needs DataDownload structured data');
assert.match(datasetCatalog, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'dataset catalog links CSV preview');
assert.match(datasetCatalog, /href="\/data-package\.json"/, 'dataset catalog links data package JSON');
assert.match(datasetCatalog, /href="\/product-feed\.xml"/, 'dataset catalog links product feed XML');
assert.match(datasetCatalog, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=dataset-catalog"/, 'dataset catalog links tracked buy page');
assert.match(datasetCatalog, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=dataset-catalog"/, 'dataset catalog conversion bar links tracked checkout');
assert.match(datasetCatalog, /No owner names, applicant names, phone numbers, email addresses, full street addresses, or enriched contact data are included\./, 'dataset catalog keeps privacy boundary visible');
assert.match(datasetCatalog, /No guaranteed leads\./, 'dataset catalog keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(datasetCatalog, pattern, `dataset-catalog.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(datasetCatalog, pattern, `dataset-catalog.html contains private data pattern ${pattern}`);
}

const shareKit = read('share-kit.html');
assert.match(shareKit, /<title>NYC Construction Brief Share Kit \| DOB Permit Data<\/title>/, 'share kit needs title');
assert.match(shareKit, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/share-kit\.html">/, 'share kit needs canonical');
assert.match(shareKit, /Short newsletter blurb/, 'share kit includes newsletter blurb');
assert.match(shareKit, /Community post draft/, 'share kit includes community post draft');
assert.match(shareKit, /No private contacts, owner names, applicant names, phone numbers, email addresses, full street addresses, buyer results, or guaranteed leads\./, 'share kit keeps boundary clear');
assert.match(shareKit, /Do not claim sales volume, buyer outcomes, proprietary coverage, live freshness, or guaranteed project opportunities\./, 'share kit blocks risky claims');
assert.match(shareKit, /href="https:\/\/nycpermitbrief\.com\/buy\.html\?source=share-kit"/, 'share kit links tracked buy page');
assert.match(shareKit, /href="https:\/\/nycpermitbrief\.com\/checkout\.html\?source=share-kit"/, 'share kit conversion bar links tracked checkout');
assert.match(shareKit, /data-share-kit-path="buy"/, 'share kit tags buy path');
assert.match(shareKit, /data-share-kit-path="preview"/, 'share kit tags preview path');
assert.match(shareKit, /data-share-kit-path="sample-request"/, 'share kit tags sample request path');
assert.match(shareKit, /data-share-kit-path="sticky-checkout"/, 'share kit tags sticky checkout path');
assert.match(shareKit, /share_kit_path_clicked/, 'share kit tracks path clicks');
assert.match(shareKit, /path_type: link\.dataset\.shareKitPath/, 'share kit sends path type');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(shareKit, pattern, `share-kit.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(shareKit, pattern, `share-kit.html contains private data pattern ${pattern}`);
}

const partnerInquiry = read('partner-inquiry.html');
assert.match(partnerInquiry, /<title>Partner Inquiry \| NYC Construction Activity Brief<\/title>/, 'partner inquiry needs title');
assert.match(partnerInquiry, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/partner-inquiry\.html">/, 'partner inquiry needs canonical');
assert.match(partnerInquiry, /Partner with the NYC Construction Brief\./, 'partner inquiry needs headline');
assert.match(partnerInquiry, /newsletter, community, sponsorship, or product-bundle inquiries/, 'partner inquiry explains scope');
assert.match(partnerInquiry, /does not approve posting, outreach, sponsorship spend, or payment terms/, 'partner inquiry keeps approval boundary clear');
assert.match(partnerInquiry, /Current public proof/, 'partner inquiry lists current proof');
assert.match(partnerInquiry, /No private contacts, audience guarantees, buyer outcomes, agency endorsement, contact list, or guaranteed leads\./, 'partner inquiry keeps claims boundary clear');
assert.match(partnerInquiry, /href="\/share-kit\.html"/, 'partner inquiry links share kit');
assert.match(partnerInquiry, /href="\/dataset-catalog\.html"/, 'partner inquiry links dataset catalog');
assert.match(partnerInquiry, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'partner inquiry links free CSV preview');
assert.match(partnerInquiry, /data-event-prefix="partner_request"/, 'partner inquiry tracks partner request events');
assert.match(partnerInquiry, /data-current-issue-cta="false"/, 'partner inquiry form is request-only');
assert.match(partnerInquiry, /value="Partner placement or bundle inquiry"/, 'partner inquiry seeds work type');
assert.match(partnerInquiry, /<option value="local-b2b-service-provider" selected>Local B2B service provider<\/option>/, 'partner inquiry preselects local B2B buyer type');
assert.match(partnerInquiry, /Partner inquiry saved\. I will use this to evaluate source-backed partner demand\./, 'partner inquiry has partner-specific success copy');
assert.match(partnerInquiry, /\/api\/sample-request/, 'partner inquiry posts to sample request API');
assert.match(partnerInquiry, /"@type":"FAQPage"/, 'partner inquiry needs FAQ structured data');
assert.match(partnerInquiry, /"@type":"BreadcrumbList"/, 'partner inquiry needs breadcrumb structured data');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(partnerInquiry, pattern, `partner-inquiry.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(partnerInquiry, pattern, `partner-inquiry.html contains private data pattern ${pattern}`);
}

const teamLicense = read('team-license.html');
assert.match(teamLicense, /<title>Team License Request \| NYC Construction Activity Brief<\/title>/, 'team license needs title');
assert.match(teamLicense, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/team-license\.html">/, 'team license needs canonical');
assert.match(teamLicense, /Request team or multi-issue access\./, 'team license needs headline');
assert.match(teamLicense, /team needs repeated issues, shared access, procurement review, or a custom purchase path/, 'team license explains scope');
assert.match(teamLicense, /does not create a subscription, recurring delivery, custom license, payment term, or manual fulfillment commitment/, 'team license keeps approval boundary clear');
assert.match(teamLicense, /No private contacts, guaranteed leads, audience guarantees, buyer outcomes, automatic renewal, or approved payment terms\./, 'team license keeps claims boundary clear');
assert.match(teamLicense, /data-event-prefix="team_license_request"/, 'team license tracks team request events');
assert.match(teamLicense, /data-current-issue-cta="false"/, 'team license form is request-only');
assert.match(teamLicense, /value="Team license or multi-issue access"/, 'team license seeds work type');
assert.match(teamLicense, /<option value="data-buyer" selected>Data buyer<\/option>/, 'team license preselects data buyer');
assert.match(teamLicense, /Team license request saved\. I will use this to evaluate higher-value buyer demand\./, 'team license has team-specific success copy');
assert.match(teamLicense, /\/api\/sample-request/, 'team license posts to sample request API');
assert.match(teamLicense, /"@type":"FAQPage"/, 'team license needs FAQ structured data');
assert.match(teamLicense, /"@type":"BreadcrumbList"/, 'team license needs breadcrumb structured data');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(teamLicense, pattern, `team-license.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(teamLicense, pattern, `team-license.html contains private data pattern ${pattern}`);
}

const customResearch = read('custom-research.html');
assert.match(customResearch, /<title>Custom Research Request \| NYC Construction Activity Brief<\/title>/, 'custom research needs title');
assert.match(customResearch, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/custom-research\.html">/, 'custom research needs canonical');
assert.match(customResearch, /Request a custom permit research brief\./, 'custom research needs headline');
assert.match(customResearch, /filtered public-record review for a client, territory, trade, or buying decision/, 'custom research explains scope');
assert.match(customResearch, /does not approve consulting work, custom fees, delivery dates, payment terms, or manual fulfillment/, 'custom research keeps approval boundary clear');
assert.match(customResearch, /No private contacts, guaranteed leads, legal advice, valuation advice, agency endorsement, buyer outcomes, or approved consulting scope\./, 'custom research keeps claims boundary clear');
assert.match(customResearch, /data-event-prefix="custom_research_request"/, 'custom research tracks custom request events');
assert.match(customResearch, /data-current-issue-cta="false"/, 'custom research form is request-only');
assert.match(customResearch, /value="Custom research brief"/, 'custom research seeds work type');
assert.match(customResearch, /<option value="consultant-analyst" selected>Consultant or analyst<\/option>/, 'custom research preselects consultant analyst');
assert.match(customResearch, /Custom research request saved\. I will use this to evaluate paid research demand\./, 'custom research has custom-specific success copy');
assert.match(customResearch, /\/api\/sample-request/, 'custom research posts to sample request API');
assert.match(customResearch, /"@type":"FAQPage"/, 'custom research needs FAQ structured data');
assert.match(customResearch, /"@type":"BreadcrumbList"/, 'custom research needs breadcrumb structured data');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(customResearch, pattern, `custom-research.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(customResearch, pattern, `custom-research.html contains private data pattern ${pattern}`);
}

const methodology = read('methodology.html');
assert.match(methodology, /<title>Methodology \| NYC Construction Activity Brief<\/title>/, 'methodology needs title');
assert.match(methodology, /<link rel="canonical" href="https:\/\/nycpermitbrief\.com\/methodology\.html">/, 'methodology needs canonical');
assert.match(methodology, /<link rel="alternate" type="application\/rss\+xml"[^>]+href="https:\/\/nycpermitbrief\.com\/feed\.xml">/, 'methodology links RSS feed');
assert.match(methodology, /<link rel="alternate" type="application\/feed\+json"[^>]+href="https:\/\/nycpermitbrief\.com\/feed\.json">/, 'methodology links JSON Feed');
assert.match(methodology, /<link rel="alternate" type="application\/json"[^>]+href="https:\/\/nycpermitbrief\.com\/current-issue\.json">/, 'methodology links current issue JSON');
assert.match(methodology, /NYC DOB NOW: Build - Approved Permits/, 'methodology names source dataset');
assert.match(methodology, /Latest issued row in the file:/, 'methodology needs source freshness note');
assert.match(methodology, /The public package excludes owner names/, 'methodology needs privacy boundary');
assert.match(methodology, /Not a live alert feed\./, 'methodology needs product boundary');
assert.match(methodology, /No guaranteed leads\./, 'methodology keeps claims boundary visible');
assert.match(methodology, /href="\/free-vs-paid\.html"/, 'methodology links free vs paid page');
assert.match(methodology, /href="\/permit-research-workflow\.html"/, 'methodology links research workflow page');
assert.match(methodology, /href="\/inside-the-zip\.html"/, 'methodology links inside the ZIP page');
assert.match(methodology, /href="\/csv-field-guide\.html"/, 'methodology links CSV field guide');
assert.match(methodology, /href="\/support\.html"/, 'methodology links support page');
assert.match(methodology, new RegExp(`href="${purchaseUrl}"`), 'methodology links tracked buy page');
assertSampleRequestForm(methodology, 'methodology');
assert.match(methodology, /"@type":"Dataset"/, 'methodology needs Dataset structured data');
assert.match(methodology, /"@type":"DataDownload"/, 'methodology needs DataDownload structured data');
assert.match(methodology, /"contentUrl":"https:\/\/nycpermitbrief\.com\/sample\/nyc-construction-activity-preview\.csv"/, 'methodology Dataset links CSV preview');
assert.match(methodology, new RegExp(`"temporalCoverage":"${sourceDateRange()}"`), 'methodology Dataset needs current temporal coverage');
assert.match(methodology, /"@type":"FAQPage"/, 'methodology needs FAQ structured data');

const sitemap = read('sitemap.xml');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
for (const page of ['', 'current-issue.html', 'dataset-catalog.html', 'share-kit.html', 'partner-inquiry.html', 'team-license.html', 'custom-research.html', 'preview.html', 'buy.html', 'pricing.html', 'time-saved-calculator.html', 'who-should-buy.html', 'faq.html', 'free-vs-paid.html', 'permit-research-workflow.html', 'contractor-permit-research.html', 'contractor-supplier-permit-research.html', 'material-supplier-permit-research.html', 'building-service-vendor-permit-research.html', 'subcontractor-permit-research.html', 'broker-developer-permit-research.html', 'real-estate-investor-permit-research.html', 'construction-consultant-permit-research.html', 'construction-risk-permit-research.html', 'permit-expediter-research.html', 'property-manager-permit-research.html', 'inside-the-zip.html', 'csv-field-guide.html', 'nyc-building-permit-data.html', 'nyc-building-permits.html', 'nyc-dob-permit-data-download.html', 'nyc-dob-approved-permits.html', 'nyc-dob-now-approved-permits.html', 'dob-now-build-approved-permits.html', 'nyc-dob-permit-alerts.html', 'nyc-dob-permit-tracker.html', 'nyc-dob-permit-monitoring.html', 'nyc-dob-permit-watchlist.html', 'nyc-dob-permit-search.html', 'nyc-construction-permit-search.html', 'nyc-dob-permit-lookup.html', 'nyc-dob-permit-csv.html', 'nyc-permit-data-api-alternative.html', 'weekly-nyc-construction-permit-report.html', 'dob-now-permit-search-alternative.html', 'nyc-construction-permit-leads.html', 'nyc-permit-activity-by-zip.html', 'manhattan-construction-permit-activity.html', 'brooklyn-construction-permit-activity.html', 'queens-construction-permit-activity.html', 'bronx-construction-permit-activity.html', 'staten-island-construction-permit-activity.html', 'nyc-sidewalk-shed-permits.html', 'nyc-sidewalk-shed-permit-leads.html', 'nyc-supported-scaffold-permit-leads.html', 'nyc-plumbing-permit-leads.html', 'nyc-plumbing-permits.html', 'nyc-sprinkler-permit-leads.html', 'nyc-sprinkler-permits.html', 'nyc-mechanical-systems-permit-leads.html', 'nyc-structural-permit-leads.html', 'nyc-construction-fence-permit-leads.html', 'buyer-guide.html', 'delivery.html', 'support.html', 'sample-request.html', 'invoice-request.html', 'sample-segments.html', 'methodology.html', 'sample/nyc-construction-activity-preview.csv', 'sample/nyc-construction-activity-preview.json', 'sample/nyc-construction-activity-preview.jsonl', 'sample/nyc-weekly-construction-activity-sample.md', 'feed.json', ...pages]) {
  const url = page ? `${baseUrl}/${page}` : `${baseUrl}/`;
  assert.match(sitemap, new RegExp(`<loc>${url}</loc>`), `sitemap includes ${url}`);
}
assert.doesNotMatch(sitemap, new RegExp(`<loc>${baseUrl}\\/checkout\\.html</loc>`), 'sitemap must not include noindex checkout page');
for (const page of ['feed.xml', 'feed.json', 'current-issue.json', 'data-package.json', 'product-feed.xml', 'llms.txt']) {
  assert.match(sitemap, new RegExp(`<loc>${baseUrl}/${page}</loc>`), `sitemap includes ${page}`);
}
const sitemapUrlCount = (sitemap.match(/<loc>/g) || []).length;
assert.equal(sitemapUrlCount, pages.length + 83, 'sitemap URL count must match generated surface and discovery files');
const sitemapLastmodCount = (sitemap.match(new RegExp(`<lastmod>${manifest.sourceFetchDate}</lastmod>`, 'g')) || []).length;
assert.equal(sitemapLastmodCount, sitemapUrlCount, 'sitemap needs accurate lastmod for every URL');

const robots = read('robots.txt');
assert.match(robots, /User-agent: \*/);
assert.match(robots, new RegExp(`Sitemap: ${baseUrl}/sitemap.xml`));
assert.match(robots, new RegExp(`Feed: ${baseUrl}/feed.xml`), 'robots points to RSS feed');
assert.match(robots, new RegExp(`Current-Issue: ${baseUrl}/current-issue.json`), 'robots points to current issue JSON');
assert.match(robots, new RegExp(`Data-Package: ${baseUrl}/data-package.json`), 'robots points to data package JSON');
assert.match(robots, new RegExp(`Product-Feed: ${baseUrl}/product-feed.xml`), 'robots points to product feed XML');
assert.match(robots, new RegExp(`Dataset-Catalog: ${baseUrl}/dataset-catalog.html`), 'robots points to dataset catalog');
assert.match(robots, new RegExp(`Share-Kit: ${baseUrl}/share-kit.html`), 'robots points to share kit');
assert.match(robots, new RegExp(`Invoice-Request: ${baseUrl}/invoice-request.html`), 'robots points to invoice request');
assert.match(robots, new RegExp(`Partner-Inquiry: ${baseUrl}/partner-inquiry.html`), 'robots points to partner inquiry');
assert.match(robots, new RegExp(`Team-License: ${baseUrl}/team-license.html`), 'robots points to team license');
assert.match(robots, new RegExp(`Custom-Research: ${baseUrl}/custom-research.html`), 'robots points to custom research');

const currentIssue = JSON.parse(read('current-issue.json'));
const dataPackage = JSON.parse(read('data-package.json'));
assert.equal(currentIssue.product, 'NYC Weekly Construction Activity Brief', 'current issue JSON names product');
assert.equal(currentIssue.issue, 'current', 'current issue JSON marks current issue');
assert.equal(currentIssue.publicPreview.rowCount, 25, 'current issue JSON row count matches public preview');
assert.equal(currentIssue.publicPreview.fullIssueRowCount, manifest.sourceRows, 'current issue JSON full issue row count matches manifest');
assert.equal(currentIssue.publicPreview.currentIssueUrl, 'https://nycpermitbrief.com/current-issue.html', 'current issue JSON public preview links current issue page');
assert.equal(currentIssue.publicPreview.previewUrl, 'https://nycpermitbrief.com/preview.html', 'current issue JSON links public preview page');
assert.equal(currentIssue.publicPreview.csvUrl, 'https://nycpermitbrief.com/sample/nyc-construction-activity-preview.csv', 'current issue JSON links public CSV preview');
assert.equal(currentIssue.publicPreview.jsonUrl, 'https://nycpermitbrief.com/sample/nyc-construction-activity-preview.json', 'current issue JSON links public JSON preview');
assert.equal(currentIssue.publicPreview.jsonlUrl, 'https://nycpermitbrief.com/sample/nyc-construction-activity-preview.jsonl', 'current issue JSON links public JSONL preview');
assert.equal(currentIssue.publicPreview.sampleBriefUrl, 'https://nycpermitbrief.com/sample/nyc-weekly-construction-activity-sample.md', 'current issue JSON links sample brief');
assert.equal(currentIssue.publicPreview.dataPackageUrl, 'https://nycpermitbrief.com/data-package.json', 'current issue JSON links data package JSON');
assert.equal(currentIssue.publicPreview.productFeedUrl, 'https://nycpermitbrief.com/product-feed.xml', 'current issue JSON links product feed XML');
assert.equal(currentIssue.publicPreview.pricingUrl, 'https://nycpermitbrief.com/pricing.html', 'current issue JSON public preview links pricing page');
assert.equal(currentIssue.publicPreview.timeSavedCalculatorUrl, 'https://nycpermitbrief.com/time-saved-calculator.html', 'current issue JSON public preview links time saved calculator');
assert.equal(currentIssue.publicPreview.whoShouldBuyUrl, 'https://nycpermitbrief.com/who-should-buy.html', 'current issue JSON public preview links who should buy page');
assert.equal(currentIssue.publicPreview.faqUrl, 'https://nycpermitbrief.com/faq.html', 'current issue JSON public preview links FAQ page');
assert.equal(currentIssue.publicPreview.freeVsPaidUrl, 'https://nycpermitbrief.com/free-vs-paid.html', 'current issue JSON public preview links free vs paid page');
assert.equal(currentIssue.publicPreview.researchWorkflowUrl, 'https://nycpermitbrief.com/permit-research-workflow.html', 'current issue JSON public preview links research workflow page');
assert.equal(currentIssue.publicPreview.contractorGuideUrl, 'https://nycpermitbrief.com/contractor-permit-research.html', 'current issue JSON public preview links contractor guide');
assert.equal(currentIssue.publicPreview.contractorSupplierGuideUrl, 'https://nycpermitbrief.com/contractor-supplier-permit-research.html', 'current issue JSON public preview links contractor and supplier guide');
assert.equal(currentIssue.publicPreview.materialSupplierGuideUrl, 'https://nycpermitbrief.com/material-supplier-permit-research.html', 'current issue JSON public preview links material supplier guide');
assert.equal(currentIssue.publicPreview.buildingServiceVendorGuideUrl, 'https://nycpermitbrief.com/building-service-vendor-permit-research.html', 'current issue JSON public preview links building-service vendor guide');
assert.equal(currentIssue.publicPreview.subcontractorGuideUrl, 'https://nycpermitbrief.com/subcontractor-permit-research.html', 'current issue JSON public preview links subcontractor guide');
assert.equal(currentIssue.publicPreview.brokerDeveloperGuideUrl, 'https://nycpermitbrief.com/broker-developer-permit-research.html', 'current issue JSON public preview links broker and developer guide');
assert.equal(currentIssue.publicPreview.realEstateInvestorGuideUrl, 'https://nycpermitbrief.com/real-estate-investor-permit-research.html', 'current issue JSON public preview links real estate investor guide');
assert.equal(currentIssue.publicPreview.constructionConsultantGuideUrl, 'https://nycpermitbrief.com/construction-consultant-permit-research.html', 'current issue JSON public preview links construction consultant guide');
assert.equal(currentIssue.publicPreview.constructionRiskGuideUrl, 'https://nycpermitbrief.com/construction-risk-permit-research.html', 'current issue JSON public preview links construction risk guide');
assert.equal(currentIssue.publicPreview.permitExpediterGuideUrl, 'https://nycpermitbrief.com/permit-expediter-research.html', 'current issue JSON public preview links permit expediter guide');
assert.equal(currentIssue.publicPreview.propertyManagerGuideUrl, 'https://nycpermitbrief.com/property-manager-permit-research.html', 'current issue JSON public preview links property manager guide');
assert.equal(currentIssue.publicPreview.insideZipUrl, 'https://nycpermitbrief.com/inside-the-zip.html', 'current issue JSON public preview links inside ZIP page');
assert.equal(currentIssue.publicPreview.buildingPermitDataUrl, 'https://nycpermitbrief.com/nyc-building-permit-data.html', 'current issue JSON public preview links building permit data page');
assert.equal(currentIssue.publicPreview.buildingPermitsUrl, 'https://nycpermitbrief.com/nyc-building-permits.html', 'current issue JSON public preview links building permits page');
assert.equal(currentIssue.publicPreview.permitDataDownloadUrl, 'https://nycpermitbrief.com/nyc-dob-permit-data-download.html', 'current issue JSON public preview links permit data download page');
assert.equal(currentIssue.publicPreview.dobNowApprovedPermitsUrl, 'https://nycpermitbrief.com/nyc-dob-now-approved-permits.html', 'current issue JSON public preview links DOB NOW approved permits page');
assert.equal(currentIssue.publicPreview.dobNowBuildApprovedPermitsUrl, 'https://nycpermitbrief.com/dob-now-build-approved-permits.html', 'current issue JSON public preview links DOB NOW Build approved permits page');
assert.equal(currentIssue.publicPreview.dobPermitAlertsUrl, 'https://nycpermitbrief.com/nyc-dob-permit-alerts.html', 'current issue JSON public preview links DOB permit alerts page');
assert.equal(currentIssue.publicPreview.dobPermitTrackerUrl, 'https://nycpermitbrief.com/nyc-dob-permit-tracker.html', 'current issue JSON public preview links DOB permit tracker page');
assert.equal(currentIssue.publicPreview.dobPermitMonitoringUrl, 'https://nycpermitbrief.com/nyc-dob-permit-monitoring.html', 'current issue JSON public preview links DOB permit monitoring page');
assert.equal(currentIssue.publicPreview.dobPermitWatchlistUrl, 'https://nycpermitbrief.com/nyc-dob-permit-watchlist.html', 'current issue JSON public preview links DOB permit watchlist page');
assert.equal(currentIssue.publicPreview.constructionPermitSearchUrl, 'https://nycpermitbrief.com/nyc-construction-permit-search.html', 'current issue JSON public preview links construction permit search page');
assert.equal(currentIssue.publicPreview.dobPermitLookupUrl, 'https://nycpermitbrief.com/nyc-dob-permit-lookup.html', 'current issue JSON public preview links DOB permit lookup page');
assert.equal(currentIssue.publicPreview.permitCsvUrl, 'https://nycpermitbrief.com/nyc-dob-permit-csv.html', 'current issue JSON public preview links permit CSV page');
assert.equal(currentIssue.publicPreview.permitDataApiAlternativeUrl, 'https://nycpermitbrief.com/nyc-permit-data-api-alternative.html', 'current issue JSON public preview links permit data API alternative page');
assert.equal(currentIssue.publicPreview.weeklyPermitReportUrl, 'https://nycpermitbrief.com/weekly-nyc-construction-permit-report.html', 'current issue JSON public preview links weekly report page');
assert.equal(currentIssue.publicPreview.dobNowAlternativeUrl, 'https://nycpermitbrief.com/dob-now-permit-search-alternative.html', 'current issue JSON public preview links DOB NOW alternative page');
assert.equal(currentIssue.publicPreview.permitLeadsUrl, 'https://nycpermitbrief.com/nyc-construction-permit-leads.html', 'current issue JSON public preview links permit leads page');
assert.equal(currentIssue.publicPreview.permitActivityByZipUrl, 'https://nycpermitbrief.com/nyc-permit-activity-by-zip.html', 'current issue JSON public preview links ZIP permit activity page');
assert.equal(currentIssue.publicPreview.manhattanPermitActivityUrl, 'https://nycpermitbrief.com/manhattan-construction-permit-activity.html', 'current issue JSON public preview links Manhattan permit activity page');
assert.equal(currentIssue.publicPreview.brooklynPermitActivityUrl, 'https://nycpermitbrief.com/brooklyn-construction-permit-activity.html', 'current issue JSON public preview links Brooklyn permit activity page');
assert.equal(currentIssue.publicPreview.sidewalkShedPermitsUrl, 'https://nycpermitbrief.com/nyc-sidewalk-shed-permits.html', 'current issue JSON public preview links sidewalk shed permits page');
assert.equal(currentIssue.publicPreview.sidewalkShedPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-sidewalk-shed-permit-leads.html', 'current issue JSON public preview links sidewalk shed permit leads page');
assert.equal(currentIssue.publicPreview.plumbingPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-plumbing-permit-leads.html', 'current issue JSON public preview links plumbing permit leads page');
assert.equal(currentIssue.publicPreview.plumbingPermitsUrl, 'https://nycpermitbrief.com/nyc-plumbing-permits.html', 'current issue JSON public preview links plumbing permits page');
assert.equal(currentIssue.publicPreview.sprinklerPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-sprinkler-permit-leads.html', 'current issue JSON public preview links sprinkler permit leads page');
assert.equal(currentIssue.publicPreview.sprinklerPermitsUrl, 'https://nycpermitbrief.com/nyc-sprinkler-permits.html', 'current issue JSON public preview links sprinkler permits page');
assert.equal(currentIssue.publicPreview.mechanicalSystemsPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-mechanical-systems-permit-leads.html', 'current issue JSON public preview links mechanical systems permit leads page');
assert.equal(currentIssue.publicPreview.mechanicalSystemsPermitsUrl, 'https://nycpermitbrief.com/nyc-mechanical-systems-permits.html', 'current issue JSON public preview links mechanical systems permits page');
assert.equal(currentIssue.publicPreview.supportedScaffoldPermitsUrl, 'https://nycpermitbrief.com/nyc-supported-scaffold-permits.html', 'current issue JSON public preview links supported scaffold permits page');
assert.equal(currentIssue.publicPreview.supportedScaffoldPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-supported-scaffold-permit-leads.html', 'current issue JSON public preview links supported scaffold permit leads page');
assert.equal(currentIssue.publicPreview.structuralPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-structural-permit-leads.html', 'current issue JSON public preview links structural permit leads page');
assert.equal(currentIssue.publicPreview.structuralPermitsUrl, 'https://nycpermitbrief.com/nyc-structural-permits.html', 'current issue JSON public preview links structural permits page');
assert.equal(currentIssue.publicPreview.constructionFencePermitLeadsUrl, 'https://nycpermitbrief.com/nyc-construction-fence-permit-leads.html', 'current issue JSON public preview links construction fence permit leads page');
assert.equal(currentIssue.publicPreview.constructionFencePermitsUrl, 'https://nycpermitbrief.com/nyc-construction-fence-permits.html', 'current issue JSON public preview links construction fence permits page');
assert.equal(currentIssue.publicPreview.purchaseUrl, 'https://nycpermitbrief.com/buy.html', 'current issue JSON public preview exposes buy page as purchase URL');
assert.equal(currentIssue.publicPreview.checkoutUrl, 'https://nycpermitbrief.com/checkout.html?source=current-issue', 'current issue JSON links tracked checkout');
assert.equal(currentIssue.publicPreview.checkoutBridgeUrl, 'https://nycpermitbrief.com/checkout.html?source=current-issue', 'current issue JSON public preview exposes checkout bridge URL');
assert.equal(currentIssue.publicPreview.stripeFallbackUrl, 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q', 'current issue JSON keeps Stripe fallback URL');
assert.equal(currentIssue.publicPreview.stripeCheckoutUrl, undefined, 'current issue JSON does not expose Stripe fallback as primary checkout URL');
assert.equal(currentIssue.publicPreview.buyerGuideUrl, 'https://nycpermitbrief.com/buyer-guide.html', 'current issue JSON public preview links buyer guide');
assert.equal(currentIssue.publicPreview.deliveryUrl, 'https://nycpermitbrief.com/delivery.html', 'current issue JSON public preview links delivery page');
assert.equal(currentIssue.publicPreview.supportUrl, 'https://nycpermitbrief.com/support.html', 'current issue JSON public preview links support page');
assert.equal(currentIssue.publicPreview.sampleRequestUrl, 'https://nycpermitbrief.com/sample-request.html', 'current issue JSON public preview links sample request page');
assert.equal(currentIssue.publicPreview.imageUrl, 'https://nycpermitbrief.com/assets/current-issue-snapshot.png', 'current issue JSON public preview links social image');
assert.equal(currentIssue.publicPreview.buyUrl, 'https://nycpermitbrief.com/buy.html', 'current issue JSON public preview links buy page');
assert.equal(currentIssue.paidZip.buyerGuideUrl, 'https://nycpermitbrief.com/buyer-guide.html', 'current issue JSON paid ZIP links buyer guide');
assert.equal(currentIssue.paidZip.deliveryUrl, 'https://nycpermitbrief.com/delivery.html', 'current issue JSON paid ZIP links delivery page');
assert.equal(currentIssue.paidZip.supportUrl, 'https://nycpermitbrief.com/support.html', 'current issue JSON paid ZIP links support page');
assert.equal(currentIssue.paidZip.sampleRequestUrl, 'https://nycpermitbrief.com/sample-request.html', 'current issue JSON paid ZIP links sample request page');
assert.equal(currentIssue.paidZip.imageUrl, 'https://nycpermitbrief.com/assets/current-issue-snapshot.png', 'current issue JSON paid ZIP links social image');
assert.equal(currentIssue.paidZip.purchaseUrl, 'https://nycpermitbrief.com/buy.html', 'current issue JSON paid ZIP exposes buy page as purchase URL');
assert.equal(currentIssue.paidZip.checkoutUrl, 'https://nycpermitbrief.com/checkout.html?source=current-issue', 'current issue JSON paid ZIP links tracked checkout');
assert.equal(currentIssue.paidZip.checkoutBridgeUrl, 'https://nycpermitbrief.com/checkout.html?source=current-issue', 'current issue JSON paid ZIP exposes checkout bridge URL');
assert.equal(currentIssue.paidZip.buyUrl, 'https://nycpermitbrief.com/buy.html', 'current issue JSON paid ZIP links buy page');
assert.equal(currentIssue.paidZip.currentIssueUrl, 'https://nycpermitbrief.com/current-issue.html', 'current issue JSON paid ZIP links current issue page');
assert.equal(currentIssue.paidZip.stripeFallbackUrl, 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q', 'current issue JSON paid ZIP keeps Stripe fallback URL');
assert.equal(currentIssue.paidZip.stripeCheckoutUrl, undefined, 'current issue JSON paid ZIP does not expose Stripe fallback as primary checkout URL');
assert.equal(currentIssue.paidZip.pricingUrl, 'https://nycpermitbrief.com/pricing.html', 'current issue JSON paid ZIP links pricing page');
assert.equal(currentIssue.paidZip.dataPackageUrl, 'https://nycpermitbrief.com/data-package.json', 'current issue JSON paid ZIP links data package JSON');
assert.equal(currentIssue.paidZip.productFeedUrl, 'https://nycpermitbrief.com/product-feed.xml', 'current issue JSON paid ZIP links product feed XML');
assert.equal(currentIssue.paidZip.buildingPermitsUrl, 'https://nycpermitbrief.com/nyc-building-permits.html', 'current issue JSON paid ZIP links building permits page');
assert.equal(currentIssue.paidZip.dobNowApprovedPermitsUrl, 'https://nycpermitbrief.com/nyc-dob-now-approved-permits.html', 'current issue JSON paid ZIP links DOB NOW approved permits page');
assert.equal(currentIssue.paidZip.dobNowBuildApprovedPermitsUrl, 'https://nycpermitbrief.com/dob-now-build-approved-permits.html', 'current issue JSON paid ZIP links DOB NOW Build approved permits page');
assert.equal(currentIssue.paidZip.dobPermitAlertsUrl, 'https://nycpermitbrief.com/nyc-dob-permit-alerts.html', 'current issue JSON paid ZIP links DOB permit alerts page');
assert.equal(currentIssue.paidZip.dobPermitTrackerUrl, 'https://nycpermitbrief.com/nyc-dob-permit-tracker.html', 'current issue JSON paid ZIP links DOB permit tracker page');
assert.equal(currentIssue.paidZip.dobPermitMonitoringUrl, 'https://nycpermitbrief.com/nyc-dob-permit-monitoring.html', 'current issue JSON paid ZIP links DOB permit monitoring page');
assert.equal(currentIssue.paidZip.dobPermitWatchlistUrl, 'https://nycpermitbrief.com/nyc-dob-permit-watchlist.html', 'current issue JSON paid ZIP links DOB permit watchlist page');
assert.equal(currentIssue.paidZip.constructionPermitSearchUrl, 'https://nycpermitbrief.com/nyc-construction-permit-search.html', 'current issue JSON paid ZIP links construction permit search page');
assert.equal(currentIssue.paidZip.dobPermitLookupUrl, 'https://nycpermitbrief.com/nyc-dob-permit-lookup.html', 'current issue JSON paid ZIP links DOB permit lookup page');
assert.equal(currentIssue.paidZip.timeSavedCalculatorUrl, 'https://nycpermitbrief.com/time-saved-calculator.html', 'current issue JSON paid ZIP links time saved calculator');
assert.equal(currentIssue.paidZip.whoShouldBuyUrl, 'https://nycpermitbrief.com/who-should-buy.html', 'current issue JSON paid ZIP links who should buy page');
assert.equal(currentIssue.paidZip.faqUrl, 'https://nycpermitbrief.com/faq.html', 'current issue JSON paid ZIP links FAQ page');
assert.equal(currentIssue.paidZip.freeVsPaidUrl, 'https://nycpermitbrief.com/free-vs-paid.html', 'current issue JSON paid ZIP links free vs paid page');
assert.equal(currentIssue.paidZip.researchWorkflowUrl, 'https://nycpermitbrief.com/permit-research-workflow.html', 'current issue JSON paid ZIP links research workflow page');
assert.equal(currentIssue.paidZip.contractorGuideUrl, 'https://nycpermitbrief.com/contractor-permit-research.html', 'current issue JSON paid ZIP links contractor guide');
assert.equal(currentIssue.paidZip.contractorSupplierGuideUrl, 'https://nycpermitbrief.com/contractor-supplier-permit-research.html', 'current issue JSON paid ZIP links contractor and supplier guide');
assert.equal(currentIssue.paidZip.materialSupplierGuideUrl, 'https://nycpermitbrief.com/material-supplier-permit-research.html', 'current issue JSON paid ZIP links material supplier guide');
assert.equal(currentIssue.paidZip.buildingServiceVendorGuideUrl, 'https://nycpermitbrief.com/building-service-vendor-permit-research.html', 'current issue JSON paid ZIP links building-service vendor guide');
assert.equal(currentIssue.paidZip.subcontractorGuideUrl, 'https://nycpermitbrief.com/subcontractor-permit-research.html', 'current issue JSON paid ZIP links subcontractor guide');
assert.equal(currentIssue.paidZip.brokerDeveloperGuideUrl, 'https://nycpermitbrief.com/broker-developer-permit-research.html', 'current issue JSON paid ZIP links broker and developer guide');
assert.equal(currentIssue.paidZip.realEstateInvestorGuideUrl, 'https://nycpermitbrief.com/real-estate-investor-permit-research.html', 'current issue JSON paid ZIP links real estate investor guide');
assert.equal(currentIssue.paidZip.constructionConsultantGuideUrl, 'https://nycpermitbrief.com/construction-consultant-permit-research.html', 'current issue JSON paid ZIP links construction consultant guide');
assert.equal(currentIssue.paidZip.constructionRiskGuideUrl, 'https://nycpermitbrief.com/construction-risk-permit-research.html', 'current issue JSON paid ZIP links construction risk guide');
assert.equal(currentIssue.paidZip.permitExpediterGuideUrl, 'https://nycpermitbrief.com/permit-expediter-research.html', 'current issue JSON paid ZIP links permit expediter guide');
assert.equal(currentIssue.paidZip.propertyManagerGuideUrl, 'https://nycpermitbrief.com/property-manager-permit-research.html', 'current issue JSON paid ZIP links property manager guide');
assert.equal(currentIssue.paidZip.insideZipUrl, 'https://nycpermitbrief.com/inside-the-zip.html', 'current issue JSON paid ZIP links inside ZIP page');
assert.equal(currentIssue.paidZip.buildingPermitDataUrl, 'https://nycpermitbrief.com/nyc-building-permit-data.html', 'current issue JSON paid ZIP links building permit data page');
assert.equal(currentIssue.paidZip.permitDataDownloadUrl, 'https://nycpermitbrief.com/nyc-dob-permit-data-download.html', 'current issue JSON paid ZIP links permit data download page');
assert.equal(currentIssue.paidZip.permitCsvUrl, 'https://nycpermitbrief.com/nyc-dob-permit-csv.html', 'current issue JSON paid ZIP links permit CSV page');
assert.equal(currentIssue.paidZip.permitDataApiAlternativeUrl, 'https://nycpermitbrief.com/nyc-permit-data-api-alternative.html', 'current issue JSON paid ZIP links permit data API alternative page');
assert.equal(currentIssue.paidZip.weeklyPermitReportUrl, 'https://nycpermitbrief.com/weekly-nyc-construction-permit-report.html', 'current issue JSON paid ZIP links weekly report page');
assert.equal(currentIssue.paidZip.dobNowAlternativeUrl, 'https://nycpermitbrief.com/dob-now-permit-search-alternative.html', 'current issue JSON paid ZIP links DOB NOW alternative page');
assert.equal(currentIssue.paidZip.permitLeadsUrl, 'https://nycpermitbrief.com/nyc-construction-permit-leads.html', 'current issue JSON paid ZIP links permit leads page');
assert.equal(currentIssue.paidZip.permitActivityByZipUrl, 'https://nycpermitbrief.com/nyc-permit-activity-by-zip.html', 'current issue JSON paid ZIP links ZIP permit activity page');
assert.equal(currentIssue.paidZip.manhattanPermitActivityUrl, 'https://nycpermitbrief.com/manhattan-construction-permit-activity.html', 'current issue JSON paid ZIP links Manhattan permit activity page');
assert.equal(currentIssue.paidZip.brooklynPermitActivityUrl, 'https://nycpermitbrief.com/brooklyn-construction-permit-activity.html', 'current issue JSON paid ZIP links Brooklyn permit activity page');
assert.equal(currentIssue.paidZip.sidewalkShedPermitsUrl, 'https://nycpermitbrief.com/nyc-sidewalk-shed-permits.html', 'current issue JSON paid ZIP links sidewalk shed permits page');
assert.equal(currentIssue.paidZip.plumbingPermitsUrl, 'https://nycpermitbrief.com/nyc-plumbing-permits.html', 'current issue JSON paid ZIP links plumbing permits page');
assert.equal(currentIssue.paidZip.sprinklerPermitsUrl, 'https://nycpermitbrief.com/nyc-sprinkler-permits.html', 'current issue JSON paid ZIP links sprinkler permits page');
assert.equal(currentIssue.paidZip.mechanicalSystemsPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-mechanical-systems-permit-leads.html', 'current issue JSON paid ZIP links mechanical systems permit leads page');
assert.equal(currentIssue.paidZip.mechanicalSystemsPermitsUrl, 'https://nycpermitbrief.com/nyc-mechanical-systems-permits.html', 'current issue JSON paid ZIP links mechanical systems permits page');
assert.equal(currentIssue.paidZip.supportedScaffoldPermitsUrl, 'https://nycpermitbrief.com/nyc-supported-scaffold-permits.html', 'current issue JSON paid ZIP links supported scaffold permits page');
assert.equal(currentIssue.paidZip.supportedScaffoldPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-supported-scaffold-permit-leads.html', 'current issue JSON paid ZIP links supported scaffold permit leads page');
assert.equal(currentIssue.paidZip.structuralPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-structural-permit-leads.html', 'current issue JSON paid ZIP links structural permit leads page');
assert.equal(currentIssue.paidZip.structuralPermitsUrl, 'https://nycpermitbrief.com/nyc-structural-permits.html', 'current issue JSON paid ZIP links structural permits page');
assert.equal(currentIssue.paidZip.constructionFencePermitLeadsUrl, 'https://nycpermitbrief.com/nyc-construction-fence-permit-leads.html', 'current issue JSON paid ZIP links construction fence permit leads page');
assert.equal(currentIssue.paidZip.constructionFencePermitsUrl, 'https://nycpermitbrief.com/nyc-construction-fence-permits.html', 'current issue JSON paid ZIP links construction fence permits page');
assert.equal(currentIssue.paidZip.plumbingPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-plumbing-permit-leads.html', 'current issue JSON paid ZIP links plumbing permit leads page');
assert.equal(currentIssue.paidZip.sprinklerPermitLeadsUrl, 'https://nycpermitbrief.com/nyc-sprinkler-permit-leads.html', 'current issue JSON paid ZIP links sprinkler permit leads page');
assert.equal(currentIssue.paidZip.files.length, 11, 'current issue JSON lists all package files');
assert.equal(currentIssue.paidZip.rowCount, manifest.sourceRows, 'current issue JSON paid ZIP row count matches manifest');
assert.equal(currentIssue.paidZip.launchPricing.priceUsd, 9.5, 'current issue JSON lists launch price');
assert.equal(currentIssue.paidZip.launchPricing.standardPriceUsd, 49, 'current issue JSON lists standard price');
assert.equal(currentIssue.paidZip.launchPricing.promoCodeRequired, false, 'current issue JSON says promo code is not required');
assert.ok(currentIssue.paidZip.files.includes('README.md'), 'current issue JSON lists package README');
assert.ok(currentIssue.paidZip.files.includes('buyer-workbook.md'), 'current issue JSON lists buyer workbook');
assert.ok(currentIssue.paidZip.files.includes('buyer-priority-slices.csv'), 'current issue JSON lists priority slices');
assert.equal(currentIssue.boundary.includesPrivateContactData, false, 'current issue JSON keeps private-contact boundary');
assert.equal(currentIssue.boundary.leadGuarantee, false, 'current issue JSON keeps claims boundary');
assert.equal(currentIssue.generatedPages.totalTopicPages, pages.length, 'current issue JSON topic page count matches manifest');

const feed = read('feed.xml');
assert.match(feed, /<rss version="2\.0">/, 'RSS feed has rss root');
assert.match(feed, /<title>NYC Weekly Construction Activity Brief<\/title>/, 'RSS feed names product');
assert.match(feed, /Current NYC construction activity brief: 142 paid issue rows/, 'RSS feed describes current issue');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/current-issue\.html/, 'RSS feed links current issue page');
assert.match(feed, /The free CSV preview has 25 rows/, 'RSS feed describes free preview size');
assert.match(feed, /Launch price is \$9\.50/, 'RSS feed describes launch price');
assert.match(feed, /Dataset catalog for current NYC permit data/, 'RSS feed includes dataset catalog item');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/dataset-catalog\.html/, 'RSS feed links dataset catalog');
assert.match(feed, /source dataset id rbx6-tga4/, 'RSS feed describes catalog source dataset id');
assert.match(feed, /Share kit for newsletters and community posts/, 'RSS feed includes share kit item');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/share-kit\.html/, 'RSS feed links share kit');
assert.match(feed, /without overstating coverage, results, or lead guarantees/, 'RSS feed keeps share-kit boundary');
assert.match(feed, /Invoice request for procurement-blocked buyers/, 'RSS feed includes invoice request item');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/invoice-request\.html/, 'RSS feed links invoice request');
assert.match(feed, /purchase-order, invoice, or approval workflows/, 'RSS feed describes procurement blocker');
assert.match(feed, /Partner inquiry for newsletter and bundle ideas/, 'RSS feed includes partner inquiry item');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/partner-inquiry\.html/, 'RSS feed links partner inquiry');
assert.match(feed, /Team license request for multi-issue access/, 'RSS feed includes team license item');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/team-license\.html/, 'RSS feed links team license');
assert.match(feed, /Custom research request for filtered permit briefs/, 'RSS feed includes custom research item');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/custom-research\.html/, 'RSS feed links custom research');
assert.match(feed, /Buy the current issue ZIP/, 'RSS feed includes buy page item');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/buy\.html/, 'RSS feed links buy page');
assert.match(feed, /instant browser download after paid Stripe checkout/, 'RSS feed describes paid delivery path');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/preview\.html/, 'RSS feed links public preview page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/pricing\.html/, 'RSS feed links pricing page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/time-saved-calculator\.html/, 'RSS feed links time saved calculator');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/who-should-buy\.html/, 'RSS feed links who should buy page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/faq\.html/, 'RSS feed links FAQ page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/free-vs-paid\.html/, 'RSS feed links free vs paid page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/permit-research-workflow\.html/, 'RSS feed links research workflow page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/contractor-permit-research\.html/, 'RSS feed links contractor guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/contractor-supplier-permit-research\.html/, 'RSS feed links contractor and supplier guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/material-supplier-permit-research\.html/, 'RSS feed links material supplier guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/building-service-vendor-permit-research\.html/, 'RSS feed links building-service vendor guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/subcontractor-permit-research\.html/, 'RSS feed links subcontractor guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/broker-developer-permit-research\.html/, 'RSS feed links broker and developer guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/real-estate-investor-permit-research\.html/, 'RSS feed links real estate investor guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-sidewalk-shed-permit-leads\.html/, 'RSS feed links sidewalk shed permit leads page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/construction-consultant-permit-research\.html/, 'RSS feed links construction consultant guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/construction-risk-permit-research\.html/, 'RSS feed links construction risk guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/permit-expediter-research\.html/, 'RSS feed links permit expediter guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/property-manager-permit-research\.html/, 'RSS feed links property manager guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/inside-the-zip\.html/, 'RSS feed links inside the ZIP page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-building-permit-data\.html/, 'RSS feed links building permit data page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-building-permits\.html/, 'RSS feed links building permits page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-dob-permit-data-download\.html/, 'RSS feed links permit data download page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-dob-permit-alerts\.html/, 'RSS feed links DOB permit alerts page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-dob-permit-tracker\.html/, 'RSS feed links DOB permit tracker page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-dob-permit-monitoring\.html/, 'RSS feed links DOB permit monitoring page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-dob-permit-watchlist\.html/, 'RSS feed links DOB permit watchlist page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-dob-permit-csv\.html/, 'RSS feed links permit CSV page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-permit-data-api-alternative\.html/, 'RSS feed links permit data API alternative page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/weekly-nyc-construction-permit-report\.html/, 'RSS feed links weekly report page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/dob-now-permit-search-alternative\.html/, 'RSS feed links DOB NOW alternative page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-construction-permit-leads\.html/, 'RSS feed links permit leads page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-permit-activity-by-zip\.html/, 'RSS feed links ZIP permit activity page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/manhattan-construction-permit-activity\.html/, 'RSS feed links Manhattan permit activity page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/brooklyn-construction-permit-activity\.html/, 'RSS feed links Brooklyn permit activity page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/queens-construction-permit-activity\.html/, 'RSS feed links Queens demand capture page');
assert.match(feed, /The current paid issue does not include Queens rows\./, 'RSS feed states Queens coverage gap');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/bronx-construction-permit-activity\.html/, 'RSS feed links Bronx demand capture page');
assert.match(feed, /The current paid issue does not include Bronx rows\./, 'RSS feed states Bronx coverage gap');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/staten-island-construction-permit-activity\.html/, 'RSS feed links Staten Island demand capture page');
assert.match(feed, /The current paid issue does not include Staten Island rows\./, 'RSS feed states Staten Island coverage gap');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-sidewalk-shed-permits\.html/, 'RSS feed links sidewalk shed permits page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-plumbing-permit-leads\.html/, 'RSS feed links plumbing permit leads page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-plumbing-permits\.html/, 'RSS feed links plumbing permits page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-sprinkler-permit-leads\.html/, 'RSS feed links sprinkler permit leads page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-sprinkler-permits\.html/, 'RSS feed links sprinkler permits page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-mechanical-systems-permits\.html/, 'RSS feed links mechanical systems permits page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-supported-scaffold-permits\.html/, 'RSS feed links supported scaffold permits page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-supported-scaffold-permit-leads\.html/, 'RSS feed links supported scaffold permit leads page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-structural-permits\.html/, 'RSS feed links structural permits page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/nyc-construction-fence-permits\.html/, 'RSS feed links construction fence permits page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/sample-segments\.html/, 'RSS feed links segment hub');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/buyer-guide\.html/, 'RSS feed links buyer guide');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/delivery\.html/, 'RSS feed links delivery page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/support\.html/, 'RSS feed links support page');
assert.match(feed, /https:\/\/nycpermitbrief\.com\/sample-request\.html/, 'RSS feed links sample request page');

const productFeed = read('product-feed.xml');
assert.match(productFeed, /<rss version="2\.0" xmlns:g="http:\/\/base\.google\.com\/ns\/1\.0">/, 'product feed has Google-compatible RSS root');
assert.match(productFeed, /<title>NYC Weekly Construction Activity Brief product feed<\/title>/, 'product feed names the feed');
assert.match(productFeed, /<g:id>nyc-construction-activity-brief-current<\/g:id>/, 'product feed has stable product id');
assert.match(productFeed, /<title>NYC Weekly Construction Activity Brief current ZIP<\/title>/, 'product feed names the current ZIP');
assert.match(productFeed, /<link>https:\/\/nycpermitbrief\.com\/buy\.html\?source=product-feed<\/link>/, 'product feed links tracked buy page');
assert.match(productFeed, /<g:id>nyc-construction-activity-brief-sidewalk-shed<\/g:id>/, 'product feed has sidewalk shed segment product');
assert.match(productFeed, /<title>NYC sidewalk shed permit activity ZIP<\/title>/, 'product feed names sidewalk shed segment product');
assert.match(productFeed, /<link>https:\/\/nycpermitbrief\.com\/buy\.html\?source=product-feed-sidewalk-shed<\/link>/, 'product feed links tracked sidewalk shed buy page');
assert.match(productFeed, /40 selected NYC sidewalk shed permit rows/, 'product feed describes sidewalk shed row count');
assert.match(productFeed, /<g:custom_label_1>sidewalk-shed-permit-activity-40-rows<\/g:custom_label_1>/, 'product feed labels sidewalk shed row count');
assert.match(productFeed, /<g:id>nyc-construction-activity-brief-plumbing<\/g:id>/, 'product feed has plumbing segment product');
assert.match(productFeed, /<title>NYC plumbing permit activity ZIP<\/title>/, 'product feed names plumbing segment product');
assert.match(productFeed, /<link>https:\/\/nycpermitbrief\.com\/buy\.html\?source=product-feed-plumbing<\/link>/, 'product feed links tracked plumbing buy page');
assert.match(productFeed, /29 selected NYC plumbing permit rows/, 'product feed describes plumbing row count');
assert.match(productFeed, /<g:custom_label_1>plumbing-permit-activity-29-rows<\/g:custom_label_1>/, 'product feed labels plumbing row count');
assert.match(productFeed, /<g:id>nyc-construction-activity-brief-exterior-access<\/g:id>/, 'product feed has exterior-access segment product');
assert.match(productFeed, /<title>NYC exterior-access permit activity ZIP<\/title>/, 'product feed names exterior-access segment product');
assert.match(productFeed, /<link>https:\/\/nycpermitbrief\.com\/buy\.html\?source=product-feed-exterior-access<\/link>/, 'product feed links tracked exterior-access buy page');
assert.match(productFeed, /74 selected NYC exterior-access permit rows/, 'product feed describes exterior-access row count');
assert.match(productFeed, /<g:custom_label_1>exterior-access-permit-activity-74-rows<\/g:custom_label_1>/, 'product feed labels exterior-access row count');
assert.match(productFeed, /<g:image_link>https:\/\/nycpermitbrief\.com\/assets\/current-issue-snapshot\.png<\/g:image_link>/, 'product feed links social image');
assert.match(productFeed, /<g:availability>in_stock<\/g:availability>/, 'product feed marks availability');
assert.match(productFeed, /<g:price>9\.50 USD<\/g:price>/, 'product feed exposes launch price');
assert.match(productFeed, /current 142-row NYC DOB permit CSV/, 'product feed describes paid row count');
assert.match(productFeed, /free preview has 25 rows/, 'product feed describes preview row count');
assert.match(productFeed, /<g:identifier_exists>no<\/g:identifier_exists>/, 'product feed avoids unsupported product identifiers');

const jsonFeed = JSON.parse(read('feed.json'));
assert.equal(jsonFeed.version, 'https://jsonfeed.org/version/1.1', 'JSON Feed exposes v1.1');
assert.equal(jsonFeed.title, 'NYC Weekly Construction Activity Brief', 'JSON Feed names product');
assert.equal(jsonFeed.home_page_url, 'https://nycpermitbrief.com/', 'JSON Feed links home page');
assert.equal(jsonFeed.feed_url, 'https://nycpermitbrief.com/feed.json', 'JSON Feed exposes feed URL');
assert.equal(jsonFeed.icon, 'https://nycpermitbrief.com/assets/current-issue-snapshot.png', 'JSON Feed links social image');
assert.equal(jsonFeed.items.length, 59, 'JSON Feed item count matches curated items plus topic samples');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/buy.html?source=json-feed'), 'JSON Feed links tracked buy page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/dataset-catalog.html'), 'JSON Feed links dataset catalog');
assert.ok(jsonFeed.items.some((item) => /source dataset id rbx6-tga4/.test(item.content_text)), 'JSON Feed describes catalog source dataset id');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/share-kit.html' && /without overstating coverage, results, or lead guarantees/.test(item.content_text)), 'JSON Feed links share kit');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/invoice-request.html' && /purchase-order, invoice, or approval workflows/.test(item.content_text)), 'JSON Feed links invoice request');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/partner-inquiry.html' && /sponsorship discussions/.test(item.content_text)), 'JSON Feed links partner inquiry');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/team-license.html' && /multi-user, multi-issue/.test(item.content_text)), 'JSON Feed links team license');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/custom-research.html' && /filtered briefs, priority-row reviews/.test(item.content_text)), 'JSON Feed links custom research');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/sample-segments.html' && /buyer-intent pages/.test(item.content_text)), 'JSON Feed links segment hub');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/queens-construction-permit-activity.html' && /does not include Queens rows/.test(item.content_text)), 'JSON Feed links Queens demand capture page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/bronx-construction-permit-activity.html' && /does not include Bronx rows/.test(item.content_text)), 'JSON Feed links Bronx demand capture page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/staten-island-construction-permit-activity.html' && /does not include Staten Island rows/.test(item.content_text)), 'JSON Feed links Staten Island demand capture page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-dob-approved-permits.html'), 'JSON Feed links DOB approved permits page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-dob-now-approved-permits.html'), 'JSON Feed links DOB NOW approved permits page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/dob-now-build-approved-permits.html'), 'JSON Feed links DOB NOW Build approved permits page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-dob-permit-alerts.html'), 'JSON Feed links DOB permit alerts page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-dob-permit-tracker.html'), 'JSON Feed links DOB permit tracker page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-dob-permit-monitoring.html'), 'JSON Feed links DOB permit monitoring page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-dob-permit-watchlist.html'), 'JSON Feed links DOB permit watchlist page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-dob-permit-search.html'), 'JSON Feed links DOB permit search page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-construction-permit-search.html'), 'JSON Feed links construction permit search page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-dob-permit-lookup.html'), 'JSON Feed links DOB permit lookup page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-mechanical-systems-permit-leads.html'), 'JSON Feed links mechanical systems permit leads page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-structural-permit-leads.html'), 'JSON Feed links structural permit leads page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-construction-fence-permit-leads.html'), 'JSON Feed links construction fence permit leads page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/nyc-building-permits.html'), 'JSON Feed links building permits page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/topics/nyc-permit-data-for-architects.html'), 'JSON Feed links architect topic page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/topics/nyc-permit-data-for-engineers.html'), 'JSON Feed links engineer topic page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/topics/nyc-permit-research-for-project-managers.html'), 'JSON Feed links project manager topic page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/topics/nyc-construction-permit-data-for-proptech.html'), 'JSON Feed links proptech topic page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/topics/nyc-construction-market-research-csv.html'), 'JSON Feed links market research CSV topic page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/topics/nyc-construction-permit-data-for-suppliers.html'), 'JSON Feed links supplier permit data topic page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/topics/nyc-construction-permit-data-for-journalists.html'), 'JSON Feed links journalist permit data topic page');
assert.ok(jsonFeed.items.some((item) => item.url === 'https://nycpermitbrief.com/topics/nyc-real-estate-investor-permit-research.html'), 'JSON Feed links real estate investor topic page');
assert.ok(jsonFeed.items.some((item) => /142 source-linked rows|142 paid issue rows/.test(item.content_text)), 'JSON Feed describes paid row count');
assert.ok(jsonFeed.items.some((item) => /free CSV preview has 25 rows|free preview has 25 rows/i.test(item.content_text)), 'JSON Feed describes preview row count');

const llms = read('llms.txt');
assert.match(llms, /# NYC Weekly Construction Activity Brief/, 'llms.txt names product');
assert.match(llms, /Free CSV preview rows: 25/, 'llms.txt has free preview row count');
assert.match(llms, /Primary purchase page: https:\/\/nycpermitbrief\.com\/buy\.html/, 'llms.txt exposes primary purchase page');
assert.match(llms, /Checkout bridge: https:\/\/nycpermitbrief\.com\/checkout\.html\?source=current-issue/, 'llms.txt labels checkout bridge');
assert.match(llms, /Current issue page: https:\/\/nycpermitbrief\.com\/current-issue\.html/, 'llms.txt links current issue page');
assert.match(llms, /Dataset catalog: https:\/\/nycpermitbrief\.com\/dataset-catalog\.html/, 'llms.txt links dataset catalog');
assert.match(llms, /Share kit: https:\/\/nycpermitbrief\.com\/share-kit\.html/, 'llms.txt links share kit');
assert.match(llms, /Invoice request: https:\/\/nycpermitbrief\.com\/invoice-request\.html/, 'llms.txt links invoice request');
assert.match(llms, /Partner inquiry: https:\/\/nycpermitbrief\.com\/partner-inquiry\.html/, 'llms.txt links partner inquiry');
assert.match(llms, /Team license request: https:\/\/nycpermitbrief\.com\/team-license\.html/, 'llms.txt links team license');
assert.match(llms, /Custom research request: https:\/\/nycpermitbrief\.com\/custom-research\.html/, 'llms.txt links custom research');
assert.match(llms, /Data package JSON: https:\/\/nycpermitbrief\.com\/data-package\.json/, 'llms.txt links data package JSON');
assert.match(llms, /Product feed XML: https:\/\/nycpermitbrief\.com\/product-feed\.xml/, 'llms.txt links product feed XML');
assert.match(llms, /JSON Feed: https:\/\/nycpermitbrief\.com\/feed\.json/, 'llms.txt links JSON Feed');
assert.match(llms, /NYC DOB approved permits: https:\/\/nycpermitbrief\.com\/nyc-dob-approved-permits\.html/, 'llms.txt links DOB approved permits page');
assert.match(llms, /NYC DOB NOW approved permits: https:\/\/nycpermitbrief\.com\/nyc-dob-now-approved-permits\.html/, 'llms.txt links DOB NOW approved permits page');
assert.match(llms, /DOB NOW Build approved permits: https:\/\/nycpermitbrief\.com\/dob-now-build-approved-permits\.html/, 'llms.txt links DOB NOW Build approved permits page');
assert.match(llms, /NYC DOB permit alerts alternative: https:\/\/nycpermitbrief\.com\/nyc-dob-permit-alerts\.html/, 'llms.txt links DOB permit alerts page');
assert.match(llms, /NYC DOB permit tracker alternative: https:\/\/nycpermitbrief\.com\/nyc-dob-permit-tracker\.html/, 'llms.txt links DOB permit tracker page');
assert.match(llms, /NYC DOB permit monitoring alternative: https:\/\/nycpermitbrief\.com\/nyc-dob-permit-monitoring\.html/, 'llms.txt links DOB permit monitoring page');
assert.match(llms, /NYC DOB permit watchlist alternative: https:\/\/nycpermitbrief\.com\/nyc-dob-permit-watchlist\.html/, 'llms.txt links DOB permit watchlist page');
assert.match(llms, /NYC DOB permit search companion: https:\/\/nycpermitbrief\.com\/nyc-dob-permit-search\.html/, 'llms.txt links DOB permit search page');
assert.match(llms, /NYC construction permit search companion: https:\/\/nycpermitbrief\.com\/nyc-construction-permit-search\.html/, 'llms.txt links construction permit search page');
assert.match(llms, /NYC DOB permit lookup companion: https:\/\/nycpermitbrief\.com\/nyc-dob-permit-lookup\.html/, 'llms.txt links DOB permit lookup page');
assert.match(llms, /Buy page: https:\/\/nycpermitbrief\.com\/buy\.html/, 'llms.txt links buy page');
assert.match(llms, /Public preview: https:\/\/nycpermitbrief\.com\/preview\.html/, 'llms.txt links public preview page');
assert.match(llms, /Pricing: https:\/\/nycpermitbrief\.com\/pricing\.html/, 'llms.txt links pricing page');
assert.match(llms, /Time saved calculator: https:\/\/nycpermitbrief\.com\/time-saved-calculator\.html/, 'llms.txt links time saved calculator');
assert.match(llms, /Who should buy: https:\/\/nycpermitbrief\.com\/who-should-buy\.html/, 'llms.txt links who should buy page');
assert.match(llms, /Buyer FAQ: https:\/\/nycpermitbrief\.com\/faq\.html/, 'llms.txt links FAQ page');
assert.match(llms, /Free preview vs paid ZIP: https:\/\/nycpermitbrief\.com\/free-vs-paid\.html/, 'llms.txt links free vs paid page');
assert.match(llms, /Research workflow: https:\/\/nycpermitbrief\.com\/permit-research-workflow\.html/, 'llms.txt links research workflow page');
assert.match(llms, /Contractor guide: https:\/\/nycpermitbrief\.com\/contractor-permit-research\.html/, 'llms.txt links contractor guide');
assert.match(llms, /Contractor and supplier guide: https:\/\/nycpermitbrief\.com\/contractor-supplier-permit-research\.html/, 'llms.txt links contractor and supplier guide');
assert.match(llms, /Material supplier guide: https:\/\/nycpermitbrief\.com\/material-supplier-permit-research\.html/, 'llms.txt links material supplier guide');
assert.match(llms, /Building-service vendor guide: https:\/\/nycpermitbrief\.com\/building-service-vendor-permit-research\.html/, 'llms.txt links building-service vendor guide');
assert.match(llms, /Subcontractor guide: https:\/\/nycpermitbrief\.com\/subcontractor-permit-research\.html/, 'llms.txt links subcontractor guide');
assert.match(llms, /Broker and developer guide: https:\/\/nycpermitbrief\.com\/broker-developer-permit-research\.html/, 'llms.txt links broker and developer guide');
assert.match(llms, /Real estate investor guide: https:\/\/nycpermitbrief\.com\/real-estate-investor-permit-research\.html/, 'llms.txt links real estate investor guide');
assert.match(llms, /Construction consultant guide: https:\/\/nycpermitbrief\.com\/construction-consultant-permit-research\.html/, 'llms.txt links construction consultant guide');
assert.match(llms, /Construction risk guide: https:\/\/nycpermitbrief\.com\/construction-risk-permit-research\.html/, 'llms.txt links construction risk guide');
assert.match(llms, /Permit expediter guide: https:\/\/nycpermitbrief\.com\/permit-expediter-research\.html/, 'llms.txt links permit expediter guide');
assert.match(llms, /Property manager guide: https:\/\/nycpermitbrief\.com\/property-manager-permit-research\.html/, 'llms.txt links property manager guide');
assert.match(llms, /Inside the ZIP: https:\/\/nycpermitbrief\.com\/inside-the-zip\.html/, 'llms.txt links inside the ZIP page');
assert.match(llms, /NYC building permit data: https:\/\/nycpermitbrief\.com\/nyc-building-permit-data\.html/, 'llms.txt links building permit data page');
assert.match(llms, /NYC building permits: https:\/\/nycpermitbrief\.com\/nyc-building-permits\.html/, 'llms.txt links building permits page');
assert.match(llms, /NYC DOB permit data download: https:\/\/nycpermitbrief\.com\/nyc-dob-permit-data-download\.html/, 'llms.txt links permit data download page');
assert.match(llms, /NYC DOB permit CSV: https:\/\/nycpermitbrief\.com\/nyc-dob-permit-csv\.html/, 'llms.txt links permit CSV page');
assert.match(llms, /NYC permit data API alternative: https:\/\/nycpermitbrief\.com\/nyc-permit-data-api-alternative\.html/, 'llms.txt links permit data API alternative page');
assert.match(llms, /Weekly NYC construction permit report: https:\/\/nycpermitbrief\.com\/weekly-nyc-construction-permit-report\.html/, 'llms.txt links weekly report page');
assert.match(llms, /DOB NOW permit search alternative: https:\/\/nycpermitbrief\.com\/dob-now-permit-search-alternative\.html/, 'llms.txt links DOB NOW alternative page');
assert.match(llms, /NYC construction permit leads alternative: https:\/\/nycpermitbrief\.com\/nyc-construction-permit-leads\.html/, 'llms.txt links permit leads page');
assert.match(llms, /NYC permit activity by ZIP: https:\/\/nycpermitbrief\.com\/nyc-permit-activity-by-zip\.html/, 'llms.txt links ZIP permit activity page');
assert.match(llms, /Manhattan construction permit activity: https:\/\/nycpermitbrief\.com\/manhattan-construction-permit-activity\.html/, 'llms.txt links Manhattan permit activity page');
assert.match(llms, /Brooklyn construction permit activity: https:\/\/nycpermitbrief\.com\/brooklyn-construction-permit-activity\.html/, 'llms.txt links Brooklyn permit activity page');
assert.match(llms, /Queens construction permit activity request: https:\/\/nycpermitbrief\.com\/queens-construction-permit-activity\.html/, 'llms.txt links Queens demand capture page');
assert.match(llms, /Bronx construction permit activity request: https:\/\/nycpermitbrief\.com\/bronx-construction-permit-activity\.html/, 'llms.txt links Bronx demand capture page');
assert.match(llms, /Staten Island construction permit activity request: https:\/\/nycpermitbrief\.com\/staten-island-construction-permit-activity\.html/, 'llms.txt links Staten Island demand capture page');
assert.match(llms, /NYC sidewalk shed permits: https:\/\/nycpermitbrief\.com\/nyc-sidewalk-shed-permits\.html/, 'llms.txt links sidewalk shed permits page');
assert.match(llms, /NYC sidewalk shed permit leads: https:\/\/nycpermitbrief\.com\/nyc-sidewalk-shed-permit-leads\.html/, 'llms.txt links sidewalk shed permit leads page');
assert.match(llms, /NYC plumbing permit leads: https:\/\/nycpermitbrief\.com\/nyc-plumbing-permit-leads\.html/, 'llms.txt links plumbing permit leads page');
assert.match(llms, /NYC plumbing permits: https:\/\/nycpermitbrief\.com\/nyc-plumbing-permits\.html/, 'llms.txt links plumbing permits page');
assert.match(llms, /NYC sprinkler permit leads: https:\/\/nycpermitbrief\.com\/nyc-sprinkler-permit-leads\.html/, 'llms.txt links sprinkler permit leads page');
assert.match(llms, /NYC sprinkler permits: https:\/\/nycpermitbrief\.com\/nyc-sprinkler-permits\.html/, 'llms.txt links sprinkler permits page');
assert.match(llms, /NYC mechanical systems permit leads: https:\/\/nycpermitbrief\.com\/nyc-mechanical-systems-permit-leads\.html/, 'llms.txt links mechanical systems permit leads page');
assert.match(llms, /NYC mechanical systems permits: https:\/\/nycpermitbrief\.com\/nyc-mechanical-systems-permits\.html/, 'llms.txt links mechanical systems permits page');
assert.match(llms, /NYC supported scaffold permits: https:\/\/nycpermitbrief\.com\/nyc-supported-scaffold-permits\.html/, 'llms.txt links supported scaffold permits page');
assert.match(llms, /NYC supported scaffold permit leads: https:\/\/nycpermitbrief\.com\/nyc-supported-scaffold-permit-leads\.html/, 'llms.txt links supported scaffold permit leads page');
assert.match(llms, /NYC structural permit leads: https:\/\/nycpermitbrief\.com\/nyc-structural-permit-leads\.html/, 'llms.txt links structural permit leads page');
assert.match(llms, /NYC structural permits: https:\/\/nycpermitbrief\.com\/nyc-structural-permits\.html/, 'llms.txt links structural permits page');
assert.match(llms, /NYC construction fence permit leads: https:\/\/nycpermitbrief\.com\/nyc-construction-fence-permit-leads\.html/, 'llms.txt links construction fence permit leads page');
assert.match(llms, /NYC construction fence permits: https:\/\/nycpermitbrief\.com\/nyc-construction-fence-permits\.html/, 'llms.txt links construction fence permits page');
assert.match(llms, /High-intent topic pages:/, 'llms.txt names high-intent topic section');
assert.match(llms, /NYC permit data for architects: https:\/\/nycpermitbrief\.com\/topics\/nyc-permit-data-for-architects\.html/, 'llms.txt links architect topic page');
assert.match(llms, /NYC permit data for engineers: https:\/\/nycpermitbrief\.com\/topics\/nyc-permit-data-for-engineers\.html/, 'llms.txt links engineer topic page');
assert.match(llms, /NYC permit research for project managers: https:\/\/nycpermitbrief\.com\/topics\/nyc-permit-research-for-project-managers\.html/, 'llms.txt links project manager topic page');
assert.match(llms, /NYC construction permit data for proptech: https:\/\/nycpermitbrief\.com\/topics\/nyc-construction-permit-data-for-proptech\.html/, 'llms.txt links proptech topic page');
assert.match(llms, /NYC construction market research CSV: https:\/\/nycpermitbrief\.com\/topics\/nyc-construction-market-research-csv\.html/, 'llms.txt links market research CSV topic page');
assert.match(llms, /Paid ZIP rows: 142/, 'llms.txt has paid ZIP row count');
assert.match(llms, /Promo code required: no/, 'llms.txt states promo code is not required');
assert.match(llms, /Stripe fallback link: https:\/\/buy\.stripe\.com\/bJe3cveXL6Hw9mLdLFcAo0Q/, 'llms.txt labels Stripe URL as fallback');
assert.match(llms, /Social image: https:\/\/nycpermitbrief\.com\/assets\/current-issue-snapshot\.png/, 'llms.txt links social image');
assert.match(llms, /Buyer guide: https:\/\/nycpermitbrief\.com\/buyer-guide\.html/, 'llms.txt links buyer guide');
assert.match(llms, /Delivery steps: https:\/\/nycpermitbrief\.com\/delivery\.html/, 'llms.txt links delivery page');
assert.match(llms, /Support and refunds: https:\/\/nycpermitbrief\.com\/support\.html/, 'llms.txt links support page');
assert.match(llms, /Sample request: https:\/\/nycpermitbrief\.com\/sample-request\.html/, 'llms.txt links sample request page');
assert.match(llms, /Sample JSON: https:\/\/nycpermitbrief\.com\/sample\/nyc-construction-activity-preview\.json/, 'llms.txt links sample JSON');
assert.match(llms, /Sample JSONL: https:\/\/nycpermitbrief\.com\/sample\/nyc-construction-activity-preview\.jsonl/, 'llms.txt links sample JSONL');
assert.match(llms, /Buyer-only files: buyer-workbook\.md, buyer-priority-slices\.csv/, 'llms.txt lists buyer-only files');
assert.match(llms, /No guaranteed leads\./, 'llms.txt keeps claims boundary');

assert.equal(dataPackage.product, 'NYC Weekly Construction Activity Brief', 'data package JSON names product');
assert.equal(dataPackage.issue, 'current', 'data package JSON marks current issue');
assert.equal(dataPackage.url, 'https://nycpermitbrief.com/data-package.json', 'data package JSON exposes its URL');
assert.equal(dataPackage.source.dataset_id, 'rbx6-tga4', 'data package JSON names source dataset');
assert.equal(dataPackage.public_preview.rows, 25, 'data package JSON public preview row count matches free sample');
assert.equal(dataPackage.public_preview.sample_urls.csv, 'https://nycpermitbrief.com/sample/nyc-construction-activity-preview.csv', 'data package JSON links CSV sample');
assert.equal(dataPackage.public_preview.sample_urls.json, 'https://nycpermitbrief.com/sample/nyc-construction-activity-preview.json', 'data package JSON links JSON sample');
assert.equal(dataPackage.public_preview.sample_urls.jsonl, 'https://nycpermitbrief.com/sample/nyc-construction-activity-preview.jsonl', 'data package JSON links JSONL sample');
assert.equal(dataPackage.public_preview.sample_urls.markdown_brief, 'https://nycpermitbrief.com/sample/nyc-weekly-construction-activity-sample.md', 'data package JSON links Markdown sample');
assert.equal(dataPackage.paid_zip.rows, 142, 'data package JSON paid ZIP row count matches full issue');
assert.equal(dataPackage.paid_zip.price_usd, '9.50', 'data package JSON exposes launch price');
assert.equal(dataPackage.paid_zip.buy_url, 'https://nycpermitbrief.com/buy.html?source=data-package', 'data package JSON links tracked buy page');
assert.equal(dataPackage.paid_zip.checkout_bridge_url, 'https://nycpermitbrief.com/checkout.html?source=data-package', 'data package JSON links tracked checkout bridge');
assert.equal(dataPackage.paid_zip.stripe_payment_link, undefined, 'data package JSON does not expose Stripe fallback as primary payment link');
assert.equal(dataPackage.paid_zip.stripe_payment_link_fallback, 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q', 'data package JSON labels Stripe Payment Link as fallback');
assert.equal(dataPackage.paid_zip.product_feed_url, 'https://nycpermitbrief.com/product-feed.xml', 'data package JSON links product feed XML');
assert.equal(dataPackage.paid_zip.json_feed_url, 'https://nycpermitbrief.com/feed.json', 'data package JSON links JSON Feed');
assert.match(JSON.stringify(dataPackage), /nyc-sidewalk-shed-permit-leads\.html/, 'data package JSON links sidewalk shed permit leads page');
assert.match(JSON.stringify(dataPackage), /nyc-supported-scaffold-permit-leads\.html/, 'data package JSON links supported scaffold permit leads page');
assert.match(JSON.stringify(dataPackage), /nyc-plumbing-permit-leads\.html/, 'data package JSON links plumbing permit leads page');
assert.match(JSON.stringify(dataPackage), /nyc-sprinkler-permit-leads\.html/, 'data package JSON links sprinkler permit leads page');
assert.match(JSON.stringify(dataPackage), /nyc-mechanical-systems-permit-leads\.html/, 'data package JSON links mechanical systems permit leads page');
assert.match(JSON.stringify(dataPackage), /nyc-structural-permit-leads\.html/, 'data package JSON links structural permit leads page');
assert.match(JSON.stringify(dataPackage), /nyc-construction-fence-permit-leads\.html/, 'data package JSON links construction fence permit leads page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/faq.html'), 'data package JSON links FAQ page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/share-kit.html'), 'data package JSON links share kit');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/invoice-request.html'), 'data package JSON links invoice request');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/partner-inquiry.html'), 'data package JSON links partner inquiry');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/team-license.html'), 'data package JSON links team license');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/custom-research.html'), 'data package JSON links custom research');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-building-permit-data.html'), 'data package JSON links building permit data page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-building-permits.html'), 'data package JSON links building permits page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-dob-permit-data-download.html'), 'data package JSON links permit data download page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-dob-approved-permits.html'), 'data package JSON links DOB approved permits page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-dob-now-approved-permits.html'), 'data package JSON links DOB NOW approved permits page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/dob-now-build-approved-permits.html'), 'data package JSON links DOB NOW Build approved permits page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-dob-permit-alerts.html'), 'data package JSON links DOB permit alerts page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-dob-permit-tracker.html'), 'data package JSON links DOB permit tracker page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-dob-permit-monitoring.html'), 'data package JSON links DOB permit monitoring page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-dob-permit-watchlist.html'), 'data package JSON links DOB permit watchlist page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-dob-permit-search.html'), 'data package JSON links DOB permit search page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-construction-permit-search.html'), 'data package JSON links construction permit search page');
assert.ok(dataPackage.buyer_pages.includes('https://nycpermitbrief.com/nyc-dob-permit-lookup.html'), 'data package JSON links DOB permit lookup page');
assert.ok(dataPackage.paid_zip.files.includes('buyer-workbook.md'), 'data package JSON lists buyer workbook');
assert.ok(dataPackage.paid_zip.files.includes('buyer-priority-slices.csv'), 'data package JSON lists priority slices');
assert.equal(dataPackage.boundaries.includes_private_contact_data, false, 'data package JSON keeps private-contact boundary');
assert.equal(dataPackage.boundaries.lead_guarantee, false, 'data package JSON keeps claims boundary');
assert.equal(dataPackage.generated_topic_pages.count, pages.length, 'data package JSON topic page count matches manifest');
assert.equal(dataPackage.generated_topic_pages.segment_hub_url, 'https://nycpermitbrief.com/sample-segments.html', 'data package JSON links segment hub');
assert.equal(dataPackage.generated_topic_pages.all_urls.length, pages.length, 'data package JSON lists all topic URLs');
assert.ok(dataPackage.generated_topic_pages.all_urls.includes('https://nycpermitbrief.com/topics/nyc-permit-data-for-architects.html'), 'data package JSON lists curated topic URLs');
assert.ok(dataPackage.generated_topic_pages.all_urls.includes('https://nycpermitbrief.com/topics/nyc-construction-permit-data-for-journalists.html'), 'data package JSON lists journalist topic URL');
assert.ok(dataPackage.generated_topic_pages.all_urls.includes('https://nycpermitbrief.com/topics/nyc-dob-permits-zip-10003.html'), 'data package JSON lists generated segment URLs');

const publicCsv = read('sample/nyc-construction-activity-preview.csv').trim().split(/\r?\n/);
assert.equal(publicCsv.length - 1, 25, 'public CSV preview must stay limited to 25 rows');
const publicMarkdown = read('sample/nyc-weekly-construction-activity-sample.md');
assert.match(publicMarkdown, /Buy the current issue ZIP: https:\/\/nycpermitbrief\.com\/buy\.html\?source=sample-md/, 'public Markdown sample links tracked buy page');
assert.match(publicMarkdown, /Pricing: https:\/\/nycpermitbrief\.com\/pricing\.html/, 'public Markdown sample links pricing page');
assert.match(publicMarkdown, /Support and refunds: https:\/\/nycpermitbrief\.com\/support\.html/, 'public Markdown sample links support page');
assert.match(publicMarkdown, /Current launch price: \$9\.50/, 'public Markdown sample states current launch price');
assert.match(publicMarkdown, /buyer workbook, priority-slices CSV/, 'public Markdown sample lists buyer files');
assert.match(publicMarkdown, /Rows in free public preview: 25/, 'public Markdown sample keeps preview row count');
assert.match(publicMarkdown, /Rows in paid ZIP: 142/, 'public Markdown sample keeps paid ZIP row count');
const publicJson = JSON.parse(read('sample/nyc-construction-activity-preview.json'));
assert.equal(publicJson.public_preview_rows, 25, 'public JSON preview declares 25 preview rows');
assert.equal(publicJson.paid_zip_rows, 142, 'public JSON preview declares paid ZIP row count');
assert.equal(publicJson.purchase.buy_url, 'https://nycpermitbrief.com/buy.html?source=sample-json', 'public JSON preview links tracked buy page');
assert.equal(publicJson.purchase.pricing_url, 'https://nycpermitbrief.com/pricing.html', 'public JSON preview links pricing page');
assert.equal(publicJson.purchase.support_url, 'https://nycpermitbrief.com/support.html', 'public JSON preview links support page');
assert.equal(publicJson.purchase.price_usd, '9.50', 'public JSON preview exposes current launch price');
assert.equal(publicJson.sample_urls.csv, 'https://nycpermitbrief.com/sample/nyc-construction-activity-preview.csv', 'public JSON preview links CSV sample');
assert.equal(publicJson.sample_urls.json, 'https://nycpermitbrief.com/sample/nyc-construction-activity-preview.json', 'public JSON preview links JSON sample');
assert.equal(publicJson.sample_urls.jsonl, 'https://nycpermitbrief.com/sample/nyc-construction-activity-preview.jsonl', 'public JSON preview links JSONL sample');
assert.equal(publicJson.sample_urls.markdown_brief, 'https://nycpermitbrief.com/sample/nyc-weekly-construction-activity-sample.md', 'public JSON preview links Markdown brief sample');
assert.equal(publicJson.paid_zip.rows, 142, 'public JSON preview repeats paid ZIP row count');
assert.ok(publicJson.paid_zip.files.includes('buyer-workbook.md'), 'public JSON preview lists buyer workbook');
assert.ok(publicJson.paid_zip.files.includes('buyer-priority-slices.csv'), 'public JSON preview lists priority slices');
assert.equal(publicJson.rows.length, 25, 'public JSON preview must stay limited to 25 rows');
assert.equal(publicJson.boundary.no_private_contact_data, true, 'public JSON preview keeps private-contact boundary');
assert.equal(publicJson.boundary.no_guaranteed_leads, true, 'public JSON preview keeps claims boundary');
assert.ok(publicJson.fields.includes('source_url'), 'public JSON preview lists source_url field');
const publicJsonl = read('sample/nyc-construction-activity-preview.jsonl').trim().split(/\r?\n/);
assert.equal(publicJsonl.length, 25, 'public JSONL preview must stay limited to 25 rows');
for (const line of publicJsonl) {
  const row = JSON.parse(line);
  assert.ok(row.source_url, 'public JSONL rows include source_url');
  assert.ok(row.work_type, 'public JSONL rows include work_type');
}

const indexNowKey = read('320c87511764a53abe2cd8aa0481f1bc.txt').trim();
assert.equal(indexNowKey, '320c87511764a53abe2cd8aa0481f1bc', 'IndexNow key file must match submission script');

assert.ok(fs.existsSync(socialImagePath), 'current issue snapshot PNG exists');
const socialImage = fs.readFileSync(socialImagePath);
assert.equal(socialImage.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'current issue snapshot is a PNG');
assert.ok(socialImage.length > 10000, 'current issue snapshot PNG has real image content');

console.log('seo page validation passed');
