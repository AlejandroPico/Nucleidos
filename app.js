'use strict';

const CELL_W = 82;
const CELL_H = 72;
const GAP = 10;
const AXIS = 54;
const OFFICIAL_Z_MAX = 118;
const DEFAULT_Z_MAX = 130;
const DEFAULT_N_MAX = 240;
let Z_MAX = DEFAULT_Z_MAX;
let N_MAX = DEFAULT_N_MAX;
const TILE_STEP_X = CELL_W + GAP;
const TILE_STEP_Y = CELL_H + GAP;
let CHART_W = 0;
let CHART_H = 0;
const IAEA_URL = 'https://www-nds.iaea.org/relnsd/v0/data?fields=ground_states&nuclides=all';
const OFFICIAL_CSV_URL = 'nuclides.csv';

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

const KNOWN = {
  '1-0': { half_life: 'Estable', abundance: '99,985%', atomic_mass: '1,007825032 u', spin: '1/2+', decay: 'stable', notes: 'Protio: isótopo más abundante del hidrógeno. Núcleo formado por un único protón.', source: 'Muestra interna' },
  '1-1': { half_life: 'Estable', abundance: '0,015%', atomic_mass: '2,014101778 u', spin: '1+', decay: 'stable', notes: 'Deuterio: hidrógeno pesado. Su núcleo contiene un protón y un neutrón.', source: 'Muestra interna' },
  '1-2': { half_life: '12,32 años', abundance: 'traza', atomic_mass: '3,01604928 u', spin: '1/2+', decay: 'beta-', notes: 'Tritio: radiactivo, usado en trazadores, investigación y dispositivos luminosos especializados.', source: 'Muestra interna' },
  '2-2': { half_life: 'Estable', abundance: '≈99,9999%', atomic_mass: '4,002603254 u', spin: '0+', decay: 'stable', notes: 'Helio-4: núcleo alfa. Muy estable por su configuración nuclear cerrada.', source: 'Muestra interna' },
  '6-6': { half_life: 'Estable', abundance: '98,93%', atomic_mass: '12 u', spin: '0+', decay: 'stable', notes: 'Carbono-12: patrón histórico de la unidad de masa atómica. Base de la escala de masas atómicas relativas.', source: 'Muestra interna' },
  '6-8': { half_life: '5730 años', abundance: 'traza', atomic_mass: '14,00324199 u', spin: '0+', decay: 'beta-', notes: 'Carbono-14: usado en datación radiocarbónica de materiales orgánicos.', source: 'Muestra interna' },
  '8-8': { half_life: 'Estable', abundance: '99,76%', atomic_mass: '15,99491462 u', spin: '0+', decay: 'stable', notes: 'Oxígeno-16: isótopo dominante del oxígeno natural.', source: 'Muestra interna' },
  '20-20': { half_life: 'Estable', abundance: '96,94%', atomic_mass: '39,96259098 u', spin: '0+', decay: 'stable', notes: 'Calcio-40: isótopo dominante del calcio natural. Núcleo par-par con Z=20 y N=20, ambos números mágicos.', source: 'Muestra interna' },
  '20-22': { half_life: 'Estable', abundance: '0,647%', atomic_mass: '41,95861801 u', spin: '0+', decay: 'stable', notes: 'Calcio-42: isótopo estable minoritario del calcio.', source: 'Muestra interna' },
  '20-23': { half_life: 'Estable', abundance: '0,135%', atomic_mass: '42,9587666 u', spin: '7/2-', decay: 'stable', notes: 'Calcio-43: isótopo estable impar del calcio; útil en espectroscopía RMN.', source: 'Muestra interna' },
  '20-24': { half_life: 'Estable', abundance: '2,086%', atomic_mass: '43,9554818 u', spin: '0+', decay: 'stable', notes: 'Calcio-44: isótopo estable del calcio.', source: 'Muestra interna' },
  '20-26': { half_life: 'Estable observacional', abundance: '0,004%', atomic_mass: '45,9536926 u', spin: '0+', decay: 'stable', notes: 'Calcio-46: muy poco abundante. Considerado estable a efectos prácticos.', source: 'Muestra interna' },
  '20-28': { half_life: '≈6,4×10¹⁹ años', abundance: '0,187%', atomic_mass: '47,9525228 u', spin: '0+', decay: 'beta-', notes: 'Calcio-48: doblemente mágico y extremadamente longevo. Puede sufrir doble beta con vida media enorme.', source: 'Muestra interna' },
  '26-30': { half_life: 'Estable', abundance: '91,75%', atomic_mass: '55,9349363 u', spin: '0+', decay: 'stable', notes: 'Hierro-56: uno de los núcleos más ligados; muy común en nucleosíntesis estelar.', source: 'Muestra interna' },
  '82-126': { half_life: 'Estable', abundance: '52,4%', atomic_mass: '207,9766521 u', spin: '0+', decay: 'stable', notes: 'Plomo-208: doblemente mágico, uno de los núcleos estables más pesados.', source: 'Muestra interna' },
  '92-143': { half_life: '≈7,04×10⁸ años', abundance: '0,720%', atomic_mass: '235,0439299 u', spin: '7/2-', decay: 'alpha', notes: 'Uranio-235: fisible con neutrones térmicos; crucial en reactores y física nuclear aplicada.', source: 'Muestra interna' },
  '92-146': { half_life: '≈4,468×10⁹ años', abundance: '99,274%', atomic_mass: '238,050788 u', spin: '0+', decay: 'alpha', notes: 'Uranio-238: isótopo dominante del uranio natural. Padre de una cadena de desintegración natural.', source: 'Muestra interna' }
};

const DECAY_LABELS = {
  'stable': 'Estable',
  'beta-': 'β−',
  'beta+/EC': 'β+/EC',
  'alpha': 'α',
  'sf': 'FE',
  'p': 'p',
  'n': 'n',
  'it': 'IT',
  'cluster': 'Clúster',
  'unknown': 'Otro'
};

