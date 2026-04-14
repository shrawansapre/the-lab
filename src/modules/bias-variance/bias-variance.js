import './bias-variance.css';
import { ExperimentCanvas } from '../../components/ExperimentCanvas/ExperimentCanvas.js';
import { ParameterPanel } from '../../components/ParameterPanel/ParameterPanel.js';
import { NarrativeOverlay } from '../../components/NarrativeOverlay/NarrativeOverlay.js';
import { buildModulePage } from '../_layout.js';
import { markVisited } from '../../core/progress.js';
import { drawGrid, drawDot } from '../../utils/canvas.js';
import { clamp, randomGaussian } from '../../utils/math.js';
import { MODULES } from '../index.js';
import '../../components/ExperimentCanvas/ExperimentCanvas.css';

// ── Polynomial regression (pure JS, Ridge-regularised) ──────────────────────

function polyfit(points, degree) {
  if (points.length < 2) return null;
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const xrange = xmax - xmin;
  const xn = xrange > 1 ? xs.map(x => 2 * (x - xmin) / xrange - 1) : xs.map(() => 0);
  const d = degree + 1;
  const n = points.length;
  const XtX = Array.from({ length: d }, () => new Float64Array(d));
  const Xty = new Float64Array(d);

  for (let i = 0; i < n; i++) {
    const row = new Float64Array(d);
    row[0] = 1;
    for (let j = 1; j < d; j++) row[j] = row[j - 1] * xn[i];
    for (let j = 0; j < d; j++) {
      Xty[j] += row[j] * ys[i];
      for (let k = 0; k < d; k++) XtX[j][k] += row[j] * row[k];
    }
  }
  const lambda = 1e-8;
  for (let j = 0; j < d; j++) XtX[j][j] += lambda;
  const coeffs = gaussElim(XtX, Xty, d);
  return { coeffs, xmin, xmax, xrange };
}

function gaussElim(A, b, n) {
  const aug = Array.from({ length: n }, (_, i) => {
    const row = new Float64Array(n + 1);
    for (let j = 0; j < n; j++) row[j] = A[i][j];
    row[n] = b[i];
    return row;
  });
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[maxRow][col])) maxRow = r;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-14) continue;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = aug[r][col] / pivot;
      for (let k = col; k <= n; k++) aug[r][k] -= f * aug[col][k];
    }
  }
  return Array.from({ length: n }, (_, i) =>
    Math.abs(aug[i][i]) < 1e-14 ? 0 : aug[i][n] / aug[i][i],
  );
}

function evalPoly(fit, canvasX) {
  if (!fit) return null;
  const xn = fit.xrange > 1 ? 2 * (canvasX - fit.xmin) / fit.xrange - 1 : 0;
  let result = 0, xpow = 1;
  for (const c of fit.coeffs) {
    if (!Number.isFinite(c)) return null;
    result += c * xpow;
    xpow *= xn;
  }
  return Number.isFinite(result) ? result : null;
}

function computeMSE(points, fit) {
  if (!fit || points.length === 0) return null;
  let sum = 0;
  for (const p of points) {
    const pred = evalPoly(fit, p.x);
    if (pred === null) return null;
    sum += (p.y - pred) ** 2;
  }
  return sum / points.length;
}

// ── Dataset generators ───────────────────────────────────────────────────────

function generateSine(w, h, n = 22) {
  const pad = w * 0.1;
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const x = pad + t * (w - 2 * pad);
    const y = h / 2 - Math.sin(t * Math.PI * 2.5) * h * 0.22
              + randomGaussian(0, h * 0.04);
    return { x, y: clamp(y, 10, h - 10), split: Math.random() < 0.8 ? 'train' : 'test', born: Date.now() };
  });
}

function generateLinear(w, h, n = 22) {
  const pad = w * 0.1;
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const x = pad + t * (w - 2 * pad);
    const y = h * 0.75 - t * h * 0.5 + randomGaussian(0, h * 0.04);
    return { x, y: clamp(y, 10, h - 10), split: Math.random() < 0.8 ? 'train' : 'test', born: Date.now() };
  });
}

// ── Curve drawing ────────────────────────────────────────────────────────────

function curveStyle(degree) {
  if (degree <= 2) return { stroke: '#22c55e', glow: 'rgba(34,197,94,0.4)' };
  if (degree <= 5) return { stroke: '#00d4ff', glow: 'rgba(0,212,255,0.4)' };
  if (degree <= 8) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.4)' };
  return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)' };
}

function drawCurve(ctx, fit, degree, w, h) {
  if (!fit) return;
  const { stroke, glow } = curveStyle(degree);
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  let penDown = false;
  for (let i = 0; i <= 400; i++) {
    const cx = (i / 400) * w;
    const cy = evalPoly(fit, cx);
    if (cy === null || cy < -h * 0.5 || cy > h * 1.5) {
      if (penDown) { ctx.stroke(); ctx.beginPath(); penDown = false; }
      continue;
    }
    if (!penDown) { ctx.moveTo(cx, cy); penDown = true; }
    else ctx.lineTo(cx, cy);
  }
  if (penDown) ctx.stroke();
  ctx.restore();
}

