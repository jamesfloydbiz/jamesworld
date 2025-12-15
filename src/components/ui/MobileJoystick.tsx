import { useRef, useEffect, useState } from 'react';
import { joystickState } from '@/components/museum/useKeyboardControls';

export function MobileJoystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/touch device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    setIsActive(true);
    joystickState.active = true;
    handleMove(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current || !isActive) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    
    // Limit to outer circle radius
    const maxRadius = rect.width / 2 - 20;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }
    
    setKnobPosition({ x: deltaX, y: deltaY });
    
    // Normalize to -1 to 1 range
    joystickState.x = deltaX / maxRadius;
    joystickState.y = deltaY / maxRadius;
  };

  const handleEnd = () => {
    setIsActive(false);
    setKnobPosition({ x: 0, y: 0 });
    joystickState.x = 0;
    joystickState.y = 0;
    joystickState.active = false;
  };

  // Touch events
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

  // Mouse events (for testing on desktop)
  const onMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

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
  }, [isActive]);

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 right-8 w-28 h-28 rounded-full z-50 touch-none select-none"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
    >
      {/* Inner knob */}
      <div
        className="absolute w-12 h-12 rounded-full pointer-events-none"
        style={{
          background: isActive 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(255, 255, 255, 0.7)',
          boxShadow: isActive 
            ? '0 0 15px rgba(255, 255, 255, 0.5)' 
            : '0 0 10px rgba(255, 255, 255, 0.3)',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${knobPosition.x}px), calc(-50% + ${knobPosition.y}px))`,
          transition: isActive ? 'none' : 'transform 0.15s ease-out',
        }}
      />
    </div>
  );
}
