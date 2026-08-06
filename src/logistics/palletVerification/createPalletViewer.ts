// @ts-nocheck — ported from logistics-mock/3d-pallet-verification/pallet-viewer.js
/**
 * Full WebGL 3D pallet viewer (Three.js).
 * Builds a real volumetric pallet + stacked boxes — not a flat CSS mock.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const BOX_W = 1.0;
const BOX_D = 0.85;
const BOX_H = 0.72;
const GAP = 0.04;
const COLS = 4;
const ROWS = 4;

export function createPalletViewer(container, options = {}) {
  const layers = options.layers ?? 6;
  const boxesPerLayer = options.boxesPerLayer ?? 16;

  let renderer;
  let scene;
  let camera;
  let controls;
  let palletGroup;
  let layerGroups = [];
  let tieGroup;
  let wrapGroup;
  let animId = 0;
  let disposed = false;

  const state = {
    layerHighlight: 0,
    exploded: false,
    showTies: false,
  };

  function init() {
    const w = container.clientWidth || 640;
    const h = container.clientHeight || 380;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f2744);
    scene.fog = new THREE.Fog(0x0f2744, 18, 42);

    camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(7.5, 6.2, 8.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.borderRadius = '12px';
    renderer.domElement.setAttribute('aria-label', '3D pallet model');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 22;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 2.2, 0);
    controls.update();

    addLights();
    addFloor();
    buildPallet();
    setView('iso');

    window.addEventListener('resize', onResize);
    animate();
  }

  function addLights() {
    const hemi = new THREE.HemisphereLight(0xb8d4f0, 0x3d2b1f, 0.85);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(8, 14, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x7dd3fc, 0.35);
    fill.position.set(-6, 4, -4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xfff1d6, 0.25);
    rim.position.set(0, 3, -8);
    scene.add(rim);
  }

  function addFloor() {
    const grid = new THREE.GridHelper(20, 20, 0x1e4976, 0x163a5c);
    grid.position.y = 0;
    scene.add(grid);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(12, 48),
      new THREE.MeshStandardMaterial({
        color: 0x0a1c30,
        roughness: 0.95,
        metalness: 0.05,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  function woodMaterial(hex, roughness = 0.85) {
    return new THREE.MeshStandardMaterial({
      color: hex,
      roughness,
      metalness: 0.05,
    });
  }

  function boxMaterial(opts = {}) {
    return new THREE.MeshStandardMaterial({
      color: opts.color ?? 0xe8eef4,
      roughness: 0.72,
      metalness: 0.08,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0,
    });
  }

  function buildPalletBase() {
    const base = new THREE.Group();
    base.name = 'palletBase';

    const deckW = COLS * (BOX_W + GAP) - GAP + 0.2;
    const deckD = ROWS * (BOX_D + GAP) - GAP + 0.2;
    const plankH = 0.12;
    const stringerH = 0.28;

    // Three stringers (runners)
    const stringerMat = woodMaterial(0x5c3a1e);
    for (let i = 0; i < 3; i++) {
      const z = -deckD / 2 + 0.15 + (i * (deckD - 0.3)) / 2;
      const s = new THREE.Mesh(
        new THREE.BoxGeometry(deckW, stringerH, 0.18),
        stringerMat,
      );
      s.position.set(0, stringerH / 2, z);
      s.castShadow = true;
      s.receiveShadow = true;
      base.add(s);
    }

    // Top deck boards
    const deckMat = woodMaterial(0x8b5a2b, 0.8);
    const boardCount = 7;
    const boardW = deckW / boardCount - 0.04;
    for (let i = 0; i < boardCount; i++) {
      const x = -deckW / 2 + boardW / 2 + 0.02 + i * (boardW + 0.04);
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(boardW, plankH, deckD),
        deckMat,
      );
      board.position.set(x, stringerH + plankH / 2, 0);
      board.castShadow = true;
      board.receiveShadow = true;
      base.add(board);
    }

    // Bottom boards (partial)
    for (let i = 0; i < 3; i++) {
      const x = -deckW / 2 + 0.3 + i * ((deckW - 0.6) / 2);
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, plankH * 0.8, deckD),
        woodMaterial(0x6b4423),
      );
      board.position.set(x, plankH * 0.4, 0);
      board.castShadow = true;
      board.receiveShadow = true;
      base.add(board);
    }

    base.userData.topY = stringerH + plankH;
    base.userData.deckW = deckW;
    base.userData.deckD = deckD;
    return base;
  }

  function buildBoxMesh(layerIndex, col, row) {
    const geo = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D);
    const isDamage = layerIndex === 2 && col === 3 && row === 0;
    const mat = boxMaterial({
      color: isDamage ? 0xf87171 : 0xe2e8f0,
      emissive: isDamage ? 0x7f1d1d : 0x000000,
      emissiveIntensity: isDamage ? 0.15 : 0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { layerIndex, col, row, isDamage, baseMat: mat };

    // Edge lines for box definition
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: isDamage ? 0x991b1b : 0x64748b }),
    );
    mesh.add(line);

    // Front label sticker on outer-facing boxes
    if (row === 0) {
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(BOX_W * 0.55, BOX_H * 0.35),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.4,
          metalness: 0.1,
          emissive: 0x0ea5e9,
          emissiveIntensity: 0.08,
        }),
      );
      label.position.set(0, 0.05, BOX_D / 2 + 0.01);
      mesh.add(label);
    }

    return mesh;
  }

  function buildPallet() {
    if (palletGroup) scene.remove(palletGroup);
    palletGroup = new THREE.Group();
    palletGroup.name = 'pallet';

    const base = buildPalletBase();
    palletGroup.add(base);

    const topY = base.userData.topY;
    const cols = Math.round(Math.sqrt(boxesPerLayer));
    const rows = Math.ceil(boxesPerLayer / cols);
    layerGroups = [];

    const totalW = cols * (BOX_W + GAP) - GAP;
    const totalD = rows * (BOX_D + GAP) - GAP;

    for (let L = 0; L < layers; L++) {
      const layer = new THREE.Group();
      layer.name = `layer-${L}`;
      layer.userData.layerIndex = L;
      layer.userData.baseY = topY + BOX_H / 2 + L * (BOX_H + GAP * 0.5);

      let n = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (n >= boxesPerLayer) break;
          const box = buildBoxMesh(L, c, r);
          const x = -totalW / 2 + BOX_W / 2 + c * (BOX_W + GAP);
          const z = -totalD / 2 + BOX_D / 2 + r * (BOX_D + GAP);
          box.position.set(x, 0, z);
          layer.add(box);
          n += 1;
        }
      }

      layer.position.y = layer.userData.baseY;
      layerGroups.push(layer);
      palletGroup.add(layer);
    }

    // Stretch wrap (semi-transparent shell)
    wrapGroup = new THREE.Group();
    wrapGroup.visible = false;
    const wrapH = layers * (BOX_H + GAP * 0.5);
    const wrap = new THREE.Mesh(
      new THREE.BoxGeometry(totalW + 0.12, wrapH, totalD + 0.12),
      new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.22,
        roughness: 0.2,
        metalness: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    wrap.position.y = topY + wrapH / 2;
    wrapGroup.add(wrap);
    palletGroup.add(wrapGroup);

    // Lashing / tie bands
    tieGroup = new THREE.Group();
    tieGroup.visible = false;
    const tieMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xb45309,
      emissiveIntensity: 0.35,
      roughness: 0.4,
      metalness: 0.2,
    });
    [2, 4].forEach((L) => {
      const y = topY + BOX_H / 2 + L * (BOX_H + GAP * 0.5);
      const strapFront = new THREE.Mesh(
        new THREE.BoxGeometry(totalW + 0.15, 0.07, 0.06),
        tieMat,
      );
      strapFront.position.set(0, y, totalD / 2 + 0.05);
      const strapBack = strapFront.clone();
      strapBack.position.z = -totalD / 2 - 0.05;
      const strapLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.07, totalD + 0.15),
        tieMat,
      );
      strapLeft.position.set(-totalW / 2 - 0.05, y, 0);
      const strapRight = strapLeft.clone();
      strapRight.position.x = totalW / 2 + 0.05;
      tieGroup.add(strapFront, strapBack, strapLeft, strapRight);
    });
    palletGroup.add(tieGroup);

    scene.add(palletGroup);
    applyLayerState();
  }

  function applyLayerState() {
    layerGroups.forEach((layer, i) => {
      const idx = i + 1;
      const highlight = state.layerHighlight === idx;
      const dimOthers = state.layerHighlight > 0 && !highlight;

      layer.position.y = layer.userData.baseY + (state.exploded ? i * 0.85 : 0);
      layer.visible = true;

      layer.traverse((obj) => {
        if (obj.isMesh && obj.userData?.baseMat) {
          if (highlight) {
            obj.material = boxMaterial({
              color: obj.userData.isDamage ? 0xf87171 : 0x7dd3fc,
              emissive: 0x0284c7,
              emissiveIntensity: 0.35,
            });
          } else if (dimOthers) {
            obj.material = boxMaterial({
              color: 0x64748b,
              emissive: 0x000000,
              emissiveIntensity: 0,
            });
            obj.material.transparent = true;
            obj.material.opacity = 0.28;
          } else {
            obj.material = boxMaterial({
              color: obj.userData.isDamage ? 0xf87171 : 0xe2e8f0,
              emissive: obj.userData.isDamage ? 0x7f1d1d : 0x000000,
              emissiveIntensity: obj.userData.isDamage ? 0.15 : 0,
            });
          }
        }
      });
    });

    if (tieGroup) tieGroup.visible = state.showTies;
    if (wrapGroup) wrapGroup.visible = state.showTies;
  }

  function setView(name) {
    const views = {
      iso: { pos: [7.5, 6.2, 8.5], target: [0, 2.2, 0] },
      front: { pos: [0, 3.8, 11], target: [0, 2.2, 0] },
      side: { pos: [11, 3.8, 0], target: [0, 2.2, 0] },
      top: { pos: [0.01, 14, 0.01], target: [0, 0, 0] },
    };
    const v = views[name] ?? views.iso;
    camera.position.set(...v.pos);
    controls.target.set(...v.target);
    controls.update();
  }

  function cycleLayer() {
    state.layerHighlight = state.layerHighlight >= layers ? 0 : state.layerHighlight + 1;
    applyLayerState();
    return state.layerHighlight;
  }

  function toggleExplode() {
    state.exploded = !state.exploded;
    applyLayerState();
    return state.exploded;
  }

  function toggleTies() {
    state.showTies = !state.showTies;
    applyLayerState();
    return state.showTies;
  }

  function reset() {
    state.layerHighlight = 0;
    state.exploded = false;
    state.showTies = false;
    applyLayerState();
    setView('iso');
  }

  function onResize() {
    if (disposed || !container) return;
    const w = container.clientWidth || 640;
    const h = container.clientHeight || 380;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    if (disposed) return;
    animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  function dispose() {
    disposed = true;
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
    controls?.dispose();
    renderer?.dispose();
    if (renderer?.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  /** Call when the viewer screen becomes visible (layout may have been 0×0). */
  function refresh() {
    onResize();
    controls.update();
  }

  init();

  return {
    setView,
    cycleLayer,
    toggleExplode,
    toggleTies,
    reset,
    refresh,
    dispose,
    getState: () => ({ ...state }),
  };
}
