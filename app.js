'use strict';

const CELL_W = 82;
const CELL_H = 72;
const GAP = 10;
const AXIS = 58;
const TILE_STEP_X = CELL_W + GAP;
const TILE_STEP_Y = CELL_H + GAP;
const DEFAULT_Z_MAX = 130;
const DEFAULT_N_MAX = 250;
const IAEA_URL = 'https://www-nds.iaea.org/relnsd/v0/data?fields=ground_states&nuclides=all';
const OFFICIAL_CSV_URL = 'nuclides.csv';
const MAGIC_NUMBERS = [2, 8, 20, 28, 50, 82, 126, 184];

let Z_MAX = DEFAULT_Z_MAX;
let N_MAX = DEFAULT_N_MAX;
let CHART_W = 0;
let CHART_H = 0;

const ELEMENTS = [
  null,
  ['H','Hidrógeno'], ['He','Helio'], ['Li','Litio'], ['Be','Berilio'], ['B','Boro'], ['C','Carbono'], ['N','Nitrógeno'], ['O','Oxígeno'], ['F','Flúor'], ['Ne','Neón'],
  ['Na','Sodio'], ['Mg','Magnesio'], ['Al','Aluminio'], ['Si','Silicio'], ['P','Fósforo'], ['S','Azufre'], ['Cl','Cloro'], ['Ar','Argón'], ['K','Potasio'], ['Ca','Calcio'],
  ['Sc','Escandio'], ['Ti','Titanio'], ['V','Vanadio'], ['Cr','Cromo'], ['Mn','Manganeso'], ['Fe','Hierro'], ['Co','Cobalto'], ['Ni','Níquel'], ['Cu','Cobre'], ['Zn','Zinc'],
  ['Ga','Galio'], ['Ge','Germanio'], ['As','Arsénico'], ['Se','Selenio'], ['Br','Bromo'], ['Kr','Criptón'], ['Rb','Rubidio'], ['Sr','Estroncio'], ['Y','Itrio'], ['Zr','Circonio'],
  ['Nb','Niobio'], ['Mo','Molibdeno'], ['Tc','Tecnecio'], ['Ru','Rutenio'], ['Rh','Rodio'], ['Pd','Paladio'], ['Ag','Plata'], ['Cd','Cadmio'], ['In','Indio'], ['Sn','Estaño'],
  ['Sb','Antimonio'], ['Te','Telurio'], ['I','Yodo'], ['Xe','Xenón'], ['Cs','Cesio'], ['Ba','Bario'], ['La','Lantano'], ['Ce','Cerio'], ['Pr','Praseodimio'], ['Nd','Neodimio'],
  ['Pm','Prometio'], ['Sm','Samario'], ['Eu','Europio'], ['Gd','Gadolinio'], ['Tb','Terbio'], ['Dy','Disprosio'], ['Ho','Holmio'], ['Er','Erbio'], ['Tm','Tulio'], ['Yb','Iterbio'],
  ['Lu','Lutecio'], ['Hf','Hafnio'], ['Ta','Tántalo'], ['W','Wolframio'], ['Re','Renio'], ['Os','Osmio'], ['Ir','Iridio'], ['Pt','Platino'], ['Au','Oro'], ['Hg','Mercurio'],
  ['Tl','Talio'], ['Pb','Plomo'], ['Bi','Bismuto'], ['Po','Polonio'], ['At','Astato'], ['Rn','Radón'], ['Fr','Francio'], ['Ra','Radio'], ['Ac','Actinio'], ['Th','Torio'],
  ['Pa','Protactinio'], ['U','Uranio'], ['Np','Neptunio'], ['Pu','Plutonio'], ['Am','Americio'], ['Cm','Curio'], ['Bk','Berkelio'], ['Cf','Californio'], ['Es','Einstenio'], ['Fm','Fermio'],
  ['Md','Mendelevio'], ['No','Nobelio'], ['Lr','Lawrencio'], ['Rf','Rutherfordio'], ['Db','Dubnio'], ['Sg','Seaborgio'], ['Bh','Bohrio'], ['Hs','Hassio'], ['Mt','Meitnerio'], ['Ds','Darmstadtio'],
  ['Rg','Roentgenio'], ['Cn','Copernicio'], ['Nh','Nihonio'], ['Fl','Flerovio'], ['Mc','Moscovio'], ['Lv','Livermorio'], ['Ts','Teneso'], ['Og','Oganesón']
];

const DECAY_LABELS = {
  stable: 'Estable', 'beta-': 'β−', 'beta+/EC': 'β+/EC', alpha: 'α', sf: 'FE', p: 'p', n: 'n', it: 'IT', cluster: 'Clúster', unknown: 'Otro'
};

const PALETTES = {
  decay: { stable: '#dfead4', 'beta-': '#dce6f8', 'beta+/EC': '#f6dfdc', alpha: '#f5e3bd', sf: '#e4d8f7', p: '#f4d7c8', n: '#d7e9ea', it: '#dee0f7', cluster: '#ead9c2', unknown: '#e8e5dc' },
  stability: { stable: '#dcefd9', radioactive: '#f2dfcf', unknown: '#e8e5dc' },
  halflife: { stable: '#dcefd9', long: '#e9e4c8', medium: '#f1d7bd', short: '#efd0d4', unknown: '#e8e5dc' },
  abundance: { natural: '#dcefd9', trace: '#e9e4c8', none: '#e8e5dc' },
  quality: { evaluated: '#dfead4', isomer: '#dfe2fb', theoretical: '#eeeeee', unknown: '#e8e5dc' },
  signed: { positive: '#f1d7bd', negative: '#dce6f8', zero: '#e8e5dc', unknown: '#e8e5dc' },
  binding: { high: '#dcefd9', medium: '#e9e4c8', low: '#efd0d4', unknown: '#e8e5dc' }
};

const COLOR_MODES = [
  ['decay', 'Desintegración'], ['stability', 'Estabilidad'], ['halflife', 'Vida media'], ['quality', 'Calidad'],
  ['abundance', 'Abundancia'], ['binding', 'Enlace'], ['qalpha', 'Qα'], ['qbeta', 'Qβ−']
];

const state = {
  official: [], secondary: [], theoretical: [], all: [], byKey: new Map(), byCell: new Map(),
  selected: null, colorMode: 'decay',
  filters: {
    decay: new Set(['stable','beta-','beta+/EC','alpha','sf','p','n','it','cluster','unknown']),
    stability: new Set(['stable','radioactive','unknown']),
    halflife: new Set(['stable','long','medium','short','unknown']),
    quality: new Set(['evaluated','isomer','theoretical','unknown']),
    abundance: new Set(['natural','trace','none']),
    binding: new Set(['high','medium','low','unknown']),
    qalpha: new Set(['positive','negative','zero','unknown']),
    qbeta: new Set(['positive','negative','zero','unknown'])
  },
  layers: { evaluated: true, theoretical: true, isomer: true, magic: true, frontier: true, minimap: true, expert: true },
  scale: 1, tx: 0, ty: 0, fitScale: 1,
  dragging: false, dragStart: null, renderPending: false,
  activePointers: new Map(), pinch: null, lastTap: 0,
  atom: null, atomFrame: 0, animationEnabled: true,
  compare: []
};

const viewport = document.getElementById('viewport');
const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimapCanvas');
const miniCtx = minimapCanvas.getContext('2d');
const zoomValue = document.getElementById('zoomValue');
const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
const legendButton = document.getElementById('legendButton');
const legendPopover = document.getElementById('legendPopover');
const legendModes = document.getElementById('legendModes');
const legend = document.getElementById('legend');
const dataButton = document.getElementById('dataButton');
const dataPopover = document.getElementById('dataPopover');
const dataStatus = document.getElementById('dataStatus');
const searchTool = document.getElementById('searchTool');
const searchToggleButton = document.getElementById('searchToggleButton');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const darkModeButton = document.getElementById('darkModeButton');
const themeIcon = document.getElementById('themeIcon');
const cursorHud = document.getElementById('cursorHud');
const card = document.getElementById('nuclideCard');
const atomCanvas = document.getElementById('atomCanvas');
const atomCtx = atomCanvas.getContext('2d');
const csvInput = document.getElementById('csvInput');
const secondaryCsvInput = document.getElementById('secondaryCsvInput');
const loadIaeaButton = document.getElementById('loadIaeaButton');
const minimapPanel = document.getElementById('minimapPanel');
const compareTray = document.getElementById('compareTray');
const compareTable = document.getElementById('compareTable');

async function init() {
  updateChartMetrics();
  resizeCanvases();
  state.official = await loadInitialNuclides();
  rebuildDerivedData();
  bindEvents();
  renderLegend();
  fitToScreen(true);
  requestAnimationFrame(drawAtomLoop);
}

