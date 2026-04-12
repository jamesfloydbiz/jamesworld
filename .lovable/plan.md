

# AI-Powered Search with Global Assistant Widget

## Overview
Transform the `/search` page into a functional AI-powered guide that helps visitors navigate the site. When the user submits a query, the AI (reusing the existing `letter-chat` edge function with a modified prompt) interprets intent and directs them to the most relevant page. After leaving `/search`, the assistant minimizes into a small icon in the top-right corner available on every page.

## Architecture

```text
User types query on /search
  → Calls letter-chat edge function (with search-specific system prompt override)
  → AI responds with guidance + a suggested route
  → AI response includes a structured tool call with a route suggestion
  → User sees response + clickable link to navigate

After navigating away from /search:
  → Floating assistant icon appears (top-right)
  → Click reopens a small chat popover
  → Same AI conversation continues
```

## Steps

### 1. Visual upgrades to SearchPage
- Round the search bar corners (`border-radius`)
- Add animated glow effect: CSS keyframe animation with multiple soft white radial gradients that drift randomly from page edges toward the search bar border, creating a living-light feel

### 2. New edge function: `search-chat`
- Similar to `letter-chat` but with a search-oriented system prompt
- Prompt instructs the AI to: interpret what the user is looking for, respond briefly (1-3 sentences), and include a suggested route using a tool call
- Tool call schema: `{ "name": "navigate", "parameters": { "route": "/poems", "label": "Poems" } }`
- Uses the same knowledge base table for grounding
- Also given a site map of all routes with descriptions so it can route accurately

### 3. Make SearchPage functional
- On Enter/submit, send the query to `search-chat` edge function
- Stream the AI response below the search bar with typewriter effect
- Parse any `navigate` tool call from the response and render it as a clickable link/button
- Conversation history maintained in state so follow-up queries work

### 4. Global floating assistant widget (`SearchAssistant.tsx`)
- A small, minimal character/icon fixed in the top-right corner of every page (except `/search` itself)
- Clicking it opens a compact chat popover (small card, same black aesthetic)
- Chat state stored in a React context (`SearchContext`) so conversation persists across pages
- The popover has an input field and shows previous messages
- "Go to Search" option to return to the full `/search` page

### 5. Wire it all together in App.tsx
- Wrap routes in `SearchProvider` context
- Render `SearchAssistant` component outside of Routes so it appears globally
- `/search` page sets context state to "expanded" mode (hides the floating icon)

## Site Map for the AI

The edge function system prompt will include:
- `/portfolio` — Overview of James' work, skills, philosophy
- `/content` — Essays and updates (links to Substack)
- `/projects` — Project showcase
- `/poems` — Poetry collection
- `/pictures` — Photography
- `/builds` — Technical builds and ops
- `/resume` — Professional background
- `/references` — Testimonials and references
- `/network` — Professional network
- `/blueprints` — Frameworks and thinking tools
- `/blueprints/mental-models` — Mental models
- `/letter` — AI chat (deeper conversation)
- `/story` — Personal narrative

## Technical Details

- **Edge function**: New `supabase/functions/search-chat/index.ts` with tool-calling for structured route suggestions
- **Glow animation**: CSS `@keyframes` with multiple animated pseudo-elements using `radial-gradient` and random-feeling motion via offset timing
- **Context**: `src/contexts/SearchContext.tsx` — stores messages array, loading state, and open/closed state
- **Components**: `src/components/ui/SearchAssistant.tsx` — floating icon + popover
- **Streaming**: Reuses the same SSE streaming pattern from LetterPage
- **No new tables needed** — reuses existing `knowledge_base`

