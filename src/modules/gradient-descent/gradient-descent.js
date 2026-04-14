import './gradient-descent.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ParameterPanel } from '../../components/ParameterPanel/ParameterPanel.js';
import { NarrativeOverlay } from '../../components/NarrativeOverlay/NarrativeOverlay.js';
import { buildModulePage } from '../_layout.js';
import { markVisited } from '../../core/progress.js';
import { clamp } from '../../utils/math.js';
import { MODULES } from '../index.js';

// ── Loss landscape: elongated bowl  L = 0.1x² + y² ─────────────────────────
// This is *perfect* for the SGD vs Adam demo:
// SGD zigzags in the steep y direction; Adam converges smoothly.

const RANGE = 4;   // world coords: -RANGE to +RANGE
const HEIGHT_SCALE = 0.4;

function lossAt(x, y) {
  return 0.1 * x * x + y * y;
}

function gradAt(x, y) {
  return { gx: 0.2 * x, gy: 2 * y };
}

function lossToHeight(l) {
  return l * HEIGHT_SCALE;
}

// ── Optimizers ───────────────────────────────────────────────────────────────

class SGD {
  constructor(lr) { this.lr = lr; }
  step(x, y, gx, gy) { return { x: x - this.lr * gx, y: y - this.lr * gy }; }
  reset() {}
}

class Momentum {
  constructor(lr, mom = 0.85) { this.lr = lr; this.mom = mom; this.vx = 0; this.vy = 0; }
  step(x, y, gx, gy) {
    this.vx = this.mom * this.vx + this.lr * gx;
    this.vy = this.mom * this.vy + this.lr * gy;
    return { x: x - this.vx, y: y - this.vy };
  }
  reset() { this.vx = 0; this.vy = 0; }
}

class Adam {
  constructor(lr) {
    this.lr = lr; this.b1 = 0.9; this.b2 = 0.999; this.eps = 1e-8;
    this.mx = 0; this.my = 0; this.vx = 0; this.vy = 0; this.t = 0;
  }
  step(x, y, gx, gy) {
    this.t++;
    this.mx = this.b1 * this.mx + (1 - this.b1) * gx;
    this.my = this.b1 * this.my + (1 - this.b1) * gy;
    this.vx = this.b2 * this.vx + (1 - this.b2) * gx * gx;
    this.vy = this.b2 * this.vy + (1 - this.b2) * gy * gy;
    const mxh = this.mx / (1 - this.b1 ** this.t);
    const myh = this.my / (1 - this.b1 ** this.t);
    const vxh = this.vx / (1 - this.b2 ** this.t);
    const vyh = this.vy / (1 - this.b2 ** this.t);
    return {
      x: x - this.lr * mxh / (Math.sqrt(vxh) + this.eps),
      y: y - this.lr * myh / (Math.sqrt(vyh) + this.eps),
    };
  }
  reset() { this.mx = 0; this.my = 0; this.vx = 0; this.vy = 0; this.t = 0; }
}

function makeOptimizer(type, lr) {
  if (type === 'momentum') return new Momentum(lr);
  if (type === 'adam')     return new Adam(lr);
  return new SGD(lr);
}

// ── Three.js terrain ─────────────────────────────────────────────────────────

const SEGS = 80;
const START = { x: -3.5, y: 2.5 };

function buildTerrain() {
  const geo = new THREE.PlaneGeometry(RANGE * 2, RANGE * 2, SEGS, SEGS);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colorArr = new Float32Array(pos.count * 3);

  let maxLoss = 0;
  const losses = [];
  for (let i = 0; i < pos.count; i++) {
    const l = lossAt(pos.getX(i), pos.getZ(i));
    losses.push(l);
    maxLoss = Math.max(maxLoss, l);
  }

  for (let i = 0; i < pos.count; i++) {
    const l = losses[i];
    pos.setY(i, lossToHeight(l));
    const t = clamp(l / maxLoss, 0, 1);
    // green → yellow → red
    colorArr[i * 3]     = t < 0.5 ? 2 * t : 1;
    colorArr[i * 3 + 1] = t < 0.5 ? 1 : 2 * (1 - t);
    colorArr[i * 3 + 2] = 0.15;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.7,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geo, mat);
}

function hikerY(x, z) {
  return lossToHeight(lossAt(x, z)) + 0.18;
}

function buildHiker() {
  const geo = new THREE.SphereGeometry(0.12, 20, 20);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x00d4ff,
    emissive: 0x00d4ff,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });
  const mesh = new THREE.Mesh(geo, mat);

  // Glow ring
  const ringGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.4 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  mesh.add(ring);

  return mesh;
}

// ── Trail ────────────────────────────────────────────────────────────────────

const MAX_TRAIL = 600;

function createTrailManager(scene) {
  const pts = [];
  let line = null;

  function update(x, z) {
    pts.push(x, hikerY(x, z) - 0.06, z);
    if (pts.length > MAX_TRAIL * 3) pts.splice(0, 3);

    if (line) { line.geometry.dispose(); scene.remove(line); }
    if (pts.length < 6) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const mat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.55 });
    line = new THREE.Line(geo, mat);
    scene.add(line);
  }

  function clear() {
    pts.length = 0;
    if (line) { line.geometry.dispose(); scene.remove(line); line = null; }
  }

  return { update, clear };
}

// ── mount ─────────────────────────────────────────────────────────────────────

