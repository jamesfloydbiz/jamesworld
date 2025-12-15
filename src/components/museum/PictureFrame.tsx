import * as THREE from 'three';

interface PictureFrameProps {
  position: [number, number, number];
  width: number;
  height: number;
  imageSrc?: string;
}

export function PictureFrame({ position, width, height, imageSrc }: PictureFrameProps) {
  const frameDepth = 0.08;
  const frameWidth = 0.12;
  
  // Gold frame color
  const goldColor = '#d4af37';
  
  return (
    <group position={position}>
      {/* Frame - 4 sides */}
      {/* Top */}
      <mesh position={[0, height / 2 + frameWidth / 2, 0]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth]} />
        <meshStandardMaterial color={goldColor} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2 - frameWidth / 2, 0]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth]} />
        <meshStandardMaterial color={goldColor} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Left */}
      <mesh position={[-width / 2 - frameWidth / 2, 0, 0]}>
        <boxGeometry args={[frameWidth, height, frameDepth]} />
        <meshStandardMaterial color={goldColor} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 + frameWidth / 2, 0, 0]}>
        <boxGeometry args={[frameWidth, height, frameDepth]} />
        <meshStandardMaterial color={goldColor} metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Inner frame accent */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width + 0.02, height + 0.02, 0.02]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Canvas/Image placeholder */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          color={imageSrc ? '#ffffff' : '#3a3a3a'} 
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}