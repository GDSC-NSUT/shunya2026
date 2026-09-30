'use client';

import React from 'react';

/**
 * HeroBorder — Lightweight static SVG architectural frame.
 * Uses viewBox coordinates so all geometry is crisp and responsive at any resolution.
 * pointer-events: none everywhere.
 */
export default function HeroBorder() {
  // viewBox: 1000 × 560 (≈ 16:9 landscape ratio for desktop)
  // All coordinates are in this internal unit space — browser scales the SVG to fill the viewport.
  const W = 1000;
  const H = 560;
  const C = 22;  // chamfer length in viewbox units
  const M = 12;  // inset from edge

  const col = 'rgba(210, 225, 240, 0.45)';
  const colDim = 'rgba(210, 225, 240, 0.22)';
  const colAccent = 'rgba(230, 240, 255, 0.7)';

  return (
    <>
      <div className="hidden lg:block absolute inset-0 z-[50] pointer-events-none select-none">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${W} ${H}`}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* ──── Main chamfered frame ──── */}
          <path
            d={`
              M ${M + C},${M}
              L ${W - M - C},${M}
              L ${W - M},${M + C}
              L ${W - M},${H - M - C}
              L ${W - M - C},${H - M}
              L ${M + C},${H - M}
              L ${M},${H - M - C}
              L ${M},${M + C}
              Z
            `}
            fill="none"
            stroke={col}
            strokeWidth="0.8"
          />

          {/* ──── Top edge: subtle center glow band ──── */}
          <line
            x1={W * 0.28} y1={M}
            x2={W * 0.72} y2={M}
            stroke="rgba(200, 225, 255, 0.55)"
            strokeWidth="1.2"
          />

          {/* ──── Bottom edge: subtle center glow band ──── */}
          <line
            x1={W * 0.38} y1={H - M}
            x2={W * 0.62} y2={H - M}
            stroke="rgba(200, 225, 255, 0.35)"
            strokeWidth="0.8"
          />

          {/* ──── Corner engineering marks ──── */}
          <line x1={M - 5}  y1={M + C + 8} x2={M + 8}   y2={M + C + 8} stroke={colDim} strokeWidth="0.7" />
          <line x1={M + C + 8} y1={M - 5}  x2={M + C + 8} y2={M + 8}   stroke={colDim} strokeWidth="0.7" />
          <line x1={W - M + 5} y1={M + C + 8} x2={W - M - 8}   y2={M + C + 8} stroke={colDim} strokeWidth="0.7" />
          <line x1={W - M - C - 8} y1={M - 5}  x2={W - M - C - 8} y2={M + 8}   stroke={colDim} strokeWidth="0.7" />
          <line x1={M - 5}  y1={H - M - C - 8} x2={M + 8}   y2={H - M - C - 8} stroke={colDim} strokeWidth="0.7" />
          <line x1={M + C + 8} y1={H - M + 5}  x2={M + C + 8} y2={H - M - 8}   stroke={colDim} strokeWidth="0.7" />
          <line x1={W - M + 5} y1={H - M - C - 8} x2={W - M - 8}   y2={H - M - C - 8} stroke={colDim} strokeWidth="0.7" />
          <line x1={W - M - C - 8} y1={H - M + 5}  x2={W - M - C - 8} y2={H - M - 8}   stroke={colDim} strokeWidth="0.7" />

          {/* ──── Architectural interruptions — top bar ──── */}
          <line x1={W * 0.15} y1={M} x2={W * 0.15} y2={M + 10} stroke={colAccent} strokeWidth="1.2" />
          <line x1={W * 0.85} y1={M} x2={W * 0.85} y2={M + 10} stroke={colAccent} strokeWidth="1.2" />

          {/* ──── Mid-side accents ──── */}
          <line x1={M} y1={H * 0.5 - 8} x2={M} y2={H * 0.5 + 8} stroke={colAccent} strokeWidth="1.4" />
          <line x1={W - M} y1={H * 0.5 - 8} x2={W - M} y2={H * 0.5 + 8} stroke={colAccent} strokeWidth="1.4" />
        </svg>
      </div>

      {/* ──── Mobile Optimized Clean Border ──── */}
      <div className="block lg:hidden absolute inset-0 z-[50] pointer-events-none select-none p-4">
        <div className="w-full h-full border-[1px] border-blue-200/30 rounded-2xl relative shadow-[inset_0_0_20px_rgba(96,165,250,0.1)]">
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-blue-300/50 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-blue-300/40" />
        </div>
      </div>
    </>
  );
}