async function loadInitialNuclides() {
  const sources = [];
  try {
    const response = await fetch(OFFICIAL_CSV_URL, { cache: 'no-store' });
    if (response.ok) sources.push({ name: OFFICIAL_CSV_URL, text: await response.text() });
  } catch (_) {}
  if (window.EMBEDDED_NUCLIDES_CSV) sources.push({ name: 'nuclides.csv integrado', text: window.EMBEDDED_NUCLIDES_CSV });
  for (const source of sources) {
    try {
      const mapped = parseCsv(source.text).map(row => rowToNuclide(row, source.name, 'evaluated')).filter(n => n && n.z > 0);
      if (mapped.length) {
        dataStatus.textContent = `Cargados ${mapped.length.toLocaleString('es-ES')} nucleidos evaluados.`;
        return mapped;
      }
    } catch (_) {}
  }
  dataStatus.textContent = 'No se pudo leer nuclides.csv. Usando malla interna mínima.';
  return generateFallbackNuclides();
}

function rebuildDerivedData() {
  const base = [...state.official, ...state.secondary].filter(n => n.z > 0);
  updateBoundsFromData(base);
  const occupied = new Set(base.filter(n => n.dataClass !== 'isomer').map(n => `${n.z}-${n.n}`));
  state.theoretical = generateTheoreticalNuclides(occupied);
  state.all = [...state.theoretical, ...base].sort((a,b) => rankClass(a) - rankClass(b) || a.z - b.z || a.n - b.n || String(a.stateId).localeCompare(String(b.stateId)));
  indexNuclides();
  scheduleRender();
}

function rankClass(n) {
  if (n.dataClass === 'theoretical') return 0;
  if (n.dataClass === 'isomer') return 2;
  return 1;
}

function updateBoundsFromData(rows) {
  const maxZ = Math.max(DEFAULT_Z_MAX, ...rows.map(n => Number(n.z) || 0), 130) + 2;
  const maxN = Math.max(DEFAULT_N_MAX, ...rows.map(n => Number(n.n) || 0), 252) + 4;
  Z_MAX = Math.ceil(maxZ / 10) * 10;
  N_MAX = Math.ceil(maxN / 10) * 10;
  updateChartMetrics();
}

function updateChartMetrics() {
  CHART_W = AXIS + (N_MAX + 1) * TILE_STEP_X + 120;
  CHART_H = AXIS + Z_MAX * TILE_STEP_Y + 120;
}

function indexNuclides() {
  state.byKey.clear();
  state.byCell.clear();
  for (const n of state.all) {
    state.byKey.set(n.uid, n);
    const cell = `${n.z}-${n.n}`;
    if (!state.byCell.has(cell)) state.byCell.set(cell, []);
    state.byCell.get(cell).push(n);
  }
}

function generateTheoreticalNuclides(occupied) {
  const rows = [];
  for (let Z = 1; Z <= Z_MAX; Z++) {
    const center = stableNFor(Z);
    const width = Math.max(8, Math.round(11 + Z * 0.38));
    const minN = Math.max(0, center - width);
    const maxN = Math.min(N_MAX, center + width + Math.round(Z * 0.04));
    for (let N = minN; N <= maxN; N++) {
      const key = `${Z}-${N}`;
      if (occupied.has(key)) continue;
      if (!insideEstimatedNuclearBand(Z, N, center, width)) continue;
      const [symbol, element] = elementInfo(Z);
      const distance = Math.abs(N - center);
      const decay = estimateDecay(Z, N, center);
      const a = Z + N;
      rows.push({
        uid: `theory-${Z}-${N}`, z: Z, n: N, a, symbol, element, stateId: 'calc', dataClass: 'theoretical',
        decay, half_life: estimateHalfLife(decay, distance, Z), abundance: '—', atomic_mass: `≈${a} u`, spin: '—',
        q_value: '—', mass_excess: '—', binding: '—', sn: '—', sp: '—',
        notes: `Posición no observada en el CSV principal. Se muestra como extensión teórica/extrapolada para visualizar continuidad de la carta de nucleidos. No sustituye datos evaluados.`,
        applications: 'Interés teórico: frontera nuclear, modelos de masa, líneas de goteo y regiones de estabilidad.',
        wikipedia: Z <= 118 ? `https://es.wikipedia.org/wiki/Is%C3%B3topos_de_${encodeURIComponent(element)}` : 'https://es.wikipedia.org/wiki/Elemento_superpesado',
        livechart: `https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html?z=${Z}&n=${N}`,
        raw: { z: Z, n: N, a, symbol, data_class: 'theoretical' }
      });
    }
  }
  return rows;
}

function stableNFor(Z) { return Math.round(Z * (1 + 0.0056 * Z)); }
function insideEstimatedNuclearBand(Z, N, center, width) {
  const d = Math.abs(N - center);
  if (d <= width) return true;
  return MAGIC_NUMBERS.includes(N) && d <= width + 7;
}
function estimateDecay(Z, N, center = stableNFor(Z)) {
  if (Z > 118) return Math.abs(N - 184) < 14 ? 'sf' : 'alpha';
  if (Z > 106) return Math.abs(N - center) < 8 ? 'sf' : 'alpha';
  if (Z > 82 && Math.abs(N - center) <= 10) return 'alpha';
  if (N > center) return 'beta-';
  if (N < center) return 'beta+/EC';
  return 'unknown';
}
function estimateHalfLife(decay, distance, Z) {
  if (decay === 'stable') return 'Estable';
  if (distance <= 2 && Z < 84) return 'larga';
  if (distance <= 6) return 'media';
  return 'corta';
}

function elementInfo(Z) {
  if (Number(Z) === 0) return ['n', 'Neutrón'];
  if (ELEMENTS[Z]) return ELEMENTS[Z];
  return [systematicSymbol(Z), `Elemento ${Z}`];
}
function systematicSymbol(Z) {
  const roots = ['n','u','b','t','q','p','h','s','o','e'];
  return String(Z).split('').map(d => roots[Number(d)]).join('').replace(/^./, c => c.toUpperCase());
}

function renderLegend() {
  legendModes.innerHTML = '';
  legend.innerHTML = '';
  for (const [mode, label] of COLOR_MODES) {
    const b = document.createElement('button');
    b.className = `legend-mode-btn${state.colorMode === mode ? ' active' : ''}`;
    b.type = 'button'; b.textContent = label;
    b.addEventListener('click', () => { state.colorMode = mode; renderLegend(); scheduleRender(); });
    legendModes.appendChild(b);
  }
  const entries = legendEntriesForMode(state.colorMode);
  const active = state.filters[state.colorMode];
  for (const entry of entries) {
    const item = document.createElement('button');
    item.className = `legend-item${active.has(entry.key) ? '' : ' muted'}`;
    item.type = 'button';
    item.innerHTML = `<span class="legend-swatch" style="background:${entry.color}"></span><span>${entry.label}</span>`;
    item.addEventListener('click', () => {
      if (active.has(entry.key)) { if (active.size > 1) active.delete(entry.key); }
      else active.add(entry.key);
      renderLegend(); scheduleRender();
    });
    legend.appendChild(item);
  }
  syncLayerButtons();
}

function legendEntriesForMode(mode) {
  if (mode === 'stability') return [
    { key: 'stable', color: PALETTES.stability.stable, label: 'Estable' }, { key: 'radioactive', color: PALETTES.stability.radioactive, label: 'Radiactivo' }, { key: 'unknown', color: PALETTES.stability.unknown, label: 'Sin clasificar' }
  ];
  if (mode === 'halflife') return [
    { key: 'stable', color: PALETTES.halflife.stable, label: 'Estable' }, { key: 'long', color: PALETTES.halflife.long, label: 'Larga' }, { key: 'medium', color: PALETTES.halflife.medium, label: 'Media' }, { key: 'short', color: PALETTES.halflife.short, label: 'Corta' }, { key: 'unknown', color: PALETTES.halflife.unknown, label: 'Desconocido' }
  ];
  if (mode === 'quality') return [
    { key: 'evaluated', color: PALETTES.quality.evaluated, label: 'Evaluado' }, { key: 'isomer', color: PALETTES.quality.isomer, label: 'Isómero' }, { key: 'theoretical', color: PALETTES.quality.theoretical, label: 'No observado' }, { key: 'unknown', color: PALETTES.quality.unknown, label: 'Otro' }
  ];
  if (mode === 'abundance') return [
    { key: 'natural', color: PALETTES.abundance.natural, label: 'Natural' }, { key: 'trace', color: PALETTES.abundance.trace, label: 'Traza' }, { key: 'none', color: PALETTES.abundance.none, label: 'Sin abundancia' }
  ];
  if (mode === 'binding') return [
    { key: 'high', color: PALETTES.binding.high, label: 'Alta' }, { key: 'medium', color: PALETTES.binding.medium, label: 'Media' }, { key: 'low', color: PALETTES.binding.low, label: 'Baja' }, { key: 'unknown', color: PALETTES.binding.unknown, label: 'Sin dato' }
  ];
  if (mode === 'qalpha' || mode === 'qbeta') return [
    { key: 'positive', color: PALETTES.signed.positive, label: 'Positivo' }, { key: 'negative', color: PALETTES.signed.negative, label: 'Negativo' }, { key: 'zero', color: PALETTES.signed.zero, label: 'Cero' }, { key: 'unknown', color: PALETTES.signed.unknown, label: 'Sin dato' }
  ];
  return Object.entries(PALETTES.decay).map(([key, color]) => ({ key, color, label: DECAY_LABELS[key] || key }));
}

