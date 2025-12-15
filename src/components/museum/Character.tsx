import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from './useKeyboardControls';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const MOVE_SPEED = 0.08;
const SPRINT_MULTIPLIER = 1.8;
const ROTATION_SPEED = 0.05;
const CIRCLE_RADIUS = 1.5;
const CHARACTER_RADIUS = 0.3;
const STANCHION_RADIUS = 0.25;
const ROPE_COLLISION_RADIUS = 0.2;
const FOOTPRINT_DURATION = 2000;
const JUMP_HEIGHT = 0.5;
const JUMP_DURATION = 0.4;

interface Footprint {
  id: number;
  position: [number, number, number];
  rotation: number;
  timestamp: number;
  isLeft: boolean;
}

import { hallwayStanchionPositions, hallwayRopeSegments } from './HallwayStanchions';

// Get all stanchion collision positions
function getStanchionPositions(portals: { pedestalPosition: [number, number, number] }[]) {
  const positions: [number, number][] = [];
  
  // Main gallery perimeter - removed center back stanchion for doorway
  const perimeter: [number, number][] = [
    [-8, 5], [-8, -2], [-8, -9], [-8, -16], [-8, -23], [-8, -30],
    [8, 5], [8, -2], [8, -9], [8, -16], [8, -23], [8, -30],
    [-5, -35], [5, -35], // No center stanchion - doorway
  ];
  positions.push(...perimeter);
  
  // Hallway stanchions
  positions.push(...hallwayStanchionPositions);
  
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

function getRopeSegments(portals: { pedestalPosition: [number, number, number] }[]) {
  const segments: [number, number, number, number][] = [];
  
  // Main gallery perimeter ropes - no center back rope (doorway)
  const perimeterRopes: [number, number, number, number][] = [
    [-8, 5, -8, -2], [-8, -2, -8, -9], [-8, -9, -8, -16], 
    [-8, -16, -8, -23], [-8, -23, -8, -30],
    [8, 5, 8, -2], [8, -2, 8, -9], [8, -9, 8, -16], 
    [8, -16, 8, -23], [8, -23, 8, -30],
    // Removed center back ropes for doorway
    [-8, -30, -5, -35], [8, -30, 5, -35],
  ];
  segments.push(...perimeterRopes);
  
  // Hallway ropes
  segments.push(...hallwayRopeSegments);
  
  const offset = 1.8;
  for (const portal of portals) {
    const [px, , pz] = portal.pedestalPosition;
    segments.push(
      [px - offset, pz - offset, px + offset, pz - offset],
      [px + offset, pz - offset, px + offset, pz + offset],
      [px + offset, pz + offset, px - offset, pz + offset],
      [px - offset, pz + offset, px - offset, pz - offset],
    );
  }
  
  return segments;
}

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

// Footprints component - renders both left and right footprints
function Footprints({ footprints }: { footprints: Footprint[] }) {
  const now = Date.now();
  
  return (
    <group>
      {footprints.map((fp) => {
        const age = now - fp.timestamp;
        const opacity = Math.max(0, 0.5 * (1 - age / FOOTPRINT_DURATION));
        // Offset perpendicular to movement direction for left/right foot
        const sideOffset = fp.isLeft ? -0.12 : 0.12;
        
        return (
          <mesh
            key={fp.id}
            position={[
              fp.position[0] + Math.cos(fp.rotation) * sideOffset,
              0.01,
              fp.position[2] - Math.sin(fp.rotation) * sideOffset
            ]}
            rotation={[-Math.PI / 2, 0, fp.rotation]}
            scale={[0.5, 1, 1]}
          >
            {/* Scaled circle for oval footprint shape */}
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
  
  // Jump state
  const isJumping = useRef(false);
  const jumpTime = useRef(0);
  const jumpStartY = useRef(0);
  
  // Footprint tracking
  const footprints = useRef<Footprint[]>([]);
  const footprintId = useRef(0);
  const lastFootprintTime = useRef(0);
  const lastFootWasLeft = useRef(false);
  
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

    // Handle jump initiation
    if (keys.jump && !isJumping.current) {
      isJumping.current = true;
      jumpTime.current = 0;
      jumpStartY.current = characterPosition[1];
    }

    // Update jump
    let currentY = characterPosition[1];
    if (isJumping.current) {
      jumpTime.current += delta;
      const jumpProgress = jumpTime.current / JUMP_DURATION;
      
      if (jumpProgress >= 1) {
        isJumping.current = false;
        currentY = jumpStartY.current;
      } else {
        // Parabolic jump arc
        currentY = jumpStartY.current + JUMP_HEIGHT * Math.sin(jumpProgress * Math.PI);
      }
    }

    const moveDirection = new THREE.Vector3();
    
    if (keys.forward) moveDirection.z -= 1;
    if (keys.backward) moveDirection.z += 1;
    if (keys.left) moveDirection.x -= 1;
    if (keys.right) moveDirection.x += 1;

    const isMoving = moveDirection.length() > 0;
    const isSprinting = keys.sprint && isMoving;
    
    // Speed calculation with sprint
    const baseSpeed = isSprinting ? MOVE_SPEED * SPRINT_MULTIPLIER : MOVE_SPEED;
    
    // Immediate stop when keys released (fix for glitchy movement)
    const targetSpeed = isMoving ? 1 : 0;
    const lerpFactor = isMoving ? delta * 10 : delta * 20; // Faster deceleration
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, lerpFactor);
    
    // Force stop if very slow
    if (currentSpeed.current < 0.01) {
      currentSpeed.current = 0;
    }

    if (isMoving) {
      moveDirection.normalize();
      targetRotation.current = Math.atan2(moveDirection.x, moveDirection.z);
      
      // Smooth rotation
      let rotDiff = targetRotation.current - characterRotation;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      setCharacterRotation(characterRotation + rotDiff * ROTATION_SPEED * 60 * delta);

      // Apply movement with sprint
      velocity.current.copy(moveDirection).multiplyScalar(baseSpeed * currentSpeed.current);
      
      let newX = characterPosition[0] + velocity.current.x;
      let newZ = characterPosition[2] + velocity.current.z;

      // Boundary collision - extended for picture hall
      // Main gallery: X -7 to 7, Z -35 to 6
      // Picture hall: X -5.5 to 5.5, Z -65 to -40
      if (newZ > -40) {
        // In main gallery
        newX = Math.max(-7, Math.min(7, newX));
        newZ = Math.max(-35, Math.min(6, newZ));
      } else {
        // In hallway/picture hall
        newX = Math.max(-5.5, Math.min(5.5, newX));
        newZ = Math.max(-64, Math.min(-40, newZ));
      }

      // Stanchion collision
      for (const [sx, sz] of stanchionPositions) {
        const dx = newX - sx;
        const dz = newZ - sz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = CHARACTER_RADIUS + STANCHION_RADIUS;
        
        if (dist < minDist && dist > 0) {
          const pushX = (dx / dist) * minDist;
          const pushZ = (dz / dist) * minDist;
          newX = sx + pushX;
          newZ = sz + pushZ;
        }
      }

      // Rope collision (skip if jumping over)
      if (!isJumping.current || currentY < 0.3) {
        for (const [ax, az, bx, bz] of ropeSegments) {
          const [closestX, closestZ] = closestPointOnSegment(ax, az, bx, bz, newX, newZ);
          const dx = newX - closestX;
          const dz = newZ - closestZ;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const minDist = CHARACTER_RADIUS + ROPE_COLLISION_RADIUS;
          
          if (dist < minDist && dist > 0) {
            const pushX = (dx / dist) * minDist;
            const pushZ = (dz / dist) * minDist;
            newX = closestX + pushX;
            newZ = closestZ + pushZ;
          }
        }
      }

      const newPos: [number, number, number] = [newX, currentY, newZ];
      setCharacterPosition(newPos);
      
      // Add footprints while walking (per-foot, alternating)
      const footprintInterval = isSprinting ? 120 : 200; // Faster footprints when sprinting
      if (now - lastFootprintTime.current > footprintInterval) {
        footprints.current.push({
          id: footprintId.current++,
          position: [newX, 0, newZ],
          rotation: characterRotation,
          timestamp: now,
          isLeft: !lastFootWasLeft.current,
        });
        lastFootWasLeft.current = !lastFootWasLeft.current;
        lastFootprintTime.current = now;
      }
    } else {
      // Update Y position even when not moving (for jump landing)
      if (currentY !== characterPosition[1]) {
        setCharacterPosition([characterPosition[0], currentY, characterPosition[2]]);
      }
    }

    // Check portal proximity
    const charPos = new THREE.Vector3(characterPosition[0], 0, characterPosition[2]);
    let foundPortal = null;
    
    for (const portal of portals) {
      const circlePos = new THREE.Vector3(portal.circlePosition[0], 0, portal.circlePosition[2]);
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
      setActivePortal(null);
      setCameraLocked(false);
    }

    // Update group position and rotation
    groupRef.current.position.set(characterPosition[0], currentY, characterPosition[2]);
    groupRef.current.rotation.y = characterRotation;

    // Animation
    const speed = currentSpeed.current;
    const animSpeed = isSprinting ? 18 : 12; // Faster animation when sprinting
    
    // Jump animation - arms swing up
    const jumpArmOffset = isJumping.current 
      ? -Math.sin((jumpTime.current / JUMP_DURATION) * Math.PI) * 1.5 
      : 0;
    
    if (speed > 0.05) {
      // Walk/run animation
      walkPhase.current += delta * speed * animSpeed;
      
      const legSwing = Math.sin(walkPhase.current) * (isSprinting ? 0.7 : 0.5);
      const armSwing = Math.sin(walkPhase.current) * (isSprinting ? 0.5 : 0.35);
      const bodyBob = Math.abs(Math.sin(walkPhase.current * 2)) * (isSprinting ? 0.05 : 0.03);
      
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing + jumpArmOffset;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing + jumpArmOffset;
      if (torsoRef.current) torsoRef.current.position.y = 0.55 + bodyBob;
      if (headRef.current) headRef.current.position.y = 0.95 + bodyBob;
    } else {
      // Idle breathing animation
      breathPhase.current += delta * 1.5;
      
      const breathScale = 1 + Math.sin(breathPhase.current) * 0.03;
      const armBreath = Math.sin(breathPhase.current) * 0.06;
      const headBob = Math.sin(breathPhase.current * 0.5) * 0.01;
      
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 8);
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 8);
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, jumpArmOffset, delta * 8);
        leftArmRef.current.rotation.z = armBreath;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, jumpArmOffset, delta * 8);
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
        {/* Torso */}
        <mesh ref={torsoRef} position={[0, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.25, 8, 16]} />
          {whiteMaterial}
        </mesh>
        
        {/* Head */}
        <mesh ref={headRef} position={[0, 0.95, 0]} castShadow>
          <sphereGeometry args={[0.30, 16, 16]} />
          {whiteMaterial}
        </mesh>
        
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.22, 0.70, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.04, 0.25, 6, 12]} />
            {whiteMaterial}
          </mesh>
        </group>
        
        {/* Right Arm */}
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
