import { useMemo } from 'react';

// Match RoundedRoof.tsx geometry exactly
const HALF_WIDTH = 9;
const WALL_HEIGHT = 8;
const CURVE_START_HEIGHT = WALL_HEIGHT * 0.5; // 4
const CURVE_RADIUS = 4;
const PEAK_WIDTH = HALF_WIDTH / 3.5;
const PEAK_HEIGHT = CURVE_START_HEIGHT + CURVE_RADIUS; // 8

// Calculate Y position on the curved roof given X position
function getCurvedRoofY(x: number): number {
  const absX = Math.abs(x);
  
  if (absX <= PEAK_WIDTH) {
    // Flat peak section
    return PEAK_HEIGHT;
  } else {
    // Curved section from peak down to wall
    const t = (absX - PEAK_WIDTH) / (HALF_WIDTH - PEAK_WIDTH);
    const y = PEAK_HEIGHT - (PEAK_HEIGHT - CURVE_START_HEIGHT) * Math.sin(t * Math.PI / 2);
    return y;
  }
}

// Calculate the tilt angle for the light panel to lay flat against the curve
function getCurveTiltAngle(x: number): number {
  const absX = Math.abs(x);
  
  if (absX <= PEAK_WIDTH) {
    // Flat at peak - panel faces straight down
    return 0;
  } else {
    // Tilt inward based on curve slope
    const t = (absX - PEAK_WIDTH) / (HALF_WIDTH - PEAK_WIDTH);
    // Angle increases from 0 at peak to ~45° at wall edge
    const angle = (Math.PI / 4) * Math.sin(t * Math.PI / 2);
    return x > 0 ? -angle : angle; // Tilt inward on each side
  }
}

export function CeilingLights() {
  const isMobile = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  // Create grid of light panels following the curved roof
  const lightPanels = useMemo(() => {
    const panels: { 
      pos: [number, number, number]; 
      tiltX: number;
    }[] = [];
    
    const zSpacing = isMobile ? 8 : 5;
    const xPositions = isMobile ? [0] : [-5, -2.5, 0, 2.5, 5];
    
    for (let z = -35; z <= 5; z += zSpacing) {
      for (const x of xPositions) {
        const y = getCurvedRoofY(x) - 0.1; // Slightly below roof surface
        const tiltX = getCurveTiltAngle(x);
        
        panels.push({
          pos: [x, y, z],
          tiltX
        });
      }
    }
    
    return panels;
  }, [isMobile]);

  const panelSize = isMobile ? 2.2 : 1.5;

  return (
    <group>
      {lightPanels.map((panel, i) => (
        <group key={i} position={panel.pos}>
          {/* Light panel - rotated to lay flat against curved roof */}
          <mesh rotation={[-Math.PI / 2 + panel.tiltX, 0, 0]}>
            <planeGeometry args={[panelSize, panelSize]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Light source */}
          <pointLight 
            position={[0, -0.5, 0]} 
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
