# The Lab — Project Rules
_Extends ~/.claude/CLAUDE.md (global rules apply)._

---

## Project Overview
**"The Lab"** — An interactive science laboratory that explains DS/ML/AI concepts through direct manipulation. Users break things to learn. Each concept is a "lab room." Dr. Vector is the narrator.

## Tech Constraints
- **JavaScript only** — no TypeScript, ever
- **No framework** — vanilla JS, direct canvas manipulation
- **Vite** — dev server on port 3000
- **Dependencies**: Three.js (3D), D3 (scale/shape/interpolate only), TF.js (in-browser ML, always in web workers), GSAP (transitions)

## Architecture
```
src/
  core/        # state.js, router.js, events.js, progress.js
  design/      # CSS design system (tokens, base, typography, animations)
  components/  # Reusable UI: ExperimentCanvas, ParameterPanel, NarrativeOverlay, etc.
  renderers/   # Three.js / Canvas2D renderers (one per complex visual)
  ml/          # Math and ML utilities (pure JS or TF.js workers)
  modules/     # One folder per lab room (lobby, bias-variance, etc.)
  utils/       # math.js, color.js, canvas.js, debounce.js, format.js
```

## Key Patterns

### Module interface
Every module exports `mount(container, params)` which returns an optional `teardown()` function. The router calls teardown before switching modules.

### AppState
`AppState.set(key, value)` / `AppState.get(key)` / `AppState.subscribe(key, fn)` — the reactive backbone. Subscribe returns an unsubscribe function; call it in teardown.

### ExperimentCanvas
Wraps a `<canvas>` with auto resize/DPR handling. Pass `{ onDraw, onPointerDown, onPointerMove }` callbacks. Call `.start()` for animation loop, `.destroy()` in teardown.

### ParameterPanel
Takes a config array of `{ type: 'slider'|'toggle'|'button', key, label, ... }`. `.on(fn)` registers a `(key, value)` change handler.

### NarrativeOverlay
Pass `{ text, onDismiss }`. `.mount(container)` starts the typewriter. `.destroy()` to clean up.

### Router
Hash-based: `#` → home, `#module/slug` → module, `#module/slug?param=val` → with params.
Use `navigateTo(slug, params)` to navigate programmatically.

## ML in Web Workers
All TF.js training runs in `src/ml/*.worker.js`. Workers post `{ epoch, loss, weights }` messages. Never import TF.js on the main thread for training — it blocks the UI.

## Design System
- CSS custom properties in `src/design/tokens.css`
- Dark theme only: `--bg-base: #080a12`
- Accent: `--accent-cyan: #00d4ff` (primary), `--accent-purple: #a855f7` (secondary)
- Fonts: Space Grotesk (sans), Space Mono (mono)
- Glass cards: add class `glass` (bg-glass + backdrop-filter + border)

## Module Development Checklist
- [ ] Create folder under `src/modules/<slug>/`
- [ ] Export `mount(container, params)` returning teardown
- [ ] Call `markVisited(moduleId)` on mount
- [ ] Wire up NarrativeOverlay with module's narrative text from `MODULES` array
- [ ] Add module to `src/modules/index.js` with correct phase/unlocked flag
- [ ] Remove stub, implement full ExperimentCanvas + ParameterPanel

## Commands
```bash
npm run dev      # dev server (localhost:3000)
npm run build    # production build → dist/
npm run preview  # preview build
```

## Phase Status
See `PLAN.md` for what's built and what's next.
