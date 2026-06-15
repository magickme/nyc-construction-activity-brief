const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const checkoutUrl = 'https://nyc-construction-activity-brief.vercel.app/checkout.html\\?source=[a-z0-9._-]+';
const purchaseUrl = 'https://nyc-construction-activity-brief.vercel.app/buy.html\\?source=[a-z0-9._-]+';
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
  if (slug) {
    assert.match(
      html,
      new RegExp(`href="${attributedPurchaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
      `${relativePath} uses page-specific buy attribution`,
    );
    assert.match(
      html,
      new RegExp(`"url":"${attributedPurchaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
      `${relativePath} Product schema uses page-specific buy attribution`,
    );
    assert.doesNotMatch(html, /href="(?:https:\/\/nyc-construction-activity-brief\.vercel\.app)?\/checkout\.html\?source=topic"/, `${relativePath} must not use generic topic attribution`);
  }
  assert.match(html, /data-sample-request-form/, `${relativePath} needs sample request form`);
  assert.match(html, /\/api\/sample-request/, `${relativePath} posts sample requests to API`);
  assert.match(html, /data\.source_path = window\.location\.pathname;/, `${relativePath} sends source path with sample request`);
  assert.match(html, /const requestSource = \['sample-request', window\.location\.pathname\.replace/, `${relativePath} builds page-specific sample request checkout source`);
  assert.match(html, /sample_request_saved/, `${relativePath} tracks saved sample requests`);
  assert.match(html, /sample_request_failed/, `${relativePath} tracks failed sample requests`);
  assert.match(html, /encodeURIComponent\(requestSource\)/, `${relativePath} links buy page with page-specific sample request source`);
  assert.match(html, /class="has-conversion-bar"/, `${relativePath} uses sticky conversion bar layout`);
  assert.match(html, /data-conversion-bar/, `${relativePath} needs sticky conversion bar`);
  assert.match(html, /Sample request/, `${relativePath} conversion bar links sample request`);
  assert.match(
    html,
    new RegExp(`data-conversion-bar[\\s\\S]+href="${attributedPurchaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
    `${relativePath} conversion bar links attributed buy page`,
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

function assertSampleRequestForm(html, label) {
  assert.match(html, /href="#sample-request"/, `${label} links sample request form`);
  assert.match(html, /id="sample-request"/, `${label} has sample request form anchor`);
  assert.match(html, /data-sample-request-form/, `${label} needs sample request form`);
  assert.match(html, /\/api\/sample-request/, `${label} posts sample requests to API`);
  assert.match(html, /data\.source_path = window\.location\.pathname;/, `${label} sends source path with sample request`);
  assert.match(html, /sample_request_saved/, `${label} tracks saved sample requests`);
  assert.match(html, /sample_request_failed/, `${label} tracks failed sample requests`);
  assert.match(html, /This does not join the MagickMe newsletter\./, `${label} keeps list-separation copy`);
}

function assertConversionBar(html, label, source) {
  const expectedCheckout = `https://nyc-construction-activity-brief.vercel.app/buy.html?source=${source}`;
  assert.match(html, /class="[^"]*has-conversion-bar[^"]*"/, `${label} uses sticky conversion bar layout`);
  assert.match(html, /data-conversion-bar/, `${label} needs sticky conversion bar`);
  assert.match(html, /Sample request/, `${label} conversion bar links sample request`);
  assert.match(
    html,
    new RegExp(`data-conversion-bar[\\s\\S]+href="${expectedCheckout.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
    `${label} conversion bar links attributed checkout`,
  );
}

const coreConversionPages = [
  ['index.html', 'home-sticky'],
  ['preview.html', 'preview-sticky'],
  ['current-issue.html', 'current-issue-sticky'],
  ['pricing.html', 'pricing-sticky'],
  ['inside-the-zip.html', 'inside-the-zip-sticky'],
  ['free-vs-paid.html', 'free-vs-paid-sticky'],
  ['buyer-guide.html', 'buyer-guide-sticky'],
  ['csv-field-guide.html', 'csv-field-guide-sticky'],
  ['nyc-dob-permit-csv.html', 'nyc-dob-permit-csv-sticky'],
  ['weekly-nyc-construction-permit-report.html', 'weekly-nyc-construction-report-sticky'],
  ['dob-now-permit-search-alternative.html', 'dob-now-alternative-sticky'],
  ['nyc-construction-permit-leads.html', 'permit-leads-sticky'],
  ['nyc-permit-activity-by-zip.html', 'permit-activity-by-zip-sticky'],
  ['manhattan-construction-permit-activity.html', 'manhattan-permit-activity-sticky'],
  ['brooklyn-construction-permit-activity.html', 'brooklyn-permit-activity-sticky'],
  ['nyc-sidewalk-shed-permits.html', 'sidewalk-shed-permits-sticky'],
  ['nyc-plumbing-permits.html', 'plumbing-permits-sticky'],
  ['nyc-sprinkler-permits.html', 'sprinkler-permits-sticky'],
  ['nyc-mechanical-systems-permits.html', 'mechanical-systems-permits-sticky'],
  ['nyc-supported-scaffold-permits.html', 'supported-scaffold-permits-sticky'],
  ['nyc-structural-permits.html', 'structural-permits-sticky'],
  ['nyc-construction-fence-permits.html', 'construction-fence-permits-sticky'],
  ['delivery.html', 'delivery-sticky'],
  ['support.html', 'support-sticky'],
  ['sample-request.html', 'sample-request-sticky'],
  ['methodology.html', 'methodology-sticky'],
  ['time-saved-calculator.html', 'time-saved-calculator-sticky'],
  ['who-should-buy.html', 'who-should-buy-sticky'],
  ['permit-research-workflow.html', 'permit-research-workflow-sticky'],
  ['contractor-supplier-permit-research.html', 'contractor-supplier-sticky'],
  ['broker-developer-permit-research.html', 'broker-developer-sticky'],
  ['real-estate-investor-permit-research.html', 'real-estate-investor-sticky'],
  ['construction-consultant-permit-research.html', 'construction-consultant-sticky'],
  ['construction-risk-permit-research.html', 'construction-risk-sticky'],
  ['permit-expediter-research.html', 'permit-expediter-sticky'],
  ['property-manager-permit-research.html', 'property-manager-sticky'],
  ['sample-segments.html', 'sample-segments-sticky'],
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

const index = read('index.html');
assert.match(
  index,
  new RegExp(`<link rel="canonical" href="${baseUrl}/">`),
  'index needs a canonical URL',
);
assert.match(index, new RegExp(`<link rel="alternate" type="application/rss\\+xml"[^>]+href="${baseUrl}/feed\\.xml">`), 'index links RSS feed');
assert.match(index, new RegExp(`<link rel="alternate" type="application/json"[^>]+href="${baseUrl}/current-issue\\.json">`), 'index links current issue JSON');
assert.match(index, /<meta property="og:title" content="[^"]+">/, 'index needs OG title');
assert.match(index, new RegExp(`<meta property="og:image" content="${socialImageUrl}">`), 'index needs social image');
assert.match(index, /<meta property="og:image:width" content="1200">/, 'index needs social image width');
assert.match(index, /<meta property="og:image:height" content="630">/, 'index needs social image height');
assert.match(index, /<meta name="twitter:card" content="summary_large_image">/, 'index needs large Twitter card');
assert.match(index, new RegExp(`<meta name="twitter:image" content="${socialImageUrl}">`), 'index needs Twitter image');
assert.match(index, /<script type="application\/ld\+json">[^<]+"@type":"Product"/, 'index needs Product structured data');
assert.match(index, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=home-schema/, 'index Product schema points to buy page');
assert.match(index, /\/_vercel\/insights\/script\.js/, 'index needs Web Analytics script');
assert.doesNotMatch(index, /Delivered by email after purchase/i, 'index must not promise email delivery');
assert.match(index, /Instant download after completed Stripe checkout/, 'index needs current automated delivery copy');
assert.match(index, /Buy instant ZIP/, 'index needs a clear instant ZIP checkout CTA');
assert.match(index, /href="\/buy\.html\?source=home-hero"/, 'index hero links buy page');
assert.match(index, /href="\/buy\.html\?source=home-card"/, 'index card links buy page');
assert.match(index, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=home-sticky"/, 'index sticky bar links buy page');
assert.match(index, /href="\/buy\.html\?source=' \+ encodeURIComponent\(requestSource\)/, 'index sample request fallback links tracked buy page');
assert.match(index, /Launch price is \$9\.50 for the current issue/, 'index needs launch price copy');
assert.match(index, /What is in the paid ZIP/, 'index needs paid package contents');
assert.match(index, /Free preview rows: 25\. Paid ZIP rows: 142/, 'index needs free versus paid row counts');
assert.match(index, /src="\/assets\/current-issue-snapshot\.png"/, 'index needs current issue snapshot image');
assert.match(index, /Buyer workbook with a fast review path/, 'index needs buyer workbook offer copy');
assert.match(index, /Priority-slices CSV grouped by work type/, 'index needs priority-slices offer copy');
assert.match(index, /data-sample-request-form/, 'index needs sample request form');
assert.match(index, /\/api\/sample-request/, 'index posts sample requests to API');
assert.match(index, /data\.source_path = window\.location\.pathname;/, 'index sends source path with sample request');
assert.match(index, /const requestSource = \['sample-request', window\.location\.pathname\.replace/, 'index builds page-specific sample request checkout source');
assert.match(index, /sample_request_saved/, 'index tracks saved sample requests');
assert.match(index, /sample_request_failed/, 'index tracks failed sample requests');
assert.match(index, /encodeURIComponent\(requestSource\)/, 'index links buy page with page-specific sample request source');
assert.match(index, /This does not join the MagickMe newsletter\./, 'index needs list-separation copy');
assert.match(index, /href="\/current-issue\.html"/, 'index links current issue page');
assert.match(index, /href="\/preview\.html"/, 'index links public preview page');
assert.match(index, /href="\/pricing\.html"/, 'index links pricing page');
assert.match(index, /href="\/time-saved-calculator\.html"/, 'index links time saved calculator');
assert.match(index, /href="\/who-should-buy\.html"/, 'index links who should buy page');
assert.match(index, /href="\/free-vs-paid\.html"/, 'index links free vs paid page');
assert.match(index, /href="\/permit-research-workflow\.html"/, 'index links research workflow page');
assert.match(index, /href="\/contractor-supplier-permit-research\.html"/, 'index links contractor and supplier guide');
assert.match(index, /href="\/broker-developer-permit-research\.html"/, 'index links broker and developer guide');
assert.match(index, /href="\/real-estate-investor-permit-research\.html"/, 'index links real estate investor guide');
assert.match(index, /href="\/construction-consultant-permit-research\.html"/, 'index links construction consultant guide');
assert.match(index, /href="\/construction-risk-permit-research\.html"/, 'index links construction risk guide');
assert.match(index, /href="\/permit-expediter-research\.html"/, 'index links permit expediter guide');
assert.match(index, /href="\/inside-the-zip\.html"/, 'index links inside the ZIP page');
assert.match(index, /href="\/csv-field-guide\.html"/, 'index links CSV field guide');
assert.match(index, /href="\/nyc-dob-permit-csv\.html"/, 'index links NYC DOB permit CSV page');
assert.match(index, /href="\/weekly-nyc-construction-permit-report\.html"/, 'index links weekly permit report page');
assert.match(index, /href="\/dob-now-permit-search-alternative\.html"/, 'index links DOB NOW alternative page');
assert.match(index, /href="\/nyc-construction-permit-leads\.html"/, 'index links permit leads alternative page');
assert.match(index, /href="\/nyc-permit-activity-by-zip\.html"/, 'index links ZIP permit activity page');
assert.match(index, /href="\/manhattan-construction-permit-activity\.html"/, 'index links Manhattan permit activity page');
assert.match(index, /href="\/brooklyn-construction-permit-activity\.html"/, 'index links Brooklyn permit activity page');
assert.match(index, /href="\/nyc-sidewalk-shed-permits\.html"/, 'index links sidewalk shed permits page');
assert.match(index, /href="\/nyc-plumbing-permits\.html"/, 'index links plumbing permits page');
assert.match(index, /href="\/nyc-sprinkler-permits\.html"/, 'index links sprinkler permits page');
assert.match(index, /href="\/nyc-mechanical-systems-permits\.html"/, 'index links mechanical systems permits page');
assert.match(index, /href="\/nyc-supported-scaffold-permits\.html"/, 'index links supported scaffold permits page');
assert.match(index, /href="\/nyc-structural-permits\.html"/, 'index links structural permits page');
assert.match(index, /href="\/nyc-construction-fence-permits\.html"/, 'index links construction fence permits page');
assert.match(index, /href="\/support\.html"/, 'index links support page');
assert.match(index, /href="\/sample-request\.html"/, 'index links sample request page');
for (const page of pages) {
  assert.match(index, new RegExp(`href="/${page}"`), `index links ${page}`);
}
assert.match(index, /href="\/sample-segments\.html"/, 'index links segment hub');
assert.match(index, /href="\/buyer-guide\.html"/, 'index links buyer guide');
assert.match(index, /href="\/delivery\.html"/, 'index links delivery page');

const checkout = read('checkout.html');
assert.match(checkout, /<title>Opening Stripe Checkout \| NYC Construction Activity Brief<\/title>/, 'checkout page needs title');
assert.match(checkout, /<meta name="robots" content="noindex">/, 'checkout page must be noindex');
assert.match(checkout, /checkout_intent/, 'checkout page tracks checkout intent');
assert.match(checkout, new RegExp(stripeCheckoutUrl), 'checkout page redirects to launch-price Stripe checkout');
assert.match(checkout, /utm_source: 'nyc_construction_activity_brief'/, 'checkout page passes UTM source to Stripe');
assert.match(checkout, /utm_medium: 'owned_site'/, 'checkout page passes UTM medium to Stripe');
assert.match(checkout, /utm_campaign: 'current_issue_launch'/, 'checkout page passes UTM campaign to Stripe');
assert.match(checkout, /utm_content: source/, 'checkout page passes source as UTM content to Stripe');
assert.match(checkout, /client_reference_id: \['ncab', source\.replace/, 'checkout page passes non-sensitive client reference to Stripe');
assert.match(checkout, /Continue to Stripe/, 'checkout page has fallback link');
assert.match(checkout, /client_reference_id=ncab_checkout_static/, 'checkout page static fallback has client reference');
assert.match(checkout, /utm_content=checkout_static/, 'checkout page static fallback has UTM content');
assert.match(checkout, /checkout_continue_clicked/, 'checkout page tracks manual continue clicks');
assert.match(checkout, /checkout_auto_redirect/, 'checkout page tracks automatic redirects');
assert.match(checkout, /Instant browser download after completed Stripe checkout\./, 'checkout page has buyer reassurance copy');
assert.match(checkout, /Full 142-row CSV/, 'checkout page states paid row count before Stripe');
assert.match(checkout, /After Stripe confirms payment/, 'checkout page explains paid download before Stripe');
assert.match(checkout, /Public-record screening file only/, 'checkout page states source boundary before Stripe');
assert.match(checkout, /href="\/preview\.html"/, 'checkout page links preview for buyer reassurance');
assert.match(checkout, /href="\/inside-the-zip\.html"/, 'checkout page links ZIP contents for buyer reassurance');
assert.match(checkout, /href="\/support\.html"/, 'checkout page links support and refund boundary');
assert.match(checkout, /\}, 1800\);/, 'checkout page gives buyers time to read reassurance before Stripe');
assert.match(checkout, /<noscript>/, 'checkout page has no-JavaScript fallback copy');
assert.match(checkout, /\/_vercel\/insights\/script\.js/, 'checkout page needs Web Analytics script');

const buy = read('buy.html');
assert.match(buy, /<title>Buy Current Issue \| NYC Construction Activity Brief<\/title>/, 'buy page needs title');
assert.doesNotMatch(buy, /<meta name="robots" content="noindex">/, 'buy page should be indexable');
assert.match(buy, /<meta name="description" content="Buy the current NYC Weekly Construction Activity Brief ZIP/, 'buy page needs meta description');
assert.match(buy, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html">/, 'buy page needs canonical');
assert.match(buy, /<meta property="og:title" content="Buy Current Issue \| NYC Construction Activity Brief">/, 'buy page needs OG title');
assert.match(buy, /<meta property="og:url" content="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html">/, 'buy page needs OG URL');
assert.match(buy, /"@type":"Product"/, 'buy page needs Product structured data');
assert.match(buy, /"price":"9.50"/, 'buy page needs current price structured data');
assert.match(buy, /href="https:\/\/buy\.stripe\.com\/bJe3cveXL6Hw9mLdLFcAo0Q\?utm_source=nyc_construction_activity_brief&amp;utm_medium=owned_site&amp;utm_campaign=current_issue_launch&amp;utm_content=buy_page_static&amp;client_reference_id=ncab_buy_page_static"/, 'buy page static fallback links Stripe with attribution');
assert.match(buy, /Full 142-row CSV/, 'buy page states paid row count');
assert.match(buy, /breaks even at about 8 minutes/, 'buy page states launch price break-even');
assert.match(buy, /No private contacts/, 'buy page states buyer boundary');
assert.match(buy, /buy_page_viewed/, 'buy page tracks page view');
assert.match(buy, /buy_page_continue_clicked/, 'buy page tracks manual continue click');
assert.match(buy, /buy_page_auto_redirect/, 'buy page tracks automatic redirect');
assert.match(buy, /const rawSource = params\.get\('source'\) \|\| 'buy-page';/, 'buy page reads source query');
assert.match(buy, /utm_source: 'nyc_construction_activity_brief'/, 'buy page passes UTM source to Stripe');
assert.match(buy, /utm_medium: 'owned_site'/, 'buy page passes UTM medium to Stripe');
assert.match(buy, /utm_campaign: 'current_issue_launch'/, 'buy page passes UTM campaign to Stripe');
assert.match(buy, /utm_content: source/, 'buy page passes source as UTM content to Stripe');
assert.match(buy, /client_reference_id: \['ncab', source\.replace/, 'buy page passes non-sensitive client reference to Stripe');
assert.match(buy, /window\.location\.replace\(stripeUrl\);/, 'buy page redirects directly to attributed Stripe URL');
assert.match(buy, /\}, 900\);/, 'buy page uses shorter direct Stripe redirect delay');
assert.match(buy, /checkout\.html\?source=buy-page/, 'buy page keeps checkout bridge fallback for no-JavaScript users');
assert.match(buy, /href="\/preview\.html"/, 'buy page links preview');
assert.match(buy, /href="\/inside-the-zip\.html"/, 'buy page links ZIP contents');
assert.match(buy, /href="\/free-vs-paid\.html"/, 'buy page links free vs paid page');
assert.match(buy, /href="\/support\.html"/, 'buy page links support');
assert.match(buy, /\}, 900\);/, 'buy page gives buyers a short purchase-fact pause before Stripe');

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
assert.match(preview, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/preview\.html">/, 'preview page needs canonical');
assert.match(preview, /<meta property="og:title" content="Public Preview \| NYC Construction Activity Brief">/, 'preview page needs OG title');
assert.match(preview, /src="\/assets\/current-issue-snapshot\.png"/, 'preview page needs current issue snapshot image');
assert.match(preview, /"@type":"Product"/, 'preview page needs Product structured data');
assert.match(preview, /"@type":"Dataset"/, 'preview page needs Dataset structured data');
assert.match(preview, /\/_vercel\/insights\/script\.js/, 'preview page needs Web Analytics script');
assert.match(preview, /25-row browser preview/, 'preview page needs public preview count');
assert.match(preview, /full 142-row ZIP/, 'preview page needs paid row count');
assert.match(preview, /<h2>Sample rows<\/h2>/, 'preview page needs sample rows section');
assert.equal((preview.match(/DOB NOW row/g) || []).length, 25, 'preview page should list 25 source-linked rows');
assert.match(preview, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'preview page links sample CSV');
assert.match(preview, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'preview page links sample brief');
assert.match(preview, /href="\/sample-segments\.html"/, 'preview page links segment hub');
assert.match(preview, /href="\/free-vs-paid\.html"/, 'preview page links free vs paid page');
assert.match(preview, /href="\/permit-research-workflow\.html"/, 'preview page links research workflow page');
assert.match(preview, /href="\/inside-the-zip\.html"/, 'preview page links inside the ZIP page');
assert.match(preview, /href="\/pricing\.html"/, 'preview page links pricing page');
assert.match(preview, /href="\/support\.html"/, 'preview page links support page');
assert.match(preview, new RegExp(`href="${purchaseUrl}"`), 'preview page links tracked buy page');
assert.match(preview, /data-sample-request-form/, 'preview page needs sample request form');
assert.match(preview, /\/api\/sample-request/, 'preview page posts sample requests to API');
assert.match(preview, /data\.source_path = window\.location\.pathname;/, 'preview page sends source path with sample request');
assert.match(preview, /const requestSource = \['sample-request', window\.location\.pathname\.replace/, 'preview page builds page-specific sample request checkout source');
assert.match(preview, /sample_request_saved/, 'preview page tracks saved sample requests');
assert.match(preview, /sample_request_failed/, 'preview page tracks failed sample requests');
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
assert.match(pricing, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/pricing\.html">/, 'pricing page needs canonical');
assert.match(pricing, /<meta property="og:title" content="Pricing and ROI \| NYC Construction Activity Brief">/, 'pricing page needs OG title');
assert.match(pricing, /src="\/assets\/current-issue-snapshot\.png"/, 'pricing page needs current issue snapshot image');
assert.match(pricing, /"@type":"Product"/, 'pricing page needs Product structured data');
assert.match(pricing, /"@type":"FAQPage"/, 'pricing page needs FAQ structured data');
assert.match(pricing, /\/_vercel\/insights\/script\.js/, 'pricing page needs Web Analytics script');
assert.match(pricing, /<h2>Break-even guide<\/h2>/, 'pricing page needs break-even section');
assert.match(pricing, /\$49/, 'pricing page needs standard price');
assert.match(pricing, /\$9\.50/, 'pricing page needs discounted price');
assert.match(pricing, /No promo code is required/, 'pricing page needs direct launch price copy');
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
assert.match(currentIssuePage, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/current-issue\.html">/, 'current issue page needs canonical');
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
assert.match(currentIssuePage, new RegExp(`href="${purchaseUrl}"`), 'current issue page links tracked buy page');
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
assert.match(timeSavedCalculator, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/time-saved-calculator\.html">/, 'time saved calculator needs canonical');
assert.match(timeSavedCalculator, /<meta property="og:title" content="Time Saved Calculator \| NYC Construction Activity ZIP">/, 'time saved calculator needs OG title');
assert.match(timeSavedCalculator, /"@type":"Product"/, 'time saved calculator needs Product structured data');
assert.match(timeSavedCalculator, /"@type":"Offer"/, 'time saved calculator needs Offer structured data');
assert.match(timeSavedCalculator, /"price":"9.50"/, 'time saved calculator needs current price structured data');
assert.match(timeSavedCalculator, /"@type":"FAQPage"/, 'time saved calculator needs FAQ structured data');
assert.match(timeSavedCalculator, /\/_vercel\/insights\/script\.js/, 'time saved calculator needs Web Analytics script');
assert.match(timeSavedCalculator, /Time saved calculator for the current issue ZIP/, 'time saved calculator needs headline');
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
assert.match(whoShouldBuy, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/who-should-buy\.html">/, 'who should buy page needs canonical');
assert.match(whoShouldBuy, /<meta property="og:title" content="Who Should Buy \| NYC Construction Activity ZIP">/, 'who should buy page needs OG title');
assert.match(whoShouldBuy, /src="\/assets\/current-issue-snapshot\.png"/, 'who should buy page needs current issue snapshot image');
assert.match(whoShouldBuy, /"@type":"Product"/, 'who should buy page needs Product structured data');
assert.match(whoShouldBuy, /"@type":"Offer"/, 'who should buy page needs Offer structured data');
assert.match(whoShouldBuy, /"price":"9.50"/, 'who should buy page needs current price structured data');
assert.match(whoShouldBuy, /"@type":"FAQPage"/, 'who should buy page needs FAQ structured data');
assert.match(whoShouldBuy, /\/_vercel\/insights\/script\.js/, 'who should buy page needs Web Analytics script');
assert.match(whoShouldBuy, /Who should buy the current NYC construction activity ZIP/, 'who should buy page needs fit headline');
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
assert.match(insideZip, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/inside-the-zip\.html">/, 'inside ZIP page needs canonical');
assert.match(insideZip, /<meta property="og:title" content="Inside the ZIP \| NYC Construction Activity Brief">/, 'inside ZIP page needs OG title');
assert.match(insideZip, /src="\/assets\/current-issue-snapshot\.png"/, 'inside ZIP page needs current issue snapshot image');
assert.match(insideZip, /"@type":"Product"/, 'inside ZIP page needs Product structured data');
assert.match(insideZip, /"@type":"Dataset"/, 'inside ZIP page needs Dataset structured data');
assert.match(insideZip, /"@type":"FAQPage"/, 'inside ZIP page needs FAQ structured data');
assert.match(insideZip, /\/_vercel\/insights\/script\.js/, 'inside ZIP page needs Web Analytics script');
assert.match(insideZip, /What is inside the current paid ZIP/, 'inside ZIP page needs package headline');
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
assert.match(csvFieldGuide, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/csv-field-guide\.html">/, 'CSV field guide needs canonical');
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

const permitCsv = read('nyc-dob-permit-csv.html');
assert.match(permitCsv, /<title>NYC DOB Permit CSV \| Construction Activity Brief<\/title>/, 'permit CSV page needs title');
assert.match(permitCsv, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-dob-permit-csv\.html">/, 'permit CSV page needs canonical');
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
assert.match(permitCsv, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'permit CSV page links sample brief');
assert.match(permitCsv, /href="\/csv-field-guide\.html"/, 'permit CSV page links CSV field guide');
assert.match(permitCsv, /href="\/free-vs-paid\.html"/, 'permit CSV page links free vs paid');
assert.match(permitCsv, /href="\/sample-segments\.html"/, 'permit CSV page links segment hub');
assert.match(permitCsv, /href="\/permit-research-workflow\.html"/, 'permit CSV page links research workflow');
assert.match(permitCsv, /href="\/inside-the-zip\.html"/, 'permit CSV page links ZIP contents');
assert.match(permitCsv, /href="\/buyer-guide\.html"/, 'permit CSV page links buyer guide');
assert.match(permitCsv, /href="\/pricing\.html"/, 'permit CSV page links pricing');
assert.match(permitCsv, /href="\/support\.html"/, 'permit CSV page links support');
assert.match(permitCsv, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=nyc-dob-permit-csv"/, 'permit CSV page links tracked buy page');
assertSampleRequestForm(permitCsv, 'permit CSV page');
assert.match(permitCsv, /No guaranteed leads\./, 'permit CSV page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(permitCsv, pattern, `nyc-dob-permit-csv.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(permitCsv, pattern, `nyc-dob-permit-csv.html contains private data pattern ${pattern}`);
}

const weeklyPermitReport = read('weekly-nyc-construction-permit-report.html');
assert.match(weeklyPermitReport, /<title>Weekly NYC Construction Permit Report \| DOB Brief<\/title>/, 'weekly permit report page needs title');
assert.match(weeklyPermitReport, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/weekly-nyc-construction-permit-report\.html">/, 'weekly permit report page needs canonical');
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
assert.match(weeklyPermitReport, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=weekly-nyc-construction-report"/, 'weekly permit report page links tracked buy page');
assertSampleRequestForm(weeklyPermitReport, 'weekly permit report page');
assert.match(weeklyPermitReport, /No guaranteed leads\./, 'weekly permit report page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(weeklyPermitReport, pattern, `weekly-nyc-construction-permit-report.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(weeklyPermitReport, pattern, `weekly-nyc-construction-permit-report.html contains private data pattern ${pattern}`);
}

const dobNowAlternative = read('dob-now-permit-search-alternative.html');
assert.match(dobNowAlternative, /<title>DOB NOW Permit Search Alternative \| NYC Construction Brief<\/title>/, 'DOB NOW alternative page needs title');
assert.match(dobNowAlternative, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/dob-now-permit-search-alternative\.html">/, 'DOB NOW alternative page needs canonical');
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
assert.match(dobNowAlternative, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=dob-now-alternative"/, 'DOB NOW alternative page links tracked buy page');
assertSampleRequestForm(dobNowAlternative, 'DOB NOW alternative page');
assert.match(dobNowAlternative, /No guaranteed leads\./, 'DOB NOW alternative page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(dobNowAlternative, pattern, `dob-now-permit-search-alternative.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(dobNowAlternative, pattern, `dob-now-permit-search-alternative.html contains private data pattern ${pattern}`);
}

const permitLeads = read('nyc-construction-permit-leads.html');
assert.match(permitLeads, /<title>NYC Construction Permit Leads \| Source-Linked Screening<\/title>/, 'permit leads page needs title');
assert.match(permitLeads, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-construction-permit-leads\.html">/, 'permit leads page needs canonical');
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
assert.match(permitLeads, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=permit-leads"/, 'permit leads page links tracked buy page');
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
assert.match(zipActivity, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-permit-activity-by-zip\.html">/, 'ZIP activity page needs canonical');
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
assert.match(zipActivity, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=permit-activity-by-zip"/, 'ZIP activity page links tracked buy page');
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
  assert.match(html, new RegExp(`<link rel="canonical" href="https:\\/\\/nyc-construction-activity-brief\\.vercel\\.app\\/${page.path.replace('.', '\\.')}">`), `${label} page needs canonical`);
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
  assert.match(html, new RegExp(`href="https:\\/\\/nyc-construction-activity-brief\\.vercel\\.app\\/buy\\.html\\?source=${page.checkoutSource}"`), `${label} page links tracked buy page`);
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
assert.match(sidewalkShedPermits, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-sidewalk-shed-permits\.html">/, 'sidewalk shed permits page needs canonical');
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
assert.match(sidewalkShedPermits, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=sidewalk-shed-permits"/, 'sidewalk shed permits page links tracked buy page');
assertSampleRequestForm(sidewalkShedPermits, 'sidewalk shed permits page');
assert.match(sidewalkShedPermits, /No guaranteed leads\./, 'sidewalk shed permits page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(sidewalkShedPermits, pattern, `nyc-sidewalk-shed-permits.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(sidewalkShedPermits, pattern, `nyc-sidewalk-shed-permits.html contains private data pattern ${pattern}`);
}

const plumbingPermits = read('nyc-plumbing-permits.html');
assert.match(plumbingPermits, /<title>NYC Plumbing Permits \| Current DOB Activity<\/title>/, 'plumbing permits page needs title');
assert.match(plumbingPermits, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-plumbing-permits\.html">/, 'plumbing permits page needs canonical');
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
assert.match(plumbingPermits, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=plumbing-permits"/, 'plumbing permits page links tracked buy page');
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
assert.match(sprinklerPermits, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-sprinkler-permits\.html">/, 'sprinkler permits page needs canonical');
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
assert.match(sprinklerPermits, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=sprinkler-permits"/, 'sprinkler permits page links tracked buy page');
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
  assert.match(html, new RegExp(`<link rel="canonical" href="https:\\/\\/nyc-construction-activity-brief\\.vercel\\.app\\/${page.path.replace('.', '\\.')}">`), `${label} page needs canonical`);
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
  assert.match(html, new RegExp(`href="https:\\/\\/nyc-construction-activity-brief\\.vercel\\.app\\/buy\\.html\\?source=${page.checkoutSource}"`), `${label} page links tracked buy page`);
  assertSampleRequestForm(html, `${label} page`);
  assert.match(html, /No guaranteed leads\./, `${label} page keeps claims boundary visible`);
  for (const pattern of bannedCopyPatterns) {
    assert.doesNotMatch(html, pattern, `${page.path} contains banned copy pattern ${pattern}`);
  }
  for (const pattern of privateDataPatterns) {
    assert.doesNotMatch(html, pattern, `${page.path} contains private data pattern ${pattern}`);
  }
}

const freeVsPaid = read('free-vs-paid.html');
assert.match(freeVsPaid, /<title>Free Preview vs Paid ZIP \| NYC Construction Brief<\/title>/, 'free vs paid page needs title');
assert.match(freeVsPaid, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/free-vs-paid\.html">/, 'free vs paid page needs canonical');
assert.match(freeVsPaid, /<meta property="og:title" content="Free Preview vs Paid ZIP \| NYC Construction Brief">/, 'free vs paid page needs OG title');
assert.match(freeVsPaid, /src="\/assets\/current-issue-snapshot\.png"/, 'free vs paid page needs current issue snapshot image');
assert.match(freeVsPaid, /"@type":"Product"/, 'free vs paid page needs Product structured data');
assert.match(freeVsPaid, /"@type":"Dataset"/, 'free vs paid page needs Dataset structured data');
assert.match(freeVsPaid, /"@type":"FAQPage"/, 'free vs paid page needs FAQ structured data');
assert.match(freeVsPaid, /"price":"9.50"/, 'free vs paid page needs current price structured data');
assert.match(freeVsPaid, /\/_vercel\/insights\/script\.js/, 'free vs paid page needs Web Analytics script');
assert.match(freeVsPaid, /Free preview and paid ZIP comparison/, 'free vs paid page needs headline');
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
assert.match(researchWorkflow, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/permit-research-workflow\.html">/, 'research workflow page needs canonical');
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

const contractorSupplier = read('contractor-supplier-permit-research.html');
assert.match(contractorSupplier, /<title>Contractor and Supplier Permit Research \| NYC Construction Brief<\/title>/, 'contractor and supplier guide needs title');
assert.match(contractorSupplier, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/contractor-supplier-permit-research\.html">/, 'contractor and supplier guide needs canonical');
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

const brokerDeveloper = read('broker-developer-permit-research.html');
assert.match(brokerDeveloper, /<title>Broker and Developer Permit Research \| NYC Construction Brief<\/title>/, 'broker and developer guide needs title');
assert.match(brokerDeveloper, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/broker-developer-permit-research\.html">/, 'broker and developer guide needs canonical');
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
assert.match(realEstateInvestor, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/real-estate-investor-permit-research\.html">/, 'real estate investor guide needs canonical');
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
assert.match(constructionConsultant, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/construction-consultant-permit-research\.html">/, 'construction consultant guide needs canonical');
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
assert.match(constructionRisk, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/construction-risk-permit-research\.html">/, 'construction risk guide needs canonical');
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
assert.match(permitExpediter, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/permit-expediter-research\.html">/, 'permit expediter guide needs canonical');
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
assert.match(propertyManager, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/property-manager-permit-research\.html">/, 'property manager guide needs canonical');
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

const buyerGuide = read('buyer-guide.html');
assert.match(buyerGuide, /<title>Buyer Guide \| NYC Construction Activity ZIP<\/title>/, 'buyer guide needs title');
assert.match(buyerGuide, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buyer-guide\.html">/, 'buyer guide needs canonical');
assert.match(buyerGuide, /<meta property="og:title" content="Buyer Guide \| NYC Construction Activity ZIP">/, 'buyer guide needs OG title');
assert.match(buyerGuide, /src="\/assets\/current-issue-snapshot\.png"/, 'buyer guide needs current issue snapshot image');
assert.match(buyerGuide, /"@type":"Product"/, 'buyer guide needs Product structured data');
assert.match(buyerGuide, /"@type":"Offer"/, 'buyer guide needs Offer structured data');
assert.match(buyerGuide, /"price":"9.50"/, 'buyer guide needs current price structured data');
assert.match(buyerGuide, /"@type":"FAQPage"/, 'buyer guide needs FAQ structured data');
assert.match(buyerGuide, /\/_vercel\/insights\/script\.js/, 'buyer guide needs Web Analytics script');
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
assert.match(delivery, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/delivery\.html">/, 'delivery page needs canonical');
assert.match(delivery, /<meta property="og:title" content="Delivery \| NYC Construction Activity Brief">/, 'delivery page needs OG title');
assert.match(delivery, /"@type":"Product"/, 'delivery page needs Product structured data');
assert.match(delivery, /"@type":"Offer"/, 'delivery page needs Offer structured data');
assert.match(delivery, /"@type":"FAQPage"/, 'delivery page needs FAQ structured data');
assert.match(delivery, /\/_vercel\/insights\/script\.js/, 'delivery page needs Web Analytics script');
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
assert.match(support, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/support\.html">/, 'support page needs canonical');
assert.match(support, /<meta property="og:title" content="Support and Refunds \| NYC Construction Activity Brief">/, 'support page needs OG title');
assert.match(support, /"@type":"Product"/, 'support page needs Product structured data');
assert.match(support, /"@type":"FAQPage"/, 'support page needs FAQ structured data');
assert.match(support, /\/_vercel\/insights\/script\.js/, 'support page needs Web Analytics script');
assert.match(support, /success\.html\?session_id=\{CHECKOUT_SESSION_ID\}/, 'support page explains success redirect');
assert.match(support, /\/api\/download/, 'support page explains download gate');
assert.match(support, /missing_or_invalid_session_id/, 'support page explains missing session error');
assert.match(support, /payment_required/, 'support page explains unpaid session error');
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
assert.match(sampleRequest, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample-request\.html">/, 'sample request page needs canonical');
assert.match(sampleRequest, /<meta property="og:title" content="Request a Sample Cut \| NYC Construction Activity Brief">/, 'sample request page needs OG title');
assert.match(sampleRequest, /"@type":"Product"/, 'sample request page needs Product structured data');
assert.match(sampleRequest, /"@type":"FAQPage"/, 'sample request page needs FAQ structured data');
assert.match(sampleRequest, /\/_vercel\/insights\/script\.js/, 'sample request page needs Web Analytics script');
assert.match(sampleRequest, /Request a future sample cut/, 'sample request page needs headline');
assert.match(sampleRequest, /Product-specific request only/, 'sample request page needs product-specific meta copy');
assert.match(sampleRequest, /work type, territory, or buyer view/, 'sample request page explains request scope');
assert.match(sampleRequest, /Requests are used only for this product's buyer segment/, 'sample request page states product-only routing');
assert.match(sampleRequest, /Do not send private account details/, 'sample request page warns against sensitive data');
assert.match(sampleRequest, /href="\/preview\.html"/, 'sample request page links preview');
assert.match(sampleRequest, /href="\/sample-segments\.html"/, 'sample request page links segment hub');
assert.match(sampleRequest, /href="\/current-issue\.html"/, 'sample request page links current issue');
assert.match(sampleRequest, /href="\/inside-the-zip\.html"/, 'sample request page links inside ZIP');
assert.match(sampleRequest, /href="\/pricing\.html"/, 'sample request page links pricing');
assert.match(sampleRequest, /href="\/support\.html"/, 'sample request page links support');
assert.match(sampleRequest, /href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html\?source=sample-request-page"/, 'sample request page links tracked buy page');
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
assert.match(hub, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample-segments\.html">/, 'hub needs canonical');
assert.match(hub, /<link rel="alternate" type="application\/rss\+xml"[^>]+href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/feed\.xml">/, 'hub links RSS feed');
assert.match(hub, /<link rel="alternate" type="application\/json"[^>]+href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/current-issue\.json">/, 'hub links current issue JSON');
assert.match(hub, /\/_vercel\/insights\/script\.js/, 'hub needs Web Analytics script');
assert.match(hub, /src="\/assets\/current-issue-snapshot\.png"/, 'hub needs current issue snapshot image');
assert.match(hub, /data-sample-request-form/, 'hub needs sample request form');
assert.match(hub, /\/api\/sample-request/, 'hub posts sample requests to API');
assert.match(hub, /data\.source_path = window\.location\.pathname;/, 'hub sends source path with sample request');
assert.match(hub, /const requestSource = \['sample-request', window\.location\.pathname\.replace/, 'hub builds page-specific sample request checkout source');
assert.match(hub, /sample_request_saved/, 'hub tracks saved sample requests');
assert.match(hub, /sample_request_failed/, 'hub tracks failed sample requests');
assert.match(hub, /encodeURIComponent\(requestSource\)/, 'hub links buy page with page-specific sample request source');
assert.match(hub, /href="\/preview\.html"/, 'hub links public preview page');
assert.match(hub, /href="\/pricing\.html"/, 'hub links pricing page');
assert.match(hub, /href="\/who-should-buy\.html"/, 'hub links who should buy page');
assert.match(hub, /href="\/free-vs-paid\.html"/, 'hub links free vs paid page');
assert.match(hub, /href="\/permit-research-workflow\.html"/, 'hub links research workflow page');
assert.match(hub, /href="\/inside-the-zip\.html"/, 'hub links inside the ZIP page');
assert.match(hub, /href="\/csv-field-guide\.html"/, 'hub links CSV field guide');
assert.match(hub, /href="\/support\.html"/, 'hub links support page');
assert.match(hub, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'hub links sample CSV');
assert.match(hub, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'hub links sample brief');
assert.match(hub, new RegExp(`href="${purchaseUrl}"`), 'hub links tracked buy page');
for (const page of generatedPages) {
  assert.match(hub, new RegExp(`href="/${page}"`), `hub links ${page}`);
}

const methodology = read('methodology.html');
assert.match(methodology, /<title>Methodology \| NYC Construction Activity Brief<\/title>/, 'methodology needs title');
assert.match(methodology, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/methodology\.html">/, 'methodology needs canonical');
assert.match(methodology, /<link rel="alternate" type="application\/rss\+xml"[^>]+href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/feed\.xml">/, 'methodology links RSS feed');
assert.match(methodology, /<link rel="alternate" type="application\/json"[^>]+href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/current-issue\.json">/, 'methodology links current issue JSON');
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
assert.match(methodology, /"contentUrl":"https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample\/nyc-construction-activity-preview\.csv"/, 'methodology Dataset links CSV preview');
assert.match(methodology, new RegExp(`"temporalCoverage":"${sourceDateRange()}"`), 'methodology Dataset needs current temporal coverage');
assert.match(methodology, /"@type":"FAQPage"/, 'methodology needs FAQ structured data');

const sitemap = read('sitemap.xml');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
for (const page of ['', 'current-issue.html', 'preview.html', 'buy.html', 'pricing.html', 'time-saved-calculator.html', 'who-should-buy.html', 'free-vs-paid.html', 'permit-research-workflow.html', 'contractor-supplier-permit-research.html', 'broker-developer-permit-research.html', 'real-estate-investor-permit-research.html', 'construction-consultant-permit-research.html', 'construction-risk-permit-research.html', 'permit-expediter-research.html', 'property-manager-permit-research.html', 'inside-the-zip.html', 'csv-field-guide.html', 'nyc-dob-permit-csv.html', 'weekly-nyc-construction-permit-report.html', 'dob-now-permit-search-alternative.html', 'nyc-construction-permit-leads.html', 'nyc-permit-activity-by-zip.html', 'manhattan-construction-permit-activity.html', 'brooklyn-construction-permit-activity.html', 'nyc-sidewalk-shed-permits.html', 'nyc-plumbing-permits.html', 'nyc-sprinkler-permits.html', 'buyer-guide.html', 'delivery.html', 'support.html', 'sample-request.html', 'sample-segments.html', 'methodology.html', ...pages]) {
  const url = page ? `${baseUrl}/${page}` : `${baseUrl}/`;
  assert.match(sitemap, new RegExp(`<loc>${url}</loc>`), `sitemap includes ${url}`);
}
assert.doesNotMatch(sitemap, new RegExp(`<loc>${baseUrl}\\/checkout\\.html</loc>`), 'sitemap must not include noindex checkout page');
for (const page of ['feed.xml', 'current-issue.json', 'llms.txt']) {
  assert.match(sitemap, new RegExp(`<loc>${baseUrl}/${page}</loc>`), `sitemap includes ${page}`);
}
const sitemapUrlCount = (sitemap.match(/<loc>/g) || []).length;
assert.equal(sitemapUrlCount, pages.length + 41, 'sitemap URL count must match generated surface and discovery files');
const sitemapLastmodCount = (sitemap.match(new RegExp(`<lastmod>${manifest.sourceFetchDate}</lastmod>`, 'g')) || []).length;
assert.equal(sitemapLastmodCount, sitemapUrlCount, 'sitemap needs accurate lastmod for every URL');

const robots = read('robots.txt');
assert.match(robots, /User-agent: \*/);
assert.match(robots, new RegExp(`Sitemap: ${baseUrl}/sitemap.xml`));
assert.match(robots, new RegExp(`Feed: ${baseUrl}/feed.xml`), 'robots points to RSS feed');
assert.match(robots, new RegExp(`Current-Issue: ${baseUrl}/current-issue.json`), 'robots points to current issue JSON');

const currentIssue = JSON.parse(read('current-issue.json'));
assert.equal(currentIssue.product, 'NYC Weekly Construction Activity Brief', 'current issue JSON names product');
assert.equal(currentIssue.issue, 'current', 'current issue JSON marks current issue');
assert.equal(currentIssue.publicPreview.rowCount, 25, 'current issue JSON row count matches public preview');
assert.equal(currentIssue.publicPreview.fullIssueRowCount, manifest.sourceRows, 'current issue JSON full issue row count matches manifest');
assert.equal(currentIssue.publicPreview.currentIssueUrl, 'https://nyc-construction-activity-brief.vercel.app/current-issue.html', 'current issue JSON public preview links current issue page');
assert.equal(currentIssue.publicPreview.previewUrl, 'https://nyc-construction-activity-brief.vercel.app/preview.html', 'current issue JSON links public preview page');
assert.equal(currentIssue.publicPreview.pricingUrl, 'https://nyc-construction-activity-brief.vercel.app/pricing.html', 'current issue JSON public preview links pricing page');
assert.equal(currentIssue.publicPreview.timeSavedCalculatorUrl, 'https://nyc-construction-activity-brief.vercel.app/time-saved-calculator.html', 'current issue JSON public preview links time saved calculator');
assert.equal(currentIssue.publicPreview.whoShouldBuyUrl, 'https://nyc-construction-activity-brief.vercel.app/who-should-buy.html', 'current issue JSON public preview links who should buy page');
assert.equal(currentIssue.publicPreview.freeVsPaidUrl, 'https://nyc-construction-activity-brief.vercel.app/free-vs-paid.html', 'current issue JSON public preview links free vs paid page');
assert.equal(currentIssue.publicPreview.researchWorkflowUrl, 'https://nyc-construction-activity-brief.vercel.app/permit-research-workflow.html', 'current issue JSON public preview links research workflow page');
assert.equal(currentIssue.publicPreview.contractorSupplierGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/contractor-supplier-permit-research.html', 'current issue JSON public preview links contractor and supplier guide');
assert.equal(currentIssue.publicPreview.brokerDeveloperGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/broker-developer-permit-research.html', 'current issue JSON public preview links broker and developer guide');
assert.equal(currentIssue.publicPreview.realEstateInvestorGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/real-estate-investor-permit-research.html', 'current issue JSON public preview links real estate investor guide');
assert.equal(currentIssue.publicPreview.constructionConsultantGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/construction-consultant-permit-research.html', 'current issue JSON public preview links construction consultant guide');
assert.equal(currentIssue.publicPreview.constructionRiskGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/construction-risk-permit-research.html', 'current issue JSON public preview links construction risk guide');
assert.equal(currentIssue.publicPreview.permitExpediterGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/permit-expediter-research.html', 'current issue JSON public preview links permit expediter guide');
assert.equal(currentIssue.publicPreview.propertyManagerGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/property-manager-permit-research.html', 'current issue JSON public preview links property manager guide');
assert.equal(currentIssue.publicPreview.insideZipUrl, 'https://nyc-construction-activity-brief.vercel.app/inside-the-zip.html', 'current issue JSON public preview links inside ZIP page');
assert.equal(currentIssue.publicPreview.permitCsvUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-dob-permit-csv.html', 'current issue JSON public preview links permit CSV page');
assert.equal(currentIssue.publicPreview.weeklyPermitReportUrl, 'https://nyc-construction-activity-brief.vercel.app/weekly-nyc-construction-permit-report.html', 'current issue JSON public preview links weekly report page');
assert.equal(currentIssue.publicPreview.dobNowAlternativeUrl, 'https://nyc-construction-activity-brief.vercel.app/dob-now-permit-search-alternative.html', 'current issue JSON public preview links DOB NOW alternative page');
assert.equal(currentIssue.publicPreview.permitLeadsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-construction-permit-leads.html', 'current issue JSON public preview links permit leads page');
assert.equal(currentIssue.publicPreview.permitActivityByZipUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-permit-activity-by-zip.html', 'current issue JSON public preview links ZIP permit activity page');
assert.equal(currentIssue.publicPreview.manhattanPermitActivityUrl, 'https://nyc-construction-activity-brief.vercel.app/manhattan-construction-permit-activity.html', 'current issue JSON public preview links Manhattan permit activity page');
assert.equal(currentIssue.publicPreview.brooklynPermitActivityUrl, 'https://nyc-construction-activity-brief.vercel.app/brooklyn-construction-permit-activity.html', 'current issue JSON public preview links Brooklyn permit activity page');
assert.equal(currentIssue.publicPreview.sidewalkShedPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-sidewalk-shed-permits.html', 'current issue JSON public preview links sidewalk shed permits page');
assert.equal(currentIssue.publicPreview.plumbingPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-plumbing-permits.html', 'current issue JSON public preview links plumbing permits page');
assert.equal(currentIssue.publicPreview.sprinklerPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-sprinkler-permits.html', 'current issue JSON public preview links sprinkler permits page');
assert.equal(currentIssue.publicPreview.mechanicalSystemsPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-mechanical-systems-permits.html', 'current issue JSON public preview links mechanical systems permits page');
assert.equal(currentIssue.publicPreview.supportedScaffoldPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-supported-scaffold-permits.html', 'current issue JSON public preview links supported scaffold permits page');
assert.equal(currentIssue.publicPreview.structuralPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-structural-permits.html', 'current issue JSON public preview links structural permits page');
assert.equal(currentIssue.publicPreview.constructionFencePermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-construction-fence-permits.html', 'current issue JSON public preview links construction fence permits page');
assert.equal(currentIssue.publicPreview.purchaseUrl, 'https://nyc-construction-activity-brief.vercel.app/buy.html', 'current issue JSON public preview exposes buy page as purchase URL');
assert.equal(currentIssue.publicPreview.checkoutUrl, 'https://nyc-construction-activity-brief.vercel.app/checkout.html?source=current-issue', 'current issue JSON links tracked checkout');
assert.equal(currentIssue.publicPreview.checkoutBridgeUrl, 'https://nyc-construction-activity-brief.vercel.app/checkout.html?source=current-issue', 'current issue JSON public preview exposes checkout bridge URL');
assert.equal(currentIssue.publicPreview.stripeCheckoutUrl, 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q', 'current issue JSON keeps Stripe checkout URL');
assert.equal(currentIssue.publicPreview.buyerGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/buyer-guide.html', 'current issue JSON public preview links buyer guide');
assert.equal(currentIssue.publicPreview.deliveryUrl, 'https://nyc-construction-activity-brief.vercel.app/delivery.html', 'current issue JSON public preview links delivery page');
assert.equal(currentIssue.publicPreview.supportUrl, 'https://nyc-construction-activity-brief.vercel.app/support.html', 'current issue JSON public preview links support page');
assert.equal(currentIssue.publicPreview.sampleRequestUrl, 'https://nyc-construction-activity-brief.vercel.app/sample-request.html', 'current issue JSON public preview links sample request page');
assert.equal(currentIssue.publicPreview.imageUrl, 'https://nyc-construction-activity-brief.vercel.app/assets/current-issue-snapshot.png', 'current issue JSON public preview links social image');
assert.equal(currentIssue.publicPreview.buyUrl, 'https://nyc-construction-activity-brief.vercel.app/buy.html', 'current issue JSON public preview links buy page');
assert.equal(currentIssue.paidZip.buyerGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/buyer-guide.html', 'current issue JSON paid ZIP links buyer guide');
assert.equal(currentIssue.paidZip.deliveryUrl, 'https://nyc-construction-activity-brief.vercel.app/delivery.html', 'current issue JSON paid ZIP links delivery page');
assert.equal(currentIssue.paidZip.supportUrl, 'https://nyc-construction-activity-brief.vercel.app/support.html', 'current issue JSON paid ZIP links support page');
assert.equal(currentIssue.paidZip.sampleRequestUrl, 'https://nyc-construction-activity-brief.vercel.app/sample-request.html', 'current issue JSON paid ZIP links sample request page');
assert.equal(currentIssue.paidZip.imageUrl, 'https://nyc-construction-activity-brief.vercel.app/assets/current-issue-snapshot.png', 'current issue JSON paid ZIP links social image');
assert.equal(currentIssue.paidZip.purchaseUrl, 'https://nyc-construction-activity-brief.vercel.app/buy.html', 'current issue JSON paid ZIP exposes buy page as purchase URL');
assert.equal(currentIssue.paidZip.checkoutUrl, 'https://nyc-construction-activity-brief.vercel.app/checkout.html?source=current-issue', 'current issue JSON paid ZIP links tracked checkout');
assert.equal(currentIssue.paidZip.checkoutBridgeUrl, 'https://nyc-construction-activity-brief.vercel.app/checkout.html?source=current-issue', 'current issue JSON paid ZIP exposes checkout bridge URL');
assert.equal(currentIssue.paidZip.buyUrl, 'https://nyc-construction-activity-brief.vercel.app/buy.html', 'current issue JSON paid ZIP links buy page');
assert.equal(currentIssue.paidZip.currentIssueUrl, 'https://nyc-construction-activity-brief.vercel.app/current-issue.html', 'current issue JSON paid ZIP links current issue page');
assert.equal(currentIssue.paidZip.stripeCheckoutUrl, 'https://buy.stripe.com/bJe3cveXL6Hw9mLdLFcAo0Q', 'current issue JSON paid ZIP keeps Stripe checkout URL');
assert.equal(currentIssue.paidZip.pricingUrl, 'https://nyc-construction-activity-brief.vercel.app/pricing.html', 'current issue JSON paid ZIP links pricing page');
assert.equal(currentIssue.paidZip.timeSavedCalculatorUrl, 'https://nyc-construction-activity-brief.vercel.app/time-saved-calculator.html', 'current issue JSON paid ZIP links time saved calculator');
assert.equal(currentIssue.paidZip.whoShouldBuyUrl, 'https://nyc-construction-activity-brief.vercel.app/who-should-buy.html', 'current issue JSON paid ZIP links who should buy page');
assert.equal(currentIssue.paidZip.freeVsPaidUrl, 'https://nyc-construction-activity-brief.vercel.app/free-vs-paid.html', 'current issue JSON paid ZIP links free vs paid page');
assert.equal(currentIssue.paidZip.researchWorkflowUrl, 'https://nyc-construction-activity-brief.vercel.app/permit-research-workflow.html', 'current issue JSON paid ZIP links research workflow page');
assert.equal(currentIssue.paidZip.contractorSupplierGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/contractor-supplier-permit-research.html', 'current issue JSON paid ZIP links contractor and supplier guide');
assert.equal(currentIssue.paidZip.brokerDeveloperGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/broker-developer-permit-research.html', 'current issue JSON paid ZIP links broker and developer guide');
assert.equal(currentIssue.paidZip.realEstateInvestorGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/real-estate-investor-permit-research.html', 'current issue JSON paid ZIP links real estate investor guide');
assert.equal(currentIssue.paidZip.constructionConsultantGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/construction-consultant-permit-research.html', 'current issue JSON paid ZIP links construction consultant guide');
assert.equal(currentIssue.paidZip.constructionRiskGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/construction-risk-permit-research.html', 'current issue JSON paid ZIP links construction risk guide');
assert.equal(currentIssue.paidZip.permitExpediterGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/permit-expediter-research.html', 'current issue JSON paid ZIP links permit expediter guide');
assert.equal(currentIssue.paidZip.propertyManagerGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/property-manager-permit-research.html', 'current issue JSON paid ZIP links property manager guide');
assert.equal(currentIssue.paidZip.insideZipUrl, 'https://nyc-construction-activity-brief.vercel.app/inside-the-zip.html', 'current issue JSON paid ZIP links inside ZIP page');
assert.equal(currentIssue.paidZip.permitCsvUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-dob-permit-csv.html', 'current issue JSON paid ZIP links permit CSV page');
assert.equal(currentIssue.paidZip.weeklyPermitReportUrl, 'https://nyc-construction-activity-brief.vercel.app/weekly-nyc-construction-permit-report.html', 'current issue JSON paid ZIP links weekly report page');
assert.equal(currentIssue.paidZip.dobNowAlternativeUrl, 'https://nyc-construction-activity-brief.vercel.app/dob-now-permit-search-alternative.html', 'current issue JSON paid ZIP links DOB NOW alternative page');
assert.equal(currentIssue.paidZip.permitLeadsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-construction-permit-leads.html', 'current issue JSON paid ZIP links permit leads page');
assert.equal(currentIssue.paidZip.permitActivityByZipUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-permit-activity-by-zip.html', 'current issue JSON paid ZIP links ZIP permit activity page');
assert.equal(currentIssue.paidZip.manhattanPermitActivityUrl, 'https://nyc-construction-activity-brief.vercel.app/manhattan-construction-permit-activity.html', 'current issue JSON paid ZIP links Manhattan permit activity page');
assert.equal(currentIssue.paidZip.brooklynPermitActivityUrl, 'https://nyc-construction-activity-brief.vercel.app/brooklyn-construction-permit-activity.html', 'current issue JSON paid ZIP links Brooklyn permit activity page');
assert.equal(currentIssue.paidZip.sidewalkShedPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-sidewalk-shed-permits.html', 'current issue JSON paid ZIP links sidewalk shed permits page');
assert.equal(currentIssue.paidZip.plumbingPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-plumbing-permits.html', 'current issue JSON paid ZIP links plumbing permits page');
assert.equal(currentIssue.paidZip.sprinklerPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-sprinkler-permits.html', 'current issue JSON paid ZIP links sprinkler permits page');
assert.equal(currentIssue.paidZip.mechanicalSystemsPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-mechanical-systems-permits.html', 'current issue JSON paid ZIP links mechanical systems permits page');
assert.equal(currentIssue.paidZip.supportedScaffoldPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-supported-scaffold-permits.html', 'current issue JSON paid ZIP links supported scaffold permits page');
assert.equal(currentIssue.paidZip.structuralPermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-structural-permits.html', 'current issue JSON paid ZIP links structural permits page');
assert.equal(currentIssue.paidZip.constructionFencePermitsUrl, 'https://nyc-construction-activity-brief.vercel.app/nyc-construction-fence-permits.html', 'current issue JSON paid ZIP links construction fence permits page');
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
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/current-issue\.html/, 'RSS feed links current issue page');
assert.match(feed, /The free CSV preview has 25 rows/, 'RSS feed describes free preview size');
assert.match(feed, /Launch price is \$9\.50/, 'RSS feed describes launch price');
assert.match(feed, /Buy the current issue ZIP/, 'RSS feed includes buy page item');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html/, 'RSS feed links buy page');
assert.match(feed, /instant browser download after paid Stripe checkout/, 'RSS feed describes paid delivery path');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/preview\.html/, 'RSS feed links public preview page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/pricing\.html/, 'RSS feed links pricing page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/time-saved-calculator\.html/, 'RSS feed links time saved calculator');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/who-should-buy\.html/, 'RSS feed links who should buy page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/free-vs-paid\.html/, 'RSS feed links free vs paid page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/permit-research-workflow\.html/, 'RSS feed links research workflow page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/contractor-supplier-permit-research\.html/, 'RSS feed links contractor and supplier guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/broker-developer-permit-research\.html/, 'RSS feed links broker and developer guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/real-estate-investor-permit-research\.html/, 'RSS feed links real estate investor guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/construction-consultant-permit-research\.html/, 'RSS feed links construction consultant guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/construction-risk-permit-research\.html/, 'RSS feed links construction risk guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/permit-expediter-research\.html/, 'RSS feed links permit expediter guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/property-manager-permit-research\.html/, 'RSS feed links property manager guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/inside-the-zip\.html/, 'RSS feed links inside the ZIP page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-dob-permit-csv\.html/, 'RSS feed links permit CSV page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/weekly-nyc-construction-permit-report\.html/, 'RSS feed links weekly report page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/dob-now-permit-search-alternative\.html/, 'RSS feed links DOB NOW alternative page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-construction-permit-leads\.html/, 'RSS feed links permit leads page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-permit-activity-by-zip\.html/, 'RSS feed links ZIP permit activity page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/manhattan-construction-permit-activity\.html/, 'RSS feed links Manhattan permit activity page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/brooklyn-construction-permit-activity\.html/, 'RSS feed links Brooklyn permit activity page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-sidewalk-shed-permits\.html/, 'RSS feed links sidewalk shed permits page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-plumbing-permits\.html/, 'RSS feed links plumbing permits page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-sprinkler-permits\.html/, 'RSS feed links sprinkler permits page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-mechanical-systems-permits\.html/, 'RSS feed links mechanical systems permits page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-supported-scaffold-permits\.html/, 'RSS feed links supported scaffold permits page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-structural-permits\.html/, 'RSS feed links structural permits page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-construction-fence-permits\.html/, 'RSS feed links construction fence permits page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample-segments\.html/, 'RSS feed links segment hub');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/buyer-guide\.html/, 'RSS feed links buyer guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/delivery\.html/, 'RSS feed links delivery page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/support\.html/, 'RSS feed links support page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample-request\.html/, 'RSS feed links sample request page');

const llms = read('llms.txt');
assert.match(llms, /# NYC Weekly Construction Activity Brief/, 'llms.txt names product');
assert.match(llms, /Free CSV preview rows: 25/, 'llms.txt has free preview row count');
assert.match(llms, /Primary purchase page: https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html/, 'llms.txt exposes primary purchase page');
assert.match(llms, /Checkout bridge: https:\/\/nyc-construction-activity-brief\.vercel\.app\/checkout\.html\?source=current-issue/, 'llms.txt labels checkout bridge');
assert.match(llms, /Current issue page: https:\/\/nyc-construction-activity-brief\.vercel\.app\/current-issue\.html/, 'llms.txt links current issue page');
assert.match(llms, /Buy page: https:\/\/nyc-construction-activity-brief\.vercel\.app\/buy\.html/, 'llms.txt links buy page');
assert.match(llms, /Public preview: https:\/\/nyc-construction-activity-brief\.vercel\.app\/preview\.html/, 'llms.txt links public preview page');
assert.match(llms, /Pricing: https:\/\/nyc-construction-activity-brief\.vercel\.app\/pricing\.html/, 'llms.txt links pricing page');
assert.match(llms, /Time saved calculator: https:\/\/nyc-construction-activity-brief\.vercel\.app\/time-saved-calculator\.html/, 'llms.txt links time saved calculator');
assert.match(llms, /Who should buy: https:\/\/nyc-construction-activity-brief\.vercel\.app\/who-should-buy\.html/, 'llms.txt links who should buy page');
assert.match(llms, /Free preview vs paid ZIP: https:\/\/nyc-construction-activity-brief\.vercel\.app\/free-vs-paid\.html/, 'llms.txt links free vs paid page');
assert.match(llms, /Research workflow: https:\/\/nyc-construction-activity-brief\.vercel\.app\/permit-research-workflow\.html/, 'llms.txt links research workflow page');
assert.match(llms, /Contractor and supplier guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/contractor-supplier-permit-research\.html/, 'llms.txt links contractor and supplier guide');
assert.match(llms, /Broker and developer guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/broker-developer-permit-research\.html/, 'llms.txt links broker and developer guide');
assert.match(llms, /Real estate investor guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/real-estate-investor-permit-research\.html/, 'llms.txt links real estate investor guide');
assert.match(llms, /Construction consultant guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/construction-consultant-permit-research\.html/, 'llms.txt links construction consultant guide');
assert.match(llms, /Construction risk guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/construction-risk-permit-research\.html/, 'llms.txt links construction risk guide');
assert.match(llms, /Permit expediter guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/permit-expediter-research\.html/, 'llms.txt links permit expediter guide');
assert.match(llms, /Property manager guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/property-manager-permit-research\.html/, 'llms.txt links property manager guide');
assert.match(llms, /Inside the ZIP: https:\/\/nyc-construction-activity-brief\.vercel\.app\/inside-the-zip\.html/, 'llms.txt links inside the ZIP page');
assert.match(llms, /NYC DOB permit CSV: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-dob-permit-csv\.html/, 'llms.txt links permit CSV page');
assert.match(llms, /Weekly NYC construction permit report: https:\/\/nyc-construction-activity-brief\.vercel\.app\/weekly-nyc-construction-permit-report\.html/, 'llms.txt links weekly report page');
assert.match(llms, /DOB NOW permit search alternative: https:\/\/nyc-construction-activity-brief\.vercel\.app\/dob-now-permit-search-alternative\.html/, 'llms.txt links DOB NOW alternative page');
assert.match(llms, /NYC construction permit leads alternative: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-construction-permit-leads\.html/, 'llms.txt links permit leads page');
assert.match(llms, /NYC permit activity by ZIP: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-permit-activity-by-zip\.html/, 'llms.txt links ZIP permit activity page');
assert.match(llms, /Manhattan construction permit activity: https:\/\/nyc-construction-activity-brief\.vercel\.app\/manhattan-construction-permit-activity\.html/, 'llms.txt links Manhattan permit activity page');
assert.match(llms, /Brooklyn construction permit activity: https:\/\/nyc-construction-activity-brief\.vercel\.app\/brooklyn-construction-permit-activity\.html/, 'llms.txt links Brooklyn permit activity page');
assert.match(llms, /NYC sidewalk shed permits: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-sidewalk-shed-permits\.html/, 'llms.txt links sidewalk shed permits page');
assert.match(llms, /NYC plumbing permits: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-plumbing-permits\.html/, 'llms.txt links plumbing permits page');
assert.match(llms, /NYC sprinkler permits: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-sprinkler-permits\.html/, 'llms.txt links sprinkler permits page');
assert.match(llms, /NYC mechanical systems permits: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-mechanical-systems-permits\.html/, 'llms.txt links mechanical systems permits page');
assert.match(llms, /NYC supported scaffold permits: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-supported-scaffold-permits\.html/, 'llms.txt links supported scaffold permits page');
assert.match(llms, /NYC structural permits: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-structural-permits\.html/, 'llms.txt links structural permits page');
assert.match(llms, /NYC construction fence permits: https:\/\/nyc-construction-activity-brief\.vercel\.app\/nyc-construction-fence-permits\.html/, 'llms.txt links construction fence permits page');
assert.match(llms, /Paid ZIP rows: 142/, 'llms.txt has paid ZIP row count');
assert.match(llms, /Promo code required: no/, 'llms.txt states promo code is not required');
assert.match(llms, /Stripe Payment Link: https:\/\/buy\.stripe\.com\/bJe3cveXL6Hw9mLdLFcAo0Q/, 'llms.txt keeps Stripe checkout URL');
assert.match(llms, /Social image: https:\/\/nyc-construction-activity-brief\.vercel\.app\/assets\/current-issue-snapshot\.png/, 'llms.txt links social image');
assert.match(llms, /Buyer guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/buyer-guide\.html/, 'llms.txt links buyer guide');
assert.match(llms, /Delivery steps: https:\/\/nyc-construction-activity-brief\.vercel\.app\/delivery\.html/, 'llms.txt links delivery page');
assert.match(llms, /Support and refunds: https:\/\/nyc-construction-activity-brief\.vercel\.app\/support\.html/, 'llms.txt links support page');
assert.match(llms, /Sample request: https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample-request\.html/, 'llms.txt links sample request page');
assert.match(llms, /Buyer-only files: buyer-workbook\.md, buyer-priority-slices\.csv/, 'llms.txt lists buyer-only files');
assert.match(llms, /No guaranteed leads\./, 'llms.txt keeps claims boundary');

const publicCsv = read('sample/nyc-construction-activity-preview.csv').trim().split(/\r?\n/);
assert.equal(publicCsv.length - 1, 25, 'public CSV preview must stay limited to 25 rows');

const indexNowKey = read('320c87511764a53abe2cd8aa0481f1bc.txt').trim();
assert.equal(indexNowKey, '320c87511764a53abe2cd8aa0481f1bc', 'IndexNow key file must match submission script');

assert.ok(fs.existsSync(socialImagePath), 'current issue snapshot PNG exists');
const socialImage = fs.readFileSync(socialImagePath);
assert.equal(socialImage.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'current issue snapshot is a PNG');
assert.ok(socialImage.length > 10000, 'current issue snapshot PNG has real image content');

console.log('seo page validation passed');
