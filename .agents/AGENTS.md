# Agent Rules (from .agent/RULES.md & GEMINI.md)

## Non-negotiables
- Do not invent files, paths, tools, or dependencies.
- Do not touch unrelated code.
- Do not create the HUD effect in the asset-generation step.
- Do not make the hero visually heavy.
- Do not sacrifice performance for decoration.
- Do not finalize uncertainty as fact.
- Do not silently skip repository inspection.
- Do not turn a local cursor effect into a global animation.

## Visual rules
- Earth belongs low in the frame.
- Nebula and stars belong above and around it.
- Negative space is a feature, not a bug.
- HUD lines must stay thin and restrained.
- Accent color should be rare, not constant.
- Details must read premium at hero scale.

## Motion rules
- Cursor-local reveal only.
- Outside the reveal, nothing from the HUD should animate.
- Prefer a continuous HUD layer clipped by a mask over remounting content.
- Keep motion elegant and controlled.
- Avoid jittery or game-like movement.

## Performance rules
- Keep runtime work minimal.
- Prefer transform, opacity, masking, and lightweight SVG.
- Avoid layout thrash.
- Avoid per-frame React state updates.
- Avoid dense particle systems.
- Keep assets optimized for web.

## Hallucination guardrails
Do not claim:
- files exist unless they do
- assets are transparent unless verified
- optimizations were made unless actually done
- paths are correct unless inspected

If something is ambiguous:
- stop
- ask
- do not fill the gap with imagination

- NEVER push code to GitHub without the user's explicit permission.


- NEVER push code to GitHub without the user's explicit permission.
