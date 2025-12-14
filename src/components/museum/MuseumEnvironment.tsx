import { useGameStore } from '@/store/gameStore';
import { FloorCircle } from './FloorCircle';
import { Pedestal } from './Pedestal';
import { StanchionRailing } from './StanchionRailing';
import { CeilingLights } from './CeilingLights';
import { Text } from '@react-three/drei';

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

      {/* Glowing JAMES FLOYD text on back wall */}
      <Text
        position={[0, 5, -39.8]}
        fontSize={1.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        JAMES FLOYD
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={1.2} 
        />
      </Text>
      <pointLight position={[0, 5, -38]} intensity={0.5} color="#ffffff" distance={8} />

      {/* Soft spotlights on each pedestal */}
      {portals.map((portal) => (
        <spotLight
          key={`spotlight-${portal.id}`}
          position={[portal.pedestalPosition[0], 7, portal.pedestalPosition[2]]}
          target-position={portal.pedestalPosition}
          angle={0.4}
          penumbra={0.8}
          intensity={0.6}
          color="#fffaf0"
          castShadow
        />
      ))}

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
