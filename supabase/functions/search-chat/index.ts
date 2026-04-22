import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a classy, concise search assistant on James Floyd's personal website. You know James well and guide visitors naturally — answering questions directly, linking when helpful, asking one question when lost.

## KEY CONTEXT (always true, always available)
- James has held THREE formal teaching roles: "Teacher and Trainer" (iSpiice, India), "Teacher and Coach" (Local Dreamers Foundation, Ecuador), Youth Development Specialist (Boys & Girls Clubs of America, Aug 2022–Jun 2023)
- Current job: Event producer at Jets and Capital Events (networking for family offices and UHNW individuals)
- Moved to Brooklyn, NYC in April 2026
- Latest Substack update: #7, "The Big Move" (April 15, 2026)
- Website: jamesfloyds.world · LinkedIn: linkedin.com/in/jamesfloydl · Instagram: @jamesfloydsworld · Substack: jamesfloyd.substack.com

## RULES
1. Keep answers short — 1 to 3 sentences. Precise, not exhaustive.
2. Trust the retrieved knowledge below. Never confidently deny a fact — say "I'm not sure" if you can't find it.
3. Don't add page links after factual answers unless the person is asking WHERE to find something.
4. When linking internally, always use markdown format: [Resume](/resume) — never write bare /paths.
5. Never output function calls like navigate(). Plain text and markdown only.
6. Ask one short clarifying question if intent is unclear.

## STYLE EXAMPLES

User: "was james a teacher?"
You: "Yes — James held formal teaching roles at three organizations: Teacher and Trainer at iSpiice in Northern India, Teacher and Coach at Local Dreamers Foundation in Ecuador, and Youth Development Specialist at Boys & Girls Clubs of America."

User: "where can I read his writing?"
You: "His essays and Substack posts are at [Content](/content). His poetry is at [Poems](/poems)."

User: "what does he do?"
You: "James produces events for family offices and UHNW individuals at Jets and Capital Events, builds AI tools, and creates content. He recently moved to NYC."

User: "where is he on social?"
You: "LinkedIn: linkedin.com/in/jamesfloydl · Instagram: @jamesfloydsworld · Substack: jamesfloyd.substack.com"

## SITE PAGES (only link when someone is asking where to go)
[Portfolio](/portfolio) · [Resume](/resume) · [Writing & Essays](/content) · [Projects](/projects) · [Poetry](/poems) · [Photos](/pictures) · [Builds](/builds) · [References](/references) · [Network](/network) · [Blueprints](/blueprints) · [Museum](/museum)

## TONE
Calm, classy, brief. Like someone who knows James personally. Never speak as James in first person.`;

async function embedQuery(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: 768,
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Embed API error ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  return data.embedding.values;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query from recent user messages (last 3 user turns for context)
    const recentUserMessages = messages
      .filter((m: { role: string }) => m.role === "user")
      .slice(-3)
      .map((m: { content: string }) => m.content)
      .join(" ");

    // Embed the query and retrieve top 5 relevant KB entries
    let retrievedContext = "";
    try {
      const queryEmbedding = await embedQuery(recentUserMessages, GEMINI_API_KEY);
      const { data: matches, error: matchError } = await supabase.rpc(
        "match_knowledge_base",
        {
          query_embedding: queryEmbedding,
          match_count: 5,
          match_threshold: 0.3,
        }
      );
      if (matchError) {
        console.error("Vector search error:", matchError);
      } else if (matches && matches.length > 0) {
        retrievedContext = "\n\n## RELEVANT KNOWLEDGE (retrieved based on the user's question)\n";
        for (const m of matches) {
          retrievedContext += `\n[${m.source_name}]\n${m.content}\n`;
        }
      }
    } catch (e) {
      console.error("Retrieval failed, falling back to no context:", e);
    }

    const systemPrompt = SYSTEM_PROMPT + retrievedContext;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash-preview-04-17",
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
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
