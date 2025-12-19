import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { MainMenu } from '@/components/ui/MainMenu';
import { useGameStore } from '@/store/gameStore';
import { AnimatePresence } from 'framer-motion';

// Lazy load heavy 3D components so they don't block the menu
const MuseumScene = lazy(() => import('@/components/museum/MuseumScene').then(m => ({ default: m.MuseumScene })));
const MuseumUI = lazy(() => import('@/components/ui/MuseumUI').then(m => ({ default: m.MuseumUI })));
const MobileJoystick = lazy(() => import('@/components/ui/MobileJoystick').then(m => ({ default: m.MobileJoystick })));

const Index = () => {
  const { setIsTransitioning } = useGameStore();
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

  // ESC key to return to menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showGallery) {
        setShowGallery(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery]);

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
        <div 
          className={showGallery ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
          style={{ position: 'absolute', inset: 0 }}
        >
          <Suspense fallback={null}>
            <MuseumScene onProgress={handleProgress} />
            <MuseumUI />
            <MobileJoystick />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default Index;