const PALETTES = {
  decay: {
    stable: '#dfead4',
    'beta-': '#dce6f8',
    'beta+/EC': '#f6dfdc',
    alpha: '#f5e3bd',
    sf: '#e4d8f7',
    p: '#f4d7c8',
    n: '#d7e9ea',
    it: '#dee0f7',
    cluster: '#ead9c2',
    unknown: '#e8e5dc'
  },
  stability: {
    stable: '#dcefd9',
    radioactive: '#f2dfcf',
    unknown: '#e8e5dc'
  },
  halflife: {
    stable: '#dcefd9',
    long: '#e9e4c8',
    medium: '#f1d7bd',
    short: '#efd0d4',
    unknown: '#e8e5dc'
  }
};

const state = {
  nuclides: [],
  byKey: new Map(),
  selected: null,
  selectedEl: null,
  colorMode: 'decay',
  modeFilters: {
    decay: new Set(['stable','beta-','beta+/EC','alpha','sf','p','n','it','cluster','unknown']),
    stability: new Set(['stable','radioactive','unknown']),
    halflife: new Set(['stable','long','medium','short','unknown'])
  },
  scale: 1,
  tx: 0,
  ty: 0,
  fitScale: 1,
  dragging: false,
  dragStart: null,
  animationEnabled: true,
  atom: null,
  atomFrame: 0
};

const viewport = document.getElementById('viewport');
const chart = document.getElementById('chart');
const zoomHud = document.getElementById('zoomHud');
const legendButton = document.getElementById('legendButton');
const legendPopover = document.getElementById('legendPopover');
const legendModeLabel = document.getElementById('legendModeLabel');
const legendModes = document.getElementById('legendModes');
const cursorHud = document.getElementById('cursorHud');
const menuButton = document.getElementById('menuButton');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');
const scrim = document.getElementById('scrim');
const card = document.getElementById('nuclideCard');
const searchTool = document.getElementById('searchTool');
const searchToggleButton = document.getElementById('searchToggleButton');
const darkModeButton = document.getElementById('darkModeButton');
const themeIcon = document.getElementById('themeIcon');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resetViewButton = document.getElementById('resetViewButton');
const fitWidthButton = document.getElementById('fitWidthButton');
const axesToggle = document.getElementById('axesToggle');
const animationToggle = document.getElementById('animationToggle');
const csvInput = document.getElementById('csvInput');
const loadIaeaButton = document.getElementById('loadIaeaButton');
const dataStatus = document.getElementById('dataStatus');
const legend = document.getElementById('legend');
const atomCanvas = document.getElementById('atomCanvas');
const atomCtx = atomCanvas.getContext('2d');

async function init() {
  updateChartMetrics();
  document.documentElement.style.setProperty('--tile-step-x', `${TILE_STEP_X}px`);
  document.documentElement.style.setProperty('--tile-step-y', `${TILE_STEP_Y}px`);
  state.nuclides = await loadInitialNuclides();
  updateBoundsFromData(state.nuclides);
  indexNuclides();
  renderChart();
  renderLegend();
  fitToScreen(true);
  bindEvents();
  requestAnimationFrame(drawAtomLoop);
}

async function loadInitialNuclides() {
  const sources = [];
  try {
    const response = await fetch(OFFICIAL_CSV_URL, { cache: 'no-store' });
    if (response.ok) {
      const text = await response.text();
      sources.push({ name: OFFICIAL_CSV_URL, text });
    }
  } catch (_) {
    // Abrir la app como file:// puede bloquear fetch() de ficheros locales.
  }

  if (window.EMBEDDED_NUCLIDES_CSV) {
    sources.push({ name: 'nuclides.csv integrado', text: window.EMBEDDED_NUCLIDES_CSV });
  }

  for (const source of sources) {
    try {
      const rows = parseCsv(source.text);
      const mapped = rows.map(row => rowToNuclide(row, source.name)).filter(n => n && Number(n.z) > 0);
      if (mapped.length) {
        if (dataStatus) dataStatus.textContent = `Cargados ${mapped.length.toLocaleString('es-ES')} nucleidos desde ${source.name}.`;
        return mapped;
      }
    } catch (_) {
      // Si una fuente falla, pasamos a la siguiente.
    }
  }

  const generated = generateNuclides();
  if (dataStatus) dataStatus.textContent = 'No se pudo leer nuclides.csv. Usando malla interna de respaldo.';
  return generated;
}


function updateChartMetrics() {
  CHART_W = AXIS + (N_MAX + 1) * TILE_STEP_X + 110;
  CHART_H = AXIS + Z_MAX * TILE_STEP_Y + 110;
  document.documentElement.style.setProperty('--chart-w', `${CHART_W}px`);
  document.documentElement.style.setProperty('--chart-h', `${CHART_H}px`);
  chart.style.width = `${CHART_W}px`;
  chart.style.height = `${CHART_H}px`;
}

function updateBoundsFromData(rows) {
  const maxZ = Math.max(DEFAULT_Z_MAX, ...rows.map(n => Number(n.z) || 0)) + 2;
  const maxN = Math.max(DEFAULT_N_MAX, ...rows.map(n => Number(n.n) || 0)) + 4;
  Z_MAX = Math.ceil(maxZ / 10) * 10;
  N_MAX = Math.ceil(maxN / 10) * 10;
  updateChartMetrics();
}

function stableNFor(Z) {
  return Math.round(Z * (1 + 0.0056 * Z));
}

function shouldIncludeNuclide(Z, N, center, width) {
  const d = Math.abs(N - center);
  if (d <= width) return true;
  const magic = [2, 8, 20, 28, 50, 82, 126, 184];
  return magic.includes(N) && d <= width + 6;
}

function estimateDecay(Z, N) {
  const center = stableNFor(Z);
  if (Z > 106) return Math.abs(N - center) < 8 ? 'sf' : 'alpha';
  if (Z > 82 && Math.abs(N - center) <= 10) return 'alpha';
  if ((Z === 43 || Z === 61) && Math.abs(N - center) <= 2) return 'beta-';
  if (Z <= 82 && Math.abs(N - center) <= 1) return 'stable';
  if (N > center) return 'beta-';
  if (N < center) return 'beta+/EC';
  return 'unknown';
}

