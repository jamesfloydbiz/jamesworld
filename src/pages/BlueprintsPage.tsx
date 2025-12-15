import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { ExternalLink } from 'lucide-react';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';

const frameworks = [
  {
    step: 1,
    title: 'Music',
    short: 'What he be jammin to?',
    long: 'Click for HEAT.',
    link: 'https://open.spotify.com/user/___vertigo___?si=dca6a7458c8849cf',
  },
  {
    step: 2,
    title: 'Books',
    short: "James' Recs",
    long: '4000 weeks, The Third Door, Make No Small Plans, Iron John, Winners take All',
  },
  {
    step: 3,
    title: 'Mental Models',
    short: 'Naval said collect them, and collect them I did.',
    long: 'Click to see them being automatically posted to my X.',
    link: 'https://x.com/jamesfloydbiz',
  },
  {
    step: 4,
    title: 'Tech',
    short: "James' Stack",
    long: 'ViewStats, N8N, Lovable, GSuite, ChatGPT, Windows, WhisprFlow, Meshy.Ai, LinkedIn Analytics',
  },
  {
    step: 5,
    title: 'Money',
    short: 'The roadmap to rich',
    long: 'Clarity → Cashflow → Consumption → Control → Risk Management',
  },
];

const BlueprintsPage = () => {
  useKeyboardScroll();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (step: number) => {
    setExpandedCard(expandedCard === step ? null : step);
  };

  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Blueprints" />
      
      <main className="pt-[200px] px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-4">Blueprints</h1>
          <p className="text-muted-foreground mb-4 text-sm md:text-base">
            The proven 5-step system that is 100% definitely going to make you awesome
          </p>
          <p className="text-muted-foreground text-xs mb-12">
            Tap on each step to explore
          </p>
          
          {/* Frameworks Grid */}
          <div className="space-y-4 mb-16">
            {frameworks.map((framework, index) => (
              <motion.div
                key={framework.step}
                className="border border-border overflow-hidden cursor-pointer hover:border-foreground transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                onClick={() => handleCardClick(framework.step)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {framework.step}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-lg mb-2">{framework.title}</h2>
                      <p className="text-muted-foreground text-sm">
                        {framework.short}
                      </p>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedCard === framework.step && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-border">
                          <p className="text-foreground text-sm leading-relaxed mb-4">
                            {framework.long}
                          </p>
                          {framework.link && (
                            <a
                              href={framework.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-primary text-primary-foreground text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              Download Complete Framework Guide
            </button>
          </motion.div>
        </motion.div>
      </main>
      
      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-background/80"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="relative bg-card border border-border p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-2xl mb-4">Sike!</h3>
              <p className="text-muted-foreground mb-6">
                I'm not selling a course, but if you really wanna know, reach out.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border text-sm hover:border-foreground transition-colors"
                >
                  Got it!
                </button>
                <a
                  href="mailto:jamesfloydbiz@gmail.com"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
                >
                  Let's chat
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlueprintsPage;
