/**
 * Build an Obsidian vault from everything published on jamesfloyds.world.
 *
 * Sources, all of which already hold full text — nothing is scraped:
 *   content/rabbit-holes/*.md              the long essays
 *   public/data/substack-posts.json        bodyHtml
 *   public/data/linkedin-posts.json        text
 *
 * The point of the vault is the linking layer: which pieces share a topic, a
 * person, or — the interesting one — the same story told again. Those edges
 * come from `_index/dictionary.md`, which this script seeds once and then
 * never touches, so corrections survive regeneration.
 *
 * SAFETY: Pieces/, Topics/, People & Sources/, Stories/ and _index/Everything.md
 * plus _index/Candidates.md are fully regenerated every run. Notes/, README.md
 * and _index/dictionary.md are never written after they first exist. Running
 * twice must produce a byte-identical tree.
 *
 * Usage: bun run vault
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = process.env.VAULT_DIR
  || join(homedir(), 'Library/Mobile Documents/com~apple~CloudDocs/Writing Vault');

const GENERATED = ['Pieces', 'Topics', 'People & Sources', 'Stories'];
const SUBSTANTIAL = 500;   // characters — the line between a post and a one-liner
const MIN_PIECES  = 2;     // a hub note needs at least two pieces; one is noise

/* ── helpers ─────────────────────────────────────────────────────────── */

const ENT = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&apos;': "'", '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–',
  '&hellip;': '…', '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“',
  '&rdquo;': '”', '&eacute;': 'é', '&egrave;': 'è', '&uuml;': 'ü',
};
function decode(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&[a-zA-Z]+;|&#39;/g, (m) => (m in ENT ? ENT[m] : m));
}

/* Substack bodies are HTML. Links become markdown links rather than being
   thrown away — a vault is more useful with the citations intact. */
function htmlToText(html) {
  return decode(
    String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
               (_, href, txt) => `[${txt.replace(/<[^>]+>/g, '').trim()}](${href})`)
      .replace(/<[^>]+>/g, '')
  ).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* Obsidian resolves a [[wikilink]] by basename, so the basename has to be both
   filesystem-safe and unique across the whole vault. */
function safeName(s, max = 70) {
  let out = String(s)
    .replace(/[\/\\:*?"<>|#^\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, max)
    .trim();
  return out || 'untitled';
}
const used = new Set();
function uniqueName(base, hint) {
  let n = base;
  if (used.has(n.toLowerCase()) && hint) n = `${base} (${hint})`;
  let i = 2;
  while (used.has(n.toLowerCase())) n = `${base} (${i++})`;
  used.add(n.toLowerCase());
  return n;
}
const yamlStr = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
const wordCount = (s) => (String(s).trim().match(/\S+/g) || []).length;

function writeFile(p, body) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body.replace(/\n{3,}$/, '\n'));
}

/* ── the dictionary ──────────────────────────────────────────────────── */

const DICT_PATH = join(VAULT, '_index', 'dictionary.md');

const DICT_SEED = `# Dictionary

This is the only file that decides what links to what, and it is **yours to
edit**. The generator seeds it once and never writes to it again, so anything
you change here survives \`bun run vault\`.

Format — one entry per line, under the section that says what kind it is:

    - Display Name :: pattern | another pattern

Matching is case-insensitive and anchored to word boundaries, so \`boba\` cannot
match inside another word. A hub note is only created once **${MIN_PIECES} or more**
pieces match; a single hit is a coincidence, not a pattern. Phrases that hit
once, and common phrases you have not claimed yet, are listed in
[[Candidates]] so you can promote them.

## Stories

- The Sonder Series :: sonder
- Jets & Capital :: jets and capital | jets & capital
- BetterWealth :: betterwealth | better wealth
- The 300 bobas :: boba
- The Climbing Machine :: climbing machine
- Cutting 13 inches of hair :: 13" of | 13 inches of hair | donate my hair
- Pickup soccer :: pickup soccer | sternberg
- Door-to-door and the pier :: door.to.door | knocking doors | the pier
- Fibe Fellowship :: fibe
- The Quarter Life Crisis :: quarter life crisis | qlc
- SXSW :: sxsw
- Monthly update letters :: monthly update email | dear reader

## Topics

- Education :: education | schooling | classroom | curriculum
- Learning Science :: learning science | spaced repetition | retrieval practice | cognitive load
- Motivation :: motivation | mentor mindset | growth mindset
- Sales :: sales | selling | cold call | objection
- Content & Audience :: content creator | organic youtube | seo | audience
- Podcasting :: podcast | interview | episode
- Money & Investing :: aum | portfolio | compounding | life insurance
- Building & Shipping :: shipped | built it | prototype | webflow | lovable
- Community & Events :: potluck | field day | gathering | meetup
- Travel :: nashville | miami | vegas | austin | grand canyon | phoenix | kansas city

## People & Sources

- Alpha School :: alpha school
- Founders School :: founders school
- Maria Montessori :: montessori
- David Yeager :: yeager | 10 to 25
- Andrew Yeung :: andrew yeung
- Sam Parr :: sam parr
- Alex Banayan :: banayan
- Adam Grant :: adam grant
- Steve Jobs :: steve jobs
- Elon Musk :: elon musk
- Jay Yang :: jay yang
- Naval :: naval
- New York City :: nyc | new york | brooklyn
- Forbes :: forbes
`;

