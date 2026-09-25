/**
 * Copy the world-education-map build into site/education/us-vs-world/ and put
 * the page furniture back on it.
 *
 * The dashboard is built in its own repo (~/Projects/world-education-map) and
 * is also published as an artifact, so its own index.html carries no site
 * chrome: no canonical, no cards, no favicon, no way back. Those are added
 * here rather than in that repo, so the dashboard stays portable and this
 * stays a copy step rather than a fork.
 *
 *   bun scripts/sync-education-map.mjs [path-to-build]
 *
 * Idempotent: run it after every rebuild over there.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(ROOT, 'site/education/us-vs-world');
const SRC = process.argv[2] || join(homedir(), 'Projects/world-education-map/build');
const URL_PATH = 'https://jamesfloyds.world/education/us-vs-world/';

if (!existsSync(join(SRC, 'index.html'))) {
  console.error(`  ! no build at ${SRC}`);
  process.exit(1);
}

/* ── copy everything the build emits ──────────────────────────────────── */
let copied = 0, bytes = 0;
const walk = (from, to) => {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const f = join(from, name), t = join(to, name);
    if (statSync(f).isDirectory()) walk(f, t);
    else { copyFileSync(f, t); copied++; bytes += statSync(f).size; }
  }
};
walk(SRC, DEST);

/* ── put the page furniture back ──────────────────────────────────────── */
const page = join(DEST, 'index.html');
let html = readFileSync(page, 'utf8');

const swap = (find, replace, what) => {
  if (html.includes(replace.split('\n')[0])) return;        // already applied
  if (!html.includes(find)) throw new Error(`sync: could not find ${what} — the dashboard's markup moved`);
  html = html.replace(find, replace);
};

swap(
  '<title>How U.S. Learners Compare</title>',
  `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>US vs World in Education — James Floyd</title>
<link rel="canonical" href="${URL_PATH}">
<meta property="og:type" content="website">
<meta property="og:title" content="US vs World in Education">
<meta property="og:description" content="Every international test the U.S. takes, from grade 4 to adulthood, compared country by country.">
<meta property="og:url" content="${URL_PATH}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="US vs World in Education">
<meta name="twitter:description" content="Every international test the U.S. takes, from grade 4 to adulthood, compared country by country.">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
  'the title'
);

swap(
  '<div class="app">\n  <header>',
  `<div class="app">
  <a class="home-link" href="/education/">← James' Education Dashboards</a>
  <header>`,
  'the header'
);

swap(
  '*{box-sizing:border-box}',
  `*{box-sizing:border-box}
.home-link{display:inline-block; margin:0 0 14px; font-family:var(--mono); font-size:11px;
  letter-spacing:.14em; text-transform:uppercase; color:var(--muted); text-decoration:none;}
.home-link:hover,.home-link:focus-visible{color:var(--ink);}`,
  'the stylesheet'
);

writeFileSync(page, html);
console.log(`✓ education map synced — ${copied} files, ${(bytes / 1e6).toFixed(1)}MB, from ${SRC}`);
