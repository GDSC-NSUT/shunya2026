import { useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * useParallax — writes --mouse-x / --mouse-y CSS vars on mousemove.
 *
 * The loop runs while the mouse is inside the window and exits only when
 * the pointer leaves (mouseleave). This avoids the 1-frame re-entry gap
 * that occurs when the loop exits on convergence and then immediately
 * restarts on the next mousemove — visible as a micro-jerk on 120Hz screens.
 *
 * Dead-zone: values within 0.0005 of target skip the CSS var write.
 * Cost when idle (mouse still): ~2 subtractions + 2 comparisons per frame — negligible.
 */
export function useParallax() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let running = false;

    const LERPF = 0.08; // gentle, cinematic feel

    const animate = () => {
      const diffX = targetX - currentX;
      const diffY = targetY - currentY;

      currentX += diffX * LERPF;
      currentY += diffY * LERPF;

      // Only write to DOM if there's a meaningful change
      if (Math.abs(diffX) > 0.0005 || Math.abs(diffY) > 0.0005) {
        document.documentElement.style.setProperty('--mouse-x', currentX.toFixed(4));
        document.documentElement.style.setProperty('--mouse-y', currentY.toFixed(4));
      }

      if (running) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleMouseEnter = () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleMouseLeave = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // Start loop when mouse enters the document
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [prefersReducedMotion]);

  return {};
}
