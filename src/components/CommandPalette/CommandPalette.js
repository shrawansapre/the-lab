import { MODULES } from '../../modules/index.js';
import { navigateTo } from '../../core/router.js';
import './CommandPalette.css';

let _el = null;
let _open = false;

export function initCommandPalette() {
  _el = buildPalette();
  document.body.appendChild(_el);

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape' && _open) close();
  });
}

function buildPalette() {
  const backdrop = document.createElement('div');
  backdrop.className = 'cp-backdrop';
  backdrop.addEventListener('click', close);

  const modal = document.createElement('div');
  modal.className = 'cp-modal glass';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'cp-input';
  input.placeholder = 'Go to module…';
  input.autocomplete = 'off';

  const list = document.createElement('ul');
  list.className = 'cp-list';
  list.setAttribute('role', 'listbox');

  input.addEventListener('input', () => renderItems(list, input.value));

  modal.appendChild(input);
  modal.appendChild(list);
  backdrop.appendChild(modal);

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) close();
  });

  return backdrop;
}

function renderItems(list, query) {
  while (list.firstChild) list.removeChild(list.firstChild);

  const q = query.toLowerCase();
  const results = MODULES.filter(m =>
    m.title.toLowerCase().includes(q) || m.tagline.toLowerCase().includes(q)
  );

  results.forEach(mod => {
    const item = document.createElement('li');
    item.className = 'cp-item';
    item.setAttribute('role', 'option');

    const title = document.createElement('span');
    title.className = 'cp-item-title';
    title.textContent = mod.title;

    const tagline = document.createElement('span');
    tagline.className = 'cp-item-tagline';
    tagline.textContent = mod.tagline;

    item.appendChild(title);
    item.appendChild(tagline);

    item.addEventListener('click', () => {
      navigateTo(mod.slug);
      close();
    });

    list.appendChild(item);
  });
}

function open() {
  _open = true;
  _el.classList.add('visible');
  const input = _el.querySelector('.cp-input');
  input.value = '';
  renderItems(_el.querySelector('.cp-list'), '');
  requestAnimationFrame(() => input.focus());
}

function close() {
  _open = false;
  _el.classList.remove('visible');
}

function toggle() {
  _open ? close() : open();
}