function syncLayerButtons() {
  toggleButtonState('evaluatedLayerButton', state.layers.evaluated);
  toggleButtonState('theoreticalLayerButton', state.layers.theoretical);
  toggleButtonState('isomerLayerButton', state.layers.isomer);
  toggleButtonState('magicLayerButton', state.layers.magic);
  toggleButtonState('frontierLayerButton', state.layers.frontier);
  toggleButtonState('minimapButton', state.layers.minimap);
  toggleButtonState('expertModeButton', state.layers.expert);
  minimapPanel.classList.toggle('hidden', !state.layers.minimap);
}
function toggleButtonState(id, active) { document.getElementById(id)?.classList.toggle('active', active); }

function resizeCanvases() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const mrect = minimapCanvas.getBoundingClientRect();
  minimapCanvas.width = Math.max(10, Math.floor(mrect.width * dpr));
  minimapCanvas.height = Math.max(10, Math.floor(mrect.height * dpr));
  miniCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function scheduleRender() {
  if (state.renderPending) return;
  state.renderPending = true;
  requestAnimationFrame(() => { state.renderPending = false; drawScene(); drawMinimap(); });
}

function drawScene() {
  const w = window.innerWidth, h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);
  drawWorldGrid(w, h);
  if (state.layers.magic) drawMagicLines();
  if (state.layers.frontier) drawFrontierLines();
  drawAxes();

  const visible = visibleWorldRect();
  for (const n of state.all) {
    if (!isRenderable(n)) continue;
    const rect = cellRect(n.z, n.n);
    if (rect.x > visible.x2 || rect.x + CELL_W < visible.x1 || rect.y > visible.y2 || rect.y + CELL_H < visible.y1) continue;
    drawNuclideCell(n, rect);
  }
}

function drawWorldGrid(w, h) {
  const visible = visibleWorldRect();
  const stepX = TILE_STEP_X, stepY = TILE_STEP_Y;
  if (state.scale < 0.09) return;
  ctx.save();
  ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.055)' : 'rgba(0,0,0,.055)';
  ctx.lineWidth = 1;
  const startN = Math.max(0, Math.floor((visible.x1 - AXIS) / stepX));
  const endN = Math.min(N_MAX, Math.ceil((visible.x2 - AXIS) / stepX));
  const startZrow = Math.max(0, Math.floor((visible.y1 - AXIS) / stepY));
  const endZrow = Math.min(Z_MAX, Math.ceil((visible.y2 - AXIS) / stepY));
  ctx.beginPath();
  for (let n = startN; n <= endN; n++) { const x = sx(AXIS + n * stepX + stepX/2); ctx.moveTo(x, 0); ctx.lineTo(x, h); }
  for (let r = startZrow; r <= endZrow; r++) { const y = sy(AXIS + r * stepY + stepY/2); ctx.moveTo(0, y); ctx.lineTo(w, y); }
  ctx.stroke();
  ctx.restore();
}

function drawMagicLines() {
  ctx.save();
  ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.30)' : 'rgba(30,30,30,.24)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([7, 7]);
  for (const N of MAGIC_NUMBERS) {
    if (N > N_MAX) continue;
    const x = sx(AXIS + N * TILE_STEP_X + TILE_STEP_X/2);
    ctx.beginPath(); ctx.moveTo(x, sy(AXIS)); ctx.lineTo(x, sy(AXIS + Z_MAX*TILE_STEP_Y)); ctx.stroke();
  }
  for (const Z of MAGIC_NUMBERS) {
    if (Z > Z_MAX) continue;
    const y = sy(AXIS + (Z_MAX - Z) * TILE_STEP_Y + TILE_STEP_Y/2);
    ctx.beginPath(); ctx.moveTo(sx(AXIS), y); ctx.lineTo(sx(AXIS + N_MAX*TILE_STEP_X), y); ctx.stroke();
  }
  ctx.restore();
}

