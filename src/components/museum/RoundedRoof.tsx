import { useMemo } from 'react';
import * as THREE from 'three';

interface RoundedRoofProps {
  width?: number;
  length?: number;
  position?: [number, number, number];
  curveRadius?: number;
}

export function RoundedRoof({ 
  width = 18, 
  length = 50, 
  position = [0, 0, -15],
  curveRadius = 4
}: RoundedRoofProps) {
  const geometry = useMemo(() => {
    // Create a tunnel-like shape where walls curve into ceiling
    // Curve starts halfway down the wall, peak only in middle 1/7
    const shape = new THREE.Shape();
    
    const halfWidth = width / 2;
    const wallHeight = 8; // Total height
    const curveStartHeight = wallHeight * 0.5; // Curve starts halfway down
    
    // Peak is only in the middle 1/7 of the width
    const peakWidth = halfWidth / 3.5; // 1/7 of total width = 1/3.5 of halfWidth
    const peakHeight = curveStartHeight + curveRadius;
    
    // Start from bottom-left (floor level)
    shape.moveTo(-halfWidth, 0);
    
    // Go up the left wall to where curve starts
    shape.lineTo(-halfWidth, curveStartHeight);
    
    // Curve from left wall to left edge of peak
    const curveSegments = 16;
    for (let i = 0; i <= curveSegments; i++) {
      const t = i / curveSegments;
      // Ease from wall to peak edge
      const x = -halfWidth + (halfWidth - peakWidth) * t;
      const y = curveStartHeight + (peakHeight - curveStartHeight) * Math.sin(t * Math.PI / 2);
      shape.lineTo(x, y);
    }
    
    // Flat peak in the middle 1/7
    shape.lineTo(peakWidth, peakHeight);
    
    // Curve from right edge of peak down to right wall
    for (let i = 0; i <= curveSegments; i++) {
      const t = i / curveSegments;
      const x = peakWidth + (halfWidth - peakWidth) * t;
      const y = peakHeight - (peakHeight - curveStartHeight) * Math.sin(t * Math.PI / 2);
      shape.lineTo(x, y);
    }
    
    // Go down the right wall
    shape.lineTo(halfWidth, 0);
    
    // Close the shape along the floor
    shape.lineTo(-halfWidth, 0);
    
    // Extrude settings
    const extrudeSettings = {
      steps: 1,
      depth: length,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Rotate to align with the hallway (extruded along Z)
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, 0, length / 2);
    
    return geometry;
  }, [width, length, curveRadius]);

  return (
    <group position={position}>
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          color="#0a0a0a" 
          roughness={0.95}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
