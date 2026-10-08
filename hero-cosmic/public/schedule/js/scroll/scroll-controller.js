/**
 * Scroll Controller Module
 * Manages single-column GSAP ScrollTrigger timeline and seamless infinite looping for 8 events.
 *
 * Infinite loop strategy:
 *   - Render CYCLES=3 full copies of the 8 events in the DOM (24 cards).
 *   - One cycle = 8 × SCROLL_PER_EVENT = 9,600 px.
 *   - User starts at cycle 1 (middle copy) on load.
 *   - Loop triggers ONLY when exiting the active cycle boundaries:
 *       • Scrolled past all 8 events (relY >= 2 * cyclePx) -> jump back one cycle (-cyclePx).
 *       • Scrolled backward before event 1 (relY < cyclePx) -> jump forward one cycle (+cyclePx).
 *   - When jumping, timeline progress is synchronized instantaneously to prevent scrub rewind sweeps.
 */

import { events } from '../data/events.js';
import { buildTimelineTransitions } from './headline-transition.js?v=5';
import { getEventSpaceVisuals } from './space-visuals.js';

const SCROLL_PER_EVENT = 1200; // px of scroll spacer per event — smooth, deliberate, premium
const CYCLES = 3;              // 3 copies in DOM: [buffer][active][buffer]

