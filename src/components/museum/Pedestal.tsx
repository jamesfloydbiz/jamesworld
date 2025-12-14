import { Text } from '@react-three/drei';

interface PedestalProps {
  position: [number, number, number];
  title: string;
}

export function Pedestal({ position, title }: PedestalProps) {
  return (
    <group position={position}>
      {/* Chrome base - wide and low */}
      <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.16, 32]} />
        <meshStandardMaterial 
          color="#c0c0c0" 
          metalness={0.95} 
          roughness={0.08} 
        />
      </mesh>
      
      {/* Chrome stem */}
      <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.7, 24]} />
        <meshStandardMaterial 
          color="#d4d4d4" 
          metalness={0.98} 
          roughness={0.05} 
        />
      </mesh>
      
      {/* White marble top */}
      <mesh position={[0, 0.95, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.75, 0.7, 0.2, 32]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          roughness={0.25} 
          metalness={0.02}
        />
      </mesh>
      
      {/* Marble edge detail */}
      <mesh position={[0, 1.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.78, 0.75, 0.04, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.2} 
          metalness={0.0}
        />
      </mesh>
      
      {/* Central exhibit object - elegant geometric */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <icosahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.15} 
          metalness={0.1}
          emissive="#ffffff"
          emissiveIntensity={0.03}
        />
      </mesh>
      
      {/* Rim light ring around exhibit */}
      <mesh position={[0, 1.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.52, 32]} />
        <meshBasicMaterial color="#ffffff" opacity={0.15} transparent />
      </mesh>
      
      {/* Museum plaque - elegant white */}
      <group position={[0, 0.45, 0.85]}>
        {/* Plaque background */}
        <mesh rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[0.6, 0.25, 0.02]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.3} 
            metalness={0.0}
          />
        </mesh>
        {/* Plaque text */}
        <Text
          position={[0, 0, 0.015]}
          rotation={[-0.15, 0, 0]}
          fontSize={0.045}
          color="#1a1a1a"
          font="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vXDXbtXK-F2qC0s.woff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          {title.toUpperCase()}
        </Text>
      </group>
      
      {/* Spotlight glow on pedestal top */}
      <pointLight 
        position={[0, 2.5, 0]} 
        intensity={0.8} 
        distance={4} 
        color="#ffffff"
        castShadow
      />
    </group>
  );
}
