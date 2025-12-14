import { useEffect } from 'react';
import { MuseumScene } from '@/components/museum/MuseumScene';
import { MuseumUI } from '@/components/ui/MuseumUI';
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
    </div>
  );
};

export default Index;
