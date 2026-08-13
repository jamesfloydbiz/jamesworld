#!/usr/bin/env bun
/* Serves the plain-HTML site/  directory with public/ as fallback for assets.
   Usage: bun scripts/serve-site.mjs  (port 3000) */

import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const PORT = 3000;
const ROOT_SITE   = join(fileURLToPath(import.meta.url), '../../site');
const ROOT_PUBLIC = join(fileURLToPath(import.meta.url), '../../public');

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.svg':   'image/svg+xml',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.png':   'image/png',
  '.webp':  'image/webp',
  '.ico':   'image/x-icon',
  '.mp3':   'audio/mpeg',
  '.json':  'application/json',
  '.xml':   'application/xml; charset=utf-8',
  '.txt':   'text/plain; charset=utf-8',
};

async function tryRead(filePath) {
  try { await stat(filePath); return await readFile(filePath); }
  catch { return null; }
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    // pathname arrives percent-encoded, so a file with a space in its name
    // ("Ep. 082.jpeg") would be looked up as "Ep.%20082.jpeg" and 404 locally
    // even though it serves fine in production. Decode before touching disk.
    let pathname = new URL(req.url).pathname;
    try { pathname = decodeURIComponent(pathname); } catch { /* leave as-is */ }

    // Directory → index.html. GitHub Pages redirects "/alpha" to "/alpha/"
    // on its own; locally the bare path just 404'd, so previews disagreed
    // with production. Treat any extensionless path as a directory too.
    if (pathname.endsWith('/')) pathname += 'index.html';
    else if (!extname(pathname)) pathname += '/index.html';

    const ext = extname(pathname).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    // Try site/ first, then public/
    let body = await tryRead(join(ROOT_SITE, pathname));
    if (!body) body = await tryRead(join(ROOT_PUBLIC, pathname));

    if (body) return new Response(body, { headers: { 'Content-Type': mime } });

    // 404 → serve site/404.html if it exists
    const notFound = await tryRead(join(ROOT_SITE, '404.html'))
      || await tryRead(join(ROOT_PUBLIC, '404.html'));
    return new Response(notFound || 'Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
});

console.log(`Site preview → http://localhost:${PORT}`);
