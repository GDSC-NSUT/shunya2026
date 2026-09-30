'use client';

import { useCallback, useRef, useEffect } from 'react';

interface PointerTrackerOptions {
  /** Lerp factor for eased following (0–1). Default 0.18 */
  lerp?: number;
  /** Whether to snap instead of lerp (for reduced-motion). Default false */
  snap?: boolean;
  /** Callback when pointer enters */
  onEnter?: (x: number, y: number) => void;
  /** Callback when pointer leaves */
  onLeave?: () => void;
  /** Callback when touch-tap occurs */
  onTap?: (x: number, y: number) => void;
}

/**
 * Tracks pointer position over a container element using raw refs + rAF.
 * Writes lerped position to CSS custom properties --mx / --my on the container.
 * ZERO React state updates in the hot path.
 */
export function usePointerTracker(options: PointerTrackerOptions = {}) {
  const { lerp = 0.18, snap = false, onEnter, onLeave, onTap } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const rawTarget = useRef({ x: 0, y: 0 });
  const displayPos = useRef({ x: 0, y: 0 });
  const isInside = useRef(false);
  const rafId = useRef<number>(0);
  const touchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The rAF loop — lerps displayPos toward rawTarget, writes CSS vars
  const tick = useCallback(function tickFn() {
    const el = containerRef.current;
    if (!el || !isInside.current) return;

    const dx = rawTarget.current.x - displayPos.current.x;
    const dy = rawTarget.current.y - displayPos.current.y;

    if (snap) {
      displayPos.current.x = rawTarget.current.x;
      displayPos.current.y = rawTarget.current.y;
    } else {
      displayPos.current.x += dx * lerp;
      displayPos.current.y += dy * lerp;
    }

    el.style.setProperty('--mx', `${displayPos.current.x}px`);
    el.style.setProperty('--my', `${displayPos.current.y}px`);

    rafId.current = requestAnimationFrame(tickFn);
  }, [lerp, snap]);

  const startLoop = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(rafId.current);
  }, []);

  const cachedRect = useRef<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    if (containerRef.current) {
      cachedRect.current = containerRef.current.getBoundingClientRect();
    }
  }, []);

  // Update rect on scroll or resize to keep it accurate
  useEffect(() => {
    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cachedRect.current) updateRect();
    const rect = cachedRect.current;
    if (!rect) return;
    rawTarget.current.x = e.clientX - rect.left;
    rawTarget.current.y = e.clientY - rect.top;
  }, [updateRect]);

  const onPointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Handle touch separately
    if (e.pointerType === 'touch') return;

    if (!cachedRect.current) updateRect();
    const rect = cachedRect.current;
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    rawTarget.current.x = x;
    rawTarget.current.y = y;
    // Snap display to entry point so the mask doesn't lerp from (0,0)
    displayPos.current.x = x;
    displayPos.current.y = y;

    const el = containerRef.current;
    if (el) {
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    }

    isInside.current = true;
    startLoop();
    onEnter?.(x, y);
  }, [startLoop, onEnter, updateRect]);

  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;

    isInside.current = false;
    stopLoop();
    onLeave?.();
  }, [stopLoop, onLeave]);

  // Touch: tap → reveal at point → hold 2.5s → fade out
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    rawTarget.current.x = x;
    rawTarget.current.y = y;
    displayPos.current.x = x;
    displayPos.current.y = y;

    const el = containerRef.current;
    if (el) {
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    }

    isInside.current = true;
    onTap?.(x, y);

    // Clear any existing timeout
    if (touchTimeout.current) clearTimeout(touchTimeout.current);

    // Auto-fade after 2.5s
    touchTimeout.current = setTimeout(() => {
      isInside.current = false;
      onLeave?.();
    }, 2500);
  }, [onTap, onLeave]);

  return {
    containerRef,
    onPointerMove,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
  };
}
