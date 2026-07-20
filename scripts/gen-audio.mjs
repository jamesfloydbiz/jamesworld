/**
 * Pre-generate narration audio for the "big writings" in James's own chosen
 * voice (Kokoro TTS, "am_michael") — rendered here in Node, where Kokoro works
 * reliably, and saved as MP3s the site plays like any audio clip. This is the
 * cross-browser fix for read-aloud: no in-browser model, no phonemizer, no
 * WebGPU — so it works in Safari / iOS too.
 *
 *   bun scripts/gen-audio.mjs            # generate any missing / changed
 *   bun scripts/gen-audio.mjs --force    # regenerate everything
 *
 * Output: public/audio/<id>.mp3 (+ <id>.sha1 for change-detection).
 * IDs are deterministic from slugs, so the page wiring can reference them
 * without a manifest.
 */
import { KokoroTTS } from 'kokoro-js';
import { Mp3Encoder } from '@breezystack/lamejs';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'public', 'audio');
const FORCE = process.argv.includes('--force');
const VOICE = 'am_michael';
const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';

mkdirSync(OUT, { recursive: true });

// ── Text extraction ──────────────────────────────────────────────────────
function htmlToText(html) {
  return html
    .replace(/<span class="rh-section__date">[\s\S]*?<\/span>/g, ' ')     // drop timeline date labels
    .replace(/<(script|style|template)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<div class="image-gallery-embed"[\s\S]*?<\/div>/g, ' ')      // Substack image galleries
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#8217;|&rsquo;/g, '’').replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8212;|&mdash;/g, '—').replace(/&#8230;|&hellip;/g, '…')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s*\/(?=[a-z])/gi, ' ')      // read "/portfolio" as "portfolio"
    // Sanitize to clean ASCII — the espeak phonemizer crashes (uncatchably)
    // on emoji / unusual unicode. Map the common typographic chars, drop the rest.
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, ', ')      // en/em dash → a spoken pause
    .replace(/…/g, '...')
    .replace(/[ ]/g, ' ')
    .replace(/[^\x20-\x7e]/g, ' ')         // strip everything else non-ASCII
    .replace(/\s+/g, ' ').trim();
}

function gatherWritings() {
  const list = [];

  // 1. Home "Dear Reader" letter
  const home = readFileSync(resolve(ROOT, 'site', 'index.html'), 'utf8');
  const letterM = home.match(/<article class="home__letter">([\s\S]*?)<\/article>/);
  if (letterM) list.push({ id: 'letter', text: htmlToText(letterM[1]) });

  // 2. Rabbit-hole essays — concat their .rh-section blocks
  const rhDir = resolve(ROOT, 'site', 'writing', 'rabbit-holes');
  for (const slug of readdirSync(rhDir)) {
    const file = resolve(rhDir, slug, 'index.html');
    if (!existsSync(file)) continue;
    const html = readFileSync(file, 'utf8');
    const sections = html.match(/<section[^>]*class="rh-section"[\s\S]*?<\/section>/g) || [];
    const text = sections.map(htmlToText).join(' ');
    if (text) list.push({ id: 'essay-' + slug, text });
  }

  // 3. Substack posts (the big writings)
  const jsonPath = resolve(ROOT, 'public', 'data', 'substack-posts.json');
  if (existsSync(jsonPath)) {
    const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
    const posts = Array.isArray(data) ? data : (data.posts || []);
    for (const p of posts) {
      const slug = (p.link || '').split('/p/')[1] || '';
      if (!slug || !p.bodyHtml) continue;
      const text = htmlToText(p.bodyHtml);
      if (text.length > 40) list.push({ id: 'substack-' + slug.replace(/[^a-z0-9-]/gi, ''), text });
    }
  }
  return list;
}

// ── Chunking (Kokoro caps at ~510 tokens; keep chunks well under) ──────────
function chunkText(text) {
  const parts = text.match(/[^.!?]+[.!?]*/g) || [text];
  const chunks = [];
  let buf = '';
  for (let s of parts) {
    s = s.trim();
    if (!s) continue;
    if ((buf + ' ' + s).length > 400) { if (buf) chunks.push(buf); buf = s; }
    else { buf = buf ? buf + ' ' + s : s; }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

// ── Float32 PCM → MP3 (lamejs) ─────────────────────────────────────────────
function pcmToMp3(float32, sampleRate) {
  const i16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    i16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const enc = new Mp3Encoder(1, sampleRate, 96);
  const block = 1152;
  const out = [];
  for (let i = 0; i < i16.length; i += block) {
    const buf = enc.encodeBuffer(i16.subarray(i, i + block));
    if (buf.length) out.push(Buffer.from(buf));
  }
  const end = enc.flush();
  if (end.length) out.push(Buffer.from(end));
  return Buffer.concat(out);
}

// ── Main ───────────────────────────────────────────────────────────────────
// Load the model and warm up the phonemizer FIRST, immediately after import —
// the espeak WASM init is fragile and rejects fatally if other synchronous work
// (like reading files) runs before the first generate. This mirrors the order
// that works reliably.
console.error('[gen] loading Kokoro model…');
const tts = await KokoroTTS.from_pretrained(MODEL, { dtype: 'q8', device: 'cpu' });
await tts.generate('Warming up the voice.', { voice: VOICE });
console.error('[gen] model + phonemizer ready');

const writings = gatherWritings();
console.error(`[gen] gathered ${writings.length} writings: ${writings.map(w => w.id).join(', ')}`);
console.log(`Found ${writings.length} writings to consider.`);

for (const w of writings) {
  const mp3Path = resolve(OUT, w.id + '.mp3');
  const hashPath = resolve(OUT, w.id + '.sha1');
  const hash = createHash('sha1').update(w.text).digest('hex');
  if (!FORCE && existsSync(mp3Path) && existsSync(hashPath) && readFileSync(hashPath, 'utf8') === hash) {
    console.log(`· skip ${w.id} (unchanged)`);
    continue;
  }
  const chunks = chunkText(w.text);
  const t0 = Date.now();
  const buffers = [];
  let sr = 24000;
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (!/[a-z]/i.test(c)) continue;   // phonemizer chokes on letterless chunks
    try {
      const a = await tts.generate(c, { voice: VOICE });
      sr = a.sampling_rate;
      buffers.push(a.audio);
    } catch (e) {
      console.log(`\n  ! ${w.id} chunk ${i} skipped (${e.message}): "${c.slice(0, 50)}"`);
    }
    process.stderr.write(`\r  ${w.id}: chunk ${i + 1}/${chunks.length}   `);
  }
  if (!buffers.length) { console.log(`\n  ! ${w.id}: no audio generated, skipping`); continue; }
  const total = buffers.reduce((n, a) => n + a.length, 0);
  const merged = new Float32Array(total);
  let off = 0;
  for (const a of buffers) { merged.set(a, off); off += a.length; }
  const mp3 = pcmToMp3(merged, sr);
  writeFileSync(mp3Path, mp3);
  writeFileSync(hashPath, hash);
  const secs = (total / sr).toFixed(0);
  console.log(`\r✓ ${w.id} — ${secs}s audio, ${(mp3.length / 1024).toFixed(0)}KB, gen ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
console.log('Done.');
