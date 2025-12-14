export function MuseumLighting() {
  return (
    <>
      {/* Low ambient light */}
      <ambientLight intensity={0.25} color="#ffffff" />
      
      {/* Main directional light - soft */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.6}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light from behind */}
      <directionalLight
        position={[-3, 8, -15]}
        intensity={0.3}
        color="#ffffff"
      />
      
      {/* Subtle point lights for frames */}
      <pointLight position={[-4, 3.5, -7]} intensity={0.5} color="#ffffff" distance={6} />
      <pointLight position={[4, 3.5, -7]} intensity={0.5} color="#ffffff" distance={6} />
      <pointLight position={[-4, 3.5, -17]} intensity={0.5} color="#ffffff" distance={6} />
      <pointLight position={[4, 3.5, -17]} intensity={0.5} color="#ffffff" distance={6} />
      <pointLight position={[0, 3.5, -27]} intensity={0.5} color="#ffffff" distance={6} />
      
      {/* Character illumination */}
      <pointLight position={[0, 3, 2]} intensity={0.4} color="#ffffff" distance={8} />
    </>
  );
}
