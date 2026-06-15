const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const checkoutUrl = 'https://nyc-construction-activity-brief.vercel.app/checkout.html\\?source=[a-z0-9._-]+';
const relativeCheckoutUrl = '/checkout.html\\?source=[a-z0-9._-]+';
const stripeCheckoutUrl = 'https://buy.stripe.com/dRmdR9aHv3vk6az8rlcAo0N\\?prefilled_promo_code=NYC50';
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
  assert.match(html, /<meta name="twitter:card" content="summary">/, `${relativePath} needs Twitter card`);
  assert.match(html, /"@type":"Product"/, `${relativePath} needs Product structured data`);
  assert.match(html, /"@type":"Offer"/, `${relativePath} needs Offer structured data`);
  assert.match(html, /"price":"49.00"/, `${relativePath} needs current price structured data`);
  assert.match(html, /"@type":"BreadcrumbList"/, `${relativePath} needs breadcrumb structured data`);
  assert.match(html, /\/_vercel\/insights\/script\.js/, `${relativePath} needs Web Analytics script`);
  assert.match(html, /<h1>[^<]+<\/h1>/, `${relativePath} needs one visible h1`);
  assert.match(html, /href="\/sample\/nyc-construction-activity-preview\.csv"/, `${relativePath} links sample CSV`);
  assert.match(html, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, `${relativePath} links sample brief`);
  assert.match(html, new RegExp(`href="${checkoutUrl}"`), `${relativePath} links tracked checkout`);
  assert.match(html, /data-sample-request-form/, `${relativePath} needs sample request form`);
  assert.match(html, /\/api\/sample-request/, `${relativePath} posts sample requests to API`);
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
assert.match(index, /<script type="application\/ld\+json">[^<]+"@type":"Product"/, 'index needs Product structured data');
assert.match(index, /\/_vercel\/insights\/script\.js/, 'index needs Web Analytics script');
assert.doesNotMatch(index, /Delivered by email after purchase/i, 'index must not promise email delivery');
assert.match(index, /Instant download after completed Stripe checkout/, 'index needs current automated delivery copy');
assert.match(index, /Buy instant ZIP/, 'index needs a clear instant ZIP checkout CTA');
assert.match(index, new RegExp(`href="${relativeCheckoutUrl}"`), 'index links tracked checkout');
assert.match(index, /Use code <strong>NYC50<\/strong> in Stripe checkout for 50% off/, 'index needs launch discount copy');
assert.match(index, /What is in the paid ZIP/, 'index needs paid package contents');
assert.match(index, /Free preview rows: 25\. Paid ZIP rows: 142/, 'index needs free versus paid row counts');
assert.match(index, /Buyer workbook with a fast review path/, 'index needs buyer workbook offer copy');
assert.match(index, /Priority-slices CSV grouped by work type/, 'index needs priority-slices offer copy');
assert.match(index, /data-sample-request-form/, 'index needs sample request form');
assert.match(index, /\/api\/sample-request/, 'index posts sample requests to API');
assert.match(index, /This does not join the MagickMe newsletter\./, 'index needs list-separation copy');
assert.match(index, /href="\/preview\.html"/, 'index links public preview page');
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
assert.match(checkout, new RegExp(stripeCheckoutUrl), 'checkout page redirects to promo-prefilled Stripe checkout');
assert.match(checkout, /Continue to Stripe/, 'checkout page has fallback link');
assert.match(checkout, /\/_vercel\/insights\/script\.js/, 'checkout page needs Web Analytics script');

