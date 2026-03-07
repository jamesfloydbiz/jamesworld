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

/* ── SVG Illustrations ── */

const RecordPlayer = () => (
  <svg viewBox="0 0 120 100" className="w-full h-full">
    {/* Turntable base */}
    <rect x="10" y="30" width="100" height="65" rx="4" fill="hsl(30 20% 15%)" stroke="hsl(0 0% 25%)" strokeWidth="1" />
    <rect x="15" y="35" width="90" height="55" rx="2" fill="hsl(30 15% 10%)" />
    {/* Platter */}
    <circle cx="55" cy="62" r="24" fill="hsl(0 0% 8%)" stroke="hsl(0 0% 20%)" strokeWidth="0.5" />
    {/* Vinyl grooves */}
    <circle cx="55" cy="62" r="20" fill="none" stroke="hsl(0 0% 15%)" strokeWidth="0.3" />
    <circle cx="55" cy="62" r="16" fill="none" stroke="hsl(0 0% 15%)" strokeWidth="0.3" />
    <circle cx="55" cy="62" r="12" fill="none" stroke="hsl(0 0% 15%)" strokeWidth="0.3" />
    <circle cx="55" cy="62" r="8" fill="none" stroke="hsl(0 0% 15%)" strokeWidth="0.3" />
    {/* Label */}
    <circle cx="55" cy="62" r="5" fill="hsl(0 60% 40%)" />
    <circle cx="55" cy="62" r="1.5" fill="hsl(0 0% 8%)" />
    {/* Tonearm */}
    <line x1="90" y1="38" x2="90" y2="42" stroke="hsl(0 0% 50%)" strokeWidth="2" />
    <line x1="90" y1="42" x2="68" y2="55" stroke="hsl(0 0% 45%)" strokeWidth="1.5" strokeLinecap="round" className="origin-[90px_42px] transition-transform duration-300 group-hover:-rotate-6" />
    {/* Cartridge */}
    <rect x="65" y="53" width="5" height="3" rx="1" fill="hsl(0 0% 40%)" className="origin-[90px_42px] transition-transform duration-300 group-hover:-rotate-6" />
  </svg>
);

const BookSpines = () => (
  <svg viewBox="0 0 140 100" className="w-full h-full">
    {/* Book 1 - tall thin */}
    <rect x="8" y="10" width="14" height="85" rx="1" fill="hsl(220 30% 25%)" stroke="hsl(220 20% 35%)" strokeWidth="0.5" />
    <text x="15" y="55" fill="hsl(0 0% 70%)" fontSize="3.5" textAnchor="middle" transform="rotate(-90 15 55)" letterSpacing="1">4000 WEEKS</text>
    {/* Book 2 - medium */}
    <rect x="25" y="20" width="18" height="75" rx="1" fill="hsl(35 40% 22%)" stroke="hsl(35 30% 32%)" strokeWidth="0.5" />
    <text x="34" y="58" fill="hsl(40 50% 70%)" fontSize="3" textAnchor="middle" transform="rotate(-90 34 58)" letterSpacing="0.8">THIRD DOOR</text>
    {/* Book 3 - thick */}
    <rect x="46" y="15" width="20" height="80" rx="1" fill="hsl(0 50% 25%)" stroke="hsl(0 40% 35%)" strokeWidth="0.5" />
    <text x="56" y="55" fill="hsl(0 0% 80%)" fontSize="3" textAnchor="middle" transform="rotate(-90 56 55)" letterSpacing="0.5">IRON JOHN</text>
    {/* Book 4 - slim */}
    <rect x="69" y="22" width="12" height="73" rx="1" fill="hsl(150 20% 20%)" stroke="hsl(150 15% 30%)" strokeWidth="0.5" />
    <text x="75" y="58" fill="hsl(150 30% 65%)" fontSize="2.8" textAnchor="middle" transform="rotate(-90 75 58)" letterSpacing="0.5">WINNERS</text>
    {/* Book 5 - medium thick */}
    <rect x="84" y="12" width="22" height="83" rx="1" fill="hsl(270 20% 20%)" stroke="hsl(270 15% 30%)" strokeWidth="0.5" />
    <text x="95" y="52" fill="hsl(270 25% 65%)" fontSize="2.5" textAnchor="middle" transform="rotate(-90 95 52)" letterSpacing="0.3">LESSONS OF HISTORY</text>
    {/* Book 6 - leaning */}
    <rect x="108" y="18" width="16" height="77" rx="1" fill="hsl(45 30% 18%)" stroke="hsl(45 25% 28%)" strokeWidth="0.5" transform="rotate(5 116 56)" />
    <text x="116" y="55" fill="hsl(45 40% 65%)" fontSize="2.5" textAnchor="middle" transform="rotate(-85 116 55)" letterSpacing="0.5">NO SMALL PLANS</text>
  </svg>
);

