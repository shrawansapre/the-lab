export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

export function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function lerpColor(hex1, hex2, t) {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  return rgbToHex(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t,
  );
}

export function hsl(h, s, l, a = 1) {
  return a === 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

// Map a 0–1 value through a gradient of stops: [{t, color}]
export function gradientAt(stops, t) {
  for (let i = 0; i < stops.length - 1; i++) {
    if (t <= stops[i + 1].t) {
      const local = (t - stops[i].t) / (stops[i + 1].t - stops[i].t);
      return lerpColor(stops[i].color, stops[i + 1].color, local);
    }
  }
  return stops[stops.length - 1].color;
}

export const PALETTE = {
  cyan:   '#00d4ff',
  purple: '#a855f7',
  green:  '#22c55e',
  amber:  '#f59e0b',
  red:    '#ef4444',
  pink:   '#ec4899',
  blue:   '#3b82f6',
};

// Loss gradient: green (low) → amber → red (high)
export const LOSS_GRADIENT = [
  { t: 0,   color: '#22c55e' },
  { t: 0.5, color: '#f59e0b' },
  { t: 1,   color: '#ef4444' },
];
