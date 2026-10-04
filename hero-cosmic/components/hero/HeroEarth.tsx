'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * EarthSphere — mobile-first performance.
 *
 * Mobile: 16x16 sphere (256 tris), DPR capped at 1, depth+stencil off.
 * Desktop: 32x32 sphere (1024 tris), DPR up to 1.5.
 *
 * The single biggest GPU saving on mobile is DPR=1.
 * At DPR=3 (iPhone Pro), the GPU renders 9× more pixels for the same visual.
 */
function EarthSphere({ isMobile }: { isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, '/cosmic/detailed-earth-map.webp');

  const cloudyTexture = React.useMemo(() => {
    const tex = texture.clone();
    tex.repeat.set(1, 0.5);
    tex.offset.set(0, 0.5);
    tex.needsUpdate = true;
    return tex;
  }, [texture]);

  // Mobile: 16x16 (256 tris). Desktop: 32x32 (1024 tris).
  const segments = isMobile ? 16 : 32;
  const geometry = React.useMemo(
    () => new THREE.SphereGeometry(1, segments, segments),
    [segments]
  );

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      {/* Switch from Standard (PBR) to Phong: looks nearly identical here but costs 5x less GPU time */}
      <meshPhongMaterial map={cloudyTexture} shininess={5} specular={new THREE.Color(0x111111)} />
    </mesh>
  );
}

export default function HeroEarth({ scene = 'hero' }: { scene?: 'hero' | 'about' }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  // Use ref-based frameloop control to avoid React re-render (which forces R3F canvas reconcile)
  const [frameloop, setFrameloop] = React.useState<'always' | 'demand'>('always');
  const frameloopRef = React.useRef<'always' | 'demand'>('always');

  React.useEffect(() => {
    const update = (scrollY: number) => {
      const about = document.getElementById('about');
      const aboutTop = about
        ? about.getBoundingClientRect().top + window.scrollY
        : window.innerHeight * 1.5;
      const aboutBottom = aboutTop + (about?.offsetHeight ?? window.innerHeight);
      const isMobileViewport = window.innerWidth < 1024;
      const earthSize = isMobileViewport
        ? window.innerWidth * 0.82
        : Math.max(280, Math.min(window.innerWidth * 0.36, 650));
      const earthTop = isMobileViewport
        ? aboutTop + window.innerHeight * 0.25 - earthSize / 2
        : aboutTop + ((about?.offsetHeight ?? window.innerHeight) - earthSize) / 2;
      const handoffStart = earthTop - window.innerHeight;
      const shouldRun = scene === 'hero'
        ? (isMobileViewport ? scrollY < window.innerHeight * 2 : scrollY < handoffStart)
        : (!isMobileViewport && scrollY >= handoffStart && scrollY < aboutBottom);
      const next: 'always' | 'demand' = shouldRun ? 'always' : 'demand';
      // Only setState if changed — prevents redundant re-renders
      if (frameloopRef.current !== next) {
        frameloopRef.current = next;
        setFrameloop(next);
      }
    };

    const handleNativeScroll = () => update(window.scrollY);
    const handleLenisScroll = (event: { scroll: number }) => update(event.scroll);
    let subscribedLenis: typeof window.__lenis;
    let lenisCheck: ReturnType<typeof setInterval> | undefined;

    window.addEventListener('scroll', handleNativeScroll, { passive: true });
    update(window.__lenis?.scroll ?? window.scrollY);

    const connectLenis = () => {
      const lenis = window.__lenis;
      if (!lenis || subscribedLenis) return;
      subscribedLenis = lenis;
      window.removeEventListener('scroll', handleNativeScroll);
      lenis.on('scroll', handleLenisScroll);
      update(lenis.scroll);
      if (lenisCheck) clearInterval(lenisCheck);
    };

    connectLenis();
    if (!subscribedLenis) lenisCheck = setInterval(connectLenis, 100);

    return () => {
      if (lenisCheck) clearInterval(lenisCheck);
      if (subscribedLenis) subscribedLenis.off('scroll', handleLenisScroll);
      window.removeEventListener('scroll', handleNativeScroll);
    };
  }, [scene]);

  return (
    <Canvas
      // Completely pause WebGL loop when scrolled out of view to save battery/CPU
      frameloop={frameloop}
      // Mobile: force DPR=1 — at DPR=3 the GPU renders 9x more pixels for zero visible gain at hero scale
      dpr={isMobile ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)}
      camera={{ position: [0, 0, 3.2], fov: 38.5, near: 0.1, far: 100 }}
      gl={{
        alpha: true,
        antialias: false,        // Already off — keep
        powerPreference: isMobile ? 'low-power' : 'high-performance',
        depth: false,            // No depth needed for a single sphere with no overlap
        stencil: false,
      }}
      style={{ background: 'transparent', width: '100%', height: '100%', display: 'block' }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(0x000000), 0);
      }}
    >
      {/* Deep space ambient */}
      <ambientLight intensity={0.02} />
      {/* Primary Key Light (The Sun) */}
      <directionalLight position={[8, 4, 3]} intensity={3.5} color="#fffcf2" />
      {/* Atmospheric Rim Light */}
      <directionalLight position={[-6, 1, -5]} intensity={2.8} color="#60a5fa" />
      {/* Starlight Fill */}
      {!isMobile && <directionalLight position={[-5, 0, 4]} intensity={0.8} color="#3b82f6" />}

      <React.Suspense fallback={null}>
        <EarthSphere isMobile={isMobile} />
      </React.Suspense>
    </Canvas>
  );
}