function drawFrontierLines() {
  ctx.save();
  ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(123,97,255,.42)' : 'rgba(93,90,246,.28)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 6]);
  drawFrontierCurve(-1);
  drawFrontierCurve(1);
  ctx.restore();
}
function drawFrontierCurve(side) {
  ctx.beginPath();
  let started = false;
  for (let Z = 1; Z <= Z_MAX; Z += 2) {
    const c = stableNFor(Z), width = Math.max(8, Math.round(11 + Z * 0.38));
    const N = c + side * width;
    const x = sx(AXIS + N * TILE_STEP_X + TILE_STEP_X/2);
    const y = sy(AXIS + (Z_MAX - Z) * TILE_STEP_Y + TILE_STEP_Y/2);
    if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawAxes() {
  const visible = visibleWorldRect();
  ctx.save();
  ctx.font = '800 12px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = document.body.classList.contains('dark') ? 'rgba(240,240,246,.72)' : 'rgba(44,43,40,.58)';
  for (let N = 0; N <= N_MAX; N += 10) {
    const wx = AXIS + N * TILE_STEP_X + TILE_STEP_X/2;
    if (wx < visible.x1 - 200 || wx > visible.x2 + 200) continue;
    drawAxisPill(String(N), sx(wx), Math.max(22, sy(AXIS - 28)));
  }
  ctx.textAlign = 'right';
  for (let Z = 10; Z <= Z_MAX; Z += 10) {
    const wy = AXIS + (Z_MAX - Z) * TILE_STEP_Y + TILE_STEP_Y/2;
    if (wy < visible.y1 - 200 || wy > visible.y2 + 200) continue;
    drawAxisPill(String(Z), Math.max(28, sx(AXIS - 18)), sy(wy));
  }
  ctx.textAlign = 'left';
  drawAxisPill('N →', Math.max(26, sx(AXIS)), Math.max(22, sy(AXIS - 54)), 48);
  drawAxisPill('Z ↑', Math.max(26, sx(AXIS - 48)), Math.max(54, sy(AXIS - 20)), 48);
  ctx.restore();
}
function drawAxisPill(text, x, y, width = 38) {
  const h = 21;
  ctx.save();
  roundedRect(ctx, x - width/2, y - h/2, width, h, 999);
  ctx.fillStyle = document.body.classList.contains('dark') ? 'rgba(22,24,32,.58)' : 'rgba(255,255,255,.55)';
  ctx.fill();
  ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.08)';
  ctx.stroke();
  ctx.fillStyle = document.body.classList.contains('dark') ? 'rgba(240,240,246,.72)' : 'rgba(44,43,40,.58)';
  ctx.fillText(text, x, y+0.5);
  ctx.restore();
}

function drawNuclideCell(n, rect) {
  const x = sx(rect.x), y = sy(rect.y), w = CELL_W * state.scale, h = CELL_H * state.scale;
  const category = categoryForMode(n);
  const filtered = !(state.filters[state.colorMode] || new Set()).has(category);
  ctx.save();
  ctx.globalAlpha = filtered ? 0.16 : (n.dataClass === 'theoretical' ? 0.46 : 1);
  roundedRect(ctx, x, y, w, h, Math.max(4, 11 * state.scale));
  ctx.fillStyle = colorForNuclide(n);
  ctx.fill();
  ctx.lineWidth = Math.max(0.75, state.scale);
  ctx.strokeStyle = n.uid === state.selected?.uid ? 'rgba(93,90,246,.90)' : (n.dataClass === 'theoretical' ? 'rgba(40,40,40,.18)' : 'rgba(0,0,0,.10)');
  if (n.dataClass === 'theoretical') ctx.setLineDash([Math.max(2, 5*state.scale), Math.max(2, 4*state.scale)]);
  ctx.stroke();
  ctx.setLineDash([]);
  if (n.uid === state.selected?.uid) {
    ctx.lineWidth = Math.max(2, 3 * state.scale);
    ctx.strokeStyle = 'rgba(93,90,246,.72)';
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(16,16,16,.88)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (w > 16 && h > 14) {
    ctx.font = `${Math.max(8, Math.min(23, 21 * state.scale))}px system-ui, sans-serif`;
    ctx.font = `900 ${Math.max(8, Math.min(23, 21 * state.scale))}px system-ui, sans-serif`;
    ctx.fillText(n.symbol, x + w/2, y + h/2 + (w > 44 ? 1 : 0));
  }
  if (w > 50 && h > 45) {
    ctx.font = `800 ${Math.max(7, Math.min(10, 9 * state.scale))}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(26,26,26,.54)';
    ctx.textBaseline = 'top';
    ctx.fillText(String(n.a), x + w/2 - w*0.28, y + 5 * state.scale);
    ctx.fillText(`N${n.n}`, x + w/2 + w*0.26, y + 5 * state.scale);
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Z${n.z}`, x + w/2 - w*0.27, y + h - 5 * state.scale);
    ctx.fillText(DECAY_LABELS[n.decay] || n.decay, x + w/2 + w*0.26, y + h - 5 * state.scale);
  }
  const sameCell = state.byCell.get(`${n.z}-${n.n}`) || [];
  if (sameCell.some(x => x.dataClass === 'isomer') && w > 22) {
    ctx.fillStyle = '#5d5af6';
    ctx.beginPath(); ctx.arc(x + w - 8*state.scale, y + 8*state.scale, Math.max(2.4, 4*state.scale), 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function visibleWorldRect() {
  return { x1: (0 - state.tx) / state.scale, y1: (0 - state.ty) / state.scale, x2: (window.innerWidth - state.tx) / state.scale, y2: (window.innerHeight - state.ty) / state.scale };
}
function sx(x) { return state.tx + x * state.scale; }
function sy(y) { return state.ty + y * state.scale; }
function wx(x) { return (x - state.tx) / state.scale; }
function wy(y) { return (y - state.ty) / state.scale; }
function cellRect(Z, N) { return { x: AXIS + N * TILE_STEP_X + (TILE_STEP_X - CELL_W)/2, y: AXIS + (Z_MAX - Z) * TILE_STEP_Y + (TILE_STEP_Y - CELL_H)/2, w: CELL_W, h: CELL_H }; }
function roundedRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }

function isRenderable(n) {
  if (n.dataClass === 'theoretical' && !state.layers.theoretical) return false;
  if (n.dataClass === 'isomer' && !state.layers.isomer) return false;
  if (n.dataClass === 'evaluated' && !state.layers.evaluated) return false;
  return true;
}
function categoryForMode(n, mode = state.colorMode) {
  if (mode === 'stability') return stabilityCategory(n);
  if (mode === 'halflife') return halflifeCategory(n);
  if (mode === 'quality') return n.dataClass || 'unknown';
  if (mode === 'abundance') return abundanceCategory(n);
  if (mode === 'binding') return bindingCategory(n);
  if (mode === 'qalpha') return signedCategory(n.qa);
  if (mode === 'qbeta') return signedCategory(n.qbm);
  return n.decay || 'unknown';
}
function colorForNuclide(n) {
  const mode = state.colorMode;
  if (mode === 'stability') return PALETTES.stability[stabilityCategory(n)] || PALETTES.stability.unknown;
  if (mode === 'halflife') return PALETTES.halflife[halflifeCategory(n)] || PALETTES.halflife.unknown;
  if (mode === 'quality') return PALETTES.quality[n.dataClass] || PALETTES.quality.unknown;
  if (mode === 'abundance') return PALETTES.abundance[abundanceCategory(n)] || PALETTES.abundance.none;
  if (mode === 'binding') return PALETTES.binding[bindingCategory(n)] || PALETTES.binding.unknown;
  if (mode === 'qalpha') return PALETTES.signed[signedCategory(n.qa)] || PALETTES.signed.unknown;
  if (mode === 'qbeta') return PALETTES.signed[signedCategory(n.qbm)] || PALETTES.signed.unknown;
  return PALETTES.decay[n.decay] || PALETTES.decay.unknown;
}
function stabilityCategory(n) { if (!n || n.decay === 'unknown') return 'unknown'; return n.decay === 'stable' ? 'stable' : 'radioactive'; }
function halflifeCategory(n) {
  if (!n || n.dataClass === 'theoretical') return 'unknown';
  const sec = toNumber(n.half_life_sec);
  const h = String(n.half_life || '').toLowerCase();
  if (n.decay === 'stable' || h.includes('estable') || h.includes('stable')) return 'stable';
  if (Number.isFinite(sec)) { if (sec > 31557600) return 'long'; if (sec > 3600) return 'medium'; return 'short'; }
  if (h.includes('año') || h.includes('y') || h.includes('10')) return 'long';
  if (h.includes('d') || h.includes('h')) return 'medium';
  if (h.includes('s') || h.includes('ms') || h.includes('ns')) return 'short';
  return 'unknown';
}
function abundanceCategory(n) { const ab = numeric(n.abundance); if (!Number.isFinite(ab) || ab <= 0) return 'none'; if (ab < 0.01) return 'trace'; return 'natural'; }
function bindingCategory(n) { const b = numeric(n.binding); if (!Number.isFinite(b)) return 'unknown'; if (b >= 8200) return 'high'; if (b >= 7000) return 'medium'; return 'low'; }
function signedCategory(v) { const n = numeric(v); if (!Number.isFinite(n)) return 'unknown'; if (Math.abs(n) < 1e-9) return 'zero'; return n > 0 ? 'positive' : 'negative'; }

function drawMinimap() {
  if (!state.layers.minimap) return;
  const rect = minimapCanvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  miniCtx.clearRect(0, 0, w, h);
  miniCtx.fillStyle = document.body.classList.contains('dark') ? 'rgba(24,27,36,.72)' : 'rgba(255,255,255,.62)';
  miniCtx.fillRect(0, 0, w, h);
  const sxm = w / CHART_W, sym = h / CHART_H;
  for (const n of state.all) {
    if (n.dataClass === 'theoretical') continue;
    const r = cellRect(n.z, n.n);
    miniCtx.fillStyle = colorForNuclide(n);
    miniCtx.globalAlpha = 0.85;
    miniCtx.fillRect(r.x * sxm, r.y * sym, Math.max(1, CELL_W*sxm), Math.max(1, CELL_H*sym));
  }
  miniCtx.globalAlpha = 1;
  const v = visibleWorldRect();
  miniCtx.strokeStyle = '#5d5af6'; miniCtx.lineWidth = 2;
  miniCtx.strokeRect(v.x1*sxm, v.y1*sym, (v.x2-v.x1)*sxm, (v.y2-v.y1)*sym);
}

function fitToScreen(force = false) {
  const pad = 60;
  const sxv = (window.innerWidth - pad*2) / CHART_W;
  const syv = (window.innerHeight - pad*2) / CHART_H;
  state.fitScale = Math.min(sxv, syv);
  if (force || state.scale < state.fitScale) state.scale = state.fitScale;
  state.tx = (window.innerWidth - CHART_W * state.scale) / 2;
  state.ty = (window.innerHeight - CHART_H * state.scale) / 2;
  updateView();
}
function updateView() { clampTransform(); zoomValue.textContent = `${Math.round(state.scale / state.fitScale * 100)}%`; scheduleRender(); }
function clampTransform() {
  const viewW = window.innerWidth, viewH = window.innerHeight;
  const scaledW = CHART_W * state.scale, scaledH = CHART_H * state.scale;
  const margin = 80;
  if (scaledW <= viewW - margin*2) state.tx = (viewW - scaledW) / 2; else state.tx = Math.min(margin, Math.max(viewW - scaledW - margin, state.tx));
  if (scaledH <= viewH - margin*2) state.ty = (viewH - scaledH) / 2; else state.ty = Math.min(margin, Math.max(viewH - scaledH - margin, state.ty));
}
function zoomAt(clientX, clientY, factor) {
  const old = state.scale;
  const maxScale = Math.max(2.6, state.fitScale * 26);
  const next = Math.max(state.fitScale, Math.min(maxScale, old * factor));
  const chartX = (clientX - state.tx) / old;
  const chartY = (clientY - state.ty) / old;
  state.scale = next; state.tx = clientX - chartX * next; state.ty = clientY - chartY * next;
  updateView();
}

function bindEvents() {
  viewport.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.14 : 1/1.14); }, { passive: false });
  viewport.addEventListener('pointermove', e => { updateCursorHud(e); handlePointerMove(e); }, { passive: false });
  viewport.addEventListener('pointerleave', () => cursorHud.classList.remove('visible'));
  viewport.addEventListener('pointerdown', handlePointerDown, { passive: false });
  viewport.addEventListener('pointerup', handlePointerUp);
  viewport.addEventListener('pointercancel', handlePointerCancel);
  canvas.addEventListener('dblclick', e => { const n = hitTest(e.clientX, e.clientY); if (n) centerOnNuclide(n); else fitToScreen(true); });
  zoomInButton.addEventListener('click', e => { e.stopPropagation(); zoomAt(window.innerWidth/2, window.innerHeight/2, 1.25); });
  zoomOutButton.addEventListener('click', e => { e.stopPropagation(); zoomAt(window.innerWidth/2, window.innerHeight/2, 1/1.25); });
  legendButton.addEventListener('click', toggleLegendPopover);
  legendPopover.addEventListener('click', e => e.stopPropagation());
  dataButton.addEventListener('click', toggleDataPopover);
  dataPopover.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => { closeLegendPopover(); closeDataPopover(); closeSearchTool(); });
  searchToggleButton.addEventListener('click', e => { e.stopPropagation(); toggleSearchTool(); });
  searchTool.addEventListener('click', e => e.stopPropagation());
  searchButton.addEventListener('click', runSearch);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
  darkModeButton.addEventListener('click', e => { e.stopPropagation(); setDarkMode(!document.body.classList.contains('dark')); scheduleRender(); drawAtom(performance.now()); });
  csvInput.addEventListener('change', handleCsvInput);
  secondaryCsvInput.addEventListener('change', handleSecondaryInput);
  loadIaeaButton.addEventListener('click', loadIaeaData);
  for (const [id, key] of [['evaluatedLayerButton','evaluated'],['theoreticalLayerButton','theoretical'],['isomerLayerButton','isomer'],['magicLayerButton','magic'],['frontierLayerButton','frontier'],['minimapButton','minimap'],['expertModeButton','expert']]) {
    document.getElementById(id)?.addEventListener('click', () => { state.layers[key] = !state.layers[key]; syncLayerButtons(); scheduleRender(); if (state.selected) fillDetail(state.selected); });
  }
  document.querySelectorAll('.tab-button').forEach(b => b.addEventListener('click', () => activateTab(b.dataset.tab)));
  document.getElementById('addCompareButton').addEventListener('click', () => addSelectedToCompare());
  document.getElementById('exportCardButton').addEventListener('click', exportSelectedCardPng);
  document.getElementById('clearCompareButton').addEventListener('click', () => { state.compare = []; renderCompare(); });
  atomCanvas.addEventListener('click', e => { e.stopPropagation(); state.animationEnabled = !state.animationEnabled; atomCanvas.classList.toggle('paused', !state.animationEnabled); });
  window.addEventListener('resize', () => { resizeCanvases(); fitToScreen(false); resizeAtomCanvas(); scheduleRender(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeNuclideCard(); closeLegendPopover(); closeDataPopover(); closeSearchTool(); } });
}

