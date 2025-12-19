import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { joystickState } from '@/components/museum/useKeyboardControls';
import { motion, AnimatePresence } from 'framer-motion';

// Controls hint that fades out after 5 seconds
function ControlsHint({ isMobile }: { isMobile: boolean }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (isMobile || !visible) return null;

  return (
    <motion.div
      className="museum-ui bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 4, duration: 1 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Move</span>
        <div className="flex gap-1">
          <span className="border border-border/50 px-1.5 py-0.5 text-xs">↑</span>
        </div>
        <div className="flex gap-1">
          <span className="border border-border/50 px-1.5 py-0.5 text-xs">←</span>
          <span className="border border-border/50 px-1.5 py-0.5 text-xs">↓</span>
          <span className="border border-border/50 px-1.5 py-0.5 text-xs">→</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Sprint</span>
        <span className="border border-border/50 px-1.5 py-0.5 text-xs">Shift</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Exit</span>
        <span className="border border-border/50 px-1.5 py-0.5 text-xs">ESC</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Enter</span>
        <span className="border border-border/50 px-1.5 py-0.5 text-xs">↵</span>
      </div>
    </motion.div>
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
