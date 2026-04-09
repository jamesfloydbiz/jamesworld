import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Compass ─── */
const useCompassHeading = () => {
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      // iOS provides webkitCompassHeading
      const h = (e as any).webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha) % 360 : null);
      if (h != null) setHeading(h);
    };

    const request = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const perm = await (DeviceOrientationEvent as any).requestPermission();
          if (perm === 'granted') window.addEventListener('deviceorientation', handler, true);
        } catch { /* fallback to static */ }
      } else {
        window.addEventListener('deviceorientation', handler, true);
      }
    };
    request();
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, []);

  return heading;
};

/* ─── Landmarks ─── */
const LANDMARKS = [
  {
    id: 'story',
    route: '/story',
    label: 'Story',
    descriptor: 'A worn paperback near the fire',
    x: 280,
    y: 190,
  },
  {
    id: 'projects',
    route: '/projects',
    label: 'Projects',
    descriptor: 'A pack leaning against a pine',
    x: 680,
    y: 260,
  },
  {
    id: 'network',
    route: '/network',
    label: 'Network',
    descriptor: 'A ridgeline lookout point',
    x: 160,
    y: 420,
  },
  {
    id: 'content',
    route: '/content',
    label: 'Content',
    descriptor: 'An open journal on a flat rock',
    x: 520,
    y: 480,
  },
  {
    id: 'blueprints',
    route: '/blueprints',
    label: 'Blueprints',
    descriptor: 'Blueprint paper pinned to bark',
    x: 780,
    y: 500,
  },
];

/* ─── SVG icon drawings ─── */
const LandmarkIcon = ({ id }: { id: string }) => {
  const stroke = '#F5F0E8';
  const sw = 1.2;
  switch (id) {
    case 'story':
      return (
        <g>
          {/* Book */}
          <rect x={-12} y={-6} width={24} height={16} rx={1} fill="none" stroke={stroke} strokeWidth={sw} />
          <line x1={0} y1={-6} x2={0} y2={10} stroke={stroke} strokeWidth={0.8} />
          {/* Fire */}
          <path d="M-4 -14 Q-2 -20 0 -16 Q2 -20 4 -14 Q2 -10 0 -12 Q-2 -10 -4 -14Z" fill="none" stroke="#B8860B" strokeWidth={sw} />
          <line x1={-3} y1={-8} x2={3} y2={-8} stroke="#B8860B" strokeWidth={0.6} opacity={0.5} />
        </g>
      );
    case 'projects':
      return (
        <g>
          {/* Backpack */}
          <rect x={-8} y={-4} width={16} height={18} rx={3} fill="none" stroke={stroke} strokeWidth={sw} />
          <path d="M-4 -4 Q-4 -10 0 -10 Q4 -10 4 -4" fill="none" stroke={stroke} strokeWidth={sw} />
          <line x1={-3} y1={4} x2={3} y2={4} stroke={stroke} strokeWidth={0.6} />
          {/* Pine trunk */}
          <line x1={16} y1={-20} x2={16} y2={14} stroke="#4A5D23" strokeWidth={sw} />
          <path d="M10 -8 L16 -16 L22 -8" fill="none" stroke="#4A5D23" strokeWidth={sw} />
          <path d="M11 -2 L16 -10 L21 -2" fill="none" stroke="#4A5D23" strokeWidth={sw} />
        </g>
      );
    case 'network':
      return (
        <g>
          {/* Mountain ridge */}
          <path d="M-24 8 L-12 -14 L-4 -4 L4 -18 L16 -6 L24 8" fill="none" stroke={stroke} strokeWidth={sw} />
          <path d="M-18 8 L-8 -6 L0 0 L8 -10 L18 8" fill="none" stroke={stroke} strokeWidth={0.6} opacity={0.4} />
          {/* Lookout point */}
          <circle cx={4} cy={-18} r={2} fill="none" stroke="#B8860B" strokeWidth={sw} />
        </g>
      );
    case 'content':
      return (
        <g>
          {/* Flat rock */}
          <ellipse cx={0} cy={10} rx={18} ry={5} fill="none" stroke={stroke} strokeWidth={0.6} opacity={0.4} />
          {/* Open journal */}
          <rect x={-14} y={-6} width={12} height={16} rx={1} fill="none" stroke={stroke} strokeWidth={sw} transform="rotate(-5)" />
          <rect x={2} y={-6} width={12} height={16} rx={1} fill="none" stroke={stroke} strokeWidth={sw} transform="rotate(5)" />
          {/* Lines on pages */}
          <line x1={-10} y1={0} x2={-4} y2={0} stroke={stroke} strokeWidth={0.4} opacity={0.5} />
          <line x1={-10} y1={3} x2={-5} y2={3} stroke={stroke} strokeWidth={0.4} opacity={0.5} />
          <line x1={-10} y1={6} x2={-6} y2={6} stroke={stroke} strokeWidth={0.4} opacity={0.5} />
        </g>
      );
    case 'blueprints':
      return (
        <g>
          {/* Tree bark */}
          <line x1={14} y1={-18} x2={14} y2={14} stroke="#3D2817" strokeWidth={2} />
          <line x1={11} y1={-4} x2={14} y2={-8} stroke="#3D2817" strokeWidth={0.8} />
          {/* Blueprint paper */}
          <rect x={-12} y={-10} width={20} height={24} rx={0} fill="none" stroke={stroke} strokeWidth={sw} />
          {/* Pin */}
          <circle cx={-2} cy={-10} r={2} fill="#B8860B" stroke="#B8860B" strokeWidth={0.5} />
          {/* Grid lines on paper */}
          <line x1={-8} y1={-2} x2={4} y2={-2} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
          <line x1={-8} y1={4} x2={4} y2={4} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
          <line x1={-8} y1={10} x2={4} y2={10} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
          <line x1={-4} y1={-6} x2={-4} y2={12} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
          <line x1={0} y1={-6} x2={0} y2={12} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
        </g>
      );
    default:
      return null;
  }
};

