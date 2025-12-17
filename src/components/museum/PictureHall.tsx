import { PictureFrame } from './PictureFrame';
import { useGameStore } from '@/store/gameStore';
import { useState, useEffect } from 'react';

// Local paths (default - works immediately)
const IMAGE_BASE = '/pictures/';

// For jsDelivr CDN (uncomment and update with your repo when GitHub is connected):
// const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/[YOUR-GITHUB-USERNAME]/[YOUR-REPO-NAME]@main/public/pictures/';

// Helper to encode filenames with special characters
const encodeFilename = (filename: string) => encodeURIComponent(filename);

// All images from public/pictures
const imageFiles = [
  '18766491-0c6d-4bf2-a4e4-35dd80ff985c.jpg',
  '20250619_092213_Original.jpg',
  '20250619_140938_Original.jpg',
  '20250619_141040_Original.jpg',
  '75140DD1-DBC5-4F23-82B7-EA44DCC2780A.jpg',
  'IMG_0610.jpg',
  'IMG_0611.jpg',
  'IMG_0647.jpg',
  'IMG_1311.jpeg',
  'IMG_1341.jpeg',
  'IMG_1975.jpg',
  'IMG_1976.jpg',
  'IMG_1977.jpg',
  'IMG_1978.jpg',
  'IMG_1978_Original(1).jpg',
  'IMG_1978_Original.jpg',
  'IMG_2001_Original.jpg',
  'IMG_2158_Original.jpg',
  'IMG_2488.jpeg',
  'IMG_2610(1).jpeg',
  'IMG_2610.jpeg',
  'IMG_4347.jpeg',
  'IMG_5430.jpeg',
  'IMG_7136.jpeg',
  'IMG_8740.jpg',
  'IMG_8922.jpg',
  'IMG_8927.jpg',
  'IMG_9029.png',
  'IMG_9032.png',
  'IMG_9384.jpg',
  'IMG_9451.png',
  'IMG_9577.png',
  'IMG_9707.jpg',
  'IMG_9714.png',
  'IMG_9749(1).jpg',
  'IMG_9749.jpg',
  'Jets_&_Capital_Miami_BTS_Day_0-58(1).jpeg',
  'Jets_&_Capital_Miami_BTS_Day_0-58.jpeg',
  'Jets_&_Capital_Miami_BTS_Day_0-83.jpeg',
  'campfire-sparks.jpeg',
];

interface PictureData {
  id: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  imageUrl?: string;
}

