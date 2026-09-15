/**
 * Bake a monthly update into a page of its own under /writing/updates/<slug>/.
 *
 * The updates already read in full on /writing/ inside a <details>, but that is
 * one long list — no URL of its own, nothing to send someone, nothing for a
 * search engine to index as a piece of writing. This gives the ones named in
 * scripts/updates.config.mjs a real page.
 *
 * Source of truth is public/data/substack-posts.json, written by
 * fetch-substack.mjs, so this must run after it. The body HTML comes from
 * Substack and carries Substack's furniture with it — gallery embeds whose
 * images live on S3, a preformatted-block wrapper around the poem, share
 * parameters on every past-update link. All of that is cleaned here, and the
 * gallery images are pulled down into public/pictures/updates/<slug>/ so the
 * page does not depend on someone else's CDN staying up.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UPDATE_PAGES, updatePath } from './updates.config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = join(ROOT, 'public/data/substack-posts.json');
const SITE_URL = 'https://jamesfloyds.world';

/* ── helpers ──────────────────────────────────────────────────────────── */

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const plain = (s) =>
  String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");

const slugOf = (post) => {
  const m = /\/p\/([^/?#]+)/.exec(post.link || '');
  return m ? m[1] : '';
};

/* A Substack link carries the share code that brought the reader in. On his own
   site there is no referrer to preserve, and leaving them in means every link
   out of this page is tagged with a campaign that has nothing to do with it. */
function cleanUrl(u) {
  try {
    const url = new URL(plain(u));
    for (const k of [...url.searchParams.keys()]) {
      if (k === 'r' || k.startsWith('utm_')) url.searchParams.delete(k);
    }
    return url.toString();
  } catch { return u; }
}

/* ── the images ───────────────────────────────────────────────────────── */

const MAX_EDGE = 1600;   // px on the long side — twice the column, for retina

/* Substack serves the phone's originals: 4032px, three megabytes each. Seven of
   those is a nineteen-megabyte page and nineteen megabytes in the repository
   forever. Shrink on the way in, once, because the file is then committed and
   never fetched again.
   sips is macOS-only. On any other machine the images are already in git by the
   time the build runs, so this is a no-op there rather than a failure. */
function shrink(dest) {
  if (!existsSync(dest)) return;
  const before = statSync(dest).size;
  const r = spawnSync('sips', ['-Z', String(MAX_EDGE), '-s', 'formatOptions', '70', dest],
                      { stdio: 'ignore' });
  if (r.error || r.status !== 0) {
    if (before > 800_000) {
      console.warn(`  ! ${dest.split('/').pop()} is ${(before / 1e6).toFixed(1)}MB and could not be resized (sips unavailable)`);
    }
    return;
  }
  const after = statSync(dest).size;
  if (after < before) {
    console.log(`    ${dest.split('/').pop()}  ${(before / 1e6).toFixed(1)}MB → ${(after / 1e3).toFixed(0)}KB`);
  }
}

async function pullImage(src, dest) {
  if (existsSync(dest)) return true;
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    shrink(dest);
    return true;
  } catch (e) {
    console.warn(`  ! could not pull ${src.slice(0, 70)}… — ${e.message}`);
    return false;
  }
}

/* ── turning Substack's HTML into the page's HTML ─────────────────────── */

async function cleanBody(html, slug, title) {
  let out = html;
  let n = 0;
  const wanted = [];

  // Galleries first, while the wrapper div is still there to match on.
  out = out.replace(
    /<div class="image-gallery-embed" data-attrs="([^"]*)"[^>]*>[\s\S]*?<\/div>/g,
    (_, attrs) => {
      let images = [];
      try { images = JSON.parse(plain(attrs)).gallery.images || []; } catch { return ''; }
      const figs = images.map((im) => {
        const ext = (im.type || '').includes('png') ? 'png' : 'jpg';
        const file = `${String(++n).padStart(2, '0')}.${ext}`;
        wanted.push({ src: im.src, file });
        return `<img src="/pictures/updates/${slug}/${file}" alt="From ${esc(title)}" loading="lazy" decoding="async">`;
      });
      if (!figs.length) return '';
      // One picture is a photograph and keeps its own shape; several are a
      // contact sheet, and squaring those is what makes them read as a set.
      const one = figs.length === 1 ? ' up-shots--one' : '';
      return `<figure class="up-shots${one}">${figs.join('')}</figure>`;
    }
  );

  // The poem. Substack wraps it in a preformatted block with an empty label for
  // its own editor; the <pre> is what holds the line breaks, so keep only that.
  out = out.replace(
    /<div class="preformatted-block"[^>]*>[\s\S]*?<pre[^>]*>([\s\S]*?)<\/pre>[\s\S]*?<\/div>/g,
    (_, body) => `<pre class="up-poem">${body}</pre>`
  );

  out = out
    .replace(/<label[^>]*>[\s\S]*?<\/label>/g, '')
    .replace(/<div>\s*<hr\s*\/?>\s*<\/div>/g, '<hr>')
    .replace(/<\/?div[^>]*>/g, '')          // every remaining div is a wrapper
    .replace(/<\/?span[^>]*>/g, '');        // and every span is styling we restyle

  // Links: cleaned, and anything off-site opens away from the page.
  out = out.replace(/<a\s+[^>]*href="([^"]+)"[^>]*>/g, (_, href) => {
    const url = cleanUrl(href);
    const external = /^https?:\/\//i.test(url) && !url.includes('jamesfloyds.world');
    return `<a href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>`;
  });

  out = out
    .replace(/<p>(?:\s|<br\s*\/?>)*<\/p>/g, '')   // paragraphs Substack left empty
    .replace(/(<hr>\s*){2,}/g, '<hr>')
    .trim();

  const pulled = [];
  for (const w of wanted) {
    const dest = join(ROOT, 'public/pictures/updates', slug, w.file);
    if (await pullImage(w.src, dest)) pulled.push(w.file);
  }
  // A picture that would not download is a broken image on the page.
  if (pulled.length !== wanted.length) {
    for (const w of wanted) {
      if (!pulled.includes(w.file)) {
        out = out.replace(new RegExp(`<img src="/pictures/updates/${slug}/${w.file}"[^>]*>`, 'g'), '');
      }
    }
    out = out.replace(/<figure class="up-shots">\s*<\/figure>/g, '');
  }

  return { html: out, images: pulled.length };
}

