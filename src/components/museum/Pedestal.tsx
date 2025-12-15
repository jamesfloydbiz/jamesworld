import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface PedestalProps {
  position: [number, number, number];
  title: string;
}

// Model configurations for each section
const modelConfigs: Record<string, { path: string; scale: number[]; yOffset: number; floating?: boolean; rotationY?: number }> = {
  'Story': { path: '/models/tree_gn.glb', scale: [0.4, 0.4, 0.4], yOffset: 0.5 },
  'Projects': { path: '/models/model_of_the_watt_steam_engine_with_animation.glb', scale: [1.2, 1.2, 1.2], yOffset: 0.3 },
  'Media': { path: '/models/movie_clipper.glb', scale: [0.2, 0.2, 0.2], yOffset: 2.0, floating: true, rotationY: Math.PI / 2 },
  'Blueprints': { path: '/models/the_thinker_by_auguste_rodin.glb', scale: [1.125, 1.125, 1.125], yOffset: 0.5, rotationY: -2 * Math.PI / 3 },
  'Network': { path: '/models/knowledge_network.glb', scale: [1.125, 1.125, 1.125], yOffset: 0.8 },
};

function ModelExhibit({ title }: { title: string }) {
  const config = modelConfigs[title];
  const groupRef = useRef<THREE.Group>(null);
  
  if (!config) {
    // Default orb for unknown sections
    return (
      <mesh position={[0, 1.0, 0]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
      </mesh>
    );
  }

  // Use try-catch pattern for model loading
  let scene: THREE.Group | null = null;
  try {
    const result = useGLTF(config.path);
    scene = result.scene;
  } catch (e) {
    // Model failed to load, show fallback
    return (
      <mesh position={[0, 1.0, 0]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
      </mesh>
    );
  }

  // Floating animation for Media
  useFrame((state) => {
    if (config.floating && groupRef.current) {
      groupRef.current.position.y = config.yOffset + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, config.yOffset, 0]} rotation={[0, config.rotationY || 0, 0]}>
      <primitive 
        object={scene.clone()} 
        scale={config.scale}
      />
    </group>
  );
}

export function Pedestal({ position, title }: PedestalProps) {
  return (
    <group position={position}>
      {/* Base platform - wide and short */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.5, 0.3, 2.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      
      {/* Elevated platform */}
      <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#222222" roughness={0.85} />
      </mesh>
      
      {/* Central exhibit object */}
      <ModelExhibit title={title} />
      
      {/* Title plaque */}
      <mesh position={[0, 0.35, 1.1]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}

// Preload all models
useGLTF.preload('/models/tree_gn.glb');
useGLTF.preload('/models/model_of_the_watt_steam_engine_with_animation.glb');
useGLTF.preload('/models/movie_clipper.glb');
useGLTF.preload('/models/the_thinker_by_auguste_rodin.glb');
useGLTF.preload('/models/knowledge_network.glb');
