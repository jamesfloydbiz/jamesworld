/**
 * Generate dist/sitemap.xml from routes.config.mjs.
 * Runs after vite build so the sitemap always matches the routes that
 * actually got prerendered.
 */

import { writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES, SITE_URL } from './routes.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map((route) => {
    const loc = SITE_URL + (route.path === '/' ? '/' : route.path);
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function main() {
  const xml = buildSitemap();
  const target = join(DIST, 'sitemap.xml');
  writeFileSync(target, xml);
  console.log(`✓ wrote sitemap with ${ROUTES.length} routes → ${target.replace(DIST + '/', '')}`);
}

main();
