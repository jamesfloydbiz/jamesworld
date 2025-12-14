import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from './useKeyboardControls';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const MOVE_SPEED = 0.08;
const ROTATION_SPEED = 0.05;
const CIRCLE_RADIUS = 1.5;

export function Character() {
  const meshRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(0);
  
  const { 
    characterPosition, 
    setCharacterPosition, 
    characterRotation, 
    setCharacterRotation,
    cameraLocked,
    activePortal,
    portals,
    setActivePortal,
    setCameraLocked,
  } = useGameStore();

  const keys = useKeyboardControls();

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const moveDirection = new THREE.Vector3();
    
    if (keys.forward) moveDirection.z -= 1;
    if (keys.backward) moveDirection.z += 1;
    if (keys.left) moveDirection.x -= 1;
    if (keys.right) moveDirection.x += 1;

    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      targetRotation.current = Math.atan2(moveDirection.x, moveDirection.z);
      
      // Smooth rotation
      let rotDiff = targetRotation.current - characterRotation;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      setCharacterRotation(characterRotation + rotDiff * ROTATION_SPEED * 60 * delta);

      // Apply movement
      velocity.current.copy(moveDirection).multiplyScalar(MOVE_SPEED);
      
      const newPos: [number, number, number] = [
        characterPosition[0] + velocity.current.x,
        characterPosition[1],
        characterPosition[2] + velocity.current.z,
      ];

      // Boundary collision - updated for larger room
      newPos[0] = Math.max(-7, Math.min(7, newPos[0]));
      newPos[2] = Math.max(-35, Math.min(6, newPos[2]));

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

    meshRef.current.position.set(...characterPosition);
    meshRef.current.rotation.y = characterRotation;
  });

  return (
    <group ref={meshRef} position={characterPosition}>
      {/* Abstract humanoid silhouette */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Shadow on floor */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}
