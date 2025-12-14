export function MuseumLighting() {
  return (
    <>
      {/* Ambient light - slightly higher for visibility */}
      <ambientLight intensity={0.35} color="#ffffff" />
      
      {/* Main directional light */}
      <directionalLight
        position={[5, 12, 5]}
        intensity={0.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={60}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-3, 10, -20]}
        intensity={0.25}
        color="#ffffff"
      />
      
      {/* Character illumination */}
      <pointLight position={[0, 4, 2]} intensity={0.3} color="#ffffff" distance={10} />
    </>
  );
}
