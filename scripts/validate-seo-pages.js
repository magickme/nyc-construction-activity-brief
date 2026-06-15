const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const checkoutUrl = 'https://nyc-construction-activity-brief.vercel.app/checkout.html\\?source=[a-z0-9._-]+';
const relativeCheckoutUrl = '/checkout.html\\?source=[a-z0-9._-]+';
const stripeCheckoutUrl = 'https://buy.stripe.com/7sY7sLaHv9TI2Yn5f9cAo0P';
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
  assert.match(html, /"price":"24.50"/, `${relativePath} needs current price structured data`);
  assert.match(html, /"@type":"BreadcrumbList"/, `${relativePath} needs breadcrumb structured data`);
  assert.match(html, /\/_vercel\/insights\/script\.js/, `${relativePath} needs Web Analytics script`);
  assert.match(html, /<h1>[^<]+<\/h1>/, `${relativePath} needs one visible h1`);
  assert.match(html, /href="\/sample\/nyc-construction-activity-preview\.csv"/, `${relativePath} links sample CSV`);
  assert.match(html, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, `${relativePath} links sample brief`);
  assert.match(html, new RegExp(`href="${checkoutUrl}"`), `${relativePath} links tracked checkout`);
  assert.match(html, /data-sample-request-form/, `${relativePath} needs sample request form`);
  assert.match(html, /\/api\/sample-request/, `${relativePath} posts sample requests to API`);
  assert.match(html, /data\.source_path = window\.location\.pathname;/, `${relativePath} sends source path with sample request`);
  assert.match(html, /sample_request_saved/, `${relativePath} tracks saved sample requests`);
  assert.match(html, /\/checkout\.html\?source=sample-request-success/, `${relativePath} links checkout after saved sample request`);
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

assert.equal(manifest.sourceRows, 142, 'manifest source row count changed unexpectedly');
assert.equal(manifest.manualPages, pageData.length, 'manifest manual page count must match seo-pages.json');
assert.ok(manifest.generatedPages >= 65, 'expected at least 65 generated long-tail pages');
assert.equal(manifest.totalTopicPages, pages.length, 'manifest topic page count must match slugs');

