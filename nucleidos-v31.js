(() => {
  'use strict';

  const VERSION = '31.0.0';
  const V30_URL = 'nucleidos-v30.js?v=30.0.0';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const runtime = {
    ready: false,
    zIndex: 520,
    windows: new Set(),
    minimized: [],
    dimCanvas: null,
    dimCtx: null,
    dimFrame: 0,
    renderTimer: 0,
    graphPopover: null,
    graphButton: null,
    filter: {
      zMin: 1, zMax: 130, nMin: 0, nMax: 320, aMin: 1, aMax: 450,
      zParity: 'any', nParity: 'any', property: 'atomic_mass', low: 0, high: 1000,
      domainMin: 0, domainMax: 1, log: false, enabled: false
    }
  };

  const PROPERTY_DEFS = {
    atomic_mass: { label: 'Masa atómica', unit: 'u', fields: ['atomic_mass'], mass: true },
    half_life_sec: { label: 'Vida media', unit: 's', fields: ['half_life_sec'], log: true },
    binding: { label: 'Energía de enlace', unit: 'keV/n', fields: ['binding'] },
    mass_excess: { label: 'Exceso de masa', unit: 'keV', fields: ['massexcess', 'mass_excess'] },
    qa: { label: 'Qα', unit: 'keV', fields: ['qa'] },
    qbm: { label: 'Qβ−', unit: 'keV', fields: ['qbm'] },
    qec: { label: 'QEC', unit: 'keV', fields: ['qec'] },
    sn: { label: 'Separación neutrónica Sₙ', unit: 'keV', fields: ['sn'] },
    sp: { label: 'Separación protónica Sₚ', unit: 'keV', fields: ['sp'] },
    abundance: { label: 'Abundancia natural', unit: '%', fields: ['abundance'] },
    radius: { label: 'Radio de carga', unit: 'fm', fields: ['radius'] },
    neutron_excess: { label: 'Exceso neutrónico N−Z', unit: '', derived: n => n.n - n.z },
    nz_ratio: { label: 'Razón N/Z', unit: '', derived: n => n.n / Math.max(1, n.z) },
    discovery: { label: 'Año de descubrimiento', unit: 'año', fields: ['discovery'], year: true }
  };

  const GUIDE_CHAPTERS = [
    {
      group: 'Interfaz unificada',
      title: '28. Un único sistema de filtros',
      body: `<p>Los filtros de modo de desintegración y clase del dato ya no aparecen duplicados. La fila coloreada principal continúa siendo la referencia visual: cada opción conserva el color del mapa y comunica inmediatamente qué categoría se está atenuando.</p><p>La sección avanzada queda reservada para criterios que no existían en la leyenda original: intervalos de Z, N y A, paridad y rango numérico de una propiedad. De esta forma cada criterio tiene un único control y se evita aplicar dos lógicas contradictorias sobre el mismo conjunto.</p>`
    },
    {
      group: 'Interfaz unificada',
      title: '29. Atenuar no es eliminar',
      body: `<p>Cuando un nucleido no supera un filtro avanzado permanece en su posición, pero recibe una capa gris. Esta decisión mantiene la topología de la carta: siguen siendo visibles los huecos, la forma del valle de estabilidad y la relación espacial con los nucleidos vecinos.</p><p>Ocultar completamente puede ser útil para exportaciones o consultas estrictas, pero durante la exploración produce saltos visuales y puede confundirse con ausencia de datos. En Nucleidos, los filtros principales y avanzados priorizan la atenuación; las capas Evaluados, Isómeros y No observados sí pueden retirar conjuntos completos porque representan fuentes distintas.</p>`
    },
    {
      group: 'Filtros avanzados',
      title: '30. Intervalos de Z, N y A',
      body: `<p>Z es el número de protones, N el número de neutrones y A=Z+N el número másico. Los límites mínimo y máximo permiten definir una región nuclear sin perder el contexto externo, que queda atenuado.</p><p>Un intervalo estrecho de Z compara pocos elementos; un intervalo estrecho de N selecciona bandas isotónicas; un intervalo de A crea diagonales sobre la carta porque diferentes combinaciones de Z y N pueden compartir el mismo número másico.</p>`
    },
    {
      group: 'Filtros avanzados',
      title: '31. Paridad de protones y neutrones',
      body: `<p>Los botones Todos, Par e Impar permiten estudiar los cuatro grupos par–par, par–impar, impar–par e impar–impar. Los nucleidos par–par suelen mostrar mayor estabilidad por la energía de apareamiento; los impar–impar estables son mucho menos frecuentes.</p><p>La paridad se combina con todos los demás criterios. Por ejemplo, Z par y N par junto con un intervalo de energía de enlace permite aislar tendencias de apareamiento sin destruir la geometría completa de la carta.</p>`
    },
    {
      group: 'Filtros avanzados',
      title: '32. Selector de propiedad y rango de dos extremos',
      body: `<p>El selector elige una magnitud numérica. La barra posee dos tiradores: el izquierdo fija el mínimo aceptado y el derecho el máximo. La banda coloreada representa el intervalo activo.</p><p>Para la vida media el recorrido se calcula en log₁₀ porque sus valores cubren muchos órdenes de magnitud. Para el resto se usa una escala lineal recortada de forma robusta entre percentiles para que unos pocos valores extremos no inutilicen el control.</p>`
    },
    {
      group: 'Gráficos',
      title: '33. Botón independiente de gráficos y trayectorias',
      body: `<p>Los gráficos tienen un botón propio situado a la izquierda de Capas. El panel de Capas vuelve a concentrarse en mapas, filtros y capas; el panel de Gráficos reúne perfiles por Z/N, cadenas y campo de decaimiento.</p><p>Esta separación no desconecta los datos: los gráficos siguen leyendo la misma carta, la misma selección y las mismas propiedades. Únicamente evita que el menú científico principal crezca hasta convertirse en una ventana difícil de recorrer.</p>`
    },
    {
      group: 'Ventanas',
      title: '34. Ventana activa y orden de superposición',
      body: `<p>Cada ficha y cada gráfico se comporta como una ventana. Al pulsarla pasa al frente y recibe un borde de actividad. El orden se actualiza con un contador de profundidad, por lo que la última ventana utilizada queda por encima de las demás.</p><p>Las flechas de decaimiento se dibujan en una capa inferior a las ventanas. Así permanecen sobre la carta, pero nunca atraviesan un gráfico ni una ficha técnica.</p>`
    },
    {
      group: 'Ventanas',
      title: '35. Minimizar y restaurar',
      body: `<p>El botón de minimizar reduce la ventana a una barra compacta situada en la bandeja inferior. Los cálculos y la selección permanecen activos; solo se oculta el contenido visual.</p><p>Al pulsar Restaurar, la ventana recupera su geometría anterior y vuelve al frente. Esta función permite conservar una ficha de referencia mientras se trabaja con uno o dos perfiles sin cerrar información útil.</p>`
    },
    {
      group: 'Ventanas',
      title: '36. Redimensionamiento desde ocho zonas',
      body: `<p>Las ventanas pueden redimensionarse desde los cuatro lados y las cuatro esquinas. Cada borde modifica únicamente la dimensión correspondiente; las esquinas combinan anchura y altura.</p><p>Se aplican límites mínimos para que cabecera, controles y ejes continúen siendo legibles. También se impide que la ventana crezca fuera del viewport, evitando perder los controles de restauración.</p>`
    },
    {
      group: 'Ventanas',
      title: '37. Maximización segura',
      body: `<p>Maximizar ya no coloca la cabecera debajo de la barra global. La ventana ocupa el área útil situada bajo las herramientas superiores y conserva un margen de seguridad en todos los lados.</p><p>El mismo botón restaura el tamaño anterior. La maximización modifica la ventana, mientras que el zoom modifica el dominio matemático de la gráfica; son operaciones diferentes.</p>`
    },
    {
      group: 'Gráficos',
      title: '38. Indicador compacto de zoom',
      body: `<p>Los botones + y − de la cabecera se han retirado porque la rueda ofrece un control más preciso. El indicador porcentual muestra aproximadamente cuánto se ha ampliado el dominio respecto a la vista completa.</p><p>Pulsar el porcentaje restablece el 100%. También puede usarse doble clic sobre la gráfica. El porcentaje no cambia al mover la ventana ni al redimensionarla; solo cambia al ampliar o reducir los ejes.</p>`
    },
    {
      group: 'Decaimiento',
      title: '39. Separación entre carta, flechas y ventanas',
      body: `<p>El campo y la cadena pertenecen a la carta, por lo que se dibujan sobre los nucleidos. Las ventanas informativas forman otra capa superior y poseen un fondo opaco. Esta jerarquía evita que una flecha parezca formar parte de un perfil.</p><p>Cuando una ventana pasa al frente, su z-index aumenta, pero la capa de decaimiento permanece estable. El resultado es predecible incluso con ficha, dos gráficos y menú de propiedades abiertos simultáneamente.</p>`
    },
    {
      group: 'Flujo de trabajo',
      title: '40. Ejemplo de análisis combinado',
      body: `<p>1) Selecciona Vida media como mapa. 2) Limita Z y N al área de interés. 3) Ajusta el rango de vida media con la barra doble. 4) Abre Perfil por N desde el botón de gráficos. 5) Pasa el cursor sobre un elemento para destacar su cadena isotópica. 6) Selecciona un punto y activa Cadena seleccionada.</p><p>La carta conserva el contexto en gris, el perfil muestra la tendencia cuantitativa y las flechas explican el desplazamiento nuclear predominante. Ninguna de estas vistas sustituye la consulta de incertidumbres y ramificaciones en la ficha o en ENSDF.</p>`
    },
    {
      group: 'Flujo de trabajo',
      title: '41. Buenas prácticas con varias ventanas',
      body: `<p>Mantén al frente la ventana que estés interpretando y minimiza las referencias secundarias. Maximiza un perfil solo cuando necesites leer estructuras finas; después restáuralo para recuperar la carta.</p><p>Evita combinar alta densidad del campo de decaimiento con muchos perfiles abiertos. La herramienta permite hacerlo, pero una visualización científicamente útil debe reducir el ruido y conservar una pregunta concreta.</p>`
    }
  ];

  function ensureScript(id, src) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        if (existing.dataset.loaded === '1' || document.documentElement.dataset.nucleidosRuntime === '30.0.0') resolve();
        else existing.addEventListener('load', resolve, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = false;
      script.addEventListener('load', () => { script.dataset.loaded = '1'; resolve(); }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.body.appendChild(script);
    });
  }

  async function waitFor(test, timeout = 15000) {
    const start = performance.now();
    while (performance.now() - start < timeout) {
      try { if (test()) return true; } catch (_) {}
      await new Promise(resolve => setTimeout(resolve, 60));
    }
    return false;
  }

  function parseNumber(value) {
    if (value == null || value === '') return NaN;
    const match = String(value).replace(',', '.').match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    return match ? Number(match[0]) : NaN;
  }

  function rawValue(nuclide, fields) {
    for (const field of fields || []) {
      const value = nuclide?.raw?.[field] ?? nuclide?.[field];
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return '';
  }

  function propertyValue(nuclide, key) {
    const def = PROPERTY_DEFS[key];
    if (!def || !nuclide) return NaN;
    if (def.derived) return def.derived(nuclide);
    let value = parseNumber(rawValue(nuclide, def.fields));
    if (def.mass && Number.isFinite(value) && Math.abs(value) > 100000) value /= 1_000_000;
    if (def.year) {
      const match = String(rawValue(nuclide, def.fields)).match(/(?:18|19|20)\d{2}/);
      value = match ? Number(match[0]) : NaN;
    }
    return value;
  }

  function transformedValue(nuclide) {
    const value = propertyValue(nuclide, runtime.filter.property);
    if (!Number.isFinite(value)) return NaN;
    return runtime.filter.log ? (value > 0 ? Math.log10(value) : NaN) : value;
  }

  function quantile(sorted, q) {
    if (!sorted.length) return NaN;
    const index = (sorted.length - 1) * q;
    const lo = Math.floor(index), hi = Math.ceil(index);
    return lo === hi ? sorted[lo] : sorted[lo] * (hi - index) + sorted[hi] * (index - lo);
  }

  function formatValue(value, def = PROPERTY_DEFS[runtime.filter.property]) {
    if (!Number.isFinite(value)) return '—';
    const absolute = runtime.filter.log ? 10 ** value : value;
    const text = Math.abs(absolute) >= 10000 || (Math.abs(absolute) > 0 && Math.abs(absolute) < .001)
      ? absolute.toExponential(3)
      : absolute.toLocaleString('es-ES', { maximumSignificantDigits: 6 });
    return `${text}${def?.unit ? ` ${def.unit}` : ''}`;
  }

  function layerOnlyRenderable(nuclide) {
    if (!nuclide || typeof state === 'undefined') return false;
    const cls = nuclide.dataClass || 'unknown';
    if (cls === 'evaluated' && state.layers && state.layers.evaluated === false) return false;
    if (cls === 'isomer' && state.layers && state.layers.isomer === false) return false;
    if (cls === 'theoretical' && state.layers && state.layers.theoretical === false) return false;
    return true;
  }
  layerOnlyRenderable.__v29ScientificFilter = true;
  layerOnlyRenderable.__v31UnifiedFilters = true;

  function restoreUnifiedRenderable() {
    if (typeof isRenderable !== 'function' || !isRenderable.__v31UnifiedFilters) isRenderable = layerOnlyRenderable;
  }

  function advancedPass(nuclide) {
    const filter = runtime.filter;
    if (nuclide.z < filter.zMin || nuclide.z > filter.zMax || nuclide.n < filter.nMin || nuclide.n > filter.nMax || nuclide.a < filter.aMin || nuclide.a > filter.aMax) return false;
    if (filter.zParity !== 'any' && (filter.zParity === 'even') !== (nuclide.z % 2 === 0)) return false;
    if (filter.nParity !== 'any' && (filter.nParity === 'even') !== (nuclide.n % 2 === 0)) return false;
    if (filter.enabled) {
      const value = transformedValue(nuclide);
      if (!Number.isFinite(value)) return false;
      const low = filter.domainMin + filter.low / 1000 * (filter.domainMax - filter.domainMin);
      const high = filter.domainMin + filter.high / 1000 * (filter.domainMax - filter.domainMin);
      if (value < low || value > high) return false;
    }
    return true;
  }

  function ensureDimCanvas() {
    if (runtime.dimCanvas) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'filterDimCanvasV31';
    canvas.className = 'filter-dim-canvas-v31';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    runtime.dimCanvas = canvas;
    runtime.dimCtx = canvas.getContext('2d');
  }

  function resizeDimCanvas() {
    ensureDimCanvas();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(innerWidth * dpr));
    const height = Math.max(1, Math.round(innerHeight * dpr));
    if (runtime.dimCanvas.width !== width || runtime.dimCanvas.height !== height) {
      runtime.dimCanvas.width = width;
      runtime.dimCanvas.height = height;
    }
    runtime.dimCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function renderDimLayer() {
    if (typeof state === 'undefined' || typeof cellRect !== 'function' || typeof sx !== 'function' || typeof sy !== 'function') return;
    resizeDimCanvas();
    const ctx = runtime.dimCtx;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let inside = 0, dimmed = 0;
    const scale = Number.isFinite(state.scale) ? state.scale : 1;
    const width = (typeof CELL_W === 'number' ? CELL_W : 82) * scale;
    const height = (typeof CELL_H === 'number' ? CELL_H : 72) * scale;
    for (const nuclide of state.all || []) {
      if (!layerOnlyRenderable(nuclide)) continue;
      const rect = cellRect(nuclide.z, nuclide.n);
      const x = sx(rect.x), y = sy(rect.y);
      if (x + width < -4 || x > innerWidth + 4 || y + height < -4 || y > innerHeight + 4) continue;
      if (advancedPass(nuclide)) { inside++; continue; }
      dimmed++;
      ctx.fillStyle = document.body.classList.contains('dark') ? 'rgba(20,22,27,.66)' : 'rgba(230,229,226,.72)';
      const radius = Math.max(1, Math.min(7, 7 * scale));
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, width, height, radius);
      else ctx.rect(x, y, width, height);
      ctx.fill();
      ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    const count = $('#advancedFilterCountV31');
    if (count) count.textContent = `${inside.toLocaleString('es-ES')} dentro · ${dimmed.toLocaleString('es-ES')} atenuados`;
  }

  function requestDimRender() {
    if (runtime.dimFrame) return;
    runtime.dimFrame = requestAnimationFrame(() => {
      runtime.dimFrame = 0;
      renderDimLayer();
    });
  }

  function setupPropertyDomain(resetHandles = true) {
    const def = PROPERTY_DEFS[runtime.filter.property];
    runtime.filter.log = Boolean(def?.log);
    const values = (state.all || []).map(nuclide => {
      const value = propertyValue(nuclide, runtime.filter.property);
      return runtime.filter.log ? (value > 0 ? Math.log10(value) : NaN) : value;
    }).filter(Number.isFinite).sort((a, b) => a - b);
    let min = quantile(values, .01), max = quantile(values, .99);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      min = values[0] ?? 0;
      max = values.at(-1) ?? 1;
      if (min === max) max = min + 1;
    }
    runtime.filter.domainMin = min;
    runtime.filter.domainMax = max;
    if (resetHandles) { runtime.filter.low = 0; runtime.filter.high = 1000; runtime.filter.enabled = false; }
    syncPropertyRangeUi();
  }

  function syncPropertyRangeUi() {
    const low = $('#propertyLowV31'), high = $('#propertyHighV31');
    if (low) low.value = String(runtime.filter.low);
    if (high) high.value = String(runtime.filter.high);
    const lowValue = runtime.filter.domainMin + runtime.filter.low / 1000 * (runtime.filter.domainMax - runtime.filter.domainMin);
    const highValue = runtime.filter.domainMin + runtime.filter.high / 1000 * (runtime.filter.domainMax - runtime.filter.domainMin);
    const lowOut = $('#propertyLowOutputV31'), highOut = $('#propertyHighOutputV31');
    if (lowOut) lowOut.textContent = formatValue(lowValue);
    if (highOut) highOut.textContent = formatValue(highValue);
    const track = $('#propertyRangeTrackV31');
    if (track) {
      track.style.setProperty('--range-start', `${runtime.filter.low / 10}%`);
      track.style.setProperty('--range-end', `${runtime.filter.high / 10}%`);
    }
    const enabled = $('#propertyRangeEnabledV31');
    if (enabled) enabled.checked = runtime.filter.enabled;
  }

  function createAdvancedFilters() {
    const legend = $('#legend');
    const section = legend?.closest('.popover-section');
    if (!legend || !section) return;
    $('#scientificFiltersV29')?.remove();
    if ($('#advancedFiltersV31')) return;

    const panel = document.createElement('div');
    panel.id = 'advancedFiltersV31';
    panel.className = 'advanced-filters-v31';
    panel.innerHTML = `
      <div class="advanced-filter-heading-v31"><strong>Filtros avanzados</strong><button id="resetAdvancedFiltersV31" type="button">Restablecer</button></div>
      <div class="coordinate-ranges-v31">
        ${['Z','N','A'].map(axis => `<fieldset><legend>${axis}</legend><label>Mín.<input id="filter${axis}MinV31" type="number"></label><label>Máx.<input id="filter${axis}MaxV31" type="number"></label></fieldset>`).join('')}
      </div>
      <details class="parity-details-v33">
        <summary>Paridad Z/N <span>opcional</span></summary>
        <div class="parity-row-v31">
          <div><span>Paridad Z</span><nav data-parity-axis="z">${['any:Todos','even:Par','odd:Impar'].map(item => { const [value,label]=item.split(':'); return `<button type="button" data-value="${value}" class="${value==='any'?'active':''}">${label}</button>`; }).join('')}</nav></div>
          <div><span>Paridad N</span><nav data-parity-axis="n">${['any:Todos','even:Par','odd:Impar'].map(item => { const [value,label]=item.split(':'); return `<button type="button" data-value="${value}" class="${value==='any'?'active':''}">${label}</button>`; }).join('')}</nav></div>
        </div>
      </details>
      <div class="property-range-v31">
        <label>Propiedad<select id="propertyFilterSelectV31">${Object.entries(PROPERTY_DEFS).map(([key, def]) => `<option value="${key}">${def.label}</option>`).join('')}</select></label>
        <label class="property-enable-v31"><input id="propertyRangeEnabledV31" type="checkbox"> Aplicar rango numérico</label>
        <div id="propertyRangeTrackV31" class="dual-range-v31">
          <input id="propertyLowV31" type="range" min="0" max="1000" value="0" aria-label="Límite inferior">
          <input id="propertyHighV31" type="range" min="0" max="1000" value="1000" aria-label="Límite superior">
        </div>
        <div class="property-range-values-v31"><output id="propertyLowOutputV31">—</output><output id="propertyHighOutputV31">—</output></div>
      </div>
      <strong id="advancedFilterCountV31" class="advanced-filter-count-v31">—</strong>`;
    section.appendChild(panel);

    const bounds = { Z: [1, 130], N: [0, 320], A: [1, 450] };
    for (const axis of ['Z','N','A']) {
      const [min,max] = bounds[axis];
      const minInput = $(`#filter${axis}MinV31`), maxInput = $(`#filter${axis}MaxV31`);
      minInput.value = min; maxInput.value = max;
      minInput.min = 0; maxInput.min = 0;
      const apply = () => {
        const key = axis.toLowerCase();
        runtime.filter[`${key}Min`] = Number(minInput.value || min);
        runtime.filter[`${key}Max`] = Number(maxInput.value || max);
        requestDimRender();
      };
      minInput.addEventListener('input', apply); maxInput.addEventListener('input', apply);
    }

    $$('.parity-row-v31 nav').forEach(nav => nav.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      $$('button', nav).forEach(node => node.classList.toggle('active', node === button));
      runtime.filter[`${nav.dataset.parityAxis}Parity`] = button.dataset.value;
      requestDimRender();
    }));

    $('#propertyFilterSelectV31').addEventListener('change', event => {
      runtime.filter.property = event.target.value;
      const graphProperty = $('#overlayPropertyV29');
      if (graphProperty && [...graphProperty.options].some(option => option.value === event.target.value)) {
        graphProperty.value = event.target.value;
        graphProperty.dispatchEvent(new Event('change', { bubbles: true }));
      }
      setupPropertyDomain(true);
      requestDimRender();
    });
    $('#propertyRangeEnabledV31').addEventListener('change', event => { runtime.filter.enabled = event.target.checked; requestDimRender(); });
    const updateRange = event => {
      let low = Number($('#propertyLowV31').value), high = Number($('#propertyHighV31').value);
      if (event.target.id === 'propertyLowV31') low = Math.min(low, high - 1);
      else high = Math.max(high, low + 1);
      runtime.filter.low = clamp(low, 0, 999); runtime.filter.high = clamp(high, 1, 1000);
      runtime.filter.enabled = true;
      syncPropertyRangeUi(); requestDimRender();
    };
    $('#propertyLowV31').addEventListener('input', updateRange);
    $('#propertyHighV31').addEventListener('input', updateRange);
    $('#resetAdvancedFiltersV31').addEventListener('click', resetAdvancedFilters);
    setupPropertyDomain(true);
  }

  function resetAdvancedFilters() {
    Object.assign(runtime.filter, { zMin:1,zMax:130,nMin:0,nMax:320,aMin:1,aMax:450,zParity:'any',nParity:'any',low:0,high:1000,enabled:false });
    for (const [axis,min,max] of [['Z',1,130],['N',0,320],['A',1,450]]) {
      $(`#filter${axis}MinV31`).value = min; $(`#filter${axis}MaxV31`).value = max;
    }
    $$('.parity-row-v31 nav').forEach(nav => $$('button', nav).forEach(button => button.classList.toggle('active', button.dataset.value === 'any')));
    setupPropertyDomain(true); requestDimRender();
  }

  function createGraphPopover() {
    const section = $('#chartOverlaysV29');
    const legendButton = $('#legendButton');
    const toolbar = legendButton?.parentElement;
    if (!section || !legendButton || !toolbar || runtime.graphPopover) return;

    const button = document.createElement('button');
    button.id = 'graphsButtonV31';
    button.className = 'tool-button graphs-button-v31';
    button.type = 'button';
    button.title = 'Gráficos y trayectorias';
    button.setAttribute('aria-label', 'Abrir gráficos y trayectorias');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<svg class="material-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16v2H4v-2Zm1-2V9h3v8H5Zm5 0V4h3v13h-3Zm5 0v-6h3v6h-3Z"/></svg>';
    toolbar.insertBefore(button, legendButton);

    const popover = document.createElement('div');
    popover.id = 'graphsPopoverV31';
    popover.className = 'graphs-popover-v31 popover';
    popover.setAttribute('aria-hidden', 'true');
    popover.innerHTML = '<header><div><span>Análisis nuclear</span><h2>Gráficos y trayectorias</h2></div><button type="button" data-close-graphs aria-label="Cerrar">×</button></header><div class="graphs-popover-scroll-v31"></div>';
    popover.querySelector('.graphs-popover-scroll-v31').appendChild(section);
    document.body.appendChild(popover);
    runtime.graphPopover = popover; runtime.graphButton = button;

    const close = () => { popover.classList.remove('open'); popover.setAttribute('aria-hidden','true'); button.setAttribute('aria-expanded','false'); };
    const toggle = event => {
      event.preventDefault(); event.stopPropagation();
      const open = !popover.classList.contains('open');
      popover.classList.toggle('open', open); popover.setAttribute('aria-hidden', String(!open)); button.setAttribute('aria-expanded', String(open));
      if (open) focusLayer(popover);
    };
    button.addEventListener('click', toggle);
    popover.querySelector('[data-close-graphs]').addEventListener('click', close);
    document.addEventListener('pointerdown', event => { if (popover.classList.contains('open') && !popover.contains(event.target) && !button.contains(event.target)) close(); }, true);
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });

    const mobileGrid = $('.mobile-menu-grid');
    if (mobileGrid && !$('#mobileGraphsButtonV31')) {
      const mobile = document.createElement('button');
      mobile.id = 'mobileGraphsButtonV31'; mobile.className = 'mobile-menu-action'; mobile.type = 'button';
      mobile.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16v2H4v-2Zm1-2V9h3v8H5Zm5 0V4h3v13h-3Zm5 0v-6h3v6h-3Z"/></svg><span>Gráficos</span>';
      mobile.addEventListener('click', () => button.click());
      mobileGrid.appendChild(mobile);
    }
  }

  function focusLayer(element) {
    runtime.zIndex += 1;
    element.style.zIndex = String(runtime.zIndex);
  }

  function focusWindow(element) {
    runtime.windows.forEach(windowElement => windowElement.classList.toggle('window-active-v31', windowElement === element));
    focusLayer(element);
  }

  function rememberGeometry(element) {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }

  function makeFree(element) {
    if (element.dataset.v31Free === '1') return;
    const rect = rememberGeometry(element);
    element.dataset.v31Free = '1';
    element.classList.add('free-window-v31');
    Object.assign(element.style, { position:'fixed', left:`${rect.left}px`, top:`${rect.top}px`, width:`${rect.width}px`, height:`${rect.height}px`, right:'auto', bottom:'auto' });
  }

  function addResizeHandles(element, minWidth, minHeight) {
    if (element.querySelector('.resize-handles-v31')) return;
    const host = document.createElement('div'); host.className = 'resize-handles-v31';
    for (const direction of ['n','ne','e','se','s','sw','w','nw']) {
      const handle = document.createElement('div'); handle.className = `resize-handle-v31 resize-${direction}-v31`; handle.dataset.resize = direction; host.appendChild(handle);
    }
    element.appendChild(host);
    host.addEventListener('pointerdown', event => {
      const handle = event.target.closest('[data-resize]');
      if (!handle || element.classList.contains('window-minimized-v31') || element.classList.contains('safe-maximized-v31')) return;
      makeFree(element); focusWindow(element);
      const rect = rememberGeometry(element), direction = handle.dataset.resize;
      const start = { x:event.clientX, y:event.clientY, rect, direction, id:event.pointerId };
      handle.setPointerCapture?.(event.pointerId); element.classList.add('resizing-v31');
      const move = moveEvent => {
        if (moveEvent.pointerId !== start.id) return;
        const dx = moveEvent.clientX - start.x, dy = moveEvent.clientY - start.y;
        let left = rect.left, top = rect.top, width = rect.width, height = rect.height;
        if (direction.includes('e')) width = clamp(rect.width + dx, minWidth, innerWidth - rect.left - 6);
        if (direction.includes('s')) height = clamp(rect.height + dy, minHeight, innerHeight - rect.top - 6);
        if (direction.includes('w')) { const next = clamp(rect.width - dx, minWidth, rect.right - 6); left = rect.right - next; width = next; }
        if (direction.includes('n')) { const next = clamp(rect.height - dy, minHeight, rect.bottom - 64); top = rect.bottom - next; height = next; }
        Object.assign(element.style, { left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px` });
        element.dispatchEvent(new Event('resize'));
      };
      const end = endEvent => {
        if (endEvent.pointerId !== start.id) return;
        handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', end); handle.removeEventListener('pointercancel', end);
        element.classList.remove('resizing-v31'); window.dispatchEvent(new Event('resize'));
      };
      handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
      event.preventDefault(); event.stopPropagation();
    });
  }

  function recalcMinimized() {
    runtime.minimized = runtime.minimized.filter(element => element.isConnected && element.classList.contains('window-minimized-v31'));
    runtime.minimized.forEach((element, index) => {
      element.style.left = `${12 + index * 274}px`;
      element.style.bottom = '12px'; element.style.top = 'auto';
    });
  }

  function minimizeWindow(element) {
    if (element.classList.contains('window-minimized-v31')) return restoreWindow(element);
    element.__v31Restore = { geometry: rememberGeometry(element), maximized: element.classList.contains('safe-maximized-v31') };
    element.classList.remove('safe-maximized-v31','maximized-v30');
    makeFree(element); element.classList.add('window-minimized-v31');
    element.style.width = '260px'; element.style.height = '42px';
    runtime.minimized.push(element); recalcMinimized(); focusWindow(element);
  }

  function restoreWindow(element) {
    const restore = element.__v31Restore;
    element.classList.remove('window-minimized-v31');
    runtime.minimized = runtime.minimized.filter(item => item !== element); recalcMinimized();
    if (restore?.geometry) Object.assign(element.style, { left:`${restore.geometry.left}px`, top:`${restore.geometry.top}px`, width:`${restore.geometry.width}px`, height:`${restore.geometry.height}px`, bottom:'auto', right:'auto' });
    focusWindow(element); window.dispatchEvent(new Event('resize'));
  }

  function safeMaximize(element, button) {
    if (element.classList.contains('safe-maximized-v31')) {
      const rect = element.__v31MaxRestore;
      element.classList.remove('safe-maximized-v31','maximized-v30');
      if (rect) Object.assign(element.style, { left:`${rect.left}px`, top:`${rect.top}px`, width:`${rect.width}px`, height:`${rect.height}px`, right:'auto', bottom:'auto' });
      if (button) button.textContent = '□';
    } else {
      element.__v31MaxRestore = rememberGeometry(element); makeFree(element);
      const top = Math.max(68, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--window-safe-top-v31')) || 68);
      element.classList.add('safe-maximized-v31'); element.classList.remove('maximized-v30');
      Object.assign(element.style, { left:'8px', top:`${top}px`, width:'calc(100vw - 16px)', height:`calc(100dvh - ${top + 8}px)`, right:'auto', bottom:'auto' });
      if (button) button.textContent = '❐';
    }
    focusWindow(element); requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }

  function installGraphWindow(dock) {
    if (!dock || dock.dataset.v31Window) return;
    dock.dataset.v31Window = '1'; runtime.windows.add(dock); dock.classList.add('managed-window-v31');
    dock.addEventListener('pointerdown', () => focusWindow(dock), true);
    addResizeHandles(dock, 340, 230);

    const controls = dock.querySelector('.profile-window-controls-v30');
    if (controls) {
      controls.querySelectorAll('[data-graph-zoom]').forEach(button => button.classList.add('deprecated-zoom-v31'));
      const reset = controls.querySelector('[data-graph-reset]');
      if (reset) { reset.classList.add('zoom-indicator-v31'); reset.textContent = '100%'; reset.title = 'Zoom del gráfico · pulsar para restablecer'; }
      if (!controls.querySelector('[data-window-minimize]')) {
        const minimize = document.createElement('button'); minimize.type='button'; minimize.dataset.windowMinimize=''; minimize.title='Minimizar'; minimize.setAttribute('aria-label','Minimizar gráfico'); minimize.textContent='—';
        controls.insertBefore(minimize, controls.querySelector('[data-graph-maximize]'));
        minimize.addEventListener('click', event => { event.stopPropagation(); minimizeWindow(dock); });
      }
      const maximize = controls.querySelector('[data-graph-maximize]');
      maximize?.addEventListener('click', event => { event.preventDefault(); event.stopImmediatePropagation(); safeMaximize(dock, maximize); }, true);
    }

    const canvas = dock.querySelector('.profile-interactive-v30');
    if (canvas) {
      canvas.dataset.zoomPercent = '100';
      canvas.addEventListener('wheel', event => {
        const current = Number(canvas.dataset.zoomPercent || 100);
        const next = clamp(current * Math.exp(-event.deltaY * .0017), 12, 8000);
        canvas.dataset.zoomPercent = String(next);
        const indicator = dock.querySelector('.zoom-indicator-v31'); if (indicator) indicator.textContent = `${Math.round(next)}%`;
      });
      canvas.addEventListener('dblclick', () => { canvas.dataset.zoomPercent='100'; const indicator=dock.querySelector('.zoom-indicator-v31'); if(indicator) indicator.textContent='100%'; });
      dock.querySelector('.zoom-indicator-v31')?.addEventListener('click', () => { canvas.dataset.zoomPercent='100'; setTimeout(() => { const indicator=dock.querySelector('.zoom-indicator-v31'); if(indicator) indicator.textContent='100%'; },0); });
    }
  }

  function installCardWindow() {
    const card = $('#nuclideCard');
    if (!card || card.dataset.v31Window) return;
    card.dataset.v31Window='1'; runtime.windows.add(card); card.classList.add('managed-window-v31','nuclide-window-v31');
    const bar = document.createElement('header'); bar.className='card-window-bar-v31';
    bar.innerHTML = '<div><strong>Ficha del nucleido</strong><span id="cardWindowSubtitleV31">Selección activa</span></div><nav><button type="button" data-card-minimize title="Minimizar" aria-label="Minimizar ficha">—</button><button type="button" data-card-maximize title="Maximizar o restaurar" aria-label="Maximizar o restaurar">□</button></nav>';
    card.insertBefore(bar, card.firstChild);
    card.addEventListener('pointerdown', () => focusWindow(card), true);
    bar.querySelector('[data-card-minimize]').addEventListener('click', event => { event.stopPropagation(); minimizeWindow(card); });
    const maximize = bar.querySelector('[data-card-maximize]'); maximize.addEventListener('click', event => { event.stopPropagation(); safeMaximize(card, maximize); });
    addResizeHandles(card, 380, 260);

    let drag = null;
    bar.addEventListener('pointerdown', event => {
      if (event.target.closest('button') || card.classList.contains('window-minimized-v31')) return;
      makeFree(card); focusWindow(card); const rect=rememberGeometry(card);
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top}; bar.setPointerCapture?.(event.pointerId); event.preventDefault();
    });
    bar.addEventListener('pointermove', event => {
      if (!drag || drag.id!==event.pointerId) return;
      card.style.left=`${clamp(drag.left+event.clientX-drag.x,0,innerWidth-card.offsetWidth)}px`;
      card.style.top=`${clamp(drag.top+event.clientY-drag.y,64,innerHeight-card.offsetHeight)}px`;
    });
    const end=event=>{ if(drag&&drag.id===event.pointerId) drag=null; };
    bar.addEventListener('pointerup',end); bar.addEventListener('pointercancel',end);

    const update = () => {
      const symbol=$('#detailSymbol')?.textContent?.trim(), a=$('#detailA')?.textContent?.trim(), name=$('#detailName')?.textContent?.trim();
      const subtitle=$('#cardWindowSubtitleV31'); if(subtitle) subtitle.textContent=symbol&&a?`${symbol}-${a}${name?` · ${name}`:''}`:'Selección activa';
      if (card.classList.contains('open')) focusWindow(card);
    };
    new MutationObserver(update).observe(card,{attributes:true,subtree:true,childList:true,characterData:true}); update();
  }

  function installWindowManager() {
    const scan = () => {
      installGraphWindow($('#zProfileDockV29')); installGraphWindow($('#nProfileDockV29')); installCardWindow();
      const decay = $('#decayOverlayCanvasV30'); if (decay) decay.style.zIndex='72';
      const oldLayer = $('#nuclearOverlayLayerV29'); if (oldLayer) oldLayer.style.zIndex='70';
    };
    scan(); new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
    window.addEventListener('resize', () => {
      runtime.windows.forEach(element => {
        if (!element.isConnected || element.classList.contains('window-minimized-v31')) return;
        const rect=element.getBoundingClientRect();
        if (rect.right>innerWidth) element.style.left=`${Math.max(0,innerWidth-rect.width)}px`;
        if (rect.bottom>innerHeight) element.style.top=`${Math.max(64,innerHeight-rect.height)}px`;
      }); requestDimRender();
    },{passive:true});
  }

  function augmentGuide() {
    const guide = $('#analysisGuideV30');
    const nav = guide?.querySelector('.analysis-guide-sidebar-v30 nav');
    const content = guide?.querySelector('.analysis-guide-content-v30');
    if (!guide || !nav || !content || nav.dataset.v31Guide) return;
    nav.dataset.v31Guide='1';
    const divider=document.createElement('div'); divider.className='guide-module-divider-v31'; divider.textContent='Interfaz v31'; nav.appendChild(divider);
    GUIDE_CHAPTERS.forEach((chapter,index)=>{
      const button=document.createElement('button'); button.type='button'; button.dataset.v31GuideChapter=String(index);
      button.innerHTML=`<span>${chapter.group}</span>${chapter.title.replace(/^\d+\.\s*/,'')}`; nav.appendChild(button);
    });
    const render=index=>{
      const chapter=GUIDE_CHAPTERS[index];
      $$('[data-guide-chapter], [data-v31-guide-chapter]',nav).forEach(button=>button.classList.toggle('active',button.dataset.v31GuideChapter===String(index)));
      content.innerHTML=`<span class="analysis-guide-group-v30">${chapter.group}</span><h2>${chapter.title}</h2>${chapter.body}<div class="analysis-guide-pager-v30"><button data-v31-prev type="button" ${index===0?'disabled':''}>Anterior</button><span>${28+index} / ${27+GUIDE_CHAPTERS.length}</span><button data-v31-next type="button" ${index===GUIDE_CHAPTERS.length-1?'disabled':''}>Siguiente</button></div>`;
      content.querySelector('[data-v31-prev]')?.addEventListener('click',()=>render(index-1));
      content.querySelector('[data-v31-next]')?.addEventListener('click',()=>render(index+1)); content.scrollTop=0;
    };
    nav.addEventListener('click',event=>{ const button=event.target.closest('[data-v31-guide-chapter]'); if(button){ event.stopPropagation(); render(Number(button.dataset.v31GuideChapter)); } },true);
    const search=guide.querySelector('[data-guide-search]'); search?.addEventListener('input',event=>{
      const query=event.target.value.trim().toLocaleLowerCase('es');
      $$('[data-v31-guide-chapter]',nav).forEach(button=>{ const chapter=GUIDE_CHAPTERS[Number(button.dataset.v31GuideChapter)]; button.hidden=Boolean(query&&!`${chapter.group} ${chapter.title} ${chapter.body.replace(/<[^>]+>/g,' ')}`.toLocaleLowerCase('es').includes(query)); });
    });
    const launcher=$('#analysisGuideLauncherV30 span'); if(launcher) launcher.textContent=`${27+GUIDE_CHAPTERS.length} capítulos sobre perfiles, filtros y ventanas`;
  }

  function monitorView() {
    setInterval(() => {
      restoreUnifiedRenderable();
      if (typeof state === 'undefined') return;
      const signature=[state.tx?.toFixed?.(2),state.ty?.toFixed?.(2),state.scale?.toFixed?.(4),state.all?.length,document.body.classList.contains('dark')].join('|');
      if (signature!==runtime.renderTimer) { runtime.renderTimer=signature; requestDimRender(); }
    },120);
    document.addEventListener('nucleidos:dataset-changed',()=>{ setupPropertyDomain(true); requestDimRender(); });
  }

  async function init() {
    if (runtime.ready) return;
    if (document.documentElement.dataset.nucleidosRuntime !== '30.0.0') await ensureScript('nucleidos-v30-runtime-direct',V30_URL).catch(()=>{});
    const ready=await waitFor(()=>typeof state!=='undefined'&&Array.isArray(state.all)&&state.all.length&&$('#chartOverlaysV29')&&$('#zProfileDockV29')&&$('#analysisGuideV30'));
    if(!ready){ console.error('[Nucleidos v31] La interfaz v30 no terminó de inicializarse.'); return; }
    runtime.ready=true; document.documentElement.dataset.nucleidosRuntime=VERSION; document.documentElement.dataset.nucleidosPatch=VERSION;
    restoreUnifiedRenderable(); createAdvancedFilters(); createGraphPopover(); ensureDimCanvas(); installWindowManager(); augmentGuide(); monitorView(); requestDimRender();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
