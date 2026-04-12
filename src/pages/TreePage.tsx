import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

/* ─── 3D Tree Model ─── */
const TreeModel = () => {
  const { scene } = useGLTF('/models/tree_gn.glb');
  const ref = useRef<THREE.Group>(null);

  // No rotation

  return (
    <group ref={ref} position={[0, -2.8, 0]} scale={0.45}>
      <primitive object={scene} />
    </group>
  );
};

/* ─── Root nav data ─── */
const roots = [
  { label: 'Writing', to: '/content', cx: 120, cy: 520 },
  { label: 'Work', to: '/projects', cx: 300, cy: 580 },
  { label: 'Events', to: '/builds', cx: 500, cy: 540 },
  { label: 'Thinking', to: '/blueprints', cx: 700, cy: 600 },
  { label: 'Poetry', to: '/poems', cx: 880, cy: 520 },
  { label: 'Contact', to: '/letter', cx: 1020, cy: 560 },
];

/* ─── SVG root paths ─── */
const rootPaths = [
  { d: 'M500,0 Q380,120 280,260 Q200,370 120,520', w: 14 },
  { d: 'M520,0 Q440,100 380,220 Q340,360 300,580', w: 12 },
  { d: 'M540,0 Q530,140 520,280 Q510,400 500,540', w: 10 },
  { d: 'M560,0 Q600,130 640,260 Q670,400 700,600', w: 11 },
  { d: 'M550,0 Q620,80 720,200 Q800,340 880,520', w: 13 },
  { d: 'M570,0 Q680,100 800,220 Q920,380 1020,560', w: 9 },
];

const TreePage = () => {
  return (
    <div className="bg-black min-h-screen overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* ─── Above-ground zone ─── */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-start z-10"
           style={{ background: '#000000' }}>
        {/* Title */}
        <h1
          className="w-full text-center font-bold uppercase select-none z-20 relative"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(4.5rem, 12vw, 15rem)',
            letterSpacing: 'clamp(0.2rem, 1.5vw, 2rem)',
            color: '#ffffff',
            lineHeight: 1,
            paddingTop: 'clamp(1rem, 3vh, 2rem)',
            whiteSpace: 'nowrap',
          }}
        >
          JAMES FLOYD
        </h1>

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-10">
          <Canvas
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 1, 5], fov: 50 }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[3, 5, 2]} intensity={0.8} />
            <directionalLight position={[-2, 3, -1]} intensity={0.3} />
            <Suspense fallback={null}>
              <TreeModel />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* ─── Transition zone ─── */}
      <div
        className="relative z-20 w-full"
        style={{
          height: '120px',
          background: 'linear-gradient(to bottom, #000000 0%, #1a3a1a 45%, #2c1a0e 75%, #1a0f08 100%)',
        }}
      />

      {/* ─── Roots zone ─── */}
      <div
        className="relative z-20 w-full"
        style={{
          background: '#1a0f08',
          minHeight: '80vh',
          paddingBottom: '6rem',
        }}
      >
        <svg
          viewBox="0 0 1140 650"
          className="w-full max-w-5xl mx-auto"
          style={{ display: 'block' }}
          preserveAspectRatio="xMidYMin meet"
        >
          {/* Root paths */}
          {rootPaths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              stroke="#3d2816"
              strokeWidth={p.w}
              fill="none"
              strokeLinecap="round"
              opacity={0.85}
            />
          ))}

          {/* Nav nodes */}
          {roots.map((r, i) => (
            <g key={i} className="group cursor-pointer">
              <a href={r.to}>
                {/* Glow ring (hover) */}
                <circle
                  cx={r.cx}
                  cy={r.cy}
                  r={36}
                  fill="none"
                  stroke="#c9944a"
                  strokeWidth={2}
                  opacity={0}
                  className="transition-all duration-500"
                  style={{ filter: 'blur(4px)' }}
                >
                  <set attributeName="opacity" to="0.6" begin="mouseover" end="mouseout" />
                </circle>
                {/* Main circle */}
                <circle
                  cx={r.cx}
                  cy={r.cy}
                  r={30}
                  fill="#2c1a0e"
                  stroke="#a67c52"
                  strokeWidth={1.5}
                  className="transition-all duration-300"
                >
                  <animate
                    attributeName="r"
                    from="30"
                    to="33"
                    dur="0.3s"
                    begin="mouseover"
                    end="mouseout"
                    fill="freeze"
                  />
                </circle>
                {/* Label */}
                <text
                  x={r.cx}
                  y={r.cy + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#d4c4a8"
                  fontSize="11"
                  fontFamily="'Space Mono', monospace"
                  letterSpacing="0.08em"
                  style={{ textTransform: 'uppercase' } as React.CSSProperties}
                >
                  {r.label}
                </text>
              </a>
            </g>
          ))}
        </svg>

        {/* React Router links overlaid for SPA navigation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full max-w-5xl mx-auto" style={{ aspectRatio: '1140/650' }}>
            {roots.map((r, i) => (
              <Link
                key={i}
                to={r.to}
                className="absolute pointer-events-auto rounded-full"
                style={{
                  left: `${(r.cx / 1140) * 100}%`,
                  top: `${(r.cy / 650) * 100}%`,
                  width: '60px',
                  height: '60px',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

useGLTF.preload('/models/tree_gn.glb');

export default TreePage;
