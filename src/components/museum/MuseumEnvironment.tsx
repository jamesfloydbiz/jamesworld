import { useGameStore } from '@/store/gameStore';
import { FloorCircle } from './FloorCircle';
import { Pedestal } from './Pedestal';
import { StanchionRailing } from './StanchionRailing';
import { CeilingLights } from './CeilingLights';
import { HallwayDoorway } from './HallwayDoorway';
import { PictureHall } from './PictureHall';
import { RoundedRoof } from './RoundedRoof';
import { VictorianRoof } from './VictorianRoof';

interface MuseumEnvironmentProps {
  showLabels?: boolean;
}

export function MuseumEnvironment({ showLabels = true }: MuseumEnvironmentProps) {
  const { portals } = useGameStore();

  // Walls closer to stanchions (stanchions at ±8, walls now at ±9)
  const wallX = 9;

  return (
    <group>
      {/* Floor - adjusted for closer walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -15]} receiveShadow>
        <planeGeometry args={[wallX * 2, 50]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>

      {/* Walls removed - curved roof now connects to floor */}

      {/* Back wall - split into two sections with doorway gap */}
      {/* Left section */}
      <mesh position={[-5.1, 4, -40]} receiveShadow>
        <boxGeometry args={[7.8, 8, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>
      {/* Right section */}
      <mesh position={[5.1, 4, -40]} receiveShadow>
        <boxGeometry args={[7.8, 8, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>
      {/* Top section above doorway */}
      <mesh position={[0, 7, -40]} receiveShadow>
        <boxGeometry args={[2.4, 2, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>

      {/* Curved roof/ceiling - walls curve into ceiling */}
      <RoundedRoof width={wallX * 2} length={50} position={[0, 0, -15]} curveRadius={7} />
      
      {/* Victorian ribbed glass ceiling structure */}
      <VictorianRoof />

      {/* Doorway frame */}
      <HallwayDoorway position={[0, 0, -40]} />



      {/* Picture Hall */}
      <PictureHall />

      {/* Soft spotlights on each pedestal - improved falloff */}
      {portals.map((portal) => (
        <spotLight
          key={`spotlight-${portal.id}`}
          position={[portal.pedestalPosition[0], 8, portal.pedestalPosition[2]]}
          target-position={portal.pedestalPosition}
          angle={0.35}
          penumbra={1}
          intensity={0.8}
          color="#fffaf0"
          castShadow
          shadow-mapSize={[512, 512]}
          decay={2}
          distance={12}
        />
      ))}

      {/* Front partial walls - adjusted */}
      <mesh position={[-6, 4, 7]} receiveShadow>
        <boxGeometry args={[6, 8, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>
      <mesh position={[6, 4, 7]} receiveShadow>
        <boxGeometry args={[6, 8, 0.2]} />
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
            title={portal.title}
          />
        </group>
      ))}
    </group>
  );
}
