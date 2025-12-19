import { useMemo } from 'react';

// Calculate Y position on the curved roof given X position
function getCurvedRoofY(x: number): number {
  const halfWidth = 9;
  const wallHeight = 8;
  const curveStartHeight = wallHeight * 0.5;
  const curveRadius = 4;
  const peakWidth = halfWidth / 3.5;
  const peakHeight = curveStartHeight + curveRadius;
  
  const absX = Math.abs(x);
  
  if (absX <= peakWidth) {
    return peakHeight - 0.2;
  } else {
    const t = (absX - peakWidth) / (halfWidth - peakWidth);
    const y = peakHeight - (peakHeight - curveStartHeight) * Math.sin(t * Math.PI / 2);
    return y - 0.2;
  }
}

// Geometric skylight component - creates a diamond/cross frame pattern
function Skylight({ position, size = 2.5 }: { position: [number, number, number]; size?: number }) {
  const frameThickness = 0.08;
  const frameDepth = 0.15;
  
  return (
    <group position={position}>
      {/* Outer square frame */}
      {/* Top */}
      <mesh position={[0, 0, size / 2]}>
        <boxGeometry args={[size, frameDepth, frameThickness]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0, -size / 2]}>
        <boxGeometry args={[size, frameDepth, frameThickness]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {/* Left */}
      <mesh position={[-size / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, frameDepth, size]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {/* Right */}
      <mesh position={[size / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, frameDepth, size]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Inner cross/X pattern */}
      {/* Diagonal 1 */}
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[size * 1.35, frameDepth, frameThickness * 0.8]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>
      {/* Diagonal 2 */}
      <mesh rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[size * 1.35, frameDepth, frameThickness * 0.8]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>
      
      {/* Center vertical beam */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[frameThickness, 0.5, frameThickness]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      {/* Light source */}
      <pointLight 
        position={[0, -0.5, 0]} 
        intensity={0.6} 
        color="#ffffff" 
        distance={12}
        decay={2}
        castShadow
        shadow-mapSize={[256, 256]}
      />
    </group>
  );
}

export function CeilingLights() {
  const isMobile = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  // Position skylights along the center peak of the curved ceiling
  const skylightPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const zSpacing = isMobile ? 12 : 8;
    
    // Center row of skylights
    for (let z = -32; z <= 0; z += zSpacing) {
      const y = getCurvedRoofY(0);
      positions.push([0, y, z]);
    }
    
    return positions;
  }, [isMobile]);

  return (
    <group>
      {skylightPositions.map((pos, i) => (
        <Skylight key={i} position={pos} size={isMobile ? 2 : 2.5} />
      ))}
    </group>
  );
}
