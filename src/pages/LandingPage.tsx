import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TreeOfLife = () =>
<svg
  viewBox="0 0 600 700"
  className="absolute inset-0 w-full h-full"
  style={{ opacity: 0.06 }}
  preserveAspectRatio="xMidYMid meet"
  aria-hidden="true">

    <g fill="none" stroke="#4A5D23" strokeWidth="1.2" strokeLinecap="round">
      {/* Trunk */}
      <path d="M300 700 L300 380" />
      <path d="M296 700 L296 400" />
      <path d="M304 700 L304 400" />

      {/* Main branches — left */}
      <path d="M300 380 Q260 340 200 280" />
      <path d="M300 400 Q240 360 170 320" />
      <path d="M300 420 Q250 400 180 380" />
      <path d="M300 360 Q270 310 230 240" />
      <path d="M300 340 Q280 280 260 200" />

      {/* Main branches — right */}
      <path d="M300 380 Q340 340 400 280" />
      <path d="M300 400 Q360 360 430 320" />
      <path d="M300 420 Q350 400 420 380" />
      <path d="M300 360 Q330 310 370 240" />
      <path d="M300 340 Q320 280 340 200" />

      {/* Upper canopy branches — left */}
      <path d="M230 240 Q200 200 160 160" />
      <path d="M230 240 Q210 220 190 200" />
      <path d="M200 280 Q160 240 130 200" />
      <path d="M200 280 Q180 250 150 230" />
      <path d="M260 200 Q240 160 220 120" />
      <path d="M260 200 Q250 170 240 140" />
      <path d="M170 320 Q140 290 120 260" />

      {/* Upper canopy branches — right */}
      <path d="M370 240 Q400 200 440 160" />
      <path d="M370 240 Q390 220 410 200" />
      <path d="M400 280 Q440 240 470 200" />
      <path d="M400 280 Q420 250 450 230" />
      <path d="M340 200 Q360 160 380 120" />
      <path d="M340 200 Q350 170 360 140" />
      <path d="M430 320 Q460 290 480 260" />

      {/* Top crown */}
      <path d="M300 340 Q300 280 300 200" />
      <path d="M300 200 Q290 160 270 120" />
      <path d="M300 200 Q310 160 330 120" />
      <path d="M300 200 Q300 150 300 100" />

      {/* Small twigs / leaves — left */}
      <path d="M160 160 Q140 140 120 130" />
      <path d="M160 160 Q150 145 140 120" />
      <path d="M190 200 Q170 185 155 170" />
      <path d="M130 200 Q110 180 100 165" />
      <path d="M150 230 Q130 215 115 200" />
      <path d="M220 120 Q200 100 185 85" />
      <path d="M240 140 Q225 120 210 105" />
      <path d="M120 260 Q100 240 90 225" />

      {/* Small twigs / leaves — right */}
      <path d="M440 160 Q460 140 480 130" />
      <path d="M440 160 Q450 145 460 120" />
      <path d="M410 200 Q430 185 445 170" />
      <path d="M470 200 Q490 180 500 165" />
      <path d="M450 230 Q470 215 485 200" />
      <path d="M380 120 Q400 100 415 85" />
      <path d="M360 140 Q375 120 390 105" />
      <path d="M480 260 Q500 240 510 225" />

      {/* Roots — spreading, organic */}
      <path d="M300 700 Q260 720 200 740" />
      <path d="M300 700 Q340 720 400 740" />
      <path d="M296 700 Q250 730 180 760" />
      <path d="M304 700 Q350 730 420 760" />
      <path d="M300 700 Q280 740 240 780" />
      <path d="M300 700 Q320 740 360 780" />
      <path d="M200 740 Q170 750 140 760" />
      <path d="M400 740 Q430 750 460 760" />
      <path d="M180 760 Q150 775 130 790" />
      <path d="M420 760 Q450 775 470 790" />
      <path d="M240 780 Q220 795 200 810" />
      <path d="M360 780 Q380 795 400 810" />
    </g>
  </svg>;


const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#000000' }}>

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.08,
          mixBlendMode: 'overlay'
        }} />


      {/* Tree background */}
      <TreeOfLife />

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center text-center px-6 max-w-lg"
        variants={stagger}
        initial="hidden"
        animate="show">

        <motion.h1
          variants={fadeUp}
          className="font-mono text-4xl md:text-5xl tracking-tight mb-3"
          style={{ color: '#F5F0E8' }}>

          James Floyd
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="font-mono text-sm md:text-base tracking-widest uppercase mb-2"
          style={{ color: '#4A5D23' }}>

          Builder · Creator · Explorer
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="font-mono text-sm md:text-base leading-relaxed mb-12 max-w-sm"
          style={{ color: 'rgba(245, 240, 232, 0.5)' }}>

           James lives his life deeply. This is a small corner of the internet where he shares his work with the world.
        
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => navigate('/museum')}
            className="font-mono text-sm tracking-widest uppercase px-8 py-4 border transition-all duration-300 hover:scale-[1.02]"
            style={{
              color: '#F5F0E8',
              borderColor: '#3D2817',
              backgroundColor: 'rgba(61, 40, 23, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(61, 40, 23, 0.35)';
              e.currentTarget.style.borderColor = '#4A5D23';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(61, 40, 23, 0.15)';
              e.currentTarget.style.borderColor = '#3D2817';
            }}>

            Load My 3D Experience       
          </button>

          <button
            onClick={() => navigate('/story')}
            className="font-mono text-sm tracking-widest uppercase px-8 py-4 border transition-all duration-300 hover:scale-[1.02]"
            style={{
              color: '#F5F0E8',
              borderColor: 'rgba(245, 240, 232, 0.15)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 240, 232, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 240, 232, 0.15)';
            }}>

            Quick Portfolio View
          </button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-mono text-xs mt-16"
          style={{ color: 'rgba(74, 93, 35, 0.5)' }}>

          ↑ Both paths lead somewhere worth going.
        </motion.p>
      </motion.div>
    </div>);

};

export default LandingPage;