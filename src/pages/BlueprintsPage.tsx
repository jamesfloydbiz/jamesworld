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

/* ── SVG Illustrations — Side-view, grayscale ── */

const RecordPlayer = () => (
  <svg viewBox="0 0 120 100" className="w-full h-full">
    {/* Cabinet side profile */}
    <rect x="15" y="25" width="90" height="55" fill="hsl(0 0% 8%)" stroke="hsl(0 0% 25%)" strokeWidth="0.8" />
    {/* Top edge / lid */}
    <rect x="15" y="22" width="90" height="4" fill="hsl(0 0% 15%)" stroke="hsl(0 0% 25%)" strokeWidth="0.5" />
    {/* Platter seen from side — thin horizontal line */}
    <rect x="20" y="38" width="80" height="1.5" fill="hsl(0 0% 30%)" rx="0.5" />
    {/* Vinyl disc edge — thin dark line on platter */}
    <rect x="25" y="36" width="60" height="2" fill="hsl(0 0% 5%)" rx="0.5" />
    {/* Vinyl label edge */}
    <rect x="50" y="36" width="10" height="2" fill="hsl(0 0% 20%)" rx="0.5" />
    {/* Tonearm — vertical post */}
    <rect x="88" y="26" width="2" height="10" fill="hsl(0 0% 40%)" rx="0.5" />
    {/* Tonearm — arm extending left */}
    <line x1="89" y1="28" x2="65" y2="33" stroke="hsl(0 0% 50%)" strokeWidth="1.2" strokeLinecap="round" className="origin-[89px_28px] transition-transform duration-300 group-hover:-rotate-3" />
    {/* Cartridge at end of arm */}
    <rect x="63" y="32" width="4" height="2.5" rx="0.5" fill="hsl(0 0% 45%)" className="origin-[89px_28px] transition-transform duration-300 group-hover:-rotate-3" />
    {/* Cabinet feet */}
    <rect x="18" y="80" width="6" height="4" fill="hsl(0 0% 12%)" rx="1" />
    <rect x="96" y="80" width="6" height="4" fill="hsl(0 0% 12%)" rx="1" />
    {/* Front panel detail lines */}
    <line x1="20" y1="50" x2="100" y2="50" stroke="hsl(0 0% 15%)" strokeWidth="0.3" />
    <line x1="20" y1="65" x2="100" y2="65" stroke="hsl(0 0% 15%)" strokeWidth="0.3" />
    {/* Knob */}
    <circle cx="30" cy="57" r="3" fill="hsl(0 0% 12%)" stroke="hsl(0 0% 30%)" strokeWidth="0.5" />
    <circle cx="30" cy="57" r="1" fill="hsl(0 0% 35%)" />
  </svg>
);

const BookSpines = () => (
  <svg viewBox="0 0 140 100" className="w-full h-full">
    {/* Book 1 - tall thin */}
    <rect x="8" y="10" width="14" height="85" rx="1" fill="hsl(0 0% 12%)" stroke="hsl(0 0% 25%)" strokeWidth="0.5" />
    <text x="15" y="55" fill="hsl(0 0% 55%)" fontSize="3.5" textAnchor="middle" transform="rotate(-90 15 55)" letterSpacing="1" fontFamily="monospace">4000 WEEKS</text>
    {/* Book 2 - medium */}
    <rect x="25" y="20" width="18" height="75" rx="1" fill="hsl(0 0% 18%)" stroke="hsl(0 0% 28%)" strokeWidth="0.5" />
    <text x="34" y="58" fill="hsl(0 0% 50%)" fontSize="3" textAnchor="middle" transform="rotate(-90 34 58)" letterSpacing="0.8" fontFamily="monospace">THIRD DOOR</text>
    {/* Book 3 - thick */}
    <rect x="46" y="15" width="20" height="80" rx="1" fill="hsl(0 0% 8%)" stroke="hsl(0 0% 22%)" strokeWidth="0.5" />
    <text x="56" y="55" fill="hsl(0 0% 60%)" fontSize="3" textAnchor="middle" transform="rotate(-90 56 55)" letterSpacing="0.5" fontFamily="monospace">IRON JOHN</text>
    {/* Book 4 - slim */}
    <rect x="69" y="22" width="12" height="73" rx="1" fill="hsl(0 0% 15%)" stroke="hsl(0 0% 25%)" strokeWidth="0.5" />
    <text x="75" y="58" fill="hsl(0 0% 50%)" fontSize="2.8" textAnchor="middle" transform="rotate(-90 75 58)" letterSpacing="0.5" fontFamily="monospace">WINNERS</text>
    {/* Book 5 - medium thick */}
    <rect x="84" y="12" width="22" height="83" rx="1" fill="hsl(0 0% 20%)" stroke="hsl(0 0% 30%)" strokeWidth="0.5" />
    <text x="95" y="52" fill="hsl(0 0% 55%)" fontSize="2.5" textAnchor="middle" transform="rotate(-90 95 52)" letterSpacing="0.3" fontFamily="monospace">LESSONS OF HISTORY</text>
    {/* Book 6 - leaning */}
    <rect x="108" y="18" width="16" height="77" rx="1" fill="hsl(0 0% 10%)" stroke="hsl(0 0% 22%)" strokeWidth="0.5" transform="rotate(5 116 56)" />
    <text x="116" y="55" fill="hsl(0 0% 50%)" fontSize="2.5" textAnchor="middle" transform="rotate(-85 116 55)" letterSpacing="0.5" fontFamily="monospace">NO SMALL PLANS</text>
  </svg>
);

