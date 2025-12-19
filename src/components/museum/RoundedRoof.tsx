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
  position = [0, 6.5, -15],
  curveRadius = 9
}: RoundedRoofProps) {
  const geometry = useMemo(() => {
    // Create a full curved ceiling that connects the walls
    // Using an extruded arc shape
    const shape = new THREE.Shape();
    
    const halfWidth = width / 2;
    
    // Start from bottom-left, curve up and over to bottom-right
    shape.moveTo(-halfWidth, 0);
    
    // Create a smooth arc from left wall to right wall
    // Using quadratic curves for a smooth barrel vault effect
    const segments = 24;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = Math.PI * t; // 0 to PI (half circle)
      const x = -halfWidth * Math.cos(angle);
      const y = curveRadius * Math.sin(angle);
      shape.lineTo(x, y);
    }
    
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