/* ─── Compass Rose ─── */
const CompassRose = ({ heading }: { heading: number | null }) => {
  const rotation = heading != null ? -heading : 0;
  return (
    <g transform="translate(900, 580)">
      {/* Outer ring */}
      <circle cx={0} cy={0} r={36} fill="none" stroke="#F5F0E8" strokeWidth={0.8} opacity={0.3} />
      <circle cx={0} cy={0} r={32} fill="none" stroke="#F5F0E8" strokeWidth={0.4} opacity={0.2} />
      {/* Tick marks */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180;
        const r1 = i % 4 === 0 ? 28 : 30;
        return (
          <line
            key={i}
            x1={Math.sin(angle) * r1}
            y1={-Math.cos(angle) * r1}
            x2={Math.sin(angle) * 36}
            y2={-Math.cos(angle) * 36}
            stroke="#F5F0E8"
            strokeWidth={i % 4 === 0 ? 1 : 0.4}
            opacity={i % 4 === 0 ? 0.6 : 0.3}
          />
        );
      })}
      {/* Cardinal labels */}
      <text x={0} y={-40} textAnchor="middle" fill="#F5F0E8" fontSize={7} fontFamily="monospace" opacity={0.5}>N</text>
      <text x={42} y={2} textAnchor="middle" fill="#F5F0E8" fontSize={6} fontFamily="monospace" opacity={0.35}>E</text>
      <text x={0} y={46} textAnchor="middle" fill="#F5F0E8" fontSize={6} fontFamily="monospace" opacity={0.35}>S</text>
      <text x={-42} y={2} textAnchor="middle" fill="#F5F0E8" fontSize={6} fontFamily="monospace" opacity={0.35}>W</text>
      {/* Needle */}
      <g transform={`rotate(${rotation})`} style={{ transition: heading != null ? 'transform 0.3s ease-out' : 'none' }}>
        <polygon points="0,-26 3,-4 0,-8 -3,-4" fill="#B8860B" opacity={0.8} />
        <polygon points="0,26 3,4 0,8 -3,4" fill="#F5F0E8" opacity={0.3} />
        <circle cx={0} cy={0} r={3} fill="none" stroke="#F5F0E8" strokeWidth={0.8} opacity={0.4} />
      </g>
    </g>
  );
};

