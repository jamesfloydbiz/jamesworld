import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TreeSilhouette = () => (
  <svg
    viewBox="0 0 800 1000"
    className="absolute inset-0 w-full h-full"
    style={{ opacity: 0.04 }}
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <g fill="#4A5D23">
      {/* Trunk */}
      <rect x="370" y="600" width="60" height="400" rx="6" />
      {/* Roots */}
      <path d="M370 950 Q300 980 260 1000 L340 1000 Z" />
      <path d="M430 950 Q500 980 540 1000 L460 1000 Z" />
      {/* Canopy layers — stencil style, overlapping organic shapes */}
      <ellipse cx="400" cy="520" rx="180" ry="120" />
      <ellipse cx="320" cy="460" rx="140" ry="100" />
      <ellipse cx="480" cy="460" rx="140" ry="100" />
      <ellipse cx="400" cy="400" rx="160" ry="110" />
      <ellipse cx="340" cy="350" rx="120" ry="90" />
      <ellipse cx="460" cy="350" rx="120" ry="90" />
      <ellipse cx="400" cy="300" rx="130" ry="95" />
      <ellipse cx="360" cy="250" rx="100" ry="80" />
      <ellipse cx="440" cy="250" rx="100" ry="80" />
      <ellipse cx="400" cy="200" rx="90" ry="70" />
      <ellipse cx="400" cy="160" rx="60" ry="50" />
    </g>
  </svg>
);

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.08,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Tree background */}
      <TreeSilhouette />

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center text-center px-6 max-w-lg"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          variants={fadeUp}
          className="font-mono text-4xl md:text-5xl tracking-tight mb-3"
          style={{ color: '#F5F0E8' }}
        >
          James Floyd
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="font-mono text-sm md:text-base tracking-widest uppercase mb-2"
          style={{ color: '#4A5D23' }}
        >
          Builder · Creator · Explorer
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="font-mono text-sm md:text-base leading-relaxed mb-12 max-w-sm"
          style={{ color: 'rgba(245, 240, 232, 0.5)' }}
        >
          Systems thinker, maker of things, and perpetual student. 
          This is a small corner of the internet where my work lives.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => navigate('/museum')}
            className="font-mono text-sm tracking-widest uppercase px-8 py-4 border transition-all duration-300 hover:scale-[1.02]"
            style={{
              color: '#F5F0E8',
              borderColor: '#3D2817',
              backgroundColor: 'rgba(61, 40, 23, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(61, 40, 23, 0.35)';
              e.currentTarget.style.borderColor = '#4A5D23';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(61, 40, 23, 0.15)';
              e.currentTarget.style.borderColor = '#3D2817';
            }}
          >
            Experience the Museum
          </button>

          <button
            onClick={() => navigate('/story')}
            className="font-mono text-sm tracking-widest uppercase px-8 py-4 border transition-all duration-300 hover:scale-[1.02]"
            style={{
              color: '#F5F0E8',
              borderColor: 'rgba(245, 240, 232, 0.15)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 240, 232, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 240, 232, 0.15)';
            }}
          >
            Quick Portfolio View
          </button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-mono text-xs mt-16"
          style={{ color: 'rgba(74, 93, 35, 0.5)' }}
        >
          ↑ Both paths lead somewhere worth going.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LandingPage;
