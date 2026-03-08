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

/* ── Gramophone with animated music notes ── */
const Gramophone = ({ hovered }: { hovered: boolean }) => (
  <svg viewBox="0 0 100 90" className="w-full h-full">
    {/* Base platform */}
    <rect x="25" y="78" width="50" height="6" {...S} rx="1" />
    {/* Cabinet body */}
    <rect x="30" y="58" width="40" height="22" {...S} rx="1" />
    {/* Crank handle on side */}
    <line x1="70" y1="68" x2="78" y2="68" {...Sd} strokeLinecap="round" />
    <circle cx="80" cy="68" r="2" {...Sd} />
    {/* Tonearm post */}
    <line x1="50" y1="58" x2="50" y2="42" {...S} strokeLinecap="round" />
    {/* Tonearm elbow */}
    <line x1="50" y1="42" x2="55" y2="38" {...Sd} strokeLinecap="round" />
    {/* Horn neck */}
    <path d="M 55 38 Q 58 32 60 26" {...S} strokeLinecap="round" />
    {/* Horn bell — flared opening */}
    <path d="M 60 26 Q 52 18 42 10" {...S} strokeLinecap="round" />
    <path d="M 60 26 Q 68 18 78 14" {...S} strokeLinecap="round" />
    {/* Horn rim arc */}
    <path d="M 42 10 Q 60 4 78 14" {...S} strokeLinecap="round" />
    {/* Inner horn detail */}
    <path d="M 48 16 Q 60 12 72 17" {...Sd} strokeLinecap="round" />
    {/* Turntable disc on top of cabinet */}
    <ellipse cx="50" cy="58" rx="14" ry="3" {...Sd} />
    {/* Animated music notes floating from horn */}
    {hovered && (
      <>
        <text className="animate-music-note-1" x="50" y="12" fill="hsl(0 0% 70%)" fontSize="8" fontFamily="serif">♪</text>
        <text className="animate-music-note-2" x="62" y="8" fill="hsl(0 0% 55%)" fontSize="7" fontFamily="serif">♫</text>
        <text className="animate-music-note-3" x="72" y="10" fill="hsl(0 0% 65%)" fontSize="8" fontFamily="serif">♪</text>
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

/* ── Mental Models — Swinging Sticks Perpetual Motion ── */
const SwingingSticks = () => (
  <svg viewBox="0 0 100 90" className="w-full h-full">
    {/* Base */}
    <rect x="30" y="82" width="40" height="4" {...S} rx="1" />
    {/* Vertical post */}
    <line x1="50" y1="82" x2="50" y2="40" {...S} strokeLinecap="round" />
    {/* Pivot point */}
    <circle cx="50" cy="40" r="2" {...S} />
    {/* Long arm — swings one direction */}
    <g className="animate-swing-stick-1" style={{ transformOrigin: '50px 40px' }}>
      <line x1="50" y1="40" x2="50" y2="8" stroke="hsl(0 0% 70%)" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx="50" cy="8" r="3" {...S} />
    </g>
    {/* Short arm — swings opposite direction */}
    <g className="animate-swing-stick-2" style={{ transformOrigin: '50px 40px' }}>
      <line x1="50" y1="40" x2="50" y2="60" stroke="hsl(0 0% 70%)" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx="50" cy="60" r="2.5" {...S} />
    </g>
  </svg>
);

/* ── Health — Woven fruit basket ── */
const FruitBasket = () => (
  <svg viewBox="0 0 120 90" className="w-full h-full">
    {/* Basket body */}
    <path d="M 20 50 Q 20 86 60 86 Q 100 86 100 50" {...S} strokeLinecap="round" />
    <line x1="18" y1="50" x2="102" y2="50" {...S} />
    {/* Basket handle */}
    <path d="M 35 50 Q 60 20 85 50" {...S} strokeLinecap="round" />
    {/* Weave lines horizontal */}
    <path d="M 24 60 Q 60 58 96 60" {...Sd} />
    <path d="M 28 70 Q 60 68 92 70" {...Sd} />
    <path d="M 34 78 Q 60 77 86 78" {...Sd} />
    {/* Weave lines vertical */}
    <line x1="45" y1="50" x2="42" y2="84" {...Sd} />
    <line x1="60" y1="50" x2="60" y2="86" {...Sd} />
    <line x1="75" y1="50" x2="78" y2="84" {...Sd} />

    {/* Apple — sitting above rim left */}
    <circle cx="42" cy="42" r="7" {...S} />
    <line x1="42" y1="35" x2="42" y2="30" {...Sd} strokeLinecap="round" />
    <path d="M 42 31 Q 47 28 49 31" {...Sd} strokeLinecap="round" />

    {/* Banana — crescent center */}
    <path d="M 55 38 Q 66 28 75 36 Q 66 32 55 42 Z" {...S} strokeLinecap="round" />

    {/* Broccoli — small tree floret right */}
    <line x1="80" y1="48" x2="80" y2="40" {...Sd} strokeLinecap="round" />
    <circle cx="75" cy="38" r="3.5" {...S} />
    <circle cx="80" cy="36" r="3.5" {...S} />
    <circle cx="85" cy="38" r="3.5" {...S} />
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
  music: Gramophone,
  books: BookSpines,
  models: SwingingSticks,
  health: FruitBasket,
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
