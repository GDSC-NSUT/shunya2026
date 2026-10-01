'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ScrambledText from '../about/ScrambledText';

export default function CreativeFooter() {
  const containerRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A subtle radar sweep / pulse effect for the glow
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0.8,
        scale: 1.1,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }

        // Parallax effect on the huge background text (desktop only for performance)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    const handleScroll = () => {
      if (!containerRef.current || isMobile) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = 1 - rect.top / window.innerHeight;
        gsap.to('.footer-bg-text', {
          y: progress * -100,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer
      ref={containerRef}
      className="relative w-full bg-black text-white overflow-hidden"
      style={{ minHeight: '80vh', fontFamily: 'var(--font-corpta), sans-serif' }}
    >
      {/* ── Background Grid & Depth ── */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20 md:opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '4rem 4rem',
            transform: 'perspective(1200px) rotateX(65deg) scale(3) translateY(-10%)',
            transformOrigin: 'top center',
          }}
        />
        {/* Fading gradient for the grid */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* ── Giant Parallax Background Text ── */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <h1
          className="footer-bg-text text-[50vw] md:text-[30vw] text-transparent leading-none opacity-10"
          style={{
            fontFamily: 'var(--font-corpta), sans-serif',
            WebkitTextStroke: '2px rgba(255, 255, 255, 0.3)',
            transform: 'translateY(50px)',
          }}
        >
          00
        </h1>
      </div>

      {/* ── Content Container ── */}
      <div className="relative z-10 w-full h-full min-h-[80vh] flex flex-col justify-between px-6 py-12 md:px-16 lg:px-24">
        
        {/* Top Info Bar */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start gap-12 border-t border-white/20 pt-8 relative">
          <div className="absolute top-0 left-0 w-8 h-[2px] bg-blue-500" />
          
          <div className="max-w-md">
            <h2
              className="text-3xl md:text-5xl uppercase text-white tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-corpta), sans-serif' }}
            >
              End of Line
            </h2>
            <ScrambledText className="text-xs md:text-sm text-blue-200/60 leading-relaxed tracking-wider">
              You have reached the deepest layer of the Shunya architecture. 
              The system is currently stable. Awaiting further input coordinates.
            </ScrambledText>
          </div>

          <div className="flex gap-8 md:gap-12 text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/50 w-full md:w-auto justify-between md:justify-end">
            <ul className="flex flex-col gap-4">
              <li className="text-white mb-2 font-bold tracking-widest">Socials</li>
              {['Instagram', 'LinkedIn'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-blue-400 hover:text-white transition-colors duration-300 relative group flex items-center gap-2">
                    <span className="w-2 h-[1px] bg-blue-500/50 group-hover:bg-blue-400 group-hover:w-4 transition-all" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-4">
              <li className="text-white mb-2 font-bold tracking-widest">GDSC</li>
              {['Website', 'Discord'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-blue-400 hover:text-white transition-colors duration-300 relative group flex items-center gap-2">
                    <span className="w-2 h-[1px] bg-blue-500/50 group-hover:bg-blue-400 group-hover:w-4 transition-all" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Giant Branding & Glowing Core */}
        <div className="w-full mt-24 relative flex flex-col items-center justify-center">
          
          {/* Glowing Core - pure CSS gradient, NO CSS blur (Massive Perf Boost) */}
          <div 
            ref={glowRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] pointer-events-none mix-blend-screen"
            style={{
              background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(59,130,246,0.1) 40%, rgba(0,0,0,0) 70%)'
            }}
          />

          <h2
            className="text-[22vw] md:text-[14vw] font-normal leading-none text-transparent text-center uppercase tracking-tighter"
            style={{ 
              WebkitTextStroke: '2px rgba(255,255,255,0.8)',
              textShadow: '0 0 40px rgba(59,130,246,0.5)',
              fontFamily: 'var(--font-corpta), sans-serif'
            }}
          >
            SHUNYA
          </h2>
        </div>

      </div>
    </footer>
  );
}
