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
    let pathname = new URL(req.url).pathname;

    // Directory → index.html
    if (pathname.endsWith('/')) pathname += 'index.html';

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
