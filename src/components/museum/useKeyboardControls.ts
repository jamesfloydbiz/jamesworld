import { useState, useEffect } from 'react';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  escape: boolean;
  sprint: boolean;
  jump: boolean;
}

export function useKeyboardControls(): KeyState {
  const [keys, setKeys] = useState<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
    escape: false,
    sprint: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setKeys(prev => {
        const newState = { ...prev };
        
        if (key === 'w' || key === 'arrowup') newState.forward = true;
        if (key === 's' || key === 'arrowdown') newState.backward = true;
        if (key === 'a' || key === 'arrowleft') newState.left = true;
        if (key === 'd' || key === 'arrowright') newState.right = true;
        if (key === 'enter') newState.interact = true;
        if (key === 'escape') newState.escape = true;
        if (key === 'shift') newState.sprint = true;
        if (key === ' ') newState.jump = true;
        
        return newState;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setKeys(prev => {
        const newState = { ...prev };
        
        if (key === 'w' || key === 'arrowup') newState.forward = false;
        if (key === 's' || key === 'arrowdown') newState.backward = false;
        if (key === 'a' || key === 'arrowleft') newState.left = false;
        if (key === 'd' || key === 'arrowright') newState.right = false;
        if (key === 'enter') newState.interact = false;
        if (key === 'escape') newState.escape = false;
        if (key === 'shift') newState.sprint = false;
        if (key === ' ') newState.jump = false;
        
        return newState;
      });
    };

    const handleBlur = () => {
      setKeys({
        forward: false,
        backward: false,
        left: false,
        right: false,
        interact: false,
        escape: false,
        sprint: false,
        jump: false,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return keys;
}
