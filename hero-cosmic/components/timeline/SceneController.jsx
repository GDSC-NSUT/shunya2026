"use client";

/**
 * SceneController — Kinetic Amplitude Envelope Renderer
 *
 * Physics architecture:
 *   1. Scroll input → velocity (clamped, high friction → stops fast)
 *   2. |velocity| * scalar → target amplitude (low spring → wave settles slowly)
 *   3. amplitude * sin(Δ·ω + phase) → per-card Y wave offset
 *
 * All physics run inside a GSAP ticker callback — zero React state, zero GC pressure.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Flip } from "gsap/Flip";

import GlassCard from "@/components/timeline/GlassCard";
import EventTimeline from "@/components/timeline/EventTimeline";
import ScrollHint from "@/components/timeline/ScrollHint";
import StaticFallback from "@/components/timeline/StaticFallback";

import { EVENTS } from "@/lib/events";
import {
  TOTAL_NODES,
  DATA_SIZE,
  V_FRICTION,
  V_MAX,
  V_REST,
  INPUT_SCALE,
  AMP_X,
  AMP_Y,
  CARD_ROTATE_Y_DEG,
  WAVE_AMP_SCALAR,
  WAVE_AMP_MAX,
  WAVE_AMP_SPRING,
  SNAP_THRESHOLD,
  SNAP_STRENGTH,
  getDelta,
  getSpatialState,
  isFocal as isFocalCheck,
} from "@/lib/engine";


// Pre-computed friction constant — avoids Math.pow in the hot loop
// For dt≈1 (60fps), this is just V_FRICTION. For variable dt, we approximate
// with a single multiply since V_FRICTION^dt ≈ V_FRICTION for dt near 1.
const FRICTION_60 = V_FRICTION; // 0.91 at 60fps

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer, Flip);
}

const TRIPLED_EVENTS = Array.from({ length: TOTAL_NODES }, (_, i) => ({
  ...EVENTS[i % DATA_SIZE],
  nodeIndex: i,
}));

export default function SceneController() {
  const [isLoading, setIsLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);
  const [isExpanding, setIsExpanding] = useState(false);

  const containerRef = useRef(null);
  const parallaxLayerRef = useRef(null);
  const cardsRef = useRef([]);
  const blurOverlayRef = useRef(null);
  const starBgRef = useRef(null);
  const starMidRef = useRef(null);
  const starFrontRef = useRef(null);
  const starBgMouseRef = useRef(null);
  const starMidMouseRef = useRef(null);
  const starFrontMouseRef = useRef(null);

  // ─── Refs for cached sub-element lookups ───────────────────────────────
  const overlaysRef = useRef([]);   // .shading-overlay per card
  const edgeLightsRef = useRef([]); // .edge-lighting per card

  const engineRef = useRef({
    // Velocity physics
    velocity: 0,
    progress: 0,

    // Kinetic Amplitude Envelope
    amplitude: 0,

    // Interaction state
    isFrozen: false,
    isInputActive: false,
    activeCardIndex: -1,
    flipState: null,

    // Viewport cache
    W: 0,
    H: 0,
    xOrigin: 0,
    yOrigin: 0,

    // Mouse (for parallax + magnetic pull)
    mouseX: 0,
    mouseY: 0,
  });

  const setCardRef = useCallback((el, index) => {
    if (el) {
      cardsRef.current[index] = el;
      if (!el._hoverState) {
        el._hoverState = { zOffset: 0, scaleOffset: 0, rotateX: 0, rotateY: 0, yOffset: 0, xOffset: 0 };
      }
    }
  }, []);

  const handleMouseEnter = useCallback((index) => {
    const cardEl = cardsRef.current[index];
    if (!cardEl || activeDetail) return;
    
    gsap.to(cardEl._hoverState, {
      zOffset: 180,       // Stronger pop out towards the camera
      yOffset: 0,         // Keep centered
      xOffset: 0,         // Keep centered
      scaleOffset: 0.18,  // Enlarge slightly more
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.4)", // Restore the premium bouncy pop
      overwrite: "auto"
    });
  }, [activeDetail]);

  const handleMouseLeave = useCallback((index) => {
    const cardEl = cardsRef.current[index];
    if (!cardEl || activeDetail) return;
    gsap.to(cardEl._hoverState, {
      zOffset: 0,
      yOffset: 0,
      xOffset: 0,
      scaleOffset: 0,
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)", // Restore the snappy bouncy recoil
      overwrite: "auto"
    });
  }, [activeDetail]);

  const handleMouseMove = useCallback((index, e) => {
    const cardEl = cardsRef.current[index];
    if (!cardEl || activeDetail) return;
    
    const rect = cardEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) - (rect.width / 2);
    const y = (e.clientY - rect.top) - (rect.height / 2);

    // Calculate a subtle tilt (max 15 degrees)
    gsap.to(cardEl._hoverState, {
      rotateY: (x / rect.width) * 15,
      rotateX: -(y / rect.height) * 15, // Negative so it tilts towards the mouse
      duration: 0.3,
      ease: "power2.out"
    });
  }, [activeDetail]);

  const recalcDims = useCallback(() => {
    const e = engineRef.current;
    e.W = window.innerWidth;
    e.H = window.innerHeight;
    e.xOrigin = e.W * 0.12;
    e.yOrigin = e.H * 0.50;
  }, []);

  const dismissCallbackRef = useRef(null);

  const handleDismiss = useCallback(
    (injectDeltaY = 0) => {
      const e = engineRef.current;
      if (e.activeCardIndex === -1) return;

      const cardEl = cardsRef.current[e.activeCardIndex];
      if (cardEl && e.flipState) {
        // ── Step 1: Instantly hide content before reverse geometry ──
        const contentEl = cardEl.querySelector('.card-content-v2');
        const indexEl = cardEl.querySelector('.card-index');
        if (contentEl) gsap.set(contentEl, { opacity: 0, y: 0 });
        if (indexEl) gsap.set(indexEl, { opacity: 0 });

        cardEl.classList.remove('detail-expanded');
        cardEl.style.position = '';
        cardEl.style.zIndex = '';
        cardEl.style.borderRadius = '';
        cardEl.style.padding = '';
        cardEl.style.width = '';
        cardEl.style.height = '';
        cardEl.style.top = '';
        cardEl.style.bottom = '';
        cardEl.style.left = '';
        cardEl.style.right = '';
        cardEl.style.background = '';

        if (window.innerWidth < 768) {
          // Mobile: slide down off screen
          gsap.to(cardEl, {
            y: window.innerHeight,
            duration: 0.4,
            ease: 'power3.in',
            onComplete: () => {
              cardEl.classList.remove('detail-expanded');
              cardEl.style.cssText = ''; // full reset

              const delta = getDelta(e.activeCardIndex, e.progress);
              const state = getSpatialState(
                delta, e.W, e.H, e.xOrigin, e.yOrigin, e.amplitude, e.progress
              );
              cardEl.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale}) rotateY(${state.rotateY}deg) perspective(1200px)`;
              cardEl.style.zIndex = state.z;

              // Restore content visibility
              if (contentEl) gsap.set(contentEl, { opacity: 1, y: 0, clearProps: 'all' });
              if (indexEl) gsap.set(indexEl, { opacity: 1, clearProps: 'all' });

              e.isFrozen = false;
              e.activeCardIndex = -1;
              e.flipState = null;
              setActiveDetail(null);

              if (injectDeltaY !== 0) {
                const clamped = injectDeltaY > V_MAX ? V_MAX : injectDeltaY < -V_MAX ? -V_MAX : injectDeltaY;
                e.velocity += clamped * INPUT_SCALE;
              }
            }
          });
        } else {
          const delta = getDelta(e.activeCardIndex, e.progress);
          const state = getSpatialState(
            delta, e.W, e.H, e.xOrigin, e.yOrigin, e.amplitude, e.progress
          );
          cardEl.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale}) rotateY(${state.rotateY}deg) perspective(1200px)`;
          cardEl.style.zIndex = state.z;

          Flip.from(e.flipState, {
            duration: 0.65,
            ease: 'expo.inOut',
            onComplete: () => {
              // Restore content visibility after reverse morph
              if (contentEl) gsap.set(contentEl, { clearProps: 'all' });
              if (indexEl) gsap.set(indexEl, { clearProps: 'all' });

              e.isFrozen = false;
              e.activeCardIndex = -1;
              e.flipState = null;
              setActiveDetail(null);

              if (injectDeltaY !== 0) {
                const clamped = injectDeltaY > V_MAX ? V_MAX : injectDeltaY < -V_MAX ? -V_MAX : injectDeltaY;
                e.velocity += clamped * INPUT_SCALE;
              }
            },
          });
        }
      } else {
        e.isFrozen = false;
        e.activeCardIndex = -1;
        setActiveDetail(null);
      }

      setIsExpanding(false);
    },
    []
  );

  useEffect(() => {
    dismissCallbackRef.current = handleDismiss;
  }, [handleDismiss]);

  const handleCardClick = useCallback(
    (nodeIndex) => {
      const e = engineRef.current;
      if (e.isFrozen || activeDetail) return;

      const cardEl = cardsRef.current[nodeIndex];
      if (!cardEl) return;

      e.isFrozen = true;
      e.activeCardIndex = nodeIndex;
      e.velocity = 0;
      setIsExpanding(true);

      // ── Step 1: Hide content BEFORE Flip records geometry ──
      // This prevents React/Flip from seeing layout-painted text during the morph.
      const contentEl = cardEl.querySelector('.card-content-v2');
      const indexEl = cardEl.querySelector('.card-index');
      if (contentEl) gsap.set(contentEl, { opacity: 0 });
      if (indexEl) gsap.set(indexEl, { opacity: 0 });

      // ── Step 2: Record initial geometry ──
      e.flipState = Flip.getState(cardEl);

      const isMobile = e.W < 768;

      // ── Step 3: Apply final geometry (layout properties) ──
      cardEl.classList.add('detail-expanded');
      cardEl.style.position = 'fixed';
      cardEl.style.zIndex = '9999';
      cardEl.style.borderRadius = isMobile ? '28px 28px 0 0' : '28px';
      cardEl.style.padding = isMobile ? '32px' : '48px';
      cardEl.style.width = isMobile ? '100vw' : '42vw';
      cardEl.style.height = isMobile ? '70vh' : '80vh';

      if (isMobile) {
        cardEl.style.top = 'auto';
        cardEl.style.bottom = '0';
        cardEl.style.left = '0';
        cardEl.style.right = '0';
        cardEl.style.transform = 'none';

        // Mobile: slide up from below, no Flip (avoids layout thrash)
        gsap.fromTo(cardEl,
          { y: window.innerHeight },
          {
            y: 0,
            duration: 0.55,
            ease: 'expo.out',
            onComplete: () => {
              // ── Step 4 (mobile): reveal content only after geometry settles ──
              if (contentEl) gsap.to(contentEl, { opacity: 1, duration: 0.4, ease: 'power2.out' });
              if (indexEl) gsap.to(indexEl, { opacity: 1, duration: 0.4, ease: 'power2.out' });
              const event = EVENTS[nodeIndex % DATA_SIZE];
              setActiveDetail({ ...event, nodeIndex });
            }
          }
        );
      } else {
        cardEl.style.top = '10vh';
        cardEl.style.left = 'auto';
        cardEl.style.right = '5%';
        cardEl.style.transform = 'none';

        // ── Step 4 (desktop): morph geometry only, no content visible ──
        Flip.from(e.flipState, {
          duration: 0.7,
          ease: 'expo.inOut',
          onComplete: () => {
            // Reveal content after geometry is 100% settled — no competing animations
            if (contentEl) {
              gsap.fromTo(contentEl,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
              );
            }
            if (indexEl) gsap.to(indexEl, { opacity: 1, duration: 0.5, ease: 'power2.out' });
            const event = EVENTS[nodeIndex % DATA_SIZE];
            setActiveDetail({ ...event, nodeIndex });
          },
        });
      }
    },
    [activeDetail]
  );

  // ─── Main Effect: Observer + Ticker ────────────────────────────────────
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReducedMotion(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    const fontPromise =
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready
        : Promise.resolve();

    let ctx;
    let inputTimeout;

    fontPromise.then(() => {
      recalcDims();
      setIsLoading(false);

      ctx = gsap.context(() => {
        const e = engineRef.current;

        // ── Scroll / Touch Input ──────────────────────────────────────
        Observer.create({
          target: containerRef.current,
          type: "wheel,touch,pointer",
          wheelSpeed: -1,
          tolerance: 10,
          preventDefault: true,
          onChangeY: (self) => {
            if (e.isFrozen) {
              if (e.activeCardIndex !== -1 && dismissCallbackRef.current) {
                dismissCallbackRef.current(self.deltaY);
              }
              return;
            }

            e.isInputActive = true;
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => { e.isInputActive = false; }, 150);

            let raw = self.deltaY;
            const isTouch = self.event && self.event.type.includes("touch");
            
            if (isTouch) {
              raw *= 7.0; // Massive boost for mobile swipe feel
            }
            
            // Cap to prevent physics breaking.
            // Desktop wheel is capped lower (30) so scroll-wheels don't jerk.
            // Mobile touch is capped higher (90) to allow fast "throw" swipes.
            const capLimit = isTouch ? 90 : 30;
            const capped = raw > capLimit ? capLimit : raw < -capLimit ? -capLimit : raw;
            
            e.velocity += capped * INPUT_SCALE;
          },
        });

        // ── Parallax Mouse Tracking ──────────────────────────────────
        const xTo = gsap.quickTo(parallaxLayerRef.current, "x", { duration: 0.8, ease: "power3" });
        const yTo = gsap.quickTo(parallaxLayerRef.current, "y", { duration: 0.8, ease: "power3" });
        
        // Background interactive parallax (Hardware Accelerated wrappers)
        const sx1 = gsap.quickTo(starBgMouseRef.current, "x", { duration: 1.2, ease: "power3" });
        const sy1 = gsap.quickTo(starBgMouseRef.current, "y", { duration: 1.2, ease: "power3" });
        const sx2 = gsap.quickTo(starMidMouseRef.current, "x", { duration: 1, ease: "power3" });
        const sy2 = gsap.quickTo(starMidMouseRef.current, "y", { duration: 1, ease: "power3" });
        const sx3 = gsap.quickTo(starFrontMouseRef.current, "x", { duration: 0.8, ease: "power3" });
        const sy3 = gsap.quickTo(starFrontMouseRef.current, "y", { duration: 0.8, ease: "power3" });

        const onMouseMove = (ev) => {
          e.mouseX = ev.clientX;
          e.mouseY = ev.clientY;
          
          const nx = (ev.clientX / e.W) * 2 - 1;
          const ny = (ev.clientY / e.H) * 2 - 1;
          
          xTo(nx * AMP_X);
          yTo(ny * AMP_Y);
          
          // Move stars subtly in opposition/alignment for deep 3D depth
          sx1(nx * -10);
          sy1(ny * -10);
          sx2(nx * -25);
          sy2(ny * -25);
          sx3(nx * -50);
          sy3(ny * -50);
        };
        window.addEventListener("mousemove", onMouseMove);

        // ── Engine Setup ───────────────────────────────────────────────────────
        let resizeTimer;
        const onResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(recalcDims, 150);
        };
        window.addEventListener("resize", onResize);

        // ── Keyboard ─────────────────────────────────────────────────
        const onKeyDown = (ev) => {
          if (ev.key === "Tab" && !e.isFrozen) {
            ev.preventDefault();
            e.velocity += ev.shiftKey ? -0.15 : 0.15;
          }
          if (ev.key === "Escape" && e.isFrozen && dismissCallbackRef.current) {
            dismissCallbackRef.current(0);
          }
        };
        window.addEventListener("keydown", onKeyDown);

        // ════════════════════════════════════════════════════════════
        //  THE KINETIC AMPLITUDE ENVELOPE — GSAP TICKER (60fps)
        // ════════════════════════════════════════════════════════════
        const tickFn = () => {
          const eng = engineRef.current;
          const dt = gsap.ticker.deltaRatio(60);

          if (!eng.isFrozen) {
            // ── 1. VELOCITY PHYSICS ─────────────────────────────────
            // Simple multiply instead of Math.pow — dt is typically ~1.0
            // For variable framerates: V * friction^dt ≈ V * friction * dt_correction
            const frictionThisFrame = dt > 1.3 ? FRICTION_60 * FRICTION_60 : FRICTION_60;
            eng.velocity *= frictionThisFrame;

            // Clamp velocity to prevent runaway
            if (eng.velocity > V_MAX) eng.velocity = V_MAX;
            else if (eng.velocity < -V_MAX) eng.velocity = -V_MAX;

            // ── MAGNETIC FOCAL SNAPPING ─────────────────────────────
            const absV = eng.velocity < 0 ? -eng.velocity : eng.velocity;
            if (!eng.isInputActive && absV < SNAP_THRESHOLD) {
              // Find nearest node using modular arithmetic (cheaper than full loop)
              const progressMod = ((eng.progress % TOTAL_NODES) + TOTAL_NODES) % TOTAL_NODES;
              const nearest = Math.round(progressMod);
              const closestDelta = progressMod - nearest;
              eng.velocity -= closestDelta * SNAP_STRENGTH * dt;
            }

            // Dead zone: snap to zero to prevent micro-oscillation
            if (eng.velocity > -V_REST && eng.velocity < V_REST) {
              eng.velocity = 0;
            }

            // Advance progress (the virtual scroll position)
            eng.progress += eng.velocity * dt;

            // ── 2. KINETIC AMPLITUDE ENVELOPE ───────────────────────
            // Target amplitude = |velocity| * scalar (capped)
            let targetAmp = eng.velocity < 0 ? -eng.velocity : eng.velocity;
            targetAmp *= WAVE_AMP_SCALAR;
            if (targetAmp > WAVE_AMP_MAX) targetAmp = WAVE_AMP_MAX;

            // Smooth spring toward target amplitude.
            // μ_spring (0.03) << velocity friction → cards stop translating
            // BEFORE the wave fully flattens → organic "jelly" settle.
            eng.amplitude += (targetAmp - eng.amplitude) * WAVE_AMP_SPRING * dt;

            // Kill amplitude when it's negligible (save sin() calls)
            if (eng.amplitude < 0.5 && targetAmp < 0.5) {
              eng.amplitude = 0;
            }
          }

          // ── 3. PER-CARD SPATIAL UPDATE ─────────────────────────────
          const cards = cardsRef.current;
          const edgeLights = edgeLightsRef.current;
          const len = cards.length;

          for (let i = 0; i < len; i++) {
            const card = cards[i];
            if (!card) continue;
            if (eng.isFrozen && i === eng.activeCardIndex) continue;

            const delta = getDelta(i, eng.progress);
            const state = getSpatialState(
              delta,
              eng.W,
              eng.H,
              eng.xOrigin,
              eng.yOrigin,
              eng.amplitude,
              eng.progress
            );

            // Merge base state + local hover state
            const hover = card._hoverState || { zOffset: 0, scaleOffset: 0, rotateX: 0, rotateY: 0, yOffset: 0, xOffset: 0 };
            
            let finalScale = state.scale + hover.scaleOffset;
            let finalRotateX = (state.rotateX || 0) + hover.rotateX;
            let finalRotateY = state.rotateY + hover.rotateY;
            let finalZOffset = hover.zOffset;
            let finalYOffset = hover.yOffset || 0;
            let finalXOffset = hover.xOffset || 0;

            // Strictly respect the physical Z-index of the stack.
            // By NOT artificially boosting the z-index on hover, the background cards 
            // will physically slide out from *behind* the front cards like a real 
            // stack of physical cards, instead of magically phasing through them.
            let finalZIndex = state.z;

            // ── Final Transform (Local Perspective) ──────────────────
            card.style.transform =
              "translate3d(" + (state.x + finalXOffset) + "px," + (state.y + finalYOffset) + "px," + finalZOffset + "px) perspective(1200px) scale(" + finalScale + ") rotateX(" + finalRotateX + "deg) rotateY(" + finalRotateY + "deg)";
            card.style.zIndex = finalZIndex;
            
            // Performance: Removed expensive card.style.filter = brightness() re-calculation.
            // Opacity and 3D perspective alone provide excellent depth cues with zero CPU overhead.
            
            // Hide cards outside the active viewport for a clean look
            if (card.style.opacity !== String(state.opacity)) {
              card.style.opacity = state.opacity;
            }
            if (card.style.visibility !== state.visibility) {
              card.style.visibility = state.visibility;
            }

            // Focal state change guard (prevent DOM thrashing)
            if (!eng.isFrozen && card._wasFocal !== state.focal) {
              card.tabIndex = state.focal ? 0 : -1;
              if (state.focal) {
                card.removeAttribute('aria-hidden');
              } else {
                card.setAttribute('aria-hidden', 'true');
              }
              card._wasFocal = state.focal;
            }
          }

          // ── 4. PARALLAX STARFIELD ────────────────────────────────
          // Hardware Accelerated Translation (looping via modulo arithmetic based on backgroundSize)
          if (starBgRef.current) starBgRef.current.style.transform = `translate3d(${(-eng.progress * 20) % 300}px, ${(eng.progress * 5) % 200}px, 0)`;
          if (starMidRef.current) starMidRef.current.style.transform = `translate3d(${(-eng.progress * 50) % 450}px, ${(eng.progress * 10) % 300}px, 0)`;
          if (starFrontRef.current) starFrontRef.current.style.transform = `translate3d(${(-eng.progress * 100) % 600}px, ${(eng.progress * 20) % 400}px, 0)`;
        };

        gsap.ticker.add(tickFn);

        return () => {
          gsap.ticker.remove(tickFn);
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("resize", onResize);
          window.removeEventListener("keydown", onKeyDown);
          clearTimeout(resizeTimer);
          clearTimeout(inputTimeout);
        };
      }, containerRef);
    });

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  if (reducedMotion) {
    return <StaticFallback />;
  }

  return (
    <div className="timeline-root h-screen w-full relative">
      <div className={`loading-gate ${!isLoading ? "loaded" : ""}`}>
        <span className="loading-text">Shunya</span>
      </div>

      <main
        ref={containerRef}
        className="scene-root"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "transparent",
          touchAction: "none",
          zIndex: 0,
        }}
      >
        {/* INTERACTIVE PARALLAX SPACE BACKGROUND */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: -1, pointerEvents: "none" }}>
          
          <div ref={starBgMouseRef} style={{ position: "absolute", inset: "-150px", willChange: "transform" }}>
            <div
              ref={starBgRef}
              style={{
                position: "absolute", inset: "-150px",
                backgroundImage: `
                  radial-gradient(2px 2px at 40px 60px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2px 2px at 250px 130px, rgba(255, 255, 255, 0.8), transparent),
                  radial-gradient(2.5px 2.5px at 150px 280px, rgba(255, 255, 255, 0.7), transparent),
                  radial-gradient(2px 2px at 80px 150px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2.5px 2.5px at 320px 220px, rgba(255, 255, 255, 0.8), transparent),
                  radial-gradient(2px 2px at 450px 80px, rgba(255, 255, 255, 0.7), transparent),
                  radial-gradient(2px 2px at 580px 290px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(2px 2px at 100px 380px, rgba(255, 255, 255, 0.8), transparent),
                  radial-gradient(2px 2px at 500px 180px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2.5px 2.5px at 200px 50px, rgba(255, 255, 255, 0.7), transparent),
                  radial-gradient(2px 2px at 380px 350px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2px 2px at 480px 300px, rgba(255, 255, 255, 0.8), transparent),
                  radial-gradient(2px 2px at 20px 200px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2px 2px at 150px 50px, rgba(255, 255, 255, 0.8), transparent),
                  radial-gradient(2px 2px at 350px 120px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(2px 2px at 550px 380px, rgba(255, 255, 255, 0.7), transparent),
                  radial-gradient(2px 2px at 280px 380px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2.5px 2.5px at 400px 250px, rgba(255, 255, 255, 0.8), transparent)
                `,
                backgroundSize: "300px 200px",
                backgroundRepeat: "repeat",
                willChange: "transform"
              }}
            />
          </div>

          <div ref={starMidMouseRef} style={{ position: "absolute", inset: "-150px", willChange: "transform" }}>
            <div
              ref={starMidRef}
              style={{
                position: "absolute", inset: "-150px",
                backgroundImage: `
                  radial-gradient(3px 3px at 100px 200px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(3px 3px at 400px 320px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2.5px 2.5px at 250px 80px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(3px 3px at 600px 150px, rgba(255, 255, 255, 0.8), transparent),
                  radial-gradient(2.5px 2.5px at 750px 380px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(3px 3px at 850px 200px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(2.5px 2.5px at 50px 450px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(3px 3px at 300px 500px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2.5px 2.5px at 500px 280px, rgba(255, 255, 255, 0.8), transparent),
                  radial-gradient(3px 3px at 700px 50px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(2.5px 2.5px at 800px 450px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2.5px 2.5px at 150px 100px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(3px 3px at 350px 250px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(2.5px 2.5px at 550px 480px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(3px 3px at 650px 300px, rgba(255, 255, 255, 0.8), transparent),
                  radial-gradient(2.5px 2.5px at 880px 120px, rgba(255, 255, 255, 1.0), transparent)
                `,
                backgroundSize: "450px 300px",
                backgroundRepeat: "repeat",
                willChange: "transform"
              }}
            />
          </div>

          <div ref={starFrontMouseRef} style={{ position: "absolute", inset: "-150px", willChange: "transform" }}>
            <div
              ref={starFrontRef}
              style={{
                position: "absolute", inset: "-150px",
                backgroundImage: `
                  radial-gradient(4px 4px at 50px 80px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(4px 4px at 600px 150px, rgba(0, 255, 200, 1.0), transparent),
                  radial-gradient(5px 5px at 350px 400px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(4px 4px at 800px 600px, rgba(0, 190, 255, 1.0), transparent),
                  radial-gradient(5px 5px at 1050px 250px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(4px 4px at 150px 550px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(5px 5px at 450px 50px, rgba(0, 255, 200, 1.0), transparent),
                  radial-gradient(4px 4px at 700px 350px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(5px 5px at 950px 700px, rgba(0, 190, 255, 0.9), transparent),
                  radial-gradient(4px 4px at 1150px 400px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(4px 4px at 250px 250px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(5px 5px at 550px 650px, rgba(255, 255, 255, 1.0), transparent),
                  radial-gradient(4px 4px at 850px 150px, rgba(255, 255, 255, 0.9), transparent),
                  radial-gradient(5px 5px at 1000px 500px, rgba(0, 255, 200, 0.9), transparent),
                  radial-gradient(4px 4px at 50px 750px, rgba(255, 255, 255, 1.0), transparent)
                `,
                backgroundSize: "600px 400px",
                backgroundRepeat: "repeat",
                willChange: "transform"
              }}
            />
          </div>

        </div>
        {/* Full screen blur backdrop for expanded view */}
        <div
          ref={blurOverlayRef}
          className={`pre-blur-overlay ${activeDetail ? "active" : ""}`}
          onClick={() => handleDismiss(0)}
        />

        <EventTimeline />

        <ScrollHint hidden={!!activeDetail || isExpanding} />

        <div ref={parallaxLayerRef} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
          {TRIPLED_EVENTS.map((event, i) => (
            <GlassCard
              key={`node-${i}`}
              ref={(el) => setCardRef(el, i)}
              event={event}
              nodeIndex={event.nodeIndex}
              onClick={() => handleCardClick(i)}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => handleMouseLeave(i)}
              onMouseMove={(e) => handleMouseMove(i, e)}
            />
          ))}
        </div>

        {/* Ghost text overlay completely removed; text is now native to the GlassCard component! */}
      </main>
    </div>
  );
}
