const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://nyc-construction-activity-brief.vercel.app';
const checkoutUrl = 'https://buy.stripe.com/dRmdR9aHv3vk6az8rlcAo0N';
const pages = require('./seo-pages.json');

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

function productJsonLd(description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'NYC Weekly Construction Activity Brief - First Issue',
    description,
    category: 'Digital construction permit activity brief',
    brand: {
      '@type': 'Brand',
      name: 'NYC Weekly Construction Activity Brief',
    },
    offers: {
      '@type': 'Offer',
      url: checkoutUrl,
      priceCurrency: 'USD',
      price: '49.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
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

function pageHtml(page) {
  const url = `${baseUrl}/topics/${page.slug}.html`;
  const escapedTitle = escapeHtml(page.title);
  const escapedDescription = escapeHtml(page.description);
  const product = productJsonLd(page.description);
  const breadcrumb = breadcrumbJsonLd(page);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapedTitle}">
    <meta property="og:description" content="${escapedDescription}">
    <meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary">
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">${jsonScript(product)}</script>
    <script type="application/ld+json">${jsonScript(breadcrumb)}</script>
  </head>
  <body>
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
          <h2>What you get</h2>
          <p>Work type, ZIP, borough, issued date, status, cost bucket, source link, permit ID, filing number, and short description.</p>
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
        <a class="button" href="${checkoutUrl}">Buy first issue package</a>
      </section>

      <section class="section card">
        <h2>Boundary</h2>
        <p>No guaranteed leads. No owner names, applicant names, phone numbers, email addresses, or full street addresses are included. Source records can be incomplete, delayed, revised, duplicated, or mislabeled.</p>
      </section>
    </main>
  </body>
</html>
`;
}

function sitemapXml() {
  const urls = ['', ...pages.map((page) => `topics/${page.slug}.html`)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${baseUrl}/${url}</loc>
  </url>`).join('\n')}
</urlset>
`;
}

fs.mkdirSync(path.join(root, 'topics'), { recursive: true });
for (const page of pages) {
  fs.writeFileSync(path.join(root, 'topics', `${page.slug}.html`), pageHtml(page));
}
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemapXml());

console.log(`generated ${pages.length} SEO pages`);
