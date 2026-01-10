import { useRef, useEffect, useCallback, useState } from 'react';
import { joystickState } from '@/components/museum/useKeyboardControls';
import { useGameStore } from '@/store/gameStore';
import { Menu } from 'lucide-react';

const SPRINT_THRESHOLD = 0.7;

interface MobileJoystickProps {
  visible?: boolean;
  interactive?: boolean;
}

export function MobileJoystick({ visible = true, interactive = true }: MobileJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const sprintRingRef = useRef<HTMLDivElement>(null);
  const containerRectRef = useRef<DOMRect | null>(null);
  const isActiveRef = useRef(false);
  const { setMenuOpen, menuOpen, activePortal } = useGameStore();
  const [jumpPressed, setJumpPressed] = useState(false);
  const [enterPressed, setEnterPressed] = useState(false);

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
    
    const maxRadius = rect.width / 2 - 12;
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
    
    const maxRadius = rect.width / 2 - 12;
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

  // Reset all input state when returning from another tab/app or regaining focus
  useEffect(() => {
    const resetState = () => {
      // Reset joystick state
      joystickState.x = 0;
      joystickState.y = 0;
      joystickState.active = false;
      joystickState.sprint = false;
      joystickState.jump = false;
      joystickState.interact = false;
      isActiveRef.current = false;
      
      // Reset visual state
      updateKnobPosition(0, 0, false);
      setJumpPressed(false);
      setEnterPressed(false);
      
      // Refresh container rect for safe area changes
      if (containerRef.current) {
        containerRectRef.current = containerRef.current.getBoundingClientRect();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetState();
      }
    };
    
    const handleFocus = () => {
      resetState();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [updateKnobPosition]);

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

  const buttonStyle = {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    transition: 'transform 0.1s ease-out, border-color 0.1s ease-out',
  };

  const buttonActiveStyle = {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    transform: 'scale(1.05)',
  };

  // Common transition for opacity fade
  const opacityStyle = {
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.4s ease-out',
  };

  return (
    <>
      {/* Menu button - top right with safe area */}
      <button
        className="mobile-controls-layer fixed right-6 w-10 h-10 rounded-full flex items-center justify-center touch-none select-none z-[200]"
        style={{
          top: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
          pointerEvents: visible && interactive ? 'auto' : 'none',
          ...opacityStyle,
          ...(menuOpen 
            ? { background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.5)' } 
            : buttonStyle)
        }}
        onClick={() => setMenuOpen(!menuOpen)}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
      >
        <Menu className="w-4 h-4 text-white/70" />
      </button>

      {/* Joystick - bottom left with safe area */}
      <div
        ref={containerRef}
        className="mobile-controls-layer fixed left-6 w-20 h-20 rounded-full touch-none select-none z-[200]"
        style={{
          bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          pointerEvents: visible && interactive ? 'auto' : 'none',
          ...opacityStyle,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      >
        {/* Inner knob - small dot, DOM updated directly via ref */}
        <div
          ref={knobRef}
          className="absolute w-6 h-6 rounded-full pointer-events-none"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'background 0.1s ease-out',
          }}
        />
        {/* Sprint indicator ring */}
        <div
          ref={sprintRingRef}
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-100"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.4)',
            opacity: 0,
          }}
        />
      </div>

      {/* Action buttons - bottom right with safe area */}
      <div 
        className="mobile-controls-layer fixed right-6 flex flex-col gap-3 z-[200]"
        style={{ 
          bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
          pointerEvents: visible && interactive ? 'auto' : 'none',
          ...opacityStyle,
        }}
      >
        {/* Enter/Interact button - only visible when in a portal circle */}
        <button
          className="w-11 h-11 rounded-full touch-none select-none flex items-center justify-center text-white/70 text-[10px] font-mono tracking-wider uppercase"
          style={{
            ...(activePortal && enterPressed ? buttonActiveStyle : activePortal ? buttonStyle : {}),
            opacity: activePortal ? 1 : 0,
            pointerEvents: activePortal && visible && interactive ? 'auto' : 'none',
            transition: 'opacity 0.2s ease-out, transform 0.1s ease-out, border-color 0.1s ease-out',
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEnterPressed(true);
            handleInteractStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEnterPressed(false);
            handleInteractEnd();
          }}
          onMouseDown={() => {
            setEnterPressed(true);
            handleInteractStart();
          }}
          onMouseUp={() => {
            setEnterPressed(false);
            handleInteractEnd();
          }}
        >
          ENTER
        </button>

        {/* Jump button */}
        <button
          className="w-11 h-11 rounded-full touch-none select-none flex items-center justify-center text-white/70 text-[10px] font-mono tracking-wider uppercase"
          style={jumpPressed ? buttonActiveStyle : buttonStyle}
          onTouchStart={(e) => {
            e.preventDefault();
            setJumpPressed(true);
            handleJumpStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setJumpPressed(false);
            handleJumpEnd();
          }}
          onMouseDown={() => {
            setJumpPressed(true);
            handleJumpStart();
          }}
          onMouseUp={() => {
            setJumpPressed(false);
            handleJumpEnd();
          }}
        >
          JUMP
        </button>
      </div>
    </>
  );
}
