import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPOT_SCENARIOS, MODEL_NAMES, CUES } from './data';

const SpotItMode = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const scenario = SPOT_SCENARIOS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SPOT_SCENARIOS.length);
    setRevealed(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SPOT_SCENARIOS.length) % SPOT_SCENARIOS.length);
    setRevealed(false);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30">
          {currentIndex + 1} / {SPOT_SCENARIOS.length}
        </span>
        {revealed && (
          <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30">
            {MODEL_NAMES[scenario.model]}
          </span>
        )}
      </div>

      {/* Scenario */}
      <div className="border border-foreground/10 p-5 md:p-6">
        <p className="text-[13px] md:text-sm leading-relaxed text-foreground/70">{scenario.text}</p>
      </div>

      {/* Prompt */}
      {!revealed && (
        <div className="text-center">
          <p className="text-[11px] text-foreground/30 mb-3 italic">Which mental model is at work here?</p>
          <button
            onClick={() => setRevealed(true)}
            className="text-[10px] tracking-[0.2em] uppercase border border-foreground/15 px-5 py-2 text-foreground/40 hover:text-foreground/70 hover:border-foreground/30 transition-all duration-300"
          >
            Reveal
          </button>
        </div>
      )}

      {/* Reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="border border-foreground/10 p-5 md:p-6 space-y-3">
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/30">
                {MODEL_NAMES[scenario.model]}
              </p>
              <p className="text-[12px] md:text-[13px] leading-relaxed text-foreground/60">
                {scenario.reveal}
              </p>
            </div>

            <div className="border border-foreground/[0.06] p-4 bg-foreground/[0.015]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/25 mb-2">
                Triggers when
              </p>
              <p className="text-[11px] leading-relaxed text-foreground/45 italic">
                {CUES[scenario.model]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 hover:text-foreground/60 transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={handleNext}
          className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 hover:text-foreground/60 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default SpotItMode;
