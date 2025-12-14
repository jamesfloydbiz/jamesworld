import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const CAMERA_HEIGHT = 3;
const CAMERA_DISTANCE = 6;
const LERP_FACTOR = 0.04;

export function MuseumCamera() {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  
  const { 
    characterPosition, 
    cameraLocked, 
    lockedTargetPosition 
  } = useGameStore();

  useFrame(() => {
    if (cameraLocked && lockedTargetPosition) {
      // Lock camera to face the pedestal
      const pedestalPos = new THREE.Vector3(...lockedTargetPosition);
      const charPos = new THREE.Vector3(...characterPosition);
      
      // Position camera behind and above character, facing the pedestal
      const dirToPedestal = new THREE.Vector3().subVectors(pedestalPos, charPos).normalize();
      
      targetPosition.current.set(
        charPos.x - dirToPedestal.x * 4,
        charPos.y + 2.5,
        charPos.z - dirToPedestal.z * 4
      );
      targetLookAt.current.set(pedestalPos.x, pedestalPos.y + 1, pedestalPos.z);
    } else {
      // Normal third-person follow
      targetPosition.current.set(
        characterPosition[0],
        characterPosition[1] + CAMERA_HEIGHT,
        characterPosition[2] + CAMERA_DISTANCE
      );
      targetLookAt.current.set(
        characterPosition[0],
        characterPosition[1] + 0.5,
        characterPosition[2]
      );
    }

    // Smooth interpolation - works for both locking and unlocking
    camera.position.lerp(targetPosition.current, LERP_FACTOR);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
