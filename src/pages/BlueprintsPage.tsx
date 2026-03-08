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

/* ── SVG Style Constants ── */
const S = { fill: 'none', stroke: 'hsl(0 0% 70%)', strokeWidth: 1 } as const;
const Sd = { fill: 'none', stroke: 'hsl(0 0% 40%)', strokeWidth: 0.6 } as const;

/* ── Record Player with animated music notes ── */
const RecordPlayer = ({ hovered }: { hovered: boolean }) => (
  <svg viewBox="0 0 120 90" className="w-full h-full">
    {/* Base */}
    <rect x="10" y="20" width="100" height="60" {...S} rx="1" />
    {/* Open lid — angled line behind */}
    <line x1="10" y1="20" x2="5" y2="5" {...S} />
    <line x1="110" y1="20" x2="105" y2="5" {...S} />
    <line x1="5" y1="5" x2="105" y2="5" {...Sd} />
    {/* Platter circle */}
    <circle cx="55" cy="48" r="22" {...S} />
    <circle cx="55" cy="48" r="16" {...Sd} />
    <circle cx="55" cy="48" r="10" {...Sd} />
    {/* Label */}
    <circle cx="55" cy="48" r="4" {...S} />
    <circle cx="55" cy="48" r="1.5" fill="hsl(0 0% 70%)" stroke="none" />
    {/* Tonearm post */}
    <circle cx="92" cy="28" r="2.5" {...S} />
    {/* Tonearm */}
    <line x1="92" y1="28" x2="68" y2="40" {...S} strokeLinecap="round" />
    {/* Cartridge */}
    <line x1="68" y1="40" x2="65" y2="42" {...S} strokeWidth={1.5} strokeLinecap="round" />
    {/* Animated music notes */}
    {hovered && (
      <>
        <text className="animate-music-note-1" x="35" y="30" fill="hsl(0 0% 70%)" fontSize="10" fontFamily="serif">♪</text>
        <text className="animate-music-note-2" x="50" y="25" fill="hsl(0 0% 55%)" fontSize="8" fontFamily="serif">♫</text>
        <text className="animate-music-note-3" x="65" y="28" fill="hsl(0 0% 65%)" fontSize="9" fontFamily="serif">♪</text>
      </>
    )}
  </svg>
);

const BookSpines = () => (
  <svg viewBox="0 0 140 80" className="w-full h-full">
    <rect x="8" y="2" width="14" height="78" {...S} rx="0.5" />
    <text x="15" y="45" fill="hsl(0 0% 60%)" fontSize="3.2" textAnchor="middle" transform="rotate(-90 15 45)" letterSpacing="1" fontFamily="monospace">4000 WEEKS</text>
    <rect x="25" y="10" width="18" height="70" {...S} rx="0.5" />
    <text x="34" y="48" fill="hsl(0 0% 60%)" fontSize="2.8" textAnchor="middle" transform="rotate(-90 34 48)" letterSpacing="0.8" fontFamily="monospace">THIRD DOOR</text>
    <rect x="46" y="5" width="20" height="75" {...S} rx="0.5" />
    <text x="56" y="45" fill="hsl(0 0% 60%)" fontSize="2.8" textAnchor="middle" transform="rotate(-90 56 45)" letterSpacing="0.5" fontFamily="monospace">IRON JOHN</text>
    <rect x="69" y="12" width="12" height="68" {...S} rx="0.5" />
    <text x="75" y="48" fill="hsl(0 0% 60%)" fontSize="2.6" textAnchor="middle" transform="rotate(-90 75 48)" letterSpacing="0.5" fontFamily="monospace">WINNERS</text>
    <rect x="84" y="4" width="22" height="76" {...S} rx="0.5" />
    <text x="95" y="42" fill="hsl(0 0% 60%)" fontSize="2.3" textAnchor="middle" transform="rotate(-90 95 42)" letterSpacing="0.3" fontFamily="monospace">LESSONS OF HISTORY</text>
    <rect x="108" y="8" width="16" height="72" {...S} rx="0.5" transform="rotate(5 116 44)" />
    <text x="116" y="44" fill="hsl(0 0% 60%)" fontSize="2.3" textAnchor="middle" transform="rotate(-85 116 44)" letterSpacing="0.5" fontFamily="monospace">NO SMALL PLANS</text>
  </svg>
);

