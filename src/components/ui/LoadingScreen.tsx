import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  progress: number;
  isFullyLoaded: boolean;
  onStart: () => void;
}

export function LoadingScreen({ progress, isFullyLoaded, onStart }: LoadingScreenProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [fadeBackground, setFadeBackground] = useState(false);
  const [shrinkToCorner, setShrinkToCorner] = useState(false);
  const [hideCompletely, setHideCompletely] = useState(false);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const animationRef = useRef<number>();
  const hasCalledOnStart = useRef(false);
  
  // Smooth progress interpolation using requestAnimationFrame
  useEffect(() => {
    const animate = () => {
      setSmoothProgress(prev => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.1) return progress;
        return prev + diff * 0.08;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [progress]);
  
  // Show logo when triangle is complete
  useEffect(() => {
    if (isFullyLoaded && !showLogo) {
      const timer = setTimeout(() => setShowLogo(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isFullyLoaded, showLogo]);

  // Fade background after logo appears
  useEffect(() => {
    if (showLogo && !fadeBackground) {
      const timer = setTimeout(() => setFadeBackground(true), 500);
      return () => clearTimeout(timer);
    }
  }, [showLogo, fadeBackground]);

  // Shrink to corner as background fades
  useEffect(() => {
    if (fadeBackground && !shrinkToCorner) {
      const timer = setTimeout(() => setShrinkToCorner(true), 100);
      return () => clearTimeout(timer);
    }
  }, [fadeBackground, shrinkToCorner]);

  // Hide completely after shrink animation
  useEffect(() => {
    if (shrinkToCorner && !hideCompletely) {
      const timer = setTimeout(() => setHideCompletely(true), 800);
      return () => clearTimeout(timer);
    }
  }, [shrinkToCorner, hideCompletely]);

  // Call onStart when background fade completes
  useEffect(() => {
    if (fadeBackground && !hasCalledOnStart.current) {
      const timer = setTimeout(() => {
        hasCalledOnStart.current = true;
        onStart();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [fadeBackground, onStart]);

  // Triangle perimeter for stroke animation
  const trianglePerimeter = 600;
  const strokeDashoffset = trianglePerimeter - (trianglePerimeter * Math.min(smoothProgress, 100)) / 100;

  return (
    <>
      {/* Black background overlay - fades out independently */}
      <motion.div
        className="fixed inset-0 z-[99] bg-black pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: fadeBackground ? 0 : 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      
      {/* Logo container - shrinks to corner then disappears */}
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        animate={shrinkToCorner ? {
          x: 'calc(-50vw + 56px)',
          y: 'calc(-50vh + 56px)',
          opacity: hideCompletely ? 0 : 1,
        } : {
          x: 0,
          y: 0,
          opacity: 1,
        }}
        transition={{ 
          duration: 0.7, 
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <motion.div 
          className="relative w-48 h-48"
          animate={shrinkToCorner ? {
            scale: 0.33,
          } : {
            scale: 1,
          }}
          transition={{ 
            duration: 0.7, 
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {/* SVG triangle that traces as it loads */}
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full"
          >
            {/* Background triangle (faint) */}
            <path
              d="M250,90 L375,315 L125,315 Z"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
              opacity="0.15"
              strokeLinejoin="miter"
            />
            {/* Animated tracing triangle - starts from top tip */}
            <path
              d="M250,90 L375,315 L125,315 Z"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray={trianglePerimeter}
              strokeDashoffset={trianglePerimeter - (trianglePerimeter * Math.min(smoothProgress, 100)) / 100}
              strokeLinejoin="miter"
              pathLength={trianglePerimeter}
            />
          </svg>
          
          {/* JF Logo appears when triangle is complete */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: showLogo ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full"
            >
              {/* JF letters from logo.svg */}
              <path d="M295.124 178.588V179.588H246.45L221.333 297.588H242.75L253.12 248.628H305.724V228.208H257.497L263.49 200.008H306.444H306.999V201.008H264.299L258.731 227.208H306.724V249.628H253.929L243.559 298.588H220.097L220.225 297.983L245.639 178.588H295.124Z" fill="white"/>
              <path d="M295.124 179.588H246.45L221.333 297.588H242.75L253.12 248.628H305.724V228.208H257.497L263.49 200.008H306.444L295.124 179.588Z" fill="white"/>
              <path d="M295.124 178.588V179.588L306.444 200.008H306.999L295.124 178.588Z" fill="white"/>
              <path d="M252 178.588V200.668H240.515L227.339 262.492L227.338 262.495C225.858 269.213 223.862 275.036 221.345 279.956L221.344 279.955C218.937 284.766 215.895 288.732 212.212 291.84C208.529 294.947 204.218 297.244 199.284 298.736C194.355 300.226 188.751 300.968 182.479 300.968C177.672 300.968 173.253 300.28 169.228 298.9C165.203 297.52 161.688 295.505 158.688 292.852L158.681 292.845C155.795 290.191 153.49 286.961 151.765 283.165L151.761 283.156L151.757 283.148C150.84 280.922 150.186 278.514 149.791 275.927L150.779 275.777C151.162 278.285 151.795 280.609 152.675 282.751L152.995 283.434C154.629 286.82 156.75 289.71 159.356 292.108C162.249 294.666 165.646 296.616 169.552 297.955C173.46 299.295 177.767 299.968 182.479 299.968C188.674 299.968 194.178 299.235 198.995 297.779C203.808 296.324 207.997 294.089 211.567 291.076C215.136 288.065 218.099 284.21 220.452 279.504L220.912 278.584C223.169 273.952 224.987 268.519 226.361 262.28L239.62 200.063L239.705 199.668H251V179.588H205.42V199.668H218.287L204.898 262.489C203.749 268.006 201.498 272.305 198.113 275.34C194.725 278.377 190.523 279.887 185.54 279.887C181.161 279.887 177.735 278.85 175.345 276.699L175.335 276.69C172.947 274.421 171.779 271.274 171.779 267.318C171.779 265.585 171.953 263.906 172.301 262.283L174.553 251.668H164.171V250.668H175.787L175.658 251.271L173.278 262.491C172.946 264.042 172.779 265.652 172.779 267.318C172.779 271.066 173.878 273.924 176.021 275.962C178.163 277.887 181.31 278.887 185.54 278.887C190.304 278.887 194.26 277.451 197.445 274.595C200.634 271.737 202.803 267.649 203.92 262.286L203.921 262.283L217.052 200.668H204.42V178.588H252Z" fill="white"/>
              <path d="M150.779 275.777C151.162 278.285 151.795 280.609 152.675 282.751L152.995 283.434C154.629 286.82 156.75 289.71 159.356 292.108C162.249 294.666 165.646 296.616 169.552 297.955C173.46 299.295 177.767 299.968 182.479 299.968C188.674 299.968 194.178 299.235 198.995 297.779C203.808 296.324 207.997 294.089 211.567 291.076C215.136 288.065 218.099 284.21 220.452 279.504L220.912 278.584C223.169 273.952 224.987 268.519 226.361 262.28L239.62 200.063L239.705 199.668H251V179.588H205.42V199.668H218.287L204.898 262.489C203.749 268.006 201.498 272.305 198.113 275.34C194.725 278.377 190.523 279.887 185.54 279.887C181.161 279.887 177.735 278.85 175.345 276.699L175.335 276.69C172.947 274.421 171.779 271.274 171.779 267.318C171.779 265.585 171.953 263.906 172.301 262.283L174.553 251.668H164.171L150.779 275.777Z" fill="white"/>
              <path d="M149.791 275.927L150.779 275.777L164.171 251.668V250.668L149.791 275.927Z" fill="white"/>
            </svg>
          </motion.div>
        </motion.div>
        
        {/* Loading text - only show before logo */}
        {!showLogo && (
          <motion.div 
            className="absolute mt-32 text-muted-foreground text-sm tracking-wider"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            LOADING
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
