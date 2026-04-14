import './neural-architecture.css';
import { ExperimentCanvas } from '../../components/ExperimentCanvas/ExperimentCanvas.js';
import { NarrativeOverlay } from '../../components/NarrativeOverlay/NarrativeOverlay.js';
import { buildModulePage } from '../_layout.js';
import { markVisited } from '../../core/progress.js';
import { sigmoid, relu } from '../../utils/math.js';
import { MODULES } from '../index.js';
import '../../components/ExperimentCanvas/ExperimentCanvas.css';

// ── Network definition  (2 → 4 → 1) ─────────────────────────────────────────

// Sigmoid weights: solves XOR via OR+NAND gates in hidden layer
const SIGMOID_WEIGHTS = {
  // W1[j] = weights from all inputs to hidden node j
  W1: [[20, 20], [-20, -20], [0.1, -0.1], [-0.1, 0.1]],
  b1: [-10, 30, 0, 0],
  W2: [[20, 20, 0.05, -0.05]],
  b2: [-30],
};

// Linear weights: a random linear map that fails XOR (cannot separate it)
const LINEAR_WEIGHTS = {
  W1: [[0.5, 0.3], [-0.3, 0.5], [0.2, -0.4], [-0.4, 0.2]],
  b1: [0.1, -0.1, 0.05, -0.05],
  W2: [[0.4, -0.4, 0.3, -0.3]],
  b2: [0],
};

const ARCH = { inputs: 2, hidden: 4, outputs: 1 };

function forwardPass(input, weights, actName) {
  const actFn = actName === 'sigmoid' ? sigmoid : actName === 'relu' ? relu : x => x;

  const preH = weights.W1.map((wRow, j) =>
    wRow.reduce((s, w, i) => s + w * input[i], 0) + weights.b1[j],
  );
  const hidden = preH.map(actFn);

  const preO = weights.W2.map((wRow, k) =>
    wRow.reduce((s, w, j) => s + w * hidden[j], 0) + weights.b2[k],
  );
  const output = preO.map(sigmoid); // always sigmoid for output (binary)

  return { hidden, output, preH, preO };
}

// ── Layout helper ─────────────────────────────────────────────────────────────

function getNodePositions(w, h) {
  const layers = [
    { x: 0.18 * w, count: ARCH.inputs },
    { x: 0.50 * w, count: ARCH.hidden },
    { x: 0.82 * w, count: ARCH.outputs },
  ];
  return layers.map(({ x, count }) =>
    Array.from({ length: count }, (_, i) => ({
      x,
      y: ((i + 1) / (count + 1)) * h,
    })),
  );
}

const NODE_R = 24;

// ── Color mapping ─────────────────────────────────────────────────────────────

function activationColor(val, phase, layerPhase) {
  if (phase < layerPhase) return 'rgba(255,255,255,0.08)';
  const alpha = 0.15 + 0.85 * Math.abs(val);
  const r = Math.round(val * 0 + (1 - val) * 8);
  const g = Math.round(val * 212 + (1 - val) * 10);
  const b = Math.round(val * 255 + (1 - val) * 18);
  return `rgba(${r},${g},${b},${alpha})`;
}

function edgeOpacity(w, phase, layerPhase) {
  if (phase < layerPhase) return 0.06;
  return 0.12 + 0.5 * Math.min(Math.abs(w) / 25, 1);
}

// ── Drawing ──────────────────────────────────────────────────────────────────

