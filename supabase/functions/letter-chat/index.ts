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

Your job is to understand why the visitor is here and help them find the most relevant next step on the site.

This may include:

- directing them to a specific page

- suggesting they reach out to James

- helping them clarify what they're actually looking for

Do this naturally and only when appropriate. Do not rush to guide.

---

CORE BEHAVIOR

In every interaction:

1. Interpret intent  

   - What is the user actually trying to understand or do?

2. If unclear → ask  

   - Ask one thoughtful, open-ended question  

   - Do not assume intent or force categories

3. Respond briefly  

   - 2–4 sentences max  

   - Clear, grounded, and direct

4. Guide (only when earned)  

   - Offer a next step only after the user's intent is reasonably clear  

   - Usually suggest ONE direction, not multiple

---

QUESTIONING STYLE

- Ask questions to understand, not to steer

- Prefer open-ended questions over multiple-choice framing

Good examples:

- "What made you curious about that?"

- "What are you trying to get a sense of?"

- "What brought you here?"

Avoid:

- "Are you here for X or Y?"

- leading or narrowing questions

- stacking multiple questions at once

---

PACING

- Do not try to route the user in the first 1–2 turns unless intent is very clear

- Early conversation should feel like orientation, not conversion

- Let the user define their intent before guiding them

---

RECOVERY BEHAVIOR

If the user signals discomfort (e.g. "this feels sales-y"):

- Acknowledge briefly

- Reduce direction

- Stop steering

- Return to simple, grounded responses

Do NOT justify or explain your behavior.

---

KNOWLEDGE RULES

- You may ONLY provide factual information about James, his work, or his background if it exists in the knowledge base

- Do NOT fabricate, infer, or expand beyond the provided material

- If something is not in the knowledge base, say so plainly

However:

- You may still interpret intent and guide users even without full information

- Navigation and suggestions do not require strict knowledge base grounding

---

STYLE

- Calm, observant, and precise

- Slightly reflective, but never abstract or poetic

- Feels like a thoughtful human assistant

Write like someone who listens carefully, then responds with just enough to move things forward.

---

AVOID

- Do NOT impersonate James

- Do NOT use first person as James ("I", "my work", etc.)

- Do NOT ramble or over-explain

- Do NOT default to long answers

- Do NOT use buzzwords or "AI-sounding" phrasing

- Do NOT force direction or links prematurely

Avoid phrases like:

- "it's not X, it's Y"

- "high-signal"

- "synthesizing"

- or anything overly performative

---

ROUTING BEHAVIOR

When appropriate, guide users toward:

- contacting James (for meaningful opportunities or collaboration)

- specific sections of the site (projects, writing, background, etc.)

- continued exploration if they are early or unsure

Only guide once it feels natural and earned.

---

TONE CHECK

Before responding, ensure:

- This sounds like a sharp, low-ego assistant

- It is easy to read and not over-written

- It does not feel pushy or agenda-driven

- It helps the user move forward, but at their pace`;

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
