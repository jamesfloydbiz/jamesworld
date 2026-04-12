import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const fullText = "Welcome to James Floyd's World. Ask for what you're wondering here, or start with scrolling his ";
const suffix = "portfolio";

const SearchPage = () => {
  const [charIndex, setCharIndex] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (charIndex < fullText.length + suffix.length) {
      const timer = setTimeout(() => setCharIndex(i => i + 1), 40);
      return () => clearTimeout(timer);
    }
  }, [charIndex]);

  const displayedMain = fullText.slice(0, Math.min(charIndex, fullText.length));
  const displayedSuffix = charIndex > fullText.length
    ? suffix.slice(0, charIndex - fullText.length)
    : '';
  const showCursor = charIndex < fullText.length + suffix.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="w-full px-6 py-5 flex items-center">
        <img src="/logo.svg" alt="Logo" className="h-10 w-10 opacity-80" />
      </div>
      <div className="w-full" style={{ height: '1px', background: 'hsl(0 0% 100% / 0.12)' }} />

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ marginTop: '-4rem' }}>
        {/* Typewriter text */}
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
          {displayedMain}
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
          {showCursor && (
            <span className="inline-block w-px h-4 ml-0.5 align-middle" style={{ background: 'hsl(0 0% 100% / 0.5)', animation: 'blink 1s step-end infinite' }} />
          )}
        </p>

        {/* Search input */}
        <div className="w-full max-w-md">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            style={{
              border: '1px solid hsl(0 0% 100% / 0.2)',
              padding: '0.75rem 1rem',
              fontFamily: "'Lora', serif",
              fontSize: '0.9rem',
              letterSpacing: '0.02em',
            }}
          />
        </div>
      </div>

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
};

export default SearchPage;
