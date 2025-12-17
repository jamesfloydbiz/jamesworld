import { useRef, useEffect, useCallback } from 'react';

export interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  escape: boolean;
  sprint: boolean;
  jump: boolean;
}

// Use refs instead of state to avoid re-renders and movement glitches
export function useKeyboardControls(): KeyState {
  const keysRef = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
    escape: false,
    sprint: false,
    jump: false,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    
    if (key === 'w' || key === 'arrowup') keysRef.current.forward = true;
    if (key === 's' || key === 'arrowdown') keysRef.current.backward = true;
    if (key === 'a' || key === 'arrowleft') keysRef.current.left = true;
    if (key === 'd' || key === 'arrowright') keysRef.current.right = true;
    if (key === 'enter') keysRef.current.interact = true;
    if (key === 'escape') keysRef.current.escape = true;
    if (key === 'shift') keysRef.current.sprint = true;
    if (key === ' ') keysRef.current.jump = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    
    if (key === 'w' || key === 'arrowup') keysRef.current.forward = false;
    if (key === 's' || key === 'arrowdown') keysRef.current.backward = false;
    if (key === 'a' || key === 'arrowleft') keysRef.current.left = false;
    if (key === 'd' || key === 'arrowright') keysRef.current.right = false;
    if (key === 'enter') keysRef.current.interact = false;
    if (key === 'escape') keysRef.current.escape = false;
    if (key === 'shift') keysRef.current.sprint = false;
    if (key === ' ') keysRef.current.jump = false;
  }, []);

  const handleBlur = useCallback(() => {
    keysRef.current = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      interact: false,
      escape: false,
      sprint: false,
      jump: false,
    };
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  return keysRef.current;
}

// Joystick state - shared with touch controls
export const joystickState = {
  x: 0,
  y: 0,
  active: false,
  sprint: false,
  jump: false,
  interact: false,
};