function loadDictionary() {
  if (!existsSync(DICT_PATH)) writeFile(DICT_PATH, DICT_SEED);
  const txt = readFileSync(DICT_PATH, 'utf8');
  const KINDS = { 'stories': 'story', 'topics': 'topic', 'people & sources': 'person' };
  const out = [];
  let kind = null;
  for (const raw of txt.split('\n')) {
    const h = /^##\s+(.+?)\s*$/.exec(raw);
    if (h) { kind = KINDS[h[1].trim().toLowerCase()] || null; continue; }
    if (!kind) continue;
    const m = /^\s*-\s+(.+?)\s*::\s*(.+?)\s*$/.exec(raw);
    if (!m) continue;
    const patterns = m[2].split('|').map((p) => p.trim()).filter(Boolean);
    if (!patterns.length) continue;
    out.push({
      kind,
      name: m[1].trim(),
      // Word-boundary anchored so a short pattern cannot match inside a word.
      re: new RegExp('(?<![\\p{L}\\p{N}])(?:' +
            patterns.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, (c) => (c === '.' ? '.' : '\\' + c))).join('|') +
          ')(?![\\p{L}\\p{N}])', 'iu'),
    });
  }
  return out;
}

/* ── read the corpus ─────────────────────────────────────────────────── */

function gitAddedDate(file) {
  try {
    return execSync(`git log --diff-filter=A --format=%ad --date=short -1 -- "${file}"`,
                    { cwd: ROOT, encoding: 'utf8' }).trim() || null;
  } catch { return null; }
}

function readCorpus() {
  const pieces = [];

  for (const f of readdirSync(join(ROOT, 'content/rabbit-holes')).filter((x) => x.endsWith('.md')).sort()) {
    const slug = f.replace(/\.md$/, '');
    const body = readFileSync(join(ROOT, 'content/rabbit-holes', f), 'utf8').trim();
    pieces.push({
      source: 'rabbit-hole', folder: 'Pieces/Rabbit Holes',
      title: body.split('\n')[0].trim() || slug,
      slug, body,
      date: gitAddedDate(`content/rabbit-holes/${f}`),
      url: `https://jamesfloyds.world/writing/rabbit-holes/${slug}/`,
      curated: true,
    });
  }

  for (const p of JSON.parse(readFileSync(join(ROOT, 'public/data/substack-posts.json'), 'utf8')).posts) {
    pieces.push({
      source: 'substack', folder: 'Pieces/Substack',
      title: decode(p.title), body: htmlToText(p.bodyHtml),
      subtitle: p.subtitle ? decode(p.subtitle) : '',
      date: (p.date || '').slice(0, 10), url: p.link, curated: true,
    });
  }

  for (const p of JSON.parse(readFileSync(join(ROOT, 'public/data/linkedin-posts.json'), 'utf8')).posts) {
    const text = (p.text || '').trim();
    pieces.push({
      source: 'linkedin', folder: 'Pieces/LinkedIn',
      title: decode((p.hook || text.split('\n')[0] || p.id).trim()),
      body: text, date: p.date, url: p.url,
      curated: !!p.curated, id: p.id,
    });
  }

  return pieces;
}