export function mount(container, _params) {
  markVisited('gradient-descent');
  const mod = MODULES.find(m => m.id === 'gradient-descent');
  const { body, briefingBtn, setFooterStats } = buildModulePage({
    title: 'Gradient Descent Terrain', phase: 1,
    prevSlug: 'bias-variance', prevLabel: 'Bias/Variance',
    nextSlug: 'neural-architecture', nextLabel: 'Neural Architecture',
    container,
  });

  // Three.js container
  const threeWrap = document.createElement('div');
  threeWrap.className = 'gd-three-wrap';
  body.appendChild(threeWrap);

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080a12);
  scene.fog = new THREE.Fog(0x080a12, 18, 30);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 5);
  scene.add(ambient, dirLight);

  // Grid at y=0
  const gridHelper = new THREE.GridHelper(RANGE * 2, 20, 0x1a2040, 0x0d1020);
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);

  // Terrain
  const terrain = buildTerrain();
  scene.add(terrain);

  // Minimum marker (green glowing sphere at 0,0)
  const minGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const minMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1 });
  const minMarker = new THREE.Mesh(minGeo, minMat);
  minMarker.position.set(0, lossToHeight(0) + 0.1, 0);
  scene.add(minMarker);

  // Hiker
  const hiker = buildHiker();
  hiker.position.set(START.x, hikerY(START.x, START.y), START.y);
  scene.add(hiker);

  // Trail
  const trail = createTrailManager(scene);

  // Camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 10, 12);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  threeWrap.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 4;
  controls.maxDistance = 22;
  controls.target.set(0, 1, 0);

  const ro = new ResizeObserver(() => {
    const { width, height } = threeWrap.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  ro.observe(threeWrap);

  // ── Optimizer state ──
  let optimType = 'sgd', lr = 0.1, stepsPerFrame = 1;
  let running = false, steps = 0;
  let pos = { x: START.x, y: START.y };
  let optimizer = makeOptimizer(optimType, lr);

  function resetHiker() {
    pos = { x: START.x, y: START.y };
    optimizer = makeOptimizer(optimType, lr);
    optimizer.reset();
    steps = 0;
    running = false;
    hiker.position.set(pos.x, hikerY(pos.x, pos.y), pos.y);
    trail.clear();
    updateStats();
  }

  function updateStats() {
    const l = lossAt(pos.x, pos.y);
    setFooterStats([
      { label: 'Loss', value: l.toFixed(4) },
      { label: 'Steps', value: String(steps) },
      { label: 'w₁', value: pos.x.toFixed(3) },
      { label: 'w₂', value: pos.y.toFixed(3) },
    ]);
  }

  // ── Animation loop ──
  let rafId;
  let t = 0;

  function animate() {
    rafId = requestAnimationFrame(animate);
    t += 0.02;

    // Pulse hiker glow ring
    if (hiker.children[0]) {
      hiker.children[0].scale.setScalar(1 + 0.15 * Math.sin(t * 3));
      hiker.children[0].material.opacity = running ? 0.6 + 0.2 * Math.sin(t * 4) : 0.3;
    }

    if (running) {
      for (let i = 0; i < stepsPerFrame; i++) {
        const { gx, gy } = gradAt(pos.x, pos.y);
        const next = optimizer.step(pos.x, pos.y, gx, gy);
        pos.x = clamp(next.x, -(RANGE - 0.1), RANGE - 0.1);
        pos.y = clamp(next.y, -(RANGE - 0.1), RANGE - 0.1);
        steps++;
        trail.update(pos.x, pos.y);
      }
      hiker.position.set(pos.x, hikerY(pos.x, pos.y), pos.y);
      updateStats();

      // Stop near minimum
      if (lossAt(pos.x, pos.y) < 0.0001) running = false;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // ── Parameter panel ──
  const panel = new ParameterPanel([
    { type: 'select', key: 'optimizer', label: 'Optimizer', default: 'sgd',
      options: [
        { value: 'sgd',      label: 'SGD' },
        { value: 'momentum', label: 'SGD + Momentum' },
        { value: 'adam',     label: 'Adam' },
      ] },
    { type: 'slider', key: 'lr',    label: 'Learning Rate', min: 0.01, max: 1.5, step: 0.01, default: 0.1, unit: '' },
    { type: 'slider', key: 'speed', label: 'Speed', min: 1, max: 20, step: 1, default: 1, unit: '×' },
    { type: 'divider' },
    { type: 'button', key: 'run',   label: '▶ Run / Pause' },
    { type: 'button', key: 'reset', label: '↺ Reset Hiker' },
  ]);

  panel.on((key, val) => {
    if (key === 'optimizer') { optimType = val; resetHiker(); }
    if (key === 'lr')        { lr = parseFloat(val); optimizer = makeOptimizer(optimType, lr); optimizer.reset(); }
    if (key === 'speed')     { stepsPerFrame = parseInt(val); }
    if (key === 'run')       { running = !running; }
    if (key === 'reset')     { resetHiker(); }
  });

  panel.mount(body);
  updateStats();

  // ── Narrative ──
  let overlay = null;
  function showNarrative() {
    overlay?.destroy();
    overlay = new NarrativeOverlay({ text: mod.narrative, onDismiss: () => { overlay = null; } });
    overlay.mount(body);
  }
  showNarrative();
  briefingBtn.addEventListener('click', showNarrative);

  return () => {
    running = false;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    controls.dispose();
    renderer.dispose();
    overlay?.destroy();
  };
}
