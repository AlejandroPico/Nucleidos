'use strict';

const CELL_W = 82;
const CELL_H = 72;
const GAP = 10;
const AXIS = 58;
const TILE_STEP_X = CELL_W + GAP;
const TILE_STEP_Y = CELL_H + GAP;
const DEFAULT_Z_MAX = 130;
const DEFAULT_N_MAX = 320;
const THEORETICAL_Z_MAX = 130;
const THEORETICAL_N_MAX = 320;
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

const MODE_SUBTITLES = {
  decay: 'modo nuclear', stability: 'clasificación', halflife: 'escala temporal', quality: 'origen del dato',
  abundance: 'presencia natural', binding: 'energía nuclear', qalpha: 'energía α', qbeta: 'energía β−'
};

const MODE_TIPS = {
  decay: 'Colorea cada celda según su modo principal de desintegración: estable, beta, alfa, fisión espontánea, emisión de partículas u otros modos.',
  stability: 'Reduce el mapa a categorías generales: estable, radiactivo o sin clasificación suficiente.',
  halflife: 'Agrupa los nucleidos por vida media aproximada para distinguir estables, larga vida, vida media y vida corta.',
  quality: 'Distingue datos evaluados, isómeros, posiciones teóricas/no observadas y registros sin clasificar.',
  abundance: 'Resalta si el nucleido aparece con abundancia natural, traza o sin abundancia natural cargada.',
  binding: 'Colorea por energía de enlace cuando el CSV contiene ese campo; si falta, se clasifica como sin dato.',
  qalpha: 'Colorea por el signo o disponibilidad de Qα. Útil para explorar posibles desintegraciones alfa.',
  qbeta: 'Colorea por el signo o disponibilidad de Qβ−. Útil para explorar tendencias beta menos.'
};

const FILTER_TIPS = {
  stable: 'Muestra u oculta nucleidos clasificados como estables.', radioactive: 'Muestra u oculta nucleidos radiactivos.', unknown: 'Muestra u oculta registros sin clasificación clara.',
  'beta-': 'Muestra u oculta emisores beta menos.', 'beta+/EC': 'Muestra u oculta beta más y captura electrónica.', alpha: 'Muestra u oculta emisores alfa.',
  sf: 'Muestra u oculta fisión espontánea.', p: 'Muestra u oculta emisión de protones.', n: 'Muestra u oculta emisión de neutrones.',
  it: 'Muestra u oculta transiciones isoméricas.', cluster: 'Muestra u oculta desintegración por clúster.',
  long: 'Muestra u oculta nucleidos de vida larga.', medium: 'Muestra u oculta nucleidos de vida media intermedia.', short: 'Muestra u oculta nucleidos de vida corta.',
  evaluated: 'Muestra u oculta datos evaluados del dataset principal.', isomer: 'Muestra u oculta estados isoméricos cargados desde datasets secundarios.', theoretical: 'Muestra u oculta posiciones no observadas o extrapoladas.',
  natural: 'Muestra u oculta nucleidos con abundancia natural registrada.', trace: 'Muestra u oculta abundancias traza.', none: 'Muestra u oculta nucleidos sin abundancia natural cargada.',
  high: 'Muestra u oculta valores altos de energía de enlace.', low: 'Muestra u oculta valores bajos de energía de enlace.', positive: 'Muestra u oculta valores Q positivos.', negative: 'Muestra u oculta valores Q negativos.', zero: 'Muestra u oculta valores Q cercanos a cero.'
};

const LAYER_TIPS = {
  evaluatedLayerButton: 'Activa o desactiva los nucleidos evaluados del CSV principal.',
  theoreticalLayerButton: 'Activa o desactiva la extensión no observada/extrapolada. No representa datos oficiales.',
  isomerLayerButton: 'Activa o desactiva estados isoméricos cuando el dataset secundario los contiene.',
  gridLayerButton: 'Muestra u oculta la cuadrícula de referencia N/Z del fondo.',
  magicLayerButton: 'Muestra u oculta las líneas de números mágicos nucleares.',
  frontierLayerButton: 'Muestra u oculta la frontera nuclear estimada y líneas de goteo aproximadas.',
  evaluatedFrameLayerButton: 'Muestra u oculta el marco que delimita el rango evaluado cargado desde el CSV principal.',
  minimapButton: 'Muestra u oculta el minimapa de navegación.',
  expertModeButton: 'Alterna entre ficha técnica concisa y ficha con explicación más pedagógica.'
};

const state = {
  official: [], secondary: [], theoretical: [], all: [], byKey: new Map(), byCell: new Map(),
  evaluatedBounds: null,
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
  layers: { evaluated: true, theoretical: false, isomer: true, grid: false, magic: false, frontier: false, evaluatedFrame: false, minimap: true, expert: true },
  scale: 1, tx: 0, ty: 0, fitScale: 1, fullFitScale: 1,
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
const zoomHud = document.getElementById('zoomHud');
const legendButton = document.getElementById('legendButton');
const legendPopover = document.getElementById('legendPopover');
const legendModes = document.getElementById('legendModes');
const legend = document.getElementById('legend');
const uiTooltip = document.getElementById('uiTooltip');
const dataButton = document.getElementById('dataButton');
const dataPopover = document.getElementById('dataPopover');
const dataStatus = document.getElementById('dataStatus');
const searchTool = document.getElementById('searchTool');
const searchToggleButton = document.getElementById('searchToggleButton');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const darkModeButton = document.getElementById('darkModeButton');
const themeIcon = document.getElementById('themeIcon');
const mobileThemeIcon = document.getElementById('mobileThemeIcon');
const cursorHud = document.getElementById('cursorHud');
const card = document.getElementById('nuclideCard');
const closeDetailButton = document.getElementById('closeDetailButton');
const atomCanvas = document.getElementById('atomCanvas');
const atomCtx = atomCanvas.getContext('2d');
const csvInput = document.getElementById('csvInput');
const secondaryCsvInput = document.getElementById('secondaryCsvInput');
const loadIaeaButton = document.getElementById('loadIaeaButton');
const minimapPanel = document.getElementById('minimapPanel');
const compareTray = document.getElementById('compareTray');
const compareTable = document.getElementById('compareTable');

let detailHistoryPushed = false;

function mobileViewportSize() {
  const vv = window.visualViewport;
  return {
    width: Math.max(1, Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth || 1)),
    height: Math.max(1, Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight || 1))
  };
}
function isMobileViewport() {
  const { width, height } = mobileViewportSize();
  return Math.min(width, height) <= 640 || Boolean(window.matchMedia?.('(max-width: 640px)').matches);
}

