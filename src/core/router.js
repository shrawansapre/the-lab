import { Events } from './events.js';
import { MODULES } from '../modules/index.js';

const _routes = new Map();
let _currentTeardown = null;
let _currentSlug = null;

export function registerRoute(slug, loader) {
  _routes.set(slug, loader);
}

function parseHash(hash) {
  const raw = hash.replace(/^#/, '');
  const [path, queryStr = ''] = raw.split('?');
  const slug = path.replace(/^module\//, '') || 'home';
  const params = {};
  if (queryStr) {
    queryStr.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
    });
  }
  return { slug, params };
}

export function buildUrl(slug, params = {}) {
  const base = slug === 'home' ? '' : `module/${slug}`;
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `#${base}${query ? '?' + query : ''}`;
}

export function navigateTo(slug, params = {}) {
  window.location.hash = buildUrl(slug, params).slice(1);
}

function render404(container, slug) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'padding:2rem;color:var(--text-secondary)';
  wrap.textContent = `Module "${slug}" not found.`;
  container.appendChild(wrap);
}

async function navigate(hash) {
  const { slug, params } = parseHash(hash);
  if (slug === _currentSlug) return;

  if (_currentTeardown) {
    await Promise.resolve(_currentTeardown());
    _currentTeardown = null;
  }

  _currentSlug = slug;
  Events.emit('router:navigate', { slug, params });

  const container = document.getElementById('app');
  while (container.firstChild) container.removeChild(container.firstChild);

  const loader = _routes.get(slug) || _routes.get('home');
  if (!loader) {
    render404(container, slug);
    return;
  }

  const teardown = await loader(container, params);
  _currentTeardown = typeof teardown === 'function' ? teardown : null;
}

export function initRouter() {
  MODULES.forEach(mod => {
    _routes.set(mod.slug, async (container, params) => {
      const module = await mod.loader();
      return module.mount(container, params);
    });
  });

  window.addEventListener('hashchange', () => navigate(window.location.hash));
  navigate(window.location.hash || '#');
}

export function getCurrentSlug() {
  return _currentSlug;
}
