"use client";
import { useEffect, useState } from "react";

export default function HudFrame() {
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const handleResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    handleResize(); // Initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (dims.w === 0) return null;

  // Responsive inset
  const isMobile = dims.w < 1024;
  const inset = isMobile ? 12 : 24;
  
  const cw = isMobile ? 12 : 24; // chamfer width
  const w = dims.w - inset * 2;
  const h = dims.h - inset * 2;
  
  const midX = w / 2;
  const midY = h / 2;
  const tickGap = isMobile ? 20 : 40;

  const color = "rgba(255, 255, 255, 0.25)";
  const strokeW = 1;

  return (
    <div style={{ 
      position: "fixed", 
      top: inset, 
      left: inset, 
      width: w, 
      height: h, 
      pointerEvents: "none", 
      zIndex: 100 
    }}>
      <svg width={w} height={h} xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        
        {/* Top-Left to Top-Mid */}
        <path d={`M 0 ${cw} L ${cw} 0 L ${midX - tickGap/2} 0`} fill="none" stroke={color} strokeWidth={strokeW} />
        {/* Top-Mid to Top-Right */}
        <path d={`M ${midX + tickGap/2} 0 L ${w - cw} 0 L ${w} ${cw}`} fill="none" stroke={color} strokeWidth={strokeW} />
        
        {/* Right-Top to Right-Mid */}
        <path d={`M ${w} ${cw} L ${w} ${midY - tickGap/2}`} fill="none" stroke={color} strokeWidth={strokeW} />
        {/* Right-Mid to Right-Bottom */}
        <path d={`M ${w} ${midY + tickGap/2} L ${w} ${h - cw} L ${w - cw} ${h}`} fill="none" stroke={color} strokeWidth={strokeW} />
        
        {/* Bottom-Right to Bottom-Mid */}
        <path d={`M ${w - cw} ${h} L ${midX + tickGap/2} ${h}`} fill="none" stroke={color} strokeWidth={strokeW} />
        {/* Bottom-Mid to Bottom-Left */}
        <path d={`M ${midX - tickGap/2} ${h} L ${cw} ${h} L 0 ${h - cw}`} fill="none" stroke={color} strokeWidth={strokeW} />
        
        {/* Left-Bottom to Left-Mid */}
        <path d={`M 0 ${h - cw} L 0 ${midY + tickGap/2}`} fill="none" stroke={color} strokeWidth={strokeW} />
        {/* Left-Mid to Left-Top */}
        <path d={`M 0 ${midY - tickGap/2} L 0 ${cw}`} fill="none" stroke={color} strokeWidth={strokeW} />

        {/* Top Tick */}
        <line x1={midX} y1={-6} x2={midX} y2={6} stroke={color} strokeWidth={strokeW} />
        {/* Bottom Tick */}
        <line x1={midX} y1={h - 6} x2={midX} y2={h + 6} stroke={color} strokeWidth={strokeW} />
        {/* Left Tick */}
        <line x1={-6} y1={midY} x2={6} y2={midY} stroke={color} strokeWidth={strokeW} />
        {/* Right Tick */}
        <line x1={w - 6} y1={midY} x2={w + 6} y2={midY} stroke={color} strokeWidth={strokeW} />
      </svg>
    </div>
  );
}
