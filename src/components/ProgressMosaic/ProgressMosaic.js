import { MODULES } from '../../modules/index.js';
import { getModuleProgress } from '../../core/progress.js';
import { navigateTo } from '../../core/router.js';
import { drawCrystal } from './CrystalRenderer.js';
import './ProgressMosaic.css';

export function mountProgressMosaic(container) {
  const page = document.createElement('div');
  page.className = 'mosaic-page';

  // Header
  const header = document.createElement('header');
  header.className = 'mosaic-header';
  header.appendChild(buildWordmark());
  header.appendChild(buildSubtitle());
  page.appendChild(header);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'mosaic-grid';
  MODULES.forEach((mod, i) => {
    const tile = buildTile(mod, i);
    grid.appendChild(tile);
  });
  page.appendChild(grid);

  container.appendChild(page);

  // Start crystal animations
  const rafIds = [];
  MODULES.forEach((mod, i) => {
    const canvas = page.querySelector(`[data-crystal="${mod.id}"]`);
    if (canvas) rafIds.push(animateCrystal(canvas, mod));
  });

  return () => rafIds.forEach(cancelAnimationFrame);
}

function buildWordmark() {
  const w = document.createElement('div');
  w.className = 'wordmark mosaic-wordmark';
  const the = document.createElement('span');
  the.textContent = 'The ';
  const lab = document.createElement('span');
  lab.textContent = 'Lab';
  w.appendChild(the);
  w.appendChild(lab);
  return w;
}

function buildSubtitle() {
  const s = document.createElement('p');
  s.className = 'mosaic-subtitle';
  s.textContent = 'Break things. Learn everything.';
  return s;
}

function buildTile(mod, index) {
  const progress = getModuleProgress(mod.id);
  const locked = !mod.unlocked && !progress.visited;

  const tile = document.createElement('div');
  tile.className = `mosaic-tile animate-fade-in-up stagger-${Math.min(index + 1, 5)}`;
  tile.classList.toggle('locked', locked);
  tile.classList.toggle('completed', !!progress.completed);

  // Crystal canvas
  const canvas = document.createElement('canvas');
  canvas.width = 80;
  canvas.height = 80;
  canvas.dataset.crystal = mod.id;
  canvas.className = 'mosaic-crystal';
  tile.appendChild(canvas);

  // Info
  const info = document.createElement('div');
  info.className = 'mosaic-tile-info';

  const title = document.createElement('div');
  title.className = 'mosaic-tile-title';
  title.textContent = mod.title;

  const tagline = document.createElement('div');
  tagline.className = 'mosaic-tile-tagline';
  tagline.textContent = mod.tagline;

  info.appendChild(title);
  info.appendChild(tagline);

  if (locked) {
    const badge = document.createElement('div');
    badge.className = 'badge badge-muted mosaic-phase-badge';
    badge.textContent = `Phase ${mod.phase}`;
    info.appendChild(badge);
  } else if (progress.completed) {
    const badge = document.createElement('div');
    badge.className = 'badge badge-cyan mosaic-phase-badge';
    badge.textContent = 'Complete';
    info.appendChild(badge);
  }

  tile.appendChild(info);

  if (!locked) {
    tile.style.cursor = 'pointer';
    tile.addEventListener('click', () => navigateTo(mod.slug));
  }

  return tile;
}

function animateCrystal(canvas, mod) {
  const ctx = canvas.getContext('2d');
  const size = 80;
  let t = 0;
  let rafId;

  const progress = getModuleProgress(mod.id);
  const completed = !!progress.completed;
  const unlocked  = mod.unlocked || !!progress.visited;

  const color    = unlocked ? (completed ? '#22c55e' : '#00d4ff') : '#475569';
  const glowColor= unlocked ? (completed ? 'rgba(34,197,94,0.5)' : 'rgba(0,212,255,0.5)') : 'transparent';

  function draw() {
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = 1.5;

    if (unlocked) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur  = 8 + Math.sin(t * 2) * 4;
    }

    drawCrystal(ctx, mod.id, size / 2, size / 2, size, t);
    ctx.restore();
    t += 0.02;
    rafId = requestAnimationFrame(draw);
  }

  draw();
  return rafId;
}