function handlePointerDown(e) {
  e.preventDefault();
  viewport.setPointerCapture(e.pointerId);
  state.activePointers.set(e.pointerId, { pointerId: e.pointerId, pointerType: e.pointerType, x: e.clientX, y: e.clientY });
  if (startPinchIfPossible()) return;
  state.dragging = true;
  state.dragStart = { x: e.clientX, y: e.clientY, tx: state.tx, ty: state.ty, moved: false, time: performance.now() };
  viewport.classList.add('dragging');
}
function handlePointerMove(e) {
  if (state.activePointers.has(e.pointerId)) state.activePointers.set(e.pointerId, { pointerId: e.pointerId, pointerType: e.pointerType, x: e.clientX, y: e.clientY });
  if (updatePinchZoom()) return;
  if (!state.dragging || !state.dragStart || state.pinch) return;
  const dx = e.clientX - state.dragStart.x, dy = e.clientY - state.dragStart.y;
  if (Math.hypot(dx, dy) > 4) state.dragStart.moved = true;
  state.tx = state.dragStart.tx + dx; state.ty = state.dragStart.ty + dy;
  updateView();
}
function handlePointerUp(e) {
  const wasPinch = Boolean(state.pinch);
  state.activePointers.delete(e.pointerId);
  if (state.activePointers.size < 2) state.pinch = null;
  if (wasPinch) { endDrag(); return; }
  const wasClick = state.dragStart && !state.dragStart.moved;
  endDrag();
  if (!wasClick) return;
  const now = performance.now();
  const tapped = now - state.lastTap < 290;
  state.lastTap = now;
  const n = hitTest(e.clientX, e.clientY);
  if (n) { if (tapped) centerOnNuclide(n, 7); selectNuclide(n); }
  else closeNuclideCard();
}
function handlePointerCancel(e) { state.activePointers.delete(e.pointerId); state.pinch = null; endDrag(); }
function endDrag() { state.dragging = false; state.dragStart = null; viewport.classList.remove('dragging'); }
function touchPointers() { return [...state.activePointers.values()].filter(p => p.pointerType === 'touch'); }
function startPinchIfPossible() {
  const touches = touchPointers(); if (touches.length < 2) return false;
  const [a,b] = touches, d = Math.hypot(a.x-b.x, a.y-b.y); if (!d) return false;
  const c = { x: (a.x+b.x)/2, y: (a.y+b.y)/2 };
  state.pinch = { startDistance: d, startScale: state.scale, chartX: wx(c.x), chartY: wy(c.y) };
  endDrag(); return true;
}
function updatePinchZoom() {
  const touches = touchPointers(); if (touches.length < 2 || !state.pinch) return false;
  const [a,b] = touches, d = Math.hypot(a.x-b.x, a.y-b.y); if (!d) return false;
  const c = { x: (a.x+b.x)/2, y: (a.y+b.y)/2 };
  const maxScale = Math.max(2.6, state.fitScale * 26);
  const ns = Math.max(state.fitScale, Math.min(maxScale, state.pinch.startScale * d / state.pinch.startDistance));
  state.scale = ns; state.tx = c.x - state.pinch.chartX * ns; state.ty = c.y - state.pinch.chartY * ns;
  updateView(); return true;
}

function hitTest(clientX, clientY) {
  const x = wx(clientX), y = wy(clientY);
  const N = Math.round((x - AXIS - TILE_STEP_X/2) / TILE_STEP_X);
  const Z = Z_MAX - Math.round((y - AXIS - TILE_STEP_Y/2) / TILE_STEP_Y);
  if (N < 0 || Z < 1 || N > N_MAX || Z > Z_MAX) return null;
  const r = cellRect(Z, N);
  if (x < r.x || x > r.x + CELL_W || y < r.y || y > r.y + CELL_H) return null;
  const list = (state.byCell.get(`${Z}-${N}`) || []).filter(isRenderable);
  if (!list.length) return null;
  return list.find(n => n.dataClass === 'evaluated') || list.find(n => n.dataClass === 'isomer') || list[0];
}
function updateCursorHud(e) {
  const x = wx(e.clientX), y = wy(e.clientY);
  const N = Math.round((x - AXIS - TILE_STEP_X/2) / TILE_STEP_X);
  const Z = Z_MAX - Math.round((y - AXIS - TILE_STEP_Y/2) / TILE_STEP_Y);
  if (N >= 0 && N <= N_MAX && Z >= 1 && Z <= Z_MAX) { cursorHud.textContent = `Z ${Z} · N ${N}`; cursorHud.classList.add('visible'); }
  else cursorHud.classList.remove('visible');
}
function centerOnNuclide(n, zoomMultiplier = 7) {
  const r = cellRect(n.z, n.n);
  const x = r.x + CELL_W/2, y = r.y + CELL_H/2;
  state.scale = Math.max(state.fitScale, Math.min(state.fitScale * zoomMultiplier, 1.85));
  state.tx = window.innerWidth/2 - x * state.scale;
  state.ty = window.innerHeight/2 - y * state.scale;
  updateView();
}