const BlueprintScroll = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Scroll body — lying on its side, viewed from the end */}
    {/* Main cylinder body */}
    <rect x="20" y="40" width="60" height="30" fill="hsl(0 0% 12%)" stroke="hsl(0 0% 25%)" strokeWidth="0.5" />
    {/* Circular end — the cross-section */}
    <ellipse cx="80" cy="55" rx="8" ry="15" fill="hsl(0 0% 15%)" stroke="hsl(0 0% 30%)" strokeWidth="0.8" />
    <ellipse cx="80" cy="55" rx="5" ry="10" fill="hsl(0 0% 8%)" stroke="hsl(0 0% 20%)" strokeWidth="0.3" />
    {/* Paper edge visible — curling out from end */}
    <path d="M 20 42 Q 12 40 10 35 Q 9 30 14 28" fill="none" stroke="hsl(0 0% 40%)" strokeWidth="0.8" />
    <path d="M 20 68 Q 12 70 10 75 Q 9 78 14 80" fill="none" stroke="hsl(0 0% 35%)" strokeWidth="0.6" />
    {/* Surface lines suggesting blueprint grid */}
    <line x1="25" y1="48" x2="75" y2="48" stroke="hsl(0 0% 18%)" strokeWidth="0.3" />
    <line x1="25" y1="55" x2="75" y2="55" stroke="hsl(0 0% 18%)" strokeWidth="0.3" />
    <line x1="25" y1="62" x2="75" y2="62" stroke="hsl(0 0% 18%)" strokeWidth="0.3" />
    {/* Rubber band / clip holding it */}
    <rect x="45" y="38" width="3" height="34" rx="1" fill="hsl(0 0% 30%)" opacity="0.6" />
  </svg>
);

const HealthItems = () => (
  <svg viewBox="0 0 130 100" className="w-full h-full">
    {/* Supplement bottle 1 — side view, tall */}
    <rect x="5" y="28" width="16" height="42" rx="2" fill="hsl(0 0% 15%)" stroke="hsl(0 0% 30%)" strokeWidth="0.5" />
    <rect x="7" y="24" width="12" height="6" rx="1" fill="hsl(0 0% 22%)" stroke="hsl(0 0% 30%)" strokeWidth="0.3" />
    {/* Label */}
    <rect x="7" y="38" width="12" height="16" fill="hsl(0 0% 25%)" />
    <line x1="9" y1="43" x2="17" y2="43" stroke="hsl(0 0% 40%)" strokeWidth="0.4" />
    <line x1="9" y1="46" x2="17" y2="46" stroke="hsl(0 0% 40%)" strokeWidth="0.4" />
    <line x1="9" y1="49" x2="15" y2="49" stroke="hsl(0 0% 40%)" strokeWidth="0.4" />

    {/* Supplement bottle 2 — shorter, wider */}
    <rect x="26" y="38" width="18" height="32" rx="2" fill="hsl(0 0% 10%)" stroke="hsl(0 0% 25%)" strokeWidth="0.5" />
    <rect x="29" y="34" width="12" height="6" rx="1" fill="hsl(0 0% 18%)" stroke="hsl(0 0% 25%)" strokeWidth="0.3" />
    {/* Label */}
    <rect x="28" y="46" width="14" height="12" fill="hsl(0 0% 20%)" />
    <line x1="30" y1="50" x2="40" y2="50" stroke="hsl(0 0% 35%)" strokeWidth="0.4" />
    <line x1="30" y1="53" x2="38" y2="53" stroke="hsl(0 0% 35%)" strokeWidth="0.4" />

    {/* Supplement bottle 3 — slim */}
    <rect x="49" y="32" width="12" height="38" rx="2" fill="hsl(0 0% 18%)" stroke="hsl(0 0% 28%)" strokeWidth="0.5" />
    <rect x="50" y="28" width="10" height="6" rx="1" fill="hsl(0 0% 24%)" stroke="hsl(0 0% 28%)" strokeWidth="0.3" />
    {/* Label */}
    <rect x="50" y="42" width="10" height="14" fill="hsl(0 0% 22%)" />

    {/* Bowl — side view: half-circle silhouette */}
    <path d="M 75 70 Q 75 48 95 48 Q 115 48 115 70 Z" fill="hsl(0 0% 10%)" stroke="hsl(0 0% 28%)" strokeWidth="0.8" />
    {/* Bowl rim */}
    <line x1="73" y1="70" x2="117" y2="70" stroke="hsl(0 0% 30%)" strokeWidth="1" />
    {/* Greens peeking over the top */}
    <ellipse cx="85" cy="48" rx="4" ry="5" fill="hsl(0 0% 22%)" />
    <ellipse cx="95" cy="46" rx="5" ry="6" fill="hsl(0 0% 18%)" />
    <ellipse cx="105" cy="48" rx="4" ry="5" fill="hsl(0 0% 25%)" />
    <ellipse cx="90" cy="44" rx="3" ry="4" fill="hsl(0 0% 15%)" />
    <ellipse cx="100" cy="44" rx="3" ry="5" fill="hsl(0 0% 20%)" />
  </svg>
);

