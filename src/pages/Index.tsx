import { useEffect, useState, useCallback } from 'react';
import { MuseumScene } from '@/components/museum/MuseumScene';
import { MuseumUI } from '@/components/ui/MuseumUI';
import { MobileJoystick } from '@/components/ui/MobileJoystick';
import { MainMenu } from '@/components/ui/MainMenu';
import { useGameStore } from '@/store/gameStore';
import { AnimatePresence } from 'framer-motion';

const Index = () => {
  const { setIsTransitioning } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [preloadStarted, setPreloadStarted] = useState(false);

  useEffect(() => {
    setIsTransitioning(false);
    // Start preloading the gallery after a short delay
    const timer = setTimeout(() => {
      setPreloadStarted(true);
    }, 500);
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
      {/* Preload gallery in background (hidden) */}
      {preloadStarted && (
        <div 
          className={showGallery ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
          style={{ position: 'absolute', inset: 0 }}
        >
          <MuseumScene onProgress={handleProgress} />
          <MuseumUI />
          <MobileJoystick />
        </div>
      )}
      
      {/* Main menu */}
      <AnimatePresence>
        {!showGallery && (
          <MainMenu 
            onEnterGallery={handleEnterGallery}
            galleryLoading={progress < 100}
            galleryProgress={progress}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
