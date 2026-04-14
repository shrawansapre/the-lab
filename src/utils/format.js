export function formatNumber(v, decimals = 3) {
  if (Math.abs(v) >= 1e6)  return (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1e3)  return (v / 1e3).toFixed(1) + 'K';
  return v.toFixed(decimals);
}

export function formatPercent(v, decimals = 1) {
  return (v * 100).toFixed(decimals) + '%';
}

export function formatSci(v, decimals = 2) {
  return v.toExponential(decimals);
}

export function formatEquation(slope, intercept, decimals = 3) {
  const m = slope.toFixed(decimals);
  const b = Math.abs(intercept).toFixed(decimals);
  const sign = intercept >= 0 ? '+' : '−';
  return `y = ${m}x ${sign} ${b}`;
}

export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
