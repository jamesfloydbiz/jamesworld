import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Compass ─── */
const useCompassHeading = () => {
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
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
    descriptor: 'A biography told as a timeline',
    x: 280,
    y: 190,
  },
  {
    id: 'projects',
    route: '/projects',
    label: 'Projects',
    descriptor: 'Active work and initiatives',
    x: 680,
    y: 260,
  },
  {
    id: 'network',
    route: '/network',
    label: 'Network',
    descriptor: 'Connect and reach out',
    x: 160,
    y: 420,
  },
  {
    id: 'content',
    route: '/content',
    label: 'Content',
    descriptor: 'Writing, media, and archive',
    x: 520,
    y: 480,
  },
  {
    id: 'blueprints',
    route: '/blueprints',
    label: 'Blueprints',
    descriptor: 'Systems, models, and processes',
    x: 790,
    y: 500,
  },
];

/* ─── SVG icon drawings — dark ink on parchment ─── */
const LandmarkIcon = ({ id }: { id: string }) => {
  const stroke = '#2a2218';
  const sw = 1.2;
  switch (id) {
    case 'story':
      return (
        <g>
          <rect x={-12} y={-6} width={24} height={16} rx={1} fill="none" stroke={stroke} strokeWidth={sw} />
          <line x1={0} y1={-6} x2={0} y2={10} stroke={stroke} strokeWidth={0.8} />
          <path d="M-4 -14 Q-2 -20 0 -16 Q2 -20 4 -14 Q2 -10 0 -12 Q-2 -10 -4 -14Z" fill="none" stroke="#8B6914" strokeWidth={sw} />
          <line x1={-3} y1={-8} x2={3} y2={-8} stroke="#8B6914" strokeWidth={0.6} opacity={0.5} />
        </g>
      );
    case 'projects':
      return (
        <g>
          {/* Tree trunk behind backpack */}
          <line x1={10} y1={-20} x2={10} y2={14} stroke="#3d3020" strokeWidth={sw} />
          <path d="M4 -8 L10 -16 L16 -8" fill="none" stroke="#3d3020" strokeWidth={sw} />
          <path d="M5 -2 L10 -10 L15 -2" fill="none" stroke="#3d3020" strokeWidth={sw} />
          {/* Backpack leaning against tree — shifted left and tilted */}
          <g transform="rotate(-12, 0, 6)">
            <rect x={-10} y={-4} width={14} height={16} rx={3} fill="none" stroke={stroke} strokeWidth={sw} />
            <path d="M-6 -4 Q-6 -10 -3 -10 Q0 -10 0 -4" fill="none" stroke={stroke} strokeWidth={sw} />
            <line x1={-5} y1={4} x2={1} y2={4} stroke={stroke} strokeWidth={0.6} />
          </g>
        </g>
      );
    case 'network':
      return (
        <g>
          <path d="M-24 8 L-12 -14 L-4 -4 L4 -18 L16 -6 L24 8" fill="none" stroke={stroke} strokeWidth={sw} />
          <path d="M-18 8 L-8 -6 L0 0 L8 -10 L18 8" fill="none" stroke={stroke} strokeWidth={0.6} opacity={0.4} />
          <circle cx={4} cy={-18} r={2} fill="none" stroke="#8B6914" strokeWidth={sw} />
        </g>
      );
    case 'content':
      return (
        <g>
          <ellipse cx={0} cy={10} rx={18} ry={5} fill="none" stroke={stroke} strokeWidth={0.6} opacity={0.4} />
          <rect x={-14} y={-6} width={12} height={16} rx={1} fill="none" stroke={stroke} strokeWidth={sw} transform="rotate(-5)" />
          <rect x={2} y={-6} width={12} height={16} rx={1} fill="none" stroke={stroke} strokeWidth={sw} transform="rotate(5)" />
          {/* Spiral binding between pages */}
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse key={`sp-${i}`} cx={-1} cy={-4 + i * 3} rx={1.8} ry={1} fill="none" stroke={stroke} strokeWidth={0.4} opacity={0.5} />
          ))}
          <line x1={-10} y1={0} x2={-4} y2={0} stroke={stroke} strokeWidth={0.4} opacity={0.5} />
          <line x1={-10} y1={3} x2={-5} y2={3} stroke={stroke} strokeWidth={0.4} opacity={0.5} />
          <line x1={-10} y1={6} x2={-6} y2={6} stroke={stroke} strokeWidth={0.4} opacity={0.5} />
        </g>
      );
    case 'blueprints':
      return (
        <g>
          {/* Post/pole centered */}
          <line x1={0} y1={-22} x2={0} y2={16} stroke="#3d3020" strokeWidth={2} />
          {/* Blueprint paper centered on post, tacked at top */}
          <rect x={-10} y={-14} width={20} height={24} rx={0} fill="none" stroke={stroke} strokeWidth={sw} />
          <circle cx={0} cy={-14} r={2} fill="#8B6914" stroke="#8B6914" strokeWidth={0.5} />
          {/* Grid lines */}
          <line x1={-6} y1={-6} x2={6} y2={-6} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
          <line x1={-6} y1={0} x2={6} y2={0} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
          <line x1={-6} y1={6} x2={6} y2={6} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
          <line x1={-3} y1={-10} x2={-3} y2={8} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
          <line x1={3} y1={-10} x2={3} y2={8} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
        </g>
      );
    default:
      return null;
  }
};

