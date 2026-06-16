const fs = require('node:fs');
const path = require('node:path');
const { DEFAULT_SITE_BASE_URL, siteBaseUrl } = require('../site-config');

const root = path.resolve(__dirname, '..');
const targetBaseUrl = siteBaseUrl();
const sourceBaseUrls = new Set([
  DEFAULT_SITE_BASE_URL,
  ...(process.env.SITE_BASE_URL_ALIASES || '')
    .split(',')
    .map((value) => value.trim().replace(/\/+$/, ''))
    .filter(Boolean),
]);

const extensions = new Set(['.html', '.json', '.jsonl', '.md', '.txt', '.xml']);
const skipDirs = new Set(['.git', '.vercel', 'node_modules']);

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

let changedFiles = 0;
let replacements = 0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  for (const sourceBaseUrl of sourceBaseUrls) {
    if (sourceBaseUrl === targetBaseUrl) continue;
    const next = text.split(sourceBaseUrl).join(targetBaseUrl);
    if (next !== text) {
      replacements += text.split(sourceBaseUrl).length - 1;
      text = next;
    }
  }
  if (text !== original) {
    fs.writeFileSync(file, text);
    changedFiles += 1;
  }
}

console.log(`rewrote site base URL to ${targetBaseUrl} in ${changedFiles} files (${replacements} replacements)`);
