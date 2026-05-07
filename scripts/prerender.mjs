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

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES, SITE_URL, DEFAULT_OG_IMAGE } from './routes.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const TEMPLATE_PATH = join(DIST, 'index.html');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Replace a single tag in the HTML by matching its key attribute.
 * We use distinct regexes per tag so a malformed match in one doesn't
 * silently corrupt the whole file.
 */
function replaceMeta(html, route) {
  const url = SITE_URL + route.path;
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

function writeRoute(route, template) {
  const html = replaceMeta(template, route);
  const targetPath =
    route.path === '/'
      ? join(DIST, 'index.html')
      : join(DIST, route.path.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, html);
  console.log(`  ✓ ${route.path} → ${targetPath.replace(DIST + '/', '')}`);
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
