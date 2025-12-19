import { useGameStore } from '@/store/gameStore';
import { FloorCircle } from './FloorCircle';
import { Pedestal } from './Pedestal';
import { StanchionRailing } from './StanchionRailing';
import { CeilingLights } from './CeilingLights';
import { HallwayDoorway } from './HallwayDoorway';
import { RedCarpet } from './RedCarpet';
import { PictureHall } from './PictureHall';
import { HallwayStanchions } from './HallwayStanchions';
import { InfoPlacard } from './InfoPlacard';
import { RoundedRoof } from './RoundedRoof';
import { DustParticles } from './DustParticles';
import { FloorGlow } from './FloorGlow';
import { Text } from '@react-three/drei';

export function MuseumEnvironment() {
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

      {/* Doorway frame */}
      <HallwayDoorway position={[0, 0, -40]} />


      {/* Red carpet from main gallery through doorway to picture hall */}
      <RedCarpet startZ={-35} endZ={-65} width={3} />

      {/* Hallway stanchions along carpet */}
      <HallwayStanchions />

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

      {/* Subtle floor glow */}
      <FloorGlow />

      {/* Dust particles for atmosphere */}
      <DustParticles />

      {/* Ceiling lights */}
      <CeilingLights />

      {/* Stanchion railings */}
      <StanchionRailing />

      {/* Pedestals and floor circles with info placards */}
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
          {/* Info placard positioned to the side of the circle */}
          <InfoPlacard 
            position={[
              portal.circlePosition[0] + (portal.circlePosition[0] > 0 ? 1.5 : -1.5),
              0,
              portal.circlePosition[2]
            ]} 
            title={portal.title}
          />
        </group>
      ))}
    </group>
  );
}
