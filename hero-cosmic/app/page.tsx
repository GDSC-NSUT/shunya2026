'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import HeroBackground from '@/components/hero/HeroBackground';
import HeroBorder from '@/components/hero/HeroBorder';
import AboutSection from '@/components/about/AboutSection';
import { usePointerTracker } from '@/hooks/usePointerTracker';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollEarth } from '@/hooks/useScrollEarth';

const HeroEarth = dynamic(() => import('@/components/hero/HeroEarth'), {
  ssr: false,
});

const HudLayer = dynamic(() => import('@/components/hero/HudLayer'), {
  ssr: false,
});

export default function Home() {
  const reducedMotion = useReducedMotion();
  const [hudVisible, setHudVisible] = useState(false);
  const { earthRef, hudRef } = useScrollEarth();

  const handleEnter = useCallback(() => {
    setHudVisible(true);
  }, []);

  const handleLeave = useCallback(() => {
    setHudVisible(false);
  }, []);

  const handleTap = useCallback(() => {
    setHudVisible(true);
    // Touch auto-fade is handled inside the hook (2.5s timeout calls onLeave)
  }, []);

  const { containerRef, onPointerMove, onPointerEnter, onPointerLeave, onPointerDown } =
    usePointerTracker({
      lerp: 0.18,
      snap: reducedMotion,
      onEnter: handleEnter,
      onLeave: handleLeave,
      onTap: handleTap,
    });

  return (
    <main className="relative w-full overflow-x-hidden bg-black">
      {/* ── Fixed cosmic background (stars, nebula, HUD) ── */}
      <HeroBackground hudRef={hudRef} />

      {/*
        ── Fixed Earth ──
        We use a single wrapper.
        Mobile: 311x311, Desktop: 820x820.
        Both use standard Tailwind left-1/2 -translate-x-1/2 for bulletproof horizontal centering.
      */}
      <div
        ref={earthRef}
        className="fixed z-[5] lg:z-30 pointer-events-none will-change-transform"
        style={{
          width: 'clamp(350px, 100vw, 820px)',
          height: 'clamp(350px, 100vw, 820px)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) translate3d(0, 0, 0)', // Default desktop center
        }}
      >
        {/* Inner canvas that handles scaling */}
        <div
          data-earth-inner
          className="absolute w-full h-full pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) translate3d(0,0,0) scale(1)', // Hook drives this
            transformOrigin: 'center center',
          }}
        >
          {/* Atmospheric glow halo */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: '-18px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(40,100,255,0.20) 0%, rgba(20,60,200,0.12) 40%, transparent 70%)',
              zIndex: 0,
            }}
          />
          <div className="relative w-full h-full z-10">
            <HeroEarth />
          </div>
        </div>
      </div>

      {/* ── Hero viewport (100vh spacer) ── */}
      <div className="relative w-full z-10" style={{ height: '100svh' }}>
        {/* Layer 2: HUD reveal mask container */}
        <div
          ref={containerRef}
          className={`hud-mask-container ${hudVisible ? 'hud-visible' : ''}`}
          onPointerMove={onPointerMove}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
        >
          <HudLayer reducedMotion={reducedMotion} />
        </div>

        {/* Layer 3: Premium architectural framing overlay */}
        <HeroBorder />
      </div>

      {/* ── About Shunya section (100vh, seamless continuation) ── */}
      <AboutSection key="about-section-fixed" />
    </main>
  );
}