function estimateHalfLife(decay, distance, Z) {
  if (decay === 'stable') return 'Estable';
  if (decay === 'alpha' && Z > 82 && distance < 5) return 'larga';
  if (distance <= 2) return 'larga';
  if (distance <= 6) return 'media';
  return 'corta';
}

function generateNuclides() {
  const result = [];
  for (let Z = 1; Z <= OFFICIAL_Z_MAX; Z++) {
    const [symbol, element] = elementInfo(Z);
    const center = stableNFor(Z);
    const width = Math.max(3, Math.round(3 + Z / 4.2));
    const minN = Math.max(0, center - width - 3);
    const maxN = Math.min(N_MAX, center + width + 3);
    for (let N = minN; N <= maxN; N++) {
      if (!shouldIncludeNuclide(Z, N, center, width)) continue;
      const A = Z + N;
      const key = `${Z}-${N}`;
      const known = KNOWN[key] || {};
      const decay = known.decay || estimateDecay(Z, N);
      const distance = Math.abs(N - center);
      const halfLife = known.half_life || estimateHalfLife(decay, distance, Z);
      result.push({
        z: Z,
        n: N,
        a: A,
        symbol,
        element,
        decay,
        half_life: halfLife,
        abundance: known.abundance || (decay === 'stable' ? 'natural posible' : '—'),
        atomic_mass: known.atomic_mass || `≈${A} u`,
        spin: known.spin || '—',
        q_value: known.q_value || '—',
        mass_excess: known.mass_excess || '—',
        source: known.source || 'Malla interna estimada',
        notes: known.notes || buildGenericNote(Z, N, decay, center),
        wikipedia: `https://es.wikipedia.org/wiki/Is%C3%B3topos_de_${encodeURIComponent(element)}`,
        livechart: `https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html?z=${Z}&n=${N}`,
        estimated: !KNOWN[key]
      });
    }
  }
  return result.sort((a,b) => (a.z - b.z) || (a.n - b.n));
}