/* ── the page ─────────────────────────────────────────────────────────── */

function pageTemplate(post, slug, body) {
  const title = plain(post.title || '');
  const subtitle = plain(post.subtitle || '');
  const date = plain(post.displayDate || '');
  const url = `${SITE_URL}${updatePath(slug)}`;
  const desc = subtitle
    ? `${subtitle} — the monthly update from James Floyd, ${date}.`
    : `The monthly update from James Floyd, ${date}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — The James Floyd Update</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(url)}">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="article:published_time" content="${esc(post.date || '')}">
  <meta name="twitter:card" content="summary">

  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@300;400&display=swap">
  <link rel="stylesheet" href="/css/site.css">

  <style>
    /* A letter, so it is set as one: a single measured column, the masthead
       marks in tobacco like every other dateline on the site, and the things
       you can act on in sage. */
    .up-shell { max-width: 680px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 24px); }

    .up-back {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--green-70);
      text-decoration: none;
      margin-bottom: 40px;
      transition: color 0.2s;
    }
    .up-back:hover { color: var(--green); }

    .up-masthead {
      margin-bottom: 44px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--fg-15);
    }
    .up-eyebrow {
      display: block;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--brown);
      margin-bottom: 12px;
    }
    .up-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      font-size: clamp(2rem, 5vw, 3rem);
      line-height: 1.15;
      margin: 0 0 12px 0;
      color: var(--fg);
      text-wrap: balance;
    }
    .up-subtitle {
      font-family: 'Lora', Georgia, serif;
      font-style: italic;
      font-size: 1.05rem;
      line-height: 1.5;
      color: var(--fg-70);
      margin: 0 0 8px 0;
    }
    .up-byline {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--brown-70);
      margin: 0;
    }

    /* ── the letter itself ────────────────────────────────────────────── */
    .up-body {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.05rem;
      line-height: 1.8;
      color: var(--fg-80);
    }
    .up-body p { margin: 0 0 1.35rem; }
    .up-body strong { color: var(--fg); font-weight: 500; }
    .up-body a {
      color: var(--fg-85);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: var(--green-30);
      transition: text-decoration-color 0.2s, color 0.2s;
    }
    .up-body a:hover { color: var(--fg); text-decoration-color: var(--green); }

    .up-body h2 {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 400;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--fg-80);
      margin: 2.6rem 0 1.1rem;
      padding-top: 16px;
      border-top: 1px solid var(--fg-15);
    }
    .up-body ul { margin: 0 0 1.35rem; padding-left: 1.1rem; }
    .up-body li { margin-bottom: 0.5rem; }
    .up-body li p { margin: 0; }
    .up-body li::marker { color: var(--brown-70); }

    /* Substack separates every section with a rule as well as a heading. One
       or the other is the divider; two is a stutter, so the rule that lands
       straight before a heading is dropped. */
    .up-body hr { border: 0; border-top: 1px solid var(--fg-15); margin: 2.4rem 0; }
    .up-body hr + h2 { border-top: 0; padding-top: 0; margin-top: 0; }

    .up-poem {
      font-family: 'Lora', Georgia, serif;
      font-style: italic;
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--fg);
      white-space: pre-wrap;
      margin: 1.6rem 0 2rem;
      padding-left: 20px;
      border-left: 2px solid var(--brown-45);
      overflow-x: auto;
    }

    .up-shots {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
      margin: 1.8rem 0 2rem;
    }
    .up-shots img {
      width: 100%;
      height: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      display: block;
      border: 1px solid var(--fg-15);
      border-radius: 2px;
    }
    .up-shots--one { grid-template-columns: 1fr; }
    .up-shots--one img { aspect-ratio: auto; height: auto; }

    /* ── foot of the letter ───────────────────────────────────────────── */
    .up-foot {
      margin-top: 56px;
      padding-top: 24px;
      border-top: 1px solid var(--brown-15);
      display: flex;
      flex-wrap: wrap;
      gap: 12px 28px;
      align-items: baseline;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .up-foot a { color: var(--green-70); text-decoration: none; transition: color 0.2s; }
    .up-foot a:hover { color: var(--green); }
    .up-foot .up-foot__note {
      flex-basis: 100%;
      color: var(--fg-45);
      letter-spacing: 0.02em;
      text-transform: none;
      font-size: 0.74rem;
      line-height: 1.7;
    }

    @media (max-width: 640px) {
      .up-body { font-size: 1rem; }
      .up-back { margin-bottom: 28px; }
    }
  </style>
</head>
<body>

  <header class="site-header anim-slide-dn">
    <a href="/" class="site-header__logo" aria-label="Return to home"><img src="/logo.svg" alt="JF"></a>
    <button class="site-header__menu-btn" id="menu-btn" aria-expanded="false" aria-controls="site-nav">Menu</button>
  </header>

  <nav class="site-nav" id="site-nav" aria-label="Main navigation">
    <ul class="site-nav__list">
      <li class="site-nav__item"><a href="/sonder/" class="site-nav__link">Sonder Series</a></li>
      <li class="site-nav__item"><a href="/portfolio/" class="site-nav__link">Portfolio</a></li>
      <li class="site-nav__item" data-has-sub>
        <a href="/projects/" class="site-nav__link">Projects</a>
        <div class="site-nav__sub">
          <a href="/portfolio/" class="site-nav__sub-link">Portfolio</a>
          <a href="/resume/" class="site-nav__sub-link">Resume</a>
          <a href="/references/" class="site-nav__sub-link">References</a>
        </div>
      </li>
      <li class="site-nav__item" data-has-sub>
        <a href="/content/" class="site-nav__link">Content</a>
        <div class="site-nav__sub">
          <a href="/writing/" class="site-nav__sub-link">Writing</a>
          <a href="/poems/" class="site-nav__sub-link">Poems</a>
          <a href="/pictures/" class="site-nav__sub-link">Memories</a>
        </div>
      </li>
      <li class="site-nav__item"><a href="/network/" class="site-nav__link">Network</a></li>
      <li class="site-nav__item"><a href="/blueprints/" class="site-nav__link">Blueprints</a></li>
      <li class="site-nav__item" style="margin-top:24px;"><a href="/" class="site-nav__back">Back to Gallery</a></li>
    </ul>
    <button class="site-nav__close" id="nav-close">Close</button>
  </nav>

  <main class="page">
    <article class="up-shell anim-fade-up" style="animation-delay:0.3s">

      <a href="/writing/" class="up-back">← Back to Writing</a>

      <header class="up-masthead">
        <span class="up-eyebrow">The James Floyd Update · ${esc(date)}</span>
        <h1 class="up-title">${esc(title)}</h1>
        ${subtitle ? `<p class="up-subtitle">${esc(subtitle)}</p>` : ''}
        <p class="up-byline">by James Floyd</p>
      </header>

      <div class="up-body">
${body}
      </div>

      <footer class="up-foot">
        <a href="/writing/">← All writing</a>
        <a href="${esc(cleanUrl(post.link || ''))}" target="_blank" rel="noopener noreferrer">Read on Substack ↗</a>
        <a href="https://jamesfloyd.substack.com/subscribe" target="_blank" rel="noopener noreferrer">Get the next one ↗</a>
        <p class="up-foot__note">Sent monthly to the people I have met on my path. Just like companies
        send updates to their investors, I send updates to you because you have invested in me.</p>
      </footer>

    </article>
  </main>

  <script>
    (function () {
      var btn = document.getElementById('menu-btn');
      var nav = document.getElementById('site-nav');
      var close = document.getElementById('nav-close');
      if (btn && nav) {
        btn.addEventListener('click', function () {
          var open = nav.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
      if (close && nav) {
        close.addEventListener('click', function () {
          nav.classList.remove('is-open');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    })();
  </script>

</body>
</html>
`;
}

/* ── run ──────────────────────────────────────────────────────────────── */

if (!existsSync(POSTS)) {
  console.warn('  ! public/data/substack-posts.json not found — skipping update pages');
  process.exit(0);
}

const posts = JSON.parse(readFileSync(POSTS, 'utf8')).posts || [];
let built = 0;

for (const slug of UPDATE_PAGES) {
  const post = posts.find((p) => slugOf(p) === slug);
  if (!post) {
    console.warn(`  ! no Substack post matches "${slug}" — skipping`);
    continue;
  }
  if (!post.bodyHtml) {
    console.warn(`  ! "${slug}" has no body — skipping`);
    continue;
  }
  const { html, images } = await cleanBody(post.bodyHtml, slug, plain(post.title || ''));
  const dest = join(ROOT, 'site', updatePath(slug), 'index.html');
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, pageTemplate(post, slug, html));
  built++;
  console.log(`  · ${updatePath(slug)}${images ? `  (${images} images)` : ''}`);
}

console.log(`✓ baked ${built} update page${built === 1 ? '' : 's'} → site${updatePath('…')}`);
