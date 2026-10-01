# Shunya 2026 — Progress Tracker

This is a human-facing milestone tracker. Check off items only once verified.

## Launch: Shunya 2026 Tech Fest
- [x] Cosmic HUD Hero interaction and visual styling.
- [x] Liquid Glass Navigation bar.
- [x] Highlight Event Carousel (`SwiperCarousel`).
- [x] Creative Footer with Socials & GDSC links.
- [x] Physics-driven Event Timeline (Kinetic wave layout).
- [x] Event Timeline Desktop Expand (Flip morph to right panel).
- [x] Event Timeline Mobile Expand (Center screen pop-up).
- [x] Mobile Performance Optimizations (Disabled heavy blurs/radial gradients).
- [x] Mobile Scroll Sensitivity tuned for responsive "throw" mechanics.

## Recently Decided (Context for future sessions)
- **CSS / JS Breakpoint Sync:** Breakpoints MUST be synchronized using `window.matchMedia` rather than raw `window.innerWidth` to prevent UI tearing or logic mismatches on mobile devices.
- **Physics vs UI Layer:** The timeline operates independently of standard React render cycles to maintain 60fps. Any new UI logic added to the cards must respect the GSAP Observer loop and avoid triggering global re-renders.

## Explicitly Deferred
- Hooking up dynamic content for the events (currently pulling from hardcoded `EVENTS` array in `SceneController.jsx`).

## Last Updated
- Oct 2026 — Fully synced with current repository state.