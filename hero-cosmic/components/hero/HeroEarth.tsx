'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * EarthSphere — performance tuned.
 *
 * Segment count reduced: 48x48 (2304 tris) → 32x32 (1024 tris).
 * Visually identical at hero scale; saves ~55% GPU vertex work.
 *
 * Rotation delta * 0.08 (was 0.5) for a more majestic, slower spin.
 * Slower rotation means fewer visible pixels change per frame → lower fill rate.
 */
function EarthSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, '/cosmic/detailed-earth-map.png');

  const cloudyTexture = React.useMemo(() => {
    const tex = texture.clone();
    tex.repeat.set(1, 0.5);
    tex.offset.set(0, 0.5);
    tex.needsUpdate = true;
    return tex;
  }, [texture]);

  // Adaptive geometry: 24x24 on mobile (576 tris), 32x32 on desktop (1024 tris)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const segments = isMobile ? 24 : 32;
  const geometry = React.useMemo(() => new THREE.SphereGeometry(1, segments, segments), [segments]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Significantly increased rotation speed for a highly dynamic spin
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial map={cloudyTexture} roughness={0.65} metalness={0.05} />
    </mesh>
  );
}

export default function HeroEarth() {
  return (
    <Canvas
      dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)}
      camera={{ position: [0, 0, 3.2], fov: 38.5, near: 0.1, far: 100 }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        // Avoid allocating depth buffer bits we don't use
        depth: true,
        stencil: false,
      }}
      style={{ background: 'transparent', width: '100%', height: '100%', display: 'block' }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(0x000000), 0);
      }}
    >
      {/* Deep space ambient — near-zero for dramatic dark side */}
      <ambientLight intensity={0.02} />

      {/* Primary Key Light (The Sun) */}
      <directionalLight position={[8, 4, 3]} intensity={3.5} color="#fffcf2" />

      {/* Atmospheric Rim Light */}
      <directionalLight position={[-6, 1, -5]} intensity={2.8} color="#60a5fa" />

      {/* Starlight Fill - Boosted to visually balance the left side */}
      <directionalLight position={[-5, 0, 4]} intensity={0.8} color="#3b82f6" />

      <React.Suspense fallback={null}>
        <EarthSphere />
      </React.Suspense>
    </Canvas>
  );
}
