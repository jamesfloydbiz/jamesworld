import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  progress: number;
  isFullyLoaded: boolean;
  onStart: () => void;
}

export function LoadingScreen({ progress, isFullyLoaded, onStart }: LoadingScreenProps) {
  const [showButton, setShowButton] = useState(false);
  
  // Show button when fully loaded
  useEffect(() => {
    if (isFullyLoaded && !showButton) {
      const timer = setTimeout(() => setShowButton(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isFullyLoaded, showButton]);

  const strokeDasharray = 400; // Perimeter of the square (100 * 4)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * Math.min(progress, 100)) / 100;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-32 h-32">
        {/* SVG square that traces as it loads */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background square (faint) */}
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="1"
            opacity="0.2"
          />
          {/* Animated tracing square */}
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        
        {/* GO button appears when complete */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center text-white text-2xl font-light tracking-widest hover:text-muted-foreground transition-colors cursor-pointer"
              onClick={onStart}
            >
              GO
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Loading text */}
      {!showButton && (
        <motion.div 
          className="mt-8 text-muted-foreground text-sm tracking-wider"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          LOADING
        </motion.div>
      )}
    </motion.div>
  );
}