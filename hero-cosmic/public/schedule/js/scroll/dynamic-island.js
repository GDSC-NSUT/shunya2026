/**
 * Liquid Glass Dynamic Island — Premium Motion Design
 *
 * STATES: COMPACT → OPENING → OPEN → CLOSING → COMPACT
 *
 * Rules:
 * - Island owns all timing; scroll only fires an event, never drives the animation
 * - Compact = only active day visible, pill is tight around it
 * - Open = all days visible, user can pick freely
 * - Scroll day-change → open → glider slides → auto-close after fixed delay
 * - Hover → open → user can pick → close on leave
 */

const DAYS_DATA = [
  { day: 1, title: 'DAY 01', accent: '#FF003C', eventIndices: [0, 1, 2, 3] },
  { day: 2, title: 'DAY 02', accent: '#0066FF', eventIndices: [4, 5, 6] },
  { day: 3, title: 'DAY 03', accent: '#00FFaa', eventIndices: [7] }
];

export function init() {
  let root = document.getElementById('dynamic-island-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'dynamic-island-root';
    document.body.appendChild(root);
  }

  root.innerHTML = `
    <nav class="dynamic-island" id="dynamic-island" aria-label="Day Navigation">
      <div class="dynamic-island__shadow" id="island-shadow"></div>
      <div class="dynamic-island__material"></div>
      <div class="dynamic-island__highlight" id="island-highlight"></div>
      <div class="dynamic-island__rim"></div>
      <div class="dynamic-island__content-layer">
        <div class="dynamic-island__btn-row" id="island-btn-row">
          <div class="dynamic-island__glider" id="island-glider"></div>
          ${DAYS_DATA.map((d, i) => `
            <button
              class="dynamic-island__day-btn${i === 0 ? ' is-active' : ''}"
              data-day="${d.day}"
              data-nav-event="${d.eventIndices[0]}"
              type="button"
              aria-label="${d.title}"
            ><span class="dynamic-island__day-label">${d.title}</span></button>
          `).join('')}
        </div>
      </div>
    </nav>
  `;

  const island    = document.getElementById('dynamic-island');
  const shadow    = document.getElementById('island-shadow');
  const highlight = document.getElementById('island-highlight');
  const btnRow    = document.getElementById('island-btn-row');
  const glider    = document.getElementById('island-glider');
  const dayBtns   = Array.from(island.querySelectorAll('.dynamic-island__day-btn'));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover: hover)').matches;

  // ── STATE ──────────────────────────────────────────────────────────────────
  let state         = 'COMPACT';
  let currentDay    = 1;
  let hoverActive   = false;
  let autoCloseTimer = null;

  // Cached geometry (measured after DOM settles)
  let openW    = 0;
  let pillH    = 0;
  let compactW = 0;
  let btnWidths = [];

  // ── TIMING (fast but premium) ──────────────────────────────────────────────
  const T = {
    open:           0.55,
    close:          0.5,
    easeOpen:       'expo.out',
    easeClose:      'expo.inOut',
    glide:          0.55,
    glideEase:      'elastic.out(1, 0.7)',
    labelIn:        0.25,
    labelOut:       0.15,
    autoCloseDelay: 1200,  // ms before auto-close after scroll event
    hoverCloseGrace: 200,  // ms grace before closing on mouse-leave
  };

  // ── GEOMETRY HELPERS ────────────────────────────────────────────────────────
  function measureGeometry() {
    // All buttons must be fully visible for measurement
    dayBtns.forEach(b => {
      b.style.opacity = '1';
      b.style.overflow = 'visible';
      b.style.maxWidth = 'none';
      b.style.paddingLeft = '';
      b.style.paddingRight = '';
    });
    island.style.width  = 'auto';
    island.style.height = 'auto';

    const iRect = island.getBoundingClientRect();
    openW  = iRect.width;
    pillH  = iRect.height;

    dayBtns.forEach((b, i) => {
      btnWidths[i] = b.getBoundingClientRect().width;
    });

    const activeIndex = currentDay - 1;
    const aBtnW = btnWidths[activeIndex] || 140;
    compactW = aBtnW + 20;
  }

  /**
   * Position the glider to sit exactly over `dayNum`'s button.
   * We use btnRow as the offset parent since glider is inside it (z-index child).
   */
  function positionGlider(dayNum, immediate = false) {
    const btn = island.querySelector(`.dynamic-island__day-btn[data-day="${dayNum}"]`);
    if (!btn || !glider) return;

    const rowRect = btnRow.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    if (rowRect.width === 0) return;

    const x = btnRect.left - rowRect.left;
    const w = btnRect.width;

    if (immediate || prefersReducedMotion) {
      gsap.set(glider, { x, width: w });
    } else {
      gsap.to(glider, { x, width: w, duration: T.glide, ease: T.glideEase });
    }
  }

  // ── ACCENT COLOR ────────────────────────────────────────────────────────────
  function setAccent(dayNum) {
    const d = DAYS_DATA[dayNum - 1];
    if (!d) return;
    island.style.setProperty('--day-accent', d.accent);
  }

  // ── OPEN ───────────────────────────────────────────────────────────────────
  function open(reason) {
    if (state === 'OPEN' || state === 'OPENING') return;
    state = 'OPENING';
    clearTimeout(autoCloseTimer);

    // Reveal all buttons
    dayBtns.forEach(btn => {
      gsap.to(btn, {
        opacity: 1,
        maxWidth: 300,
        paddingLeft: 24,
        paddingRight: 24,
        overflow: 'visible',
        duration: T.labelIn,
        ease: 'power2.out',
        delay: 0.05,
      });
    });

    // Expand island pill
    gsap.to(island, {
      width:    openW,
      height:   pillH,
      duration: T.open,
      ease:     T.easeOpen,
      onComplete() {
        state = 'OPEN';
        positionGlider(currentDay, true);
      }
    });

    gsap.to(shadow, {
      opacity:  0.8,
      duration: T.open,
      ease:     'power3.out'
    });

    gsap.to(glider, {
      opacity: 1,
      duration: T.open,
      ease: 'power2.out'
    });

    if (reason === 'scroll') {
      autoCloseTimer = setTimeout(() => {
        if (!hasHover || !hoverActive) close();
      }, T.autoCloseDelay);
    }
  }

  // ── CLOSE ──────────────────────────────────────────────────────────────────
  function close() {
    if (state === 'COMPACT' || state === 'CLOSING') return;
    state = 'CLOSING';
    clearTimeout(autoCloseTimer);

    // Get pre-calculated compact width for the active button
    const activeIndex = currentDay - 1;
    const aBtnW = btnWidths[activeIndex] || 140;
    compactW = aBtnW + 20;

    // Fade and collapse non-active buttons
    dayBtns.forEach(btn => {
      const active = parseInt(btn.dataset.day, 10) === currentDay;
      if (!active) {
        gsap.to(btn, {
          opacity:  0,
          maxWidth: 0,
          paddingLeft: 0,
          paddingRight: 0,
          overflow: 'hidden',
          duration: T.labelOut,
          ease:     'power2.in',
        });
      }
    });

    // Shrink island
    gsap.to(island, {
      width:    compactW,
      height:   pillH,
      delay:    0.05,
      duration: T.close,
      ease:     T.easeClose,
      onComplete() {
        state = 'COMPACT';
        positionGlider(currentDay, true);
      }
    });

    gsap.to(shadow, {
      opacity:  0.55,
      duration: T.close,
      ease:     'power3.out'
    });

    gsap.to(glider, {
      opacity: 0,
      duration: T.close * 0.8,
      ease: 'power2.in'
    });
  }

  // ── SET ACTIVE DAY ─────────────────────────────────────────────────────────
  function setActiveDay(dayNum) {
    const changed = dayNum !== currentDay;
    currentDay = dayNum;

    dayBtns.forEach(btn => {
      btn.classList.toggle('is-active', parseInt(btn.dataset.day, 10) === dayNum);
    });
    setAccent(dayNum);

    if (!changed) return;

    if (state === 'COMPACT') {
      open('scroll');
      // Glider slides once island is partially open
      setTimeout(() => positionGlider(dayNum), 180);
    } else if (state === 'OPEN') {
      positionGlider(dayNum);
      clearTimeout(autoCloseTimer);
      autoCloseTimer = setTimeout(() => {
        if (!hasHover || !hoverActive) close();
      }, T.autoCloseDelay);
    }
  }

  // ── HOVER ──────────────────────────────────────────────────────────────────
  island.addEventListener('mouseenter', () => {
    hoverActive = true;
    clearTimeout(autoCloseTimer);
    if (state === 'COMPACT') open('hover');
  });

  island.addEventListener('mouseleave', () => {
    hoverActive = false;
    if (state === 'OPEN' || state === 'OPENING') {
      autoCloseTimer = setTimeout(() => close(), T.hoverCloseGrace);
    }
  });

  // ── DAY BUTTON CLICKS ───────────────────────────────────────────────────────
  dayBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const clickedDay = parseInt(btn.dataset.day, 10);

      dayBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentDay = clickedDay;
      setAccent(clickedDay);
      positionGlider(clickedDay);

      window.dispatchEvent(new CustomEvent('shunya:navigate-to-event', {
        detail: { index: parseInt(btn.dataset.navEvent, 10) }
      }));

      clearTimeout(autoCloseTimer);
      autoCloseTimer = setTimeout(() => {
        if (!hasHover || !hoverActive) close();
      }, 500);
    });
  });

  // ── SCROLL EVENT ────────────────────────────────────────────────────────────
    window.addEventListener('shunya:event-change', e => {
    if (!e.detail || typeof e.detail.index !== 'number') return;
    let newDay = 1;
    for (const d of DAYS_DATA) {
      if (d.eventIndices.includes(e.detail.index)) {
        newDay = d.day;
        break;
      }
    }
    setActiveDay(newDay);
  });

  // ── INIT ───────────────────────────────────────────────────────────────────
  setTimeout(() => {
    measureGeometry();

    // Start compact: hide non-active day buttons
    dayBtns.forEach((btn, i) => {
      if (i !== 0) {
        gsap.set(btn, { opacity: 0, maxWidth: 0, paddingLeft: 0, paddingRight: 0, overflow: 'hidden' });
      }
    });

    gsap.set(island, { width: compactW, height: pillH });
    gsap.set(glider, { opacity: 0 });
    setAccent(currentDay);
    positionGlider(currentDay, true);

    console.log('[DynamicIsland] compactW:', compactW, 'openW:', openW, 'pillH:', pillH);
  }, 150);
}