const BlueprintScroll = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Rolled scroll body */}
    <rect x="25" y="15" width="50" height="70" rx="2" fill="hsl(210 30% 18%)" stroke="hsl(210 25% 30%)" strokeWidth="0.8" />
    {/* Blueprint grid lines */}
    <line x1="30" y1="25" x2="70" y2="25" stroke="hsl(210 40% 35%)" strokeWidth="0.3" />
    <line x1="30" y1="35" x2="70" y2="35" stroke="hsl(210 40% 35%)" strokeWidth="0.3" />
    <line x1="30" y1="45" x2="70" y2="45" stroke="hsl(210 40% 35%)" strokeWidth="0.3" />
    <line x1="30" y1="55" x2="70" y2="55" stroke="hsl(210 40% 35%)" strokeWidth="0.3" />
    <line x1="30" y1="65" x2="70" y2="65" stroke="hsl(210 40% 35%)" strokeWidth="0.3" />
    <line x1="40" y1="20" x2="40" y2="80" stroke="hsl(210 40% 35%)" strokeWidth="0.3" />
    <line x1="50" y1="20" x2="50" y2="80" stroke="hsl(210 40% 35%)" strokeWidth="0.3" />
    <line x1="60" y1="20" x2="60" y2="80" stroke="hsl(210 40% 35%)" strokeWidth="0.3" />
    {/* Roll at top */}
    <ellipse cx="50" cy="15" rx="28" ry="5" fill="hsl(210 25% 22%)" stroke="hsl(210 20% 35%)" strokeWidth="0.5" />
    {/* Tack pin */}
    <circle cx="50" cy="10" r="3" fill="hsl(0 60% 45%)" stroke="hsl(0 50% 35%)" strokeWidth="0.5" />
    <circle cx="50" cy="10" r="1" fill="hsl(0 60% 60%)" />
    {/* Label */}
    <text x="50" y="50" fill="hsl(210 50% 55%)" fontSize="5" textAnchor="middle" fontFamily="monospace">MODELS</text>
  </svg>
);

const HealthItems = () => (
  <svg viewBox="0 0 130 100" className="w-full h-full">
    {/* Supplement bottle 1 */}
    <rect x="8" y="30" width="16" height="40" rx="3" fill="hsl(0 0% 90%)" stroke="hsl(0 0% 70%)" strokeWidth="0.5" />
    <rect x="10" y="25" width="12" height="8" rx="1" fill="hsl(0 0% 80%)" />
    <rect x="11" y="40" width="10" height="15" rx="1" fill="hsl(140 40% 35%)" />
    <circle cx="16" y="28" r="2" fill="hsl(140 40% 35%)" />
    {/* Supplement bottle 2 - taller */}
    <rect x="28" y="22" width="14" height="48" rx="3" fill="hsl(40 20% 85%)" stroke="hsl(40 15% 65%)" strokeWidth="0.5" />
    <rect x="30" y="18" width="10" height="7" rx="1" fill="hsl(40 15% 75%)" />
    <rect x="30" y="35" width="10" height="18" rx="1" fill="hsl(30 60% 40%)" />
    {/* Supplement bottle 3 - short */}
    <rect x="46" y="40" width="18" height="30" rx="3" fill="hsl(0 0% 95%)" stroke="hsl(0 0% 75%)" strokeWidth="0.5" />
    <rect x="49" y="36" width="12" height="7" rx="1" fill="hsl(0 0% 85%)" />
    <rect x="49" y="48" width="12" height="12" rx="1" fill="hsl(200 50% 35%)" />
    {/* Bowl */}
    <ellipse cx="90" cy="65" rx="25" ry="8" fill="hsl(30 20% 25%)" />
    <ellipse cx="90" cy="58" rx="25" ry="12" fill="hsl(30 15% 30%)" stroke="hsl(30 10% 40%)" strokeWidth="0.5" />
    <ellipse cx="90" cy="58" rx="22" ry="10" fill="hsl(30 10% 20%)" />
    {/* Greens in bowl */}
    <ellipse cx="82" cy="54" rx="6" ry="4" fill="hsl(130 50% 30%)" />
    <ellipse cx="92" cy="52" rx="7" ry="4" fill="hsl(140 45% 35%)" />
    <ellipse cx="98" cy="55" rx="5" ry="3" fill="hsl(120 40% 28%)" />
    <ellipse cx="86" cy="50" rx="5" ry="3" fill="hsl(135 55% 32%)" />
    <ellipse cx="94" cy="48" rx="4" ry="3" fill="hsl(145 50% 25%)" />
  </svg>
);

