'use strict';

const CELL_W = 82;
const CELL_H = 72;
const GAP = 10;
const TILE_STEP_X = CELL_W + GAP;
const TILE_STEP_Y = CELL_H + GAP;
const AXIS = 86;
const Z_MAX = 130;
const N_MAX = 320;
const CHART_W = AXIS + (N_MAX + 2) * TILE_STEP_X;
const CHART_H = AXIS + (Z_MAX + 2) * TILE_STEP_Y;
const MAGIC_NUMBERS = [2, 8, 20, 28, 50, 82, 126, 184];

const ELEMENTS = [null,'H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og'];
const ELEMENT_NAMES_ES = [null,'Hidrógeno','Helio','Litio','Berilio','Boro','Carbono','Nitrógeno','Oxígeno','Flúor','Neón','Sodio','Magnesio','Aluminio','Silicio','Fósforo','Azufre','Cloro','Argón','Potasio','Calcio','Escandio','Titanio','Vanadio','Cromo','Manganeso','Hierro','Cobalto','Níquel','Cobre','Zinc','Galio','Germanio','Arsénico','Selenio','Bromo','Kriptón','Rubidio','Estroncio','Itrio','Circonio','Niobio','Molibdeno','Tecnecio','Rutenio','Rodio','Paladio','Plata','Cadmio','Indio','Estaño','Antimonio','Telurio','Yodo','Xenón','Cesio','Bario','Lantano','Cerio','Praseodimio','Neodimio','Prometio','Samario','Europio','Gadolinio','Terbio','Disprosio','Holmio','Erbio','Tulio','Iterbio','Lutecio','Hafnio','Tántalo','Wolframio','Renio','Osmio','Iridio','Platino','Oro','Mercurio','Talio','Plomo','Bismuto','Polonio','Astato','Radón','Francio','Radio','Actinio','Torio','Protactinio','Uranio','Neptunio','Plutonio','Americio','Curio','Berkelio','Californio','Einstenio','Fermio','Mendelevio','Nobelio','Lawrencio','Rutherfordio','Dubnio','Seaborgio','Bohrio','Hassio','Meitnerio','Darmstadtio','Roentgenio','Copernicio','Nihonio','Flerovio','Moscovio','Livermorio','Teneso','Oganesón'];
const DECAY_LABELS = { stable:'Estable', betaMinus:'β−', betaPlus:'β+/CE', alpha:'α', spontaneousFission:'Fisión', proton:'p', neutron:'n', isomeric:'IT', cluster:'Clúster', other:'Otro' };
const COLOR_MAPS = {
  decay: { stable:'#8fce95', betaMinus:'#79a8ff', betaPlus:'#ffb166', alpha:'#ff817a', spontaneousFission:'#c598ff', proton:'#ffd966', neutron:'#76d7c4', isomeric:'#b7a7ff', cluster:'#ff9ac8', other:'#d8d8d8' },
  stability: { stable:'#8fce95', long:'#d3e987', medium:'#ffd36f', short:'#ff997f', unknown:'#d8d8d8' },
  quality: { evaluated:'#9bc7ff', isomer:'#d4b4ff', theoretical:'#d7d7d7' }
};
const MODE_TIPS = {
  decay: 'Colorea cada nucleido por su modo principal de desintegración.',
  stability: 'Agrupa por estabilidad y duración aproximada de la vida media.',
  halfLife: 'Mapa térmico logarítmico de vida media: de efímeros a muy longevos.',
  quality: 'Distingue datos evaluados, isómeros y registros teóricos/no observados.',
  abundance: 'Resalta abundancia natural cuando el dataset la incluye.',
  binding: 'Colorea por energía de enlace, útil para observar regiones de mayor cohesión nuclear.',
  qa: 'Colorea por Qα, si el CSV contiene este campo.',
  qb: 'Colorea por Qβ−, si el CSV contiene este campo.'
};
const LAYER_TIPS = {
  evaluatedLayerButton: 'Muestra los nucleidos evaluados del CSV principal.',
  theoreticalLayerButton: 'Añade una capa extrapolada/no observada. No equivale a dato experimental.',
  isomerLayerButton: 'Muestra registros marcados como isoméricos si existen en datasets secundarios.',
  gridLayerButton: 'Activa la cuadrícula de fondo.',
  magicLayerButton: 'Dibuja cierres de capa: 2, 8, 20, 28, 50, 82, 126 y 184.',
  frontierLayerButton: 'Muestra una frontera nuclear estimada, solo como guía visual.',
  evaluatedFrameLayerButton: 'Dibuja el marco del rango evaluado por el CSV oficial.',
  minimapButton: 'Muestra u oculta el minimapa de navegación.',
  expertModeButton: 'Alterna ficha compacta técnica frente a modo más descriptivo.'
};

const state = {
  official: [], secondary: [], theoretical: [], all: [], byKey: new Map(),
  selected: null, compare: [],
  scale: 1, tx: 0, ty: 0, fitScale: 1, fullFitScale: 1,
  dragging: false, lastX: 0, lastY: 0, moved: false,
  pointers: new Map(), pinch: null,
  mapMode: 'decay', activeFilters: new Set(['stable','betaMinus','betaPlus','alpha','spontaneousFission','proton','neutron','isomeric','cluster','other']),
  layers: { evaluated: true, theoretical: false, isomer: true, grid: false, magic: false, frontier: false, evaluatedFrame: false, minimap: true, expert: true },
  evaluatedBounds: null,
  atom: { paused: false, last: 0, angle: 0 }
};

let canvas, ctx, minimapCanvas, miniCtx, atomCanvas, atomCtx;
let zoomValue, dataStatus, cursorHud, nuclideCard, compareTray;
let renderScheduled = false;

window.addEventListener('DOMContentLoaded', init);

async function init() {
  canvas = document.getElementById('chartCanvas'); ctx = canvas.getContext('2d');
  minimapCanvas = document.getElementById('minimapCanvas'); miniCtx = minimapCanvas.getContext('2d');
  atomCanvas = document.getElementById('atomCanvas'); atomCtx = atomCanvas.getContext('2d');
  zoomValue = document.getElementById('zoomValue'); dataStatus = document.getElementById('dataStatus'); cursorHud = document.getElementById('cursorHud'); nuclideCard = document.getElementById('nuclideCard'); compareTray = document.getElementById('compareTray');

  resizeCanvases();
  setupControls();
  setupInteractions();
  setupDetailTabs();
  state.official = await loadInitialData();
  rebuildDerivedData();
  fitToScreen(true);
  startAtomLoop();
  requestAnimationFrame(() => scheduleRender());
}

