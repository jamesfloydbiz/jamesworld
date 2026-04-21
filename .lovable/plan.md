

# Export Knowledge Base to Your Own Supabase Project

You'd like to migrate the entire `knowledge_base` table out of Lovable Cloud into a personal Supabase project you control. Here's what that involves and the cleanest path forward.

## Important Context First

**Lovable Cloud IS a managed Supabase project** — it's just provisioned and held under Lovable's account, not yours. So "transferring to a Supabase project" really means one of two things:

1. **Export the data only** — keep Lovable Cloud running, but get a copy of the knowledge base into a separate Supabase project you own.
2. **Full migration** — point the entire app at a new Supabase project you create, and disconnect from Lovable Cloud. **This is one-way and you'd lose Lovable's managed convenience** (auto-deployed edge functions, integrated UI, etc.).

I'll assume option 1 (export the data) since that's the safe, reversible move. If you actually want option 2, say so and I'll plan that separately.

## Current State

The `knowledge_base` table contains roughly **60+ rows** including:
- 2 voice/context profile documents
- 2 URL sources (substack, jamesfloyds.world)
- ~50 LinkedIn post documents
- 1 large Aphorisms collection (~21.7k chars)

Schema: `id (uuid)`, `source_type (text)`, `source_name (text)`, `content (text)`, `created_at (timestamptz)`. No RLS policies, no foreign keys — clean and portable.

## The Plan

### Step 1: Generate a portable export file

I'll run a script that queries every row from `knowledge_base` and writes it to `/mnt/documents/` in two formats:

- **`knowledge_base_export.sql`** — a ready-to-run SQL file containing `CREATE TABLE` + `INSERT` statements. Paste it into the SQL editor of any Supabase project and you have an exact replica.
- **`knowledge_base_export.json`** — same data as JSON, in case you want to load it programmatically or transform it first.

Both will be downloadable from the Files view.

### Step 2: You set up the destination Supabase project

On your end (I can't do this for you — it requires your Supabase login):

1. Go to [supabase.com](https://supabase.com) and create a new project (or pick an existing one).
2. Open the **SQL Editor**.
3. Paste the contents of `knowledge_base_export.sql` and run it.

That's it — the table and all rows will exist in your project, identical to what's in Lovable Cloud right now.

### Step 3 (optional): Keep them in sync

If you want this to be an ongoing mirror rather than a one-time snapshot, options include:
- Re-run the export anytime and re-import (simple, manual).
- A scheduled edge function that pushes changes to your Supabase project (more work, ongoing cost).

I'd suggest starting with a one-time export and revisiting sync only if you actually need it.

## What This Plan Does NOT Do

- Does not change anything in Lovable Cloud — your existing site keeps working unchanged.
- Does not move edge functions (`letter-chat`, `search-chat`) — those stay on Lovable Cloud. If you also want those running on your own project, that's a separate, larger migration.
- Does not move secrets like `LOVABLE_API_KEY` — you'd configure those manually on the destination.

## Deliverables After Approval

- `/mnt/documents/knowledge_base_export.sql`
- `/mnt/documents/knowledge_base_export.json`
- A short note in chat with the exact 3-step instructions to import into your Supabase project.

