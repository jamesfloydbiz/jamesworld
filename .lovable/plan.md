

# Customize Letter Chat Knowledge Base

## Approach

Replace the current hardcoded system prompt with a grounded knowledge base built from specific websites and uploaded documents. The AI will be instructed to answer only from this material.

### How it works

1. **Gather content** — User provides website URLs and uploads documents. I fetch/parse the text content from each.

2. **Store in database** — Create a `knowledge_base` table to hold text chunks with source attribution (URL or document name). This makes it easy to update, add, or remove sources later.

3. **Update edge function** — The `letter-chat` function queries the knowledge base table and injects the content into the system prompt, with instructions to only answer from provided material.

4. **Admin interface (optional)** — A simple way to manage sources if desired, or we can manage it via direct database entries.

### Architecture

```text
User uploads docs / provides URLs
        ↓
  Parse & store text chunks
  in `knowledge_base` table
        ↓
  letter-chat edge function
  loads chunks → system prompt
        ↓
  AI answers only from
  provided knowledge
```

### Steps

1. **Create `knowledge_base` table** — columns: `id`, `source_type` (url/document), `source_name`, `content` (text), `created_at`
2. **Populate from websites** — Fetch and parse the URLs you provide, store extracted text
3. **Populate from documents** — Parse uploaded docs, store extracted text
4. **Update `letter-chat` edge function** — Load knowledge base content at request time, build a grounded system prompt that restricts answers to provided material
5. **Update system prompt** — Add instructions like "Only answer based on the following knowledge base. If the answer isn't in the provided material, say so honestly."

### What I need from you

- The specific website URLs to include
- The documents to upload

### Technical details

- Knowledge base content injected into system prompt context
- If total content exceeds ~100K tokens, we'd chunk and do similarity search (but likely unnecessary for a few websites + docs)
- Edge function reads from database using service role key
- No RLS needed on knowledge_base table (read-only from edge function, managed internally)