function buildGenericNote(Z, N, decay, center) {
  const relation = N === center ? 'cerca de la línea estimada de estabilidad' : N > center ? 'rico en neutrones' : 'deficiente en neutrones';
  const mode = DECAY_LABELS[decay] || decay;
  return `Nucleido ${relation}. Modo dominante mostrado: ${mode}. Esta ficha procede de una malla interna de demostración; para valores nucleares evaluados conviene importar datos ENSDF/IAEA.`;
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

function indexNuclides() {
  state.byKey.clear();
  state.nuclides.forEach(n => state.byKey.set(`${n.z}-${n.n}`, n));
  markNaturalNuclides();
}

function numericAbundance(value) {
  if (value == null) return NaN;
  const txt = String(value).replace('%','').replace(',', '.').trim();
  const num = Number(txt);
  return Number.isFinite(num) ? num : NaN;
}

function markNaturalNuclides() {
  const bestByZ = new Map();
  for (const n of state.nuclides) {
    n.isNatural = false;
    n.isPrimaryNatural = false;
    const ab = numericAbundance(n.abundance);
    if (Number.isFinite(ab) && ab > 0) {
      n.isNatural = true;
      const current = bestByZ.get(n.z);
      if (!current || ab > current.abundance) bestByZ.set(n.z, { n, abundance: ab });
    }
  }
  for (const item of bestByZ.values()) item.n.isPrimaryNatural = true;
}

function renderChart() {
  chart.innerHTML = '';
  renderAxes();
  const fragment = document.createDocumentFragment();
  for (const n of state.nuclides) {
    const el = document.createElement('button');
    el.className = `nuclide-cell${n.isNatural ? ' natural-cell' : ''}${n.isPrimaryNatural ? ' primary-natural-cell' : ''}`;
    el.type = 'button';
    el.dataset.key = `${n.z}-${n.n}`;
    el.dataset.decay = n.decay;
    el.style.left = `${AXIS + n.n * TILE_STEP_X + (TILE_STEP_X - CELL_W) / 2}px`;
    el.style.top = `${AXIS + (Z_MAX - n.z) * TILE_STEP_Y + (TILE_STEP_Y - CELL_H) / 2}px`;
    el.style.setProperty('--cell-color', getCellColor(n));
    const cellLabel = `${n.element}-${n.a} · Z=${n.z} · N=${n.n}`;
    el.setAttribute('aria-label', cellLabel);
    el.innerHTML = `
      <div class="cell-top"><span>${n.a}</span><span>N${n.n}</span></div>
      <div class="cell-main">
        <div class="cell-symbol">${escapeHtml(n.symbol)}</div>
        <div class="cell-name">${escapeHtml(displayElementName(n.element))}</div>
      </div>
      <div class="cell-bottom"><span>Z${n.z}</span><span class="decay-badge">${DECAY_LABELS[n.decay] || n.decay}</span></div>
    `;
    fragment.appendChild(el);
  }
  chart.appendChild(fragment);
  applyFilters();
  updateTransform();
}

function renderAxes() {
  const frag = document.createDocumentFragment();

  const corner = document.createElement('div');
  corner.className = 'axis-corner';
  corner.innerHTML = `
    <span class="axis-pill"><strong>N</strong><em>neutrones →</em></span>
    <span class="axis-pill"><strong>Z</strong><em>protones ↑</em></span>
  `;
  corner.style.left = `${Math.max(8, AXIS - 48)}px`;
  corner.style.top = `${Math.max(8, AXIS - 46)}px`;
  frag.appendChild(corner);

  for (let N = 0; N <= N_MAX; N += 10) {
    const label = document.createElement('div');
    label.className = 'axis-label x';
    label.textContent = N;
    label.style.left = `${AXIS + N * TILE_STEP_X + TILE_STEP_X / 2}px`;
    label.style.top = `${AXIS - 28}px`;
    frag.appendChild(label);
  }
  for (let Z = 10; Z <= Z_MAX; Z += 10) {
    const label = document.createElement('div');
    label.className = 'axis-label y';
    label.textContent = Z;
    label.style.left = `${AXIS - 10}px`;
    label.style.top = `${AXIS + (Z_MAX - Z) * TILE_STEP_Y + TILE_STEP_Y / 2}px`;
    frag.appendChild(label);
  }
  chart.appendChild(frag);
}

function stabilityCategory(n) {
  if (!n || !n.decay || n.decay === 'unknown') return 'unknown';
  return n.decay === 'stable' ? 'stable' : 'radioactive';
}

function halflifeCategory(n) {
  const h = String(n?.half_life || '').toLowerCase();
  if (!n || !n.decay || n.decay === 'unknown') return 'unknown';
  if (n.decay === 'stable' || h.includes('estable')) return 'stable';
  if (h.includes('larga') || h.includes('año') || h.includes('10')) return 'long';
  if (h.includes('media') || h.includes('día') || h.includes('hora')) return 'medium';
  if (h.includes('corta') || h.includes('ms') || h.includes('µs') || h.includes('us') || h.includes('ns') || /\b[0-9,.]+\s*s\b/.test(h)) return 'short';
  return 'unknown';
}

function categoryForMode(n, mode = state.colorMode) {
  if (mode === 'stability') return stabilityCategory(n);
  if (mode === 'halflife') return halflifeCategory(n);
  return n?.decay || 'unknown';
}

function getCellColor(n) {
  if (state.colorMode === 'stability') {
    return PALETTES.stability[stabilityCategory(n)] || PALETTES.stability.unknown;
  }
  if (state.colorMode === 'halflife') {
    return PALETTES.halflife[halflifeCategory(n)] || PALETTES.halflife.unknown;
  }
  return PALETTES.decay[n.decay] || PALETTES.decay.unknown;
}

function applyColorMode() {
  document.querySelectorAll('.nuclide-cell').forEach(el => {
    const n = state.byKey.get(el.dataset.key);
    if (n) el.style.setProperty('--cell-color', getCellColor(n));
  });
  applyFilters();
  renderLegend();
}

function applyFilters() {
  const active = state.modeFilters[state.colorMode] || new Set();
  document.querySelectorAll('.nuclide-cell').forEach(el => {
    const n = state.byKey.get(el.dataset.key);
    const category = categoryForMode(n);
    el.classList.toggle('dimmed', !active.has(category));
  });
}

function renderLegend() {
  legend.innerHTML = '';
  if (legendModes) legendModes.innerHTML = '';

  const modeNames = { decay: 'Desintegración', stability: 'Estabilidad', halflife: 'Vida media' };
  const modeOrder = ['decay', 'stability', 'halflife'];
  if (legendModeLabel) legendModeLabel.textContent = modeNames[state.colorMode] || 'Modo actual';

  for (const mode of modeOrder) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `legend-mode-btn${mode === state.colorMode ? ' active' : ''}`;
    btn.textContent = modeNames[mode];
    btn.addEventListener('click', () => {
      state.colorMode = mode;
      applyColorMode();
    });
    legendModes?.appendChild(btn);
  }

  let entries;
  if (state.colorMode === 'stability') {
    entries = [
      { key: 'stable', color: PALETTES.stability.stable, label: 'Estable' },
      { key: 'radioactive', color: PALETTES.stability.radioactive, label: 'Radiactivo' },
      { key: 'unknown', color: PALETTES.stability.unknown, label: 'Sin clasificar' }
    ];
  } else if (state.colorMode === 'halflife') {
    entries = [
      { key: 'stable', color: PALETTES.halflife.stable, label: 'Estable' },
      { key: 'long', color: PALETTES.halflife.long, label: 'Vida larga' },
      { key: 'medium', color: PALETTES.halflife.medium, label: 'Vida media' },
      { key: 'short', color: PALETTES.halflife.short, label: 'Vida corta' },
      { key: 'unknown', color: PALETTES.halflife.unknown, label: 'Desconocido' }
    ];
  } else {
    entries = Object.entries(PALETTES.decay).map(([key, color]) => ({ key, color, label: DECAY_LABELS[key] || key }));
  }

  const active = state.modeFilters[state.colorMode] || new Set();
  for (const entry of entries) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `legend-item legend-toggle${active.has(entry.key) ? ' active' : ' muted'}`;
    item.innerHTML = `<span class="legend-swatch" style="background:${entry.color}"></span><span>${entry.label}</span>`;
    item.addEventListener('click', () => {
      const set = state.modeFilters[state.colorMode];
      if (set.has(entry.key)) {
        if (set.size > 1) set.delete(entry.key);
      } else {
        set.add(entry.key);
      }
      applyFilters();
      renderLegend();
    });
    legend.appendChild(item);
  }
}

function selectNuclide(n, el) {
  if (state.selectedEl) state.selectedEl.classList.remove('selected');
  state.selected = n;
  state.selectedEl = el;
  if (el) el.classList.add('selected');
  fillDetail(n);
  openCard();
  state.atom = buildAtomState(n);
  atomCanvas.classList.toggle('paused', !state.animationEnabled);
  resizeAtomCanvas();
  drawAtom(performance.now());
}

function fillDetail(n) {
  setText('detailA', n.a);
  setText('detailZ', n.z);
  setText('detailSymbol', n.symbol);
  setText('detailName', n.element);
  setText('detailSubtitle', `${n.element}-${n.a} · Z=${n.z} · N=${n.n}`);
  setText('detailState', n.decay === 'stable' ? 'Estable' : `Radiactivo · ${DECAY_LABELS[n.decay] || n.decay}`);
  setText('detailHalfLife', n.half_life || '—');
  setText('detailAbundance', n.abundance || '—');
  setText('detailMass', n.atomic_mass || '—');
  setText('detailProtons', n.z);
  setText('detailNeutrons', n.n);
  setText('detailElectrons', n.z);
  setText('detailSpin', n.spin || '—');
  setText('detailQ', n.q_value || n.mass_excess || '—');
  setText('detailSource', n.source || '—');
  setText('detailNotes', n.notes || '—');
  setText('atomTitle', `${n.symbol}-${n.a}`);
  setText('nucleusText', `${n.z} p⁺ · ${n.n} n⁰`);
  const shells = electronShells(n.z);
  setText('shellText', shells.join(' · '));
  document.getElementById('wikiLink').href = n.wikipedia || `https://es.wikipedia.org/wiki/${encodeURIComponent(n.element)}`;
  document.getElementById('liveChartLink').href = n.livechart || `https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html?z=${n.z}&n=${n.n}`;
}