function drawNetwork(ctx, w, h, fwdResult, phase, weights) {
  ctx.fillStyle = '#080a12';
  ctx.fillRect(0, 0, w, h);

  const layers = getNodePositions(w, h);
  const [inputNodes, hiddenNodes, outputNodes] = layers;

  const inputVals  = fwdResult ? [fwdResult.input[0],  fwdResult.input[1]]  : [0, 0];
  const hiddenVals = fwdResult ? fwdResult.hidden : [0, 0, 0, 0];
  const outputVals = fwdResult ? fwdResult.output : [0];

  // ── Edges: input → hidden ──
  inputNodes.forEach((inp, i) => {
    hiddenNodes.forEach((hid, j) => {
      const wij = weights.W1[j][i];
      const positive = wij >= 0;
      const op = edgeOpacity(wij, phase, 1);
      ctx.save();
      ctx.globalAlpha = op;
      ctx.strokeStyle = positive ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = Math.max(0.5, Math.min(Math.abs(wij) / 12, 3));
      ctx.beginPath();
      ctx.moveTo(inp.x + NODE_R, inp.y);
      ctx.lineTo(hid.x - NODE_R, hid.y);
      ctx.stroke();
      ctx.restore();
    });
  });

  // ── Edges: hidden → output ──
  hiddenNodes.forEach((hid, j) => {
    outputNodes.forEach((out, k) => {
      const wjk = weights.W2[k][j];
      const positive = wjk >= 0;
      const op = edgeOpacity(wjk, phase, 2);
      ctx.save();
      ctx.globalAlpha = op;
      ctx.strokeStyle = positive ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = Math.max(0.5, Math.min(Math.abs(wjk) / 12, 3));
      ctx.beginPath();
      ctx.moveTo(hid.x + NODE_R, hid.y);
      ctx.lineTo(out.x - NODE_R, out.y);
      ctx.stroke();
      ctx.restore();
    });
  });

  // ── Nodes ──
  function drawNode(x, y, val, label, lit, glowColor) {
    const fill = lit ? activationColor(clamp01(val), 3, 0) : 'rgba(255,255,255,0.06)';
    ctx.save();
    if (lit) {
      ctx.shadowColor = glowColor || '#00d4ff';
      ctx.shadowBlur = 18;
    }
    ctx.beginPath();
    ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = lit ? (glowColor || '#00d4ff') : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = lit ? 1.5 : 1;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = lit ? '#e2e8f0' : '#475569';
    ctx.font = `${lit ? '700' : '400'} 10px "Space Mono",monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (lit && fwdResult) {
      ctx.fillText(clamp01(val).toFixed(2), x, y);
    } else {
      ctx.fillText(label, x, y);
    }
    ctx.restore();
  }

  // Input nodes
  inputNodes.forEach((n, i) => {
    const val = inputVals[i];
    const lit = phase >= 0 && fwdResult !== null;
    drawNode(n.x, n.y, val, `x${i + 1}`, lit, '#00d4ff');
    // Input label
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.font = '10px "Space Mono",monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`x${i + 1}`, n.x - NODE_R - 8, n.y);
    ctx.restore();
  });

  // Hidden nodes
  hiddenNodes.forEach((n, j) => {
    const val = hiddenVals[j];
    const lit = phase >= 1;
    drawNode(n.x, n.y, val, `h${j + 1}`, lit, '#a855f7');
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.font = '10px "Space Mono",monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`h${j + 1}`, n.x, n.y + NODE_R + 4);
    ctx.restore();
  });

  // Output node
  outputNodes.forEach((n, k) => {
    const val = outputVals[k];
    const lit = phase >= 2;
    const correct = fwdResult ? (Math.round(val) === fwdResult.expected) : null;
    const glow = lit ? (correct === true ? '#22c55e' : correct === false ? '#ef4444' : '#00d4ff') : '#00d4ff';
    drawNode(n.x, n.y, val, 'ŷ', lit, glow);
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.font = '10px "Space Mono",monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('ŷ', n.x + NODE_R + 8, n.y);
    ctx.restore();
  });

  // Layer labels
  const lblY = h * 0.94;
  ctx.save();
  ctx.font = '10px "Space Mono",monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.fillText('Input', inputNodes[0].x,  lblY);
  ctx.fillText('Hidden', hiddenNodes[1].x, lblY);
  ctx.fillText('Output', outputNodes[0].x, lblY);
  ctx.restore();
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// ── XOR input selector UI ─────────────────────────────────────────────────────

const XOR_CASES = [
  { label: '(0, 0)', input: [0, 0], expected: 0 },
  { label: '(0, 1)', input: [0, 1], expected: 1 },
  { label: '(1, 0)', input: [1, 0], expected: 1 },
  { label: '(1, 1)', input: [1, 1], expected: 0 },
];

// ── mount ─────────────────────────────────────────────────────────────────────

export function mount(container, _params) {
  markVisited('neural-architecture');
  const mod = MODULES.find(m => m.id === 'neural-architecture');
  const { body, briefingBtn, setFooterStats } = buildModulePage({
    title: 'Neural Architecture Hall', phase: 1,
    prevSlug: 'gradient-descent', prevLabel: 'Gradient Descent',
    nextSlug: 'data-shape', nextLabel: 'Shape of Data',
    container,
  });

  // ── State ──
  let actMode = 'sigmoid';
  let selectedCase = 0;
  let fwdResult = null;
  let animPhase = -1;  // -1=idle, 0=inputs lit, 1=hidden lit, 2=output lit
  let animTimer = null;

  function getWeights() {
    return actMode === 'sigmoid' ? SIGMOID_WEIGHTS : LINEAR_WEIGHTS;
  }

  function runForward() {
    clearTimeout(animTimer);
    const { input, expected } = XOR_CASES[selectedCase];
    const weights = getWeights();
    const result = forwardPass(input, weights, actMode);
    fwdResult = { ...result, input, expected };

    animPhase = 0;
    animTimer = setTimeout(() => {
      animPhase = 1;
      animTimer = setTimeout(() => {
        animPhase = 2;
        const out = fwdResult.output[0];
        const correct = Math.round(out) === expected;
        setFooterStats([
          { label: 'Input', value: XOR_CASES[selectedCase].label },
          { label: 'Output ŷ', value: out.toFixed(3) },
          { label: 'Expected', value: String(expected) },
          { label: correct ? '✓ Correct' : '✗ Wrong', value: actMode === 'sigmoid' ? 'sigmoid solves XOR' : 'linear cannot solve XOR', cls: correct ? '' : 'bad' },
        ]);
      }, 400);
    }, 400);
  }

  // ── Canvas ──
  const ec = new ExperimentCanvas({
    onDraw(ctx, w, h) {
      drawNetwork(ctx, w, h, fwdResult, animPhase, getWeights());
    },
  });
  ec.mount(body);
  ec.start();

  // ── Controls sidebar ──
  const sidebar = document.createElement('div');
  sidebar.className = 'na-sidebar glass';

  // Activation mode
  const actLabel = document.createElement('div');
  actLabel.className = 'lab-label';
  actLabel.textContent = 'Activation';
  actLabel.style.marginBottom = '8px';
  sidebar.appendChild(actLabel);

  const ACT_OPTIONS = [
    { value: 'sigmoid', label: 'Sigmoid (Solves XOR)' },
    { value: 'linear',  label: 'Linear (Fails XOR)' },
  ];

  ACT_OPTIONS.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'na-act-btn' + (opt.value === actMode ? ' active' : '');
    btn.textContent = opt.label;
    btn.dataset.value = opt.value;
    btn.addEventListener('click', () => {
      actMode = opt.value;
      sidebar.querySelectorAll('.na-act-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.value === actMode);
      });
      fwdResult = null;
      animPhase = -1;
      setFooterStats([]);
    });
    sidebar.appendChild(btn);
  });

  // Divider
  const div1 = document.createElement('div');
  div1.className = 'na-divider';
  div1.style.cssText = 'border-top:1px solid var(--border-subtle);margin:16px 0 8px';
  sidebar.appendChild(div1);

  // XOR input selector
  const inputLabel = document.createElement('div');
  inputLabel.className = 'lab-label';
  inputLabel.textContent = 'XOR Input';
  inputLabel.style.marginBottom = '8px';
  sidebar.appendChild(inputLabel);

  XOR_CASES.forEach((xCase, i) => {
    const btn = document.createElement('button');
    btn.className = 'na-xor-btn' + (i === selectedCase ? ' active' : '');
    btn.textContent = xCase.label;
    btn.dataset.idx = i;
    btn.addEventListener('click', () => {
      selectedCase = i;
      sidebar.querySelectorAll('.na-xor-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.idx) === selectedCase);
      });
      fwdResult = null;
      animPhase = -1;
      setFooterStats([]);
    });
    sidebar.appendChild(btn);
  });

  // Divider
  const div2 = document.createElement('div');
  div2.style.cssText = 'border-top:1px solid var(--border-subtle);margin:16px 0 8px';
  sidebar.appendChild(div2);

  // Run button
  const runBtn = document.createElement('button');
  runBtn.className = 'na-run-btn';
  runBtn.textContent = '▶ Run Forward Pass';
  runBtn.addEventListener('click', runForward);
  sidebar.appendChild(runBtn);

  // Explainer text
  const expl = document.createElement('div');
  expl.className = 'na-explainer';
  expl.textContent = 'Blue edges = positive weights. Red = negative. Brightness = activation strength.';
  sidebar.appendChild(expl);

  body.appendChild(sidebar);

  // ── Narrative ──
  let overlay = null;
  function showNarrative() {
    overlay?.destroy();
    overlay = new NarrativeOverlay({ text: mod.narrative, onDismiss: () => { overlay = null; } });
    overlay.mount(body);
  }
  showNarrative();
  briefingBtn.addEventListener('click', showNarrative);

  return () => {
    clearTimeout(animTimer);
    ec.destroy();
    overlay?.destroy();
  };
}