async function init() {
  updateChartMetrics();
  resizeCanvases();
  state.official = await loadInitialNuclides();
  rebuildDerivedData();
  bindEvents();
  initTemporalTheme();
  bindTooltips();
  installMobileDetailStyles();
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

function generateFallbackNuclides() {
  const samples = [
    [1,0,'H','Estable','stable'], [1,1,'H','Estable','stable'], [1,2,'H','12,32 a','beta-'], [2,2,'He','Estable','stable'], [6,6,'C','Estable','stable'], [6,8,'C','5730 a','beta-'], [8,8,'O','Estable','stable'], [20,20,'Ca','Estable','stable'], [26,30,'Fe','Estable','stable'], [53,78,'I','8 d','beta-'], [82,126,'Pb','Estable','stable'], [92,143,'U','7,04e8 a','alpha']
  ];
  return samples.map(([z,n,symbol,half_life,decay]) => ({
    uid: `fallback-${z}-${n}`, z, n, a:z+n, symbol, element: elementInfo(z)[1], stateId:'gs', dataClass:'evaluated', decay, half_life, abundance:'—', atomic_mass:'—', spin:'—', q_value:'—', mass_excess:'—', binding:'—', sn:'—', sp:'—', notes:'Muestra integrada.', applications:'—', raw:{}
  }));
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
  const evaluatedRows = rows.filter(n => n.dataClass !== 'theoretical' && n.z > 0);
  state.evaluatedBounds = boundsForRows(evaluatedRows.length ? evaluatedRows : rows);

  const maxZ = Math.max(DEFAULT_Z_MAX, THEORETICAL_Z_MAX, ...rows.map(n => Number(n.z) || 0));
  const maxN = Math.max(DEFAULT_N_MAX, THEORETICAL_N_MAX, ...rows.map(n => Number(n.n) || 0));
  Z_MAX = Math.ceil(maxZ / 10) * 10;
  N_MAX = Math.ceil(maxN / 10) * 10;
  updateChartMetrics();
}

function boundsForRows(rows) {
  const clean = rows.filter(n => n && Number.isFinite(Number(n.z)) && Number.isFinite(Number(n.n)) && n.z > 0);
  if (!clean.length) return { minZ: 1, maxZ: 118, minN: 0, maxN: 178 };
  return {
    minZ: Math.max(1, Math.min(...clean.map(n => Number(n.z)))),
    maxZ: Math.max(...clean.map(n => Number(n.z))),
    minN: Math.max(0, Math.min(...clean.map(n => Number(n.n)))),
    maxN: Math.max(...clean.map(n => Number(n.n)))
  };
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
  for (let Z = 1; Z <= Math.min(Z_MAX, THEORETICAL_Z_MAX); Z++) {
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
    b.type = 'button';
    b.dataset.tip = MODE_TIPS[mode] || `Colorea el mapa por ${label}.`;
    b.innerHTML = `<span>${label}</span><small>${MODE_SUBTITLES[mode] || 'mapa'}</small>`;
    b.addEventListener('click', () => { state.colorMode = mode; renderLegend(); scheduleRender(); });
    legendModes.appendChild(b);
  }
  const entries = legendEntriesForMode(state.colorMode);
  const active = state.filters[state.colorMode];
  for (const entry of entries) {
    const item = document.createElement('button');
    item.className = `legend-item${active.has(entry.key) ? '' : ' muted'}`;
    item.type = 'button';
    item.dataset.tip = entry.tip || FILTER_TIPS[entry.key] || `Muestra u oculta ${entry.label}.`;
    item.innerHTML = `<span class="legend-swatch" style="background:${entry.color}"></span><span>${entry.label}</span>`;
    item.addEventListener('click', () => {
      if (active.has(entry.key)) { if (active.size > 1) active.delete(entry.key); }
      else active.add(entry.key);
      renderLegend(); scheduleRender();
    });
    legend.appendChild(item);
  }
  applyLayerTooltips();
  syncLayerButtons();
}

function applyLayerTooltips() {
  for (const [id, tip] of Object.entries(LAYER_TIPS)) {
    const el = document.getElementById(id);
    if (el) el.dataset.tip = tip;
  }
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
  toggleButtonState('gridLayerButton', state.layers.grid);
  toggleButtonState('magicLayerButton', state.layers.magic);
  toggleButtonState('frontierLayerButton', state.layers.frontier);
  toggleButtonState('evaluatedFrameLayerButton', state.layers.evaluatedFrame);
  toggleButtonState('minimapButton', state.layers.minimap);
  toggleButtonState('expertModeButton', state.layers.expert);
  minimapPanel.classList.toggle('hidden', !state.layers.minimap);
}
function toggleButtonState(id, active) { document.getElementById(id)?.classList.toggle('active', active); }

function resizeCanvases() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const { width, height } = mobileViewportSize();
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
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
  const { width: w, height: h } = mobileViewportSize();
  ctx.clearRect(0, 0, w, h);
  if (state.layers.grid) drawWorldGrid(w, h);
  if (state.layers.evaluatedFrame) drawEvaluatedFrame();
  if (state.layers.magic) drawMagicLines();
  if (state.layers.frontier) drawFrontierLines();

  const visible = visibleWorldRect();
  const startN = Math.max(0, Math.floor((visible.x1 - AXIS) / TILE_STEP_X) - 1);
  const endN = Math.min(N_MAX, Math.ceil((visible.x2 - AXIS) / TILE_STEP_X) + 1);
  const startZ = Math.max(1, Z_MAX - Math.ceil((visible.y2 - AXIS) / TILE_STEP_Y) - 1);
  const endZ = Math.min(Z_MAX, Z_MAX - Math.floor((visible.y1 - AXIS) / TILE_STEP_Y) + 1);
  for (let Z = startZ; Z <= endZ; Z++) {
    for (let N = startN; N <= endN; N++) {
      const list = state.byCell.get(`${Z}-${N}`);
      if (!list) continue;
      const rect = cellRect(Z, N);
      for (const n of list) {
        if (isRenderable(n)) drawNuclideCell(n, rect);
      }
    }
  }
  drawAxes();
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

function categoryForMode(n) {
  if (state.colorMode === 'decay') return n.decay || 'unknown';
  if (state.colorMode === 'stability') return n.decay === 'stable' ? 'stable' : (n.decay ? 'radioactive' : 'unknown');
  if (state.colorMode === 'halflife') return halfLifeBucket(n);
  if (state.colorMode === 'quality') return n.dataClass || 'unknown';
  if (state.colorMode === 'abundance') return abundanceBucket(n);
  if (state.colorMode === 'binding') return bindingBucket(n);
  if (state.colorMode === 'qalpha') return signedBucket(n.qalpha);
  if (state.colorMode === 'qbeta') return signedBucket(n.qbeta);
  return 'unknown';
}
function colorForNuclide(n) {
  const category = categoryForMode(n);
  if (state.colorMode === 'decay') return PALETTES.decay[category] || PALETTES.decay.unknown;
  if (state.colorMode === 'stability') return PALETTES.stability[category] || PALETTES.stability.unknown;
  if (state.colorMode === 'halflife') return PALETTES.halflife[category] || PALETTES.halflife.unknown;
  if (state.colorMode === 'quality') return PALETTES.quality[category] || PALETTES.quality.unknown;
  if (state.colorMode === 'abundance') return PALETTES.abundance[category] || PALETTES.abundance.none;
  if (state.colorMode === 'binding') return PALETTES.binding[category] || PALETTES.binding.unknown;
  if (state.colorMode === 'qalpha' || state.colorMode === 'qbeta') return PALETTES.signed[category] || PALETTES.signed.unknown;
  return PALETTES.decay.unknown;
}
function isRenderable(n) {
  if (n.dataClass === 'theoretical' && !state.layers.theoretical) return false;
  if (n.dataClass === 'evaluated' && !state.layers.evaluated) return false;
  if (n.dataClass === 'isomer' && !state.layers.isomer) return false;
  const category = categoryForMode(n);
  return (state.filters[state.colorMode] || new Set()).has(category);
}
function halfLifeBucket(n) {
  if (n.decay === 'stable' || /stable/i.test(n.half_life || '')) return 'stable';
  const sec = numeric(n.half_life_seconds);
  if (!Number.isFinite(sec)) return 'unknown';
  if (sec > 31557600 * 100) return 'long';
  if (sec > 3600) return 'medium';
  return 'short';
}
function abundanceBucket(n) {
  const v = numeric(n.abundance);
  if (!Number.isFinite(v) || v <= 0) return 'none';
  if (v < 0.01) return 'trace';
  return 'natural';
}
function bindingBucket(n) {
  const v = numeric(n.binding);
  if (!Number.isFinite(v)) return 'unknown';
  if (v >= 8000) return 'high';
  if (v >= 6000) return 'medium';
  return 'low';
}
function signedBucket(v) {
  const n = numeric(v);
  if (!Number.isFinite(n)) return 'unknown';
  if (Math.abs(n) < 1e-6) return 'zero';
  return n > 0 ? 'positive' : 'negative';
}

function drawEvaluatedFrame() {
  const b = state.evaluatedBounds;
  if (!b) return;
  const r = worldRectForBounds(b, 18);
  const x = sx(r.x1), y = sy(r.y1), w = (r.x2 - r.x1) * state.scale, h = (r.y2 - r.y1) * state.scale;
  if (x > window.innerWidth || y > window.innerHeight || x + w < 0 || y + h < 0) return;
  ctx.save();
  ctx.lineWidth = Math.max(1, Math.min(2.4, 1.2 * state.scale));
  ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.18)' : 'rgba(34,32,28,.16)';
  ctx.setLineDash([Math.max(5, 8 * state.scale), Math.max(5, 8 * state.scale)]);
  roundedRect(ctx, x, y, w, h, Math.max(8, 18 * state.scale));
  ctx.stroke();
  ctx.restore();
}

