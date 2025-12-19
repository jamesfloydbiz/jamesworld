import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface MainMenuProps {
  onEnterGallery: () => void;
  galleryLoading: boolean;
  galleryProgress: number;
}

export function MainMenu({ onEnterGallery, galleryLoading, galleryProgress }: MainMenuProps) {
  const navigate = useNavigate();

  const menuItems = [
    { label: '3D Gallery', action: onEnterGallery, isGallery: true },
    { label: 'Story', path: '/story' },
    { label: 'Projects', path: '/projects' },
    { label: 'Media', path: '/media' },
    { label: 'Network', path: '/network' },
    { label: 'Blueprints', path: '/blueprints' },
    { label: 'Resume', path: '/resume' },
    { label: 'Poems', path: '/poems' },
  ];

  const handleClick = (item: typeof menuItems[0]) => {
    if (item.isGallery) {
      item.action?.();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
    >
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-4xl md:text-6xl font-light tracking-[0.3em] text-white mb-16"
      >
        JAMES FLOYD
      </motion.h1>

      {/* Menu Items */}
      <nav className="flex flex-col items-center gap-4">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
            onClick={() => handleClick(item)}
            disabled={item.isGallery && galleryLoading && galleryProgress < 100}
            className="relative text-lg md:text-xl tracking-[0.2em] text-white/70 hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            {item.label.toUpperCase()}
            {item.isGallery && galleryLoading && galleryProgress < 100 && (
              <span className="ml-3 text-sm text-white/40">
                {Math.round(galleryProgress)}%
              </span>
            )}
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
          </motion.button>
        ))}
      </nav>

      {/* Subtle footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 text-xs tracking-[0.15em] text-white/30"
      >
        EXPLORE
      </motion.p>
    </motion.div>
  );
}
