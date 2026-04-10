import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };

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
const WaxSeal = () => (
  <svg viewBox="0 0 200 200" className="w-28 h-28 md:w-36 md:h-36">
    <circle cx="100" cy="100" r="90" fill="#1a1a1a" />
    <circle cx="100" cy="100" r="86" fill="#111" stroke="#333" strokeWidth="0.5" />
    <circle cx="100" cy="100" r="82" fill="none" stroke="#222" strokeWidth="1" strokeDasharray="3 5" />
    <path d="M100 42 L145 130 H55 Z" fill="none" stroke="#F5F0E8" strokeWidth="1.5" opacity="0.8" />
    <text x="100" y="118" textAnchor="middle" fill="#F5F0E8" fontSize="22" fontFamily="monospace" opacity="0.8" letterSpacing="2">JF</text>
  </svg>
);

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

// ── Letter card style ─────────────────────────────────────────────────
const parchmentBg = '#F5F0E8';
const parchmentTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`;

const letterCardStyle: React.CSSProperties = {
  backgroundColor: parchmentBg,
  backgroundImage: parchmentTexture,
  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(61,40,23,0.1)',
};

// ── Animation phases ──────────────────────────────────────────────────
// 0: sealed (seal visible on card)
// 1: opening (seal peels off, flap opens)
// 2: chat (chat revealed)
type Phase = 0 | 1 | 2;

// ── Envelope Flap (V shape) ───────────────────────────────────────────
const EnvelopeFlap = ({ open }: { open: boolean }) => (
  <motion.div
    className="absolute top-0 left-0 right-0 z-30"
    style={{
      height: '45%',
      transformOrigin: 'top center',
      perspective: '800px',
    }}
  >
    <motion.div
      style={{
        width: '100%',
        height: '100%',
        transformOrigin: 'top center',
        backfaceVisibility: 'hidden',
      }}
      initial={{ rotateX: 0 }}
      animate={{ rotateX: open ? 180 : 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: open ? 0.2 : 0 }}
    >
      {/* The V-shaped flap */}
      <svg
        viewBox="0 0 640 270"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      >
        <defs>
          <pattern id="flapTexture" patternUnits="userSpaceOnUse" width="256" height="256">
            <rect width="256" height="256" fill={parchmentBg} />
            <filter id="flapNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="256" height="256" filter="url(#flapNoise)" opacity="0.1" />
          </pattern>
        </defs>
        <polygon
          points="0,0 640,0 320,270"
          fill={parchmentBg}
          stroke="rgba(61,40,23,0.08)"
          strokeWidth="1"
        />
        {/* Subtle fold line */}
        <line x1="0" y1="0" x2="320" y2="270" stroke="rgba(61,40,23,0.06)" strokeWidth="0.5" />
        <line x1="640" y1="0" x2="320" y2="270" stroke="rgba(61,40,23,0.06)" strokeWidth="0.5" />
      </svg>
    </motion.div>
  </motion.div>
);

// ── Main Page ─────────────────────────────────────────────────────────
const LetterPage = () => {
  const [phase, setPhase] = useState<Phase>(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Phase transitions
  useEffect(() => {
    // After 2s on seal, start opening
    const t1 = setTimeout(() => setPhase(1), 1000);
    // After opening animation (~1.5s), show chat
    const t2 = setTimeout(() => {
      setPhase(2);
      setGreeting(true);
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    const apiMessages = updated.filter(
      (m, i) => !(i === 0 && m.role === 'assistant' && m.content === 'What are you wondering about James?')
    );

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
      messages: apiMessages,
      onDelta: upsert,
      onDone: () => setIsStreaming(false),
      onError: (e) => {
        console.error(e);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Apologies — something went wrong. Please try again.' }]);
        setIsStreaming(false);
      },
    });
  }, [input, isStreaming, messages]);

  const isOpening = phase >= 1;
  const isChatVisible = phase >= 2;

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#000' }}>
      {/* Grain overlay */}
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

      {/* Single persistent card */}
      <div
        className="relative z-20 rounded-sm overflow-hidden"
        style={{
          ...letterCardStyle,
          width: 'min(640px, 90vw)',
          height: 'min(70vh, 600px)',
        }}
      >
        {/* Decorative border */}
        <div className="absolute inset-4 border rounded-sm pointer-events-none z-40" style={{ borderColor: 'rgba(61,40,23,0.08)' }} />

        {/* Envelope flap V */}
        <EnvelopeFlap open={isOpening} />

        {/* Seal — centered, peels off when opening */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30"
          style={{ perspective: '600px' }}
          animate={
            isOpening
              ? { opacity: 0, rotateX: -60, scale: 1.1, y: -40 }
              : { opacity: 1, rotateX: 0, scale: 1, y: 0 }
          }
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <WaxSeal />
          {/* Glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '140px', height: '140px',
              background: 'radial-gradient(circle, rgba(245,240,232,0.06) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Chat layer — revealed after opening */}
        <motion.div
          className="absolute inset-0 flex flex-col z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isChatVisible ? 1 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ pointerEvents: isChatVisible ? 'auto' : 'none' }}
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
      </div>
    </div>
  );
};

export default LetterPage;
