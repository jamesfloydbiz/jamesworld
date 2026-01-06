import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface FloorCircleProps {
  position: [number, number, number];
  portalId: string;
  title: string;
  showTitle?: boolean;
}

export function FloorCircle({ position, portalId, title, showTitle = true }: FloorCircleProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const thirdRingRef = useRef<THREE.Mesh>(null);
  const { activePortal } = useGameStore();
  
  const isActive = activePortal?.id === portalId;

  useFrame((state) => {
    if (ringRef.current) {
      if (isActive) {
        // Slower, more deliberate pulse
        const scale = 1 + Math.sin(state.clock.elapsedTime * 1) * 0.04;
        ringRef.current.scale.setScalar(scale);
      } else {
        ringRef.current.scale.setScalar(1);
      }
    }
    if (outerRingRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.06;
      outerRingRef.current.scale.setScalar(scale);
    }
    if (thirdRingRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.2 + 0.5) * 0.05;
      thirdRingRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      {/* Floating title above circle - only render when showTitle is true */}
      {showTitle && (
        <Html
          position={[0, 0.3, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div 
            className="text-[10px] uppercase tracking-[0.2em] text-white/30 whitespace-nowrap animate-fade-in"
            style={{ fontFamily: 'inherit' }}
          >
            {title}
          </div>
        </Html>
      )}
      
      {/* Base circle - thin elegant ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.06, 64]} />
        <meshBasicMaterial 
          color="#ffffff" 
          opacity={isActive ? 0.7 : 0.3} 
          transparent 
        />
      </mesh>
      
      {/* Inner subtle fill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <circleGeometry args={[1.0, 64]} />
        <meshBasicMaterial 
          color="#ffffff" 
          opacity={isActive ? 0.06 : 0.02} 
          transparent 
        />
      </mesh>
      
      {/* Second ring - always visible, thinner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[1.12, 1.15, 64]} />
        <meshBasicMaterial 
          color="#ffffff" 
          opacity={isActive ? 0.4 : 0.15} 
          transparent 
        />
      </mesh>
      
      {/* Animated rings when active */}
      {isActive && (
        <>
          <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[1.22, 1.26, 64]} />
            <meshBasicMaterial color="#ffffff" opacity={0.35} transparent />
          </mesh>
          <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
            <ringGeometry args={[1.35, 1.38, 64]} />
            <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
          </mesh>
          <mesh ref={thirdRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]}>
            <ringGeometry args={[1.48, 1.5, 64]} />
            <meshBasicMaterial color="#ffffff" opacity={0.12} transparent />
          </mesh>
        </>
      )}
    </group>
  );
}