/**
 * Postbuild step: turn the single Vite-built dist/index.html into one HTML
 * file per route, with route-specific <title>, <meta description>, canonical,
 * and Open Graph + Twitter tags rewritten in.
 *
 * GitHub Pages (and any static host) then serves the right HTML for direct
 * visits to /sonder, /projects, etc. — HTTP 200 instead of the 404 + JS shim
 * that an SPA otherwise relies on. Crawlers and unfurlers (Twitter, LinkedIn,
 * Slack, Discord, ChatGPT browse) that don't execute JS now see correct,
 * page-specific metadata.
 *
 * The React app still loads and runs as before — once JS executes, React
 * Router takes over and the page renders normally.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES, SITE_URL, DEFAULT_OG_IMAGE } from './routes.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const TEMPLATE_PATH = join(DIST, 'index.html');
const SUBSTACK_DATA_PATH = resolve(__dirname, '..', 'src', 'data', 'substack-posts.json');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build the prerendered body for /writing from the Substack JSON dump.
 * Returns the same wrap()-style markup the other routes use so the
 * crawler-readable content fits the same visual mold.
 */
function writingBody() {
  if (!existsSync(SUBSTACK_DATA_PATH)) {
    return '<div role="main"><h1>Writing</h1><p>Posts coming soon.</p></div>';
  }
  const data = JSON.parse(readFileSync(SUBSTACK_DATA_PATH, 'utf8'));
  const posts = (data && data.posts) || [];

  const itemsHtml = posts
    .map((p) => {
      const safeTitle = escapeHtml(p.title);
      const safeExcerpt = escapeHtml(p.excerpt);
      const safeSubtitle = p.subtitle ? escapeHtml(p.subtitle) : '';
      return `
      <article>
        <h2><a href="${escapeHtml(p.link)}">${safeTitle}</a></h2>
        <p><em>${escapeHtml(p.displayDate)}${safeSubtitle ? ' · ' + safeSubtitle : ''}</em></p>
        <p>${safeExcerpt}</p>
        <p><a href="${escapeHtml(p.link)}">Read on Substack →</a></p>
      </article>`;
    })
    .join('\n');

  const FALLBACK_STYLE = [
    'position: relative',
    'max-width: 720px',
    'margin: 0 auto',
    'padding: 3rem 1.5rem 6rem',
    'font-family: ui-serif, Georgia, "Times New Roman", serif',
    'font-size: 1rem',
    'line-height: 1.7',
    'color: #1a1a1a',
    'background: #ffffff',
  ].join('; ');

  return `<div role="main" style="${FALLBACK_STYLE};">
    <h1>Writing</h1>
    <p><em>Essays, letters, and updates by James Floyd. Mirrored from <a href="https://jamesfloyd.substack.com">jamesfloyd.substack.com</a>.</em></p>
    ${itemsHtml}
  </div>`;
}

/**
 * Replace a single tag in the HTML by matching its key attribute.
 * We use distinct regexes per tag so a malformed match in one doesn't
 * silently corrupt the whole file.
 */
/**
 * Inject the route's crawler-readable body summary as a HIDDEN sibling of
 * `<div id="root"></div>`. The element is `hidden` (display:none) so users
 * never see it during the brief moment before React mounts — but it stays
 * in the served HTML so crawlers, link unfurlers, and AI tools that parse
 * markup directly can index real content.
 *
 * Why a sibling instead of inside #root?
 *   - React's createRoot() replaces #root's children on mount. If our
 *     fallback lived there, on a slow network there'd be a visible flash
 *     of the fallback before React boots.
 *   - As a sibling marked hidden, it never renders, never flashes, and
 *     React's mount target stays clean.
 */
function injectBody(html, route) {
  if (!route.body) return html;
  const bodyHtml =
    route.body === '__DYNAMIC_WRITING__' ? writingBody() : route.body;
  const fallback = `<div id="seo-fallback" hidden aria-hidden="true">${bodyHtml}</div>`;
  // Match the empty <div id="root"></div> Vite ships with.
  const pattern = /<div\s+id="root"[^>]*>\s*<\/div>/;
  if (!pattern.test(html)) {
    console.warn(`  ! could not find <div id="root"></div> in template for ${route.path}`);
    return html;
  }
  return html.replace(pattern, `<div id="root"></div>${fallback}`);
}

function replaceMeta(html, route) {
  // Use the trailing-slash form for non-root URLs. GitHub Pages always
  // serves dist/<name>/index.html and 301-redirects /<name> → /<name>/.
  // If canonical + og:url + sitemap all point at /<name>, Google flags
  // a "redirect error" because the URL it's told to crawl redirects.
  // Pointing every URL at /<name>/ matches the served URL → no redirect.
  const url =
    SITE_URL + (route.path === '/' ? '/' : route.path.replace(/\/?$/, '/'));
  const fullTitle = `${route.title} | James Floyd`;
  const description = route.description;
  const ogImagePath = route.image || DEFAULT_OG_IMAGE;
  const ogImage = ogImagePath.startsWith('http') ? ogImagePath : SITE_URL + ogImagePath;

  const replacements = [
    [/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`],
    [
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(description)}">`,
    ],
    [
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${url}" />`,
    ],
    [
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${url}" />`,
    ],
    [
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    ],
    [
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
    ],
    [
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${ogImage}" />`,
    ],
    [
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${escapeHtml(fullTitle)}">`,
    ],
    [
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    ],
    [
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${ogImage}" />`,
    ],
  ];

  let out = html;
  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(out)) {
      console.warn(`  ! pattern not found in template: ${pattern}`);
      continue;
    }
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * Add `<link rel="preload" as="image" fetchpriority="high">` tags into <head>
 * for any route-specific above-the-fold imagery. Lets the browser begin the
 * fetch in parallel with the JS bundle download so React doesn't have to wait
 * on bitmaps to render the hero.
 */
function injectPreloads(html, route) {
  if (!route.preloadImages || route.preloadImages.length === 0) return html;
  const tags = route.preloadImages
    .map(
      (src) =>
        `<link rel="preload" as="image" href="${src}" fetchpriority="high" />`
    )
    .join('\n    ');
  return html.replace('</head>', `    ${tags}\n  </head>`);
}

function writeRoute(route, template) {
  let html = replaceMeta(template, route);
  html = injectPreloads(html, route);
  html = injectBody(html, route);
  const targetPath =
    route.path === '/'
      ? join(DIST, 'index.html')
      : join(DIST, route.path.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, html);
  const sizeKB = (html.length / 1024).toFixed(1);
  console.log(`  ✓ ${route.path} → ${targetPath.replace(DIST + '/', '')} (${sizeKB} kB)`);
}

function main() {
  const template = readFileSync(TEMPLATE_PATH, 'utf8');
  console.log(`Prerendering ${ROUTES.length} routes from ${TEMPLATE_PATH}`);

  for (const route of ROUTES) {
    writeRoute(route, template);
  }
  console.log(`Done. ${ROUTES.length} HTML files written.`);
}

main();
