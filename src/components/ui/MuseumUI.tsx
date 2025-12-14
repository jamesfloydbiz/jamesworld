import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useKeyboardControls } from '../museum/useKeyboardControls';
import { motion, AnimatePresence } from 'framer-motion';

export function MuseumUI() {
  const navigate = useNavigate();
  const { 
    activePortal, 
    menuOpen, 
    setMenuOpen, 
    saveHubState,
    setIsTransitioning,
    isTransitioning,
  } = useGameStore();
  
  const keys = useKeyboardControls();

  // Handle Enter key for portal interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (activePortal && !isTransitioning) {
        setIsTransitioning(true);
        saveHubState();
        
        // Transition animation
        setTimeout(() => {
          navigate(activePortal.route);
        }, 400);
      }
    };

    if (keys.interact && activePortal) {
      handleInteraction();
    }
  }, [keys.interact, activePortal, navigate, saveHubState, setIsTransitioning, isTransitioning]);

  // Handle Escape key for menu - only toggle on rising edge
  const prevEscapeRef = useRef(false);
  useEffect(() => {
    if (keys.escape && !prevEscapeRef.current) {
      setMenuOpen(!menuOpen);
    }
    prevEscapeRef.current = keys.escape;
  }, [keys.escape, menuOpen, setMenuOpen]);

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
            <div className="text-muted-foreground text-xs">
              Press <span className="text-foreground border border-border px-2 py-1 mx-1">Enter</span> to open
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls hint */}
      <div className="museum-ui bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Move</span>
          <div className="flex gap-1">
            <span className="border border-border px-2 py-1">↑</span>
          </div>
          <div className="flex gap-1">
            <span className="border border-border px-2 py-1">←</span>
            <span className="border border-border px-2 py-1">↓</span>
            <span className="border border-border px-2 py-1">→</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Menu</span>
          <span className="border border-border px-2 py-1">ESC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Enter</span>
          <span className="border border-border px-2 py-1">↵</span>
        </div>
      </div>

      {/* Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.nav
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <ul className="space-y-6">
                {['Story', 'Media', 'Projects', 'Network', 'Blueprints'].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        saveHubState();
                        navigate(`/${item.toLowerCase()}`);
                      }}
                      className="text-2xl tracking-widest uppercase hover:text-muted-foreground transition-colors"
                    >
                      {item}
                    </button>
                  </motion.li>
                ))}
              </ul>
              <button
                onClick={() => setMenuOpen(false)}
                className="mt-12 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Press ESC to close
              </button>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
