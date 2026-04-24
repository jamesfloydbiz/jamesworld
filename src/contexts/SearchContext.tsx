import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Msg = { role: 'user' | 'assistant'; content: string };
export type NavSuggestion = { route: string; label: string } | null;

interface SearchContextType {
  messages: Msg[];
  isLoading: boolean;
  isOpen: boolean;
  navSuggestion: NavSuggestion;
  setIsOpen: (open: boolean) => void;
  sendMessage: (input: string) => Promise<void>;
  clearChat: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-chat`;

// Strip fake tool-call syntax and stray path references that Gemini
// sometimes emits as text. The real navigation comes via tool_calls.
function sanitize(raw: string): string {
  let t = raw;
  // Fake tool-call patterns: "fldnav:navigate{...}", "navigate(...)",
  // "suggest_navigation{...}", "anything_navigation(...)", etc.
  t = t.replace(/\b(?:[a-z_]+:)?[a-z_]*navigation?\s*[({][^)}\n]*[)}]/gi, '');
  // Bulleted lines that are just a path reference (e.g. "* /portfolio - ..." or "* **/portfolio** - ...")
  t = t.replace(/^[\s*-]+\*{0,2}\/[A-Za-z/-]+\*{0,2}[^\n]*$/gm, '');
  // Bold-wrapped page names like **Network** or **Projects** (left bare so the nav card is clearly the CTA)
  t = t.replace(/\*\*(Portfolio|Resume|Content|Writing|Projects|Poems|Pictures|Builds|References|Network|Blueprints|Mental Models|Museum|Substack|LinkedIn|Instagram)\*\*/g, '$1');
  // Bare-path phrasing like "the /resume page" → "the page" (the nav card already says where to go)
  t = t.replace(/\bthe\s+\/[A-Za-z/-]+\s+page\b/gi, 'the page');
  // Squeeze extra blank lines and trim
  t = t.replace(/\n{3,}/g, '\n\n').trim();
  return t;
}

function extractFirstPath(text: string): NavSuggestion {
  // 1) Markdown [Label](url) with internal /path or external https://
  const md = text.match(/\[([^\]]+)\]\((\/[A-Za-z0-9_\-/]+|https?:\/\/[^)\s]+)\)/);
  if (md) return { label: md[1], route: md[2] };
  // 2) Bare /path reference (e.g. "see /resume")
  const bare = text.match(/(?:^|\s)(\/(?:portfolio|resume|content|projects|poems|pictures|builds|references|network|blueprints(?:\/mental-models)?|museum))\b/);
  if (bare) {
    const route = bare[1];
    const label = route.slice(1).split('/').pop()!.replace(/^[a-z]/, c => c.toUpperCase());
    return { label, route };
  }
  return null;
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [navSuggestion, setNavSuggestion] = useState<NavSuggestion>(null);

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: Msg = { role: 'user', content: input };
    const allMessages = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setNavSuggestion(null);

    let assistantText = '';
    let toolCallName = '';
    let toolCallArgs = '';
    let sawToolCall = false;

    const upsert = (text: string) => {
      const clean = sanitize(text);
      assistantText = clean;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: clean } : m);
        }
        return [...prev, { role: 'assistant', content: clean }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: 'Request failed' }));
        upsert(body.error || `Error ${resp.status}`);
        setIsLoading(false);
        return;
      }

      if (!resp.body) { upsert('No response'); setIsLoading(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;

            if (delta.content) {
              upsert(assistantText + delta.content);
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (tc.function?.name) toolCallName = tc.function.name;
                if (tc.function?.arguments) {
                  toolCallArgs += tc.function.arguments;
                  sawToolCall = true;
                }
              }
            }
          } catch {
            buf = line + '\n' + buf;
            break;
          }
        }
      }

      // Primary: use the structured tool call if Gemini made one
      if (sawToolCall && toolCallName === 'navigate' && toolCallArgs) {
        try {
          const args = JSON.parse(toolCallArgs);
          if (args.route && args.label) {
            setNavSuggestion({ route: args.route, label: args.label });
          }
        } catch {
          console.warn('Failed to parse navigate tool call:', toolCallArgs);
        }
      }

      // Fallback: if no tool call was made but the text references a page, derive one
      if (!navSuggestion && assistantText) {
        const fallback = extractFirstPath(assistantText);
        if (fallback) setNavSuggestion(fallback);
      }

      // If tool called but AI wrote no text at all, provide a graceful default
      if (sawToolCall && !assistantText.trim()) {
        try {
          const args = JSON.parse(toolCallArgs);
          if (args.label) upsert(`Right this way →`);
        } catch { /* noop */ }
      }
    } catch (e) {
      console.error('search-chat error:', e);
      upsert('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  }, [messages, navSuggestion]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setNavSuggestion(null);
    setIsLoading(false);
  }, []);

  return (
    <SearchContext.Provider value={{ messages, isLoading, isOpen, navSuggestion, setIsOpen, sendMessage, clearChat }}>
      {children}
    </SearchContext.Provider>
  );
}
