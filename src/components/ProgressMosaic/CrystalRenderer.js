// Each module gets a unique procedural crystal shape.
// draw(ctx, cx, cy, size, t) — t is 0..1 animation progress

const crystals = {
  'home': drawOrigin,
  'lobby': drawOrigin,
  'data-shape': drawBell,
  'bias-variance': drawDartboard,
  'gradient-descent': drawMountain,
  'decision-forest': drawTree,
  'neural-architecture': drawNetwork,
  'convolution-engine': drawKernel,
  'attention-chamber': drawWeb,
  'embedding-universe': drawConstellation,
  'evaluation-observatory': drawCrosshair,
  'generative-studio': drawSparkle,
};

export function drawCrystal(ctx, moduleId, cx, cy, size, t = 0) {
  const fn = crystals[moduleId] || drawOrigin;
  fn(ctx, cx, cy, size, t);
}

function drawOrigin(ctx, cx, cy, r, t) {
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBell(ctx, cx, cy, r, t) {
  const pts = 40;
  ctx.beginPath();
  for (let i = 0; i <= pts; i++) {
    const x = (i / pts - 0.5) * r * 1.6;
    const y = -Math.exp(-x * x * 4 / (r * r)) * r * 0.55;
    i === 0 ? ctx.moveTo(cx + x, cy - y) : ctx.lineTo(cx + x, cy - y);
  }
  ctx.stroke();
}

function drawDartboard(ctx, cx, cy, r, t) {
  [0.45, 0.3, 0.15].forEach(f => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * f, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountain(ctx, cx, cy, r, t) {
  const base = cy + r * 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.6, base);
  ctx.lineTo(cx, cy - r * 0.45);
  ctx.lineTo(cx + r * 0.6, base);
  ctx.stroke();
  // valley marker
  ctx.beginPath();
  ctx.arc(cx + r * 0.25, cy + r * 0.15, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(ctx, cx, cy, r, t) {
  const top = cy - r * 0.4;
  const mid = cy;
  const bot = cy + r * 0.4;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx, bot);
  ctx.moveTo(cx, mid - r * 0.05);
  ctx.lineTo(cx - r * 0.4, bot);
  ctx.moveTo(cx, mid - r * 0.05);
  ctx.lineTo(cx + r * 0.4, bot);
  ctx.moveTo(cx, top + r * 0.15);
  ctx.lineTo(cx - r * 0.22, mid + r * 0.05);
  ctx.moveTo(cx, top + r * 0.15);
  ctx.lineTo(cx + r * 0.22, mid + r * 0.05);
  ctx.stroke();
}

function drawNetwork(ctx, cx, cy, r, t) {
  const nodes = [
    [cx - r * 0.4, cy],
    [cx, cy - r * 0.3],
    [cx, cy + r * 0.3],
    [cx + r * 0.4, cy],
  ];
  const edges = [[0,1],[0,2],[1,3],[2,3],[0,3]];
  edges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(nodes[a][0], nodes[a][1]);
    ctx.lineTo(nodes[b][0], nodes[b][1]);
    ctx.stroke();
  });
  nodes.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawKernel(ctx, cx, cy, r, t) {
  const s = r * 0.28;
  const offsets = [[-s,-s],[-s,s],[s,-s],[s,s],[0,0]];
  offsets.forEach(([dx, dy], i) => {
    ctx.beginPath();
    ctx.rect(cx + dx - s * 0.45, cy + dy - s * 0.45, s * 0.9, s * 0.9);
    i === 4 ? ctx.fill() : ctx.stroke();
  });
}

function drawWeb(ctx, cx, cy, r, t) {
  const n = 6;
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r * 0.44, cy + Math.sin(a) * r * 0.44];
  });
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      ctx.beginPath();
      ctx.moveTo(nodes[i][0], nodes[i][1]);
      ctx.lineTo(nodes[j][0], nodes[j][1]);
      ctx.stroke();
    }
  }
  nodes.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawConstellation(ctx, cx, cy, r, t) {
  const stars = [
    [0, -0.42], [-0.28, -0.18], [0.32, -0.1],
    [-0.38, 0.2], [0.18, 0.35], [-0.1, 0.42],
  ].map(([dx, dy]) => [cx + dx * r, cy + dy * r]);
  const links = [[0,1],[1,3],[0,2],[2,4],[3,5],[4,5],[1,2]];
  links.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(stars[a][0], stars[a][1]);
    ctx.lineTo(stars[b][0], stars[b][1]);
    ctx.stroke();
  });
  stars.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.065, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCrosshair(ctx, cx, cy, r, t) {
  const arms = r * 0.48;
  ctx.beginPath();
  ctx.moveTo(cx - arms, cy);
  ctx.lineTo(cx + arms, cy);
  ctx.moveTo(cx, cy - arms);
  ctx.lineTo(cx, cy + arms);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawSparkle(ctx, cx, cy, r, t) {
  const spikes = 8;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r * 0.44 : r * 0.2;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}
