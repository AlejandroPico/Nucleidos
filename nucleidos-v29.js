(() => {
  'use strict';

  const PATCH_VERSION = '29.0.0';
  const API_URLS = [
    'https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all',
    'https://www-nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all'
  ];
  const SNAPSHOT_URL = 'nuclides.csv';
  const NEUTRON_MASS_U = 1.00866491595;
  const HYDROGEN_MASS_U = 1.00782503223;
  const U_TO_KEV = 931494.10242;

  const PROPERTY_DEFS = {
    half_life_sec: { label: 'Vida media', unit: 's', logDefault: true, direct: true },
    binding: { label: 'Energía de enlace por nucleón', unit: 'keV/n', direct: true },
    mass_excess: { label: 'Exceso de masa', unit: 'keV', direct: true },
    atomic_mass: { label: 'Masa atómica', unit: 'u', direct: true },
    qa: { label: 'Qα', unit: 'keV', direct: true },
    qbm: { label: 'Qβ−', unit: 'keV', direct: true },
    qec: { label: 'QEC', unit: 'keV', direct: true },
    sn: { label: 'Separación de un neutrón Sₙ', unit: 'keV', direct: true },
    sp: { label: 'Separación de un protón Sₚ', unit: 'keV', direct: true },
    s2n: { label: 'Separación de dos neutrones S₂n', unit: 'keV', derived: true },
    s2p: { label: 'Separación de dos protones S₂p', unit: 'keV', derived: true },
    delta_qa: { label: 'ΔQα', unit: 'keV', derived: true },
    pairing_gap: { label: 'Gap de apareamiento', unit: 'keV', derived: true },
    ldm_residual: { label: '(BE − LDM)/A', unit: 'keV/n', derived: true },
    abundance: { label: 'Abundancia natural', unit: '%', direct: true },
    radius: { label: 'Radio de carga', unit: 'fm', direct: true },
    magnetic_dipole: { label: 'Momento dipolar magnético', unit: 'μN', direct: true },
    electric_quadrupole: { label: 'Momento cuadrupolar eléctrico', unit: 'b', direct: true },
    neutron_excess: { label: 'Exceso neutrónico N−Z', unit: '', derived: true },
    nz_ratio: { label: 'Razón N/Z', unit: '', derived: true },
    discovery: { label: 'Año de descubrimiento', unit: 'año', direct: true }
  };

  const DECAY_COLORS = {
    'beta-': '#4f7fc4', 'beta+/EC': '#c75d67', alpha: '#d3912f', sf: '#8a63bd',
    p: '#c26d3d', n: '#3c8a8a', cluster: '#9a6b3c', it: '#6769b8', unknown: '#777'
  };

  const FILTERS = {
    zMin: 1, zMax: 999, nMin: 0, nMax: 999, aMin: 1, aMax: 999,
    zParity: 'any', nParity: 'any', classSet: new Set(['evaluated', 'isomer', 'theoretical', 'unknown']),
    decaySet: new Set(['stable', 'beta-', 'beta+/EC', 'alpha', 'sf', 'p', 'n', 'it', 'cluster', 'unknown']),
    property: 'half_life_sec', propertyMin: '', propertyMax: '', requireValue: false
  };

  const OVERLAY = {
    property: 'half_life_sec', scale: 'auto', zProfile: false, nProfile: false,
    decayChain: false, decayField: false, syncView: true,
    highlightedGroup: null, signature: '', renderPending: false
  };

  let overlayLayer = null;
  let decayCanvas = null;
  let decayCtx = null;
  let zDock = null;
  let nDock = null;
  let tooltip = null;
  let handheld = false;

  function $(selector, root = document) { return root.querySelector(selector); }
  function $$(selector, root = document) { return [...root.querySelectorAll(selector)]; }

  function isHandheldDevice() {
    const ua = navigator.userAgent || '';
    const phoneUa = /iPhone|iPod|Windows Phone|Android.+Mobile|Mobile Safari/i.test(ua);
    const coarsePhone = navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 700;
    return phoneUa || coarsePhone;
  }

  function applyDeviceMode() {
    handheld = isHandheldDevice();
    document.documentElement.classList.toggle('nucleidos-handheld', handheld);
    document.documentElement.classList.toggle('nucleidos-desktop', !handheld);
    const button = $('#mobileMenuButton');
    const panel = $('#mobileMenuPanel');
    if (button) {
      if (handheld) button.style.removeProperty('display');
      else button.style.setProperty('display', 'none', 'important');
    }
    if (!handheld && panel) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      panel.style.setProperty('display', 'none', 'important');
    } else if (panel) {
      panel.style.removeProperty('display');
    }
  }

  function setStatus(message, stateName = '') {
    const node = $('#dataStatus');
    if (!node) return;
    node.textContent = message;
    if (stateName) node.dataset.state = stateName;
    else delete node.dataset.state;
  }

  function formatDate(value) {
    if (!value) return 'No disponible';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('es-ES');
  }

  function sourceSummary() {
    const rows = typeof state !== 'undefined' && Array.isArray(state.official) ? state.official : [];
    const extraction = rows.map(row => row?.raw?.Extraction_date || row?.raw?.extraction_date).find(Boolean);
    return { records: rows.length, extraction: extraction || 'No indicada' };
  }

  async function loadSyncMetadata() {
    try {
      const response = await fetch(`data/iaea-sync.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (_) { return null; }
  }

  async function updateDatasetDashboard() {
    const host = $('.dataset-dashboard-v29');
    if (!host) return;
    const current = sourceSummary();
    const metadata = await loadSyncMetadata();
    const values = {
      records: current.records.toLocaleString('es-ES'),
      extraction: metadata?.extraction_date || current.extraction,
      sync: metadata?.synced_at ? formatDate(metadata.synced_at) : 'Sin sincronización registrada',
      mode: metadata?.automated ? 'Snapshot validado por Actions' : 'Snapshot del repositorio'
    };
    Object.entries(values).forEach(([key, value]) => {
      const target = host.querySelector(`[data-dataset-value="${key}"]`);
      if (target) target.textContent = value;
    });
  }

  function enhanceDataPanel() {
    const firstSection = $('#dataPopover .popover-section');
    const actions = firstSection?.querySelector('.data-actions');
    if (!firstSection || !actions) return;

    $('.dataset-dashboard-v28')?.remove();
    $('.dataset-note-v28')?.remove();
    $('#restoreSnapshotButton')?.closest('.data-action-card')?.remove();

    if (!firstSection.querySelector('.dataset-dashboard-v29')) {
      const dashboard = document.createElement('div');
      dashboard.className = 'dataset-dashboard-v29';
      dashboard.innerHTML = `
        <div><span>Registros</span><strong data-dataset-value="records">—</strong></div>
        <div><span>Extracción IAEA</span><strong data-dataset-value="extraction">—</strong></div>
        <div><span>Última sincronización</span><strong data-dataset-value="sync">—</strong></div>
        <div><span>Fuente activa</span><strong data-dataset-value="mode">—</strong></div>`;
      firstSection.insertBefore(dashboard, actions);
    }

    const loadButton = $('#loadIaeaButton');
    if (loadButton) {
      loadButton.textContent = 'Actualizar IAEA';
      loadButton.title = 'Consulta LiveChart y utiliza el snapshot validado si el navegador bloquea la API.';
    }

    if (!$('#restoreSnapshotButton')) {
      const snapshotCard = document.createElement('div');
      snapshotCard.className = 'data-action-card v29-snapshot-card';
      snapshotCard.innerHTML = `<button id="restoreSnapshotButton" class="secondary-action-v29" type="button">Restaurar snapshot</button><p>Recarga el CSV validado publicado con la aplicación.</p>`;
      actions.appendChild(snapshotCard);
    }
    actions.classList.add('v29-actions');

    if (!firstSection.querySelector('.dataset-note-v29')) {
      const note = document.createElement('p');
      note.className = 'dataset-note-v29';
      note.innerHTML = '<strong>Arquitectura estática:</strong> el navegador puede sustituir datos en memoria; la persistencia se realiza mediante el workflow de sincronización y un commit en <code>main</code>.';
      firstSection.insertBefore(note, $('#dataStatus'));
    }

    if (!firstSection.querySelector('.nudat-source-links')) {
      const sources = document.createElement('div');
      sources.className = 'nudat-source-links';
      sources.innerHTML = `
        <strong>Fuentes profesionales complementarias</strong>
        <a href="https://www.nndc.bnl.gov/walletcards/search.html" target="_blank" rel="noopener">Wallet Cards</a>
        <a href="https://www.nndc.bnl.gov/nudat3/indx_adopted.jsp" target="_blank" rel="noopener">Niveles y gammas ENSDF</a>
        <a href="https://www.nndc.bnl.gov/nudat3/indx_dec.jsp" target="_blank" rel="noopener">Radiación de decaimiento</a>`;
      firstSection.appendChild(sources);
    }

    $('#restoreSnapshotButton')?.addEventListener('click', () => refreshDataset({ forceSnapshot: true }));
    updateDatasetDashboard();
  }

  function validateIaeaCsv(text) {
    const clean = String(text || '').replace(/^\uFEFF/, '');
    const columns = clean.split(/\r?\n/, 1)[0].toLowerCase().split(',');
    const required = ['z', 'n', 'symbol', 'half_life', 'atomic_mass'];
    if (!required.every(field => columns.includes(field))) throw new Error('La respuesta no es el CSV ground_states esperado.');
    const rows = typeof parseCsv === 'function' ? parseCsv(clean) : [];
    if (rows.length < 3000) throw new Error(`Solo contiene ${rows.length} registros; se rechaza para proteger el dataset.`);
    return rows;
  }

  async function fetchTextWithTimeout(url, timeoutMs = 45000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, {
        cache: 'no-store', mode: 'cors', credentials: 'omit',
        headers: { Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8' }, signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    } finally { clearTimeout(timer); }
  }

  function installRows(rows, sourceLabel) {
    const mapped = rows.map(row => rowToNuclide(row, sourceLabel, 'evaluated')).filter(n => n && n.z > 0);
    if (mapped.length < 3000) throw new Error(`Solo se reconocieron ${mapped.length} nucleidos.`);
    state.official = mapped;
    state.secondary = [];
    rebuildDerivedData();
    fitToScreen(true);
    closeNuclideCard();
    updateDatasetDashboard();
    document.dispatchEvent(new CustomEvent('nucleidos:dataset-changed', { detail: { source: sourceLabel, records: mapped.length } }));
    requestOverlayRender(true);
    return mapped.length;
  }

  async function refreshDataset({ forceSnapshot = false } = {}) {
    const button = $('#loadIaeaButton');
    if (button) button.disabled = true;
    setStatus(forceSnapshot ? 'Cargando snapshot validado…' : 'Consultando IAEA LiveChart…');
    try {
      if (!forceSnapshot) {
        const failures = [];
        for (const url of API_URLS) {
          try {
            const rows = validateIaeaCsv(await fetchTextWithTimeout(url));
            const count = installRows(rows, 'IAEA LiveChart API');
            setStatus(`Actualizados ${count.toLocaleString('es-ES')} nucleidos desde IAEA. El cambio actual está en memoria.`, 'ok');
            return;
          } catch (error) { failures.push(`${new URL(url).hostname}: ${error.message}`); }
        }
        setStatus(`IAEA no es accesible desde este navegador (${failures.join(' · ')}). Se carga el snapshot publicado.`, 'warning');
      }
      const rows = validateIaeaCsv(await fetchTextWithTimeout(SNAPSHOT_URL, 30000));
      const count = installRows(rows, 'Snapshot IAEA del repositorio');
      setStatus(`Cargados ${count.toLocaleString('es-ES')} nucleidos desde el snapshot validado.`, forceSnapshot ? 'ok' : 'warning');
    } catch (error) {
      setStatus(`No se modificó el dataset: ${error.message}`, 'error');
    } finally { if (button) button.disabled = false; }
  }

  function replaceIaeaHandler() {
    const button = $('#loadIaeaButton');
    if (!button || button.dataset.v29Handler) return;
    button.dataset.v29Handler = '1';
    button.addEventListener('click', event => {
      event.preventDefault(); event.stopImmediatePropagation(); refreshDataset();
    }, true);
  }

  function ensureMinimapBitmap() {
    if (typeof state === 'undefined' || !state.layers?.minimap) return;
    const panel = $('#minimapPanel');
    const canvas = $('#minimapCanvas');
    if (!panel || !canvas) return;
    panel.classList.remove('hidden');
    requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const width = Math.max(20, Math.round(rect.width * dpr));
      const height = Math.max(20, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      if (typeof miniCtx !== 'undefined') miniCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (typeof drawMinimap === 'function') drawMinimap();
    });
  }

  function installMinimapRepair() {
    const button = $('#minimapButton');
    const panel = $('#minimapPanel');
    const canvas = $('#minimapCanvas');
    if (!button || !panel || !canvas || canvas.dataset.v29Repair) return;
    canvas.dataset.v29Repair = '1';
    button.addEventListener('click', () => setTimeout(ensureMinimapBitmap, 0));
    if ('ResizeObserver' in window) new ResizeObserver(ensureMinimapBitmap).observe(panel);
    window.addEventListener('resize', ensureMinimapBitmap, { passive: true });
    document.addEventListener('nucleidos:dataset-changed', ensureMinimapBitmap);

    let navigating = false;
    const navigate = event => {
      if (!state.layers.minimap) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
      state.tx = innerWidth / 2 - (x / rect.width * CHART_W) * state.scale;
      state.ty = innerHeight / 2 - (y / rect.height * CHART_H) * state.scale;
      updateView();
      requestOverlayRender();
    };
    canvas.addEventListener('pointerdown', event => { navigating = true; canvas.setPointerCapture?.(event.pointerId); navigate(event); event.preventDefault(); event.stopPropagation(); });
    canvas.addEventListener('pointermove', event => { if (navigating) navigate(event); });
    canvas.addEventListener('pointerup', () => { navigating = false; });
    canvas.addEventListener('pointercancel', () => { navigating = false; });
  }

  function installMobileMenuController() {
    const button = $('#mobileMenuButton');
    const panel = $('#mobileMenuPanel');
    if (!button || !panel || button.dataset.v29Handler) return;
    button.dataset.v29Handler = '1';
    const close = () => {
      panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); button.setAttribute('aria-expanded', 'false');
    };
    button.addEventListener('click', event => {
      if (!handheld) { close(); return; }
      event.preventDefault(); event.stopImmediatePropagation();
      const open = !panel.classList.contains('open');
      panel.classList.toggle('open', open); panel.setAttribute('aria-hidden', String(!open)); button.setAttribute('aria-expanded', String(open));
    }, true);
    document.addEventListener('pointerdown', event => { if (!panel.contains(event.target) && !button.contains(event.target)) close(); }, true);
    addEventListener('resize', () => { applyDeviceMode(); if (!handheld) close(); }, { passive: true });

    const proxy = (mobileId, desktopId, action) => {
      const node = document.getElementById(mobileId);
      if (!node || node.dataset.v29Proxy) return;
      node.dataset.v29Proxy = '1';
      node.addEventListener('click', event => {
        event.preventDefault(); event.stopImmediatePropagation(); close();
        if (action) action(); else document.getElementById(desktopId)?.click();
      }, true);
    };
    proxy('mobileInfoButton', 'infoButton');
    proxy('mobileDataButton', 'dataButton');
    proxy('mobileThemeButton', 'darkModeButton');
    proxy('mobileLayersButton', 'legendButton');
    proxy('mobileResetZoomButton', null, () => fitToScreen(true));

    $('#mobileSearchGoButton')?.addEventListener('click', event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const input = $('#searchInput'); if (input) input.value = $('#mobileSearchInput')?.value || '';
      close(); if (typeof runSearch === 'function') runSearch();
    }, true);
  }

  function removeStandaloneLaboratory() {
    ['analysisButton', 'mobileAnalysisButton', 'analysisPanel', 'analysisPanelV28'].forEach(id => document.getElementById(id)?.remove());
    $$('.analysis-panel, .analysis-panel-v28').forEach(node => node.remove());
  }

  function installLaboratoryRemovalObserver() {
    removeStandaloneLaboratory();
    const observer = new MutationObserver(() => removeStandaloneLaboratory());
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  }

  function rawValue(n, ...names) {
    for (const name of names) {
      const value = n?.raw?.[name] ?? n?.[name];
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return '';
  }

  function parseNumber(value) {
    if (value == null || value === '') return NaN;
    const text = String(value).trim().replace(',', '.');
    const match = text.match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    return match ? Number(match[0]) : NaN;
  }

  function atomicMassU(n) {
    const value = parseNumber(rawValue(n, 'atomic_mass'));
    if (!Number.isFinite(value)) return NaN;
    return Math.abs(value) > 100000 ? value / 1_000_000 : value;
  }

  function evaluatedAt(z, n) {
    const list = state.byCell?.get(`${z}-${n}`) || [];
    return list.find(item => item.dataClass === 'evaluated') || list.find(item => item.dataClass !== 'theoretical') || list[0] || null;
  }

  function bindingPerNucleon(n) {
    const value = parseNumber(rawValue(n, 'binding'));
    return Number.isFinite(value) ? value : NaN;
  }

  function propertyValue(n, key) {
    if (!n) return NaN;
    if (key === 'neutron_excess') return n.n - n.z;
    if (key === 'nz_ratio') return n.n / Math.max(1, n.z);
    if (key === 'atomic_mass') return atomicMassU(n);
    if (key === 'discovery') {
      const match = String(rawValue(n, 'discovery')).match(/(?:18|19|20)\d{2}/);
      return match ? Number(match[0]) : NaN;
    }
    if (key === 'mass_excess') return parseNumber(rawValue(n, 'massexcess', 'mass_excess'));
    if (key === 'half_life_sec') return parseNumber(rawValue(n, 'half_life_sec'));
    if (key === 'radius') return parseNumber(rawValue(n, 'radius'));
    if (key === 'magnetic_dipole') return parseNumber(rawValue(n, 'magnetic_dipole'));
    if (key === 'electric_quadrupole') return parseNumber(rawValue(n, 'electric_quadrupole'));
    if (key === 'abundance') return parseNumber(rawValue(n, 'abundance'));
    if (['qa', 'qbm', 'qec', 'sn', 'sp', 'binding'].includes(key)) return parseNumber(rawValue(n, key));

    if (key === 's2n') {
      const daughter = evaluatedAt(n.z, n.n - 2);
      const m = atomicMassU(n), md = atomicMassU(daughter);
      return Number.isFinite(m) && Number.isFinite(md) ? (md + 2 * NEUTRON_MASS_U - m) * U_TO_KEV : NaN;
    }
    if (key === 's2p') {
      const daughter = evaluatedAt(n.z - 2, n.n);
      const m = atomicMassU(n), md = atomicMassU(daughter);
      return Number.isFinite(m) && Number.isFinite(md) ? (md + 2 * HYDROGEN_MASS_U - m) * U_TO_KEV : NaN;
    }
    if (key === 'delta_qa') {
      const next = evaluatedAt(n.z + 2, n.n + 2);
      const qa = propertyValue(n, 'qa'), qaNext = propertyValue(next, 'qa');
      return Number.isFinite(qa) && Number.isFinite(qaNext) ? 0.5 * (qaNext - qa) : NaN;
    }
    if (key === 'pairing_gap') {
      const prev = evaluatedAt(n.z, n.n - 1), next = evaluatedAt(n.z, n.n + 1);
      const b = bindingPerNucleon(n), bp = bindingPerNucleon(prev), bn = bindingPerNucleon(next);
      if (![b, bp, bn].every(Number.isFinite)) return NaN;
      const be = b * n.a, bePrev = bp * prev.a, beNext = bn * next.a;
      return 0.5 * (n.n % 2 === 0 ? 1 : -1) * (2 * be - bePrev - beNext);
    }
    if (key === 'ldm_residual') {
      const actual = bindingPerNucleon(n);
      if (!Number.isFinite(actual) || !n.a) return NaN;
      const A = n.a, Z = n.z, N = n.n;
      const pairing = Z % 2 === 0 && N % 2 === 0 ? 12.59898 / Math.sqrt(A) : Z % 2 && N % 2 ? -12.59898 / Math.sqrt(A) : 0;
      const ldmMeV = 15.74063 * A - 17.61628 * A ** (2 / 3) - 0.71544 * Z * (Z - 1) / A ** (1 / 3) - 23.42742 * (A - 2 * Z) ** 2 / A + pairing;
      return actual - (ldmMeV / A * 1000);
    }
    return parseNumber(rawValue(n, key));
  }

  function parityPass(value, mode) { return mode === 'any' || (mode === 'even' ? value % 2 === 0 : value % 2 !== 0); }

  function passesScientificFilters(n) {
    if (!n) return false;
    if (n.z < FILTERS.zMin || n.z > FILTERS.zMax || n.n < FILTERS.nMin || n.n > FILTERS.nMax || n.a < FILTERS.aMin || n.a > FILTERS.aMax) return false;
    if (!parityPass(n.z, FILTERS.zParity) || !parityPass(n.n, FILTERS.nParity)) return false;
    if (!FILTERS.classSet.has(n.dataClass || 'unknown')) return false;
    if (!FILTERS.decaySet.has(n.decay || 'unknown')) return false;
    const min = parseNumber(FILTERS.propertyMin), max = parseNumber(FILTERS.propertyMax);
    if (FILTERS.requireValue || Number.isFinite(min) || Number.isFinite(max)) {
      const value = propertyValue(n, FILTERS.property);
      if (!Number.isFinite(value)) return false;
      if (Number.isFinite(min) && value < min) return false;
      if (Number.isFinite(max) && value > max) return false;
    }
    return true;
  }

  function patchIsRenderable() {
    if (typeof isRenderable !== 'function' || isRenderable.__v29ScientificFilter) return;
    const previous = isRenderable;
    const wrapped = function (n) { return previous(n) && passesScientificFilters(n); };
    wrapped.__v29ScientificFilter = true;
    isRenderable = wrapped;
  }

  function makeOption(key) {
    const def = PROPERTY_DEFS[key];
    return `<option value="${key}">${def.label}${def.derived ? ' · derivado' : ''}</option>`;
  }

  function installLegendExtensions() {
    const popover = $('#legendPopover');
    if (!popover || $('#scientificFiltersV29')) return;

    const filterSection = document.createElement('section');
    filterSection.id = 'scientificFiltersV29';
    filterSection.className = 'popover-section compact-section scientific-filters-v29';
    filterSection.innerHTML = `
      <h2>Filtros científicos</h2>
      <div class="range-grid-v29">
        <label>Z mínimo<input data-filter="zMin" type="number" value="1" min="0"></label>
        <label>Z máximo<input data-filter="zMax" type="number" value="130" min="1"></label>
        <label>N mínimo<input data-filter="nMin" type="number" value="0" min="0"></label>
        <label>N máximo<input data-filter="nMax" type="number" value="320" min="0"></label>
        <label>A mínimo<input data-filter="aMin" type="number" value="1" min="1"></label>
        <label>A máximo<input data-filter="aMax" type="number" value="450" min="1"></label>
      </div>
      <div class="select-grid-v29">
        <label>Paridad Z<select data-filter="zParity"><option value="any">Cualquiera</option><option value="even">Par</option><option value="odd">Impar</option></select></label>
        <label>Paridad N<select data-filter="nParity"><option value="any">Cualquiera</option><option value="even">Par</option><option value="odd">Impar</option></select></label>
      </div>
      <details>
        <summary>Clases y modos de desintegración</summary>
        <div class="check-grid-v29" data-filter-group="class">
          <label><input type="checkbox" value="evaluated" checked> Evaluados</label><label><input type="checkbox" value="isomer" checked> Isómeros</label><label><input type="checkbox" value="theoretical" checked> Teóricos</label><label><input type="checkbox" value="unknown" checked> Otros</label>
        </div>
        <div class="check-grid-v29" data-filter-group="decay">
          ${['stable','beta-','beta+/EC','alpha','sf','p','n','it','cluster','unknown'].map(key => `<label><input type="checkbox" value="${key}" checked> ${typeof DECAY_LABELS !== 'undefined' ? (DECAY_LABELS[key] || key) : key}</label>`).join('')}
        </div>
      </details>
      <div class="property-filter-v29">
        <label>Propiedad<select data-filter="property">${Object.keys(PROPERTY_DEFS).map(makeOption).join('')}</select></label>
        <label>Mínimo<input data-filter="propertyMin" inputmode="decimal" placeholder="sin límite"></label>
        <label>Máximo<input data-filter="propertyMax" inputmode="decimal" placeholder="sin límite"></label>
        <label class="check-line-v29"><input data-filter="requireValue" type="checkbox"> Solo con dato</label>
      </div>
      <div class="filter-footer-v29"><button id="resetScientificFiltersV29" type="button">Restablecer</button><strong id="scientificFilterCountV29">—</strong></div>`;
    popover.appendChild(filterSection);

    const overlaySection = document.createElement('section');
    overlaySection.id = 'chartOverlaysV29';
    overlaySection.className = 'popover-section compact-section chart-overlays-v29';
    overlaySection.innerHTML = `
      <h2>Gráficos y trayectorias</h2>
      <p class="section-help-v29">Los perfiles usan el mismo dato que el mapa y se sincronizan con la región visible. Cada punto corresponde a un nucleido; al tocarlo se selecciona en la carta.</p>
      <div class="overlay-controls-v29">
        <label>Propiedad<select id="overlayPropertyV29">${Object.keys(PROPERTY_DEFS).map(makeOption).join('')}</select></label>
        <label>Escala<select id="overlayScaleV29"><option value="auto">Automática</option><option value="linear">Lineal</option><option value="log">Logarítmica</option></select></label>
      </div>
      <div class="overlay-toggle-grid-v29">
        <button data-overlay="zProfile" type="button">Perfil por Z</button>
        <button data-overlay="nProfile" type="button">Perfil por N</button>
        <button data-overlay="decayChain" type="button">Cadena seleccionada</button>
        <button data-overlay="decayField" type="button">Campo de decaimiento</button>
      </div>
      <label class="check-line-v29"><input id="overlaySyncV29" type="checkbox" checked> Sincronizar perfiles con la vista actual</label>
      <div class="overlay-footer-v29"><button id="clearOverlaysV29" type="button">Ocultar gráficos</button><span id="overlayStatusV29">Ninguna superposición activa.</span></div>`;
    popover.appendChild(overlaySection);

    filterSection.addEventListener('input', handleFilterInput);
    filterSection.addEventListener('change', handleFilterInput);
    $('#resetScientificFiltersV29')?.addEventListener('click', resetScientificFilters);
    overlaySection.addEventListener('click', handleOverlayClick);
    $('#overlayPropertyV29')?.addEventListener('change', event => { OVERLAY.property = event.target.value; requestOverlayRender(true); });
    $('#overlayScaleV29')?.addEventListener('change', event => { OVERLAY.scale = event.target.value; requestOverlayRender(true); });
    $('#overlaySyncV29')?.addEventListener('change', event => { OVERLAY.syncView = event.target.checked; requestOverlayRender(true); });
    $('#clearOverlaysV29')?.addEventListener('click', clearOverlays);
    updateFilterCount();
  }

  function numberFromControl(root, key, fallback) {
    const value = parseNumber(root.querySelector(`[data-filter="${key}"]`)?.value);
    return Number.isFinite(value) ? value : fallback;
  }

  function handleFilterInput(event) {
    const root = $('#scientificFiltersV29');
    if (!root) return;
    FILTERS.zMin = numberFromControl(root, 'zMin', 1); FILTERS.zMax = numberFromControl(root, 'zMax', 999);
    FILTERS.nMin = numberFromControl(root, 'nMin', 0); FILTERS.nMax = numberFromControl(root, 'nMax', 999);
    FILTERS.aMin = numberFromControl(root, 'aMin', 1); FILTERS.aMax = numberFromControl(root, 'aMax', 999);
    FILTERS.zParity = root.querySelector('[data-filter="zParity"]')?.value || 'any';
    FILTERS.nParity = root.querySelector('[data-filter="nParity"]')?.value || 'any';
    FILTERS.property = root.querySelector('[data-filter="property"]')?.value || 'half_life_sec';
    FILTERS.propertyMin = root.querySelector('[data-filter="propertyMin"]')?.value || '';
    FILTERS.propertyMax = root.querySelector('[data-filter="propertyMax"]')?.value || '';
    FILTERS.requireValue = Boolean(root.querySelector('[data-filter="requireValue"]')?.checked);
    FILTERS.classSet = new Set($$('[data-filter-group="class"] input:checked', root).map(node => node.value));
    FILTERS.decaySet = new Set($$('[data-filter-group="decay"] input:checked', root).map(node => node.value));
    if (event.type === 'input' && event.target.matches('input[type="number"], input:not([type])')) debounceFilterRender();
    else applyFilterRender();
  }

  let filterTimer = 0;
  function debounceFilterRender() { clearTimeout(filterTimer); filterTimer = setTimeout(applyFilterRender, 120); }
  function applyFilterRender() {
    if (typeof scheduleRender === 'function') scheduleRender();
    if (state.layers?.minimap) ensureMinimapBitmap();
    updateFilterCount(); requestOverlayRender(true);
  }

  function updateFilterCount() {
    const target = $('#scientificFilterCountV29');
    if (!target || typeof state === 'undefined') return;
    let count = 0;
    for (const n of state.all || []) {
      try { if (isRenderable(n)) count++; } catch (_) {}
    }
    target.textContent = `${count.toLocaleString('es-ES')} visibles`;
  }

  function resetScientificFilters() {
    const root = $('#scientificFiltersV29');
    if (!root) return;
    const defaults = { zMin: 1, zMax: 130, nMin: 0, nMax: 320, aMin: 1, aMax: 450 };
    Object.entries(defaults).forEach(([key, value]) => { const node = root.querySelector(`[data-filter="${key}"]`); if (node) node.value = value; });
    root.querySelector('[data-filter="zParity"]').value = 'any'; root.querySelector('[data-filter="nParity"]').value = 'any';
    root.querySelector('[data-filter="property"]').value = 'half_life_sec';
    root.querySelector('[data-filter="propertyMin"]').value = ''; root.querySelector('[data-filter="propertyMax"]').value = '';
    root.querySelector('[data-filter="requireValue"]').checked = false;
    $$('[data-filter-group] input', root).forEach(node => { node.checked = true; });
    handleFilterInput({ type: 'change', target: root });
  }

  function handleOverlayClick(event) {
    const button = event.target.closest('[data-overlay]');
    if (!button) return;
    const key = button.dataset.overlay;
    OVERLAY[key] = !OVERLAY[key];
    button.classList.toggle('active', OVERLAY[key]);
    requestOverlayRender(true);
  }

  function clearOverlays() {
    ['zProfile', 'nProfile', 'decayChain', 'decayField'].forEach(key => { OVERLAY[key] = false; });
    $$('#chartOverlaysV29 [data-overlay]').forEach(button => button.classList.remove('active'));
    requestOverlayRender(true);
  }

  function createOverlayLayer() {
    if ($('#nuclearOverlayLayerV29')) return;
    overlayLayer = document.createElement('div');
    overlayLayer.id = 'nuclearOverlayLayerV29';
    overlayLayer.innerHTML = `
      <canvas id="decayOverlayCanvasV29" aria-hidden="true"></canvas>
      <section id="zProfileDockV29" class="profile-dock-v29 z-profile-dock-v29" aria-hidden="true">
        <header><div><strong>Perfil por Z</strong><span>Propiedad frente al número protónico; cada línea mantiene N constante.</span></div><button data-close-profile="zProfile" type="button" aria-label="Cerrar">×</button></header>
        <canvas aria-label="Perfil por número protónico"></canvas><div class="profile-legend-v29"></div>
      </section>
      <section id="nProfileDockV29" class="profile-dock-v29 n-profile-dock-v29" aria-hidden="true">
        <header><div><strong>Perfil por N</strong><span>Propiedad frente al número neutrónico; cada línea mantiene Z constante.</span></div><button data-close-profile="nProfile" type="button" aria-label="Cerrar">×</button></header>
        <canvas aria-label="Perfil por número neutrónico"></canvas><div class="profile-legend-v29"></div>
      </section>
      <div id="overlayTooltipV29" class="overlay-tooltip-v29" role="tooltip" aria-hidden="true"></div>`;
    document.body.appendChild(overlayLayer);
    decayCanvas = $('#decayOverlayCanvasV29'); decayCtx = decayCanvas.getContext('2d');
    zDock = $('#zProfileDockV29'); nDock = $('#nProfileDockV29'); tooltip = $('#overlayTooltipV29');
    $$('[data-close-profile]', overlayLayer).forEach(button => button.addEventListener('click', () => {
      const key = button.dataset.closeProfile; OVERLAY[key] = false;
      $(`#chartOverlaysV29 [data-overlay="${key}"]`)?.classList.remove('active'); requestOverlayRender(true);
    }));
    installProfileInteraction(zDock); installProfileInteraction(nDock);
  }

  function resizeCanvas(canvas, context) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: rect.width, height: rect.height, dpr };
  }

  function currentVisibleRows() {
    if (typeof state === 'undefined') return [];
    let rect = null;
    if (OVERLAY.syncView && typeof visibleWorldRect === 'function') rect = visibleWorldRect();
    return (state.all || []).filter(n => {
      try { if (!isRenderable(n)) return false; } catch (_) { return false; }
      if (!rect) return true;
      const cell = cellRect(n.z, n.n);
      return cell.x + CELL_W >= rect.x1 && cell.x <= rect.x2 && cell.y + CELL_H >= rect.y1 && cell.y <= rect.y2;
    });
  }

  function chooseGroups(rows, axis) {
    const selectedGroup = state.selected ? (axis === 'z' ? state.selected.n : state.selected.z) : null;
    const counts = new Map();
    rows.forEach(n => {
      const group = axis === 'z' ? n.n : n.z;
      counts.set(group, (counts.get(group) || 0) + 1);
    });
    const groups = [...counts].sort((a, b) => b[1] - a[1]).map(entry => entry[0]);
    if (selectedGroup != null) {
      const near = groups.filter(group => Math.abs(group - selectedGroup) <= 4).sort((a, b) => a - b);
      if (near.length) return near.slice(0, 9);
    }
    return groups.slice(0, 9).sort((a, b) => a - b);
  }

  function transformValue(value) {
    const def = PROPERTY_DEFS[OVERLAY.property];
    const mode = OVERLAY.scale === 'auto' ? (def.logDefault ? 'log' : 'linear') : OVERLAY.scale;
    if (mode === 'log') return value > 0 ? Math.log10(value) : NaN;
    return value;
  }

  function quantile(sorted, q) {
    if (!sorted.length) return NaN;
    const index = (sorted.length - 1) * q, lo = Math.floor(index), hi = Math.ceil(index);
    return lo === hi ? sorted[lo] : sorted[lo] * (hi - index) + sorted[hi] * (index - lo);
  }

  function drawProfile(dock, axis) {
    const canvas = dock.querySelector('canvas'), context = canvas.getContext('2d');
    const { width, height } = resizeCanvas(canvas, context);
    const def = PROPERTY_DEFS[OVERLAY.property];
    const scaleMode = OVERLAY.scale === 'auto' ? (def.logDefault ? 'log' : 'linear') : OVERLAY.scale;
    const title = dock.querySelector('header strong');
    const subtitle = dock.querySelector('header span');
    if (title) title.textContent = `${axis === 'z' ? 'Perfil por Z' : 'Perfil por N'} · ${def.label}`;
    if (subtitle) subtitle.textContent = `${axis === 'z' ? 'X=Z; cada línea mantiene N constante' : 'X=N; cada línea mantiene Z constante'} · Y=${scaleMode === 'log' ? `log₁₀(${def.unit || 'valor'})` : (def.unit || 'valor')}. Cada punto es un nucleido seleccionable.`;
    const rows = currentVisibleRows();
    const groups = chooseGroups(rows, axis);
    const groupSet = new Set(groups);
    const points = rows.map(n => {
      const group = axis === 'z' ? n.n : n.z;
      if (!groupSet.has(group)) return null;
      const raw = propertyValue(n, OVERLAY.property), y = transformValue(raw);
      return Number.isFinite(y) ? { n, group, x: axis === 'z' ? n.z : n.n, y, raw } : null;
    }).filter(Boolean);

    const dark = document.body.classList.contains('dark');
    context.clearRect(0, 0, width, height);
    context.fillStyle = dark ? '#161922' : '#fbfaf7'; context.fillRect(0, 0, width, height);
    if (!points.length) {
      context.fillStyle = dark ? '#ddd' : '#333'; context.font = '700 12px system-ui'; context.fillText('No hay valores visibles para esta propiedad.', 18, 32);
      canvas.__profilePoints = []; return;
    }

    const xs = points.map(p => p.x), ys = points.map(p => p.y).sort((a, b) => a - b);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = quantile(ys, .01), maxY = quantile(ys, .99);
    const left = 54, right = 18, top = 18, bottom = 38;
    const xMap = value => left + (value - minX) / Math.max(1, maxX - minX) * (width - left - right);
    const yMap = value => height - bottom - (value - minY) / Math.max(1e-12, maxY - minY) * (height - top - bottom);

    context.strokeStyle = dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.18)'; context.lineWidth = 1;
    context.beginPath(); context.moveTo(left, top); context.lineTo(left, height - bottom); context.lineTo(width - right, height - bottom); context.stroke();
    context.fillStyle = dark ? '#ddd' : '#333'; context.font = '700 10px system-ui';
    context.fillText(`${minX}`, left, height - 14); context.fillText(`${maxX}`, width - right - 20, height - 14);
    context.fillText(formatPlotValue(maxY), 4, top + 4); context.fillText(formatPlotValue(minY), 4, height - bottom);
    context.fillText(axis === 'z' ? 'Z' : 'N', width - right - 4, height - 14);

    const palette = ['#5d5af6','#d15b6a','#2f8f78','#d0912f','#6d78c8','#a55b9a','#5689b8','#8a7a37','#4c9a9a'];
    const stored = [];
    groups.forEach((group, index) => {
      const series = points.filter(p => p.group === group && p.y >= minY && p.y <= maxY).sort((a, b) => a.x - b.x);
      if (!series.length) return;
      const color = palette[index % palette.length];
      const muted = OVERLAY.highlightedGroup != null && OVERLAY.highlightedGroup !== group;
      context.globalAlpha = muted ? .16 : .88; context.strokeStyle = color; context.lineWidth = muted ? 1 : 1.6;
      context.beginPath();
      series.forEach((point, i) => { const px = xMap(point.x), py = yMap(point.y); i ? context.lineTo(px, py) : context.moveTo(px, py); });
      context.stroke();
      series.forEach(point => {
        const px = xMap(point.x), py = yMap(point.y);
        context.fillStyle = color; context.beginPath(); context.arc(px, py, muted ? 1.8 : 3, 0, Math.PI * 2); context.fill();
        stored.push({ ...point, px, py, color, axis });
      });
    });
    context.globalAlpha = 1; canvas.__profilePoints = stored;

    const legend = dock.querySelector('.profile-legend-v29');
    legend.innerHTML = groups.map((group, index) => `<button type="button" data-profile-group="${group}" style="--series:${palette[index % palette.length]}">${axis === 'z' ? 'N' : 'Z'}=${group}</button>`).join('');
    $$('[data-profile-group]', legend).forEach(button => {
      button.classList.toggle('active', Number(button.dataset.profileGroup) === OVERLAY.highlightedGroup);
      button.addEventListener('pointerenter', () => { OVERLAY.highlightedGroup = Number(button.dataset.profileGroup); requestOverlayRender(true); });
      button.addEventListener('pointerleave', () => { OVERLAY.highlightedGroup = null; requestOverlayRender(true); });
      button.addEventListener('click', () => { const value = Number(button.dataset.profileGroup); OVERLAY.highlightedGroup = OVERLAY.highlightedGroup === value ? null : value; requestOverlayRender(true); });
    });
  }

  function formatPlotValue(value) {
    if (!Number.isFinite(value)) return '—';
    return Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < .001) ? value.toExponential(2) : value.toLocaleString('es-ES', { maximumSignificantDigits: 4 });
  }

  function installProfileInteraction(dock) {
    const canvas = dock.querySelector('canvas');
    canvas.addEventListener('pointermove', event => {
      const points = canvas.__profilePoints || [], rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      let best = null, distance = 10;
      for (const point of points) {
        const d = Math.hypot(point.px - x, point.py - y);
        if (d < distance) { distance = d; best = point; }
      }
      if (!best) { hideOverlayTooltip(); canvas.style.cursor = 'default'; return; }
      canvas.style.cursor = 'pointer';
      const def = PROPERTY_DEFS[OVERLAY.property];
      showOverlayTooltip(event.clientX, event.clientY, `<strong>${best.n.symbol}-${best.n.a}</strong><span>Z=${best.n.z} · N=${best.n.n}</span><span>${def.label}: ${formatPlotValue(best.raw)} ${def.unit}</span><span>Línea ${best.axis === 'z' ? `N=${best.group}` : `Z=${best.group}`}</span>`);
      canvas.__hoverPoint = best;
    });
    canvas.addEventListener('pointerleave', () => { hideOverlayTooltip(); canvas.__hoverPoint = null; });
    canvas.addEventListener('click', () => {
      const point = canvas.__hoverPoint;
      if (!point) return;
      selectNuclide(point.n); centerOnNuclide(point.n, 6); requestOverlayRender(true);
    });
  }

  function showOverlayTooltip(x, y, html) {
    tooltip.innerHTML = html; tooltip.setAttribute('aria-hidden', 'false'); tooltip.classList.add('visible');
    const rect = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.min(innerWidth - rect.width - 10, x + 14)}px`;
    tooltip.style.top = `${Math.min(innerHeight - rect.height - 10, y + 14)}px`;
  }
  function hideOverlayTooltip() { tooltip?.classList.remove('visible'); tooltip?.setAttribute('aria-hidden', 'true'); }

  function daughterCoordinates(n) {
    let z = n.z, nn = n.n;
    if (n.decay === 'alpha') { z -= 2; nn -= 2; }
    else if (n.decay === 'beta-') { z += 1; nn -= 1; }
    else if (n.decay === 'beta+/EC') { z -= 1; nn += 1; }
    else if (n.decay === 'p') z -= 1;
    else if (n.decay === 'n') nn -= 1;
    else if (n.decay === 'cluster') { z -= 6; nn -= 8; }
    else if (n.decay === 'sf' || n.decay === 'stable' || n.decay === 'it' || n.decay === 'unknown') return null;
    return { z, n: nn };
  }

  function screenCenter(n) {
    const rect = cellRect(n.z, n.n);
    return { x: sx(rect.x + CELL_W / 2), y: sy(rect.y + CELL_H / 2) };
  }

  function arrow(context, from, to, color, alpha = .55, width = 1.2) {
    const dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy);
    if (length < 3) return;
    const ux = dx / length, uy = dy / length;
    const start = { x: from.x + ux * 5, y: from.y + uy * 5 }, end = { x: to.x - ux * 5, y: to.y - uy * 5 };
    context.save(); context.globalAlpha = alpha; context.strokeStyle = color; context.fillStyle = color; context.lineWidth = width;
    context.beginPath(); context.moveTo(start.x, start.y); context.lineTo(end.x, end.y); context.stroke();
    const size = Math.max(4, Math.min(8, width * 4));
    context.beginPath(); context.moveTo(end.x, end.y); context.lineTo(end.x - ux * size - uy * size * .55, end.y - uy * size + ux * size * .55); context.lineTo(end.x - ux * size + uy * size * .55, end.y - uy * size - ux * size * .55); context.closePath(); context.fill(); context.restore();
  }

  function drawDecayOverlay() {
    const { width, height } = resizeCanvas(decayCanvas, decayCtx);
    decayCtx.clearRect(0, 0, width, height);
    if (OVERLAY.decayField) {
      const rows = currentVisibleRows().filter(n => n.dataClass !== 'theoretical' && daughterCoordinates(n));
      const stride = Math.max(1, Math.ceil(rows.length / 550));
      for (let i = 0; i < rows.length; i += stride) {
        const n = rows[i], d = daughterCoordinates(n), daughter = d ? evaluatedAt(d.z, d.n) : null;
        if (!daughter) continue;
        const from = screenCenter(n), to = screenCenter(daughter);
        if (from.x < -20 || from.x > width + 20 || from.y < -20 || from.y > height + 20) continue;
        arrow(decayCtx, from, to, DECAY_COLORS[n.decay] || DECAY_COLORS.unknown, .22, 1);
      }
    }
    if (OVERLAY.decayChain && state.selected) {
      let current = state.selected; const seen = new Set([current.uid]);
      for (let i = 0; i < 18; i++) {
        const coords = daughterCoordinates(current), daughter = coords ? evaluatedAt(coords.z, coords.n) : null;
        if (!daughter || seen.has(daughter.uid)) break;
        const from = screenCenter(current), to = screenCenter(daughter);
        arrow(decayCtx, from, to, DECAY_COLORS[current.decay] || '#5d5af6', .95, 2.6);
        decayCtx.save(); decayCtx.fillStyle = document.body.classList.contains('dark') ? '#fff' : '#222'; decayCtx.font = '900 11px system-ui'; decayCtx.fillText(typeof DECAY_LABELS !== 'undefined' ? (DECAY_LABELS[current.decay] || current.decay) : current.decay, (from.x + to.x) / 2 + 5, (from.y + to.y) / 2 - 5); decayCtx.restore();
        seen.add(daughter.uid); current = daughter;
      }
    }
  }

  function requestOverlayRender(force = false) {
    if (force) OVERLAY.signature = '';
    if (OVERLAY.renderPending) return;
    OVERLAY.renderPending = true;
    requestAnimationFrame(() => { OVERLAY.renderPending = false; renderOverlays(); });
  }

  function renderOverlays() {
    if (!overlayLayer) return;
    const any = OVERLAY.zProfile || OVERLAY.nProfile || OVERLAY.decayChain || OVERLAY.decayField;
    overlayLayer.classList.toggle('active', any);
    zDock.classList.toggle('open', OVERLAY.zProfile); zDock.setAttribute('aria-hidden', String(!OVERLAY.zProfile));
    nDock.classList.toggle('open', OVERLAY.nProfile); nDock.setAttribute('aria-hidden', String(!OVERLAY.nProfile));
    document.body.classList.toggle('z-profile-open-v29', OVERLAY.zProfile);
    document.body.classList.toggle('n-profile-open-v29', OVERLAY.nProfile);
    const status = $('#overlayStatusV29');
    const active = [];
    if (OVERLAY.zProfile) active.push('perfil Z'); if (OVERLAY.nProfile) active.push('perfil N'); if (OVERLAY.decayChain) active.push('cadena'); if (OVERLAY.decayField) active.push('campo');
    if (status) status.textContent = active.length ? `Activo: ${active.join(', ')}.` : 'Ninguna superposición activa.';
    if (!any) { decayCtx?.clearRect(0, 0, decayCanvas.width, decayCanvas.height); return; }
    drawDecayOverlay();
    if (OVERLAY.zProfile) drawProfile(zDock, 'z');
    if (OVERLAY.nProfile) drawProfile(nDock, 'n');
  }

  function monitorView() {
    setInterval(() => {
      if (!overlayLayer || !(OVERLAY.zProfile || OVERLAY.nProfile || OVERLAY.decayChain || OVERLAY.decayField)) return;
      const signature = [state.tx?.toFixed(2), state.ty?.toFixed(2), state.scale?.toFixed(4), state.selected?.uid || '', state.all?.length || 0, OVERLAY.property, OVERLAY.scale, OVERLAY.syncView, innerWidth, innerHeight].join('|');
      if (signature !== OVERLAY.signature) { OVERLAY.signature = signature; requestOverlayRender(); }
    }, 120);
  }

  function installOverlayEvents() {
    const viewport = $('#viewport');
    ['wheel', 'pointermove', 'pointerup'].forEach(type => viewport?.addEventListener(type, () => requestOverlayRender(), { passive: true }));
    addEventListener('resize', () => requestOverlayRender(true), { passive: true });
    document.addEventListener('nucleidos:dataset-changed', () => requestOverlayRender(true));
    document.addEventListener('click', event => {
      if (event.target.closest('.legend-mode-btn, .legend-item, .layer-toggle')) setTimeout(() => { updateFilterCount(); requestOverlayRender(true); }, 0);
    });
  }

  function init() {
    document.documentElement.dataset.nucleidosPatch = PATCH_VERSION;
    applyDeviceMode();
    enhanceDataPanel(); replaceIaeaHandler(); installMinimapRepair(); installMobileMenuController();
    installLaboratoryRemovalObserver(); createOverlayLayer(); installLegendExtensions(); patchIsRenderable();
    installOverlayEvents(); monitorView();
    setTimeout(() => { patchIsRenderable(); removeStandaloneLaboratory(); updateFilterCount(); requestOverlayRender(true); }, 2200);
    setInterval(patchIsRenderable, 5000);
    if (typeof state !== 'undefined' && state.layers?.minimap) ensureMinimapBitmap();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
