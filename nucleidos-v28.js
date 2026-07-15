(() => {
  'use strict';
  const id = 'nucleidos-v31-runtime';
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = 'nucleidos-v31.js?v=31.0.0';
  script.async = false;
  script.addEventListener('load', () => {
    document.documentElement.dataset.nucleidosRuntime = '31.0.0';
  });
  script.addEventListener('error', () => {
    console.error('[Nucleidos v31] No se pudo cargar nucleidos-v31.js');
    const status = document.getElementById('dataStatus');
    if (status) {
      status.textContent = 'No se pudo cargar la interfaz v31. Revisa la publicación de GitHub Pages.';
      status.dataset.state = 'error';
    }
  });
  document.body.appendChild(script);
})();
