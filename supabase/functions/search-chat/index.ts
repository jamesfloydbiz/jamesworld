import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_MAP = `
Available routes — only suggest these:
/ — Dear Reader (site intro)
/portfolio — James' work, skills, philosophy
/content — Essays and writing (Substack)
/projects — Project showcase
/poems — Poetry
/pictures — Photography
/builds — Technical builds and experiments
/resume — Professional background
/references — Testimonials
/network — Professional network
/blueprints — Frameworks and personal operating system
/blueprints/mental-models — Mental models lab
/letter — Deeper AI conversation about James
/museum — 3D museum experience
`;

const SYSTEM_PROMPT = `You are a quiet, thoughtful guide for James Floyd's personal website.

Help visitors find what they're looking for. Keep responses short — 1 to 3 sentences, no more.

${SITE_MAP}

Tone: calm, unhurried, precise. Like a good host, not a salesperson.

Navigation: use the navigate tool only when there is a genuinely clear page match. If intent is still unclear, ask one open question instead — don't force a link.

Never impersonate James. Don't fabricate facts not in the knowledge base. Don't explain your own behavior.`;

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
          tools: [
            {
              type: "function",
              function: {
                name: "navigate",
                description: "Suggest a relevant page — only call this when there is a clear match",
                parameters: {
                  type: "object",
                  properties: {
                    route: { type: "string", description: "Route path, e.g. /poems" },
                    label: { type: "string", description: "Human-readable label, e.g. Poems" },
                  },
                  required: ["route", "label"],
                },
              },
            },
          ],
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
