import React from 'react';

const SPONSORS = [
  "GOOGLE CLOUD",
  "NVIDIA",
  "VERCEL",
  "SUPABASE",
  "DEEPSEEK",
  "ANTHROPIC",
  "OPENAI",
  "GITHUB",
  "META",
  "LENOVO"
];

// Double the array for seamless scrolling
const MARQUEE_ITEMS = [...SPONSORS, ...SPONSORS];

export default function SponsorsMarquee() {
  return (
    <section 
      className="relative w-full py-8 md:py-16 overflow-hidden bg-black border-y border-white/5"
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
      <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'linear-gradient(to right, #000000 0%, transparent 15%, transparent 85%, #000000 100%)' }} />
      
      <div className="w-full flex space-x-8 md:space-x-12 overflow-hidden items-center relative z-10">
        <div className="flex animate-marquee space-x-12 md:space-x-24 items-center whitespace-nowrap">
          {MARQUEE_ITEMS.map((sponsor, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 md:gap-8 group cursor-default"
            >
              <div className="flex flex-col items-end">
                <span className="text-white/30 text-[9px] md:text-xs font-mono tracking-[0.2em]">{`SYS.SPONSOR`}</span>
                <span className="text-blue-400/80 text-[10px] md:text-sm font-mono tracking-widest">{`0${(idx % SPONSORS.length) + 1}`}</span>
              </div>
              <span className="text-4xl md:text-6xl font-normal text-transparent tracking-widest uppercase transition-all duration-500 group-hover:text-white"
                    style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.4)', textShadow: '0 0 0 rgba(255,255,255,0)' }}>
                {sponsor}
              </span>
              <div className="h-8 md:h-12 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent ml-4 md:ml-8" />
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
    </section>
  );
}
