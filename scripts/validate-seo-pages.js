const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const pageData = require('./seo-pages.json');
const pages = pageData.map((page) => `topics/${page.slug}.html`);
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

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
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
  assert.match(html, /"price":"49.00"/, `${relativePath} needs current price structured data`);
  assert.match(html, /"@type":"BreadcrumbList"/, `${relativePath} needs breadcrumb structured data`);
  assert.match(html, /<h1>[^<]+<\/h1>/, `${relativePath} needs one visible h1`);
  assert.match(html, /href="\/sample\/nyc-construction-activity-preview\.csv"/, `${relativePath} links sample CSV`);
  assert.match(html, /href="\/sample\/nyc-weekly-construction-activity-sample\.md"/, `${relativePath} links sample brief`);
  assert.match(html, /href="https:\/\/buy\.stripe\.com\/dRmdR9aHv3vk6az8rlcAo0N"/, `${relativePath} links checkout`);
  assert.match(html, /No guaranteed leads\./, `${relativePath} keeps claims boundary visible`);
  for (const pattern of bannedCopyPatterns) {
    assert.doesNotMatch(html, pattern, `${relativePath} contains banned copy pattern ${pattern}`);
  }
}

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
assert.doesNotMatch(index, /Delivered by email after purchase/i, 'index must not promise email delivery');
assert.match(index, /Download after completed Stripe checkout/, 'index needs current automated delivery copy');
for (const page of pages) {
  assert.match(index, new RegExp(`href="/${page}"`), `index links ${page}`);
}

const sitemap = read('sitemap.xml');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
for (const page of ['', ...pages]) {
  const url = page ? `${baseUrl}/${page}` : `${baseUrl}/`;
  assert.match(sitemap, new RegExp(`<loc>${url}</loc>`), `sitemap includes ${url}`);
}

const robots = read('robots.txt');
assert.match(robots, /User-agent: \*/);
assert.match(robots, new RegExp(`Sitemap: ${baseUrl}/sitemap.xml`));

console.log('seo page validation passed');
