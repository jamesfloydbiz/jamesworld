import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from './useKeyboardControls';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const MOVE_SPEED = 0.08;
const ROTATION_SPEED = 0.05;
const CIRCLE_RADIUS = 1.5;
const CHARACTER_RADIUS = 0.3;
const STANCHION_RADIUS = 0.25;
const ROPE_COLLISION_RADIUS = 0.2;
const FOOTPRINT_DURATION = 2000; // 2 seconds in ms

interface Footprint {
  id: number;
  position: [number, number, number];
  rotation: number;
  timestamp: number;
  isLeft: boolean;
}

// Get all stanchion collision positions
function getStanchionPositions(portals: { pedestalPosition: [number, number, number] }[]) {
  const positions: [number, number][] = [];
  
  // Perimeter stanchions (x, z only for 2D collision)
  const perimeter: [number, number][] = [
    [-8, 5], [-8, -2], [-8, -9], [-8, -16], [-8, -23], [-8, -30],
    [8, 5], [8, -2], [8, -9], [8, -16], [8, -23], [8, -30],
    [-5, -35], [0, -35], [5, -35],
  ];
  positions.push(...perimeter);
  
  // Pedestal stanchions (4 corners around each pedestal)
  for (const portal of portals) {
    const [px, , pz] = portal.pedestalPosition;
    const offset = 1.8;
    positions.push(
      [px - offset, pz - offset],
      [px + offset, pz - offset],
      [px + offset, pz + offset],
      [px - offset, pz + offset],
    );
  }
  
  return positions;
}

// Get all rope segments for collision (each segment is [startX, startZ, endX, endZ])
function getRopeSegments(portals: { pedestalPosition: [number, number, number] }[]) {
  const segments: [number, number, number, number][] = [];
  
  // Perimeter ropes
  const perimeterRopes: [number, number, number, number][] = [
    // Left side
    [-8, 5, -8, -2], [-8, -2, -8, -9], [-8, -9, -8, -16], 
    [-8, -16, -8, -23], [-8, -23, -8, -30],
    // Right side
    [8, 5, 8, -2], [8, -2, 8, -9], [8, -9, 8, -16], 
    [8, -16, 8, -23], [8, -23, 8, -30],
    // Back wall
    [-5, -35, 0, -35], [0, -35, 5, -35],
    // Connect to back corners
    [-8, -30, -5, -35], [8, -30, 5, -35],
  ];
  segments.push(...perimeterRopes);
  
  // Pedestal ropes (square around each pedestal)
  const offset = 1.8;
  for (const portal of portals) {
    const [px, , pz] = portal.pedestalPosition;
    segments.push(
      [px - offset, pz - offset, px + offset, pz - offset], // front
      [px + offset, pz - offset, px + offset, pz + offset], // right
      [px + offset, pz + offset, px - offset, pz + offset], // back
      [px - offset, pz + offset, px - offset, pz - offset], // left
    );
  }
  
  return segments;
}

// Find closest point on a line segment to a point
function closestPointOnSegment(
  ax: number, az: number, 
  bx: number, bz: number, 
  px: number, pz: number
): [number, number] {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  
  if (lenSq === 0) return [ax, az];
  
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lenSq));
  return [ax + t * dx, az + t * dz];
}

// Footprints component
function Footprints({ footprints }: { footprints: Footprint[] }) {
  const now = Date.now();
  
  return (
    <group>
      {footprints.map((fp) => {
        const age = now - fp.timestamp;
        const opacity = Math.max(0, 0.4 * (1 - age / FOOTPRINT_DURATION));
        const offsetX = fp.isLeft ? -0.08 : 0.08;
        
        return (
          <mesh
            key={fp.id}
            position={[
              fp.position[0] + Math.sin(fp.rotation) * offsetX,
              0.01,
              fp.position[2] + Math.cos(fp.rotation) * offsetX
            ]}
            rotation={[-Math.PI / 2, 0, fp.rotation]}
            scale={[0.6, 1, 1]}
          >
            <circleGeometry args={[0.1, 16]} />
            <meshBasicMaterial color="#ffffff" opacity={opacity} transparent />
          </mesh>
        );
      })}
    </group>
  );
}

