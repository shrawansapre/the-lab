import './NarrativeOverlay.css';

const SPEED_MS = 18; // ms per character

export class NarrativeOverlay {
  constructor({ text, onDismiss } = {}) {
    this._text = text || '';
    this._onDismiss = onDismiss;
    this._timer = null;
    this._pos = 0;
    this.el = this._build();
  }

  _build() {
    const overlay = document.createElement('div');
    overlay.className = 'narrative-overlay glass animate-fade-in';

    const header = document.createElement('div');
    header.className = 'narrative-header';

    const avatar = document.createElement('div');
    avatar.className = 'narrative-avatar';
    avatar.textContent = 'Dr.V';

    const name = document.createElement('div');
    name.className = 'narrative-name';
    name.textContent = 'Dr. Vector';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'narrative-close';
    closeBtn.setAttribute('aria-label', 'Dismiss briefing');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.dismiss());

    header.appendChild(avatar);
    header.appendChild(name);
    header.appendChild(closeBtn);

    this._body = document.createElement('div');
    this._body.className = 'narrative-body dr-vector-text';

    this._cursor = document.createElement('span');
    this._cursor.className = 'cursor';
    this._body.appendChild(this._cursor);

    overlay.appendChild(header);
    overlay.appendChild(this._body);
    return overlay;
  }

  mount(container) {
    container.appendChild(this.el);
    this._type();
    return this;
  }

  _type() {
    if (this._pos >= this._text.length) {
      this._cursor.remove();
      return;
    }

    const textNode = document.createTextNode(this._text[this._pos]);
    this._body.insertBefore(textNode, this._cursor);
    this._pos++;
    this._timer = setTimeout(() => this._type(), SPEED_MS);
  }

  dismiss() {
    clearTimeout(this._timer);
    this.el.style.animation = 'fadeOut 0.25s ease forwards';
    setTimeout(() => {
      this.el.remove();
      this._onDismiss?.();
    }, 250);
  }

  destroy() {
    clearTimeout(this._timer);
    this.el.remove();
  }
}
