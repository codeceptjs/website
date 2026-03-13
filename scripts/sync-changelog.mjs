import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const CHANGELOG_URL =
  process.env.CODECEPTJS_CHANGELOG_URL ||
  'https://raw.githubusercontent.com/codeceptjs/CodeceptJS/4.x/docs/changelog.md';
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'content', 'docs', 'changelog.md');
const MAX_RELEASES = Number(process.env.CODECEPTJS_CHANGELOG_MAX_RELEASES || 10);

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch changelog: HTTP ${res.statusCode}`));
          res.resume();
          return;
        }

        res.setEncoding('utf8');
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function normalizeFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---\n?/);

  let body = normalized;
  let title = 'Releases';

  if (fmMatch) {
    body = normalized.slice(fmMatch[0].length);
    const titleMatch = fmMatch[1].match(/^title:\s*(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim();
  }

  const frontmatter = ['---', `title: ${title}`, '---', ''].join('\n');
  return `${frontmatter}${trimToLatestReleases(body).trimStart()}`;
}

function trimToLatestReleases(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const sectionStarts = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) sectionStarts.push(i);
  }

  if (sectionStarts.length <= MAX_RELEASES) {
    return lines.join('\n');
  }

  const cutoff = sectionStarts[MAX_RELEASES];
  return lines.slice(0, cutoff).join('\n').trimEnd() + '\n';
}

async function main() {
  const upstream = await fetchText(CHANGELOG_URL);
  const output = normalizeFrontmatter(upstream);
  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`Synced changelog from ${CHANGELOG_URL}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
