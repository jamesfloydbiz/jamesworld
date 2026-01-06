import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import { characterState } from './characterState';
import * as THREE from 'three';

const CAMERA_HEIGHT = 1.2;
const CAMERA_DISTANCE = 3.5;
const LERP_FACTOR = 0.04;

export function MuseumCamera() {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  
  const { 
    cameraLocked, 
    lockedTargetPosition 
  } = useGameStore();

  useFrame(() => {
    // Read from shared state for smooth updates (not throttled)
    const charPos = characterState.position;
    
    if (cameraLocked && lockedTargetPosition) {
      // Lock camera to face the pedestal
      const pedestalPos = new THREE.Vector3(...lockedTargetPosition);
      const charPosVec = new THREE.Vector3(...charPos);
      
      // Position camera behind and above character, facing the pedestal
      const dirToPedestal = new THREE.Vector3().subVectors(pedestalPos, charPosVec).normalize();
      
      targetPosition.current.set(
        charPosVec.x - dirToPedestal.x * 4,
        charPosVec.y + 2.5,
        charPosVec.z - dirToPedestal.z * 4
      );
      targetLookAt.current.set(pedestalPos.x, pedestalPos.y + 1, pedestalPos.z);
    } else {
      // Normal third-person follow
      targetPosition.current.set(
        charPos[0],
        charPos[1] + CAMERA_HEIGHT,
        charPos[2] + CAMERA_DISTANCE
      );
      targetLookAt.current.set(
        charPos[0],
        charPos[1] + 0.3,
        charPos[2]
      );
    }

    // Smooth interpolation - works for both locking and unlocking
    camera.position.lerp(targetPosition.current, LERP_FACTOR);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