/* ─── Topographic contour lines ─── */
const ContourLines = () => (
  <g fill="none" stroke="#2a2a1a">
    {/* Cluster 1 — upper left, broad elevation */}
    <ellipse cx={200} cy={200} rx={85} ry={52} transform="rotate(-15 200 200)" strokeWidth={0.6} opacity={0.28} />
    <ellipse cx={200} cy={200} rx={62} ry={36} transform="rotate(-15 200 200)" strokeWidth={0.5} opacity={0.24} />
    <ellipse cx={200} cy={200} rx={38} ry={20} transform="rotate(-12 200 200)" strokeWidth={0.4} opacity={0.2} />
    {/* Cluster 2 — center right, tighter peak */}
    <ellipse cx={700} cy={300} rx={95} ry={58} transform="rotate(10 700 300)" strokeWidth={0.7} opacity={0.32} />
    <ellipse cx={700} cy={300} rx={68} ry={40} transform="rotate(10 700 300)" strokeWidth={0.5} opacity={0.26} />
    <ellipse cx={700} cy={300} rx={42} ry={24} transform="rotate(8 700 300)" strokeWidth={0.4} opacity={0.2} />
    <ellipse cx={700} cy={300} rx={18} ry={9} transform="rotate(8 700 300)" strokeWidth={0.4} opacity={0.16} />
    {/* Cluster 3 — lower center */}
    <ellipse cx={450} cy={500} rx={105} ry={48} transform="rotate(-8 450 500)" strokeWidth={0.6} opacity={0.28} />
    <ellipse cx={450} cy={500} rx={72} ry={32} transform="rotate(-8 450 500)" strokeWidth={0.5} opacity={0.22} />
    <ellipse cx={450} cy={500} rx={40} ry={16} transform="rotate(-6 450 500)" strokeWidth={0.4} opacity={0.18} />
    {/* Cluster 4 — upper right, subtle plateau */}
    <ellipse cx={820} cy={140} rx={70} ry={35} transform="rotate(20 820 140)" strokeWidth={0.5} opacity={0.2} />
    <ellipse cx={820} cy={140} rx={45} ry={20} transform="rotate(22 820 140)" strokeWidth={0.4} opacity={0.16} />
    {/* Cluster 5 — lower left saddle */}
    <ellipse cx={130} cy={520} rx={60} ry={30} transform="rotate(-5 130 520)" strokeWidth={0.5} opacity={0.22} />
    <ellipse cx={130} cy={520} rx={35} ry={16} transform="rotate(-5 130 520)" strokeWidth={0.4} opacity={0.18} />
    {/* Cluster 6 — mid-upper */}
    <path d="M380 160 Q420 140 460 155 Q500 170 540 150 Q560 142 580 155" strokeWidth={0.5} opacity={0.2} />
    <path d="M390 175 Q430 155 470 170 Q510 185 545 168" strokeWidth={0.4} opacity={0.16} />
    {/* Cluster 7 — far right valley */}
    <path d="M870 350 Q890 330 920 345 Q940 360 960 340" strokeWidth={0.5} opacity={0.24} />
    <path d="M875 365 Q895 345 925 360 Q945 375 960 358" strokeWidth={0.4} opacity={0.18} />
    {/* Cluster 8 — lower right */}
    <ellipse cx={750} cy={540} rx={55} ry={28} transform="rotate(12 750 540)" strokeWidth={0.5} opacity={0.2} />
    <ellipse cx={750} cy={540} rx={30} ry={14} transform="rotate(12 750 540)" strokeWidth={0.4} opacity={0.16} />

    {/* Wandering cross-map contour lines */}
    <path d="M50 350 Q150 320 250 340 Q350 360 450 330 Q550 300 650 320 Q750 340 900 310" strokeWidth={0.6} opacity={0.24} />
    <path d="M100 420 Q200 400 320 410 Q440 425 560 400 Q680 380 800 410 Q880 425 960 405" strokeWidth={0.5} opacity={0.2} />
    <path d="M80 150 Q180 130 300 160 Q400 180 500 150 Q600 120 750 160 Q850 180 950 150" strokeWidth={0.6} opacity={0.26} />
    <path d="M120 550 Q250 530 380 560 Q500 580 630 540 Q750 510 900 550" strokeWidth={0.5} opacity={0.2} />
    <path d="M40 260 Q140 240 260 265 Q380 285 480 255 Q580 230 700 260 Q800 280 920 250" strokeWidth={0.4} opacity={0.18} />
    <path d="M60 480 Q180 460 300 485 Q420 505 540 475 Q660 450 780 480 Q880 500 960 470" strokeWidth={0.5} opacity={0.22} />
    <path d="M30 100 Q150 85 280 105 Q400 125 520 95 Q640 70 780 100 Q880 115 970 90" strokeWidth={0.4} opacity={0.16} />
    <path d="M50 600 Q200 585 350 610 Q500 630 650 595 Q800 570 950 600" strokeWidth={0.4} opacity={0.16} />
  </g>
);