// Salon style arrangement with images assigned
const pictureArrangement: PictureData[] = [
  // Back wall - large central piece with surrounding smaller ones
  { id: 'main-1', width: 2.0, height: 2.5, position: [0, 3.5, -64.9], rotation: [0, 0, 0] },
  { id: 'top-1', width: 1.0, height: 0.8, position: [-3, 5.5, -64.9], rotation: [0, 0, 0] },
  { id: 'top-2', width: 1.2, height: 1.0, position: [3, 5.2, -64.9], rotation: [0, 0, 0] },
  { id: 'mid-l-1', width: 1.3, height: 1.6, position: [-3.5, 3.2, -64.9], rotation: [0, 0, 0] },
  { id: 'mid-r-1', width: 1.4, height: 1.4, position: [3.5, 3.0, -64.9], rotation: [0, 0, 0] },
  { id: 'low-1', width: 0.9, height: 1.1, position: [-2, 1.5, -64.9], rotation: [0, 0, 0] },
  { id: 'low-2', width: 1.0, height: 0.8, position: [2, 1.4, -64.9], rotation: [0, 0, 0] },
  { id: 'corner-l', width: 0.8, height: 1.0, position: [-5, 2.5, -64.9], rotation: [0, 0, 0] },
  { id: 'corner-r', width: 0.8, height: 1.2, position: [5, 2.8, -64.9], rotation: [0, 0, 0] },
  { id: 'back-extra-1', width: 0.7, height: 0.9, position: [-1.5, 5.8, -64.9], rotation: [0, 0, 0] },
  { id: 'back-extra-2', width: 0.7, height: 0.9, position: [1.5, 5.8, -64.9], rotation: [0, 0, 0] },
  { id: 'back-extra-3', width: 1.1, height: 0.9, position: [0, 1.2, -64.9], rotation: [0, 0, 0] },
  
  // Left wall - more frames
  { id: 'left-1', width: 1.4, height: 1.8, position: [-5.9, 3.5, -50], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-2', width: 1.2, height: 1.4, position: [-5.9, 3.2, -55], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-3', width: 1.0, height: 1.2, position: [-5.9, 3.0, -60], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-4', width: 0.9, height: 1.1, position: [-5.9, 5.5, -52], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-5', width: 1.1, height: 0.9, position: [-5.9, 1.5, -53], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-6', width: 1.0, height: 1.3, position: [-5.9, 5.2, -57], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-7', width: 0.8, height: 1.0, position: [-5.9, 1.6, -58], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-8', width: 1.2, height: 1.0, position: [-5.9, 5.5, -62], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-9', width: 0.9, height: 1.2, position: [-5.9, 1.4, -63], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-10', width: 1.3, height: 1.5, position: [-5.9, 3.3, -45], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-11', width: 0.8, height: 0.9, position: [-5.9, 5.6, -47], rotation: [0, Math.PI / 2, 0] },
  { id: 'left-12', width: 1.0, height: 0.8, position: [-5.9, 1.5, -48], rotation: [0, Math.PI / 2, 0] },
  
  // Right wall - more frames
  { id: 'right-1', width: 1.5, height: 1.9, position: [5.9, 3.3, -50], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-2', width: 1.3, height: 1.5, position: [5.9, 3.5, -55], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-3', width: 1.1, height: 1.3, position: [5.9, 2.8, -60], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-4', width: 0.8, height: 1.0, position: [5.9, 5.3, -53], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-5', width: 1.0, height: 0.8, position: [5.9, 1.4, -52], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-6', width: 1.1, height: 1.2, position: [5.9, 5.4, -58], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-7', width: 0.9, height: 1.1, position: [5.9, 1.5, -57], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-8', width: 1.0, height: 1.4, position: [5.9, 5.2, -62], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-9', width: 0.8, height: 0.9, position: [5.9, 1.6, -63], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-10', width: 1.4, height: 1.6, position: [5.9, 3.4, -45], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-11', width: 0.9, height: 1.0, position: [5.9, 5.5, -47], rotation: [0, -Math.PI / 2, 0] },
  { id: 'right-12', width: 1.1, height: 0.9, position: [5.9, 1.4, -48], rotation: [0, -Math.PI / 2, 0] },
  
  // Additional frames on back wall high up
  { id: 'back-high-1', width: 0.9, height: 0.7, position: [-4, 6.5, -64.9], rotation: [0, 0, 0] },
  { id: 'back-high-2', width: 0.9, height: 0.7, position: [4, 6.5, -64.9], rotation: [0, 0, 0] },
  { id: 'back-high-3', width: 1.0, height: 0.8, position: [0, 6.8, -64.9], rotation: [0, 0, 0] },
  
  // More on side walls near entrance
  { id: 'left-entrance-1', width: 1.2, height: 1.4, position: [-5.9, 3.5, -42], rotation: [0, Math.PI / 2, 0] },
  { id: 'right-entrance-1', width: 1.2, height: 1.4, position: [5.9, 3.5, -42], rotation: [0, -Math.PI / 2, 0] },
];

// Assign images to frames with proper encoding for special characters
const framesWithImages = pictureArrangement.map((frame, index) => ({
  ...frame,
  imageUrl: index < imageFiles.length ? IMAGE_BASE + encodeFilename(imageFiles[index]) : undefined,
}));

export function PictureHall() {
  const { characterPosition } = useGameStore();
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // Load images when character approaches the hall (z < -38)
  useEffect(() => {
    if (characterPosition[2] < -38 && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [characterPosition, shouldLoad]);
  
  return (
    <group>
      {/* Hall floor */}
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
      
      {/* Back wall */}
      <mesh position={[0, 4, -65]} receiveShadow>
        <boxGeometry args={[12.4, 8, 0.2]} />
        <meshStandardMaterial color="#3a1a1a" roughness={0.95} />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 8, -52.5]}>
        <boxGeometry args={[12, 0.2, 25]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
      </mesh>
      
      {/* Picture frames on walls - only load images when approaching */}
      {framesWithImages.map((pic) => (
        <PictureFrame
          key={pic.id}
          position={pic.position}
          width={pic.width}
          height={pic.height}
          rotation={pic.rotation}
          imageSrc={shouldLoad ? pic.imageUrl : undefined}
        />
      ))}
      
      {/* Ambient lighting */}
      <pointLight position={[0, 6, -50]} intensity={0.5} color="#ffd699" distance={25} />
      <pointLight position={[0, 6, -60]} intensity={0.5} color="#ffd699" distance={25} />
    </group>
  );
}