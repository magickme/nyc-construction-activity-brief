const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
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
  const lines = read(manifest.source).trim().split(/\r?\n/);
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
  assert.match(html, /<meta property="og:title" content="[^"]+">/, `${relativePath} needs OG title`);
  assert.match(html, /<meta property="og:description" content="[^"]+">/, `${relativePath} needs OG description`);
  assert.match(html, /<meta name="twitter:card" content="summary">/, `${relativePath} needs Twitter card`);
  assert.match(html, /"@type":"Product"/, `${relativePath} needs Product structured data`);
  assert.match(html, /"@type":"Offer"/, `${relativePath} needs Offer structured data`);
  assert.match(html, /"price":"19.00"/, `${relativePath} needs current price structured data`);
  assert.match(html, /"@type":"BreadcrumbList"/, `${relativePath} needs breadcrumb structured data`);
  assert.match(html, /\/_vercel\/insights\/script\.js/, `${relativePath} needs Web Analytics script`);
  assert.match(html, /<h1>[^<]+<\/h1>/, `${relativePath} needs one visible h1`);
  assert.match(html, /href="\/sample\/nyc-construction-activity-preview\.csv"/, `${relativePath} links sample CSV`);
  assert.match(html, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, `${relativePath} links sample brief`);
  assert.match(html, /href="https:\/\/buy\.stripe\.com\/5kQfZhaHvd5UeH58rlcAo0O"/, `${relativePath} links checkout`);
  assert.match(html, /data-sample-request-form/, `${relativePath} needs sample request form`);
  assert.match(html, /\/api\/sample-request/, `${relativePath} posts sample requests to API`);
  assert.match(html, /This does not join the MagickMe newsletter\./, `${relativePath} needs list-separation copy`);
  assert.match(html, /No guaranteed leads\./, `${relativePath} keeps claims boundary visible`);
  if (generatedPages.includes(relativePath)) {
    assert.match(html, /<h2>Sample counts<\/h2>/, `${relativePath} needs sample counts`);
    assert.match(html, /<h2>Example rows from the public preview<\/h2>/, `${relativePath} needs example rows`);
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

assert.equal(manifest.sourceRows, 192, 'manifest source row count changed unexpectedly');
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
assert.match(index, /<meta property="og:title" content="[^"]+">/, 'index needs OG title');
assert.match(index, /<script type="application\/ld\+json">[^<]+"@type":"Product"/, 'index needs Product structured data');
assert.match(index, /\/_vercel\/insights\/script\.js/, 'index needs Web Analytics script');
assert.doesNotMatch(index, /Delivered by email after purchase/i, 'index must not promise email delivery');
assert.match(index, /Instant download after completed Stripe checkout/, 'index needs current automated delivery copy');
assert.match(index, /Buy instant ZIP/, 'index needs a clear instant ZIP checkout CTA');
assert.match(index, /What is in the paid ZIP/, 'index needs paid package contents');
assert.match(index, /data-sample-request-form/, 'index needs sample request form');
assert.match(index, /\/api\/sample-request/, 'index posts sample requests to API');
assert.match(index, /This does not join the MagickMe newsletter\./, 'index needs list-separation copy');
for (const page of pages) {
  assert.match(index, new RegExp(`href="/${page}"`), `index links ${page}`);
}
assert.match(index, /href="\/sample-segments\.html"/, 'index links segment hub');

const hub = read('sample-segments.html');
assert.match(hub, /<title>NYC Permit Activity Segments \| ZIP and Work Type Pages<\/title>/, 'hub needs title');
assert.match(hub, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample-segments\.html">/, 'hub needs canonical');
assert.match(hub, /\/_vercel\/insights\/script\.js/, 'hub needs Web Analytics script');
assert.match(hub, /data-sample-request-form/, 'hub needs sample request form');
assert.match(hub, /\/api\/sample-request/, 'hub posts sample requests to API');
assert.match(hub, /href="\/sample\/nyc-construction-activity-preview\.csv"/, 'hub links sample CSV');
assert.match(hub, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, 'hub links sample brief');
assert.match(hub, /href="https:\/\/buy\.stripe\.com\/5kQfZhaHvd5UeH58rlcAo0O"/, 'hub links checkout');
for (const page of generatedPages) {
  assert.match(hub, new RegExp(`href="/${page}"`), `hub links ${page}`);
}

const methodology = read('methodology.html');
assert.match(methodology, /<title>Methodology \| NYC Construction Activity Brief<\/title>/, 'methodology needs title');
assert.match(methodology, /<link rel="canonical" href="https:\/\/nyc-construction-activity-brief\.vercel\.app\/methodology\.html">/, 'methodology needs canonical');
assert.match(methodology, /NYC DOB NOW: Build - Approved Permits/, 'methodology names source dataset');
assert.match(methodology, /Latest issued row in the file:/, 'methodology needs source freshness note');
assert.match(methodology, /The public package excludes owner names/, 'methodology needs privacy boundary');
assert.match(methodology, /Not a live alert feed\./, 'methodology needs product boundary');
assert.match(methodology, /No guaranteed leads\./, 'methodology keeps claims boundary visible');
assert.match(methodology, /href="https:\/\/buy\.stripe\.com\/5kQfZhaHvd5UeH58rlcAo0O"/, 'methodology links checkout');
assert.match(methodology, /"@type":"Dataset"/, 'methodology needs Dataset structured data');
assert.match(methodology, /"@type":"DataDownload"/, 'methodology needs DataDownload structured data');
assert.match(methodology, /"contentUrl":"https:\/\/nyc-construction-activity-brief\.vercel\.app\/sample\/nyc-construction-activity-preview\.csv"/, 'methodology Dataset links CSV preview');
assert.match(methodology, new RegExp(`"temporalCoverage":"${sourceDateRange()}"`), 'methodology Dataset needs current temporal coverage');
assert.match(methodology, /"@type":"FAQPage"/, 'methodology needs FAQ structured data');

const sitemap = read('sitemap.xml');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
for (const page of ['', 'sample-segments.html', 'methodology.html', ...pages]) {
  const url = page ? `${baseUrl}/${page}` : `${baseUrl}/`;
  assert.match(sitemap, new RegExp(`<loc>${url}</loc>`), `sitemap includes ${url}`);
}
const sitemapUrlCount = (sitemap.match(/<loc>/g) || []).length;
assert.equal(sitemapUrlCount, pages.length + 3, 'sitemap URL count must match generated surface');
const sitemapLastmodCount = (sitemap.match(new RegExp(`<lastmod>${manifest.sourceFetchDate}</lastmod>`, 'g')) || []).length;
assert.equal(sitemapLastmodCount, sitemapUrlCount, 'sitemap needs accurate lastmod for every URL');

const robots = read('robots.txt');
assert.match(robots, /User-agent: \*/);
assert.match(robots, new RegExp(`Sitemap: ${baseUrl}/sitemap.xml`));

const indexNowKey = read('320c87511764a53abe2cd8aa0481f1bc.txt').trim();
assert.equal(indexNowKey, '320c87511764a53abe2cd8aa0481f1bc', 'IndexNow key file must match submission script');

console.log('seo page validation passed');
