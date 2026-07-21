# Read-aloud audio (narration in James's voice) — BUILT, HIDDEN pending quality

## Status
Fully built and working end-to-end, but **shelved** for now: the Listen buttons
are removed from the markup and the `/js/read-aloud.js` includes are gone. **The
audio files and the whole pipeline are kept, not deleted** — only the on-page UI
was pulled.

## Why it's hidden
Voice-quality concern: the neural voice (Kokoro "am_michael") can mispronounce
names — including "James Floyd" — which isn't acceptable on a site that
represents James. It needs a pronunciation pass before it goes live.

## What exists
- **`scripts/gen-audio.mjs`** — renders MP3s with Kokoro (voice `am_michael`) in
  Node: the Dear Reader letter, both rabbit-hole essays, and all Substack posts.
  Sentence-chunked, ASCII-sanitized, change-cached via `public/audio/<id>.sha1`.
  Run: `bun scripts/gen-audio.mjs` (add `--force` to regenerate). ~50 min for all.
- **`public/audio/*.mp3`** — the generated clips. `letter.mp3` + the two
  `essay-*.mp3` are committed; the 17 `substack-*.mp3` exist locally (untracked).
- **`site/js/read-aloud.js`** — a ~40-line MP3 player. A
  `<button data-audio="/audio/<id>.mp3">` plays it with play / pause. It's plain
  `<audio>`, so it works in **every** browser (Safari + iOS included) — no
  in-browser model, no phonemizer, no WebGPU.
- The `.read-aloud` button styles are still in `site/css/site.css` (unused for now).

## Why pre-generated instead of live in-browser
Kokoro's live in-browser TTS (`kokoro-js`) crashes in Safari — the phonemizer
module fails to load (a known, unfixed library bug). Pre-rendering to MP3
sidesteps it and works everywhere.

## To re-enable
1. Fix the pronunciation (below), then `bun scripts/gen-audio.mjs --force`.
2. Re-add `<script src="/js/read-aloud.js"></script>` just before `</body>` on
   `site/index.html`, `site/writing/index.html`, and in the
   `scripts/bake-rabbit-holes.mjs` page template.
3. Re-add the Listen buttons (they were removed from the markup). The button is:
   `<button class="read-aloud" type="button" data-audio="/audio/<ID>.mp3"
   aria-pressed="false" aria-label="Listen" hidden><span class="read-aloud__ico"
   aria-hidden="true">▶</span><span class="read-aloud__label">Listen</span></button>`
   - Home letter → `<ID>` = `letter`, placed after the `.home__letter` article.
   - Essays → `<ID>` = `essay-${slug}`, in the masthead (bake-rabbit-holes template).
   - Substack posts → `<ID>` = `substack-<slug>` (slug from the `/p/<slug>` link),
     inside each `.post-body` (fetch-substack `renderPostListHtml`).
4. `bun run build:site`, then commit `public/audio/*.mp3`.

## Fixing the name / pronunciation
- espeak (Kokoro's phonemizer) honors respelling: in `gen-audio.mjs`, before
  calling `generate()`, substitute a phonetic spelling for tricky words in the
  text fed to TTS only (leave the visible text untouched). Words to test:
  "James Floyd", "Yolo", "Keiretsu", "Sonder", "Fibe", "Alpha.School".
- Or audition other Kokoro voices at `/builds/voice-lab/` and pick one that
  says the name cleanly.
- Or use a premium TTS (ElevenLabs) with a pronunciation dictionary, rendered the
  same build-time way — it still plays back as a static MP3.
- Or record the letter / intro in James's actual voice for the showcase pages.

See also [[ai-search]].
