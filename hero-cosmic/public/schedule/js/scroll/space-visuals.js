/**
 * Space Visuals Generator Module — Cinematic 3D Celestial Architectures & Holographic CAD Blueprints
 * 
 * Spec:
 * Left Hemisphere:  3D Volumetric Celestial Phenomena (CSS 3D Engine)
 * Right Hemisphere: Holographic CAD Schematics & Tactical Telemetry (CSS 3D Engine)
 */

export function getEventSpaceVisuals(event, index) {
  const localIdx = event._localIndex !== undefined ? event._localIndex : index;
  const paddedIndex = String(localIdx + 1).padStart(2, '0');
  const leftCosmic = getLeftCosmicHTML(event.id, event.biomeColor || event.leftAccent, paddedIndex);
  const rightHUD = getRightHUDHTML(event, paddedIndex);
  const telemetry = getTelemetryData(event.id, paddedIndex);

  const leftHTML = `
    <!-- Left Hemisphere: 3D Volumetric Celestial Body with Dynamic Coronal Energy -->
    <div class="event-card__half event-card__half--left event-card__hemisphere event-card__hemisphere--left" data-challenge-id="${event.id}">
      <div class="space-scene space-scene--left">
        ${leftCosmic}
      </div>
      <div class="space-sector-tag">
        <div class="space-sector-tag__badge" style="color: ${event.leftAccent}; border-color: ${event.leftAccent}44;">
          <span class="space-sector-tag__dot" style="background: ${event.leftAccent}; box-shadow: 0 0 10px ${event.leftAccent};"></span>
          <span>${telemetry.sectorBadge}</span>
        </div>
        <span class="space-sector-tag__coord">${telemetry.sectorCoord}</span>
      </div>
    </div>
  `;

  const rightHTML = `
    <!-- Right Hemisphere: Holographic CAD Telemetry HUD & Hologram Deck -->
    <div class="event-card__half event-card__half--right event-card__hemisphere event-card__hemisphere--right" data-challenge-id="${event.id}">
      <div class="space-scene space-scene--right">
        ${rightHUD}
      </div>
      <div class="space-hud-status">
        <span class="space-hud-status__indicator" style="background: ${event.rightAccent}; box-shadow: 0 0 16px ${event.rightAccent};"></span>
        <span class="space-hud-status__text" style="color: ${event.rightAccent};">${telemetry.statusBadge}</span>
      </div>
    </div>
  `;

  return { leftHTML, rightHTML };
}

export function getDualHemisphereHTML(event, index) {
  const { leftHTML, rightHTML } = getEventSpaceVisuals(event, index);
  return `${leftHTML}\n${rightHTML}`;
}

