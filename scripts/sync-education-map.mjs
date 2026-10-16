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
import { execSync } from 'node:child_process';

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
  {
    slug: 'frontier',
    src: join(homedir(), 'Projects/education-frontier-map/build'),
    title: 'The Education Frontier',
    desc: 'New school models, education tools, studies and voices on a world map.', // James to rewrite
    titleTag: '<title>The Education Frontier</title>',
  },
];

const only = process.argv[2];
let ran = 0;

/* ── keep the scheduled task's additions ───────────────────────────────────
   A cloud scheduled task ("Education news update", Wed + Sun) adds items to
   site/education/frontier/news.json and pushes them to main. The frontier
   build on this Mac never sees them, so copying the build over site/ would
   erase them. Two guards:
   1. Refuse to run while this checkout is behind origin/main, so the task's
      latest items are on disk before anything is copied.
   2. Merge: any item already in site/ that the build lacks is kept. */
const FRONTIER_SITE = join(ROOT, 'site/education/frontier');
const newsKey = (n) => `${n.kind}|${n.name}|${n.text}`.toLowerCase();
let savedNews = [], savedUpdated = '';
if (!only || only === 'frontier') {
  try {
    execSync('git fetch -q origin main', { cwd: ROOT, stdio: 'ignore' });
    const behind = Number(execSync('git rev-list --count HEAD..origin/main', { cwd: ROOT }).toString().trim());
    if (behind > 0) {
      console.error(`  ! this checkout is ${behind} commit(s) behind origin/main (the scheduled task may have added news).`);
      console.error('    Run `git pull` first, then run this script again. Nothing was changed.');
      process.exit(1);
    }
  } catch { console.error('  ! could not reach GitHub to check for new items; merging with what is on disk'); }
  try { savedNews = JSON.parse(readFileSync(join(FRONTIER_SITE, 'news.json'), 'utf8')); } catch {}
  try { savedUpdated = JSON.parse(readFileSync(join(FRONTIER_SITE, 'stats.json'), 'utf8')).updated || ''; } catch {}
}

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

  /* frontier: put back the items the scheduled task added (see top of file) */
  if (m.slug === 'frontier' && savedNews.length) {
    const built = JSON.parse(readFileSync(join(dest, 'news.json'), 'utf8'));
    const have = new Set(built.map(newsKey));
    const kept = savedNews.filter((n) => !have.has(newsKey(n)));
    writeFileSync(join(dest, 'news.json'), JSON.stringify([...kept, ...built], null, 1) + '\n');
    if (kept.length) console.log(`    kept ${kept.length} news item(s) added by the scheduled task`);
    const st = JSON.parse(readFileSync(join(dest, 'stats.json'), 'utf8'));
    if (savedUpdated > (st.updated || '')) { st.updated = savedUpdated; writeFileSync(join(dest, 'stats.json'), JSON.stringify(st)); }
  }

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

  // Every dashboard opens its body with <div class="app"> and a header.
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

/* ── bake the /education ticker from the frontier build's news.json ─────────
   Static HTML between markers, like the /writing/ bake scripts: the items are
   readable with JS off and nothing is fetched at runtime. The list is written
   twice so the CSS marquee can loop without a jump. */
if (!only || only === 'frontier') {
  const news = join(FRONTIER_SITE, 'news.json'); // merged copy (build + scheduled-task items)
  const page = join(ROOT, 'site/education/index.html');
  if (existsSync(news) && existsSync(page)) {
    const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const items = JSON.parse(readFileSync(news, 'utf8'));
    const li = items.map((n) => `<li class="k-${esc(n.kind)}"><a href="${esc(n.href || '/education/frontier/')}"><b>${esc(n.kind === 'study' ? 'New study' : n.name)}</b>${esc(n.text)}${n.date ? `<em>${esc(n.date)}</em>` : ''}</a></li>`).join('');
    const block = `<div class="ed-ticker__track" style="--dur:${Math.max(60, items.length * 7)}s"><ul>${li}</ul><ul aria-hidden="true">${li}</ul></div>`;
    const html = readFileSync(page, 'utf8');
    const re = /(<!-- BEGIN_TICKER[^>]*-->)[\s\S]*?(<!-- END_TICKER -->)/;
    if (!re.test(html)) console.error('  ! /education has no ticker markers — skipped');
    // replace with a function, not a string: the items contain "$2.1B", and "$2" in a replacement string is a backreference
    else { writeFileSync(page, html.replace(re, (_, a, z) => `${a}\n${block}\n${z}`)); console.log(`✓ /education ticker — ${items.length} items`); }
  }
  // the bottom-left line: schedule and last update, from the build's stats.json
  const stats = join(FRONTIER_SITE, 'stats.json');
  if (existsSync(stats) && existsSync(page)) {
    const st = JSON.parse(readFileSync(stats, 'utf8'));
    const d = new Date(st.updated + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const note = `Updated twice a week · Last update ${d}`;
    const html = readFileSync(page, 'utf8'), re2 = /(<!-- BEGIN_NOTE[^>]*-->)[\s\S]*?(<!-- END_NOTE -->)/;
    if (re2.test(html)) { writeFileSync(page, html.replace(re2, (_, a, z) => `${a}\n${note}\n${z}`)); console.log(`✓ /education note — updated ${d}`); }
  }
}
