interface HallwayDoorwayProps {
  position: [number, number, number];
}

export function HallwayDoorway({ position }: HallwayDoorwayProps) {
  const doorWidth = 2;
  const doorHeight = 3;
  const frameDepth = 0.2;
  const archSegments = 16;
  
  return (
    <group position={position}>
      {/* Hall of Memories label - simple 3D text using planes */}
      <mesh position={[0, doorHeight + 0.5, 0.02]}>
        <planeGeometry args={[2.5, 0.25]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.8} />
      </mesh>
      
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
        <meshStandardMaterial color="#0a0a0a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Inner frame accent - right */}
      <mesh position={[doorWidth / 2 - 0.03, doorHeight / 2, 0.03]}>
        <boxGeometry args={[0.06, doorHeight, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Warm light inside doorway */}
      <pointLight 
        position={[0, 1.5, 1]} 
        intensity={0.3} 
        color="#ffffff" 
        distance={8} 
      />
    </group>
  );
}