const PiggyBank = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Body */}
    <ellipse cx="50" cy="55" rx="30" ry="22" fill="hsl(340 35% 55%)" />
    <ellipse cx="50" cy="55" rx="30" ry="22" fill="hsl(340 30% 50%)" />
    {/* Snout */}
    <ellipse cx="78" cy="52" rx="8" ry="6" fill="hsl(340 40% 60%)" stroke="hsl(340 30% 45%)" strokeWidth="0.5" />
    <circle cx="76" cy="50" r="1.5" fill="hsl(340 25% 40%)" />
    <circle cx="80" cy="50" r="1.5" fill="hsl(340 25% 40%)" />
    {/* Eye */}
    <circle cx="68" cy="44" r="2.5" fill="hsl(0 0% 95%)" />
    <circle cx="68" cy="44" r="1.2" fill="hsl(0 0% 10%)" />
    {/* Ears */}
    <ellipse cx="42" cy="35" rx="7" ry="5" fill="hsl(340 35% 48%)" transform="rotate(-20 42 35)" />
    <ellipse cx="55" cy="33" rx="7" ry="5" fill="hsl(340 35% 48%)" transform="rotate(10 55 33)" />
    {/* Legs */}
    <rect x="30" y="70" width="8" height="12" rx="2" fill="hsl(340 30% 45%)" />
    <rect x="42" y="72" width="8" height="10" rx="2" fill="hsl(340 30% 45%)" />
    <rect x="55" y="72" width="8" height="10" rx="2" fill="hsl(340 30% 45%)" />
    <rect x="65" y="70" width="8" height="12" rx="2" fill="hsl(340 30% 45%)" />
    {/* Coin slot */}
    <rect x="44" y="34" width="12" height="2" rx="1" fill="hsl(340 20% 38%)" />
    {/* Coin */}
    <circle cx="50" cy="30" r="5" fill="hsl(45 70% 55%)" stroke="hsl(45 60% 45%)" strokeWidth="0.5" />
    <text x="50" y="32" fill="hsl(45 60% 35%)" fontSize="5" textAnchor="middle" fontWeight="bold">$</text>
    {/* Tail */}
    <path d="M 22 50 Q 14 45 16 38 Q 18 32 22 36" fill="none" stroke="hsl(340 35% 50%)" strokeWidth="2" strokeLinecap="round" />
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

  const topShelf = shelfItems.slice(0, 2);    // Music, Books
  const bottomShelf = shelfItems.slice(2);     // Models, Health, Money

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
              <div className="flex items-end justify-center gap-6 md:gap-12 px-4 pb-3 min-h-[140px] md:min-h-[180px]">
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
              {/* Shelf plank */}
              <div className="h-[6px] rounded-sm" style={{ background: 'linear-gradient(180deg, hsl(30 25% 18%) 0%, hsl(30 20% 12%) 100%)' }} />
              <div className="h-[3px]" style={{ background: 'linear-gradient(180deg, hsl(30 15% 8%) 0%, transparent 100%)' }} />
            </div>

            {/* Bottom Shelf */}
            <div className="relative mt-6">
              <div className="flex items-end justify-center gap-4 md:gap-10 px-4 pb-3 min-h-[140px] md:min-h-[180px]">
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
              {/* Shelf plank */}
              <div className="h-[6px] rounded-sm" style={{ background: 'linear-gradient(180deg, hsl(30 25% 18%) 0%, hsl(30 20% 12%) 100%)' }} />
              <div className="h-[3px]" style={{ background: 'linear-gradient(180deg, hsl(30 15% 8%) 0%, transparent 100%)' }} />
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