function drawMagicLines() {
  const accent = document.body.classList.contains('dark') ? 'rgba(255,92,92,.88)' : 'rgba(145,28,44,.86)';
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.45;
  ctx.setLineDash([7, 7]);
  for (const N of MAGIC_NUMBERS) {
    if (N > N_MAX) continue;
    const x = sx(AXIS + N * TILE_STEP_X + TILE_STEP_X/2);
    ctx.beginPath(); ctx.moveTo(x, sy(AXIS)); ctx.lineTo(x, sy(AXIS + Z_MAX*TILE_STEP_Y)); ctx.stroke();
    if (N % 10 !== 0) drawMagicAxisLabel(String(N), x, clampNumber(sy(AXIS - 28), 22, window.innerHeight - 22));
  }
  for (const Z of MAGIC_NUMBERS) {
    if (Z > Z_MAX) continue;
    const y = sy(AXIS + (Z_MAX - Z) * TILE_STEP_Y + TILE_STEP_Y/2);
    ctx.beginPath(); ctx.moveTo(sx(AXIS), y); ctx.lineTo(sx(AXIS + N_MAX*TILE_STEP_X), y); ctx.stroke();
    if (Z % 10 !== 0) drawMagicAxisLabel(String(Z), clampNumber(sx(AXIS - 18), 28, window.innerWidth - 28), y, 'right');
  }
  ctx.restore();
}
function drawMagicAxisLabel(text, x, y, align = 'center') {
  ctx.save();
  ctx.setLineDash([]);
  ctx.font = '950 13px system-ui, sans-serif';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = document.body.classList.contains('dark') ? 'rgba(255,92,92,.96)' : 'rgba(145,28,44,.96)';
  ctx.fillText(text, x, y + 0.5);
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
  const { width: screenW, height: screenH } = mobileViewportSize();
  ctx.save();
  ctx.font = '900 12px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.92)' : 'rgba(34,32,28,.82)';
  for (let N = 0; N <= N_MAX; N += 10) {
    const wx = AXIS + N * TILE_STEP_X + TILE_STEP_X/2;
    if (wx < visible.x1 - 200 || wx > visible.x2 + 200) continue;
    drawAxisPill(String(N), sx(wx), clampNumber(sy(AXIS - 28), 22, screenH - 22), 38, state.layers.magic && MAGIC_NUMBERS.includes(N));
  }
  ctx.textAlign = 'right';
  for (let Z = 10; Z <= Z_MAX; Z += 10) {
    const wy = AXIS + (Z_MAX - Z) * TILE_STEP_Y + TILE_STEP_Y/2;
    if (wy < visible.y1 - 200 || wy > visible.y2 + 200) continue;
    drawAxisPill(String(Z), clampNumber(sx(AXIS - 18), 28, screenW - 28), sy(wy), 38, state.layers.magic && MAGIC_NUMBERS.includes(Z));
  }
  ctx.textAlign = 'left';
  drawAxisPill('N →', clampNumber(sx(AXIS), 30, screenW - 30), clampNumber(sy(AXIS - 54), 22, screenH - 22), 48);
  drawAxisPill('Z ↑', clampNumber(sx(AXIS - 48), 30, screenW - 30), clampNumber(sy(AXIS - 20), 54, screenH - 22), 48);
  ctx.restore();
}
function clampNumber(value, min, max) { return Math.min(max, Math.max(min, value)); }

