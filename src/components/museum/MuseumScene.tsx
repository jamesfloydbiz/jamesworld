import { Canvas } from '@react-three/fiber';
import { Character } from './Character';
import { MuseumCamera } from './MuseumCamera';
import { MuseumEnvironment } from './MuseumEnvironment';
import { MuseumLighting } from './MuseumLighting';

export function MuseumScene() {
  return (
    <Canvas
      shadows
      camera={{ fov: 60, near: 0.1, far: 100, position: [0, 2, 5] }}
      style={{ background: '#000000' }}
    >
      <fog attach="fog" args={['#000000', 15, 45]} />
      <MuseumLighting />
      <MuseumEnvironment />
      <Character />
      <MuseumCamera />
    </Canvas>
  );
}
