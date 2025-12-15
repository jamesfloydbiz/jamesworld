import { useEffect, useState, useCallback, useRef } from 'react';
import { MuseumScene } from '@/components/museum/MuseumScene';
import { MuseumUI } from '@/components/ui/MuseumUI';
import { MobileJoystick } from '@/components/ui/MobileJoystick';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useGameStore } from '@/store/gameStore';
import { AnimatePresence } from 'framer-motion';

const MIN_LOADING_TIME = 1000; // Minimum time to show loading screen

const Index = () => {
  const { setIsTransitioning } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [showScene, setShowScene] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Clear transition state on mount
    setIsTransitioning(false);
    
    // Ensure minimum loading time for smooth UX
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, MIN_LOADING_TIME);
    
    return () => clearTimeout(timer);
  }, [setIsTransitioning]);

  const handleProgress = useCallback((loadProgress: number) => {
    setProgress(loadProgress);
  }, []);

  const handleStart = () => {
    setShowScene(true);
  };

  // Loading is complete when assets are loaded AND minimum time has passed
  const isFullyLoaded = progress >= 100 && minTimeElapsed;

  return (
    <div className="fixed inset-0 bg-background">
      {/* Always render the scene in background to preload */}
      <div className={showScene ? 'opacity-100' : 'opacity-0'} style={{ position: 'absolute', inset: 0 }}>
        <MuseumScene onProgress={handleProgress} />
        <MuseumUI />
        <MobileJoystick />
      </div>
      
      {/* Loading screen overlay */}
      <AnimatePresence>
        {!showScene && (
          <LoadingScreen progress={progress} isFullyLoaded={isFullyLoaded} onStart={handleStart} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
