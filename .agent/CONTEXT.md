# Project Context

> Auto-maintained by the agent. This file reflects the actual state of the Shunya 2026 repository.

## Project Identity
- **Name:** Shunya 2026 (GDG on Campus NSUT Tech Fest)
- **Stack:** Next.js (App Router), React, GSAP (Core, ScrollTrigger, Observer, Flip), TailwindCSS
- **Type:** Frontend Marketing / Event Website
- **Architecture:** 
  - Heavily relies on GSAP for highly-custom kinetic physics and cinematic animations.
  - Mobile-first performance constraints (using CSS media queries directly synced with JS `matchMedia`).

## Layer Map
- `app/`: Next.js App Router pages and global CSS (`globals.css`, `timeline/timeline.css`).
- `components/timeline/`: GSAP-driven Event Timeline (e.g., `SceneController.jsx`, `GlassCard.jsx`).
- `components/hero/`: Cosmic HUD Hero interaction and masking.
- `components/navigation/` & `components/footer/`: Liquid glass styled global layout elements.
- `components/carousel/`: Swiper-based highlight carousels.

## Active Decisions
| Decision | Reason | Date |
|---|---|---|
| **GSAP over Framer Motion** | Required for raw DOM-node manipulation (physics ticker, Flip geometry morphing, hardware-accelerated transforms) without React render loop overhead. | Sept 2026 |
| **Strict JS/CSS Media Query Sync** | `window.innerWidth` was causing mismatch bugs between JS animation logic and CSS on mobile devices. All breakpoints in JS must now explicitly use `window.matchMedia('(max-width: 768px)').matches`. | Oct 2026 |
| **Mobile Performance Kill-Switches** | Disabled `backdrop-filter: blur`, SVG noise, and full-screen radial-gradient star layers on mobile (`<= 768px`) to prevent GPU fill-rate throttling. Maintains solid 60fps. | Oct 2026 |
| **Aggressive Mobile Scroll Feel** | The timeline kinetic wave uses a high velocity multiplier (`15.0x`) and velocity cap (`150`) for mobile touch events to create a fast, loose "throw" feel. | Oct 2026 |
| **Fixed GSAP `fromTo` Inheritance** | Mobile card expansion explicitly forces `x: 0, z: 0, rotateX: 0, rotateY: 0` in `gsap.fromTo()` so the card centers perfectly, overriding the kinetic wave's raw inline transform state. | Oct 2026 |
| **Comprehensive OpenGraph & Twitter Metadata** | Configured `metadataBase` to `shunya.gdgnsut.com`, injected `title`, full festival `description`, `opengraph-image.jpg`, and `twitter-image.jpg` with `summary_large_image` support. | Oct 2026 |

## Current Functionality (Stable)
- [x] Cosmic HUD Hero Section (Cursor localized reveal, parallax stars).
- [x] Event Timeline with GSAP kinetic wave engine (`SceneController.jsx`).
- [x] Timeline Mobile interaction (Center screen pop-up, heavily optimized GPU performance).
- [x] Timeline Desktop interaction (GSAP Flip morphs cards to the right panel).
- [x] Creative Footer with GDG & Social links.
- [x] Liquid Glass Navigation and Carousels.
- [x] Full SEO & OpenGraph / Twitter metadata with social share cards.

## Known Issues / Watch-outs
- **State vs GSAP:** Be very careful mixing React State and GSAP. `SceneController.jsx` operates almost entirely outside the React render cycle using refs to maintain 60fps. If you add React state updates into the GSAP ticker or scroll callbacks, you will destroy performance.
- **GSAP Transforms:** GSAP remembers inline styles. If you pull an element out of the kinetic wave (which has heavy 3D transforms), you MUST manually clear or explicitly overwrite those properties (`x`, `y`, `z`, `scale`, `rotation`) when expanding it.

- **Tailwind v4 Route Caching Bug:** Avoid using \<style jsx>\ within \use client\ components alongside Tailwind utility classes. Route transitions can cause Tailwind's layered classes to be silently dropped or overridden. Global CSS animations must reside in \globals.css\.
- **Global CSS Isolation:** Never use unlayered global resets (\* { margin: 0 }\) in route-specific CSS files (like \	imeline.css\). Next.js retains these sheets during soft navigations, causing them to leak and globally destroy Tailwind v4 utility classes (since unlayered CSS overrides layered CSS).
