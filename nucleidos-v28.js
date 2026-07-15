(() => {
  'use strict';

  const id = 'nucleidos-v31-runtime';
  if (document.getElementById(id)) return;

  const NativeMutationObserver = window.MutationObserver;

  function installMutationObserverGuard() {
    if (!NativeMutationObserver || window.MutationObserver?.__nucleidosV31Guard) return;

    class GuardedMutationObserver {
      constructor(callback) {
        this.observer = new NativeMutationObserver(callback);
      }

      observe(target, options = {}) {
        const isProblematicCardObserver = target?.id === 'nuclideCard'
          && options.subtree === true
          && options.childList === true
          && options.characterData === true;

        if (!isProblematicCardObserver) {
          this.observer.observe(target, options);
          return;
        }

        // La v31 observaba toda la ficha y, dentro del callback, volvía a
        // escribir el subtítulo de la propia ficha. Esa escritura generaba
        // otra mutación y provocaba un ciclo de microtareas sin fin.
        // Solo se observan ahora los tres campos que realmente alimentan el
        // subtítulo; el subtítulo generado queda fuera del área observada.
        const sources = ['detailSymbol', 'detailA', 'detailName']
          .map(fieldId => target.querySelector(`#${fieldId}`))
          .filter(Boolean);

        if (!sources.length) {
          this.observer.observe(target, { childList: true, subtree: false });
          return;
        }

        for (const source of sources) {
          this.observer.observe(source, {
            childList: true,
            subtree: true,
            characterData: true
          });
        }
      }

      disconnect() {
        this.observer.disconnect();
      }

      takeRecords() {
        return this.observer.takeRecords();
      }
    }

    GuardedMutationObserver.__nucleidosV31Guard = true;
    GuardedMutationObserver.NativeMutationObserver = NativeMutationObserver;
    window.MutationObserver = GuardedMutationObserver;
  }

  function restoreNativeMutationObserver() {
    if (window.MutationObserver?.__nucleidosV31Guard) {
      window.MutationObserver = NativeMutationObserver;
    }
  }

  function installIntegrationGuards() {
    if (!document.getElementById('nucleidos-v31-integration-guards')) {
      const style = document.createElement('style');
      style.id = 'nucleidos-v31-integration-guards';
      style.textContent = `
        .graphs-popover-v31 { z-index: 1450 !important; }
        .card-window-bar-v31 { grid-column: 1 / -1; }
        .window-minimized-v31 [data-window-minimize],
        .window-minimized-v31 [data-card-minimize] {
          width: auto !important;
          min-width: 78px !important;
          padding: 0 7px !important;
        }
      `;
      document.head.appendChild(style);
    }

    const normalizeLayers = () => {
      const graphs = document.getElementById('graphsPopoverV31');
      if (graphs) graphs.style.setProperty('z-index', '1450', 'important');
      const decay = document.getElementById('decayOverlayCanvasV30');
      if (decay) decay.style.setProperty('z-index', '72', 'important');
      const legacy = document.getElementById('nuclearOverlayLayerV29');
      if (legacy) legacy.style.setProperty('z-index', '70', 'important');
    };

    normalizeLayers();
    const observer = new NativeMutationObserver(normalizeLayers);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 20000);

    document.addEventListener('click', event => {
      if (event.target.closest('#legendPopover, #minimapButton, .legend-mode-btn, .legend-item, .layer-toggle')) {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
      }
    }, true);

    let syncingProperty = false;
    document.addEventListener('change', event => {
      if (syncingProperty || event.target.id !== 'overlayPropertyV29') return;
      const filter = document.getElementById('propertyFilterSelectV31');
      if (!filter || ![...filter.options].some(option => option.value === event.target.value)) return;
      syncingProperty = true;
      filter.value = event.target.value;
      filter.dispatchEvent(new Event('change', { bubbles: true }));
      syncingProperty = false;
    }, true);
  }

  installMutationObserverGuard();

  const script = document.createElement('script');
  script.id = id;
  script.src = 'nucleidos-v31.js?v=31.0.2';
  script.async = false;
  script.addEventListener('load', () => {
    document.documentElement.dataset.nucleidosRuntime = '31.0.0';
    installIntegrationGuards();

    // Los observadores creados durante la inicialización conservan ya la
    // configuración segura. Se restaura el constructor nativo para no afectar
    // a módulos que puedan cargarse posteriormente.
    setTimeout(restoreNativeMutationObserver, 30000);
  });
  script.addEventListener('error', () => {
    restoreNativeMutationObserver();
    console.error('[Nucleidos v31] No se pudo cargar nucleidos-v31.js');
    const status = document.getElementById('dataStatus');
    if (status) {
      status.textContent = 'No se pudo cargar la interfaz v31. Revisa la publicación de GitHub Pages.';
      status.dataset.state = 'error';
    }
  });
  document.body.appendChild(script);
})();