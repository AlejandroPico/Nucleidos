(() => {
  'use strict';

  const VERSION = '33.0.1';
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
      src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Table%20of%20nuclides%20(mul).svg',
      source: 'https://commons.wikimedia.org/wiki/File:Table_of_nuclides_(mul).svg',
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
  }

  function createAbout() {
    if ($('#aboutBackdropV33')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'aboutBackdropV33';
    backdrop.className = 'about-backdrop-v33';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
      <section class="about-dialog-v33" role="dialog" aria-modal="true" aria-labelledby="aboutTitleV33">
        <header>
          <div class="about-mark-v33" aria-hidden="true"><span>N</span><i></i><b></b></div>
          <div><p>Acerca de Nucleidos</p><h1 id="aboutTitleV33">Un atlas personal de física nuclear</h1></div>
          <button type="button" data-about-close aria-label="Cerrar Acerca de">×</button>
        </header>
        <div class="about-body-v33">
          <p class="about-lead-v33">Nucleidos es un proyecto personal de <strong>Alejandro Pico</strong>, creado sin ánimo de lucro con una finalidad educativa y divulgativa: hacer que la carta de nucleidos, sus datos y sus relaciones puedan explorarse de forma visual.</p>
          <div class="about-facts-v33">
            <article><span>Autoría</span><strong>Alejandro Pico</strong><p>Diseño, desarrollo y dirección del proyecto.</p></article>
            <article><span>Naturaleza</span><strong>Personal y no comercial</strong><p>Proyecto independiente, educativo y sin ánimo de lucro.</p></article>
            <article><span>Datos</span><strong>Fuentes trazables</strong><p>IAEA LiveChart, NNDC, NuDat 3 y ENSDF como referencias científicas.</p></article>
          </div>
          <p class="about-note-v33">El visor facilita la lectura y comparación de información nuclear, pero no sustituye las evaluaciones originales. Cada dato sensible a revisión debe contrastarse con su fuente primaria.</p>
          <nav class="about-links-v33" aria-label="Enlaces del proyecto">
            <a href="https://alejandropico.github.io/Portfolio/" target="_blank" rel="noopener noreferrer"><span>Portfolio</span><strong>Conocer al autor ↗</strong></a>
            <a href="https://github.com/AlejandroPico/Nucleidos" target="_blank" rel="noopener noreferrer"><span>Código y documentación</span><strong>Repositorio de Nucleidos ↗</strong></a>
          </nav>
        </div>
      </section>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', event => {
      if (event.target === backdrop || event.target.closest('[data-about-close]')) closeAbout();
    });
  }

  function openAbout() {
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

  function collectScienceCatalog(categories) {
    const initial = $('.info-category.active', categories)?.dataset.category;
    const catalog = [];
    $$('.info-category', categories).forEach(category => {
      category.click();
      $$('#infoTopicList .info-topic-button').forEach(button => catalog.push({
        kind: 'science',
        group: category.textContent.trim(),
        title: button.textContent.trim(),
        category: category.dataset.category,
        topic: button.dataset.topic
      }));
    });
    categories.querySelector(`[data-category="${initial || 'fundamentos'}"]`)?.click();
    return catalog;
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
    if (!item) return;

    const figure = document.createElement('figure');
    figure.className = 'encyclopedia-figure-v33';
    figure.dataset.topic = topic;
    figure.innerHTML = `<a href="${item.source}" target="_blank" rel="noopener noreferrer"><img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async"></a><figcaption>${item.caption}<a href="${item.source}" target="_blank" rel="noopener noreferrer">Fuente y licencia ↗</a></figcaption>`;
    const image = $('img', figure);
    image?.addEventListener('error', () => figure.remove(), { once: true });
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

    const scienceCatalog = collectScienceCatalog(categories);
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

    const observer = new MutationObserver(() => addArticleMedia(content));
    observer.observe(content, { childList: true });
    addArticleMedia(content);

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
