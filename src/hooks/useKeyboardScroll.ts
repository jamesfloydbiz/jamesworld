import { useEffect } from 'react';

export function useKeyboardScroll(scrollAmount = 200) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't scroll if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Scroll down: Right arrow or D
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
      
      // Scroll up: Left arrow or A
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollAmount]);
}
