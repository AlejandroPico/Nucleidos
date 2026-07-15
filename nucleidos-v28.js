(() => {
  'use strict';

  const API_URLS = [
    'https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all',
    'https://www-nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all'
  ];
  const SNAPSHOT_URL = 'nuclides.csv';
  const MOBILE_QUERY = '(max-width: 700px)';

  function setStatus(message, stateName = '') {
    const node = document.getElementById('dataStatus');
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
    return {
      records: rows.length,
      extraction: extraction || 'No indicada'
    };
  }

  async function loadSyncMetadata() {
    try {
      const response = await fetch(`data/iaea-sync.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  async function updateDatasetDashboard() {
    const host = document.querySelector('.dataset-dashboard-v28');
    if (!host) return;
    const current = sourceSummary();
    const metadata = await loadSyncMetadata();
    const values = {
      records: current.records.toLocaleString('es-ES'),
      extraction: metadata?.extraction_date || current.extraction,
      sync: metadata?.synced_at ? formatDate(metadata.synced_at) : 'Pendiente de primera sincronización',
      mode: metadata?.automated ? 'Snapshot automatizado' : 'Snapshot del repositorio'
    };
    Object.entries(values).forEach(([key, value]) => {
      const target = host.querySelector(`[data-dataset-value="${key}"]`);
      if (target) target.textContent = value;
    });
  }

  function enhanceDataPanel() {
    const firstSection = document.querySelector('#dataPopover .popover-section');
    const actions = firstSection?.querySelector('.data-actions');
    if (!firstSection || !actions || firstSection.querySelector('.dataset-dashboard-v28')) return;

    const dashboard = document.createElement('div');
    dashboard.className = 'dataset-dashboard-v28';
    dashboard.innerHTML = `
      <div class="dataset-stat-v28"><span>Registros</span><strong data-dataset-value="records">—</strong></div>
      <div class="dataset-stat-v28"><span>Extracción IAEA</span><strong data-dataset-value="extraction">—</strong></div>
      <div class="dataset-stat-v28"><span>Última sincronización</span><strong data-dataset-value="sync">—</strong></div>
      <div class="dataset-stat-v28"><span>Fuente operativa</span><strong data-dataset-value="mode">—</strong></div>`;
    firstSection.insertBefore(dashboard, actions);

    const loadButton = document.getElementById('loadIaeaButton');
    if (loadButton) {
      loadButton.textContent = 'Actualizar IAEA';
      loadButton.title = 'Intenta la API oficial y, si el servidor o CORS la bloquean, restaura el snapshot validado del repositorio.';
    }

    const snapshotCard = document.createElement('div');
    snapshotCard.className = 'data-action-card';
    snapshotCard.innerHTML = `
      <button id="restoreSnapshotButton" class="secondary-action-v28" type="button">Restaurar snapshot</button>
      <p>Recarga el CSV oficial almacenado en este repositorio, sin depender de CORS ni de la disponibilidad momentánea de IAEA.</p>`;
    actions.appendChild(snapshotCard);
    actions.classList.add('v28-actions');

    const note = document.createElement('p');
    note.className = 'dataset-note-v28';
    note.innerHTML = '<strong>GitHub Pages es estático:</strong> una descarga hecha desde el navegador solo sustituye los datos en memoria hasta recargar la página. La actualización permanente de <code>nuclides.csv</code> la realiza GitHub Actions mediante un commit validado.';
    firstSection.insertBefore(note, firstSection.querySelector('#dataStatus'));

    document.getElementById('restoreSnapshotButton')?.addEventListener('click', () => refreshDataset({ forceSnapshot: true }));
    updateDatasetDashboard();
  }

  function validateIaeaCsv(text) {
    const clean = String(text || '').replace(/^\uFEFF/, '');
    const firstLine = clean.split(/\r?\n/, 1)[0].toLowerCase();
    const columns = firstLine.split(',');
    const required = ['z', 'n', 'symbol', 'half_life', 'atomic_mass'];
    if (!required.every(field => columns.includes(field))) {
      throw new Error('La respuesta no contiene la cabecera esperada de ground_states.');
    }
    const rows = typeof parseCsv === 'function' ? parseCsv(clean) : [];
    if (rows.length < 3000) throw new Error(`La respuesta solo contiene ${rows.length} registros; se rechaza para proteger el dataset.`);
    return rows;
  }

  async function fetchTextWithTimeout(url, timeoutMs = 45000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, {
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit',
        headers: { Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8' },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } finally {
      clearTimeout(timer);
    }
  }

  function installRows(rows, sourceLabel) {
    const mapped = rows
      .map(row => rowToNuclide(row, sourceLabel, 'evaluated'))
      .filter(nuclide => nuclide && nuclide.z > 0);
    if (mapped.length < 3000) throw new Error(`Solo se reconocieron ${mapped.length} nucleidos.`);
    state.official = mapped;
    state.secondary = [];
    rebuildDerivedData();
    fitToScreen(true);
    closeNuclideCard();
    updateDatasetDashboard();
    document.dispatchEvent(new CustomEvent('nucleidos:dataset-changed', { detail: { source: sourceLabel, records: mapped.length } }));
    return mapped.length;
  }

  async function refreshDataset({ forceSnapshot = false } = {}) {
    const button = document.getElementById('loadIaeaButton');
    if (button) button.disabled = true;
    setStatus(forceSnapshot ? 'Cargando snapshot validado del repositorio…' : 'Consultando IAEA LiveChart…');

    try {
      if (!forceSnapshot) {
        const failures = [];
        for (const url of API_URLS) {
          try {
            const text = await fetchTextWithTimeout(url);
            const rows = validateIaeaCsv(text);
            const count = installRows(rows, 'IAEA LiveChart API');
            setStatus(`Actualizados ${count.toLocaleString('es-ES')} nucleidos desde la API oficial. El cambio permanecerá en memoria hasta recargar.`, 'ok');
            return;
          } catch (error) {
            failures.push(`${new URL(url).hostname}: ${error.message}`);
          }
        }
        setStatus(`La API oficial no es accesible desde este navegador (${failures.join(' · ')}). Cargando el snapshot del repositorio…`, 'warning');
      }

      const snapshotText = await fetchTextWithTimeout(SNAPSHOT_URL, 30000);
      const snapshotRows = validateIaeaCsv(snapshotText);
      const count = installRows(snapshotRows, 'Snapshot IAEA del repositorio');
      setStatus(`Cargados ${count.toLocaleString('es-ES')} nucleidos desde el snapshot validado. La sincronización permanente depende de GitHub Actions.`, forceSnapshot ? 'ok' : 'warning');
    } catch (error) {
      setStatus(`No se modificó el dataset: ${error.message}`, 'error');
    } finally {
      if (button) button.disabled = false;
    }
  }

  function replaceIaeaHandler() {
    const button = document.getElementById('loadIaeaButton');
    if (!button) return;
    try {
      if (typeof loadIaeaData === 'function') button.removeEventListener('click', loadIaeaData);
    } catch (_) {}
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      refreshDataset();
    }, true);
  }

  function ensureMinimapBitmap() {
    if (typeof state === 'undefined' || !state.layers?.minimap) return;
    const panel = document.getElementById('minimapPanel');
    const canvas = document.getElementById('minimapCanvas');
    if (!panel || !canvas) return;
    panel.classList.remove('hidden');
    requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(20, Math.round(rect.width * dpr));
      const height = Math.max(20, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      if (typeof miniCtx !== 'undefined') miniCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (typeof drawMinimap === 'function') drawMinimap();
    });
  }

  function installMinimapRepair() {
    const button = document.getElementById('minimapButton');
    const panel = document.getElementById('minimapPanel');
    const canvas = document.getElementById('minimapCanvas');
    if (!button || !panel || !canvas) return;

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
      const worldX = x / rect.width * CHART_W;
      const worldY = y / rect.height * CHART_H;
      state.tx = window.innerWidth / 2 - worldX * state.scale;
      state.ty = window.innerHeight / 2 - worldY * state.scale;
      updateView();
    };
    canvas.addEventListener('pointerdown', event => {
      navigating = true;
      canvas.setPointerCapture?.(event.pointerId);
      navigate(event);
      event.preventDefault();
      event.stopPropagation();
    });
    canvas.addEventListener('pointermove', event => { if (navigating) navigate(event); });
    const end = () => { navigating = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  function installMobileMenuController() {
    const button = document.getElementById('mobileMenuButton');
    const panel = document.getElementById('mobileMenuPanel');
    if (!button || !panel) return;

    const close = () => {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
    };
    const toggle = event => {
      if (!window.matchMedia(MOBILE_QUERY).matches) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const open = !panel.classList.contains('open');
      panel.classList.toggle('open', open);
      panel.setAttribute('aria-hidden', String(!open));
      button.setAttribute('aria-expanded', String(open));
    };
    button.addEventListener('click', toggle, true);
    document.addEventListener('pointerdown', event => {
      if (!panel.contains(event.target) && !button.contains(event.target)) close();
    }, true);
    window.matchMedia(MOBILE_QUERY).addEventListener?.('change', event => { if (!event.matches) close(); });

    const proxy = (mobileId, desktopId, action) => {
      document.getElementById(mobileId)?.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
        if (action) action();
        else document.getElementById(desktopId)?.click();
      }, true);
    };
    proxy('mobileInfoButton', 'infoButton');
    proxy('mobileDataButton', 'dataButton');
    proxy('mobileThemeButton', 'darkModeButton');
    proxy('mobileLayersButton', 'legendButton');
    proxy('mobileResetZoomButton', null, () => fitToScreen(true));

    const searchButton = document.getElementById('mobileSearchGoButton');
    searchButton?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const value = document.getElementById('mobileSearchInput')?.value || '';
      const input = document.getElementById('searchInput');
      if (input) input.value = value;
      close();
      if (typeof runSearch === 'function') runSearch();
    }, true);
  }

  function numberValue(nuclide, key) {
    const raw = key === 'neutron_excess' ? nuclide.n - nuclide.z
      : key === 'nz_ratio' ? nuclide.n / Math.max(1, nuclide.z)
      : key === 'radius' ? nuclide.raw?.radius
      : nuclide[key] ?? nuclide.raw?.[key];
    if (raw == null || raw === '') return NaN;
    const value = Number(String(raw).replace(',', '.').replace(/[^0-9.+\-eE]/g, ''));
    return Number.isFinite(value) ? value : NaN;
  }

  function quantile(sorted, q) {
    if (!sorted.length) return NaN;
    const index = (sorted.length - 1) * q;
    const lower = Math.floor(index), upper = Math.ceil(index);
    return lower === upper ? sorted[lower] : sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
  }

  function installFallbackLaboratory() {
    setTimeout(() => {
      if (document.getElementById('analysisButton')) return;
      const toolbar = document.querySelector('.top-tools');
      const zoom = document.getElementById('zoomHud');
      if (!toolbar || !zoom) return;

      const button = document.createElement('button');
      button.id = 'analysisButton';
      button.className = 'tool-button';
      button.type = 'button';
      button.title = 'Laboratorio analítico';
      button.setAttribute('aria-label', 'Abrir laboratorio analítico');
      button.innerHTML = '<svg class="material-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16v2H4v-2Zm1-2V9h3v8H5Zm5 0V3h3v14h-3Zm5 0v-6h3v6h-3Z"/></svg>';
      toolbar.insertBefore(button, zoom);

      const panel = document.createElement('section');
      panel.id = 'analysisPanelV28';
      panel.className = 'analysis-panel-v28';
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML = `
        <header><div><span class="eyebrow">Nucleidos · análisis</span><h2>Laboratorio de propiedades</h2></div><button class="analysis-close-v28" type="button" aria-label="Cerrar">×</button></header>
        <div class="analysis-controls-v28">
          <label>Propiedad<select id="analysisPropertyV28">
            <option value="half_life_sec">Vida media (log₁₀ s)</option><option value="binding">Energía de enlace</option><option value="mass_excess">Exceso de masa</option><option value="qa">Qα</option><option value="qbm">Qβ−</option><option value="qec">QEC</option><option value="abundance">Abundancia</option><option value="radius">Radio de carga</option><option value="neutron_excess">Exceso N−Z</option><option value="nz_ratio">Razón N/Z</option>
          </select></label>
          <nav><button class="active" data-analysis-tab="profile" type="button">Perfil por Z</button><button data-analysis-tab="histogram" type="button">Distribución</button><button data-analysis-tab="summary" type="button">Resumen</button></nav>
        </div>
        <div class="analysis-content-v28">
          <div class="analysis-view-v28 active" data-analysis-view="profile"><canvas id="analysisProfileCanvasV28"></canvas><p>Mediana por número protónico Z. Los puntos grises representan registros individuales.</p></div>
          <div class="analysis-view-v28" data-analysis-view="histogram"><canvas id="analysisHistogramCanvasV28"></canvas><p>Distribución de los nucleidos visibles que contienen un valor numérico válido.</p></div>
          <div class="analysis-view-v28" data-analysis-view="summary"><div id="analysisSummaryV28" class="analysis-summary-v28"></div></div>
        </div>`;
      document.body.appendChild(panel);

      const mobileGrid = document.querySelector('.mobile-menu-grid');
      if (mobileGrid && !document.getElementById('mobileAnalysisButton')) {
        const mobile = document.createElement('button');
        mobile.id = 'mobileAnalysisButton';
        mobile.className = 'mobile-menu-action';
        mobile.type = 'button';
        mobile.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16v2H4v-2Zm1-2V9h3v8H5Zm5 0V3h3v14h-3Zm5 0v-6h3v6h-3Z"/></svg><span>Análisis</span>';
        mobileGrid.appendChild(mobile);
        mobile.addEventListener('click', () => button.click());
      }

      let tab = 'profile';
      const property = panel.querySelector('#analysisPropertyV28');
      const rows = () => (typeof state !== 'undefined' ? state.all : []).filter(n => {
        try { return typeof isRenderable === 'function' ? isRenderable(n) : true; } catch (_) { return true; }
      });
      const values = () => rows().map(n => {
        let value = numberValue(n, property.value);
        if (property.value === 'half_life_sec' && Number.isFinite(value) && value > 0) value = Math.log10(value);
        return { n, value };
      }).filter(item => Number.isFinite(item.value));

      const setupCanvas = canvas => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.max(320, Math.round(rect.width * dpr));
        canvas.height = Math.max(240, Math.round(rect.height * dpr));
        const context = canvas.getContext('2d');
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { context, width: rect.width, height: rect.height };
      };
      const axes = (context, width, height, minX, maxX, minY, maxY) => {
        const left = 54, right = 18, top = 20, bottom = 42;
        context.clearRect(0, 0, width, height);
        context.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.22)';
        context.fillStyle = document.body.classList.contains('dark') ? '#fff' : '#25242a';
        context.lineWidth = 1;
        context.beginPath(); context.moveTo(left, top); context.lineTo(left, height-bottom); context.lineTo(width-right, height-bottom); context.stroke();
        context.font = '700 10px system-ui';
        context.fillText(Number.isFinite(maxY) ? maxY.toPrecision(4) : '—', 4, top + 3);
        context.fillText(Number.isFinite(minY) ? minY.toPrecision(4) : '—', 4, height-bottom);
        context.fillText(String(minX), left, height-14); context.fillText(String(maxX), width-right-18, height-14);
        return {
          x: value => left + (value-minX)/Math.max(1e-9, maxX-minX)*(width-left-right),
          y: value => height-bottom - (value-minY)/Math.max(1e-9, maxY-minY)*(height-top-bottom),
          left, right, top, bottom
        };
      };
      const drawProfile = () => {
        const canvas = panel.querySelector('#analysisProfileCanvasV28');
        const { context, width, height } = setupCanvas(canvas);
        const data = values();
        if (!data.length) { context.fillText('No hay datos numéricos para esta propiedad.', 24, 40); return; }
        const grouped = new Map();
        data.forEach(item => { if (!grouped.has(item.n.z)) grouped.set(item.n.z, []); grouped.get(item.n.z).push(item.value); });
        const medians = [...grouped].map(([z, list]) => [z, quantile(list.sort((a,b)=>a-b), .5)]).sort((a,b)=>a[0]-b[0]);
        const all = data.map(item => item.value).sort((a,b)=>a-b);
        const minY = quantile(all, .01), maxY = quantile(all, .99);
        const scale = axes(context, width, height, medians[0][0], medians.at(-1)[0], minY, maxY);
        context.fillStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.16)';
        data.forEach(item => { if (item.value < minY || item.value > maxY) return; context.fillRect(scale.x(item.n.z)-1, scale.y(item.value)-1, 2, 2); });
        context.strokeStyle = '#5d5af6'; context.lineWidth = 2; context.beginPath();
        medians.forEach(([z, value], index) => { const x=scale.x(z), y=scale.y(Math.max(minY, Math.min(maxY, value))); index ? context.lineTo(x,y) : context.moveTo(x,y); });
        context.stroke();
      };
      const drawHistogram = () => {
        const canvas = panel.querySelector('#analysisHistogramCanvasV28');
        const { context, width, height } = setupCanvas(canvas);
        const data = values().map(item => item.value).sort((a,b)=>a-b);
        if (!data.length) { context.fillText('No hay datos numéricos para esta propiedad.', 24, 40); return; }
        const min = quantile(data, .01), max = quantile(data, .99), bins = 24;
        const counts = Array(bins).fill(0);
        data.forEach(value => { if (value < min || value > max) return; const i=Math.min(bins-1, Math.floor((value-min)/Math.max(1e-9,max-min)*bins)); counts[i]++; });
        const scale = axes(context, width, height, Number(min.toPrecision(4)), Number(max.toPrecision(4)), 0, Math.max(...counts));
        const barWidth = (width-scale.left-scale.right)/bins;
        context.fillStyle = '#5d5af6';
        counts.forEach((count, i) => { const x=scale.left+i*barWidth+1, y=scale.y(count); context.fillRect(x,y,Math.max(1,barWidth-2),height-scale.bottom-y); });
      };
      const drawSummary = () => {
        const data = values().map(item => item.value).sort((a,b)=>a-b);
        const host = panel.querySelector('#analysisSummaryV28');
        if (!data.length) { host.textContent='No hay datos numéricos para esta propiedad.'; return; }
        const mean = data.reduce((sum,value)=>sum+value,0)/data.length;
        host.innerHTML = [
          ['Registros', data.length.toLocaleString('es-ES')], ['Mínimo', data[0].toLocaleString('es-ES',{maximumSignificantDigits:7})],
          ['Q1', quantile(data,.25).toLocaleString('es-ES',{maximumSignificantDigits:7})], ['Mediana', quantile(data,.5).toLocaleString('es-ES',{maximumSignificantDigits:7})],
          ['Media', mean.toLocaleString('es-ES',{maximumSignificantDigits:7})], ['Q3', quantile(data,.75).toLocaleString('es-ES',{maximumSignificantDigits:7})],
          ['Máximo', data.at(-1).toLocaleString('es-ES',{maximumSignificantDigits:7})]
        ].map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('');
      };
      const render = () => { if (tab==='profile') drawProfile(); else if (tab==='histogram') drawHistogram(); else drawSummary(); };
      const open = () => { panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); requestAnimationFrame(render); };
      const close = () => { panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); };
      button.addEventListener('click', open);
      panel.querySelector('.analysis-close-v28').addEventListener('click', close);
      property.addEventListener('change', render);
      panel.querySelectorAll('[data-analysis-tab]').forEach(tabButton => tabButton.addEventListener('click', () => {
        tab = tabButton.dataset.analysisTab;
        panel.querySelectorAll('[data-analysis-tab]').forEach(node => node.classList.toggle('active', node===tabButton));
        panel.querySelectorAll('[data-analysis-view]').forEach(node => node.classList.toggle('active', node.dataset.analysisView===tab));
        requestAnimationFrame(render);
      }));
      window.addEventListener('resize', () => { if (panel.classList.contains('open')) render(); }, { passive:true });
      document.addEventListener('nucleidos:dataset-changed', () => { if (panel.classList.contains('open')) render(); });
    }, 1800);
  }

  function init() {
    document.documentElement.dataset.nucleidosPatch = '28';
    enhanceDataPanel();
    replaceIaeaHandler();
    installMinimapRepair();
    installMobileMenuController();
    installFallbackLaboratory();
    if (typeof state !== 'undefined' && state.layers?.minimap) ensureMinimapBitmap();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
