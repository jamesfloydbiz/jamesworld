import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DECIDE_SCENARIOS, MODEL_NAMES, CUES } from './data';

const DecideMode = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const scenario = DECIDE_SCENARIOS[currentIndex];
  const isCorrect = selected === scenario.correct;

  const handleSelect = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DECIDE_SCENARIOS.length);
    setSelected(null);
    setRevealed(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DECIDE_SCENARIOS.length) % DECIDE_SCENARIOS.length);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30">
          {currentIndex + 1} / {DECIDE_SCENARIOS.length}
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30">
          {MODEL_NAMES[scenario.model]}
        </span>
      </div>

      {/* Situation */}
      <div className="border border-foreground/10 p-5 md:p-6">
        <p className="text-[13px] md:text-sm leading-relaxed text-foreground/70">{scenario.sit}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {scenario.opts.map((opt, i) => {
          let borderClass = 'border-foreground/10';
          if (revealed) {
            if (i === scenario.correct) borderClass = 'border-l-foreground/80';
            else if (i === selected) borderClass = 'border-l-red-900/60';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`w-full text-left p-4 border transition-all duration-300 ${
                revealed ? 'border-l-2' : 'border'
              } ${borderClass} ${
                !revealed ? 'hover:border-foreground/25 hover:bg-foreground/[0.02] cursor-pointer' : ''
              } ${selected === i && !revealed ? 'bg-foreground/[0.03]' : ''}`}
            >
              <span className="text-[12px] md:text-[13px] leading-relaxed text-foreground/60">
                <span className="text-foreground/25 mr-2 font-mono text-[11px]">{String.fromCharCode(65 + i)}</span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

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
            <div className="border border-foreground/10 p-5 md:p-6 space-y-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/30">
                {isCorrect ? 'Correct' : 'Not quite'}
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

export default DecideMode;
