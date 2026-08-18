(() => {
  'use strict';

  const VERSION = '33.6.0';
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
      mobileHead.innerHTML = '<div><span>Nucleidos</span><strong>Herramientas del visor</strong></div>';
      mobilePanel.prepend(mobileHead);
      mobilePanel.addEventListener('click', event => {
        if (event.target.closest('.mobile-menu-action')) closeMobileMenu();
      });
    }
    installToolbarOrdering();
    installMobileDrawer();
  }

  function normalizeToolbarOrder() {
    const toolbar = $('#app > .top-tools');
    if (!toolbar) return;
    const order = [
      'searchTool',
      'infoButton',
      'dataButton',
      'graphsButtonV31',
      'legendButton',
      'aboutButtonV33',
      'darkModeButton',
      'zoomHud'
    ];
    const current = [...toolbar.children].filter(node => order.includes(node.id)).map(node => node.id);
    const expected = order.filter(id => document.getElementById(id)?.parentElement === toolbar);
    if (current.join('|') === expected.join('|')) return;
    expected.forEach(id => toolbar.appendChild(document.getElementById(id)));
  }

  function installToolbarOrdering() {
    const toolbar = $('#app > .top-tools');
    if (!toolbar || toolbar.dataset.v35Order === '1') return;
    toolbar.dataset.v35Order = '1';
    normalizeToolbarOrder();
    new MutationObserver(normalizeToolbarOrder).observe(toolbar, { childList: true });
  }

  async function installZProfilePlacement() {
    const dock = await waitFor(() => $('#zProfileDockV29'), 18000);
    if (!dock || window.matchMedia?.('(max-width: 820px)').matches || dock.dataset.v35Positioned === '1') return;
    dock.dataset.v35Positioned = '1';
    const width = Math.min(520, Math.max(440, window.innerWidth - 128));
    dock.style.left = '64px';
    dock.style.right = 'auto';
    dock.style.top = '82px';
    dock.style.bottom = '18px';
    dock.style.width = `${width}px`;
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }

  function setMobileMenuOpen(open) {
    const panel = $('#mobileMenuPanel');
    const button = $('#mobileMenuButton');
    const backdrop = $('#mobileDrawerBackdropV35');
    panel?.classList.toggle('open', open);
    panel?.setAttribute('aria-hidden', String(!open));
    button?.setAttribute('aria-expanded', String(open));
    if (button) {
      const label = open ? 'Cerrar menú de herramientas' : 'Abrir menú de herramientas';
      button.setAttribute('aria-label', label);
      button.title = label;
    }
    backdrop?.classList.toggle('open', open);
    backdrop?.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('mobile-menu-open-v35', open);
    if (!open) closeMobileInlineSections();
  }

  function installMobileDrawer() {
    const panel = $('#mobileMenuPanel');
    const button = $('#mobileMenuButton');
    if (!panel || !button || panel.dataset.v35Drawer === '1') return;
    panel.dataset.v35Drawer = '1';

    let backdrop = $('#mobileDrawerBackdropV35');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mobileDrawerBackdropV35';
      backdrop.className = 'mobile-drawer-backdrop-v35';
      backdrop.setAttribute('aria-hidden', 'true');
      panel.insertAdjacentElement('beforebegin', backdrop);
      backdrop.addEventListener('pointerdown', () => closeMobileMenu());
    }

    document.addEventListener('click', event => {
      const trigger = event.target.closest('#mobileMenuButton');
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setMobileMenuOpen(trigger.getAttribute('aria-expanded') !== 'true');
    }, true);

    let swipe = null;
    panel.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
      panel.setPointerCapture?.(event.pointerId);
    }, { passive: true });
    panel.addEventListener('pointerup', event => {
      if (!swipe || swipe.id !== event.pointerId) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      swipe = null;
      if (dx < -58 && Math.abs(dx) > Math.abs(dy) * 1.15) closeMobileMenu();
    }, { passive: true });
    panel.addEventListener('pointercancel', () => { swipe = null; }, { passive: true });

    let edgeSwipe = null;
    document.addEventListener('pointerdown', event => {
      if (!window.matchMedia('(max-width: 820px)').matches
        || event.pointerType !== 'touch'
        || event.clientX > 24
        || panel.classList.contains('open')) return;
      edgeSwipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }, { passive: true });
    document.addEventListener('pointerup', event => {
      if (!edgeSwipe || edgeSwipe.id !== event.pointerId) return;
      const dx = event.clientX - edgeSwipe.x;
      const dy = event.clientY - edgeSwipe.y;
      edgeSwipe = null;
      if (dx > 58 && Math.abs(dx) > Math.abs(dy) * 1.15) setMobileMenuOpen(true);
    }, { passive: true });
    document.addEventListener('pointercancel', () => { edgeSwipe = null; }, { passive: true });
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const MOBILE_INLINE_V36 = {
    mobileDataButton: 'dataPopover',
    mobileLayersButton: 'legendPopover',
    mobileGraphsButtonV31: 'graphsPopoverV31'
  };

  function closeMobileInlineSections(exceptId = '') {
    Object.values(MOBILE_INLINE_V36).forEach(id => {
      if (id === exceptId) return;
      const section = document.getElementById(id);
      section?.classList.remove('open');
      section?.setAttribute('aria-hidden', 'true');
    });
    Object.entries(MOBILE_INLINE_V36).forEach(([buttonId, sectionId]) => {
      if (sectionId !== exceptId) document.getElementById(buttonId)?.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleMobileInlineSection(buttonId) {
    const sectionId = MOBILE_INLINE_V36[buttonId];
    const section = document.getElementById(sectionId);
    const button = document.getElementById(buttonId);
    if (!section || !button) return;
    const open = !section.classList.contains('open');
    closeMobileInlineSections(open ? sectionId : '');
    section.classList.toggle('open', open);
    section.setAttribute('aria-hidden', String(!open));
    button.setAttribute('aria-expanded', String(open));
    if (open) requestAnimationFrame(() => section.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  function moveMobilePanels(inMobile) {
    const panel = $('#mobileMenuPanel');
    if (!panel) return;
    let host = $('#mobileInlineSectionsV36');
    if (!host) {
      host = document.createElement('div');
      host.id = 'mobileInlineSectionsV36';
      host.className = 'mobile-inline-sections-v36';
      panel.appendChild(host);
    }
    Object.values(MOBILE_INLINE_V36).forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;
      let marker = document.querySelector(`[data-mobile-origin-v36="${id}"]`);
      if (!marker) {
        marker = document.createElement('span');
        marker.hidden = true;
        marker.dataset.mobileOriginV36 = id;
        section.insertAdjacentElement('beforebegin', marker);
      }
      if (inMobile) {
        section.classList.add('mobile-inline-panel-v36');
        host.appendChild(section);
      } else if (marker.isConnected) {
        section.classList.remove('mobile-inline-panel-v36', 'open');
        section.setAttribute('aria-hidden', 'true');
        marker.insertAdjacentElement('afterend', section);
      }
    });
  }

  async function installMobileInlinePanels() {
    await waitFor(() => $('#graphsPopoverV31') && $('#mobileGraphsButtonV31'), 20000);
    Object.entries(MOBILE_INLINE_V36).forEach(([buttonId, sectionId]) => {
      const button = document.getElementById(buttonId);
      if (!button) return;
      button.setAttribute('aria-controls', sectionId);
      button.setAttribute('aria-expanded', 'false');
    });
    const media = window.matchMedia('(max-width: 820px)');
    const sync = () => moveMobilePanels(media.matches);
    sync();
    media.addEventListener?.('change', sync);

    if (document.documentElement.dataset.v36MobilePanels === '1') return;
    document.documentElement.dataset.v36MobilePanels = '1';
    document.addEventListener('click', event => {
      const action = event.target.closest('#mobileDataButton, #mobileLayersButton, #mobileGraphsButtonV31');
      if (!action || !media.matches) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setMobileMenuOpen(true);
      toggleMobileInlineSection(action.id);
    }, true);
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

  function viewportSizeV33() {
    const root = document.documentElement;
    return {
      width: Math.max(1, Math.round(root.clientWidth || window.innerWidth || 1)),
      height: Math.max(1, Math.round(root.clientHeight || window.innerHeight || 1))
    };
  }

  function viewportInsetsV33() {
    const compact = window.matchMedia?.('(max-width: 820px)').matches;
    return compact
      ? { top: 16, right: 12, bottom: 16, left: 36 }
      : { top: 18, right: 18, bottom: 18, left: 44 };
  }

  async function installResponsiveViewport() {
    if (window.NucleidosNativeViewport?.mode === 'cover') {
      window.NucleidosResponsiveViewport = window.NucleidosNativeViewport;
      return;
    }
    const ready = await waitFor(() => {
      try {
        return typeof state !== 'undefined'
          && state.evaluatedBounds
          && typeof ctx !== 'undefined'
          && typeof worldRectForBounds === 'function'
          && typeof resizeCanvases === 'function';
      } catch (_) {
        return false;
      }
    }, 18000);
    if (!ready || window.NucleidosResponsiveViewport) return;

    let previous = viewportSizeV33();
    let previousFit = Math.max(1e-9, Number(state.fitScale) || 1);
    let resizeFrame = 0;

    function adaptiveFitMetrics() {
      const { width, height } = viewportSizeV33();
      const inset = viewportInsetsV33();
      const usableW = Math.max(120, width - inset.left - inset.right);
      const usableH = Math.max(160, height - inset.top - inset.bottom);
      const fullSx = usableW / Math.max(1, CHART_W);
      const fullSy = usableH / Math.max(1, CHART_H);
      state.fullFitScale = Math.max(fullSx, fullSy);

      const r = worldRectForBounds(state.evaluatedBounds || { minZ: 1, maxZ: 118, minN: 0, maxN: 178 }, 20);
      const rw = Math.max(1, r.x2 - r.x1);
      const rh = Math.max(1, r.y2 - r.y1);
      const evalSx = usableW / rw;
      const evalSy = usableH / rh;
      state.fitScale = Math.max(evalSx, evalSy);
      state.viewportFitMode = 'cover';
      return { r, rw, rh, width, height, inset, usableW, usableH };
    }

    function adaptiveClampTransform() {
      const { width, height } = viewportSizeV33();
      const inset = viewportInsetsV33();
      const scaledW = CHART_W * state.scale;
      const scaledH = CHART_H * state.scale;
      const minTx = width - inset.right - scaledW;
      const maxTx = inset.left;
      const minTy = height - inset.bottom - scaledH;
      const maxTy = inset.top;
      state.tx = scaledW <= width - inset.left - inset.right
        ? inset.left + (width - inset.left - inset.right - scaledW) / 2
        : Math.min(maxTx, Math.max(minTx, state.tx));
      state.ty = scaledH <= height - inset.top - inset.bottom
        ? inset.top + (height - inset.top - inset.bottom - scaledH) / 2
        : Math.min(maxTy, Math.max(minTy, state.ty));
    }

    function adaptiveFitToScreen(force = false) {
      const metrics = adaptiveFitMetrics();
      if (force || !Number.isFinite(state.scale) || state.scale < state.fullFitScale) state.scale = state.fitScale;
      state.tx = metrics.inset.left + metrics.usableW / 2 - (metrics.r.x1 + metrics.rw / 2) * state.scale;
      state.ty = metrics.inset.top + metrics.usableH / 2 - (metrics.r.y1 + metrics.rh / 2) * state.scale;
      updateView();
    }

    function adaptiveZoomAt(clientX, clientY, factor) {
      const old = Math.max(1e-9, state.scale || 1);
      adaptiveFitMetrics();
      const maxScale = Math.max(2.8, state.fitScale * 28);
      const next = Math.max(state.fullFitScale, Math.min(maxScale, old * factor));
      const chartX = (clientX - state.tx) / old;
      const chartY = (clientY - state.ty) / old;
      state.scale = next;
      state.tx = clientX - chartX * next;
      state.ty = clientY - chartY * next;
      updateView();
    }

    function adaptiveDrawAxes() {
      const visible = visibleWorldRect();
      const { width, height } = viewportSizeV33();
      const inset = viewportInsetsV33();
      const labelRight = window.matchMedia?.('(max-width: 820px)').matches ? 58 : inset.right;
      const dark = document.body.classList.contains('dark');
      const axisY = clampNumber(sy(AXIS - 28), inset.top, height - inset.bottom);
      const axisX = clampNumber(sx(AXIS - 18), inset.left, width - inset.right);
      const labelColor = dark ? 'rgba(255,255,255,.92)' : 'rgba(34,32,28,.84)';
      const railColor = dark ? 'rgba(255,255,255,.16)' : 'rgba(34,32,28,.14)';
      const nPixels = TILE_STEP_X * state.scale;
      const zPixels = TILE_STEP_Y * state.scale;
      const nStep = nPixels >= 11 ? 10 : nPixels >= 5.5 ? 20 : 50;
      const zStep = zPixels >= 10 ? 10 : zPixels >= 5 ? 20 : 50;

      ctx.save();
      ctx.strokeStyle = railColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(inset.left, axisY + .5);
      ctx.lineTo(width - inset.right, axisY + .5);
      ctx.moveTo(axisX + .5, inset.top);
      ctx.lineTo(axisX + .5, height - inset.bottom);
      ctx.stroke();

      ctx.font = '900 11px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = labelColor;
      ctx.textAlign = 'center';
      const firstN = Math.max(0, Math.ceil(((visible.x1 - AXIS) / TILE_STEP_X) / nStep) * nStep);
      const lastN = Math.min(N_MAX, Math.floor(((visible.x2 - AXIS) / TILE_STEP_X) / nStep) * nStep);
      for (let N = firstN; N <= lastN; N += nStep) {
        const x = sx(AXIS + N * TILE_STEP_X + TILE_STEP_X / 2);
        if (x < inset.left + 18 || x > width - labelRight - 18) continue;
        drawAxisPill(String(N), x, axisY, 38, state.layers.magic && MAGIC_NUMBERS.includes(N));
      }

      ctx.textAlign = 'right';
      const topRow = Math.max(0, Math.floor((visible.y1 - AXIS) / TILE_STEP_Y));
      const bottomRow = Math.min(Z_MAX - 1, Math.ceil((visible.y2 - AXIS) / TILE_STEP_Y));
      const visibleZMin = Math.max(1, Z_MAX - bottomRow);
      const visibleZMax = Math.min(Z_MAX, Z_MAX - topRow);
      const firstZ = Math.max(zStep, Math.ceil(visibleZMin / zStep) * zStep);
      for (let Z = firstZ; Z <= visibleZMax; Z += zStep) {
        const y = sy(AXIS + (Z_MAX - Z) * TILE_STEP_Y + TILE_STEP_Y / 2);
        if (y < inset.top + 16 || y > height - inset.bottom - 16) continue;
        drawAxisPill(String(Z), axisX - 6, y, 38, state.layers.magic && MAGIC_NUMBERS.includes(Z));
      }

      ctx.fillStyle = labelColor;
      ctx.font = '950 11px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('N →', width - labelRight, clampNumber(axisY - 14, inset.top + 10, height - inset.bottom - 10));
      ctx.save();
      ctx.translate(clampNumber(axisX + 15, inset.left + 12, width - inset.right - 12), inset.top + 3);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'right';
      ctx.fillText('Z →', 0, 0);
      ctx.restore();
      ctx.restore();
    }

    function applyAdaptiveResize() {
      resizeFrame = 0;
      const next = viewportSizeV33();
      const oldScale = Math.max(1e-9, state.scale || 1);
      const oldCenterX = (previous.width / 2 - state.tx) / oldScale;
      const oldCenterY = (previous.height / 2 - state.ty) / oldScale;
      const zoomRatio = oldScale / Math.max(1e-9, previousFit);
      resizeCanvases();
      const metrics = adaptiveFitMetrics();
      const maxScale = Math.max(2.8, state.fitScale * 28);
      state.scale = Math.max(state.fullFitScale, Math.min(maxScale, state.fitScale * zoomRatio));
      state.tx = metrics.inset.left + metrics.usableW / 2 - oldCenterX * state.scale;
      state.ty = metrics.inset.top + metrics.usableH / 2 - oldCenterY * state.scale;
      previous = next;
      previousFit = state.fitScale;
      updateView();
      if (!card.dataset.v32Template) resizeAtomCanvas();
    }

    function requestAdaptiveResize() {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => requestAnimationFrame(applyAdaptiveResize));
    }

    window.updateFitMetrics = adaptiveFitMetrics;
    window.clampTransform = adaptiveClampTransform;
    window.fitToScreen = adaptiveFitToScreen;
    window.zoomAt = adaptiveZoomAt;
    window.drawAxes = adaptiveDrawAxes;
    window.resizeViewPreservingPosition = applyAdaptiveResize;
    window.addEventListener('resize', requestAdaptiveResize, { passive: true });
    window.addEventListener('orientationchange', requestAdaptiveResize, { passive: true });
    window.visualViewport?.addEventListener('resize', requestAdaptiveResize, { passive: true });
    window.visualViewport?.addEventListener('scroll', requestAdaptiveResize, { passive: true });

    adaptiveFitMetrics();
    previousFit = state.fitScale;
    adaptiveFitToScreen(true);
    previous = viewportSizeV33();
    window.NucleidosResponsiveViewport = {
      version: VERSION,
      mode: 'cover',
      fit: () => adaptiveFitToScreen(true),
      refresh: requestAdaptiveResize
    };
  }

  const THEME_KEY_V33 = 'nucleidos-theme-mode';
  const THEME_MODES_V33 = ['auto', 'light', 'evening', 'dark'];
  const THEME_LABELS_V33 = { auto: 'Automático', light: 'Mañana', evening: 'Tarde', dark: 'Noche' };
  let themeModeV33 = 'auto';
  let solarCoordinatesV33 = null;
  let solarLocationAttemptedV33 = false;
  let applyingThemeV33 = false;
  let themeRepairInstalledV33 = false;
  let themeTimerV33 = 0;

  function storedThemeV33() {
    try {
      const value = localStorage.getItem(THEME_KEY_V33);
      return THEME_MODES_V33.includes(value) ? value : 'auto';
    } catch (_) {
      return 'auto';
    }
  }

  function storedCoordinatesV33() {
    try {
      const parsed = JSON.parse(localStorage.getItem('nucleidos-solar-location') || 'null');
      return parsed && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lon) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function solarMinutesV33(date, lat, lon) {
    const start = Date.UTC(date.getFullYear(), 0, 0);
    const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const day = Math.floor((current - start) / 86400000);
    const gamma = 2 * Math.PI / 365 * (day - 1);
    const equation = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const declination = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
    const latitude = lat * Math.PI / 180;
    const cosine = (Math.cos(90.833 * Math.PI / 180) / (Math.cos(latitude) * Math.cos(declination))) - Math.tan(latitude) * Math.tan(declination);
    if (cosine < -1) return { sunrise: 0, sunset: 1440 };
    if (cosine > 1) return { sunrise: 720, sunset: 720 };
    const hourAngle = Math.acos(cosine) * 180 / Math.PI;
    const localNoon = 720 - 4 * lon - equation - date.getTimezoneOffset();
    return { sunrise: localNoon - 4 * hourAngle, sunset: localNoon + 4 * hourAngle };
  }

  function automaticThemeV33(date = new Date()) {
    const minutes = date.getHours() * 60 + date.getMinutes();
    if (solarCoordinatesV33) {
      const solar = solarMinutesV33(date, solarCoordinatesV33.lat, solarCoordinatesV33.lon);
      if (minutes >= solar.sunset - 105 && minutes < solar.sunset + 45) return 'evening';
      if (minutes >= solar.sunrise - 30 && minutes < solar.sunset - 105) return 'light';
      return 'dark';
    }
    if (minutes >= 18 * 60 && minutes < 21 * 60) return 'evening';
    return minutes >= 21 * 60 || minutes < 7 * 60 ? 'dark' : 'light';
  }

  function acquireSolarLocationV33() {
    if (solarLocationAttemptedV33 || !navigator.geolocation) return;
    solarLocationAttemptedV33 = true;
    navigator.geolocation.getCurrentPosition(position => {
      solarCoordinatesV33 = {
        lat: Math.round(position.coords.latitude * 10) / 10,
        lon: Math.round(position.coords.longitude * 10) / 10,
        saved: Date.now()
      };
      try { localStorage.setItem('nucleidos-solar-location', JSON.stringify(solarCoordinatesV33)); } catch (_) {}
      if (themeModeV33 === 'auto') applyThemeV33('auto', false);
    }, () => {}, { enableHighAccuracy: false, timeout: 6500, maximumAge: 86400000 });
  }

  function themeIconMarkupV33() {
    return `<g class="theme-shape sun-shape"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></g><path class="theme-shape moon-shape" d="M19.2 15.2A7.7 7.7 0 0 1 8.8 4.8 8.3 8.3 0 1 0 19.2 15.2Z"/><g class="theme-shape auto-shape"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.8a8.2 8.2 0 0 0 0 16.4Z"/><path d="M12 3.8v16.4" fill="none" stroke="currentColor" stroke-width="1.8"/></g><g class="theme-shape evening-shape"><path d="M3 17.5h18M5.5 14.5h13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M7.5 14.5a4.5 4.5 0 0 1 9 0Z"/><path d="M12 4.2v2M5.9 7l1.4 1.4M18.1 7l-1.4 1.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></g>`;
  }

  function applyThemeV33(mode, persist = true) {
    const safe = THEME_MODES_V33.includes(mode) ? mode : 'auto';
    const resolved = safe === 'auto' ? automaticThemeV33() : safe;
    themeModeV33 = safe;
    if (persist) {
      try { localStorage.setItem(THEME_KEY_V33, safe); } catch (_) {}
    }
    applyingThemeV33 = true;
    document.body.classList.toggle('dark', resolved === 'dark' || resolved === 'evening');
    document.body.classList.toggle('evening', resolved === 'evening');
    document.documentElement.dataset.themeMode = safe;
    document.documentElement.dataset.themeResolved = resolved;
    const iconClass = safe === 'auto' ? 'auto-icon' : safe === 'light' ? 'sun-icon' : safe === 'evening' ? 'evening-icon' : 'moon-icon';
    ['themeIcon', 'mobileThemeIcon'].forEach(id => {
      const icon = document.getElementById(id);
      if (!icon) return;
      icon.innerHTML = themeIconMarkupV33();
      icon.classList.remove('auto-icon', 'sun-icon', 'moon-icon', 'evening-icon');
      icon.classList.add(iconClass);
    });
    const description = safe === 'auto'
      ? `Automático solar · ${THEME_LABELS_V33[resolved].toLowerCase()}`
      : `Tema ${THEME_LABELS_V33[safe].toLowerCase()}`;
    ['darkModeButton', 'mobileThemeButton'].forEach(id => {
      const button = document.getElementById(id);
      if (!button) return;
      button.title = `${description}. Pulsar para cambiar.`;
      button.setAttribute('aria-label', `${description}. Pulsar para cambiar.`);
    });
    const mobileLabel = $('#mobileThemeButton span');
    if (mobileLabel) mobileLabel.textContent = THEME_LABELS_V33[safe];
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === 'dark' ? '#101116' : resolved === 'evening' ? '#30252a' : '#f7f5f0';
    try { if (typeof window.scheduleRender === 'function') window.scheduleRender(); } catch (_) {}
    try { if (typeof window.drawAtom === 'function') window.drawAtom(performance.now()); } catch (_) {}
    setTimeout(() => { applyingThemeV33 = false; }, 0);
    if (safe === 'auto' && !solarCoordinatesV33) acquireSolarLocationV33();
  }

  function installSolarTheme(force = false) {
    if (!force && window.NucleidosTheme?.version === VERSION) return;
    solarCoordinatesV33 = storedCoordinatesV33();
    const buttons = ['darkModeButton', 'mobileThemeButton'].map(id => {
      const original = document.getElementById(id);
      if (!original) return null;
      const replacement = original.cloneNode(true);
      original.replaceWith(replacement);
      return replacement;
    }).filter(Boolean);
    buttons.forEach(button => button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const index = THEME_MODES_V33.indexOf(themeModeV33);
      applyThemeV33(THEME_MODES_V33[(index + 1) % THEME_MODES_V33.length]);
      closeMobileMenu();
    }));

    applyThemeV33(storedThemeV33(), false);
    if (!themeRepairInstalledV33) {
      themeRepairInstalledV33 = true;
      const repair = () => {
        if (applyingThemeV33) return;
        const desired = themeModeV33 === 'auto' ? automaticThemeV33() : themeModeV33;
        const shouldBeDark = desired === 'dark' || desired === 'evening';
        if (document.documentElement.dataset.themeMode !== themeModeV33
          || document.documentElement.dataset.themeResolved !== desired
          || document.body.classList.contains('dark') !== shouldBeDark
          || document.body.classList.contains('evening') !== (desired === 'evening')) {
          applyThemeV33(themeModeV33, false);
        }
      };
      new MutationObserver(repair).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme-mode', 'data-theme-resolved'] });
      new MutationObserver(repair).observe(document.body, { attributes: true, attributeFilter: ['class'] });
      window.clearInterval(themeTimerV33);
      themeTimerV33 = window.setInterval(() => { if (themeModeV33 === 'auto') applyThemeV33('auto', false); }, 60000);
    }
    window.NucleidosTheme = {
      version: VERSION,
      modes: [...THEME_MODES_V33],
      set: mode => applyThemeV33(mode),
      current: () => ({ mode: themeModeV33, resolved: themeModeV33 === 'auto' ? automaticThemeV33() : themeModeV33 })
    };
  }

  function enforceSquareSearch() {
    ['.top-search-box', '.top-search-box input', '.top-search-box .top-search-go'].forEach(selector => {
      document.querySelectorAll(selector).forEach(element => element.style.setProperty('border-radius', '0px', 'important'));
    });
  }

  async function takeFinalInterfaceControl() {
    await waitFor(() => $('#nucleidos-ui-runtime') && $('#nucleidos-v32-init')?.dataset.loaded === '1', 22000);
    installSolarTheme(true);
    enforceSquareSearch();
    normalizeToolbarOrder();
    void installMobileInlinePanels();
    document.documentElement.dataset.nucleidosRuntime = VERSION;
    document.documentElement.dataset.nucleidosExperience = VERSION;
  }

  function bindGlobalKeys() {
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if ($('#aboutBackdropV33')?.classList.contains('open')) {
        event.stopImmediatePropagation();
        closeAbout();
      } else if ($('#mobileMenuPanel')?.classList.contains('open')) {
        event.stopImmediatePropagation();
        closeMobileMenu();
        $('#mobileMenuButton')?.focus();
      }
    }, true);
  }

  function boot() {
    configureHud();
    createAbout();
    bindGlobalKeys();
    installSolarTheme();
    document.documentElement.dataset.nucleidosRuntime = VERSION;
    document.documentElement.dataset.nucleidosExperience = VERSION;
    void installEncyclopedia();
    void installResponsiveViewport();
    void installZProfilePlacement();
    void takeFinalInterfaceControl();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
