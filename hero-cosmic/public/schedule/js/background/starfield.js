/**
 * Starfield Module — Stars & Asteroids with Mouse Parallax
 * LAYER: BACKGROUND
 *
 * Canvas sits at z-index:0, fills its own void-black background.
 * All UI containers above it are transparent/semi-transparent.
 */

let canvas, ctx;
let width, height;
let lastTime = 0;

// Mouse tracking
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

// ── Layer config ──────────────────────────────────────────────────────────
const LAYERS = [
  { count: 300, sizeMin: 0.3, sizeMax: 1.0,  alpha: 0.55, px: 12 },  // far
  { count: 160, sizeMin: 0.6, sizeMax: 1.6,  alpha: 0.78, px: 32 },  // mid
  { count:  70, sizeMin: 1.2, sizeMax: 3.0,  alpha: 0.95, px: 65 },  // near (big!)
];

let stars     = [];
let asteroids = [];

// ── Build data ─────────────────────────────────────────────────────────────
function buildStars() {
  stars = [];
  const isMobile = window.innerWidth < 768;
  const countMultiplier = isMobile ? 0.35 : 1.0; // Huge reduction for mobile

  LAYERS.forEach((cfg, li) => {
    const count = Math.floor(cfg.count * countMultiplier);
    for (let i = 0; i < count; i++) {
      stars.push({
        li,
        x:  Math.random() * width,
        y:  Math.random() * height,
        r:  Math.random() * (cfg.sizeMax - cfg.sizeMin) + cfg.sizeMin,
        a:  Math.random() * 0.4 + cfg.alpha * 0.6,
        ph: Math.random() * Math.PI * 2,
        tw: Math.random() * 0.7 + 0.2,
        dy: -(Math.random() * 0.06 + 0.01),  // upward drift speed
      });
    }
  });
}

function buildAsteroids() {
  asteroids = [];
  for (let i = 0; i < 20; i++) {
    asteroids.push(makeAsteroid());
  }
}

function makeAsteroid(yStart) {
  const sides = Math.floor(Math.random() * 4) + 5;
  const baseR = Math.random() * 22 + 8;
  const pts   = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    pts.push([Math.cos(a) * baseR * (0.6 + Math.random() * 0.7),
              Math.sin(a) * baseR * (0.6 + Math.random() * 0.7)]);
  }
  return {
    x:  Math.random() * width,
    y:  yStart !== undefined ? yStart : Math.random() * height,
    pts,
    vx: (Math.random() - 0.5) * 0.22,
    vy: -(Math.random() * 0.13 + 0.04),
    rot: Math.random() * Math.PI * 2,
    rv:  (Math.random() - 0.5) * 0.004,
    a:  Math.random() * 0.28 + 0.10,
    px: Math.random() * 28 + 10,
  };
}

// ── Resize ────────────────────────────────────────────────────────────────
function resize() {
  width  = window.innerWidth;
  height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = width  * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  buildStars();
  buildAsteroids();
}

// ── Draw ──────────────────────────────────────────────────────────────────
function draw(time) {
  if (!lastTime) lastTime = time;
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime  = time;
  const sec = time * 0.001;

  // Smooth mouse
  const f = 1 - Math.exp(-dt / 0.09);
  mouseX += (targetMouseX - mouseX) * f;
  mouseY += (targetMouseY - mouseY) * f;

  // Clear transparently
  ctx.clearRect(0, 0, width, height);

  // ── STARS ────────────────────────────────────────────────────────────────
  for (let i = 0; i < stars.length; i++) {
    const s   = stars[i];
    const cfg = LAYERS[s.li];

    // Drift
    s.y += s.dy;
    if (s.y < -4) s.y = height + 4;

    // Parallax
    const px = s.x + mouseX * cfg.px;
    const py = s.y + mouseY * cfg.px;

    if (px < -4 || px > width + 4 || py < -4 || py > height + 4) continue;

    // Twinkle
    const twk = Math.sin(sec * s.tw + s.ph) * 0.25 + 0.75;
    ctx.globalAlpha = s.a * twk;

    // Glow for big near stars
    if (s.li === 2 && s.r > 2.0) {
      ctx.globalAlpha = s.a * twk * 0.15;
      ctx.fillStyle = '#ffffff';
      // Use fillRect instead of arc for massive performance boost
      ctx.fillRect(px - s.r * 2.5, py - s.r * 2.5, s.r * 5.0, s.r * 5.0);
    }

    ctx.globalAlpha = s.a * twk;
    ctx.fillStyle = '#ffffff';
    // Use fillRect for standard stars
    ctx.fillRect(px - s.r, py - s.r, s.r * 2.0, s.r * 2.0);
  }

  // ── ASTEROIDS ────────────────────────────────────────────────────────────
  for (let i = 0; i < asteroids.length; i++) {
    const a = asteroids[i];
    a.x   += a.vx;
    a.y   += a.vy;
    a.rot += a.rv;

    if (a.y < -70 || a.x < -80 || a.x > width + 80) {
      asteroids[i] = makeAsteroid(height + 50);
      continue;
    }

    const dx = a.x + mouseX * a.px;
    const dy = a.y + mouseY * a.px;

    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(a.rot);
    ctx.globalAlpha = a.a;
    ctx.beginPath();
    ctx.moveTo(a.pts[0][0], a.pts[0][1]);
    for (let j = 1; j < a.pts.length; j++) ctx.lineTo(a.pts[j][0], a.pts[j][1]);
    ctx.closePath();
    ctx.fillStyle   = 'rgba(80, 95, 115, 0.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(160, 185, 220, 0.65)';
    ctx.lineWidth   = 1.0;
    ctx.stroke();
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}

// ── Init ──────────────────────────────────────────────────────────────────
export function init() {
  canvas = document.getElementById('starfield');
  if (!canvas) {
    console.error('[Starfield] Canvas #starfield not found.');
    return;
  }
  // Transparent canvas to composite over UI
  ctx = canvas.getContext('2d', { alpha: true });

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    const cx = width  * 0.5;
    const cy = height * 0.5;
    targetMouseX = (e.clientX - cx) / cx;
    targetMouseY = (e.clientY - cy) / cy;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    targetMouseX = 0;
    targetMouseY = 0;
  });

  requestAnimationFrame(draw);
  console.log('[Starfield] Stars & Asteroids ready.');
}
