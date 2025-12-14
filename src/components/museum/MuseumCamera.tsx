import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const CAMERA_HEIGHT = 2.5;
const CAMERA_DISTANCE = 5;
const LERP_FACTOR = 0.05;

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
      // Lock camera to face the wall/frame
      const framePos = new THREE.Vector3(...lockedTargetPosition);
      const charPos = new THREE.Vector3(...characterPosition);
      
      // Position camera behind and above character, facing the frame
      const dirToFrame = new THREE.Vector3().subVectors(framePos, charPos).normalize();
      
      targetPosition.current.set(
        charPos.x - dirToFrame.x * 3,
        charPos.y + 2,
        charPos.z - dirToFrame.z * 3
      );
      targetLookAt.current.copy(framePos);
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

    // Smooth interpolation
    camera.position.lerp(targetPosition.current, LERP_FACTOR);
    
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.add(camera.position);
    currentLookAt.lerp(targetLookAt.current, LERP_FACTOR);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
