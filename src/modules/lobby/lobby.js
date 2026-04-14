import './lobby.css';
import { ExperimentCanvas } from '../../components/ExperimentCanvas/ExperimentCanvas.js';
import { NarrativeOverlay } from '../../components/NarrativeOverlay/NarrativeOverlay.js';
import { navigateTo } from '../../core/router.js';
import { markVisited } from '../../core/progress.js';
import { leastSquares, round } from '../../utils/math.js';
import { drawGrid, drawDot, drawLine, drawText } from '../../utils/canvas.js';
import { formatEquation } from '../../utils/format.js';
import { MODULES } from '../index.js';
import '../../components/ExperimentCanvas/ExperimentCanvas.css';

const HINTS = [
  { count: 2,  text: 'That line minimises something. We\'ll talk about what.' },
  { count: 5,  text: 'Try placing an outlier far from the cluster.' },
  { count: 10, text: 'Watch R² — it tells you how well the line explains the data.' },
  { count: 15, text: 'You\'re doing linear regression. Manually.' },
];

export function mount(container, _params) {
  markVisited('lobby');

  const mod = MODULES.find(m => m.id === 'lobby');
  const page = document.createElement('div');
  page.className = 'lobby-page module-page';

  // ── Header ──
  const header = document.createElement('header');
  header.className = 'module-header';

  const homeBtn = document.createElement('button');
  homeBtn.className = 'nav-btn';
  homeBtn.textContent = '← Home';
  homeBtn.addEventListener('click', () => navigateTo('home'));

  const titleWrap = document.createElement('div');
  titleWrap.style.cssText = 'display:flex;align-items:center;gap:12px';

  const wordmark = document.createElement('div');
  wordmark.className = 'wordmark';
  wordmark.textContent = 'The Lab';

  const sep = document.createElement('span');
  sep.style.cssText = 'color:var(--text-tertiary);font-family:var(--font-mono)';
  sep.textContent = '/';

  const modTitle = document.createElement('span');
  modTitle.style.cssText = 'font-size:var(--text-sm);color:var(--text-secondary)';
  modTitle.textContent = 'The Lobby';

  titleWrap.appendChild(wordmark);
  titleWrap.appendChild(sep);
  titleWrap.appendChild(modTitle);

  const briefingBtn = document.createElement('button');
  briefingBtn.className = 'nav-btn';
  briefingBtn.textContent = 'Briefing';

  header.appendChild(homeBtn);
  header.appendChild(titleWrap);
  header.appendChild(briefingBtn);
  page.appendChild(header);

  // ── Canvas area ──
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'module-body lobby-canvas-wrap';
  page.appendChild(canvasWrap);

  // ── Footer ──
  const footer = document.createElement('div');
  footer.className = 'module-footer';

  const phaseTag = document.createElement('div');
  phaseTag.className = 'badge badge-cyan';
  phaseTag.textContent = 'Phase 0';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'nav-btn';
  nextBtn.textContent = 'Next: Shape of Data →';
  nextBtn.addEventListener('click', () => navigateTo('data-shape'));

  footer.appendChild(phaseTag);
  footer.appendChild(nextBtn);
  page.appendChild(footer);

  container.appendChild(page);

  // ── State ──
  const points = [];
  let regression = null;
  let currentHintIndex = 0;
  let hintEl = null;
  let lineAlpha = 0;

  // ── Canvas ──
  const ec = new ExperimentCanvas({
    onDraw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#080a12';
      ctx.fillRect(0, 0, w, h);

      drawGrid(ctx, w, h, { spacing: 48, color: 'rgba(255,255,255,0.035)' });

      // Axes hint (faint centre lines)
      drawLine(ctx, w / 2, 0, w / 2, h, { color: 'rgba(255,255,255,0.06)', width: 1 });
      drawLine(ctx, 0, h / 2, w, h / 2, { color: 'rgba(255,255,255,0.06)', width: 1 });

      // Regression line
      if (regression && points.length >= 2) {
        lineAlpha = Math.min(lineAlpha + 0.04, 1);
        const { slope, intercept } = regression;
        const x0 = 0, x1 = w;
        const y0 = slope * x0 + intercept;
        const y1 = slope * x1 + intercept;

        ctx.save();
        ctx.globalAlpha = lineAlpha;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0,212,255,0.5)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.restore();
      }

      // Points
      points.forEach((p, i) => {
        const age = Math.min((Date.now() - p.born) / 300, 1);
        const r = 6 * age;
        drawDot(ctx, p.x, p.y, r, '#00d4ff', 'rgba(0,212,255,0.6)');

        // Residual line to regression
        if (regression && points.length >= 2) {
          const pred = regression.slope * p.x + regression.intercept;
          ctx.save();
          ctx.globalAlpha = 0.25 * lineAlpha;
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, pred);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Empty state text
      if (points.length === 0) {
        drawText(ctx, 'Click anywhere to place a data point', w / 2, h / 2, {
          color: 'rgba(255,255,255,0.18)',
          font: '14px "Space Mono", monospace',
          align: 'center',
          baseline: 'middle',
        });
      }
    },

    onPointerDown(x, y) {
      points.push({ x, y, born: Date.now() });
      regression = leastSquares(points);
      if (regression) lineAlpha = 0;
      updateStats();
      checkHint();
    },
  });

  ec.mount(canvasWrap);
  ec.start();

  // ── Stats panel ──
  const statsWrap = document.createElement('div');
  statsWrap.className = 'lobby-stats';
  canvasWrap.appendChild(statsWrap);

  const equationCard = buildStatCard('Equation', '—');
  const r2Card       = buildStatCard('R²', '—');
  const nCard        = buildStatCard('n points', '0');
  statsWrap.appendChild(equationCard.el);
  statsWrap.appendChild(r2Card.el);
  statsWrap.appendChild(nCard.el);

  function updateStats() {
    nCard.update(String(points.length));
    if (regression) {
      equationCard.update(formatEquation(regression.slope, regression.intercept, 2));
      r2Card.update(round(regression.r2, 3).toFixed(3));
    }
  }

  // ── Clear button ──
  const clearBtn = document.createElement('button');
  clearBtn.className = 'lobby-clear-btn';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', () => {
    points.length = 0;
    regression = null;
    lineAlpha = 0;
    currentHintIndex = 0;
    if (hintEl) { hintEl.remove(); hintEl = null; }
    updateStats();
  });
  canvasWrap.appendChild(clearBtn);

  // ── Hint system ──
  function checkHint() {
    const hint = HINTS[currentHintIndex];
    if (!hint || points.length < hint.count) return;
    currentHintIndex++;
    if (hintEl) hintEl.remove();
    hintEl = document.createElement('div');
    hintEl.className = 'lobby-hint';
    hintEl.textContent = hint.text;
    canvasWrap.appendChild(hintEl);
    setTimeout(() => { if (hintEl) { hintEl.style.opacity = '0'; hintEl.style.transition = 'opacity 1s ease'; } }, 4000);
  }

  // ── Narrative overlay ──
  let overlay = null;
  function showNarrative() {
    if (overlay) overlay.destroy();
    overlay = new NarrativeOverlay({
      text: mod.narrative,
      onDismiss: () => { overlay = null; },
    });
    overlay.mount(canvasWrap);
  }

  showNarrative();
  briefingBtn.addEventListener('click', showNarrative);

  return () => {
    ec.destroy();
    overlay?.destroy();
  };
}

function buildStatCard(label, initial) {
  const card = document.createElement('div');
  card.className = 'lobby-stat-card glass';

  const lbl = document.createElement('div');
  lbl.className = 'stat-label';
  lbl.textContent = label;

  const val = document.createElement('div');
  val.className = 'stat-value';
  val.style.fontSize = 'var(--text-sm)';
  val.style.fontFamily = 'var(--font-mono)';
  val.textContent = initial;

  card.appendChild(lbl);
  card.appendChild(val);
  return {
    el: card,
    update(v) { val.textContent = v; },
  };
}