/* ─── Compass Rose — dark ink, reduced opacity ─── */
const CompassRose = ({ heading }: { heading: number | null }) => {
  const rotation = heading != null ? -heading : 0;
  const ink = '#2a2218';
  return (
    <g transform="translate(900, 580)" opacity={0.75} style={{ pointerEvents: 'none' as const }}>
      <circle cx={0} cy={0} r={36} fill="none" stroke={ink} strokeWidth={0.8} opacity={0.5} />
      <circle cx={0} cy={0} r={32} fill="none" stroke={ink} strokeWidth={0.4} opacity={0.35} />
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
            stroke={ink}
            strokeWidth={i % 4 === 0 ? 1 : 0.4}
            opacity={i % 4 === 0 ? 0.8 : 0.5}
          />
        );
      })}
      <text x={0} y={-40} textAnchor="middle" fill={ink} fontSize={9} fontFamily="monospace" opacity={0.7}>N</text>
      <text x={42} y={2} textAnchor="middle" fill={ink} fontSize={7.5} fontFamily="monospace" opacity={0.5}>E</text>
      <text x={0} y={46} textAnchor="middle" fill={ink} fontSize={7.5} fontFamily="monospace" opacity={0.5}>S</text>
      <text x={-42} y={2} textAnchor="middle" fill={ink} fontSize={7.5} fontFamily="monospace" opacity={0.5}>W</text>
      <g transform={`rotate(${rotation})`} style={{ transition: heading != null ? 'transform 0.3s ease-out' : 'none' }}>
        <polygon points="0,-26 3,-4 0,-8 -3,-4" fill="#8B6914" opacity={0.8} />
        <polygon points="0,26 3,4 0,8 -3,4" fill={ink} opacity={0.3} />
        <circle cx={0} cy={0} r={3} fill="none" stroke={ink} strokeWidth={0.8} opacity={0.4} />
      </g>
    </g>
  );
};

/* ─── Topographic contour lines — faded ink ─── */
const ContourLines = () => (
  <g fill="none" stroke="#2a2a1a" style={{ pointerEvents: 'none' as const }}>
    <ellipse cx={200} cy={200} rx={85} ry={52} transform="rotate(-15 200 200)" strokeWidth={0.6} opacity={0.2} />
    <ellipse cx={200} cy={200} rx={62} ry={36} transform="rotate(-15 200 200)" strokeWidth={0.5} opacity={0.18} />
    <ellipse cx={200} cy={200} rx={38} ry={20} transform="rotate(-12 200 200)" strokeWidth={0.4} opacity={0.15} />
    <ellipse cx={700} cy={300} rx={95} ry={58} transform="rotate(10 700 300)" strokeWidth={0.7} opacity={0.22} />
    <ellipse cx={700} cy={300} rx={68} ry={40} transform="rotate(10 700 300)" strokeWidth={0.5} opacity={0.18} />
    <ellipse cx={700} cy={300} rx={42} ry={24} transform="rotate(8 700 300)" strokeWidth={0.4} opacity={0.15} />
    <ellipse cx={700} cy={300} rx={18} ry={9} transform="rotate(8 700 300)" strokeWidth={0.4} opacity={0.12} />
    <ellipse cx={450} cy={500} rx={105} ry={48} transform="rotate(-8 450 500)" strokeWidth={0.6} opacity={0.2} />
    <ellipse cx={450} cy={500} rx={72} ry={32} transform="rotate(-8 450 500)" strokeWidth={0.5} opacity={0.16} />
    <ellipse cx={450} cy={500} rx={40} ry={16} transform="rotate(-6 450 500)" strokeWidth={0.4} opacity={0.13} />
    <ellipse cx={820} cy={140} rx={70} ry={35} transform="rotate(20 820 140)" strokeWidth={0.5} opacity={0.15} />
    <ellipse cx={820} cy={140} rx={45} ry={20} transform="rotate(22 820 140)" strokeWidth={0.4} opacity={0.12} />
    <ellipse cx={130} cy={520} rx={60} ry={30} transform="rotate(-5 130 520)" strokeWidth={0.5} opacity={0.16} />
    <ellipse cx={130} cy={520} rx={35} ry={16} transform="rotate(-5 130 520)" strokeWidth={0.4} opacity={0.13} />
    <path d="M380 160 Q420 140 460 155 Q500 170 540 150 Q560 142 580 155" strokeWidth={0.5} opacity={0.15} />
    <path d="M390 175 Q430 155 470 170 Q510 185 545 168" strokeWidth={0.4} opacity={0.12} />
    <path d="M870 350 Q890 330 920 345 Q940 360 960 340" strokeWidth={0.5} opacity={0.18} />
    <path d="M875 365 Q895 345 925 360 Q945 375 960 358" strokeWidth={0.4} opacity={0.14} />
    <ellipse cx={750} cy={540} rx={55} ry={28} transform="rotate(12 750 540)" strokeWidth={0.5} opacity={0.15} />
    <ellipse cx={750} cy={540} rx={30} ry={14} transform="rotate(12 750 540)" strokeWidth={0.4} opacity={0.12} />
    <path d="M50 350 Q150 320 250 340 Q350 360 450 330 Q550 300 650 320 Q750 340 900 310" strokeWidth={0.6} opacity={0.18} />
    <path d="M100 420 Q200 400 320 410 Q440 425 560 400 Q680 380 800 410 Q880 425 960 405" strokeWidth={0.5} opacity={0.15} />
    <path d="M80 150 Q180 130 300 160 Q400 180 500 150 Q600 120 750 160 Q850 180 950 150" strokeWidth={0.6} opacity={0.2} />
    <path d="M120 550 Q250 530 380 560 Q500 580 630 540 Q750 510 900 550" strokeWidth={0.5} opacity={0.15} />
    <path d="M40 260 Q140 240 260 265 Q380 285 480 255 Q580 230 700 260 Q800 280 920 250" strokeWidth={0.4} opacity={0.13} />
    <path d="M60 480 Q180 460 300 485 Q420 505 540 475 Q660 450 780 480 Q880 500 960 470" strokeWidth={0.5} opacity={0.16} />
    <path d="M30 100 Q150 85 280 105 Q400 125 520 95 Q640 70 780 100 Q880 115 970 90" strokeWidth={0.4} opacity={0.12} />
    <path d="M50 600 Q200 585 350 610 Q500 630 650 595 Q800 570 950 600" strokeWidth={0.4} opacity={0.12} />
  </g>
);

