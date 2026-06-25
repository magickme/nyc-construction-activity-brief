const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const fullIssueCsvPath = path.join(root, '..', 'package', 'nyc-construction-activity-preview.csv');
const publicPreviewCsvPath = path.join(root, 'sample', 'nyc-construction-activity-preview.csv');
const sourceCsvPath = fs.existsSync(fullIssueCsvPath) ? fullIssueCsvPath : publicPreviewCsvPath;
const outputDir = path.join(root, 'assets');
const outputPng = path.join(outputDir, 'current-issue-snapshot.png');
const socialSharePng = path.join(outputDir, 'social-share-card.png');
const convertBin = process.env.IMAGEMAGICK_CONVERT_BIN || '/opt/homebrew/bin/convert';
const fontRegular = process.env.SOCIAL_IMAGE_FONT_REGULAR || '/System/Library/Fonts/Supplemental/Arial.ttf';
const fontBold = process.env.SOCIAL_IMAGE_FONT_BOLD || '/System/Library/Fonts/Supplemental/Arial Bold.ttf';

function escapeDrawText(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'");
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
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

function dateRange(rows) {
  const dates = rows.map((row) => String(row.issued_date || '').slice(0, 10)).filter(Boolean).sort();
  return {
    first: dates[0] || '',
    latest: dates[dates.length - 1] || '',
    fetchDate: rows[0] && rows[0].source_fetch_date,
  };
}

function addText(args, { x, y, text, size, color = '#17211b', font = fontRegular }) {
  args.push('-font', font, '-fill', color, '-pointsize', String(size), '-draw', `text ${x},${y} '${escapeDrawText(text)}'`);
}

function addBarRows(args, counts, maxCount) {
  const colors = ['#214d35', '#b7791f', '#7b5b2a', '#536056', '#8a6f3e'];
  const labelX = 84;
  const barX = 392;
  const maxBarWidth = 570;
  for (const [index, [label, count]] of counts.slice(0, 5).entries()) {
    const y = 276 + index * 52;
    const width = Math.round((count / maxCount) * maxBarWidth);
    addText(args, { x: labelX, y: y + 25, text: label, size: 22, font: fontBold });
    args.push('-fill', colors[index], '-draw', `roundrectangle ${barX},${y + 6} ${barX + width},${y + 28} 8,8`);
    addText(args, { x: barX + width + 14, y: y + 25, text: String(count), size: 22, font: fontBold });
  }
}

function buildShareCard(rows, range, workTypeCounts) {
  const heroPhotoCandidates = [
    path.join(outputDir, 'site-team-reviewing-plans.jpg'),
    path.join(outputDir, 'nyc-construction-worker-hero.jpg'),
  ];
  const heroPhoto = heroPhotoCandidates.find((candidate) => fs.existsSync(candidate));
  if (!heroPhoto) {
    throw new Error('Social share card generation failed: missing hero photo asset');
  }
  const args = [
    '-size', '1200x630',
    'xc:#0f2018',
    '(',
    heroPhoto,
    '-resize', '650x630^',
    '-gravity', 'center',
    '-extent', '650x630',
    ')',
    '-geometry', '+550+0',
    '-composite',
    '+repage',
    '-gravity', 'northwest',
    '-fill', 'rgba(15,32,24,0.30)',
    '-draw', 'rectangle 550,0 1200,630',
    '-fill', '#f7f2e8',
    '-draw', 'roundrectangle 52,52 610,578 24,24',
    '-fill', '#214d35',
    '-draw', 'roundrectangle 84,82 238,116 10,10',
  ];

  addText(args, { x: 101, y: 106, text: 'CURRENT ISSUE', size: 17, color: '#fffaf1', font: fontBold });
  addText(args, { x: 84, y: 184, text: 'NYC Construction', size: 54, font: fontBold });
  addText(args, { x: 84, y: 244, text: 'Activity Brief', size: 54, font: fontBold });
  addText(args, {
    x: 84,
    y: 302,
    text: `${rows.length} source-linked DOB rows`,
    size: 30,
    color: '#214d35',
    font: fontBold,
  });
  addText(args, { x: 84, y: 350, text: 'CSV, workbook, source notes, and priority slices', size: 24, color: '#536056' });
  addText(args, { x: 84, y: 398, text: `${range.first} to ${range.fetchDate || range.latest}`, size: 24, color: '#536056' });
  addText(args, { x: 84, y: 490, text: '$9.50', size: 58, color: '#214d35', font: fontBold });
  addText(args, { x: 268, y: 490, text: 'instant ZIP download', size: 30, color: '#17211b', font: fontBold });
  addText(args, { x: 84, y: 548, text: 'nycpermitbrief.com', size: 26, color: '#536056', font: fontBold });
  args.push('-strip', '-depth', '8');
  args.push(socialSharePng);

  try {
    execFileSync(convertBin, args, { stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Social share card generation failed: ${error.message}`);
  }
}

fs.mkdirSync(outputDir, { recursive: true });
const rows = parseCsv(fs.readFileSync(sourceCsvPath, 'utf8'));
const range = dateRange(rows);
const workTypeCounts = countBy(rows, (row) => row.work_type);
const zipCounts = countBy(rows, (row) => row.zip_code).slice(0, 5).map(([zip, count]) => `${zip} ${count}`).join(' | ');
const maxCount = Math.max(...workTypeCounts.map(([, count]) => count), 1);

const args = [
  '-size', '1200x630',
  'xc:#f6f1e8',
  '-fill', '#fffaf1',
  '-stroke', '#d7cbb7',
  '-strokewidth', '2',
  '-draw', 'roundrectangle 42,42 1158,588 28,28',
  '-stroke', 'none',
];

addText(args, { x: 84, y: 116, text: 'NYC Construction Activity Brief', size: 56, font: fontBold });
addText(args, { x: 84, y: 158, text: `Current issue public-record snapshot - ${range.first} to ${range.fetchDate || range.latest}`, size: 27, color: '#536056' });
addText(args, { x: 84, y: 212, text: String(rows.length), size: 52, font: fontBold });
addText(args, { x: 84, y: 242, text: 'PAID ISSUE ROWS', size: 17, color: '#536056', font: fontBold });
addText(args, { x: 282, y: 212, text: '25', size: 52, font: fontBold });
addText(args, { x: 282, y: 242, text: 'FREE PREVIEW ROWS', size: 17, color: '#536056', font: fontBold });
addText(args, { x: 500, y: 212, text: '$9.50', size: 52, font: fontBold });
addText(args, { x: 500, y: 242, text: 'LAUNCH PRICE', size: 17, color: '#536056', font: fontBold });
addBarRows(args, workTypeCounts, maxCount);
addText(args, { x: 84, y: 580, text: `Top ZIPs: ${zipCounts}`, size: 20, color: '#536056' });
addText(args, { x: 730, y: 580, text: 'DOB NOW rows. No lead guarantee.', size: 20, color: '#536056' });
args.push(outputPng);

try {
  execFileSync(convertBin, args, { stdio: 'pipe' });
} catch (error) {
  throw new Error(`ImageMagick convert failed: ${error.message}`);
}

buildShareCard(rows, range, workTypeCounts);

console.log(`generated ${path.relative(root, outputPng)}`);
console.log(`generated ${path.relative(root, socialSharePng)}`);
