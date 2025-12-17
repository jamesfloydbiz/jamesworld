import { useRef, useEffect, useState, useCallback } from 'react';
import { joystickState } from '@/components/museum/useKeyboardControls';
import { useGameStore } from '@/store/gameStore';
import { Menu } from 'lucide-react';

const SPRINT_THRESHOLD = 0.7; // 70% of max radius triggers sprint

export function MobileJoystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { setMenuOpen, menuOpen } = useGameStore();

  // Detect mobile/touch device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    setIsActive(true);
    joystickState.active = true;
    
    const rect = containerRef.current.getBoundingClientRect();
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
    
    setKnobPosition({ x: deltaX, y: deltaY });
    
    const normalizedDistance = distance / maxRadius;
    joystickState.x = deltaX / maxRadius;
    joystickState.y = deltaY / maxRadius;
    joystickState.sprint = normalizedDistance > SPRINT_THRESHOLD;
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !isActive) return;
    
    const rect = containerRef.current.getBoundingClientRect();
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
    
    setKnobPosition({ x: deltaX, y: deltaY });
    
    const normalizedDistance = Math.min(distance / maxRadius, 1);
    joystickState.x = deltaX / maxRadius;
    joystickState.y = deltaY / maxRadius;
    joystickState.sprint = normalizedDistance > SPRINT_THRESHOLD;
  }, [isActive]);

  const handleEnd = useCallback(() => {
    setIsActive(false);
    setKnobPosition({ x: 0, y: 0 });
    joystickState.x = 0;
    joystickState.y = 0;
    joystickState.active = false;
    joystickState.sprint = false;
  }, []);

  // Touch events for joystick
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isActive) return;
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Jump button handlers
  const handleJumpStart = useCallback(() => {
    joystickState.jump = true;
  }, []);

  const handleJumpEnd = useCallback(() => {
    joystickState.jump = false;
  }, []);

  // Enter/interact button handlers  
  const handleInteractStart = useCallback(() => {
    joystickState.interact = true;
  }, []);

  const handleInteractEnd = useCallback(() => {
    joystickState.interact = false;
  }, []);

  // Mouse events (for testing on desktop)
  useEffect(() => {
    if (!isActive) return;
    
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
  }, [isActive, handleMove, handleEnd]);

  // Only show on mobile
  if (!isMobile) return null;

  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
  };

  const activeButtonStyle = {
    background: 'rgba(255, 255, 255, 0.3)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
  };

  return (
    <>
      {/* Menu button - top right */}
      <button
        className="fixed top-6 right-6 w-12 h-12 rounded-full z-50 flex items-center justify-center touch-none select-none"
        style={menuOpen ? activeButtonStyle : buttonStyle}
        onClick={() => setMenuOpen(!menuOpen)}
        onTouchEnd={(e) => {
          e.preventDefault();
          setMenuOpen(!menuOpen);
        }}
      >
        <Menu className="w-5 h-5 text-white/80" />
      </button>

      {/* Joystick - bottom left */}
      <div
        ref={containerRef}
        className="fixed bottom-8 left-8 w-28 h-28 rounded-full z-50 touch-none select-none"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      >
        {/* Inner knob */}
        <div
          className="absolute w-12 h-12 rounded-full pointer-events-none"
          style={{
            background: isActive 
              ? 'rgba(255, 255, 255, 0.6)' 
              : 'rgba(255, 255, 255, 0.35)',
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${knobPosition.x}px), calc(-50% + ${knobPosition.y}px))`,
            transition: isActive ? 'none' : 'transform 0.15s ease-out',
          }}
        />
        {/* Sprint indicator ring */}
        {joystickState.sprint && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: '2px solid rgba(255, 255, 255, 0.5)',
            }}
          />
        )}
      </div>

      {/* Action buttons - bottom right */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
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
