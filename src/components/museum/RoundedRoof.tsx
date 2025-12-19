import { useMemo } from 'react';
import * as THREE from 'three';

interface RoundedRoofProps {
  width?: number;
  length?: number;
  height?: number;
  position?: [number, number, number];
}

export function RoundedRoof({ 
  width = 20, 
  length = 50, 
  height = 2,
  position = [0, 8, -15] 
}: RoundedRoofProps) {
  const geometry = useMemo(() => {
    // Create a barrel vault (half cylinder) roof
    const segments = 32;
    const lengthSegments = 1;
    
    const geometry = new THREE.CylinderGeometry(
      width / 2,  // radiusTop
      width / 2,  // radiusBottom  
      length,     // height (length of the barrel)
      segments,   // radialSegments
      lengthSegments,
      true,       // openEnded
      0,          // thetaStart
      Math.PI     // thetaLength (half circle for barrel vault)
    );
    
    // Rotate to align properly (cylinder is vertical by default)
    geometry.rotateX(Math.PI / 2);
    geometry.rotateZ(Math.PI / 2);
    
    return geometry;
  }, [width, length]);

  return (
    <group position={position}>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial 
          color="#0a0a0a" 
          roughness={0.95}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
