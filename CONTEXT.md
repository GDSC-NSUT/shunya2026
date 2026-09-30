# Cosmic HUD Hero — CONTEXT

## What this project is
A premium hero section built around a cosmic visual system:
- Earth anchored in the lower portion of the frame
- nebula and starfield above
- a cursor-localized HUD/scanner interaction revealed only under the pointer
- cinematic, premium, Awwwards-style presentation
- lightweight and fast in the browser

## Canonical visual direction
The scene should feel:
- cinematic
- luxurious
- spacious
- atmospheric
- modern
- minimal, but detailed
- premium without looking heavy

The scene should not feel:
- generic space wallpaper
- cyberpunk
- game UI
- noisy
- overdesigned
- stock-like
- bloated

## What the motion analysis established
From the reference clip, the HUD language is:
- thin near-white grid lines
- small node markers
- tiny numeric labels that flicker rapidly
- a diagonal scan line that appears in one cell, holds, dissolves, then reappears in an adjacent cell
- one rare blue accent flash

The source clip does NOT show a cursor or a hover entry/exit state.
That interaction is a design layer we are adding on top of the extracted motion language.

## Interaction model
Default working model unless changed:
- desktop: cursor-local scanner / spotlight reveal
- hover affects only the region under the cursor
- outside the reveal area: keep the scene idle and normal
- mobile: tap-reveal, hold briefly, then fade out

## Asset system
Create and use separate layers when practical:
- Earth
- nebula
- starfield
- optional subtle dust / depth support

Do not bake the HUD into the art assets.
Do not add extra planets, rings, comets, or decorative clutter unless explicitly requested.

## Performance goals
The experience must stay fast and smooth:
- prefer a small number of strong layers
- avoid heavy runtime rendering (on mobile: DPR capped at 1, CSS animations disabled for full-screen elements)
- keep file sizes sensible (always use WebP/AVIF instead of PNG)
- avoid dense particles and excessive blur (limit overlapping box-shadow and backdrop-filter on mobile glass cards)
- preserve browser compositing performance (avoid will-change on mobile)

## Current defaults
These are the current working defaults unless the user changes them:
- reveal shape: soft circular scanner
- reveal diameter: about 260px
- edge feather: about 50px
- pointer follow: eased / slightly lagged
- Earth motion: near-static
- nebula motion: subtle ambient drift
- grid: revealed only inside the cursor-local mask

## How to use this file
This file is the source of truth for:
- project intent
- visual direction
- interaction model
- performance constraints
- what not to invent

If a task conflicts with this file, stop and resolve the conflict before continuing.
