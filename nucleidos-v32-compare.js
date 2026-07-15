(() => {
  'use strict';
  const api = window.NucleidosV32;
  if (!api) return;

  const items = new Map();
  let windowRecord = null;
  let activeTab = 'summary';
  let selectedMetric = 'normal:atomic_mass';
  let selectedScale = 'linear';
  let resizeObserver = null;

  const NORMAL_FIELDS = [
    ['Identidad', 'element', 'Elemento'],
    ['Identidad', 'symbol', 'Símbolo'],
    ['Identidad', 'stateId', 'Estado nuclear'],
    ['Identidad', 'dataClass', 'Clase del dato'],
    ['Estructura', 'z', 'Protones (Z)'],
    ['Estructura', 'n', 'Neutrones (N)'],
    ['Estructura', 'a', 'Número másico (A)'],
    ['Estructura', '$neutronExcess', 'Exceso neutrónico (N−Z)'],
    ['Estructura', '$nzRatio', 'Razón N/Z'],
    ['Estabilidad', 'half_life', 'Vida media'],
    ['Estabilidad', 'half_life_sec', 'Vida media (s)'],
    ['Estabilidad', 'decay', 'Modo de decaimiento'],
    ['Estabilidad', 'q_value', 'Q / energía principal'],
    ['Estabilidad', 'qa', 'Qα'],
    ['Estabilidad', 'qbm', 'Qβ−'],
    ['Estabilidad', 'qec', 'QEC'],
    ['Masas', 'atomic_mass', 'Masa atómica'],
    ['Masas', 'mass_excess', 'Exceso de masa'],
    ['Masas', 'binding', 'Energía de enlace'],
    ['Masas', 'sn', 'Separación neutrónica Sₙ'],
    ['Masas', 'sp', 'Separación protónica Sₚ'],
    ['Propiedades', 'spin', 'Spin / paridad'],
    ['Propiedades', 'abundance', 'Abundancia natural'],
    ['Contexto', 'notes', 'Peculiaridades'],
    ['Contexto', 'applications', 'Aplicaciones'],
    ['Fuente', 'wikipedia', 'Wikipedia'],
    ['Fuente', 'livechart', 'IAEA LiveChart']
  ];

  function valueOf(nuclide, key) {
    if (key === '$neutronExcess') return nuclide.n - nuclide.z;
    if (key === '$nzRatio') return nuclide.z ? (nuclide.n / nuclide.z).toLocaleString('es-ES', { maximumFractionDigits: 5 }) : '—';
    return nuclide[key];
  }

  function display(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (Array.isArray(value)) return value.length ? value.join(' · ') : '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  function numberOf(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
    const normalized = String(value ?? '').trim().replace(',', '.');
    const match = normalized.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/);
    return match ? Number(match[0]) : NaN;
  }

  function rawKeys() {
    const keys = new Set();
    items.forEach(nuclide => Object.keys(nuclide.raw || {}).forEach(key => keys.add(key)));
    return [...keys].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  }

  function makeCell(tag, text, className = '') {
    const cell = document.createElement(tag);
    if (className) cell.className = className;
    cell.textContent = display(text);
    return cell;
  }

  function buildTable(rows, getter) {
    const nuclides = [...items.values()];
    const table = document.createElement('table');
    table.className = 'compare-matrix-v32';
    const thead = document.createElement('thead');
    const header = document.createElement('tr');
    header.appendChild(makeCell('th', 'Dato', 'compare-sticky-v32'));
    nuclides.forEach(nuclide => {
      const th = document.createElement('th');
      const label = document.createElement('strong');
      label.textContent = `${nuclide.symbol}-${nuclide.a}`;
      const subtitle = document.createElement('span');
      subtitle.textContent = `Z=${nuclide.z} · N=${nuclide.n}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'compare-remove-v32';
      remove.title = `Quitar ${nuclide.symbol}-${nuclide.a}`;
      remove.setAttribute('aria-label', remove.title);
      remove.innerHTML = api.icons.close;
      remove.addEventListener('click', () => {
        items.delete(nuclide.uid);
        render();
      });
      th.append(label, subtitle, remove);
      header.appendChild(th);
    });
    thead.appendChild(header);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    let lastGroup = '';
    rows.forEach(row => {
      const [group, key, label] = row;
      if (group && group !== lastGroup) {
        const groupRow = document.createElement('tr');
        groupRow.className = 'compare-group-v32';
        const groupCell = makeCell('th', group);
        groupCell.colSpan = nuclides.length + 1;
        groupRow.appendChild(groupCell);
        tbody.appendChild(groupRow);
        lastGroup = group;
      }
      const tr = document.createElement('tr');
      tr.appendChild(makeCell('th', label, 'compare-sticky-v32'));
      nuclides.forEach(nuclide => tr.appendChild(makeCell('td', getter(nuclide, key))));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  function renderSummary(host) {
    const compact = NORMAL_FIELDS.filter(([group]) => ['Identidad', 'Estructura', 'Estabilidad', 'Masas', 'Propiedades'].includes(group));
    host.appendChild(buildTable(compact, valueOf));
  }

  function renderAll(host) {
    host.appendChild(buildTable(NORMAL_FIELDS, valueOf));
  }

  function renderRaw(host) {
    const rows = rawKeys().map(key => ['', key, key]);
    if (!rows.length) {
      host.appendChild(makeCell('p', 'Los nucleidos seleccionados no incluyen campos originales.', 'compare-empty-v32'));
      return;
    }
    host.appendChild(buildTable(rows, (nuclide, key) => nuclide.raw?.[key]));
  }

  function metricOptions() {
    const options = new Map([
      ['normal:z', 'Protones (Z)'], ['normal:n', 'Neutrones (N)'], ['normal:a', 'Número másico (A)'],
      ['normal:half_life_sec', 'Vida media (s)'], ['normal:atomic_mass', 'Masa atómica'],
      ['normal:qa', 'Qα'], ['normal:qbm', 'Qβ−'], ['normal:qec', 'QEC']
    ]);
    rawKeys().forEach(key => {
      if ([...items.values()].some(nuclide => Number.isFinite(numberOf(nuclide.raw?.[key])))) {
        options.set(`raw:${key}`, `Oficial · ${key}`);
      }
    });
    return options;
  }

  function metricValue(nuclide, metric) {
    const separator = metric.indexOf(':');
    const scope = metric.slice(0, separator);
    const key = metric.slice(separator + 1);
    return numberOf(scope === 'raw' ? nuclide.raw?.[key] : nuclide[key]);
  }

  function drawChart() {
    const canvas = windowRecord?.element.querySelector('#compareChartV32');
    if (!(canvas instanceof HTMLCanvasElement) || activeTab !== 'chart') return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(520, Math.floor(rect.width * dpr));
    const height = Math.max(300, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const context = canvas.getContext('2d');
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue('--ink').trim() || '#222';
    const muted = css.getPropertyValue('--muted').trim() || '#777';
    const line = css.getPropertyValue('--line').trim() || '#ddd';
    const accent = css.getPropertyValue('--accent').trim() || '#5d5af6';
    context.clearRect(0, 0, width, height);
    const values = [...items.values()].map(nuclide => ({ nuclide, value: metricValue(nuclide, selectedMetric) }));
    const valid = values.filter(item => Number.isFinite(item.value) && (selectedScale !== 'log' || item.value > 0));
    const pad = { left: 72 * dpr, right: 24 * dpr, top: 28 * dpr, bottom: 72 * dpr };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    context.strokeStyle = line; context.lineWidth = dpr;
    context.beginPath(); context.moveTo(pad.left, pad.top); context.lineTo(pad.left, pad.top + plotH); context.lineTo(pad.left + plotW, pad.top + plotH); context.stroke();
    if (!valid.length) {
      context.fillStyle = muted; context.font = `${12 * dpr}px system-ui`; context.textAlign = 'center';
      context.fillText('No hay valores numéricos comparables para esta propiedad.', width / 2, height / 2);
      return;
    }
    const transformed = valid.map(item => selectedScale === 'log' ? Math.log10(item.value) : item.value);
    let min = selectedScale === 'log' ? Math.min(...transformed) : Math.min(...transformed, 0);
    let max = selectedScale === 'log' ? Math.max(...transformed) : Math.max(...transformed, 0);
    if (min === max) { min -= Math.abs(min || 1) * .1; max += Math.abs(max || 1) * .1; }
    const baselineRatio = selectedScale === 'log' ? 0 : (0 - min) / (max - min);
    const baselineY = pad.top + plotH - baselineRatio * plotH;
    for (let tick = 0; tick <= 5; tick++) {
      const ratio = tick / 5;
      const y = pad.top + plotH - ratio * plotH;
      const transformedValue = min + ratio * (max - min);
      const shown = selectedScale === 'log' ? 10 ** transformedValue : transformedValue;
      context.strokeStyle = line; context.globalAlpha = .65;
      context.beginPath(); context.moveTo(pad.left, y); context.lineTo(pad.left + plotW, y); context.stroke();
      context.globalAlpha = 1; context.fillStyle = muted; context.font = `${10 * dpr}px system-ui`; context.textAlign = 'right';
      context.fillText(Number(shown.toPrecision(4)).toLocaleString('es-ES'), pad.left - 8 * dpr, y + 3 * dpr);
    }
    const slot = plotW / values.length;
    values.forEach((item, index) => {
      const raw = item.value;
      if (!Number.isFinite(raw) || (selectedScale === 'log' && raw <= 0)) return;
      const transformedValue = selectedScale === 'log' ? Math.log10(raw) : raw;
      const ratio = (transformedValue - min) / (max - min);
      const barW = Math.max(8 * dpr, Math.min(64 * dpr, slot * .58));
      const x = pad.left + index * slot + (slot - barW) / 2;
      const y = pad.top + plotH - ratio * plotH;
      context.fillStyle = accent; context.globalAlpha = .82;
      context.fillRect(x, Math.min(y, baselineY), barW, Math.max(dpr, Math.abs(baselineY - y)));
      context.globalAlpha = 1; context.fillStyle = ink; context.font = `600 ${10 * dpr}px system-ui`; context.textAlign = 'center';
      context.save(); context.translate(x + barW / 2, pad.top + plotH + 12 * dpr); context.rotate(-Math.PI / 5);
      context.fillText(`${item.nuclide.symbol}-${item.nuclide.a}`, 0, 0); context.restore();
    });
  }

  function renderChart(host) {
    const toolbar = document.createElement('div');
    toolbar.className = 'compare-chart-tools-v32';
    const propertyLabel = document.createElement('label');
    propertyLabel.appendChild(document.createTextNode('Propiedad'));
    const select = document.createElement('select');
    const options = metricOptions();
    if (!options.has(selectedMetric)) selectedMetric = options.keys().next().value;
    options.forEach((label, value) => {
      const option = document.createElement('option'); option.value = value; option.textContent = label; option.selected = value === selectedMetric; select.appendChild(option);
    });
    select.addEventListener('change', () => { selectedMetric = select.value; drawChart(); });
    propertyLabel.appendChild(select);
    const scaleLabel = document.createElement('label');
    scaleLabel.appendChild(document.createTextNode('Escala'));
    const scale = document.createElement('select');
    [['linear', 'Lineal'], ['log', 'Logarítmica']].forEach(([value, label]) => {
      const option = document.createElement('option'); option.value = value; option.textContent = label; option.selected = value === selectedScale; scale.appendChild(option);
    });
    scale.addEventListener('change', () => { selectedScale = scale.value; drawChart(); });
    scaleLabel.appendChild(scale);
    toolbar.append(propertyLabel, scaleLabel);
    const canvas = document.createElement('canvas');
    canvas.id = 'compareChartV32'; canvas.className = 'compare-chart-v32';
    host.append(toolbar, canvas);
    requestAnimationFrame(drawChart);
  }

  function setActiveTab(tab) {
    activeTab = tab;
    render();
  }

  function render() {
    if (!windowRecord?.element.isConnected) return;
    const element = windowRecord.element;
    const count = items.size;
    const subtitle = element.querySelector('[data-compare-subtitle]');
    if (subtitle) subtitle.textContent = `${count} nucleido${count === 1 ? '' : 's'} seleccionado${count === 1 ? '' : 's'}`;
    element.querySelectorAll('[data-compare-tab]').forEach(button => button.classList.toggle('active', button.dataset.compareTab === activeTab));
    const host = element.querySelector('.compare-content-v32');
    host.replaceChildren();
    if (!count) {
      host.appendChild(makeCell('p', 'Añade nucleidos desde el icono de comparación de cualquier ficha.', 'compare-empty-v32'));
      return;
    }
    if (activeTab === 'summary') renderSummary(host);
    else if (activeTab === 'all') renderAll(host);
    else if (activeTab === 'raw') renderRaw(host);
    else renderChart(host);
  }

  function createWindow() {
    const element = document.createElement('section');
    element.id = 'nuclideComparatorV32';
    element.className = 'nuclide-comparator-v32 managed-window-v32';
    element.setAttribute('aria-label', 'Comparador de nucleidos');
    const record = api.register(element, 'comparator', 'Comparador de nucleidos', {
      id: 'nuclide-comparator-v32', removeOnClose: true,
      onClose: () => { resizeObserver?.disconnect(); resizeObserver = null; windowRecord = null; }
    });
    const header = document.createElement('header');
    header.className = 'window-header-v32';
    header.innerHTML = '<div class="window-title-v32"><strong>Comparador de nucleidos</strong><span data-compare-subtitle>0 nucleidos seleccionados</span></div>';
    header.appendChild(api.controls(record));
    const tabs = document.createElement('nav');
    tabs.className = 'compare-tabs-v32';
    [['summary', 'Resumen'], ['all', 'Todos los datos'], ['raw', 'Datos oficiales'], ['chart', 'Gráfica']].forEach(([id, label]) => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.compareTab = id; button.textContent = label;
      button.addEventListener('click', event => { event.stopPropagation(); setActiveTab(id); }); tabs.appendChild(button);
    });
    const actions = document.createElement('div');
    actions.className = 'compare-actions-v32';
    const clear = document.createElement('button'); clear.type = 'button'; clear.textContent = 'Vaciar comparación';
    clear.addEventListener('click', () => { items.clear(); render(); }); actions.appendChild(clear);
    const content = document.createElement('div'); content.className = 'compare-content-v32';
    element.append(header, tabs, actions, content);
    document.body.appendChild(element);
    api.applyGeometry(element, api.safeGeometry(1180, 720));
    api.drag(record, header);
    api.resizeHandles(record, 620, 380);
    resizeObserver = new ResizeObserver(() => requestAnimationFrame(drawChart));
    resizeObserver.observe(element);
    windowRecord = record;
    return record;
  }

  api.addToComparator = nuclide => {
    if (!nuclide) return;
    items.set(nuclide.uid, nuclide);
    const record = windowRecord?.element.isConnected ? windowRecord : createWindow();
    if (record.minimized) api.restore(record);
    render();
    api.focus(record);
  };

  api.comparatorItems = items;
})();
