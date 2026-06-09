const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const host = 'nyc-construction-activity-brief.vercel.app';
const key = '320c87511764a53abe2cd8aa0481f1bc';
const keyFile = `${key}.txt`;
const keyLocation = `https://${host}/${keyFile}`;
const endpoint = 'https://api.indexnow.org/IndexNow';

function urlsFromSitemap() {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => url.startsWith(`https://${host}/`));
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const request = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseBody = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            body: responseBody,
          });
        });
      },
    );
    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

async function main() {
  const urlList = urlsFromSitemap();
  if (!urlList.length) {
    throw new Error('No matching canonical URLs found in sitemap.xml');
  }
  if (!fs.existsSync(path.join(root, keyFile))) {
    throw new Error(`Missing IndexNow key file: ${keyFile}`);
  }

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  if (!process.argv.includes('--submit')) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      endpoint,
      host,
      keyLocation,
      urlCount: urlList.length,
      sampleUrls: urlList.slice(0, 5),
    }, null, 2));
    return;
  }

  const response = await postJson(endpoint, payload);
  console.log(JSON.stringify({
    mode: 'submitted',
    endpoint,
    host,
    keyLocation,
    urlCount: urlList.length,
    statusCode: response.statusCode,
    responseBody: response.body,
  }, null, 2));

  if (![200, 202].includes(response.statusCode)) {
    throw new Error(`IndexNow submission failed with HTTP ${response.statusCode}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
