

# Letter Page: Seamless Seal → Chat Transition + System Prompt Fix

## Changes

### 1. `src/pages/LetterPage.tsx` — Simplify to Two Phases

Remove the three-phase (`sealed`/`opening`/`chat`) system. Replace with a single continuous flow:

- **Phase 1 — Seal display**: When the page mounts, show the cream letter card with the wax seal centered on it. The seal fades in with a gentle pulse. After a **2-second auto-delay** (no click needed), the seal fades out.
- **Phase 2 — Chat**: The chat UI fades in **inside the same card** (no re-mount, no AnimatePresence swap). The card stays exactly as-is — same size, same position. The chat header, messages area, and input field fade in with a short opacity transition.

This eliminates all glitching because the letter card div never unmounts or re-animates. Only the *contents* crossfade.

Implementation:
- Single `motion.div` for the card, always rendered
- `showChat` boolean state, starts `false`, set to `true` after ~2s timeout on mount
- Seal content: `opacity` animates from 1→0 when `showChat` becomes true
- Chat content: `opacity` animates from 0→1 when `showChat` becomes true
- Both content layers are absolutely positioned inside the card so they overlap during crossfade
- The greeting typewriter plays immediately when chat appears, then transitions to the input-ready state

### 2. `src/pages/LetterPage.tsx` — Fix First Message Logic

- The first message "What are you wondering about James?" is shown client-side via TypewriterText, then added to `messages` state as an assistant message
- This message is **not sent to the edge function** — it's purely a UI greeting
- When the user sends their first message, only send `[{ role: 'user', content: '...' }]` to the edge function (the system prompt in the edge function already handles context)

### 3. `supabase/functions/letter-chat/index.ts` — Refine System Prompt

Update the system prompt to:
- Remove the instruction about opening with "What are you wondering about James?" (that's handled client-side now)
- Add instruction to keep responses brief (2-3 sentences typically, unless depth is warranted)
- Emphasize matching James's voice: calm, direct, systems-oriented

### Files Changed
- `src/pages/LetterPage.tsx` — rewrite phase logic to single-card crossfade
- `supabase/functions/letter-chat/index.ts` — trim system prompt's opening instruction

