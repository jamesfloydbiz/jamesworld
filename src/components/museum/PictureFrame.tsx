import { useTexture } from '@react-three/drei';
import { useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';

interface PictureFrameProps {
  position: [number, number, number];
  width: number;
  height: number;
  imageSrc?: string;
  rotation?: [number, number, number];
}

// Component that loads and displays the image texture
function ImagePlane({ width, height, imageSrc }: { width: number; height: number; imageSrc: string }) {
  const texture = useTexture(imageSrc);
  
  // Calculate aspect ratio to preserve natural proportions
  const img = texture.image as HTMLImageElement | undefined;
  const imageAspect = img?.width && img?.height ? img.width / img.height : 1;
  const frameAspect = width / height;
  
  let displayWidth = width;
  let displayHeight = height;
  
  if (imageAspect > frameAspect) {
    // Image is wider - fit to width
    displayHeight = width / imageAspect;
  } else {
    // Image is taller - fit to height
    displayWidth = height * imageAspect;
  }
  
  return (
    <mesh position={[0, 0, 0.006]}>
      <planeGeometry args={[displayWidth * 0.95, displayHeight * 0.95]} />
      <meshStandardMaterial map={texture} roughness={0.8} />
    </mesh>
  );
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

// Wrapper that handles loading state
function ImageWithFallback({ width, height, imageSrc }: { width: number; height: number; imageSrc?: string }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onerror = () => setHasError(true);
      img.src = imageSrc;
    }
  }, [imageSrc]);
  
  if (!imageSrc || hasError) {
    return <PlaceholderPlane width={width} height={height} />;
  }
  
  return (
    <Suspense fallback={<PlaceholderPlane width={width} height={height} />}>
      <ImagePlane width={width} height={height} imageSrc={imageSrc} />
    </Suspense>
  );
}

export function PictureFrame({ position, width, height, imageSrc, rotation = [0, 0, 0] }: PictureFrameProps) {
  const frameDepth = 0.05;
  const frameWidth = 0.08;
  
  // White frame color for hall of memories
  const frameColor = '#ffffff';
  
  return (
    <group position={position} rotation={rotation}>
      {/* Frame - 4 sides */}
      {/* Top */}
      <mesh position={[0, height / 2 + frameWidth / 2, 0]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2 - frameWidth / 2, 0]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Left */}
      <mesh position={[-width / 2 - frameWidth / 2, 0, 0]}>
        <boxGeometry args={[frameWidth, height, frameDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 + frameWidth / 2, 0, 0]}>
        <boxGeometry args={[frameWidth, height, frameDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.3} />
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
      
      {/* Image with lazy loading */}
      <ImageWithFallback width={width} height={height} imageSrc={imageSrc} />
    </group>
  );
}