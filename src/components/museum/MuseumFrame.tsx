interface MuseumFrameProps {
  position: [number, number, number];
  title: string;
  facing?: 'front' | 'back' | 'left' | 'right';
}

export function MuseumFrame({ position, title, facing = 'front' }: MuseumFrameProps) {
  const rotationY = {
    front: 0,
    back: Math.PI,
    left: -Math.PI / 2,
    right: Math.PI / 2,
  }[facing];

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* White frame border */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[2.4, 3.2, 0.1]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* White matting */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2.1, 2.9, 0.02]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      
      {/* Inner black artwork area */}
      <mesh position={[0, 0.1, 0.1]}>
        <planeGeometry args={[1.7, 2.3]} />
        <meshStandardMaterial color="#080808" roughness={0.95} />
      </mesh>
      
      {/* Title label below frame */}
      <mesh position={[0, -1.9, 0.08]}>
        <planeGeometry args={[1.0, 0.15]} />
        <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>
    </group>
  );
}
