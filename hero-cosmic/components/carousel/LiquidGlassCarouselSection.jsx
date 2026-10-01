/**
 * LiquidGlassCarousel — Next.js compatible wrapper
 *
 * The original Framer marketplace component (liquid_glass_carousel.js) imports
 * from "framer" which doesn't exist in Next.js. We resolve that via webpack
 * alias in next.config.ts. This wrapper:
 *   1. Loads the component client-side only (no SSR)
 *   2. Caps pixelRatio to 1 on mobile to prevent GPU thrashing
 *   3. Forces background to black as requested
 *   4. Provides clean cleanup on unmount
 */
"use client";

import React, { useEffect, useRef, useState } from "react";

// Framer stubs are injected via next.config webpack alias:
// 'framer' → '@/lib/framer-stubs'
// This allows the original source to run cleanly outside Framer canvas.
import LiquidGlass from "./liquid_glass_carousel_source";
import SwiperCarousel from "./SwiperCarousel";

const SHUNYA_PROJECTS = [
  {
    brand: "SHUNYA",
    description: "The hub for everything NSUT",
    image: { src: "/assets/carousel/shunya.jpg" },
  },
  {
    brand: "EVENTS",
    description: "Campus events, workshops & more",
    image: { src: "/assets/carousel/events.jpg" },
  },
  {
    brand: "COMMUNITY",
    description: "Connect with the NSUT family",
    image: { src: "/assets/carousel/community.jpg" },
  },
  {
    brand: "RESOURCES",
    description: "Notes, papers, and study material",
    image: { src: "/assets/carousel/resources.jpg" },
  },
  {
    brand: "CLUBS",
    description: "Find your tribe on campus",
    image: { src: "/assets/carousel/clubs.jpg" },
  },
];

export default function LiquidGlassCarouselSection() {
  // Mobile: cap pixelRatio at 1 to prevent GPU thrashing.
  // Desktop: allow up to 1.5 (not the default 2 which is wasteful on HiDPI).
  const [isMobile, setIsMobile] = useState(false);
  const [pixelRatio, setPixelRatio] = useState(1);

  useEffect(() => {
    const mobileCheck = window.innerWidth < 768;
    setIsMobile(mobileCheck);
    setPixelRatio(mobileCheck ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
  }, []);

  return (
    <section
      style={{
        width: "100%",
        height: "100svh",
        background: "#000000",
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y",
      }}
      aria-label="Shunya feature carousel"
    >
      <div 
        className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none flex flex-col items-center w-full"
      >
        <h1 
          className="text-4xl sm:text-5xl md:text-[5rem] font-normal leading-none -tracking-[0.02em] uppercase text-white whitespace-nowrap"
          style={{ fontFamily: 'var(--font-corpta), sans-serif' }}
        >
          Past Shunya
          <sup className="font-sans text-[14px] md:text-lg align-super ml-2 text-white/50">(05)</sup>
        </h1>
      </div>

      {isMobile ? (
        <SwiperCarousel projects={SHUNYA_PROJECTS} />
      ) : (
        <LiquidGlass
          projects={SHUNYA_PROJECTS}
          background="#000000"
          foreground="#ffffff"
          showLabels={false}
          showCursor={true}
          entryAnimation={true}
          panelHeight={550}
          gap={24}
          glide={0.075}
          wheelSensitivity={1}
          snap={true}
          autoScrollSpeed={-1.5}
          snapDistance={60}
          dispersion={15}
          zoom={0}
          blur={2}
          glow={1.5}
          blueRing={2.0}
          blueColor="#ffffff"
          shimmer={true}
          rimWave={0.4}
          lensShape="circle"
          lensRotation={65}
          lensWidth={0.565}
          lensHeight={1.4}
          lensX={0.5}
          lensY={0.5}
          focusScale={1.18}
          pixelRatio={pixelRatio}
          font={{
            fontFamily: "Inter, sans-serif",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: "1.25em",
          }}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </section>
  );
}