function selectNuclide(n) {
  state.selected = n; fillDetail(n); openCard(); state.atom = buildAtomState(n); resizeAtomCanvas(); drawAtom(performance.now()); scheduleRender();
}
function openCard() { card.classList.add('open'); card.setAttribute('aria-hidden', 'false'); }
function closeNuclideCard() { card.classList.remove('open'); card.setAttribute('aria-hidden', 'true'); state.selected = null; scheduleRender(); }
function activateTab(name) {
  document.querySelectorAll('.tab-button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === name));
}

function fillDetail(n) {
  setText('detailA', n.a); setText('detailZ', n.z); setText('detailSymbol', n.symbol); setText('detailName', n.element);
  setText('detailSubtitle', `${n.element}-${n.a}${n.stateId && n.stateId !== 'gs' ? ` · ${n.stateId}` : ''} · Z=${n.z} · N=${n.n}`);
  setText('detailClass', classLabel(n));
  setText('detailState', n.decay === 'stable' ? 'Estable' : `Radiactivo · ${DECAY_LABELS[n.decay] || n.decay}`);
  setText('detailHalfLife', n.half_life || '—'); setText('detailAbundance', n.abundance || '—'); setText('detailSpin', n.spin || '—');
  setText('detailDecayMode', DECAY_LABELS[n.decay] || n.decay || '—'); setText('detailQ', n.q_value || n.mass_excess || '—');
  const daughter = daughterOf(n); setText('detailDaughter', daughter ? `${daughter.symbol}-${daughter.a}` : '—');
  setText('detailMass', n.atomic_mass || '—'); setText('detailMassExcess', n.mass_excess || '—'); setText('detailBinding', n.binding || '—'); setText('detailSeparation', separationText(n));
  setText('detailProtons', n.z); setText('detailNeutrons', n.n); setText('detailElectrons', n.z); setText('detailMagic', magicText(n));
  setText('detailNotes', detailNotes(n)); setText('detailApplications', applicationText(n));
  setText('atomTitle', `${n.symbol}-${n.a}`); setText('nucleusText', `${n.z} p⁺ · ${n.n} n⁰`); setText('shellText', electronShells(n.z).join(' · '));
  document.getElementById('wikiLink').href = n.wikipedia || `https://es.wikipedia.org/wiki/Is%C3%B3topos_de_${encodeURIComponent(n.element)}`;
  document.getElementById('liveChartLink').href = n.livechart || `https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html?z=${n.z}&n=${n.n}`;
  renderMiniBars(n); renderDecayChain(n); renderRelations(n); renderRaw(n);
}
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value == null || value === '' ? '—' : value; }
function classLabel(n) { return n.dataClass === 'theoretical' ? 'No observado / teórico' : n.dataClass === 'isomer' ? 'Isómero' : 'Evaluado'; }
function detailNotes(n) { if (state.layers.expert) return n.notes || '—'; return educationalText(n); }
function educationalText(n) { return `${n.symbol}-${n.a} tiene ${n.z} protones y ${n.n} neutrones. ${n.decay === 'stable' ? 'Se clasifica como estable en los datos cargados.' : `Su modo principal mostrado es ${DECAY_LABELS[n.decay] || n.decay}.`}`; }
function magicText(n) { const parts = []; if (MAGIC_NUMBERS.includes(n.z)) parts.push(`Z=${n.z}`); if (MAGIC_NUMBERS.includes(n.n)) parts.push(`N=${n.n}`); return parts.length ? parts.join(' · ') : '—'; }
function separationText(n) { const s = []; if (n.sn && n.sn !== '—') s.push(`Sₙ ${n.sn}`); if (n.sp && n.sp !== '—') s.push(`Sₚ ${n.sp}`); return s.join(' · ') || '—'; }
function renderMiniBars(n) {
  const host = document.getElementById('miniBars'); host.innerHTML = '';
  const items = [ ['Abundancia', Math.min(100, Math.max(0, numeric(n.abundance) || 0)), '%'], ['Enlace', scaleValue(numeric(n.binding), 5000, 9000), 'rel.'], ['Z/N', Math.min(100, Math.max(0, n.z / Math.max(1, n.n) * 65)), 'rel.'] ];
  for (const [label, value, unit] of items) {
    const row = document.createElement('div'); row.className = 'mini-bar';
    row.innerHTML = `<span>${label}</span><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${Math.round(value)}%"></div></div><strong>${Number.isFinite(value) ? Math.round(value) : 0}${unit === '%' ? '%' : ''}</strong>`;
    host.appendChild(row);
  }
}
function scaleValue(v, min, max) { if (!Number.isFinite(v)) return 0; return Math.min(100, Math.max(0, (v-min)/(max-min)*100)); }
function renderDecayChain(n) {
  const host = document.getElementById('decayChain'); host.innerHTML = '';
  const chain = buildDecayChain(n, 9);
  if (!chain.length) { host.textContent = '—'; return; }
  chain.forEach(item => host.appendChild(chainChip(item)));
}
function renderRelations(n) {
  const host = document.getElementById('relationList'); host.innerHTML = '';
  const rels = relationNuclides(n);
  if (!rels.length) { host.textContent = '—'; return; }
  rels.forEach(item => host.appendChild(chainChip(item)));
}
function chainChip(n) { const b = document.createElement('button'); b.type = 'button'; b.className = 'chain-chip'; b.textContent = `${n.symbol}-${n.a}`; b.addEventListener('click', () => { selectNuclide(n); centerOnNuclide(n, 6); }); return b; }
function daughterOf(n) {
  let z = n.z, nn = n.n;
  if (n.decay === 'alpha') { z -= 2; nn -= 2; }
  else if (n.decay === 'beta-') { z += 1; nn -= 1; }
  else if (n.decay === 'beta+/EC') { z -= 1; nn += 1; }
  else if (n.decay === 'p') { z -= 1; }
  else if (n.decay === 'n') { nn -= 1; }
  else return null;
  const list = state.byCell.get(`${z}-${nn}`) || [];
  return list.find(x => x.dataClass !== 'theoretical') || list[0] || null;
}
function buildDecayChain(n, max) { const out = []; let cur = n; const seen = new Set([n.uid]); for (let i=0; i<max; i++) { const d = daughterOf(cur); if (!d || seen.has(d.uid)) break; out.push(d); seen.add(d.uid); cur = d; } return out; }
function relationNuclides(n) { const out = []; for (const cand of state.all) { const d = daughterOf(cand); if (d && d.z === n.z && d.n === n.n && out.length < 8) out.push(cand); } return out; }
function renderRaw(n) { const clone = { ...n }; delete clone.source; delete clone.uid; document.getElementById('rawDataBlock').textContent = JSON.stringify(clone.raw || clone, null, 2); }

function applicationText(n) {
  const id = `${n.symbol}-${n.a}`;
  const known = {
    'H-3': 'Trazadores, investigación de fusión y fuentes luminosas especializadas.', 'C-14': 'Datación radiocarbónica y trazadores biogeoquímicos.',
    'Co-60': 'Radioterapia, esterilización industrial y gammagrafía.', 'Tc-99': 'Medicina nuclear, especialmente el estado metaestable Tc-99m.',
    'I-131': 'Diagnóstico y tratamiento tiroideo.', 'Cs-137': 'Fuentes gamma, calibración e investigación.', 'U-235': 'Fisión con neutrones térmicos; combustible nuclear y física de reactores.',
    'U-238': 'Cadena natural de desintegración, datación y combustible fértil.', 'Pu-239': 'Fisión, física de reactores y salvaguardias nucleares.'
  };
  if (known[id]) return known[id];
  if (n.dataClass === 'theoretical') return 'Interés en modelos de masa, frontera nuclear, líneas de goteo e isla de estabilidad.';
  if (n.abundance && numeric(n.abundance) > 0) return 'Isótopo natural; interés geoquímico, analítico o metrológico según el elemento.';
  if (n.decay === 'alpha') return 'Emisor alfa; relevante en radioprotección, cadenas naturales y estudios de núcleos pesados.';
  if (n.decay === 'beta-' || n.decay === 'beta+/EC') return 'Emisor beta; puede ser relevante en trazadores, medicina nuclear o estudios de decaimiento.';
  return n.applications || 'Sin aplicación específica cargada en el dataset.';
}

function addSelectedToCompare() {
  if (!state.selected) return;
  if (!state.compare.some(n => n.uid === state.selected.uid)) state.compare.push(state.selected);
  if (state.compare.length > 4) state.compare.shift();
  renderCompare();
}
function renderCompare() {
  compareTray.classList.toggle('open', state.compare.length > 0);
  compareTray.setAttribute('aria-hidden', String(!state.compare.length));
  if (!state.compare.length) { compareTable.innerHTML = ''; return; }
  const rows = [['Clase','dataClass'],['Z','z'],['N','n'],['A','a'],['Vida media','half_life'],['Decaimiento','decay'],['Abundancia','abundance'],['Masa','atomic_mass'],['Spin','spin']];
  let html = '<table><thead><tr><th>Dato</th>' + state.compare.map(n => `<th>${escapeHtml(n.symbol)}-${n.a}</th>`).join('') + '</tr></thead><tbody>';
  for (const [label, field] of rows) html += `<tr><th>${label}</th>${state.compare.map(n => `<td>${escapeHtml(field === 'decay' ? (DECAY_LABELS[n.decay] || n.decay) : (n[field] || '—'))}</td>`).join('')}</tr>`;
  compareTable.innerHTML = html + '</tbody></table>';
}
function exportSelectedCardPng() {
  const n = state.selected; if (!n) return;
  const c = document.createElement('canvas'); c.width = 1100; c.height = 650; const g = c.getContext('2d');
  g.fillStyle = '#f7f5f0'; g.fillRect(0,0,c.width,c.height);
  g.fillStyle = '#222'; g.font = '900 80px system-ui'; g.fillText(`${n.symbol}-${n.a}`, 60, 120);
  g.font = '700 30px system-ui'; g.fillText(`${n.element} · Z=${n.z} · N=${n.n}`, 60, 170);
  g.font = '600 24px system-ui';
  const lines = [`Clase: ${classLabel(n)}`, `Vida media: ${n.half_life || '—'}`, `Decaimiento: ${DECAY_LABELS[n.decay] || n.decay || '—'}`, `Abundancia: ${n.abundance || '—'}`, `Masa: ${n.atomic_mass || '—'}`, `Spin/paridad: ${n.spin || '—'}`];
  lines.forEach((line, i) => g.fillText(line, 60, 245 + i*42));
  g.font = '500 22px system-ui'; wrapText(g, detailNotes(n), 60, 530, 980, 30);
  const a = document.createElement('a'); a.download = `${n.symbol}-${n.a}.png`; a.href = c.toDataURL('image/png'); a.click();
}
function wrapText(g, text, x, y, maxW, lh) { const words = String(text).split(/\s+/); let line = ''; for (const word of words) { const test = line ? `${line} ${word}` : word; if (g.measureText(test).width > maxW) { g.fillText(line, x, y); y += lh; line = word; } else line = test; } if (line) g.fillText(line, x, y); }

function runSearch() {
  const q = searchInput.value.trim(); if (!q) return;
  const found = findNuclide(q);
  if (!found) { dataStatus.textContent = `No he encontrado “${q}”.`; openDataPopover(); return; }
  selectNuclide(found); centerOnNuclide(found); closeSearchTool();
}
function findNuclide(query) {
  const q = query.trim().toLowerCase().replace(/\s+/g, '');
  let m = q.match(/^z=(\d+)$/); if (m) return state.all.find(n => n.z === Number(m[1]) && isRenderable(n));
  m = q.match(/^n=(\d+)$/); if (m) return state.all.find(n => n.n === Number(m[1]) && isRenderable(n));
  m = q.match(/^decay:([a-z+\-/αβ]+)$/); if (m) { const d = normalizeDecay(m[1], ''); return state.all.find(n => n.decay === d && isRenderable(n)); }
  m = q.match(/^([a-z]{1,3})-?(\d+)(m\d+)?$/i); if (m) { const s = normalizeSymbol(m[1]), A = Number(m[2]); return state.all.find(n => n.symbol === s && n.a === A && isRenderable(n)); }
  m = q.match(/^(\d+)-?([a-z]{1,3})(m\d+)?$/i); if (m) { const A = Number(m[1]), s = normalizeSymbol(m[2]); return state.all.find(n => n.symbol === s && n.a === A && isRenderable(n)); }
  return state.all.find(n => (n.symbol.toLowerCase() === q || n.element.toLowerCase() === q || `${n.symbol.toLowerCase()}${n.a}` === q) && isRenderable(n));
}

