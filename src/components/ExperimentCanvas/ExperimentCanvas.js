import { setupHiDPI } from '../../utils/canvas.js';

export class ExperimentCanvas {
  constructor({ onDraw, onPointerDown, onPointerMove, onPointerUp } = {}) {
    this._onDraw = onDraw;
    this._onPointerDown = onPointerDown;
    this._onPointerMove = onPointerMove;
    this._onPointerUp = onPointerUp;
    this._raf = null;
    this._running = false;
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
  }

  mount(container) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'experiment-canvas';
    container.appendChild(this.canvas);

    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(container);
    this._resize();
    this._bindPointer();
    return this;
  }

  _resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width  = rect.width  || this.canvas.parentElement.offsetWidth;
    this.height = rect.height || this.canvas.parentElement.offsetHeight;
    this.ctx = setupHiDPI(this.canvas, this.width, this.height);
  }

  _bindPointer() {
    this.canvas.addEventListener('pointerdown', e => {
      const { x, y } = this._localCoords(e);
      this._onPointerDown?.(x, y, e);
    });
    this.canvas.addEventListener('pointermove', e => {
      const { x, y } = this._localCoords(e);
      this._onPointerMove?.(x, y, e);
    });
    this.canvas.addEventListener('pointerup', e => {
      const { x, y } = this._localCoords(e);
      this._onPointerUp?.(x, y, e);
    });
  }

  _localCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  start() {
    this._running = true;
    const loop = () => {
      if (!this._running) return;
      this._onDraw?.(this.ctx, this.width, this.height);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
    return this;
  }

  stop() {
    this._running = false;
    cancelAnimationFrame(this._raf);
    return this;
  }

  redraw() {
    this._onDraw?.(this.ctx, this.width, this.height);
  }

  destroy() {
    this.stop();
    this._ro?.disconnect();
    this.canvas?.remove();
  }
}
