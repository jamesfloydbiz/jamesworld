import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { joystickState } from '@/components/museum/useKeyboardControls';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

// Compact controls hint - half size, centered
export function ControlsHint() {
  const isSmallScreen = useIsMobile();
  
  if (isSmallScreen) return null;

  return (
    <motion.div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 0.5, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-end gap-8">
        {/* Arrow keys - cross layout */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-col items-center gap-px">
            <div className="w-4 h-4 border border-white/60 flex items-center justify-center">
              <span className="text-white/80 text-[8px]">↑</span>
            </div>
            <div className="flex gap-px">
              <div className="w-4 h-4 border border-white/60 flex items-center justify-center">
                <span className="text-white/80 text-[8px]">←</span>
              </div>
              <div className="w-4 h-4 border border-white/60 flex items-center justify-center">
                <span className="text-white/80 text-[8px]">↓</span>
              </div>
              <div className="w-4 h-4 border border-white/60 flex items-center justify-center">
                <span className="text-white/80 text-[8px]">→</span>
              </div>
            </div>
          </div>
          <span className="text-[7px] text-white/50 tracking-[0.2em] uppercase">Move</span>
        </div>

        {/* ESC key */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-4 px-1.5 border border-white/60 flex items-center justify-center">
            <span className="text-white/80 text-[8px] tracking-wide">ESC</span>
          </div>
          <span className="text-[7px] text-white/50 tracking-[0.2em] uppercase">Menu</span>
        </div>

        {/* Enter key */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-4 px-1.5 border border-white/60 flex items-center justify-center">
            <span className="text-white/80 text-[8px]">↵</span>
          </div>
          <span className="text-[7px] text-white/50 tracking-[0.2em] uppercase">Enter</span>
        </div>
      </div>
    </motion.div>
  );
}

export function MuseumUI() {
  const navigate = useNavigate();
  const isSmallScreen = useIsMobile(); // breakpoint-based (768px)
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { 
    activePortal, 
    saveHubState,
    setIsTransitioning,
    isTransitioning,
  } = useGameStore();

  // Detect touch capability for mobile controls (joystick, interact button)
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Handle Enter key for portal interaction
  const handleInteraction = useCallback(() => {
    if (activePortal && !isTransitioning) {
      setIsTransitioning(true);
      saveHubState();
      
      // Transition animation
      setTimeout(() => {
        navigate(activePortal.route);
      }, 400);
    }
  }, [activePortal, isTransitioning, navigate, saveHubState, setIsTransitioning]);

  // Direct keyboard event listeners (only Enter for portal interaction)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && activePortal && !isTransitioning) {
        handleInteraction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePortal, isTransitioning, handleInteraction]);

  // Mobile interact button listener
  useEffect(() => {
    if (!isTouchDevice) return;
    
    const checkInteract = setInterval(() => {
      if (joystickState.interact && activePortal && !isTransitioning) {
        handleInteraction();
        joystickState.interact = false;
      }
    }, 50);

    return () => clearInterval(checkInteract);
  }, [isTouchDevice, activePortal, isTransitioning, handleInteraction]);

  return (
    <>
      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="page-transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Portal prompt */}
      <AnimatePresence>
        {activePortal && !isTransitioning && (
          <motion.div
            className="museum-ui bottom-32 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="text-lg mb-2 tracking-wider">{activePortal.title}</div>
            {!isSmallScreen && (
              <div className="text-muted-foreground text-xs">
                Press <span className="text-foreground border border-border px-2 py-1 mx-1">Enter</span> to open
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
