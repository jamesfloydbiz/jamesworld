import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { ExternalLink } from 'lucide-react';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';

const shelfItems = [
  {
    id: 'music',
    title: 'Music',
    description: 'Click for HEAT.',
    link: 'https://open.spotify.com/user/___vertigo___?si=dca6a7458c8849cf',
  },
  {
    id: 'books',
    title: 'Books',
    description: '4000 Weeks, The Third Door, Make No Small Plans, Iron John, Winners Take All, The Lessons of History by Ariel and Will Durant',
  },
  {
    id: 'models',
    title: 'Mental Models',
    description: 'Naval said collect them, and collect them I did.',
    link: 'https://x.com/jamesfloydbiz',
  },
  {
    id: 'health',
    title: 'Health',
    description: 'Move — pushups, pullups, farmer\'s carries, rucking, walking, Russian twists, pike pushups, pistol squats.\n\nEat — high protein, enough fiber. Tip: put spinach in a lot of things.\n\nSleep — sleep early, wake early.',
  },
  {
    id: 'money',
    title: 'Money',
    description: 'Clarity → Cashflow → Consumption → Control → Risk Management',
  },
];

/* ── SVG Illustrations — Thin white line art ── */

const S = { fill: 'none', stroke: 'hsl(0 0% 70%)', strokeWidth: 1 } as const;
const Sd = { fill: 'none', stroke: 'hsl(0 0% 40%)', strokeWidth: 0.6 } as const;

const RecordPlayer = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full">
    {/* Cabinet */}
    <rect x="10" y="10" width="100" height="60" {...S} rx="1" />
    {/* Lid line */}
    <line x1="10" y1="18" x2="110" y2="18" {...Sd} />
    {/* Platter */}
    <line x1="20" y1="34" x2="85" y2="34" {...Sd} />
    {/* Vinyl disc */}
    <line x1="25" y1="32" x2="80" y2="32" {...S} />
    {/* Vinyl label */}
    <line x1="48" y1="32" x2="58" y2="32" stroke="hsl(0 0% 50%)" strokeWidth={0.8} fill="none" />
    {/* Tonearm post */}
    <line x1="95" y1="20" x2="95" y2="30" {...S} />
    {/* Tonearm */}
    <line x1="95" y1="24" x2="62" y2="30" {...S} strokeLinecap="round" />
    {/* Knob */}
    <circle cx="28" cy="52" r="3" {...S} />
    {/* Knob dot */}
    <circle cx="28" cy="52" r="0.8" fill="hsl(0 0% 70%)" stroke="none" />
    {/* Panel line */}
    <line x1="15" y1="45" x2="105" y2="45" {...Sd} />
    {/* Feet */}
    <line x1="16" y1="70" x2="24" y2="70" {...Sd} />
    <line x1="96" y1="70" x2="104" y2="70" {...Sd} />
  </svg>
);

const BookSpines = () => (
  <svg viewBox="0 0 140 80" className="w-full h-full">
    {/* Book 1 */}
    <rect x="8" y="2" width="14" height="78" {...S} rx="0.5" />
    <text x="15" y="45" fill="hsl(0 0% 60%)" fontSize="3.2" textAnchor="middle" transform="rotate(-90 15 45)" letterSpacing="1" fontFamily="monospace">4000 WEEKS</text>
    {/* Book 2 */}
    <rect x="25" y="10" width="18" height="70" {...S} rx="0.5" />
    <text x="34" y="48" fill="hsl(0 0% 60%)" fontSize="2.8" textAnchor="middle" transform="rotate(-90 34 48)" letterSpacing="0.8" fontFamily="monospace">THIRD DOOR</text>
    {/* Book 3 */}
    <rect x="46" y="5" width="20" height="75" {...S} rx="0.5" />
    <text x="56" y="45" fill="hsl(0 0% 60%)" fontSize="2.8" textAnchor="middle" transform="rotate(-90 56 45)" letterSpacing="0.5" fontFamily="monospace">IRON JOHN</text>
    {/* Book 4 */}
    <rect x="69" y="12" width="12" height="68" {...S} rx="0.5" />
    <text x="75" y="48" fill="hsl(0 0% 60%)" fontSize="2.6" textAnchor="middle" transform="rotate(-90 75 48)" letterSpacing="0.5" fontFamily="monospace">WINNERS</text>
    {/* Book 5 */}
    <rect x="84" y="4" width="22" height="76" {...S} rx="0.5" />
    <text x="95" y="42" fill="hsl(0 0% 60%)" fontSize="2.3" textAnchor="middle" transform="rotate(-90 95 42)" letterSpacing="0.3" fontFamily="monospace">LESSONS OF HISTORY</text>
    {/* Book 6 — leaning */}
    <rect x="108" y="8" width="16" height="72" {...S} rx="0.5" transform="rotate(5 116 44)" />
    <text x="116" y="44" fill="hsl(0 0% 60%)" fontSize="2.3" textAnchor="middle" transform="rotate(-85 116 44)" letterSpacing="0.5" fontFamily="monospace">NO SMALL PLANS</text>
  </svg>
);

