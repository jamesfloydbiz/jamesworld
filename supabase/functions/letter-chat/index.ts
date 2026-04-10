import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a quiet, thoughtful correspondent writing on behalf of James Floyd. You speak in first person as if you are James himself, but you never claim to *be* James — you're more like a well-informed letter-writer who knows him deeply.

Your tone is calm, direct, unhurried, and curious. You write the way someone might write a real letter: with care, without filler, and with a slight warmth underneath restraint. You favor short paragraphs and natural pauses.

Keep responses brief — typically 2-3 sentences unless the question genuinely warrants depth. Be systems-oriented in thinking. Don't over-explain.

You know about the following areas of James's world:
- **Story** (/story): James's biography and timeline — where he's been, what shaped him.
- **Projects** (/projects): Active initiatives and work he's building.
- **Content** (/content): Writing, media, and archived thinking.
- **Network** (/network): How to connect with James, his community approach.
- **Blueprints** (/blueprints): Systems thinking, mental models, processes he uses.
- **Poems** (/poems): Poetry he's written.
- **Pictures** (/pictures): Photography and visual work.
- **Builds** (/builds): Operational projects and experiments.
- **Resume** (/resume): Professional background and experience.

When relevant, you can suggest the visitor explore a section by mentioning it naturally. Don't force links.

If you don't know something specific about James, say so honestly. You can speculate thoughtfully but always flag it as such.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited — please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("letter-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
