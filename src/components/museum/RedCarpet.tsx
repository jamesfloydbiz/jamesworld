interface RedCarpetProps {
  startZ: number;
  endZ: number;
  width?: number;
}

export function RedCarpet({ startZ, endZ, width = 3 }: RedCarpetProps) {
  const length = Math.abs(endZ - startZ);
  const centerZ = (startZ + endZ) / 2;
  
  return (
    <group>
      {/* Main carpet */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.02, centerZ]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial 
          color="#8B0000" 
          roughness={0.9}
        />
      </mesh>
      
      {/* Gold trim - left */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[-width / 2 - 0.08, 0.025, centerZ]}
      >
        <planeGeometry args={[0.15, length]} />
        <meshStandardMaterial 
          color="#d4af37" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Gold trim - right */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[width / 2 + 0.08, 0.025, centerZ]}
      >
        <planeGeometry args={[0.15, length]} />
        <meshStandardMaterial 
          color="#d4af37" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}