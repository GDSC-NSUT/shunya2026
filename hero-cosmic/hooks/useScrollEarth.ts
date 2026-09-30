import { useEffect, useRef } from 'react';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * useScrollEarth — drives Earth and HUD opacity on scroll via a continuous rAF loop.
 *
 * Performance contract:
 * - The rAF loop runs continuously but is cheap: dead-zone guards prevent DOM writes
 *   on frames where values haven't meaningfully changed.
 * - We intentionally do NOT exit the rAF loop on convergence. Doing so creates a
 *   1-frame gap on the next scroll event (loop exit → scroll fires → startLoop() →
 *   requestAnimationFrame → tick runs) which shows as a visible jerk on 120 Hz screens.
 * - LERPF raised to 0.18 for a more liquid, immediate-feeling response.
 */
export function useScrollEarth() {
  const earthRef = useRef<HTMLDivElement>(null);
  const hudRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!earthRef.current) return;
    const el = earthRef.current;
    const inner = el.querySelector('[data-earth-inner]') as HTMLElement | null;

    if (hudRef.current) hudRef.current.style.opacity = '1';

    let rafId: number;
    // Raised from 0.14 → 0.18: more liquid, faster convergence, less "sticky" feel
    const LERPF = 0.18;

    let curY = 0;
    let curX = 0;
    let curScale = 1;
    let curHud = 1;
    let curBlur = 0;

    // Track last written values to skip redundant DOM writes (dead-zone)
    let lastWrittenY = -9999;
    let lastWrittenX = -9999;
    let lastWrittenScale = -9999;
    let lastWrittenHud = -9999;
    let lastWrittenBlur = -9999;

    let firstTick = true;

    const tick = () => {
      const scrollY  = window.scrollY;
      const curVh    = window.innerHeight;
      const isMobile = window.innerWidth < 1024;

      const raw    = clamp(scrollY / Math.max(curVh, 1), 0, 1);
      const t      = easeInOutCubic(raw);
      const tgtHud = 1 - clamp(raw / 0.45, 0, 1);

      let tgtX: number, tgtY: number, tgtScale: number, tgtBlur: number;

      if (isMobile) {
        tgtScale = lerp(0.90, 0.90, t);
        tgtX     = 0;
        tgtY     = lerp(curVh * 0.49, 0, t); // Pushed lower per user request
        tgtBlur  = lerp(0, 1.0, t);

        if (scrollY > curVh) {
          tgtY -= (scrollY - curVh);
        }
      } else {
        tgtX     = lerp(0, -22, t);
        tgtY     = lerp(curVh * 0.6, -curVh * 0.04, t);
        tgtScale = lerp(1, 0.60, t);
        tgtBlur  = lerp(0, 1.0, t);

        if (scrollY > curVh) {
          tgtY -= (scrollY - curVh);
        }
      }

      if (firstTick) {
        curX = tgtX;
        curY = tgtY;
        curScale = tgtScale;
        curHud = tgtHud;
        curBlur = tgtBlur;
        firstTick = false;
      } else {
        curX     += (tgtX - curX) * LERPF;
        curY     += (tgtY - curY) * LERPF;
        curScale += (tgtScale - curScale) * LERPF;
        curHud   += (tgtHud - curHud) * LERPF;
        curBlur  += (tgtBlur - curBlur) * LERPF;
      }

      // ── DOM writes: only when value changed beyond dead-zone ──────
      if (earthRef.current) {
        const xChanged = Math.abs(curX - lastWrittenX) > 0.15;
        const yChanged = Math.abs(curY - lastWrittenY) > 0.15;
        if (xChanged || yChanged) {
          earthRef.current.style.transform =
            `translate(-50%, -50%) translate3d(${curX}vw, ${curY.toFixed(2)}px, 0)`;
          lastWrittenX = curX;
          lastWrittenY = curY;
        }
      }

      if (inner && (Math.abs(curScale - lastWrittenScale) > 0.001 || Math.abs(curBlur - lastWrittenBlur) > 0.05)) {
        inner.style.transform = `translate(-50%, -50%) translate3d(0,0,0) scale(${curScale.toFixed(4)})`;
        inner.style.filter = curBlur > 0.05 ? `blur(${curBlur.toFixed(2)}px)` : 'none';
        lastWrittenScale = curScale;
        lastWrittenBlur = curBlur;
      }

      if (hudRef.current && Math.abs(curHud - lastWrittenHud) > 0.002) {
        hudRef.current.style.opacity = `${clamp(curHud, 0, 1).toFixed(3)}`;
        lastWrittenHud = curHud;
      }

      // Loop runs continuously — no convergence exit.
      // Dead-zone guards above ensure no DOM work on settled frames.
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return { earthRef, hudRef };
}
