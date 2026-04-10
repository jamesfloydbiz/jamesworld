

# Fade In the Wax Seal on Mount

## Problem
The seal layer starts with `initial={{ opacity: 1 }}`, so it appears instantly when the page loads — no smooth entrance.

## Solution
In `src/pages/LetterPage.tsx`, change the seal layer's `initial` to `{{ opacity: 0 }}` and update the `animate` to fade to `1` initially, then to `0` when `showChat` becomes true. Also extend the auto-timer slightly (from 2s to ~3s) to give the seal time to fade in before it fades out.

Specifically:
- Seal layer: `initial={{ opacity: 0 }}`, `animate={{ opacity: showChat ? 0 : 1 }}` — this fades it in on mount, then out when chat takes over
- Bump the auto-transition timeout from `2000` to `3000` ms so the seal is visible for ~2s after its ~0.8s fade-in

### File changed
- `src/pages/LetterPage.tsx` — two small edits (seal initial opacity + timer delay)

