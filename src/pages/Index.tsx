import { useEffect } from 'react';
import { MuseumScene } from '@/components/museum/MuseumScene';
import { MuseumUI } from '@/components/ui/MuseumUI';
import { MobileJoystick } from '@/components/ui/MobileJoystick';
import { useGameStore } from '@/store/gameStore';

const Index = () => {
  const { setIsTransitioning } = useGameStore();

  useEffect(() => {
    // Clear transition state on mount
    setIsTransitioning(false);
  }, [setIsTransitioning]);

  return (
    <div className="fixed inset-0 bg-background">
      <MuseumScene />
      <MuseumUI />
      <MobileJoystick />
    </div>
  );
};

export default Index;