export function init() {
  const scrollContainer = document.getElementById('scroll-container');

  if (!scrollContainer) {
    console.error('[ScrollController] Required DOM element #scroll-container not found.');
    return;
  }

  scrollContainer.innerHTML = '';

  let cardData = events;
  if (!cardData || cardData.length === 0) {
    cardData = [
      { id: 'zero-day',          name: 'Zero Day Apocalypse',       tags: ['Prompt Engineering', 'Logic Battle'],        headlineColor: '#7E9DFF', leftAccent: '#FF2E4D', rightAccent: '#00E5FF', accent: '#FF2E4D' },
      { id: 'autopilot',         name: 'Autopilot',                  tags: ['Autonomous Agents', 'Reasoning'],            headlineColor: '#FF7A66', leftAccent: '#00E5FF', rightAccent: '#FFB347', accent: '#00E5FF' },
      { id: 'devlympics',        name: '24-Hour Devlympics',         tags: ['Hackathon', 'Innovation'],                  headlineColor: '#4EFFF3', leftAccent: '#FF8800', rightAccent: '#C084FC', accent: '#FF8800' },
      { id: 'flow-in-flux',      name: 'Flow in Flux 2026',          tags: ['UI/UX', 'Product Design'],                  headlineColor: '#FFF3A3', leftAccent: '#D946EF', rightAccent: '#CCFF00', accent: '#D946EF' },
      { id: 'hallucination-hunt',name: 'The Hallucination Hunt',     tags: ['Debugging', 'Collaboration'],               headlineColor: '#00FF66', leftAccent: '#00FF66', rightAccent: '#00CCFF', accent: '#00FF66' },
      { id: 'tech-mafia',        name: 'Tech Mafia',                 tags: ['Social Deduction', 'Debugging'],            headlineColor: '#FF0080', leftAccent: '#FF0080', rightAccent: '#7B00FF', accent: '#FF0080' },
      { id: 'ares-shunya',       name: 'REDLINE',                tags: ['Autonomous AI', 'ML Strategy'],             headlineColor: '#00FFFF', leftAccent: '#00FFFF', rightAccent: '#0066FF', accent: '#00FFFF' },
      { id: 'space-ideathon',    name: 'Space & Beyond Ideathon',    tags: ['Space Tech', 'Innovation'],                 headlineColor: '#FF6B35', leftAccent: '#FF6B35', rightAccent: '#FFD700', accent: '#FF6B35' }
    ];
  }

  const N = cardData.length;            // 8
  const cyclePx = N * SCROLL_PER_EVENT; // 9,600 px — one full loop

  // Render CYCLES full copies of the 8 events
  const renderData = [];
  for (let c = 0; c < CYCLES; c++) {
    cardData.forEach((ev, i) => renderData.push({ ...ev, _cycle: c, _localIndex: i }));
  }

  // Wrap all cards in #scroll-inner (Airlock scale/opacity target)
  const innerWrapper = document.createElement('div');
  innerWrapper.id = 'scroll-inner';
  scrollContainer.appendChild(innerWrapper);

  renderData.forEach((event, index) => {
    const tags = event.tags ? event.tags.slice(0, 2) : [];
    const { leftHTML, rightHTML } = getEventSpaceVisuals(event, index);
    const isFirst = (index === 0);
    const paddedIndex = String(event._localIndex + 1).padStart(2, '0');
    const headlineColor = event.headlineColor || '#F4F6FF';

    const cardHTML = `
      <div class="event-card ${isFirst ? 'is-active' : ''}" data-index="${index}" data-local="${event._localIndex}">
        <div class="event-card__hemisphere event-card__hemisphere--left"></div>
        <div class="event-card__hemisphere event-card__hemisphere--right"></div>
        <div class="event-card__center">
          <div class="event-card__meta-bar">
            <div class="event-card__counter" style="color: ${headlineColor}; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.25em; opacity: 0.7; margin-bottom: 16px; text-transform: uppercase; border: 1px solid currentColor; padding: 6px 14px; border-radius: 100px; display: inline-block; background: rgba(0,0,0,0.6);">
              EVENT ${paddedIndex} // ${String(N).padStart(2, '0')}
            </div>
            <div class="event-card__full-title" style="color: ${headlineColor};">// ${event.name}</div>
            <div class="event-card__tags" style="font-family: var(--font-ui); font-size: 0.65rem; opacity: 0.8; letter-spacing: 0.1em; text-transform: uppercase;">
              <span class="event-card__tag" style="color: ${headlineColor};">${event.date}</span>
              <span class="tag-separator" style="color: ${headlineColor}; margin: 0 6px;">&bull;</span>
              <span class="event-card__tag" style="color: ${headlineColor};">${event.venue}</span>
              <span class="tag-separator" style="color: ${headlineColor}; margin: 0 6px;">&bull;</span>
              <span class="event-card__tag" style="color: ${headlineColor};">By GDG NSUT</span>
            </div>
          </div>
          <h2 class="event-headline ${isFirst ? 'is-active' : ''}" style="color: ${headlineColor};">
            ${event.name}
          </h2>
          <div class="event-card__actions">
            <button class="event-card__details-btn" data-id="${event.id}" type="button" style="color: ${headlineColor};">
              <span>DETAILS</span>
              <span class="event-card__btn-arrow" style="display: block; margin-top: 4px;">&#8600;</span>
            </button>
          </div>
        </div>
      </div>
    `;
    innerWrapper.insertAdjacentHTML('beforeend', cardHTML);
  });

  const cards = Array.from(scrollContainer.querySelectorAll('.event-card'));
  const totalCards = cards.length;                        // CYCLES × N = 24
  const totalScroll = (totalCards - 1) * SCROLL_PER_EVENT;
  const step = 2.0;

  let currentActiveLocal = -1;

  // Build the master scrubbed GSAP timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scrollContainer,
      pin: true,
      start: 'top top',
      end: `+=${totalScroll}`,
      scrub: true, // Native 1:1 scrub, smoothed by Lenis for buttery responsiveness
      onUpdate: (self) => {
        const rawIndex = self.progress * (totalCards - 1);
        const activeIndex = Math.min(totalCards - 1, Math.max(0, Math.round(rawIndex)));
        const localIndex = activeIndex % N;

        // Optimization: Only touch DOM if the active index changed
        if (self.prevActiveIndex !== activeIndex) {
          self.prevActiveIndex = activeIndex;
          cards.forEach((card, i) => {
            const isActive = (i === activeIndex);
            if (card.classList.contains('is-active') !== isActive) {
              card.classList.toggle('is-active', isActive);
            }
            const headline = card.querySelector('.event-headline');
            if (headline && headline.classList.contains('is-active') !== isActive) {
              headline.classList.toggle('is-active', isActive);
            }
          });
        }

        // Notify app of active event changes for header status tracker & background tinting
        if (localIndex !== currentActiveLocal) {
          currentActiveLocal = localIndex;
          window.dispatchEvent(new CustomEvent('shunya:event-change', {
            detail: { index: localIndex, event: cardData[localIndex] }
          }));
        }
      }
    }
  });

  buildTimelineTransitions(tl, cards, step);

  const st = tl.scrollTrigger;
  let isWrapping = false;

  // ── Helper: perform the seamless instant jump with timeline sync ───────────
  const jump = (delta) => {
    isWrapping = true;
    const currentY = window.scrollY;
    const targetY = currentY + delta;
    const targetProgress = Math.max(0, Math.min(1, (targetY - st.start) / totalScroll));

    // Instantly sync timeline progress to avoid scrub rewind sweeps
    tl.progress(targetProgress);
    
    if (window.lenis) {
      window.lenis.scrollTo(targetY, { immediate: true });
    } else {
      window.scrollTo({ top: targetY, behavior: 'instant' });
    }
    
    st.scroll(targetY);
    st.update(false, true);

    requestAnimationFrame(() => {
      isWrapping = false;
    });
  };

  // ── Attach loop listeners AFTER initial position is established ───────────
  const attachLoopListeners = () => {
    window.addEventListener('scroll', () => {
      if (isWrapping || !st) return;
      const relY = window.scrollY - st.start;

      // Scrolled past all 6 events of middle cycle -> loop back by one cycle
      if (relY >= 2 * cyclePx) {
        jump(-cyclePx);
      }
      // Scrolled backward before event 1 -> loop forward by one cycle
      else if (relY < cyclePx) {
        jump(+cyclePx);
      }
    }, { passive: true });

    window.addEventListener('wheel', (e) => {
      if (isWrapping || !st) return;
      const relY = window.scrollY - st.start;
      if (e.deltaY < 0 && relY < cyclePx) {
        jump(+cyclePx);
      }
    }, { passive: true });
  };

  // ── Position user at START of cycle 1 on load ─────────────────────────────
  let hasInitialized = false;

  const initPosition = () => {
    if (hasInitialized) return;
    hasInitialized = true;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const startY = (st.start || 0) + cyclePx;
    const initialProgress = totalScroll > 0 ? (startY - (st.start || 0)) / totalScroll : 0;
    
    tl.progress(initialProgress);
    window.scrollTo({ top: startY, behavior: 'instant' });
    st.scroll(startY);
    st.update(false, true);

    const activeIndex = Math.min(totalCards - 1, Math.max(0, Math.round(initialProgress * (totalCards - 1))));
    const localIndex = activeIndex % N;
    cards.forEach((card, i) => {
      const isActive = (i === activeIndex);
      card.classList.toggle('is-active', isActive);
      const headline = card.querySelector('.event-headline');
      if (headline) headline.classList.toggle('is-active', isActive);
    });

    window.dispatchEvent(new CustomEvent('shunya:event-change', {
      detail: { index: localIndex, event: cardData[localIndex] }
    }));

    requestAnimationFrame(attachLoopListeners);
  };

  // ── Listen for direct navigation from Dynamic Island ───────────────────────
  window.addEventListener('shunya:navigate-to-event', (e) => {
    if (!e.detail || typeof e.detail.index !== 'number' || !st) return;
    const targetLocal = Math.max(0, Math.min(N - 1, e.detail.index));
    const targetGlobalIndex = N + targetLocal; // Middle cycle (cycle 1)
    const targetY = (st.start || 0) + targetGlobalIndex * SCROLL_PER_EVENT;

    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 780;   // slightly longer for a more cinematic journey
    const startTime = performance.now();

    function stepScroll(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Quintic ease-out: 1 - (1-t)^5 — ultra-smooth deceleration to rest
      const ease = 1 - Math.pow(1 - t, 5);
      window.scrollTo(0, startY + distance * ease);
      if (t < 1) {
        requestAnimationFrame(stepScroll);
      }
    }
    requestAnimationFrame(stepScroll);
  });

  ScrollTrigger.addEventListener('refresh', initPosition);
  ScrollTrigger.refresh();
  initPosition();

  console.log(`[ScrollController] Infinite loop ready: ${N} events × ${CYCLES} cycles = ${totalCards} cards.`);
}
