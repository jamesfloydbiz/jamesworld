import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, Suspense, useState } from "react";
import * as THREE from "three";

interface PedestalProps {
  position: [number, number, number];
  title: string;
}

// Model configurations for each section
export const modelConfigs: Record<
  string,
  {
    path: string;
    scale: number[];
    yOffset: number;
    xOffset?: number;
    zOffset?: number;
    floating?: boolean;
    rotationY?: number;
    lightIntensity?: number;
  }
> = {
  Story: { path: "/models/tree_gn.glb", scale: [0.4, 0.4, 0.4], yOffset: 0.5, lightIntensity: 1.2 },
  Projects: {
    path: "/models/vulcan.glb",
    scale: [0.0649, 0.0649, 0.0649],
    yOffset: 0.5,
    rotationY: Math.PI / 3,
    lightIntensity: 1.0,
  },
  Content: {
    path: "/models/apollo_as_the_genius_of_the_arts.glb",
    scale: [0.0021, 0.0021, 0.0021],
    yOffset: 1.8,
    rotationY: 0,
    lightIntensity: 0.9,
  },
  Blueprints: {
    path: "/models/the_thinker_by_auguste_rodin.glb",
    scale: [1.125, 1.125, 1.125],
    yOffset: 0.5,
    rotationY: 0,
    lightIntensity: 1.4,
  },
  Network: {
    path: "/models/buddha.glb",
    scale: [0.4, 0.4, 0.4],
    yOffset: 0.5,
    xOffset: 0,
    rotationY: Math.PI + Math.PI / 3,
    lightIntensity: 1.0,
  },
};

const placeholderMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#e0e0e0"),
  roughness: 0.4,
  metalness: 0.15,
});

// Themed placeholder shapes per section
function ThemedPlaceholder({ title, yOffset = 1.0 }: { title: string; yOffset?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const renderShape = () => {
    switch (title) {
      case "Story":
        // Abstract tree: cylinder trunk + sphere canopy
        return (
          <>
            <mesh position={[0, 0, 0]} castShadow material={placeholderMaterial}>
              <cylinderGeometry args={[0.08, 0.12, 0.6, 8]} />
            </mesh>
            <mesh position={[0, 0.5, 0]} castShadow material={placeholderMaterial}>
              <sphereGeometry args={[0.35, 12, 10]} />
            </mesh>
          </>
        );
      case "Projects":
        // Octahedron: raw material being forged
        return (
          <mesh position={[0, 0.15, 0]} castShadow material={placeholderMaterial}>
            <octahedronGeometry args={[0.45, 0]} />
          </mesh>
        );
      case "Content":
        // Cone: upward gesture, torch-like
        return (
          <mesh position={[0, 0.2, 0]} castShadow material={placeholderMaterial}>
            <coneGeometry args={[0.3, 0.8, 8]} />
          </mesh>
        );
      case "Blueprints":
        // Abstract seated figure: box body + sphere head
        return (
          <>
            <mesh position={[0, 0, 0]} castShadow material={placeholderMaterial}>
              <boxGeometry args={[0.4, 0.5, 0.35]} />
            </mesh>
            <mesh position={[0, 0.4, 0]} castShadow material={placeholderMaterial}>
              <sphereGeometry args={[0.18, 10, 8]} />
            </mesh>
          </>
        );
      case "Network":
        // Low-poly sphere: stillness, wholeness
        return (
          <mesh position={[0, 0.15, 0]} castShadow material={placeholderMaterial}>
            <sphereGeometry args={[0.4, 8, 6]} />
          </mesh>
        );
      default:
        return (
          <mesh position={[0, 0.15, 0]} castShadow material={placeholderMaterial}>
            <dodecahedronGeometry args={[0.4, 0]} />
          </mesh>
        );
    }
  };

  return (
    <group ref={groupRef} position={[0, yOffset, 0]}>
      {renderShape()}
    </group>
  );
}

// Inner component that loads the actual model with fade-in
function LoadedModel({ title, config }: { title: string; config: (typeof modelConfigs)[string] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(config.path);
  const [opacity, setOpacity] = useState(0);
  const clonedScene = useRef(scene.clone());

  // Set all materials to transparent for fade-in
  useFrame((state, delta) => {
    if (groupRef.current) {
      if (config?.floating) {
        groupRef.current.position.y = config.yOffset + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }

    // Fade in
    if (opacity < 1) {
      const newOpacity = Math.min(1, opacity + delta * 2.5); // ~400ms
      setOpacity(newOpacity);
      clonedScene.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = newOpacity;
          }
        }
      });
    }
  });

  return (
    <group
      ref={groupRef}
      position={[config.xOffset || 0, config.yOffset, config.zOffset || 0]}
      rotation={[0, config.rotationY || 0, 0]}
    >
      <primitive object={clonedScene.current} scale={config.scale} />
    </group>
  );
}

function ModelExhibit({ title }: { title: string }) {
  const config = modelConfigs[title];

  if (!config) {
    return <ThemedPlaceholder title={title} />;
  }

  return (
    <Suspense fallback={<ThemedPlaceholder title={title} yOffset={config.yOffset} />}>
      <LoadedModel title={title} config={config} />
    </Suspense>
  );
}

export function Pedestal({ position, title }: PedestalProps) {
  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.5, 0.3, 2.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Elevated platform */}
      <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#222222" roughness={0.85} />
      </mesh>

      {/* Central exhibit object */}
      <ModelExhibit title={title} />

      {/* Title plaque */}
      <mesh position={[0, 0.35, 1.1]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}
