import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };
type Phase = 'sealed' | 'opening' | 'chat';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/letter-chat`;

// ── Streaming helper ───────────────────────────────────────────────────
async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (e: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: 'Request failed' }));
    onError(body.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError('No response body'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let done = false;

  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || !line.trim() || !line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { done = true; break; }
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + '\n' + buf;
        break;
      }
    }
  }

  if (buf.trim()) {
    for (let raw of buf.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (!raw.startsWith('data: ')) continue;
      const json = raw.slice(6).trim();
      if (json === '[DONE]') continue;
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

// ── Wax Seal SVG ──────────────────────────────────────────────────────
const WaxSeal = ({ onClick, size = 'lg' }: { onClick: () => void; size?: 'sm' | 'lg' }) => {
  const dim = size === 'lg' ? 'w-28 h-28 md:w-36 md:h-36' : 'w-20 h-20';
  return (
    <motion.div
      className="cursor-pointer relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <svg viewBox="0 0 200 200" className={dim}>
        <circle cx="100" cy="100" r="90" fill="#1a1a1a" />
        <circle cx="100" cy="100" r="86" fill="#111" stroke="#333" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="#222" strokeWidth="1" strokeDasharray="3 5" />
        <path d="M100 42 L145 130 H55 Z" fill="none" stroke="#F5F0E8" strokeWidth="1.5" opacity="0.8" />
        <text x="100" y="118" textAnchor="middle" fill="#F5F0E8" fontSize="22" fontFamily="monospace" opacity="0.8" letterSpacing="2">JF</text>
      </svg>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(245,240,232,0.06) 0%, transparent 70%)' }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};

// ── Typewriter text ───────────────────────────────────────────────────
const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, 30);
    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <motion.span
          className="inline-block w-[2px] h-[1em] ml-[1px] align-text-bottom"
          style={{ backgroundColor: '#3D2817' }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </span>
  );
};

// ── Letter Card (shared between sealed + chat) ────────────────────────
const letterCardStyle: React.CSSProperties = {
  backgroundColor: '#F5F0E8',
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`,
  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(61,40,23,0.1)',
};

