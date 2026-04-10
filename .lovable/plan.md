# Letter Chat: Replace Map with AI Correspondence

## What We're Building

Replace the "Explore the Map" path with an immersive AI chat experience styled as physical mail correspondence. The user clicks a sealed letter (black wax seal with your JF logo), watches it open with a satisfying animation, and then chats with an AI inside a letter-formatted window. The AI types responses with a typewriter effect and always opens with *"What are you wondering about James?"*

## User Experience Flow

```text
Landing Page
  └─ "Open the Letter" button (replaces "Explore the Map")
       └─ /letter route
            ├─ Sealed envelope with black wax seal (your logo)
            ├─ Click seal → seal cracks, envelope unfolds
            ├─ Letter paper slides up with cream/parchment styling
            ├─ AI greeting appears via typewriter animation
            └─ User types messages; AI responds with typewriter effect
```

## Implementation Steps

### 1. Enable Lovable Cloud + AI Gateway

- Connect Lovable Cloud (required for edge functions)
- Ensure `LOVABLE_API_KEY` is available
- Create a `supabase/functions/letter-chat/index.ts` edge function that proxies to the Lovable AI Gateway with a system prompt that embodies your voice and knows about your sections (Story, Projects, Content, Network, Blueprints, etc.)

### 2. Create the Letter Chat Page (`src/pages/LetterPage.tsx`)

- **Sealed state**: Full-screen black background, centered envelope SVG with a black wax seal rendered from your logo paths. Subtle idle animation (gentle glow/pulse on seal).
- **Open animation**: On click, the seal cracks (split + fade), the envelope flap lifts, and the letter paper slides upward — all via Framer Motion (~1.5s total).
- **Chat state**: Cream/parchment-colored letter paper with subtle paper texture, elegant serif or mono font. Messages appear as handwritten-style correspondence. User input at the bottom styled as a simple line/field.

### 3. Typewriter Effect

- AI responses stream token-by-token from the edge function (SSE)
- Each token appends with a slight delay, creating a natural typewriter cadence
- A subtle blinking cursor follows the last character

### 4. Wax Seal Component

- Black circular seal using your logo SVG paths (the triangle + JF monogram)
- Crack animation: the seal splits into 2-3 fragments that rotate and fade out
- Rendered as inline SVG for crisp scaling

### 5. System Prompt (Edge Function)

- Personality: calm, direct, curious — mirrors your project knowledge tone
- Knows about all sections of your world (Story, Projects, Content, Network, Blueprints, Poems, Pictures)
- Can guide visitors to relevant pages with route links
- Opens every conversation with: *"What are you wondering about James?"*

### 6. Update Routes and Landing Page

- Add `/letter` route in `App.tsx`
- Change landing page button from "Explore the Map" → "Learn about James" pointing to `/letter`
- delete the `/map` route and functions

## Technical Details

**New files:**

- `src/pages/LetterPage.tsx` — main page with envelope, seal, letter UI, and chat logic
- `supabase/functions/letter-chat/index.ts` — edge function proxying to Lovable AI Gateway

**Modified files:**

- `src/App.tsx` — add `/letter` route
- `src/pages/LandingPage.tsx` — update button text and route

**Dependencies:** None new (Framer Motion already installed)

**AI model:** `google/gemini-3-flash-preview` (default, fast, cost-effective)