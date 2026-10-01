'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScroll — Lenis-based cinematic scroll for the entire page.
 *
 * Lenis intercepts the native scroll wheel and applies a lerped ease.
 * No matter how hard the user spins the wheel, the page glides at
 * a controlled, fluid pace.
 *
 * lerp: 0.075 — lower = slower/silkier. 0.1 = snappy, 0.05 = very cinematic.
 *
 * We expose the lenis instance on window.__lenis so other hooks (useScrollEarth)
 * can hook into lenis.on('scroll') to get the virtual scroll position instead
 * of native window.scrollY, keeping earth physics in sync with the eased scroll.
 */
declare global {
  interface Window { __lenis?: Lenis; }
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Expose so useScrollEarth can subscribe to virtual scroll position
    window.__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
