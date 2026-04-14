export class Slider {
  constructor({ key, label, min, max, step = 1, value, unit = '', onChange }) {
    this.key = key;
    this._onChange = onChange;
    this.el = this._build({ label, min, max, step, value, unit });
  }

  _build({ label, min, max, step, value, unit }) {
    const wrap = document.createElement('div');
    wrap.className = 'param-row';

    const header = document.createElement('div');
    header.className = 'param-header';

    const lbl = document.createElement('span');
    lbl.className = 'param-label';
    lbl.textContent = label;

    this._valEl = document.createElement('span');
    this._valEl.className = 'param-value';
    this._valEl.textContent = `${value}${unit}`;

    header.appendChild(lbl);
    header.appendChild(this._valEl);

    this._input = document.createElement('input');
    this._input.type = 'range';
    this._input.min = min;
    this._input.max = max;
    this._input.step = step;
    this._input.value = value;
    this._input.className = 'param-slider';

    this._input.addEventListener('input', () => {
      const v = parseFloat(this._input.value);
      this._valEl.textContent = `${v}${unit}`;
      this._onChange?.(this.key, v);
    });

    wrap.appendChild(header);
    wrap.appendChild(this._input);
    return wrap;
  }

  setValue(v) {
    this._input.value = v;
    this._valEl.textContent = `${v}`;
  }

  get value() {
    return parseFloat(this._input.value);
  }
}
