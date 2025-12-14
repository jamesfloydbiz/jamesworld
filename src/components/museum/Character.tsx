import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from './useKeyboardControls';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const MOVE_SPEED = 0.08;
const ROTATION_SPEED = 0.05;

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

  // Check portal collisions
  useEffect(() => {
    const checkPortalProximity = () => {
      if (cameraLocked) return;

      const charPos = new THREE.Vector3(...characterPosition);
      
      for (const portal of portals) {
        const circlePos = new THREE.Vector3(...portal.circlePosition);
        const distance = charPos.distanceTo(circlePos);
        
        if (distance < 1.5) {
          if (activePortal?.id !== portal.id) {
            setActivePortal(portal);
            setCameraLocked(true, portal.framePosition);
          }
          return;
        }
      }
      
      if (activePortal) {
        setActivePortal(null);
        setCameraLocked(false);
      }
    };

    checkPortalProximity();
  }, [characterPosition, portals, activePortal, cameraLocked, setActivePortal, setCameraLocked]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Don't allow movement when camera is locked
    if (cameraLocked) {
      meshRef.current.position.set(...characterPosition);
      return;
    }

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

      // Simple boundary collision
      newPos[0] = Math.max(-5.5, Math.min(5.5, newPos[0]));
      newPos[2] = Math.max(-29, Math.min(4, newPos[2]));

      setCharacterPosition(newPos);
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
