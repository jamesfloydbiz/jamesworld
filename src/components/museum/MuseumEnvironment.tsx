import { useGameStore } from '@/store/gameStore';
import { MuseumFrame } from './MuseumFrame';
import { FloorCircle } from './FloorCircle';

export function MuseumEnvironment() {
  const { portals } = useGameStore();

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -12]} receiveShadow>
        <planeGeometry args={[14, 40]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7, 3, -12]} receiveShadow>
        <boxGeometry args={[0.2, 6, 40]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Right wall */}
      <mesh position={[7, 3, -12]} receiveShadow>
        <boxGeometry args={[0.2, 6, 40]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 3, -32]} receiveShadow>
        <boxGeometry args={[14.4, 6, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Front partial walls */}
      <mesh position={[-5, 3, 5]} receiveShadow>
        <boxGeometry args={[4, 6, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>
      <mesh position={[5, 3, 5]} receiveShadow>
        <boxGeometry args={[4, 6, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, -12]}>
        <planeGeometry args={[14, 40]} />
        <meshStandardMaterial color="#030303" roughness={1} />
      </mesh>

      {/* Left rail */}
      <mesh position={[-6.5, 0.3, -12]}>
        <boxGeometry args={[0.05, 0.6, 38]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Right rail */}
      <mesh position={[6.5, 0.3, -12]}>
        <boxGeometry args={[0.05, 0.6, 38]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Frames and floor circles */}
      {portals.map((portal) => {
        const facing = portal.framePosition[0] < 0 ? 'right' : 
                       portal.framePosition[0] > 0 ? 'left' : 'front';
        
        return (
          <group key={portal.id}>
            <MuseumFrame 
              position={portal.framePosition} 
              title={portal.title}
              facing={portal.id === 'blueprints' ? 'front' : facing}
            />
            <FloorCircle 
              position={portal.circlePosition} 
              portalId={portal.id} 
            />
          </group>
        );
      })}
    </group>
  );
}
