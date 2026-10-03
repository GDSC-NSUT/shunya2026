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
  { day: 1, title: 'DAY 01', accent: '#FF003C', eventIndices: [0] },
  { day: 2, title: 'DAY 02', accent: '#0066FF', eventIndices: [1, 2, 3, 4, 5, 6] },
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
    const T = {
    open:           0.55,
    close:          0.5,
    easeOpen:       'expo.out',
    easeClose:      'expo.inOut',
    glide:          0.38,
    glideEase:      'power3.out',
    labelIn:        0.25,
    labelOut:       0.15,
    autoCloseDelay: 1200,
    hoverCloseGrace: 200,
  };

  let currentDay = 1;
    let isHovered = false;
    let openW = 0;
    let pillH = 0;
    let btnWidths = [];
    let islandTween = null;
    let gliderTween = null;
    let isInitialized = false;

    // MEASURE GEOMETRY ONCE
    function measureGeometry() {
      dayBtns.forEach(b => {
        b.style.opacity = "1";
        b.style.overflow = "visible";
        b.style.maxWidth = "none";
        b.style.paddingLeft = "";
        b.style.paddingRight = "";
      });
      island.style.width = "auto";
      island.style.height = "auto";

      const iRect = island.getBoundingClientRect();
      openW = iRect.width;
      pillH = iRect.height;

      dayBtns.forEach((b, i) => {
        btnWidths[i] = b.getBoundingClientRect().width;
      });
    }

    function positionGlider(immediate = false) {
      if (!glider) return;
      const btn = island.querySelector(`.dynamic-island__day-btn[data-day="${currentDay}"]`);
      if (!btn) return;
      
      const rowRect = btnRow.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      if (rowRect.width === 0) return;

      const x = btnRect.left - rowRect.left;
      const w = btnRect.width;

      if (gliderTween) gliderTween.kill();

      if (immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(glider, { x, width: w, overwrite: "auto" });
      } else {
        gliderTween = gsap.to(glider, { x, width: w, duration: T.glide, ease: T.glideEase, overwrite: "auto" });
      }
    }

    function updateIsland() {
      if (!isInitialized) return;
      
      const isExpanded = isHovered;
      const targetW = isExpanded ? openW : (btnWidths[currentDay - 1] || 140) + 20;

      // Update classes
      dayBtns.forEach(btn => {
        btn.classList.toggle("is-active", parseInt(btn.dataset.day, 10) === currentDay);
      });
      
      // Update Accent
      const d = DAYS_DATA[currentDay - 1];
      if (d) island.style.setProperty("--day-accent", d.accent);

      // Kill any previous tween on island to prevent fighting
      if (islandTween) islandTween.kill();

      // Animate Buttons
      dayBtns.forEach(btn => {
        const active = parseInt(btn.dataset.day, 10) === currentDay;
        const visible = isExpanded || active;
        
        gsap.to(btn, {
          opacity: visible ? 1 : 0,
          maxWidth: visible ? 300 : 0,
          paddingLeft: visible ? 24 : 0,
          paddingRight: visible ? 24 : 0,
          overflow: visible ? "visible" : "hidden",
          duration: visible ? T.labelIn : T.labelOut,
          ease: visible ? "power2.out" : "power2.in"
        });
      });

      // Animate Glider Visibility (fast fade out when closing so it never lingers)
      gsap.to(glider, {
        opacity: isExpanded ? 1 : 0,
        duration: isExpanded ? T.open : 0.15,
        ease: isExpanded ? "power2.out" : "power2.in",
        overwrite: "auto"
      });

      // Animate Shadow
      gsap.to(shadow, {
        opacity: isExpanded ? 0.8 : 0.55,
        duration: isExpanded ? T.open : T.close,
        ease: "power3.out"
      });

      // Animate Island Shell
      const isWidthChanging = Math.abs(island.getBoundingClientRect().width - targetW) > 2;
      
      if (isWidthChanging) {
        islandTween = gsap.to(island, {
          width: targetW,
          height: pillH,
          duration: isExpanded ? T.open : T.close,
          ease: isExpanded ? T.easeOpen : T.easeClose,
          onUpdate: () => positionGlider(true),
          onComplete: () => positionGlider(true)
        });
      } else {
        // Just slide the glider smoothly if the island wrapper isn't changing
        positionGlider(false);
      }
    }

    // HOVER EVENTS (Desktop)
    let hoverCloseTimer = null;
    island.addEventListener("mouseenter", () => {
      isHovered = true;
      clearTimeout(hoverCloseTimer);
      updateIsland();
    });

    island.addEventListener("mouseleave", () => {
      hoverCloseTimer = setTimeout(() => {
        isHovered = false;
        updateIsland();
      }, T.hoverCloseGrace);
    });

    // TAP / CLICK ON ISLAND (Tap to open on mobile when compact)
    island.addEventListener("click", (e) => {
      if (!isHovered) {
        isHovered = true;
        clearTimeout(hoverCloseTimer);
        updateIsland();
        // Auto-close after 4s on mobile if no day is selected
        hoverCloseTimer = setTimeout(() => {
          isHovered = false;
          updateIsland();
        }, 4000);
      }
    });

    // DAY BUTTON CLICK / TAP
    dayBtns.forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const clickedDay = parseInt(btn.dataset.day, 10);
        
        // If island was compact, first tap expands it
        if (!isHovered) {
          isHovered = true;
          clearTimeout(hoverCloseTimer);
          updateIsland();
          hoverCloseTimer = setTimeout(() => {
            isHovered = false;
            updateIsland();
          }, 4000);
          return;
        }

        // If island is open, tapping a day selects it
        if (currentDay !== clickedDay) {
          currentDay = clickedDay;
          updateIsland();
          
          window.dispatchEvent(new CustomEvent("shunya:navigate-to-event", {
            detail: { index: parseInt(btn.dataset.navEvent, 10) }
          }));
        }

        // Close after picking (or tapping active day)
        clearTimeout(hoverCloseTimer);
        hoverCloseTimer = setTimeout(() => {
          isHovered = false;
          updateIsland();
        }, 450);
      });
    });

    // OUTSIDE TAP / CLICK (Close if tapping outside while open)
    document.addEventListener("click", (e) => {
      if (isHovered && !island.contains(e.target)) {
        isHovered = false;
        clearTimeout(hoverCloseTimer);
        updateIsland();
      }
    });

    // RESIZE EVENT (Recalculate mobile/desktop geometry dynamically)
    window.addEventListener("resize", () => {
      measureGeometry();
      updateIsland();
    });

    // SCROLL EVENT (DEBOUNCED)
    let scrollDebounceTimer = null;
    window.addEventListener("shunya:event-change", e => {
      if (!e.detail || typeof e.detail.index !== "number") return;
      
      clearTimeout(scrollDebounceTimer);
      scrollDebounceTimer = setTimeout(() => {
        let newDay = 1;
        for (const d of DAYS_DATA) {
          if (d.eventIndices.includes(e.detail.index)) {
            newDay = d.day;
            break;
          }
        }
        
        if (newDay !== currentDay) {
          currentDay = newDay;
          // Temporarily open to show transition, then auto-close
          isHovered = true;
          updateIsland();
          
          clearTimeout(hoverCloseTimer);
          hoverCloseTimer = setTimeout(() => {
            isHovered = false;
            updateIsland();
          }, T.autoCloseDelay || 1200);
        }
      }, 150); // Strong debounce to skip rapid scroll intermediates
    });

    // INIT
    setTimeout(() => {
      measureGeometry();
      isInitialized = true;
      updateIsland();
      gsap.set(island, { opacity: 1, y: 0 }); // ensure visible
    }, 150);
}