function drawAxisPill(text, x, y, width = 38, magic = false) {
  // Ejes limpios: solo texto, sin cápsula ni borde.
  // Se dibujan al final del frame para que no queden ocultos por las celdas.
  ctx.save();
  ctx.fillStyle = magic
    ? (document.body.classList.contains('dark') ? 'rgba(255,92,92,.96)' : 'rgba(145,28,44,.96)')
    : (document.body.classList.contains('dark') ? 'rgba(255,255,255,.92)' : 'rgba(34,32,28,.82)');
  ctx.fillText(text, x, y + 0.5);
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
  ctx.lineWidth = state.selected && state.selected.uid === n.uid ? Math.max(2.2, 2.2 * state.scale) : Math.max(.7, .9 * state.scale);
  ctx.strokeStyle = state.selected && state.selected.uid === n.uid ? 'rgba(25,24,22,.78)' : 'rgba(0,0,0,.13)';
  if (n.dataClass === 'theoretical') ctx.setLineDash([Math.max(4, 6 * state.scale), Math.max(3, 5 * state.scale)]);
  ctx.stroke();
  ctx.setLineDash([]);
  if (n.dataClass === 'isomer') {
    ctx.fillStyle = 'rgba(93,90,246,.72)';
    ctx.beginPath(); ctx.arc(x + w - 8*state.scale, y + 8*state.scale, Math.max(2, 3.7*state.scale), 0, Math.PI*2); ctx.fill();
  }
  const drawText = w > 18 && h > 16;
  if (drawText) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#121212';
    ctx.font = `900 ${Math.max(8, Math.min(23, 21 * state.scale))}px system-ui, sans-serif`;
    ctx.fillText(n.symbol, x + w/2, y + h/2 - Math.min(5, h*.08));
    if (w > 46 && h > 42) {
      ctx.font = `800 ${Math.max(7, Math.min(10, 9 * state.scale))}px system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(18,18,18,.72)';
      ctx.textAlign='left'; ctx.fillText(String(n.a), x + w*.15, y + h*.20);
      ctx.textAlign='right'; ctx.fillText(`N${n.n}`, x + w*.85, y + h*.20);
      ctx.textAlign='left'; ctx.fillText(`Z${n.z}`, x + w*.15, y + h*.83);
      ctx.textAlign='right'; ctx.fillText(DECAY_LABELS[n.decay] || n.decay, x + w*.85, y + h*.83);
    }
  }
  ctx.restore();
}

function drawMinimap() {
  if (!state.layers.minimap || minimapPanel.classList.contains('hidden')) return;
  const w = minimapCanvas.clientWidth, h = minimapCanvas.clientHeight;
  if (!w || !h) return;
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
  const mobile = isMobileViewport();
  const { width: viewW, height: viewH } = mobileViewportSize();
  const pad = mobile ? 0 : 64;
  const fullSx = Math.max(1, viewW - pad*2) / CHART_W;
  const fullSy = Math.max(1, viewH - pad*2) / CHART_H;
  state.fullFitScale = Math.min(fullSx, fullSy);

  const r = worldRectForBounds(state.evaluatedBounds || { minZ: 1, maxZ: 118, minN: 0, maxN: 178 }, mobile ? 0 : 28);
  const rw = Math.max(1, r.x2 - r.x1), rh = Math.max(1, r.y2 - r.y1);
  const evalSx = Math.max(1, viewW - pad*2) / rw;
  const evalSy = Math.max(1, viewH - pad*2) / rh;
  state.fitScale = mobile ? Math.max(evalSx, evalSy) : Math.min(evalSx, evalSy);
  if (force || state.scale < state.fullFitScale) state.scale = state.fitScale;
  if (mobile) {
    state.tx = -r.x1 * state.scale;
    state.ty = -r.y1 * state.scale;
  } else {
    state.tx = (viewW - rw * state.scale) / 2 - r.x1 * state.scale;
    state.ty = (viewH - rh * state.scale) / 2 - r.y1 * state.scale;
  }
  updateView();
}

function worldRectForBounds(b, margin = 0) {
  const minN = Math.max(0, Number(b.minN) || 0);
  const maxN = Math.min(N_MAX, Number(b.maxN) || 0);
  const minZ = Math.max(1, Number(b.minZ) || 1);
  const maxZ = Math.min(Z_MAX, Number(b.maxZ) || 1);
  return {
    x1: AXIS + minN * TILE_STEP_X - margin,
    x2: AXIS + maxN * TILE_STEP_X + TILE_STEP_X + margin,
    y1: AXIS + (Z_MAX - maxZ) * TILE_STEP_Y - margin,
    y2: AXIS + (Z_MAX - minZ) * TILE_STEP_Y + TILE_STEP_Y + margin
  };
}

function updateView() { clampTransform(); zoomValue.textContent = `${Math.round(state.scale / state.fitScale * 100)}%`; scheduleRender(); }
function clampTransform() {
  const { width: viewW, height: viewH } = mobileViewportSize();
  const scaledW = CHART_W * state.scale, scaledH = CHART_H * state.scale;
  const margin = isMobileViewport() ? 0 : 80;
  if (scaledW <= viewW - margin*2) state.tx = (viewW - scaledW) / 2; else state.tx = Math.min(margin, Math.max(viewW - scaledW - margin, state.tx));
  if (scaledH <= viewH - margin*2) state.ty = (viewH - scaledH) / 2; else state.ty = Math.min(margin, Math.max(viewH - scaledH - margin, state.ty));
}
function zoomAt(clientX, clientY, factor) {
  const old = state.scale;
  const maxScale = Math.max(2.6, state.fitScale * 26);
  const next = Math.max(state.fullFitScale || state.fitScale, Math.min(maxScale, old * factor));
  const chartX = (clientX - state.tx) / old;
  const chartY = (clientY - state.ty) / old;
  state.scale = next; state.tx = clientX - chartX * next; state.ty = clientY - chartY * next;
  updateView();
}

function installMobileDetailStyles() {
  if (document.getElementById('mobileDetailBackStyles')) return;
  const style = document.createElement('style');
  style.id = 'mobileDetailBackStyles';
  style.textContent = `
    @media (max-width: 640px) {
      .card-close { display: none !important; }
      .nuclide-card.open { overflow-y: auto !important; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; touch-action: pan-y; }
    }
  `;
  document.head.append(style);
}

function bindEvents() {
  viewport.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.14 : 1/1.14); }, { passive: false });
  viewport.addEventListener('pointermove', e => { updateCursorHud(e); handlePointerMove(e); }, { passive: false });
  viewport.addEventListener('pointerleave', () => cursorHud.classList.remove('visible'));
  viewport.addEventListener('pointerdown', handlePointerDown, { passive: false });
  viewport.addEventListener('pointerup', handlePointerUp);
  viewport.addEventListener('pointercancel', handlePointerCancel);
  canvas.addEventListener('dblclick', e => { const n = hitTest(e.clientX, e.clientY); if (n) centerOnNuclide(n); else fitToScreen(true); });
  zoomHud?.addEventListener('click', e => { e.stopPropagation(); fitToScreen(true); });
  legendButton.addEventListener('click', toggleLegendPopover);
  legendPopover.addEventListener('click', e => e.stopPropagation());
  dataButton.addEventListener('click', toggleDataPopover);
  dataPopover.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => { closeLegendPopover(); closeDataPopover(); closeSearchTool(); closeMobileMenu(); });
  searchToggleButton.addEventListener('click', e => { e.stopPropagation(); toggleSearchTool(); });
  searchTool.addEventListener('click', e => e.stopPropagation());
  searchButton.addEventListener('click', runSearch);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
  darkModeButton.addEventListener('click', e => { e.stopPropagation(); cycleThemeMode(); });
  mobileMenuButton?.addEventListener('click', e => { e.stopPropagation(); toggleMobileMenu(); });
  mobileMenuPanel?.addEventListener('click', e => e.stopPropagation());
  mobileDataButton?.addEventListener('click', e => { e.stopPropagation(); closeMobileMenu(); toggleDataPopover(e); });
  mobileLayersButton?.addEventListener('click', e => { e.stopPropagation(); closeMobileMenu(); toggleLegendPopover(e); });
  mobileThemeButton?.addEventListener('click', e => { e.stopPropagation(); cycleThemeMode(); });
  mobileResetZoomButton?.addEventListener('click', e => { e.stopPropagation(); closeMobileMenu(); fitToScreen(true); });
  mobileSearchGoButton?.addEventListener('click', runMobileSearch);
  mobileSearchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') runMobileSearch(); });
  csvInput.addEventListener('change', handleCsvInput);
  secondaryCsvInput.addEventListener('change', handleSecondaryInput);
  loadIaeaButton.addEventListener('click', loadIaeaData);
  for (const [id, key] of [['evaluatedLayerButton','evaluated'],['theoreticalLayerButton','theoretical'],['isomerLayerButton','isomer'],['gridLayerButton','grid'],['magicLayerButton','magic'],['frontierLayerButton','frontier'],['evaluatedFrameLayerButton','evaluatedFrame'],['minimapButton','minimap'],['expertModeButton','expert']]) {
    document.getElementById(id)?.addEventListener('click', () => { state.layers[key] = !state.layers[key]; syncLayerButtons(); scheduleRender(); if (state.selected) fillDetail(state.selected); });
  }
  document.querySelectorAll('.tab-button').forEach(b => b.addEventListener('click', () => activateTab(b.dataset.tab)));
  document.getElementById('addCompareButton').addEventListener('click', () => addSelectedToCompare());
  document.getElementById('exportCardButton').addEventListener('click', exportSelectedCardPng);
  document.getElementById('clearCompareButton').addEventListener('click', () => { state.compare = []; renderCompare(); });
  closeDetailButton?.addEventListener('click', e => { e.stopPropagation(); closeNuclideCard(); });
  atomCanvas.addEventListener('click', e => { e.stopPropagation(); state.animationEnabled = !state.animationEnabled; atomCanvas.classList.toggle('paused', !state.animationEnabled); drawAtom(performance.now()); });
  window.addEventListener('resize', () => { resizeCanvases(); fitToScreen(false); resizeAtomCanvas(); scheduleRender(); });
  window.visualViewport?.addEventListener('resize', () => { resizeCanvases(); if (isMobileViewport()) fitToScreen(false); resizeAtomCanvas(); scheduleRender(); });
  window.addEventListener('orientationchange', () => { window.setTimeout(() => { resizeCanvases(); fitToScreen(true); resizeAtomCanvas(); scheduleRender(); }, 180); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeNuclideCard(); closeLegendPopover(); closeDataPopover(); closeSearchTool(); closeMobileMenu(); } });
  window.addEventListener('popstate', () => {
    if (card.classList.contains('open')) {
      detailHistoryPushed = false;
      closeNuclideCard({ fromHistory: true });
    }
  });
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
  const ns = Math.max(state.fullFitScale || state.fitScale, Math.min(maxScale, state.pinch.startScale * d / state.pinch.startDistance));
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
  const { width, height } = mobileViewportSize();
  state.tx = width/2 - x * state.scale;
  state.ty = height/2 - y * state.scale;
  updateView();
}

function selectNuclide(n) {
  state.selected = n; fillDetail(n); openCard(); state.atom = buildAtomState(n); resizeAtomCanvas(); drawAtom(performance.now()); scheduleRender();
}
function openCard() {
  const wasOpen = card.classList.contains('open');
  card.classList.add('open');
  card.setAttribute('aria-hidden', 'false');
  if (isMobileViewport() && !wasOpen && !detailHistoryPushed) {
    try {
      history.pushState({ nucleidosDetail: true }, '', location.href);
      detailHistoryPushed = true;
    } catch (_) {
      detailHistoryPushed = false;
    }
  }
}
function closeNuclideCard(options = {}) {
  const wasOpen = card.classList.contains('open');
  card.classList.remove('open');
  card.setAttribute('aria-hidden', 'true');
  state.selected = null;
  scheduleRender();
  if (wasOpen && detailHistoryPushed && isMobileViewport() && !options.fromHistory) {
    detailHistoryPushed = false;
    try { history.back(); } catch (_) {}
  }
}
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
function renderRaw(n) {
  const raw = n.raw || {};
  const compact = [
    ['uid', `${n.symbol}-${n.a}${n.stateId && n.stateId !== 'gs' ? ` · ${n.stateId}` : ''}`],
    ['z', n.z], ['n', n.n], ['a', n.a], ['clase', classLabel(n)],
    ['decaimiento', DECAY_LABELS[n.decay] || n.decay || '—'],
    ['vida_media', n.half_life || '—'], ['abundancia', n.abundance || '—'],
    ['masa_atomica', n.atomic_mass || '—'], ['spin_paridad', n.spin || '—'],
    ['campos_csv', Object.keys(raw).slice(0, 18).join(', ') || '—']
  ];
  document.getElementById('rawDataBlock').textContent = compact.map(([k,v]) => `${k}: ${v}`).join('\n');
}

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
  return 'No especificado en el dataset cargado.';
}

function addSelectedToCompare() { if (!state.selected) return; if (!state.compare.find(n => n.uid === state.selected.uid)) state.compare.push(state.selected); renderCompare(); }
function renderCompare() {
  compareTray.classList.toggle('open', state.compare.length > 0);
  compareTray.setAttribute('aria-hidden', String(!state.compare.length));
  if (!state.compare.length) return;
  const fields = [['Vida media','half_life'], ['Decaimiento','decay'], ['Masa','atomic_mass'], ['Enlace','binding'], ['Clase','dataClass']];
  compareTable.innerHTML = `<table><thead><tr><th>Campo</th>${state.compare.map(n => `<th>${n.symbol}-${n.a}</th>`).join('')}</tr></thead><tbody>${fields.map(([label,key]) => `<tr><td>${label}</td>${state.compare.map(n => `<td>${key === 'decay' ? (DECAY_LABELS[n.decay] || n.decay) : (n[key] || '—')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function exportSelectedCardPng() { if (!state.selected) return; const a = document.createElement('a'); a.download = `${state.selected.symbol}-${state.selected.a}.png`; a.href = atomCanvas.toDataURL('image/png'); a.click(); }

function runSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  const found = findNuclide(query);
  if (found) { centerOnNuclide(found, 7); selectNuclide(found); closeSearchTool(); }
}
window.runSearch = runSearch;
function runMobileSearch() {
  if (mobileSearchInput && searchInput) searchInput.value = mobileSearchInput.value;
  closeMobileMenu(); runSearch();
}
function findNuclide(query) {
  const s = query.toLowerCase().replace(/\s+/g,'');
  const zn = s.match(/^z[=:]?(\d+)[,;]?n[=:]?(\d+)$/); if (zn) return firstRenderableByZN(+zn[1], +zn[2]);
  const a1 = s.match(/^([a-z]{1,3})-?(\d+)$/i); if (a1) return firstRenderableBySymbolA(cap(a1[1]), +a1[2]);
  const a2 = s.match(/^(\d+)([a-z]{1,3})$/i); if (a2) return firstRenderableBySymbolA(cap(a2[2]), +a2[1]);
  return state.all.find(n => isRenderable(n) && (n.element.toLowerCase().startsWith(s) || `${n.symbol}-${n.a}`.toLowerCase() === s));
}
function firstRenderableByZN(z,n) { return (state.byCell.get(`${z}-${n}`) || []).find(isRenderable) || null; }
function firstRenderableBySymbolA(symbol,a) { return state.all.find(n => isRenderable(n) && n.symbol === symbol && n.a === a) || null; }
function cap(v) { return String(v).slice(0,1).toUpperCase()+String(v).slice(1).toLowerCase(); }

function bindTooltips() {
  document.addEventListener('mouseover', e => { const target = e.target.closest('[data-tip]'); if (!target) return; showTip(target); });
  document.addEventListener('mouseout', e => { if (e.target.closest('[data-tip]')) hideTip(); });
  document.addEventListener('focusin', e => { const target = e.target.closest('[data-tip]'); if (target) showTip(target); });
  document.addEventListener('focusout', hideTip);
}
function showTip(target) { uiTooltip.textContent = target.dataset.tip; uiTooltip.classList.add('visible'); uiTooltip.setAttribute('aria-hidden','false'); const r=target.getBoundingClientRect(); uiTooltip.style.left=`${Math.min(window.innerWidth-280, Math.max(12,r.left))}px`; uiTooltip.style.top=`${Math.min(window.innerHeight-60,r.bottom+8)}px`; }
function hideTip() { uiTooltip.classList.remove('visible'); uiTooltip.setAttribute('aria-hidden','true'); }

function toggleLegendPopover(e) { e?.stopPropagation?.(); legendPopover.classList.toggle('open'); legendPopover.setAttribute('aria-hidden', String(!legendPopover.classList.contains('open'))); dataPopover.classList.remove('open'); }
function closeLegendPopover() { legendPopover.classList.remove('open'); legendPopover.setAttribute('aria-hidden','true'); }
function toggleDataPopover(e) { e?.stopPropagation?.(); dataPopover.classList.toggle('open'); dataPopover.setAttribute('aria-hidden', String(!dataPopover.classList.contains('open'))); legendPopover.classList.remove('open'); }
function closeDataPopover() { dataPopover.classList.remove('open'); dataPopover.setAttribute('aria-hidden','true'); }
function toggleSearchTool() { searchTool.classList.toggle('open'); searchTool.querySelector('.top-search-box')?.setAttribute('aria-hidden', String(!searchTool.classList.contains('open'))); if (searchTool.classList.contains('open')) searchInput.focus(); }
function closeSearchTool() { searchTool.classList.remove('open'); searchTool.querySelector('.top-search-box')?.setAttribute('aria-hidden','true'); }
function toggleMobileMenu() { mobileMenuPanel?.classList.toggle('open'); mobileMenuPanel?.setAttribute('aria-hidden', String(!mobileMenuPanel.classList.contains('open'))); }
function closeMobileMenu() { mobileMenuPanel?.classList.remove('open'); mobileMenuPanel?.setAttribute('aria-hidden','true'); }

function mobileElements() { return {
  mobileMenuButton: document.getElementById('mobileMenuButton'), mobileMenuPanel: document.getElementById('mobileMenuPanel'),
  mobileDataButton: document.getElementById('mobileDataButton'), mobileLayersButton: document.getElementById('mobileLayersButton'), mobileThemeButton: document.getElementById('mobileThemeButton'),
  mobileResetZoomButton: document.getElementById('mobileResetZoomButton'), mobileSearchInput: document.getElementById('mobileSearchInput'), mobileSearchGoButton: document.getElementById('mobileSearchGoButton')
}; }
const { mobileMenuButton, mobileMenuPanel, mobileDataButton, mobileLayersButton, mobileThemeButton, mobileResetZoomButton, mobileSearchInput, mobileSearchGoButton } = mobileElements();

const THEME_KEY = 'nucleidos-theme-mode';
const THEME_MODES = ['auto', 'day', 'night'];
const SOLAR_ZENITH = 90.833;
const DEFAULT_SOLAR_LOCATION = { latitude: 41.3874, longitude: 2.1686 };
let temporalThemeTimer = null;
function initTemporalTheme() {
  const mode = normalizeThemeMode(localStorage.getItem(THEME_KEY) || 'auto');
  localStorage.setItem(THEME_KEY, mode);
  applyThemeMode(mode);
  window.clearInterval(temporalThemeTimer);
  temporalThemeTimer = window.setInterval(() => { if (normalizeThemeMode(localStorage.getItem(THEME_KEY) || 'auto') === 'auto') applyThemeMode('auto'); }, 60_000);
}
function cycleThemeMode() {
  const current = normalizeThemeMode(localStorage.getItem(THEME_KEY) || 'auto');
  const next = THEME_MODES[(THEME_MODES.indexOf(current) + 1) % THEME_MODES.length];
  localStorage.setItem(THEME_KEY, next);
  applyThemeMode(next);
}
function normalizeThemeMode(mode) { return THEME_MODES.includes(mode) ? mode : 'auto'; }
function applyThemeMode(mode) {
  const resolved = mode === 'auto' ? temporalTheme(new Date()) : mode;
  const dark = resolved === 'night';
  document.body.classList.toggle('dark', dark);
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.themeResolved = dark ? 'dark' : 'light';
  updateThemeIcon(dark, mode);
  scheduleRender();
  if (state.atom) drawAtom(performance.now());
}
function updateThemeIcon(dark, mode) {
  const cls = `theme-icon ${dark ? 'moon-icon' : 'sun-icon'}`;
  for (const icon of [themeIcon, mobileThemeIcon].filter(Boolean)) icon.setAttribute('class', cls);
  const label = dark ? 'Modo noche' : 'Modo día';
  for (const button of [darkModeButton, mobileThemeButton].filter(Boolean)) {
    button.title = `${label}${mode === 'auto' ? ' · automático' : ''}`;
    button.setAttribute('aria-label', `${label}. Pulsar para cambiar modo.`);
  }
}
function temporalTheme(date) {
  const minute = date.getHours() * 60 + date.getMinutes() + date.getSeconds()/60;
  const solar = getSolarDay(date, DEFAULT_SOLAR_LOCATION);
  return minute < solar.sunrise - 35 || minute > solar.sunset + 45 ? 'night' : 'day';
}
function getSolarDay(date, location) {
  const day = dayOfYear(date);
  const gamma = (2 * Math.PI / 365) * (day - 1);
  const equationOfTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  const declination = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  const latitude = toRadians(location.latitude);
  const zenith = toRadians(SOLAR_ZENITH);
  const hourAngle = Math.acos(clampValue((Math.cos(zenith) / (Math.cos(latitude) * Math.cos(declination))) - Math.tan(latitude) * Math.tan(declination), -1, 1));
  const hourAngleDegrees = toDegrees(hourAngle);
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;
  return {
    sunrise: clampValue(720 - (4 * (location.longitude + hourAngleDegrees)) - equationOfTime + (timezoneOffsetHours * 60), 0, 1440),
    sunset: clampValue(720 - (4 * (location.longitude - hourAngleDegrees)) - equationOfTime + (timezoneOffsetHours * 60), 0, 1440)
  };
}
function dayOfYear(date) { const start = new Date(date.getFullYear(), 0, 0); return Math.floor((date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000)) / 86400000); }
function toRadians(value) { return value * Math.PI / 180; }
function toDegrees(value) { return value * 180 / Math.PI; }
function clampValue(value, min, max) { return Math.min(max, Math.max(min, value)); }

async function loadIaeaData() {
  dataStatus.textContent = 'Cargando IAEA LiveChart...';
  try {
    const response = await fetch(IAEA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const mapped = parseCsv(await response.text()).map(row => rowToNuclide(row, 'IAEA LiveChart', 'evaluated')).filter(n => n && n.z > 0);
    if (!mapped.length) throw new Error('Sin datos reconocibles');
    state.official = mapped; state.secondary = []; rebuildDerivedData(); renderLegend(); fitToScreen(true); closeDataPopover(); closeNuclideCard();
    dataStatus.textContent = `Cargados ${mapped.length.toLocaleString('es-ES')} nucleidos desde IAEA.`;
  } catch (err) { dataStatus.textContent = 'No se pudo cargar desde IAEA por CORS/conectividad. Usa CSV local.'; }
}
function handleCsvInput(event) {
  const file = event.target.files?.[0]; if (!file) return;
  readFile(file, text => { const mapped = parseCsv(text).map(row => rowToNuclide(row, file.name, 'evaluated')).filter(n => n && n.z > 0); state.official = mapped; state.secondary = []; rebuildDerivedData(); renderLegend(); fitToScreen(true); closeDataPopover(); closeNuclideCard(); dataStatus.textContent = `Importados ${mapped.length.toLocaleString('es-ES')} nucleidos desde ${file.name}.`; });
}
function handleSecondaryInput(event) {
  const file = event.target.files?.[0]; if (!file) return;
  readFile(file, text => { const mapped = parseCsv(text).map(row => rowToNuclide(row, file.name, detectDataClass(row))).filter(n => n && n.z > 0); state.secondary = mapped; rebuildDerivedData(); renderLegend(); dataStatus.textContent = `Dataset secundario: ${mapped.length.toLocaleString('es-ES')} registros.`; closeDataPopover(); });
}
function readFile(file, cb) { const reader = new FileReader(); reader.onload = () => cb(String(reader.result || '')); reader.readAsText(file); }

function parseCsv(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i=0; i<text.length; i++) {
    const ch=text[i], next=text[i+1];
    if (ch === '"') { if (quoted && next === '"') { cell+='"'; i++; } else quoted=!quoted; }
    else if (ch === ',' && !quoted) { row.push(cell); cell=''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) { if (ch === '\r' && next === '\n') i++; row.push(cell); if (row.some(v => String(v).trim())) rows.push(row); row=[]; cell=''; }
    else cell += ch;
  }
  row.push(cell); if (row.some(v => String(v).trim())) rows.push(row);
  if (!rows.length) return [];
  const headers = rows.shift().map(normalizeKey);
  return rows.map(values => Object.fromEntries(headers.map((h,i) => [h, values[i] ?? ''])));
}
function normalizeKey(k) { return String(k||'').trim().toLowerCase().replace(/[%()\s\-]+/g,'_').replace(/_+$/,''); }
function rowToNuclide(row, source, fallbackClass) {
  const z = number(row.z ?? row.protons ?? row.atomic_number) ?? zFromSymbol(row.symbol);
  const mass = number(row.a ?? row.mass_number ?? row.mass);
  const n = number(row.n ?? row.neutrons) ?? (mass != null && z != null ? mass - z : null);
  if (z == null || n == null) return null;
  const a = mass ?? z + n;
  const [fallbackSymbol, fallbackElement] = elementInfo(z);
  const symbol = cleanSymbol(row.symbol) || fallbackSymbol;
  const element = clean(row.element || row.name) || fallbackElement;
  const dataClass = detectDataClass(row, fallbackClass);
  const stateId = clean(row.state || row.isomer || row.energy_level) || 'gs';
  const decay = classifyDecay(row);
  return {
    uid: `${dataClass}-${z}-${n}-${stateId}-${symbol}`, z, n, a, symbol, element, stateId, dataClass,
    decay, half_life: halfLifeLabel(row, decay), half_life_seconds: number(row.half_life_sec || row.halflife_seconds), abundance: clean(row.abundance),
    atomic_mass: clean(row.atomic_mass), mass_excess: clean(row.massexcess || row.mass_excess), binding: clean(row.binding), qalpha: clean(row.qa), qbeta: clean(row.qbm || row.qbeta || row.qb), qec: clean(row.qec), sn: clean(row.sn), sp: clean(row.sp), spin: clean(row.jp || row.spin || row.spin_parity),
    notes: clean(row.notes), applications: clean(row.application || row.applications), wikipedia: clean(row.wikipedia), livechart: clean(row.livechart), raw: row, source
  };
}
function classifyDecay(row) {
  const vals = [row.decay_1,row.decay_2,row.decay_3,row.decay,row.decay_mode,row.decay_type].map(v => String(v||'').toLowerCase()).join(' ');
  const hl = String(row.half_life||row.halflife||'').toLowerCase();
  if (vals.includes('stable') || hl.includes('stable') || hl === 'stbl') return 'stable';
  if (/(^|\s|,)(b-|β-|beta-|β−)/.test(vals)) return 'beta-';
  if (vals.includes('b+') || vals.includes('β+') || vals.includes('ec') || vals.includes('epsilon')) return 'beta+/EC';
  if (vals.includes('alpha') || /(^|\s)a(\s|,|$)/.test(vals)) return 'alpha';
  if (vals.includes('sf')) return 'sf';
  if (vals.includes('cluster')) return 'cluster';
  if (vals.includes('it') || vals.includes('isomer')) return 'it';
  if (/(^|\s|,)p(\s|,|$)/.test(vals)) return 'p';
  if (/(^|\s|,)n(\s|,|$)/.test(vals)) return 'n';
  return 'unknown';
}
function halfLifeLabel(row, decay) {
  const raw = clean(row.half_life || row.halflife);
  if (!raw) return decay === 'stable' ? 'Estable' : '—';
  return `${clean(row.operator_hl)||''}${raw}${row.unit_hl ? ` ${row.unit_hl}` : ''}`.trim();
}
function detectDataClass(row, fallback='evaluated') {
  const val = String(row.data_class || row.quality || row.source_type || row.state_type || '').toLowerCase();
  if (val.includes('isomer') || /^m\d+/.test(String(row.state || '').toLowerCase())) return 'isomer';
  if (val.includes('theor') || val.includes('estim') || val.includes('unobserved') || val.includes('pred')) return 'theoretical';
  return fallback;
}
function clean(v) { const s=String(v??'').trim(); return s && s !== 'NaN' ? s : ''; }
function cleanSymbol(v) { const s=clean(v); return s ? cap(s) : ''; }
function number(v) { const n = Number(String(v??'').replace(',','.')); return Number.isFinite(n) ? n : null; }
function numeric(v) { const n = Number(String(v??'').replace(',','.').replace(/[≈<>]/g,'')); return Number.isFinite(n) ? n : NaN; }
function zFromSymbol(sym) { const s=cleanSymbol(sym); const idx=ELEMENTS.findIndex(e => e && e[0] === s); return idx > 0 ? idx : null; }

function electronShells(z) {
  const caps = [2,8,18,32,32,18,8]; let left = Math.max(0,z), out=[];
  for (const cap of caps) { if (left <= 0) break; const take=Math.min(cap,left); out.push(take); left-=take; }
  if (left>0) out.push(left); return out;
}
function buildAtomState(n) {
  const shells = electronShells(n.z);
  const particles = [];
  const total = Math.min(190, n.z + n.n);
  for (let i=0; i<total; i++) {
    const phi = Math.acos(1 - 2*(i+0.5)/total), theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 15 + Math.pow(i/Math.max(1,total), .55) * 38;
    particles.push({ x: Math.cos(theta)*Math.sin(phi)*r, y: Math.sin(theta)*Math.sin(phi)*r, z: Math.cos(phi)*r, proton: i < Math.min(n.z,total), size: 5.5 + (i%5)*.35 });
  }
  return { z:n.z, neutrons:n.n, shells, particles, title:`${n.symbol}-${n.a}` };
}
function resizeAtomCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = atomCanvas.getBoundingClientRect();
  atomCanvas.width = Math.max(10, Math.floor(r.width*dpr)); atomCanvas.height = Math.max(10, Math.floor(r.height*dpr));
  atomCtx.setTransform(dpr,0,0,dpr,0,0);
}
function drawAtomLoop(now) {
  if (!state.animationEnabled) { requestAnimationFrame(drawAtomLoop); return; }
  if (state.atom) drawAtom(now);
  requestAnimationFrame(drawAtomLoop);
}
function drawAtom(now) {
  const atom = state.atom; if (!atom) return;
  const c = atomCtx, w = atomCanvas.clientWidth, h = atomCanvas.clientHeight, min = Math.min(w,h);
  c.clearRect(0,0,w,h);
  const dark = document.body.classList.contains('dark');
  const bg = c.createRadialGradient(w*.5,h*.44,min*.05,w*.5,h*.5,min*.62);
  bg.addColorStop(0, dark ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.95)');
  bg.addColorStop(1, dark ? 'rgba(20,24,33,.74)' : 'rgba(232,226,214,.72)');
  c.fillStyle = bg; roundedRect(c, 0, 0, w, h, 22); c.fill();
  const cx=w/2, cy=h/2, focal = Math.max(260, min*.78);
  const t = now/1000;

  // Fondo de profundidad: meridianos tenues para que el modelo no parezca plano.
  c.save();
  c.translate(cx, cy);
  c.strokeStyle = dark ? 'rgba(255,255,255,.045)' : 'rgba(40,38,35,.055)';
  c.lineWidth = 1;
  for (let i=0; i<5; i++) {
    c.beginPath();
    c.ellipse(0, 0, min*.30, min*.30*(.25+i*.12), (i*.35)+t*.045, 0, Math.PI*2);
    c.stroke();
  }
  c.restore();

  const base = Math.max(72, min * .145);
  const gap = Math.max(42, min * .079);
  const spinY = t * .34;
  const spinX = Math.sin(t * .18) * .18;
  const objects = [];

  // Órbitas 3D: se proyectan punto a punto y se separan en segmentos por profundidad.
  c.save();
  c.lineWidth = Math.max(1, min * .0022);
  atom.shells.forEach((count, si) => {
    const radius = base + si * gap;
    const planes = Math.min(3, Math.max(1, Math.ceil(count / 14)));
    for (let plane = 0; plane < planes; plane++) {
      const pts = [];
      for (let j = 0; j <= 192; j++) {
        const a = (j / 192) * Math.PI * 2;
        const p = rotate3D(orbitPoint(radius, a, (plane + si) % 3), spinX, spinY + si * .06, 0);
        pts.push(project3D(p, cx, cy, focal));
      }
      for (let j = 1; j < pts.length; j++) {
        const d = (pts[j].z + pts[j-1].z) * .5;
        c.beginPath();
        c.moveTo(pts[j-1].x, pts[j-1].y);
        c.lineTo(pts[j].x, pts[j].y);
        const alpha = d > 0 ? .24 : .09;
        c.strokeStyle = dark ? `rgba(255,255,255,${alpha})` : `rgba(20,20,20,${alpha})`;
        c.stroke();
      }
    }

    const visible = Math.min(count, si < 3 ? count : 28);
    for (let i = 0; i < visible; i++) {
      const plane = (i + si) % 3;
      const a = (i / visible) * Math.PI * 2 + t * (.56 + si * .075) * (si % 2 ? -1 : 1);
      const p = rotate3D(orbitPoint(radius, a, plane), spinX, spinY + si * .06, 0);
      const pr = project3D(p, cx, cy, focal);
      objects.push({ kind: 'electron', x: pr.x, y: pr.y, z: pr.z, depth: pr.depth, r: (5.7 + Math.max(0, pr.z) / focal * 6) * Math.max(.88, pr.depth) });
    }
  });
  c.restore();

  const nucleusScale = Math.min(1.28, .72 + Math.log10(atom.z + atom.neutrons + 3) * .22);
  for (const part of atom.particles) {
    const p = rotate3D({ x: part.x, y: part.y, z: part.z }, spinX + .34, spinY * 1.45, t * .11);
    const pr = project3D(p, cx, cy, focal, nucleusScale);
    objects.push({ kind: part.proton ? 'proton' : 'neutron', x: pr.x, y: pr.y, z: pr.z, depth: pr.depth, r: part.size * nucleusScale * Math.max(.84, pr.depth) });
  }

  objects.sort((a, b) => a.z - b.z);
  for (const o of objects) {
    if (o.kind === 'electron') drawSphere(c, o.x, o.y, o.r, '#0a0a9f', '#5d7cff', normalizedDepth(o.z, focal));
    else if (o.kind === 'proton') drawSphere(c, o.x, o.y, o.r, '#a93b32', '#ff574f', normalizedDepth(o.z, focal));
    else drawSphere(c, o.x, o.y, o.r, '#55565d', '#a3a5ad', normalizedDepth(o.z, focal));
  }

  // Halo del núcleo por delante, sutil, para remarcar la composición 3D.
  const halo = c.createRadialGradient(cx, cy, min * .025, cx, cy, min * .16);
  halo.addColorStop(0, dark ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.35)');
  halo.addColorStop(1, 'rgba(93,90,246,0)');
  c.fillStyle = halo;
  c.beginPath();
  c.arc(cx, cy, min * .18, 0, Math.PI * 2);
  c.fill();

  c.save();
  c.font = `900 ${Math.max(12, min * .026)}px system-ui, sans-serif`;
  c.textAlign = 'left';
  c.textBaseline = 'top';
  c.fillStyle = dark ? 'rgba(255,255,255,.68)' : 'rgba(28,28,28,.58)';
  c.fillText('3D', Math.max(18, min * .035), Math.max(18, min * .035));
  if (!state.animationEnabled) {
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = dark ? 'rgba(255,255,255,.74)' : 'rgba(20,20,20,.62)';
    c.font = `900 ${Math.max(14, min * .032)}px system-ui, sans-serif`;
    c.fillText('Pausado', cx, h - Math.max(28, min * .055));
  }
  c.restore();
}
function normalizedDepth(z, focal) {
  return Math.max(.05, Math.min(.95, (z / (focal * .42) + 1) / 2));
}
function drawSphere(c, x, y, r, dark, light, depth = .5) {
  const g = c.createRadialGradient(x - r*.35, y - r*.45, r*.08, x, y, r);
  g.addColorStop(0, light);
  g.addColorStop(.55, mixColor(light, dark, .45));
  g.addColorStop(1, dark);
  c.globalAlpha = .66 + depth * .34;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = g;
  c.fill();
  c.globalAlpha = 1;
  c.lineWidth = Math.max(.75, r * .08);
  c.strokeStyle = 'rgba(255,255,255,.22)';
  c.stroke();
}
function mixColor(a, b, t) {
  const pa = hexToRgb(a), pb = hexToRgb(b);
  if (!pa || !pb) return a;
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r},${g},${bl})`;
}
function hexToRgb(hex) {
  const m = String(hex).replace('#','').match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

init();