/* ─── Hatching pattern terrain — faded ink ─── */
const TerrainHatching = () => (
  <g stroke="#1a1a0e" style={{ pointerEvents: 'none' as const }}>
    {[
      { cx: 100, cy: 300, r: 60, op: 0.1 },
      { cx: 850, cy: 150, r: 50, op: 0.08 },
      { cx: 500, cy: 580, r: 70, op: 0.1 },
      { cx: 350, cy: 120, r: 45, op: 0.08 },
      { cx: 750, cy: 480, r: 55, op: 0.1 },
      { cx: 920, cy: 400, r: 45, op: 0.08 },
      { cx: 60, cy: 550, r: 40, op: 0.07 },
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
            opacity={0.06}
          />
        );
      })
    )}

    {[
      { x: 220, y: 180 }, { x: 235, y: 188 }, { x: 210, y: 192 },
      { x: 700, y: 270 }, { x: 715, y: 278 }, { x: 690, y: 282 }, { x: 705, y: 290 },
      { x: 455, y: 470 }, { x: 440, y: 478 }, { x: 465, y: 482 },
      { x: 820, y: 120 }, { x: 835, y: 128 },
      { x: 150, y: 400 }, { x: 165, y: 408 }, { x: 140, y: 412 },
    ].map(({ x, y }, i) => (
      <path key={`hill-${i}`} d={`M${x-8} ${y} Q${x} ${y-6} ${x+8} ${y}`} fill="none" strokeWidth={0.5} opacity={0.15} />
    ))}

    {[
      { cx: 650, cy: 240 }, { cx: 655, cy: 248 }, { cx: 660, cy: 235 },
      { cx: 668, cy: 245 }, { cx: 645, cy: 252 }, { cx: 672, cy: 255 },
      { cx: 658, cy: 260 }, { cx: 665, cy: 230 }, { cx: 648, cy: 228 },
      { cx: 675, cy: 238 }, { cx: 642, cy: 242 }, { cx: 670, cy: 248 },
      { cx: 300, cy: 180 }, { cx: 308, cy: 185 }, { cx: 295, cy: 190 },
      { cx: 310, cy: 175 }, { cx: 303, cy: 195 },
      { cx: 550, cy: 350 }, { cx: 558, cy: 355 }, { cx: 545, cy: 360 },
      { cx: 560, cy: 345 }, { cx: 553, cy: 365 }, { cx: 548, cy: 340 },
      { cx: 880, cy: 320 }, { cx: 888, cy: 325 }, { cx: 875, cy: 330 },
      { cx: 120, cy: 480 }, { cx: 128, cy: 485 }, { cx: 115, cy: 490 },
    ].map(({ cx, cy }, i) => (
      <circle key={`dot-${i}`} cx={cx} cy={cy} r={1.2} fill="#1a1a0e" stroke="none" opacity={0.12} />
    ))}

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
      <line key={`ridge-${i}`} x1={x} y1={y} x2={x + 10} y2={y} strokeWidth={0.5} opacity={0.15} transform={`rotate(${angle} ${x+5} ${y})`} />
    ))}
  </g>
);