for (const page of pages) {
  assertHtmlPage(page);
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
assert.match(index, /\/_vercel\/insights\/script\.js/, 'index needs Web Analytics script');
assert.doesNotMatch(index, /Delivered by email after purchase/i, 'index must not promise email delivery');
assert.match(index, /Instant download after completed Stripe checkout/, 'index needs current automated delivery copy');
assert.match(index, /Buy instant ZIP/, 'index needs a clear instant ZIP checkout CTA');
assert.match(index, new RegExp(`href="${relativeCheckoutUrl}"`), 'index links tracked checkout');
assert.match(index, /Launch price is \$24\.50 for the current issue/, 'index needs launch price copy');
assert.match(index, /What is in the paid ZIP/, 'index needs paid package contents');
assert.match(index, /Free preview rows: 25\. Paid ZIP rows: 142/, 'index needs free versus paid row counts');
assert.match(index, /src="\/assets\/current-issue-snapshot\.png"/, 'index needs current issue snapshot image');
assert.match(index, /Buyer workbook with a fast review path/, 'index needs buyer workbook offer copy');
assert.match(index, /Priority-slices CSV grouped by work type/, 'index needs priority-slices offer copy');
assert.match(index, /data-sample-request-form/, 'index needs sample request form');
assert.match(index, /\/api\/sample-request/, 'index posts sample requests to API');
assert.match(index, /data\.source_path = window\.location\.pathname;/, 'index sends source path with sample request');
assert.match(index, /sample_request_saved/, 'index tracks saved sample requests');
assert.match(index, /\/checkout\.html\?source=sample-request-success/, 'index links checkout after saved sample request');
assert.match(index, /This does not join the MagickMe newsletter\./, 'index needs list-separation copy');
assert.match(index, /href="\/preview\.html"/, 'index links public preview page');
assert.match(index, /href="\/pricing\.html"/, 'index links pricing page');
assert.match(index, /href="\/inside-the-zip\.html"/, 'index links inside the ZIP page');
assert.match(index, /href="\/support\.html"/, 'index links support page');
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
assert.match(checkout, /Continue to Stripe/, 'checkout page has fallback link');
assert.match(checkout, /\/_vercel\/insights\/script\.js/, 'checkout page needs Web Analytics script');

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
assert.match(preview, /href="\/inside-the-zip\.html"/, 'preview page links inside the ZIP page');
assert.match(preview, /href="\/pricing\.html"/, 'preview page links pricing page');
assert.match(preview, /href="\/support\.html"/, 'preview page links support page');
assert.match(preview, new RegExp(`href="${checkoutUrl}"`), 'preview page links tracked checkout');
assert.match(preview, /data-sample-request-form/, 'preview page needs sample request form');
assert.match(preview, /\/api\/sample-request/, 'preview page posts sample requests to API');
assert.match(preview, /data\.source_path = window\.location\.pathname;/, 'preview page sends source path with sample request');
assert.match(preview, /sample_request_saved/, 'preview page tracks saved sample requests');
assert.match(preview, /\/checkout\.html\?source=sample-request-success/, 'preview page links checkout after saved sample request');
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
assert.match(pricing, /\$24\.50/, 'pricing page needs discounted price');
assert.match(pricing, /No promo code is required/, 'pricing page needs direct launch price copy');
assert.match(pricing, /About 40 minutes saved/, 'pricing page needs break-even examples');
assert.match(pricing, /href="\/preview\.html"/, 'pricing page links public preview');
assert.match(pricing, /href="\/inside-the-zip\.html"/, 'pricing page links inside the ZIP page');
assert.match(pricing, /href="\/buyer-guide\.html"/, 'pricing page links buyer guide');
assert.match(pricing, /href="\/delivery\.html"/, 'pricing page links delivery page');
assert.match(pricing, /href="\/support\.html"/, 'pricing page links support page');
assert.match(pricing, new RegExp(`href="${checkoutUrl}"`), 'pricing page links tracked checkout');
assert.match(pricing, /No guaranteed leads\./, 'pricing page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(pricing, pattern, `pricing.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(pricing, pattern, `pricing.html contains private data pattern ${pattern}`);
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
assert.match(insideZip, /\$24\.50/, 'inside ZIP page needs launch price');
assert.match(insideZip, /<h2>File manifest<\/h2>/, 'inside ZIP page needs file manifest');
assert.match(insideZip, /buyer-workbook\.md/, 'inside ZIP page lists buyer workbook');
assert.match(insideZip, /buyer-priority-slices\.csv/, 'inside ZIP page lists priority slices');
assert.match(insideZip, /qa-report\.json/, 'inside ZIP page lists QA report');
assert.match(insideZip, /privacy-and-claims-boundary\.md/, 'inside ZIP page lists claims boundary file');
assert.match(insideZip, /<h2>Fast review path<\/h2>/, 'inside ZIP page needs fast review path');
assert.match(insideZip, /href="\/preview\.html"/, 'inside ZIP page links preview');
assert.match(insideZip, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'inside ZIP page links sample CSV');
assert.match(insideZip, /href="\/pricing\.html"/, 'inside ZIP page links pricing');
assert.match(insideZip, /href="\/delivery\.html"/, 'inside ZIP page links delivery');
assert.match(insideZip, /href="\/support\.html"/, 'inside ZIP page links support page');
assert.match(insideZip, new RegExp(`href="${checkoutUrl}"`), 'inside ZIP page links tracked checkout');
assert.match(insideZip, /No guaranteed leads\./, 'inside ZIP page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(insideZip, pattern, `inside-the-zip.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(insideZip, pattern, `inside-the-zip.html contains private data pattern ${pattern}`);
}

const buyerGuide = read('buyer-guide.html');
assert.match(buyerGuide, /<title>Buyer Guide \| NYC Construction Activity ZIP<\/title>/, 'buyer guide needs title');
assert.match(buyerGuide, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buyer-guide\.html">/, 'buyer guide needs canonical');
assert.match(buyerGuide, /<meta property="og:title" content="Buyer Guide \| NYC Construction Activity ZIP">/, 'buyer guide needs OG title');
assert.match(buyerGuide, /src="\/assets\/current-issue-snapshot\.png"/, 'buyer guide needs current issue snapshot image');
assert.match(buyerGuide, /"@type":"Product"/, 'buyer guide needs Product structured data');
assert.match(buyerGuide, /"@type":"Offer"/, 'buyer guide needs Offer structured data');
assert.match(buyerGuide, /"price":"24.50"/, 'buyer guide needs current price structured data');
assert.match(buyerGuide, /"@type":"FAQPage"/, 'buyer guide needs FAQ structured data');
assert.match(buyerGuide, /\/_vercel\/insights\/script\.js/, 'buyer guide needs Web Analytics script');
assert.match(buyerGuide, /Free preview rows: 25\./, 'buyer guide needs free preview count');
assert.match(buyerGuide, /Paid ZIP rows: 142\./, 'buyer guide needs paid row count');
assert.match(buyerGuide, /Buyer workbook for a fast review pass/, 'buyer guide needs buyer workbook copy');
assert.match(buyerGuide, /Priority-slices CSV grouped by work type/, 'buyer guide needs priority-slices copy');
assert.match(buyerGuide, /href="\/preview\.html"/, 'buyer guide links public preview page');
assert.match(buyerGuide, /href="\/pricing\.html"/, 'buyer guide links pricing page');
assert.match(buyerGuide, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'buyer guide links sample CSV');
assert.match(buyerGuide, /href="\/sample-segments\.html"/, 'buyer guide links segment hub');
assert.match(buyerGuide, /href="\/inside-the-zip\.html"/, 'buyer guide links inside the ZIP page');
assert.match(buyerGuide, /href="\/delivery\.html"/, 'buyer guide links delivery page');
assert.match(buyerGuide, /href="\/support\.html"/, 'buyer guide links support page');
assert.match(buyerGuide, /href="\/methodology\.html"/, 'buyer guide links methodology');
assert.match(buyerGuide, new RegExp(`href="${checkoutUrl}"`), 'buyer guide links tracked checkout');
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
assert.match(delivery, /href="\/support\.html"/, 'delivery page links support page');
assert.match(delivery, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'delivery page links sample CSV');
assert.match(delivery, new RegExp(`href="${checkoutUrl}"`), 'delivery page links tracked checkout');
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
assert.match(support, /href="\/preview\.html"/, 'support page links preview');
assert.match(support, new RegExp(`href="${checkoutUrl}"`), 'support page links tracked checkout');
assert.match(support, /No guaranteed leads/, 'support page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(support, pattern, `support.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(support, pattern, `support.html contains private data pattern ${pattern}`);
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
assert.match(hub, /sample_request_saved/, 'hub tracks saved sample requests');
assert.match(hub, /\/checkout\.html\?source=sample-request-success/, 'hub links checkout after saved sample request');
assert.match(hub, /href="\/preview\.html"/, 'hub links public preview page');
assert.match(hub, /href="\/pricing\.html"/, 'hub links pricing page');
assert.match(hub, /href="\/inside-the-zip\.html"/, 'hub links inside the ZIP page');
assert.match(hub, /href="\/support\.html"/, 'hub links support page');
assert.match(hub, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'hub links sample CSV');
assert.match(hub, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'hub links sample brief');
assert.match(hub, new RegExp(`href="${checkoutUrl}"`), 'hub links tracked checkout');
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
assert.match(methodology, /href="\/inside-the-zip\.html"/, 'methodology links inside the ZIP page');
assert.match(methodology, /href="\/support\.html"/, 'methodology links support page');
assert.match(methodology, new RegExp(`href="${checkoutUrl}"`), 'methodology links tracked checkout');
assert.match(methodology, /"@type":"Dataset"/, 'methodology needs Dataset structured data');
assert.match(methodology, /"@type":"DataDownload"/, 'methodology needs DataDownload structured data');
assert.match(methodology, /"contentUrl":"https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample\/nyc-construction-activity-preview\.csv"/, 'methodology Dataset links CSV preview');
assert.match(methodology, new RegExp(`"temporalCoverage":"${sourceDateRange()}"`), 'methodology Dataset needs current temporal coverage');
assert.match(methodology, /"@type":"FAQPage"/, 'methodology needs FAQ structured data');

const sitemap = read('sitemap.xml');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
for (const page of ['', 'checkout.html', 'preview.html', 'pricing.html', 'inside-the-zip.html', 'buyer-guide.html', 'delivery.html', 'support.html', 'sample-segments.html', 'methodology.html', ...pages]) {
  const url = page ? `${baseUrl}/${page}` : `${baseUrl}/`;
  assert.match(sitemap, new RegExp(`<loc>${url}</loc>`), `sitemap includes ${url}`);
}
for (const page of ['feed.xml', 'current-issue.json', 'llms.txt']) {
  assert.match(sitemap, new RegExp(`<loc>${baseUrl}/${page}</loc>`), `sitemap includes ${page}`);
}
const sitemapUrlCount = (sitemap.match(/<loc>/g) || []).length;
assert.equal(sitemapUrlCount, pages.length + 13, 'sitemap URL count must match generated surface and discovery files');
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
assert.equal(currentIssue.publicPreview.previewUrl, 'https://nyc-construction-activity-brief.vercel.app/preview.html', 'current issue JSON links public preview page');
assert.equal(currentIssue.publicPreview.pricingUrl, 'https://nyc-construction-activity-brief.vercel.app/pricing.html', 'current issue JSON public preview links pricing page');
assert.equal(currentIssue.publicPreview.insideZipUrl, 'https://nyc-construction-activity-brief.vercel.app/inside-the-zip.html', 'current issue JSON public preview links inside ZIP page');
assert.equal(currentIssue.publicPreview.checkoutUrl, 'https://nyc-construction-activity-brief.vercel.app/checkout.html?source=current-issue', 'current issue JSON links tracked checkout');
assert.equal(currentIssue.publicPreview.stripeCheckoutUrl, 'https://buy.stripe.com/7sY7sLaHv9TI2Yn5f9cAo0P', 'current issue JSON keeps Stripe checkout URL');
assert.equal(currentIssue.publicPreview.buyerGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/buyer-guide.html', 'current issue JSON public preview links buyer guide');
assert.equal(currentIssue.publicPreview.deliveryUrl, 'https://nyc-construction-activity-brief.vercel.app/delivery.html', 'current issue JSON public preview links delivery page');
assert.equal(currentIssue.publicPreview.supportUrl, 'https://nyc-construction-activity-brief.vercel.app/support.html', 'current issue JSON public preview links support page');
assert.equal(currentIssue.publicPreview.imageUrl, 'https://nyc-construction-activity-brief.vercel.app/assets/current-issue-snapshot.png', 'current issue JSON public preview links social image');
assert.equal(currentIssue.paidZip.buyerGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/buyer-guide.html', 'current issue JSON paid ZIP links buyer guide');
assert.equal(currentIssue.paidZip.deliveryUrl, 'https://nyc-construction-activity-brief.vercel.app/delivery.html', 'current issue JSON paid ZIP links delivery page');
assert.equal(currentIssue.paidZip.supportUrl, 'https://nyc-construction-activity-brief.vercel.app/support.html', 'current issue JSON paid ZIP links support page');
assert.equal(currentIssue.paidZip.imageUrl, 'https://nyc-construction-activity-brief.vercel.app/assets/current-issue-snapshot.png', 'current issue JSON paid ZIP links social image');
assert.equal(currentIssue.paidZip.checkoutUrl, 'https://nyc-construction-activity-brief.vercel.app/checkout.html?source=current-issue', 'current issue JSON paid ZIP links tracked checkout');
assert.equal(currentIssue.paidZip.stripeCheckoutUrl, 'https://buy.stripe.com/7sY7sLaHv9TI2Yn5f9cAo0P', 'current issue JSON paid ZIP keeps Stripe checkout URL');
assert.equal(currentIssue.paidZip.pricingUrl, 'https://nyc-construction-activity-brief.vercel.app/pricing.html', 'current issue JSON paid ZIP links pricing page');
assert.equal(currentIssue.paidZip.insideZipUrl, 'https://nyc-construction-activity-brief.vercel.app/inside-the-zip.html', 'current issue JSON paid ZIP links inside ZIP page');
assert.equal(currentIssue.paidZip.files.length, 11, 'current issue JSON lists all package files');
assert.equal(currentIssue.paidZip.rowCount, manifest.sourceRows, 'current issue JSON paid ZIP row count matches manifest');
assert.equal(currentIssue.paidZip.launchPricing.priceUsd, 24.5, 'current issue JSON lists launch price');
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
assert.match(feed, /The free CSV preview has 25 rows/, 'RSS feed describes free preview size');
assert.match(feed, /Launch price is \$24\.50/, 'RSS feed describes launch price');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/preview\.html/, 'RSS feed links public preview page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/pricing\.html/, 'RSS feed links pricing page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/inside-the-zip\.html/, 'RSS feed links inside the ZIP page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample-segments\.html/, 'RSS feed links segment hub');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/buyer-guide\.html/, 'RSS feed links buyer guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/delivery\.html/, 'RSS feed links delivery page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/support\.html/, 'RSS feed links support page');

const llms = read('llms.txt');
assert.match(llms, /# NYC Weekly Construction Activity Brief/, 'llms.txt names product');
assert.match(llms, /Free CSV preview rows: 25/, 'llms.txt has free preview row count');
assert.match(llms, /Public preview: https:\/\/nyc-construction-activity-brief\.vercel\.app\/preview\.html/, 'llms.txt links public preview page');
assert.match(llms, /Pricing: https:\/\/nyc-construction-activity-brief\.vercel\.app\/pricing\.html/, 'llms.txt links pricing page');
assert.match(llms, /Inside the ZIP: https:\/\/nyc-construction-activity-brief\.vercel\.app\/inside-the-zip\.html/, 'llms.txt links inside the ZIP page');
assert.match(llms, /Paid ZIP rows: 142/, 'llms.txt has paid ZIP row count');
assert.match(llms, /Promo code required: no/, 'llms.txt states promo code is not required');
assert.match(llms, /Stripe Payment Link: https:\/\/buy\.stripe\.com\/7sY7sLaHv9TI2Yn5f9cAo0P/, 'llms.txt keeps Stripe checkout URL');
assert.match(llms, /Social image: https:\/\/nyc-construction-activity-brief\.vercel\.app\/assets\/current-issue-snapshot\.png/, 'llms.txt links social image');
assert.match(llms, /Buyer guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/buyer-guide\.html/, 'llms.txt links buyer guide');
assert.match(llms, /Delivery steps: https:\/\/nyc-construction-activity-brief\.vercel\.app\/delivery\.html/, 'llms.txt links delivery page');
assert.match(llms, /Support and refunds: https:\/\/nyc-construction-activity-brief\.vercel\.app\/support\.html/, 'llms.txt links support page');
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
