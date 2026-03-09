import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ─── Scroll Reveal Wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: {children: React.ReactNode;className?: string;delay?: number;}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}>
      {children}
    </motion.div>);
}

/* ─── Ticker Strip ─── */
function Ticker({ items, dark = false, reverse = false }: {items: string[];dark?: boolean;reverse?: boolean;}) {
  const content = items.join(' · ');
  const doubled = `${content} · ${content} · ${content}`;
  return (
    <div className={`w-full overflow-hidden py-3 border-y ${dark ? 'bg-[#111] text-[#f5f0e8] border-[#333]' : 'bg-[#f5f0e8] text-[#1a1a1a] border-black/10'}`}>
      <motion.div
        className="whitespace-nowrap font-mono text-[10px] tracking-[0.25em] uppercase"
        animate={{ x: reverse ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}>
        {doubled}
      </motion.div>
    </div>);
}

/* ─── Logos Scroll Bar ─── */
const logos = [
{ src: '/logos/loeb_nyc.png', alt: 'Loeb NYC' },
{ src: '/logos/blue_devil.png', alt: 'Blue Devil' },
{ src: '/logos/jacob_green.png', alt: 'Jacob Green Charity Golf' },
{ src: '/logos/jets.png', alt: 'Jets & Capital' },
{ src: '/logos/keiretsu.png', alt: 'Keiretsu Forum' },
{ src: '/logos/betterwealth.png', alt: 'BetterWealth' },
{ src: '/logos/champions.jpg', alt: 'Champions of Change' },
{ src: '/logos/sounders_fc.png', alt: 'Seattle Sounders' },
{ src: '/logos/seahawks.png', alt: 'Seahawks' }];


function LogosBar() {
  const logosRow = [...logos, ...logos, ...logos];
  return (
    <div className="w-full overflow-hidden py-6 border-y border-black/10 bg-[#f5f0e8]">
      <motion.div
        className="flex items-center gap-12 whitespace-nowrap"
        animate={{ x: ['-33.33%', '0%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
        {logosRow.map((logo, i) =>
        <img
          key={`${logo.alt}-${i}`}
          src={logo.src}
          alt={logo.alt}
          className="h-10 w-auto grayscale opacity-70 hover:opacity-100 transition-opacity duration-300 flex-shrink-0"
          style={{ mixBlendMode: 'multiply' }}
          loading="lazy" />

        )}
      </motion.div>
    </div>);

}

/* ─── Photo Card ─── */
function PhotoCard({ src, caption }: {src: string;caption: string;}) {
  return (
    <div className="group overflow-hidden">
      <div className="overflow-hidden">
        <img
          src={src}
          alt={caption}
          className="w-full h-auto grayscale transition-transform duration-[800ms] ease-out group-hover:scale-[1.03]"
          loading="lazy" />
      </div>
      <p className="mt-3 text-[11px] italic font-serif text-[#555]">{caption}</p>
    </div>);
}

/* ─── Walking Character (moves with scroll like other pages) ─── */
function WalkingCharacter({ progress }: {progress: number;}) {
  const xPosition = 5 + progress * 90;
  return (
    <div className="relative h-[32px] bg-[#f5f0e8] border-y border-black/10 overflow-hidden">
      <div className="absolute top-1/2 -translate-y-1/2 left-[2%] w-4 h-6 border border-black/15 rounded-t-full" />
      <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${xPosition}%` }}>
        <svg width="14" height="26" viewBox="0 0 14 26" fill="none" className="-translate-x-1/2">
          <circle cx="7" cy="3.5" r="3.5" fill="#1a1a1a" />
          <ellipse cx="7" cy="16" rx="3.5" ry="8" fill="#1a1a1a" />
        </svg>
      </div>
    </div>);
}

/* ─── Site Links Section ─── */
const siteLinks = [
{ label: 'Story', path: '/story', desc: 'The full narrative — where it started, how it unfolded.' },
{ label: 'Projects', path: '/projects', desc: 'What James has built and been part of building.' },
{ label: 'Builds', path: '/builds', desc: 'AI automations and operational systems James has designed.' },
{ label: 'Content', path: '/content', desc: 'Writing, videos, and things James has published.' },
{ label: 'Network', path: '/network', desc: 'The values that made the path, and how to get in touch.' },
{ label: 'Blueprints', path: '/blueprints', desc: 'Frameworks and playbooks for doing things differently.' },
{ label: 'Resume', path: '/resume', desc: 'The traditional view — roles, timelines, outcomes.' },
{ label: 'References', path: '/references', desc: 'What others have said about James.' },
{ label: 'Poems', path: '/poems', desc: 'Thoughts that needed a different format.' },
{ label: 'Memories', path: '/pictures', desc: 'Snapshots from the road.' },
{ label: 'Museum', path: '/museum', desc: 'The 3D gallery — walk through the world.' }];


/* ─── Main Page ─── */
const PortfolioPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToHub = () => {
    navigate('/');
  };

  const menuItems = [
    { label: "Story", path: "/story" },
    { 
      label: "Projects", 
      path: "/projects",
      subItems: [
        { label: "Portfolio", path: "/portfolio" },
        { label: "Resume", path: "/resume" },
        { label: "References", path: "/references" }
      ]
    },
    { 
      label: "Content", 
      path: "/content",
      subItems: [
        { label: "Poems", path: "/poems" },
        { label: "Memories", path: "/pictures" }
      ]
    },
    { label: "Network", path: "/network" },
    { label: "Blueprints", path: "/blueprints" },
  ];

  return (
    <div className="relative min-h-screen font-serif text-[#1a1a1a]" style={{ background: '#f5f0e8' }}>
      {/* Grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }} />

      {/* ─── NAV (fixed) ─── */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-[44px] flex items-center justify-between px-5 border-b border-black/10" style={{ background: '#f5f0e8' }}>
        <button onClick={handleBackToHub} className="flex items-center" aria-label="Home">
          <img src="/images/JF_logo_transparent-2.png" alt="James Floyd logo" className="w-7 h-7" />
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors">
          Menu
        </button>
      </nav>

      {/* ─── MENU OVERLAY ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: '#f5f0e8' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <nav className="text-center">
              <ul className="space-y-6">
                {menuItems.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex flex-col items-center"
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(item.path);
                      }}
                      className="text-xl tracking-[0.15em] uppercase hover:text-[#4A5D23] transition-colors font-serif"
                    >
                      {item.label}
                    </button>
                    <AnimatePresence>
                      {item.subItems && hoveredItem === item.label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="py-2 space-y-4 mt-2 flex flex-col items-center">
                            {item.subItems.map(sub => (
                              <button
                                key={sub.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpen(false);
                                  navigate(sub.path);
                                }}
                                className="text-[1.1rem] tracking-wider uppercase text-[#888]/70 hover:text-[#4A5D23] transition-colors"
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: menuItems.length * 0.05 }}
                  className="pt-6"
                >
                  <button
                    onClick={() => {setMenuOpen(false);handleBackToHub();}}
                    className="text-sm tracking-[0.15em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors"
                  >
                    Back to Gallery
                  </button>
                </motion.li>
              </ul>
              <button
                onClick={() => setMenuOpen(false)}
                className="mt-12 text-xs text-[#999] hover:text-[#1a1a1a] transition-colors"
              >
                Close
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CONTENT ─── */}
      <main className="relative z-10 pt-[44px]">

        {/* Walking character strip */}
        <WalkingCharacter progress={scrollProgress} />

        {/* ═══ 1. MASTHEAD / HERO ═══ */}
        <section className="px-5 md:px-12 pt-12 pb-8 max-w-5xl mx-auto">
          <Reveal>
            <h1 className="text-center text-[clamp(1.8rem,7vw,5.5rem)] leading-[0.9] tracking-[0.04em] uppercase font-black whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Times of James
            </h1>
          </Reveal>

          <div className="w-full h-px bg-black/15 my-4" />

          <Reveal delay={0.1}>
            <p className="text-center font-mono text-[9px] tracking-[0.3em] uppercase text-[#888]">EST. 2002 · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} · CONNECTING · CREATING · LIVING
            </p>
          </Reveal>

          <div className="w-full h-px bg-black/10 my-6" />

          <Reveal delay={0.2}>
            <h2 className="text-[clamp(1.5rem,4vw,3rem)] leading-[1.1] tracking-[0.02em] font-bold max-w-4xl text-center mx-auto" style={{ fontFamily: "'Playfair Display', serif" }}>
              Winging It at the Highest Level
            </h2>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-4 text-lg md:text-xl text-[#555] max-w-4xl leading-relaxed text-center mx-auto" style={{ fontFamily: "'EB Garamond', serif" }}>A maniacal innovator who went off the beaten path to connect, create, and live.

            </p>
          </Reveal>

          {/* Hero image */}
          <Reveal delay={0.4}>
            <div className="mt-8 overflow-hidden">
              <motion.img
                src="/pictures/Jets_&_Capital_Miami_BTS_Day_0-58.jpeg"
                alt="James Floyd at Jets and Capital Miami networking event"
                className="w-full h-auto grayscale"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.5}>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://www.instagram.com/jamesfloydsworld"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-black/20 text-[12px] tracking-[0.2em] uppercase transition-colors hover:bg-black/5"
                style={{ color: '#4A5D23' }}>
                Follow the Journey →
              </a>
              <a
                href="https://www.linkedin.com/in/jamesfloydl/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-black/20 text-[12px] tracking-[0.2em] uppercase transition-colors hover:bg-black/5"
                style={{ color: '#6B4C3B' }}>
                Work or Connect →
              </a>
            </div>
          </Reveal>

          <div className="w-full h-px bg-black/10 mt-10" />
        </section>

        {/* ═══ 2. CITIES TICKER (right-to-left) ═══ */}
        <Ticker
          items={['San Diego', 'Singapore', 'Hong Kong', 'Tokyo', 'Bangkok', 'Macleod Ganj', 'Dhaka', 'Chichén Itzá', 'Quito', 'New York', 'Los Angeles', 'Vancouver', 'Chicago', 'Miami', 'San Francisco', 'Palm Beach', 'Austin']}
          dark
          reverse />

        {/* ═══ 3. THE STORY + IN THE FIELD PHOTOS ═══ */}
        <section className="px-5 md:px-12 py-16 max-w-5xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-8">§ The Story</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-black/10">
            {[
            {
              headline: 'The Before',
              sub: 'No safety net. No map.',
              body: 'In 2020 James drove down to San Diego with everything he owned packed into a green 2002 Subaru Outback. He had no income, no connections, and no dreams.'
            },
            {
              headline: 'The Leap',
              sub: 'Cold emails. Obsession. The world opens.',
              body: 'When James hit the bottom he was laying on the carpet of his depressing apartment watching the fan go in circles. He joined a sales job, did 20,000 conversations and built ~40 sales people. Over the next few years of his life he sent cold emails, handwritten notes, and gifts. He sent himself around the world, and talked to the wisest people he could get access to all the while trying everything new he could.'
            },
            {
              headline: 'The Now',
              sub: 'They come to me now.',
              body: 'Now James has an extensive network of family offices, investors, creators, and everybody in between. He has done events around the United States for thousands of people, and worked with some of the most high-profile people and companies in the world. People from every walk of life reach out to get connected to people in his network, get advice on life, business, and health, and to work with him.'
            }].map((col, i) =>
            <Reveal key={col.headline} delay={i * 0.15}>
                <div className="px-0 md:px-10 first:md:pl-0 last:md:pr-0 py-6 md:py-0">
                  <h3 className="text-xl font-bold tracking-wide mb-2 px-[10px]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {col.headline}
                  </h3>
                  <p className="text-xs font-mono tracking-[0.15em] uppercase text-[#888] mb-4 px-[10px]">{col.sub}</p>
                  <p className="text-[15px] leading-[1.7] text-[#444] py-[5px] px-[10px]" style={{ fontFamily: "'EB Garamond', serif" }}>
                    {col.body}
                  </p>
                </div>
              </Reveal>
            )}
          </div>

          {/* In the Field photos — directly under the story */}
          <Reveal delay={0.5}>
            <div className="mt-12 pt-8 border-t border-black/10">
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-6">In the Field</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                { src: '/pictures/IMG_0647.jpg', caption: 'Private Security for Byron Donald' },
                { src: '/pictures/IMG_1311.jpeg', caption: 'Campfires, songs, and quality conversations' },
                { src: '/pictures/IMG_1978_Original.jpg', caption: 'Jets and Capital Miami' },
                { src: '/pictures/IMG_4347.jpeg', caption: 'Relationships with extraordinary people produce exponential returns' }].
                map((photo, i) =>
                <div key={photo.src} className="overflow-hidden">
                    <img
                    src={photo.src}
                    alt={photo.caption}
                    className={`w-full grayscale hover:scale-[1.03] transition-transform duration-700 ${i === 1 ? 'h-[280px] md:h-[320px] object-cover object-center' : 'h-[280px] md:h-[320px] object-cover'}`}
                    loading="lazy" />

                    <p className="mt-2 text-[10px] italic font-serif text-[#555] leading-snug">{photo.caption}</p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 4. LOGOS BAR ("Rooms I've Been In") ═══ */}
        <section className="max-w-5xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] px-5 md:px-12 pt-12 pb-4">Organizations James Has Worked With</p>
          </Reveal>
        </section>
        <LogosBar />

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 5. NOTABLE DISPATCHES ═══ */}
        <section className="px-5 md:px-12 py-16 max-w-5xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-10">§ Field Notes</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-black/10">
            {[
            {
              headline: "48 Hours, 500 Guests",
              body: "When Trump's arrival forced a 500-person gala to completely restructure with 24 hours notice, James wrote the cold-call scripts, rallied the team, and helped turn what could have been a disaster into what guests called 'double the fun.' Chaos is just an opportunity with bad PR."
            },
            {
              headline: "The Elder in the Amazon",
              body: "Deep in the Amazon, James spent a day working alongside a 94-year-old tribal elder — farming, listening, communicating entirely in Spanish. No agenda. No pitch. Just presence. She never left that jungle, and she had more peace than anyone he'd met in any boardroom. That day redefined what success means to him."
            },
            {
              headline: "No, Not That Island",
              body: "A cold email. A yes. A weekend on an island with one of the most connected builders in the world. They hiked, cold plunged, and talked for hours. It was a breakthrough, where James realized nobody is a hero, so just make yourself yours."
            }].
            map((dispatch, i) =>
            <Reveal key={dispatch.headline} delay={i * 0.15}>
                <div className="py-6 md:py-0 pl-[10px] pr-[10px]">
                  <h3 className="text-lg font-bold tracking-wide mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {dispatch.headline}
                  </h3>
                  <p className="text-[15px] leading-[1.7] text-[#444]" style={{ fontFamily: "'EB Garamond', serif" }}>
                    {dispatch.body}
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 6. MESSAGE FROM JAMES ═══ */}
        <section className="px-5 md:px-12 py-16 max-w-5xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-10">§ A Message from James</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="max-w-2xl mx-auto md:pl-12 border-l-2 border-black/10">
              <p className="text-lg italic text-[#555] mb-6" style={{ fontFamily: "'EB Garamond', serif" }}>
                Dear reader,
              </p>
              <p className="text-[15px] leading-[1.8] text-[#444] mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>If you've scrolled this far, you are curious. I am too.

              </p>
              <p className="text-[15px] leading-[1.8] text-[#444] mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>There's a lot more to know about me than what I can fit here, so here is what you need to know.

              </p>
              <p className="text-[15px] leading-[1.8] text-[#444] mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>My greatest strength is the depth at which I care. About others and about myself.

              </p>
              <p className="text-[15px] leading-[1.8] text-[#444] mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>
                Including you.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#444] mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>My network is vast, and my experience even more so, but I can't promise to lead you where you want to go. I also can't follow you, because you do not know where I want to go.

              </p>
              <p className="text-[15px] leading-[1.8] text-[#444] mb-6" style={{ fontFamily: "'EB Garamond', serif" }}>I will however, walk alongside you. It would be an honor if you joined the ranks of people who have walked alongside me.

              </p>
              <p className="text-sm font-bold tracking-[0.1em] uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                — James Floyd
              </p>
            </div>
          </Reveal>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 7. CTA — OLD-TIMEY CLASSIFIED AD ═══ */}
        <section className="px-5 md:px-12 py-20 max-w-5xl mx-auto flex justify-center">
          <Reveal>
            <div className="border-2 border-black/80 p-8 md:p-12 max-w-lg text-center" style={{ background: '#f5f0e8' }}>
              <div className="border border-black/30 p-6 md:p-8">
                <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#888] mb-3">— Classified —</p>
                <h3 className="text-2xl md:text-3xl font-black tracking-[0.05em] uppercase mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Seeking: Curiosity
                </h3>
                <div className="w-12 h-px bg-black/30 mx-auto mb-4" />
                <p className="text-[14px] leading-[1.7] text-[#444] mb-6 italic" style={{ fontFamily: "'EB Garamond', serif" }}>
                  Builders, investors, creators, and those who refuse to stay in one lane. If you are any of the above and wish to correspond, the publisher welcomes your inquiry.
                </p>
                <div className="space-y-2">
                  <a href="https://www.instagram.com/jamesfloydsworld" target="_blank" rel="noopener noreferrer"
                  className="block text-[11px] tracking-[0.2em] uppercase transition-colors hover:underline" style={{ color: '#4A5D23' }}>
                    ✦ Follow the Journey — Instagram
                  </a>
                  <a href="https://www.linkedin.com/in/jamesfloydl/" target="_blank" rel="noopener noreferrer"
                  className="block text-[11px] tracking-[0.2em] uppercase transition-colors hover:underline" style={{ color: '#6B4C3B' }}>
                    ✦ Work or Connect — LinkedIn
                  </a>
                </div>
                <p className="mt-6 font-mono text-[7px] tracking-[0.3em] uppercase text-[#aaa]">
                  Replies answered personally · No intermediaries
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <div className="w-full h-px bg-black/10" />

        {/* ═══ 8. EXPLORE THE WORLD ═══ */}
        <section className="px-5 md:px-12 py-16 max-w-5xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#888] mb-10">§ Explore</p>
          </Reveal>

          <div className="relative">
            <div className="hidden md:block absolute top-0 bottom-0 left-0 w-px bg-black/10" />
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-black/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {siteLinks.map((link, i) =>
              <Reveal key={link.path} delay={i * 0.04}>
                  <button
                  onClick={() => navigate(link.path)}
                  className="w-full text-left pl-[10px] pr-[10px] py-4 group border-b border-black/5 md:border-b-0">
                    <span className="text-sm font-bold tracking-[0.1em] uppercase group-hover:text-[#4A5D23] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {link.label} →
                    </span>
                    <span className="block mt-1 text-[13px] text-[#777]" style={{ fontFamily: "'EB Garamond', serif" }}>
                      {link.desc}
                    </span>
                  </button>
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* ═══ 9. FOOTER ═══ */}
        <footer className="border-t border-black/10 px-5 md:px-12 py-6 flex items-center justify-between max-w-5xl mx-auto">
          <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-[#888]">The Times of James</span>
          <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-[#aaa] hidden md:inline">Connecting — Creating — Living</span>
          <img src="/images/JF_logo_transparent-2.png" alt="James Floyd logo" className="w-5 h-5" />
        </footer>
      </main>
    </div>);
};

export default PortfolioPage;