/* ─── Elevation marks — dark ink ─── */
const ElevationMarks = () => (
  <g fill="#2a2218" fontFamily="monospace" fontSize={6.25} opacity={0.35} style={{ pointerEvents: 'none' as const }}>
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

/* ─── Ink border — dark ─── */
const MapBorder = () => (
  <g fill="none" stroke="#2a2218" opacity={0.5} style={{ pointerEvents: 'none' as const }}>
    <rect x={10} y={10} width={980} height={630} strokeWidth={1.5} />
    <rect x={14} y={14} width={972} height={622} strokeWidth={0.4} />
  </g>
);

/* ─── Trail paths — faded ink ─── */
const TrailPaths = () => (
  <g fill="none" stroke="#2a2a1a" strokeWidth={0.8} style={{ pointerEvents: 'none' as const }}>
    <path d="M295 200 Q340 210 400 225 Q480 240 550 250 Q600 255 665 260" strokeDasharray="3 5" opacity={0.15} />
    <path d="M265 205 Q240 250 220 300 Q200 340 180 380 Q170 400 165 415" strokeDasharray="3 5" opacity={0.13} />
    <path d="M180 430 Q230 445 290 460 Q360 475 420 480 Q470 482 510 480" strokeDasharray="3 5" opacity={0.15} />
    <path d="M540 485 Q580 490 630 495 Q680 498 720 500 Q750 502 770 500" strokeDasharray="3 5" opacity={0.13} />
    <path d="M690 275 Q710 320 730 370 Q750 410 760 450 Q770 475 775 495" strokeDasharray="3 5" opacity={0.15} />
    <path d="M285 210 Q300 260 330 320 Q370 380 420 430 Q460 460 510 475" strokeDasharray="2 6" opacity={0.1} />
    <path d="M300 50 Q310 120 280 200 Q260 280 290 360 Q320 440 350 550 Q370 600 380 650" stroke="#3a4a4a" strokeWidth={0.8} opacity={0.12} />
    <path d="M290 360 Q250 380 220 420 Q195 460 180 520 Q170 560 165 620" stroke="#3a4a4a" strokeWidth={0.5} opacity={0.09} />
  </g>
);

/* ─── Crease lines + edge wrinkles ─── */
const CreaseLines = () => (
  <g fill="none" style={{ pointerEvents: 'none' as const }}>
    {/* Main vertical fold */}
    <path d="M500 15 Q498 200 502 400 Q500 550 500 640" stroke="#9e8e6e" strokeWidth={0.8} opacity={0.15} />
    {/* Horizontal fold */}
    <path d="M15 325 Q200 322 500 328 Q800 324 985 325" stroke="#9e8e6e" strokeWidth={0.7} opacity={0.12} />
    {/* Secondary vertical */}
    <path d="M200 12 Q198 180 205 350 Q200 500 198 640" stroke="#9e8e6e" strokeWidth={0.5} opacity={0.08} />
    {/* Diagonal fold */}
    <path d="M50 50 Q300 200 500 325 Q700 450 950 600" stroke="#8a7a5e" strokeWidth={0.5} opacity={0.06} />
    {/* Short wrinkle lines scattered */}
    <path d="M150 100 Q160 105 175 98" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.1} />
    <path d="M720 180 Q735 175 745 182" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.08} />
    <path d="M380 550 Q400 545 415 552" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.09} />
    <path d="M850 480 Q860 475 875 480" stroke="#9e8e6e" strokeWidth={0.3} opacity={0.07} />
    <path d="M90 380 Q110 375 125 382" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.08} />
    <path d="M300 80 Q320 78 340 82 Q360 85 380 80" stroke="#8a7a5e" strokeWidth={0.3} opacity={0.06} />
    <path d="M600 560 Q630 555 660 560 Q690 565 720 558" stroke="#8a7a5e" strokeWidth={0.3} opacity={0.06} />

    {/* Edge wrinkles — crinkled paper edges, doubled and varied */}
    {/* Top edge wrinkles */}
    <path d="M80 14 Q85 18 95 13 Q105 17 115 12" stroke="#9e8e6e" strokeWidth={0.5} opacity={0.12} />
    <path d="M180 13 Q188 17 198 14" stroke="#9e8e6e" strokeWidth={0.35} opacity={0.08} />
    <path d="M280 12 Q290 18 305 11 Q315 16 325 13" stroke="#9e8e6e" strokeWidth={0.45} opacity={0.1} />
    <path d="M400 12 Q410 16 420 11 Q430 15 440 12" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.1} />
    <path d="M560 14 Q568 18 578 13" stroke="#9e8e6e" strokeWidth={0.3} opacity={0.07} />
    <path d="M680 13 Q690 17 700 12 Q708 16 718 14" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.09} />
    <path d="M750 13 Q758 17 768 12 Q775 16 785 13" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.09} />
    <path d="M900 12 Q910 16 920 13" stroke="#9e8e6e" strokeWidth={0.35} opacity={0.08} />
    {/* Bottom edge wrinkles */}
    <path d="M100 637 Q108 633 118 638" stroke="#9e8e6e" strokeWidth={0.35} opacity={0.08} />
    <path d="M200 636 Q210 632 220 637 Q230 633 240 638" stroke="#9e8e6e" strokeWidth={0.5} opacity={0.11} />
    <path d="M380 637 Q395 632 410 637" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.09} />
    <path d="M550 637 Q560 633 570 638 Q580 634 590 637" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.1} />
    <path d="M700 636 Q712 631 725 636 Q735 632 745 637" stroke="#9e8e6e" strokeWidth={0.45} opacity={0.1} />
    <path d="M850 635 Q858 631 868 636" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.09} />
    <path d="M940 636 Q948 633 958 637" stroke="#9e8e6e" strokeWidth={0.3} opacity={0.07} />
    {/* Left edge wrinkles */}
    <path d="M13 80 Q17 85 12 95" stroke="#9e8e6e" strokeWidth={0.35} opacity={0.08} />
    <path d="M13 150 Q17 155 12 165 Q16 175 13 180" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.1} />
    <path d="M14 260 Q18 268 12 278" stroke="#9e8e6e" strokeWidth={0.35} opacity={0.07} />
    <path d="M13 340 Q17 348 12 358 Q16 365 13 370" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.09} />
    <path d="M14 400 Q18 408 12 418 Q16 425 14 430" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.09} />
    <path d="M13 520 Q17 528 12 538" stroke="#9e8e6e" strokeWidth={0.35} opacity={0.08} />
    <path d="M14 590 Q18 595 12 605" stroke="#9e8e6e" strokeWidth={0.3} opacity={0.07} />
    {/* Right edge wrinkles */}
    <path d="M987 120 Q983 128 988 138" stroke="#9e8e6e" strokeWidth={0.35} opacity={0.08} />
    <path d="M987 200 Q983 208 988 218 Q984 225 987 230" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.1} />
    <path d="M986 300 Q982 308 987 318" stroke="#9e8e6e" strokeWidth={0.35} opacity={0.07} />
    <path d="M987 380 Q983 388 988 398 Q984 405 987 410" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.09} />
    <path d="M986 450 Q982 458 987 468 Q983 475 986 480" stroke="#9e8e6e" strokeWidth={0.4} opacity={0.09} />
    <path d="M987 540 Q983 548 988 558" stroke="#9e8e6e" strokeWidth={0.35} opacity={0.08} />
  </g>
);

