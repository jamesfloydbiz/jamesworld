import { useMemo } from 'react';
import * as THREE from 'three';

// Match RoundedRoof.tsx geometry exactly
const HALF_WIDTH = 9;
const WALL_HEIGHT = 8;
const CURVE_START_HEIGHT = WALL_HEIGHT * 0.5;
const CURVE_RADIUS = 4;
const PEAK_WIDTH = HALF_WIDTH / 3.5;
const PEAK_HEIGHT = CURVE_START_HEIGHT + CURVE_RADIUS;

// Calculate Y position on the curved roof given X position
function getCurvedRoofY(x: number): number {
  const absX = Math.abs(x);
  
  if (absX <= PEAK_WIDTH) {
    return PEAK_HEIGHT;
  } else {
    const t = (absX - PEAK_WIDTH) / (HALF_WIDTH - PEAK_WIDTH);
    const y = PEAK_HEIGHT - (PEAK_HEIGHT - CURVE_START_HEIGHT) * Math.sin(t * Math.PI / 2);
    return y;
  }
}

interface RibProps {
  zPosition: number;
}

function ArchedRib({ zPosition }: RibProps) {
  const ribPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 24;
    
    for (let i = 0; i <= segments; i++) {
      const x = -HALF_WIDTH + (HALF_WIDTH * 2) * (i / segments);
      const y = getCurvedRoofY(x);
      points.push([x, y, zPosition]);
    }
    
    return points;
  }, [zPosition]);

  return (
    <group>
      {/* Create rib segments connecting consecutive points */}
      {ribPoints.slice(0, -1).map((point, i) => {
        const nextPoint = ribPoints[i + 1];
        const start = new THREE.Vector3(...point);
        const end = new THREE.Vector3(...nextPoint);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const direction = end.clone().sub(start);
        const length = direction.length();
        
        // Calculate rotation to align with direction
        const up = new THREE.Vector3(0, 1, 0);
        direction.normalize();
        const axis = new THREE.Vector3().crossVectors(up, direction).normalize();
        const angle = Math.acos(Math.min(1, Math.max(-1, up.dot(direction))));
        const quaternion = new THREE.Quaternion();
        
        if (axis.length() > 0.001) {
          quaternion.setFromAxisAngle(axis, angle);
        }
        
        const euler = new THREE.Euler().setFromQuaternion(quaternion);
        
        return (
          <mesh key={i} position={[mid.x, mid.y, mid.z]} rotation={euler}>
            <boxGeometry args={[0.08, length, 0.08]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

interface GlassPanelProps {
  z1: number;
  z2: number;
}

function GlassPanels({ z1, z2 }: GlassPanelProps) {
  const panels = useMemo(() => {
    const result: { position: [number, number, number]; rotation: [number, number, number]; width: number; height: number }[] = [];
    const xSegments = 6;
    const zMid = (z1 + z2) / 2;
    const zSpan = Math.abs(z2 - z1);
    
    for (let i = 0; i < xSegments; i++) {
      const x1 = -HALF_WIDTH + (HALF_WIDTH * 2) * (i / xSegments);
      const x2 = -HALF_WIDTH + (HALF_WIDTH * 2) * ((i + 1) / xSegments);
      const xMid = (x1 + x2) / 2;
      const xSpan = x2 - x1;
      
      const y1 = getCurvedRoofY(x1);
      const y2 = getCurvedRoofY(x2);
      const yMid = (y1 + y2) / 2;
      
      // Calculate tilt based on slope
      const slope = (y2 - y1) / xSpan;
      const tiltZ = Math.atan(slope);
      
      result.push({
        position: [xMid, yMid - 0.02, zMid],
        rotation: [Math.PI / 2 - tiltZ, 0, 0],
        width: xSpan * 0.95,
        height: zSpan * 0.95,
      });
    }
    
    return result;
  }, [z1, z2]);

  return (
    <group>
      {panels.map((panel, i) => (
        <mesh key={i} position={panel.position} rotation={panel.rotation}>
          <planeGeometry args={[panel.width, panel.height]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function HorizontalStringers() {
  const stringerPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const xPositions = [-6, -3, 0, 3, 6];
    
    for (const x of xPositions) {
      positions.push({ x, y: getCurvedRoofY(x) - 0.04 });
    }
    
    return positions;
  }, []);

  return (
    <group>
      {stringerPositions.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, -15]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.05, 0.05, 50]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export function VictorianRoof() {
  // Create ribs every 4 units along Z axis
  const ribPositions = useMemo(() => {
    const positions: number[] = [];
    for (let z = 10; z >= -40; z -= 4) {
      positions.push(z);
    }
    return positions;
  }, []);

  return (
    <group>
      {/* Arched ribs */}
      {ribPositions.map((z, i) => (
        <ArchedRib key={`rib-${i}`} zPosition={z} />
      ))}
      
      {/* Glass panels between ribs */}
      {ribPositions.slice(0, -1).map((z1, i) => (
        <GlassPanels key={`glass-${i}`} z1={z1} z2={ribPositions[i + 1]} />
      ))}
      
      {/* Horizontal stringers running length of gallery */}
      <HorizontalStringers />
    </group>
  );
}
