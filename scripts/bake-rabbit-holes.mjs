/**
 * Bake each rabbit-hole essay under content/rabbit-holes/*.md into a full
 * HTML page under site/writing/rabbit-holes/<slug>/index.html.
 *
 * Layout: a sticky thin vertical timeline down the left side listing every
 * era heading. The right column is the essay. IntersectionObserver marks the
 * current era as the user scrolls.
 *
 * On mobile the timeline collapses to a horizontal strip above the article.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT_DIR = resolve(ROOT, 'content', 'rabbit-holes');
const OUT_DIR = resolve(ROOT, 'site', 'writing', 'rabbit-holes');

// Explicit sections list per essay. A block whose exact text matches
// `name` becomes a new section; every other block is body content of the
// current section. `date` is an optional era range shown under the heading
// in both the timeline nav and the article.
const META = {
  'history-of-education': {
    title: 'A History of Education',
    subtitle: 'From play and imitation to Prussian classrooms — how schooling came to be.',
    reading: '~14 min',
    sections: [
      { name: 'Pre-Speech',                                   date: '~2M – 100k BCE' },
      { name: 'Writing Emerges',                              date: '~3200 BCE' },
      { name: 'Full Class Systems Emerge',                    date: '~2500 BCE onward' },
      { name: 'Sparta, Han, Confucius, Abbasid, Mesoamerica', date: '~2000 – 500 BCE' },
      { name: "Let's Begin to Follow Greece Now",             date: '~500 – 300 BCE' },
      { name: 'Rome',                                         date: '~300 BCE – 400 CE' },
      { name: 'Then comes the medieval ages',                 date: '~500 – 1400 CE' },
      { name: 'The Renaissance',                              date: '~1400 – 1600 CE' },
      { name: 'The Enlightenment',                            date: '~1680 – 1800' },
      { name: 'The Industrial Revolution',                    date: '~1760 – 1900 CE' },
      { name: 'Modern Era',                                   date: '~1900 – present' },
      { name: 'Myths',                                        date: '' },
    ],
  },
  'social-classes-and-mobility': {
    title: 'Social Classes and Mobility',
    subtitle: 'How class emerged, hardened, and softened across ten thousand years.',
    reading: '~15 min',
    sections: [
      { name: 'Pre-Speech',                         date: '~2M – 100k BCE' },
      { name: 'Speech Emerges',                     date: '~100k – 50k BCE' },
      { name: 'Symbolism Emerges',                  date: '~50k – 12k BCE' },
      { name: 'Social Classes Emerge',              date: '~12k – 4000 BCE' },
      { name: 'Writing Emerges',                    date: '~3200 BCE' },
      { name: 'Full Class Systems Emerge',          date: '~3000 BCE onward' },
      { name: 'Different takes on Social Mobility', date: '~600 BCE – 500 CE' },
      { name: 'Rome',                               date: '~300 BCE – 400 CE' },
      { name: 'Then comes the medieval ages',       date: '~500 – 1400 CE' },
      { name: 'The Renaissance',                    date: '~1400 – 1600 CE' },
      { name: 'The Enlightenment',                  date: '~1680 – 1800' },
      { name: 'The Industrial Revolution',          date: '~1760 – 1980 CE' },
      { name: '1980-2020s',                         date: '~1980 – now' },
      { name: 'Today',                              date: '' },
    ],
  },
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escAttr(s) { return esc(s); }
function slugify(s) {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'section';
}

// Parse the markdown into an ordered list of sections using the explicit
// section list from META. Each META entry has `name` (matched against MD
// heading lines) and optional `date` (era range shown in nav + article).
function parse(md, sectionSpec) {
  const dateByName = new Map(sectionSpec.map((s) => [s.name.trim(), s.date || '']));
  const blocks = md
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/g)
    .map((b) => b.replace(/\s+$/g, '').replace(/^\s+/g, ''))
    .filter(Boolean);

  const sections = [];
  let cur = null;

  const startSection = (heading) => {
    cur = { heading, date: dateByName.get(heading) || '', blocks: [] };
    sections.push(cur);
  };

  for (const block of blocks) {
    const singleLine = !block.includes('\n');
    if (singleLine && dateByName.has(block.trim())) {
      startSection(block.trim());
      continue;
    }
    if (!cur) startSection(''); // leading un-headed content
    cur.blocks.push(block);
  }
  return sections;
}

function renderBlock(block) {
  const lines = block.split('\n').map((l) => l.replace(/\s+$/, ''));
  const bulletLines = lines.filter((l) => /^-\s+/.test(l));
  const numberedLines = lines.filter((l) => /^\d+\.\s+/.test(l));

  // Pure bullet list
  if (bulletLines.length === lines.length && lines.length > 1) {
    return '<ul class="rh-list">' +
      lines.map((l) => `<li>${esc(l.replace(/^-\s+/, ''))}</li>`).join('') +
      '</ul>';
  }
  // Pure numbered list
  if (numberedLines.length === lines.length && lines.length > 1) {
    return '<ol class="rh-list">' +
      lines.map((l) => `<li>${esc(l.replace(/^\d+\.\s+/, ''))}</li>`).join('') +
      '</ol>';
  }
  // Mixed: first line intro, remainder bullets/numbers → intro <p> then list
  if ((bulletLines.length > 0 || numberedLines.length > 0) && lines.length > 1) {
    const intro = [];
    const rest = [];
    let inList = false;
    for (const l of lines) {
      const isBullet = /^-\s+/.test(l);
      const isNumbered = /^\d+\.\s+/.test(l);
      if (isBullet || isNumbered) inList = true;
      if (!inList) intro.push(l);
      else rest.push(l);
    }
    const allNumbered = rest.every((l) => /^\d+\.\s+/.test(l));
    const tag = allNumbered ? 'ol' : 'ul';
    const items = rest.map((l) => `<li>${esc(l.replace(/^(-\s+|\d+\.\s+)/, ''))}</li>`).join('');
    return (intro.length ? `<p>${esc(intro.join(' '))}</p>` : '') +
      `<${tag} class="rh-list">${items}</${tag}>`;
  }
  // Plain paragraph — collapse internal line breaks into spaces (soft wrap)
  const paragraph = esc(lines.join(' ').replace(/\s+/g, ' ').trim());
  return `<p>${paragraph}</p>`;
}

function renderSections(sections) {
  const withIds = sections.map((s, i) => ({
    ...s,
    id: s.heading ? slugify(s.heading) : `intro-${i}`,
  }));
  const timelineItems = withIds
    .filter((s) => s.heading)
    .map(
      (s, idx) => `        <li class="rh-timeline__item${idx === 0 ? ' is-active' : ''}" data-section="${s.id}">
          <a class="rh-timeline__link" href="#${s.id}">
            <span class="rh-timeline__name">${esc(s.heading)}</span>${s.date ? `
            <span class="rh-timeline__date">${esc(s.date)}</span>` : ''}
          </a>
        </li>`
    )
    .join('\n');

  const articleHtml = withIds
    .map((s) => {
      const heading = s.heading
        ? `<h2>${esc(s.heading)}${s.date ? ` <span class="rh-section__date">${esc(s.date)}</span>` : ''}</h2>`
        : '';
      const body = s.blocks.map(renderBlock).join('\n');
      return `        <section id="${s.id}" class="rh-section">\n${heading ? `          ${heading}\n` : ''}          ${body.split('\n').join('\n          ')}\n        </section>`;
    })
    .join('\n');

  return { timelineItems, articleHtml };
}

function pageTemplate(slug, meta, timelineItems, articleHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(meta.title)} — Rabbit Hole — James Floyd</title>
  <meta name="description" content="${esc(meta.subtitle)}">
  <link rel="canonical" href="https://jamesfloyds.world/writing/rabbit-holes/${slug}/">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.subtitle)}">
  <meta property="og:url" content="https://jamesfloyds.world/writing/rabbit-holes/${slug}/">

  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@300;400&family=Lora:ital,wght@0,400;0,500;1,400&family=Space+Mono:wght@400;700&display=swap">
  <link rel="stylesheet" href="/css/site.css">

  <style>
    .rh-shell {
      display: grid;
      grid-template-columns: 220px minmax(0, 720px);
      gap: 56px;
      max-width: 1080px;
      margin: 0 auto;
      padding: 0 clamp(16px, 4vw, 24px);
    }

    /* Timeline (left column, sticky) */
    .rh-timeline {
      position: sticky;
      top: 96px;
      align-self: start;
      max-height: calc(100vh - 120px);
      max-height: calc(100dvh - 120px);
      overflow-y: auto;
      padding-right: 8px;
      scrollbar-width: thin;
    }
    .rh-timeline__list {
      list-style: none;
      padding: 0;
      margin: 0;
      position: relative;
    }
    .rh-timeline__list::before {
      content: '';
      position: absolute;
      left: 4px;
      top: 6px;
      bottom: 6px;
      width: 1px;
      background: var(--fg-15);
    }
    .rh-timeline__item {
      position: relative;
      padding: 0 0 12px 22px;
    }
    .rh-timeline__item::before {
      content: '';
      position: absolute;
      left: 1px;
      top: 6px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--bg, #000);
      border: 1px solid var(--fg-35);
      box-sizing: border-box;
      transition: background 0.2s, border-color 0.2s;
    }
    .rh-timeline__item.is-active::before {
      background: var(--fg);
      border-color: var(--fg);
    }
    .rh-timeline__link {
      display: block;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--fg-45);
      text-decoration: none;
      line-height: 1.5;
      transition: color 0.2s;
    }
    .rh-timeline__link:hover { color: var(--fg-80); }
    .rh-timeline__item.is-active .rh-timeline__link { color: var(--fg); }
    .rh-timeline__name { display: block; }
    .rh-timeline__date {
      display: block;
      font-size: 0.62rem;
      letter-spacing: 0.05em;
      color: var(--fg-30);
      text-transform: none;
      margin-top: 2px;
    }
    .rh-timeline__item.is-active .rh-timeline__date { color: var(--fg-55); }

    /* Article (right column) */
    .rh-article { max-width: 680px; }
    .rh-article__masthead {
      margin-bottom: 48px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--fg-15);
    }
    .rh-article__eyebrow {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--fg-55);
      margin-bottom: 12px;
    }
    .rh-article__title {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      font-size: clamp(2rem, 5vw, 3rem);
      line-height: 1.15;
      margin: 0 0 12px 0;
      color: var(--fg);
    }
    .rh-article__subtitle {
      font-family: 'Lora', Georgia, serif;
      font-style: italic;
      font-size: 1.05rem;
      line-height: 1.5;
      color: var(--fg-70);
      margin: 0 0 8px 0;
    }
    .rh-listen { margin-top: 18px; }
    .rh-article__meta {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--fg-45);
    }

    .rh-section { margin-bottom: 40px; scroll-margin-top: 96px; }
    .rh-section h2 {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--fg-80);
      margin: 0 0 20px 0;
      padding-top: 16px;
      border-top: 1px solid var(--fg-15);
    }
    .rh-section__date {
      display: inline-block;
      margin-left: 10px;
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      color: var(--fg-45);
      text-transform: none;
      font-weight: normal;
    }
    .rh-section p {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.02rem;
      line-height: 1.8;
      color: var(--fg-80);
      margin: 0 0 1rem 0;
    }
    .rh-section .rh-list {
      font-family: 'Lora', Georgia, serif;
      font-size: 1rem;
      line-height: 1.75;
      color: var(--fg-80);
      padding-left: 20px;
      margin: 0 0 1rem 0;
    }
    .rh-section .rh-list li { margin-bottom: 6px; }

    .rh-back {
      display: inline-block;
      margin: 48px 0 24px;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--fg-55);
      text-decoration: none;
    }
    .rh-back:hover { color: var(--fg); }
    .rh-back--top {
      margin: 0 0 24px 0;
      grid-column: 1 / -1;
    }

    /* Mobile: timeline collapses to a horizontal chip row above the article */
    @media (max-width: 900px) {
      .rh-shell {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      .rh-timeline {
        position: static;
        max-height: none;
        overflow-x: auto;
        overflow-y: visible;
        padding-right: 0;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--fg-15);
        white-space: nowrap;
      }
      .rh-timeline__list { display: inline-flex; gap: 4px; }
      .rh-timeline__list::before { display: none; }
      .rh-timeline__item {
        display: inline-block;
        padding: 6px 10px;
        border: 1px solid var(--fg-15);
        border-radius: 999px;
        flex-shrink: 0;
      }
      .rh-timeline__item::before { display: none; }
      .rh-timeline__item.is-active {
        background: var(--fg-10, rgba(255,255,255,0.08));
        border-color: var(--fg-35);
      }
      .rh-timeline__link { font-size: 0.68rem; }
      .rh-timeline__date { display: none; }
      .rh-article__title { font-size: 1.75rem; }
      .rh-section__date { display: block; margin-left: 0; margin-top: 4px; }
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
    <div class="rh-shell anim-fade-up" style="animation-delay:0.3s">

      <a href="/writing/#rabbit-holes" class="rh-back rh-back--top">← Back to Writing</a>

      <aside class="rh-timeline" aria-label="Essay timeline">
        <ol class="rh-timeline__list">
${timelineItems}
        </ol>
      </aside>

      <article class="rh-article">
        <header class="rh-article__masthead">
          <span class="rh-article__eyebrow">Rabbit Hole · ${esc(meta.reading)}</span>
          <h1 class="rh-article__title">${esc(meta.title)}</h1>
          <p class="rh-article__subtitle">${esc(meta.subtitle)}</p>
          <p class="rh-article__meta">by James Floyd</p>
          <div class="rh-listen">
            <button class="read-aloud" type="button" data-audio="/audio/essay-${slug}.mp3" aria-pressed="false" aria-label="Listen to this essay" hidden>
              <span class="read-aloud__ico" aria-hidden="true">▶</span>
              <span class="read-aloud__label">Listen</span>
            </button>
          </div>
        </header>

        <div id="rh-readable">
${articleHtml}
        </div>

        <a href="/writing/#rabbit-holes" class="rh-back">← Back to Writing</a>
      </article>

    </div>
  </main>

  <script>
    // ── Nav (menu open/close), copy of the pattern used across the site
    (function() {
      var btn = document.getElementById('menu-btn');
      var nav = document.getElementById('site-nav');
      var close = document.getElementById('nav-close');
      if (btn && nav) {
        btn.addEventListener('click', function() {
          var open = nav.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
      if (close && nav) {
        close.addEventListener('click', function() {
          nav.classList.remove('is-open');
          btn && btn.setAttribute('aria-expanded', 'false');
        });
      }
    })();

    // ── Timeline highlight: mark the section whose heading has most recently
    //    crossed a "read line" 30% down from the top of the viewport. Simple
    //    scroll listener beats IntersectionObserver here because a long
    //    section keeps intersecting even after the reader has moved past.
    (function() {
      var sections = Array.from(document.querySelectorAll('.rh-section'));
      var itemMap = new Map();
      document.querySelectorAll('.rh-timeline__item').forEach(function(it) {
        itemMap.set(it.dataset.section, it);
      });
      if (!sections.length || !itemMap.size) return;

      var lastActive = null;
      function update() {
        var readLine = window.innerHeight * 0.3;
        var active = sections[0];
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top <= readLine) active = sections[i];
          else break;
        }
        if (active === lastActive) return;
        lastActive = active;
        itemMap.forEach(function(it) { it.classList.remove('is-active'); });
        var el = itemMap.get(active.id);
        if (el) {
          el.classList.add('is-active');
          // On mobile the timeline is a horizontal chip strip at the top of the
          // page. Keep the active chip centered by scrolling ONLY the strip
          // horizontally — never el.scrollIntoView(), which also scrolls the
          // window vertically and yanks the reader back up to the top.
          if (window.innerWidth <= 900) {
            var strip = el.closest('.rh-timeline');
            if (strip && strip.scrollWidth > strip.clientWidth) {
              strip.scrollTo({
                left: el.offsetLeft - strip.clientWidth / 2 + el.offsetWidth / 2,
                behavior: 'smooth'
              });
            }
          }
        }
      }
      var ticking = false;
      window.addEventListener('scroll', function() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function() { update(); ticking = false; });
      }, { passive: true });
      update();
    })();
  </script>
</body>
</html>
`;
}

function bake() {
  if (!existsSync(CONTENT_DIR)) {
    console.log('  ! no content/rabbit-holes/ directory, skipping');
    return;
  }
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const meta = META[slug];
    if (!meta) {
      console.warn(`  ! no META entry for ${slug}, skipping`);
      continue;
    }
    const md = readFileSync(resolve(CONTENT_DIR, file), 'utf8');
    const sections = parse(md, meta.sections || []);
    const { timelineItems, articleHtml } = renderSections(sections);
    const html = pageTemplate(slug, meta, timelineItems, articleHtml);
    const outDir = resolve(OUT_DIR, slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, 'index.html'), html);
    const headingCount = sections.filter((s) => s.heading).length;
    console.log(`✓ baked rabbit-hole "${slug}" — ${headingCount} sections`);
  }
}

bake();
