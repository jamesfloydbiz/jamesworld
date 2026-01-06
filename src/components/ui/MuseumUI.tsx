import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { joystickState } from '@/components/museum/useKeyboardControls';
import { motion, AnimatePresence } from 'framer-motion';

// Permanent controls hint at bottom of screen
function ControlsHint({ isMobile }: { isMobile: boolean }) {
  if (isMobile) return null;

  return (
    <div className="museum-ui bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-50">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Move</span>
        <span className="border border-border/40 px-1.5 py-0.5 text-[10px]">WASD</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Sprint</span>
        <span className="border border-border/40 px-1.5 py-0.5 text-[10px]">Shift</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Interact</span>
        <span className="border border-border/40 px-1.5 py-0.5 text-[10px]">Enter</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Menu</span>
        <span className="border border-border/40 px-1.5 py-0.5 text-[10px]">ESC</span>
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
