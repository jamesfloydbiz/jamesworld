import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { joystickState } from '@/components/museum/useKeyboardControls';
import { motion, AnimatePresence } from 'framer-motion';

// Minimal controls hint at bottom of screen
function ControlsHint({ isMobile }: { isMobile: boolean }) {
  if (isMobile) return null;

  return (
    <div className="museum-ui bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-30">
      {/* Move - arrow key cross layout */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="border border-foreground/20 w-5 h-5 flex items-center justify-center text-[9px] text-foreground/60">↑</div>
        <div className="flex gap-0.5">
          <div className="border border-foreground/20 w-5 h-5 flex items-center justify-center text-[9px] text-foreground/60">←</div>
          <div className="border border-foreground/20 w-5 h-5 flex items-center justify-center text-[9px] text-foreground/60">↓</div>
          <div className="border border-foreground/20 w-5 h-5 flex items-center justify-center text-[9px] text-foreground/60">→</div>
        </div>
      </div>
      
      {/* ESC for menu */}
      <div className="flex flex-col items-center gap-1">
        <div className="border border-foreground/20 px-2 py-1 text-[9px] text-foreground/60 tracking-wider">ESC</div>
      </div>
    </div>
  );
}

export function MuseumUI() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const { 
    activePortal, 
    saveHubState,
    setIsTransitioning,
    isTransitioning,
  } = useGameStore();

  // Detect mobile/touch device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    if (!isMobile) return;
    
    const checkInteract = setInterval(() => {
      if (joystickState.interact && activePortal && !isTransitioning) {
        handleInteraction();
        joystickState.interact = false;
      }
    }, 50);

    return () => clearInterval(checkInteract);
  }, [isMobile, activePortal, isTransitioning, handleInteraction]);

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
            {!isMobile && (
              <div className="text-muted-foreground text-xs">
                Press <span className="text-foreground border border-border px-2 py-1 mx-1">Enter</span> to open
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls hint - desktop only, fades after 5 seconds */}
      <ControlsHint isMobile={isMobile} />
    </>
  );
}