// ── Main Page ─────────────────────────────────────────────────────────
const LetterPage = () => {
  const [phase, setPhase] = useState<Phase>('sealed');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSealClick = useCallback(() => {
    setPhase('opening');
    setTimeout(() => {
      setPhase('chat');
      setGreeting(true);
    }, 1200);
  }, []);

  const handleGreetingComplete = useCallback(() => {
    setMessages([{ role: 'assistant', content: 'What are you wondering about James?' }]);
    setGreeting(false);
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    const userMsg: Msg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsStreaming(true);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length > updated.length) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev.filter((_, i) => i < updated.length), { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: updated,
      onDelta: upsert,
      onDone: () => setIsStreaming(false),
      onError: (e) => {
        console.error(e);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Apologies — something went wrong. Please try again.' }]);
        setIsStreaming(false);
      },
    });
  }, [input, isStreaming, messages]);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#000' }}>
      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.06,
          mixBlendMode: 'overlay' as const,
        }}
      />

      {/* Sealed state — cream letter card with wax seal */}
      <AnimatePresence mode="wait">
        {phase === 'sealed' && (
          <motion.div
            key="sealed"
            className="relative z-20 flex flex-col items-center justify-center rounded-sm"
            style={{
              ...letterCardStyle,
              width: 'min(640px, 90vw)',
              height: 'min(70vh, 600px)',
            }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Decorative border lines */}
            <div className="absolute inset-4 border rounded-sm" style={{ borderColor: 'rgba(61,40,23,0.08)' }} />

            <WaxSeal onClick={handleSealClick} />

            <motion.p
              className="mt-6 font-mono text-[10px] tracking-[0.25em] uppercase"
              style={{ color: 'rgba(61,40,23,0.3)' }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Break the seal
            </motion.p>
          </motion.div>
        )}

        {/* Opening animation — seal cracks on the card */}
        {phase === 'opening' && (
          <motion.div
            key="opening"
            className="relative z-20 flex items-center justify-center rounded-sm"
            style={{
              ...letterCardStyle,
              width: 'min(640px, 90vw)',
              height: 'min(70vh, 600px)',
            }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-4 border rounded-sm" style={{ borderColor: 'rgba(61,40,23,0.08)' }} />

            {/* Seal splitting apart */}
            <div className="relative">
              <motion.div
                className="absolute top-1/2 left-1/2"
                style={{ marginLeft: '-40px', marginTop: '-40px' }}
                initial={{ opacity: 1, x: 0, rotate: 0 }}
                animate={{ opacity: 0, x: -50, rotate: -20, y: 20 }}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeIn' }}
              >
                <svg viewBox="0 0 100 200" className="w-16 h-16">
                  <clipPath id="seal-left"><rect x="0" y="0" width="100" height="200" /></clipPath>
                  <g clipPath="url(#seal-left)">
                    <circle cx="100" cy="100" r="80" fill="#1a1a1a" />
                  </g>
                </svg>
              </motion.div>
              <motion.div
                className="absolute top-1/2 left-1/2"
                style={{ marginLeft: '-40px', marginTop: '-40px' }}
                initial={{ opacity: 1, x: 0, rotate: 0 }}
                animate={{ opacity: 0, x: 50, rotate: 20, y: 20 }}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeIn' }}
              >
                <svg viewBox="100 0 100 200" className="w-16 h-16">
                  <clipPath id="seal-right"><rect x="100" y="0" width="100" height="200" /></clipPath>
                  <g clipPath="url(#seal-right)">
                    <circle cx="100" cy="100" r="80" fill="#1a1a1a" />
                  </g>
                </svg>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Chat state — same card shape, now with messages */}
        {phase === 'chat' && (
          <motion.div
            key="chat"
            className="relative z-20 flex flex-col rounded-sm overflow-hidden"
            style={{
              ...letterCardStyle,
              width: 'min(640px, 90vw)',
              height: 'min(70vh, 600px)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="px-6 md:px-10 pt-5 pb-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(61,40,23,0.1)' }}>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: '#3D2817', opacity: 0.4 }}>
                Correspondence
              </p>
              <motion.button
                onClick={() => window.history.back()}
                className="font-mono text-[10px] tracking-[0.2em] uppercase"
                style={{ color: 'rgba(61,40,23,0.3)' }}
                whileHover={{ color: 'rgba(61,40,23,0.6)' }}
              >
                ← Return
              </motion.button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-10 py-6 space-y-6">
              {greeting && (
                <div className="text-sm md:text-base leading-relaxed" style={{ color: '#3D2817', fontFamily: "'Georgia', serif" }}>
                  <TypewriterText text="What are you wondering about James?" onComplete={handleGreetingComplete} />
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'flex justify-end' : ''}>
                  <div
                    className="text-sm md:text-base leading-relaxed max-w-[85%]"
                    style={{
                      color: msg.role === 'user' ? '#5a4a3a' : '#3D2817',
                      fontFamily: msg.role === 'user' ? "'Courier New', monospace" : "'Georgia', serif",
                      opacity: msg.role === 'user' ? 0.7 : 1,
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none" style={{ color: '#3D2817' }}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isStreaming && (
                <motion.span
                  className="inline-block w-[2px] h-4"
                  style={{ backgroundColor: '#3D2817' }}
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>

            {/* Input */}
            <div className="px-6 md:px-10 py-4 border-t" style={{ borderColor: 'rgba(61,40,23,0.1)' }}>
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex items-center gap-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write something..."
                  disabled={isStreaming}
                  className="flex-1 bg-transparent border-none outline-none text-sm md:text-base placeholder:opacity-30"
                  style={{
                    color: '#3D2817',
                    fontFamily: "'Courier New', monospace",
                    borderBottom: '1px solid rgba(61,40,23,0.15)',
                    paddingBottom: '4px',
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="font-mono text-xs tracking-widest uppercase transition-opacity"
                  style={{ color: '#3D2817', opacity: isStreaming || !input.trim() ? 0.2 : 0.6 }}
                >
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LetterPage;
