'use client';

import React, { useRef } from 'react';

import HeroBorder from '../hero/HeroBorder';
import ScrambledText from './ScrambledText';

export function useIsMobile() {
  // CRITICAL: initialise with false so server and first client render match.
  // The real value is resolved after mount in useEffect.
  // Reading window.innerWidth during render causes SSR/client mismatch (hydration error).
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    // Set accurate value immediately after mount (no visual flash — paint hasn't happened yet)
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

const BODY_TEXT =
  `Shunya 2026 is GDG NSUT’s flagship technology festival built around a bold vision — a future where technology and nature evolve together. The festival explores how Artificial Intelligence, Robotics, IoT, Biotechnology, Renewable Energy, Space Technology, and Sustainable Engineering can work alongside natural ecosystems to solve humanity’s greatest challenges. More than a celebration of technology, Shunya 2026 is a platform for responsible innovation — where creativity meets sustainability and ideas become solutions for a better tomorrow.`;

const FONT        = 'var(--font-corpta), sans-serif';

// ── Main About Section ──
export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  return (
    <section
      ref={sectionRef}
      id="about"
      style={{
        position: 'relative',
        width: '100%',
        background: '#000000', // Pure black background
        overflow: 'hidden',
      }}
    >
      <HeroBorder />

      {/* Star layer 1 — deep stars */}
      <div aria-hidden style={{
        position: 'absolute', inset: '-10%', zIndex: 0,
        transform: isMobile ? 'none' : `translate3d(calc(var(--mouse-x, 0) * -18px), calc(var(--mouse-y, 0) * -18px), 0)`,
        willChange: isMobile ? 'auto' : 'transform',
        pointerEvents: 'none',
        backgroundImage: 'url(/cosmic/stars_deep.png)',
        backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity: 0.25,   // increased to make stars more evident
      }} />

      {/* Star layer 2 — nearer stars */}
      <div aria-hidden style={{
        position: 'absolute', inset: '-8%', zIndex: 0,
        transform: isMobile ? 'none' : `translate3d(calc(var(--mouse-x, 0) * -32px), calc(var(--mouse-y, 0) * -32px), 0)`,
        willChange: isMobile ? 'auto' : 'transform',
        pointerEvents: 'none',
        backgroundImage: 'url(/cosmic/stars_cinematic.png)',
        backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity: 0.15,   // increased to make stars more evident
      }} />

      {/* Top crossfade to blend with Hero */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '20vh',
        background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Desktop Earth glow hint */}
      <div aria-hidden className="hidden md:block absolute" style={{
        left: '28vw', top: '55vh', width: '55vw', height: '65vh',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse at center, rgba(30,80,200,0.07) 0%, rgba(10,40,120,0.03) 50%, transparent 75%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/*
        MOBILE LAYOUT (hidden on md+)
      */}
      {isMobile && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* Unified Mobile Layout */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '8vh',
            paddingBottom: '8vh',
            minHeight: '100svh',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6vh' }}>
              <svg width="7" height="7" viewBox="0 0 10 10" fill="none" aria-hidden>
                <rect width="3" height="3" fill="#60A5FA" className="animate-pulse"/>
                <rect y="7" width="3" height="3" fill="#60A5FA"/>
              </svg>
              <span style={{ fontFamily: FONT, fontSize: '0.6rem', letterSpacing: '0.4em', color: 'rgba(96,165,250,0.7)', textTransform: 'uppercase' }}>
                Section // 02
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(96,165,250,0.18)' }} />
            </div>

            {/* Heading */}
            <div style={{ marginBottom: '24px', position: 'relative', paddingLeft: '16px' }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '1px',
                background: 'linear-gradient(to bottom, rgba(96,165,250,0.6), transparent)',
              }}/>
              <ScrambledText style={{
                fontFamily: FONT, fontSize: 'clamp(2.5rem, 12vw, 3.5rem)',
                fontWeight: 700, letterSpacing: '0.05em', lineHeight: 0.95,
                textTransform: 'uppercase', color: 'rgba(230,240,255,0.95)',
                textShadow: '0 0 60px rgba(96,165,250,0.12)', userSelect: 'none',
              }}>About</ScrambledText>
              <ScrambledText style={{
                fontFamily: FONT, fontSize: 'clamp(2.5rem, 12vw, 3.5rem)',
                fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.05,
                textTransform: 'uppercase', color: '#ffffff',
                textShadow: '0 0 40px rgba(96,165,250,0.4), 0 0 90px rgba(96,165,250,0.15)',
                userSelect: 'none',
              }}>Shunya</ScrambledText>
              <div style={{
                marginTop: '14px', height: '1px', width: '65%',
                background: 'linear-gradient(to right, rgba(96,165,250,0.5) 0%, rgba(96,165,250,0.05) 80%, transparent 100%)',
              }}/>
            </div>

            {/* Body text */}
            <ScrambledText
              radius={80}
              duration={2.0}
              speed={0.15}
              scrambleChars=".:"
              style={{
                fontFamily: FONT,
                fontWeight: 300, fontSize: '13px', letterSpacing: '0.06em',
                lineHeight: '2.0', color: 'rgba(220,232,255,0.75)',
                textTransform: 'uppercase', marginBottom: '32px',
              }}
            >
              {BODY_TEXT}
            </ScrambledText>

            {/* HUD metadata */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '20px', height: '1px', background: 'rgba(96,165,250,0.4)' }}/>
              <span style={{ fontFamily: FONT, fontSize: '0.6rem', letterSpacing: '0.35em', color: 'rgba(96,165,250,0.45)', textTransform: 'uppercase' }}>
                GDG NSUT · Est. 2026
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(96,165,250,0.15), transparent)' }}/>
            </div>
          </div>
        </div>
      )}

      {/*
        DESKTOP LAYOUT (hidden on mobile)
      */}
      {!isMobile && (
        <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', alignItems: 'center', width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          {/* Right content column — wider, less aggressive padding */}
          <div
            style={{
              position: 'relative', zIndex: 10,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              width: '62vw', paddingTop: '6vh', paddingBottom: '6vh',
              marginLeft: 'auto'
            }}
            className="pl-[clamp(20px,2.5vw,40px)] pr-[clamp(24px,3.5vw,60px)]"
          >
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <svg width="7" height="7" viewBox="0 0 10 10" fill="none" aria-hidden>
                <rect width="3" height="3" fill="#60A5FA" className="animate-pulse"/>
                <rect y="7" width="3" height="3" fill="#60A5FA"/>
              </svg>
              <span style={{ fontFamily: FONT, fontSize: '0.47rem', letterSpacing: '0.5em', color: 'rgba(96,165,250,0.7)', textTransform: 'uppercase' }}>
                Section // 02
              </span>
              <div style={{ width: '44px', height: '1px', background: 'rgba(96,165,250,0.18)' }} />
            </div>

            {/* Heading */}
            <div style={{ marginBottom: '32px', position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '-20px', top: 0, bottom: 0, width: '1px',
                background: 'linear-gradient(to bottom, rgba(96,165,250,0.6), transparent)',
              }}/>
              <ScrambledText style={{
                fontFamily: FONT, fontSize: 'clamp(3rem, 5.5vw, 5rem)',
                fontWeight: 700, letterSpacing: '0.05em', lineHeight: 0.95,
                textTransform: 'uppercase', color: 'rgba(230,240,255,0.95)',
                textShadow: '0 0 60px rgba(96,165,250,0.12)', userSelect: 'none',
              }}>About</ScrambledText>
              <ScrambledText style={{
                fontFamily: FONT, fontSize: 'clamp(3rem, 5.5vw, 5rem)',
                fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.05,
                textTransform: 'uppercase', color: '#ffffff',
                textShadow: '0 0 40px rgba(96,165,250,0.4), 0 0 90px rgba(96,165,250,0.15)',
                userSelect: 'none',
              }}>Shunya</ScrambledText>
              <div style={{
                marginTop: '16px', height: '1px', width: '80%',
                background: 'linear-gradient(to right, rgba(96,165,250,0.5) 0%, rgba(96,165,250,0.05) 80%, transparent 100%)',
              }}/>
            </div>

            {/* Body text — wider max-width, premium ScrambleText */}
            <ScrambledText
              radius={120}
              duration={2.5}
              speed={0.15}
              scrambleChars=".:"
              style={{ 
                maxWidth: '760px',
                fontFamily: FONT,
                fontWeight: 300,
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                lineHeight: '2.0',
                color: 'rgba(220,232,255,0.80)',
                textTransform: 'uppercase'
              }}
            >
              {BODY_TEXT}
            </ScrambledText>

            {/* Metadata */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
              <div style={{ width: '20px', height: '1px', background: 'rgba(96,165,250,0.4)' }}/>
              <span style={{ fontFamily: FONT, fontSize: '0.42rem', letterSpacing: '0.45em', color: 'rgba(96,165,250,0.4)', textTransform: 'uppercase' }}>
                GDG NSUT · Est. 2026
              </span>
              <div style={{ width: '60px', height: '1px', background: 'linear-gradient(to right, rgba(96,165,250,0.15), transparent)' }}/>
            </div>
          </div>
        </div>
      )}

      {/* Bottom fade */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '12vh',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,3,10,0.95) 100%)',
        zIndex: 3, pointerEvents: 'none',
      }} />
    </section>
  );
}
