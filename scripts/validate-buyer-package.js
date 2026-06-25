const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packageDir = path.resolve(root, '..', 'package');

function readPackage(file) {
  return fs.readFileSync(path.join(packageDir, file), 'utf8');
}

const workbook = readPackage('buyer-workbook.md');
assert.match(workbook, /# Buyer Workbook/, 'buyer workbook needs title');
assert.match(workbook, /Public preview rows in package: 111/, 'buyer workbook needs current row count');
assert.match(workbook, /buyer-priority-slices\.csv/, 'buyer workbook points to priority slices');
assert.match(workbook, /No owner names|does not include owner names/i, 'buyer workbook needs privacy boundary');
assert.doesNotMatch(workbook, /\bguaranteed leads\b/i, 'buyer workbook must not imply lead guarantees except in negative boundary copy');

const slices = readPackage('buyer-priority-slices.csv');
const lines = slices.trim().split(/\r?\n/);
assert.ok(lines.length > 10, 'priority slices need useful rows');
assert.equal(
  lines[0],
  'work_type,borough,zip_code,row_count,latest_issued_date,cost_bucket_mix,permit_status_mix,sample_source_url,suggested_first_filter',
  'priority slices need stable header',
);
assert.match(slices, /Sidewalk Shed|Plumbing|Sprinklers/, 'priority slices need current work type data');
assert.match(slices, /https:\/\/data\.cityofnewyork\.us\/Housing-Development\/DOB-NOW-Build-Approved-Permits\/rbx6-tga4/, 'priority slices need source URLs');

const version = readPackage('version.txt');
assert.match(version, /buyer-workbook\.md/, 'version file lists buyer workbook');
assert.match(version, /buyer-priority-slices\.csv/, 'version file lists buyer priority slices');

const readme = readPackage('README.md');
assert.match(readme, /buyer-workbook\.md/, 'package README lists buyer workbook');
assert.match(readme, /buyer-priority-slices\.csv/, 'package README lists buyer priority slices');

console.log('buyer package validation passed');
