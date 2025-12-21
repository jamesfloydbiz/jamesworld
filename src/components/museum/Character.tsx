import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, joystickState } from './useKeyboardControls';
import { useGameStore } from '@/store/gameStore';
import { characterState } from './characterState';
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
const COLLISION_CHECK_RADIUS = 5; // Only check collisions within this radius

interface Footprint {
  id: number;
  position: [number, number, number];
  rotation: number;
  timestamp: number;
  isLeft: boolean;
}

import { hallwayStanchionPositions, hallwayRopeSegments } from './HallwayStanchions';

function getStanchionPositions(portals: { pedestalPosition: [number, number, number] }[]) {
  const positions: [number, number][] = [];
  
  const perimeter: [number, number][] = [
    [-8, 5], [-8, -2], [-8, -9], [-8, -16], [-8, -23], [-8, -30],
    [8, 5], [8, -2], [8, -9], [8, -16], [8, -23], [8, -30],
    [-1.2, -40], [1.2, -40],  // At doorway edges
  ];
  positions.push(...perimeter);
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
  
  const perimeterRopes: [number, number, number, number][] = [
    [-8, 5, -8, -2], [-8, -2, -8, -9], [-8, -9, -8, -16], 
    [-8, -16, -8, -23], [-8, -23, -8, -30],
    [8, 5, 8, -2], [8, -2, 8, -9], [8, -9, 8, -16], 
    [8, -16, 8, -23], [8, -23, 8, -30],
    [-8, -30, -1.2, -40], [8, -30, 1.2, -40],  // Connect to doorway edges
  ];
  segments.push(...perimeterRopes);
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

// Footprints component - disabled on mobile
function Footprints({ footprints }: { footprints: Footprint[] }) {
  const now = Date.now();
  
  return (
    <group>
      {footprints.map((fp) => {
        const age = now - fp.timestamp;
        const opacity = Math.max(0, 0.5 * (1 - age / FOOTPRINT_DURATION));
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
            <circleGeometry args={[0.1, 16]} />
            <meshBasicMaterial color="#ffffff" opacity={opacity} transparent />
          </mesh>
        );
      })}
    </group>
  );
}

interface CharacterProps {
  isMobile?: boolean;
}

