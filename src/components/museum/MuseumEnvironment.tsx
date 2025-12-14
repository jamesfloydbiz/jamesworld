import { useGameStore } from '@/store/gameStore';
import { FloorCircle } from './FloorCircle';
import { Pedestal } from './Pedestal';
import { StanchionRailing } from './StanchionRailing';
import { CeilingLights } from './CeilingLights';

export function MuseumEnvironment() {
  const { portals } = useGameStore();

  return (
    <group>
      {/* Floor - larger for pushed back walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -15]} receiveShadow>
        <planeGeometry args={[22, 50]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>

      {/* Left wall - pushed back */}
      <mesh position={[-11, 4, -15]} receiveShadow>
        <boxGeometry args={[0.2, 8, 50]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Right wall - pushed back */}
      <mesh position={[11, 4, -15]} receiveShadow>
        <boxGeometry args={[0.2, 8, 50]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -40]} receiveShadow>
        <boxGeometry args={[22.4, 8, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Front partial walls */}
      <mesh position={[-7, 4, 7]} receiveShadow>
        <boxGeometry args={[8, 8, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>
      <mesh position={[7, 4, 7]} receiveShadow>
        <boxGeometry args={[8, 8, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Ceiling lights */}
      <CeilingLights />

      {/* Stanchion railings */}
      <StanchionRailing />

      {/* Pedestals and floor circles */}
      {portals.map((portal) => (
        <group key={portal.id}>
          <Pedestal 
            position={portal.pedestalPosition} 
            title={portal.title}
          />
          <FloorCircle 
            position={portal.circlePosition} 
            portalId={portal.id} 
          />
        </group>
      ))}
    </group>
  );
}