function setText(id, value) {
  document.getElementById(id).textContent = value == null || value === '' ? '—' : value;
}

function openCard() {
  card.classList.add('open');
  card.setAttribute('aria-hidden', 'false');
}

function closeNuclideCard() {
  card.classList.remove('open');
  card.setAttribute('aria-hidden', 'true');
  if (state.selectedEl) state.selectedEl.classList.remove('selected');
  state.selectedEl = null;
  state.selected = null;
}

function openMenu() {
  sideMenu.classList.add('open');
  sideMenu.setAttribute('aria-hidden', 'false');
  scrim.classList.add('open');
}

function closeSideMenu() {
  sideMenu.classList.remove('open');
  sideMenu.setAttribute('aria-hidden', 'true');
  scrim.classList.remove('open');
}

function fitToScreen(force = false) {
  const pad = 56;
  const sx = (window.innerWidth - pad * 2) / CHART_W;
  const sy = (window.innerHeight - pad * 2) / CHART_H;
  state.fitScale = Math.min(sx, sy);
  if (force || state.scale < state.fitScale) state.scale = state.fitScale;
  state.tx = (window.innerWidth - CHART_W * state.scale) / 2;
  state.ty = (window.innerHeight - CHART_H * state.scale) / 2;
  updateTransform();
}

function fitWidth() {
  const pad = 44;
  state.scale = Math.max(state.fitScale, (window.innerWidth - pad * 2) / CHART_W);
  state.tx = (window.innerWidth - CHART_W * state.scale) / 2;
  state.ty = 34;
  updateTransform();
}

