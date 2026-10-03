/**
 * Details Transition Module — "Airlock"
 * 
 * Spec from DESIGNGUIDE.md:
 * 1. Press feedback (180ms): "Details →" scales to 0.96, accent glow intensifies.
 * 2. Current scroll view fades/scales down slightly (0.98, opacity 1->0.3) while full-viewport detail view
 *    scales/fades in (0.98->1, opacity 0->1), over --dur-curtain (800ms), --ease-curtain.
 * 3. Thin seam of event's accent color sweeps top-to-bottom once during transition.
 * 4. Starfield canvas keeps rendering underneath throughout — no separate background.
 * 5. Detail content: headline, one-paragraph description, Space Mono metadata list, close control.
 * 6. Record scroll position before opening; on close, reverse the fade/scale and restore it exactly.
 *    No URL/history change at any point.
 */

import { events } from '../data/events.js';
import { renderDetails, clearDetails } from './details-content.js';

let airlockTimeline = null;
let recordedScrollY = 0;
let isAnimating = false;
let isOpen = false;

function getEventData(id) {
  if (events && events.length > 0) {
    return events.find(e => e.id === id) || events[0];
  }
  return null;
}

export function init() {
  const container = document.getElementById('scroll-container');
  if (!container) {
    console.error('[DetailsTransition] #scroll-container not found in DOM.');
    return;
  }

  // Delegated click listener for "Details ->" buttons inside event cards
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.event-card__details-btn');
    if (!btn || isAnimating || isOpen) return;

    e.preventDefault();
    const eventId = btn.getAttribute('data-id');
    const eventData = getEventData(eventId);
    if (!eventData) return;

    // 1. Press feedback (180ms, scale to 0.96, glow)
    gsap.to(btn, {
      scale: 0.96,
      textShadow: `0 0 18px ${eventData.accent || '#fff'}`,
      duration: 0.18,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(btn, { scale: 1, textShadow: 'none' });
        openAirlock(eventData);
      }
    });
  });

  // Global escape key listener to close details view
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen && !isAnimating) {
      closeAirlock();
    }
  });

  console.log('[DetailsTransition] Airlock transition module initialized.');
}

function openAirlock(eventData) {
  if (isAnimating) return;
  isAnimating = true;
  isOpen = true;

  try {
    window.parent.postMessage({ type: 'shunya:details-open' }, '*');
  } catch (e) {}

  // Record exact scroll position prior to transition
  recordedScrollY = window.scrollY;

  // Target the inner wrapper (not scroll-container, which has overflow:hidden)
  const scrollInner = document.getElementById('scroll-inner');
  const detailsRoot = document.getElementById('details-root');

  if (!scrollInner || !detailsRoot) {
    console.error('[DetailsTransition] Required DOM elements (#scroll-inner, #details-root) not found.');
    isAnimating = false;
    isOpen = false;
    return;
  }

  // Render detail view template into #details-root
  const rendered = renderDetails(eventData);
  if (!rendered) {
    isAnimating = false;
    isOpen = false;
    return;
  }

  const { view, seam, closeBtn } = rendered;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeCurtain = "power4.inOut";   // ultra-premium organic cinematic ease

  // Lock body scroll
  document.body.style.overflow = 'hidden';

  // Build the Airlock GSAP Timeline
  airlockTimeline = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
      if (closeBtn) {
        closeBtn.addEventListener('click', closeAirlock, { once: true });
      }
    },
    onReverseComplete: () => {
      try {
        window.parent.postMessage({ type: 'shunya:details-close' }, '*');
      } catch (e) {}
      // Explicitly clear inline styles GSAP left on scroll-inner
      const si = document.getElementById('scroll-inner');
      if (si) gsap.set(si, { clearProps: 'scale,opacity,transform' });
      clearDetails();
      document.body.style.overflow = '';
      window.scrollTo(0, recordedScrollY);
      isAnimating = false;
      isOpen = false;
      airlockTimeline = null;
    }
  });

  if (!prefersReducedMotion) {
    // 2. Scroll inner: recede depth + fade (scale 1 -> 0.97, opacity 1 -> 0.15)
    // CRITICAL: Removed filter: 'blur(4px)' as blurring massive DOM elements during a scale tween destroys mobile GPU framerates
    airlockTimeline.to(scrollInner, {
      scale: 0.95,
      opacity: 0.1,
      duration: 0.9,
      ease: easeCurtain
    }, 0);

    // 2. Details view: emerge from depth (subtle, premium scale 0.97 -> 1)
    airlockTimeline.fromTo(view,
      { scale: 0.97, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.9, ease: easeCurtain },
      0.05  // tiny delay to stagger entry after scroll inner starts receding
    );

    // 3. Accent seam sweep top -> bottom
    if (seam) {
      airlockTimeline.fromTo(seam,
        { top: '0vh', opacity: 0 },
        { top: '100vh', opacity: 1, duration: 0.7, ease: 'expo.inOut' },
        0
      );
      airlockTimeline.to(seam, { opacity: 0, duration: 0.18 }, 0.55);
    }

    // 4. Stagger the details content children in for premium reveal
    const detailsContainer = view.querySelector('.details-view__container');
    if (detailsContainer) {
      const children = Array.from(detailsContainer.children);
      if (children.length > 0) {
        gsap.set(children, { opacity: 0, y: 30 });
        airlockTimeline.to(children, {
          opacity: 1, y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.08
        }, 0.5); // start as the geometry tween starts slowing down
      }
    }
  } else {
    // Reduced motion: pure opacity crossfade
    airlockTimeline.to(scrollInner, {
      opacity: 0.2,
      duration: 0.5,
      ease: 'power2.inOut'
    }, 0);

    airlockTimeline.fromTo(view,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.inOut' },
      0
    );
  }
}

function closeAirlock() {
  if (isAnimating || !airlockTimeline) return;
  isAnimating = true;

  try {
    window.parent.postMessage({ type: 'shunya:details-close' }, '*');
  } catch (e) {}

  // Preserve scroll position during reverse
  window.scrollTo(0, recordedScrollY);

  airlockTimeline.reverse();
}