function getTelemetryData(id, paddedIndex) {
  switch (id) {
    case 'zero-day':
      return {
        sectorBadge: 'SECTOR // 01 — NEURAL CANOPY',
        sectorCoord: `BIOME_INDEX: 99.4% &bull; CHLOROPHYLL_VOID &bull; 0x9F4C`,
        statusBadge: 'ECO_VAULT: ENCRYPTED // 4096-BIT'
      };
    case 'autopilot':
      return {
        sectorBadge: 'SECTOR // 02 — CERULEAN ICE GIANT',
        sectorCoord: `ORBITAL_VELOCITY: 32.4 KM/S &bull; RING_SYSTEM &bull; PROBE_02`,
        statusBadge: 'AGENT_SWARM: AUTONOMOUS // ACTIVE'
      };
    case 'devlympics':
      return {
        sectorBadge: 'SECTOR // 03 — MYCELIAL CORE',
        sectorCoord: `HYPHAE_DENSITY: 99.8% &bull; SPORE_DISPERSAL &bull; T-24H`,
        statusBadge: 'GROWTH_RADAR: SPRINT_CLOCK // LIVE'
      };
    case 'flow-in-flux':
      return {
        sectorBadge: 'SECTOR // 04 — GRAVITATIONAL SINGULARITY',
        sectorCoord: `LENSING: &infin; &bull; PHOTON_TORUS &bull; &phi;=1.618`,
        statusBadge: 'DESIGN_MATRIX: GOLDEN_SECTION // FLUID'
      };
    case 'hallucination-hunt':
      return {
        sectorBadge: 'SECTOR // 05 — AURORA QUANTUM RIFT',
        sectorCoord: `COHERENCE: 42.1% &bull; EMERALD_SHARDS &bull; DUAL_WAVE`,
        statusBadge: 'TRUTH_SCANNER: ENGAGED // FILTER_V4'
      };
    case 'tech-mafia':
      return {
        sectorBadge: 'SECTOR // 06 — ADVERSARIAL NODE',
        sectorCoord: `TRUST_INDEX: 0% &bull; SABOTAGE_ACTIVE &bull; ROLE_HIDDEN`,
        statusBadge: 'INFILTRATION: LIVE // DECEPTION_MODE'
      };
    case 'ares-shunya':
      return {
        sectorBadge: 'SECTOR // 07 — AUTONOMOUS COMBAT ARENA',
        sectorCoord: `POLICY_NETWORK: ACTIVE &bull; TURN_DEPTH: 6 &bull; AI_VS_AI`,
        statusBadge: 'BATTLE_ENGINE: LIVE // RL_AGENT_READY'
      };
    case 'space-ideathon':
      return {
        sectorBadge: 'SECTOR // 08 — ORBITAL LAUNCH PLATFORM',
        sectorCoord: `APOGEE: 400KM &bull; MISSION_PHASE: IDEATION &bull; T-0`,
        statusBadge: 'LAUNCH_PROTOCOL: READY // KALPANA_MISSION'
      };
    default:
      return {
        sectorBadge: 'SECTOR // ?? — CLASSIFIED ZONE',
        sectorCoord: `COORDINATES: REDACTED &bull; CLEARANCE: LEVEL_5`,
        statusBadge: 'STATUS: CLASSIFIED // ACCESS_DENIED'
      };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LEFT HEMISPHERE: 3D Volumetric Celestial Phenomena (CSS 3D Engine)
 * ─────────────────────────────────────────────────────────────────────────────
 */
function getLeftCosmicHTML(id, accent, paddedIndex) {
  let debrisHTML = '';
  // Generate a procedural 3D asteroid/spore cloud
  for(let i=0; i<24; i++) {
    const rx = Math.random() * 360;
    const ry = Math.random() * 360;
    const rz = Math.random() * 360;
    const dist = 80 + Math.random() * 120;
    const size = 2 + Math.random() * 5;
    const speed = 15 + Math.random() * 30;
    const delay = -Math.random() * 20;
    
    debrisHTML += `<div class="asteroid-debris" style="width:${size}px; height:${size}px; transform: rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) translate3d(0, 0, ${dist}px); animation: rotate3d-y ${speed}s linear infinite ${delay}s;"></div>`;
  }

  return `
    <div class="scene-3d" style="--event-accent: ${accent};">
      <div class="preserve-3d" style="animation: rotate3d-y 40s linear infinite;">
        <!-- Core Planet / Star / Singularity -->
        <div class="sphere-core-3d" style="width: 140px; height: 140px; animation: rotate3d-x 20s linear infinite reverse;"></div>
        
        <!-- Inner Asteroid Belt -->
        <div class="ring-3d" style="width: 220px; height: 220px; animation: orbit-slow 24s linear infinite;">
          <div class="orbit-node"></div>
          <div class="orbit-node" style="top: auto; bottom: -4px; animation-delay: -12s;"></div>
        </div>
        
        <!-- Outer Energy Field / Rings -->
        <div class="ring-3d" style="width: 320px; height: 320px; animation: orbit-fast-reverse 18s linear infinite; border-style: dashed; opacity: 0.4;">
          <div class="orbit-node" style="width: 6px; height: 6px; background: ${accent}; box-shadow: 0 0 16px ${accent};"></div>
        </div>
        
        <!-- Volumetric Debris Cloud (Spores / Asteroids) -->
        <div class="preserve-3d" style="position: absolute; top: 50%; left: 50%; width: 0; height: 0; animation: rotate3d-z 60s linear infinite;">
          ${debrisHTML}
        </div>
      </div>
    </div>
  `;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RIGHT HEMISPHERE: Precision Holographic CAD Telemetry Blueprints (CSS 3D)
 * ─────────────────────────────────────────────────────────────────────────────
 */
function getRightHUDHTML(event, paddedIndex) {
  const accent = event.techColor || event.rightAccent || '#ffffff';
  const tel = event.telemetry || { observed: '', analog: '', coexistence: '' };
  
  let structuralNodes = '';
  // Generate an intersecting holographic CAD wireframe
  for(let i=0; i<6; i++) {
    const rx = i * 30;
    structuralNodes += `<div class="ring-3d" style="width: 180px; height: 180px; border-style: dotted; opacity: 0.35; transform: translate(-50%, -50%) rotateY(${rx}deg);"></div>`;
  }

  return `
    <div class="hud-schematic-assembly">
      <div class="scene-3d" style="--event-accent: ${accent};">
        <div class="preserve-3d" style="animation: rotate3d-x 35s linear infinite;">
          <!-- Holographic Data Wireframe -->
          ${structuralNodes}
          
          <!-- Central Processing Core -->
          <div class="sphere-core-3d" style="width: 50px; height: 50px; opacity: 0.9; background: radial-gradient(circle, #fff, transparent 60%);"></div>
          
          <!-- Active Telemetry Orbit -->
          <div class="ring-3d" style="width: 240px; height: 240px; animation: rotate3d-y 14s linear infinite; border-width: 2px; opacity: 0.8;">
            <div class="orbit-node" style="width: 4px; height: 16px; border-radius: 2px;"></div>
          </div>
          
          <!-- Outer Defensive Grid -->
          <div class="ring-3d" style="width: 300px; height: 300px; animation: rotate3d-z 22s linear infinite reverse; border-style: dashed; opacity: 0.5;"></div>
        </div>
      </div>
      
      <!-- Organic Biological Telemetry Callout -->
      <div class="hud-data-callout" style="border-color: ${accent}66; box-shadow: 0 8px 20px rgba(0,0,0,0.7), 0 0 15px ${accent}22; border-radius: 999px; padding: 20px 32px;">
        <div class="hud-data-callout__title" style="color: ${accent}; border-bottom: 1px solid ${accent}44;">
          <span class="hud-data-callout__status-dot" style="background: ${accent}; box-shadow: 0 0 10px ${accent};"></span>
          <span>TELEMETRY_STREAM // ${paddedIndex}</span>
        </div>
        <div class="hud-data-callout__row"><span>OBSERVED:</span> <span>${tel.observed || 'SYSTEM NOISE'}</span></div>
        <div class="hud-data-callout__row"><span>ANALOG:</span> <span style="color: #ffffff; font-weight: 700;">${tel.analog || 'SYNTHETIC PATTERN'}</span></div>
        <div class="hud-data-callout__row"><span>COEXISTENCE:</span> <span style="color: ${accent}; font-weight: 700;">${tel.coexistence || 'SYNERGY ACTIVE'}</span></div>
      </div>
    </div>
  `;
}
