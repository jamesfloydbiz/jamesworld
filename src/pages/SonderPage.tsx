import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Linkedin, Instagram, Youtube } from 'lucide-react';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { PageMeta } from '@/components/PageMeta';

// Speed of the typewriter reveal in milliseconds per letter.
const TYPEWRITER_INTERVAL_MS = 213; // 50% faster than the original 320ms
// Tiny pause between the SONDER row and the SERIES row, for breath.
const TYPEWRITER_ROW_GAP_MS = 160; // 50% faster than the original 240ms

// Letter images cut from photographs — folder 1 spells SONDER, folder 2 spells SERIES
const SONDER_LETTERS = [1, 2, 3, 4, 5, 6];
const SERIES_LETTERS = [7, 8, 9, 10, 11, 12];
// Bump this when you replace any letter image to bust the browser cache.
const LETTER_VERSION = '2';
const letterSrc = (n: number) => `/sonder/${n}.jpg?v=${LETTER_VERSION}`;

// Per-letter horizontal offset (% of cell width) to optically center letters
// whose photo padding is asymmetric. Positive = shift right, negative = left.
// Add an entry like `8: -2` to shift image 8 two percent to the left.
const LETTER_OFFSETS_X: Record<number, number> = {
  9: 4,    // R in SERIES: slight nudge right
  10: -4,  // I in SERIES: slight nudge left
};

const TOTAL_EPISODES = 100;
const PUBLISHED_EPISODES = 29; // episodes published so far
const PEOPLE_GOAL = 100;
const PEOPLE_COUNT = 37; // people interviewed across the published episodes
// Bump this when you replace any image in /public/sonder/episodes/ to bust browser cache.
const THUMB_VERSION = '5';

type Episode = {
  number: string;
  title: string;
  location: string;
  date: string;
  duration: string;
  published: boolean;
  thumb: string | null;
  youtubeUrl: string | null;
};

// 100 episode cards. Published 1–27 each get a thumbnail at /sonder/episodes/NNN.jpg.
// Title / location / date / duration are placeholders until you fill them in.
const episodes: Episode[] = Array.from({ length: TOTAL_EPISODES }, (_, i) => {
  const num = i + 1;
  const number = String(num).padStart(3, '0');
  const published = num <= PUBLISHED_EPISODES;
  return {
    number,
    title: published ? 'Episode title coming soon' : 'Upcoming',
    location: published ? 'TBD' : '—',
    date: published ? 'TBD' : '—',
    duration: published ? '— min' : '—',
    published,
    thumb: published ? `/sonder/episodes/${number}.jpg?v=${THUMB_VERSION}` : null,
    youtubeUrl: null,
  };
});

