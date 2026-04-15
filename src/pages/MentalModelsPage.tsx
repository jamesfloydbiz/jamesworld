import { useState } from 'react';
import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { REFERENCE_LIST } from '@/components/mental-models/data';
import DecideMode from '@/components/mental-models/DecideMode';
import SpotItMode from '@/components/mental-models/SpotItMode';

type Mode = 'decide' | 'spot';

const TABS: { key: Mode; label: string }[] = [
  { key: 'decide', label: 'Decide' },
  { key: 'spot', label: 'Spot It' },
];

const MentalModelsPage = () => {
  useKeyboardScroll();
  const [mode, setMode] = useState<Mode>('decide');

  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Mental Models" />

      <main className="pt-16 px-4 md:px-8 pb-24">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {/* Header */}
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-2">Mental Models</h1>
          <p className="text-foreground/40 text-[11px] md:text-xs font-mono mb-6">
            teach yourself to think in systems — then practice using them
          </p>
          <div className="h-px bg-foreground/10 mb-6" />

          {/* Description */}
          <p className="text-foreground/35 text-xs md:text-sm leading-relaxed mb-4">
            After reading <span className="italic">Poor Charlie's Almanack</span>, I became obsessed with the mental models that made Charlie Munger one of the greatest thinkers in modern business. This page is my practice ground — a way to internalize those models until they fire automatically.
          </p>
          <p className="text-foreground/35 text-xs md:text-sm leading-relaxed mb-10">
            Two modes: <span className="text-foreground/50">Decide</span> drops you into scenarios where you pick the right model for the situation. <span className="text-foreground/50">Spot It</span> trains you to recognize models in real-world examples. The goal isn't to memorize — it's to rewire how you think.
          </p>

          {/* Tabs */}
          <div className="flex gap-6 mb-10">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                className={`text-[10px] tracking-[0.25em] uppercase pb-1.5 transition-all duration-300 ${
                  mode === tab.key
                    ? 'text-foreground/70 border-b border-foreground/40'
                    : 'text-foreground/25 hover:text-foreground/45'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active mode */}
          <div className="min-h-[400px]">
            {mode === 'decide' && <DecideMode />}
            {mode === 'spot' && <SpotItMode />}
          </div>

          {/* Reference list */}
          <div className="mt-20">
            <div className="h-px bg-foreground/10 mb-8" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/25 mb-6">
              Quick Reference
            </p>
            <div className="space-y-0">
              {REFERENCE_LIST.map((entry, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 py-3 border-b border-foreground/[0.05]"
                >
                  <span className="text-[11px] text-foreground/40 tracking-wide">{entry.model}</span>
                  <span className="text-[11px] text-foreground/25 leading-relaxed">{entry.example}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit */}
          <p className="mt-12 text-[10px] text-foreground/15 italic text-center">
            Inspired by Poor Charlie's Almanack by Charles T. Munger
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default MentalModelsPage;
