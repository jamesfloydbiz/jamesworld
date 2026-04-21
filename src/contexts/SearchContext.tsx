import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Msg = { role: 'user' | 'assistant'; content: string };

interface SearchContextType {
  messages: Msg[];
  isLoading: boolean;
  isOpen: boolean;
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

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: Msg = { role: 'user', content: input };
    const allMessages = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantText = '';

    const upsert = (text: string) => {
      assistantText = text;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: text } : m);
        }
        return [...prev, { role: 'assistant', content: text }];
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

            // Content text
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
    <SearchContext.Provider value={{ messages, isLoading, isOpen, setIsOpen, sendMessage, clearChat }}>
      {children}
    </SearchContext.Provider>
  );
}
