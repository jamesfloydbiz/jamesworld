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
    return peakHeight - 0.1;
  } else {
    const t = (absX - peakWidth) / (halfWidth - peakWidth);
    const y = peakHeight - (peakHeight - curveStartHeight) * Math.sin(t * Math.PI / 2);
    return y - 0.1;
  }
}

// Calculate the angle of the curve at a given X position
function getCurveAngle(x: number): number {
  const halfWidth = 9;
  const peakWidth = halfWidth / 3.5;
  const absX = Math.abs(x);
  
  if (absX <= peakWidth) {
    return 0; // Flat at the peak
  } else {
    // Derivative of the sine curve gives us the slope
    const t = (absX - peakWidth) / (halfWidth - peakWidth);
    // Angle increases as we go further from center
    const angle = (Math.PI / 3) * Math.sin(t * Math.PI / 2);
    return x > 0 ? -angle : angle; // Inward tilt toward center
  }
}

export function CeilingLights() {
  const isMobile = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  // Lights along the curved ceiling - skylights on sides angled inward
  const lights = useMemo(() => {
    const positions: { 
      pos: [number, number, number]; 
      rotation: [number, number, number];
      isSkylightStyle: boolean;
    }[] = [];
    const zSpacing = isMobile ? 10 : 6;
    
    // Center lights - straight down
    for (let z = -35; z <= 5; z += zSpacing) {
      const y = getCurvedRoofY(0);
      positions.push({ 
        pos: [0, y, z], 
        rotation: [Math.PI / 2, 0, 0],
        isSkylightStyle: false
      });
    }
    
    // Side lights - angled like skylights following the curve
    if (!isMobile) {
      const xPositions = [-6, 6]; // Further out on the curve
      for (const x of xPositions) {
        for (let z = -35; z <= 5; z += zSpacing * 1.2) {
          const y = getCurvedRoofY(x);
          const curveAngle = getCurveAngle(x);
          
          positions.push({ 
            pos: [x, y, z], 
            rotation: [Math.PI / 2 + curveAngle, 0, 0], // Tilt to follow curve
            isSkylightStyle: true
          });
        }
      }
    }
    
    return positions;
  }, [isMobile]);

  return (
    <group>
      {lights.map((light, i) => (
        <group key={i} position={light.pos}>
          {/* Light panel - tilted to follow curve for skylights */}
          <mesh rotation={light.rotation}>
            <planeGeometry args={light.isSkylightStyle ? [1.2, 2.4] : [1.8, 1.8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Point light for ambient glow */}
          <pointLight 
            position={[0, -0.3, 0]} 
            intensity={isMobile ? 1.2 : 0.8} 
            color="#ffffff" 
            distance={isMobile ? 18 : 12}
            decay={2}
          />
          
          {/* Spotlight for dynamic shadows - angled for skylights */}
          <spotLight
            position={[0, -0.2, 0]}
            target-position={[
              light.pos[0] * 0.3, // Aim slightly toward center
              0, 
              light.pos[2]
            ]}
            angle={light.isSkylightStyle ? 0.6 : 0.5}
            penumbra={0.8}
            intensity={light.isSkylightStyle ? 0.4 : 0.3}
            color="#fffef8"
            castShadow
            shadow-mapSize={[256, 256]}
            shadow-bias={-0.001}
            decay={2}
            distance={10}
          />
        </group>
      ))}
    </group>
  );
}
