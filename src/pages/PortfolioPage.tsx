import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

/* ─── Walking Character ─── */
function WalkingCharacter() {
  return (
    <div className="fixed top-[44px] left-0 right-0 z-30 h-[32px] bg-[#f5f0e8] border-y border-black/10 overflow-hidden">
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        animate={{ x: ['0vw', '95vw', '0vw'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
          <circle cx="10" cy="5" r="4" fill="#1a1a1a" />
          <rect x="7" y="10" width="6" height="10" rx="2" fill="#1a1a1a" />
          <rect x="6" y="20" width="3" height="6" rx="1" fill="#1a1a1a" />
          <rect x="11" y="20" width="3" height="6" rx="1" fill="#1a1a1a" />
        </svg>
      </motion.div>
    </div>
  );
}

/* ─── Scroll Reveal Wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Ticker Strip ─── */
function Ticker({ items, dark = false, reverse = false }: { items: string[]; dark?: boolean; reverse?: boolean }) {
  const content = items.join(' · ');
  const doubled = `${content} · ${content} · ${content}`;
  return (
    <div className={`w-full overflow-hidden py-3 border-y ${dark ? 'bg-[#111] text-[#f5f0e8] border-[#333]' : 'bg-[#f5f0e8] text-[#1a1a1a] border-black/10'}`}>
      <motion.div
        className="whitespace-nowrap font-mono text-[10px] tracking-[0.25em] uppercase"
        animate={{ x: reverse ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {doubled}
      </motion.div>
    </div>
  );
}

/* ─── Photo Card ─── */
function PhotoCard({ src, caption }: { src: string; caption: string }) {
  return (
    <div className="group overflow-hidden">
      <div className="overflow-hidden">
        <img
          src={src}
          alt={caption}
          className="w-full h-auto grayscale transition-transform duration-[800ms] ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <p className="mt-2 text-[11px] italic font-serif text-[#555]">{caption}</p>
    </div>
  );
}

/* ─── Main Page ─── */
const PortfolioPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBackToHub = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen font-serif text-[#1a1a1a]" style={{ background: '#f5f0e8' }}>
      {/* Grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }} />

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-[44px] flex items-center justify-between px-5 border-b border-black/10" style={{ background: '#f5f0e8' }}>
        <button onClick={handleBackToHub} className="flex items-center gap-1" aria-label="Home">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,26 2,26" fill="#1a1a1a" />
            <text x="14" y="22" textAnchor="middle" fill="#f5f0e8" fontSize="9" fontWeight="bold" fontFamily="serif">JF</text>
          </svg>
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors"
        >
          Menu
        </button>
      </nav>

      {/* Walking character strip */}
      <WalkingCharacter />

      {/* ─── MENU OVERLAY ─── */}
      {menuOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: '#f5f0e8' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center space-y-5">
            {['Story', 'Projects', 'Content', 'Network', 'Blueprints', 'Resume', 'References', 'Poems', 'Memories'].map((item) => (
              <div key={item}>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(item === 'Memories' ? '/pictures' : `/${item.toLowerCase()}`);
                  }}
                  className="text-xl tracking-[0.15em] uppercase hover:text-[#4A5D23] transition-colors font-serif"
                >
                  {item}
                </button>
              </div>
            ))}
            <div className="pt-4">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleBackToHub();
                }}
                className="text-sm tracking-[0.15em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors"
              >
                Back to Gallery
              </button>
            </div>
            <button onClick={() => setMenuOpen(false)} className="mt-8 text-xs text-[#999] hover:text-[#1a1a1a] transition-colors">
              Close
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── CONTENT ─── */}
      <main className="relative z-10 pt-[76px]">

        {/* ═══ 1. MASTHEAD / HERO ═══ */}
        <section className="px-5 md:px-12 pt-12 pb-8">
          <Reveal>
            <h1 className="text-center text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] tracking-[0.04em] uppercase font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Times of James
            </h1>
          </Reveal>

          <div className="w-full h-px bg-black/15 my-4" />

          <Reveal delay={0.1}>
            <p className="text-center font-mono text-[9px] tracking-[0.3em] uppercase text-[#888]">
              Est. San Diego · Vol. I · Connecting · Creating · Living
            </p>
          </Reveal>

          <div className="w-full h-px bg-black/10 my-6" />

          <Reveal delay={0.2}>
            <h2 className="text-[clamp(1.5rem,4vw,3rem)] leading-[1.1] tracking-[0.02em] font-bold max-w-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Man Who Showed Up With Nothing
            </h2>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-4 text-lg md:text-xl italic text-[#555] max-w-2xl leading-relaxed" style={{ fontFamily: "'EB Garamond', serif" }}>
              "Maniacal innovator who took the unbeaten path to connecting, creating, and living."
            </p>
          </Reveal>

          {/* Hero image */}
          <Reveal delay={0.4}>
            <div className="mt-8 max-w-3xl overflow-hidden">
              <motion.img
                src="/pictures/Jets_&_Capital_Miami_BTS_Day_0-58.jpeg"
                alt="James Floyd"
                className="w-full h-auto grayscale"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.5}>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://www.instagram.com/jamesfloyd02/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-black/20 text-[12px] tracking-[0.2em] uppercase transition-colors hover:bg-black/5"
                style={{ color: '#4A5D23' }}
              >
                Follow the Journey →
              </a>
              <a
                href="https://www.linkedin.com/in/jamesfloyd02/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-black/20 text-[12px] tracking-[0.2em] uppercase transition-colors hover:bg-black/5"
                style={{ color: '#6B4C3B' }}
              >
                Work or Connect →
              </a>
            </div>
          </Reveal>

          <div className="w-full h-px bg-black/10 mt-10" />
        </section>

        {/* ═══ 2. CITIES TICKER ═══ */}
        <Ticker
          items={['San Diego', 'Singapore', 'Hong Kong', 'Tokyo', 'Bangkok', 'Mumbai', 'Dhaka', 'Mexico City', 'Quito', 'New York', 'Los Angeles', 'Vancouver', 'Chicago', 'Miami', 'San Francisco']}
          dark
        />

        {/* ═══ 3. THE STORY ═══ */}
        <section className="px-5 md:px-12 py-16">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-8">§ The Story</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-black/10">
            {[
              {
                headline: 'The Before',
                sub: 'No safety net. No map.',
                body: 'Food stamps. No college degree. A new city where I knew no one. Most would have gone home. I decided to figure it out.',
              },
              {
                headline: 'The Leap',
                sub: 'Cold emails. Obsession. The world opens.',
                body: 'A sales job attacked maniacally. Handwritten notes, cold outreach, gifts. Self-taught across fields. Then — one room at a time — the world started opening up across a dozen countries.',
              },
              {
                headline: 'The Now',
                sub: 'They come to me now.',
                body: 'Events for thousands. Rooms with some of the most influential investors on the planet. People from every walk of life reach out for advice on how to live, build, and invest.',
              },
            ].map((col, i) => (
              <Reveal key={col.headline} delay={i * 0.15}>
                <div className="px-0 md:px-6 first:md:pl-0 last:md:pr-0 py-6 md:py-0">
                  <h3 className="text-xl font-bold tracking-wide mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {col.headline}
                  </h3>
                  <p className="text-xs font-mono tracking-[0.15em] uppercase text-[#888] mb-3">{col.sub}</p>
                  <p className="text-sm leading-relaxed text-[#444]" style={{ fontFamily: "'EB Garamond', serif" }}>
                    {col.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Pull quote */}
          <Reveal delay={0.5}>
            <div className="mt-12 pt-8 border-t border-black/10">
              <blockquote className="text-center text-xl md:text-2xl italic text-[#333] max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: "'EB Garamond', serif" }}>
                "I speak the languages of many — and connect the ones who don't speak the same."
              </blockquote>
            </div>
          </Reveal>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 4. THE NUMBERS ═══ */}
        <section className="px-5 md:px-12 py-16">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-10">§ By the Numbers</p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-black/10">
            {[
              { num: '2,000', label: 'Attendees · Keiretsu Capital Expo' },
              { num: '$2T+', label: 'AUM in the room · Jets & Capital, NYC' },
              { num: '12+', label: 'Countries lived and worked in' },
              { num: '∞', label: 'Connections made and counting' },
            ].map((stat, i) => (
              <Reveal key={stat.num} delay={i * 0.1}>
                <div className="text-center px-4 py-4">
                  <p className="text-3xl md:text-5xl font-black leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {stat.num}
                  </p>
                  <p className="mt-2 font-mono text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-[#888]">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 5. CREDIBILITY TICKER ═══ */}
        <Reveal>
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] px-5 md:px-12 pt-12 pb-4">Rooms I've Been In</p>
        </Reveal>
        <Ticker
          items={['Keiretsu Forum', 'Jets & Capital', 'BetterWealth', 'Keiretsu Capital Expo', 'Aircraft Carrier NYC']}
          reverse
        />

        {/* ═══ 6. PHOTO GRID ═══ */}
        <section className="px-5 md:px-12 py-16">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-10">§ In the Field</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reveal><PhotoCard src="/pictures/IMG_8922.jpg" caption="Keiretsu Capital Expo · 2,000 Attendees" /></Reveal>
            <Reveal delay={0.1}><PhotoCard src="/pictures/Jets_&_Capital_Miami_BTS_Day_0-83.jpeg" caption="Jets & Capital · Aircraft Carrier · NYC" /></Reveal>
            <Reveal delay={0.2}><PhotoCard src="/pictures/IMG_1341.jpeg" caption="On the road" /></Reveal>
            <Reveal delay={0.3}><PhotoCard src="/pictures/IMG_2610.jpeg" caption="Connecting" /></Reveal>
          </div>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 7. CTA CLOSE ═══ */}
        <section className="px-5 md:px-12 py-20 text-center">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-8">§ Get in Touch</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xl md:text-2xl italic text-[#444] max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "'EB Garamond', serif" }}>
              Whether you're building, investing, or just figuring out your next move —
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-3xl md:text-4xl font-black tracking-[0.05em] uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
              Let's Talk.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 space-y-3">
              <div>
                <a
                  href="https://www.instagram.com/jamesfloyd02/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm tracking-[0.1em] transition-colors hover:underline"
                  style={{ color: '#4A5D23' }}
                >
                  → Follow the Journey
                </a>
              </div>
              <div>
                <a
                  href="https://www.linkedin.com/in/jamesfloyd02/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm tracking-[0.1em] transition-colors hover:underline"
                  style={{ color: '#6B4C3B' }}
                >
                  → Work or Connect
                </a>
              </div>
              <p className="mt-4 font-mono text-[8px] tracking-[0.25em] uppercase text-[#aaa]">
                Life → Instagram · Business → LinkedIn
              </p>
            </div>
          </Reveal>
        </section>

        {/* ═══ 8. FOOTER ═══ */}
        <footer className="border-t border-black/10 px-5 md:px-12 py-6 flex items-center justify-between">
          <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-[#888]">The Times of James</span>
          <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-[#aaa] hidden md:inline">Maniacal innovator. Unbeaten path.</span>
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,26 2,26" fill="#1a1a1a" />
            <text x="14" y="22" textAnchor="middle" fill="#f5f0e8" fontSize="9" fontWeight="bold" fontFamily="serif">JF</text>
          </svg>
        </footer>
      </main>
    </div>
  );
};

export default PortfolioPage;
