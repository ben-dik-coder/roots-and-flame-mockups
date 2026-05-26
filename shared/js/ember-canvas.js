/**
 * Ildkuler — glødende kuler over hele siden
 */
function drawFireBall(ctx, x, y, radius, opacity, hue) {
  const r = radius;

  // Ytre glød
  const outer = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  outer.addColorStop(0, `hsla(${hue}, 90%, 55%, ${opacity * 0.35})`);
  outer.addColorStop(0.4, `hsla(${hue - 8}, 85%, 45%, ${opacity * 0.15})`);
  outer.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, Math.PI * 2);
  ctx.fillStyle = outer;
  ctx.fill();

  // Midtre kule
  const mid = ctx.createRadialGradient(x, y, 0, x, y, r * 1.8);
  mid.addColorStop(0, `hsla(${hue + 5}, 95%, 65%, ${opacity * 0.85})`);
  mid.addColorStop(0.5, `hsla(${hue}, 90%, 50%, ${opacity * 0.5})`);
  mid.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
  ctx.fillStyle = mid;
  ctx.fill();

  // Het kjerne
  const core = ctx.createRadialGradient(x, y, 0, x, y, r * 0.7);
  core.addColorStop(0, `hsla(48, 100%, 85%, ${opacity})`);
  core.addColorStop(0.6, `hsla(${hue}, 95%, 60%, ${opacity * 0.7})`);
  core.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
  ctx.fillStyle = core;
  ctx.fill();
}

function createEmberSystem(container, options = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const opts = {
    maxParticles: 70,
    opacityMin: 0.2,
    opacityMax: 0.55,
    sizeMin: 1.2,
    sizeMax: 5.5,
    global: true,
    ...options,
  };

  const canvas = document.createElement('canvas');
  canvas.className = 'ember-canvas-global';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let tick = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle(fromRandomHeight = false) {
    const w = canvas.width;
    const h = canvas.height;
    const isBig = Math.random() > 0.72;
    const size = isBig
      ? Math.random() * (opts.sizeMax - 2) + 2.5
      : Math.random() * (opts.sizeMax - opts.sizeMin) + opts.sizeMin;

    return {
      x: Math.random() * w,
      y: fromRandomHeight ? Math.random() * h : h + Math.random() * 40,
      size,
      speedY: (isBig ? 0.35 : 0.55) + Math.random() * 0.45,
      speedX: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * (opts.opacityMax - opts.opacityMin) + opts.opacityMin,
      hue: Math.random() > 0.35 ? 32 : 22,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      life: 0,
    };
  }

  function initParticles() {
    const area = canvas.width * canvas.height;
    const count = Math.min(opts.maxParticles, Math.floor(area / 14000));
    particles = Array.from({ length: Math.max(count, 25) }, () => {
      const p = createParticle(true);
      p.y = Math.random() * canvas.height;
      return p;
    });
  }

  function draw() {
    tick += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.life += 1;
      p.y -= p.speedY;
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.15;
      p.opacity -= 0.0008;

      if (p.y < -p.size * 6 || p.opacity <= 0.05) {
        const fromMid = Math.random() > 0.55;
        Object.assign(p, createParticle(fromMid));
        if (!fromMid) p.y = canvas.height + p.size;
      }

      drawFireBall(ctx, p.x, p.y, p.size, p.opacity, p.hue);
    });

    animationId = requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  draw();

  const onResize = () => {
    resize();
    initParticles();
  };
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    canvas.remove();
  };
}

function initGlobalEmbers() {
  const layer = document.getElementById('global-embers');
  if (!layer) return;
  createEmberSystem(layer, {
    maxParticles: 75,
    opacityMin: 0.18,
    opacityMax: 0.5,
    sizeMin: 1.5,
    sizeMax: 6,
  });
}

/** Flamme + gnist langs kant (hero nederst, seksjoner øverst) */
function initFlameEdge(container) {
  if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const fromTop = container.classList.contains('flame-edge--top');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  function spawnEmber() {
    const w = canvas.width;
    const h = canvas.height;
    return {
      kind: 'ember',
      x: (Math.random() + Math.random()) / 2 * w,
      y: fromTop ? -Math.random() * 20 : h + Math.random() * 20,
      size: Math.random() * 3 + 1,
      speedY: (Math.random() * 0.6 + 0.25) * (fromTop ? 1 : -1),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.35 + 0.2,
      hue: Math.random() > 0.4 ? 35 : 22,
      wobble: Math.random() * Math.PI * 2,
    };
  }

  function initParticles() {
    const count = Math.min(40, Math.floor((canvas.width * canvas.height) / 4000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(spawnEmber());
    }
  }

  function emberOutOfBounds(p) {
    if (fromTop) return p.y > canvas.height + 10 || p.opacity < 0.03;
    return p.y < -10 || p.opacity < 0.03;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.wobble += 0.04;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.wobble) * 0.12;
      p.opacity -= 0.004;

      if (emberOutOfBounds(p)) {
        Object.assign(p, spawnEmber());
        return;
      }
      drawFireBall(ctx, p.x, p.y, p.size, p.opacity, p.hue);
    });

    requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });
}

/** Flamme + gnist kun i hero-overgangen */
function initHeroFlameEdge() {
  const container = document.getElementById('hero-flame-edge');
  if (container) initFlameEdge(container);
}

document.addEventListener('DOMContentLoaded', () => {
  initGlobalEmbers();
  initHeroFlameEdge();
});
