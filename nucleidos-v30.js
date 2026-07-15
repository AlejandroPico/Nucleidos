(() => {
  'use strict';

  const VERSION = '30.0.0';
  const V29_URL = 'nucleidos-v29.js?v=29.0.0';
  const COLORS = {
    stable: '#5f8f58', 'beta-': '#4f7fc4', 'beta+/EC': '#c75d67', alpha: '#d3912f',
    sf: '#8a63bd', p: '#c26d3d', n: '#3c8a8a', cluster: '#9a6b3c', it: '#6769b8', unknown: '#777'
  };

  const runtime = {
    ready: false,
    graphs: new Map(),
    hoveredNuclide: null,
    hoverFrame: 0,
    decayFrame: 0,
    decaySignature: '',
    decayCanvas: null,
    decayCtx: null,
    decayStatus: null,
    guide: null,
    guideLauncher: null,
    guideChapter: 0,
    guideVisible: false,
    field: {
      scope: 'selected',
      density: 34,
      opacity: 28,
      mode: 'all',
      radius: 10
    }
  };

  const GUIDE_CHAPTERS = [
    {
      group: 'Fundamentos',
      title: '1. Qué representan los gráficos acoplados',
      body: `<p>Los perfiles acoplados son cortes unidimensionales de la carta de nucleidos. La carta principal usa dos coordenadas discretas: <strong>N</strong>, número de neutrones, y <strong>Z</strong>, número de protones. El gráfico toma una propiedad nuclear —por ejemplo vida media, energía de enlace o Qα— y la representa frente a N o frente a Z.</p><p>No es una gráfica estadística abstracta: <strong>cada punto corresponde a un nucleido concreto</strong>. Las líneas solo conectan puntos que comparten el mismo valor de la coordenada que se mantiene constante. Sirven para revelar tendencias, discontinuidades y estructuras que en el mapa de color pueden pasar desapercibidas.</p>`
    },
    {
      group: 'Fundamentos',
      title: '2. Perfil por N: lectura exacta de los ejes',
      body: `<p>En el <strong>perfil por N</strong>, el eje horizontal es el número de neutrones. Cada línea mantiene fijo el número de protones Z; por tanto, cada línea es una cadena isotópica de un elemento químico.</p><p>Ejemplo: una línea marcada como <code>Z=9</code> reúne los isótopos del flúor. Moverse hacia la derecha aumenta N y, por tanto, aumenta A=N+Z. El eje vertical muestra la propiedad seleccionada y su unidad. Para vida media, la escala automática suele ser logarítmica porque los valores abarcan muchos órdenes de magnitud.</p>`
    },
    {
      group: 'Fundamentos',
      title: '3. Perfil por Z: lectura exacta de los ejes',
      body: `<p>En el <strong>perfil por Z</strong>, el eje horizontal es el número de protones. Cada línea mantiene N constante, formando una cadena de isótonos.</p><p>Una línea marcada como <code>N=82</code> permite comparar nucleidos con el mismo número neutrónico a medida que cambia el elemento. Este tipo de corte es especialmente útil para reconocer efectos de números mágicos, cambios de apareamiento y discontinuidades asociadas al modelo de capas.</p>`
    },
    {
      group: 'Fundamentos',
      title: '4. Qué significa cada punto y cada segmento',
      body: `<p>Un punto contiene identidad nuclear, coordenadas Z/N, propiedad representada, unidad y pertenencia a una serie. El segmento entre dos puntos es una ayuda visual; <strong>no implica una transición física</strong> entre ambos nucleidos.</p><p>Las líneas conectan valores ordenados dentro de una familia isotópica o isotónica. Un salto brusco puede señalar un cambio estructural real, pero también puede deberse a un dato ausente, una incertidumbre grande, un límite experimental o una diferencia entre evaluaciones. Debe consultarse la ficha del nucleido antes de extraer conclusiones.</p>`
    },
    {
      group: 'Interacción',
      title: '5. Resaltado sincronizado desde la carta',
      body: `<p>Al situar el puntero sobre una celda de la carta, Nucleidos identifica el nucleido bajo el cursor. El perfil por N resalta la línea con su mismo Z; el perfil por Z resalta la línea con su mismo N.</p><p>Esta sincronización permite responder inmediatamente a la pregunta “¿en qué familia se encuentra este punto?”. El resaltado por simple paso del ratón es temporal. Al abandonar la celda, la gráfica recupera su estado anterior.</p>`
    },
    {
      group: 'Interacción',
      title: '6. Selección persistente y navegación cruzada',
      body: `<p>Al pulsar un punto de un perfil se selecciona el nucleido correspondiente en la carta y se abre su ficha. La línea puede fijarse desde la leyenda para conservar el contraste mientras se exploran otros puntos.</p><p>La selección persistente se diferencia del resaltado de hover: el hover sirve para inspección rápida; la selección sirve para mantener una referencia de trabajo, construir una cadena de decaimiento o comparar propiedades.</p>`
    },
    {
      group: 'Interacción',
      title: '7. Zoom del gráfico',
      body: `<p>La rueda del ratón amplía o reduce el dominio del gráfico alrededor de la posición del cursor. Con <kbd>Mayús</kbd> se modifica principalmente el eje X; con <kbd>Alt</kbd> se modifica principalmente el eje Y. Los botones − y + realizan pasos de zoom centrados.</p><p>El botón <strong>100%</strong> restablece los límites calculados a partir de los puntos visibles. El doble clic sobre el gráfico realiza el mismo restablecimiento. El zoom del perfil es independiente del zoom de la carta.</p>`
    },
    {
      group: 'Interacción',
      title: '8. Desplazamiento interno del gráfico',
      body: `<p>Después de ampliar, se puede arrastrar dentro del área del gráfico para desplazar el dominio mostrado. Este gesto mueve la ventana matemática, no la ventana flotante.</p><p>Para mover la ventana completa se arrastra su cabecera. La distinción es intencionada: cabecera = posición del panel; área de datos = navegación por los ejes.</p>`
    },
    {
      group: 'Interacción',
      title: '9. Ventanas móviles, redimensionables y maximizables',
      body: `<p>Los perfiles pueden desplazarse desde la cabecera y redimensionarse desde la esquina inferior derecha. El botón de maximizar ocupa casi todo el viewport sin ocultar permanentemente la carta; al pulsarlo de nuevo se restaura la geometría anterior.</p><p>El tamaño y la posición se mantienen durante la sesión. En pantallas pequeñas se aplican límites para que los controles de cierre y restauración sigan siendo accesibles.</p>`
    },
    {
      group: 'Interacción',
      title: '10. Sincronización con la región visible',
      body: `<p>Con “sincronizar perfiles con la vista actual” activado, los puntos se recalculan usando solamente los nucleidos que se encuentran en la región visible de la carta y que superan los filtros activos.</p><p>Esto equivale a realizar un recorte interactivo. Al desplazar o ampliar la carta cambia la población del perfil. Al desactivar la sincronización, el gráfico utiliza todo el conjunto actualmente filtrado.</p>`
    },
    {
      group: 'Escalas',
      title: '11. Escala lineal y escala logarítmica',
      body: `<p>Una escala lineal conserva diferencias absolutas. Una escala logarítmica conserva razones y es adecuada cuando los valores abarcan muchos órdenes de magnitud.</p><p>Para la vida media se representa habitualmente <code>log₁₀(T½/s)</code>. Un incremento vertical de una unidad significa multiplicar la vida media por diez. Los valores no positivos no pueden representarse en logaritmo y se omiten.</p>`
    },
    {
      group: 'Escalas',
      title: '12. Vida media: interpretación correcta',
      body: `<p>La ley de desintegración es <code>N(t)=N₀e<sup>−λt</sup></code> y la vida media cumple <code>T½=ln(2)/λ</code>. Un valor alto no significa estabilidad absoluta; significa una probabilidad de desintegración menor por unidad de tiempo.</p><p>Los nucleidos estables se tratan como una categoría separada, no como una vida media infinita numérica. Los límites inferiores, superiores y valores aproximados deben interpretarse con sus operadores de evaluación.</p>`
    },
    {
      group: 'Escalas',
      title: '13. Valores Q y energías de separación',
      body: `<p>Un valor Q expresa la diferencia de energía entre estado inicial y productos: <code>Q=(m<sub>inicial</sub>−Σm<sub>final</sub>)c²</code>. Un Q positivo indica que el canal es energéticamente permitido, aunque no garantiza una probabilidad observable.</p><p>Las energías Sₙ, Sₚ, S₂n y S₂p cuantifican la energía necesaria para extraer uno o dos nucleones. Caídas o discontinuidades pronunciadas cerca de ciertos N o Z pueden señalar cierres de capa y proximidad a líneas de goteo.</p>`
    },
    {
      group: 'Escalas',
      title: '14. Gap de apareamiento y residuo del modelo de gota líquida',
      body: `<p>El gap de apareamiento usa diferencias finitas de energías de enlace para estimar la contribución par–impar. En esta aplicación se marca como magnitud derivada porque se calcula localmente a partir de nucleidos vecinos.</p><p>El residuo <code>(BE−LDM)/A</code> compara la energía de enlace evaluada con un ajuste macroscópico de gota líquida. Estructuras sistemáticas en el residuo señalan física de capas y deformación no capturada por el modelo macroscópico.</p>`
    },
    {
      group: 'Decaimiento',
      title: '15. Qué es “Cadena seleccionada”',
      body: `<p>La cadena seleccionada sigue, paso a paso, el <strong>modo principal de desintegración</strong> del nucleido elegido. Cada flecha une el padre con la hija calculada por las reglas de cambio de Z y N.</p><p>Es una trayectoria orientativa sobre estados fundamentales. No sustituye un esquema ENSDF: no representa todas las ramas, intensidades, estados excitados, emisiones retardadas ni transiciones gamma intermedias.</p>`
    },
    {
      group: 'Decaimiento',
      title: '16. Transformaciones de coordenadas nucleares',
      body: `<p>Las transformaciones usadas son: α: <code>(Z,N)→(Z−2,N−2)</code>; β−: <code>(Z,N)→(Z+1,N−1)</code>; β+/captura electrónica: <code>(Z,N)→(Z−1,N+1)</code>; emisión de protón: <code>(Z,N)→(Z−1,N)</code>; emisión de neutrón: <code>(Z,N)→(Z,N−1)</code>.</p><p>La transición isomérica mantiene Z y N; la fisión espontánea no posee una hija única y por ello no se dibuja como una flecha simple. La desintegración por clúster requiere conocer el clúster emitido; la aproximación visual solo se usa cuando el dataset permite una dirección razonable.</p>`
    },
    {
      group: 'Decaimiento',
      title: '17. Punto de parada de una cadena',
      body: `<p>La secuencia termina al alcanzar un nucleido estable, un modo sin hija única, un registro sin dato suficiente, una celda ausente del dataset o un ciclo ya visitado.</p><p>El panel de estado informa del número de pasos y del motivo de parada. La ausencia de continuación no significa necesariamente que el núcleo no decaiga; puede significar que la simplificación por modo principal no dispone de una hija única evaluada.</p>`
    },
    {
      group: 'Decaimiento',
      title: '18. Ramificaciones y porcentajes',
      body: `<p>Muchos nucleidos tienen varios canales competitivos. El mapa básico colorea por el modo predominante y la cadena seleccionada sigue ese modo. Para un estudio cuantitativo deben consultarse los porcentajes de ramificación y sus incertidumbres.</p><p>Una rama minoritaria puede ser científicamente relevante aunque no aparezca en la trayectoria principal. Las cadenas completas requieren datos de decaimiento y niveles, no solamente el grupo <code>ground_states</code>.</p>`
    },
    {
      group: 'Decaimiento',
      title: '19. Qué es el campo de decaimiento',
      body: `<p>El campo de decaimiento es una visualización colectiva de direcciones. Cada vector parte de un nucleido y apunta hacia la hija asociada a su modo principal. Su función es mostrar flujos globales hacia el valle de estabilidad.</p><p>No es una línea temporal, no muestra velocidades y no compara probabilidades salvo que se aplique explícitamente otro código visual. La longitud de la flecha responde a la geometría discreta de la carta.</p>`
    },
    {
      group: 'Decaimiento',
      title: '20. Alcance, densidad y opacidad del campo',
      body: `<p>El alcance determina qué fuentes se dibujan: entorno de la selección, viewport visible o conjunto completo filtrado. La densidad limita el número de vectores mediante muestreo determinista para evitar una maraña ilegible.</p><p>La opacidad controla el peso visual. Un valor bajo permite conservar la lectura de las celdas. El nucleido bajo el puntero y la cadena seleccionada se dibujan con mayor contraste para mantener una referencia clara.</p>`
    },
    {
      group: 'Decaimiento',
      title: '21. Colores de los modos de desintegración',
      body: `<p>Los vectores utilizan familias cromáticas coherentes con el mapa: β−, β+/CE, α, emisión de protones, emisión de neutrones, transición isomérica, fisión espontánea y otros modos.</p><p>El color identifica el canal, no su intensidad. Cuando se selecciona “solo el modo del nucleido elegido”, el campo conserva únicamente vectores de la misma clase para facilitar la comparación topológica.</p>`
    },
    {
      group: 'Rigor',
      title: '22. Datos evaluados, teóricos e isómeros',
      body: `<p>Los registros evaluados proceden del snapshot oficial cargado. Los isómeros pueden requerir un dataset secundario. Las posiciones teóricas o no observadas son una extensión visual y nunca deben confundirse con evidencia experimental.</p><p>Los filtros de clase se aplican tanto a la carta como a los perfiles. Una línea puede quedar interrumpida porque se ha excluido una clase o porque falta la propiedad seleccionada.</p>`
    },
    {
      group: 'Rigor',
      title: '23. Valores ausentes, límites e incertidumbres',
      body: `<p>La falta de punto no equivale a valor cero. Puede significar ausencia de evaluación, dato no aplicable o formato no reconocido. Los operadores “&lt;”, “&gt;”, “≈” y las incertidumbres deben conservarse al citar el dato.</p><p>Los perfiles actuales utilizan el valor central disponible. Para análisis metrológico se debe consultar el registro original y propagar incertidumbres. Las magnitudes derivadas heredan las incertidumbres y correlaciones de los datos de entrada.</p>`
    },
    {
      group: 'Rigor',
      title: '24. Muestreo y rendimiento',
      body: `<p>El campo de decaimiento puede contener miles de vectores. Para conservar fluidez se establece un máximo dependiente de la densidad elegida y se usa un muestreo reproducible basado en Z y N.</p><p>El muestreo cambia la cantidad de flechas visibles, no los datos subyacentes. Para inspeccionar una región concreta debe reducirse el alcance al entorno seleccionado o ampliar la carta.</p>`
    },
    {
      group: 'Rigor',
      title: '25. Relación con NuDat 3',
      body: `<p>NuDat 3 acompaña su carta con perfiles unidimensionales de neutrones y protones, puntos seleccionables, resaltado de líneas, escalas lineales/logarítmicas y sincronización con la vista. Nucleidos adopta ese principio de análisis, pero mantiene una interfaz propia y más integrada con el lienzo.</p><p>NuDat contiene además niveles excitados, transiciones gamma y radiaciones de decaimiento. El snapshot de estados fundamentales de Nucleidos no puede reproducir por sí solo toda esa profundidad.</p>`
    },
    {
      group: 'Rigor',
      title: '26. Flujo de trabajo profesional',
      body: `<p>Un uso riguroso sigue cuatro pasos: localizar una tendencia en la carta; aislarla con filtros y perfiles; abrir las fichas de los nucleidos relevantes; verificar valores, operadores, incertidumbres y fuente en IAEA/ENSDF/NuDat.</p><p>Las visualizaciones sirven para formular preguntas y detectar patrones. Las conclusiones publicables deben apoyarse en tablas evaluadas y en la referencia original correspondiente.</p>`
    },
    {
      group: 'Rigor',
      title: '27. Fuentes oficiales y trazabilidad',
      body: `<p>El conjunto principal utiliza IAEA LiveChart para propiedades de estados fundamentales. NuDat 3 y ENSDF aportan estructura nuclear, niveles, gammas y datos de decaimiento más completos.</p><p>Enlaces: <a href="https://www-nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html" target="_blank" rel="noopener">API de IAEA LiveChart</a>, <a href="https://www.nndc.bnl.gov/nudat3/guide/" target="_blank" rel="noopener">guía de NuDat 3</a>, <a href="https://www.nndc.bnl.gov/ensdf/" target="_blank" rel="noopener">ENSDF</a> y <a href="https://www.nndc.bnl.gov/nudat3/" target="_blank" rel="noopener">NuDat 3</a>.</p>`
    }
  ];

  function $(selector, root = document) { return root.querySelector(selector); }
  function $$(selector, root = document) { return [...root.querySelectorAll(selector)]; }
  function finite(value, fallback = 0) { return Number.isFinite(value) ? value : fallback; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function loadScript(src, id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        if (existing.dataset.loaded === '1') resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
          setTimeout(resolve, 1500);
        }
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

  async function ensureV29() {
    if ($('#chartOverlaysV29') || document.documentElement.dataset.nucleidosPatch?.startsWith('29')) return;
    await loadScript(V29_URL, 'nucleidos-v29-base-runtime');
  }

  async function waitForApplication(timeout = 12000) {
    const start = performance.now();
    while (performance.now() - start < timeout) {
      if (typeof state !== 'undefined' && typeof cellRect === 'function' && $('#chartCanvas')) return true;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return false;
  }

  function graphAxisLabel(axis) { return axis === 'z' ? 'Z' : 'N'; }

  function graphFullBounds(points) {
    if (!points.length) return null;
    const xs = points.map(point => point.x).filter(Number.isFinite);
    const ys = points.map(point => point.y).filter(Number.isFinite).sort((a, b) => a - b);
    if (!xs.length || !ys.length) return null;
    const q = (array, p) => {
      const index = (array.length - 1) * p;
      const low = Math.floor(index), high = Math.ceil(index);
      return low === high ? array[low] : array[low] * (high - index) + array[high] * (index - low);
    };
    let minX = Math.min(...xs), maxX = Math.max(...xs);
    let minY = q(ys, .01), maxY = q(ys, .99);
    if (minX === maxX) { minX -= 1; maxX += 1; }
    if (minY === maxY) { minY -= 1; maxY += 1; }
    const px = (maxX - minX) * .04;
    const py = (maxY - minY) * .08;
    return { minX: minX - px, maxX: maxX + px, minY: minY - py, maxY: maxY + py };
  }

  function resizeInteractiveCanvas(graph) {
    const rect = graph.stack.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (graph.canvas.width !== width || graph.canvas.height !== height) {
      graph.canvas.width = width;
      graph.canvas.height = height;
    }
    graph.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    graph.cssWidth = rect.width;
    graph.cssHeight = rect.height;
    graph.dpr = dpr;
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return '—';
    const absolute = Math.abs(value);
    return absolute >= 10000 || (absolute > 0 && absolute < .001)
      ? value.toExponential(3)
      : value.toLocaleString('es-ES', { maximumSignificantDigits: 6 });
  }

  function graphHighlightGroup(graph) {
    if (graph.pinnedGroup != null) return graph.pinnedGroup;
    if (graph.legendHover != null) return graph.legendHover;
    if (!runtime.hoveredNuclide) return null;
    return graph.axis === 'z' ? runtime.hoveredNuclide.n : runtime.hoveredNuclide.z;
  }

  function drawGraph(graph) {
    if (!graph.dock.classList.contains('open')) return;
    resizeInteractiveCanvas(graph);
    const { ctx, cssWidth: width, cssHeight: height } = graph;
    const dark = document.body.classList.contains('dark');
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = dark ? '#151820' : '#fbfaf7';
    ctx.fillRect(0, 0, width, height);

    if (!graph.points.length || !graph.view) {
      ctx.fillStyle = dark ? '#ddd' : '#333';
      ctx.font = '700 12px system-ui';
      ctx.fillText('No hay datos numéricos visibles para esta propiedad.', 20, 34);
      graph.renderedPoints = [];
      return;
    }

    const margin = { left: 62, right: 22, top: 24, bottom: 46 };
    const plotW = Math.max(1, width - margin.left - margin.right);
    const plotH = Math.max(1, height - margin.top - margin.bottom);
    const view = graph.view;
    const xMap = value => margin.left + (value - view.minX) / Math.max(1e-12, view.maxX - view.minX) * plotW;
    const yMap = value => height - margin.bottom - (value - view.minY) / Math.max(1e-12, view.maxY - view.minY) * plotH;
    graph.mapping = { margin, plotW, plotH, xMap, yMap };

    ctx.strokeStyle = dark ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.10)';
    ctx.lineWidth = 1;
    ctx.font = '700 10px system-ui';
    ctx.fillStyle = dark ? '#d9dbe2' : '#3c3b40';
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const fx = i / gridLines;
      const x = margin.left + fx * plotW;
      const y = margin.top + fx * plotH;
      ctx.beginPath(); ctx.moveTo(x, margin.top); ctx.lineTo(x, height - margin.bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(width - margin.right, y); ctx.stroke();
      const xv = view.minX + fx * (view.maxX - view.minX);
      const yv = view.maxY - fx * (view.maxY - view.minY);
      ctx.fillText(formatNumber(xv), x - 10, height - 18);
      ctx.fillText(formatNumber(yv), 4, y + 3);
    }

    ctx.strokeStyle = dark ? 'rgba(255,255,255,.32)' : 'rgba(0,0,0,.32)';
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();
    ctx.font = '900 11px system-ui';
    ctx.fillText(graphAxisLabel(graph.axis), width - margin.right - 4, height - 17);

    const highlight = graphHighlightGroup(graph);
    const grouped = new Map();
    for (const point of graph.points) {
      if (!grouped.has(point.group)) grouped.set(point.group, []);
      grouped.get(point.group).push(point);
    }

    const rendered = [];
    const drawGroup = (group, series) => {
      const selected = highlight == null || Number(group) === Number(highlight);
      const color = series[0]?.color || '#5d5af6';
      const visible = series
        .filter(point => point.x >= view.minX && point.x <= view.maxX && point.y >= view.minY && point.y <= view.maxY)
        .sort((a, b) => a.x - b.x);
      if (!visible.length) return;
      ctx.save();
      ctx.globalAlpha = selected ? .96 : .10;
      ctx.strokeStyle = color;
      ctx.lineWidth = selected && highlight != null ? 3 : 1.45;
      ctx.beginPath();
      visible.forEach((point, index) => {
        const px = xMap(point.x), py = yMap(point.y);
        index ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      });
      ctx.stroke();
      visible.forEach(point => {
        const px = xMap(point.x), py = yMap(point.y);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, selected && highlight != null ? 4.2 : 2.8, 0, Math.PI * 2);
        ctx.fill();
        rendered.push({ ...point, px, py, muted: !selected });
      });
      ctx.restore();
    };

    [...grouped.entries()].sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([group, series]) => drawGroup(group, series));
    graph.renderedPoints = rendered;

    if (highlight != null) {
      const label = graph.axis === 'z' ? `N=${highlight}` : `Z=${highlight}`;
      ctx.fillStyle = dark ? 'rgba(20,22,29,.88)' : 'rgba(255,255,255,.90)';
      ctx.strokeStyle = dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect?.(margin.left + 8, margin.top + 8, 74, 25, 8);
      if (ctx.roundRect) { ctx.fill(); ctx.stroke(); }
      else ctx.fillRect(margin.left + 8, margin.top + 8, 74, 25);
      ctx.fillStyle = dark ? '#fff' : '#222';
      ctx.font = '900 11px system-ui';
      ctx.fillText(label, margin.left + 18, margin.top + 25);
    }
  }

  function resetGraphView(graph) {
    graph.view = graph.fullBounds ? { ...graph.fullBounds } : null;
    graph.userView = false;
    drawGraph(graph);
  }

  function zoomGraph(graph, factor, centerX = .5, centerY = .5, axisMode = 'both') {
    if (!graph.view || !graph.fullBounds) return;
    const view = graph.view;
    const anchorX = view.minX + centerX * (view.maxX - view.minX);
    const anchorY = view.maxY - centerY * (view.maxY - view.minY);
    const fullX = graph.fullBounds.maxX - graph.fullBounds.minX;
    const fullY = graph.fullBounds.maxY - graph.fullBounds.minY;
    const currentX = view.maxX - view.minX;
    const currentY = view.maxY - view.minY;
    const nextX = axisMode === 'y' ? currentX : clamp(currentX * factor, fullX / 80, fullX * 8);
    const nextY = axisMode === 'x' ? currentY : clamp(currentY * factor, fullY / 80, fullY * 8);
    if (axisMode !== 'y') {
      view.minX = anchorX - centerX * nextX;
      view.maxX = view.minX + nextX;
    }
    if (axisMode !== 'x') {
      view.maxY = anchorY + centerY * nextY;
      view.minY = view.maxY - nextY;
    }
    graph.userView = true;
    drawGraph(graph);
  }

  function graphPointAt(graph, x, y, radius = 11) {
    let best = null;
    let distance = radius;
    for (const point of graph.renderedPoints || []) {
      const d = Math.hypot(point.px - x, point.py - y);
      if (d < distance) { distance = d; best = point; }
    }
    return best;
  }

  function showGraphTooltip(graph, event, point) {
    let tooltip = $('#profileTooltipV30');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'profileTooltipV30';
      tooltip.className = 'profile-tooltip-v30';
      document.body.appendChild(tooltip);
    }
    const header = graph.dock.querySelector('header strong')?.textContent || 'Perfil';
    tooltip.innerHTML = `<strong>${point.n.symbol}-${point.n.a}</strong><span>Z=${point.n.z} · N=${point.n.n}</span><span>${header.replace(/^Perfil por [ZN]\s*·?\s*/, '')}: ${formatNumber(point.raw)}</span><span>Serie ${graph.axis === 'z' ? `N=${point.group}` : `Z=${point.group}`}</span>`;
    tooltip.classList.add('visible');
    tooltip.setAttribute('aria-hidden', 'false');
    const rect = tooltip.getBoundingClientRect();
    tooltip.style.left = `${clamp(event.clientX + 14, 8, window.innerWidth - rect.width - 8)}px`;
    tooltip.style.top = `${clamp(event.clientY + 14, 8, window.innerHeight - rect.height - 8)}px`;
  }

  function hideGraphTooltip() {
    const tooltip = $('#profileTooltipV30');
    tooltip?.classList.remove('visible');
    tooltip?.setAttribute('aria-hidden', 'true');
  }

  function makeDockFree(dock) {
    if (dock.classList.contains('free-position-v30')) return;
    const rect = dock.getBoundingClientRect();
    dock.classList.add('free-position-v30');
    dock.style.left = `${rect.left}px`;
    dock.style.top = `${rect.top}px`;
    dock.style.width = `${rect.width}px`;
    dock.style.height = `${rect.height}px`;
    dock.style.right = 'auto';
    dock.style.bottom = 'auto';
  }

  function installDockMovement(graph) {
    const { dock } = graph;
    const header = dock.querySelector(':scope > header');
    if (!header || header.dataset.v30Move) return;
    header.dataset.v30Move = '1';
    header.classList.add('profile-drag-handle-v30');

    let drag = null;
    header.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button')) return;
      makeDockFree(dock);
      const rect = dock.getBoundingClientRect();
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top };
      header.setPointerCapture?.(event.pointerId);
      dock.classList.add('dragging-v30');
      event.preventDefault();
    });
    header.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const maxLeft = Math.max(0, window.innerWidth - dock.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - dock.offsetHeight);
      dock.style.left = `${clamp(drag.left + event.clientX - drag.startX, 0, maxLeft)}px`;
      dock.style.top = `${clamp(drag.top + event.clientY - drag.startY, 0, maxTop)}px`;
    });
    const end = event => {
      if (!drag || (event && drag.id !== event.pointerId)) return;
      drag = null;
      dock.classList.remove('dragging-v30');
      drawGraph(graph);
    };
    header.addEventListener('pointerup', end);
    header.addEventListener('pointercancel', end);

    const resize = document.createElement('div');
    resize.className = 'profile-resize-v30';
    resize.setAttribute('aria-hidden', 'true');
    dock.appendChild(resize);
    let sizing = null;
    resize.addEventListener('pointerdown', event => {
      makeDockFree(dock);
      const rect = dock.getBoundingClientRect();
      sizing = { id: event.pointerId, startX: event.clientX, startY: event.clientY, width: rect.width, height: rect.height };
      resize.setPointerCapture?.(event.pointerId);
      dock.classList.add('resizing-v30');
      event.preventDefault();
      event.stopPropagation();
    });
    resize.addEventListener('pointermove', event => {
      if (!sizing || sizing.id !== event.pointerId) return;
      const rect = dock.getBoundingClientRect();
      const maxWidth = Math.max(320, window.innerWidth - rect.left - 6);
      const maxHeight = Math.max(240, window.innerHeight - rect.top - 6);
      dock.style.width = `${clamp(sizing.width + event.clientX - sizing.startX, 320, maxWidth)}px`;
      dock.style.height = `${clamp(sizing.height + event.clientY - sizing.startY, 240, maxHeight)}px`;
      drawGraph(graph);
    });
    const finishSize = event => {
      if (!sizing || (event && sizing.id !== event.pointerId)) return;
      sizing = null;
      dock.classList.remove('resizing-v30');
      drawGraph(graph);
    };
    resize.addEventListener('pointerup', finishSize);
    resize.addEventListener('pointercancel', finishSize);
  }

  function addGraphControls(graph) {
    const header = graph.dock.querySelector(':scope > header');
    if (!header || header.querySelector('.profile-window-controls-v30')) return;
    const controls = document.createElement('div');
    controls.className = 'profile-window-controls-v30';
    controls.innerHTML = `
      <button type="button" data-graph-zoom="out" title="Alejar gráfico" aria-label="Alejar gráfico">−</button>
      <button type="button" data-graph-reset title="Restablecer ejes">100%</button>
      <button type="button" data-graph-zoom="in" title="Acercar gráfico" aria-label="Acercar gráfico">+</button>
      <button type="button" data-graph-maximize title="Maximizar o restaurar" aria-label="Maximizar o restaurar">□</button>`;
    const existingClose = header.querySelector('button[data-close-profile]');
    if (existingClose) header.insertBefore(controls, existingClose);
    else header.appendChild(controls);

    controls.querySelector('[data-graph-zoom="out"]')?.addEventListener('click', () => zoomGraph(graph, 1.35));
    controls.querySelector('[data-graph-zoom="in"]')?.addEventListener('click', () => zoomGraph(graph, .74));
    controls.querySelector('[data-graph-reset]')?.addEventListener('click', () => resetGraphView(graph));
    controls.querySelector('[data-graph-maximize]')?.addEventListener('click', event => {
      const dock = graph.dock;
      if (!dock.classList.contains('maximized-v30')) {
        const rect = dock.getBoundingClientRect();
        graph.restoreRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        makeDockFree(dock);
        dock.classList.add('maximized-v30');
        dock.style.left = '8px'; dock.style.top = '8px';
        dock.style.width = 'calc(100vw - 16px)'; dock.style.height = 'calc(100dvh - 16px)';
        event.currentTarget.textContent = '❐';
      } else {
        dock.classList.remove('maximized-v30');
        const rect = graph.restoreRect;
        if (rect) {
          dock.style.left = `${rect.left}px`; dock.style.top = `${rect.top}px`;
          dock.style.width = `${rect.width}px`; dock.style.height = `${rect.height}px`;
        }
        event.currentTarget.textContent = '□';
      }
      requestAnimationFrame(() => drawGraph(graph));
    });
  }

  function installGraphCanvas(graph) {
    const source = graph.sourceCanvas;
    if (source.closest('.profile-canvas-stack-v30')) return;
    const stack = document.createElement('div');
    stack.className = 'profile-canvas-stack-v30';
    source.before(stack);
    stack.appendChild(source);
    const canvas = document.createElement('canvas');
    canvas.className = 'profile-interactive-v30';
    canvas.setAttribute('aria-label', `${graph.axis === 'z' ? 'Perfil por Z' : 'Perfil por N'} interactivo, ampliable y desplazable`);
    stack.appendChild(canvas);
    graph.stack = stack;
    graph.canvas = canvas;
    graph.ctx = canvas.getContext('2d');
    graph.points = [];
    graph.renderedPoints = [];
    graph.fullBounds = null;
    graph.view = null;
    graph.userView = false;

    let pan = null;
    let moved = false;
    canvas.addEventListener('wheel', event => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = clamp((event.clientX - rect.left - 62) / Math.max(1, rect.width - 84), 0, 1);
      const cy = clamp((event.clientY - rect.top - 24) / Math.max(1, rect.height - 70), 0, 1);
      const mode = event.shiftKey ? 'x' : event.altKey ? 'y' : 'both';
      zoomGraph(graph, Math.exp(event.deltaY * .0017), cx, cy, mode);
    }, { passive: false });
    canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !graph.view) return;
      pan = { id: event.pointerId, x: event.clientX, y: event.clientY, view: { ...graph.view } };
      moved = false;
      canvas.setPointerCapture?.(event.pointerId);
      canvas.classList.add('panning-v30');
      event.preventDefault();
    });
    canvas.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (pan && pan.id === event.pointerId) {
        const dx = event.clientX - pan.x, dy = event.clientY - pan.y;
        if (Math.hypot(dx, dy) > 3) moved = true;
        const spanX = pan.view.maxX - pan.view.minX;
        const spanY = pan.view.maxY - pan.view.minY;
        const plotW = Math.max(1, rect.width - 84), plotH = Math.max(1, rect.height - 70);
        graph.view.minX = pan.view.minX - dx / plotW * spanX;
        graph.view.maxX = pan.view.maxX - dx / plotW * spanX;
        graph.view.minY = pan.view.minY + dy / plotH * spanY;
        graph.view.maxY = pan.view.maxY + dy / plotH * spanY;
        graph.userView = true;
        drawGraph(graph);
        return;
      }
      const point = graphPointAt(graph, x, y);
      graph.hoverPoint = point;
      canvas.style.cursor = point ? 'pointer' : 'grab';
      if (point) showGraphTooltip(graph, event, point); else hideGraphTooltip();
    });
    const finishPan = event => {
      if (!pan || pan.id !== event.pointerId) return;
      pan = null;
      canvas.classList.remove('panning-v30');
      if (!moved && graph.hoverPoint) {
        graph.pinnedGroup = graph.pinnedGroup === graph.hoverPoint.group ? null : graph.hoverPoint.group;
        if (typeof selectNuclide === 'function') selectNuclide(graph.hoverPoint.n);
        drawAllGraphs();
      }
    };
    canvas.addEventListener('pointerup', finishPan);
    canvas.addEventListener('pointercancel', finishPan);
    canvas.addEventListener('pointerleave', () => { if (!pan) hideGraphTooltip(); });
    canvas.addEventListener('dblclick', event => { event.preventDefault(); resetGraphView(graph); });
  }

  function upgradeDock(dock, axis) {
    if (!dock || dock.dataset.v30Upgraded) return;
    dock.dataset.v30Upgraded = '1';
    dock.classList.add('profile-dock-v30');
    const sourceCanvas = dock.querySelector(':scope > canvas');
    if (!sourceCanvas) return;
    const graph = { dock, axis, sourceCanvas, sourceSignature: '', pinnedGroup: null, legendHover: null };
    runtime.graphs.set(axis, graph);
    installGraphCanvas(graph);
    addGraphControls(graph);
    installDockMovement(graph);

    const legend = dock.querySelector('.profile-legend-v29');
    legend?.addEventListener('pointerover', event => {
      const button = event.target.closest('[data-profile-group]');
      if (!button) return;
      graph.legendHover = Number(button.dataset.profileGroup);
      drawGraph(graph);
    });
    legend?.addEventListener('pointerout', event => {
      if (event.relatedTarget?.closest?.('[data-profile-group]')) return;
      graph.legendHover = null;
      drawGraph(graph);
    });
    legend?.addEventListener('click', event => {
      const button = event.target.closest('[data-profile-group]');
      if (!button) return;
      const value = Number(button.dataset.profileGroup);
      graph.pinnedGroup = graph.pinnedGroup === value ? null : value;
      drawGraph(graph);
    });
  }

  function syncGraphData(graph) {
    const sourcePoints = graph.sourceCanvas.__profilePoints || [];
    const header = graph.dock.querySelector('header strong')?.textContent || '';
    const signature = `${sourcePoints.length}|${sourcePoints[0]?.n?.uid || ''}|${sourcePoints.at(-1)?.n?.uid || ''}|${header}`;
    if (signature === graph.sourceSignature && graph.points.length) return;
    graph.sourceSignature = signature;
    graph.points = sourcePoints.map(point => ({
      n: point.n,
      group: Number(point.group),
      x: Number(point.x),
      y: Number(point.y),
      raw: Number(point.raw),
      color: point.color || '#5d5af6'
    })).filter(point => point.n && Number.isFinite(point.x) && Number.isFinite(point.y));
    graph.fullBounds = graphFullBounds(graph.points);
    if (!graph.userView || !graph.view) graph.view = graph.fullBounds ? { ...graph.fullBounds } : null;
    drawGraph(graph);
  }

  function drawAllGraphs() {
    runtime.graphs.forEach(graph => drawGraph(graph));
  }

  function monitorGraphs() {
    setInterval(() => {
      runtime.graphs.forEach(graph => {
        if (graph.dock.classList.contains('open')) syncGraphData(graph);
      });
    }, 140);
    window.addEventListener('resize', () => requestAnimationFrame(drawAllGraphs), { passive: true });
  }

  function findNuclideAtClient(clientX, clientY) {
    if (typeof state === 'undefined' || typeof cellRect !== 'function' || typeof sx !== 'function' || typeof sy !== 'function') return null;
    const scale = finite(state.scale, 1);
    const width = typeof CELL_W === 'number' ? CELL_W * scale : 82 * scale;
    const height = typeof CELL_H === 'number' ? CELL_H * scale : 72 * scale;
    let candidate = null;
    for (const nuclide of state.all || []) {
      try { if (typeof isRenderable === 'function' && !isRenderable(nuclide)) continue; } catch (_) { continue; }
      const rect = cellRect(nuclide.z, nuclide.n);
      const left = sx(rect.x), top = sy(rect.y);
      if (clientX >= left && clientX <= left + width && clientY >= top && clientY <= top + height) {
        candidate = nuclide;
        if (nuclide.dataClass !== 'theoretical') break;
      }
    }
    return candidate;
  }

  function installMapHoverSync() {
    const canvas = $('#chartCanvas');
    if (!canvas || canvas.dataset.v30Hover) return;
    canvas.dataset.v30Hover = '1';
    let latest = null;
    canvas.addEventListener('pointermove', event => {
      latest = { x: event.clientX, y: event.clientY };
      if (runtime.hoverFrame) return;
      runtime.hoverFrame = requestAnimationFrame(() => {
        runtime.hoverFrame = 0;
        if (!latest) return;
        const next = findNuclideAtClient(latest.x, latest.y);
        const changed = next?.uid !== runtime.hoveredNuclide?.uid;
        runtime.hoveredNuclide = next;
        if (changed) {
          drawAllGraphs();
          requestDecayRender(true);
        }
      });
    }, { passive: true });
    canvas.addEventListener('pointerleave', () => {
      runtime.hoveredNuclide = null;
      drawAllGraphs();
      requestDecayRender(true);
    }, { passive: true });
  }

  function selectedOverlayButton(key) {
    return $(`#chartOverlaysV29 [data-overlay="${key}"]`);
  }

  function overlayActive(key) {
    return selectedOverlayButton(key)?.classList.contains('active') || false;
  }

  function evaluatedAt(z, n) {
    const list = state.byCell?.get(`${z}-${n}`) || [];
    return list.find(item => item.dataClass === 'evaluated') || list.find(item => item.dataClass !== 'theoretical') || list[0] || null;
  }

  function daughterCoordinates(nuclide) {
    if (!nuclide) return null;
    let z = nuclide.z, n = nuclide.n;
    switch (nuclide.decay) {
      case 'alpha': z -= 2; n -= 2; break;
      case 'beta-': z += 1; n -= 1; break;
      case 'beta+/EC': z -= 1; n += 1; break;
      case 'p': z -= 1; break;
      case 'n': n -= 1; break;
      case 'cluster': z -= 6; n -= 8; break;
      default: return null;
    }
    return { z, n };
  }

  function screenCenter(nuclide) {
    const rect = cellRect(nuclide.z, nuclide.n);
    return { x: sx(rect.x + CELL_W / 2), y: sy(rect.y + CELL_H / 2) };
  }

  function resizeDecayCanvas() {
    const canvas = runtime.decayCanvas;
    if (!canvas) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const width = Math.max(1, Math.round(innerWidth * dpr));
    const height = Math.max(1, Math.round(innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    runtime.decayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawArrow(ctx, from, to, color, opacity, width, shorten = .12) {
    const dx = to.x - from.x, dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < 3) return;
    const ux = dx / length, uy = dy / length;
    const start = { x: from.x + dx * shorten, y: from.y + dy * shorten };
    const end = { x: to.x - dx * shorten, y: to.y - dy * shorten };
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    const size = clamp(width * 4.2, 4, 10);
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - ux * size - uy * size * .55, end.y - uy * size + ux * size * .55);
    ctx.lineTo(end.x - ux * size + uy * size * .55, end.y - uy * size - ux * size * .55);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function visibleRows() {
    const rows = [];
    for (const nuclide of state.all || []) {
      try { if (typeof isRenderable === 'function' && !isRenderable(nuclide)) continue; } catch (_) { continue; }
      const point = screenCenter(nuclide);
      if (point.x < -100 || point.x > innerWidth + 100 || point.y < -100 || point.y > innerHeight + 100) continue;
      rows.push(nuclide);
    }
    return rows;
  }

  function deterministicRank(nuclide) {
    return ((nuclide.z * 73856093) ^ (nuclide.n * 19349663) ^ (nuclide.a * 83492791)) >>> 0;
  }

  function fieldRows() {
    let rows = runtime.field.scope === 'all'
      ? (state.all || []).filter(nuclide => {
          try { return typeof isRenderable !== 'function' || isRenderable(nuclide); } catch (_) { return false; }
        })
      : visibleRows();
    rows = rows.filter(nuclide => nuclide.dataClass !== 'theoretical' && daughterCoordinates(nuclide));
    if (runtime.field.scope === 'selected' && state.selected) {
      const radius = runtime.field.radius;
      rows = rows.filter(nuclide => Math.abs(nuclide.z - state.selected.z) <= radius && Math.abs(nuclide.n - state.selected.n) <= radius);
    }
    if (runtime.field.mode === 'selected' && state.selected?.decay) rows = rows.filter(nuclide => nuclide.decay === state.selected.decay);
    const maxArrows = Math.round(35 + runtime.field.density * 3.8);
    if (rows.length > maxArrows) rows = rows.sort((a, b) => deterministicRank(a) - deterministicRank(b)).slice(0, maxArrows);
    return rows;
  }

  function buildChain() {
    const chain = [];
    const start = state.selected;
    if (!start) return { chain, reason: 'Selecciona un nucleido para construir su trayectoria principal.' };
    let current = start;
    const seen = new Set([current.uid]);
    for (let step = 0; step < 24; step++) {
      const coords = daughterCoordinates(current);
      if (!coords) {
        const reason = current.decay === 'stable' ? 'La cadena alcanza un nucleido clasificado como estable.'
          : current.decay === 'sf' ? 'La fisión espontánea no tiene una hija única representable.'
          : current.decay === 'it' ? 'La transición isomérica conserva Z y N y requiere datos de niveles.'
          : 'El modo principal no define una hija única en este dataset.';
        return { chain, reason, terminal: current };
      }
      const daughter = evaluatedAt(coords.z, coords.n);
      if (!daughter) return { chain, reason: 'No existe una hija evaluada en la celda calculada.', terminal: current };
      chain.push({ parent: current, daughter, mode: current.decay });
      if (seen.has(daughter.uid)) return { chain, reason: 'La trayectoria se detuvo para evitar un ciclo de datos.', terminal: daughter };
      seen.add(daughter.uid);
      current = daughter;
    }
    return { chain, reason: 'Se alcanzó el límite visual de 24 pasos.', terminal: current };
  }

  function drawDecayLayer() {
    if (!runtime.decayCanvas || typeof state === 'undefined') return;
    resizeDecayCanvas();
    const ctx = runtime.decayCtx;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const chainEnabled = overlayActive('decayChain');
    const fieldEnabled = overlayActive('decayField');
    runtime.decayCanvas.classList.toggle('active', chainEnabled || fieldEnabled);
    runtime.decayStatus.classList.toggle('visible', chainEnabled || fieldEnabled);
    if (!chainEnabled && !fieldEnabled) return;

    let fieldCount = 0;
    if (fieldEnabled) {
      const opacity = clamp(runtime.field.opacity / 100, .06, .72);
      for (const nuclide of fieldRows()) {
        const coords = daughterCoordinates(nuclide);
        const daughter = coords ? evaluatedAt(coords.z, coords.n) : null;
        if (!daughter) continue;
        const from = screenCenter(nuclide), to = screenCenter(daughter);
        const hovered = runtime.hoveredNuclide?.uid === nuclide.uid;
        drawArrow(ctx, from, to, COLORS[nuclide.decay] || COLORS.unknown, hovered ? .92 : opacity, hovered ? 2.8 : 1.15, .22);
        fieldCount++;
      }
    }

    const result = chainEnabled ? buildChain() : null;
    if (result) {
      result.chain.forEach((step, index) => {
        const from = screenCenter(step.parent), to = screenCenter(step.daughter);
        drawArrow(ctx, from, to, COLORS[step.mode] || '#5d5af6', .98, 3.1, .16);
        ctx.save();
        ctx.fillStyle = document.body.classList.contains('dark') ? '#fff' : '#1f1f24';
        ctx.font = '900 11px system-ui';
        ctx.fillText(`${index + 1} · ${step.mode}`, (from.x + to.x) / 2 + 6, (from.y + to.y) / 2 - 7);
        ctx.strokeStyle = COLORS[step.mode] || '#5d5af6';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(from.x, from.y, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });
    }

    const selectedText = state.selected ? `${state.selected.symbol}-${state.selected.a}` : 'sin selección';
    const scopeLabel = runtime.field.scope === 'selected' ? 'entorno seleccionado' : runtime.field.scope === 'viewport' ? 'vista actual' : 'conjunto filtrado';
    runtime.decayStatus.innerHTML = `
      <strong>${chainEnabled ? 'Trayectoria principal estimada' : 'Campo de decaimiento'}</strong>
      <span>Selección: ${selectedText}</span>
      ${chainEnabled ? `<span>${result.chain.length} paso(s). ${result.reason}</span>` : ''}
      ${fieldEnabled ? `<span>${fieldCount} vectores · ${scopeLabel} · densidad ${runtime.field.density}%.</span>` : ''}
      <small>Las flechas siguen el modo predominante; no sustituyen las ramificaciones ENSDF.</small>`;
  }

  function requestDecayRender(force = false) {
    if (force) runtime.decaySignature = '';
    if (runtime.decayFrame) return;
    runtime.decayFrame = requestAnimationFrame(() => {
      runtime.decayFrame = 0;
      drawDecayLayer();
    });
  }

  function createDecayLayer() {
    if (runtime.decayCanvas) return;
    const oldCanvas = $('#decayOverlayCanvasV29');
    if (oldCanvas) oldCanvas.classList.add('suppressed-by-v30');
    const canvas = document.createElement('canvas');
    canvas.id = 'decayOverlayCanvasV30';
    canvas.className = 'decay-overlay-v30';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    runtime.decayCanvas = canvas;
    runtime.decayCtx = canvas.getContext('2d');

    const status = document.createElement('aside');
    status.id = 'decayStatusV30';
    status.className = 'decay-status-v30';
    status.setAttribute('aria-live', 'polite');
    document.body.appendChild(status);
    runtime.decayStatus = status;
    resizeDecayCanvas();
  }

  function enhanceOverlayControls() {
    const section = $('#chartOverlaysV29');
    if (!section || $('#decayControlsV30')) return false;
    const chainButton = section.querySelector('[data-overlay="decayChain"]');
    const fieldButton = section.querySelector('[data-overlay="decayField"]');
    if (chainButton) {
      chainButton.title = 'Sigue el modo principal desde el nucleido seleccionado. No incluye todas las ramificaciones.';
      chainButton.innerHTML = '<strong>Cadena seleccionada</strong><span>Trayectoria principal padre → hija</span>';
    }
    if (fieldButton) {
      fieldButton.title = 'Dibuja un conjunto controlado de vectores de decaimiento para evitar saturación visual.';
      fieldButton.innerHTML = '<strong>Campo de decaimiento</strong><span>Direcciones colectivas con densidad regulable</span>';
    }

    const controls = document.createElement('div');
    controls.id = 'decayControlsV30';
    controls.className = 'decay-controls-v30';
    controls.innerHTML = `
      <h3>Ajustes del campo</h3>
      <div class="decay-control-grid-v30">
        <label>Alcance<select data-decay-control="scope"><option value="selected">Entorno seleccionado</option><option value="viewport">Vista actual</option><option value="all">Conjunto filtrado</option></select></label>
        <label>Modo<select data-decay-control="mode"><option value="all">Todos los modos</option><option value="selected">Solo modo seleccionado</option></select></label>
        <label>Densidad <output data-decay-output="density">34%</output><input data-decay-control="density" type="range" min="5" max="100" value="34"></label>
        <label>Opacidad <output data-decay-output="opacity">28%</output><input data-decay-control="opacity" type="range" min="6" max="72" value="28"></label>
        <label>Radio local <output data-decay-output="radius">10</output><input data-decay-control="radius" type="range" min="3" max="24" value="10"></label>
      </div>
      <p>El modo local es el más legible: muestra solo una vecindad alrededor del nucleido seleccionado. El muestreo no altera los datos, únicamente limita las flechas dibujadas.</p>`;
    section.appendChild(controls);

    controls.addEventListener('input', event => {
      const key = event.target.dataset.decayControl;
      if (!key) return;
      const value = event.target.type === 'range' ? Number(event.target.value) : event.target.value;
      runtime.field[key] = value;
      const output = controls.querySelector(`[data-decay-output="${key}"]`);
      if (output) output.textContent = key === 'radius' ? String(value) : `${value}%`;
      requestDecayRender(true);
    });
    controls.addEventListener('change', () => requestDecayRender(true));
    section.addEventListener('click', event => {
      if (event.target.closest('[data-overlay="decayChain"], [data-overlay="decayField"]')) setTimeout(() => requestDecayRender(true), 0);
    });
    return true;
  }

  function monitorDecay() {
    setInterval(() => {
      if (!overlayActive('decayChain') && !overlayActive('decayField')) return;
      const signature = [
        finite(state.tx).toFixed(2), finite(state.ty).toFixed(2), finite(state.scale).toFixed(4),
        state.selected?.uid || '', runtime.hoveredNuclide?.uid || '', runtime.field.scope,
        runtime.field.density, runtime.field.opacity, runtime.field.mode, runtime.field.radius,
        innerWidth, innerHeight
      ].join('|');
      if (signature !== runtime.decaySignature) {
        runtime.decaySignature = signature;
        requestDecayRender();
      }
    }, 110);
    window.addEventListener('resize', () => requestDecayRender(true), { passive: true });
    document.addEventListener('nucleidos:dataset-changed', () => requestDecayRender(true));
  }

  function renderGuideChapter(index) {
    runtime.guideChapter = clamp(index, 0, GUIDE_CHAPTERS.length - 1);
    const chapter = GUIDE_CHAPTERS[runtime.guideChapter];
    const content = runtime.guide.querySelector('.analysis-guide-content-v30');
    content.innerHTML = `<span class="analysis-guide-group-v30">${chapter.group}</span><h2>${chapter.title}</h2>${chapter.body}<div class="analysis-guide-pager-v30"><button data-guide-prev type="button" ${runtime.guideChapter === 0 ? 'disabled' : ''}>Anterior</button><span>${runtime.guideChapter + 1} / ${GUIDE_CHAPTERS.length}</span><button data-guide-next type="button" ${runtime.guideChapter === GUIDE_CHAPTERS.length - 1 ? 'disabled' : ''}>Siguiente</button></div>`;
    runtime.guide.querySelectorAll('[data-guide-chapter]').forEach(button => button.classList.toggle('active', Number(button.dataset.guideChapter) === runtime.guideChapter));
    content.querySelector('[data-guide-prev]')?.addEventListener('click', () => renderGuideChapter(runtime.guideChapter - 1));
    content.querySelector('[data-guide-next]')?.addEventListener('click', () => renderGuideChapter(runtime.guideChapter + 1));
    content.scrollTop = 0;
  }

  function filterGuide(query) {
    const normalized = query.trim().toLocaleLowerCase('es');
    runtime.guide.querySelectorAll('[data-guide-chapter]').forEach(button => {
      const chapter = GUIDE_CHAPTERS[Number(button.dataset.guideChapter)];
      const haystack = `${chapter.group} ${chapter.title} ${chapter.body.replace(/<[^>]+>/g, ' ')}`.toLocaleLowerCase('es');
      button.hidden = Boolean(normalized && !haystack.includes(normalized));
    });
  }

  function createGuide() {
    if (runtime.guide) return;
    const panel = document.createElement('section');
    panel.id = 'analysisGuideV30';
    panel.className = 'analysis-guide-v30';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <header class="analysis-guide-header-v30">
        <div><span>Guía científica ampliada</span><h1>Gráficos, trayectorias y lectura profesional</h1></div>
        <div class="analysis-guide-header-actions-v30"><button data-guide-general type="button">Guía general</button><button data-guide-close type="button" aria-label="Cerrar">×</button></div>
      </header>
      <div class="analysis-guide-layout-v30">
        <aside class="analysis-guide-sidebar-v30">
          <label>Buscar en este módulo<input type="search" data-guide-search placeholder="vida media, cadena, zoom…"></label>
          <nav>${GUIDE_CHAPTERS.map((chapter, index) => `<button type="button" data-guide-chapter="${index}"><span>${chapter.group}</span>${chapter.title.replace(/^\d+\.\s*/, '')}</button>`).join('')}</nav>
        </aside>
        <article class="analysis-guide-content-v30"></article>
      </div>`;
    document.body.appendChild(panel);
    runtime.guide = panel;
    panel.querySelector('[data-guide-close]')?.addEventListener('click', closeGuide);
    panel.querySelector('[data-guide-general]')?.addEventListener('click', closeGuide);
    panel.querySelector('[data-guide-search]')?.addEventListener('input', event => filterGuide(event.target.value));
    panel.querySelector('nav')?.addEventListener('click', event => {
      const button = event.target.closest('[data-guide-chapter]');
      if (button) renderGuideChapter(Number(button.dataset.guideChapter));
    });
    renderGuideChapter(0);
  }

  function openGuide() {
    createGuide();
    runtime.guide.classList.add('open');
    runtime.guide.setAttribute('aria-hidden', 'false');
    runtime.guideVisible = true;
    document.body.classList.add('analysis-guide-open-v30');
    history.pushState({ nucleidosAnalysisGuide: true }, '', location.href);
  }

  function closeGuide({ fromHistory = false } = {}) {
    if (!runtime.guideVisible) return;
    runtime.guide.classList.remove('open');
    runtime.guide.setAttribute('aria-hidden', 'true');
    runtime.guideVisible = false;
    document.body.classList.remove('analysis-guide-open-v30');
    if (!fromHistory && history.state?.nucleidosAnalysisGuide) history.back();
  }

  function installGuideIntegration() {
    createGuide();
    const button = $('#infoButton');
    if (!button || button.dataset.v30Guide) return;
    button.dataset.v30Guide = '1';

    const launcher = document.createElement('button');
    launcher.id = 'analysisGuideLauncherV30';
    launcher.className = 'analysis-guide-launcher-v30';
    launcher.type = 'button';
    launcher.innerHTML = '<strong>Análisis visual</strong><span>27 capítulos sobre perfiles y decaimiento</span>';
    launcher.addEventListener('click', openGuide);
    document.body.appendChild(launcher);
    runtime.guideLauncher = launcher;

    button.addEventListener('click', () => {
      launcher.classList.add('visible');
      setTimeout(() => launcher.classList.add('visible'), 250);
    });
    $('#mobileInfoButton')?.addEventListener('click', () => launcher.classList.add('visible'));
    document.addEventListener('click', event => {
      if (event.target.closest('[aria-label*="Cerrar guía"], .info-close, [data-info-close]')) launcher.classList.remove('visible');
    });
    window.addEventListener('popstate', () => {
      if (runtime.guideVisible) closeGuide({ fromHistory: true });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && runtime.guideVisible) closeGuide();
    });
  }

  function installInlineHelpLink() {
    const section = $('#chartOverlaysV29');
    if (!section || section.querySelector('.overlay-guide-link-v30')) return;
    const note = document.createElement('button');
    note.type = 'button';
    note.className = 'overlay-guide-link-v30';
    note.innerHTML = '<strong>¿Qué significan estas gráficas?</strong><span>Abrir el manual completo de análisis visual.</span>';
    note.addEventListener('click', openGuide);
    section.appendChild(note);
  }

  function waitForV29Ui() {
    return new Promise(resolve => {
      const ready = () => $('#zProfileDockV29') && $('#nProfileDockV29') && $('#chartOverlaysV29');
      if (ready()) { resolve(); return; }
      const observer = new MutationObserver(() => {
        if (ready()) { observer.disconnect(); resolve(); }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { observer.disconnect(); resolve(); }, 10000);
    });
  }

  async function init() {
    if (runtime.ready) return;
    try {
      await ensureV29();
      if (!await waitForApplication()) throw new Error('El motor principal no terminó de inicializarse.');
      await waitForV29Ui();
      runtime.ready = true;
      document.documentElement.dataset.nucleidosPatch = VERSION;
      document.documentElement.dataset.nucleidosRuntime = VERSION;

      upgradeDock($('#zProfileDockV29'), 'z');
      upgradeDock($('#nProfileDockV29'), 'n');
      monitorGraphs();
      installMapHoverSync();
      createDecayLayer();
      enhanceOverlayControls();
      installInlineHelpLink();
      monitorDecay();
      installGuideIntegration();

      const observer = new MutationObserver(() => {
        upgradeDock($('#zProfileDockV29'), 'z');
        upgradeDock($('#nProfileDockV29'), 'n');
        enhanceOverlayControls();
        installInlineHelpLink();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 20000);
    } catch (error) {
      console.error('[Nucleidos v30] No se pudieron instalar las mejoras.', error);
      const status = $('#dataStatus');
      if (status) {
        status.textContent = `No se pudo cargar la interfaz v30: ${error.message}`;
        status.dataset.state = 'error';
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
