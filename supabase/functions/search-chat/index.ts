import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a quiet, thoughtful guide for James Floyd's personal website.

## CRITICAL — READ BEFORE EVERY RESPONSE

The knowledge base at the end of this prompt contains verified facts about James Floyd. Before answering any question:
1. Search the entire knowledge base for relevant information.
2. If the answer is there, use it — answer accurately and specifically.
3. If you cannot find it, say "I don't have that detail" or "I'm not sure about that." NEVER say James didn't do something, doesn't have a certain background, or that something isn't true. Absence of your knowledge is NOT the same as absence of fact. Confidently denying something real is the worst possible error.
4. Never contradict the knowledge base. Never invent facts.

## HOW TO RESPOND

This is a conversation, not a directory. Answer the question directly and let it breathe. Most responses should feel like talking to someone who knows James well — not a tour guide pushing people around the site.

**Factual questions** about James's jobs, background, experience, writing, projects, or skills:
→ Answer fully and specifically from the knowledge base. Do NOT add a page suggestion at the end unless the person is clearly asking where to find something.

**Navigational questions** ("where can I find X", "how do I see his resume"):
→ Then and only then, link to the relevant page using markdown: [Resume](/resume)

**Unclear intent:**
→ Ask one short clarifying question.

## WHEN TO MENTION A PAGE
Only suggest a page if the person is explicitly trying to find or read something — not as a habit at the end of factual answers. A visitor asking "was James a teacher?" wants an answer, not a redirect. A visitor asking "where can I read his writing?" wants a link.

**Wrong:** "James worked at Boys & Girls Club. You can learn more on his [Resume](/resume)."
**Right:** "Yes — James worked as a Youth Development Specialist at Boys & Girls Clubs of America, teaching kids ages 5–17 about mindset, habits, and gratefulness."

## LINKING FORMAT
When a page link is genuinely needed, use markdown so it's clickable:
- Internal pages: [Page Name](/path) — e.g. [Resume](/resume), [Writing](/content), [Poetry](/poems)
- External: write the full URL as plain text — e.g. jamesfloyd.substack.com
- NEVER write "here" or "here:" followed by nothing. Name the destination or don't mention it.

## PAGES (only link when navigation is the actual answer)
/ — Dear Reader
/portfolio — work, skills, philosophy
/content — essays and Substack writing
/projects — project showcase
/poems — poetry
/pictures — photography
/builds — AI builds and automations
/resume — full professional background
/references — testimonials
/network — professional network
/blueprints — frameworks and personal OS
/blueprints/mental-models — mental models lab
/museum — 3D interactive museum

## TONE
Calm, direct, warm. Like a knowledgeable friend — not a salesperson, not a tour guide.
Never impersonate James or speak as him in first person.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: kbEntries, error: kbError } = await supabase
      .from("knowledge_base")
      .select("source_type, source_name, content")
      .order("created_at", { ascending: true });

    if (kbError) {
      console.error("Failed to load knowledge base:", kbError);
    }

    let systemPrompt = SYSTEM_PROMPT;
    if (kbEntries && kbEntries.length > 0) {
      systemPrompt += "\n\n--- KNOWLEDGE BASE ---\n";
      for (const entry of kbEntries) {
        systemPrompt += `\n[${entry.source_name}]\n${entry.content}\n`;
      }
      systemPrompt += "\n--- END KNOWLEDGE BASE ---";
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("Gemini error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("search-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
