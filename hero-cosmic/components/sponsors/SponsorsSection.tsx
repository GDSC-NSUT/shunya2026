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
                  <span className="text-blue-400/80 text-xs md:text-sm font-mono tracking-widest">
                    {sponsor.id}
                  </span>
                </div>
                
                <div className="relative h-14 md:h-20 w-32 md:w-48 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-all duration-500 filter grayscale hover:grayscale-0">
                  <img 
                    src={sponsor.src} 
                    alt={sponsor.alt} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                
                <div className="h-10 md:h-16 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent ml-2 md:ml-8" />
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── CURRENT SPONSORS ── */}
      <div className="flex flex-col items-center w-full mt-24 mb-12 relative z-30">
        <h1 
          className="text-4xl sm:text-5xl md:text-[5rem] font-normal leading-none -tracking-[0.02em] uppercase text-white whitespace-nowrap"
          style={{ fontFamily: 'var(--font-corpta), sans-serif' }}
        >
          Current Sponsors
        </h1>
      </div>

      <div className="w-full flex justify-center items-center min-h-[200px] px-6 relative z-10">
        <div className="flex flex-col items-center justify-center">
          <img 
            src="/assets/sponsors/current/oppo.png" 
            alt="Oppo" 
            className="h-24 md:h-36 object-contain transition-transform duration-500 hover:scale-105" 
          />
        </div>
      </div>
    </section>
  );
}
