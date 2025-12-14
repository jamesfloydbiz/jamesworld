import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WalkwayCharacter } from './WalkwayCharacter';
import { useGameStore } from '@/store/gameStore';

interface WalkwayHeaderProps {
  title: string;
}

export function WalkwayHeader({ title }: WalkwayHeaderProps) {
  const navigate = useNavigate();
  const { scrollProgress, setScrollProgress, restoreHubState, setIsTransitioning } = useGameStore();
  const [menuOpen, setMenuOpen] = useState(false);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollProgress]);

  const handleBackToHub = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      restoreHubState();
      setIsTransitioning(false);
      navigate('/');
    }, 300);
  };

  const menuItems = ['Story', 'Media', 'Projects', 'Network', 'Blueprints'];

  return (
    <>
      <motion.header
        className="walkway-header"
        initial={{ y: -160 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Title */}
        <motion.div
          className="absolute top-6 left-8 text-xs tracking-[0.3em] uppercase text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {title}
        </motion.div>

        {/* Menu button */}
        <motion.button
          className="absolute top-6 right-8 text-xs tracking-[0.2em] uppercase hover:text-muted-foreground transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Menu
        </motion.button>

        {/* Walkway rail */}
        <div className="walkway-rail">
          <WalkwayCharacter progress={scrollProgress} />
        </div>

        {/* Portal entrance animation */}
        <motion.div
          className="absolute bottom-6 left-[3%] w-6 h-10 border border-foreground/30 rounded-t-full"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ transformOrigin: 'bottom' }}
        />
      </motion.header>

      {/* Dropdown menu */}
      {menuOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <nav className="text-center">
            <ul className="space-y-6">
              {menuItems.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(`/${item.toLowerCase()}`);
                    }}
                    className="text-2xl tracking-widest uppercase hover:text-muted-foreground transition-colors"
                  >
                    {item}
                  </button>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
              >
                <button
                  onClick={handleBackToHub}
                  className="text-2xl tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Hub
                </button>
              </motion.li>
            </ul>
            <button
              onClick={() => setMenuOpen(false)}
              className="mt-12 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </nav>
        </motion.div>
      )}
    </>
  );
}
