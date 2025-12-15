interface HallwayDoorwayProps {
  position: [number, number, number];
}

export function HallwayDoorway({ position }: HallwayDoorwayProps) {
  const doorWidth = 4;
  const doorHeight = 6;
  const frameDepth = 0.3;
  
  return (
    <group position={position}>
      {/* Doorway arch frame - gold accent */}
      {/* Left pillar */}
      <mesh position={[-doorWidth / 2 - 0.15, doorHeight / 2, 0]}>
        <boxGeometry args={[0.3, doorHeight, frameDepth]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Right pillar */}
      <mesh position={[doorWidth / 2 + 0.15, doorHeight / 2, 0]}>
        <boxGeometry args={[0.3, doorHeight, frameDepth]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Top arch */}
      <mesh position={[0, doorHeight + 0.15, 0]}>
        <boxGeometry args={[doorWidth + 0.6, 0.3, frameDepth]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Inner frame accent - darker */}
      {/* Left inner */}
      <mesh position={[-doorWidth / 2 + 0.05, doorHeight / 2, 0.05]}>
        <boxGeometry args={[0.1, doorHeight, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Right inner */}
      <mesh position={[doorWidth / 2 - 0.05, doorHeight / 2, 0.05]}>
        <boxGeometry args={[0.1, doorHeight, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Warm light inside doorway */}
      <pointLight 
        position={[0, 3, 2]} 
        intensity={0.8} 
        color="#ffd699" 
        distance={12} 
      />
    </group>
  );
}