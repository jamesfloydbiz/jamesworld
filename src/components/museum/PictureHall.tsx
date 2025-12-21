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
      {/* Hall floor - all black */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -52.5]} receiveShadow>
        <planeGeometry args={[12, 25]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
      </mesh>
      
      {/* Left wall - black */}
      <mesh position={[-6, 4, -52.5]} receiveShadow>
        <boxGeometry args={[0.2, 8, 25]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
      </mesh>
      
      {/* Right wall - black */}
      <mesh position={[6, 4, -52.5]} receiveShadow>
        <boxGeometry args={[0.2, 8, 25]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
      </mesh>
      
      {/* Back wall - black */}
      <mesh position={[0, 4, -65]} receiveShadow>
        <boxGeometry args={[12.4, 8, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
      </mesh>
      
      {/* Ceiling - black */}
      <mesh position={[0, 8, -52.5]}>
        <boxGeometry args={[12, 0.2, 25]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>
      
      {/* Subtle lighting to see the space */}
      <pointLight position={[0, 6, -50]} intensity={0.2} color="#ffffff" distance={25} />
      <pointLight position={[0, 6, -60]} intensity={0.15} color="#ffffff" distance={25} />
    </group>
  );
}
