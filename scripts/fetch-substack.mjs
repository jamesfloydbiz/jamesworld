/**
 * Fetch James's Substack RSS feed at build time and write a structured
 * JSON file (src/data/substack-posts.json) so the React app + the prerender
 * script can both consume it.
 *
 * Substack's RSS schema is stable and well-formed XML — a small regex
 * parser is enough; no dependency on a full XML library.
 *
 * If the fetch fails (network blip on CI, Substack outage, etc.) we keep
 * the existing JSON file in place rather than breaking the build.
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '..', 'src', 'data', 'substack-posts.json');

const FEED_URL = 'https://jamesfloyd.substack.com/feed';
const EXCERPT_CHARS = 240;

/** Strip CDATA wrappers and trim. */
function unwrapCdata(s) {
  if (!s) return '';
  return s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

/** Pull the first matching tag's text (handles CDATA). */
function extractTag(block, tag) {
  // Match <tag>...</tag> or <tag ...>...</tag>, including CDATA.
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = block.match(re);
  if (!m) return '';
  return unwrapCdata(m[1]);
}

/** Pull URL-only attribute (e.g. <enclosure url="..."/>). */
function extractAttr(block, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}="([^"]*)"`, 'i');
  const m = block.match(re);
  return m ? m[1] : '';
}

/** Strip HTML tags and collapse whitespace into a plain-text excerpt. */
function plainText(html, max = EXCERPT_CHARS) {
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= max) return stripped;
  // Cut at a word boundary, then add ellipsis.
  const cut = stripped.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut) + '…';
}

/** Parse the feed XML into a list of post objects. */
function parseFeed(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const description = extractTag(block, 'description');
    const pubDateRaw = extractTag(block, 'pubDate');
    const contentEncoded = extractTag(block, 'content:encoded');
    const enclosureUrl = extractAttr(block, 'enclosure', 'url');

    const isoDate = pubDateRaw ? new Date(pubDateRaw).toISOString() : '';
    const displayDate = isoDate
      ? new Date(isoDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

    const excerpt = plainText(contentEncoded || description);

    items.push({
      title,
      link,
      date: isoDate,
      displayDate,
      subtitle: plainText(description, 160),
      excerpt,
      coverImage: enclosureUrl || null,
    });
  }
  return items;
}

async function main() {
  let xml;
  try {
    const res = await fetch(FEED_URL, {
      headers: { 'user-agent': 'jamesfloyds.world build bot' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.warn(`  ! fetch failed (${err.message}). Keeping existing data.`);
    if (!existsSync(OUT_PATH)) {
      // First run with no cache and a fetch failure — emit an empty array
      // so the build doesn't blow up downstream.
      mkdirSync(dirname(OUT_PATH), { recursive: true });
      writeFileSync(OUT_PATH, JSON.stringify({ posts: [], fetchedAt: null }, null, 2));
      console.log(`  wrote empty posts file → ${OUT_PATH}`);
    }
    return;
  }

  const posts = parseFeed(xml);
  const out = {
    fetchedAt: new Date().toISOString(),
    posts,
  };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`✓ wrote ${posts.length} Substack posts → src/data/substack-posts.json`);
  for (const p of posts.slice(0, 5)) {
    console.log(`  · ${p.displayDate} — ${p.title}`);
  }
  if (posts.length > 5) console.log(`  · …and ${posts.length - 5} more`);
}

main();
