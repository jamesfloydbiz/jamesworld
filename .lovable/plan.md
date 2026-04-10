

# Fix Letter Page: Single Persistent Card with Content Crossfade

## Problem
The letter page renders three separate `motion.div` cards inside `AnimatePresence mode="wait"` — one for sealed, one for opening, one for chat. Each phase unmounts the entire cream card and remounts a new one, causing visible flicker/disappearance between transitions.

## Solution
Use a **single persistent cream card** that never unmounts. Only the **inner contents** crossfade between phases.

### `src/pages/LetterPage.tsx` — Full rewrite of phase rendering

**Structure:**
- One `motion.div` card (always mounted, same size/position throughout)
- Inside it, use `showChat` boolean with a 2s auto-timer (no click needed)
- **Layer 1 (seal)**: Absolutely positioned, fades from opacity 1→0 when `showChat` turns true
- **Layer 2 (chat)**: Absolutely positioned beneath, fades from opacity 0→1 when `showChat` turns true
- Remove the `opening` phase entirely — no seal-crack animation, no `AnimatePresence mode="wait"`
- Remove `Phase` type, replace with single `showChat` boolean

**Greeting logic:**
- When chat fades in, `TypewriterText` plays "What are you wondering about James?"
- On complete, adds it to messages array as assistant message
- Only user messages after that get sent to the edge function

**Card mounting:**
- Card enters with a gentle `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` on page mount
- This matches what the LandingPage expansion animates toward — visual continuity

### `supabase/functions/letter-chat/index.ts`
- No changes needed (already updated in prior step)

### Files changed
- `src/pages/LetterPage.tsx` — rewrite to single persistent card with content crossfade

