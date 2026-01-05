import { useGameStore } from '@/store/gameStore';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function PictureHall() {
  const { characterPosition } = useGameStore();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const ringRefs = useRef<THREE.Mesh[]>([]);
  
  // Check if character is near the floor circle
  const isNearCircle = 
    Math.abs(characterPosition[0]) < 2 && 
    characterPosition[2] < -42 && 
    characterPosition[2] > -46;
  
  // Animate rings when near
  useFrame((_, delta) => {
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        const targetScale = isNearCircle ? 1 + Math.sin(Date.now() * 0.003 + i * 0.5) * 0.1 : 1;
        ring.scale.x = THREE.MathUtils.lerp(ring.scale.x, targetScale, delta * 5);
        ring.scale.z = THREE.MathUtils.lerp(ring.scale.z, targetScale, delta * 5);
      }
    });
  });
  
  // Navigate to 2D pictures page when stepping on the circle
  useEffect(() => {
    if (isNearCircle && characterPosition[2] < -43 && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/pictures');
    }
  }, [characterPosition, navigate, isNearCircle]);
  
  return (
    <group>
      {/* Hall floor - pure black, no lighting */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -52.5]}>
        <planeGeometry args={[12, 25]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Floor circle trigger - positioned at entrance */}
      <group position={[0, 0.02, -44]}>
        {/* Outer ring */}
        <mesh 
          ref={(el) => { if (el) ringRefs.current[0] = el; }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[1.8, 2, 32]} />
          <meshBasicMaterial 
            color={isNearCircle ? "#ffffff" : "#333333"} 
            transparent 
            opacity={isNearCircle ? 0.6 : 0.3} 
          />
        </mesh>
        
        {/* Middle ring */}
        <mesh 
          ref={(el) => { if (el) ringRefs.current[1] = el; }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial 
            color={isNearCircle ? "#ffffff" : "#444444"} 
            transparent 
            opacity={isNearCircle ? 0.5 : 0.25} 
          />
        </mesh>
        
        {/* Inner ring */}
        <mesh 
          ref={(el) => { if (el) ringRefs.current[2] = el; }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial 
            color={isNearCircle ? "#ffffff" : "#555555"} 
            transparent 
            opacity={isNearCircle ? 0.4 : 0.2} 
          />
        </mesh>
        
        {/* Center dot */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 16]} />
          <meshBasicMaterial 
            color={isNearCircle ? "#ffffff" : "#666666"} 
            transparent 
            opacity={isNearCircle ? 0.8 : 0.4} 
          />
        </mesh>
      </group>
      
      {/* Left wall - pure black */}
      <mesh position={[-6, 4, -52.5]}>
        <boxGeometry args={[0.2, 8, 25]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Right wall - pure black */}
      <mesh position={[6, 4, -52.5]}>
        <boxGeometry args={[0.2, 8, 25]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Back wall - pure black */}
      <mesh position={[0, 4, -65]}>
        <boxGeometry args={[12.4, 8, 0.2]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Ceiling - pure black */}
      <mesh position={[0, 8, -52.5]}>
        <boxGeometry args={[12, 0.2, 25]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* No lighting - pure void */}
    </group>
  );
}
