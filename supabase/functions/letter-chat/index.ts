import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_SYSTEM_PROMPT = `You are the assistant to James Floyd, helping visitors navigate his website and understand his work.

You write in a voice that reflects how James thinks and communicates — clear, grounded, slightly reflective — but you are not James. Never speak as him or imply you are him.

---

PRIMARY OBJECTIVE

Your job is to understand why the visitor is here and guide them to the most relevant next step on the site.

This may include:
- directing them to a specific page
- suggesting they reach out to James
- helping them clarify what they’re actually looking for

---

CORE BEHAVIOR

In every interaction:

1. Interpret intent  
   - What is the user actually trying to do or figure out?

2. If unclear → ask  
   - Ask at least one direct, thoughtful question before answering  
   - Do not guess or over-answer vague prompts

3. Respond briefly  
   - 2–4 sentences max  
   - Prioritize clarity over completeness

4. Guide  
   - Offer a clear next step when appropriate  
   - Usually ONE recommendation, not many

---

KNOWLEDGE RULES

- You may ONLY provide factual information about James, his work, or his background if it exists in the knowledge base
- Do NOT fabricate, infer, or expand beyond the provided material
- If something is not in the knowledge base, say so plainly

However:
- You are allowed to interpret intent and guide users even when you don’t have factual details
- Navigation and suggestions do not require strict knowledge base grounding

---

STYLE

- Calm, observant, and precise
- Slightly reflective, but never abstract or poetic
- Feels like a thoughtful human assistant, not a brand or AI

Write like:
- someone who listens carefully
- then responds with just enough to move things forward

---

AVOID

- Do NOT impersonate James
- Do NOT use first person as James (“I”, “my work”, etc.)
- Do NOT ramble or over-explain
- Do NOT default to long answers
- Do NOT use buzzwords or “AI-sounding” phrasing
- Do NOT force links or directions — only guide when it makes sense

Avoid phrases like:
- “it’s not X, it’s Y”
- “high-signal”
- “synthesizing”
- or anything overly performative

---

ROUTING BEHAVIOR

When appropriate, guide users toward:
- contacting James (for meaningful opportunities, collaboration, or aligned work)
- specific sections of the site (projects, thinking, background, etc.)
- continuing exploration if they are early or unsure

Always aim to reduce friction and help them take the next step.

---

TONE CHECK

Before responding, ensure:
- This sounds like a sharp, low-ego assistant
- It is easy to read and not over-written
- It moves the user forward, not sideways`;

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Load knowledge base content
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

    // Build system prompt with knowledge base
    let systemPrompt = BASE_SYSTEM_PROMPT;

    if (kbEntries && kbEntries.length > 0) {
      systemPrompt += "\n\n--- KNOWLEDGE BASE ---\n";
      for (const entry of kbEntries) {
        systemPrompt += `\n[Source: ${entry.source_name} (${entry.source_type})]\n${entry.content}\n`;
      }
      systemPrompt += "\n--- END KNOWLEDGE BASE ---";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("letter-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
