import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { Character } from './Character';
import { MuseumCamera } from './MuseumCamera';
import { MuseumEnvironment } from './MuseumEnvironment';
import { MuseumLighting } from './MuseumLighting';

// Simple loading fallback - just some ambient light and floor
function LoadingFallback() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <ambientLight intensity={0.3} />
    </group>
  );
}

// Progress tracker component that reports loading state
function ProgressTracker({ onProgress }: { onProgress: (progress: number) => void }) {
  const { progress } = useProgress();
  
  useEffect(() => {
    onProgress(progress);
  }, [progress, onProgress]);
  
  return null;
}

interface MuseumSceneProps {
  onProgress?: (progress: number) => void;
}

export function MuseumScene({ onProgress }: MuseumSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      camera={{ fov: 60, near: 0.1, far: 100, position: [0, 2, 5] }}
      style={{ background: '#000000' }}
    >
      {onProgress && <ProgressTracker onProgress={onProgress} />}
      <fog attach="fog" args={['#000000', 15, 45]} />
      <MuseumLighting />
      <Suspense fallback={<LoadingFallback />}>
        <MuseumEnvironment />
      </Suspense>
      <Character />
      <MuseumCamera />
    </Canvas>
  );
}
