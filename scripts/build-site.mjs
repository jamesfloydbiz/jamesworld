/**
 * Assemble the plain-HTML site into dist/.
 *
 *   1. Copy public/ → dist/    (images, logos, data, favicons, …)
 *   2. Copy site/   → dist/    (HTML pages; wins over same-name files from public/)
 *   3. Write dist/sitemap.xml  (from routes.config.mjs)
 *
 * Run after fetch-substack.mjs so the Substack JSON is already in public/data/.
 * The deploy workflow calls both in sequence via the build:site npm script.
 */

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES, SITE_URL } from './routes.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

cpSync(resolve(ROOT, 'public'), DIST, { recursive: true });
console.log('✓ copied public/');

cpSync(resolve(ROOT, 'site'), DIST, { recursive: true });
console.log('✓ copied site/');

const today = new Date().toISOString().slice(0, 10);
const urls = ROUTES.map((r) => {
  const loc = SITE_URL + (r.path === '/' ? '/' : r.path.replace(/\/?$/, '/'));
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`;
}).join('\n');
writeFileSync(
  resolve(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log(`✓ sitemap — ${ROUTES.length} routes`);
console.log('✓ dist/ ready');
