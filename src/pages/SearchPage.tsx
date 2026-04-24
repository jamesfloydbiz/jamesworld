import { useState, useEffect, useRef, Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';
import { Send, ArrowRight } from 'lucide-react';

// Parse markdown-style links [text](url) and render as React elements.
// Internal (starts with /) → React Router Link. External → <a target="_blank">.
// Bare URLs like jamesfloyd.substack.com are auto-linked too.
const LINK_STYLE: React.CSSProperties = {
  color: 'hsl(0 0% 100% / 0.95)',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  textDecorationThickness: '1px',
  fontWeight: 500,
  cursor: 'pointer',
};

function renderMessage(text: string): ReactNode {
  const out: ReactNode[] = [];
  let key = 0;
  // Matches [label](url) OR a bare URL like example.com or https://example.com
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|(\bhttps?:\/\/[^\s)]+)|(\b[a-zA-Z0-9-]+\.(?:com|org|net|io|co|xyz|dev|app|ai|me)(?:\/[^\s)]*)?)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      out.push(<Fragment key={key++}>{text.slice(lastIndex, m.index)}</Fragment>);
    }
    const [full, mdLabel, mdUrl, bareHttp, bareDomain] = m;
    if (mdLabel && mdUrl) {
      if (mdUrl.startsWith('/')) {
        out.push(<Link key={key++} to={mdUrl} style={LINK_STYLE}>{mdLabel}</Link>);
      } else {
        const url = /^https?:\/\//i.test(mdUrl) ? mdUrl : `https://${mdUrl}`;
        out.push(
          <a key={key++} href={url} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
            {mdLabel}
          </a>
        );
      }
    } else if (bareHttp) {
      out.push(
        <a key={key++} href={bareHttp} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          {bareHttp}
        </a>
      );
    } else if (bareDomain) {
      out.push(
        <a key={key++} href={`https://${bareDomain}`} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          {bareDomain}
        </a>
      );
    }
    lastIndex = m.index + full.length;
  }
  if (lastIndex < text.length) {
    out.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }
  return out;
}

const line1 = "Welcome to James Floyd's World.";
const line2 = "Ask for what you're wondering here, or start with scrolling his ";
const suffix = "portfolio";

