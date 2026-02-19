import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

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
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
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
      <p className="mt-3 text-[11px] italic font-serif text-[#555]">{caption}</p>
    </div>
  );
}

/* ─── Walking Character (static, scrolls with page) ─── */
function WalkingCharacter() {
  return (
    <div className="relative h-[32px] bg-[#f5f0e8] border-y border-black/10 overflow-hidden">
      <div className="absolute top-1/2 -translate-y-1/2 left-[12%]">
        <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
          <circle cx="10" cy="5" r="4" fill="#1a1a1a" />
          <rect x="7" y="10" width="6" height="10" rx="2" fill="#1a1a1a" />
          <rect x="6" y="20" width="3" height="6" rx="1" fill="#1a1a1a" />
          <rect x="11" y="20" width="3" height="6" rx="1" fill="#1a1a1a" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Site Links Section ─── */
const siteLinks = [
  { label: 'Story', path: '/story', desc: 'The full narrative — where it started, how it unfolded.' },
  { label: 'Projects', path: '/projects', desc: 'What I\'ve built and been part of building.' },
  { label: 'Builds', path: '/builds', desc: 'AI automations and operational systems I\'ve designed.' },
  { label: 'Content', path: '/content', desc: 'Writing, videos, and things I\'ve published.' },
  { label: 'Network', path: '/network', desc: 'The people and rooms that shaped the path.' },
  { label: 'Blueprints', path: '/blueprints', desc: 'Frameworks and playbooks for doing things differently.' },
  { label: 'Resume', path: '/resume', desc: 'The traditional view — roles, timelines, outcomes.' },
  { label: 'References', path: '/references', desc: 'What others have said.' },
  { label: 'Poems', path: '/poems', desc: 'Thoughts that needed a different format.' },
  { label: 'Memories', path: '/pictures', desc: 'Snapshots from the road.' },
  { label: 'Museum', path: '/museum', desc: 'The 3D gallery — walk through the world.' },
];

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

      {/* ─── NAV (fixed) ─── */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-[44px] flex items-center justify-between px-5 border-b border-black/10" style={{ background: '#f5f0e8' }}>
        <button onClick={handleBackToHub} className="flex items-center" aria-label="Home">
          <div className="w-7 h-7 bg-black rounded-none flex items-center justify-center">
            <img src="/logo.svg" alt="JF" className="w-5 h-5" />
          </div>
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors"
        >
          Menu
        </button>
      </nav>

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
                onClick={() => { setMenuOpen(false); handleBackToHub(); }}
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
      <main className="relative z-10 pt-[44px]">

        {/* Walking character strip (scrolls with page, not fixed) */}
        <WalkingCharacter />

        {/* ═══ 1. MASTHEAD / HERO ═══ */}
        <section className="px-5 md:px-12 pt-12 pb-8 max-w-5xl mx-auto">
          <Reveal>
            <h1 className="text-center text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] tracking-[0.04em] uppercase font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Times of James
            </h1>
          </Reveal>

          <div className="w-full h-px bg-black/15 my-4" />

          <Reveal delay={0.1}>
            <p className="text-center font-mono text-[9px] tracking-[0.3em] uppercase text-[#888]">
              Est. 2002 · Edition One · Connecting · Creating · Living
            </p>
          </Reveal>

          <div className="w-full h-px bg-black/10 my-6" />

          <Reveal delay={0.2}>
            <h2 className="text-[clamp(1.5rem,4vw,3rem)] leading-[1.1] tracking-[0.02em] font-bold max-w-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Man Who Showed Up With Nothing
            </h2>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-4 text-lg md:text-xl text-[#555] max-w-2xl leading-relaxed" style={{ fontFamily: "'EB Garamond', serif" }}>
              Maniacal innovator who went off the beaten path to connecting, creating, and living.
            </p>
          </Reveal>

          {/* Hero image */}
          <Reveal delay={0.4}>
            <div className="mt-8 overflow-hidden">
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
          items={['San Diego', 'Singapore', 'Hong Kong', 'Tokyo', 'Bangkok', 'Macleod Ganj', 'Dhaka', 'Chichén Itzá', 'Quito', 'New York', 'Los Angeles', 'Vancouver', 'Chicago', 'Miami', 'San Francisco', 'Palm Beach', 'Austin']}
          dark
        />

        {/* ═══ 3. THE STORY ═══ */}
        <section className="px-5 md:px-12 py-16 max-w-5xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-8">§ The Story</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-black/10">
            {[
              {
                headline: 'The Before',
                sub: 'No safety net. No map.',
                body: 'In 2020 I drove down to San Diego with everything I owned packed into a green 2002 Subaru Outback. I had no income, no connections, and no dreams.',
              },
              {
                headline: 'The Leap',
                sub: 'Cold emails. Obsession. The world opens.',
                body: 'When I hit the bottom I was laying on the carpet of my depressing apartment watching the fan go in circles. I joined a sales job, did 20,000 conversations and built ~40 sales people. Over the next few years of my life I sent cold emails, handwritten notes, and gifts. I sent myself around the world, and talked to the wisest people I could get access to all the while trying everything new I could.',
              },
              {
                headline: 'The Now',
                sub: 'They come to me now.',
                body: 'Now I have an extensive network of family offices, investors, creators, and everybody in between. I have done events around the United States for thousands of people, and worked with some of the most high-profile people and companies in the world. People from every walk of life reach out to get connected to people in my network, get advice on life, business, and health, and to work with me.',
              },
            ].map((col, i) => (
              <Reveal key={col.headline} delay={i * 0.15}>
                <div className="px-0 md:px-10 first:md:pl-0 last:md:pr-0 py-6 md:py-0">
                  <h3 className="text-xl font-bold tracking-wide mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {col.headline}
                  </h3>
                  <p className="text-xs font-mono tracking-[0.15em] uppercase text-[#888] mb-4">{col.sub}</p>
                  <p className="text-[15px] leading-[1.7] text-[#444]" style={{ fontFamily: "'EB Garamond', serif" }}>
                    {col.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Mini gallery row replacing pull quote */}
          <Reveal delay={0.5}>
            <div className="mt-12 pt-8 border-t border-black/10">
              <div className="grid grid-cols-4 gap-3">
                <div className="overflow-hidden">
                  <img src="/pictures/IMG_1341.jpeg" alt="" className="w-full h-24 object-cover grayscale hover:scale-[1.03] transition-transform duration-700" />
                </div>
                <div className="overflow-hidden">
                  <img src="/pictures/IMG_2488.jpeg" alt="" className="w-full h-24 object-cover grayscale hover:scale-[1.03] transition-transform duration-700" />
                </div>
                <div className="overflow-hidden">
                  <img src="/pictures/IMG_7136.jpeg" alt="" className="w-full h-24 object-cover grayscale hover:scale-[1.03] transition-transform duration-700" />
                </div>
                <div className="overflow-hidden">
                  <img src="/pictures/IMG_5430.jpeg" alt="" className="w-full h-24 object-cover grayscale hover:scale-[1.03] transition-transform duration-700" />
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 4. THE NUMBERS ═══ */}
        <section className="px-5 md:px-12 py-16 max-w-5xl mx-auto">
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
          items={['Keiretsu Forum', 'Jets & Capital', 'BetterWealth', 'Art Basel', 'Superbowl', 'F1 Grand Prix', 'The Amazon Jungle', 'The Golden Temple', 'Phoenix Marketing']}
          reverse
        />

        {/* ═══ 6. PHOTO GRID ═══ */}
        <section className="px-5 md:px-12 py-16 max-w-5xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-10">§ In the Field</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Reveal><PhotoCard src="/pictures/IMG_8922.jpg" caption="Austin, Texas · Living it up" /></Reveal>
            <Reveal delay={0.1}><PhotoCard src="/pictures/Jets_&_Capital_Miami_BTS_Day_0-83.jpeg" caption="Jets & Capital · Trump Doral · Miami" /></Reveal>
            <Reveal delay={0.2}><PhotoCard src="/pictures/IMG_1341.jpeg" caption="On the road" /></Reveal>
            <Reveal delay={0.3}><PhotoCard src="/pictures/IMG_2610.jpeg" caption="Connecting" /></Reveal>
          </div>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 7. EXPLORE THE WORLD ═══ */}
        <section className="px-5 md:px-12 py-16 max-w-5xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-10">§ Explore</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-black/10">
            {siteLinks.map((link, i) => (
              <Reveal key={link.path} delay={i * 0.04}>
                <button
                  onClick={() => navigate(link.path)}
                  className="w-full text-left px-0 md:px-6 py-4 first:md:pl-0 group border-b border-black/5 md:border-b-0"
                >
                  <span className="text-sm font-bold tracking-[0.1em] uppercase group-hover:text-[#4A5D23] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {link.label} →
                  </span>
                  <span className="block mt-1 text-[13px] text-[#777]" style={{ fontFamily: "'EB Garamond', serif" }}>
                    {link.desc}
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 8. CTA CLOSE ═══ */}
        <section className="px-5 md:px-12 py-20 text-center max-w-5xl mx-auto">
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
                <a href="https://www.instagram.com/jamesfloyd02/" target="_blank" rel="noopener noreferrer"
                  className="text-sm tracking-[0.1em] transition-colors hover:underline" style={{ color: '#4A5D23' }}>
                  → Follow the Journey
                </a>
              </div>
              <div>
                <a href="https://www.linkedin.com/in/jamesfloyd02/" target="_blank" rel="noopener noreferrer"
                  className="text-sm tracking-[0.1em] transition-colors hover:underline" style={{ color: '#6B4C3B' }}>
                  → Work or Connect
                </a>
              </div>
              <p className="mt-4 font-mono text-[8px] tracking-[0.25em] uppercase text-[#aaa]">
                Life → Instagram · Business → LinkedIn
              </p>
            </div>
          </Reveal>
        </section>

        {/* ═══ 9. FOOTER ═══ */}
        <footer className="border-t border-black/10 px-5 md:px-12 py-6 flex items-center justify-between max-w-5xl mx-auto">
          <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-[#888]">The Times of James</span>
          <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-[#aaa] hidden md:inline">Maniacal innovator. Unbeaten path.</span>
          <div className="w-5 h-5 bg-black flex items-center justify-center">
            <img src="/logo.svg" alt="JF" className="w-4 h-4" />
          </div>
        </footer>
      </main>
    </div>
  );
};

export default PortfolioPage;