/* ─── Edge rips — small tears along map border ─── */
const EdgeRips = () => (
  <g style={{ pointerEvents: 'none' as const }}>
    {/* Top edge rips — varied sizes and angles */}
    <path d="M180 10 L183 18 L178 16 L182 22 L176 18 L180 10" fill="#000000" stroke="none" opacity={0.7} />
    <path d="M320 10 L324 20 L319 17 L323 25 L317 20 L320 10" fill="#000000" stroke="none" opacity={0.55} />
    <path d="M520 10 L521 14 L518 13 L520 17 L516 14 L520 10" fill="#000000" stroke="none" opacity={0.5} />
    <path d="M620 10 L622 15 L618 14 L621 19 L616 16 L620 10" fill="#000000" stroke="none" opacity={0.6} />
    <path d="M850 10 L853 21 L848 18 L852 26 L845 20 L850 10" fill="#000000" stroke="none" opacity={0.65} />
    <path d="M440 10 L442 16 L439 15 L441 10" fill="#000000" stroke="none" opacity={0.4} />
    {/* Bottom edge rips */}
    <path d="M120 640 L123 631 L118 634 L122 627 L116 632 L120 640" fill="#000000" stroke="none" opacity={0.6} />
    <path d="M320 640 L323 632 L318 634 L322 628 L316 633 L320 640" fill="#000000" stroke="none" opacity={0.7} />
    <path d="M580 640 L582 636 L579 637 L581 633 L577 636 L580 640" fill="#000000" stroke="none" opacity={0.45} />
    <path d="M780 640 L782 635 L778 636 L781 631 L776 634 L780 640" fill="#000000" stroke="none" opacity={0.6} />
    <path d="M920 640 L924 630 L919 633 L923 626 L917 631 L920 640" fill="#000000" stroke="none" opacity={0.55} />
    {/* Left edge rips */}
    <path d="M10 130 L17 128 L15 132 L21 129 L17 134 L10 130" fill="#000000" stroke="none" opacity={0.55} />
    <path d="M10 280 L18 277 L16 282 L22 278 L18 284 L10 280" fill="#000000" stroke="none" opacity={0.65} />
    <path d="M10 380 L14 378 L13 381 L10 380" fill="#000000" stroke="none" opacity={0.35} />
    <path d="M10 500 L15 498 L14 502 L19 499 L16 504 L10 500" fill="#000000" stroke="none" opacity={0.55} />
    <path d="M10 580 L20 577 L17 582 L24 579 L19 585 L10 580" fill="#000000" stroke="none" opacity={0.5} />
    {/* Right edge rips */}
    <path d="M990 100 L983 98 L985 102 L979 99 L983 104 L990 100" fill="#000000" stroke="none" opacity={0.5} />
    <path d="M990 180 L982 177 L984 182 L978 179 L982 184 L990 180" fill="#000000" stroke="none" opacity={0.65} />
    <path d="M990 320 L986 318 L987 321 L990 320" fill="#000000" stroke="none" opacity={0.35} />
    <path d="M990 420 L985 418 L986 422 L981 419 L984 424 L990 420" fill="#000000" stroke="none" opacity={0.55} />
    <path d="M990 560 L981 557 L984 562 L977 559 L982 565 L990 560" fill="#000000" stroke="none" opacity={0.6} />
    {/* Corner wear — varied triangles */}
    <path d="M10 10 L10 22 L22 10 Z" fill="#000000" opacity={0.5} />
    <path d="M990 10 L990 18 L982 10 Z" fill="#000000" opacity={0.4} />
    <path d="M10 640 L10 632 L18 640 Z" fill="#000000" opacity={0.45} />
    <path d="M990 640 L990 634 L984 640 Z" fill="#000000" opacity={0.35} />
  </g>
);

