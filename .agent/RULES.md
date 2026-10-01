# Agent Rules

## Non-negotiables
- Do not invent files, paths, tools, or dependencies.
- Do not touch unrelated code.
- Do not sacrifice mobile performance for desktop decoration (blur, gradients).
- Do not trigger React state updates inside the GSAP ticker loop.
- NEVER push code to GitHub without the user's explicit permission.

## Visual rules
- Maintain the dark, cosmic aesthetic (neon accents against dark backgrounds).
- Typography must stay consistent with the `corpta` font and the `Space Grotesk` tabular numbers.
- Glassmorphism should be used carefully — disable `backdrop-filter: blur` on mobile elements if they are animated.

## Motion rules
- Animations must feel premium, bouncy, and cinematic (e.g. `elastic.out` or `expo.out`).
- GSAP Observer logic handles touch/wheel input. Do not mix native scrolling with the kinetic wave engine.
- Mobile interactions should feel "loose" and fast (high scroll multiplier, high velocity cap).
- Avoid per-frame React state updates. Use `gsap.quickTo` or direct DOM manipulation (`ref.current.style.transform`) for 60fps tracking.
- When animating an element with GSAP `fromTo`, explicitly overwrite ALL transform properties (`x`, `y`, `z`, `scale`, `rotation`) if the element previously inherited values from a physics engine.

## Review checklist before shipping
- Does this break on mobile? (Verify JS/CSS media queries).
- Is this running smoothly at 60fps? (No heavy layers during animations).
- Did I overwrite React inline CSS variables when clearing styles? (Use `.removeProperty` or explicitly unset specific styles instead of `cssText = ''`).
