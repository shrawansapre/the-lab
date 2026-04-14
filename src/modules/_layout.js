import { navigateTo } from '../core/router.js';

/**
 * Builds the standard module page shell.
 * Returns { page, body, briefingBtn, setFooterStats }
 */
export function buildModulePage({
  title,
  phase = 1,
  prevSlug, prevLabel,
  nextSlug, nextLabel,
  container,
}) {
  const page = document.createElement('div');
  page.className = 'module-page';

  // ── Header ──
  const header = document.createElement('header');
  header.className = 'module-header';

  const homeBtn = document.createElement('button');
  homeBtn.className = 'nav-btn';
  homeBtn.textContent = '← Home';
  homeBtn.addEventListener('click', () => navigateTo('home'));

  const titleWrap = document.createElement('div');
  titleWrap.style.cssText = 'display:flex;align-items:center;gap:12px';

  const wordmark = document.createElement('div');
  wordmark.className = 'wordmark';
  wordmark.textContent = 'The Lab';

  const sep = document.createElement('span');
  sep.style.cssText = 'color:var(--text-tertiary);font-family:var(--font-mono)';
  sep.textContent = '/';

  const modTitle = document.createElement('span');
  modTitle.style.cssText = 'font-size:var(--text-sm);color:var(--text-secondary)';
  modTitle.textContent = title;

  titleWrap.appendChild(wordmark);
  titleWrap.appendChild(sep);
  titleWrap.appendChild(modTitle);

  const briefingBtn = document.createElement('button');
  briefingBtn.className = 'nav-btn';
  briefingBtn.textContent = 'Briefing';

  header.appendChild(homeBtn);
  header.appendChild(titleWrap);
  header.appendChild(briefingBtn);
  page.appendChild(header);

  // ── Body ──
  const body = document.createElement('div');
  body.className = 'module-body';
  page.appendChild(body);

  // ── Footer ──
  const footer = document.createElement('div');
  footer.className = 'module-footer';

  const leftNav = document.createElement('button');
  leftNav.className = 'nav-btn';
  leftNav.textContent = prevLabel ? `← ${prevLabel}` : '';
  if (prevSlug) leftNav.addEventListener('click', () => navigateTo(prevSlug));
  else leftNav.style.visibility = 'hidden';

  const phaseBadge = document.createElement('div');
  phaseBadge.className = 'badge badge-purple';
  phaseBadge.textContent = `Phase ${phase}`;

  const statsEl = document.createElement('div');
  statsEl.className = 'footer-stats';
  statsEl.style.cssText = 'display:flex;gap:16px;align-items:center;font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-tertiary)';

  const centerWrap = document.createElement('div');
  centerWrap.style.cssText = 'display:flex;align-items:center;gap:12px';
  centerWrap.appendChild(phaseBadge);
  centerWrap.appendChild(statsEl);

  const rightNav = document.createElement('button');
  rightNav.className = 'nav-btn';
  rightNav.textContent = nextLabel ? `${nextLabel} →` : '';
  if (nextSlug) rightNav.addEventListener('click', () => navigateTo(nextSlug));
  else rightNav.style.visibility = 'hidden';

  footer.appendChild(leftNav);
  footer.appendChild(centerWrap);
  footer.appendChild(rightNav);
  page.appendChild(footer);

  container.appendChild(page);

  return {
    page,
    body,
    briefingBtn,
    setFooterStats(html) {
      // html is plain text segments: [{label, value, cls}]
      while (statsEl.firstChild) statsEl.removeChild(statsEl.firstChild);
      html.forEach(({ label, value, cls }) => {
        const span = document.createElement('span');
        const lbl = document.createElement('span');
        lbl.style.color = 'var(--text-tertiary)';
        lbl.textContent = label + ': ';
        const val = document.createElement('span');
        val.style.color = cls === 'bad' ? 'var(--accent-red)'
          : cls === 'warn' ? 'var(--accent-amber)'
          : 'var(--accent-cyan)';
        val.textContent = value;
        span.appendChild(lbl);
        span.appendChild(val);
        statsEl.appendChild(span);
      });
    },
  };
}
