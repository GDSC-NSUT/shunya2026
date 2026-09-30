'use client';

import React from 'react';
import { useParallax } from '@/hooks/useParallax';
import Image from 'next/image';
import ScrambledText from '../about/ScrambledText';

interface HeroBackgroundProps {
  hudRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * HeroBackground — Cinematic Layered Depth System.
 *
 * Performance contract:
 * - Stars: two parallax layers, CSS custom props, no CSS animation (parallax IS the motion)
 * - Nebula: ONE CSS animation (drift 30s), NO filter on the animated element
 *   The filter is moved to a static parent so the GPU rasterizes once and reuses the texture.
 * - All layers: will-change:transform only on elements that actually transform
 * - HUD text container: contain:layout paint style per subtree so text paints don't trigger parent recomposite
 */
export default function HeroBackground({ hudRef }: HeroBackgroundProps) {
  useParallax();

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden pointer-events-none"
    >
      <style>{`
        @keyframes nebula-drift {
          0%   { transform: scale(1.08) translate3d(0, 0, 0); }
          50%  { transform: scale(1.13) translate3d(10px, -10px, 0); }
          100% { transform: scale(1.08) translate3d(0, 0, 0); }
        }
        .nebula-drift { animation: nebula-drift 35s ease-in-out infinite; will-change: transform; }

        @keyframes logo-pulse {
          0%, 100% { 
            opacity: 0.88;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.03);
          }
        }
        /* Mobile: fixed large size, no pulse. Desktop: animate pulse */
        .animate-logo-pulse { transform: scale(1.45); opacity: 1; }
        @media (min-width: 1024px) {
          .animate-logo-pulse { animation: logo-pulse 6s ease-in-out infinite; will-change: transform; transform: scale(1); }
        }
      `}</style>

      {/* ── 1. Star field (z-2) — Dual Parallax Layers ── */}
      {/*
        contain:layout paint isolates these large oversized layers from the rest of the paint tree.
        No CSS animations — parallax motion comes purely from JS writing --mouse-x/--mouse-y.
      */}
      <div className="absolute inset-0 z-[2] pointer-events-none" style={{ contain: 'layout paint' }}>
        {/* Layer 1: Deep stars — slow parallax */}
        <div aria-hidden style={{
          position: 'absolute', inset: '-8%',
          transform: `translate3d(calc(var(--mouse-x, 0) * 10px), calc(var(--mouse-y, 0) * 10px), 0)`,
          willChange: 'transform',
          pointerEvents: 'none',
          backgroundImage: 'url(/cosmic/stars_deep.png)',
          backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.18,
        }} />

        {/* Layer 2: Near stars — faster parallax */}
        <div aria-hidden style={{
          position: 'absolute', inset: '-6%',
          transform: `translate3d(calc(var(--mouse-x, 0) * 20px), calc(var(--mouse-y, 0) * 20px), 0)`,
          willChange: 'transform',
          pointerEvents: 'none',
          backgroundImage: 'url(/cosmic/stars_cinematic.png)',
          backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.12,
        }} />
      </div>

      {/* ── 2. Nebula (z-3) ── */}
      {/*
        PERF KEY: The filter (contrast/saturate/brightness) is on the STATIC outer div.
        The GPU rasterizes + filters once and caches the result as a texture.
        Only the inner div animates (nebula-drift), which the GPU can composite cheaply.
        Previously the filter was on an animated element — forcing re-rasterization every frame.
      */}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          transform: `translate3d(calc(var(--mouse-x, 0) * -40px), calc(var(--mouse-y, 0) * -40px), 0)`,
          willChange: 'transform',
          contain: 'layout paint',
        }}
      >
        {/* Static filter wrapper — GPU rasterizes once */}
        <div className="absolute inset-0" style={{ filter: 'contrast(1.4) saturate(1.15) brightness(0.82)', contain: 'strict' }}>
          {/* Only this inner div animates — GPU composites its cached texture */}
          <div className="absolute inset-0 nebula-drift">
            <Image
              src="/cosmic/rich_green_nebula.png"
              alt="Nebula"
              fill
              className="object-cover opacity-70"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      </div>

      {/* ── Bottom-edge nebula fade ── */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 z-[4] pointer-events-none"
        style={{
          height: '35vh',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,5,13,0.7) 60%, #00050d 100%)',
        }}
      />

      {/* ── 4. SHUNYA + Taglines (z-[40]) — fades on scroll ── */}
      {/*
        This layer has the global parallax on it. The 4 text subtrees inside each get
        contain:layout paint style so text paints are isolated from each other and from
        the parent. This prevents a single text repaint from triggering the whole layer.
      */}
      <div
        ref={hudRef}
        className="absolute inset-0 z-[40] pointer-events-none"
        style={{
          transform: `translate3d(calc(var(--mouse-x, 0) * -30px), calc(var(--mouse-y, 0) * -30px), 0)`,
          willChange: 'transform',
        }}
      >
        {/* ──── HUD DATA PANELS (4 Corners) ──── */}

        {/* Top Left */}
        <div className="hidden lg:flex absolute top-[8vh] left-[5vw] flex-col pointer-events-none z-[15]" style={{ contain: 'layout paint style' }}>
          <div className="flex items-center gap-3 mb-3 opacity-70">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="animate-pulse"><rect width="3" height="3" fill="#60A5FA"/><rect y="7" width="3" height="3" fill="#60A5FA"/></svg>
            <span style={{ fontFamily: 'var(--font-corpta), sans-serif' }} className="text-[0.55rem] tracking-[0.4em] text-blue-300 uppercase">Archive // 01</span>
          </div>
          <p className="max-w-[260px] pl-4 border-l border-blue-400/40"
             style={{
               fontFamily: 'var(--font-corpta), sans-serif',
               fontSize: '0.65rem', fontWeight: 600,
               letterSpacing: '0.25em', lineHeight: '1.8',
               color: 'rgba(230,240,255,0.9)', textTransform: 'uppercase',
               textShadow: '0 0 12px rgba(96, 165, 250, 0.4)'
             }}>
            For decades, we built machines to master nature.
          </p>
        </div>

        {/* Top Right */}
        <div className="hidden lg:flex absolute top-[8vh] right-[5vw] flex-col items-end pointer-events-none z-[15]" style={{ contain: 'layout paint style' }}>
          <div className="flex items-center gap-3 mb-3 opacity-70">
            <span style={{ fontFamily: 'var(--font-corpta), sans-serif' }} className="text-[0.55rem] tracking-[0.4em] text-blue-300 uppercase">Query // 99</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="2" fill="#60A5FA"/><circle cx="5" cy="5" r="4.5" stroke="#60A5FA" strokeWidth="1"/></svg>
          </div>
          <p className="max-w-[260px] pr-4 border-r border-blue-400/40 text-right"
             style={{
               fontFamily: 'var(--font-corpta), sans-serif',
               fontSize: '0.65rem', fontWeight: 600,
               letterSpacing: '0.25em', lineHeight: '1.8',
               color: 'rgba(230,240,255,0.9)', textTransform: 'uppercase',
               textShadow: '0 0 12px rgba(96, 165, 250, 0.4)'
             }}>
            Is technology the apex predator?
          </p>
        </div>

        {/* SHUNYA Logo */}
        <div className="absolute w-full left-1/2 -translate-x-1/2 top-[9vh] lg:top-[5vh] z-[20] pointer-events-none flex justify-center">
          {/* Static filter wrapper — GPU composites this once, not per animation frame */}
          <div
            style={{
              filter: 'brightness(0) invert(1) drop-shadow(0 0 22px rgba(120,180,255,0.8)) drop-shadow(0 0 60px rgba(59,130,246,0.45))',
            }}
          >
            <div
              className="relative w-[95vw] lg:w-[80vw] max-w-[1400px] h-[150px] lg:h-[clamp(200px,35vw,550px)] origin-center animate-logo-pulse"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 88%, 0 88%)',
              }}
            >
              <Image
                src="/cosmic/shunya-logo.png"
                alt="SHUNYA"
                fill
                className="object-contain object-center"
                sizes="(max-width: 1024px) 95vw, 80vw"
                priority
              />
            </div>
          </div>
        </div>

        {/* Bottom Left */}
        <div className="hidden lg:flex absolute bottom-[8vh] left-[5vw] flex-col pointer-events-none z-[15]" style={{ contain: 'layout paint style' }}>
          <p className="max-w-[280px] pl-4 border-l border-blue-400/40"
             style={{
               fontFamily: 'var(--font-corpta), sans-serif',
               fontSize: '0.65rem', fontWeight: 600,
               letterSpacing: '0.35em', lineHeight: '2',
               color: 'rgba(230,240,255,0.9)', textTransform: 'uppercase',
               textShadow: '0 0 12px rgba(96, 165, 250, 0.4)'
             }}>
            Logic <br/>
            Life <br/>
            Convergence
          </p>
          <div className="flex items-center gap-3 mt-3 opacity-70">
            <div className="w-10 h-[1px] bg-blue-400/60"></div>
            <span style={{ fontFamily: 'var(--font-corpta), sans-serif' }} className="text-[0.55rem] tracking-[0.4em] text-blue-300 uppercase">Parameters</span>
          </div>
        </div>

        {/* Bottom Right */}
        <div className="hidden lg:flex absolute bottom-[8vh] right-[5vw] flex-col items-end pointer-events-none z-[15]" style={{ contain: 'layout paint style' }}>
          <p className="max-w-[340px] pr-4 border-r border-blue-400/40 text-right"
             style={{
               fontFamily: 'var(--font-corpta), sans-serif',
               fontSize: '0.6rem', fontWeight: 500,
               letterSpacing: '0.2em', lineHeight: '2',
               color: 'rgba(180,210,255,0.85)', textTransform: 'uppercase',
               textShadow: '0 0 12px rgba(96, 165, 250, 0.3)'
             }}>
            Now, at the edge of intelligence, we realize the ultimate technology isn&apos;t silicon—it&apos;s the ecosystem itself. Welcome to the convergence.
          </p>
          <div className="flex items-center gap-3 mt-3 opacity-70">
            <span style={{ fontFamily: 'var(--font-corpta), sans-serif' }} className="text-[0.55rem] tracking-[0.4em] text-blue-300 uppercase">Conclusion</span>
            <div className="w-10 h-[1px] bg-blue-400/60"></div>
          </div>
        </div>

        {/* ──── MOBILE HUD LAYOUT (Asymmetric Art Direction) ──── */}
        <div className="flex lg:hidden absolute top-[32vh] left-[6vw] right-[6vw] flex-col gap-[5vh] z-[15] pointer-events-none" style={{ contain: 'layout paint style' }}>
          
          {/* Mid-Left Panel */}
          <div className="flex flex-col items-start text-left w-full">
            <div className="flex items-center gap-3 mb-3 opacity-90">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="animate-pulse"><rect width="3" height="3" fill="#60A5FA"/><rect y="7" width="3" height="3" fill="#60A5FA"/></svg>
              <ScrambledText style={{ fontFamily: 'var(--font-corpta), sans-serif' }} className="text-[0.55rem] tracking-[0.3em] text-blue-300 uppercase">Archive // 01</ScrambledText>
              <div className="w-12 h-[1px] bg-blue-400/40"></div>
            </div>
            <ScrambledText className="max-w-[280px] pl-4 border-l border-blue-400/30" style={{
                 fontFamily: 'var(--font-corpta), sans-serif',
                 fontSize: '0.8rem', fontWeight: 500,
                 letterSpacing: '0.2em', lineHeight: '1.7',
                 color: 'rgba(230,240,255,0.95)', textTransform: 'uppercase',
                 textShadow: '0 0 10px rgba(96, 165, 250, 0.3)'
               }}>
              For decades, we built machines to master nature.
            </ScrambledText>
          </div>

          {/* Bottom-Right Panel (Next to Earth) */}
          <div className="flex flex-col items-end text-right w-full self-end">
            <div className="flex items-center gap-3 mb-3 opacity-90 justify-end w-full">
              <div className="w-12 h-[1px] bg-blue-400/40"></div>
              <ScrambledText style={{ fontFamily: 'var(--font-corpta), sans-serif' }} className="text-[0.55rem] tracking-[0.3em] text-blue-300 uppercase">Conclusion</ScrambledText>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="animate-pulse"><rect width="3" height="3" fill="#60A5FA"/><rect y="7" width="3" height="3" fill="#60A5FA"/></svg>
            </div>
            <div className="max-w-[280px] pr-4 border-r border-blue-400/30">
              <ScrambledText style={{
                   fontFamily: 'var(--font-corpta), sans-serif',
                   fontSize: '0.7rem', fontWeight: 400,
                   letterSpacing: '0.2em', lineHeight: '1.8',
                   color: 'rgba(180,210,255,0.85)', textTransform: 'uppercase',
                   textShadow: '0 0 12px rgba(96, 165, 250, 0.3)',
                   marginBottom: '1rem'
                 }}>
                Now, we realize the ultimate technology is the ecosystem itself.
              </ScrambledText>
              <ScrambledText style={{
                   fontFamily: 'var(--font-corpta), sans-serif',
                   fontSize: '0.7rem', fontWeight: 600,
                   letterSpacing: '0.2em', lineHeight: '1.8',
                   color: 'rgba(230,240,255,0.95)', textTransform: 'uppercase',
                   textShadow: '0 0 12px rgba(96, 165, 250, 0.3)'
                 }}>
                Welcome to the convergence.
              </ScrambledText>
            </div>
          </div>

        </div>

        {/* Mobile Bottom Status Bar Removed to prevent overlap with Earth */}

      </div>

      {/* ── Vignette (z-11) ── */}
      <div
        className="absolute inset-0 z-[11] pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9), inset 0 0 60px rgba(0,0,0,0.65)',
        }}
      />
    </div>
  );
}
