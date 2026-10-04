'use client';

import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import HeroBackground from '@/components/hero/HeroBackground';
import HeroBorder from '@/components/hero/HeroBorder';
import AboutSection from '@/components/about/AboutSection';
import SponsorsSection from '@/components/sponsors/SponsorsSection';
import CreativeFooter from '@/components/footer/CreativeFooter';
import { usePointerTracker } from '@/hooks/usePointerTracker';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollEarth } from '@/hooks/useScrollEarth';

const HeroEarth = dynamic(() => import('@/components/hero/HeroEarth'), {
  ssr: false,
});

const HudLayer = dynamic(() => import('@/components/hero/HudLayer'), {
  ssr: false,
});

// Liquid Glass Carousel — WebGL, canvas-based. Must be client-side only.
const LiquidGlassCarouselSection = dynamic(
  () => import('@/components/carousel/LiquidGlassCarouselSection'),
  { ssr: false }
);

function subscribeToViewport(callback: () => void) {
  window.addEventListener('resize', callback, { passive: true });
  return () => window.removeEventListener('resize', callback);
}

const getDesktopSnapshot = () => window.innerWidth >= 1024;
const getDesktopServerSnapshot = () => false;

export default function Home() {
  const reducedMotion = useReducedMotion();
  const isDesktop = useSyncExternalStore(
    subscribeToViewport,
    getDesktopSnapshot,
    getDesktopServerSnapshot,
  );
  const bgRef = useRef<HTMLDivElement>(null);
  const { earthRef, aboutEarthRef, aboutSectionRef, hudRef, logoRef } = useScrollEarth(bgRef);

  const { containerRef, onPointerMove, onPointerEnter, onPointerLeave, onPointerDown } =
    usePointerTracker({
      lerp: 0.18,
      snap: reducedMotion,
      onEnter: () => containerRef.current?.classList.add('hud-visible'),
      onLeave: () => containerRef.current?.classList.remove('hud-visible'),
      onTap: () => {
        containerRef.current?.classList.add('hud-visible');
        setTimeout(() => containerRef.current?.classList.remove('hud-visible'), 1500);
      }
    });

  return (
    <main className="relative w-full overflow-x-hidden bg-black">
      {/* ── Fixed cosmic background (stars, nebula, HUD) ── */}
      <div ref={bgRef} style={{ display: 'block' }}>
        <HeroBackground hudRef={hudRef} logoRef={logoRef} />
      </div>

      {/*
        ── Fixed Earth ──
        We use a single wrapper.
        Mobile stays viewport-scaled. Desktop scales with available viewport height,
        so the globe cannot overwhelm the wordmark on short laptop screens.
      */}
      <div
        className="fixed z-[5] lg:z-30 pointer-events-none will-change-transform w-[clamp(280px,90vw,820px)] h-[clamp(280px,90vw,820px)] left-1/2 top-1/2 visible"
        ref={earthRef}
        style={isDesktop ? {
          width: 'min(90vw, 100vh, 1000px)',
          height: 'min(90vw, 100vh, 1000px)',
        } : undefined}
      >
        {/* Inner canvas that handles scaling */}
        <div
          data-earth-inner
          className="absolute w-full h-full pointer-events-none left-1/2 top-1/2 origin-center"
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
            <HeroEarth scene="hero" />
          </div>
        </div>
      </div>

      {/* ── Hero viewport (100vh spacer) ── */}
      <div className="relative w-full z-10" style={{ height: '150svh' }}>
        {/* Layer 2: HUD reveal mask container */}
        <div
          ref={containerRef}
          className="hud-mask-container"
          onPointerMove={onPointerMove}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
        >
          {/* HudLayer is cursor-interactive — skip on touch/mobile */}
          {isDesktop && !reducedMotion && (
            <HudLayer reducedMotion={reducedMotion} />
          )}
        </div>

        {/* Layer 3: Premium architectural framing overlay */}
        <HeroBorder />
      </div>

      {/* ── About Shunya section (100vh, seamless continuation) ── */}
      <AboutSection
        key="about-section-fixed"
        sectionRef={aboutSectionRef}
        earthRef={aboutEarthRef}
      />

      {/* ── PART 2: The grounded reality (Fades in after Part 1) ── */}
      <PartTwoWrapper>
        {/* ── Liquid Glass Carousel (WebGL, ssr:false) ── */}
        <LiquidGlassCarouselSection />

        {/* ── Sponsorship Marquee ── */}
        <SponsorsSection />

        {/* ── Creative Sci-Fi Footer ── */}
        <CreativeFooter />
      </PartTwoWrapper>
    </main>
  );
}

/**
 * Isolates Part 2 into a wrapper that fades and slides up 
 * only when it comes into the viewport, creating a distinct "barrier" reveal.
 */
function PartTwoWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translateY(100px)',
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}
