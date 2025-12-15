import { PictureFrame } from './PictureFrame';

interface PictureData {
  id: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  imageSrc?: string;
}

// Helper to create wall-covering grid of frames
function generateWallFrames(
  wallX: number,
  zStart: number,
  zEnd: number,
  yStart: number,
  yEnd: number,
  rotation: [number, number, number],
  idPrefix: string
): PictureData[] {
  const frames: PictureData[] = [];
  const frameSize = 0.9;
  const gap = 0.15;
  const step = frameSize + gap;
  
  let id = 0;
  for (let z = zStart; z >= zEnd; z -= step) {
    for (let y = yStart; y <= yEnd; y += step) {
      frames.push({
        id: `${idPrefix}-${id++}`,
        width: frameSize,
        height: frameSize,
        position: [wallX, y, z],
        rotation,
      });
    }
  }
  return frames;
}

// Back wall - dense grid covering the wall
const backWallFrames: PictureData[] = [];
const backWallZ = -64.95;
const frameSize = 0.85;
const gap = 0.12;
const step = frameSize + gap;

let backId = 0;
for (let x = -5; x <= 5; x += step) {
  for (let y = 0.8; y <= 7; y += step) {
    backWallFrames.push({
      id: `back-${backId++}`,
      width: frameSize,
      height: frameSize,
      position: [x, y, backWallZ],
      rotation: [0, 0, 0],
    });
  }
}

// Left wall frames - facing right (rotate around Y)
const leftWallFrames = generateWallFrames(
  -5.95, // x position
  -42, // zStart
  -63, // zEnd
  0.8, // yStart
  7, // yEnd
  [0, Math.PI / 2, 0], // rotation to face into the room
  'left'
);

// Right wall frames - facing left
const rightWallFrames = generateWallFrames(
  5.95, // x position
  -42, // zStart
  -63, // zEnd
  0.8, // yStart
  7, // yEnd
  [0, -Math.PI / 2, 0], // rotation to face into the room
  'right'
);

const allFrames = [...backWallFrames, ...leftWallFrames, ...rightWallFrames];

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
      {allFrames.map((pic) => (
        <group key={pic.id}>
          <PictureFrame
            position={pic.position}
            width={pic.width}
            height={pic.height}
            rotation={pic.rotation}
            imageSrc={pic.imageSrc}
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
        position={[-3, 7.5, -55]}
        target-position={[-5.9, 3, -55]}
        angle={0.5}
        penumbra={0.8}
        intensity={0.8}
        color="#fffaf0"
      />
      <spotLight
        position={[3, 7.5, -55]}
        target-position={[5.9, 3, -55]}
        angle={0.5}
        penumbra={0.8}
        intensity={0.8}
        color="#fffaf0"
      />
      
      {/* Ambient hall lighting */}
      <pointLight position={[0, 6, -45]} intensity={0.4} color="#ffd699" distance={20} />
      <pointLight position={[0, 6, -55]} intensity={0.4} color="#ffd699" distance={20} />
      <pointLight position={[0, 6, -62]} intensity={0.4} color="#ffd699" distance={20} />
    </group>
  );
}
