import { motion } from 'framer-motion';

interface WalkwayCharacterProps {
  progress: number; // 0-1
}

export function WalkwayCharacter({ progress }: WalkwayCharacterProps) {
  // Map progress to 5% - 95% of walkway width
  const xPosition = 5 + progress * 90;

  return (
    <motion.div
      className="absolute bottom-1"
      style={{ left: `${xPosition}%` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Simple character silhouette */}
      <motion.svg
        width="24"
        height="40"
        viewBox="0 0 24 40"
        fill="none"
        className="transform -translate-x-1/2"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Head */}
        <circle cx="12" cy="6" r="5" fill="white" />
        {/* Body */}
        <ellipse cx="12" cy="22" rx="6" ry="12" fill="white" />
        {/* Shadow */}
        <ellipse cx="12" cy="38" rx="8" ry="2" fill="white" opacity="0.2" />
      </motion.svg>
    </motion.div>
  );
}
