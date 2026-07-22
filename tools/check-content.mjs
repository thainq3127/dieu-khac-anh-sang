import { readFile } from 'node:fs/promises';

const source = JSON.parse(await readFile('source-page-text.json', 'utf8')).text;
const html = await readFile('index.html', 'utf8');

const offlineText = html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replace(/\s+/g, ' ')
  .trim();

function normalize(value) {
  return value.replace(/\s+/g, ' ').trim();
}

const sourceLines = source
  .split(/\r?\n/)
  .map(normalize)
  .filter((line) => line.length > 2);

const missing = [...new Set(sourceLines.filter((line) => !offlineText.includes(line)))];

console.log(JSON.stringify({
  checkedLines: sourceLines.length,
  missingCount: missing.length,
  missing,
}, null, 2));