import './design/tokens.css';
import './design/base.css';
import './design/typography.css';
import './design/animations.css';

import { initProgress } from './core/progress.js';
import { initCommandPalette } from './components/CommandPalette/CommandPalette.js';
import { initRouter } from './core/router.js';

initProgress();
initCommandPalette();
initRouter();

document.body.classList.add('ready');