const BlueprintScroll = () => (
  <svg viewBox="0 0 100 80" className="w-full h-full">
    {/* Cylinder body */}
    <rect x="15" y="25" width="60" height="30" {...S} rx="1" />
    {/* End circle */}
    <ellipse cx="75" cy="40" rx="7" ry="15" {...S} />
    <ellipse cx="75" cy="40" rx="4" ry="9" {...Sd} />
    {/* Paper curl top */}
    <path d="M 15 27 Q 8 25 7 20 Q 6 16 10 14" {...S} strokeLinecap="round" />
    {/* Paper curl bottom */}
    <path d="M 15 53 Q 8 55 7 60 Q 6 64 10 66" {...Sd} strokeLinecap="round" />
    {/* Grid lines on surface */}
    <line x1="20" y1="33" x2="70" y2="33" {...Sd} />
    <line x1="20" y1="40" x2="70" y2="40" {...Sd} />
    <line x1="20" y1="47" x2="70" y2="47" {...Sd} />
    {/* Band */}
    <line x1="42" y1="25" x2="42" y2="55" {...Sd} />
    <line x1="45" y1="25" x2="45" y2="55" {...Sd} />
  </svg>
);

const HealthItems = () => (
  <svg viewBox="0 0 130 80" className="w-full h-full">
    {/* Bottle 1 — tall */}
    <rect x="5" y="12" width="16" height="48" {...S} rx="1.5" />
    <rect x="7" y="8" width="12" height="6" {...Sd} rx="1" />
    {/* Label lines */}
    <line x1="9" y1="28" x2="17" y2="28" {...Sd} />
    <line x1="9" y1="32" x2="17" y2="32" {...Sd} />
    <line x1="9" y1="36" x2="15" y2="36" {...Sd} />

    {/* Bottle 2 — short wide */}
    <rect x="26" y="24" width="18" height="36" {...S} rx="1.5" />
    <rect x="29" y="20" width="12" height="6" {...Sd} rx="1" />
    {/* Label lines */}
    <line x1="30" y1="36" x2="40" y2="36" {...Sd} />
    <line x1="30" y1="40" x2="38" y2="40" {...Sd} />

    {/* Bottle 3 — slim */}
    <rect x="49" y="18" width="12" height="42" {...S} rx="1.5" />
    <rect x="50" y="14" width="10" height="6" {...Sd} rx="1" />

    {/* Bowl — side view arc */}
    <path d="M 75 60 Q 75 38 95 38 Q 115 38 115 60" {...S} strokeLinecap="round" />
    {/* Rim */}
    <line x1="73" y1="60" x2="117" y2="60" {...S} />
    {/* Greens — small arcs above rim */}
    <path d="M 82 38 Q 84 30 88 32" {...Sd} strokeLinecap="round" />
    <path d="M 92 36 Q 95 28 98 30" {...Sd} strokeLinecap="round" />
    <path d="M 102 38 Q 105 30 108 33" {...Sd} strokeLinecap="round" />
  </svg>
);

