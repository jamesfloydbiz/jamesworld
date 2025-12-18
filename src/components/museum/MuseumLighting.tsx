interface MuseumLightingProps {
  isMobile?: boolean;
}

export function MuseumLighting({ isMobile = false }: MuseumLightingProps) {
  return (
    <>
      {/* Ambient light - higher on mobile to compensate for no shadows */}
      <ambientLight intensity={isMobile ? 0.5 : 0.35} color="#ffffff" />
      
      {/* Main directional light */}
      <directionalLight
        position={[5, 12, 5]}
        intensity={isMobile ? 0.6 : 0.5}
        color="#ffffff"
        castShadow={!isMobile}
        shadow-mapSize={[512, 512]}
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
        intensity={isMobile ? 0.35 : 0.25}
        color="#ffffff"
      />
      
      {/* Character illumination */}
      <pointLight position={[0, 4, 2]} intensity={isMobile ? 0.4 : 0.3} color="#ffffff" distance={10} />
    </>
  );
}
