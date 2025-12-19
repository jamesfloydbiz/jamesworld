import { useMemo } from 'react';
import * as THREE from 'three';

// Subtle white baseboards along floor edges
function Baseboards() {
  const wallX = 9;
  const mainGalleryLength = 40; // from z=7 to z=-35
  
  return (
    <group>
      {/* Left baseboard */}
      <mesh position={[-wallX + 0.01, 0.015, -14]}>
        <boxGeometry args={[0.02, 0.03, mainGalleryLength]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.7} />
      </mesh>
      
      {/* Right baseboard */}
      <mesh position={[wallX - 0.01, 0.015, -14]}>
        <boxGeometry args={[0.02, 0.03, mainGalleryLength]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Crown molding where curved roof meets the transition point
function CrownMolding() {
  const wallX = 9;
  const curveStartHeight = 4; // Where curve begins
  const mainGalleryLength = 40;
  
  // Create a subtle crown molding profile
  const moldingShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.04, 0);
    shape.lineTo(0.04, 0.02);
    shape.lineTo(0.02, 0.04);
    shape.lineTo(0, 0.04);
    shape.lineTo(0, 0);
    return shape;
  }, []);
  
  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: mainGalleryLength,
    bevelEnabled: false,
  }), [mainGalleryLength]);
  
  const leftMoldingGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(moldingShape, extrudeSettings);
    geo.rotateY(Math.PI / 2);
    geo.translate(-wallX + 0.01, curveStartHeight, 7);
    return geo;
  }, [moldingShape, extrudeSettings, wallX, curveStartHeight]);
  
  const rightMoldingGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(moldingShape, extrudeSettings);
    geo.rotateY(-Math.PI / 2);
    geo.translate(wallX - 0.01, curveStartHeight, -35);
    return geo;
  }, [moldingShape, extrudeSettings, wallX, curveStartHeight]);

  return (
    <group>
      {/* Left crown molding */}
      <mesh geometry={leftMoldingGeometry}>
        <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
      </mesh>
      
      {/* Right crown molding */}
      <mesh geometry={rightMoldingGeometry}>
        <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function ArchitecturalAccents() {
  return (
    <group>
      <CrownMolding />
    </group>
  );
}
