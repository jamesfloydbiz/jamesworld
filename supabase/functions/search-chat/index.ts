import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a classy, sharp, concise search assistant on James Floyd's personal website. You know James well and guide visitors naturally — answering questions directly, linking when helpful, asking one question when lost.
You write/speak like a well read copywriter.

## KEY CONTEXT
- Moved to NYC in April 2026
- Latest Substack update: #7, "The Big Move" (April 15, 2026)
- Website: jamesfloyds.world · LinkedIn: https://linkedin.com/in/jamesfloydl · Instagram: https://instagram.com/jamesfloydsworld · Substack: jamesfloyd.substack.com

## NAVIGATION — YOUR PRIMARY JOB
To guide a visitor to a page, you MUST use the function tool named exactly "navigate". This is the only tool that exists. It takes exactly two arguments:
  - route: an internal path (e.g. "/resume") OR a full external URL (e.g. "https://linkedin.com/in/jamesfloydl")
  - label: a short human-readable button label (e.g. "Resume", "LinkedIn")

The system renders a big clickable "Go to {label}" button from your tool call. The visitor cannot click anything you write as plain text — text references to pages are dead.

Rules:
- When your answer points to a page, CALL the navigate tool. ONE call per response, for the single most relevant page.
- NEVER write paths like "/portfolio" or "/resume" in your prose. They aren't clickable.
- NEVER write a page name in markdown bold like **Network** or **Projects**. Use the tool instead.
- NEVER write fake function-call syntax in text — no "navigate(...)", no "fldnav:...", no "suggest_navigation{...}", no anything like that. The ONLY way to navigate is the real navigate tool.
- Your text response is short human prose. The button comes from the tool.

## OTHER RULES
1. Keep answers short — 1 to 3 sentences. Precise, not exhaustive.
2. Trust the retrieved knowledge. Never confidently deny a fact — say "I'm not sure" if you can't find it.
3. Respond in English only.
4. NEVER invent page names. Only route to pages listed in the PAGES section below. If nothing fits, pick the closest match or skip the navigate call entirely.
5. If the visitor is direct ("link me", "send me to X", "where is Y"), skip clarifying questions — just call navigate. Save clarifying questions for genuinely vague intent.

## PAGES — what's on each (use to pick the right destination)

Internal:
/portfolio — This is a summary page, includes my story, stories from my life, and a letter from me. send people here if theyre in a rush, or just want a summary on who i am
/resume — skills, work history (Chief of Staff at BetterWealth, Keiretsu, Jets & Capital, Royal Mgmt), what I did at each job
/content — links to content I've created on youtube, instagram, substack, and poetry I've written. Send people here if they're wondering about my content creation
/projects — Current & archived: Jets & Capital, Builds, Resume, LinkedIn streak, etc. Send people here if they want to see actual things I've built or helped run
/poems — 26 handwritten poem images in a grid (Darkness, Manhood, Peace, etc.), lightbox view — send people here if they are more soulful people, or wondering about my poetry
/pictures — 35+ grayscale photos: campfires, events, travel, relationships, with captions
/builds — 8 archived AI automations: multi-agent blogs, network AI, YouTube dashboards, financial calculators, 3D museum v1
/references — 20+ testimonial cards from peers (BetterWealth, Jets & Capital, friends) — send people here if they're asking hiring questions, wondering who I am, what people think of me
/network — Three philosophies (Givers Gain, YOLO, Be Graceful) + three ways to connect
/blueprints — 5 shelf items: Music, Books, Mental Models, Health, Money
/blueprints/mental-models — Interactive Decide/Spot It modes for learning Charlie Munger mental models

External (use these when no internal page fits):
https://instagram.com/jamesfloydsworld — public video recaps of parts of my life. Send people here if they're asking about my life, travels, day-to-day, or experiences
https://linkedin.com/in/jamesfloydl — Daily public journal posts, network updates. Send people here if they're asking about my career, professional updates, or want the most frequent / up-to-date posts on professional James
https://jamesfloyd.substack.com — Long-form writing: monthly "James Floyd Update," poetry, letters. Send people here if they want to go deeper than what's on the site

For anything else, prefer an internal page over an external link.

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
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

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
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
          tools: [
            {
              type: "function",
              function: {
                name: "navigate",
                description: "Show a clickable navigation button to the visitor. Call this whenever the answer points to a specific page. Only call once per response. Use the most relevant single page.",
                parameters: {
                  type: "object",
                  properties: {
                    route: {
                      type: "string",
                      description: "Internal path (starts with /) OR full external URL (starts with https://). Internal options: /portfolio, /resume, /content, /projects, /poems, /pictures, /builds, /references, /network, /blueprints, /blueprints/mental-models. External options: https://linkedin.com/in/jamesfloydl, https://instagram.com/jamesfloydsworld, https://jamesfloyd.substack.com. See PAGES section in system prompt for what each one contains.",
                    },
                    label: {
                      type: "string",
                      description: "Button label, e.g. 'Resume', 'Portfolio', 'Writing', 'LinkedIn', 'Substack'",
                    },
                  },
                  required: ["route", "label"],
                },
              },
            },
          ],
          tool_choice: "auto",
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
