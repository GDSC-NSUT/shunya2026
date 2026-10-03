import React from 'react';
import Image from 'next/image';

const PAST_SPONSORS = [
  { id: "01", src: "/assets/sponsors/past/unstop.png", alt: "Unstop" },
  { id: "02", src: "/assets/sponsors/past/chic_avenue.png", alt: "Chic Avenue" },
  { id: "03", src: "/assets/sponsors/past/launched_global.png", alt: "Launched Global" }
];

// Quadruple the array for seamless scrolling tape
const MARQUEE_ITEMS = [...PAST_SPONSORS, ...PAST_SPONSORS, ...PAST_SPONSORS, ...PAST_SPONSORS];

export default function SponsorsSection() {
  return (
    <section className="relative w-full bg-black py-16 md:py-24">
      {/* ── PAST SPONSORS ── */}
      <div className="flex flex-col items-center w-full mb-12 relative z-30">
        <h1 
          className="text-4xl sm:text-5xl md:text-[5rem] font-normal leading-none -tracking-[0.02em] uppercase text-white whitespace-nowrap"
          style={{ fontFamily: 'var(--font-corpta), sans-serif' }}
        >
          Past Sponsors
        </h1>
      </div>

      <div 
        className="relative w-full py-8 md:py-16 overflow-hidden border-y border-white/5"
        style={{ fontFamily: 'var(--font-corpta), sans-serif' }}
      >
        {/* Subtle background glow without expensive CSS blur */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(30,58,138,0.1) 0%, transparent 70%)'
          }} 
        />
        
        {/* Edge fade masks for a seamless, premium scroll */}
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'linear-gradient(to right, #000000 0%, #000000 2%, transparent 15%, transparent 85%, #000000 98%, #000000 100%)' }} />
        
        <div className="w-full flex space-x-8 md:space-x-16 overflow-hidden items-center relative z-10">
          <div className="flex animate-marquee space-x-12 md:space-x-24 items-center whitespace-nowrap">
            {MARQUEE_ITEMS.map((sponsor, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-6 md:gap-10 group cursor-default"
              >
                <div className="flex flex-col items-end justify-center">
                  <span className="text-blue-400/80 text-sm md:text-lg font-mono tracking-widest">
                    {sponsor.id}
                  </span>
                </div>
                
                <div className="relative h-20 md:h-28 w-40 md:w-64 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                  <img 
                    src={sponsor.src} 
                    alt={sponsor.alt} 
                    className="max-h-full max-w-full rounded-xl object-contain"
                  />
                </div>
                
                <div className="h-10 md:h-16 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent ml-2 md:ml-8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CURRENT SPONSORS ── */}
      <div className="flex flex-col items-center w-full mt-24 mb-12 relative z-30">
        <h1 
          className="text-4xl sm:text-5xl md:text-[5rem] font-normal leading-none -tracking-[0.02em] uppercase text-white whitespace-nowrap"
          style={{ fontFamily: 'var(--font-corpta), sans-serif' }}
        >
          Sponsoring Now
        </h1>
      </div>

      <div className="w-full flex justify-center items-center min-h-[200px] px-6 relative z-10">
        <div className="w-full max-w-2xl border border-white/10 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center bg-white/[0.02] backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 group">
          <img 
            src="/assets/sponsors/current/oppo.png" 
            alt="Oppo" 
            className="h-24 md:h-36 rounded-xl object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(34,197,94,0.1)] group-hover:drop-shadow-[0_0_25px_rgba(34,197,94,0.3)]" 
          />
          <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <span className="text-white/30 text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase">Powered By</span>
          </div>
        </div>
      </div>
    </section>
  );
}