/* ─── Hatching pattern terrain ─── */
const TerrainHatching = () => (
  <g stroke="#1a1a0e">
    {/* Diagonal hatching clusters */}
    {[
      { cx: 100, cy: 300, r: 60, op: 0.12 },
      { cx: 850, cy: 150, r: 50, op: 0.1 },
      { cx: 500, cy: 580, r: 70, op: 0.12 },
      { cx: 350, cy: 120, r: 45, op: 0.1 },
      { cx: 750, cy: 480, r: 55, op: 0.12 },
      { cx: 920, cy: 400, r: 45, op: 0.1 },
      { cx: 60, cy: 550, r: 40, op: 0.08 },
    ].map(({ cx, cy, r, op }, ci) =>
      Array.from({ length: 14 }).map((_, i) => {
        const offset = (i - 7) * 7;
        return (
          <line
            key={`h-${ci}-${i}`}
            x1={cx + offset - r * 0.5}
            y1={cy - r * 0.5}
            x2={cx + offset + r * 0.5}
            y2={cy + r * 0.5}
            strokeWidth={0.4}
            opacity={op}
          />
        );
      })
    )}

    {/* Cross-hatching in lower areas (perpendicular overlay) */}
    {[
      { cx: 500, cy: 580, r: 55 },
      { cx: 100, cy: 300, r: 45 },
    ].map(({ cx, cy, r }, ci) =>
      Array.from({ length: 10 }).map((_, i) => {
        const offset = (i - 5) * 8;
        return (
          <line
            key={`xh-${ci}-${i}`}
            x1={cx - r * 0.5}
            y1={cy + offset - r * 0.5}
            x2={cx + r * 0.5}
            y2={cy + offset + r * 0.5}
            strokeWidth={0.3}
            opacity={0.08}
          />
        );
      })
    )}

    {/* Hill marks — short curved strokes ⌢ */}
    {[
      { x: 220, y: 180 }, { x: 235, y: 188 }, { x: 210, y: 192 },
      { x: 700, y: 270 }, { x: 715, y: 278 }, { x: 690, y: 282 }, { x: 705, y: 290 },
      { x: 455, y: 470 }, { x: 440, y: 478 }, { x: 465, y: 482 },
      { x: 820, y: 120 }, { x: 835, y: 128 },
      { x: 150, y: 400 }, { x: 165, y: 408 }, { x: 140, y: 412 },
    ].map(({ x, y }, i) => (
      <path key={`hill-${i}`} d={`M${x-8} ${y} Q${x} ${y-6} ${x+8} ${y}`} fill="none" strokeWidth={0.5} opacity={0.2} />
    ))}

    {/* Forest dot clusters — near Projects/pine and scattered */}
    {[
      // Dense cluster near Projects (680, 260)
      { cx: 650, cy: 240 }, { cx: 655, cy: 248 }, { cx: 660, cy: 235 },
      { cx: 668, cy: 245 }, { cx: 645, cy: 252 }, { cx: 672, cy: 255 },
      { cx: 658, cy: 260 }, { cx: 665, cy: 230 }, { cx: 648, cy: 228 },
      { cx: 675, cy: 238 }, { cx: 642, cy: 242 }, { cx: 670, cy: 248 },
      // Scattered elsewhere
      { cx: 300, cy: 180 }, { cx: 308, cy: 185 }, { cx: 295, cy: 190 },
      { cx: 310, cy: 175 }, { cx: 303, cy: 195 },
      { cx: 550, cy: 350 }, { cx: 558, cy: 355 }, { cx: 545, cy: 360 },
      { cx: 560, cy: 345 }, { cx: 553, cy: 365 }, { cx: 548, cy: 340 },
      { cx: 880, cy: 320 }, { cx: 888, cy: 325 }, { cx: 875, cy: 330 },
      { cx: 120, cy: 480 }, { cx: 128, cy: 485 }, { cx: 115, cy: 490 },
    ].map(({ cx, cy }, i) => (
      <circle key={`dot-${i}`} cx={cx} cy={cy} r={1.2} fill="#1a1a0e" stroke="none" opacity={0.16} />
    ))}

    {/* Ridge line marks — short parallel dashes */}
    {[
      { x: 180, y: 210, angle: -15 },
      { x: 190, y: 215, angle: -15 },
      { x: 200, y: 220, angle: -15 },
      { x: 720, y: 310, angle: 10 },
      { x: 730, y: 315, angle: 10 },
      { x: 740, y: 320, angle: 10 },
      { x: 460, y: 510, angle: -8 },
      { x: 470, y: 515, angle: -8 },
      { x: 480, y: 520, angle: -8 },
    ].map(({ x, y, angle }, i) => (
      <line key={`ridge-${i}`} x1={x} y1={y} x2={x + 10} y2={y} strokeWidth={0.5} opacity={0.2} transform={`rotate(${angle} ${x+5} ${y})`} />
    ))}
  </g>
);