function updateTransform() {
  clampTransform();
  chart.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})`;
  zoomHud.textContent = `${Math.round(state.scale / state.fitScale * 100)}%`;
}

function clampTransform() {
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const scaledW = CHART_W * state.scale;
  const scaledH = CHART_H * state.scale;
  const margin = 70;
  if (scaledW <= viewW - margin * 2) {
    state.tx = (viewW - scaledW) / 2;
  } else {
    const minX = viewW - scaledW - margin;
    const maxX = margin;
    state.tx = Math.min(maxX, Math.max(minX, state.tx));
  }
  if (scaledH <= viewH - margin * 2) {
    state.ty = (viewH - scaledH) / 2;
  } else {
    const minY = viewH - scaledH - margin;
    const maxY = margin;
    state.ty = Math.min(maxY, Math.max(minY, state.ty));
  }
}

function zoomAt(clientX, clientY, deltaY) {
  const oldScale = state.scale;
  const factor = deltaY < 0 ? 1.14 : 1 / 1.14;
  const maxScale = Math.max(1.9, state.fitScale * 18);
  const newScale = Math.max(state.fitScale, Math.min(maxScale, oldScale * factor));
  const chartX = (clientX - state.tx) / oldScale;
  const chartY = (clientY - state.ty) / oldScale;
  state.scale = newScale;
  state.tx = clientX - chartX * newScale;
  state.ty = clientY - chartY * newScale;
  updateTransform();
}

function displayElementName(name) {
  const clean = String(name || '').replace(/ · .+$/, '').trim();
  return clean || '—';
}

function shortElementName(name) {
  return displayElementName(name).slice(0, 12);
}

function updateCursorHud(event) {
  const chartX = (event.clientX - state.tx) / state.scale;
  const chartY = (event.clientY - state.ty) / state.scale;
  const N = Math.round((chartX - AXIS - TILE_STEP_X / 2) / TILE_STEP_X);
  const Z = Z_MAX - Math.round((chartY - AXIS - TILE_STEP_Y / 2) / TILE_STEP_Y);
  if (N >= 0 && N <= N_MAX && Z >= 1 && Z <= Z_MAX) {
    cursorHud.textContent = `Z ${Z} · N ${N}`;
    cursorHud.classList.add('visible');
  } else {
    cursorHud.classList.remove('visible');
  }
}

function closeLegendPopover() {
  legendPopover.classList.remove('open');
  legendPopover.setAttribute('aria-hidden', 'true');
}

function toggleLegendPopover(event) {
  event.stopPropagation();
  const isOpen = legendPopover.classList.toggle('open');
  legendPopover.setAttribute('aria-hidden', String(!isOpen));
}

function setDarkMode(enabled) {
  document.body.classList.toggle('dark', enabled);
  darkModeButton.setAttribute('aria-label', enabled ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  darkModeButton.title = enabled ? 'Modo claro' : 'Modo oscuro';
  themeIcon.className = `theme-icon ${enabled ? 'sun-icon' : 'moon-icon'}`;
}

function toggleDarkMode() {
  setDarkMode(!document.body.classList.contains('dark'));
}

function openSearchTool() {
  searchTool.classList.add('open');
  searchTool.querySelector('.top-search-box')?.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => searchInput.focus());
}

function closeSearchTool() {
  searchTool.classList.remove('open');
  searchTool.querySelector('.top-search-box')?.setAttribute('aria-hidden', 'true');
}

function toggleSearchTool() {
  if (searchTool.classList.contains('open')) closeSearchTool();
  else openSearchTool();
}


function centerOnNuclide(n, zoomMultiplier = 7) {
  const x = AXIS + n.n * TILE_STEP_X + TILE_STEP_X / 2;
  const y = AXIS + (Z_MAX - n.z) * TILE_STEP_Y + TILE_STEP_Y / 2;
  state.scale = Math.max(state.fitScale, Math.min(state.fitScale * zoomMultiplier, 1.35));
  state.tx = window.innerWidth / 2 - x * state.scale;
  state.ty = window.innerHeight / 2 - y * state.scale;
  updateTransform();
}

function bindEvents() {
  viewport.addEventListener('pointermove', updateCursorHud);
  viewport.addEventListener('pointerleave', () => {
    cursorHud.classList.remove('visible');
  });

  viewport.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, event.deltaY);
  }, { passive: false });

  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    state.dragging = true;
    state.dragStart = { x: event.clientX, y: event.clientY, tx: state.tx, ty: state.ty, moved: false, target: event.target };
    viewport.classList.add('dragging');
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!state.dragging || !state.dragStart) return;
    const dx = event.clientX - state.dragStart.x;
    const dy = event.clientY - state.dragStart.y;
    if (Math.hypot(dx, dy) > 4) state.dragStart.moved = true;
    state.tx = state.dragStart.tx + dx;
    state.ty = state.dragStart.ty + dy;
    updateTransform();
  });

  viewport.addEventListener('pointerup', (event) => {
    if (!state.dragging) return;
    const wasClick = state.dragStart && !state.dragStart.moved;
    const target = state.dragStart?.target;
    state.dragging = false;
    state.dragStart = null;
    viewport.classList.remove('dragging');

    if (!wasClick) return;

    const cell = target?.closest?.('.nuclide-cell');
    if (cell) {
      const n = state.byKey.get(cell.dataset.key);
      if (n) selectNuclide(n, cell);
      return;
    }

    closeNuclideCard();
  });

  viewport.addEventListener('pointercancel', () => {
    state.dragging = false;
    state.dragStart = null;
    viewport.classList.remove('dragging');
  });

  menuButton.addEventListener('click', openMenu);
  legendButton.addEventListener('click', toggleLegendPopover);
  legendPopover.addEventListener('click', event => event.stopPropagation());
  document.addEventListener('click', () => {
    closeLegendPopover();
    closeSearchTool();
  });
  closeMenu.addEventListener('click', closeSideMenu);
  scrim.addEventListener('click', closeSideMenu);
  resetViewButton?.addEventListener('click', () => fitToScreen(true));
  fitWidthButton?.addEventListener('click', fitWidth);

  searchButton.addEventListener('click', runSearch);
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') runSearch();
  });

  darkModeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleDarkMode();
  });

  searchToggleButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleSearchTool();
  });
  searchTool.addEventListener('click', event => event.stopPropagation());

  axesToggle?.addEventListener('change', () => {
    chart.classList.toggle('axes-hidden', !axesToggle.checked);
  });

  animationToggle?.addEventListener('change', () => {
    state.animationEnabled = animationToggle.checked;
  });

  atomCanvas.addEventListener('click', (event) => {
    event.stopPropagation();
    state.animationEnabled = !state.animationEnabled;
    atomCanvas.classList.toggle('paused', !state.animationEnabled);
  });

  csvInput.addEventListener('change', handleCsvInput);
  loadIaeaButton.addEventListener('click', loadIaeaData);

  window.addEventListener('resize', () => {
    const atFit = Math.abs(state.scale - state.fitScale) < 0.0001;
    fitToScreen(atFit);
    resizeAtomCanvas();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeNuclideCard();
      closeSideMenu();
      closeLegendPopover();
      closeSearchTool();
    }
  });
}

function runSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  const found = findNuclide(query);
  if (!found) {
    dataStatus.textContent = `No he encontrado “${query}”. Prueba con Ca-40, 40Ca, Z=20 o N=20.`;
    return;
  }
  const el = chart.querySelector(`[data-key="${found.z}-${found.n}"]`);
  if (el) {
    selectNuclide(found, el);
    centerOnNuclide(found);
    closeSideMenu();
    closeSearchTool();
  }
}

function findNuclide(query) {
  const q = query.trim().toLowerCase().replace(/\s+/g, '');
  let m = q.match(/^z=(\d+)$/);
  if (m) return state.nuclides.find(n => n.z === Number(m[1]));
  m = q.match(/^n=(\d+)$/);
  if (m) return state.nuclides.find(n => n.n === Number(m[1]));
  m = q.match(/^([a-z]{1,3})-?(\d+)$/i);
  if (m) {
    const symbol = normalizeSymbol(m[1]);
    const A = Number(m[2]);
    return state.nuclides.find(n => n.symbol === symbol && n.a === A);
  }
  m = q.match(/^(\d+)-?([a-z]{1,3})$/i);
  if (m) {
    const A = Number(m[1]);
    const symbol = normalizeSymbol(m[2]);
    return state.nuclides.find(n => n.symbol === symbol && n.a === A);
  }
  return state.nuclides.find(n => n.symbol.toLowerCase() === q || n.element.toLowerCase() === q || `${n.symbol.toLowerCase()}${n.a}` === q);
}

function normalizeSymbol(s) {
  if (String(s).trim().toLowerCase() === 'n') return 'n';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

async function loadIaeaData() {
  dataStatus.textContent = 'Intentando cargar datos desde IAEA LiveChart...';
  try {
    const response = await fetch(IAEA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const parsed = parseCsv(text);
    if (!parsed.length) throw new Error('CSV vacío');
    replaceWithCsvRows(parsed, 'IAEA LiveChart');
    dataStatus.textContent = `Cargados ${state.nuclides.length.toLocaleString('es-ES')} nucleidos desde IAEA.`;
    closeSideMenu();
  } catch (error) {
    dataStatus.textContent = `No se pudo cargar automáticamente. Descarga el CSV desde IAEA e impórtalo manualmente. Detalle: ${error.message}`;
  }
}

function handleCsvInput(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = parseCsv(String(reader.result || ''));
      replaceWithCsvRows(parsed, file.name);
      dataStatus.textContent = `Importados ${state.nuclides.length.toLocaleString('es-ES')} nucleidos desde ${file.name}.`;
      closeSideMenu();
    } catch (error) {
      dataStatus.textContent = `Error importando CSV: ${error.message}`;
    }
  };
  reader.readAsText(file);
}

function replaceWithCsvRows(rows, sourceName) {
  const mapped = rows.map(row => rowToNuclide(row, sourceName)).filter(n => n && Number(n.z) > 0);
  if (!mapped.length) throw new Error('No se reconocieron columnas z/n o a/symbol.');
  state.nuclides = mapped;
  updateBoundsFromData(mapped);
  indexNuclides();
  renderChart();
  fitToScreen(true);
  closeNuclideCard();
}

function rowToNuclide(row, sourceName) {
  const zValue = pick(row, ['z','Z','protons','Protons']);
  let finalZ = toNumber(zValue);
  let n = toNumber(pick(row, ['n','N','neutrons','Neutrons']));
  let a = toNumber(pick(row, ['a','A','mass_number','MassNumber']));
  let symbol = pick(row, ['symbol','Symbol','elem','element_symbol','Element']) || '';
  symbol = cleanSymbol(symbol, finalZ);

  if (!Number.isFinite(finalZ) && symbol) {
    const zFromSymbol = ELEMENTS.findIndex(e => e && e[0].toLowerCase() === symbol.toLowerCase());
    if (zFromSymbol >= 0) finalZ = zFromSymbol;
  }
  if (!Number.isFinite(finalZ)) return null;
  if (!symbol) symbol = elementInfo(finalZ)[0];
  if (!Number.isFinite(n) && Number.isFinite(a)) n = a - finalZ;
  if (!Number.isFinite(a) && Number.isFinite(n)) a = finalZ + n;
  if (!Number.isFinite(n) || !Number.isFinite(a)) return null;

  const element = pick(row, ['element','Element','name','Name']) || elementInfo(finalZ)[1] || symbol;
  const decayRaw = String(pick(row, ['decay','decay_1','decay mode','decayMode','Decay','decay_modes']) || '').toLowerCase();
  const halfLifeValue = formatHalfLife(row);
  const decay = normalizeDecay(decayRaw, halfLifeValue);
  const decayDetails = formatDecayDetails(row);
  const qValue = firstFormattedEnergy(row, [
    ['qa', 'Qα'], ['qec', 'QEC'], ['qbm', 'Qβ−'], ['sn', 'Sₙ'], ['sp', 'Sₚ']
  ]);
  const mass = formatAtomicMass(pick(row, ['atomic_mass','mass','Mass','atomic mass','ame2020']));
  const binding = formatEnergy(pick(row, ['binding']), 'keV/n');
  const discovery = pick(row, ['discovery','Discovery']);
  const notes = decayDetails || binding || discovery
    ? [decayDetails, binding ? `Energía de enlace: ${binding}` : '', discovery ? `Descubrimiento: ${discovery}` : ''].filter(Boolean).join(' · ')
    : 'Dato importado. Los campos disponibles dependen del CSV usado.';

  return {
    z: finalZ,
    n,
    a,
    symbol,
    element,
    decay,
    half_life: halfLifeValue || (decay === 'stable' ? 'Estable' : '—'),
    abundance: formatPercent(pick(row, ['abundance','Abundance','natural_abundance'])) || '—',
    atomic_mass: mass || '—',
    spin: pick(row, ['spin','Spin','jp','Jpi','parity']) || '—',
    q_value: qValue || '—',
    mass_excess: formatEnergy(pick(row, ['mass_excess','Mass excess','massexcess']), 'keV') || '—',
    source: sourceName,
    notes,
    wikipedia: finalZ > 0 ? `https://es.wikipedia.org/wiki/Is%C3%B3topos_de_${encodeURIComponent(element)}` : `https://es.wikipedia.org/wiki/Neutr%C3%B3n`,
    livechart: `https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html?z=${finalZ}&n=${n}`,
    raw: row
  };
}

