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

    // Strip any fake function-call garbage Gemini sometimes emits
    // (e.g. "fldnav:navigate{label:X,route:/y}" or "navigate(route='/x')")
    // and pull the first internal markdown link out to use as the nav card.
    const sanitize = (raw: string) => {
      let text = raw;
      // Remove "fldnav:navigate{...}" / "navigate(...)" / "navigate{...}" leakage
      text = text.replace(/\b(?:fldnav:)?navigate\s*[({][^)}\n]*[)}]/gi, '').trim();
      // Also trim trailing dangling colons/whitespace
      text = text.replace(/[\s:]+$/g, '');
      return text;
    };

    const extractFirstInternalLink = (text: string): NavSuggestion => {
      const match = text.match(/\[([^\]]+)\]\((\/[^)\s]*)\)/);
      if (match) return { label: match[1], route: match[2] };
      return null;
    };

    const upsert = (text: string) => {
      const clean = sanitize(text);
      assistantText = clean;
      const nav = extractFirstInternalLink(clean);
      if (nav) setNavSuggestion(nav);
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
          } catch {
            buf = line + '\n' + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error('search-chat error:', e);
      upsert('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  }, [messages]);

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
