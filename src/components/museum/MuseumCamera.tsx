import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const CAMERA_HEIGHT = 3.2;
const CAMERA_DISTANCE = 6.5;

// Cinematic easing - slower, more dramatic
const LERP_NORMAL = 0.025;
const LERP_LOCKED = 0.035;

// Smooth easing function for cinematic feel
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function MuseumCamera() {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const transitionProgress = useRef(0);
  const wasLocked = useRef(false);
  
  const { 
    characterPosition, 
    cameraLocked, 
    lockedTargetPosition 
  } = useGameStore();

  useFrame((_, delta) => {
    // Track transition state changes
    if (cameraLocked !== wasLocked.current) {
      transitionProgress.current = 0;
      wasLocked.current = cameraLocked;
    }
    
    // Animate transition progress with easing
    if (transitionProgress.current < 1) {
      transitionProgress.current = Math.min(1, transitionProgress.current + delta * 0.8);
    }
    
    const easedProgress = easeOutCubic(transitionProgress.current);
    const lerpFactor = cameraLocked ? LERP_LOCKED : LERP_NORMAL;
    
    if (cameraLocked && lockedTargetPosition) {
      // Lock camera to face the pedestal - cinematic approach
      const pedestalPos = new THREE.Vector3(...lockedTargetPosition);
      const charPos = new THREE.Vector3(...characterPosition);
      
      // Position camera behind and above character, facing the pedestal
      const dirToPedestal = new THREE.Vector3().subVectors(pedestalPos, charPos).normalize();
      
      targetPosition.current.set(
        charPos.x - dirToPedestal.x * 4.5,
        charPos.y + 2.8,
        charPos.z - dirToPedestal.z * 4.5
      );
      targetLookAt.current.set(pedestalPos.x, pedestalPos.y + 1.2, pedestalPos.z);
    } else {
      // Normal third-person follow with cinematic smoothness
      targetPosition.current.set(
        characterPosition[0],
        characterPosition[1] + CAMERA_HEIGHT,
        characterPosition[2] + CAMERA_DISTANCE
      );
      targetLookAt.current.set(
        characterPosition[0],
        characterPosition[1] + 0.6,
        characterPosition[2]
      );
    }

    // Smooth interpolation with easing
    const smoothFactor = lerpFactor * (0.5 + easedProgress * 0.5);
    camera.position.lerp(targetPosition.current, smoothFactor);
    
    // Smooth look-at transition
    currentLookAt.current.lerp(targetLookAt.current, smoothFactor);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
