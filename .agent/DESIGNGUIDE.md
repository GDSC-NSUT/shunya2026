# Shunya 2026 — Design Guide

> Living document of established patterns for Shunya 2026.

## Confirmed Interaction Patterns

### Cosmic HUD Hero (cursor-local scan reveal)
- **What it is:** A full-bleed hero with a static Earth/nebula background. On pointer move, a soft circular mask follows the cursor to reveal a sci-fi data-scan HUD (grid lines, node markers, flickering coordinate labels, scan-pulse).
- **Rules:** Pointer/mask position tracking relies on raw refs + `requestAnimationFrame`. Label flicker is throttled. Scan-pulse uses `stroke-dashoffset`.

### Kinetic Event Timeline
- **What it is:** A 3D physics-based carousel timeline displaying events. Cards fly forward in a smooth, cinematic wave based on scroll/swipe velocity.
- **Rules:** 
  - GSAP Observer controls input (scroll/touch).
  - GSAP Ticker runs the animation loop, mutating raw DOM properties via refs to avoid React re-renders.
  - Expanding cards uses `Flip.js` to morph geometry to the right panel on desktop.
  - On mobile, expanding cards slide up to center screen, forcefully overwriting their 3D physics coordinates with standard fixed coordinates (`x: 0, y: 0, z: 0`).

### Liquid Glass Navigation / Footer
- **What it is:** Navigation and Footer use deep glassmorphism (translucency + subtle borders + internal glowing shadows) to create a premium, tactile feel against the dark universe background.
- **Rules:** Keep `backdrop-filter: blur` values reasonable on desktop. On mobile, disable blurs for anything animated or highly layered to protect framerate.

## Scaffold — Fill In As Decided

### Color Palette
- **Background:** Deep cosmic blacks.
- **Accents:** Neon colors passed dynamically to cards (`--card-accent`), heavily featuring electric cyan, hot pink, lime green, and pure white for highlights.

### Typography
- **Primary:** `corpta` (Local custom font).
- **Secondary:** `Space Grotesk` (Google font) for tabular numbers, labels, and tracking text.

### Performance Profile
- Highly tailored for mobile devices. Shunya 2026 targets a 60fps mobile experience despite heavy visual effects. 
- Star layers, blurring, and expensive CSS properties MUST be wrapped in Desktop-only media queries (`min-width: 768px`) or explicitly disabled in mobile queries.
