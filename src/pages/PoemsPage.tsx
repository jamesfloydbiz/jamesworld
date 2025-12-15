import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';

const poems = [
  'Abundance',
  'Alone Again',
  'Contradictions',
  'Energy',
  'Eyes',
  'Flow',
  'Hi Im James',
  'Home',
  'Into the Darkness',
  'Love Begets Love',
  'Madman',
  'Manhood',
  'No Sleep',
  'Ode to forever',
  'Off',
  'Peace',
  'Possibility',
  'Sleep',
  'The Dance with Death',
  'The Fight...',
  'The Wanderer',
  'The trials of Danger',
  'To Her',
  'To the Strivers',
  'Weary Woman',
  'Wisdom is Pain',
  'Dear Darkness',
  'No Sleep (alternate)',
];

const PoemsPage = () => {
  useKeyboardScroll();
  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Poems" />
      
      <main className="pt-[200px] px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="flex items-baseline gap-4 mb-12">
            <h1 className="text-3xl md:text-4xl tracking-widest uppercase">All Poems</h1>
            <span className="px-3 py-1 bg-secondary text-sm">
              {poems.length} pieces
            </span>
          </div>
          
          {/* Poems Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {poems.map((poem, index) => (
              <motion.div
                key={poem}
                className="border border-border p-4 hover:border-foreground transition-colors cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.03, duration: 0.4 }}
              >
                <div className="bg-secondary aspect-square mb-3 flex items-center justify-center text-muted-foreground text-xs">
                  [Image]
                </div>
                <p className="text-sm group-hover:underline underline-offset-4">
                  {poem}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PoemsPage;