/* ── build ───────────────────────────────────────────────────────────── */

function build() {
  const dict = loadDictionary();
  const pieces = readCorpus();

  for (const d of GENERATED) rmSync(join(VAULT, d), { recursive: true, force: true });

  // name every piece first, so links can point at names that definitely exist
  for (const p of pieces) {
    p.note = uniqueName(safeName(p.title), p.source === 'linkedin' ? p.date : p.source);
    p.chars = p.body.length;
    p.substantial = p.chars >= SUBSTANTIAL;
    p.words = wordCount(p.body);
    p.hits = dict.filter((e) => e.re.test(p.body) || e.re.test(p.title));
  }

  const hubs = new Map();
  for (const p of pieces) {
    for (const h of p.hits) {
      if (!hubs.has(h.name)) hubs.set(h.name, { kind: h.kind, name: h.name, pieces: [] });
      hubs.get(h.name).pieces.push(p);
    }
  }
  // one hit is a coincidence; drop it back to Candidates
  const weak = [...hubs.values()].filter((h) => h.pieces.length < MIN_PIECES);
  for (const h of weak) hubs.delete(h.name);
  const live = new Set(hubs.keys());
  for (const p of pieces) p.hits = p.hits.filter((h) => live.has(h.name));

  const FOLDER = { story: 'Stories', topic: 'Topics', person: 'People & Sources' };
  for (const h of hubs.values()) h.note = uniqueName(safeName(h.name), h.kind);

  /* piece notes */
  for (const p of pieces) {
    const by = (k) => p.hits.filter((h) => h.kind === k).map((h) => `[[${hubs.get(h.name).note}]]`);
    const fm = [
      '---',
      `title: ${yamlStr(p.title)}`,
      `source: ${p.source}`,
      p.date ? `date: ${p.date}` : null,
      p.url ? `url: ${p.url}` : null,
      `curated: ${p.curated}`,
      `substantial: ${p.substantial}`,
      `words: ${p.words}`,
      `tags: [${['writing', p.source, p.substantial ? 'substantial' : 'short'].join(', ')}]`,
      '---',
    ].filter(Boolean).join('\n');

    const conn = [
      by('story').length  ? `Stories: ${by('story').join(' · ')}` : null,
      by('topic').length  ? `Topics: ${by('topic').join(' · ')}` : null,
      by('person').length ? `People: ${by('person').join(' · ')}` : null,
    ].filter(Boolean);

    writeFile(join(VAULT, p.folder, `${p.note}.md`),
      `${fm}\n\n# ${p.title}\n` +
      (p.subtitle ? `\n*${p.subtitle}*\n` : '') +
      `\n${p.body}\n` +
      (conn.length ? `\n---\n\n## Connections\n${conn.join('\n')}\n` : '') +
      (p.url ? `\n[Read it where it was published](${p.url})\n` : ''));
  }

  /* hub notes */
  for (const h of hubs.values()) {
    const list = [...h.pieces].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    const bySource = list.reduce((m, p) => (m[p.source] = (m[p.source] || 0) + 1, m), {});
    const spread = Object.entries(bySource).map(([k, v]) => `${v} ${k}`).join(', ');
    const dates = list.map((p) => p.date).filter(Boolean).sort();
    const verb = h.kind === 'story' ? 'Told' : 'Appears in';
    writeFile(join(VAULT, FOLDER[h.kind], `${h.note}.md`),
      `---\ntype: ${h.kind}\npieces: ${list.length}\ntags: [hub, ${h.kind}]\n---\n\n` +
      `# ${h.name}\n\n` +
      `${verb} ${list.length} times — ${spread}.` +
      (dates.length > 1 ? ` First ${dates[0]}, most recent ${dates[dates.length - 1]}.` : '') + '\n\n' +
      `## ${h.kind === 'story' ? 'Every time you have told it' : 'Every piece it turns up in'}\n` +
      list.map((p) => `- ${p.date || '—'} · [[${p.note}]] · ${p.source}`).join('\n') + '\n');
  }

  /* indexes */
  const byDate = [...pieces].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  writeFile(join(VAULT, '_index', 'Everything.md'),
    `---\ntags: [hub, index]\n---\n\n# Everything\n\n` +
    `${pieces.length} published pieces, ${pieces.reduce((n, p) => n + p.words, 0).toLocaleString()} words.\n\n` +
    byDate.map((p) => `- ${p.date || '—'} · [[${p.note}]] · ${p.source}${p.substantial ? '' : ' · short'}`).join('\n') + '\n');

  const claimed = new Set(dict.flatMap((e) => [e.name]));
  writeFile(join(VAULT, '_index', 'Candidates.md'),
    `---\ntags: [index]\n---\n\n# Candidates\n\n` +
    `Things that looked like they might be worth a hub note but are not in ` +
    `[[dictionary]] yet, or matched only one piece. Promote anything useful by ` +
    `adding a line to the dictionary and re-running \`bun run vault\`.\n\n` +
    `## Matched only one piece\n` +
    (weak.length ? weak.map((h) => `- ${h.name} — ${h.pieces[0].note}`).join('\n') : '- none') + '\n\n' +
    `## Frequent capitalised phrases not yet claimed\n` +
    candidates(pieces, claimed).map(([s, c]) => `- ${s} — ${c} pieces`).join('\n') + '\n');

  return { pieces, hubs, weak };
}