async function loadInitialData() {
  try {
    const res = await fetch('nuclides.csv', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const parsed = parseCsv(text).map(row => rowToNuclide(row, 'nuclides.csv', 'evaluated')).filter(n => n && n.z > 0);
    if (parsed.length) { dataStatus.textContent = `${parsed.length.toLocaleString('es-ES')} nucleidos cargados desde nuclides.csv.`; return parsed; }
  } catch (err) {
    console.warn('No se pudo leer nuclides.csv, usando respaldo integrado.', err);
  }
  const backup = (window.NUCLIDES_DATA || []).map(row => rowToNuclide(row, 'respaldo integrado', 'evaluated')).filter(n => n && n.z > 0);
  dataStatus.textContent = `${backup.length.toLocaleString('es-ES')} nucleidos cargados desde respaldo integrado.`;
  return backup;
}

function rebuildDerivedData() {
  state.theoretical = buildTheoreticalLayer(state.official);
  state.all = [...state.official, ...state.secondary, ...state.theoretical];
  state.byKey = new Map();
  for (const n of state.all) if (!state.byKey.has(n.key)) state.byKey.set(n.key, n);
  state.evaluatedBounds = computeBounds(state.official);
  renderLegend(); renderMapModes(); updateLayerButtons(); scheduleRender(); updateMinimapVisibility();
}

function computeBounds(items) {
  if (!items.length) return null;
  return { minZ: Math.min(...items.map(n => n.z)), maxZ: Math.max(...items.map(n => n.z)), minN: Math.min(...items.map(n => n.n)), maxN: Math.max(...items.map(n => n.n)) };
}

function buildTheoreticalLayer(official) {
  const existing = new Set(official.map(n => `${n.z}:${n.n}`));
  const out = [];
  for (let z = 1; z <= Z_MAX; z++) {
    const center = Math.round(z * (1.05 + Math.min(1.5, z / 72)));
    const spread = Math.round(5 + z * 0.28);
    for (let n = Math.max(0, center - spread); n <= Math.min(N_MAX, center + spread); n++) {
      if (existing.has(`${z}:${n}`)) continue;
      const distance = Math.abs(n - center) / Math.max(1, spread);
      if (distance > 1) continue;
      const a = z + n;
      out.push({ z, n, a, symbol: symbolForZ(z), element: nameForZ(z), key: `${z}:${n}:th`, stateLabel: 'No observado', halfLifeLabel: '—', halfLifeSec: null, decay: 'other', dataClass: 'theoretical', abundance: null, spin: '—', atomicMass: null, massExcess: null, binding: null, qa: null, qec: null, qbm: null, sn: null, sp: null, discovery: '—', applications: 'Predicción visual/extrapolada.', raw: { z, n, a, data_class: 'theoretical' } });
    }
  }
  return out;
}

function setupControls() {
  document.getElementById('dataButton')?.addEventListener('click', e => { e.stopPropagation(); togglePopover('dataPopover'); });
  document.getElementById('legendButton')?.addEventListener('click', e => { e.stopPropagation(); togglePopover('legendPopover'); });
  document.getElementById('darkModeButton')?.addEventListener('click', e => { e.stopPropagation(); document.body.classList.toggle('dark'); document.getElementById('themeIcon').className = `theme-icon ${document.body.classList.contains('dark') ? 'sun-icon' : 'moon-icon'}`; });
  document.getElementById('searchToggleButton')?.addEventListener('click', e => { e.stopPropagation(); const tool = document.getElementById('searchTool'); tool.classList.toggle('open'); tool.querySelector('.top-search-box').setAttribute('aria-hidden', String(!tool.classList.contains('open'))); if (tool.classList.contains('open')) document.getElementById('searchInput').focus(); });
  document.getElementById('searchButton')?.addEventListener('click', runSearch);
  document.getElementById('searchInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
  document.getElementById('loadIaeaButton')?.addEventListener('click', loadFromIaea);
  document.getElementById('csvInput')?.addEventListener('change', handleCsvInput);
  document.getElementById('secondaryCsvInput')?.addEventListener('change', handleSecondaryCsvInput);
  document.getElementById('addCompareButton')?.addEventListener('click', addSelectedToCompare);
  document.getElementById('clearCompareButton')?.addEventListener('click', () => { state.compare = []; renderCompare(); });
  document.getElementById('exportCardButton')?.addEventListener('click', exportCardPng);

  setupLayerButton('evaluatedLayerButton', 'evaluated');
  setupLayerButton('theoreticalLayerButton', 'theoretical');
  setupLayerButton('isomerLayerButton', 'isomer');
  setupLayerButton('gridLayerButton', 'grid');
  setupLayerButton('magicLayerButton', 'magic');
  setupLayerButton('frontierLayerButton', 'frontier');
  setupLayerButton('evaluatedFrameLayerButton', 'evaluatedFrame');
  setupLayerButton('minimapButton', 'minimap', updateMinimapVisibility);
  setupLayerButton('expertModeButton', 'expert', () => document.body.classList.toggle('educational', !state.layers.expert));

  document.addEventListener('click', e => {
    if (!e.target.closest('.popover') && !e.target.closest('.tool-button') && !e.target.closest('.search-tool')) closePopovers();
  });

  installTooltips();
}
function setupLayerButton(id, key, after) { document.getElementById(id)?.addEventListener('click', e => { e.stopPropagation(); state.layers[key] = !state.layers[key]; updateLayerButtons(); after?.(); scheduleRender(); }); }
function updateLayerButtons() { const map = { evaluatedLayerButton:'evaluated', theoreticalLayerButton:'theoretical', isomerLayerButton:'isomer', gridLayerButton:'grid', magicLayerButton:'magic', frontierLayerButton:'frontier', evaluatedFrameLayerButton:'evaluatedFrame', minimapButton:'minimap', expertModeButton:'expert' }; for (const [id,k] of Object.entries(map)) document.getElementById(id)?.classList.toggle('active', !!state.layers[k]); }
function togglePopover(id) { const el = document.getElementById(id); const open = el.classList.contains('open'); closePopovers(); if (!open) { el.classList.add('open'); el.setAttribute('aria-hidden','false'); } }
function closePopovers() { document.querySelectorAll('.popover.open').forEach(p => { p.classList.remove('open'); p.setAttribute('aria-hidden','true'); }); }
function closeDataPopover() { document.getElementById('dataPopover')?.classList.remove('open'); }
function updateMinimapVisibility() { document.getElementById('minimapPanel')?.classList.toggle('hidden', !state.layers.minimap); }

function renderMapModes() {
  const modes = [['decay','Desintegración'], ['stability','Estabilidad'], ['halfLife','Vida media'], ['quality','Calidad'], ['abundance','Abundancia'], ['binding','Enlace'], ['qa','Qα'], ['qb','Qβ−']];
  const box = document.getElementById('legendModes');
  box.innerHTML = '';
  for (const [mode,label] of modes) {
    const btn = document.createElement('button'); btn.type='button'; btn.className = `legend-mode-btn ${state.mapMode===mode?'active':''}`; btn.dataset.tip = MODE_TIPS[mode] || ''; btn.innerHTML = `${label}<small>${mode}</small>`;
    btn.addEventListener('click', e => { e.stopPropagation(); state.mapMode = mode; renderMapModes(); scheduleRender(); });
    box.append(btn);
  }
}
function renderLegend() {
  const box = document.getElementById('legend'); box.innerHTML = '';
  for (const [key,label] of Object.entries(DECAY_LABELS)) {
    const item = document.createElement('button'); item.type = 'button'; item.className = `legend-item ${state.activeFilters.has(key) ? '' : 'muted'}`; item.dataset.tip = `Muestra u oculta nucleidos clasificados como ${label}.`;
    item.innerHTML = `<span class="legend-swatch" style="background:${COLOR_MAPS.decay[key] || '#ddd'}"></span><span>${label}</span>`;
    item.addEventListener('click', e => { e.stopPropagation(); state.activeFilters.has(key) ? state.activeFilters.delete(key) : state.activeFilters.add(key); renderLegend(); scheduleRender(); });
    box.append(item);
  }
}
function installTooltips() {
  const tip = document.getElementById('uiTooltip');
  document.addEventListener('mouseover', e => { const t = e.target.closest('[data-tip], .layer-toggle'); if (!t) return; const text = t.dataset.tip || LAYER_TIPS[t.id]; if (!text) return; tip.textContent = text; tip.classList.add('visible'); tip.setAttribute('aria-hidden','false'); positionTooltip(t); });
  document.addEventListener('mouseout', e => { if (e.target.closest('[data-tip], .layer-toggle')) { tip.classList.remove('visible'); tip.setAttribute('aria-hidden','true'); }});
  document.addEventListener('focusin', e => { const t = e.target.closest('[data-tip], .layer-toggle'); if (!t) return; const text = t.dataset.tip || LAYER_TIPS[t.id]; if (!text) return; tip.textContent=text; tip.classList.add('visible'); positionTooltip(t); });
  document.addEventListener('focusout', e => { if (e.target.closest('[data-tip], .layer-toggle')) tip.classList.remove('visible'); });
  function positionTooltip(el) { const r = el.getBoundingClientRect(); tip.style.left = `${Math.min(window.innerWidth - 280, Math.max(12, r.left))}px`; tip.style.top = `${Math.min(window.innerHeight - 60, r.bottom + 8)}px`; }
}

function resizeCanvases() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  for (const c of [canvas, minimapCanvas, atomCanvas]) {
    if (!c) continue;
    const rect = c.getBoundingClientRect();
    c.width = Math.max(1, Math.round(rect.width * dpr));
    c.height = Math.max(1, Math.round(rect.height * dpr));
    const context = c.getContext('2d');
    context.setTransform(dpr,0,0,dpr,0,0);
  }
}
function scheduleRender() { if (renderScheduled) return; renderScheduled = true; requestAnimationFrame(() => { renderScheduled = false; draw(); }); }
function draw() {
  const w = window.innerWidth, h = window.innerHeight;
  ctx.clearRect(0,0,w,h);
  drawBackground();
  if (state.layers.grid) drawGrid();
  if (state.layers.evaluatedFrame) drawEvaluatedFrame();
  if (state.layers.frontier) drawFrontier();
  drawNuclides();
  if (state.layers.magic) drawMagicNumbers();
  drawAxes();
  drawMinimap();
}
function drawBackground() {
  const g = ctx.createLinearGradient(0,0,window.innerWidth,window.innerHeight);
  g.addColorStop(0, getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#f7f5f0');
  g.addColorStop(1, getComputedStyle(document.body).getPropertyValue('--bg-2').trim() || '#ebe7df');
  ctx.fillStyle = g; ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
}
function drawGrid() {
  ctx.save(); ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.055)' : 'rgba(0,0,0,.055)'; ctx.lineWidth = 1;
  const v = visibleWorldRect();
  const n0 = Math.max(0, Math.floor((v.x1 - AXIS) / TILE_STEP_X) - 1), n1 = Math.min(N_MAX, Math.ceil((v.x2 - AXIS) / TILE_STEP_X) + 1);
  const z0 = Math.max(1, Math.floor(Z_MAX - (v.y2 - AXIS) / TILE_STEP_Y) - 1), z1 = Math.min(Z_MAX, Math.ceil(Z_MAX - (v.y1 - AXIS) / TILE_STEP_Y) + 1);
  for (let n=n0; n<=n1; n++) { const x = sx(AXIS + n*TILE_STEP_X); ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,window.innerHeight); ctx.stroke(); }
  for (let z=z0; z<=z1; z++) { const y = sy(AXIS + (Z_MAX-z)*TILE_STEP_Y); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(window.innerWidth,y); ctx.stroke(); }
  ctx.restore();
}
function drawEvaluatedFrame() {
  if (!state.evaluatedBounds) return;
  const r = worldRectForBounds(state.evaluatedBounds, 12);
  ctx.save();
  ctx.strokeStyle = 'rgba(93,90,246,.45)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.strokeRect(sx(r.x1), sy(r.y1), (r.x2-r.x1)*state.scale, (r.y2-r.y1)*state.scale);
  ctx.restore();
}
function drawFrontier() {
  ctx.save(); ctx.strokeStyle = 'rgba(160,80,130,.42)'; ctx.lineWidth = 2; ctx.setLineDash([10, 9]);
  ctx.beginPath();
  for (let z=1; z<=Z_MAX; z++) {
    const n = z * (1.05 + Math.min(1.5, z / 72));
    const x = sx(AXIS + n*TILE_STEP_X + CELL_W/2), y = sy(AXIS + (Z_MAX-z)*TILE_STEP_Y + CELL_H/2);
    if (z===1) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke(); ctx.restore();
}
function drawMagicNumbers() {
  ctx.save(); ctx.strokeStyle = '#9b2435'; ctx.fillStyle = '#9b2435'; ctx.lineWidth = 2.2; ctx.font = '900 13px system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  for (const n of MAGIC_NUMBERS.filter(v => v <= N_MAX)) {
    const x = sx(AXIS + n*TILE_STEP_X + CELL_W/2);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, window.innerHeight); ctx.stroke();
  }
  for (const z of MAGIC_NUMBERS.filter(v => v <= Z_MAX)) {
    const y = sy(AXIS + (Z_MAX-z)*TILE_STEP_Y + CELL_H/2);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(window.innerWidth, y); ctx.stroke();
  }
  ctx.restore();
}
function drawAxes() {
  const v = visibleWorldRect();
  const nStart = Math.max(0, Math.floor((v.x1 - AXIS) / TILE_STEP_X) - 1);
  const nEnd = Math.min(N_MAX, Math.ceil((v.x2 - AXIS) / TILE_STEP_X) + 1);
  const zStart = Math.max(1, Math.floor(Z_MAX - (v.y2 - AXIS) / TILE_STEP_Y) - 1);
  const zEnd = Math.min(Z_MAX, Math.ceil(Z_MAX - (v.y1 - AXIS) / TILE_STEP_Y) + 1);
  for (let N = Math.ceil(nStart/10)*10; N <= nEnd; N += 10) {
    const wx = AXIS + N*TILE_STEP_X + CELL_W/2;
    drawAxisPill(String(N), sx(wx), clampNumber(sy(AXIS - 28), 22, window.innerHeight - 22), 38, state.layers.magic && MAGIC_NUMBERS.includes(N));
  }
  for (let Z = Math.ceil(zStart/5)*5; Z <= zEnd; Z += 5) {
    const wy = AXIS + (Z_MAX-Z)*TILE_STEP_Y + CELL_H/2;
    drawAxisPill(String(Z), clampNumber(sx(AXIS - 18), 28, window.innerWidth - 28), sy(wy), 38, state.layers.magic && MAGIC_NUMBERS.includes(Z));
  }
  drawAxisPill('N →', clampNumber(sx(AXIS), 30, window.innerWidth - 30), clampNumber(sy(AXIS - 54), 22, window.innerHeight - 22), 48);
  drawAxisPill('Z ↑', clampNumber(sx(AXIS - 48), 30, window.innerWidth - 30), clampNumber(sy(AXIS - 20), 54, window.innerHeight - 22), 48);
}
function drawAxisPill(text, x, y, width = 38, magic = false) {
  ctx.save();
  ctx.font = `900 ${magic ? 15 : 13}px system-ui, sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle = magic ? '#9b2435' : (document.body.classList.contains('dark') ? '#f4f1ec' : '#24211c');
  ctx.fillText(text, x, y);
  ctx.restore();
}
function drawNuclides() {
  const v = visibleWorldRect();
  for (const n of state.all) {
    if (!shouldShow(n)) continue;
    const r = cellRect(n.z, n.n);
    if (r.x + CELL_W < v.x1 || r.x > v.x2 || r.y + CELL_H < v.y1 || r.y > v.y2) continue;
    drawCell(n, r);
  }
}
function drawCell(n, rect) {
  const x = sx(rect.x), y = sy(rect.y), w = CELL_W * state.scale, h = CELL_H * state.scale;
  if (w < 2 || h < 2) return;
  ctx.save();
  ctx.globalAlpha = n.dataClass === 'theoretical' ? 0.22 : 1;
  ctx.fillStyle = colorForNuclide(n);
  roundedRect(ctx, x, y, w, h, Math.max(4, 11 * state.scale));
  ctx.fill();
  ctx.strokeStyle = state.selected && state.selected.key === n.key ? '#111' : 'rgba(0,0,0,.16)';
  ctx.lineWidth = Math.max(0.75, state.scale);
  if (n.dataClass === 'theoretical') ctx.setLineDash([Math.max(2, 5*state.scale), Math.max(2, 4*state.scale)]);
  ctx.stroke(); ctx.setLineDash([]);
  if (n.dataClass === 'isomer') {
    ctx.fillStyle = 'rgba(93,90,246,.85)';
    ctx.beginPath(); ctx.arc(x + w - 8*state.scale, y + 8*state.scale, Math.max(2.4, 4*state.scale), 0, Math.PI*2); ctx.fill();
  }
  if (w > 20 && h > 17) {
    ctx.fillStyle = '#161616'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.max(8, Math.min(23, 21 * state.scale))}px system-ui, sans-serif`;
    ctx.fillText(n.symbol, x + w/2, y + h/2 - Math.min(5, h*0.08));
    if (w > 46 && h > 44) {
      ctx.font = `800 ${Math.max(7, Math.min(10, 9 * state.scale))}px system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(20,20,20,.72)';
      ctx.textAlign = 'left'; ctx.fillText(String(n.a), x + w*0.15, y + h*0.20);
      ctx.textAlign = 'right'; ctx.fillText(`N${n.n}`, x + w*0.85, y + h*0.20);
      ctx.textAlign = 'left'; ctx.fillText(`Z${n.z}`, x + w*0.15, y + h*0.83);
      ctx.textAlign = 'right'; ctx.fillText(DECAY_LABELS[n.decay] || n.decay, x + w*0.85, y + h*0.83);
    }
  }
  ctx.restore();
}
function shouldShow(n) {
  if (n.dataClass === 'evaluated' && !state.layers.evaluated) return false;
  if (n.dataClass === 'theoretical' && !state.layers.theoretical) return false;
  if (n.dataClass === 'isomer' && !state.layers.isomer) return false;
  if (!state.activeFilters.has(n.decay)) return false;
  return true;
}
function visibleWorldRect() { return { x1: (0 - state.tx) / state.scale, y1: (0 - state.ty) / state.scale, x2: (window.innerWidth - state.tx) / state.scale, y2: (window.innerHeight - state.ty) / state.scale }; }
function sx(x) { return state.tx + x * state.scale; }
function sy(y) { return state.ty + y * state.scale; }
function wx(x) { return (x - state.tx) / state.scale; }
function wy(y) { return (y - state.ty) / state.scale; }
function cellRect(z,n) { return { x: AXIS + n*TILE_STEP_X, y: AXIS + (Z_MAX-z)*TILE_STEP_Y }; }
function roundedRect(c,x,y,w,h,r) { const rr = Math.max(0, Math.min(r, Math.abs(w)/2, Math.abs(h)/2)); c.beginPath(); c.moveTo(x+rr,y); c.lineTo(x+w-rr,y); c.arcTo(x+w,y,x+w,y+rr,rr); c.lineTo(x+w,y+h-rr); c.arcTo(x+w,y+h,x+w-rr,y+h,rr); c.lineTo(x+rr,y+h); c.arcTo(x,y+h,x,y+h-rr,rr); c.lineTo(x,y+rr); c.arcTo(x,y,x+rr,y,rr); c.closePath(); }
function clampNumber(v,min,max) { return Math.max(min, Math.min(max, v)); }

function fitToScreen(force = false) {
  const mobileViewport = window.matchMedia?.('(max-width: 640px)').matches || Math.min(window.innerWidth, window.innerHeight) <= 640;
  const pad = mobileViewport ? 10 : 64;
  const fullSx = Math.max(1, window.innerWidth - pad*2) / CHART_W;
  const fullSy = Math.max(1, window.innerHeight - pad*2) / CHART_H;
  state.fullFitScale = Math.min(fullSx, fullSy);

  const boundsMargin = mobileViewport ? 6 : 28;
  const r = worldRectForBounds(state.evaluatedBounds || { minZ: 1, maxZ: 118, minN: 0, maxN: 178 }, boundsMargin);
  const rw = Math.max(1, r.x2 - r.x1), rh = Math.max(1, r.y2 - r.y1);
  const evalSx = Math.max(1, window.innerWidth - pad*2) / rw;
  const evalSy = Math.max(1, window.innerHeight - pad*2) / rh;
  state.fitScale = Math.min(evalSx, evalSy);
  if (force || state.scale < state.fullFitScale) state.scale = state.fitScale;
  state.tx = (window.innerWidth - rw * state.scale) / 2 - r.x1 * state.scale;
  state.ty = (window.innerHeight - rh * state.scale) / 2 - r.y1 * state.scale;
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
  const viewW = window.innerWidth, viewH = window.innerHeight;
  const scaledW = CHART_W * state.scale, scaledH = CHART_H * state.scale;
  const mobileViewport = window.matchMedia?.('(max-width: 640px)').matches || Math.min(window.innerWidth, window.innerHeight) <= 640;
  const margin = mobileViewport ? 10 : 80;
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

function setupInteractions() {
  canvas.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 0.89); }, { passive: false });
  canvas.addEventListener('dblclick', e => { const n = hitTest(e.clientX, e.clientY); if (n) centerOnNuclide(n); else fitToScreen(true); });
  document.getElementById('zoomHud')?.addEventListener('click', e => { e.stopPropagation(); fitToScreen(true); });
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', () => { resizeCanvases(); fitToScreen(false); resizeAtomCanvas(); scheduleRender(); });
}
function onPointerDown(e) { canvas.setPointerCapture?.(e.pointerId); state.pointers.set(e.pointerId, { x:e.clientX, y:e.clientY }); state.dragging = true; state.lastX=e.clientX; state.lastY=e.clientY; state.moved=false; if (state.pointers.size === 2) startPinch(); }
function onPointerMove(e) {
  if (!state.pointers.has(e.pointerId)) return;
  state.pointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
  if (state.pointers.size === 2) { updatePinch(); return; }
  if (!state.dragging) return;
  const dx=e.clientX-state.lastX, dy=e.clientY-state.lastY; if (Math.abs(dx)+Math.abs(dy)>2) state.moved=true;
  state.tx += dx; state.ty += dy; state.lastX=e.clientX; state.lastY=e.clientY; updateView();
}
function onPointerUp(e) { state.pointers.delete(e.pointerId); if (!state.pointers.size) { state.dragging=false; state.pinch=null; } else if (state.pointers.size === 1) { const p=[...state.pointers.values()][0]; state.lastX=p.x; state.lastY=p.y; state.pinch=null; } }
function startPinch() { const [a,b]=[...state.pointers.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); const c={x:(a.x+b.x)/2,y:(a.y+b.y)/2}; state.pinch = { startDistance: d, startScale: state.scale, chartX: wx(c.x), chartY: wy(c.y) }; }
function updatePinch() { if (!state.pinch) return startPinch(); const [a,b]=[...state.pointers.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); const c={x:(a.x+b.x)/2,y:(a.y+b.y)/2}; const maxScale=Math.max(2.6,state.fitScale*26); const ns=Math.max(state.fullFitScale || state.fitScale, Math.min(maxScale, state.pinch.startScale * d/state.pinch.startDistance)); state.scale = ns; state.tx = c.x - state.pinch.chartX * ns; state.ty = c.y - state.pinch.chartY * ns; state.moved=true; updateView(); }
function onCanvasClick(e) { if (state.moved) return; const n = hitTest(e.clientX, e.clientY); if (n) selectNuclide(n); else closeNuclideCard(); }
function onMouseMove(e) { const n = hitTest(e.clientX, e.clientY); if (n) { cursorHud.textContent = `${n.symbol}-${n.a} · Z ${n.z} · N ${n.n}`; cursorHud.classList.add('visible'); } else { cursorHud.textContent = `Z ${Math.max(0, Math.round(Z_MAX - ((wy(e.clientY)-AXIS)/TILE_STEP_Y)))} · N ${Math.max(0, Math.round((wx(e.clientX)-AXIS)/TILE_STEP_X))}`; cursorHud.classList.add('visible'); } }
function hitTest(x,y) { const worldX=wx(x), worldY=wy(y); const n=Math.floor((worldX-AXIS)/TILE_STEP_X), z=Z_MAX - Math.floor((worldY-AXIS)/TILE_STEP_Y); const localX=(worldX-AXIS)-n*TILE_STEP_X, localY=(worldY-AXIS)-(Z_MAX-z)*TILE_STEP_Y; if (localX<0 || localY<0 || localX>CELL_W || localY>CELL_H) return null; return state.all.find(item => shouldShow(item) && item.z===z && item.n===n) || null; }
function centerOnNuclide(n) { const r=cellRect(n.z,n.n); const x=r.x+CELL_W/2, y=r.y+CELL_H/2; const zoomMultiplier = window.innerWidth < 700 ? 6 : 7; state.scale = Math.max(state.fitScale, Math.min(state.fitScale * zoomMultiplier, 1.85)); state.tx = window.innerWidth/2 - x * state.scale; state.ty = window.innerHeight/2 - y * state.scale; updateView(); }
function selectNuclide(n) { state.selected = n; fillDetail(n); openCard(); state.atom = buildAtomState(n); resizeAtomCanvas(); drawAtom(performance.now()); scheduleRender(); }
function openCard() { nuclideCard.classList.add('open'); nuclideCard.setAttribute('aria-hidden','false'); }
function closeNuclideCard() { nuclideCard.classList.remove('open'); nuclideCard.setAttribute('aria-hidden','true'); state.selected = null; scheduleRender(); }

function setupDetailTabs() { document.querySelectorAll('.tab-button').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('.tab-button').forEach(b=>b.classList.toggle('active', b===btn)); document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active', p.dataset.panel === btn.dataset.tab)); })); atomCanvas?.addEventListener('click', () => { state.atom.paused = !state.atom.paused; atomCanvas.classList.toggle('paused', state.atom.paused); }); }
function fillDetail(n) {
  const set = (id,v) => { const el=document.getElementById(id); if (el) el.textContent = v ?? '—'; };
  set('detailA', n.a); set('detailZ', n.z); set('detailSymbol', n.symbol); set('detailName', n.element); set('detailSubtitle', `${n.element}-${n.a} · N=${n.n}`);
  set('detailClass', classLabel(n)); set('detailState', stateLabel(n)); set('detailHalfLife', n.halfLifeLabel || '—'); set('detailAbundance', n.abundance ? `${n.abundance}%` : '—'); set('detailSpin', n.spin || '—');
  set('detailDecayMode', DECAY_LABELS[n.decay] || n.decay); set('detailQ', qLabel(n)); set('detailDaughter', daughterLabel(n)); set('detailMass', n.atomicMass || '—'); set('detailMassExcess', n.massExcess || '—'); set('detailBinding', n.binding || '—'); set('detailSeparation', sepLabel(n)); set('detailProtons', n.z); set('detailNeutrons', n.n); set('detailElectrons', n.z); set('detailMagic', magicLabel(n)); set('detailNotes', notesFor(n)); set('detailApplications', applicationsFor(n)); set('atomTitle', `${n.symbol}-${n.a}`); set('nucleusText', `${n.z} p⁺ · ${n.n} n⁰`); set('shellText', electronShells(n.z).join(' · '));
  document.getElementById('wikiLink').href = n.wikipedia || `https://es.wikipedia.org/wiki/Is%C3%B3topos_de_${encodeURIComponent(n.element)}`;
  document.getElementById('liveChartLink').href = n.livechart || `https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html`;
  renderMiniBars(n); renderDecayChain(n); renderRelations(n); document.getElementById('rawDataBlock').textContent = JSON.stringify(n.raw || {}, null, 2);
}
function classLabel(n) { return n.dataClass === 'theoretical' ? 'No observado / teórico' : n.dataClass === 'isomer' ? 'Isómero' : 'Evaluado'; }
function stateLabel(n) { return n.decay === 'stable' ? 'Estable' : 'Radiactivo'; }
function qLabel(n) { return n.qa ? `Qα ${n.qa}` : n.qbm ? `Qβ− ${n.qbm}` : n.qec ? `QEC ${n.qec}` : '—'; }
function sepLabel(n) { return [n.sn ? `Sn ${n.sn}` : '', n.sp ? `Sp ${n.sp}` : ''].filter(Boolean).join(' · ') || '—'; }
function magicLabel(n) { const a=[]; if (MAGIC_NUMBERS.includes(n.z)) a.push(`Z=${n.z}`); if (MAGIC_NUMBERS.includes(n.n)) a.push(`N=${n.n}`); return a.join(' · ') || '—'; }
function notesFor(n) { if (n.dataClass === 'theoretical') return 'Registro visual extrapolado para mostrar continuidad de la carta nuclear. No debe leerse como dato evaluado.'; const parts=[]; if (n.discovery) parts.push(`Descubrimiento: ${n.discovery}.`); if (n.decay==='stable') parts.push('Nucleido estable según el dataset cargado.'); if (n.abundance) parts.push('Presenta abundancia natural indicada en el CSV.'); return parts.join(' ') || 'Sin notas adicionales en el dataset.'; }
function applicationsFor(n) { if (n.raw?.application) return n.raw.application; const key = `${n.symbol}-${n.a}`; const map = { 'C-14':'Datación radiométrica y trazadores.', 'U-235':'Combustible nuclear e investigación de fisión.', 'U-238':'Series de decaimiento natural y datación geológica.', 'Co-60':'Fuente gamma industrial y médica.', 'Tc-99':'Medicina nuclear, especialmente en forma metaestable.', 'I-131':'Medicina nuclear y trazadores tiroideos.', 'F-18':'PET en medicina nuclear.' }; return map[key] || 'Aplicaciones no especificadas en el dataset.'; }
function renderMiniBars(n) { const box=document.getElementById('miniBars'); box.innerHTML=''; const items = [ ['Abundancia', Math.min(100, Math.max(0, numeric(n.abundance) || 0)), '%'], ['Enlace', scaleValue(numeric(n.binding), 5000, 9000), 'rel.'], ['Z/N', Math.min(100, Math.max(0, n.z / Math.max(1, n.n) * 65)), 'rel.'] ]; for (const [label,val,unit] of items) { const row=document.createElement('div'); row.className='mini-bar'; row.innerHTML=`<span>${label}</span><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${val}%"></div></div><strong>${Math.round(val)}${unit}</strong>`; box.append(row); } }
function scaleValue(v, min, max) { if (!Number.isFinite(v)) return 0; return Math.min(100, Math.max(0, (v-min)/(max-min)*100)); }
function renderDecayChain(n) { const box=document.getElementById('decayChain'); box.innerHTML=''; let cur=n; for (let i=0;i<6 && cur;i++) { const chip=document.createElement('button'); chip.className='chain-chip'; chip.textContent=`${cur.symbol}-${cur.a}`; chip.addEventListener('click',()=>selectNuclide(cur)); box.append(chip); cur = daughterNuclide(cur); if (!cur || cur.key===n.key) break; } }
function renderRelations(n) { const box=document.getElementById('relationList'); box.innerHTML=''; const parents = state.all.filter(p => daughterNuclide(p)?.key === n.key).slice(0,8); for (const p of parents) { const chip=document.createElement('button'); chip.className='chain-chip'; chip.textContent=`← ${p.symbol}-${p.a}`; chip.addEventListener('click',()=>selectNuclide(p)); box.append(chip); } if (!parents.length) box.textContent='Sin relaciones calculadas.'; }
function daughterNuclide(n) { let z=n.z, neut=n.n; if (n.decay==='alpha') { z-=2; neut-=2; } else if (n.decay==='betaMinus') { z+=1; neut-=1; } else if (n.decay==='betaPlus') { z-=1; neut+=1; } else return null; return state.byKey.get(`${z}:${neut}:evaluated`) || state.byKey.get(`${z}:${neut}:isomer`) || state.all.find(x=>x.z===z&&x.n===neut&&x.dataClass!=='theoretical') || null; }
function daughterLabel(n) { const d=daughterNuclide(n); return d ? `${d.symbol}-${d.a}` : '—'; }

function addSelectedToCompare() { if (!state.selected) return; if (!state.compare.find(n=>n.key===state.selected.key)) state.compare.push(state.selected); renderCompare(); }
function renderCompare() { if (!state.compare.length) { compareTray.classList.remove('open'); compareTray.setAttribute('aria-hidden','true'); return; } compareTray.classList.add('open'); compareTray.setAttribute('aria-hidden','false'); document.getElementById('compareTable').innerHTML = `<table><thead><tr>${state.compare.map(n=>`<th>${n.symbol}-${n.a}</th>`).join('')}</tr></thead><tbody>${['halfLifeLabel','decay','atomicMass','binding'].map(k=>`<tr>${state.compare.map(n=>`<td>${k==='decay'?(DECAY_LABELS[n[k]]||n[k]):(n[k]||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table>`; }
function exportCardPng() { const url = atomCanvas.toDataURL('image/png'); const a=document.createElement('a'); a.href=url; a.download=`${state.selected?.symbol || 'nucleido'}-${state.selected?.a || ''}.png`; a.click(); }

function runSearch() { const q = document.getElementById('searchInput').value.trim(); if (!q) return; const n = findNuclide(q); if (n) { centerOnNuclide(n); selectNuclide(n); document.getElementById('searchTool')?.classList.remove('open'); } }
window.runSearch = runSearch;
function findNuclide(q) {
  const s = q.toLowerCase().replace(/\s+/g,'');
  const zn = s.match(/^z[=:]?(\d+)[,;]?n[=:]?(\d+)$/); if (zn) return state.all.find(n=>n.z==+zn[1]&&n.n==+zn[2]&&shouldShow(n));
  const a1 = s.match(/^([a-z]{1,3})-?(\d+)$/i); if (a1) { const sym=cap(a1[1]); const a=+a1[2]; return state.all.find(n=>n.symbol===sym&&n.a===a&&shouldShow(n)); }
  const a2 = s.match(/^(\d+)([a-z]{1,3})$/i); if (a2) { const sym=cap(a2[2]); const a=+a2[1]; return state.all.find(n=>n.symbol===sym&&n.a===a&&shouldShow(n)); }
  return state.all.find(n => (`${n.symbol}-${n.a}`.toLowerCase()===s || n.element.toLowerCase().startsWith(s)) && shouldShow(n));
}
function cap(v) { return String(v).slice(0,1).toUpperCase()+String(v).slice(1).toLowerCase(); }

async function loadFromIaea() {
  dataStatus.textContent = 'Cargando LiveChart...';
  try {
    const url = 'https://www-nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all';
    const res = await fetch(url); if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text(); const mapped = parseCsv(text).map(r => rowToNuclide(r, 'IAEA LiveChart', 'evaluated')).filter(n => n && n.z > 0);
    state.official = mapped; state.secondary = []; rebuildDerivedData(); fitToScreen(true); closeNuclideCard(); dataStatus.textContent = `${mapped.length.toLocaleString('es-ES')} nucleidos cargados desde IAEA.`;
  } catch (err) { dataStatus.textContent = 'No se pudo cargar IAEA desde el navegador. Usa CSV local.'; }
}
function handleCsvInput(e) { const f = e.target.files?.[0]; if (!f) return; readFileAsText(f, text => { const mapped = parseCsv(text).map(r => rowToNuclide(r, f.name, 'evaluated')).filter(n => n && n.z > 0); if (!mapped.length) throw new Error('No se reconocieron columnas z/n o a/symbol.'); state.official = mapped; state.secondary = []; rebuildDerivedData(); fitToScreen(true); closeNuclideCard(); dataStatus.textContent = `Importados ${mapped.length.toLocaleString('es-ES')} nucleidos desde ${f.name}.`; closeDataPopover(); }); }
function handleSecondaryCsvInput(e) { const f=e.target.files?.[0]; if(!f) return; readFileAsText(f, text => { const mapped=parseCsv(text).map(r => rowToNuclide(r, f.name, detectClass(r))).filter(n=>n&&n.z>0); state.secondary=mapped; rebuildDerivedData(); dataStatus.textContent = `Dataset secundario: ${mapped.length.toLocaleString('es-ES')} registros.`; closeDataPopover(); }); }
function readFileAsText(file, cb) { const r=new FileReader(); r.onload=()=>cb(String(r.result||'')); r.readAsText(file); }
function detectClass(row) { const v=String(row.data_class||row.quality||row.source_type||row.state||'').toLowerCase(); if (v.includes('isomer') || /^m\d+/.test(v)) return 'isomer'; if (v.includes('theor') || v.includes('estim') || v.includes('unobserved')) return 'theoretical'; return 'evaluated'; }

function parseCsv(text) { const rows=[]; let row=[], cur='', q=false; for(let i=0;i<text.length;i++){ const ch=text[i], nx=text[i+1]; if(ch==='"'){ if(q&&nx==='"'){cur+='"';i++;} else q=!q; } else if(ch===','&&!q){ row.push(cur); cur=''; } else if((ch==='\n'||ch==='\r')&&!q){ if(ch==='\r'&&nx==='\n') i++; row.push(cur); if(row.some(c=>c.trim())) rows.push(row); row=[]; cur=''; } else cur+=ch; } row.push(cur); if(row.some(c=>c.trim())) rows.push(row); if(!rows.length) return []; const header=rows.shift().map(h=>normKey(h)); return rows.map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]??'']))); }
function normKey(k){ return String(k||'').trim().toLowerCase().replace(/[%()\s\-]+/g,'_').replace(/_+$/,''); }
function rowToNuclide(row, source, fallbackClass='evaluated') {
  const z = num(row.z ?? row.protons ?? row.atomic_number) ?? zFromSymbol(row.symbol);
  const aRaw = num(row.a ?? row.mass_number ?? row.mass);
  const n = num(row.n ?? row.neutrons) ?? (aRaw != null && z != null ? aRaw - z : null);
  if (z == null || n == null) return null;
  const a = aRaw ?? z+n;
  const symbol = cleanSymbol(row.symbol) || symbolForZ(z);
  const element = row.element || row.name || nameForZ(z);
  const dataClass = detectClass(row) || fallbackClass;
  const halfLifeLabel = halfLife(row);
  const decay = classifyDecay(row);
  return { z, n, a, symbol, element, key: `${z}:${n}:${dataClass}`, dataClass, stateLabel: decay==='stable'?'Estable':'Radiactivo', halfLifeLabel, halfLifeSec: halfLifeSeconds(row), decay, abundance: clean(row.abundance), spin: clean(row.jp || row.spin_parity || row.spin), atomicMass: clean(row.atomic_mass), massExcess: clean(row.massexcess || row.mass_excess), binding: clean(row.binding), qa: clean(row.qa), qec: clean(row.qec), qbm: clean(row.qbm || row.qbeta || row.qb), sn: clean(row.sn), sp: clean(row.sp), discovery: clean(row.discovery), applications: clean(row.application), wikipedia: clean(row.wikipedia), livechart: clean(row.livechart), raw: row };
}
function classifyDecay(row) { const vals=[row.decay_1,row.decay_2,row.decay_3,row.decay,row.decay_mode].map(v=>String(v||'').toLowerCase()).join(' '); const hl=String(row.half_life||'').toLowerCase(); if(vals.includes('stable')||hl.includes('stable')||hl==='stbl') return 'stable'; if(vals.includes('b-')||vals.includes('β-')||vals.includes('beta-')) return 'betaMinus'; if(vals.includes('b+')||vals.includes('ec')||vals.includes('β+')||vals.includes('epsilon')) return 'betaPlus'; if(vals.includes('alpha')||vals.includes('a ')) return 'alpha'; if(vals.includes('sf')) return 'spontaneousFission'; if(vals.includes('it')||vals.includes('isomer')) return 'isomeric'; if(vals.includes(' p')||vals==='p') return 'proton'; if(vals.includes(' n')||vals==='n') return 'neutron'; if(vals.includes('cluster')) return 'cluster'; return 'other'; }
function halfLife(row) { const raw=clean(row.half_life); if(!raw) return classifyDecay(row)==='stable'?'Estable':'—'; return `${clean(row.operator_hl)||''}${raw}${row.unit_hl?` ${row.unit_hl}`:''}`.trim(); }
function halfLifeSeconds(row){ const v=numeric(row.half_life_sec); if(Number.isFinite(v)) return v; return null; }
function colorForNuclide(n) {
  if (state.mapMode==='decay') return COLOR_MAPS.decay[n.decay] || '#ddd';
  if (state.mapMode==='stability') return COLOR_MAPS.stability[stabilityBucket(n)] || '#ddd';
  if (state.mapMode==='quality') return COLOR_MAPS.quality[n.dataClass] || '#ddd';
  if (state.mapMode==='abundance') return gradient(numeric(n.abundance), 0, 100, ['#f2f2f2','#6fcf97']);
  if (state.mapMode==='binding') return gradient(numeric(n.binding), 6000, 8800, ['#d9ecff','#ffb45c']);
  if (state.mapMode==='qa') return gradient(numeric(n.qa), 0, 12000, ['#e9e9e9','#e85d75']);
  if (state.mapMode==='qb') return gradient(numeric(n.qbm), -3000, 12000, ['#dcecff','#9467bd']);
  if (state.mapMode==='halfLife') return halfLifeColor(n);
  return '#ddd';
}
function stabilityBucket(n){ if(n.decay==='stable')return'stable'; const s=n.halfLifeSec; if(!Number.isFinite(s))return'unknown'; if(s>31557600)return'long'; if(s>3600)return'medium'; return'short'; }
function halfLifeColor(n){ if(n.decay==='stable')return'#8fce95'; const s=n.halfLifeSec; if(!Number.isFinite(s))return'#d8d8d8'; const l=Math.log10(Math.max(1e-9,s)); return gradient(l,-6,18,['#6441a5','#2f80ed','#f2c94c','#eb5757']); }
function gradient(v,min,max,colors){ if(!Number.isFinite(v))return'#d8d8d8'; const t=Math.max(0,Math.min(1,(v-min)/(max-min))); return mix(colors[0],colors[1],t); }
function mix(a,b,t){ const A=hex(a),B=hex(b); const c=A.map((v,i)=>Math.round(v+(B[i]-v)*t)); return `rgb(${c[0]},${c[1]},${c[2]})`; }
function hex(h){ return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); }

