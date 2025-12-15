import { PictureFrame } from './PictureFrame';

interface PictureData {
  id: string;
  width: number;
  height: number;
  position: [number, number, number];
  imageSrc?: string;
}

// Salon-style arrangement - dense, asymmetric layout
const pictureArrangement: PictureData[] = [
  // Back wall - main display
  // Large center piece
  { id: 'main-1', width: 1.8, height: 2.4, position: [0, 3.5, -64.9] },
  
  // Upper row
  { id: 'top-1', width: 0.8, height: 0.6, position: [-3.5, 5.5, -64.9] },
  { id: 'top-2', width: 1.2, height: 0.9, position: [-2.2, 5.8, -64.9] },
  { id: 'top-3', width: 0.7, height: 1.0, position: [2.0, 5.5, -64.9] },
  { id: 'top-4', width: 1.0, height: 0.7, position: [3.2, 5.7, -64.9] },
  
  // Upper-mid row left
  { id: 'mid-l-1', width: 1.4, height: 1.1, position: [-3.8, 4.0, -64.9] },
  { id: 'mid-l-2', width: 0.9, height: 1.3, position: [-2.0, 3.8, -64.9] },
  
  // Upper-mid row right  
  { id: 'mid-r-1', width: 1.0, height: 1.4, position: [2.2, 4.0, -64.9] },
  { id: 'mid-r-2', width: 1.3, height: 1.0, position: [3.8, 3.7, -64.9] },
  
  // Lower-mid row
  { id: 'low-1', width: 0.7, height: 0.9, position: [-4.2, 2.0, -64.9] },
  { id: 'low-2', width: 1.1, height: 0.8, position: [-2.8, 2.2, -64.9] },
  { id: 'low-3', width: 0.6, height: 0.8, position: [-1.2, 1.8, -64.9] },
  { id: 'low-4', width: 0.8, height: 0.6, position: [1.2, 2.0, -64.9] },
  { id: 'low-5', width: 1.0, height: 1.2, position: [2.8, 2.3, -64.9] },
  { id: 'low-6', width: 0.9, height: 0.7, position: [4.2, 1.9, -64.9] },
  
  // Bottom row
  { id: 'bot-1', width: 0.6, height: 0.5, position: [-4.5, 0.9, -64.9] },
  { id: 'bot-2', width: 0.8, height: 0.6, position: [-3.4, 1.0, -64.9] },
  { id: 'bot-3', width: 0.5, height: 0.7, position: [-0.8, 0.8, -64.9] },
  { id: 'bot-4', width: 0.7, height: 0.5, position: [0.8, 0.9, -64.9] },
  { id: 'bot-5', width: 0.6, height: 0.6, position: [3.6, 0.9, -64.9] },
  { id: 'bot-6', width: 0.5, height: 0.5, position: [4.5, 1.0, -64.9] },
  
  // Left wall pictures
  { id: 'left-1', width: 1.2, height: 1.6, position: [-5.9, 3.5, -55] },
  { id: 'left-2', width: 0.9, height: 1.1, position: [-5.9, 3.2, -58] },
  { id: 'left-3', width: 1.0, height: 0.8, position: [-5.9, 2.0, -56] },
  { id: 'left-4', width: 0.8, height: 1.2, position: [-5.9, 4.8, -57] },
  
  // Right wall pictures
  { id: 'right-1', width: 1.4, height: 1.2, position: [5.9, 3.3, -55] },
  { id: 'right-2', width: 0.8, height: 1.0, position: [5.9, 3.5, -58] },
  { id: 'right-3', width: 1.1, height: 0.9, position: [5.9, 2.0, -56.5] },
  { id: 'right-4', width: 0.7, height: 1.1, position: [5.9, 4.6, -57] },
];

export function PictureHall() {
  return (
    <group>
      {/* Hall floor - extends from doorway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -52.5]} receiveShadow>
        <planeGeometry args={[12, 25]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-6, 4, -52.5]} receiveShadow>
        <boxGeometry args={[0.2, 8, 25]} />
        <meshStandardMaterial color="#2a1a1a" roughness={0.95} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[6, 4, -52.5]} receiveShadow>
        <boxGeometry args={[0.2, 8, 25]} />
        <meshStandardMaterial color="#2a1a1a" roughness={0.95} />
      </mesh>
      
      {/* Back wall - deep burgundy like reference */}
      <mesh position={[0, 4, -65]} receiveShadow>
        <boxGeometry args={[12.4, 8, 0.2]} />
        <meshStandardMaterial color="#3a1a1a" roughness={0.95} />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 8, -52.5]}>
        <boxGeometry args={[12, 0.2, 25]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
      </mesh>
      
      {/* Picture frames on walls */}
      {pictureArrangement.map((pic) => (
        <group key={pic.id}>
          <PictureFrame
            position={pic.position}
            width={pic.width}
            height={pic.height}
            imageSrc={pic.imageSrc}
          />
          {/* Small spotlight for each picture */}
          <pointLight
            position={[pic.position[0], pic.position[1] + 1, pic.position[2] + 1]}
            intensity={0.15}
            color="#fffaf0"
            distance={3}
          />
        </group>
      ))}
      
      {/* Main ceiling spotlights */}
      <spotLight
        position={[0, 7.5, -55]}
        target-position={[0, 3, -65]}
        angle={0.5}
        penumbra={0.8}
        intensity={1.2}
        color="#fffaf0"
        castShadow
      />
      <spotLight
        position={[-3, 7.5, -60]}
        target-position={[-3, 3, -65]}
        angle={0.4}
        penumbra={0.8}
        intensity={0.8}
        color="#fffaf0"
      />
      <spotLight
        position={[3, 7.5, -60]}
        target-position={[3, 3, -65]}
        angle={0.4}
        penumbra={0.8}
        intensity={0.8}
        color="#fffaf0"
      />
      
      {/* Ambient hall lighting */}
      <pointLight position={[0, 6, -50]} intensity={0.3} color="#ffd699" distance={15} />
      <pointLight position={[0, 6, -60]} intensity={0.3} color="#ffd699" distance={15} />
    </group>
  );
}