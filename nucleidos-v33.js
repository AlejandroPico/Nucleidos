(() => {
  'use strict';

  const VERSION = '33.1.0';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const BOOK_ICON = `
    <svg class="material-icon encyclopedia-book-icon-v33" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3.5 4.5A2.5 2.5 0 0 1 6 2h5v17.2A3.8 3.8 0 0 0 7.2 16H3.5V4.5Zm17 0A2.5 2.5 0 0 0 18 2h-5v17.2a3.8 3.8 0 0 1 3.8-3.2h3.7V4.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    </svg>`;

  const INFO_ICON = `
    <svg class="material-icon" aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M12 10.5v6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="12" cy="7.25" r="1.15"/>
    </svg>`;

  const SEARCH_ICON = `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="10.5" cy="10.5" r="5.75" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="m15 15 4.25 4.25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;

  const MEDIA = {
    vision: {
      src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/NuclideMap%20stitched%20small%20preview.png',
      source: 'https://commons.wikimedia.org/wiki/File:NuclideMap_stitched_small_preview.png',
      alt: 'Carta de nucleidos coloreada por modos de desintegración',
      caption: 'Una carta de nucleidos permite reconocer de un vistazo estabilidad, regiones exóticas y modos dominantes de desintegración.'
    },
    spin: {
      src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Shells.png',
      source: 'https://commons.wikimedia.org/wiki/File:Shells.png',
      alt: 'Diagrama de capas nucleares y números mágicos',
      caption: 'El modelo de capas organiza los estados nucleares y ayuda a entender la aparición de los números mágicos.'
    },
    alpha: {
      src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Alpha%20Decay.svg',
      source: 'https://commons.wikimedia.org/wiki/File:Alpha_Decay.svg',
      alt: 'Esquema de una desintegración alfa',
      caption: 'En una desintegración alfa el núcleo emite un agregado de dos protones y dos neutrones.'
    },
    'beta-minus': {
      src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Beta-minus%20Decay.svg',
      source: 'https://commons.wikimedia.org/wiki/File:Beta-minus_Decay.svg',
      alt: 'Esquema de una desintegración beta menos',
      caption: 'La desintegración beta menos transforma un neutrón en un protón y desplaza el nucleido en la carta.'
    },
    'gamma-it': {
      src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gamma%20Decay.svg',
      source: 'https://commons.wikimedia.org/wiki/File:Gamma_Decay.svg',
      alt: 'Esquema de una transición gamma',
      caption: 'La emisión gamma reduce la energía del núcleo sin alterar sus números Z y N.'
    }
  };
  const FAILED_MEDIA = new Set();

  const SCIENCE_CATALOG = [
    ['fundamentos', 'Fundamentos', 'vision', 'Qué representa el visor'],
    ['fundamentos', 'Fundamentos', 'vocabulario', 'Átomo, núcleo, nucleido e isótopo'],
    ['fundamentos', 'Fundamentos', 'notacion', 'Notación A, Z, N y símbolo'],
    ['fundamentos', 'Fundamentos', 'ejes', 'Ejes Z y N'],
    ['fundamentos', 'Fundamentos', 'observacion', 'Observados y no observados'],
    ['fundamentos', 'Fundamentos', 'estabilidad', 'Valle de estabilidad'],
    ['estructura', 'Estructura nuclear', 'fuerzas', 'Fuerzas dentro del núcleo'],
    ['estructura', 'Estructura nuclear', 'defecto', 'Defecto de masa'],
    ['estructura', 'Estructura nuclear', 'enlace', 'Energía de enlace por nucleón'],
    ['estructura', 'Estructura nuclear', 'separacion', 'Energías de separación'],
    ['estructura', 'Estructura nuclear', 'qvalues', 'Valores Q'],
    ['estructura', 'Estructura nuclear', 'spin', 'Espín, paridad y capas'],
    ['decaimiento', 'Desintegración', 'ley-decaimiento', 'Ley exponencial'],
    ['decaimiento', 'Desintegración', 'semivida', 'Vida media'],
    ['decaimiento', 'Desintegración', 'alpha', 'Desintegración α'],
    ['decaimiento', 'Desintegración', 'beta-minus', 'Beta menos'],
    ['decaimiento', 'Desintegración', 'beta-plus-ec', 'Beta más y captura electrónica'],
    ['decaimiento', 'Desintegración', 'gamma-it', 'Gamma e isomería'],
    ['mapa', 'Lectura del mapa', 'otros-canales', 'Fisión y emisión de partículas'],
    ['mapa', 'Lectura del mapa', 'cadenas', 'Cadenas y ramificaciones'],
    ['mapa', 'Lectura del mapa', 'magicos', 'Números mágicos'],
    ['mapa', 'Lectura del mapa', 'apareamiento', 'Efecto par–impar'],
    ['mapa', 'Lectura del mapa', 'fronteras', 'Frontera nuclear'],
    ['mapa', 'Lectura del mapa', 'mapas-filtros', 'Mapas, filtros y capas'],
    ['aplicaciones', 'Aplicaciones y fuentes', 'abundancia', 'Abundancia natural'],
    ['aplicaciones', 'Aplicaciones y fuentes', 'medicina', 'Medicina y trazadores'],
    ['aplicaciones', 'Aplicaciones y fuentes', 'energia', 'Reactores, fisión y fusión'],
    ['aplicaciones', 'Aplicaciones y fuentes', 'datacion', 'Datación y geocronología'],
    ['aplicaciones', 'Aplicaciones y fuentes', 'astrofisica', 'Astrofísica nuclear'],
    ['aplicaciones', 'Aplicaciones y fuentes', 'fuentes-limites', 'Fuentes, incertidumbre y límites']
  ];

  const SOURCE_GROUPS = [
    {
      title: 'Datos nucleares oficiales',
      intro: 'Fuentes primarias empleadas para consultar estados fundamentales, niveles, desintegraciones y evaluaciones.',
      links: [
        ['IAEA LiveChart', 'https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html', 'Carta interactiva y datos nucleares evaluados.'],
        ['API de IAEA LiveChart', 'https://www-nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html', 'Guía del servicio utilizado por el visor.'],
        ['NNDC · NuDat 3', 'https://www.nndc.bnl.gov/nudat3/', 'Niveles, radiaciones y esquemas de desintegración.'],
        ['ENSDF', 'https://www.nndc.bnl.gov/ensdf/', 'Evaluated Nuclear Structure Data File.']
      ]
    },
    {
      title: 'Lectura y contexto',
      intro: 'Recursos de apoyo para contrastar conceptos, nomenclatura y representación cartográfica.',
      links: [
        ['IAEA Nuclear Data Services', 'https://www-nds.iaea.org/', 'Portal de servicios de datos nucleares del OIEA.'],
        ['Wikimedia Commons · cartas de nucleidos', 'https://commons.wikimedia.org/wiki/Category:Chart_of_nuclides', 'Colección de representaciones y diagramas reutilizables.'],
        ['Wikipedia · Tabla de núclidos', 'https://es.wikipedia.org/wiki/Tabla_de_n%C3%BAclidos', 'Introducción general y terminología.']
      ]
    },
    {
      title: 'Créditos gráficos',
      intro: 'Cada ilustración enlaza a su ficha original, donde constan autoría, historial y licencia aplicable.',
      links: Object.values(MEDIA).map(item => [item.alt, item.source, 'Ficha y condiciones de reutilización en Wikimedia Commons.'])
    }
  ];

  function waitFor(test, timeout = 16000) {
    return new Promise(resolve => {
      const started = performance.now();
      const check = () => {
        const value = test();
        if (value) resolve(value);
        else if (performance.now() - started >= timeout) resolve(null);
        else setTimeout(check, 80);
      };
      check();
    });
  }

  function configureHud() {
    const info = $('#infoButton');
    if (!info || info.dataset.v33Encyclopedia === '1') return;
    info.dataset.v33Encyclopedia = '1';
    info.innerHTML = BOOK_ICON;
    info.setAttribute('aria-label', 'Abrir Gran Enciclopedia');
    info.title = 'Gran Enciclopedia';

    const about = document.createElement('button');
    about.id = 'aboutButtonV33';
    about.className = 'tool-button';
    about.type = 'button';
    about.setAttribute('aria-label', 'Acerca de Nucleidos');
    about.title = 'Acerca de';
    about.innerHTML = INFO_ICON;
    info.insertAdjacentElement('afterend', about);
    about.addEventListener('click', event => {
      event.stopPropagation();
      openAbout();
    });

    const mobileMenuButton = $('#mobileMenuButton');
    if (mobileMenuButton) {
      mobileMenuButton.innerHTML = '<span class="hamburger-lines-v33" aria-hidden="true"><i></i><i></i><i></i></span>';
      mobileMenuButton.title = 'Menú de herramientas';
    }

    const mobileInfo = $('#mobileInfoButton');
    if (mobileInfo) {
      const icon = $('svg', mobileInfo);
      if (icon) icon.outerHTML = BOOK_ICON;
      const label = $('span', mobileInfo);
      if (label) label.textContent = 'Enciclopedia';

      const mobileAbout = document.createElement('button');
      mobileAbout.id = 'mobileAboutButtonV33';
      mobileAbout.className = 'mobile-menu-action';
      mobileAbout.type = 'button';
      mobileAbout.innerHTML = `${INFO_ICON}<span>Acerca de</span>`;
      mobileInfo.insertAdjacentElement('afterend', mobileAbout);
      mobileAbout.addEventListener('click', () => {
        $('#mobileMenuPanel')?.classList.remove('open');
        openAbout();
      });
    }

    const mobilePanel = $('#mobileMenuPanel');
    if (mobilePanel && !$('.mobile-menu-head-v33', mobilePanel)) {
      const mobileHead = document.createElement('header');
      mobileHead.className = 'mobile-menu-head-v33';
      mobileHead.innerHTML = '<div><span>Nucleidos</span><strong>Herramientas del visor</strong></div><button type="button" data-mobile-menu-close-v33 aria-label="Cerrar menú">×</button>';
      mobilePanel.prepend(mobileHead);
      mobileHead.querySelector('button').addEventListener('click', event => {
        event.stopPropagation();
        closeMobileMenu();
        mobileMenuButton?.focus();
      });
      mobilePanel.addEventListener('click', event => {
        if (event.target.closest('.mobile-menu-action')) closeMobileMenu();
      });
    }
  }

  function closeMobileMenu() {
    const panel = $('#mobileMenuPanel');
    const button = $('#mobileMenuButton');
    panel?.classList.remove('open');
    panel?.setAttribute('aria-hidden', 'true');
    button?.setAttribute('aria-expanded', 'false');
  }

  function createAbout() {
    if ($('#aboutBackdropV33')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'aboutBackdropV33';
    backdrop.className = 'about-backdrop-v33';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
      <section class="about-dialog-v33" role="dialog" aria-modal="true" aria-labelledby="aboutTitleV33">
        <header class="about-header-v33">
          <div class="about-chart-mark-v33" aria-hidden="true"><i></i><i></i><i></i><i></i><strong>N</strong></div>
          <div class="about-heading-v33"><p>Nucleidos · atlas nuclear interactivo</p><h1 id="aboutTitleV33">Explorar la materia, núcleo a núcleo</h1></div>
          <button type="button" data-about-close aria-label="Cerrar Acerca de">×</button>
        </header>
        <div class="about-layout-v33">
          <aside class="about-index-v33" aria-label="Ficha del proyecto">
            <p>Ficha del proyecto</p>
            <dl>
              <div><dt>Autor</dt><dd>Alejandro Pico</dd></div>
              <div><dt>Carácter</dt><dd>Personal · no comercial</dd></div>
              <div><dt>Propósito</dt><dd>Educación y divulgación</dd></div>
              <div><dt>Edición</dt><dd>Versión ${VERSION}</dd></div>
            </dl>
          </aside>
          <div class="about-body-v33">
            <p class="about-lead-v33">Nucleidos es un proyecto independiente concebido para hacer legible la carta de nucleidos: sus regiones de estabilidad, propiedades, desintegraciones y relaciones pueden recorrerse como un único mapa científico.</p>
            <section class="about-purpose-v33">
              <p>Principios del visor</p>
              <div><strong>Explorar</strong><span>Navegación visual desde la visión global hasta cada núcleo.</span></div>
              <div><strong>Comprender</strong><span>Enciclopedia integrada para relacionar datos, conceptos y herramientas.</span></div>
              <div><strong>Contrastar</strong><span>Referencias científicas trazables a IAEA LiveChart, NNDC, NuDat 3 y ENSDF.</span></div>
            </section>
            <p class="about-note-v33"><strong>Nota científica.</strong> El visor facilita la consulta y la comparación, pero no sustituye las evaluaciones originales. Los datos sensibles a revisión deben contrastarse con la fuente primaria.</p>
          </div>
        </div>
        <nav class="about-links-v33" aria-label="Enlaces del proyecto">
          <a href="https://alejandropico.github.io/Portfolio/" target="_blank" rel="noopener noreferrer"><span>01 · Autor</span><strong>Portfolio de Alejandro Pico</strong><b aria-hidden="true">↗</b></a>
          <a href="https://github.com/AlejandroPico/Nucleidos" target="_blank" rel="noopener noreferrer"><span>02 · Proyecto</span><strong>Código y documentación</strong><b aria-hidden="true">↗</b></a>
        </nav>
        <div class="about-spectrum-v33" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      </section>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', event => {
      if (event.target === backdrop || event.target.closest('[data-about-close]')) closeAbout();
    });
  }

  function openAbout() {
    closeMobileMenu();
    createAbout();
    const backdrop = $('#aboutBackdropV33');
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('about-open-v33');
    setTimeout(() => $('[data-about-close]', backdrop)?.focus(), 30);
  }

  function closeAbout() {
    const backdrop = $('#aboutBackdropV33');
    if (!backdrop?.classList.contains('open')) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('about-open-v33');
    $('#aboutButtonV33')?.focus();
  }

  function collectScienceCatalog() {
    return SCIENCE_CATALOG.map(([category, group, topic, title]) => ({
      kind: 'science', category, group, topic, title
    }));
  }

  function collectAnalysisCatalog(analysis) {
    return $$('.analysis-guide-sidebar-v30 nav button', analysis).map(button => ({
      kind: 'analysis',
      group: $('span', button)?.textContent.trim() || 'Análisis del visor',
      title: button.childNodes.length > 1
        ? [...button.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join(' ').trim()
        : button.textContent.trim(),
      button
    }));
  }

  function createSourcesPane() {
    const pane = document.createElement('section');
    pane.id = 'encyclopediaSourcesV33';
    pane.className = 'encyclopedia-sources-v33';
    pane.hidden = true;
    pane.innerHTML = `
      <header><span>Bibliografía y trazabilidad</span><h2>Fuentes, recursos y créditos</h2><p>Enlaces organizados para verificar los datos, ampliar conceptos y consultar la procedencia de las ilustraciones.</p></header>
      <div class="encyclopedia-source-groups-v33">
        ${SOURCE_GROUPS.map(group => `<section><h3>${group.title}</h3><p>${group.intro}</p><div>${group.links.map(([label, href, description]) => `<a href="${href}" target="_blank" rel="noopener noreferrer"><span><strong>${label}</strong><small>${description}</small></span><b aria-hidden="true">↗</b></a>`).join('')}</div></section>`).join('')}
      </div>`;
    return pane;
  }

  function addArticleMedia(content) {
    const active = $('#infoTopicList .info-topic-button.active');
    const topic = active?.dataset.topic;
    const item = MEDIA[topic];
    const existing = content.querySelector('.encyclopedia-figure-v33');
    if (existing?.dataset.topic === topic) return;
    existing?.remove();
    if (!item || FAILED_MEDIA.has(topic)) return;

    const figure = document.createElement('figure');
    figure.className = 'encyclopedia-figure-v33';
    figure.dataset.topic = topic;
    figure.innerHTML = `<a href="${item.source}" target="_blank" rel="noopener noreferrer"><img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async"></a><figcaption>${item.caption}<a href="${item.source}" target="_blank" rel="noopener noreferrer">Fuente y licencia ↗</a></figcaption>`;
    const image = $('img', figure);
    image?.addEventListener('error', () => {
      FAILED_MEDIA.add(topic);
      figure.remove();
    }, { once: true });
    const firstParagraph = $('p:not(.info-topic-kicker)', content);
    if (firstParagraph) firstParagraph.insertAdjacentElement('afterend', figure);
    else content.prepend(figure);
  }

  async function installEncyclopedia() {
    const ready = await waitFor(() => {
      const backdrop = $('#infoGuideBackdrop');
      const analysis = $('#analysisGuideV30');
      const launcher = $('#analysisGuideLauncherV30');
      const count = analysis?.querySelectorAll('.analysis-guide-sidebar-v30 nav button').length || 0;
      return backdrop && analysis && launcher && count >= 49 ? { backdrop, analysis, launcher } : null;
    });
    if (!ready) {
      console.warn('[Nucleidos v33] No se pudo unificar la enciclopedia dentro del tiempo previsto.');
      return;
    }

    const { backdrop, analysis, launcher } = ready;
    const guide = $('.info-guide', backdrop);
    const header = $('.info-guide-header', guide);
    const categories = $('#infoGuideCategories', guide);
    const sciencePane = $('.info-guide-main', guide);
    const content = $('#infoTopicContent', guide);
    if (!guide || !header || !categories || !sciencePane || !content) return;

    header.querySelector('p').textContent = 'Gran Enciclopedia Nuclear · 79 capítulos';
    header.querySelector('h1').textContent = 'Nucleidos: ciencia, lectura y herramientas';
    guide.classList.add('grand-encyclopedia-v33');
    backdrop.dataset.encyclopediaPane = 'science';

    const hub = document.createElement('div');
    hub.className = 'encyclopedia-hub-v33';
    hub.innerHTML = `
      <nav class="encyclopedia-panes-v33" aria-label="Secciones de la enciclopedia">
        <button class="active" type="button" data-encyclopedia-pane="science"><strong>Ciencia nuclear</strong><span>30 capítulos</span></button>
        <button type="button" data-encyclopedia-pane="analysis"><strong>Análisis del visor</strong><span>49 capítulos</span></button>
        <button type="button" data-encyclopedia-pane="sources"><strong>Fuentes y recursos</strong><span>Referencias</span></button>
      </nav>
      <label class="encyclopedia-search-v33">${SEARCH_ICON}<input type="search" placeholder="Buscar en los 79 capítulos…" aria-label="Buscar en toda la enciclopedia"><button type="button" aria-label="Limpiar búsqueda">×</button><div class="encyclopedia-search-results-v33" hidden></div></label>`;
    header.insertAdjacentElement('afterend', hub);

    analysis.classList.add('encyclopedia-analysis-v33');
    analysis.classList.remove('open');
    analysis.setAttribute('aria-hidden', 'false');
    analysis.hidden = true;
    guide.appendChild(analysis);

    const sourcesPane = createSourcesPane();
    guide.appendChild(sourcesPane);
    launcher.hidden = true;
    launcher.classList.remove('visible');
    launcher.setAttribute('aria-hidden', 'true');

    const scienceCatalog = collectScienceCatalog();
    const analysisCatalog = collectAnalysisCatalog(analysis);
    const catalog = [...scienceCatalog, ...analysisCatalog];
    const paneButtons = $$('[data-encyclopedia-pane]', hub);
    const search = $('input', hub);
    const clear = $('.encyclopedia-search-v33 > button', hub);
    const results = $('.encyclopedia-search-results-v33', hub);

    function setPane(name) {
      backdrop.dataset.encyclopediaPane = name;
      paneButtons.forEach(button => {
        const active = button.dataset.encyclopediaPane === name;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      categories.hidden = name !== 'science';
      sciencePane.hidden = name !== 'science';
      analysis.hidden = name !== 'analysis';
      sourcesPane.hidden = name !== 'sources';
      if (name === 'science') addArticleMedia(content);
    }

    function openUnified(name = 'science') {
      if (!backdrop.classList.contains('open')) $('#infoButton')?.click();
      setTimeout(() => setPane(name), 0);
    }

    function openCatalogItem(item) {
      results.hidden = true;
      if (item.kind === 'science') {
        setPane('science');
        categories.querySelector(`[data-category="${item.category}"]`)?.click();
        setTimeout(() => {
          $(`#infoTopicList [data-topic="${item.topic}"]`)?.click();
          addArticleMedia(content);
        }, 0);
      } else {
        setPane('analysis');
        item.button.click();
      }
    }

    function renderSearch(query) {
      const normalized = query.trim().toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '');
      if (!normalized) {
        results.hidden = true;
        results.replaceChildren();
        return;
      }
      const matches = catalog.filter(item => `${item.group} ${item.title}`.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(normalized)).slice(0, 14);
      results.replaceChildren();
      if (!matches.length) {
        const empty = document.createElement('p');
        empty.textContent = 'No hay coincidencias en los títulos. Prueba con otro concepto.';
        results.appendChild(empty);
      } else {
        matches.forEach(item => {
          const button = document.createElement('button');
          button.type = 'button';
          button.innerHTML = `<span>${item.kind === 'science' ? 'Ciencia nuclear' : 'Análisis del visor'} · ${item.group}</span><strong>${item.title.replace(/^\d+\.\s*/, '')}</strong>`;
          button.addEventListener('click', () => openCatalogItem(item));
          results.appendChild(button);
        });
      }
      results.hidden = false;
    }

    paneButtons.forEach(button => button.addEventListener('click', () => setPane(button.dataset.encyclopediaPane)));
    search.addEventListener('input', () => renderSearch(search.value));
    clear.addEventListener('click', () => {
      search.value = '';
      renderSearch('');
      search.focus();
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.encyclopedia-search-v33')) results.hidden = true;
    });

    guide.addEventListener('click', event => {
      if (event.target.closest('.info-category, .info-topic-button')) {
        setTimeout(() => addArticleMedia(content), 0);
      }
    });
    document.addEventListener('click', event => {
      const analysisEntry = event.target.closest('#analysisGuideLauncherV30, [data-open-analysis-guide]');
      if (!analysisEntry) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openUnified('analysis');
    }, true);

    $('#infoButton')?.addEventListener('click', () => setTimeout(() => setPane('science'), 0));
    $('#mobileInfoButton')?.addEventListener('click', () => setTimeout(() => setPane('science'), 0));
    window.NucleidosEncyclopedia = { open: openUnified, section: setPane, version: VERSION };
  }

  function bindGlobalKeys() {
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if ($('#aboutBackdropV33')?.classList.contains('open')) {
        event.stopImmediatePropagation();
        closeAbout();
      }
    }, true);
  }

  async function boot() {
    configureHud();
    createAbout();
    bindGlobalKeys();
    await installEncyclopedia();
    document.documentElement.dataset.nucleidosRuntime = VERSION;
    document.documentElement.dataset.nucleidosExperience = VERSION;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
