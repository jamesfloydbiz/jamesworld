import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ControlsHint } from '@/components/ui/MuseumUI';
import { MobileJoystick } from '@/components/ui/MobileJoystick';

// Lazy load heavy 3D components
const MuseumScene = lazy(() => import('@/components/museum/MuseumScene').then(m => ({ default: m.MuseumScene })));
const MuseumUI = lazy(() => import('@/components/ui/MuseumUI').then(m => ({ default: m.MuseumUI })));

const Index = () => {
  const navigate = useNavigate();
  const { setIsTransitioning, menuOpen, setMenuOpen } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [showTitles, setShowTitles] = useState(false);

  useEffect(() => {
    setIsTransitioning(false);
  }, [setIsTransitioning]);

  // Track when fully loaded
  useEffect(() => {
    if (progress >= 100 && !isFullyLoaded) {
      setIsFullyLoaded(true);
    }
  }, [progress, isFullyLoaded]);

  // ESC key to toggle menu when in gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showLoading) {
        setMenuOpen(!menuOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLoading, menuOpen, setMenuOpen]);

  const handleProgress = useCallback((loadProgress: number) => {
    setProgress(loadProgress);
  }, []);

  const handleStart = () => {
    setShowLoading(false);
  };

  const handleShrinkStart = useCallback(() => {
    setShowTitles(true);
  }, []);

  // Unified flag: controls only appear when fully interactive
  const controlsReady = showTitles && !showLoading;

  return (
    <div className="fixed inset-0 bg-black">
      {/* 3D Museum Scene - always loading/visible behind the loading screen */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <MuseumScene onProgress={handleProgress} showLabels={showTitles} />
          {!showLoading && <MuseumUI />}
        </Suspense>
      </div>

      {/* Mobile controls - visible early, interactive once loading done */}
      <MobileJoystick visible={showTitles} interactive={!showLoading} />

      {/* Loading screen - rendered after mobile controls in DOM but visually on top initially */}
      <LoadingScreen
        progress={progress} 
        isFullyLoaded={isFullyLoaded}
        onStart={handleStart}
        onShrinkStart={handleShrinkStart}
      />

      {/* Controls hint - appears when logo starts shrinking */}
      {showTitles && <ControlsHint />}

      {/* Mobile menu overlay when in gallery - z-[300] to be above mobile controls */}
      <AnimatePresence>
        {!showLoading && menuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white text-xl"
            >
              ✕
            </button>
            
            {[
              { label: 'Story', path: '/story' },
              { label: 'Projects', path: '/projects' },
              { label: 'Media', path: '/media' },
              { label: 'Network', path: '/network' },
              { label: 'Blueprints', path: '/blueprints' },
              { label: 'Resume', path: '/resume' },
              { label: 'Poems', path: '/poems' },
              { label: 'Memories', path: '/pictures' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setMenuOpen(false);
                  navigate(item.path);
                }}
                className="text-white/80 hover:text-white text-2xl tracking-widest uppercase transition-colors"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;