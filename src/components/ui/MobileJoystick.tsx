import { useRef, useEffect, useState, useCallback } from 'react';
import { joystickState } from '@/components/museum/useKeyboardControls';
import { useGameStore } from '@/store/gameStore';
import { Menu } from 'lucide-react';

const SPRINT_THRESHOLD = 0.7;

// Robust mobile detection using multiple signals
const checkIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Primary: CSS media query checks (most reliable)
  const isNarrowScreen = window.matchMedia('(max-width: 767px)').matches;
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hasNoHover = window.matchMedia('(hover: none)').matches;
  
  // Secondary: touch capability fallback
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Enable if narrow screen OR touch-primary device
  return isNarrowScreen || hasCoarsePointer || hasNoHover || hasTouch;
};

export function MobileJoystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const sprintRingRef = useRef<HTMLDivElement>(null);
  const containerRectRef = useRef<DOMRect | null>(null);
  const isActiveRef = useRef(false);
  // Use lazy initializer for immediate detection on first render
  const [isMobile, setIsMobile] = useState(() => checkIsMobile());
  const { setMenuOpen, menuOpen } = useGameStore();

  // Re-check on resize, orientation change, and visibility change (tab switch)
  useEffect(() => {
    const recheck = () => setIsMobile(checkIsMobile());
    
    window.addEventListener('resize', recheck);
    window.addEventListener('orientationchange', recheck);
    document.addEventListener('visibilitychange', recheck);
    
    return () => {
      window.removeEventListener('resize', recheck);
      window.removeEventListener('orientationchange', recheck);
      document.removeEventListener('visibilitychange', recheck);
    };
  }, []);

  const updateKnobPosition = useCallback((x: number, y: number, isSprinting: boolean) => {
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      knobRef.current.style.background = isActiveRef.current 
        ? 'rgba(255, 255, 255, 0.6)' 
        : 'rgba(255, 255, 255, 0.35)';
    }
    if (sprintRingRef.current) {
      sprintRingRef.current.style.opacity = isSprinting ? '1' : '0';
    }
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    isActiveRef.current = true;
    containerRectRef.current = containerRef.current.getBoundingClientRect();
    
    const rect = containerRectRef.current;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    
    const maxRadius = rect.width / 2 - 20;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }
    
    const normalizedDistance = distance / maxRadius;
    joystickState.x = deltaX / maxRadius;
    joystickState.y = deltaY / maxRadius;
    joystickState.active = true;
    joystickState.sprint = normalizedDistance > SPRINT_THRESHOLD;
    
    updateKnobPosition(deltaX, deltaY, joystickState.sprint);
  }, [updateKnobPosition]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRectRef.current || !isActiveRef.current) return;
    
    const rect = containerRectRef.current;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    
    const maxRadius = rect.width / 2 - 20;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }
    
    const normalizedDistance = Math.min(distance / maxRadius, 1);
    joystickState.x = deltaX / maxRadius;
    joystickState.y = deltaY / maxRadius;
    joystickState.sprint = normalizedDistance > SPRINT_THRESHOLD;
    
    updateKnobPosition(deltaX, deltaY, joystickState.sprint);
  }, [updateKnobPosition]);

  const handleEnd = useCallback(() => {
    isActiveRef.current = false;
    joystickState.x = 0;
    joystickState.y = 0;
    joystickState.active = false;
    joystickState.sprint = false;
    
    updateKnobPosition(0, 0, false);
  }, [updateKnobPosition]);

  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isActiveRef.current) return;
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const handleJumpStart = useCallback(() => {
    joystickState.jump = true;
  }, []);

  const handleJumpEnd = useCallback(() => {
    joystickState.jump = false;
  }, []);

  const handleInteractStart = useCallback(() => {
    joystickState.interact = true;
  }, []);

  const handleInteractEnd = useCallback(() => {
    joystickState.interact = false;
  }, []);

  useEffect(() => {
    if (!isActiveRef.current) return;
    
    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    
    const onMouseUp = () => {
      handleEnd();
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleMove, handleEnd]);

  if (!isMobile) return null;

  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
  };

  return (
    <>
      {/* Menu button - top right with safe area */}
      <button
        className="fixed right-6 w-12 h-12 rounded-full z-[200] flex items-center justify-center touch-none select-none"
        style={{
          top: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
          ...(menuOpen 
            ? { background: 'rgba(255, 255, 255, 0.3)', border: '2px solid rgba(255, 255, 255, 0.5)' } 
            : buttonStyle)
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
      >
        <Menu className="w-5 h-5 text-white/80" />
      </button>

      {/* Joystick - bottom left with safe area */}
      <div
        ref={containerRef}
        className="fixed left-8 w-28 h-28 rounded-full z-[200] touch-none select-none"
        style={{
          bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      >
        {/* Inner knob - DOM updated directly via ref */}
        <div
          ref={knobRef}
          className="absolute w-12 h-12 rounded-full pointer-events-none"
          style={{
            background: 'rgba(255, 255, 255, 0.35)',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Sprint indicator ring */}
        <div
          ref={sprintRingRef}
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-100"
          style={{
            border: '2px solid rgba(255, 255, 255, 0.5)',
            opacity: 0,
          }}
        />
      </div>

      {/* Action buttons - bottom right with safe area */}
      <div 
        className="fixed right-8 z-[200] flex flex-col gap-4"
        style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Enter/Interact button */}
        <button
          className="w-14 h-14 rounded-full touch-none select-none flex items-center justify-center text-white/70 text-xs font-medium tracking-wider"
          style={buttonStyle}
          onTouchStart={(e) => {
            e.preventDefault();
            handleInteractStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleInteractEnd();
          }}
          onMouseDown={handleInteractStart}
          onMouseUp={handleInteractEnd}
        >
          ENTER
        </button>

        {/* Jump button */}
        <button
          className="w-14 h-14 rounded-full touch-none select-none flex items-center justify-center text-white/70 text-xs font-medium tracking-wider"
          style={buttonStyle}
          onTouchStart={(e) => {
            e.preventDefault();
            handleJumpStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleJumpEnd();
          }}
          onMouseDown={handleJumpStart}
          onMouseUp={handleJumpEnd}
        >
          JUMP
        </button>
      </div>
    </>
  );
}
