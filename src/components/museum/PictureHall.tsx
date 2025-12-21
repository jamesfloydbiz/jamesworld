import { useGameStore } from '@/store/gameStore';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function PictureHall() {
  const { characterPosition } = useGameStore();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  
  // Navigate to 2D pictures page when entering deep into the hall
  useEffect(() => {
    if (characterPosition[2] < -50 && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/pictures');
    }
  }, [characterPosition, navigate]);
  
  return (
    <group>
      {/* Hall floor - pure black, no lighting */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -52.5]}>
        <planeGeometry args={[12, 25]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
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