const preview = read('preview.html');
assert.match(preview, /<title>Public Preview \| NYC Construction Activity Brief<\/title>/, 'preview page needs title');
assert.match(preview, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/preview\.html">/, 'preview page needs canonical');
assert.match(preview, /<meta property="og:title" content="Public Preview \| NYC Construction Activity Brief">/, 'preview page needs OG title');
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
assert.match(preview, new RegExp(`href="${checkoutUrl}"`), 'preview page links tracked checkout');
assert.match(preview, /data-sample-request-form/, 'preview page needs sample request form');
assert.match(preview, /\/api\/sample-request/, 'preview page posts sample requests to API');
assert.match(preview, /No guaranteed leads\./, 'preview page keeps claims boundary visible');
for (const pattern of bannedCopyPatterns) {
  assert.doesNotMatch(preview, pattern, `preview.html contains banned copy pattern ${pattern}`);
}
for (const pattern of privateDataPatterns) {
  assert.doesNotMatch(preview, pattern, `preview.html contains private data pattern ${pattern}`);
}

const buyerGuide = read('buyer-guide.html');
assert.match(buyerGuide, /<title>Buyer Guide \| NYC Construction Activity ZIP<\/title>/, 'buyer guide needs title');
assert.match(buyerGuide, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/buyer-guide\.html">/, 'buyer guide needs canonical');
assert.match(buyerGuide, /<meta property="og:title" content="Buyer Guide \| NYC Construction Activity ZIP">/, 'buyer guide needs OG title');
assert.match(buyerGuide, /"@type":"Product"/, 'buyer guide needs Product structured data');
assert.match(buyerGuide, /"@type":"Offer"/, 'buyer guide needs Offer structured data');
assert.match(buyerGuide, /"price":"49.00"/, 'buyer guide needs current price structured data');
assert.match(buyerGuide, /"@type":"FAQPage"/, 'buyer guide needs FAQ structured data');
assert.match(buyerGuide, /\/_vercel\/insights\/script\.js/, 'buyer guide needs Web Analytics script');
assert.match(buyerGuide, /Free preview rows: 25\./, 'buyer guide needs free preview count');
assert.match(buyerGuide, /Paid ZIP rows: 142\./, 'buyer guide needs paid row count');
assert.match(buyerGuide, /Buyer workbook for a fast review pass/, 'buyer guide needs buyer workbook copy');
assert.match(buyerGuide, /Priority-slices CSV grouped by work type/, 'buyer guide needs priority-slices copy');
assert.match(buyerGuide, /href="\/preview\.html"/, 'buyer guide links public preview page');
assert.match(buyerGuide, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'buyer guide links sample CSV');
assert.match(buyerGuide, /href="\/sample-segments\.html"/, 'buyer guide links segment hub');
assert.match(buyerGuide, /href="\/delivery\.html"/, 'buyer guide links delivery page');
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
assert.match(delivery, /href="\/buyer-guide\.html"/, 'delivery page links buyer guide');
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

const hub = read('sample-segments.html');
assert.match(hub, /<title>NYC Permit Activity Segments \| ZIP and Work Type Pages<\/title>/, 'hub needs title');
assert.match(hub, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample-segments\.html">/, 'hub needs canonical');
assert.match(hub, /<link rel="alternate" type="application\/rss\+xml"[^>]+href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/feed\.xml">/, 'hub links RSS feed');
assert.match(hub, /<link rel="alternate" type="application\/json"[^>]+href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/current-issue\.json">/, 'hub links current issue JSON');
assert.match(hub, /\/_vercel\/insights\/script\.js/, 'hub needs Web Analytics script');
assert.match(hub, /data-sample-request-form/, 'hub needs sample request form');
assert.match(hub, /\/api\/sample-request/, 'hub posts sample requests to API');
assert.match(hub, /href="\/preview\.html"/, 'hub links public preview page');
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
assert.match(methodology, new RegExp(`href="${checkoutUrl}"`), 'methodology links tracked checkout');
assert.match(methodology, /"@type":"Dataset"/, 'methodology needs Dataset structured data');
assert.match(methodology, /"@type":"DataDownload"/, 'methodology needs DataDownload structured data');
assert.match(methodology, /"contentUrl":"https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample\/nyc-construction-activity-preview\.csv"/, 'methodology Dataset links CSV preview');
assert.match(methodology, new RegExp(`"temporalCoverage":"${sourceDateRange()}"`), 'methodology Dataset needs current temporal coverage');
assert.match(methodology, /"@type":"FAQPage"/, 'methodology needs FAQ structured data');

const sitemap = read('sitemap.xml');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
for (const page of ['', 'checkout.html', 'preview.html', 'buyer-guide.html', 'delivery.html', 'sample-segments.html', 'methodology.html', ...pages]) {
  const url = page ? `${baseUrl}/${page}` : `${baseUrl}/`;
  assert.match(sitemap, new RegExp(`<loc>${url}</loc>`), `sitemap includes ${url}`);
}
for (const page of ['feed.xml', 'current-issue.json', 'llms.txt']) {
  assert.match(sitemap, new RegExp(`<loc>${baseUrl}/${page}</loc>`), `sitemap includes ${page}`);
}
const sitemapUrlCount = (sitemap.match(/<loc>/g) || []).length;
assert.equal(sitemapUrlCount, pages.length + 10, 'sitemap URL count must match generated surface and discovery files');
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
assert.equal(currentIssue.publicPreview.checkoutUrl, 'https://nyc-construction-activity-brief.vercel.app/checkout.html?source=current-issue', 'current issue JSON links tracked checkout');
assert.equal(currentIssue.publicPreview.stripeCheckoutUrl, 'https://buy.stripe.com/dRmdR9aHv3vk6az8rlcAo0N?prefilled_promo_code=NYC50', 'current issue JSON keeps Stripe checkout URL');
assert.equal(currentIssue.publicPreview.buyerGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/buyer-guide.html', 'current issue JSON public preview links buyer guide');
assert.equal(currentIssue.publicPreview.deliveryUrl, 'https://nyc-construction-activity-brief.vercel.app/delivery.html', 'current issue JSON public preview links delivery page');
assert.equal(currentIssue.paidZip.buyerGuideUrl, 'https://nyc-construction-activity-brief.vercel.app/buyer-guide.html', 'current issue JSON paid ZIP links buyer guide');
assert.equal(currentIssue.paidZip.deliveryUrl, 'https://nyc-construction-activity-brief.vercel.app/delivery.html', 'current issue JSON paid ZIP links delivery page');
assert.equal(currentIssue.paidZip.checkoutUrl, 'https://nyc-construction-activity-brief.vercel.app/checkout.html?source=current-issue', 'current issue JSON paid ZIP links tracked checkout');
assert.equal(currentIssue.paidZip.stripeCheckoutUrl, 'https://buy.stripe.com/dRmdR9aHv3vk6az8rlcAo0N?prefilled_promo_code=NYC50', 'current issue JSON paid ZIP keeps Stripe checkout URL');
assert.equal(currentIssue.paidZip.files.length, 11, 'current issue JSON lists all package files');
assert.equal(currentIssue.paidZip.rowCount, manifest.sourceRows, 'current issue JSON paid ZIP row count matches manifest');
assert.equal(currentIssue.paidZip.promotion.code, 'NYC50', 'current issue JSON lists promo code');
assert.equal(currentIssue.paidZip.promotion.percentOff, 50, 'current issue JSON lists promo percent');
assert.equal(currentIssue.paidZip.promotion.maxRedemptions, 10, 'current issue JSON lists promo max redemptions');
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
assert.match(feed, /Use code NYC50 for 50% off/, 'RSS feed describes promo code');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/preview\.html/, 'RSS feed links public preview page');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample-segments\.html/, 'RSS feed links segment hub');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/buyer-guide\.html/, 'RSS feed links buyer guide');
assert.match(feed, /https:\/\/nyc-construction-activity-brief\.vercel\.app\/delivery\.html/, 'RSS feed links delivery page');

const llms = read('llms.txt');
assert.match(llms, /# NYC Weekly Construction Activity Brief/, 'llms.txt names product');
assert.match(llms, /Free CSV preview rows: 25/, 'llms.txt has free preview row count');
assert.match(llms, /Public preview: https:\/\/nyc-construction-activity-brief\.vercel\.app\/preview\.html/, 'llms.txt links public preview page');
assert.match(llms, /Paid ZIP rows: 142/, 'llms.txt has paid ZIP row count');
assert.match(llms, /Promo code: NYC50 for 50% off/, 'llms.txt lists promo code');
assert.match(llms, /Stripe Payment Link: https:\/\/buy\.stripe\.com\/dRmdR9aHv3vk6az8rlcAo0N\?prefilled_promo_code=NYC50/, 'llms.txt keeps Stripe checkout URL');
assert.match(llms, /Buyer guide: https:\/\/nyc-construction-activity-brief\.vercel\.app\/buyer-guide\.html/, 'llms.txt links buyer guide');
assert.match(llms, /Delivery steps: https:\/\/nyc-construction-activity-brief\.vercel\.app\/delivery\.html/, 'llms.txt links delivery page');
assert.match(llms, /Buyer-only files: buyer-workbook\.md, buyer-priority-slices\.csv/, 'llms.txt lists buyer-only files');
assert.match(llms, /No guaranteed leads\./, 'llms.txt keeps claims boundary');

const publicCsv = read('sample/nyc-construction-activity-preview.csv').trim().split(/\r?\n/);
assert.equal(publicCsv.length - 1, 25, 'public CSV preview must stay limited to 25 rows');

const indexNowKey = read('320c87511764a53abe2cd8aa0481f1bc.txt').trim();
assert.equal(indexNowKey, '320c87511764a53abe2cd8aa0481f1bc', 'IndexNow key file must match submission script');

console.log('seo page validation passed');
