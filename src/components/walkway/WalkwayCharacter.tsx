import { motion } from 'framer-motion';

interface WalkwayCharacterProps {
  progress: number; // 0-1
}

export function WalkwayCharacter({ progress }: WalkwayCharacterProps) {
  // Map progress to 5% - 95% of walkway width
  const xPosition = 5 + progress * 90;

  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: `${xPosition}%` }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Proportional character matching 3D model - head ~27% of height */}
      <motion.svg
        width="14"
        height="26"
        viewBox="0 0 14 26"
        fill="none"
        className="transform -translate-x-1/2"
        animate={{ y: [0, -1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Head - r=3.5, centered at y=3.5, ~27% of total height */}
        <circle cx="7" cy="3.5" r="3.5" fill="white" />
        {/* Body - capsule shape, rx=3.5 ry=8 */}
        <ellipse cx="7" cy="16" rx="3.5" ry="8" fill="white" />
      </motion.svg>
    </motion.div>
  );
}
