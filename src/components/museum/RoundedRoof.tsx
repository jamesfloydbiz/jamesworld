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
  curveRadius = 6
}: RoundedRoofProps) {
  const geometry = useMemo(() => {
    // Create a tunnel-like shape where walls curve into ceiling
    // Curve starts 1/4 down from the top (at 75% of wall height)
    const shape = new THREE.Shape();
    
    const halfWidth = width / 2;
    const wallHeight = 8; // Total height
    const curveStartHeight = wallHeight * 0.75; // Curve starts 1/4 from top
    
    // Start from bottom-left (floor level)
    shape.moveTo(-halfWidth, 0);
    
    // Go up the left wall to where curve starts
    shape.lineTo(-halfWidth, curveStartHeight);
    
    // Create the curved ceiling portion
    // Arc from left side, up and over to right side
    const segments = 32;
    const curveHeight = wallHeight - curveStartHeight + curveRadius * 0.5;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = Math.PI * t; // 0 to PI (half circle)
      const x = -halfWidth * Math.cos(angle);
      const y = curveStartHeight + curveRadius * Math.sin(angle);
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
