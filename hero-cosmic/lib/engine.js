/**
 * Shunya 2.5D Conveyor Belt — Kinetic Amplitude Envelope Engine
 *
 * Mathematical architecture:
 *   V_current = lerp(V_current, V_target, μ_friction)      // high friction — stops fast
 *   A_target  = |V_current| * C_amplitude
 *   A_current = lerp(A_current, A_target, μ_spring)         // low spring — settles slowly
 *   Y_wave    = A_current * sin(Δ · ω + φ)
 *   Y_final   = Y_base - Y_wave
 *
 * μ_spring << μ_friction  →  cards stop before wave flattens  →  organic "jelly" settle
 */

export const TOTAL_NODES = 18;
export const DATA_SIZE = 6;
export const HALF_NODES = TOTAL_NODES >> 1; // 9

// ─── Velocity Physics ──────────────────────────────────────────────────────
// V_FRICTION: higher = glides longer. Increased to 0.96 for a fluid, natural coast.
export const V_FRICTION = 0.96;

// V_MAX: raised to 0.12 for snappier peak speed.
export const V_MAX = 0.12;

// V_REST: velocity below which we zero out (prevents micro-oscillation).
export const V_REST = 0.0002;

// INPUT_SCALE: increased to 0.0004 so even small scrolls move the timeline fluidly.
export const INPUT_SCALE = 0.0004;

// ─── Wave Physics (Kinetic Amplitude Envelope) ─────────────────────────────
export const WAVE_FREQUENCY = 0.50;  // Slightly lower = longer wavelength = more graceful

// WAVE_AMP_SCALAR: controls how large the wave grows relative to scroll velocity.
// Restored to 1000 — visible, cinematic EM-wave motion during scrolling.
// The low WAVE_AMP_SPRING (0.06) ensures it builds and decays smoothly.
export const WAVE_AMP_SCALAR = 1000;

// WAVE_AMP_MAX: cap on the maximum wave amplitude in pixels.
export const WAVE_AMP_MAX = 180;

// WAVE_AMP_SPRING: how fast the amplitude chases its target.
// Previously 0.4 — reacts almost instantaneously → sharp wave onset → feels like a jerk.
// New value: 0.06 — amplitude trails behind velocity by ~16 frames.
// This gives the organic "fluid wakes behind the boat" settle instead of
// "immediately rigid stop."
export const WAVE_AMP_SPRING = 0.06;

export const WAVE_PHASE_SPEED = 0.5;

// ─── Parallax ──────────────────────────────────────────────────────────────
export const AMP_X = 25;
export const AMP_Y = 15;

// ─── Perspective ───────────────────────────────────────────────────────────
export const VANISHING_POINT_X_PCT = 1.30;
export const VANISHING_POINT_Y_PCT = -1.20;
export const PERSPECTIVE_FACTOR = 0.20;
export const CARD_ROTATE_Y_DEG = -15;

// ─── Snap ──────────────────────────────────────────────────────────────────
// SNAP_THRESHOLD: lowered significantly to 0.004 so it only snaps when almost completely stopped.
export const SNAP_THRESHOLD = 0.004;

// SNAP_STRENGTH: weakened to 0.008 so the magnetic pull is buttery soft and avoids artificial jerks.
export const SNAP_STRENGTH = 0.008;

/**
 * Wrapped delta: how many "slots" is node `i` from the virtual focal point `Pv`?
 * Result is in [-HALF_NODES, HALF_NODES).
 */
export function getDelta(i, Pv) {
  const raw = i - Pv;
  return (((raw + HALF_NODES) % TOTAL_NODES) + TOTAL_NODES) % TOTAL_NODES - HALF_NODES;
}

/**
 * Cinematic scale via perspective division: S = 1 / (1 + Δ · k)
 */
export function getScale(delta) {
  if (delta < 0) {
    return 1 - delta * PERSPECTIVE_FACTOR;
  }
  const denom = 1 + delta * PERSPECTIVE_FACTOR;
  return denom <= 0.1 ? 10 : 1 / denom;
}

export function getX(delta, W, xOrigin) {
  const isMobile = W < 768;
  const S = getScale(delta);
  // Slight angle adjustment for mobile, not too extreme
  const Vx = W * (isMobile ? 1.25 : VANISHING_POINT_X_PCT);
  const spacingX = isMobile ? 1.0 : 1.0; 
  return xOrigin + (Vx - xOrigin) * (1 - S) * spacingX;
}

export function getYBase(delta, H, yOrigin, W) {
  const isMobile = W < 768;
  const S = getScale(delta);
  const Vy = H * (isMobile ? -1.40 : VANISHING_POINT_Y_PCT);
  // Tuned to exactly 0.85 so approximately 5 cards fit on screen at once
  const spacingY = isMobile ? 0.85 : 1.0;
  return yOrigin + (Vy - yOrigin) * (1 - S) * spacingY;
}

/**
 * Kinetic Wave Modifier — the core of the Kinetic Amplitude Envelope.
 * Pure function: given the current amplitude, delta, and progress, return the Y offset.
 *
 *   Y_wave = A_current * sin(Δ · ω + progress · phase_speed)
 */
export function getWaveY(delta, amplitude, progress) {
  return amplitude * Math.sin(delta * WAVE_FREQUENCY - progress * WAVE_PHASE_SPEED);
}

export function isFocal(delta) {
  return Math.abs(delta) < 0.5;
}

/**
 * Full Spatial State for a single card on a single frame.
 * The wave is baked in: moving the card towards top-left (-X, -Y)
 */
export function getSpatialState(delta, W, H, xOrigin, yOrigin, amplitude, progress) {
  const isMobile = W < 768;
  // Restore a deep visual limit; the new massive spacing ensures they naturally go off-screen
  // before hitting this limit, preventing artificial clipping/disappearing.
  const maxVisibleDelta = isMobile ? 10 : 16; 
  const minVisibleDelta = isMobile ? -2 : -4;
  const S = getScale(delta);
  const absDelta = Math.abs(delta);
  
  return {
    x: getX(delta, W, xOrigin),
    y: getYBase(delta, H, yOrigin, W) - getWaveY(delta, amplitude, progress),
    scale: S,
    rotateY: isMobile ? -8 : CARD_ROTATE_Y_DEG,
    z: (100 - delta * 10) | 0,
    opacity: delta < minVisibleDelta ? 0 : delta > maxVisibleDelta ? 0 : 1,
    visibility: delta < minVisibleDelta || delta > maxVisibleDelta ? "hidden" : "visible",
    focusFactor: Math.max(0.6, 1 - absDelta * 0.15),
    focal: absDelta < 0.5,
  };
}
