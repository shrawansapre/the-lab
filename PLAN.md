# The Lab — Implementation Plan

> "Break things. Learn everything."

---

## Vision
An interactive science laboratory for DS/ML/AI. Every concept is a "lab room." Users experiment directly — no passive reading. Dr. Vector narrates. The app defaults to beautiful, working states then gives users controls to deliberately break them.

---

## Phase 0 — Foundation ✅ COMPLETE
**Goal:** Navigable shell. All foundation code in place. No blank pages, no crashes.

### Completed
- [x] Vite project scaffold with full folder structure
- [x] `src/core/state.js` — Observable AppState store
- [x] `src/core/router.js` — Hash router with lazy module loading + URL params
- [x] `src/core/events.js` — Global event bus
- [x] `src/core/progress.js` — localStorage progress tracker
- [x] `src/design/` — Full CSS design system (tokens, base, typography, animations)
- [x] `src/components/ExperimentCanvas` — Canvas wrapper with DPR + resize handling
- [x] `src/components/ParameterPanel` — Slider, Toggle, Button controls
- [x] `src/components/NarrativeOverlay` — Typewriter + Dr. Vector persona
- [x] `src/components/LossTracker` — Live loss curve canvas
- [x] `src/components/ProgressMosaic` — Home screen with animated crystal tiles
- [x] `src/components/CommandPalette` — Cmd+K module search
- [x] `src/utils/` — math, color, canvas, debounce, format helpers
- [x] `src/modules/index.js` — Full module registry (all 12 modules defined)
- [x] `src/modules/lobby/` — **Working interactive**: click to place points → real-time linear regression with R², equation, residuals, hints
- [x] All Phase 1–3 module stubs (navigable, show "Coming Soon")
- [x] Renderer stubs (TerrainRenderer, NetworkBuilder, etc.)
- [x] CLAUDE.md + PLAN.md
- [x] GitHub repo setup

---

## Phase 1 — MVP: Three Core Modules ✅ COMPLETE

### Module: Bias/Variance Lab (`bias-variance`) ✅
- [x] Click to place points (80/20 train/test split per point)
- [x] Auto-generate datasets: Noisy Sine, Noisy Linear
- [x] Polynomial regression (pure JS, Vandermonde + Gaussian elim, Ridge regularised)
- [x] Degree dial (1–12) — curve color shifts green→cyan→amber→red
- [x] Reveal Test Set toggle — shows amber test dots + purple residual dashes
- [x] Live Train MSE / Test MSE in footer with OVERFIT warning

### Module: Gradient Descent Terrain (`gradient-descent`) ✅
- [x] Three.js 3D terrain — elongated bowl L=0.1x²+y² (optimal for SGD vs Adam demo)
- [x] Vertex colours: green (low loss) → yellow → red (high)
- [x] Optimizer selector: SGD, SGD+Momentum, Adam
- [x] Learning rate slider (0.01–1.5), Speed slider (1–20×)
- [x] Animated hiker sphere with pulsing glow ring + trail line
- [x] Green minimum marker, OrbitControls camera
- [x] Live Loss / Steps / w₁ / w₂ in footer

### Module: Neural Architecture Hall (`neural-architecture`) ✅
- [x] Fixed 2→4→1 canvas network diagram
- [x] Blue/red edges by weight sign, width by magnitude
- [x] Activation mode toggle: Sigmoid (solves XOR) vs Linear (fails XOR)
- [x] XOR input selector — 4 cases
- [x] Layered forward pass animation (400ms per layer)
- [x] Output node colour: green=correct, red=wrong
- [x] Live result in footer with ✓/✗ verdict

---

## Phase 2 — v1: Full Module Suite
**Goal:** All 10 modules complete. Shareable, polished, persistent.

### Modules to implement
- [ ] `data-shape` — Distributions, correlation, dimensionality curse visualized
- [ ] `decision-forest` — Growing tree, depth control, 100-tree random forest toggle
- [ ] `convolution-engine` — ConvolutionScope with webcam support
- [ ] `attention-chamber` — AttentionGraph with real tokenizer, head switching
- [ ] `embedding-universe` — Three.js 3D word star map (GloVe 5K, PCA→3D baked JSON)
- [ ] `evaluation-observatory` — Threshold slider → confusion matrix → ROC curve

### v1 Platform Features
- [ ] Beginner / Researcher toggle (controls Dr. Vector briefing density)
- [ ] Keyboard shortcuts (space: pause/resume, arrows: scrub sliders)
- [ ] Share config — URL encodes current parameter state
- [ ] Lobby mark as "complete" after placing 10+ points

---

## Phase 3 — v2: Depth & Retention
**Goal:** Reasons to return. The app becomes a tool.

- [ ] `generative-studio` — Mini GAN on pixel art dataset
- [ ] "Your Dataset" mode — paste CSV, run modules on your own data
- [ ] Experiment History — replay last 20 experiments per module, side-by-side compare
- [ ] Challenge Mode — "reach loss < 0.01 in 50 epochs" type goals
- [ ] Annotation layer — draw notes pinned to parameter configs
- [ ] Offline support — service worker, all assets cached after first load
- [ ] Dark/light theme toggle

---

## Module Registry

| ID | Title | Phase | Status |
|----|-------|-------|--------|
| `home` | Home (Mosaic) | 0 | ✅ Live |
| `lobby` | The Lobby | 0 | ✅ Live |
| `bias-variance` | Bias/Variance Lab | 1 | ✅ Live |
| `gradient-descent` | Gradient Descent Terrain | 1 | ✅ Live |
| `neural-architecture` | Neural Architecture Hall | 1 | ✅ Live |
| `data-shape` | Shape of Data | 2 | 🔲 Stub |
| `decision-forest` | Decision Forest | 2 | 🔲 Stub |
| `convolution-engine` | Convolution Engine | 2 | 🔲 Stub |
| `attention-chamber` | Attention Chamber | 2 | 🔲 Stub |
| `embedding-universe` | Embedding Universe | 2 | 🔲 Stub |
| `evaluation-observatory` | Evaluation Observatory | 2 | 🔲 Stub |
| `generative-studio` | Generative Studio | 3 | 🔲 Stub |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/core/state.js` | Observable AppState — everything subscribes to this |
| `src/core/router.js` | Hash router — module loading, URL params |
| `src/modules/index.js` | Module registry — add new modules here |
| `src/components/ExperimentCanvas/` | Canvas lifecycle — all modules use this |
| `src/components/ProgressMosaic/` | Home screen + crystal animations |
| `CLAUDE.md` | Project conventions for Claude Code |
