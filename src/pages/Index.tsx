import { useEffect, useState } from 'react';
import { MuseumScene } from '@/components/museum/MuseumScene';
import { MuseumUI } from '@/components/ui/MuseumUI';
import { MobileJoystick } from '@/components/ui/MobileJoystick';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useGameStore } from '@/store/gameStore';
import { AnimatePresence } from 'framer-motion';

const Index = () => {
  const { setIsTransitioning } = useGameStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    // Clear transition state on mount
    setIsTransitioning(false);
    
    // Mark as loaded after a delay to ensure scene renders
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [setIsTransitioning]);

  const handleStart = () => {
    setShowScene(true);
  };

  return (
    <div className="fixed inset-0 bg-background">
      {/* Always render the scene in background to preload */}
      <div className={showScene ? 'opacity-100' : 'opacity-0'} style={{ position: 'absolute', inset: 0 }}>
        <MuseumScene />
        <MuseumUI />
        <MobileJoystick />
      </div>
      
      {/* Loading screen overlay */}
      <AnimatePresence>
        {!showScene && (
          <LoadingScreen isLoaded={isLoaded} onStart={handleStart} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
