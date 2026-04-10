

# Seamless Transitions from Landing Page

## Two Different Transitions

### "Learn About James" → Letter Chat
- On click, landing page text fades out quickly (~0.3s)
- The button itself morphs into a cream letter-shaped rectangle (~40% of viewport height, centered) on the black background
- The letter floats/scales into position from the button's original rect
- Background stays **black** the entire time
- Once the letter shape settles, navigate to `/letter` which mounts already showing the sealed letter with wax seal — visually continuous
- LetterPage redesign: black background, cream letter card (~40% viewport height, max-w-2xl) centered, wax seal on the card, chat opens within this same card

### "Quick Portfolio View" → Portfolio
- On click, landing page text fades out quickly (~0.3s)  
- The button expands to fill the entire viewport, color shifting from transparent → cream `#F5F0E8`
- Once fully expanded, navigate to `/portfolio` which mounts with its cream background — seamless blend
- Portfolio content then types/fades in naturally

## Files Changed

### `src/pages/LandingPage.tsx`
- Add `transitioning` state: `null | 'letter' | 'portfolio'`
- On button click, capture `getBoundingClientRect()`, set transitioning state
- `AnimatePresence` overlay with `motion.div`:
  - **Letter path**: button rect → centered letter shape (~40vh tall, ~max-w-2xl wide), bg shifts to cream `#F5F0E8`, surrounding area stays black. Navigate after ~0.8s
  - **Portfolio path**: button rect → `inset: 0` filling viewport, bg shifts to cream `#F5F0E8`. Navigate after ~0.8s
- Landing page content (title, subtitle, etc.) fades out when either transition starts

### `src/pages/LetterPage.tsx`
- Fix the broken UI: redesign so the page works end-to-end
- Black background with a centered cream letter card (not fullscreen cream)
- Letter card is ~40% viewport height, max-width ~640px
- Sealed state: wax seal centered on the cream card, no separate "break the seal" text — seal pulses gently as affordance
- Opening state: seal cracks on the card surface, card content transitions to chat
- Chat state: messages render inside the same cream card with scroll, input at bottom
- The card size matches what the landing page transition animates to, creating visual continuity

No new dependencies needed.

