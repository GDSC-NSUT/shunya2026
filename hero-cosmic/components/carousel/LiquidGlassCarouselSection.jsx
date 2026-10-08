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

import React, { useEffect, useState } from "react";

// Framer stubs are injected via next.config webpack alias:
// 'framer' → '@/lib/framer-stubs'
// This allows the original source to run cleanly outside Framer canvas.
import LiquidGlass from "./liquid_glass_carousel_source";
import SwiperCarousel from "./SwiperCarousel";

const SHUNYA_PROJECTS = [
  {
    brand: "KEYNOTES",
    description: "Visionary talks and tech leadership",
    image: { src: "/assets/carousel/shunya_01.webp" },
  },
  {
    brand: "HACKATHONS",
    description: "Intense 24-hour building sprints",
    image: { src: "/assets/carousel/shunya_02.webp" },
  },
  {
    brand: "PITCHING",
    description: "Showcasing student-built innovations",
    image: { src: "/assets/carousel/shunya_03.webp" },
  },
  {
    brand: "CONVERGENCE",
    description: "Over 1,000+ passionate creators united",
    image: { src: "/assets/carousel/shunya_04.webp" },
  },
  {
    brand: "COLLABORATION",
    description: "Developing cross-disciplinary tech solutions",
    image: { src: "/assets/carousel/shunya_05.webp" },
  },
  {
    brand: "WORKSHOPS",
    description: "Hands-on deep dives and masterclasses",
    image: { src: "/assets/carousel/shunya_06.webp" },
  },
  {
    brand: "COMMUNITY",
    description: "The vibrant heartbeat of GDG NSUT",
    image: { src: "/assets/carousel/shunya_07.webp" },
  },
];

export default function LiquidGlassCarouselSection() {
  const [isMobile, setIsMobile] = useState(false);
  const [pixelRatio, setPixelRatio] = useState(2);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMobile(mq.matches);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPixelRatio(mq.matches ? 1 : Math.min(window.devicePixelRatio || 2, 2));
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      id="past-shunya"
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
          autoScrollSpeed={-8.0}
          snapDistance={60}
          dispersion={0}
          zoom={0}
          blur={0}
          glow={1.0}
          blueRing={1.5}
          blueColor="#ffffff"
          shimmer={false}
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