/* ─── Title Cartouche — straightened, bold, classy ─── */
const TitleCartouche = () => (
  <g style={{ pointerEvents: 'none' as const }}>
    <g transform="translate(500, 35)">
      {/* Sign plaque — warm aged brass/wood tone */}
      <rect x={-155} y={-22} width={310} height={44} rx={1} fill="#b8a67a" stroke="#2a2218" strokeWidth={1.2} />
      {/* Subtle inner border — engraved frame */}
      <rect x={-150} y={-18} width={300} height={36} rx={0} fill="none" stroke="#2a2218" strokeWidth={0.3} opacity={0.3} />
      {/* Wood grain — subtle horizontal lines */}
      <line x1={-150} y1={-10} x2={150} y2={-10} stroke="#9e8e6e" strokeWidth={0.2} opacity={0.3} />
      <line x1={-148} y1={0} x2={148} y2={0} stroke="#a0906a" strokeWidth={0.15} opacity={0.2} />
      <line x1={-150} y1={10} x2={150} y2={10} stroke="#9e8e6e" strokeWidth={0.2} opacity={0.25} />

      {/* Title text — bold, imposing */}
      <text x={0} y={7} textAnchor="middle" fill="#2a2218" fontSize={14} fontFamily="monospace" letterSpacing={5} fontWeight="bold" opacity={0.85}>
        JAMES FLOYD'S WORLD
      </text>

      {/* Nails — top left */}
      <circle cx={-142} cy={-12} r={3} fill="#5a5040" stroke="#3a3020" strokeWidth={0.6} />
      <circle cx={-142} cy={-12} r={1.3} fill="#7a7060" />
      <circle cx={-142} cy={-12.5} r={0.5} fill="#9a9080" opacity={0.7} />

      {/* Nails — top right */}
      <circle cx={142} cy={-12} r={3} fill="#5a5040" stroke="#3a3020" strokeWidth={0.6} />
      <circle cx={142} cy={-12} r={1.3} fill="#7a7060" />
      <circle cx={142} cy={-12.5} r={0.5} fill="#9a9080" opacity={0.7} />

      {/* Nails — bottom left */}
      <circle cx={-142} cy={12} r={2.5} fill="#5a5040" stroke="#3a3020" strokeWidth={0.5} />
      <circle cx={-142} cy={12} r={1} fill="#7a7060" />
      <circle cx={-142} cy={11.5} r={0.4} fill="#9a9080" opacity={0.6} />

      {/* Nails — bottom right */}
      <circle cx={142} cy={12} r={2.5} fill="#5a5040" stroke="#3a3020" strokeWidth={0.5} />
      <circle cx={142} cy={12} r={1} fill="#7a7060" />
      <circle cx={142} cy={11.5} r={0.4} fill="#9a9080" opacity={0.6} />
    </g>
  </g>
);

/* ─── Character cursor SVG as data URI ─── */
const CHARACTER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='26' viewBox='0 0 14 26'%3E%3Ccircle cx='7' cy='3.5' r='3.5' fill='%232a2218'/%3E%3Cellipse cx='7' cy='16' rx='3.5' ry='8' fill='%232a2218'/%3E%3C/svg%3E") 7 26, crosshair`;

/* ─── Footstep type ─── */
interface Footstep {
  id: number;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  side: number; // 0=left, 1=right for alternating feet
}

