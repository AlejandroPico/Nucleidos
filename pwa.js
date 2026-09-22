(() => {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js', {
        scope: './',
        updateViaCache: 'none'
      });
      window.NucleidosPWA = {
        version: '34.4.0',
        registration,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
      };
    } catch (error) {
      console.error('[Nucleidos PWA] No se pudo registrar el modo sin conexión.', error);
    }
  }, { once: true });
})();
