import { useRef } from 'react';
import * as THREE from 'three';

interface FloorGlowProps {
  position?: [number, number, number];
  width?: number;
  length?: number;
}

export function FloorGlow({ 
  position = [0, 0.01, -15], 
  width = 18, 
  length = 50 
}: FloorGlowProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh 
      ref={meshRef}
      position={position} 
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[width, length]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.02}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
