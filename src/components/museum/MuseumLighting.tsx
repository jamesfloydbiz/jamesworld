export function MuseumLighting() {
  return (
    <>
      {/* Minimal ambient - keep it dark and dramatic */}
      <ambientLight intensity={0.12} color="#ffffff" />
      
      {/* Main directional light - warm accent (3000K feel) */}
      <directionalLight
        position={[5, 15, 5]}
        intensity={0.3}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      
      {/* Subtle fill from opposite side */}
      <directionalLight
        position={[-8, 12, -25]}
        intensity={0.08}
        color="#ffffff"
      />
      
      {/* Rim light from behind - creates separation */}
      <directionalLight
        position={[0, 8, -40]}
        intensity={0.15}
        color="#ffffff"
      />
      
      {/* Subtle ground bounce */}
      <hemisphereLight
        args={['#ffffff', '#0a0a0a', 0.15]}
        position={[0, 0, 0]}
      />
    </>
  );
}
