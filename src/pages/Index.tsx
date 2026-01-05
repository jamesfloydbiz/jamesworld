import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Lazy load heavy 3D components
const MuseumScene = lazy(() => import('@/components/museum/MuseumScene').then(m => ({ default: m.MuseumScene })));
const MuseumUI = lazy(() => import('@/components/ui/MuseumUI').then(m => ({ default: m.MuseumUI })));
const MobileJoystick = lazy(() => import('@/components/ui/MobileJoystick').then(m => ({ default: m.MobileJoystick })));

const Index = () => {
  const navigate = useNavigate();
  const { setIsTransitioning, menuOpen, setMenuOpen } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  useEffect(() => {
    setIsTransitioning(false);
  }, [setIsTransitioning]);

  // Track when fully loaded
  useEffect(() => {
    if (progress >= 100 && !isFullyLoaded) {
      setIsFullyLoaded(true);
    }
  }, [progress, isFullyLoaded]);

  // ESC key to toggle menu when in gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showLoading) {
        setMenuOpen(!menuOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLoading, menuOpen, setMenuOpen]);

  const handleProgress = useCallback((loadProgress: number) => {
    setProgress(loadProgress);
  }, []);

  const handleStart = () => {
    setShowLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* 3D Museum Scene - always loading/visible behind the loading screen */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <MuseumScene onProgress={handleProgress} showLabels={!showLoading} />
          {!showLoading && (
            <>
              <MuseumUI />
              <MobileJoystick />
            </>
          )}
        </Suspense>
      </div>

      {/* Loading screen overlay */}
      <AnimatePresence>
        {showLoading && (
          <LoadingScreen 
            progress={progress} 
            isFullyLoaded={isFullyLoaded}
            onStart={handleStart}
          />
        )}
      </AnimatePresence>

      {/* Persistent top-left logo (only after loading) */}
      <AnimatePresence>
        {!showLoading && (
          <motion.div
            className="fixed top-6 left-6 z-40 w-16 h-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg viewBox="0 0 500 500" className="w-full h-full">
              {/* Full triangle border */}
              <polygon
                points="250,90 375,315 125,315"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
              {/* JF letters */}
              <path d="M295.124 178.588V179.588H246.45L221.333 297.588H242.75L253.12 248.628H305.724V228.208H257.497L263.49 200.008H306.444H306.999V201.008H264.299L258.731 227.208H306.724V249.628H253.929L243.559 298.588H220.097L220.225 297.983L245.639 178.588H295.124Z" fill="white" opacity="0.9"/>
              <path d="M295.124 179.588H246.45L221.333 297.588H242.75L253.12 248.628H305.724V228.208H257.497L263.49 200.008H306.444L295.124 179.588Z" fill="white" opacity="0.9"/>
              <path d="M295.124 178.588V179.588L306.444 200.008H306.999L295.124 178.588Z" fill="white" opacity="0.9"/>
              <path d="M252 178.588V200.668H240.515L227.339 262.492L227.338 262.495C225.858 269.213 223.862 275.036 221.345 279.956L221.344 279.955C218.937 284.766 215.895 288.732 212.212 291.84C208.529 294.947 204.218 297.244 199.284 298.736C194.355 300.226 188.751 300.968 182.479 300.968C177.672 300.968 173.253 300.28 169.228 298.9C165.203 297.52 161.688 295.505 158.688 292.852L158.681 292.845C155.795 290.191 153.49 286.961 151.765 283.165L151.761 283.156L151.757 283.148C150.84 280.922 150.186 278.514 149.791 275.927L150.779 275.777C151.162 278.285 151.795 280.609 152.675 282.751L152.995 283.434C154.629 286.82 156.75 289.71 159.356 292.108C162.249 294.666 165.646 296.616 169.552 297.955C173.46 299.295 177.767 299.968 182.479 299.968C188.674 299.968 194.178 299.235 198.995 297.779C203.808 296.324 207.997 294.089 211.567 291.076C215.136 288.065 218.099 284.21 220.452 279.504L220.912 278.584C223.169 273.952 224.987 268.519 226.361 262.28L239.62 200.063L239.705 199.668H251V179.588H205.42V199.668H218.287L204.898 262.489C203.749 268.006 201.498 272.305 198.113 275.34C194.725 278.377 190.523 279.887 185.54 279.887C181.161 279.887 177.735 278.85 175.345 276.699L175.335 276.69C172.947 274.421 171.779 271.274 171.779 267.318C171.779 265.585 171.953 263.906 172.301 262.283L174.553 251.668H164.171V250.668H175.787L175.658 251.271L173.278 262.491C172.946 264.042 172.779 265.652 172.779 267.318C172.779 271.066 173.878 273.924 176.021 275.962C178.163 277.887 181.31 278.887 185.54 278.887C190.304 278.887 194.26 277.451 197.445 274.595C200.634 271.737 202.803 267.649 203.92 262.286L203.921 262.283L217.052 200.668H204.42V178.588H252Z" fill="white" opacity="0.9"/>
              <path d="M150.779 275.777C151.162 278.285 151.795 280.609 152.675 282.751L152.995 283.434C154.629 286.82 156.75 289.71 159.356 292.108C162.249 294.666 165.646 296.616 169.552 297.955C173.46 299.295 177.767 299.968 182.479 299.968C188.674 299.968 194.178 299.235 198.995 297.779C203.808 296.324 207.997 294.089 211.567 291.076C215.136 288.065 218.099 284.21 220.452 279.504L220.912 278.584C223.169 273.952 224.987 268.519 226.361 262.28L239.62 200.063L239.705 199.668H251V179.588H205.42V199.668H218.287L204.898 262.489C203.749 268.006 201.498 272.305 198.113 275.34C194.725 278.377 190.523 279.887 185.54 279.887C181.161 279.887 177.735 278.85 175.345 276.699L175.335 276.69C172.947 274.421 171.779 271.274 171.779 267.318C171.779 265.585 171.953 263.906 172.301 262.283L174.553 251.668H164.171L150.779 275.777Z" fill="white" opacity="0.9"/>
              <path d="M149.791 275.927L150.779 275.777L164.171 251.668V250.668L149.791 275.927Z" fill="white" opacity="0.9"/>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu overlay when in gallery */}
      <AnimatePresence>
        {!showLoading && menuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white text-xl"
            >
              ✕
            </button>
            
            {[
              { label: 'Story', path: '/story' },
              { label: 'Projects', path: '/projects' },
              { label: 'Media', path: '/media' },
              { label: 'Network', path: '/network' },
              { label: 'Blueprints', path: '/blueprints' },
              { label: 'Resume', path: '/resume' },
              { label: 'Poems', path: '/poems' },
              { label: 'Memories', path: '/pictures' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setMenuOpen(false);
                  navigate(item.path);
                }}
                className="text-white/80 hover:text-white text-2xl tracking-widest uppercase transition-colors"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
