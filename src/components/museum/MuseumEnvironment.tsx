import { useGameStore } from '@/store/gameStore';
import { FloorCircle } from './FloorCircle';
import { Pedestal } from './Pedestal';
import { StanchionRailing } from './StanchionRailing';
import { CeilingLights } from './CeilingLights';
import { MeshReflectorMaterial } from '@react-three/drei';

export function MuseumEnvironment() {
  const { portals } = useGameStore();

  return (
    <group>
      {/* Glossy black marble floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -15]} receiveShadow>
        <planeGeometry args={[24, 52]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={0.5}
          roughness={0.4}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0a"
          metalness={0.6}
          mirror={0.5}
        />
      </mesh>

      {/* Left wall */}
      <mesh position={[-12, 4, -15]} receiveShadow>
        <boxGeometry args={[0.2, 8, 52]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Right wall */}
      <mesh position={[12, 4, -15]} receiveShadow>
        <boxGeometry args={[0.2, 8, 52]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -41]} receiveShadow>
        <boxGeometry args={[24.4, 8, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Front partial walls - entry */}
      <mesh position={[-8, 4, 7]} receiveShadow>
        <boxGeometry args={[8, 8, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>
      <mesh position={[8, 4, 7]} receiveShadow>
        <boxGeometry args={[8, 8, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Ceiling lights */}
      <CeilingLights />

      {/* Stanchion railings with velvet ropes */}
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
