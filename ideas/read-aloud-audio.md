# Read-aloud audio (narration in James's voice) — BUILT, HIDDEN pending quality

## Status
Fully built and working end-to-end, but the UI is **hidden** for now. The Listen
buttons are taken out of view (the `/js/read-aloud.js` script includes were
removed from the home page, the writing page, and the rabbit-hole bake template,
so the hidden buttons are never revealed). **The audio files are kept, not
deleted.**

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
- Hidden Listen buttons are still baked into the home letter, the essays, and each
  Substack post (they carry `hidden` and are only shown by `read-aloud.js`).

## Why pre-generated instead of live in-browser
Kokoro's live in-browser TTS (`kokoro-js`) crashes in Safari — the phonemizer
module fails to load (a known, unfixed library bug). Pre-rendering to MP3
sidesteps it and works everywhere.

## To re-enable
1. Fix the pronunciation (below), then `bun scripts/gen-audio.mjs --force`.
2. Re-add `<script src="/js/read-aloud.js"></script>` just before `</body>` on:
   `site/index.html`, `site/writing/index.html`, and in
   `scripts/bake-rabbit-holes.mjs` (the page template, before `</body>`).
3. `bun run build:site`, then commit `public/audio/*.mp3`.

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
