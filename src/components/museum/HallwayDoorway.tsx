import * as THREE from 'three';
import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

interface HallwayDoorwayProps {
  position: [number, number, number];
}

// Caution tape stripe texture
function CautionTape({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[1] - start[1], 2) + 
    Math.pow(end[2] - start[2], 2)
  );
  
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  
  return (
    <mesh position={[midX, midY, midZ]} rotation={[0, 0, angle]}>
      <boxGeometry args={[length, 0.15, 0.02]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
    </mesh>
  );
}

function FloatingText() {
  const textRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = 2.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });
  
  return (
    <Text
      ref={textRef}
      position={[0, 2.2, 0.3]}
      fontSize={0.25}
      color="#FFD700"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.05}
    >
      UNDER CONSTRUCTION
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFD700" 
        emissiveIntensity={0.5} 
      />
    </Text>
  );
}

export function HallwayDoorway({ position }: HallwayDoorwayProps) {
  const doorWidth = 2;
  const doorHeight = 3;
  const frameDepth = 0.2;
  const archSegments = 16;
  
  // Create arch shape
  const archShape = useMemo(() => {
    const shape = new THREE.Shape();
    const halfWidth = doorWidth / 2;
    const archRadius = halfWidth;
    
    // Start from bottom left, go up, arch over, and down
    shape.moveTo(-halfWidth, 0);
    shape.lineTo(-halfWidth, doorHeight - archRadius);
    shape.absarc(0, doorHeight - archRadius, archRadius, Math.PI, 0, false);
    shape.lineTo(halfWidth, 0);
    
    return shape;
  }, []);
  
  return (
    <group position={position}>
      {/* Left pillar */}
      <mesh position={[-doorWidth / 2 - 0.1, doorHeight / 2, 0]}>
        <boxGeometry args={[0.2, doorHeight, frameDepth]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Right pillar */}
      <mesh position={[doorWidth / 2 + 0.1, doorHeight / 2, 0]}>
        <boxGeometry args={[0.2, doorHeight, frameDepth]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Arch top */}
      <mesh position={[0, doorHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[doorWidth / 2, 0.1, 8, archSegments, Math.PI]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Inner frame accent - left */}
      <mesh position={[-doorWidth / 2 + 0.03, doorHeight / 2, 0.03]}>
        <boxGeometry args={[0.06, doorHeight, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Inner frame accent - right */}
      <mesh position={[doorWidth / 2 - 0.03, doorHeight / 2, 0.03]}>
        <boxGeometry args={[0.06, doorHeight, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Caution tape - X pattern */}
      <CautionTape start={[-0.9, 0.5, 0.05]} end={[0.9, 2.5, 0.05]} />
      <CautionTape start={[-0.9, 2.5, 0.05]} end={[0.9, 0.5, 0.05]} />
      
      {/* Floating under construction text */}
      <FloatingText />
      
      {/* Warm light inside doorway */}
      <pointLight 
        position={[0, 1.5, 1]} 
        intensity={0.5} 
        color="#ffd699" 
        distance={8} 
      />
    </group>
  );
}
