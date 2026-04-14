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

## Phase 1 — MVP: Three Core Modules
**Goal:** Three complete, polished, shareable modules. The concept proven.

### Module: Bias/Variance Lab (`bias-variance`)
- [ ] DataScatterboard — click to place points, auto-generate datasets (moons, circles, XOR)
- [ ] Polynomial regression via TF.js web worker
- [ ] Degree dial (1–12) — complexity slider
- [ ] Train/test split toggle with animated reveal
- [ ] Live train MSE vs test MSE display
- [ ] Dartboard metaphor panel

### Module: Gradient Descent Terrain (`gradient-descent`)
- [ ] TerrainRenderer — Three.js 2-param loss landscape (MSE on linear regression)
- [ ] Custom elevation shader (green low → red high)
- [ ] Optimizer selector: SGD, SGD+Momentum, Adam
- [ ] Learning rate slider with "too high" explosion mode
- [ ] "Drop hiker" — animated sphere descends
- [ ] Speed control, topographic view toggle

### Module: Neural Architecture Hall (`neural-architecture`, mini version)
- [ ] NetworkBuilder — drag-and-drop node-link diagram (2→4→1 default)
- [ ] Forward pass animation — activations light up
- [ ] XOR demo — fails with linear, succeeds with ReLU
- [ ] Backprop "blame" — edges glow red by gradient magnitude, animate backward

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
| `bias-variance` | Bias/Variance Lab | 1 | 🔲 Stub |
| `gradient-descent` | Gradient Descent Terrain | 1 | 🔲 Stub |
| `neural-architecture` | Neural Architecture Hall | 1 | 🔲 Stub |
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
