export function CeilingLights() {
  // Grid of ceiling light panels
  const lights: [number, number, number][] = [];
  
  // Create a grid pattern
  for (let x = -6; x <= 6; x += 4) {
    for (let z = -30; z <= 0; z += 6) {
      lights.push([x, 7.9, z]);
    }
  }

  return (
    <group>
      {/* Main ceiling - black */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, -15]}>
        <planeGeometry args={[22, 50]} />
        <meshStandardMaterial color="#030303" roughness={1} />
      </mesh>
      
      {/* White square light panels */}
      {lights.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Light panel */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Actual light source */}
          <pointLight 
            position={[0, -0.5, 0]} 
            intensity={0.8} 
            color="#ffffff" 
            distance={12}
            decay={2}
          />
        </group>
      ))}
      
      {/* Ceiling frame/edge trim */}
      <mesh position={[-10.9, 7.8, -15]}>
        <boxGeometry args={[0.2, 0.4, 50]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>
      <mesh position={[10.9, 7.8, -15]}>
        <boxGeometry args={[0.2, 0.4, 50]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>
    </group>
  );
}