/* ─── Main Component ─── */
const MapPage = () => {
  const navigate = useNavigate();
  const compassHeading = useCompassHeading();
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [footsteps, setFootsteps] = useState<Footstep[]>([]);
  const footstepIdRef = useRef(0);
  const lastFootstepPos = useRef({ x: 0, y: 0 });
  const footstepSide = useRef(0);
  const [isOnMap, setIsOnMap] = useState(false);

  // 3D tilt
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  // Logo entrance sequence
  const [showLogo, setShowLogo] = useState(true);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoComplete, setLogoComplete] = useState(false);
  const [fadeBackground, setFadeBackground] = useState(false);
  const [shrinkToCorner, setShrinkToCorner] = useState(false);

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

  // Fade out footsteps
  useEffect(() => {
    const interval = setInterval(() => {
      setFootsteps(prev => {
        const updated = prev
          .map(f => ({ ...f, opacity: f.opacity - 0.008 }))
          .filter(f => f.opacity > 0);
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseTarget.current = { x: -nx * 3, y: ny * 3 };

    // Footsteps — alternating left/right behind cursor
    const dx = e.clientX - lastFootstepPos.current.x;
    const dy = e.clientY - lastFootstepPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 25 && isOnMap) {
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      // Offset perpendicular for left/right foot
      const perpAngle = Math.atan2(dy, dx) + (footstepSide.current === 0 ? Math.PI / 2 : -Math.PI / 2);
      const offsetDist = 4;
      const fx = e.clientX - dx * 0.5 + Math.cos(perpAngle) * offsetDist;
      const fy = e.clientY - dy * 0.5 + Math.sin(perpAngle) * offsetDist;

      footstepIdRef.current += 1;
      setFootsteps(prev => [
        ...prev.slice(-30),
        { id: footstepIdRef.current, x: fx, y: fy, rotation: angle, opacity: 0.35, side: footstepSide.current },
      ]);
      footstepSide.current = footstepSide.current === 0 ? 1 : 0;
      lastFootstepPos.current = { x: e.clientX, y: e.clientY };
    }
  }, [isOnMap]);

  useEffect(() => {
    const tick = () => {
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.04;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.04;
      if (svgWrapperRef.current) {
        svgWrapperRef.current.style.transform = `perspective(1200px) rotateX(${mouseCurrent.current.y}deg) rotateY(${mouseCurrent.current.x}deg)`;
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
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: '#000000', cursor: isOnMap ? CHARACTER_CURSOR : 'crosshair' }}
      onMouseMove={handleMouseMove}
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.12,
          mixBlendMode: 'multiply',
        }}
      />

      {/* Footsteps — visible, alternating left/right */}
      {footsteps.map(f => (
        <div
          key={f.id}
          className="fixed pointer-events-none z-20"
          style={{
            left: f.x - 5,
            top: f.y - 8,
            opacity: f.opacity,
            transform: `rotate(${f.rotation}deg)`,
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16">
            {/* Foot print — sole shape */}
            <ellipse cx="5" cy="5" rx="3" ry="4.5" fill="#3a3020" opacity="0.6" />
            {/* Heel */}
            <ellipse cx="5" cy="13" rx="2.5" ry="2" fill="#3a3020" opacity="0.5" />
            {/* Toes */}
            <circle cx="3" cy="1.5" r="1" fill="#3a3020" opacity="0.4" />
            <circle cx="5" cy="0.8" r="1" fill="#3a3020" opacity="0.4" />
            <circle cx="7" cy="1.5" r="1" fill="#3a3020" opacity="0.4" />
          </svg>
        </div>
      ))}

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
              className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
              animate={shrinkToCorner ? {
                x: 'calc(-50vw + 64px)',
                y: 'calc(-50vh + 48px)',
              } : { x: 0, y: 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className={`relative w-48 h-48 ${shrinkToCorner ? 'pointer-events-auto cursor-pointer' : ''}`}
                onClick={() => shrinkToCorner && navigate('/')}
                animate={shrinkToCorner ? { scale: 0.33 } : { scale: 1 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              >
                <svg viewBox="0 0 500 500" className="w-full h-full">
                  <path d="M250,90 L375,315 L125,315 Z" fill="none" stroke="rgba(245,240,232,0.15)" strokeWidth="2" strokeLinejoin="miter" />
                  <path d="M250,90 L375,315 L125,315 Z" fill="none" stroke="white" strokeWidth="2"
                    strokeDasharray={trianglePerimeter}
                    strokeDashoffset={trianglePerimeter - (trianglePerimeter * Math.min(logoProgress, 100)) / 100}
                    strokeLinejoin="miter" pathLength={trianglePerimeter} />
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
        style={{ perspective: '1200px' }}
      >
        <div
          ref={svgWrapperRef}
          style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
          onMouseEnter={() => setIsOnMap(true)}
          onMouseLeave={() => setIsOnMap(false)}
        >
          <svg
            viewBox="0 0 1000 650"
            className="w-[80vw] h-[80vh] max-w-[80vw] max-h-[80vh]"
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: 'none' }}
          >
            <defs>
              <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="6" stitchTiles="stitch" result="noise" />
                <feColorMatrix type="matrix" in="noise" result="tinted"
                  values="0.45 0 0 0 0
                          0.38 0 0 0 0
                          0.18 0 0 0 0
                          0 0 0 0.22 0" />
              </filter>
              <filter id="fine-grain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" seed="99" stitchTiles="stitch" result="fine" />
                <feColorMatrix type="matrix" in="fine" result="fineTint"
                  values="0.3 0 0 0 0
                          0.25 0 0 0 0
                          0.12 0 0 0 0
                          0 0 0 0.08 0" />
              </filter>
              <filter id="stain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="3" seed="42" stitchTiles="stitch" result="splotch" />
                <feColorMatrix type="matrix" in="splotch" result="sepia"
                  values="0.54 0 0 0 0
                          0.42 0 0 0 0
                          0.28 0 0 0 0
                          0 0 0 0.2 0" />
              </filter>
              <filter id="water-damage" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="7" stitchTiles="stitch" result="water" />
                <feColorMatrix type="matrix" in="water" result="waterTint"
                  values="0.3 0 0 0 0
                          0.25 0 0 0 0
                          0.15 0 0 0 0
                          0 0 0 0.1 0" />
              </filter>
              <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1={0} y1={0} x2={0} y2={6} stroke="#3d3525" strokeWidth={0.3} opacity={0.2} />
              </pattern>
              <pattern id="hatch-cross" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
                <line x1={0} y1={0} x2={0} y2={5} stroke="#3d3525" strokeWidth={0.25} opacity={0.15} />
              </pattern>
              <linearGradient id="parchment" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#d4c5a0" />
                <stop offset="50%" stopColor="#cbb994" />
                <stop offset="100%" stopColor="#c4b48a" />
              </linearGradient>
              <linearGradient id="burn-top" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.42" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="burn-bottom" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.42" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="burn-left" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="burn-right" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="corner-tl" cx="0%" cy="0%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="corner-br" cx="100%" cy="100%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ring1" cx="30%" cy="25%" r="12%">
                <stop offset="70%" stopColor="#8b7355" stopOpacity="0" />
                <stop offset="85%" stopColor="#8b7355" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#8b7355" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ring2" cx="75%" cy="70%" r="10%">
                <stop offset="70%" stopColor="#8b7355" stopOpacity="0" />
                <stop offset="85%" stopColor="#8b7355" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#8b7355" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ring3" cx="55%" cy="15%" r="8%">
                <stop offset="60%" stopColor="#7a6545" stopOpacity="0" />
                <stop offset="80%" stopColor="#7a6545" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#7a6545" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect x={10} y={10} width={980} height={630} fill="url(#parchment)" />
            <rect x={10} y={10} width={980} height={160} fill="url(#burn-top)" />
            <rect x={10} y={480} width={980} height={160} fill="url(#burn-bottom)" />
            <rect x={10} y={10} width={160} height={630} fill="url(#burn-left)" />
            <rect x={830} y={10} width={160} height={630} fill="url(#burn-right)" />
            <rect x={10} y={10} width={980} height={630} fill="url(#corner-tl)" />
            <rect x={10} y={10} width={980} height={630} fill="url(#corner-br)" />
            <rect x={10} y={10} width={980} height={630} filter="url(#stain)" opacity={0.8} />
            <rect x={10} y={10} width={980} height={630} filter="url(#water-damage)" opacity={0.6} />
            <rect x={10} y={10} width={980} height={630} fill="url(#ring1)" />
            <rect x={10} y={10} width={980} height={630} fill="url(#ring2)" />
            <rect x={10} y={10} width={980} height={630} fill="url(#ring3)" />
            <rect x={15} y={15} width={970} height={620} fill="url(#hatch)" />
            <rect x={600} y={200} width={180} height={120} fill="url(#hatch-cross)" />
            <rect x={260} y={150} width={120} height={90} fill="url(#hatch-cross)" />

            <ContourLines />
            <TerrainHatching />
            <TrailPaths />
            <CreaseLines />

            <rect x={10} y={10} width={980} height={630} filter="url(#paper-grain)" style={{ mixBlendMode: 'multiply' }} />
            <rect x={10} y={10} width={980} height={630} filter="url(#fine-grain)" style={{ mixBlendMode: 'multiply' }} />

            <ElevationMarks />
            <MapBorder />
            <EdgeRips />
            <TitleCartouche />

            {/* Landmarks — pointer events enabled only on hit rects */}
            {LANDMARKS.map((lm) => (
              <g
                key={lm.id}
                transform={`translate(${lm.x}, ${lm.y})`}
              >
                {/* Clickable hit area */}
                <rect
                  x={-28}
                  y={-36}
                  width={56}
                  height={72}
                  fill="transparent"
                  className="cursor-pointer"
                  style={{ pointerEvents: 'all' }}
                  onMouseEnter={() => setHoveredLandmark(lm.id)}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  onClick={() => navigate(lm.route)}
                />
                <g opacity={hoveredLandmark === lm.id ? 1 : 0.7} style={{ transition: 'opacity 0.3s ease', pointerEvents: 'none' }} transform="scale(1.875)">
                  <LandmarkIcon id={lm.id} />
                </g>
                <text
                  y={32}
                  textAnchor="middle"
                  fill="#2a2218"
                  fontSize={10}
                  fontFamily="monospace"
                  letterSpacing={2}
                  opacity={hoveredLandmark === lm.id ? 0.9 : 0.55}
                  style={{ transition: 'opacity 0.3s ease', textTransform: 'uppercase', pointerEvents: 'none' }}
                >
                  {lm.label}
                </text>
                {hoveredLandmark === lm.id && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect x={-80} y={40} width={160} height={20} rx={1}
                      fill="rgba(42,34,24,0.85)" stroke="#2a2218" strokeWidth={0.3} opacity={0.8} />
                    <text y={54} textAnchor="middle" fill="#d4c5a0" fontSize={7.5} fontFamily="monospace" opacity={0.9}>
                      {lm.descriptor}
                    </text>
                  </g>
                )}
              </g>
            ))}

            <CompassRose heading={compassHeading} />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default MapPage;
