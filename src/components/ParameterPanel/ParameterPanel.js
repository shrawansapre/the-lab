import { Slider } from './Slider.js';
import { Toggle } from './Toggle.js';
import './ParameterPanel.css';

export class ParameterPanel {
  constructor(controls = []) {
    this._controls = controls;
    this._handlers = [];
    this._widgets = [];
    this.el = this._build();
  }

  _emit(key, value) {
    this._handlers.forEach(fn => fn(key, value));
  }

  _build() {
    const panel = document.createElement('div');
    panel.className = 'param-panel glass';

    const title = document.createElement('div');
    title.className = 'param-panel-title lab-label';
    title.textContent = 'Parameters';
    panel.appendChild(title);

    this._controls.forEach(cfg => {
      let widget;
      const onChange = (key, val) => this._emit(key, val);

      if (cfg.type === 'slider') {
        widget = new Slider({ ...cfg, value: cfg.default ?? cfg.min, onChange });
        panel.appendChild(widget.el);
      } else if (cfg.type === 'toggle') {
        widget = new Toggle({ ...cfg, value: cfg.default ?? false, onChange });
        panel.appendChild(widget.el);
      } else if (cfg.type === 'button') {
        const btn = document.createElement('button');
        btn.className = 'param-btn';
        btn.textContent = cfg.label;
        btn.addEventListener('click', () => this._emit(cfg.key, true));
        panel.appendChild(btn);
        widget = { el: btn, key: cfg.key };
      } else if (cfg.type === 'select') {
        const wrap = document.createElement('div');
        wrap.className = 'param-row';
        const lbl = document.createElement('span');
        lbl.className = 'param-label';
        lbl.textContent = cfg.label;
        const sel = document.createElement('select');
        sel.className = 'param-select';
        (cfg.options || []).forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value ?? opt;
          o.textContent = opt.label ?? opt;
          if ((opt.value ?? opt) === cfg.default) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', () => this._emit(cfg.key, sel.value));
        wrap.appendChild(lbl);
        wrap.appendChild(sel);
        panel.appendChild(wrap);
        widget = { el: wrap, key: cfg.key };
      } else if (cfg.type === 'divider') {
        const div = document.createElement('div');
        div.className = 'param-divider';
        if (cfg.label) {
          const lbl = document.createElement('span');
          lbl.className = 'param-divider-label lab-label';
          lbl.textContent = cfg.label;
          div.appendChild(lbl);
        }
        panel.appendChild(div);
        widget = { el: div, key: '' };
      }

      if (widget) this._widgets.push(widget);
    });

    return panel;
  }

  on(fn) {
    this._handlers.push(fn);
    return () => { this._handlers = this._handlers.filter(h => h !== fn); };
  }

  mount(container) {
    container.appendChild(this.el);
    return this;
  }

  reset() {
    this._widgets.forEach((w, i) => {
      const cfg = this._controls[i];
      if (w instanceof Slider) w.setValue(cfg.default ?? cfg.min);
    });
  }
}
