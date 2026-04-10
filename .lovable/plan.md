

# Fix Landing → Letter Transition Gap

## Problem
When navigating from LandingPage to LetterPage, the expanding cream overlay unmounts with the page, then LetterPage mounts its own card with a fade-in animation (`opacity: 0, y: 20`). This creates a visible flash/gap. Additionally, the dimensions don't match — the overlay animates to `min(70vh, 600px)` tall but the LetterPage card is `min(40vh, 460px)`.

## Solution
Two small changes to make the handoff seamless:

### `src/pages/LetterPage.tsx`
- Change the card's `initial` to `{{ opacity: 1, y: 0 }}` (or use `initial={false}`) — the card should appear instantly at full opacity since the LandingPage overlay already provided the visual entrance
- Match the card height to the overlay: change `min(40vh, 460px)` → `min(70vh, 600px)` so dimensions align exactly

### `src/pages/LandingPage.tsx`  
- No changes needed — overlay dimensions and styling already match

This way the cream rectangle the user sees on LandingPage is pixel-identical to the one that appears on LetterPage. No gap, no flash.

### Files changed
- `src/pages/LetterPage.tsx` — remove mount animation, match overlay dimensions

