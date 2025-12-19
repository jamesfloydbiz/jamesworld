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
    return peakHeight - 0.15;
  } else {
    const t = (absX - peakWidth) / (halfWidth - peakWidth);
    const y = peakHeight - (peakHeight - curveStartHeight) * Math.sin(t * Math.PI / 2);
    return y - 0.15;
  }
}

// Calculate the rotation angle to be tangent to the curve at a given X
function getCurveTangentAngle(x: number): number {
  const halfWidth = 9;
  const peakWidth = halfWidth / 3.5;
  const absX = Math.abs(x);
  
  if (absX <= peakWidth) {
    return 0; // Flat at peak, no rotation
  } else {
    // Calculate the slope of the curve at this point
    const t = (absX - peakWidth) / (halfWidth - peakWidth);
    // Angle based on position along curve
    const angle = (Math.PI / 2.5) * Math.sin(t * Math.PI / 2);
    return x > 0 ? angle : -angle; // Tilt outward on each side
  }
}

export function CeilingLights() {
  const isMobile = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  // Create grid of light panels following the curved roof
  const lightPanels = useMemo(() => {
    const panels: { 
      pos: [number, number, number]; 
      rotX: number;
    }[] = [];
    
    const zSpacing = isMobile ? 8 : 5;
    const xPositions = isMobile ? [0] : [-6, -3, 0, 3, 6];
    
    for (let z = -35; z <= 5; z += zSpacing) {
      for (const x of xPositions) {
        const y = getCurvedRoofY(x);
        const rotX = getCurveTangentAngle(x);
        
        panels.push({
          pos: [x, y, z],
          rotX
        });
      }
    }
    
    return panels;
  }, [isMobile]);

  const panelSize = isMobile ? 2.2 : 1.8;

  return (
    <group>
      {lightPanels.map((panel, i) => (
        <group key={i} position={panel.pos} rotation={[0, 0, panel.rotX]}>
          {/* Light panel - rotated to follow curve */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[panelSize, panelSize]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Light source */}
          <pointLight 
            position={[0, -0.3, 0]} 
            intensity={isMobile ? 0.8 : 0.5} 
            color="#ffffff" 
            distance={isMobile ? 15 : 10}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}
