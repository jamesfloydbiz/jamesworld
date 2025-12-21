import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { X } from 'lucide-react';

const poems = [
  'Weary Woman',
  'The Wanderer',
  'Madman',
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
  'Manhood',
  'No Sleep',
  'Ode to forever',
  'Off',
  'Peace',
  'Possibility',
  'Sleep',
  'The Dance with Death',
  'The Fight...',
  'The trials of Danger',
  'To Her',
  'To the Strivers',
  'Wisdom is Pain',
];

const PoemsPage = () => {
  useKeyboardScroll();
  const [selectedPoem, setSelectedPoem] = useState<string | null>(null);

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
                onClick={() => setSelectedPoem(poem)}
              >
                <div className="aspect-square mb-3 overflow-hidden">
                  <img 
                    src={`/poems/${encodeURIComponent(poem)}.png`} 
                    alt={poem}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm group-hover:underline underline-offset-4">
                  {poem}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPoem && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPoem(null)}
          >
            <button
              className="absolute top-6 right-6 z-10 p-2 hover:bg-secondary rounded-full transition-colors"
              onClick={() => setSelectedPoem(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div 
              className="h-full w-full overflow-y-auto p-6 md:p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <h2 className="text-2xl tracking-widest uppercase mb-6 text-center">
                  {selectedPoem}
                </h2>
                <img 
                  src={`/poems/${encodeURIComponent(selectedPoem)}.png`} 
                  alt={selectedPoem}
                  className="w-full h-auto"
                  onClick={() => setSelectedPoem(null)}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PoemsPage;