const PiggyBank = () => (
  <svg viewBox="0 0 100 80" className="w-full h-full">
    {/* Body */}
    <ellipse cx="50" cy="45" rx="28" ry="20" {...S} />
    {/* Snout */}
    <ellipse cx="76" cy="42" rx="7" ry="5" {...S} />
    {/* Nostrils */}
    <circle cx="74" cy="41" r="1" {...Sd} />
    <circle cx="78" cy="41" r="1" {...Sd} />
    {/* Eye */}
    <circle cx="66" cy="36" r="2" {...S} />
    <circle cx="66" cy="36" r="0.6" fill="hsl(0 0% 70%)" stroke="none" />
    {/* Ears */}
    <path d="M 38 28 Q 34 20 40 22 Q 44 24 42 28" {...S} strokeLinecap="round" />
    <path d="M 50 26 Q 48 18 54 20 Q 58 22 54 26" {...S} strokeLinecap="round" />
    {/* Legs */}
    <line x1="36" y1="62" x2="36" y2="72" {...S} strokeLinecap="round" />
    <line x1="42" y1="63" x2="42" y2="72" {...S} strokeLinecap="round" />
    <line x1="58" y1="63" x2="58" y2="72" {...S} strokeLinecap="round" />
    <line x1="64" y1="62" x2="64" y2="72" {...S} strokeLinecap="round" />
    {/* Hooves */}
    <line x1="34" y1="72" x2="38" y2="72" {...Sd} />
    <line x1="40" y1="72" x2="44" y2="72" {...Sd} />
    <line x1="56" y1="72" x2="60" y2="72" {...Sd} />
    <line x1="62" y1="72" x2="66" y2="72" {...Sd} />
    {/* Coin slot */}
    <line x1="44" y1="26" x2="56" y2="26" {...S} />
    {/* Coin */}
    <circle cx="50" cy="20" r="4" {...Sd} />
    <text x="50" y="22" fill="hsl(0 0% 50%)" fontSize="4" textAnchor="middle" fontFamily="monospace">$</text>
    {/* Tail */}
    <path d="M 23 40 Q 16 36 17 30 Q 18 25 22 28" fill="none" stroke="hsl(0 0% 50%)" strokeWidth={1} strokeLinecap="round" />
  </svg>
);

const illustrationMap: Record<string, React.FC> = {
  music: RecordPlayer,
  books: BookSpines,
  models: BlueprintScroll,
  health: HealthItems,
  money: PiggyBank,
};

const BlueprintsPage = () => {
  useKeyboardScroll();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleItemClick = (id: string, link?: string) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedItem(selectedItem === id ? null : id);
  };

  const topShelf = shelfItems.slice(0, 2);
  const bottomShelf = shelfItems.slice(2);

  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Blueprints" />

      <main className="pt-[140px] px-4 md:px-8 pb-24">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-2">Blueprints</h1>
          <p className="text-muted-foreground text-xs mb-12 tracking-wide">
            A personal operating system, allegedly.
          </p>

          {/* Bookshelf */}
          <div className="relative">
            {/* Top Shelf */}
            <div className="relative mb-0">
              <div className="flex items-end justify-center gap-6 md:gap-12 px-4 pb-0 min-h-[120px] md:min-h-[150px]">
                {topShelf.map((item, i) => {
                  const Illustration = illustrationMap[item.id];
                  return (
                    <motion.div
                      key={item.id}
                      className="group cursor-pointer relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                      onClick={() => handleItemClick(item.id, item.link)}
                    >
                      <div className={`${item.id === 'books' ? 'w-[160px] md:w-[220px]' : 'w-[120px] md:w-[160px]'} h-[100px] md:h-[130px]`}>
                        <Illustration />
                      </div>
                      <motion.span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        {item.title}
                        {item.link && <ExternalLink className="inline w-2.5 h-2.5 ml-1 -mt-0.5" />}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>
              {/* Shelf plank — thin white line */}
              <div className="h-px bg-foreground/20" />
            </div>

            {/* Bottom Shelf */}
            <div className="relative mt-8">
              <div className="flex items-end justify-center gap-4 md:gap-10 px-4 pb-0 min-h-[120px] md:min-h-[150px]">
                {bottomShelf.map((item, i) => {
                  const Illustration = illustrationMap[item.id];
                  return (
                    <motion.div
                      key={item.id}
                      className="group cursor-pointer relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.15, duration: 0.5 }}
                      onClick={() => handleItemClick(item.id, item.link)}
                    >
                      <div className={`${item.id === 'health' ? 'w-[140px] md:w-[200px]' : 'w-[100px] md:w-[140px]'} h-[100px] md:h-[130px]`}>
                        <Illustration />
                      </div>
                      <motion.span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        {item.title}
                        {item.link && <ExternalLink className="inline w-2.5 h-2.5 ml-1 -mt-0.5" />}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>
              {/* Shelf plank — thin white line */}
              <div className="h-px bg-foreground/20" />
            </div>
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedItem && (() => {
              const item = shelfItems.find(i => i.id === selectedItem);
              if (!item) return null;
              return (
                <motion.div
                  key={selectedItem}
                  className="mt-12 border border-border p-6 md:p-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-lg tracking-widest uppercase mb-3">{item.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm mt-4 hover:underline underline-offset-4"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="block mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default BlueprintsPage;
