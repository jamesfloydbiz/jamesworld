import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEACH_DATA, MODEL_NAMES, CORE_MODELS, COGNITIVE_MODELS, CUES } from './data';
import type { ModelKey } from './data';

const TeachItMode = () => {
  const [selectedModel, setSelectedModel] = useState<ModelKey | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [finished, setFinished] = useState(false);

  const handleSelectModel = (key: ModelKey) => {
    setSelectedModel(key);
    setCurrentQ(0);
    setAnswers([]);
    setShowInput(true);
    setInputValue('');
    setFinished(false);
  };

  const handleSubmitAnswer = () => {
    if (!selectedModel || !inputValue.trim()) return;
    const newAnswers = [...answers, inputValue.trim()];
    setAnswers(newAnswers);
    setInputValue('');

    if (newAnswers.length >= 3) {
      setShowInput(false);
      setFinished(true);
    } else {
      setCurrentQ((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setSelectedModel(null);
    setCurrentQ(0);
    setAnswers([]);
    setShowInput(true);
    setInputValue('');
    setFinished(false);
  };

  // Model selector
  if (!selectedModel) {
    return (
      <div className="space-y-8">
        <p className="text-[11px] text-foreground/30 italic">
          Pick a model. A student named Alex will ask you 3 progressively harder questions.
        </p>

        <div className="space-y-6">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/25 mb-3">Core Models</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CORE_MODELS.map((key) => (
                <button
                  key={key}
                  onClick={() => handleSelectModel(key)}
                  className="text-left p-3 border border-foreground/10 hover:border-foreground/25 hover:bg-foreground/[0.02] transition-all duration-300"
                >
                  <span className="text-[12px] text-foreground/50">{MODEL_NAMES[key]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/25 mb-3">Cognitive Biases</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COGNITIVE_MODELS.map((key) => (
                <button
                  key={key}
                  onClick={() => handleSelectModel(key)}
                  className="text-left p-3 border border-foreground/10 hover:border-foreground/25 hover:bg-foreground/[0.02] transition-all duration-300"
                >
                  <span className="text-[12px] text-foreground/50">{MODEL_NAMES[key]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const teachData = TEACH_DATA[selectedModel];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30">
          Teaching: {MODEL_NAMES[selectedModel]}
        </span>
        <button
          onClick={handleReset}
          className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 hover:text-foreground/60 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Conversation */}
      <div className="space-y-4">
        {answers.map((answer, i) => (
          <div key={i} className="space-y-3">
            {/* Alex's question */}
            <div className="border border-foreground/10 p-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/25 mb-2">Alex</p>
              <p className="text-[12px] md:text-[13px] leading-relaxed text-foreground/60 italic">
                {teachData.questions[i]}
              </p>
            </div>
            {/* User answer */}
            <div className="border border-foreground/[0.06] p-4 bg-foreground/[0.015] ml-4 md:ml-8">
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/20 mb-2">You</p>
              <p className="text-[12px] leading-relaxed text-foreground/50">{answer}</p>
            </div>
          </div>
        ))}

        {/* Current question */}
        {showInput && !finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="border border-foreground/10 p-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/25 mb-2">Alex</p>
              <p className="text-[12px] md:text-[13px] leading-relaxed text-foreground/60 italic">
                {teachData.questions[currentQ]}
              </p>
            </div>
            <div className="ml-4 md:ml-8 space-y-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Teach Alex..."
                className="w-full bg-transparent border border-foreground/10 p-3 text-[12px] text-foreground/60 placeholder:text-foreground/20 focus:outline-none focus:border-foreground/25 resize-none min-h-[80px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitAnswer();
                  }
                }}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!inputValue.trim()}
                className="text-[10px] tracking-[0.2em] uppercase border border-foreground/15 px-4 py-1.5 text-foreground/40 hover:text-foreground/70 hover:border-foreground/30 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Answer
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="h-px bg-foreground/10" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/30">
              What each question was designed to test
            </p>
            {teachData.tested.map((test, i) => (
              <div key={i} className="border border-foreground/[0.06] p-4 bg-foreground/[0.015] space-y-2">
                <p className="text-[10px] text-foreground/25 font-mono">Q{i + 1}</p>
                <p className="text-[12px] leading-relaxed text-foreground/55">{test}</p>
              </div>
            ))}

            <div className="border border-foreground/[0.06] p-4 bg-foreground/[0.015]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/25 mb-2">
                Triggers when
              </p>
              <p className="text-[11px] leading-relaxed text-foreground/45 italic">
                {CUES[selectedModel]}
              </p>
            </div>

            <button
              onClick={handleReset}
              className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              ← Choose another model
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeachItMode;
