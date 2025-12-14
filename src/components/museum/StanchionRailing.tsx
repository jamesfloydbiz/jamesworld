import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

interface StanchionProps {
  position: [number, number, number];
}

function Stanchion({ position }: StanchionProps) {
  return (
    <group position={position}>
      {/* Chrome base - wider and more refined */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 24]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Chrome pole */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.0, 16]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.98} roughness={0.05} />
      </mesh>
      {/* Chrome top finial */}
      <mesh position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.98} roughness={0.05} />
      </mesh>
      {/* Rope hook ring */}
      <mesh position={[0, 0.95, 0]}>
        <torusGeometry args={[0.035, 0.008, 8, 16]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

interface VelvetRopeProps {
  start: [number, number, number];
  end: [number, number, number];
}

function VelvetRope({ start, end }: VelvetRopeProps) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const midPoint = startVec.clone().add(endVec).multiplyScalar(0.5);
  
  // Velvet rope sags elegantly in the middle
  midPoint.y = start[1] - 0.08;
  
  const direction = endVec.clone().sub(startVec);
  const length = direction.length();
  const angle = Math.atan2(direction.x, direction.z);
  
  return (
    <group position={[midPoint.x, midPoint.y, midPoint.z]}>
      <mesh rotation={[0, -angle, 0]}>
        <cylinderGeometry args={[0.018, 0.018, length, 12]} />
        <meshStandardMaterial 
          color="#8B0000" 
          roughness={0.85} 
          metalness={0.05}
        />
      </mesh>
      {/* Rope tassels at ends */}
      <mesh position={[0, 0, -length/2 + 0.02]} rotation={[0, -angle, 0]}>
        <cylinderGeometry args={[0.012, 0.008, 0.06, 8]} />
        <meshStandardMaterial color="#660000" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, length/2 - 0.02]} rotation={[0, -angle, 0]}>
        <cylinderGeometry args={[0.012, 0.008, 0.06, 8]} />
        <meshStandardMaterial color="#660000" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Stanchion circle around a pedestal
function PedestalRailing({ pedestalPosition }: { pedestalPosition: [number, number, number] }) {
  const [px, py, pz] = pedestalPosition;
  const radius = 1.8;
  const stanchionCount = 6;
  
  const stanchions: [number, number, number][] = [];
  const ropes: { start: [number, number, number]; end: [number, number, number] }[] = [];
  
  for (let i = 0; i < stanchionCount; i++) {
    const angle = (i / stanchionCount) * Math.PI * 2;
    const x = px + Math.cos(angle) * radius;
    const z = pz + Math.sin(angle) * radius;
    stanchions.push([x, py, z]);
  }
  
  // Connect stanchions with ropes
  for (let i = 0; i < stanchionCount; i++) {
    const nextI = (i + 1) % stanchionCount;
    ropes.push({
      start: [stanchions[i][0], stanchions[i][1] + 0.95, stanchions[i][2]],
      end: [stanchions[nextI][0], stanchions[nextI][1] + 0.95, stanchions[nextI][2]]
    });
  }
  
  return (
    <group>
      {stanchions.map((pos, i) => (
        <Stanchion key={i} position={pos} />
      ))}
      {ropes.map((rope, i) => (
        <VelvetRope key={i} start={rope.start} end={rope.end} />
      ))}
    </group>
  );
}

export function StanchionRailing() {
  const { portals } = useGameStore();
  
  // Perimeter stanchions
  const perimeterStanchions: [number, number, number][] = [
    // Left side
    [-9, 0, 5],
    [-9, 0, -2],
    [-9, 0, -9],
    [-9, 0, -16],
    [-9, 0, -23],
    [-9, 0, -30],
    [-9, 0, -37],
    // Right side
    [9, 0, 5],
    [9, 0, -2],
    [9, 0, -9],
    [9, 0, -16],
    [9, 0, -23],
    [9, 0, -30],
    [9, 0, -37],
    // Back wall
    [-6, 0, -38],
    [0, 0, -38],
    [6, 0, -38],
  ];

  // Perimeter rope connections
  const perimeterRopes: { start: [number, number, number]; end: [number, number, number] }[] = [
    // Left side
    { start: [-9, 0.95, 5], end: [-9, 0.95, -2] },
    { start: [-9, 0.95, -2], end: [-9, 0.95, -9] },
    { start: [-9, 0.95, -9], end: [-9, 0.95, -16] },
    { start: [-9, 0.95, -16], end: [-9, 0.95, -23] },
    { start: [-9, 0.95, -23], end: [-9, 0.95, -30] },
    { start: [-9, 0.95, -30], end: [-9, 0.95, -37] },
    // Right side
    { start: [9, 0.95, 5], end: [9, 0.95, -2] },
    { start: [9, 0.95, -2], end: [9, 0.95, -9] },
    { start: [9, 0.95, -9], end: [9, 0.95, -16] },
    { start: [9, 0.95, -16], end: [9, 0.95, -23] },
    { start: [9, 0.95, -23], end: [9, 0.95, -30] },
    { start: [9, 0.95, -30], end: [9, 0.95, -37] },
    // Back wall
    { start: [-6, 0.95, -38], end: [0, 0.95, -38] },
    { start: [0, 0.95, -38], end: [6, 0.95, -38] },
    // Connect to back corners
    { start: [-9, 0.95, -37], end: [-6, 0.95, -38] },
    { start: [9, 0.95, -37], end: [6, 0.95, -38] },
  ];

  return (
    <group>
      {/* Perimeter railings */}
      {perimeterStanchions.map((pos, i) => (
        <Stanchion key={`perimeter-${i}`} position={pos} />
      ))}
      {perimeterRopes.map((rope, i) => (
        <VelvetRope key={`perimeter-rope-${i}`} start={rope.start} end={rope.end} />
      ))}
      
      {/* Railings around each pedestal */}
      {portals.map((portal) => (
        <PedestalRailing key={portal.id} pedestalPosition={portal.pedestalPosition} />
      ))}
    </group>
  );
}
