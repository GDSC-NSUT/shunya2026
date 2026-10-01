import { useEffect, useRef, RefObject } from 'react';

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
 * useScrollEarth — drives Earth and HUD opacity on scroll via rAF.
 *
 * Mobile performance contract:
 * - rAF loop EXITS when values converge (dead-zone < threshold for all axes).
 *   On mobile this is critical — a continuous loop drains battery and keeps
 *   the CPU hot, causing thermal throttling that makes everything feel laggy.
 * - Loop is RESTARTED only on scroll events (passive listener).
 * - Window dimensions are cached; never read inside the hot tick path.
 */
export function useScrollEarth(bgRef?: RefObject<HTMLDivElement | null>) {
  const earthRef = useRef<HTMLDivElement>(null);
  const hudRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!earthRef.current) return;
    const el = earthRef.current;
    const inner = el.querySelector('[data-earth-inner]') as HTMLElement | null;

    if (hudRef.current) hudRef.current.style.opacity = '1';

    let rafId: number | null = null;
    const LERPF = 0.14; // slightly gentler — less work per frame on mobile
    const SETTLE = 0.1; // convergence threshold

    let curY = 0;
    let curX = 0;
    let curScale = 1;
    let curHud = 1;

    // Track last written values — skip DOM writes when settled
    let lastWrittenY = -9999;
    let lastWrittenX = -9999;
    let lastWrittenScale = -9999;
    let lastWrittenHud = -9999;

    let firstTick = true;

    // Cache window dimensions — NEVER read inside tick()
    let cachedVh = window.innerHeight;
    let cachedIsMobile = window.innerWidth < 1024;

    const handleResize = () => {
      cachedVh = window.innerHeight;
      cachedIsMobile = window.innerWidth < 1024;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Track Lenis virtual scroll position — falls back to window.scrollY if Lenis hasn't mounted yet
    let lenisScrollY = 0;

    const tick = () => {
      // Use Lenis virtual scroll position so Earth physics follow the eased scroll,
      // not the raw native position (which would make Earth jitter on fast wheel spin)
      const scrollY = lenisScrollY;
      const curVh   = cachedVh;
      const isMobile = cachedIsMobile;

      // Increase scroll distance to 1.5x viewport height to "slow down" the transition
      const scrollDistance = curVh * 1.5;
      const raw    = clamp(scrollY / Math.max(scrollDistance, 1), 0, 1);
      const t      = easeInOutCubic(raw);
      const tgtHud = 1 - clamp(raw / 0.45, 0, 1);

      let tgtX: number, tgtY: number, tgtScale: number;

      if (isMobile) {
        tgtScale = 0.90;
        tgtX     = 0;
        tgtY     = lerp(curVh * 0.49, 0, t);
        if (scrollY > scrollDistance) tgtY -= (scrollY - scrollDistance);
      } else {
        tgtX     = lerp(0, -22, t);
        tgtY     = lerp(curVh * 0.6, -curVh * 0.04, t);
        tgtScale = lerp(1, 0.60, t);
        if (scrollY > scrollDistance) tgtY -= (scrollY - scrollDistance);
      }

      if (firstTick || Math.abs(tgtY - curY) > curVh) {
        // Snap immediately on first tick or if there's a massive jump (e.g. dragging scrollbar)
        curX = tgtX; curY = tgtY; curScale = tgtScale; curHud = tgtHud;
        firstTick = false;
      } else {
        curX     += (tgtX - curX) * LERPF;
        curY     += (tgtY - curY) * LERPF;
        curScale += (tgtScale - curScale) * LERPF;
        curHud   += (tgtHud - curHud) * LERPF;
      }

      // ── DOM writes: only when value changed beyond dead-zone ──
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

      if (inner && Math.abs(curScale - lastWrittenScale) > 0.001) {
        inner.style.transform = `translate(-50%, -50%) translate3d(0,0,0) scale(${curScale.toFixed(4)})`;
        lastWrittenScale = curScale;
      }

      if (hudRef.current && Math.abs(curHud - lastWrittenHud) > 0.002) {
        hudRef.current.style.opacity = `${clamp(curHud, 0, 1).toFixed(3)}`;
        lastWrittenHud = curHud;
      }

      // ── Convergence check — EXIT the loop when all values are settled ──
      // This is the key mobile fix: on mobile the loop was spinning at 60fps
      // constantly even when the page was completely still, wasting CPU/GPU.
      const settled =
        Math.abs(tgtX - curX) < SETTLE &&
        Math.abs(tgtY - curY) < SETTLE &&
        Math.abs(tgtScale - curScale) < 0.001 &&
        Math.abs(tgtHud - curHud) < 0.002;

      if (settled) {
        rafId = null; // Loop exits — no more rAF until next scroll
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };


    // Bootstrap: run once to set initial position
    rafId = requestAnimationFrame(tick);



    // Prefer Lenis scroll events (virtual/eased position) over native scroll.
    // If Lenis hasn't loaded yet we fall back to native scroll.
    const startLoop = (scrollOrLenis: number | { scroll: number }) => {
      // Called by either: lenis.on('scroll', cb) where arg is {scroll} object,
      // or native 'scroll' event where we read window.scrollY
      if (typeof scrollOrLenis === 'object' && 'scroll' in scrollOrLenis) {
        lenisScrollY = scrollOrLenis.scroll;
      } else {
        lenisScrollY = window.scrollY;
      }

      // Visibility
      const isInView = lenisScrollY < cachedVh * 2.0;
      if (el) {
        el.classList.toggle('invisible', !isInView);
        el.classList.toggle('visible', isInView);
      }
      if (bgRef?.current) {
        bgRef.current.style.display = isInView ? 'block' : 'none';
      }

      if (rafId === null) {
        firstTick = false;
        rafId = requestAnimationFrame(tick);
      }
    };

    // Try to subscribe to Lenis, fall back to native scroll
    const tryLenisSubscription = () => {
      if (window.__lenis) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.__lenis.on('scroll', startLoop as any);
        window.removeEventListener('scroll', nativeStartLoop);
      }
    };

    const nativeStartLoop = () => startLoop(window.scrollY);

    // Start with native scroll listener, then switch to Lenis when it mounts
    window.addEventListener('scroll', nativeStartLoop, { passive: true });
    // Lenis mounts asynchronously in a client useEffect — poll briefly
    const lenisCheckInterval = setInterval(() => {
      if (window.__lenis) {
        clearInterval(lenisCheckInterval);
        tryLenisSubscription();
      }
    }, 100);
    // Give up polling after 3s and stick with native scroll
    setTimeout(() => clearInterval(lenisCheckInterval), 3000);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', nativeStartLoop);
      if (window.__lenis) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.__lenis.off('scroll', startLoop as any);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { earthRef, hudRef };  // bgRef ownership stays in page.tsx
}
