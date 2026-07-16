(() => {
  'use strict';

  const loaderId = 'nucleidos-v32-loader';
  if (document.getElementById(loaderId)) return;
  const marker = document.createElement('meta');
  marker.id = loaderId;
  document.head.appendChild(marker);

  const NativeMutationObserver = window.MutationObserver;

  function installMutationObserverGuard() {
    if (!NativeMutationObserver || window.MutationObserver?.__nucleidosV31Guard) return;

    class GuardedMutationObserver {
      constructor(callback) { this.observer = new NativeMutationObserver(callback); }
      observe(target, options = {}) {
        const problematic = target?.id === 'nuclideCard'
          && options.subtree === true
          && options.childList === true
          && options.characterData === true;
        if (!problematic) {
          this.observer.observe(target, options);
          return;
        }
        const sources = ['detailSymbol', 'detailA', 'detailName']
          .map(id => target.querySelector(`#${id}`))
          .filter(Boolean);
        if (!sources.length) {
          this.observer.observe(target, { childList: true, subtree: false });
          return;
        }
        for (const source of sources) {
          this.observer.observe(source, { childList: true, subtree: true, characterData: true });
        }
      }
      disconnect() { this.observer.disconnect(); }
      takeRecords() { return this.observer.takeRecords(); }
    }

    GuardedMutationObserver.__nucleidosV31Guard = true;
    window.MutationObserver = GuardedMutationObserver;
  }

  function restoreNativeMutationObserver() {
    if (window.MutationObserver?.__nucleidosV31Guard) window.MutationObserver = NativeMutationObserver;
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

  function loadScript(id, src) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        if (existing.dataset.loaded === '1') resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
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

  async function boot() {
    try {
      installMutationObserverGuard();
      await loadScript('nucleidos-v31-runtime', 'nucleidos-v31.js?v=31.0.4');
      installIntegrationGuards();
      await loadScript('nucleidos-v32-core', 'nucleidos-v32-core.js?v=32.3.1');
      await loadScript('nucleidos-v32-cards', 'nucleidos-v32-cards.js?v=32.3.1');
      await loadScript('nucleidos-v32-compare', 'nucleidos-v32-compare.js?v=32.3.1');
      await loadScript('nucleidos-v32-init', 'nucleidos-v32-init.js?v=32.3.1');
      setTimeout(restoreNativeMutationObserver, 30000);
    } catch (error) {
      restoreNativeMutationObserver();
      console.error('[Nucleidos v32] No se pudo cargar la interfaz.', error);
      const status = document.getElementById('dataStatus');
      if (status) {
        status.textContent = 'No se pudo cargar la interfaz v32. Revisa la publicación de GitHub Pages.';
        status.dataset.state = 'error';
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