function toggleLegendPopover(e) { e.stopPropagation(); closeDataPopover(); closeSearchTool(); const open = legendPopover.classList.toggle('open'); legendPopover.setAttribute('aria-hidden', String(!open)); }
function closeLegendPopover() { legendPopover.classList.remove('open'); legendPopover.setAttribute('aria-hidden', 'true'); }
function toggleDataPopover(e) { e.stopPropagation(); closeLegendPopover(); closeSearchTool(); const open = dataPopover.classList.toggle('open'); dataPopover.setAttribute('aria-hidden', String(!open)); }
function openDataPopover() { closeLegendPopover(); closeSearchTool(); dataPopover.classList.add('open'); dataPopover.setAttribute('aria-hidden', 'false'); }
function closeDataPopover() { dataPopover.classList.remove('open'); dataPopover.setAttribute('aria-hidden', 'true'); }
function toggleSearchTool() { searchTool.classList.contains('open') ? closeSearchTool() : openSearchTool(); }
function openSearchTool() { closeLegendPopover(); closeDataPopover(); searchTool.classList.add('open'); searchTool.querySelector('.top-search-box').setAttribute('aria-hidden','false'); requestAnimationFrame(() => searchInput.focus()); }
function closeSearchTool() { searchTool.classList.remove('open'); searchTool.querySelector('.top-search-box').setAttribute('aria-hidden','true'); }
function setDarkMode(enabled) { document.body.classList.toggle('dark', enabled); darkModeButton.title = enabled ? 'Modo claro' : 'Modo oscuro'; darkModeButton.setAttribute('aria-label', enabled ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'); themeIcon.className = `theme-icon ${enabled ? 'sun-icon' : 'moon-icon'}`; }

async function loadIaeaData() {
  dataStatus.textContent = 'Intentando cargar IAEA LiveChart...';
  try {
    const response = await fetch(IAEA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = parseCsv(await response.text());
    const mapped = rows.map(r => rowToNuclide(r, 'IAEA LiveChart', 'evaluated')).filter(n => n && n.z > 0);
    if (!mapped.length) throw new Error('CSV vacío o no reconocido');
    state.official = mapped; state.secondary = []; rebuildDerivedData(); fitToScreen(true); closeNuclideCard();
    dataStatus.textContent = `Cargados ${mapped.length.toLocaleString('es-ES')} nucleidos evaluados desde IAEA.`;
    closeDataPopover();
  } catch (err) { dataStatus.textContent = `No se pudo cargar IAEA automáticamente. Descarga el CSV e impórtalo manualmente. ${err.message}`; }
}
function handleCsvInput(e) { const f = e.target.files?.[0]; if (!f) return; readFileAsText(f, text => { const mapped = parseCsv(text).map(r => rowToNuclide(r, f.name, 'evaluated')).filter(n => n && n.z > 0); if (!mapped.length) throw new Error('No se reconocieron columnas z/n o a/symbol.'); state.official = mapped; state.secondary = []; rebuildDerivedData(); fitToScreen(true); closeNuclideCard(); dataStatus.textContent = `Importados ${mapped.length.toLocaleString('es-ES')} nucleidos desde ${f.name}.`; closeDataPopover(); }); }
function handleSecondaryInput(e) { const f = e.target.files?.[0]; if (!f) return; readFileAsText(f, text => { const rows = text.includes(',') ? parseCsv(text) : parseDelimitedText(text); const mapped = rows.map(r => rowToNuclide(r, f.name, detectDataClass(r))).filter(n => n && n.z > 0); if (!mapped.length) throw new Error('No se reconoció el dataset secundario.'); state.secondary = mapped; rebuildDerivedData(); dataStatus.textContent = `Añadidos ${mapped.length.toLocaleString('es-ES')} registros secundarios desde ${f.name}.`; closeDataPopover(); }); }
function readFileAsText(file, cb) { const r = new FileReader(); r.onload = () => { try { cb(String(r.result || '')); } catch (err) { dataStatus.textContent = `Error importando: ${err.message}`; openDataPopover(); } }; r.readAsText(file); }

function rowToNuclide(row, sourceName, fallbackClass = 'evaluated') {
  const zValue = pick(row, ['z','Z','protons','Protons']);
  let z = toNumber(zValue); let n = toNumber(pick(row, ['n','N','neutrons','Neutrons'])); let a = toNumber(pick(row, ['a','A','mass_number','MassNumber']));
  let symbol = cleanSymbol(pick(row, ['symbol','Symbol','elem','element_symbol','Element']), z);
  if (!Number.isFinite(z) && symbol) { const idx = ELEMENTS.findIndex(e => e && e[0].toLowerCase() === symbol.toLowerCase()); if (idx >= 0) z = idx; }
  if (!Number.isFinite(z)) return null;
  if (!symbol) symbol = elementInfo(z)[0]; if (!Number.isFinite(n) && Number.isFinite(a)) n = a - z; if (!Number.isFinite(a) && Number.isFinite(n)) a = z + n;
  if (!Number.isFinite(n) || !Number.isFinite(a)) return null;
  const element = pick(row, ['element','Element','name','Name']) || elementInfo(z)[1] || symbol;
  const halfLife = formatHalfLife(row); const decayRaw = String(pick(row, ['decay','decay_1','decay mode','decayMode','Decay','decay_modes']) || '').toLowerCase();
  const decay = normalizeDecay(decayRaw, halfLife);
  const dataClass = normalizeDataClass(pick(row, ['data_class','quality','source_type','class','state_type']) || fallbackClass, row);
  const stateId = pick(row, ['state','isomer','level','stateId']) || (dataClass === 'isomer' ? 'm1' : 'gs');
  const qValue = firstFormattedEnergy(row, [['qa','Qα'],['qec','QEC'],['qbm','Qβ−'],['sn','Sₙ'],['sp','Sₚ']]);
  const binding = formatEnergy(pick(row, ['binding']), 'keV/n');
  const discovery = pick(row, ['discovery','Discovery']);
  const decayDetails = formatDecayDetails(row);
  const notes = [decayDetails, binding ? `Energía de enlace: ${binding}` : '', discovery ? `Descubrimiento: ${discovery}` : '', pick(row, ['notes','Notes'])].filter(Boolean).join(' · ') || 'Dato importado. Los campos disponibles dependen del CSV usado.';
  return {
    uid: `${dataClass}-${z}-${n}-${stateId}-${Math.random().toString(36).slice(2,8)}`, z, n, a, symbol, element, decay, dataClass, stateId,
    half_life: halfLife || (decay === 'stable' ? 'Estable' : '—'), half_life_sec: pick(row, ['half_life_sec','T12_sec']), abundance: formatPercent(pick(row, ['abundance','Abundance','natural_abundance'])) || '—',
    atomic_mass: formatAtomicMass(pick(row, ['atomic_mass','mass','Mass','atomic mass','ame2020'])) || '—', mass_excess: formatEnergy(pick(row, ['mass_excess','Mass excess','massexcess']), 'keV') || '—',
    binding: binding || '—', spin: pick(row, ['spin','Spin','jp','Jpi','parity']) || '—', q_value: qValue || '—',
    qa: pick(row, ['qa']), qbm: pick(row, ['qbm']), qec: pick(row, ['qec']), sn: formatEnergy(pick(row, ['sn']), 'keV') || '—', sp: formatEnergy(pick(row, ['sp']), 'keV') || '—',
    notes, applications: pick(row, ['application','applications','uses']), wikipedia: pick(row, ['wikipedia']) || (z > 0 ? `https://es.wikipedia.org/wiki/Is%C3%B3topos_de_${encodeURIComponent(element)}` : `https://es.wikipedia.org/wiki/Neutr%C3%B3n`), livechart: pick(row, ['livechart']) || `https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html?z=${z}&n=${n}`, raw: row
  };
}
function normalizeDataClass(value, row = {}) { const t = String(value || '').toLowerCase(); if (t.includes('theor') || t.includes('calc') || t.includes('estim')) return 'theoretical'; if (t.includes('isomer') || t === 'm' || /m\d+/.test(String(pick(row, ['state','isomer','level'])))) return 'isomer'; if (t.includes('unknown')) return 'unknown'; return 'evaluated'; }
function detectDataClass(row) { return normalizeDataClass(pick(row, ['data_class','quality','source_type','class','state_type','state','isomer']) || 'theoretical', row); }

function parseDelimitedText(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  if (!lines.length) return [];
  const header = lines[0].split(/\s+/);
  if (header.some(h => ['z','n','a','symbol'].includes(h.toLowerCase()))) {
    return lines.slice(1).map(line => { const cols = line.split(/\s+/); const row = {}; header.forEach((h,i) => row[h] = cols[i] || ''); return row; });
  }
  return [];
}
function generateFallbackNuclides() {
  const out = [];
  for (let z = 1; z <= 118; z++) { const [symbol, element] = elementInfo(z); const n = stableNFor(z); out.push({ uid:`fallback-${z}-${n}`, z, n, a:z+n, symbol, element, dataClass:'evaluated', stateId:'gs', decay: z < 84 ? 'stable' : 'alpha', half_life:'—', abundance:'—', atomic_mass:`≈${z+n} u`, spin:'—', q_value:'—', binding:'—', mass_excess:'—', notes:'Malla mínima de respaldo.', raw:{} }); }
  return out;
}

function parseCsv(text) {
  const rows = []; let current = [], field = '', inQuotes = false;
  for (let i=0;i<text.length;i++) { const ch = text[i], nx = text[i+1];
    if (ch === '"' && inQuotes && nx === '"') { field += '"'; i++; }
    else if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) { current.push(field); field = ''; }
    else if ((ch === '\n' || ch === '\r') && !inQuotes) { if (ch === '\r' && nx === '\n') i++; current.push(field); field=''; if (current.some(v => String(v).trim() !== '')) rows.push(current); current=[]; }
    else field += ch;
  }
  if (field || current.length) { current.push(field); if (current.some(v => String(v).trim() !== '')) rows.push(current); }
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(cols => { const row = {}; headers.forEach((h,i) => row[h] = (cols[i] || '').trim()); return row; });
}
function pick(row, names) { const lower = Object.fromEntries(Object.keys(row || {}).map(k => [k.toLowerCase().trim(), k])); for (const name of names) { const k = lower[name.toLowerCase().trim()]; if (k && row[k] != null && String(row[k]).trim() !== '') return row[k]; } return ''; }
function cleanSymbol(value, z = NaN) { const raw = String(value || '').trim(); if (Number(z) === 0 || raw.toLowerCase() === 'n') return 'n'; const s = raw.replace(/[^a-z]/gi, ''); return s ? normalizeSymbol(s.slice(0,3)) : ''; }
function normalizeSymbol(s) { if (String(s).trim().toLowerCase() === 'n') return 'n'; return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
function normalizeDecay(text, halfLife) { const t = String(text || '').toLowerCase().replace(/\s+/g,''); const h = String(halfLife || '').toLowerCase(); if (!t && (h.includes('stable') || h.includes('estable'))) return 'stable'; if (t.includes('stable') || t.includes('stbl') || h.includes('stable') || h.includes('inf')) return 'stable'; if (t.includes('cluster') || t === 'cl') return 'cluster'; if (t === 'a' || t.includes('alpha') || t.includes('α')) return 'alpha'; if (t.includes('b-') || t.includes('beta-') || t.includes('β-')) return 'beta-'; if (t.includes('ec') || t.includes('b+') || t.includes('beta+') || t.includes('β+')) return 'beta+/EC'; if (t.includes('sf') || t.includes('fission')) return 'sf'; if (t.includes('it') || t.includes('isomer')) return 'it'; if (t === 'p' || t.includes('2p') || t.includes('proton')) return 'p'; if (t === 'n' || t.includes('2n') || t.includes('neutron')) return 'n'; return 'unknown'; }
function formatHalfLife(row) { const raw = pick(row, ['half_life','Half-life','halflife','T1/2']); const op = pick(row, ['operator_hl','operator','Operator']); const unit = pick(row, ['unit_hl','unit','Unit']); if (!raw) return ''; if (String(raw).toUpperCase() === 'STABLE') return 'Estable'; return `${op ? `${op} ` : ''}${raw}${unit ? ` ${unit}` : ''}`; }
function formatDecayDetails(row) { const parts = []; for (let i=1; i<=3; i++) { const mode = pick(row, [`decay_${i}`,`decay${i}`]); if (!mode) continue; const pct = pick(row, [`decay_${i}_%`,`decay${i}_%`]); parts.push(`${mode}${pct ? ` ${pct}%` : ''}`); } return parts.length ? `Desintegración: ${parts.join(' / ')}` : ''; }
function formatPercent(v) { if (v == null || String(v).trim() === '') return ''; const text = String(v).trim(); return text.endsWith('%') ? text : `${text}%`; }
function formatAtomicMass(v) { const n = toNumber(v); if (!Number.isFinite(n)) return ''; const u = Math.abs(n) > 100000 ? n / 1000000 : n; return `${trimNumber(u, 9)} u`; }
function formatEnergy(v, unit) { const n = toNumber(v); if (!Number.isFinite(n)) return ''; return `${trimNumber(n, 5)} ${unit}`; }
function firstFormattedEnergy(row, entries) { for (const [field, label] of entries) { const f = formatEnergy(pick(row, [field]), 'keV'); if (f) return `${label} ${f}`; } return ''; }
function toNumber(v) { if (v == null || v === '') return NaN; const n = Number(String(v).replace(',', '.').replace(/[^0-9.+-eE]/g, '')); return Number.isFinite(n) ? n : NaN; }
function numeric(v) { return toNumber(String(v || '').replace('%','')); }
function trimNumber(v, d=6) { return Number(v).toLocaleString('es-ES', { maximumFractionDigits: d }); }
function escapeHtml(t) { return String(t).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }

function electronShells(electrons) { const caps = [2,8,18,32,32,18,8]; const shells = []; let left = electrons; for (const cap of caps) { if (left <= 0) break; const c = Math.min(cap, left); shells.push(c); left -= c; } if (left > 0) shells.push(left); return shells; }
function buildAtomState(n) { return { z:n.z, neutrons:n.n, symbol:n.symbol, a:n.a, shells: electronShells(n.z), particles: buildNucleusParticles(n.z, n.n) }; }
function buildNucleusParticles(protons, neutrons) { const total = Math.min(90, protons + neutrons); const particles = []; for (let i=0;i<total;i++) { const angle = i*2.399963, radius = Math.sqrt(i/Math.max(1,total))*42; const isProton = i < Math.round(total*protons/Math.max(1, protons+neutrons)); particles.push({ x:Math.cos(angle)*radius+(Math.random()-.5)*5, y:Math.sin(angle)*radius+(Math.random()-.5)*5, z:Math.sin(angle*1.7)*18, proton:isProton, size:9+Math.random()*4 }); } return particles; }
function resizeAtomCanvas() { const r = atomCanvas.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); const w = Math.max(300, Math.floor(r.width*dpr)), h = Math.max(260, Math.floor(r.height*dpr)); if (atomCanvas.width !== w || atomCanvas.height !== h) { atomCanvas.width = w; atomCanvas.height = h; } }
function drawAtomLoop(time) { resizeAtomCanvas(); if (state.atom) drawAtom(time); requestAnimationFrame(drawAtomLoop); }
function drawAtom(time) {
  const atom = state.atom; if (!atom) return; const c = atomCtx; const w = atomCanvas.width, h = atomCanvas.height; c.clearRect(0,0,w,h); const cx=w*.52, cy=h*.54, min=Math.min(w,h), gap=Math.max(38,min*.085), base=Math.max(68,min*.14); const t = state.animationEnabled ? time*.001 : state.atomFrame; if (!state.animationEnabled) state.atomFrame = t;
  c.save(); c.translate(cx,cy); c.lineWidth = Math.max(1,min*.0024);
  atom.shells.forEach((count, si) => { const r=base+si*gap; c.save(); c.rotate(si%2?-.38:.30); c.scale(1,.36+si*.018); c.beginPath(); c.ellipse(0,0,r,r,0,0,Math.PI*2); c.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.18)' : 'rgba(20,20,20,.16)'; c.stroke(); c.restore(); const visible=Math.min(count, si<3?count:18); for(let i=0;i<visible;i++){ const a=(i/visible)*Math.PI*2 + t*(.45+si*.08)*(si%2?-1:1); const tilt=si%2?-.38:.30; const x0=Math.cos(a)*r, y0=Math.sin(a)*r*(.36+si*.018); const x=x0*Math.cos(tilt)-y0*Math.sin(tilt), y=x0*Math.sin(tilt)+y0*Math.cos(tilt); const depth=(Math.sin(a)+1)/2; drawSphere(c,x,y,6+depth*2.5,'#0900b8','#4b57ff',depth); } });
  const scale = Math.min(1.25, .72 + Math.log10(atom.z+atom.neutrons+3)*.22); [...atom.particles].sort((a,b)=>a.z-b.z).forEach(p => { const wobble=Math.sin(t*1.2+p.x*.02)*1.5; drawSphere(c,p.x*scale+wobble,p.y*scale,p.size*scale,p.proton?'#a93b32':'#595959',p.proton?'#ff4338':'#8b8b8b',(p.z+20)/40); });
  c.restore();
}
function drawSphere(c,x,y,r,dark,light,depth=.5){ const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.12,x,y,r); g.addColorStop(0,light); g.addColorStop(1,dark); c.globalAlpha=.72+depth*.28; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle=g; c.fill(); c.globalAlpha=1; }

init();
