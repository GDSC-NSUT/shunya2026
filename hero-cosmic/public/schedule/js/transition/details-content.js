/**
 * Details Content Module — Luxury Space Briefing View
 * Renders detail view template: headline, description, Space Mono metadata list, close control.
 */

export function renderDetails(event) {
  const root = document.getElementById('details-root');
  if (!root) {
    console.error('[DetailsContent] #details-root container not found in DOM.');
    return null;
  }

  const headlineColor = event.headlineColor || event.accent || 'var(--star-white)';
  const primaryAccent = event.accent || headlineColor;
  const format = event.format || 'Mission Critical Task';
  const teamSize = event.teamSize || null;
  const duration = event.duration || null;
  const prize = event.prize || null;
  const date = event.date || 'TBD';
  const venue = event.venue || 'TBD';
  const description = event.description || 'Deep-space challenge briefing and tactical evaluation criteria are classified until mission briefing.';
  const tags = event.tags ? event.tags.slice(0, 3) : ['AI Challenge', 'Special Ops'];

  root.innerHTML = `
    <div class="details-seam-sweep" id="details-seam" style="--event-accent: ${headlineColor};"></div>
    <article class="details-view" id="details-view-article" style="--event-accent: ${headlineColor};">
      <div class="details-view__backdrop-glow" aria-hidden="true" style="background: radial-gradient(circle at center, ${primaryAccent}18 0%, transparent 70%);"></div>
      
      <div class="details-view__container">
        <header class="details-view__header">
          <div class="details-view__tags">
            <span class="details-view__badge" style="color: ${headlineColor}; border-color: ${headlineColor}66;">MISSION BRIEFING</span>
            ${tags.map(t => `<span class="details-view__tag">${t}</span>`).join('')}
          </div>
          <button class="details-view__close" id="details-close-btn" type="button" aria-label="Close details">
            <span class="details-view__close-text">CLOSE [ESC]</span>
            <span class="details-view__close-icon">&times;</span>
          </button>
        </header>

        <div class="details-view__hero">
          <h2 class="details-view__title" style="color: ${headlineColor}; text-shadow: 0 0 50px ${headlineColor}44;">
            ${event.name}
          </h2>
          <p class="details-view__desc">${description}</p>
        </div>

        <div class="details-view__meta-grid">
          <div class="details-view__meta-card">
            <span class="details-view__meta-label">DATE</span>
            <span class="details-view__meta-value">${date}</span>
          </div>
          <div class="details-view__meta-card">
            <span class="details-view__meta-label">VENUE</span>
            <span class="details-view__meta-value">${venue}</span>
          </div>
          <div class="details-view__meta-card">
            <span class="details-view__meta-label">FORMAT</span>
            <span class="details-view__meta-value">${format}</span>
          </div>
          ${teamSize ? `
          <div class="details-view__meta-card">
            <span class="details-view__meta-label">TEAM SIZE</span>
            <span class="details-view__meta-value">${teamSize}</span>
          </div>
          ` : ''}
          ${duration ? `
          <div class="details-view__meta-card">
            <span class="details-view__meta-label">DURATION</span>
            <span class="details-view__meta-value">${duration}</span>
          </div>
          ` : ''}
          ${prize ? `
          <div class="details-view__meta-card">
            <span class="details-view__meta-label">REWARDS & PRIZE</span>
            <span class="details-view__meta-value" style="color: ${headlineColor}; font-weight: 700;">${prize}</span>
          </div>
          ` : ''}
        </div>

        <div class="details-view__footer">
          <span class="details-view__footer-note">SECURITY TOKEN: SHUNYA-${(event.id || 'VOID').toUpperCase()}-2026</span>
          <div class="details-view__action-wrap" style="--btn-accent: ${headlineColor};">
            <button class="details-view__register-btn ${event.registerUrl ? '' : 'details-view__register-btn--empty'}" type="button" ${event.registerUrl ? `onclick="window.open('${event.registerUrl}', '_blank')"` : ""}>
              <span>${event.registerUrl ? 'REGISTER FOR BATTLE' : 'REGISTER'}</span>
              ${event.registerUrl ? '<span>&rarr;</span>' : ''}
            </button>
            <p class="details-view__deadline">
              Registration Deadline : <span class="details-view__deadline-val">${event.registrationDeadline || 'TBA'}</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  `;

  return {
    view: root.querySelector('.details-view'),
    seam: root.querySelector('.details-seam-sweep'),
    closeBtn: root.querySelector('#details-close-btn')
  };
}

export function clearDetails() {
  const root = document.getElementById('details-root');
  if (root) {
    root.innerHTML = '';
  }
}
