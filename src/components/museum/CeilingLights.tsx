import { useGameStore } from '@/store/gameStore';

export function CeilingLights() {
  const { portals } = useGameStore();
  const ceilingHeight = 7.8;

  return (
    <group>
      {/* Black ceiling */}
      <mesh position={[0, ceilingHeight, -15]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 52]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
      </mesh>

      {/* Track lighting rails */}
      {[-4, 0, 4].map((x, i) => (
        <mesh key={i} position={[x, ceilingHeight - 0.1, -15]}>
          <boxGeometry args={[0.08, 0.08, 45]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Spotlight fixtures above each pedestal */}
      {portals.map((portal) => (
        <group key={portal.id} position={[portal.pedestalPosition[0], ceilingHeight - 0.3, portal.pedestalPosition[2]]}>
          {/* Fixture housing */}
          <mesh>
            <cylinderGeometry args={[0.12, 0.08, 0.25, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
          </mesh>
          
          {/* Light cone (visible light beam effect) */}
          <mesh position={[0, -1.5, 0]}>
            <coneGeometry args={[0.8, 3, 32, 1, true]} />
            <meshBasicMaterial 
              color="#ffffff" 
              opacity={0.015} 
              transparent 
              side={2}
            />
          </mesh>
          
          {/* Actual spotlight */}
          <spotLight
            position={[0, 0, 0]}
            target-position={[portal.pedestalPosition[0], 0, portal.pedestalPosition[2]]}
            angle={0.25}
            penumbra={0.6}
            intensity={2.5}
            distance={12}
            color="#fffaf0"
            castShadow
            shadow-mapSize={[512, 512]}
          />
        </group>
      ))}

      {/* Ambient ceiling panels - subtle white glow */}
      {[
        [-6, -5], [-6, -15], [-6, -25], [-6, -35],
        [6, -5], [6, -15], [6, -25], [6, -35],
      ].map(([x, z], i) => (
        <group key={i} position={[x, ceilingHeight - 0.15, z]}>
          <mesh>
            <boxGeometry args={[1.2, 0.08, 1.2]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Light panel */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.9, 0.02, 0.9]} />
            <meshBasicMaterial color="#ffffff" opacity={0.4} transparent />
          </mesh>
          {/* Subtle downlight */}
          <pointLight position={[0, -0.5, 0]} intensity={0.15} distance={6} color="#ffffff" />
        </group>
      ))}
    </group>
  );
}
