import { useMemo } from 'react';

// Calculate Y position on the curved roof given X position
function getCurvedRoofY(x: number): number {
  const halfWidth = 9; // width/2 = 18/2
  const wallHeight = 8;
  const curveStartHeight = wallHeight * 0.5;
  const curveRadius = 4;
  const peakWidth = halfWidth / 3.5;
  const peakHeight = curveStartHeight + curveRadius;
  
  const absX = Math.abs(x);
  
  if (absX <= peakWidth) {
    // In the flat peak zone
    return peakHeight - 0.1;
  } else {
    // In the curved zone - use sine easing
    const t = (absX - peakWidth) / (halfWidth - peakWidth);
    const y = peakHeight - (peakHeight - curveStartHeight) * Math.sin(t * Math.PI / 2);
    return y - 0.1;
  }
}

export function CeilingLights() {
  const isMobile = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  // Lights along the curved ceiling
  const lights = useMemo(() => {
    const positions: { pos: [number, number, number]; rotation: [number, number, number] }[] = [];
    const zSpacing = isMobile ? 10 : 5;
    
    // Create lights along the center peak (flat part)
    for (let z = -35; z <= 5; z += zSpacing) {
      const y = getCurvedRoofY(0);
      positions.push({ 
        pos: [0, y, z], 
        rotation: [Math.PI / 2, 0, 0] 
      });
    }
    
    // Create lights along the curved parts (left and right)
    if (!isMobile) {
      const xPositions = [-5, 5];
      for (const x of xPositions) {
        for (let z = -35; z <= 5; z += zSpacing * 1.5) {
          const y = getCurvedRoofY(x);
          // Calculate tilt angle based on curve slope
          const halfWidth = 9;
          const peakWidth = halfWidth / 3.5;
          const absX = Math.abs(x);
          const t = (absX - peakWidth) / (halfWidth - peakWidth);
          const tiltAngle = (Math.PI / 4) * Math.sin(t * Math.PI / 2) * Math.sign(x);
          
          positions.push({ 
            pos: [x, y, z], 
            rotation: [Math.PI / 2, 0, tiltAngle] 
          });
        }
      }
    }
    
    return positions;
  }, [isMobile]);

  return (
    <group>
      {/* Curved light panels following the roof shape */}
      {lights.map((light, i) => (
        <group key={i} position={light.pos}>
          {/* Light panel - tilted to follow curve */}
          <mesh rotation={light.rotation}>
            <planeGeometry args={[1.8, 1.8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Actual light source */}
          <pointLight 
            position={[0, -0.5, 0]} 
            intensity={isMobile ? 1.5 : 1} 
            color="#ffffff" 
            distance={isMobile ? 20 : 14}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}
