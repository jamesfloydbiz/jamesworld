#!/usr/bin/env bun
// Bake the notebook poems into the Poems grid on /writing.
//
// Source of truth is content/poems/*.txt — one transcribed poem per file,
// named "Poem NNN - Title.txt". Those files are the transcriptions of the
// handwritten pages in public/poems/; the ones that already had a scan on the
// page (and the ones James asked to keep off it) are simply not in the folder.
//
// Output goes between the markers inside <div class="poems-grid">, after the
// 28 hand-written cards. Those are curated — never touch them.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'content', 'poems');
const PAGE = join(ROOT, 'site', 'writing', 'index.html');
const BEGIN = '<!-- BEGIN_POEM_ARCHIVE -->';
const END = '<!-- END_POEM_ARCHIVE -->';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Transcription apparatus, not James's words: a struck-through word is one he
// removed, and [?] / [line] mark what the scan could not resolve. Everything
// else in the file is left exactly as transcribed.
function clean(raw) {
  let t = raw.replace(/\r\n/g, '\n');
  t = t.replace(/\[crossed out:[^\]]*\]/gi, '');
  t = t.replace(/\[crossed out\]/gi, '');
  t = t.replace(/\[\?\]/g, '');
  t = t.replace(/\[line\]/gi, '');
  t = t.replace(/\[margin notes:\]/gi, '');
  t = t.split('\n').map((l) => l.replace(/[ \t]+$/, '')).join('\n');
  // Scan noise: a stray single character alone on a line at the very top.
  const lines = t.split('\n');
  while (lines.length && /^[\s.\\,'c-]{0,2}$/.test(lines[0])) lines.shift();
  while (lines.length && !lines[0].trim()) lines.shift();
  // A date written in the corner of the page. Lift it out of the poem and onto
  // the card label rather than leaving it floating above the first line.
  let dated = '';
  if (lines.length && /^\s*(?:\w{3,9}\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*$/.test(lines[0])) {
    dated = lines.shift().trim().replace(/^(\w{3,9})\.?\s/, '$1 ');
    while (lines.length && !lines[0].trim()) lines.shift();
  }
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  return { text: lines.join('\n').replace(/\n{3,}/g, '\n\n'), dated };
}

// "Poem 097 - By moonlight I write (Feb 23, 2026).txt"
function parseName(file) {
  const m = /^Poem (\d{3}) - (.+)\.txt$/.exec(file);
  if (!m) return null;
  let title = m[2].replace(/\s+copy$/i, '').trim();
  let date = '';
  const d = /\s*\(([^)]*\d{4})\)\s*$/.exec(title);
  if (d) { date = d[1]; title = title.slice(0, d.index).trim(); }
  return { num: m[1], title, date };
}

function shorten(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:.\s]+$/, '') + '…';
}

// The cover quote: enough of the opening to know the poem by, not so much it
// overflows the square. Skip the rhyme-practice word lists some pages open
// with by starting at the first line that reads as a line of verse.
function excerpt(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  let i = lines.findIndex((l) => l.trim().split(/\s+/).length >= 4);
  if (i < 0) i = 0;
  let out = '';
  for (const l of lines.slice(i)) {
    const next = out ? out + ' ' + l.trim() : l.trim();
    if (next.length > 120) { out = next; break; }
    out = next;
  }
  return shorten(out, 120);
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.txt')).sort();
const cards = [];

for (const file of files) {
  const meta = parseName(file);
  if (!meta) continue;
  const { text, dated } = clean(readFileSync(join(SRC, file), 'utf8'));
  if (text.split(/\s+/).length < 8) continue;    // a fragment, not a poem
  const title = shorten(meta.title, 46);
  const label = meta.date || dated || 'From the notebooks';
  cards.push(
`          <details class="poem-card poem-card--text" data-poem="${meta.num}">
            <summary class="poem-card__summary">
              <div class="poem-card__cover">
                <span>"${esc(excerpt(text))}"</span>
                <em>${esc(label)}</em>
              </div>
              <p class="poem-card__title">${esc(title)}</p>
            </summary>
            <div class="poem-body">
              <div class="poem-lightbox__poem">${esc(text)}</div>
            </div>
          </details>`);
}

const html = readFileSync(PAGE, 'utf8');
const a = html.indexOf(BEGIN);
const b = html.indexOf(END);
if (a < 0 || b < 0) {
  console.error(`bake-poems: markers not found in ${PAGE}`);
  process.exit(1);
}
const next = html.slice(0, a + BEGIN.length) + '\n' + cards.join('\n') + '\n        ' + html.slice(b);
if (next !== html) writeFileSync(PAGE, next);
console.log(`bake-poems: ${cards.length} poems baked into the Poems grid`);
