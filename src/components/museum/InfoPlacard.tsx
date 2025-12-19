import { Text } from '@react-three/drei';

interface InfoPlacardProps {
  position: [number, number, number];
  title: string;
}

export function InfoPlacard({ position, title }: InfoPlacardProps) {
  return (
    <group position={position}>
      {/* Black circular base */}
      <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.25, 0.28, 0.04, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Black pole */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.4, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Angled sign holder - tilted back */}
      <group position={[0, 1.45, 0.05]} rotation={[-0.3, 0, 0]}>
        {/* Sign backing plate */}
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.4, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.5} />
        </mesh>
        
        {/* Black frame around sign */}
        {/* Top edge */}
        <mesh position={[0, 0.2, 0.01]}>
          <boxGeometry args={[0.64, 0.02, 0.03]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Bottom edge */}
        <mesh position={[0, -0.2, 0.01]}>
          <boxGeometry args={[0.64, 0.02, 0.03]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Left edge */}
        <mesh position={[-0.31, 0, 0.01]}>
          <boxGeometry args={[0.02, 0.44, 0.03]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Right edge */}
        <mesh position={[0.31, 0, 0.01]}>
          <boxGeometry args={[0.02, 0.44, 0.03]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Title text - refined typography */}
        <Text
          position={[0, 0, 0.025]}
          fontSize={0.11}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          {title.toUpperCase()}
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={0.25} 
          />
        </Text>
      </group>
    </group>
  );
}