import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DustParticlesProps {
  count?: number;
  bounds?: [number, number, number];
  position?: [number, number, number];
}

export function DustParticles({ 
  count = 200, 
  bounds = [18, 8, 50],
  position = [0, 4, -15]
}: DustParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * bounds[0];
      positions[i * 3 + 1] = Math.random() * bounds[1];
      positions[i * 3 + 2] = (Math.random() - 0.5) * bounds[2];
      speeds[i] = 0.1 + Math.random() * 0.2;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, speeds, offsets };
  }, [count, bounds]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Gentle floating motion
      positions[i3 + 1] += Math.sin(time * particles.speeds[i] + particles.offsets[i]) * 0.001;
      // Very slow drift
      positions[i3] += Math.sin(time * 0.1 + particles.offsets[i]) * 0.0005;
      
      // Reset if out of bounds
      if (positions[i3 + 1] > bounds[1]) {
        positions[i3 + 1] = 0;
      }
      if (positions[i3 + 1] < 0) {
        positions[i3 + 1] = bounds[1];
      }
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