function drawMinimap() { if (!state.layers.minimap || !miniCtx || !minimapCanvas.offsetParent) return; const w=minimapCanvas.clientWidth,h=minimapCanvas.clientHeight; miniCtx.clearRect(0,0,w,h); miniCtx.fillStyle=document.body.classList.contains('dark')?'rgba(255,255,255,.035)':'rgba(0,0,0,.035)'; miniCtx.fillRect(0,0,w,h); const sxm=w/CHART_W, sym=h/CHART_H; for (const n of state.all) { if (n.dataClass==='theoretical') continue; const r=cellRect(n.z,n.n); miniCtx.fillStyle=colorForNuclide(n); miniCtx.globalAlpha=.85; miniCtx.fillRect(r.x*sxm,r.y*sym,Math.max(1,CELL_W*sxm),Math.max(1,CELL_H*sym)); } miniCtx.globalAlpha=1; const v=visibleWorldRect(); miniCtx.strokeStyle='#5d5af6'; miniCtx.lineWidth=2; miniCtx.strokeRect(v.x1*sxm,v.y1*sym,(v.x2-v.x1)*sxm,(v.y2-v.y1)*sym); }

function buildAtomState(n) { const shells=electronShells(n.z); return { z:n.z, neutrons:n.n, shells, angle:0, paused:false, particles: buildNucleusParticles(n.z,n.n) }; }
function electronShells(z) { const caps=[2,8,18,32,32,18,8]; const out=[]; let left=z; for (const c of caps) { if(left<=0) break; const v=Math.min(c,left); out.push(v); left-=v; } if(left>0) out.push(left); return out; }
function buildNucleusParticles(p, n) { const total=Math.min(260,p+n); return Array.from({length:total},(_,i)=>({ proton:i<p, r: Math.sqrt(i/total)*42, a:i*2.399, z:(i%17-8)/8 })); }
function resizeAtomCanvas(){ if(!atomCanvas)return; const dpr=Math.max(1,window.devicePixelRatio||1), rect=atomCanvas.getBoundingClientRect(); atomCanvas.width=Math.max(1,Math.round(rect.width*dpr)); atomCanvas.height=Math.max(1,Math.round(rect.height*dpr)); atomCtx.setTransform(dpr,0,0,dpr,0,0); }
function startAtomLoop(){ requestAnimationFrame(drawAtom); }
function drawAtom(now){ requestAnimationFrame(drawAtom); if(!atomCanvas||!atomCtx)return; const w=atomCanvas.clientWidth,h=atomCanvas.clientHeight; atomCtx.clearRect(0,0,w,h); const a=state.atom?.paused ? state.atom.angle : (state.atom.angle=(now||0)/2200); const cx=w/2, cy=h/2; atomCtx.save(); atomCtx.translate(cx,cy); const maxR=Math.min(w,h)*0.42; const shells=state.atom?.shells||[2,8]; shells.forEach((count,i)=>{ const r=maxR*(i+1)/(shells.length+0.5); atomCtx.strokeStyle=document.body.classList.contains('dark')?'rgba(255,255,255,.18)':'rgba(0,0,0,.16)'; atomCtx.lineWidth=1.2; atomCtx.beginPath(); for(let t=0;t<=Math.PI*2+.05;t+=.05){ const x=Math.cos(t)*r, y=Math.sin(t)*r*Math.cos(.85+i*.22); if(t===0)atomCtx.moveTo(x,y); else atomCtx.lineTo(x,y); } atomCtx.stroke(); for(let e=0;e<count;e++){ const t=a*(1+i*.15)+e/count*Math.PI*2; const x=Math.cos(t)*r, y=Math.sin(t)*r*Math.cos(.85+i*.22), depth=Math.sin(t); atomCtx.fillStyle=depth>0?'#5d5af6':'#8ca0ff'; atomCtx.beginPath(); atomCtx.arc(x,y,Math.max(2.2,3.5+depth),0,Math.PI*2); atomCtx.fill(); } }); const parts=state.atom?.particles||[]; const sorted=[...parts].sort((a,b)=>a.z-b.z); for(const p of sorted){ const x=Math.cos(p.a+a*.6)*p.r, y=Math.sin(p.a+a*.6)*p.r*.72 + p.z*8; atomCtx.fillStyle=p.proton?'#ff6b62':'#7aa7ff'; atomCtx.beginPath(); atomCtx.arc(x,y,5.4,0,Math.PI*2); atomCtx.fill(); } atomCtx.restore(); }

function parseNumberLike(v){ const n=Number(String(v??'').replace(',','.').replace(/[<>~]/g,'')); return Number.isFinite(n)?n:null; }
function num(v){ const n=parseNumberLike(v); return n==null?null:Math.round(n); }
function numeric(v){ return parseNumberLike(v); }
function clean(v){ const s=String(v??'').trim(); return s && s.toLowerCase()!=='nan' ? s : ''; }
function cleanSymbol(v){ const s=clean(v).replace(/[^a-z]/ig,''); return s?cap(s):''; }
function symbolForZ(z){ return ELEMENTS[z] || temporarySymbol(z); }
function nameForZ(z){ return ELEMENT_NAMES_ES[z] || `Elemento ${z}`; }
function zFromSymbol(s){ const sym=cleanSymbol(s); const i=ELEMENTS.findIndex(e=>e===sym); return i>0?i:null; }
function temporarySymbol(z){ const roots=['n','u','b','t','q','p','h','s','o','e']; return String(z).split('').map(d=>roots[+d]).join('').replace(/^./,c=>c.toUpperCase()); }
