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
      
      <div className="w-full flex space-x-8 md:space-x-12 overflow-hidden items-center relative z-10">
        <div className="flex animate-marquee space-x-12 md:space-x-16 items-center whitespace-nowrap">
          {MARQUEE_ITEMS.map((sponsor, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 md:gap-4"
            >
              <span className="text-white/20 text-[10px] md:text-sm tracking-widest">{`0${(idx % SPONSORS.length) + 1}`}</span>
              <span className="text-3xl md:text-5xl font-normal text-white/50 tracking-widest uppercase">
                {sponsor}
              </span>
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
