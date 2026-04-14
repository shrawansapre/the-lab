export class Toggle {
  constructor({ key, label, value = false, onChange }) {
    this.key = key;
    this._onChange = onChange;
    this.el = this._build({ label, value });
  }

  _build({ label, value }) {
    const wrap = document.createElement('div');
    wrap.className = 'param-row param-toggle-row';

    const lbl = document.createElement('span');
    lbl.className = 'param-label';
    lbl.textContent = label;

    const track = document.createElement('button');
    track.className = 'param-toggle' + (value ? ' active' : '');
    track.setAttribute('role', 'switch');
    track.setAttribute('aria-checked', String(value));
    track.setAttribute('aria-label', label);

    const thumb = document.createElement('span');
    thumb.className = 'param-toggle-thumb';
    track.appendChild(thumb);

    track.addEventListener('click', () => {
      const next = track.getAttribute('aria-checked') !== 'true';
      track.setAttribute('aria-checked', String(next));
      track.classList.toggle('active', next);
      this._onChange?.(this.key, next);
    });

    wrap.appendChild(lbl);
    wrap.appendChild(track);
    return wrap;
  }

  get value() {
    return this.el.querySelector('.param-toggle').getAttribute('aria-checked') === 'true';
  }
}
