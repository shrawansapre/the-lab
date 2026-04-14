import { setupHiDPI } from '../../utils/canvas.js';
import { clamp } from '../../utils/math.js';
import './LossTracker.css';

export class LossTracker {
  constructor({ maxPoints = 200 } = {}) {
    this._data = [];
    this._maxPoints = maxPoints;
    this.el = this._build();
  }

  _build() {
    const wrap = document.createElement('div');
    wrap.className = 'loss-tracker glass';

    const title = document.createElement('div');
    title.className = 'loss-tracker-title lab-label';
    title.textContent = 'Loss';

    this._canvas = document.createElement('canvas');
    this._canvas.className = 'loss-tracker-canvas';

    this._statEl = document.createElement('div');
    this._statEl.className = 'loss-tracker-stat';

    wrap.appendChild(title);
    wrap.appendChild(this._canvas);
    wrap.appendChild(this._statEl);
    return wrap;
  }

  mount(container) {
    container.appendChild(this.el);
    const rect = this._canvas.getBoundingClientRect();
    this._ctx = setupHiDPI(this._canvas, 200, 80);
    return this;
  }

  push(loss) {
    this._data.push(loss);
    if (this._data.length > this._maxPoints) this._data.shift();
    this._draw();
    const last = this._data[this._data.length - 1];
    this._statEl.textContent = last.toFixed(4);
  }

  reset() {
    this._data = [];
    this._ctx?.clearRect(0, 0, 200, 80);
    this._statEl.textContent = '—';
  }

  _draw() {
    const ctx = this._ctx;
    if (!ctx) return;
    const w = 200, h = 80;
    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...this._data);
    const max = Math.max(...this._data);
    const range = max - min || 1;

    ctx.strokeStyle = 'var(--accent-cyan)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    this._data.forEach((v, i) => {
      const x = (i / (this._maxPoints - 1)) * w;
      const y = h - clamp((v - min) / range, 0, 1) * (h - 8) - 4;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}
