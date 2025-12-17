import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface PictureFrameProps {
  position: [number, number, number];
  width: number;
  height: number;
  imageSrc?: string;
  rotation?: [number, number, number];
}

// Placeholder shown while loading or on error
function PlaceholderPlane({ width, height }: { width: number; height: number }) {
  return (
    <mesh position={[0, 0, 0.005]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
    </mesh>
  );
}

// Component that loads texture manually with error handling
function ImagePlane({ width, height, imageSrc }: { width: number; height: number; imageSrc: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState(false);
  const [dimensions, setDimensions] = useState({ displayWidth: width, displayHeight: height });

  useEffect(() => {
    if (!imageSrc) return;

    const loader = new THREE.TextureLoader();
    
    loader.load(
      imageSrc,
      (loadedTexture) => {
        // Calculate aspect ratio
        const img = loadedTexture.image as HTMLImageElement;
        if (img.width && img.height) {
          const imageAspect = img.width / img.height;
          const frameAspect = width / height;
          
          let displayWidth = width;
          let displayHeight = height;
          
          if (imageAspect > frameAspect) {
            displayHeight = width / imageAspect;
          } else {
            displayWidth = height * imageAspect;
          }
          
          setDimensions({ displayWidth, displayHeight });
        }
        setTexture(loadedTexture);
        setError(false);
      },
      undefined,
      () => {
        console.warn(`Failed to load texture: ${imageSrc}`);
        setError(true);
      }
    );

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [imageSrc, width, height]);

  if (error || !texture) {
    return <PlaceholderPlane width={width} height={height} />;
  }

  return (
    <mesh position={[0, 0, 0.006]}>
      <planeGeometry args={[dimensions.displayWidth * 0.95, dimensions.displayHeight * 0.95]} />
      <meshStandardMaterial map={texture} roughness={0.8} />
    </mesh>
  );
}

export function PictureFrame({ position, width, height, imageSrc, rotation = [0, 0, 0] }: PictureFrameProps) {
  const frameDepth = 0.05;
  const frameWidth = 0.08;
  
  // White frame color for hall of memories
  const frameColor = '#ffffff';
  
  // Memoize materials for performance
  const frameMaterial = useMemo(() => (
    <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.3} />
  ), []);
  
  return (
    <group position={position} rotation={rotation}>
      {/* Frame - 4 sides */}
      {/* Top */}
      <mesh position={[0, height / 2 + frameWidth / 2, 0]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth]} />
        {frameMaterial}
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2 - frameWidth / 2, 0]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth]} />
        {frameMaterial}
      </mesh>
      {/* Left */}
      <mesh position={[-width / 2 - frameWidth / 2, 0, 0]}>
        <boxGeometry args={[frameWidth, height, frameDepth]} />
        {frameMaterial}
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 + frameWidth / 2, 0, 0]}>
        <boxGeometry args={[frameWidth, height, frameDepth]} />
        {frameMaterial}
      </mesh>
      
      {/* Inner frame accent */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width + 0.02, height + 0.02, 0.02]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Canvas background */}
      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Image with manual loading */}
      {imageSrc && <ImagePlane width={width} height={height} imageSrc={imageSrc} />}
    </group>
  );
}