function normalizeDecay(text, halfLife) {
  const t = String(text || '').toLowerCase().replace(/\s+/g, '');
  const h = String(halfLife || '').toLowerCase();
  if (!t && (h.includes('stable') || h.includes('estable'))) return 'stable';
  if (t.includes('stable') || t.includes('stbl') || h.includes('stable') || h.includes('inf')) return 'stable';
  if (t.includes('cluster') || t === 'cl') return 'cluster';
  if (t === 'a' || t.includes('alpha') || t.includes('α')) return 'alpha';
  if (t.includes('2b-') || t.includes('b-') || t.includes('beta-') || t.includes('β-')) return 'beta-';
  if (t.includes('ec') || t.includes('b+') || t.includes('beta+') || t.includes('β+')) return 'beta+/EC';
  if (t.includes('sf') || t.includes('fission')) return 'sf';
  if (t.includes('it') || t.includes('isomer')) return 'it';
  if (t === 'p' || t.includes('2p') || t.includes('proton')) return 'p';
  if (t === 'n' || t.includes('2n') || t.includes('neutron')) return 'n';
  return 'unknown';
}

function pick(row, names) {
  for (const name of names) {
    if (row[name] != null && String(row[name]).trim() !== '') return row[name];
  }
  const lowerMap = Object.fromEntries(Object.keys(row).map(k => [k.toLowerCase().trim(), k]));
  for (const name of names) {
    const key = lowerMap[name.toLowerCase().trim()];
    if (key && row[key] != null && String(row[key]).trim() !== '') return row[key];
  }
  return '';
}

function cleanSymbol(value, z = NaN) {
  const raw = String(value || '').trim();
  if (Number(z) === 0 || raw.toLowerCase() === 'n') return 'n';
  const s = raw.replace(/[^a-z]/gi, '');
  return s ? normalizeSymbol(s.slice(0, 3)) : '';
}

function formatHalfLife(row) {
  const raw = pick(row, ['half_life','Half-life','halflife','T1/2']);
  const op = pick(row, ['operator_hl','operator','Operator']);
  const unit = pick(row, ['unit_hl','unit','Unit']);
  if (!raw) return '';
  if (String(raw).toUpperCase() === 'STABLE') return 'Estable';
  const prefix = op ? `${op} ` : '';
  return `${prefix}${raw}${unit ? ` ${unit}` : ''}`;
}

function formatDecayDetails(row) {
  const parts = [];
  for (let i = 1; i <= 3; i++) {
    const mode = pick(row, [`decay_${i}`, `decay${i}`]);
    if (!mode) continue;
    const pct = pick(row, [`decay_${i}_%`, `decay${i}_%`]);
    parts.push(`${mode}${pct ? ` ${pct}%` : ''}`);
  }
  return parts.length ? `Desintegración: ${parts.join(' / ')}` : '';
}

function formatPercent(value) {
  if (value == null || String(value).trim() === '') return '';
  const text = String(value).trim();
  return text.endsWith('%') ? text : `${text}%`;
}

