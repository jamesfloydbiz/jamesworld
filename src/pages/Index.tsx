import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Lazy load heavy 3D components
const MuseumScene = lazy(() => import('@/components/museum/MuseumScene').then(m => ({ default: m.MuseumScene })));
const MuseumUI = lazy(() => import('@/components/ui/MuseumUI').then(m => ({ default: m.MuseumUI })));
const MobileJoystick = lazy(() => import('@/components/ui/MobileJoystick').then(m => ({ default: m.MobileJoystick })));

const Index = () => {
  const navigate = useNavigate();
  const { setIsTransitioning, menuOpen, setMenuOpen } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black">
      {/* 3D Museum Scene - always loading/visible behind the loading screen */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <MuseumScene onProgress={handleProgress} showLabels={!showLoading} />
          {!showLoading && (
            <>
              <MuseumUI />
              <MobileJoystick />
            </>
          )}
        </Suspense>
      </div>

      {/* Loading screen overlay */}
      <AnimatePresence>
        {showLoading && (
          <LoadingScreen 
            progress={progress} 
            isFullyLoaded={isFullyLoaded}
            onStart={handleStart}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu overlay when in gallery */}
      <AnimatePresence>
        {!showLoading && menuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center gap-6"
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
