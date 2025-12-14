import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

interface FloorCircleProps {
  position: [number, number, number];
  portalId: string;
}

export function FloorCircle({ position, portalId }: FloorCircleProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const { activePortal } = useGameStore();
  
  const isActive = activePortal?.id === portalId;

  useFrame((state) => {
    if (ringRef.current) {
      if (isActive) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        ringRef.current.scale.setScalar(scale);
      } else {
        ringRef.current.scale.setScalar(1);
      }
    }
    if (outerRingRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
      outerRingRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      {/* Base circle - dashed look */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.08, 64]} />
        <meshBasicMaterial 
          color="#ffffff" 
          opacity={isActive ? 0.8 : 0.35} 
          transparent 
        />
      </mesh>
      
      {/* Inner subtle fill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <circleGeometry args={[1.0, 64]} />
        <meshBasicMaterial 
          color="#ffffff" 
          opacity={isActive ? 0.08 : 0.03} 
          transparent 
        />
      </mesh>
      
      {/* Animated ring when active */}
      {isActive && (
        <>
          <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[1.15, 1.2, 64]} />
            <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
          </mesh>
          <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
            <ringGeometry args={[1.3, 1.35, 64]} />
            <meshBasicMaterial color="#ffffff" opacity={0.25} transparent />
          </mesh>
        </>
      )}
    </group>
  );
}