/* ── Mental Models — connected node network ── */
const NodeNetwork = () => (
  <svg viewBox="0 0 100 80" className="w-full h-full">
    {/* Connections */}
    <line x1="30" y1="20" x2="70" y2="15" {...Sd} />
    <line x1="30" y1="20" x2="50" y2="45" {...Sd} />
    <line x1="70" y1="15" x2="50" y2="45" {...Sd} />
    <line x1="50" y1="45" x2="25" y2="65" {...Sd} />
    <line x1="50" y1="45" x2="75" y2="60" {...Sd} />
    <line x1="25" y1="65" x2="75" y2="60" {...Sd} />
    <line x1="70" y1="15" x2="85" y2="35" {...Sd} />
    <line x1="85" y1="35" x2="75" y2="60" {...Sd} />
    <line x1="30" y1="20" x2="15" y2="42" {...Sd} />
    <line x1="15" y1="42" x2="25" y2="65" {...Sd} />
    {/* Nodes */}
    <circle cx="30" cy="20" r="4" {...S} />
    <circle cx="70" cy="15" r="4" {...S} />
    <circle cx="50" cy="45" r="5" {...S} />
    <circle cx="25" cy="65" r="3.5" {...S} />
    <circle cx="75" cy="60" r="3.5" {...S} />
    <circle cx="85" cy="35" r="3" {...S} />
    <circle cx="15" cy="42" r="3" {...S} />
    {/* Center node highlight */}
    <circle cx="50" cy="45" r="2" fill="hsl(0 0% 50%)" stroke="none" />
  </svg>
);

/* ── Health — bottles + bowl with apple, banana, broccoli ── */
const HealthItems = () => (
  <svg viewBox="0 0 130 80" className="w-full h-full">
    {/* Bottle 1 */}
    <rect x="5" y="12" width="16" height="58" {...S} rx="1.5" />
    <rect x="7" y="8" width="12" height="6" {...Sd} rx="1" />
    <line x1="9" y1="28" x2="17" y2="28" {...Sd} />
    <line x1="9" y1="32" x2="17" y2="32" {...Sd} />

    {/* Bottle 2 */}
    <rect x="26" y="24" width="18" height="46" {...S} rx="1.5" />
    <rect x="29" y="20" width="12" height="6" {...Sd} rx="1" />

    {/* Bowl */}
    <path d="M 60 70 Q 60 48 80 48 Q 100 48 100 70" {...S} strokeLinecap="round" />
    <line x1="58" y1="70" x2="102" y2="70" {...S} />

    {/* Apple — circle with stem and leaf */}
    <circle cx="72" cy="42" r="6" {...S} />
    <line x1="72" y1="36" x2="72" y2="32" {...Sd} strokeLinecap="round" />
    <path d="M 72 33 Q 76 30 78 33" {...Sd} strokeLinecap="round" />

    {/* Banana — crescent */}
    <path d="M 82 38 Q 92 32 96 40 Q 92 38 82 42 Z" {...S} strokeLinecap="round" />

    {/* Broccoli — small tree floret */}
    <line x1="88" y1="52" x2="88" y2="44" {...Sd} strokeLinecap="round" />
    <circle cx="84" cy="42" r="3" {...S} />
    <circle cx="88" cy="40" r="3" {...S} />
    <circle cx="92" cy="42" r="3" {...S} />
  </svg>
);

/* ── Piggy Bank — shifted down so hooves touch y=80 ── */
const PiggyBank = () => (
  <svg viewBox="0 0 100 80" className="w-full h-full">
    {/* Body */}
    <ellipse cx="50" cy="49" rx="28" ry="20" {...S} />
    {/* Snout */}
    <ellipse cx="76" cy="46" rx="7" ry="5" {...S} />
    <circle cx="74" cy="45" r="1" {...Sd} />
    <circle cx="78" cy="45" r="1" {...Sd} />
    {/* Eye */}
    <circle cx="66" cy="40" r="2" {...S} />
    <circle cx="66" cy="40" r="0.6" fill="hsl(0 0% 70%)" stroke="none" />
    {/* Ears */}
    <path d="M 38 32 Q 34 24 40 26 Q 44 28 42 32" {...S} strokeLinecap="round" />
    <path d="M 50 30 Q 48 22 54 24 Q 58 26 54 30" {...S} strokeLinecap="round" />
    {/* Legs — touching y=80 */}
    <line x1="36" y1="66" x2="36" y2="78" {...S} strokeLinecap="round" />
    <line x1="42" y1="67" x2="42" y2="78" {...S} strokeLinecap="round" />
    <line x1="58" y1="67" x2="58" y2="78" {...S} strokeLinecap="round" />
    <line x1="64" y1="66" x2="64" y2="78" {...S} strokeLinecap="round" />
    {/* Hooves at baseline */}
    <line x1="34" y1="78" x2="38" y2="78" {...Sd} />
    <line x1="40" y1="78" x2="44" y2="78" {...Sd} />
    <line x1="56" y1="78" x2="60" y2="78" {...Sd} />
    <line x1="62" y1="78" x2="66" y2="78" {...Sd} />
    {/* Coin slot */}
    <line x1="44" y1="30" x2="56" y2="30" {...S} />
    {/* Coin */}
    <circle cx="50" cy="24" r="4" {...Sd} />
    <text x="50" y="26" fill="hsl(0 0% 50%)" fontSize="4" textAnchor="middle" fontFamily="monospace">$</text>
    {/* Tail */}
    <path d="M 23 44 Q 16 40 17 34 Q 18 29 22 32" fill="none" stroke="hsl(0 0% 50%)" strokeWidth={1} strokeLinecap="round" />
  </svg>
);

