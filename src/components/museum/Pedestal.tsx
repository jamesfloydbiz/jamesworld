interface PedestalProps {
  position: [number, number, number];
  title: string;
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
      
      {/* Central exhibit object - abstract shape */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.3} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Title plaque */}
      <mesh position={[0, 0.35, 1.1]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}