const PiggyBank = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Body — side profile silhouette */}
    <ellipse cx="50" cy="55" rx="28" ry="20" fill="hsl(0 0% 12%)" stroke="hsl(0 0% 30%)" strokeWidth="0.8" />
    {/* Snout */}
    <ellipse cx="76" cy="52" rx="7" ry="5" fill="hsl(0 0% 15%)" stroke="hsl(0 0% 30%)" strokeWidth="0.6" />
    <circle cx="75" cy="50.5" r="1" fill="hsl(0 0% 35%)" />
    <circle cx="78.5" cy="50.5" r="1" fill="hsl(0 0% 35%)" />
    {/* Eye */}
    <circle cx="66" cy="45" r="2" fill="hsl(0 0% 35%)" />
    <circle cx="66" cy="45" r="0.8" fill="hsl(0 0% 80%)" />
    {/* Ears */}
    <ellipse cx="40" cy="37" rx="6" ry="4" fill="hsl(0 0% 15%)" stroke="hsl(0 0% 25%)" strokeWidth="0.5" transform="rotate(-20 40 37)" />
    <ellipse cx="52" cy="35" rx="6" ry="4" fill="hsl(0 0% 15%)" stroke="hsl(0 0% 25%)" strokeWidth="0.5" transform="rotate(10 52 35)" />
    {/* Legs — side view, two visible */}
    <rect x="34" y="72" width="7" height="12" rx="1.5" fill="hsl(0 0% 12%)" stroke="hsl(0 0% 25%)" strokeWidth="0.5" />
    <rect x="60" y="72" width="7" height="12" rx="1.5" fill="hsl(0 0% 12%)" stroke="hsl(0 0% 25%)" strokeWidth="0.5" />
    {/* Coin slot */}
    <rect x="44" y="36" width="12" height="1.5" rx="0.5" fill="hsl(0 0% 25%)" />
    {/* Coin dropping in */}
    <ellipse cx="50" cy="30" rx="4" ry="5" fill="none" stroke="hsl(0 0% 40%)" strokeWidth="0.8" />
    <text x="50" y="32" fill="hsl(0 0% 40%)" fontSize="4.5" textAnchor="middle" fontFamily="monospace">$</text>
    {/* Tail curl */}
    <path d="M 23 48 Q 16 44 17 37 Q 18 31 22 35" fill="none" stroke="hsl(0 0% 28%)" strokeWidth="1.5" strokeLinecap="round" />
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
            The inputs and frameworks. Click to explore.
          </p>

          {/* Bookshelf */}
          <div className="relative">
            {/* Top Shelf */}
            <div className="relative mb-0">
              <div className="flex items-end justify-center gap-6 md:gap-12 px-4 pb-0 min-h-[140px] md:min-h-[180px]">
                {topShelf.map((item, i) => {
                  const Illustration = illustrationMap[item.id];
                  return (
                    <motion.div
                      key={item.id}
                      className="group cursor-pointer relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                      whileHover={{ y: -4 }}
                      onClick={() => handleItemClick(item.id, item.link)}
                    >
                      <div className={`${item.id === 'books' ? 'w-[160px] md:w-[220px]' : 'w-[120px] md:w-[160px]'} h-[110px] md:h-[140px]`}>
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
              {/* Shelf plank — grayscale */}
              <div className="h-[6px]" style={{ background: 'linear-gradient(180deg, hsl(0 0% 18%) 0%, hsl(0 0% 10%) 100%)' }} />
              <div className="h-[3px]" style={{ background: 'linear-gradient(180deg, hsl(0 0% 6%) 0%, transparent 100%)' }} />
            </div>

            {/* Bottom Shelf */}
            <div className="relative mt-6">
              <div className="flex items-end justify-center gap-4 md:gap-10 px-4 pb-0 min-h-[140px] md:min-h-[180px]">
                {bottomShelf.map((item, i) => {
                  const Illustration = illustrationMap[item.id];
                  return (
                    <motion.div
                      key={item.id}
                      className="group cursor-pointer relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.15, duration: 0.5 }}
                      whileHover={{ y: -4 }}
                      onClick={() => handleItemClick(item.id, item.link)}
                    >
                      <div className={`${item.id === 'health' ? 'w-[140px] md:w-[200px]' : 'w-[100px] md:w-[140px]'} h-[100px] md:h-[140px]`}>
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
              {/* Shelf plank — grayscale */}
              <div className="h-[6px]" style={{ background: 'linear-gradient(180deg, hsl(0 0% 18%) 0%, hsl(0 0% 10%) 100%)' }} />
              <div className="h-[3px]" style={{ background: 'linear-gradient(180deg, hsl(0 0% 6%) 0%, transparent 100%)' }} />
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
