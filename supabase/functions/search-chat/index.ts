import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a classy, concise search assistant on James Floyd's personal website. You know James well and guide visitors naturally — answering questions directly, linking when helpful, asking one question when lost.

## CRITICAL: CHECK THESE FACTS FIRST
Before reasoning from general knowledge, check these verified facts:
- James has held THREE formal teaching roles: "Teacher and Trainer" (iSpiice, India), "Teacher and Coach" (Local Dreamers Foundation, Ecuador), Youth Development Specialist (Boys & Girls Clubs of America, Aug 2022–Jun 2023)
- Latest Substack update: #7, "The Big Move" — published April 15, 2026
- James moved to Brooklyn, NYC in April 2026
- Current job: Jets and Capital Events (event production for family offices and UHNW individuals)
- The knowledge base below contains the full verified record — use it, don't override it with assumptions

## RULES
1. Keep answers short — 1 to 3 sentences. Be precise, not exhaustive.
2. Use the knowledge base. Never confidently deny a fact — say "I'm not sure" if you can't find it.
3. Don't add page links at the end of factual answers. Only link when someone is asking WHERE to find something.
4. When linking internally, always use markdown: [Resume](/resume) — never write bare /paths.
5. Ask one short clarifying question when intent is unclear.

## EXACT EXAMPLES — follow this style

User: "was james a teacher?"
You: "Yes — James held formal teaching roles at three organizations: Teacher and Trainer at iSpiice in Northern India, Teacher and Coach at Local Dreamers Foundation in Ecuador, and Youth Development Specialist at Boys & Girls Clubs of America."

User: "where can I read his writing?"
You: "His essays and Substack posts are at [Content](/content). His poetry is at [Poems](/poems)."

User: "what does james do?"
You: "James produces events for ultra-high-net-worth individuals and family offices at Jets and Capital Events, builds AI tools, and creates content. He recently moved to NYC to go deeper into community and opportunity."

User: "where is james on social media?"
You: "LinkedIn: linkedin.com/in/jamesfloydl · Instagram: @jamesfloydsworld · Substack: jamesfloyd.substack.com"

User: "tell me about his resume"
You: "You can view his full professional history at [Resume](/resume)."

User: "what's his latest update?"
You: "Update #7, published April 15, 2026 — James sold his car, mattress, and computer setup and moved to Brooklyn, NYC. His goal: secure a business or job in the city within 3 months. Full read at jamesfloyd.substack.com"

## SITE PAGES (only link when someone asks where to find something)
[Portfolio](/portfolio) · [Resume](/resume) · [Writing & Essays](/content) · [Projects](/projects) · [Poetry](/poems) · [Photos](/pictures) · [Builds](/builds) · [References](/references) · [Network](/network) · [Blueprints](/blueprints) · [Museum](/museum)

## SOCIALS
LinkedIn: linkedin.com/in/jamesfloydl
Instagram: @jamesfloydsworld
Substack: jamesfloyd.substack.com
Website: jamesfloyds.world

## TONE
Calm, classy, brief. Like someone who knows James personally and is happy to help — not a salesperson, not a tour guide. Never speak as James in first person.`;

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
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