function formatAtomicMass(value) {
  const n = toNumber(value);
  if (!Number.isFinite(n)) return '';
  const u = Math.abs(n) > 100000 ? n / 1000000 : n;
  return `${trimNumber(u, 9)} u`;
}

function formatEnergy(value, unit) {
  const n = toNumber(value);
  if (!Number.isFinite(n)) return '';
  return `${trimNumber(n, 5)} ${unit}`;
}

function firstFormattedEnergy(row, entries) {
  for (const [field, label] of entries) {
    const value = pick(row, [field]);
    const formatted = formatEnergy(value, 'keV');
    if (formatted) return `${label} ${formatted}`;
  }
  return '';
}

function trimNumber(value, decimals = 6) {
  return Number(value).toLocaleString('es-ES', { maximumFractionDigits: decimals });
}

function toNumber(value) {
  if (value == null || value === '') return NaN;
  const n = Number(String(value).replace(',', '.').replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

function parseCsv(text) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      current.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      current.push(field);
      field = '';
      if (current.some(v => String(v).trim() !== '')) rows.push(current);
      current = [];
    } else {
      field += char;
    }
  }
  if (field || current.length) {
    current.push(field);
    if (current.some(v => String(v).trim() !== '')) rows.push(current);
  }
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(cols => {
    const row = {};
    headers.forEach((h, i) => row[h] = (cols[i] || '').trim());
    return row;
  });
}

function electronShells(electrons) {
  const capacities = [2, 8, 18, 32, 32, 18, 8];
  const shells = [];
  let remaining = electrons;
  for (const cap of capacities) {
    if (remaining <= 0) break;
    const count = Math.min(cap, remaining);
    shells.push(count);
    remaining -= count;
  }
  if (remaining > 0) shells.push(remaining);
  return shells;
}

function buildAtomState(n) {
  const shells = electronShells(n.z);
  return {
    z: n.z,
    neutrons: n.n,
    symbol: n.symbol,
    a: n.a,
    shells,
    particles: buildNucleusParticles(n.z, n.n)
  };
}

function buildNucleusParticles(protons, neutrons) {
  const total = Math.min(90, protons + neutrons);
  const particles = [];
  for (let i = 0; i < total; i++) {
    const angle = i * 2.399963;
    const radius = Math.sqrt(i / Math.max(1, total)) * 42;
    const isProton = i < Math.round(total * protons / Math.max(1, protons + neutrons));
    particles.push({
      x: Math.cos(angle) * radius + (Math.random() - .5) * 5,
      y: Math.sin(angle) * radius + (Math.random() - .5) * 5,
      z: Math.sin(angle * 1.7) * 18,
      proton: isProton,
      size: 9 + Math.random() * 4
    });
  }
  return particles;
}

function resizeAtomCanvas() {
  const rect = atomCanvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(300, Math.floor(rect.width * dpr));
  const h = Math.max(260, Math.floor(rect.height * dpr));
  if (atomCanvas.width !== w || atomCanvas.height !== h) {
    atomCanvas.width = w;
    atomCanvas.height = h;
  }
}

function drawAtomLoop(time) {
  resizeAtomCanvas();
  if (state.atom) drawAtom(time);
  requestAnimationFrame(drawAtomLoop);
}

function drawAtom(time) {
  const atom = state.atom;
  if (!atom) return;
  const ctx = atomCtx;
  const w = atomCanvas.width;
  const h = atomCanvas.height;
  ctx.clearRect(0, 0, w, h);
  const cx = w * 0.52;
  const cy = h * 0.54;
  const minDim = Math.min(w, h);
  const shellGap = Math.max(38, minDim * 0.085);
  const baseRadius = Math.max(68, minDim * 0.14);
  const t = state.animationEnabled ? time * 0.001 : state.atomFrame;
  if (!state.animationEnabled) state.atomFrame = t;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(1, minDim * 0.0024);

  atom.shells.forEach((count, shellIndex) => {
    const r = baseRadius + shellIndex * shellGap;
    ctx.save();
    ctx.rotate((shellIndex % 2 ? -0.38 : 0.30));
    ctx.scale(1, 0.36 + shellIndex * 0.018);
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r, 0, 0, Math.PI * 2);
    ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.18)' : 'rgba(20,20,20,.16)';
    ctx.stroke();
    ctx.restore();

    const visible = Math.min(count, shellIndex < 3 ? count : 18);
    for (let i = 0; i < visible; i++) {
      const angle = (i / visible) * Math.PI * 2 + t * (0.45 + shellIndex * 0.08) * (shellIndex % 2 ? -1 : 1);
      const tilt = shellIndex % 2 ? -0.38 : 0.30;
      const x0 = Math.cos(angle) * r;
      const y0 = Math.sin(angle) * r * (0.36 + shellIndex * 0.018);
      const x = x0 * Math.cos(tilt) - y0 * Math.sin(tilt);
      const y = x0 * Math.sin(tilt) + y0 * Math.cos(tilt);
      const depth = (Math.sin(angle) + 1) / 2;
      drawSphere(ctx, x, y, 6 + depth * 2.5, '#0900b8', '#4b57ff', depth);
    }
  });

  const nucleusScale = Math.min(1.25, 0.72 + Math.log10(atom.z + atom.neutrons + 3) * 0.22);
  const particles = [...atom.particles].sort((a,b) => a.z - b.z);
  particles.forEach(p => {
    const wobble = Math.sin(t * 1.2 + p.x * .02) * 1.5;
    const color1 = p.proton ? '#a93b32' : '#595959';
    const color2 = p.proton ? '#ff4338' : '#8b8b8b';
    drawSphere(ctx, p.x * nucleusScale + wobble, p.y * nucleusScale, p.size * nucleusScale, color1, color2, (p.z + 20) / 40);
  });

  ctx.restore();
}

function drawSphere(ctx, x, y, r, dark, light, depth = .5) {
  const gradient = ctx.createRadialGradient(x - r * .35, y - r * .45, r * .12, x, y, r);
  gradient.addColorStop(0, light);
  gradient.addColorStop(1, dark);
  ctx.globalAlpha = 0.72 + depth * .28;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

init();
