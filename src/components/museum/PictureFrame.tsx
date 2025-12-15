import * as THREE from 'three';

interface PictureFrameProps {
  position: [number, number, number];
  width: number;
  height: number;
  imageSrc?: string;
  rotation?: [number, number, number];
}

export function PictureFrame({ position, width, height, imageSrc, rotation = [0, 0, 0] }: PictureFrameProps) {
  const frameDepth = 0.05;
  const frameWidth = 0.08;
  
  // White frame color
  const frameColor = '#f5f5f5';
  
  return (
    <group position={position} rotation={rotation}>
      {/* Frame - 4 sides */}
      {/* Top */}
      <mesh position={[0, height / 2 + frameWidth / 2, 0]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.1} roughness={0.5} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2 - frameWidth / 2, 0]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.1} roughness={0.5} />
      </mesh>
      {/* Left */}
      <mesh position={[-width / 2 - frameWidth / 2, 0, 0]}>
        <boxGeometry args={[frameWidth, height, frameDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.1} roughness={0.5} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 + frameWidth / 2, 0, 0]}>
        <boxGeometry args={[frameWidth, height, frameDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.1} roughness={0.5} />
      </mesh>
      
      {/* Inner frame accent */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width + 0.02, height + 0.02, 0.02]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Canvas/Image placeholder */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          color={imageSrc ? '#ffffff' : '#4a4a4a'} 
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}
