// Shared stub factory — used by all Phase 1+ modules until they are implemented.
import { navigateTo } from '../core/router.js';
import { MODULES } from './index.js';

export function createStubMount(moduleId) {
  return function mount(container) {
    const mod = MODULES.find(m => m.id === moduleId);

    const page = document.createElement('div');
    page.className = 'module-page';
    page.style.cssText = 'display:flex;flex-direction:column;height:100vh';

    const header = document.createElement('header');
    header.className = 'module-header';

    const homeBtn = document.createElement('button');
    homeBtn.className = 'nav-btn';
    homeBtn.textContent = '← Home';
    homeBtn.addEventListener('click', () => navigateTo('home'));

    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-family:var(--font-mono);font-size:var(--text-sm);color:var(--text-secondary)';
    titleEl.textContent = mod?.title || moduleId;

    header.appendChild(homeBtn);
    header.appendChild(titleEl);
    header.appendChild(document.createElement('div'));
    page.appendChild(header);

    const body = document.createElement('div');
    body.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:2rem';

    const badge = document.createElement('div');
    badge.className = 'badge badge-amber';
    badge.textContent = `Phase ${mod?.phase || '?'} — Coming Soon`;

    const title = document.createElement('h2');
    title.textContent = mod?.title || moduleId;

    const tagline = document.createElement('p');
    tagline.style.cssText = 'color:var(--text-secondary);text-align:center;max-width:400px';
    tagline.textContent = mod?.tagline || '';

    body.appendChild(badge);
    body.appendChild(title);
    body.appendChild(tagline);
    page.appendChild(body);

    container.appendChild(page);
  };
}
