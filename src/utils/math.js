export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp  = (a, b, t) => a + (b - a) * t;
export const norm  = (v, lo, hi) => (v - lo) / (hi - lo);
export const map   = (v, inLo, inHi, outLo, outHi) => lerp(outLo, outHi, norm(v, inLo, inHi));

export function linspace(start, end, n) {
  const arr = new Array(n);
  const step = (end - start) / (n - 1);
  for (let i = 0; i < n; i++) arr[i] = start + i * step;
  return arr;
}

export const sigmoid = x => 1 / (1 + Math.exp(-x));
export const relu    = x => Math.max(0, x);
export const tanh    = x => Math.tanh(x);

export const degrees = rad => (rad * 180) / Math.PI;
export const radians = deg => (deg * Math.PI) / 180;

export function dot(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

export function randomGaussian(mean = 0, std = 1) {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function leastSquares(points) {
  const n = points.length;
  if (n < 2) return null;
  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return { slope: 0, intercept: sumY / n, r2: 0 };
  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const meanY     = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2    = ssTot < 1e-10 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

export function round(v, decimals = 2) {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}
