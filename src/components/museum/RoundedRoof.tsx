import { useMemo } from 'react';
import * as THREE from 'three';

interface RoundedRoofProps {
  width?: number;
  length?: number;
  position?: [number, number, number];
}

export function RoundedRoof({ 
  width = 18, 
  length = 50, 
  position = [0, 8, -15] 
}: RoundedRoofProps) {
  const geometry = useMemo(() => {
    // Create a barrel vault (half cylinder) roof
    const radius = width / 2;
    const segments = 32;
    
    const geometry = new THREE.CylinderGeometry(
      radius,     // radiusTop
      radius,     // radiusBottom  
      length,     // height (length of the barrel)
      segments,   // radialSegments
      1,          // heightSegments
      true,       // openEnded
      0,          // thetaStart
      Math.PI     // thetaLength (half circle for barrel vault)
    );
    
    // Rotate: cylinder default is Y-axis, we need it along Z-axis
    geometry.rotateZ(Math.PI / 2);  // Rotate so the curve faces up/down
    geometry.rotateY(Math.PI / 2);  // Rotate to align with the hallway
    
    return geometry;
  }, [width, length]);

  return (
    <group position={position}>
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          color="#0a0a0a" 
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