/* Mid-sentence capitalised phrases: requiring a lowercase word before the
   phrase is what keeps sentence-openers like "Basically" out of the list. */
function candidates(pieces, claimed) {
  const re = /[a-z,]\s+([A-Z][a-zA-Z'’]{2,}(?:\s+(?:of|the|and|de|&)\s+[A-Z][a-zA-Z'’]{2,}|\s+[A-Z][a-zA-Z'’]{2,}){0,3})/g;
  const df = new Map();
  for (const p of pieces) {
    const seen = new Set();
    for (const m of p.body.matchAll(re)) seen.add(m[1].trim());
    for (const s of seen) df.set(s, (df.get(s) || 0) + 1);
  }
  const SKIP = /^(I'm|I've|I'll|I'd|The|What|Here|There|Now|And|For|When|Why|How|You|They|These|This|That|But|So|My|Last|Next|Also|Then|Even|Just|Still|Because|While|Since|After|Before|Basically|Sometimes|Everyone|Family|Right|Built|Focus|Help|Helped|Taken|Request|Update|Reader|Reflection|Story|Content|Energy|Day|Social|Smile|Who|From|Lastly|American|America|Its|It's)$/i;
  return [...df.entries()]
    .filter(([s, c]) => c >= 3 && !SKIP.test(s) && ![...claimed].some((n) => n.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(n.toLowerCase())))
    .sort((a, b) => b[1] - a[1]).slice(0, 40);
}

/* ── go ──────────────────────────────────────────────────────────────── */

mkdirSync(join(VAULT, 'Notes'), { recursive: true });
const README = join(VAULT, 'README.md');
if (!existsSync(README)) {
  writeFile(README, `# Writing Vault

Everything published on jamesfloyds.world, as one connected set of notes.

Regenerate with \`bun run vault\` from the jamesworld repo.

**Regenerated every run — do not hand-edit:**
Pieces/ · Topics/ · People & Sources/ · Stories/ · _index/Everything.md · _index/Candidates.md

**Yours, never touched:**
Notes/ · README.md · _index/dictionary.md

Start at [[Everything]], or open the graph. The interesting notes are in
Stories/ — each one lists every time you have told that story.
`);
}

const { pieces, hubs, weak } = build();
const n = (s) => pieces.filter((p) => p.source === s).length;
console.log(`✓ vault → ${VAULT}`);
console.log(`  ${pieces.length} pieces — ${n('rabbit-hole')} rabbit holes, ${n('substack')} substack, ${n('linkedin')} linkedin`);
console.log(`  ${pieces.filter((p) => p.curated).length} curated, ${pieces.filter((p) => p.substantial).length} substantial`);
const k = (x) => [...hubs.values()].filter((h) => h.kind === x).length;
console.log(`  ${hubs.size} hubs — ${k('story')} stories, ${k('topic')} topics, ${k('person')} people`);
console.log(`  ${weak.length} single-hit entries sent to Candidates`);