const illustrationMap: Record<string, React.FC<{ hovered?: boolean }>> = {
  music: RecordPlayer,
  books: BookSpines,
  models: NodeNetwork,
  health: HealthItems,
  money: PiggyBank,
};

/* ── Bubble popup position logic ── */
const getBubblePosition = (index: number, total: number) => {
  // For items in the left half, show bubble to the right; otherwise left
  const isLeftHalf = index < total / 2;
  return isLeftHalf ? 'right' : 'left';
};

const BlueprintsPage = () => {
  useKeyboardScroll();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleItemClick = (id: string, link?: string) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedItem(selectedItem === id ? null : id);
  };

  const topShelf = shelfItems.slice(0, 2);
  const bottomShelf = shelfItems.slice(2);

  const renderShelfItem = (item: typeof shelfItems[0], i: number, totalInRow: number, delayBase: number) => {
    const Illustration = illustrationMap[item.id];
    const bubbleSide = getBubblePosition(i, totalInRow);
    const isSelected = selectedItem === item.id;
    const isHovered = hoveredItem === item.id;

    const widthClass = item.id === 'books'
      ? 'w-[160px] md:w-[220px]'
      : item.id === 'health'
        ? 'w-[140px] md:w-[200px]'
        : 'w-[100px] md:w-[140px]';

    return (
      <motion.div
        key={item.id}
        className="group cursor-pointer relative flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delayBase + i * 0.15, duration: 0.5 }}
        onClick={() => handleItemClick(item.id, item.link)}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {/* Title above */}
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1 flex items-center gap-1">
          {item.title}
          {item.link && <ExternalLink className="w-2.5 h-2.5" />}
        </span>

        {/* SVG illustration */}
        <div className={`${widthClass} h-[100px] md:h-[130px]`}>
          <Illustration hovered={isHovered} />
        </div>

        {/* Speech bubble popup */}
        <AnimatePresence>
          {isSelected && !item.link && (
            <motion.div
              className={`absolute top-1/2 -translate-y-1/2 z-20 ${
                bubbleSide === 'right'
                  ? 'left-full ml-3'
                  : 'right-full mr-3'
              }`}
              initial={{ opacity: 0, scale: 0.9, x: bubbleSide === 'right' ? -10 : 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: bubbleSide === 'right' ? -10 : 10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="relative bg-card border border-border rounded-lg p-4 w-[200px] md:w-[260px] shadow-lg">
                {/* Arrow */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-card border-border rotate-45 ${
                    bubbleSide === 'right'
                      ? '-left-1 border-l border-b'
                      : '-right-1 border-r border-t'
                  }`}
                />
                <h3 className="text-xs tracking-widest uppercase mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-[11px] leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                  className="mt-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

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
            100% foolproof processes to be awesome
          </p>

          {/* Bookshelf */}
          <div className="relative">
            {/* Top Shelf */}
            <div className="relative mb-0">
              <div className="flex items-end justify-center gap-6 md:gap-12 px-4 pb-0 min-h-[140px] md:min-h-[170px]">
                {topShelf.map((item, i) => renderShelfItem(item, i, topShelf.length, 0.6))}
              </div>
              <div className="h-px bg-foreground/20" />
            </div>

            {/* Bottom Shelf */}
            <div className="relative mt-8">
              <div className="flex items-end justify-center gap-4 md:gap-10 px-4 pb-0 min-h-[140px] md:min-h-[170px]">
                {bottomShelf.map((item, i) => renderShelfItem(item, i, bottomShelf.length, 0.9))}
              </div>
              <div className="h-px bg-foreground/20" />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BlueprintsPage;
