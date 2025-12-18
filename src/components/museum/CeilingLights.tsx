import { useMemo } from 'react';

export function CeilingLights() {
  const isMobile = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  // Reduce lights on mobile: from 24 to 6
  const lights = useMemo(() => {
    const positions: [number, number, number][] = [];
    const spacing = isMobile ? 8 : 4;
    const zSpacing = isMobile ? 12 : 6;
    
    for (let x = -6; x <= 6; x += spacing) {
      for (let z = -30; z <= 0; z += zSpacing) {
        positions.push([x, 7.9, z]);
      }
    }
    return positions;
  }, [isMobile]);

  return (
    <group>
      {/* Main ceiling - black */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, -15]}>
        <planeGeometry args={[22, 50]} />
        <meshStandardMaterial color="#030303" roughness={1} />
      </mesh>
      
      {/* White square light panels */}
      {lights.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Light panel */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Actual light source - lower intensity on mobile */}
          <pointLight 
            position={[0, -0.5, 0]} 
            intensity={isMobile ? 1.2 : 0.8} 
            color="#ffffff" 
            distance={isMobile ? 18 : 12}
            decay={2}
          />
        </group>
      ))}
      
      {/* Ceiling frame/edge trim */}
      <mesh position={[-10.9, 7.8, -15]}>
        <boxGeometry args={[0.2, 0.4, 50]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>
      <mesh position={[10.9, 7.8, -15]}>
        <boxGeometry args={[0.2, 0.4, 50]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>
    </group>
  );
}