export function Character() {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  
  const walkPhase = useRef(0);
  const breathPhase = useRef(0);
  const currentSpeed = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(0);
  
  // Footprint tracking
  const footprints = useRef<Footprint[]>([]);
  const footprintId = useRef(0);
  const prevLegPhase = useRef(0);
  
  const { 
    characterPosition, 
    setCharacterPosition, 
    characterRotation, 
    setCharacterRotation,
    activePortal,
    portals,
    setActivePortal,
    setCameraLocked,
  } = useGameStore();

  const stanchionPositions = getStanchionPositions(portals);
  const ropeSegments = getRopeSegments(portals);
  const keys = useKeyboardControls();

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const now = Date.now();
    
    // Clean up old footprints
    footprints.current = footprints.current.filter(fp => now - fp.timestamp < FOOTPRINT_DURATION);

    const moveDirection = new THREE.Vector3();
    
    if (keys.forward) moveDirection.z -= 1;
    if (keys.backward) moveDirection.z += 1;
    if (keys.left) moveDirection.x -= 1;
    if (keys.right) moveDirection.x += 1;

    const isMoving = moveDirection.length() > 0;
    
    // Smooth speed transition
    const targetSpeed = isMoving ? 1 : 0;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, delta * 8);

    if (isMoving) {
      moveDirection.normalize();
      targetRotation.current = Math.atan2(moveDirection.x, moveDirection.z);
      
      // Smooth rotation
      let rotDiff = targetRotation.current - characterRotation;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      setCharacterRotation(characterRotation + rotDiff * ROTATION_SPEED * 60 * delta);

      // Apply movement
      velocity.current.copy(moveDirection).multiplyScalar(MOVE_SPEED);
      
      let newX = characterPosition[0] + velocity.current.x;
      let newZ = characterPosition[2] + velocity.current.z;

      // Boundary collision
      newX = Math.max(-7, Math.min(7, newX));
      newZ = Math.max(-35, Math.min(6, newZ));

      // Stanchion collision (posts)
      for (const [sx, sz] of stanchionPositions) {
        const dx = newX - sx;
        const dz = newZ - sz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = CHARACTER_RADIUS + STANCHION_RADIUS;
        
        if (dist < minDist && dist > 0) {
          // Push character away from stanchion
          const pushX = (dx / dist) * minDist;
          const pushZ = (dz / dist) * minDist;
          newX = sx + pushX;
          newZ = sz + pushZ;
        }
      }

      // Rope collision (line segments - can be jumped over later)
      for (const [ax, az, bx, bz] of ropeSegments) {
        const [closestX, closestZ] = closestPointOnSegment(ax, az, bx, bz, newX, newZ);
        const dx = newX - closestX;
        const dz = newZ - closestZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = CHARACTER_RADIUS + ROPE_COLLISION_RADIUS;
        
        if (dist < minDist && dist > 0) {
          // Push character away from rope
          const pushX = (dx / dist) * minDist;
          const pushZ = (dz / dist) * minDist;
          newX = closestX + pushX;
          newZ = closestZ + pushZ;
        }
      }

      const newPos: [number, number, number] = [newX, characterPosition[1], newZ];
      setCharacterPosition(newPos);
    }

    // Check portal proximity
    const charPos = new THREE.Vector3(...characterPosition);
    let foundPortal = null;
    
    for (const portal of portals) {
      const circlePos = new THREE.Vector3(...portal.circlePosition);
      const distance = charPos.distanceTo(circlePos);
      
      if (distance < CIRCLE_RADIUS) {
        foundPortal = portal;
        break;
      }
    }

    // Update portal state
    if (foundPortal) {
      if (activePortal?.id !== foundPortal.id) {
        setActivePortal(foundPortal);
        setCameraLocked(true, foundPortal.pedestalPosition);
      }
    } else if (activePortal) {
      // Exited the circle - unlock camera
      setActivePortal(null);
      setCameraLocked(false);
    }

    // Update group position and rotation
    groupRef.current.position.set(...characterPosition);
    groupRef.current.rotation.y = characterRotation;

    // Animation
    const speed = currentSpeed.current;
    
    if (speed > 0.1) {
      // Walk animation
      walkPhase.current += delta * speed * 12;
      
      const legSwing = Math.sin(walkPhase.current) * 0.5;
      const armSwing = Math.sin(walkPhase.current) * 0.35;
      const bodyBob = Math.abs(Math.sin(walkPhase.current * 2)) * 0.03;
      
      // Detect footstep moments (when leg crosses zero)
      const currentLegPhase = Math.sin(walkPhase.current);
      if (prevLegPhase.current > 0 && currentLegPhase <= 0) {
        // Left foot step
        footprints.current.push({
          id: footprintId.current++,
          position: [...characterPosition],
          rotation: characterRotation,
          timestamp: now,
          isLeft: true,
        });
      }
      if (prevLegPhase.current < 0 && currentLegPhase >= 0) {
        // Right foot step
        footprints.current.push({
          id: footprintId.current++,
          position: [...characterPosition],
          rotation: characterRotation,
          timestamp: now,
          isLeft: false,
        });
      }
      prevLegPhase.current = currentLegPhase;
      
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;
      if (torsoRef.current) torsoRef.current.position.y = 0.55 + bodyBob;
      if (headRef.current) headRef.current.position.y = 0.95 + bodyBob;
    } else {
      // Idle breathing animation - doubled amplitude
      breathPhase.current += delta * 1.5;
      
      const breathScale = 1 + Math.sin(breathPhase.current) * 0.03;
      const armBreath = Math.sin(breathPhase.current) * 0.06;
      const headBob = Math.sin(breathPhase.current * 0.5) * 0.01;
      
      // Smoothly blend limbs back to neutral
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5);
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5);
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 5);
        leftArmRef.current.rotation.z = armBreath;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, delta * 5);
        rightArmRef.current.rotation.z = -armBreath;
      }
      if (torsoRef.current) {
        torsoRef.current.scale.y = breathScale;
        torsoRef.current.position.y = 0.55;
      }
      if (headRef.current) {
        headRef.current.position.y = 0.95 + headBob;
      }
    }
  });

  const whiteMaterial = <meshStandardMaterial color="#ffffff" roughness={0.8} />;

  return (
    <>
      <Footprints footprints={footprints.current} />
      <group ref={groupRef} position={characterPosition}>
        {/* Torso - shorter */}
        <mesh ref={torsoRef} position={[0, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.25, 8, 16]} />
          {whiteMaterial}
        </mesh>
        
        {/* Head - 2.5x bigger, connected to torso */}
        <mesh ref={headRef} position={[0, 0.95, 0]} castShadow>
          <sphereGeometry args={[0.30, 16, 16]} />
          {whiteMaterial}
        </mesh>
        
        {/* Left Arm - connected to top of torso */}
        <group ref={leftArmRef} position={[-0.22, 0.70, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.04, 0.25, 6, 12]} />
            {whiteMaterial}
          </mesh>
        </group>
        
        {/* Right Arm - connected to top of torso */}
        <group ref={rightArmRef} position={[0.22, 0.70, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.04, 0.25, 6, 12]} />
            {whiteMaterial}
          </mesh>
        </group>
        
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.08, 0.35, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.25, 6, 12]} />
            {whiteMaterial}
          </mesh>
        </group>
        
        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.08, 0.35, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.25, 6, 12]} />
            {whiteMaterial}
          </mesh>
        </group>
        
        {/* Shadow on floor */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.25, 32]} />
          <meshBasicMaterial color="#000000" opacity={0.3} transparent />
        </mesh>
      </group>
    </>
  );
}
