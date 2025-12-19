import * as THREE from 'three';

function Stanchion({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Top ball - white to match ropes */}
      <mesh position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.4} />
      </mesh>
    </group>
  );
}

function RopeSegment({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  
  const midPoint = startVec.clone().add(endVec).multiplyScalar(0.5);
  midPoint.y -= 0.08;
  
  const direction = endVec.clone().sub(startVec);
  const length = direction.length();
  
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  direction.normalize();
  
  const axis = new THREE.Vector3().crossVectors(up, direction).normalize();
  const angle = Math.acos(up.dot(direction));
  
  if (axis.length() > 0.001) {
    quaternion.setFromAxisAngle(axis, angle);
  } else if (direction.y < 0) {
    quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
  }
  
  const euler = new THREE.Euler().setFromQuaternion(quaternion);
  
  return (
    <mesh position={[midPoint.x, midPoint.y, midPoint.z]} rotation={euler}>
      <cylinderGeometry args={[0.025, 0.025, length, 12]} />
      <meshStandardMaterial color="#f0f0f0" metalness={0.15} roughness={0.5} />
    </mesh>
  );
}

export function HallwayStanchions() {
  // Stanchions along the red carpet from main gallery to picture hall
  const hallwayStanchions: [number, number, number][] = [
    // Left side of carpet
    [-2, 0, -38],
    [-2, 0, -44],
    [-2, 0, -50],
    [-2, 0, -56],
    [-2, 0, -62],
    // Right side of carpet
    [2, 0, -38],
    [2, 0, -44],
    [2, 0, -50],
    [2, 0, -56],
    [2, 0, -62],
  ];
  
  const hallwayRopes: { start: [number, number, number]; end: [number, number, number] }[] = [
    // Connect perimeter stanchions to hallway entrance
    { start: [-5, 0.95, -35], end: [-2, 0.95, -38] },
    { start: [5, 0.95, -35], end: [2, 0.95, -38] },
    // Left side ropes
    { start: [-2, 0.95, -38], end: [-2, 0.95, -44] },
    { start: [-2, 0.95, -44], end: [-2, 0.95, -50] },
    { start: [-2, 0.95, -50], end: [-2, 0.95, -56] },
    { start: [-2, 0.95, -56], end: [-2, 0.95, -62] },
    // Right side ropes
    { start: [2, 0.95, -38], end: [2, 0.95, -44] },
    { start: [2, 0.95, -44], end: [2, 0.95, -50] },
    { start: [2, 0.95, -50], end: [2, 0.95, -56] },
    { start: [2, 0.95, -56], end: [2, 0.95, -62] },
  ];
  
  return (
    <group>
      {hallwayStanchions.map((pos, i) => (
        <Stanchion key={`hall-stanchion-${i}`} position={pos} />
      ))}
      {hallwayRopes.map((rope, i) => (
        <RopeSegment key={`hall-rope-${i}`} start={rope.start} end={rope.end} />
      ))}
    </group>
  );
}

// Export collision data for Character.tsx
export const hallwayStanchionPositions: [number, number][] = [
  [-2, -38], [-2, -44], [-2, -50], [-2, -56], [-2, -62],
  [2, -38], [2, -44], [2, -50], [2, -56], [2, -62],
];

export const hallwayRopeSegments: [number, number, number, number][] = [
  // Connecting ropes from perimeter to hallway
  [-5, -35, -2, -38], [5, -35, 2, -38],
  // Left side
  [-2, -38, -2, -44], [-2, -44, -2, -50], [-2, -50, -2, -56], [-2, -56, -2, -62],
  // Right side
  [2, -38, 2, -44], [2, -44, 2, -50], [2, -50, 2, -56], [2, -56, 2, -62],
];
