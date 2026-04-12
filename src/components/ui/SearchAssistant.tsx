import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, X, ArrowRight, Send } from 'lucide-react';

const SearchAssistant = () => {
  const location = useLocation();
  const { messages, isLoading, isOpen, navSuggestion, setIsOpen, sendMessage } = useSearch();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSearchPage = location.pathname === '/search';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  if (isSearchPage) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: 'hsl(0 0% 8%)',
            border: '1px solid hsl(0 0% 100% / 0.15)',
            color: 'hsl(0 0% 100% / 0.6)',
          }}
          aria-label="Open assistant"
        >
          <MessageCircle size={18} />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed top-4 right-4 z-50 flex flex-col"
          style={{
            width: '340px',
            maxHeight: '480px',
            background: 'hsl(0 0% 4%)',
            border: '1px solid hsl(0 0% 100% / 0.12)',
            borderRadius: '12px',
            fontFamily: "'Lora', serif",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid hsl(0 0% 100% / 0.08)' }}>
            <Link
              to="/search"
              className="text-xs transition-colors duration-200"
              style={{ color: 'hsl(0 0% 100% / 0.5)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              onClick={() => setIsOpen(false)}
            >
              Full search
            </Link>
            <button onClick={() => setIsOpen(false)} style={{ color: 'hsl(0 0% 100% / 0.4)' }} className="hover:opacity-80 transition-opacity">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: '320px', minHeight: '80px' }}>
            {messages.length === 0 && (
              <p className="text-xs" style={{ color: 'hsl(0 0% 100% / 0.35)' }}>Ask anything about James or this site.</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className="inline-block px-3 py-2 rounded-lg text-xs leading-relaxed max-w-[85%]"
                  style={{
                    background: msg.role === 'user' ? 'hsl(0 0% 100% / 0.08)' : 'transparent',
                    color: msg.role === 'user' ? 'hsl(0 0% 100% / 0.8)' : 'hsl(0 0% 100% / 0.6)',
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-invert"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {navSuggestion && (
              <Link
                to={navSuggestion.route}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors duration-200"
                style={{ background: 'hsl(0 0% 100% / 0.06)', color: 'hsl(0 0% 100% / 0.8)', border: '1px solid hsl(0 0% 100% / 0.1)' }}
              >
                <ArrowRight size={14} />
                Go to {navSuggestion.label}
              </Link>
            )}
            {isLoading && (
              <div className="flex gap-1 py-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(0 0% 100% / 0.3)', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="px-3 py-3" style={{ borderTop: '1px solid hsl(0 0% 100% / 0.08)' }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 bg-transparent outline-none text-xs"
                style={{ color: 'hsl(0 0% 100% / 0.8)', fontFamily: "'Lora', serif" }}
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="transition-opacity disabled:opacity-30" style={{ color: 'hsl(0 0% 100% / 0.5)' }}>
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default SearchAssistant;
