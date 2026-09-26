/**
 * Copy the education dashboards' builds into site/education/<slug>/ and put the
 * page furniture back on them.
 *
 * Each dashboard is built in its own repo and is also published as an artifact,
 * so its own index.html carries no site chrome: no canonical, no cards, no
 * favicon, no way back. Those are added here rather than in those repos, so the
 * dashboards stay portable and this stays a copy step rather than a fork.
 *
 *   bun scripts/sync-education-map.mjs            # every dashboard
 *   bun scripts/sync-education-map.mjs us-vs-world
 *
 * Idempotent: run it after every rebuild over there.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://jamesfloyds.world';

const MAPS = [
  {
    slug: 'us-vs-world',
    src: join(homedir(), 'Projects/world-education-map/build'),
    title: 'US vs World in Education',
    desc: 'Every international test the U.S. takes, from grade 4 to adulthood, compared country by country.',
    // the line in the dashboard's own <head> that the furniture replaces
    titleTag: '<title>How U.S. Learners Compare</title>',
  },
  {
    slug: 'school-outlook',
    src: join(homedir(), 'Projects/enrollment-stress-map/build'),
    title: 'School Outlook Map',
    desc: 'How many public school students every U.S. county and school district will have through 2055, as births, moving and immigration change.',
    titleTag: '<title>School Outlook Map</title>',
  },
];

const only = process.argv[2];
let ran = 0;

for (const m of MAPS) {
  if (only && only !== m.slug) continue;
  const dest = join(ROOT, 'site/education', m.slug);
  const url = `${SITE}/education/${m.slug}/`;

  if (!existsSync(join(m.src, 'index.html'))) {
    console.error(`  ! no build at ${m.src} — skipping ${m.slug}`);
    continue;
  }

  /* ── copy everything the build emits ────────────────────────────────── */
  let copied = 0, bytes = 0;
  const walk = (from, to) => {
    mkdirSync(to, { recursive: true });
    for (const name of readdirSync(from)) {
      const f = join(from, name), t = join(to, name);
      if (statSync(f).isDirectory()) walk(f, t);
      else { copyFileSync(f, t); copied++; bytes += statSync(f).size; }
    }
  };
  walk(m.src, dest);

  /* A rename over there -- korea.js became overtime.js -- leaves the old file
     sitting in site/ forever, shipped and unreferenced, because copying never
     removes. So anything here that is no longer in the build goes. */
  const prune = (from, to) => {
    if (!existsSync(to)) return;
    const keep = new Set(readdirSync(from));
    for (const name of readdirSync(to)) {
      const t = join(to, name);
      if (!keep.has(name)) { rmSync(t, { recursive: true }); console.log(`    removed ${name}, no longer in the build`); }
      else if (statSync(t).isDirectory()) prune(join(from, name), t);
    }
  };
  prune(m.src, dest);

  /* iCloud copies files while a build is writing them; a "name 2.js" left in
     site/ ships as dead weight and has been committed once already. */
  for (const name of readdirSync(dest)) {
    if (/ \d+\.(js|html|css|json)$/.test(name)) { rmSync(join(dest, name)); console.log(`    dropped iCloud duplicate ${name}`); }
  }

  /* ── put the page furniture back ────────────────────────────────────── */
  const page = join(dest, 'index.html');
  let html = readFileSync(page, 'utf8');

  /* `done` is a string that exists only once the patch has been applied — it
     cannot be the replacement's first line, because for the back-link that
     line is also the line being matched, and the patch would never run. */
  const swap = (find, replace, what, done) => {
    if (html.includes(done)) return;
    if (!html.includes(find)) throw new Error(`sync ${m.slug}: could not find ${what} — the dashboard's markup moved`);
    html = html.replace(find, replace);
  };

  swap(
    m.titleTag,
    `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${m.title} — James Floyd</title>
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${m.title}">
<meta property="og:description" content="${m.desc}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${m.title}">
<meta name="twitter:description" content="${m.desc}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    'the title', `<title>${m.title} — James Floyd</title>`
  );

  // Both dashboards open their body with <div class="app"> and a header.
  swap(
    '<div class="app">\n  <header',
    `<div class="app">
  <a class="home-link" href="/education/">← James' Education Dashboards</a>
  <header`,
    'the header', 'class="home-link"'
  );

  swap(
    '*{box-sizing:border-box}',
    `*{box-sizing:border-box}
.home-link{display:inline-block; margin:0 0 14px; font-family:var(--mono); font-size:11px;
  letter-spacing:.14em; text-transform:uppercase; color:var(--muted); text-decoration:none;}
.home-link:hover,.home-link:focus-visible{color:var(--ink);}`,
    'the stylesheet', '.home-link{display:inline-block'
  );

  writeFileSync(page, html);
  console.log(`✓ ${m.slug} — ${copied} files, ${(bytes / 1e6).toFixed(1)}MB, from ${m.src}`);
  ran++;
}

if (!ran) { console.error('  ! nothing synced'); process.exit(1); }
