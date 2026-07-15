(() => {
  'use strict';
  const id = 'nucleidos-v29-runtime';
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = 'nucleidos-v29.js?v=29.0.0';
  script.async = false;
  script.addEventListener('load', () => {
    document.documentElement.dataset.nucleidosRuntime = '29.0.0';
  });
  script.addEventListener('error', () => {
    console.error('[Nucleidos v29] No se pudo cargar nucleidos-v29.js');
    const status = document.getElementById('dataStatus');
    if (status) {
      status.textContent = 'No se pudo cargar la interfaz v29. Revisa la publicación de GitHub Pages.';
      status.dataset.state = 'error';
    }
  });
  document.body.appendChild(script);
})();