const SonderPage = () => {
  useKeyboardScroll();

  // Typewriter reveal: how many letters of SONDER + SERIES are visible.
  // 0 = none, 1 = S, ..., 6 = SONDER, 7 = SONDER S, ..., 12 = SONDER SERIES.
  const TOTAL_LETTERS = SONDER_LETTERS.length + SERIES_LETTERS.length;
  const [revealed, setRevealed] = useState(0);
  const [signoffShown, setSignoffShown] = useState(false);
  // Number of letter images that have finished decoding. The typewriter
  // animation waits for all 12 (or a 1500ms safety timeout) before starting,
  // so letters never appear out of order or mid-pop-in.
  const [imagesReady, setImagesReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload all 12 letter images via fetch + decode. Resolves either when
  // every image is decoded or after a 1500ms cap — whichever comes first.
  useEffect(() => {
    let cancelled = false;
    const allLetters = [...SONDER_LETTERS, ...SERIES_LETTERS];
    const decodes = allLetters.map((n) => {
      const img = new Image();
      img.src = letterSrc(n);
      // decode() returns a promise that resolves when the bitmap is ready
      // for paint. Falls back gracefully on browsers without decode().
      const p =
        typeof img.decode === 'function'
          ? img.decode().catch(() => undefined)
          : new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
      return p;
    });

    const cap = new Promise<void>((resolve) => window.setTimeout(resolve, 1500));
    void Promise.race([Promise.all(decodes), cap]).then(() => {
      if (!cancelled) setImagesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setRevealed(TOTAL_LETTERS);
      setSignoffShown(true);
      return;
    }

    // Hold the typewriter sequence until all letter bitmaps are ready.
    if (!imagesReady) return;

    const timeouts: number[] = [];
    let cumulativeDelay = 200; // small lead-in once images are ready

    // Start the continuous typewriter track right when the first letter lands,
    // and let it loop until the reveal finishes.
    const startAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        audio.loop = true;
        audio.volume = 0.55;
        audio.currentTime = 0;
        void audio.play().catch(() => {
          // Autoplay may be blocked until user interacts — silently ignore.
        });
      } catch {
        /* no-op */
      }
    };
    const stopAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false;
      } catch {
        /* no-op */
      }
    };

    for (let i = 1; i <= TOTAL_LETTERS; i++) {
      const isRowBreak = i === SONDER_LETTERS.length + 1;
      cumulativeDelay += isRowBreak ? TYPEWRITER_ROW_GAP_MS : TYPEWRITER_INTERVAL_MS;
      const delay = cumulativeDelay;
      const isFirst = i === 1;
      timeouts.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setRevealed(i);
          if (isFirst) startAudio();
        }, delay)
      );
    }

    // Stop the click track shortly after the last letter lands.
    timeouts.push(
      window.setTimeout(() => {
        if (cancelled) return;
        stopAudio();
        setSignoffShown(true);
      }, cumulativeDelay + 200)
    );

    return () => {
      cancelled = true;
      timeouts.forEach(window.clearTimeout);
      stopAudio();
    };
  }, [TOTAL_LETTERS, imagesReady]);

  return (
    <div className="min-h-screen bg-white text-black">
      <PageMeta
        title="The Sonder Series"
        description="100 conversations with strangers in New York City. James Floyd asks every person their story, the problem in the world that means the most to them, and the most impressive person they've ever met."
        path="/sonder"
      />
      {/* Top-left logo — click to return home (matches the landing page) */}
      <div className="absolute top-0 left-0 z-40 px-6 py-2">
        <Link
          to="/"
          aria-label="Return to home"
          className="block transition-opacity hover:opacity-100"
        >
          <img
            src="/logo.svg"
            alt="JF monogram"
            className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity invert"
          />
        </Link>
      </div>

      {/* Preloaded typewriter click — cloned per keystroke so they can overlap. */}
      <audio
        ref={audioRef}
        src="/sonder/typewriter.mp3"
        preload="auto"
        aria-hidden="true"
      />

      {/* Hero — full viewport on open: "The / SONDER / SERIES / by James Floyd" */}
      <section
        className="min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-8 pt-12 pb-8"
        aria-label="The Sonder Series by James Floyd"
      >
        <h1 className="sr-only">The Sonder Series by James Floyd</h1>

        <motion.div
          className="text-[11px] md:text-xs tracking-[0.5em] uppercase text-black/50 mb-4 md:mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.6 }}
          aria-hidden="true"
        >
          The
        </motion.div>

        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-6 gap-1 md:gap-2 mb-1 md:mb-2">
            {SONDER_LETTERS.map((n, i) => {
              const visible = revealed > i;
              const offset = LETTER_OFFSETS_X[n] ?? 0;
              return (
                <img
                  key={`s1-${n}`}
                  src={letterSrc(n)}
                  alt=""
                  aria-hidden="true"
                  className={`w-full h-auto select-none transition-opacity duration-150 ${
                    visible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={offset ? { transform: `translateX(${offset}%)` } : undefined}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              );
            })}
          </div>

          <div className="grid grid-cols-6 gap-1 md:gap-2">
            {SERIES_LETTERS.map((n, i) => {
              const visible = revealed > SONDER_LETTERS.length + i;
              const offset = LETTER_OFFSETS_X[n] ?? 0;
              return (
                <img
                  key={`s2-${n}`}
                  src={letterSrc(n)}
                  alt=""
                  aria-hidden="true"
                  className={`w-full h-auto select-none transition-opacity duration-150 ${
                    visible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={offset ? { transform: `translateX(${offset}%)` } : undefined}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              );
            })}
          </div>
        </div>

        <div
          className={`mt-6 md:mt-10 text-sm md:text-base italic text-black/55 transition-opacity duration-700 ${
            signoffShown ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ fontFamily: "'EB Garamond', serif" }}
          aria-hidden="true"
        >
          by James Floyd
        </div>
      </section>

      <main className="px-6 md:px-8 pb-24">

        {/* Definition card */}
        <motion.div
          className="max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="bg-black text-white rounded-2xl p-8 md:p-14">
            <h2
              className="text-5xl md:text-7xl mb-4 leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sonder
            </h2>
            <div
              className="text-white/40 mb-8 text-sm md:text-base"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              /ˈsɒn.dər/&nbsp;&nbsp;&nbsp;<span className="italic">noun</span>
            </div>
            <p
              className="text-lg md:text-2xl leading-relaxed text-white/90"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              the realization that each random passerby is living a life as vivid
              and complex as your own — populated with their own ambitions, friends,
              routines, worries, and inherited craziness.
            </p>
          </div>
        </motion.div>

        {/* Counter + about paragraph */}
        <motion.div
          className="max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
        >
          <div className="flex items-baseline gap-4 mb-5">
            <div
              className="text-5xl md:text-6xl tabular-nums leading-none"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              <span className="font-medium">{String(PEOPLE_COUNT).padStart(3, '0')}</span>
              <span className="text-black/25"> / {PEOPLE_GOAL}</span>
            </div>
            <span className="text-xs md:text-sm tracking-[0.25em] uppercase text-black/50">
              people
            </span>
          </div>

          <div
            className="h-[2px] bg-black/10 mb-10 overflow-hidden"
            role="progressbar"
            aria-valuenow={PEOPLE_COUNT}
            aria-valuemin={0}
            aria-valuemax={PEOPLE_GOAL}
            aria-label={`${PEOPLE_COUNT} of ${PEOPLE_GOAL} people interviewed`}
          >
            <motion.div
              className="h-full bg-black"
              initial={{ width: 0 }}
              animate={{ width: `${(PEOPLE_COUNT / PEOPLE_GOAL) * 100}%` }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div
            className="text-lg md:text-xl leading-relaxed text-black/80 space-y-5"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            <p>
              100 interviews with people in New York City. That's my goal. You
              see, I just moved to the city and I want to meet my neighbors. As
              an entrepreneurial guy I figured I might as well film it! Train
              stations, stoops, benches, and couches — I'm taking to the streets
              to have some good ol' fashioned chats! My hope is that through
              this experiment I'll learn and share about 3 core questions.
            </p>
            <ol className="list-decimal pl-6 space-y-1.5">
              <li>What's your story? <span className="text-black/55">(hence Sonder)</span></li>
              <li>What problem in the world means the most to you?</li>
              <li>
                Who's the most impressive person that you've ever met, and what
                made them impressive to you?
              </li>
            </ol>
            <p>
              I will report on the patterns I'm seeing in my convos and create
              some smiles along the way!
            </p>
          </div>

          {/* Social links */}
          <nav
            className="mt-8 flex items-center gap-5"
            aria-label="James Floyd on social media"
          >
            <a
              href="https://www.linkedin.com/in/jamesfloydl/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-black/55 hover:text-black transition-colors"
            >
              <Linkedin className="w-5 h-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://www.instagram.com/jamesfloydscontent/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-black/55 hover:text-black transition-colors"
            >
              <Instagram className="w-5 h-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://www.youtube.com/@jamesfloydsworld"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-black/55 hover:text-black transition-colors"
            >
              <Youtube className="w-5 h-5" strokeWidth={1.5} />
            </a>
          </nav>
        </motion.div>

        {/* Episode grid */}
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="flex items-baseline gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl tracking-[0.25em] uppercase">Episodes</h2>
            <span
              className="text-xs md:text-sm text-black/40"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              001 — 100
            </span>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {episodes.map((ep, i) => {
              const card = (
                <div
                  className={`h-full border transition-colors overflow-hidden flex flex-col ${
                    ep.published
                      ? 'border-black/20 hover:border-black bg-white'
                      : 'border-black/10 bg-black/[0.02] text-black/40'
                  }`}
                >
                  {ep.thumb ? (
                    <div className="aspect-video overflow-hidden bg-black/5">
                      <img
                        src={ep.thumb}
                        alt={`Episode ${ep.number} thumbnail`}
                        className="w-full h-full object-cover"
                        loading={i < 8 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-black/[0.03]" aria-hidden="true" />
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <div
                      className="flex items-baseline justify-between mb-3"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      <span className="text-xs tracking-[0.2em]">EP {ep.number}</span>
                      <span className="text-xs">{ep.duration}</span>
                    </div>
                    <p
                      className={`text-base md:text-lg leading-snug mb-4 flex-1 ${
                        ep.published ? '' : 'italic'
                      }`}
                      style={{ fontFamily: "'EB Garamond', serif" }}
                    >
                      {ep.title}
                    </p>
                    <div
                      className="flex items-center justify-between text-xs text-black/50"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      <span>{ep.location}</span>
                      <span>{ep.date}</span>
                    </div>
                  </div>
                </div>
              );

              return (
                <motion.li
                  key={ep.number}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.005, duration: 0.3 }}
                >
                  {ep.youtubeUrl ? (
                    <a
                      href={ep.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full"
                    >
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* Footer: back-to-top arrow + sign-off */}
        <footer className="max-w-4xl mx-auto mt-24 flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="text-2xl text-black/60 hover:text-black transition-colors leading-none"
          >
            ^
          </button>
          <p className="text-sm md:text-base text-black">— Your world comes from you.</p>
        </footer>
      </main>
    </div>
  );
};

export default SonderPage;
