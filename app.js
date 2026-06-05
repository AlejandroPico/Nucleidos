(() => {
  'use strict';

  const canvas = document.getElementById('nuclideCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const atomCanvas = document.getElementById('atomCanvas');
  const atomCtx = atomCanvas.getContext('2d');

  const AXIS = 70;
  const CELL_W = 48;
  const CELL_H = 34;
  const GAP = 6;
  const STEP_X = CELL_W + GAP;
  const STEP_Y = CELL_H + GAP;
  const DEFAULT_Z_MAX = 130;
  const DEFAULT_N_MAX = 320;
  const MAGIC_NUMBERS = [2, 8, 20, 28, 50, 82, 126, 184];
  const IAEA_GROUND_STATES_URL = 'https://www-nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all';

  const ELEMENTS = (window.PERIODIC_ELEMENTS || []).filter(Boolean);
  const ELEMENT_BY_Z = new Map(ELEMENTS.map(e => [Number(e.number), e]));
  const ELEMENT_BY_SYMBOL = new Map(ELEMENTS.map(e => [String(e.symbol || '').toLowerCase(), e]));

  const BASE_PALETTE = [
    '#7aa5ff','#e97777','#69b68f','#d899f0','#f1a45b','#56bdc3','#c6a151','#9e99ff',
    '#d783a9','#8fb35a','#6aa0b8','#db7e5c','#a685e4','#7cbf74','#d4a14d','#9e9e9e'
  ];
  const DECAY_COLORS = { stable:'#61b37b', alpha:'#d66b5d', 'beta-':'#5e95e8', 'beta+/EC':'#ca7de8', sf:'#d39c4a', p:'#ea8b8b', n:'#6cc2c4', it:'#8e80e6', cluster:'#986e55', unknown:'#b8b4ad' };
  const DECAY_ORDER = ['stable','beta-','beta+/EC','alpha','sf','p','n','it','cluster','unknown'];
  const QUALITY_COLORS = { evaluated:'#6ea7f4', isomer:'#a887ff', theoretical:'#b7b2aa', fallback:'#d2a25a', unknown:'#b8b4ad' };
  const PHASE_COLORS = { Solid:'#7ea475', Liquid:'#5ea7ce', Gas:'#d56d6d', Unknown:'#aaa39b' };
  const BLOCK_COLORS = { s:'#6ba5ff', p:'#ee7770', d:'#d0a34e', f:'#9c82e6', unknown:'#aaa39b' };
  const TYPE_COLORS = { metal:'#d0a34e', nonmetal:'#6db481', metalloid:'#a887ff', unknown:'#aaa39b' };

  const NUCLEAR_MODES = [
    ['decay','Desintegración','Modo nuclear','Colorea por modo principal de decaimiento: estable, alfa, beta, captura electrónica, fisión u otros.'],
    ['stability','Estabilidad','Clasificación','Distingue nucleidos estables, radiactivos y registros sin clasificación clara.'],
    ['halflife','Vida media','Escala temporal','Agrupa por vida media aproximada con escala logarítmica.'],
    ['quality','Calidad','Origen del dato','Distingue datos evaluados, isómeros, teóricos o registros de respaldo.'],
    ['abundance','Abundancia','Natural','Resalta nucleidos con abundancia natural o sin dato.'],
    ['qalpha','Qα','Energía α','Colorea según disponibilidad/signo de Q alfa si el CSV lo contiene.'],
    ['qbeta','Qβ−','Energía β−','Colorea según disponibilidad/signo de Q beta menos si el CSV lo contiene.']
  ];
  const CHEM_CLASS_MODES = [
    ['element_category','Categoría','Familias','Metales alcalinos, halógenos, gases nobles, lantánidos, actínidos, metaloides, etc.'],
    ['element_block','Bloque','s · p · d · f','Colorea por bloque electrónico del elemento.'],
    ['element_phase','Estado','STP','Colorea por estado físico del elemento: sólido, líquido o gas.'],
    ['element_group','Grupo','Tabla periódica','Filtra por grupo periódico cuando existe.'],
    ['element_period','Periodo','Tabla periódica','Filtra por periodo periódico.'],
    ['element_type','Tipo general','Metal / no metal','Agrupa en metal, no metal, metaloide u otros.']
  ];
  const NUMERIC_MODES = [
    ['melt','Punto de fusión','K','Rango por temperatura de fusión del elemento.'],
    ['boil','Punto de ebullición','K','Rango por temperatura de ebullición del elemento.'],
    ['density','Densidad','g/cm³ o g/L','Rango por densidad del elemento en el dataset.'],
    ['electronegativity_pauling','Electronegatividad','Pauling','Rango por electronegatividad de Pauling.'],
    ['first_ionization','1ª ionización','kJ/mol','Rango por primera energía de ionización.'],
    ['electron_affinity','Afinidad electrónica','kJ/mol','Rango por afinidad electrónica.'],
    ['atomic_radius','Radio atómico','pm','Rango por radio atómico. Si el dataset no trae radio real, se usa una estimación visual marcada como aproximada.'],
    ['molar_heat','Calor específico','J/(mol·K)','Rango por calor molar específico disponible en el CSV/JSON.'],
    ['atomic_mass','Masa atómica','u','Rango por masa atómica media del elemento.']
  ];

  const els = {
    zoomValue: document.getElementById('zoomValue'),
    searchButton: document.getElementById('searchButton'), dataButton: document.getElementById('dataButton'), themeButton: document.getElementById('themeButton'), layersButton: document.getElementById('layersButton'),
    searchPopover: document.getElementById('searchPopover'), dataPopover: document.getElementById('dataPopover'), layersPopover: document.getElementById('layersPopover'),
    searchInput: document.getElementById('searchInput'), searchResults: document.getElementById('searchResults'),
    nuclearModes: document.getElementById('nuclearModes'), chemicalClassModes: document.getElementById('chemicalClassModes'), numericModes: document.getElementById('numericModes'), legend: document.getElementById('legend'),
    rangeControl: document.getElementById('rangeControl'), rangeLabel: document.getElementById('rangeLabel'), rangeUnit: document.getElementById('rangeUnit'), rangeMin: document.getElementById('rangeMin'), rangeMax: document.getElementById('rangeMax'), rangeMinText: document.getElementById('rangeMinText'), rangeMaxText: document.getElementById('rangeMaxText'), rangeFill: document.getElementById('rangeFill'), dualRange: document.querySelector('.dual-range'),
    detailCard: document.getElementById('detailCard'), atomModel3d: document.getElementById('atomModel3d'), uiTooltip: document.getElementById('uiTooltip'), miniMap: document.getElementById('miniMap'),
    loadStatus: document.getElementById('loadStatus'), datasetStats: document.getElementById('datasetStats')
  };

  const state = {
    all: [], byCell: new Map(), byKey: new Map(), evaluatedBounds: null,
    zMax: DEFAULT_Z_MAX, nMax: DEFAULT_N_MAX, chartW: 0, chartH: 0,
    scale: 1, tx: 0, ty: 0, fitScale: 1, fullFitScale: 1,
    dragging: false, lastPointer: null, pinch: null,
    selected: null, atomPaused: false,
    mode: 'decay', modeType: 'nuclear',
    filters: {}, rangeFilters: {}, numericRanges: {},
    layers: { evaluated:true, theoretical:false, isomer:true, grid:false, magic:false, frontier:false, minimap:true, expert:true },
    renderPending: false,
    hasNuclideDataset: false, theoreticalGenerated: false, activeRangeThumb: null
  };

  function init() {
    setupModes();
    setupEvents();
    setupTooltips();
    resize();
    loadNuclidesFromDefault();
    requestAnimationFrame(atomLoop);
  }

  function setupModes() {
    for (const [key] of [...NUCLEAR_MODES, ...CHEM_CLASS_MODES]) state.filters[key] = new Set();
    renderModeButtons();
  }

  function setupEvents() {
    window.addEventListener('resize', () => { resize(); fitToEvaluated(true); });
    canvas.addEventListener('wheel', onWheel, { passive:false });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('dblclick', e => { const n = pickNuclideAt(e.clientX, e.clientY); if (n) centerOn(n); });
    canvas.addEventListener('click', e => { const n = pickNuclideAt(e.clientX, e.clientY); if (n) openDetail(n); else closeDetail(); });
    atomCanvas.addEventListener('click', () => { state.atomPaused = !state.atomPaused; });
    document.getElementById('zoomIn').addEventListener('click', () => zoomAt(innerWidth/2, innerHeight/2, 1.22));
    document.getElementById('zoomOut').addEventListener('click', () => zoomAt(innerWidth/2, innerHeight/2, 1/1.22));
    els.themeButton.addEventListener('click', () => { document.body.classList.toggle('dark'); const icon=document.getElementById('themeIcon'); if(icon) icon.className = document.body.classList.contains('dark') ? 'theme-icon sun-icon' : 'theme-icon moon-icon'; render(); });
    els.searchButton.addEventListener('click', () => togglePopover('searchPopover'));
    els.dataButton.addEventListener('click', () => togglePopover('dataPopover'));
    els.layersButton.addEventListener('click', () => togglePopover('layersPopover'));
    document.querySelectorAll('.popover, .top-tools, .range-control').forEach(el => el.addEventListener('click', e => e.stopPropagation()));
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); closePopover(b.dataset.close); }));
    document.getElementById('csvInput').addEventListener('change', e => { const file = e.target.files?.[0]; if (file) loadNuclidesFromFile(file); });
    document.getElementById('reloadButton').addEventListener('click', loadNuclidesFromDefault);
    document.getElementById('iaeaButton')?.addEventListener('click', loadNuclidesFromIAEA);
    document.getElementById('exportMergedButton')?.addEventListener('click', exportMergedCsv);
    document.getElementById('resetFiltersButton').addEventListener('click', resetFilters);
    els.searchInput.addEventListener('input', () => renderSearchResults(els.searchInput.value));
    document.querySelectorAll('.tab-button').forEach(b => b.addEventListener('click', () => selectTab(b.dataset.tab)));
    document.querySelectorAll('.layer-toggle').forEach(b => b.addEventListener('click', (event) => { event.stopPropagation(); const k=b.dataset.layer; state.layers[k]=!state.layers[k]; b.classList.toggle('active', state.layers[k]); els.miniMap.classList.toggle('hidden', !state.layers.minimap); render(); }));
    [els.rangeMin, els.rangeMax].forEach(i => i.addEventListener('input', onRangeInput));
    setupDualRangeDrag();
    document.addEventListener('click', e => {
      const path = e.composedPath ? e.composedPath() : [];
      const insideFloatingUi = path.some(node => node?.classList && (node.classList.contains('popover') || node.classList.contains('top-tools') || node.classList.contains('range-control')));
      if (!insideFloatingUi) closeAllPopovers(false);
    });
  }

  function setupTooltips() {
    let target = null;
    const hide = () => { target = null; els.uiTooltip.classList.remove('visible'); els.uiTooltip.setAttribute('aria-hidden', 'true'); };
    const show = (el, x, y) => { const t = el?.dataset?.tip; if (!t) return; target = el; els.uiTooltip.textContent = t; els.uiTooltip.setAttribute('aria-hidden','false'); els.uiTooltip.classList.add('visible'); positionTooltip(x,y); };
    document.addEventListener('pointerover', e => { const t = e.target.closest('[data-tip]'); if (t) show(t, e.clientX, e.clientY); });
    document.addEventListener('pointermove', e => { if (target) positionTooltip(e.clientX, e.clientY); });
    document.addEventListener('pointerout', e => { if (target && !e.relatedTarget?.closest?.('[data-tip]')) hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAllPopovers(); hide(); closeDetail(); } });
  }
  function positionTooltip(x,y) { const r = els.uiTooltip.getBoundingClientRect(); let left=x+14, top=y+14; if (left+r.width+12>innerWidth) left=x-r.width-14; if (top+r.height+12>innerHeight) top=y-r.height-14; els.uiTooltip.style.left=Math.max(12,left)+'px'; els.uiTooltip.style.top=Math.max(12,top)+'px'; }

  async function loadNuclidesFromDefault() {
    els.loadStatus.textContent = 'Leyendo nuclides.csv…';
    try {
      const res = await fetch('nuclides.csv', { cache:'no-store' });
      if (!res.ok) throw new Error('No encontrado');
      const text = await res.text();
      setNuclides(parseNuclideCsv(text), 'nuclides.csv');
      return;
    } catch (err) {
      if (window.EMBEDDED_NUCLIDES_CSV && String(window.EMBEDDED_NUCLIDES_CSV).trim()) {
        setNuclides(parseNuclideCsv(window.EMBEDDED_NUCLIDES_CSV), 'nuclides-data.js integrado');
        return;
      }
      els.loadStatus.textContent = 'No se encontró nuclides.csv local. Intentando cargar automáticamente IAEA LiveChart…';
      try {
        await loadNuclidesFromIAEA(true);
        return;
      } catch (_) {
        state.all = [];
        state.hasNuclideDataset = false;
        rebuildIndexes(); computeRanges(); initFilterSets(); ensureNuclearFilterCompleteness(); updateBounds(); renderModeButtons(); renderLegend(); fitToEvaluated(true); renderStats('sin CSV de nucleidos');
        els.loadStatus.textContent = 'No se encontró un CSV de nucleidos integrado ni local, y la descarga IAEA no fue posible en este navegador. Importa nuclides.csv desde Datos → CSV local. La tabla periódica queda como capa auxiliar y no sustituye a los nucleidos.';
        render();
      }
    }
  }

  async function loadNuclidesFromIAEA(silentFail = false) {
    els.loadStatus.textContent = 'Descargando nucleidos desde IAEA LiveChart…';
    try {
      const res = await fetch(IAEA_GROUND_STATES_URL, { cache:'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseNuclideCsv(text);
      if (!rows.length) throw new Error('La respuesta no contiene nucleidos reconocibles');
      setNuclides(rows, 'IAEA LiveChart online');
    } catch (err) {
      if (silentFail) throw err;
      els.loadStatus.textContent = 'No se pudo descargar desde IAEA LiveChart. Puede ser un bloqueo CORS/red. Usa el CSV local nuclides.csv o impórtalo manualmente.';
      console.warn(err);
    }
  }

  async function loadNuclidesFromFile(file) { const text = await file.text(); setNuclides(parseNuclideCsv(text), file.name); }

  function setNuclides(rows, source) {
    const valid = rows.filter(n => Number.isFinite(n.z) && Number.isFinite(n.n) && n.z > 0 && n.n >= 0);
    for (const n of valid) enrichNuclide(n, source);
    const withTheoretical = valid.concat(generateTheoreticalNuclides(valid));
    state.hasNuclideDataset = valid.length > 0 && source !== 'respaldo químico integrado';
    state.all = withTheoretical;
    rebuildIndexes();
    computeRanges();
    initFilterSets();
    updateBounds();
    renderModeButtons();
    renderLegend();
    fitToEvaluated(true);
    renderStats(source);
    if (!els.loadStatus.textContent.includes('No se pudo')) els.loadStatus.textContent = `${valid.length.toLocaleString('es-ES')} nucleidos evaluados cargados desde ${source}. Se añadió una capa teórica opcional desactivada por defecto; ${ELEMENTS.length} elementos químicos enlazados por Z.`;
  }

  function parseNuclideCsv(text) {
    const rows = parseCsv(text);
    return rows.map(row => {
      const nrow = normaliseRow(row);
      const z = numberValue(pick(nrow, ['z','protons','proton_number','atomic_number','nprotons','z_protons']));
      let nn = numberValue(pick(nrow, ['n','neutrons','neutron_number','nneutrons','n_neutrons']));
      let a = numberValue(pick(nrow, ['a','mass_number','mass_number_a','atomic_mass_number']));
      const symbolRaw = pick(nrow, ['symbol','element','el','name']) || '';
      let symbol = String(symbolRaw).replace(/[^A-Za-z]/g,'');
      if (!symbol && z) symbol = ELEMENT_BY_Z.get(z)?.symbol || '';
      if (!Number.isFinite(nn) && Number.isFinite(a) && Number.isFinite(z)) nn = a - z;
      if (!Number.isFinite(a) && Number.isFinite(nn) && Number.isFinite(z)) a = z + nn;
      const halfText = pick(nrow, ['half_life','halflife','t12','t_1_2','half_life_sec','half_life_seconds']) || '';
      const halfUnit = pick(nrow, ['unit_hl','operator_hl','half_life_unit','unit','hl_unit']) || '';
      const decayText = [
        pick(nrow, ['decay','decay_1','decay_mode','decaymode','mode','decay_modes','decaymode_1']),
        pick(nrow, ['decay_2','decaymode_2']),
        pick(nrow, ['decay_3','decaymode_3'])
      ].filter(Boolean).join(' ');
      const halfSeconds = halfLifeToSeconds(halfText, halfUnit);
      return {
        z, n: nn, a, symbol, raw: row,
        half_life: halfText, half_life_unit: halfUnit, half_life_sec: halfSeconds,
        decay: classifyDecay(decayText, halfText),
        stability: classifyStability(decayText, halfText, halfSeconds),
        abundance: pick(nrow, ['abundance','isotopic_abundance','abund','natural_abundance']) || '',
        atomic_mass: pick(nrow, ['atomic_mass','mass','mass_excess','massexcess','isotopic_mass']) || '',
        qalpha: numberValue(pick(nrow, ['qalpha','q_alpha','qa'])),
        qbeta: numberValue(pick(nrow, ['qbeta','q_beta','qbminus','qbm','qbm_n'])),
        spin: pick(nrow, ['jp','jpi','spin','spin_parity']) || '',
        dataClass: detectDataClass(row, nrow)
      };
    }).filter(n => Number.isFinite(n.z) && Number.isFinite(n.n));
  }

  function buildPeriodicFallbackNuclides() {
    return ELEMENTS.filter(e => e.number <= 130).map(e => {
      const z = Number(e.number);
      const a = Math.max(z, Math.round(Number(e.atomic_mass) || z));
      return { z, n: Math.max(0, a - z), a, symbol:e.symbol, raw:e, decay:'unknown', stability:'unknown', abundance:'', atomic_mass:e.atomic_mass, dataClass:'fallback' };
    });
  }

  function enrichNuclide(n, source) {
    const e = ELEMENT_BY_Z.get(n.z) || ELEMENT_BY_SYMBOL.get(String(n.symbol || '').toLowerCase());
    n.element = e || null;
    if (e) { n.symbol = e.symbol; n.elementName = e.name; }
    else n.elementName = n.symbol || `Z ${n.z}`;
    n.key = `${n.symbol || 'Z'+n.z}-${n.a || n.z+n.n}${n.stateId ? '-' + n.stateId : ''}`;
    n.source = source;
    if (n.raw && /m\d|isomer/i.test(JSON.stringify(n.raw))) n.dataClass = 'isomer';
    if (e) {
      n.element_category = e.category || '';
      n.element_block = e.block || '';
      n.element_phase = e.phase || '';
      n.element_group = e.group ?? '';
      n.element_period = e.period ?? '';
      n.element_type = generalType(e.category);
    }
  }

  function rebuildIndexes() {
    state.byCell.clear(); state.byKey.clear();
    for (const n of state.all) {
      const cell = `${n.z}-${n.n}`;
      if (!state.byCell.has(cell)) state.byCell.set(cell, []);
      state.byCell.get(cell).push(n);
      state.byKey.set(n.key.toLowerCase(), n);
    }
    for (const list of state.byCell.values()) list.sort((a,b) => classRank(a)-classRank(b));
  }

  function classRank(n) { return n.dataClass === 'evaluated' ? 0 : n.dataClass === 'isomer' ? 1 : n.dataClass === 'theoretical' ? 2 : 3; }
  function updateBounds() {
    const rows = state.all.filter(n => n.dataClass !== 'theoretical');
    const maxZ = Math.max(DEFAULT_Z_MAX, ...state.all.map(n => n.z || 0));
    const maxN = Math.max(DEFAULT_N_MAX, ...state.all.map(n => n.n || 0));
    state.zMax = Math.ceil(maxZ / 10) * 10;
    state.nMax = Math.ceil(maxN / 10) * 10;
    state.chartW = AXIS*2 + (state.nMax+1)*STEP_X;
    state.chartH = AXIS*2 + (state.zMax+1)*STEP_Y;
    state.evaluatedBounds = boundsForRows(rows.length ? rows : state.all);
  }
  function boundsForRows(rows) {
    if (!rows || !rows.length) return { minZ:1, maxZ:118, minN:0, maxN:180 };
    return { minZ: Math.min(...rows.map(n=>n.z)), maxZ: Math.max(...rows.map(n=>n.z)), minN: Math.min(...rows.map(n=>n.n)), maxN: Math.max(...rows.map(n=>n.n)) };
  }


  function elementRecordForZ(z) {
    return ELEMENT_BY_Z.get(z) || {
      number: z,
      symbol: systematicSymbol(z),
      name: `Elemento ${z}`,
      category: z > 118 ? 'elemento superpesado teórico' : 'unknown',
      block: z > 118 ? 'g' : 'unknown',
      phase: 'Unknown',
      period: '',
      group: '',
      atomic_mass: '',
      summary: 'Elemento no reconocido oficialmente en la tabla periódica actual; se usa solo para extensión visual teórica.',
      shells: []
    };
  }
  function systematicSymbol(z) {
    const roots = ['n','u','b','t','q','p','h','s','o','e'];
    return String(z).split('').map(d => roots[Number(d)] || 'x').join('').replace(/^./, c => c.toUpperCase());
  }

  function generateTheoreticalNuclides(evaluatedRows) {
    const occupied = new Set(evaluatedRows.map(n => `${n.z}-${n.n}`));
    const generated = [];
    for (let z = 1; z <= DEFAULT_Z_MAX; z++) {
      const center = Math.round(z * (1 + 0.0056 * z));
      const width = Math.max(7, Math.round(10 + z * 0.30));
      const minN = Math.max(0, center - width);
      const maxN = Math.min(DEFAULT_N_MAX, center + width + Math.round(z * 0.025));
      const element = elementRecordForZ(z);
      for (let n = minN; n <= maxN; n++) {
        const key = `${z}-${n}`;
        if (occupied.has(key)) continue;
        const decay = estimateTheoreticalDecay(z, n, center);
        const nuc = { z, n, a:z+n, symbol:element.symbol, raw:{ generated:true, z, n, a:z+n }, half_life:'—', half_life_unit:'', half_life_sec:NaN, decay, stability:'unknown', abundance:'', atomic_mass:'', qalpha:NaN, qbeta:NaN, spin:'', dataClass:'theoretical' };
        enrichNuclide(nuc, 'capa teórica generada');
        generated.push(nuc);
      }
    }
    return generated;
  }

  function estimateTheoreticalDecay(z, n, center) {
    if (z > 118) return Math.abs(n - 184) < 14 ? 'sf' : 'alpha';
    if (z > 82) return 'alpha';
    if (n > center + 2) return 'beta-';
    if (n < center - 2) return 'beta+/EC';
    return 'unknown';
  }

  function computeRanges() {
    state.numericRanges = {};
    for (const [key] of NUMERIC_MODES) {
      const vals = state.all
        .filter(n => n.dataClass !== 'theoretical')
        .map(n => getNumericValue(n, key))
        .filter(Number.isFinite);
      if (vals.length) {
        const rawMin = Math.min(...vals), rawMax = Math.max(...vals);
        const span = Math.max(Math.abs(rawMax - rawMin), Math.abs(rawMax) * 0.02, Math.abs(rawMin) * 0.02, 1);
        state.numericRanges[key] = { rawMin, rawMax, min: rawMin - span * 0.12, max: rawMax + span * 0.12 };
      }
    }
  }
  function initFilterSets() {
    for (const [mode] of [...NUCLEAR_MODES, ...CHEM_CLASS_MODES]) {
      state.filters[mode] = new Set([...new Set(state.all.map(n => valueKey(n, mode)).filter(Boolean))]);
    }
    for (const [key] of NUMERIC_MODES) {
      const r = state.numericRanges[key];
      if (r) state.rangeFilters[key] = { min:r.min, max:r.max };
    }
  }

  function ensureNuclearFilterCompleteness() {
    if (!state.filters.decay) state.filters.decay = new Set();
    for (const k of DECAY_ORDER) state.filters.decay.add(k);
    if (!state.filters.quality) state.filters.quality = new Set();
    for (const k of ['evaluated','isomer','theoretical','fallback','unknown']) state.filters.quality.add(k);
  }

  function renderModeButtons() {
    renderButtons(els.nuclearModes, NUCLEAR_MODES, 'nuclear');
    renderButtons(els.chemicalClassModes, CHEM_CLASS_MODES, 'chemical');
    els.numericModes.innerHTML = '';
    for (const [key,label,unit,tip] of NUMERIC_MODES) {
      const available = Boolean(state.numericRanges[key]);
      const b = document.createElement('button');
      b.className = `mode-button${state.mode===key?' active':''}${available?'':' disabled'}`;
      b.type = 'button'; b.dataset.tip = available ? tip : `${label}: no hay valores en los datos cargados.`;
      b.innerHTML = `${label}<small>${unit}</small>`;
      if (available) b.addEventListener('click', () => selectMode(key, 'numeric'));
      els.numericModes.appendChild(b);
    }
  }
  function renderButtons(container, modes, type) {
    container.innerHTML = '';
    for (const [key,label,sub,tip] of modes) {
      const b = document.createElement('button'); b.className = `mode-button${state.mode===key?' active':''}`; b.type='button'; b.dataset.tip=tip;
      b.innerHTML = `${label}<small>${sub}</small>`; b.addEventListener('click', () => selectMode(key, type)); container.appendChild(b);
    }
  }
  function selectMode(key, type) { state.mode = key; state.modeType = type; renderModeButtons(); renderLegend(); updateRangeControl(); render(); }

  function legendKeysForMode(mode) {
    const found = new Set(state.all.map(n => valueKey(n, mode)).filter(Boolean));
    if (mode === 'decay') return DECAY_ORDER.filter(k => found.has(k) || state.filters.decay?.has(k));
    if (mode === 'quality') return ['evaluated','isomer','theoretical','fallback','unknown'].filter(k => found.has(k) || state.filters.quality?.has(k));
    return [...found].sort((a,b)=>String(a).localeCompare(String(b),'es'));
  }

  function renderLegend() {
    els.legend.innerHTML = '';
    if (state.modeType === 'numeric') {
      const r = state.numericRanges[state.mode]; const f = state.rangeFilters[state.mode];
      const label = NUMERIC_MODES.find(x=>x[0]===state.mode)?.[1] || state.mode;
      els.legend.innerHTML = `<span class="legend-note">${label}: ${formatNumber(f?.min ?? r?.min)} – ${formatNumber(f?.max ?? r?.max)}. Las celdas fuera del rango quedan ocultas.</span>`;
      return updateRangeControl();
    }
    els.rangeControl.classList.add('hidden');
    const active = state.filters[state.mode] || new Set();
    const keys = legendKeysForMode(state.mode);
    for (const k of keys) {
      const chip = document.createElement('button'); chip.type='button'; chip.className = `legend-chip${active.has(k)?'':' off'}`;
      chip.dataset.tip = `Muestra u oculta “${labelForKey(state.mode,k)}” dentro del modo ${labelForMode(state.mode)}.`;
      chip.innerHTML = `<span class="swatch" style="background:${colorForKey(state.mode,k)}"></span><span>${labelForKey(state.mode,k)}</span>`;
      chip.addEventListener('click', () => { if (active.has(k) && active.size > 1) active.delete(k); else active.add(k); renderLegend(); render(); });
      els.legend.appendChild(chip);
    }
  }
  function updateRangeControl() {
    if (state.modeType !== 'numeric' || !state.numericRanges[state.mode]) return els.rangeControl.classList.add('hidden');
    const def = NUMERIC_MODES.find(x=>x[0]===state.mode); const r = state.numericRanges[state.mode]; const f = state.rangeFilters[state.mode] || { min:r.min, max:r.max };
    els.rangeControl.classList.remove('hidden'); els.rangeLabel.textContent = def[1]; els.rangeUnit.textContent = def[2];
    els.rangeMin.min = els.rangeMax.min = 0;
    els.rangeMin.max = els.rangeMax.max = 1000;
    const minPct = clamp(valueToPct(f.min, r), 0, 1000), maxPct = clamp(valueToPct(f.max, r), 0, 1000);
    els.rangeMin.value = minPct; els.rangeMax.value = maxPct; updateRangeTexts();
  }
  function onRangeInput() {
    const r = state.numericRanges[state.mode]; if (!r) return;
    let a = Number(els.rangeMin.value), b = Number(els.rangeMax.value);
    if (a > b) [a,b]=[b,a];
    state.rangeFilters[state.mode] = { min:pctToValue(a,r), max:pctToValue(b,r) };
    updateRangeTexts();
    renderLegend();
    render();
  }

  function setupDualRangeDrag() {
    const rail = els.dualRange;
    if (!rail) return;
    rail.addEventListener('pointerdown', e => {
      if (state.modeType !== 'numeric' || !state.numericRanges[state.mode]) return;
      e.preventDefault();
      rail.setPointerCapture(e.pointerId);
      const pct = pointerToRangePct(e);
      const minPct = Number(els.rangeMin.value);
      const maxPct = Number(els.rangeMax.value);
      state.activeRangeThumb = Math.abs(pct - minPct) <= Math.abs(pct - maxPct) ? 'min' : 'max';
      setActiveRangeThumb(pct);
    });
    rail.addEventListener('pointermove', e => {
      if (!state.activeRangeThumb) return;
      e.preventDefault();
      setActiveRangeThumb(pointerToRangePct(e));
    });
    const stop = () => { state.activeRangeThumb = null; };
    rail.addEventListener('pointerup', stop);
    rail.addEventListener('pointercancel', stop);
  }

  function pointerToRangePct(e) {
    const rect = els.dualRange.getBoundingClientRect();
    return clamp(((e.clientX - rect.left) / Math.max(1, rect.width)) * 1000, 0, 1000);
  }

  function setActiveRangeThumb(pct) {
    const otherMin = Number(els.rangeMin.value);
    const otherMax = Number(els.rangeMax.value);
    if (state.activeRangeThumb === 'min') {
      els.rangeMin.value = clamp(pct, 0, otherMax);
    } else {
      els.rangeMax.value = clamp(pct, otherMin, 1000);
    }
    onRangeInput();
  }

  function updateRangeTexts() {
    const r = state.numericRanges[state.mode], f = state.rangeFilters[state.mode]; if (!r || !f) return;
    const p1 = valueToPct(f.min,r), p2 = valueToPct(f.max,r);
    els.rangeMinText.textContent = formatNumber(f.min); els.rangeMaxText.textContent = formatNumber(f.max);
    els.rangeFill.style.left = `${clamp(Math.min(p1,p2)/10, 0, 100)}%`; els.rangeFill.style.right = `${clamp(100 - Math.max(p1,p2)/10, 0, 100)}%`;
  }

  function resize() { const dpr = Math.max(1, Math.min(2, devicePixelRatio || 1)); canvas.width = Math.floor(innerWidth*dpr); canvas.height = Math.floor(innerHeight*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); render(); }
  function fitToEvaluated(force=false) {
    const pad = 64; const r = worldRectForBounds(state.evaluatedBounds || {minZ:1,maxZ:118,minN:0,maxN:180}, 32);
    const full = Math.min((innerWidth-pad*2)/state.chartW, (innerHeight-pad*2)/state.chartH);
    const fit = Math.min((innerWidth-pad*2)/(r.x2-r.x1), (innerHeight-pad*2)/(r.y2-r.y1));
    state.fullFitScale = full; state.fitScale = fit;
    if (force || !state.scale) state.scale = fit;
    state.tx = (innerWidth - (r.x2-r.x1)*state.scale)/2 - r.x1*state.scale;
    state.ty = (innerHeight - (r.y2-r.y1)*state.scale)/2 - r.y1*state.scale;
    updateZoom(); render();
  }
  function worldRectForBounds(b, margin=0) { return { x1:AXIS+b.minN*STEP_X-margin, x2:AXIS+(b.maxN+1)*STEP_X+margin, y1:AXIS+(state.zMax-b.maxZ)*STEP_Y-margin, y2:AXIS+(state.zMax-b.minZ+1)*STEP_Y+margin }; }
  function wx(sx) { return (sx - state.tx) / state.scale; } function wy(sy) { return (sy - state.ty) / state.scale; } function sx(x) { return x * state.scale + state.tx; } function sy(y) { return y * state.scale + state.ty; }
  function updateZoom() { clampTransform(); els.zoomValue.textContent = `${Math.round(state.scale / state.fitScale * 100)}%`; }
  function clampTransform() { const margin = 160; const minTx = innerWidth - state.chartW*state.scale - margin; const maxTx = margin; const minTy = innerHeight - state.chartH*state.scale - margin; const maxTy = margin; state.tx = Math.min(maxTx, Math.max(minTx, state.tx)); state.ty = Math.min(maxTy, Math.max(minTy, state.ty)); }
  function onWheel(e) { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0012)); }
  function zoomAt(px, py, factor) { const old=state.scale; const max=state.fitScale*18; const next=Math.max(state.fullFitScale, Math.min(max, old*factor)); const x=wx(px), y=wy(py); state.scale=next; state.tx=px-x*next; state.ty=py-y*next; updateZoom(); render(); }
  const pointers = new Map();
  function onPointerDown(e) { canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, {x:e.clientX,y:e.clientY}); if (pointers.size === 1) { state.dragging=true; state.lastPointer={x:e.clientX,y:e.clientY}; } if (pointers.size === 2) { const [a,b]=[...pointers.values()]; state.pinch={dist:dist(a,b), scale:state.scale, cx:(a.x+b.x)/2, cy:(a.y+b.y)/2}; } }
  function onPointerMove(e) { if (!pointers.has(e.pointerId)) return; pointers.set(e.pointerId, {x:e.clientX,y:e.clientY}); if (pointers.size === 2 && state.pinch) { const [a,b]=[...pointers.values()]; const d=dist(a,b); zoomAt((a.x+b.x)/2, (a.y+b.y)/2, d / state.pinch.dist); state.pinch.dist=d; } else if (state.dragging && state.lastPointer) { state.tx += e.clientX - state.lastPointer.x; state.ty += e.clientY - state.lastPointer.y; state.lastPointer={x:e.clientX,y:e.clientY}; updateZoom(); render(); } }
  function onPointerUp(e) { pointers.delete(e.pointerId); if (!pointers.size) { state.dragging=false; state.pinch=null; state.lastPointer=null; } }
  function dist(a,b) { return Math.hypot(a.x-b.x, a.y-b.y); }

  function render() { if (state.renderPending) return; state.renderPending = true; requestAnimationFrame(draw); }
  function draw() {
    state.renderPending = false; ctx.save(); ctx.setTransform(devicePixelRatio||1,0,0,devicePixelRatio||1,0,0);
    const dark = document.body.classList.contains('dark'); ctx.fillStyle = dark ? '#121318' : '#f3efe8'; ctx.fillRect(0,0,innerWidth,innerHeight);
    if (!state.all.length) { drawEmptyState(); ctx.restore(); return; }
    if (state.layers.grid) drawGrid();
    drawCells();
    if (state.layers.frontier) drawFrontier();
    if (state.layers.magic) drawMagicLines();
    drawAxes(); drawMinimap(); ctx.restore();
  }

  function drawEmptyState() {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.88)' : 'rgba(34,32,28,.82)';
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillText('Falta el CSV de nucleidos', innerWidth/2, innerHeight/2 - 30);
    ctx.font = '700 14px system-ui, sans-serif';
    ctx.fillStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.62)' : 'rgba(34,32,28,.58)';
    ctx.fillText('Coloca nuclides.csv junto a index.html, impórtalo desde Datos o usa IAEA online.', innerWidth/2, innerHeight/2 + 2);
    ctx.fillText('Los datos químicos ya están cargados y se fusionarán por Z con cada isótopo.', innerWidth/2, innerHeight/2 + 26);
    ctx.restore();
  }

  function visibleWorld() { return { x1:wx(0)-80, x2:wx(innerWidth)+80, y1:wy(0)-80, y2:wy(innerHeight)+80 }; }
  function drawGrid() { const v=visibleWorld(); ctx.save(); ctx.strokeStyle=document.body.classList.contains('dark')?'rgba(255,255,255,.055)':'rgba(0,0,0,.055)'; ctx.lineWidth=1; ctx.beginPath(); const n0=Math.max(0,Math.floor((v.x1-AXIS)/STEP_X)-1), n1=Math.min(state.nMax,Math.ceil((v.x2-AXIS)/STEP_X)+1); const z0=Math.max(1,state.zMax-Math.ceil((v.y2-AXIS)/STEP_Y)-1), z1=Math.min(state.zMax,state.zMax-Math.floor((v.y1-AXIS)/STEP_Y)+1); for(let n=n0;n<=n1;n++){ const x=sx(AXIS+n*STEP_X+STEP_X/2); ctx.moveTo(x,0); ctx.lineTo(x,innerHeight); } for(let z=z0;z<=z1;z++){ const y=sy(AXIS+(state.zMax-z)*STEP_Y+STEP_Y/2); ctx.moveTo(0,y); ctx.lineTo(innerWidth,y); } ctx.stroke(); ctx.restore(); }
  function drawMagicLines() { ctx.save(); ctx.strokeStyle=document.body.classList.contains('dark')?'rgba(255,107,117,.62)':'rgba(158,42,47,.55)'; ctx.lineWidth=1.5; ctx.setLineDash([7,7]); for(const N of MAGIC_NUMBERS){ if(N>state.nMax) continue; const x=sx(AXIS+N*STEP_X+STEP_X/2); ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,innerHeight); ctx.stroke(); } for(const Z of MAGIC_NUMBERS){ if(Z>state.zMax) continue; const y=sy(AXIS+(state.zMax-Z)*STEP_Y+STEP_Y/2); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(innerWidth,y); ctx.stroke(); } ctx.restore(); }
  function drawFrontier() {
    ctx.save();
    ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,118,128,.78)' : 'rgba(148,38,45,.72)';
    ctx.lineWidth = 2.1;
    ctx.setLineDash([8, 7]);
    drawFrontierCurve(-1);
    drawFrontierCurve(1);
    ctx.restore();
  }
  function drawFrontierCurve(side) {
    ctx.beginPath();
    let started = false;
    for (let z = 1; z <= Math.min(130, state.zMax); z++) {
      const center = Math.round(z * (1 + 0.0056 * z));
      const width = Math.max(7, Math.round(10 + z * 0.30));
      const n = clamp(center + side * width, 0, state.nMax);
      const x = sx(AXIS + n * STEP_X + STEP_X/2);
      const y = sy(AXIS + (state.zMax-z) * STEP_Y + STEP_Y/2);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  function drawCells() {
    const v=visibleWorld(); const n0=Math.max(0,Math.floor((v.x1-AXIS)/STEP_X)-1), n1=Math.min(state.nMax,Math.ceil((v.x2-AXIS)/STEP_X)+1); const z0=Math.max(1,state.zMax-Math.ceil((v.y2-AXIS)/STEP_Y)-1), z1=Math.min(state.zMax,state.zMax-Math.floor((v.y1-AXIS)/STEP_Y)+1);
    for(let z=z0; z<=z1; z++) for(let n=n0; n<=n1; n++) { const list=state.byCell.get(`${z}-${n}`); if(!list) continue; for(const nuc of list) if(isRenderable(nuc)) drawCell(nuc); }
  }
  function drawCell(nuc) { const x=sx(AXIS+nuc.n*STEP_X+(STEP_X-CELL_W)/2), y=sy(AXIS+(state.zMax-nuc.z)*STEP_Y+(STEP_Y-CELL_H)/2), w=CELL_W*state.scale, h=CELL_H*state.scale; const color=colorForNuclide(nuc); ctx.save(); roundRect(ctx,x,y,w,h,Math.max(4,7*state.scale)); ctx.fillStyle=color; ctx.fill(); ctx.lineWidth=Math.max(.7,state.scale*.9); ctx.strokeStyle='rgba(0,0,0,.16)'; ctx.stroke(); if(state.selected===nuc){ ctx.lineWidth=Math.max(2,2.2*state.scale); ctx.strokeStyle='#222'; ctx.stroke(); }
    if(state.scale>0.45){ ctx.fillStyle=readableTextColor(color); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=`900 ${Math.max(8,12*state.scale)}px system-ui`; ctx.fillText(nuc.symbol || '?', x+w/2, y+h*.50); if(state.scale>0.80){ ctx.font=`800 ${Math.max(6,8*state.scale)}px system-ui`; ctx.fillText(String(nuc.a||nuc.z+nuc.n), x+w/2, y+h*.24); ctx.fillText(`Z${nuc.z}`, x+w/2, y+h*.76); } }
    ctx.restore(); }
  function drawAxes(){ ctx.save(); ctx.font='900 12px system-ui'; ctx.textBaseline='middle'; const magic=state.layers.magic; ctx.textAlign='center'; for(let N=0;N<=state.nMax;N+=10) axisText(String(N), sx(AXIS+N*STEP_X+STEP_X/2), clamp(sy(AXIS-28),22,innerHeight-22), magic&&MAGIC_NUMBERS.includes(N)); if(magic) for(const N of MAGIC_NUMBERS) if(N<=state.nMax && N%10!==0) axisText(String(N), sx(AXIS+N*STEP_X+STEP_X/2), clamp(sy(AXIS-28),22,innerHeight-22), true); ctx.textAlign='right'; for(let Z=10;Z<=state.zMax;Z+=10) axisText(String(Z), clamp(sx(AXIS-18),28,innerWidth-28), sy(AXIS+(state.zMax-Z)*STEP_Y+STEP_Y/2), magic&&MAGIC_NUMBERS.includes(Z)); if(magic) for(const Z of MAGIC_NUMBERS) if(Z<=state.zMax && Z%10!==0) axisText(String(Z), clamp(sx(AXIS-18),28,innerWidth-28), sy(AXIS+(state.zMax-Z)*STEP_Y+STEP_Y/2), true); ctx.textAlign='left'; axisText('N →', clamp(sx(AXIS),30,innerWidth-30), clamp(sy(AXIS-54),22,innerHeight-22)); axisText('Z ↑', clamp(sx(AXIS-48),30,innerWidth-30), clamp(sy(AXIS-20),54,innerHeight-22)); ctx.restore(); }
  function axisText(t,x,y,isMagic=false){ ctx.save(); ctx.fillStyle=isMagic?getCss('--magic'):(document.body.classList.contains('dark')?'rgba(255,255,255,.92)':'rgba(34,32,28,.82)'); if(isMagic){ctx.shadowColor=getCss('--magic');ctx.shadowBlur=4;} ctx.fillText(t,x,y); ctx.restore(); }
  function drawMinimap(){
    if(!state.layers.minimap) return els.miniMap.classList.add('hidden');
    els.miniMap.classList.remove('hidden');
    const w=230,h=136,p=10; const bg=document.body.classList.contains('dark')?'#20232d':'#fffaf2';
    const sxm=(w-p*2)/Math.max(1,state.chartW), sym=(h-p*2)/Math.max(1,state.chartH);
    const maxDots = 1800;
    const step = Math.max(1, Math.ceil(state.all.length / maxDots));
    const dots=[];
    for(let i=0;i<state.all.length;i+=step){ const n=state.all[i]; if(!isRenderable(n)) continue; const x=p+(AXIS+n.n*STEP_X)*sxm; const y=p+(AXIS+(state.zMax-n.z)*STEP_Y)*sym; const col=colorForNuclide(n); dots.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="1.8" height="1.8" fill="${col}" opacity=".85"/>`); }
    const vx=clamp((-state.tx/state.scale)*sxm+p,p,w-p), vy=clamp((-state.ty/state.scale)*sym+p,p,h-p);
    const vw=Math.max(8, innerWidth/state.scale*sxm), vh=Math.max(6, innerHeight/state.scale*sym);
    els.miniMap.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect x="0" y="0" width="${w}" height="${h}" rx="18" fill="${bg}"/><g>${dots.join('')}</g><rect x="${vx}" y="${vy}" width="${Math.min(vw,w-p-vx)}" height="${Math.min(vh,h-p-vy)}" rx="3" fill="rgba(93,90,246,.24)" stroke="rgba(93,90,246,.95)"/></svg>`;
  }

  function isRenderable(n) {
    if (n.dataClass === 'theoretical' && !state.layers.theoretical) return false; if (n.dataClass === 'isomer' && !state.layers.isomer) return false; if (n.dataClass !== 'theoretical' && n.dataClass !== 'isomer' && !state.layers.evaluated) return false;
    if (state.modeType === 'numeric') { const v=getNumericValue(n,state.mode), f=state.rangeFilters[state.mode]; return Number.isFinite(v) && (!f || (v >= f.min - 1e-9 && v <= f.max + 1e-9)); }
    const set = state.filters[state.mode]; return !set || set.has(valueKey(n,state.mode));
  }
  function colorForNuclide(n) { if (state.modeType === 'numeric') return gradientColor(getNumericValue(n,state.mode), state.numericRanges[state.mode]); const key=valueKey(n,state.mode); return colorForKey(state.mode,key); }
  function valueKey(n, mode) {
    if (mode==='decay') return n.decay || 'unknown'; if (mode==='stability') return n.stability || 'unknown'; if (mode==='halflife') return halfBucket(n); if (mode==='quality') return n.dataClass || 'evaluated'; if (mode==='abundance') return n.abundance ? 'natural' : 'none'; if (mode==='qalpha') return qBucket(n.qalpha); if (mode==='qbeta') return qBucket(n.qbeta);
    const e=n.element||{}; if(mode==='element_category') return e.category || 'unknown'; if(mode==='element_block') return e.block || 'unknown'; if(mode==='element_phase') return e.phase || 'Unknown'; if(mode==='element_group') return e.group ? `Grupo ${e.group}`:'unknown'; if(mode==='element_period') return e.period ? `Periodo ${e.period}`:'unknown'; if(mode==='element_type') return generalType(e.category); return 'unknown';
  }
  function colorForKey(mode,key){ if(mode==='decay') return DECAY_COLORS[key]||DECAY_COLORS.unknown; if(mode==='stability') return key==='stable'?'#61b37b':key==='radioactive'?'#d66b5d':'#aaa39b'; if(mode==='halflife') return ({stable:'#61b37b',long:'#6ea7f4',medium:'#d0a34e',short:'#d66b5d',unknown:'#aaa39b'})[key]||'#aaa39b'; if(mode==='quality') return QUALITY_COLORS[key]||QUALITY_COLORS.unknown; if(mode==='abundance') return key==='natural'?'#61b37b':'#aaa39b'; if(mode==='qalpha'||mode==='qbeta') return key==='positive'?'#d66b5d':key==='negative'?'#6ea7f4':key==='zero'?'#d0a34e':'#aaa39b'; if(mode==='element_phase') return PHASE_COLORS[key]||PHASE_COLORS.Unknown; if(mode==='element_block') return BLOCK_COLORS[key]||BLOCK_COLORS.unknown; if(mode==='element_type') return TYPE_COLORS[key]||TYPE_COLORS.unknown; return palette(key); }
  function labelForKey(mode,key){
    const maps={ stable:'Estable', radioactive:'Radiactivo', unknown:'Sin dato', natural:'Natural', none:'Sin abundancia', long:'Vida larga', medium:'Vida media', short:'Vida corta', positive:'Positivo', negative:'Negativo', zero:'Cero', evaluated:'Evaluado', isomer:'Isómero', theoretical:'Teórico', fallback:'Respaldo', alpha:'Alfa', 'beta-':'β−', 'beta+/EC':'β+/EC', sf:'Fisión espontánea', p:'Protón', n:'Neutrón', it:'Transición isomérica', cluster:'Clúster' };
    return maps[key] || String(key).replace(/\w/g,m=>m.toUpperCase());
  }
  function labelForMode(mode){ return [...NUCLEAR_MODES,...CHEM_CLASS_MODES,...NUMERIC_MODES].find(x=>x[0]===mode)?.[1] || mode; }
  function getNumericValue(n, key) {
    const e=n.element || {};
    if(key==='first_ionization') return Array.isArray(e.ionization_energies)?numberValue(e.ionization_energies[0]):NaN;
    if(key==='atomic_mass') return numberValue(e.atomic_mass ?? n.atomic_mass);
    if(key==='atomic_radius') return numberValue(e.atomic_radius ?? e.atomic_radius_pm ?? e.covalent_radius ?? estimateAtomicRadius(e));
    return numberValue(e[key]);
  }

  function pickNuclideAt(px,py){ const x=wx(px), y=wy(py); const n=Math.floor((x-AXIS)/STEP_X), row=Math.floor((y-AXIS)/STEP_Y); const z=state.zMax-row; const list=state.byCell.get(`${z}-${n}`); return list?.find(isRenderable) || null; }
  function centerOn(n){ const x=AXIS+n.n*STEP_X+STEP_X/2, y=AXIS+(state.zMax-n.z)*STEP_Y+STEP_Y/2; state.tx=innerWidth/2-x*state.scale; state.ty=innerHeight/2-y*state.scale; updateZoom(); render(); }
  function openDetail(n){ state.selected=n; document.getElementById('detailA').textContent=n.a||n.z+n.n; document.getElementById('detailZ').textContent=`Z${n.z}`; document.getElementById('detailSymbol').textContent=n.symbol; document.getElementById('detailName').textContent=n.elementName; document.getElementById('detailSubtitle').textContent=`N=${n.n} · A=${n.a||n.z+n.n} · ${labelForKey('stability',n.stability)}`; document.getElementById('atomTitle').textContent=`${n.symbol} · ${n.elementName}`; document.getElementById('atomSubtitle').textContent='clic para pausar/reanudar'; document.getElementById('atomMeta').textContent=`${n.z} protones · ${n.n} neutrones · ${n.z} electrones`; renderDetailTabs(n); setAtomModel(n); els.detailCard.classList.add('open'); render(); }
  function closeDetail(){ state.selected=null; els.detailCard.classList.remove('open'); render(); }
  function selectTab(id){ document.querySelectorAll('.tab-button').forEach(b=>b.classList.toggle('active', b.dataset.tab===id)); document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active', p.id===id)); }
  function renderDetailTabs(n){ const e=n.element||{}; setHtml('summaryTab', sheet([['Elemento', `${e.name||n.elementName} (${n.symbol})`],['Z / N / A', `${n.z} / ${n.n} / ${n.a||n.z+n.n}`],['Estado nuclear', labelForKey('stability',n.stability)],['Vida media', formatHalf(n)],['Abundancia', n.abundance || '—'],['Calidad', labelForKey('quality',n.dataClass||'evaluated')]]) + `<p class="info-paragraph">${e.summary || 'Sin resumen químico disponible para este elemento.'}</p>`);
    setHtml('decayTab', sheet([['Modo principal', labelForKey('decay',n.decay)],['Vida media', formatHalf(n)],['Spin/paridad', n.spin || '—'],['Qα', fmtMaybe(n.qalpha)],['Qβ−', fmtMaybe(n.qbeta)],['Números mágicos', [n.z,n.n].filter(v=>MAGIC_NUMBERS.includes(v)).join(', ') || '—'] ]));
    setHtml('chemTab', sheet([['Categoría', e.category || '—'],['Tipo general', generalType(e.category)],['Bloque', e.block || '—'],['Fase', e.phase || '—'],['Grupo / periodo', `${e.group ?? '—'} / ${e.period ?? '—'}`],['Apariencia', e.appearance || '—'],['Electronegatividad', fmtMaybe(e.electronegativity_pauling)],['1ª ionización', fmtMaybe(getNumericValue(n,'first_ionization'))],['Afinidad electrónica', fmtMaybe(e.electron_affinity)],['Densidad', fmtMaybe(e.density)],['Fusión / ebullición', `${fmtMaybe(e.melt)} K / ${fmtMaybe(e.boil)} K`],['Radio atómico', e.atomic_radius ? `${e.atomic_radius} pm` : `${formatNumber(estimateAtomicRadius(e))} pm aprox.`],['Configuración', e.electron_configuration_semantic || e.electron_configuration || '—']]));
    setHtml('massTab', sheet([['Masa isotópica / dato', n.atomic_mass || '—'],['Masa atómica media', e.atomic_mass || '—'],['Calor específico', e.molar_heat ? `${e.molar_heat} J/(mol·K)`:'—'],['Capas electrónicas', Array.isArray(e.shells) ? e.shells.join(' · ') : '—'],['Modelo 3D', e.bohr_model_3d ? 'Disponible' : 'No disponible'],['Imagen Bohr', e.bohr_model_image ? 'Disponible' : 'No disponible'],['Espectro', e.spectral_img ? 'Disponible' : 'No disponible'],['Descubierto por', e.discovered_by || '—'],['Nombrado por', e.named_by || '—']]));
    document.getElementById('rawTab').textContent = JSON.stringify(compactRaw(n), null, 2);
    setHtml('linksTab', `<div class="link-grid">${e.source?`<a href="${e.source}" target="_blank" rel="noreferrer">Wikipedia / fuente del elemento</a>`:''}${e.bohr_model_3d?`<a href="${e.bohr_model_3d}" target="_blank" rel="noreferrer">Modelo 3D del elemento</a>`:''}${e.image?.url?`<a href="${e.image.url}" target="_blank" rel="noreferrer">Imagen del elemento</a>`:''}</div>`);
  }
  function sheet(rows){ return `<div class="info-sheet">${rows.map(([a,b])=>`<div class="info-row"><span>${a}</span><strong>${b}</strong></div>`).join('')}</div>`; } function setHtml(id,html){ document.getElementById(id).innerHTML=html; }
  function compactRaw(n){ return { id:n.key,z:n.z,n:n.n,a:n.a,symbol:n.symbol,decay:n.decay,stability:n.stability,half_life:n.half_life,element:{ name:n.element?.name, category:n.element?.category, block:n.element?.block, phase:n.element?.phase, density:n.element?.density, melt:n.element?.melt, boil:n.element?.boil, electronegativity:n.element?.electronegativity_pauling, first_ionization:Array.isArray(n.element?.ionization_energies)?n.element.ionization_energies[0]:null, electron_affinity:n.element?.electron_affinity, molar_heat:n.element?.molar_heat, bohr_model_3d:n.element?.bohr_model_3d }}; }

  function renderSearchResults(q) { const query=q.trim(); els.searchResults.innerHTML=''; if(!query) return; const matches=state.all.filter(n=>matchesQuery(n, query)).slice(0,80); if(!matches.length){ els.searchResults.innerHTML='<div class="syntax-help">Sin resultados.</div>'; return; } for(const n of matches){ const row=document.createElement('button'); row.type='button'; row.className='result-row'; row.innerHTML=`<strong>${n.symbol}-${n.a||n.z+n.n}</strong><span>${n.elementName}<br>Z=${n.z} · N=${n.n} · ${labelForKey('decay',n.decay)}</span><small>${labelForKey('stability',n.stability)}</small>`; row.addEventListener('click',()=>{centerOn(n);openDetail(n);closePopover('searchPopover');}); els.searchResults.appendChild(row); } }
  function matchesQuery(n,q){ const tokens=q.match(/(?:[^\s"]+|"[^"]*")+/g)||[]; const free=[]; for(const t of tokens){ const m=t.match(/^([a-zA-Z_-]+)(>=|<=|=|>|<)(.+)$/); if(m){ if(!matchExpr(n,m[1].toLowerCase(),m[2],m[3].replace(/"/g,''))) return false; } else free.push(t.replace(/"/g,'').toLowerCase()); } if(!free.length) return true; const e=n.element||{}; const hay=`${n.symbol} ${n.symbol}-${n.a} ${n.a}${n.symbol} ${n.elementName} z${n.z} n${n.n} ${n.decay} ${n.stability} ${e.category||''} ${e.block||''} ${e.phase||''} grupo ${e.group||''} periodo ${e.period||''}`.toLowerCase(); return free.every(t=>hay.includes(t)); }
  function matchExpr(n,field,op,val){
    const f=field.replace(/-/g,'_');
    if(['z','n','a'].includes(f)) return compare(Number(n[f]),op,Number(val));
    if(['symbol','element','decay','category','block','phase','type'].includes(f)){
      const e=n.element||{};
      const actual = f==='element' ? n.elementName : f==='category' ? e.category : f==='block' ? e.block : f==='phase' ? e.phase : f==='type' ? generalType(e.category) : n[f];
      return op==='=' && String(actual||'').toLowerCase().includes(String(val).toLowerCase());
    }
    if(['group','period'].includes(f)) return compare(Number((n.element||{})[f]),op,Number(val));
    const aliases = { electronegativity:'electronegativity_pauling', ionization:'first_ionization', first_ionization:'first_ionization', affinity:'electron_affinity', electron_affinity:'electron_affinity', density:'density', melt:'melt', boil:'boil', atomic_mass:'atomic_mass', molar_heat:'molar_heat' };
    if (aliases[f]) return compare(getNumericValue(n, aliases[f]), op, Number(val));
    if(f==='stable') return (val==='true'||val==='1'||val==='yes') ? n.stability==='stable' : n.stability!=='stable';
    if(f==='half_life'||f==='halflife') return compare(n.half_life_sec,op,halfLifeToSeconds(val,''));
    return true;
  }
  function compare(a,op,b){ if(!Number.isFinite(a)||!Number.isFinite(b)) return false; if(op==='=') return a===b; if(op==='>') return a>b; if(op==='<') return a<b; if(op==='>=') return a>=b; if(op==='<=') return a<=b; return false; }

  function renderStats(source){ const total=state.all.length, stable=state.all.filter(n=>n.stability==='stable').length, elements=new Set(state.all.map(n=>n.z)).size; const maxZ=total?Math.max(...state.all.map(n=>n.z)):'—'; const maxN=total?Math.max(...state.all.map(n=>n.n)):'—'; els.datasetStats.innerHTML=[['Nucleidos',total],['Elementos enlazados',elements],['Estables',stable],['Z máximo',maxZ],['N máximo',maxN],['Fuente',source]].map(([k,v])=>`<div class="stat"><strong>${v}</strong><span>${k}</span></div>`).join(''); }
  function resetFilters(){ selectMode('decay','nuclear'); state.layers.theoretical=false; state.layers.grid=false; state.layers.magic=false; state.layers.frontier=false; state.layers.evaluated=true; state.layers.isomer=true; document.querySelectorAll('.layer-toggle').forEach(b=>b.classList.toggle('active', state.layers[b.dataset.layer])); initFilterSets(); ensureNuclearFilterCompleteness(); renderLegend(); render(); }
  function togglePopover(id){ for(const p of ['searchPopover','dataPopover','layersPopover']) if(p!==id) closePopover(p); document.getElementById(id).classList.toggle('hidden'); }
  function closePopover(id){ document.getElementById(id)?.classList.add('hidden'); } function closeAllPopovers(){ ['searchPopover','dataPopover','layersPopover'].forEach(closePopover); }


  function exportMergedCsv() {
    if (!state.all.length) {
      els.loadStatus.textContent = 'No hay nucleidos cargados para exportar. Primero carga nuclides.csv o IAEA online.';
      return;
    }
    const chemFields = ['element_name','element_category','element_block','element_phase','element_group','element_period','element_type','element_atomic_mass','element_density','element_melt_K','element_boil_K','element_electronegativity_pauling','element_first_ionization_kJ_mol','element_electron_affinity_kJ_mol','element_molar_heat_J_mol_K','element_electron_configuration','element_shells','element_source'];
    const baseFields = ['symbol','Z','N','A','decay','stability','half_life','half_life_unit','abundance','isotopic_mass_or_mass_data','spin_parity','qalpha','qbeta','data_class'];
    const rows = [baseFields.concat(chemFields)];
    for (const n of state.all) {
      const e = n.element || {};
      rows.push([
        n.symbol || '', n.z, n.n, n.a || n.z+n.n, n.decay || '', n.stability || '', n.half_life || '', n.half_life_unit || '', n.abundance || '', n.atomic_mass || '', n.spin || '', numOrBlank(n.qalpha), numOrBlank(n.qbeta), n.dataClass || '',
        e.name || '', e.category || '', e.block || '', e.phase || '', e.group ?? '', e.period ?? '', generalType(e.category), e.atomic_mass ?? '', e.density ?? '', e.melt ?? '', e.boil ?? '', e.electronegativity_pauling ?? '', Array.isArray(e.ionization_energies) ? (e.ionization_energies[0] ?? '') : '', e.electron_affinity ?? '', e.molar_heat ?? '', e.electron_configuration_semantic || e.electron_configuration || '', Array.isArray(e.shells) ? e.shells.join(' ') : '', e.source || ''
      ]);
    }
    const csv = rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nuclides_enriched_with_periodic_table.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    els.loadStatus.textContent = `CSV fusionado exportado: ${state.all.length.toLocaleString('es-ES')} nucleidos con columnas químicas añadidas por Z.`;
  }
  function csvEscape(v) { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s; }
  function numOrBlank(v) { return Number.isFinite(v) ? v : ''; }

  function parseCsv(text){ const rows=[]; let row=[], field='', quote=false; for(let i=0;i<text.length;i++){ const c=text[i], n=text[i+1]; if(c==='"'){ if(quote && n==='"'){ field+='"'; i++; } else quote=!quote; } else if(c===',' && !quote){ row.push(field); field=''; } else if((c==='\n'||c==='\r') && !quote){ if(c==='\r'&&n==='\n') i++; row.push(field); if(row.some(x=>x!=='')) rows.push(row); row=[]; field=''; } else field+=c; } row.push(field); if(row.some(x=>x!=='')) rows.push(row); const headers=(rows.shift()||[]).map(h=>h.trim()); return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??'']))); }
  function normaliseRow(row){ const o={}; for(const [k,v] of Object.entries(row)) o[norm(k)] = v; return o; } function norm(k){ return String(k).toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''); } function pick(o,keys){ for(const k of keys){ const v=o[norm(k)]; if(v!==undefined && v!==null && String(v).trim()!=='') return v; } return ''; }
  function numberValue(v){ if(v===null||v===undefined||v==='') return NaN; if(typeof v==='number') return v; const s=String(v).replace(',','.').match(/[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?/i); return s?Number(s[0]):NaN; }
  function halfLifeToSeconds(text,unit=''){ const s=String(text||'').toLowerCase(); if(/stable|stbl|∞|inf/.test(s)) return Infinity; const val=numberValue(s); if(!Number.isFinite(val)) return NaN; const u=(String(unit||'')+' '+s).toLowerCase(); if(/ms|millisecond/.test(u)) return val/1000; if(/µs|us|micro/.test(u)) return val/1e6; if(/ns|nano/.test(u)) return val/1e9; if(/min/.test(u)) return val*60; if(/h|hour|hora/.test(u)) return val*3600; if(/d|day|día/.test(u)) return val*86400; if(/y|yr|year|año/.test(u)) return val*31557600; return val; }
  function classifyDecay(decay, half){
    const raw = `${decay || ''} ${half || ''}`.toLowerCase();
    const s = raw.replace(/[()\[\],;:]/g, ' ').replace(/\s+/g,' ').trim();
    if(/stable|stbl|∞|inf|estable/.test(s)) return 'stable';
    if(/cluster|\bcl\b/.test(s)) return 'cluster';
    if(/(?:^|\s|[+\-])(?:a|alpha|α)(?:$|\s|[+\-])/.test(s)) return 'alpha';
    if(/2?b\s*-|β\s*-|beta\s*-|beta minus|bm|b-/.test(s)) return 'beta-';
    if(/ec\+?b\+|2?ec|2?b\s*\+|β\s*\+|beta\s*\+|b\+|electron capture|captura/.test(s)) return 'beta+/EC';
    if(/\bsf\b|fission|fis/.test(s)) return 'sf';
    if(/2p|\bp\b|proton/.test(s)) return 'p';
    if(/2n|\bn\b|neutron/.test(s)) return 'n';
    if(/\bit\b|isomer|meta/.test(s)) return 'it';
    return 'unknown';
  }
  function classifyStability(decay,half,sec){ if(classifyDecay(decay,half)==='stable'||sec===Infinity) return 'stable'; if(decay||Number.isFinite(sec)) return 'radioactive'; return 'unknown'; }
  function detectDataClass(row,nrow){ const s=JSON.stringify(row).toLowerCase(); if(/theor|unobserv|predic/.test(s)) return 'theoretical'; if(/isomer|meta|m\d/.test(s)) return 'isomer'; return 'evaluated'; }
  function halfBucket(n){ if(n.stability==='stable'||n.half_life_sec===Infinity) return 'stable'; const s=n.half_life_sec; if(!Number.isFinite(s)) return 'unknown'; if(s>31557600) return 'long'; if(s>3600) return 'medium'; return 'short'; }
  function qBucket(v){ if(!Number.isFinite(v)) return 'unknown'; if(Math.abs(v)<1e-6) return 'zero'; return v>0?'positive':'negative'; }
  function generalType(cat=''){ const s=String(cat).toLowerCase(); if(s.includes('metalloid')) return 'metalloid'; if(s.includes('metal')||s.includes('lanthanide')||s.includes('actinide')) return 'metal'; if(s.includes('nonmetal')||s.includes('gas')||s.includes('halogen')) return 'nonmetal'; return 'unknown'; }
  function estimateAtomicRadius(e={}) {
    const period = numberValue(e.period), group = numberValue(e.group);
    if (!Number.isFinite(period)) return NaN;
    // Estimación visual para activar el filtro cuando el dataset no trae radio atómico real.
    // No debe interpretarse como valor evaluado.
    const g = Number.isFinite(group) ? group : 9;
    const base = 40 + period * 32;
    const contraction = Math.max(0, Math.min(17, g - 1)) * 3.1;
    return Math.max(25, base - contraction + (String(e.block||'') === 'f' ? 18 : 0));
  }
  function valueToPct(v,r){ return r.max===r.min?0:(v-r.min)/(r.max-r.min)*1000; } function pctToValue(p,r){ return r.min+(r.max-r.min)*(p/1000); }
  function palette(key){ let h=0; const s=String(key); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return BASE_PALETTE[h%BASE_PALETTE.length]; }
  function gradientColor(v,r){ if(!r||!Number.isFinite(v)) return '#aaa39b'; const t=clamp((v-r.min)/(r.max-r.min||1),0,1); return `hsl(${220 - 190*t} 72% ${62 - 6*t}%)`; }
  function readableTextColor(hexOrColor){ return '#111'; }
  function roundRect(c,x,y,w,h,r){ const rr=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+rr,y); c.arcTo(x+w,y,x+w,y+h,rr); c.arcTo(x+w,y+h,x,y+h,rr); c.arcTo(x,y+h,x,y,rr); c.arcTo(x,y,x+w,y,rr); c.closePath(); }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); } function formatNumber(v){ return Number.isFinite(v)? new Intl.NumberFormat('es-ES',{maximumFractionDigits:3}).format(v) : '—'; } function fmtMaybe(v){ return Number.isFinite(Number(v))?formatNumber(Number(v)):(v||'—'); } function formatHalf(n){ if(n.stability==='stable') return 'Estable'; if(n.half_life) return `${n.half_life}${n.half_life_unit?' '+n.half_life_unit:''}`; return '—'; } function getCss(name){ return getComputedStyle(document.body).getPropertyValue(name).trim(); }

  function setAtomModel(n) {
    const model = els.atomModel3d;
    const img = document.getElementById('bohrImageFallback');
    const e = n.element || {};
    if (model && e.bohr_model_3d) {
      model.src = e.bohr_model_3d;
      model.alt = `Modelo 3D de ${e.name || n.elementName}`;
      model.classList.remove('hidden');
      if (img) img.classList.add('hidden');
      atomCanvas.classList.add('hidden');
      document.getElementById('atomSubtitle').textContent = 'modelo 3D interactivo del elemento';
      return;
    }
    if (model) model.classList.add('hidden');
    if (img && e.bohr_model_image) {
      img.src = e.bohr_model_image;
      img.alt = `Modelo Bohr de ${e.name || n.elementName}`;
      img.classList.remove('hidden');
      atomCanvas.classList.add('hidden');
      document.getElementById('atomSubtitle').textContent = 'imagen Bohr del elemento';
      return;
    }
    if (img) img.classList.add('hidden');
    atomCanvas.classList.remove('hidden');
    document.getElementById('atomSubtitle').textContent = 'modelo Bohr simplificado · clic para pausar';
  }

  function atomLoop(t){ if(els.detailCard.classList.contains('open') && state.selected && !state.atomPaused && atomCanvas && !atomCanvas.classList.contains('hidden')) drawAtom(t); requestAnimationFrame(atomLoop); }
  function drawAtom(t){ const dpr=Math.max(1,Math.min(2,devicePixelRatio||1)); const w=atomCanvas.clientWidth, h=atomCanvas.clientHeight; atomCanvas.width=w*dpr; atomCanvas.height=h*dpr; atomCtx.setTransform(dpr,0,0,dpr,0,0); atomCtx.clearRect(0,0,w,h); const cx=w/2, cy=h/2, e=state.selected?.element || {}; atomCtx.fillStyle=getCss('--ink'); atomCtx.beginPath(); atomCtx.arc(cx,cy,22,0,Math.PI*2); atomCtx.fill(); const shells=Array.isArray(e.shells)?e.shells:[state.selected.z]; const maxR=Math.min(w,h)*.42; shells.forEach((count,i)=>{ const r=42+i*(maxR-42)/Math.max(1,shells.length-1); atomCtx.strokeStyle='rgba(93,90,246,.36)'; atomCtx.lineWidth=1.5; atomCtx.beginPath(); atomCtx.arc(cx,cy,r,0,Math.PI*2); atomCtx.stroke(); const shown=Math.min(count,16); for(let j=0;j<shown;j++){ const a=(j/shown)*Math.PI*2 + t*.0005*(i+1); atomCtx.fillStyle='#5d5af6'; atomCtx.beginPath(); atomCtx.arc(cx+Math.cos(a)*r, cy+Math.sin(a)*r, 4, 0, Math.PI*2); atomCtx.fill(); }}); }

  init();
})();