/* ─── Elevation marks ─── */
const ElevationMarks = () => (
  <g fill="#F5F0E8" fontFamily="monospace" fontSize={5} opacity={0.3}>
    <text x={220} y={215}>2,847</text>
    <text x={710} y={285}>3,102</text>
    <text x={460} y={490}>1,956</text>
    <text x={130} y={380}>2,201</text>
    <text x={800} y={420}>2,688</text>
    <text x={830} y={130}>2,440</text>
    <text x={140} y={530}>1,780</text>
    <text x={560} y={360}>2,115</text>
  </g>
);

/* ─── Ink border ─── */
const MapBorder = () => (
  <g fill="none" stroke="#F5F0E8" opacity={0.2}>
    <rect x={10} y={10} width={980} height={630} strokeWidth={1.5} />
    <rect x={14} y={14} width={972} height={622} strokeWidth={0.4} />
  </g>
);

/* ─── Trail paths connecting landmarks ─── */
const TrailPaths = () => (
  <g fill="none" stroke="#2a2a1a" strokeWidth={0.8}>
    {/* Story → Projects */}
    <path d="M295 200 Q340 210 400 225 Q480 240 550 250 Q600 255 665 260" strokeDasharray="3 5" opacity={0.2} />
    {/* Story → Network */}
    <path d="M265 205 Q240 250 220 300 Q200 340 180 380 Q170 400 165 415" strokeDasharray="3 5" opacity={0.18} />
    {/* Network → Content */}
    <path d="M180 430 Q230 445 290 460 Q360 475 420 480 Q470 482 510 480" strokeDasharray="3 5" opacity={0.2} />
    {/* Content → Blueprints */}
    <path d="M540 485 Q580 490 630 495 Q680 498 720 500 Q750 502 770 500" strokeDasharray="3 5" opacity={0.18} />
    {/* Projects → Blueprints */}
    <path d="M690 275 Q710 320 730 370 Q750 410 760 450 Q770 475 775 495" strokeDasharray="3 5" opacity={0.2} />
    {/* Story → Content (long trail) */}
    <path d="M285 210 Q300 260 330 320 Q370 380 420 430 Q460 460 510 475" strokeDasharray="2 6" opacity={0.14} />

    {/* River — main channel */}
    <path d="M300 50 Q310 120 280 200 Q260 280 290 360 Q320 440 350 550 Q370 600 380 650" stroke="#1a2a2a" strokeWidth={0.8} opacity={0.16} />
    {/* Tributary fork */}
    <path d="M290 360 Q250 380 220 420 Q195 460 180 520 Q170 560 165 620" stroke="#1a2a2a" strokeWidth={0.5} opacity={0.12} />
  </g>
);

