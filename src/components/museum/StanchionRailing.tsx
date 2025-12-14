import * as THREE from 'three';

interface StanchionProps {
  position: [number, number, number];
}

function Stanchion({ position }: StanchionProps) {
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
      {/* Top ball */}
      <mesh position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#8B0000" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

interface RopeSegmentProps {
  start: [number, number, number];
  end: [number, number, number];
}

function RopeSegment({ start, end }: RopeSegmentProps) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const midPoint = startVec.clone().add(endVec).multiplyScalar(0.5);
  
  // Rope hangs down slightly in the middle
  midPoint.y = 0.75;
  
  const direction = endVec.clone().sub(startVec);
  const length = direction.length();
  const angle = Math.atan2(direction.x, direction.z);
  
  return (
    <group position={[midPoint.x, midPoint.y, midPoint.z]}>
      <mesh rotation={[0, -angle, 0]}>
        <cylinderGeometry args={[0.015, 0.015, length, 8]} />
        <meshStandardMaterial color="#8B0000" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function StanchionRailing() {
  // Stanchion positions along the perimeter
  const stanchions: [number, number, number][] = [
    // Left side
    [-8, 0, 5],
    [-8, 0, -2],
    [-8, 0, -9],
    [-8, 0, -16],
    [-8, 0, -23],
    [-8, 0, -30],
    // Right side
    [8, 0, 5],
    [8, 0, -2],
    [8, 0, -9],
    [8, 0, -16],
    [8, 0, -23],
    [8, 0, -30],
    // Back wall
    [-5, 0, -35],
    [0, 0, -35],
    [5, 0, -35],
  ];

  // Rope connections
  const ropes: { start: [number, number, number]; end: [number, number, number] }[] = [
    // Left side ropes
    { start: [-8, 0.95, 5], end: [-8, 0.95, -2] },
    { start: [-8, 0.95, -2], end: [-8, 0.95, -9] },
    { start: [-8, 0.95, -9], end: [-8, 0.95, -16] },
    { start: [-8, 0.95, -16], end: [-8, 0.95, -23] },
    { start: [-8, 0.95, -23], end: [-8, 0.95, -30] },
    // Right side ropes
    { start: [8, 0.95, 5], end: [8, 0.95, -2] },
    { start: [8, 0.95, -2], end: [8, 0.95, -9] },
    { start: [8, 0.95, -9], end: [8, 0.95, -16] },
    { start: [8, 0.95, -16], end: [8, 0.95, -23] },
    { start: [8, 0.95, -23], end: [8, 0.95, -30] },
    // Back wall ropes
    { start: [-5, 0.95, -35], end: [0, 0.95, -35] },
    { start: [0, 0.95, -35], end: [5, 0.95, -35] },
    // Connect to back corners
    { start: [-8, 0.95, -30], end: [-5, 0.95, -35] },
    { start: [8, 0.95, -30], end: [5, 0.95, -35] },
  ];

  return (
    <group>
      {stanchions.map((pos, i) => (
        <Stanchion key={i} position={pos} />
      ))}
      {ropes.map((rope, i) => (
        <RopeSegment key={i} start={rope.start} end={rope.end} />
      ))}
    </group>
  );
}