const SearchPage = () => {
  const [charIndex, setCharIndex] = useState(0);
  const { messages, isLoading, navSuggestion, sendMessage } = useSearch();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalLength = line1.length + line2.length + suffix.length;

  useEffect(() => {
    if (charIndex < totalLength) {
      const timer = setTimeout(() => setCharIndex(i => i + 1), 40);
      return () => clearTimeout(timer);
    }
  }, [charIndex, totalLength]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const displayedLine1 = line1.slice(0, Math.min(charIndex, line1.length));
  const line2Start = line1.length;
  const displayedLine2 = charIndex > line2Start
    ? line2.slice(0, Math.min(charIndex - line2Start, line2.length))
    : '';
  const suffixStart = line1.length + line2.length;
  const displayedSuffix = charIndex > suffixStart
    ? suffix.slice(0, charIndex - suffixStart)
    : '';
  const showCursor = charIndex < totalLength;

  const hasConversation = messages.length > 0;

  const renderInput = (placeholder: string) => (
    <div className="w-full max-w-md relative mx-auto">
      {/* Edge glow orbs that drift inward toward search bar */}
      {!hasConversation && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="edge-glow-orb edge-glow-orb-tl" />
          <div className="edge-glow-orb edge-glow-orb-tr" />
          <div className="edge-glow-orb edge-glow-orb-bl" />
          <div className="edge-glow-orb edge-glow-orb-br" />
        </div>
      )}

      {/* Local glow orbs near search bar */}
      <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
        <div className="search-glow-orb search-glow-orb-1" />
        <div className="search-glow-orb search-glow-orb-2" />
        <div className="search-glow-orb search-glow-orb-3" />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="flex items-center" style={{
          border: '1px solid hsl(0 0% 100% / 0.2)',
          borderRadius: '9999px',
          padding: '0.5rem 0.75rem 0.5rem 1.25rem',
          background: 'hsl(0 0% 0% / 0.6)',
          backdropFilter: 'blur(8px)',
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none search-input"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: '0.9rem',
              letterSpacing: '0.02em',
              color: 'hsl(0 0% 100% / 0.85)',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="ml-2 transition-opacity disabled:opacity-30"
            style={{ color: 'hsl(0 0% 100% / 0.5)' }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="w-full px-6 py-5 flex items-center">
        <Link to="/">
          <img src="/logo.svg" alt="Logo" className="h-10 w-10 opacity-80" />
        </Link>
      </div>
      <div className="w-full" style={{ height: '1px', background: 'hsl(0 0% 100% / 0.12)' }} />

      {!hasConversation ? (
        /* Initial centered state */
        <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ marginTop: '-4rem' }}>
          <p
            className="max-w-lg text-center mb-3"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'hsl(0 0% 100% / 0.6)',
              fontWeight: 400,
            }}
          >
            {displayedLine1}
            {charIndex <= line1.length && showCursor && (
              <span className="inline-block w-px h-4 ml-0.5 align-middle" style={{ background: 'hsl(0 0% 100% / 0.5)', animation: 'blink 1s step-end infinite' }} />
            )}
          </p>

          {charIndex > line1.length && (
            <p
              className="max-w-lg text-center mb-8"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'hsl(0 0% 100% / 0.6)',
                fontWeight: 400,
              }}
            >
              {displayedLine2}
              {displayedSuffix && (
                <Link
                  to="/portfolio"
                  className="underline underline-offset-4 transition-colors duration-300"
                  style={{ color: 'hsl(0 0% 100% / 0.85)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'hsl(0 0% 100%)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'hsl(0 0% 100% / 0.85)')}
                >
                  {displayedSuffix}
                </Link>
              )}
              {charIndex > line1.length && showCursor && (
                <span className="inline-block w-px h-4 ml-0.5 align-middle" style={{ background: 'hsl(0 0% 100% / 0.5)', animation: 'blink 1s step-end infinite' }} />
              )}
            </p>
          )}

          {renderInput('Search...')}
        </div>
      ) : (
        /* Conversation state — input pinned bottom */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="w-full max-w-md mx-auto space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  <div
                    className="inline-block px-4 py-2 rounded-xl text-sm leading-relaxed max-w-[90%]"
                    style={{
                      background: msg.role === 'user' ? 'hsl(0 0% 100% / 0.06)' : 'transparent',
                      color: msg.role === 'user' ? 'hsl(0 0% 100% / 0.7)' : 'hsl(0 0% 100% / 0.6)',
                      fontFamily: "'Lora', serif",
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {renderMessage(msg.content)}
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {navSuggestion && !isLoading && (
                (() => {
                  const isExternal = /^https?:\/\//i.test(navSuggestion.route);
                  const cardProps = {
                    className: "flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 hover:bg-white/10 mt-2",
                    style: {
                      background: 'hsl(0 0% 100% / 0.05)',
                      color: 'hsl(0 0% 100% / 0.9)',
                      border: '1px solid hsl(0 0% 100% / 0.15)',
                      fontFamily: "'Lora', serif",
                    } as React.CSSProperties,
                  };
                  const content = (
                    <>
                      <span>Go to {navSuggestion.label}</span>
                      <ArrowRight size={16} />
                    </>
                  );
                  return isExternal ? (
                    <a href={navSuggestion.route} target="_blank" rel="noopener noreferrer" {...cardProps}>
                      {content}
                    </a>
                  ) : (
                    <Link to={navSuggestion.route} {...cardProps}>
                      {content}
                    </Link>
                  );
                })()
              )}
              {isLoading && (
                <div className="flex gap-1.5 py-2 pl-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(0 0% 100% / 0.25)', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="w-full px-6 pb-6 pt-2">
            {renderInput('follow-up')}
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }

        .search-input::placeholder {
          color: hsl(0 0% 100% / 0.35);
          font-style: italic;
        }

        .edge-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0;
          pointer-events: none;
          background: radial-gradient(circle, hsl(0 0% 100% / 0.12), transparent 70%);
        }

        .edge-glow-orb-tl {
          width: 200px; height: 200px;
          top: 5%; left: 0%;
          animation: edgeDriftTL 10s ease-in-out infinite;
        }
        .edge-glow-orb-tr {
          width: 180px; height: 180px;
          top: 10%; right: 0%;
          animation: edgeDriftTR 12s ease-in-out 1s infinite;
        }
        .edge-glow-orb-bl {
          width: 160px; height: 160px;
          bottom: 10%; left: 5%;
          animation: edgeDriftBL 11s ease-in-out 3s infinite;
        }
        .edge-glow-orb-br {
          width: 190px; height: 190px;
          bottom: 5%; right: 0%;
          animation: edgeDriftBR 13s ease-in-out 2s infinite;
        }

        @keyframes edgeDriftTL {
          0%, 100% { opacity: 0; transform: translate(-30%, -20%) scale(1); }
          40% { opacity: 0.4; transform: translate(30vw, 25vh) scale(0.7); }
          70% { opacity: 0.15; transform: translate(20vw, 15vh) scale(0.9); }
        }
        @keyframes edgeDriftTR {
          0%, 100% { opacity: 0; transform: translate(30%, -20%) scale(1); }
          45% { opacity: 0.35; transform: translate(-25vw, 30vh) scale(0.6); }
          75% { opacity: 0.1; transform: translate(-15vw, 20vh) scale(0.8); }
        }
        @keyframes edgeDriftBL {
          0%, 100% { opacity: 0; transform: translate(-20%, 30%) scale(1); }
          50% { opacity: 0.3; transform: translate(25vw, -25vh) scale(0.7); }
        }
        @keyframes edgeDriftBR {
          0%, 100% { opacity: 0; transform: translate(20%, 20%) scale(1); }
          35% { opacity: 0.35; transform: translate(-30vw, -20vh) scale(0.6); }
          65% { opacity: 0.15; transform: translate(-20vw, -15vh) scale(0.8); }
        }

        .search-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0;
          pointer-events: none;
          background: radial-gradient(circle, hsl(0 0% 100% / 0.15), transparent 70%);
        }

        .search-glow-orb-1 {
          width: 120px; height: 120px;
          top: -40px; left: -60px;
          animation: glowDrift1 8s ease-in-out infinite;
        }
        .search-glow-orb-2 {
          width: 100px; height: 100px;
          bottom: -30px; right: -50px;
          animation: glowDrift2 10s ease-in-out 2s infinite;
        }
        .search-glow-orb-3 {
          width: 80px; height: 80px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: glowDrift3 12s ease-in-out 4s infinite;
        }

        @keyframes glowDrift1 {
          0%, 100% { opacity: 0; transform: translate(-20px, -30px) scale(0.8); }
          30% { opacity: 0.5; transform: translate(40px, 10px) scale(1.2); }
          60% { opacity: 0.3; transform: translate(80px, -10px) scale(1); }
        }
        @keyframes glowDrift2 {
          0%, 100% { opacity: 0; transform: translate(30px, 20px) scale(0.9); }
          40% { opacity: 0.4; transform: translate(-30px, -20px) scale(1.1); }
          70% { opacity: 0.2; transform: translate(-60px, 10px) scale(1); }
        }
        @keyframes glowDrift3 {
          0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          50% { opacity: 0.35; transform: translate(-30%, -60%) scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default SearchPage;
