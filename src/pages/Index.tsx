import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainMenu } from '@/components/ui/MainMenu';
import { useGameStore } from '@/store/gameStore';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy load heavy 3D components so they don't block the menu
const MuseumScene = lazy(() => import('@/components/museum/MuseumScene').then(m => ({ default: m.MuseumScene })));
const MuseumUI = lazy(() => import('@/components/ui/MuseumUI').then(m => ({ default: m.MuseumUI })));
const MobileJoystick = lazy(() => import('@/components/ui/MobileJoystick').then(m => ({ default: m.MobileJoystick })));

const Index = () => {
  const navigate = useNavigate();
  const { setIsTransitioning, menuOpen, setMenuOpen } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [shouldLoadGallery, setShouldLoadGallery] = useState(false);

  useEffect(() => {
    setIsTransitioning(false);
    // Delay gallery loading to ensure menu is interactive first
    const timer = setTimeout(() => {
      setShouldLoadGallery(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [setIsTransitioning]);

  // ESC key to toggle between menu and gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && progress >= 100) {
        setShowGallery(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [progress]);

  const handleProgress = useCallback((loadProgress: number) => {
    setProgress(loadProgress);
  }, []);

  const handleEnterGallery = () => {
    if (progress >= 100) {
      setShowGallery(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Main menu - always interactive */}
      <AnimatePresence>
        {!showGallery && (
          <MainMenu 
            onEnterGallery={handleEnterGallery}
            galleryLoading={progress < 100}
            galleryProgress={progress}
          />
        )}
      </AnimatePresence>

      {/* Lazy load gallery in background */}
      {shouldLoadGallery && (
        <motion.div 
          className={showGallery ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
          style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ 
            opacity: showGallery ? 1 : 0, 
            scale: showGallery ? 1 : 0.98 
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Suspense fallback={null}>
            <MuseumScene onProgress={handleProgress} />
            <MuseumUI />
            <MobileJoystick />
          </Suspense>
        </motion.div>
      )}

      {/* Mobile menu overlay when in gallery */}
      <AnimatePresence>
        {showGallery && menuOpen && (
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
            
            <button
              onClick={() => {
                setMenuOpen(false);
                setShowGallery(false);
              }}
              className="mt-8 text-white/50 hover:text-white text-lg tracking-widest uppercase transition-colors border border-white/30 px-6 py-2"
            >
              Exit Gallery
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