export function Character({ isMobile = false }: CharacterProps) {
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
  
  const isJumping = useRef(false);
  const jumpTime = useRef(0);
  const jumpStartY = useRef(0);
  
  // Footprints disabled on mobile
  const footprints = useRef<Footprint[]>([]);
  const footprintId = useRef(0);
  const lastFootprintTime = useRef(0);
  const lastFootWasLeft = useRef(false);
  
  // Throttle store updates
  const lastStoreUpdate = useRef(0);
  const localPosition = useRef<[number, number, number]>([0, 0, 0]);
  const localRotation = useRef(0);
  
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

  // Initialize local refs from store
  if (localPosition.current[0] === 0 && localPosition.current[2] === 0) {
    localPosition.current = [...characterPosition];
    localRotation.current = characterRotation;
  }

  const stanchionPositions = useMemo(() => getStanchionPositions(portals), [portals]);
  const ropeSegments = useMemo(() => getRopeSegments(portals), [portals]);
  const keys = useKeyboardControls();

  // Memoize material - subtle warm tint, smoother finish
  const whiteMaterial = useMemo(() => (
    <meshStandardMaterial color="#faf8f5" roughness={0.6} />
  ), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const now = Date.now();
    
    // Clean up old footprints (skip on mobile)
    if (!isMobile) {
      footprints.current = footprints.current.filter(fp => now - fp.timestamp < FOOTPRINT_DURATION);
    }

    // Handle jump
    if ((keys.jump || joystickState.jump) && !isJumping.current) {
      isJumping.current = true;
      jumpTime.current = 0;
      jumpStartY.current = localPosition.current[1];
    }

    let currentY = localPosition.current[1];
    if (isJumping.current) {
      jumpTime.current += delta;
      const jumpProgress = jumpTime.current / JUMP_DURATION;
      
      if (jumpProgress >= 1) {
        isJumping.current = false;
        currentY = jumpStartY.current;
      } else {
        currentY = jumpStartY.current + JUMP_HEIGHT * Math.sin(jumpProgress * Math.PI);
      }
    }

    const moveDirection = new THREE.Vector3();
    
    if (keys.forward) moveDirection.z -= 1;
    if (keys.backward) moveDirection.z += 1;
    if (keys.left) moveDirection.x -= 1;
    if (keys.right) moveDirection.x += 1;
    
    if (joystickState.active) {
      moveDirection.x += joystickState.x;
      moveDirection.z += joystickState.y;
    }

    const isMoving = moveDirection.length() > 0.1;
    const isSprinting = (keys.sprint || joystickState.sprint) && isMoving;
    const baseSpeed = isSprinting ? MOVE_SPEED * SPRINT_MULTIPLIER : MOVE_SPEED;
    
    const targetSpeed = isMoving ? 1 : 0;
    const lerpFactor = isMoving ? delta * 10 : delta * 20;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, lerpFactor);
    
    if (currentSpeed.current < 0.01) {
      currentSpeed.current = 0;
    }

    if (isMoving) {
      moveDirection.normalize();
      targetRotation.current = Math.atan2(moveDirection.x, moveDirection.z);
      
      let rotDiff = targetRotation.current - localRotation.current;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      localRotation.current += rotDiff * ROTATION_SPEED * 60 * delta;

      velocity.current.copy(moveDirection).multiplyScalar(baseSpeed * currentSpeed.current);
      
      let newX = localPosition.current[0] + velocity.current.x;
      let newZ = localPosition.current[2] + velocity.current.z;

      // Boundary collision
      const inDoorwayX = newX > -1.8 && newX < 1.8;
      
      if (newZ > -35) {
        newX = Math.max(-7, Math.min(7, newX));
        newZ = Math.min(6, newZ);
      } else if (newZ > -40) {
        if (inDoorwayX) {
          newX = Math.max(-1.8, Math.min(1.8, newX));
        } else {
          newZ = Math.max(-35, newZ);
          newX = Math.max(-7, Math.min(7, newX));
        }
      } else {
        newX = Math.max(-5.5, Math.min(5.5, newX));
        newZ = Math.max(-64, newZ);
      }

      // Optimized collision: only check nearby stanchions
      const charX = localPosition.current[0];
      const charZ = localPosition.current[2];
      
      for (const [sx, sz] of stanchionPositions) {
        // Skip distant stanchions
        const dxCheck = charX - sx;
        const dzCheck = charZ - sz;
        if (dxCheck * dxCheck + dzCheck * dzCheck > COLLISION_CHECK_RADIUS * COLLISION_CHECK_RADIUS) continue;
        
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
          // Quick bounding check
          const minX = Math.min(ax, bx) - COLLISION_CHECK_RADIUS;
          const maxX = Math.max(ax, bx) + COLLISION_CHECK_RADIUS;
          const minZ = Math.min(az, bz) - COLLISION_CHECK_RADIUS;
          const maxZ = Math.max(az, bz) + COLLISION_CHECK_RADIUS;
          
          if (charX < minX || charX > maxX || charZ < minZ || charZ > maxZ) continue;
          
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

      localPosition.current = [newX, currentY, newZ];
      // Update shared state for smooth camera following
      characterState.position = localPosition.current;
      characterState.rotation = localRotation.current;
      
      // Footprints (skip on mobile)
      if (!isMobile) {
        const footprintInterval = isSprinting ? 120 : 200;
        if (now - lastFootprintTime.current > footprintInterval) {
          footprints.current.push({
            id: footprintId.current++,
            position: [newX, 0, newZ],
            rotation: localRotation.current,
            timestamp: now,
            isLeft: !lastFootWasLeft.current,
          });
          lastFootWasLeft.current = !lastFootWasLeft.current;
          lastFootprintTime.current = now;
        }
      }
    } else {
      localPosition.current[1] = currentY;
      // Update shared state even when not moving (for jump)
      characterState.position = localPosition.current;
    }

    // Throttle store updates (every 50ms instead of every frame)
    if (now - lastStoreUpdate.current > 50) {
      setCharacterPosition(localPosition.current);
      setCharacterRotation(localRotation.current);
      lastStoreUpdate.current = now;
    }

    // Check portal proximity
    const charPos = new THREE.Vector3(localPosition.current[0], 0, localPosition.current[2]);
    let foundPortal = null;
    
    for (const portal of portals) {
      const circlePos = new THREE.Vector3(portal.circlePosition[0], 0, portal.circlePosition[2]);
      const distance = charPos.distanceTo(circlePos);
      
      if (distance < CIRCLE_RADIUS) {
        foundPortal = portal;
        break;
      }
    }

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
    groupRef.current.position.set(localPosition.current[0], currentY, localPosition.current[2]);
    groupRef.current.rotation.y = localRotation.current;

    // Animation
    const speed = currentSpeed.current;
    const animSpeed = isSprinting ? 18 : 12;
    
    const jumpArmOffset = isJumping.current 
      ? -Math.sin((jumpTime.current / JUMP_DURATION) * Math.PI) * 1.5 
      : 0;
    
    if (speed > 0.05) {
      walkPhase.current += delta * speed * animSpeed;
      
      const legSwing = Math.sin(walkPhase.current) * (isSprinting ? 0.7 : 0.5);
      const armSwing = Math.sin(walkPhase.current) * (isSprinting ? 0.5 : 0.35);
      const bodyBob = Math.abs(Math.sin(walkPhase.current * 2)) * (isSprinting ? 0.05 : 0.03);
      
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing + jumpArmOffset;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing + jumpArmOffset;
      if (torsoRef.current) torsoRef.current.position.y = 0.53 + bodyBob;
      if (headRef.current) headRef.current.position.y = 0.95 + bodyBob;
    } else {
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
        torsoRef.current.position.y = 0.53;
      }
      if (headRef.current) {
        headRef.current.position.y = 0.95 + headBob;
      }
    }
  });

  return (
    <>
      {!isMobile && <Footprints footprints={footprints.current} />}
      <group ref={groupRef} position={characterPosition}>
        {/* Torso */}
        <mesh ref={torsoRef} position={[0, 0.53, 0]} castShadow={!isMobile}>
          <capsuleGeometry args={[0.15, 0.20, 8, 16]} />
          {whiteMaterial}
        </mesh>
        
        {/* Head */}
        <mesh ref={headRef} position={[0, 0.95, 0]} castShadow={!isMobile}>
          <sphereGeometry args={[0.30, 16, 16]} />
          {whiteMaterial}
        </mesh>
        
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.22, 0.70, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow={!isMobile}>
            <capsuleGeometry args={[0.04, 0.25, 6, 12]} />
            {whiteMaterial}
          </mesh>
        </group>
        
        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.22, 0.70, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow={!isMobile}>
            <capsuleGeometry args={[0.04, 0.25, 6, 12]} />
            {whiteMaterial}
          </mesh>
        </group>
        
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.08, 0.35, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow={!isMobile}>
            <capsuleGeometry args={[0.05, 0.25, 6, 12]} />
            {whiteMaterial}
          </mesh>
        </group>
        
        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.08, 0.35, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow={!isMobile}>
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