// ── mount ────────────────────────────────────────────────────────────────────

export function mount(container, _params) {
  markVisited('bias-variance');
  const mod = MODULES.find(m => m.id === 'bias-variance');
  const { body, briefingBtn, setFooterStats } = buildModulePage({
    title: 'Bias/Variance Lab', phase: 1,
    prevSlug: 'lobby', prevLabel: 'The Lobby',
    nextSlug: 'gradient-descent', nextLabel: 'Gradient Descent',
    container,
  });

  let points = [], degree = 1, showTest = false, fit = null;

  function refit() {
    const train = points.filter(p => p.split === 'train');
    fit = train.length >= 2 ? polyfit(train, degree) : null;
    updateStats();
  }

  function updateStats() {
    const train = points.filter(p => p.split === 'train');
    const test  = points.filter(p => p.split === 'test');
    const trainMSE = computeMSE(train, fit);
    const testMSE  = showTest && test.length > 0 ? computeMSE(test, fit) : null;
    const stats = [];
    if (trainMSE !== null) stats.push({ label: 'Train MSE', value: trainMSE.toFixed(1) });
    if (testMSE  !== null) {
      const ratio = trainMSE > 0.1 ? testMSE / trainMSE : null;
      const cls = ratio > 3 ? 'bad' : ratio > 1.5 ? 'warn' : '';
      stats.push({ label: 'Test MSE', value: testMSE.toFixed(1), cls });
      if (ratio > 3) stats.push({ label: '⚠ OVERFIT', value: `${ratio.toFixed(1)}×`, cls: 'bad' });
    }
    setFooterStats(stats);
  }

  const ec = new ExperimentCanvas({
    onDraw(ctx, w, h) {
      ctx.fillStyle = '#080a12';
      ctx.fillRect(0, 0, w, h);
      drawGrid(ctx, w, h, { spacing: 48, color: 'rgba(255,255,255,0.035)' });
      drawCurve(ctx, fit, degree, w, h);

      if (showTest && fit) {
        points.filter(p => p.split === 'test').forEach(p => {
          const pred = evalPoly(fit, p.x);
          if (pred === null) return;
          ctx.save();
          ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1;
          ctx.globalAlpha = 0.35; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, pred);
          ctx.stroke(); ctx.restore();
        });
      }

      points.filter(p => p.split === 'train').forEach(p => {
        drawDot(ctx, p.x, p.y, 6, '#00d4ff', 'rgba(0,212,255,0.5)');
      });
      if (showTest) {
        points.filter(p => p.split === 'test').forEach(p => {
          drawDot(ctx, p.x, p.y, 6, '#f59e0b', 'rgba(245,158,11,0.5)');
        });
      }

      if (showTest && points.some(p => p.split === 'test')) {
        ctx.save(); ctx.font = '11px "Space Mono",monospace';
        ctx.fillStyle = '#00d4ff'; ctx.fillText('● Train', 16, 22);
        ctx.fillStyle = '#f59e0b'; ctx.fillText('● Test',  80, 22);
        ctx.restore();
      }

      if (points.length === 0) {
        ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = '14px "Space Mono",monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('Click to add points, or generate a dataset', w / 2, h / 2);
        ctx.restore();
      }
    },
    onPointerDown(x, y) {
      points.push({ x, y, split: Math.random() < 0.8 ? 'train' : 'test', born: Date.now() });
      refit();
    },
  });

  ec.mount(body);
  ec.start();

  let generateType = 'sine';
  const panel = new ParameterPanel([
    { type: 'slider', key: 'degree', label: 'Polynomial Degree', min: 1, max: 12, step: 1, default: 1 },
    { type: 'toggle', key: 'showTest', label: 'Reveal Test Set', default: false },
    { type: 'divider', label: 'Dataset' },
    { type: 'select', key: 'generate', label: 'Type', default: 'sine',
      options: [{ value: 'sine', label: 'Noisy Sine' }, { value: 'linear', label: 'Noisy Linear' }] },
    { type: 'button', key: 'generateBtn', label: 'Generate Dataset' },
    { type: 'button', key: 'clear', label: 'Clear' },
  ]);

  panel.on((key, val) => {
    if (key === 'degree')      { degree = val; refit(); }
    if (key === 'showTest')    { showTest = val; updateStats(); }
    if (key === 'generate')    { generateType = val; }
    if (key === 'generateBtn') {
      points = generateType === 'sine'
        ? generateSine(ec.width, ec.height)
        : generateLinear(ec.width, ec.height);
      refit();
    }
    if (key === 'clear') { points = []; fit = null; setFooterStats([]); }
  });

  panel.mount(body);

  let overlay = null;
  function showNarrative() {
    overlay?.destroy();
    overlay = new NarrativeOverlay({ text: mod.narrative, onDismiss: () => { overlay = null; } });
    overlay.mount(body);
  }
  showNarrative();
  briefingBtn.addEventListener('click', showNarrative);

  return () => { ec.destroy(); overlay?.destroy(); };
}
