# AI Search / Chat — Ideas & Reference

## The Vision

A search bar on jamesfloyds.world where anyone can ask an AI that knows James —
his writing, poems, Sonder episodes, builds, projects, LinkedIn posts, references,
everything he's created across the internet. The AI answers *as a knowledgeable
friend*, surfaces the relevant page, and guides the visitor where they want to go.

This isn't a chatbot. It's a living index of a person.

---

## What it would feel like

- Visitor types: *"what has James built that uses AI?"*
- AI responds in prose, referencing specific builds by name, links to `/builds`
- A nav card appears: **Go to Builds →**

- Visitor types: *"does James have any writing about grief?"*
- AI pulls from Substack posts + poems, surfaces the closest match

- Visitor types: *"who is this guy?"*
- AI synthesizes the Dear Reader letter + references + Sonder story

---

## Data to ingest (the corpus)

| Source | Format | Notes |
|---|---|---|
| Substack posts | HTML (already fetched to `src/data/substack-posts.json`) | ~14 posts, daily refresh |
| Poems | Plain text (26 poems in pages/PoemsPage.tsx) | Extract to data files |
| Sonder episodes | Structured (titles, locations, descriptions) | Already in SonderPage data |
| Builds | Descriptions + links (BuildsPage.tsx) | Extract to data files |
| Projects | Plain text (ProjectsPage.tsx) | Extract to data files |
| Blueprints / Mental Models | Structured (BlueprintsPage.tsx) | Extract to data files |
| References / testimonials | Plain text quotes (ReferencesPage.tsx) | Extract to data files |
| Dear Reader letter | Plain text | Static |
| LinkedIn posts | Manual export or LinkedIn API | Future |
| Instagram captions | Manual export | Future |

---

## Technical approach

**Stack:** Supabase pgvector + Edge Functions + any LLM with tool use

### Phase A — Ingestion pipeline

1. Parse all content from the site into plain text chunks
2. Generate embeddings (OpenAI text-embedding-3-small or similar)
3. Store in Supabase `documents` table with pgvector `embedding` column
4. Re-run on each deploy for Substack; static content re-indexes manually

```sql
create table documents (
  id bigserial primary key,
  source text,          -- 'substack', 'poem', 'build', etc.
  title text,
  body text,
  url text,             -- internal path to link to
  embedding vector(1536)
);
create index on documents using ivfflat (embedding vector_cosine_ops);
```

### Phase B — Search Edge Function

Supabase Edge Function `search-chat`:
1. Embed the user's query
2. Vector similarity search: `SELECT * FROM documents ORDER BY embedding <=> $query_embedding LIMIT 5`
3. Build context from top 5 results
4. Call LLM with context + user message + tool definition for `navigate(route, label)`
5. Stream response back to client

### Phase C — UI

The search page already has a full implementation (see reference code below).
It's a simple centered search bar → conversation interface with a nav card CTA.

The `letter-chat` envelope animation (LetterPage) could be repurposed as an
intro sequence before the search interface appears — sealing the aesthetic.

---

## Supabase Edge Functions already scaffolded

- `search-chat` — the main search endpoint (called by SearchContext)
- `letter-chat` — the envelope/letter AI chat endpoint (called by LetterPage)

Both use SSE streaming with the standard `data: {...}\n\n` format.

---

## Reference implementations (preserved from the React codebase)

### SearchContext.tsx — streaming chat with tool-call nav suggestions

The `SearchProvider` wraps the app and provides:
- `messages` state
- `sendMessage(input)` — streams from `/functions/v1/search-chat`
- `navSuggestion` — extracted from tool calls or text fallback

Key details:
- Parses SSE stream line by line, handles partial JSON chunks
- Extracts `navigate` tool call for structured nav suggestions
- Falls back to regex path extraction if no tool call
- `sanitize()` strips Gemini's habit of emitting fake tool-call syntax as text

### SearchPage.tsx — the full search UI

Features:
- Typewriter intro text: "Welcome to James Floyd's World..."
- Centered → conversation layout transition on first message
- Animated edge-glow orbs drifting inward toward the search bar
- Nav suggestion card: "Go to Builds →" with `ArrowRight` icon
- Loading indicator: three pulsing dots

### LetterPage.tsx — envelope opening → AI chat

Features:
- Wax seal SVG (JF monogram, parchment card)
- Envelope flap (V-shape polygon) that rotates open on load
- Seal "peels off" with rotateX + opacity animation
- Typewriter greeting: "Welcome! What brings you here today?"
- Full streaming chat with cursor blink
- `/functions/v1/letter-chat` endpoint

The parchment aesthetic (`#F5F0E8`, SVG noise texture, `rgba(61,40,23,x)` brown tones)
is completely different from the main site's black museum theme — could be its own
dedicated page or a modal overlay on the home letter.

---

## Implementation order when ready to build

1. Extract all site content to plain text / structured JSON data files
2. Write the embedding ingestion script (runs at build time alongside fetch-substack)
3. Set up Supabase `documents` table with pgvector extension
4. Write the `search-chat` Edge Function
5. Build the `/search` page as a plain HTML page with a small JS fetch + SSE reader
   (no React needed — native `fetch()` + `EventSource` or manual SSE parsing)
6. Add `/search` to sitemap and nav
7. Wire up a daily cron to re-embed Substack posts
