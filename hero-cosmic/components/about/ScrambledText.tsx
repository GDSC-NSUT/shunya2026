'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const ScrambledText: React.FC<ScrambledTextProps> = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  children
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLElement[]>([]);
  // eslint-disable-next-line react-hooks/refs
  charsRef.current = [];

  useEffect(() => {
    if (!rootRef.current) return;

    let charPositions: { x: number; y: number }[] = [];

    const updatePositions = () => {
      charPositions = charsRef.current.map((c) => ({
        x: c.offsetLeft + c.offsetWidth / 2,
        y: c.offsetTop + c.offsetHeight / 2,
      }));
    };

    const timeout = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions, { passive: true });

    // ── Typewriter intro ──
    let hasAnimated = false;
    let introTl: gsap.core.Timeline | null = null;
    gsap.set(charsRef.current, { opacity: 0 });

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        if (!hasAnimated) {
          hasAnimated = true;
          
          if (introTl) introTl.kill();
          introTl = gsap.timeline();

          let cumulativeDelay = 0;

          charsRef.current.forEach((c) => {
            const original = c.dataset.content || '';
            const randomDelay = 0.005 + Math.random() * 0.01;
            cumulativeDelay += randomDelay;
            
            const proxy = { p: 0 };
            introTl!.to(proxy, {
              p: 1,
              duration: 0.4 + Math.random() * 0.2, // short glitch burst
              ease: 'none',
              onStart: () => { c.style.opacity = '1'; },
              onUpdate: () => {
                if (proxy.p < 0.8) {
                  if (Math.random() > speed) {
                    c.innerHTML = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                  }
                } else {
                  c.innerHTML = original;
                }
              },
              onComplete: () => { c.innerHTML = original; }
            }, cumulativeDelay);
          });
        }
      } else {
        // Do NOT reset on scroll-out — killing+restarting GSAP tweens for every char
        // on every scroll event is a severe CPU spike. Animate-once is the correct pattern.
      }
    }, { threshold: 0.1 }); // Lower threshold so it triggers earlier and resets safely

    observer.observe(rootRef.current);

    // ── Hover scramble — rAF-gated to prevent per-pointermove thrashing ──
    // PERF FIX: was running a full O(n) loop on EVERY pointermove event (no throttle).
    // Now gated by rAF: we record the latest pointer coords and only process them
    // on the next animation frame — collapses rapid fire events to at most 60/s.
    let rafScheduled = false;
    let latestMouseX = 0;
    let latestMouseY = 0;

    const processMove = () => {
      rafScheduled = false;
      if (!rootRef.current) return;

      charsRef.current.forEach((c, i) => {
        const pos = charPositions[i];
        if (!pos) return;

        const dx = latestMouseX - pos.x;
        const dy = latestMouseY - pos.y;
        const dist = Math.hypot(dx, dy);

        if (dist < radius && !gsap.isTweening(c)) {
          const original = c.dataset.content || '';
          const proxy = { p: 0 };
          const animDuration = Math.max(0.1, duration * (1 - dist / radius));

          gsap.to(proxy, {
            p: 1,
            duration: animDuration,
            ease: 'none',
            onUpdate: () => {
              if (proxy.p < 0.9) {
                if (Math.random() > speed) {
                  c.innerHTML = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                }
              } else {
                c.innerHTML = original;
              }
            },
            onComplete: () => { c.innerHTML = original; },
          });
        }
      });
    };

    const handleMove = (e: PointerEvent) => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      latestMouseX = e.clientX - rect.left;
      latestMouseY = e.clientY - rect.top;

      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(processMove);
      }
    };

    const el = rootRef.current;

    // Skip hover scramble on touch devices — pointermove fires on every scroll
    // touch-drag, spawning GSAP tweens that thrash the CPU during scroll.
    const isTouchDevice = typeof window !== 'undefined' &&
      (navigator.maxTouchPoints > 0 || window.innerWidth < 1024);

    if (!isTouchDevice) {
      el.addEventListener('pointermove', handleMove, { passive: true });
    }

    return () => {
      clearTimeout(timeout);
      if (!isTouchDevice) el.removeEventListener('pointermove', handleMove);
      window.removeEventListener('resize', updatePositions);
      observer.disconnect();
    };
  }, [radius, duration, speed, scrambleChars]);

  if (typeof children !== 'string') {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <>
      {/*
        PERF FIX: Removed `will-change: transform` from .scramble-char.
        The chars only change opacity + innerHTML — will-change:transform was
        promoting ~600 compositor layers for ZERO benefit, exhausting GPU memory.
        display:inline-block is kept for layout correctness.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scramble-char { display: inline-block; }
      `}} />
      <div ref={rootRef} className={`text-block ${className}`} style={{ position: 'relative', ...style }}>
        <p style={{ margin: 0 }}>
          {children.split(' ').map((word, wIdx, wordsArr) => (
            <React.Fragment key={wIdx}>
              <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                {word.split('').map((char, cIdx) => (
                  <span
                    key={cIdx}
                    ref={(el) => { if (el) charsRef.current.push(el); }}
                    className="scramble-char"
                    data-content={char}
                  >
                    {char}
                  </span>
                ))}
              </span>
              {wIdx < wordsArr.length - 1 && ' '}
            </React.Fragment>
          ))}
        </p>
      </div>
    </>
  );
};

export default ScrambledText;
