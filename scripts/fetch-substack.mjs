/**
 * Fetch James's Substack RSS feed at build time and write a structured
 * JSON file to public/data/substack-posts.json so the writing page can
 * fetch it at runtime.
 *
 * Substack's RSS schema is stable and well-formed XML — a small regex
 * parser is enough; no dependency on a full XML library.
 *
 * If the fetch fails (network blip on CI, Substack outage, etc.) we keep
 * the existing JSON file in place rather than breaking the build.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '..', 'public', 'data', 'substack-posts.json');
const WRITING_HTML = resolve(__dirname, '..', 'site', 'writing', 'index.html');

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

/**
 * Strip Substack editor artifacts that show up in the RSS but never appear
 * on the published post. The "Text within this block will maintain its
 * original spacing when published" placeholder is the biggest offender —
 * Substack inserts it as a hint inside their preformatted block editor.
 */
const SUBSTACK_ARTIFACTS = [
  /Text within this block will maintain its original spacing when published\.?/gi,
];

function stripSubstackArtifacts(html) {
  let out = html;
  for (const re of SUBSTACK_ARTIFACTS) out = out.replace(re, '');
  return out;
}

/**
 * Clean the raw <content:encoded> HTML into something we can safely render
 * inside the post modal. Removes Substack-specific UI cruft (subscribe
 * buttons, "Share" CTAs that point only to Substack, inline scripts, etc.)
 * while preserving the post's actual content.
 */
function sanitizeBodyHtml(html) {
  return stripSubstackArtifacts(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Substack's "Subscribe to my newsletter" inline CTA blocks
    .replace(/<div[^>]*class="[^"]*subscribe-widget[^"]*"[\s\S]*?<\/div>/gi, '')
    // Substack's "Share this post" inline CTAs
    .replace(/<div[^>]*class="[^"]*share-dialog[^"]*"[\s\S]*?<\/div>/gi, '')
    .trim();
}

/** Strip HTML tags and collapse whitespace into a plain-text excerpt. */
function plainText(html, max = EXCERPT_CHARS) {
  const stripped = stripSubstackArtifacts(html)
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
      bodyHtml: sanitizeBodyHtml(contentEncoded),
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
  console.log(`✓ wrote ${posts.length} Substack posts → public/data/substack-posts.json`);
  for (const p of posts.slice(0, 5)) {
    console.log(`  · ${p.displayDate} — ${p.title}`);
  }
  if (posts.length > 5) console.log(`  · …and ${posts.length - 5} more`);

  bakeWritingPage(posts);
}

// ──────────────────────────────────────────────────────────────────────────────
// Static HTML injection
// ──────────────────────────────────────────────────────────────────────────────
// /writing/ must serve the post list as real HTML so crawlers, AI tools, RSS
// readers, and screen readers see the content without running JS. We replace
// the section between BEGIN_POSTS / END_POSTS markers in site/writing/index.html
// with a freshly-rendered list of <li>s. Each item carries the full body HTML
// in a hidden <div> so the in-page modal can open without a runtime fetch.

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function decodeEntitiesPlain(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function renderPostListHtml(posts) {
  const lines = [];
  for (const p of posts) {
    const subtitleText = p.subtitle ? decodeEntitiesPlain(p.subtitle) : '';
    const excerptText = p.excerpt ? decodeEntitiesPlain(p.excerpt) : '';
    lines.push(`          <li class="post-list-item">`);
    lines.push(`            <button class="post-list-btn" type="button" data-link="${escAttr(p.link)}" data-date="${escAttr(p.displayDate)}"${subtitleText ? ` data-subtitle="${escAttr(subtitleText)}"` : ''}>`);
    lines.push(`              <h2 class="post-title">${escText(p.title)}</h2>`);
    lines.push(`              <p class="post-meta">${escText(p.displayDate)}${subtitleText ? ' · ' + escText(subtitleText) : ''}</p>`);
    lines.push(`              <p class="post-excerpt">${escText(excerptText)}</p>`);
    lines.push(`              <span class="post-cta">Read full post →</span>`);
    lines.push(`            </button>`);
    lines.push(`            <div class="post-body-html" hidden>${p.bodyHtml}</div>`);
    lines.push(`          </li>`);
  }
  return lines.join('\n');
}

function bakeWritingPage(posts) {
  if (!existsSync(WRITING_HTML)) {
    console.warn('  ! writing page not found, skipping bake');
    return;
  }
  const src = readFileSync(WRITING_HTML, 'utf8');
  const beginMarker = '<!-- BEGIN_POSTS — regenerated by scripts/fetch-substack.mjs; do not edit by hand. -->';
  const endMarker = '<!-- END_POSTS -->';
  const begin = src.indexOf(beginMarker);
  const end = src.indexOf(endMarker);
  if (begin < 0 || end < 0 || end <= begin) {
    console.warn('  ! BEGIN_POSTS/END_POSTS markers not found in writing/index.html — skipping bake');
    return;
  }
  const before = src.slice(0, begin + beginMarker.length);
  const after = src.slice(end);
  const baked = '\n' + renderPostListHtml(posts) + '\n        ';
  const next = before + baked + after;

  // Also keep data-post-count attribute in sync.
  const updated = next.replace(
    /<ul class="post-list" id="post-list" data-post-count="\d+">/,
    `<ul class="post-list" id="post-list" data-post-count="${posts.length}">`
  );

  writeFileSync(WRITING_HTML, updated);
  console.log(`✓ baked ${posts.length} posts → site/writing/index.html`);
}

main();