/* ─── Main Component ─── */
const MapPage = () => {
  const navigate = useNavigate();
  const compassHeading = useCompassHeading();
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);

  // Parallax
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>();

  // Logo entrance sequence
  const [showLogo, setShowLogo] = useState(true);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoComplete, setLogoComplete] = useState(false);
  const [fadeBackground, setFadeBackground] = useState(false);
  const [shrinkToCorner, setShrinkToCorner] = useState(false);

  // Logo animation sequence — fast
  useEffect(() => {
    const startTime = Date.now();
    const duration = 600;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / duration) * 100);
      setLogoProgress(p);
      if (p < 100) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (logoProgress >= 99.5 && !logoComplete) {
      setLogoComplete(true);
    }
  }, [logoProgress, logoComplete]);

  useEffect(() => {
    if (logoComplete) {
      const t = setTimeout(() => setFadeBackground(true), 200);
      return () => clearTimeout(t);
    }
  }, [logoComplete]);

  useEffect(() => {
    if (fadeBackground) {
      const t1 = setTimeout(() => setShrinkToCorner(true), 50);
      const t2 = setTimeout(() => { setShowContent(true); }, 300);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [fadeBackground]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseTarget.current = { x: nx * 8, y: ny * 8 };
  }, []);

  useEffect(() => {
    const tick = () => {
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.04;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.04;
      if (svgRef.current) {
        svgRef.current.style.transform = `translate(${mouseCurrent.current.x}px, ${mouseCurrent.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const trianglePerimeter = 600;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden cursor-crosshair"
      style={{ backgroundColor: '#000000' }}
      onMouseMove={handleMouseMove}
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.08,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Logo entrance */}
      <AnimatePresence>
        {showLogo && (
          <>
            <motion.div
              className="fixed inset-0 z-[99] bg-black pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: fadeBackground ? 0 : 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <motion.div
              className={`fixed inset-0 z-[100] flex items-center justify-center ${shrinkToCorner ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
              onClick={() => shrinkToCorner && navigate('/')}
              animate={shrinkToCorner ? {
                x: 'calc(-50vw + 64px)',
                y: 'calc(-50vh + 48px)',
              } : { x: 0, y: 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className="relative w-48 h-48"
                animate={shrinkToCorner ? { scale: 0.33 } : { scale: 1 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              >
                <svg viewBox="0 0 500 500" className="w-full h-full">
                  <path
                    d="M250,90 L375,315 L125,315 Z"
                    fill="none"
                    stroke="rgba(245,240,232,0.15)"
                    strokeWidth="2"
                    strokeLinejoin="miter"
                  />
                  <path
                    d="M250,90 L375,315 L125,315 Z"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray={trianglePerimeter}
                    strokeDashoffset={trianglePerimeter - (trianglePerimeter * Math.min(logoProgress, 100)) / 100}
                    strokeLinejoin="miter"
                    pathLength={trianglePerimeter}
                  />
                </svg>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: logoComplete ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <svg viewBox="0 0 500 500" className="w-full h-full">
                    <path d="M295.124 178.588V179.588H246.45L221.333 297.588H242.75L253.12 248.628H305.724V228.208H257.497L263.49 200.008H306.444H306.999V201.008H264.299L258.731 227.208H306.724V249.628H253.929L243.559 298.588H220.097L220.225 297.983L245.639 178.588H295.124Z" fill="white"/>
                    <path d="M295.124 179.588H246.45L221.333 297.588H242.75L253.12 248.628H305.724V228.208H257.497L263.49 200.008H306.444L295.124 179.588Z" fill="white"/>
                    <path d="M295.124 178.588V179.588L306.444 200.008H306.999L295.124 178.588Z" fill="white"/>
                    <path d="M252 178.588V200.668H240.515L227.339 262.492L227.338 262.495C225.858 269.213 223.862 275.036 221.345 279.956L221.344 279.955C218.937 284.766 215.895 288.732 212.212 291.84C208.529 294.947 204.218 297.244 199.284 298.736C194.355 300.226 188.751 300.968 182.479 300.968C177.672 300.968 173.253 300.28 169.228 298.9C165.203 297.52 161.688 295.505 158.688 292.852L158.681 292.845C155.795 290.191 153.49 286.961 151.765 283.165L151.761 283.156L151.757 283.148C150.84 280.922 150.186 278.514 149.791 275.927L150.779 275.777C151.162 278.285 151.795 280.609 152.675 282.751L152.995 283.434C154.629 286.82 156.75 289.71 159.356 292.108C162.249 294.666 165.646 296.616 169.552 297.955C173.46 299.295 177.767 299.968 182.479 299.968C188.674 299.968 194.178 299.235 198.995 297.779C203.808 296.324 207.997 294.089 211.567 291.076C215.136 288.065 218.099 284.21 220.452 279.504L220.912 278.584C223.169 273.952 224.987 268.519 226.361 262.28L239.62 200.063L239.705 199.668H251V179.588H205.42V199.668H218.287L204.898 262.489C203.749 268.006 201.498 272.305 198.113 275.34C194.725 278.377 190.523 279.887 185.54 279.887C181.161 279.887 177.735 278.85 175.345 276.699L175.335 276.69C172.947 274.421 171.779 271.274 171.779 267.318C171.779 265.585 171.953 263.906 172.301 262.283L174.553 251.668H164.171V250.668H175.787L175.658 251.271L173.278 262.491C172.946 264.042 172.779 265.652 172.779 267.318C172.779 271.066 173.878 273.924 176.021 275.962C178.163 277.887 181.31 278.887 185.54 278.887C190.304 278.887 194.26 277.451 197.445 274.595C200.634 271.737 202.803 267.649 203.92 262.286L203.921 262.283L217.052 200.668H204.42V178.588H252Z" fill="white"/>
                    <path d="M150.779 275.777C151.162 278.285 151.795 280.609 152.675 282.751L152.995 283.434C154.629 286.82 156.75 289.71 159.356 292.108C162.249 294.666 165.646 296.616 169.552 297.955C173.46 299.295 177.767 299.968 182.479 299.968C188.674 299.968 194.178 299.235 198.995 297.779C203.808 296.324 207.997 294.089 211.567 291.076C215.136 288.065 218.099 284.21 220.452 279.504L220.912 278.584C223.169 273.952 224.987 268.519 226.361 262.28L239.62 200.063L239.705 199.668H251V179.588H205.42V199.668H218.287L204.898 262.489C203.749 268.006 201.498 272.305 198.113 275.34C194.725 278.377 190.523 279.887 185.54 279.887C181.161 279.887 177.735 278.85 175.345 276.699L175.335 276.69C172.947 274.421 171.779 271.274 171.779 267.318C171.779 265.585 171.953 263.906 172.301 262.283L174.553 251.668H164.171L150.779 275.777Z" fill="white"/>
                    <path d="M149.791 275.927L150.779 275.777L164.171 251.668V250.668L149.791 275.927Z" fill="white"/>
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Map SVG */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1000 650"
          className="w-[80vw] h-[80vh] max-w-[80vw] max-h-[80vh]"
          preserveAspectRatio="xMidYMid meet"
          style={{ willChange: 'transform' }}
        >
          <defs>
            {/* Paper grain filter — sepia-tinted noise */}
            <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" stitchTiles="stitch" result="noise" />
              <feColorMatrix type="matrix" in="noise" result="tinted"
                values="0.16 0 0 0 0
                        0.14 0 0 0 0
                        0.06 0 0 0 0
                        0 0 0 0.06 0" />
            </filter>
            {/* Hatching pattern — primary diagonal */}
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1={0} y1={0} x2={0} y2={6} stroke="#1a1a0e" strokeWidth={0.3} opacity={0.16} />
            </pattern>
            {/* Hatching pattern — cross angle for forest areas */}
            <pattern id="hatch-cross" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
              <line x1={0} y1={0} x2={0} y2={5} stroke="#1a1a0e" strokeWidth={0.25} opacity={0.12} />
            </pattern>
            {/* Vignette radial gradient */}
            <radialGradient id="vignette" cx="50%" cy="50%" r="55%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </radialGradient>
          </defs>

          {/* Background hatching fill */}
          <rect x={15} y={15} width={970} height={620} fill="url(#hatch)" />
          {/* Cross-hatch in forest areas */}
          <rect x={600} y={200} width={180} height={120} fill="url(#hatch-cross)" />
          <rect x={260} y={150} width={120} height={90} fill="url(#hatch-cross)" />

          {/* Vignette overlay — sits above base fill */}
          <rect x={10} y={10} width={980} height={630} fill="url(#vignette)" opacity={0.35} />

          {/* Map border */}
          <MapBorder />

          {/* Terrain features */}
          <ContourLines />
          <TerrainHatching />
          <TrailPaths />
          <ElevationMarks />

          {/* Paper grain texture overlay — above terrain, below landmarks */}
          <rect x={10} y={10} width={980} height={630} filter="url(#paper-grain)" />

          {/* Title cartouche */}
          <g opacity={0.3}>
            <rect x={380} y={20} width={240} height={30} fill="none" stroke="#F5F0E8" strokeWidth={0.6} />
            <text x={500} y={40} textAnchor="middle" fill="#F5F0E8" fontSize={9} fontFamily="monospace" letterSpacing={4}>
              JAMES FLOYD'S WORLD
            </text>
          </g>

          {/* Landmarks */}
          {LANDMARKS.map((lm) => (
            <g
              key={lm.id}
              transform={`translate(${lm.x}, ${lm.y})`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredLandmark(lm.id)}
              onMouseLeave={() => setHoveredLandmark(null)}
              onClick={() => navigate(lm.route)}
              style={{ pointerEvents: 'all' }}
            >
              {/* Hit area */}
              <rect x={-30} y={-30} width={60} height={60} fill="transparent" />

              {/* Icon */}
              <g opacity={hoveredLandmark === lm.id ? 1 : 0.6} style={{ transition: 'opacity 0.3s ease' }}>
                <LandmarkIcon id={lm.id} />
              </g>

              {/* Label */}
              <text
                y={28}
                textAnchor="middle"
                fill="#F5F0E8"
                fontSize={8}
                fontFamily="monospace"
                letterSpacing={2}
                opacity={hoveredLandmark === lm.id ? 0.9 : 0.35}
                style={{ transition: 'opacity 0.3s ease', textTransform: 'uppercase' }}
              >
                {lm.label}
              </text>

              {/* Tooltip */}
              {hoveredLandmark === lm.id && (
                <g>
                  <rect
                    x={-70}
                    y={36}
                    width={140}
                    height={18}
                    rx={1}
                    fill="rgba(0,0,0,0.7)"
                    stroke="#F5F0E8"
                    strokeWidth={0.3}
                    opacity={0.8}
                  />
                  <text
                    y={48}
                    textAnchor="middle"
                    fill="#F5F0E8"
                    fontSize={6}
                    fontFamily="monospace"
                    opacity={0.7}
                  >
                    {lm.descriptor}
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* Compass */}
          <CompassRose heading={compassHeading} />
        </svg>
      </motion.div>
    </div>
  );
};

export default MapPage;
