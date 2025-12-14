import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

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
  
  // Calculate midpoint
  const midPoint = startVec.clone().add(endVec).multiplyScalar(0.5);
  // Add slight sag
  midPoint.y -= 0.08;
  
  // Calculate length and direction
  const direction = endVec.clone().sub(startVec);
  const length = direction.length();
  
  // Calculate rotation to align cylinder horizontally between points
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  direction.normalize();
  
  // Create rotation that aligns Y-axis (cylinder default) with the direction
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
      <cylinderGeometry args={[0.015, 0.015, length, 8]} />
      <meshStandardMaterial color="#8B0000" roughness={0.8} />
    </mesh>
  );
}

export function StanchionRailing() {
  const { portals } = useGameStore();
  
  // Perimeter stanchion positions
  const perimeterStanchions: [number, number, number][] = [
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

  // Perimeter rope connections
  const perimeterRopes: { start: [number, number, number]; end: [number, number, number] }[] = [
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

  // Generate pedestal stanchions and ropes
  const pedestalStanchions: [number, number, number][] = [];
  const pedestalRopes: { start: [number, number, number]; end: [number, number, number] }[] = [];
  
  const offset = 1.8;
  const ropeHeight = 0.95;
  
  for (const portal of portals) {
    const [px, , pz] = portal.pedestalPosition;
    
    // 4 corner stanchions
    const corners: [number, number, number][] = [
      [px - offset, 0, pz - offset],
      [px + offset, 0, pz - offset],
      [px + offset, 0, pz + offset],
      [px - offset, 0, pz + offset],
    ];
    pedestalStanchions.push(...corners);
    
    // 4 rope segments connecting corners in a square
    pedestalRopes.push(
      { start: [px - offset, ropeHeight, pz - offset], end: [px + offset, ropeHeight, pz - offset] },
      { start: [px + offset, ropeHeight, pz - offset], end: [px + offset, ropeHeight, pz + offset] },
      { start: [px + offset, ropeHeight, pz + offset], end: [px - offset, ropeHeight, pz + offset] },
      { start: [px - offset, ropeHeight, pz + offset], end: [px - offset, ropeHeight, pz - offset] },
    );
  }

  const allStanchions = [...perimeterStanchions, ...pedestalStanchions];
  const allRopes = [...perimeterRopes, ...pedestalRopes];

  return (
    <group>
      {allStanchions.map((pos, i) => (
        <Stanchion key={`stanchion-${i}`} position={pos} />
      ))}
      {allRopes.map((rope, i) => (
        <RopeSegment key={`rope-${i}`} start={rope.start} end={rope.end} />
      ))}
    </group>
  );
}
