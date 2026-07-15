(() => {
  'use strict';
  const api = window.NucleidosV32;
  if (!api) return;

  const chapters = [
    ['42. Varias fichas de nucleidos', '<p>Cada nucleido seleccionado abre una ficha independiente. Volver a seleccionar el mismo nucleido restaura y lleva al frente su ficha existente, evitando duplicados accidentales.</p><p>La carta conserva como selección activa el nucleido de la última ficha utilizada. Esta selección gobierna el resaltado de la celda, los perfiles y las trayectorias.</p>'],
    ['43. Orden de superposición', '<p>Las fichas y los gráficos comparten un único orden de profundidad. Pulsar o interactuar con una ventana la convierte en activa y la coloca delante de las demás.</p><p>La barra global permanece por encima de las ventanas y las flechas de decaimiento permanecen por debajo.</p>'],
    ['44. Minimizar y bandeja de ventanas', '<p>Minimizar oculta la ventana sin destruir su estado. Aparece una entrada en la bandeja inferior con el nombre, un icono de restauración y un icono de cierre.</p><p>Gráficos y fichas utilizan el mismo sistema para que una ventana minimizada sea siempre localizable.</p>'],
    ['45. Maximizar y restaurar tamaño', '<p>Maximizar ocupa el área útil sin cubrir la barra superior. El icono cambia a dos cuadrados superpuestos para indicar que la siguiente acción restaurará la geometría anterior.</p><p>Restaurar tamaño no es lo mismo que restaurar desde la bandeja: una acción recupera geometría y la otra vuelve a mostrar una ventana minimizada.</p>'],
    ['46. Cierre y selección activa', '<p>Cerrar elimina únicamente esa ventana. Si era la ficha activa, se selecciona la ficha más reciente que continúe abierta.</p><p>Minimizar, maximizar/restaurar y cerrar utilizan iconos sin cajetín para conservar una apariencia homogénea.</p>'],
    ['47. Comparador de nucleidos', '<p>El icono de flechas situado antes de los controles de cada ficha añade ese nucleido al comparador único. No existe un límite artificial de columnas y volver a añadir el mismo estado no lo duplica.</p><p>El comparador es una ventana movible, redimensionable, minimizable y maximizable que participa en el mismo orden de profundidad.</p>'],
    ['48. Datos normalizados y oficiales', '<p>Resumen reúne las magnitudes de consulta frecuente. Todos los datos incorpora la información elaborada que muestra la ficha, mientras que Datos oficiales construye la unión completa de columnas originales presentes en los CSV seleccionados.</p><p>Un guion indica que la fuente concreta no aporta ese campo para ese nucleido; no significa cero.</p>'],
    ['49. Gráfica comparativa', '<p>La pestaña Gráfica permite escoger cualquier magnitud numérica normalizada o cualquier columna numérica oficial disponible. La escala puede ser lineal o logarítmica.</p><p>Al añadir o retirar nucleidos, cambiar el tamaño de la ventana o elegir otra propiedad, la representación se recalcula con la selección actual.</p>']
  ];

  function installGraph(element, title) {
    if (!element || element.dataset.v32Managed === '1') return;
    element.dataset.v32Managed = '1';
    const record = api.register(element, 'graph', title, { id: `graph-${element.id}` });
    const header = element.querySelector(':scope > header');
    if (!header) return;
    header.querySelector('.profile-window-controls-v30')?.classList.add('legacy-window-controls-v32');
    header.querySelector('[data-close-profile]')?.classList.add('legacy-window-controls-v32');
    header.appendChild(api.controls(record));
    api.resizeHandles(record, 340, 230);
    new MutationObserver(() => {
      if (element.classList.contains('open') && element.getAttribute('aria-hidden') !== 'true') api.focus(record);
    }).observe(element, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
  }

  function installGraphs() {
    installGraph(api.$('#zProfileDockV29'), 'Perfil por Z');
    installGraph(api.$('#nProfileDockV29'), 'Perfil por N');
  }

  function augmentGuide() {
    const guide = api.$('#analysisGuideV30');
    const nav = guide?.querySelector('.analysis-guide-sidebar-v30 nav');
    const content = guide?.querySelector('.analysis-guide-content-v30');
    if (!guide || !nav || !content || nav.dataset.v32Guide === '1') return;
    nav.dataset.v32Guide = '1';
    const divider = document.createElement('div');
    divider.className = 'guide-module-divider-v31';
    divider.textContent = 'Ventanas v32';
    nav.appendChild(divider);
    chapters.forEach(([title], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.v32GuideChapter = String(index);
      button.innerHTML = `<span>Gestión de ventanas</span>${title.replace(/^\d+\.\s*/, '')}`;
      nav.appendChild(button);
    });
    const render = index => {
      const [title, body] = chapters[index];
      api.$$('[data-guide-chapter], [data-v31-guide-chapter], [data-v32-guide-chapter]', nav)
        .forEach(button => button.classList.toggle('active', button.dataset.v32GuideChapter === String(index)));
      content.innerHTML = `<span class="analysis-guide-group-v30">Gestión de ventanas</span><h2>${title}</h2>${body}<div class="analysis-guide-pager-v30"><button data-v32-prev type="button" ${index === 0 ? 'disabled' : ''}>Anterior</button><span>${42 + index} / ${41 + chapters.length}</span><button data-v32-next type="button" ${index === chapters.length - 1 ? 'disabled' : ''}>Siguiente</button></div>`;
      content.querySelector('[data-v32-prev]')?.addEventListener('click', () => render(index - 1));
      content.querySelector('[data-v32-next]')?.addEventListener('click', () => render(index + 1));
      content.scrollTop = 0;
    };
    nav.addEventListener('click', event => {
      const button = event.target.closest('[data-v32-guide-chapter]');
      if (!button) return;
      event.stopPropagation();
      render(Number(button.dataset.v32GuideChapter));
    }, true);
    const search = guide.querySelector('[data-guide-search]');
    search?.addEventListener('input', event => {
      const query = event.target.value.trim().toLocaleLowerCase('es');
      api.$$('[data-v32-guide-chapter]', nav).forEach(button => {
        const chapter = chapters[Number(button.dataset.v32GuideChapter)];
        button.hidden = Boolean(query && !chapter.join(' ').replace(/<[^>]+>/g, ' ').toLocaleLowerCase('es').includes(query));
      });
    });
    const launcher = api.$('#analysisGuideLauncherV30 span');
    if (launcher) launcher.textContent = '49 capítulos sobre perfiles, filtros, ventanas y comparación';
  }

  function constrain() {
    api.windows.forEach(record => {
      if (!record.element.isConnected || record.minimized || record.maximized || record.element.getAttribute('aria-hidden') === 'true') return;
      const rect = record.element.getBoundingClientRect();
      record.element.style.left = `${api.clamp(rect.left, 0, Math.max(0, innerWidth - Math.min(rect.width, innerWidth)))}px`;
      record.element.style.top = `${api.clamp(rect.top, api.SAFE_TOP, Math.max(api.SAFE_TOP, innerHeight - Math.min(rect.height, innerHeight - api.SAFE_TOP)))}px`;
      if (rect.width > innerWidth - 12) record.element.style.width = `${innerWidth - 12}px`;
      if (rect.height > innerHeight - api.SAFE_TOP - 8) record.element.style.height = `${innerHeight - api.SAFE_TOP - 8}px`;
    });
  }

  async function init() {
    const ready = await api.waitFor(() =>
      document.documentElement.dataset.nucleidosRuntime === '31.0.0'
      && typeof window.selectNuclide === 'function'
      && api.$('#nuclideCard')
      && api.$('#zProfileDockV29')
      && api.$('#nProfileDockV29')
    );
    if (!ready) {
      console.error('[Nucleidos v32] La interfaz v31 no terminó de inicializarse.');
      return;
    }
    api.ensureTaskbar();
    installGraphs();
    api.installCards?.();
    augmentGuide();
    document.documentElement.dataset.nucleidosRuntime = '32.1.0';
    document.documentElement.dataset.nucleidosPatch = '32.1.0';
    window.addEventListener('resize', constrain, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
