import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_MAP = `
SITE MAP — use these routes when suggesting navigation:
- /portfolio — Overview of James' work, skills, philosophy
- /content — Essays and updates (links to Substack)
- /projects — Project showcase
- /poems — Poetry collection
- /pictures — Photography
- /builds — Technical builds and ops
- /resume — Professional background
- /references — Testimonials and references
- /network — Professional network
- /blueprints — Frameworks and thinking tools
- /blueprints/mental-models — Mental models
- /letter — Deeper AI conversation about James
- /story — Personal narrative
`;

const SYSTEM_PROMPT = `You are the navigation assistant for JamesFloyds.World — James Floyd's personal website.

Your job: understand what the visitor is looking for and guide them to the most relevant page. Respond in 1-3 sentences, then ALWAYS use the navigate tool to suggest the best matching route.

${SITE_MAP}

RULES:
- Be brief, calm, and direct
- If intent is unclear, ask ONE clarifying question (still suggest your best guess via the navigate tool)
- Never impersonate James
- Use knowledge base facts when relevant, but don't fabricate
- For poetry/poems → /poems
- For essays/writing/substack → /content
- For work history/hiring → /resume
- For who James is → /story or /portfolio
- For deeper conversation → /letter
`;

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

    // Load knowledge base
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
        tools: [
          {
            type: "function",
            function: {
              name: "navigate",
              description: "Suggest the most relevant page for the user to visit",
              parameters: {
                type: "object",
                properties: {
                  route: {
                    type: "string",
                    description: "The route path, e.g. /poems",
                  },
                  label: {
                    type: "string",
                    description: "Human-readable label for the link, e.g. Poems",
                  },
                },
                required: ["route", "label"],
              },
            },
          },
        ],
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
    console.error("search-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
