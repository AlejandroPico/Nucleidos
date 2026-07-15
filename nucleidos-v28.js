(() => {
  'use strict';
  const id = 'nucleidos-v30-runtime';
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = 'nucleidos-v30.js?v=30.0.0';
  script.async = false;
  script.addEventListener('load', () => {
    document.documentElement.dataset.nucleidosRuntime = '30.0.0';
  });
  script.addEventListener('error', () => {
    console.error('[Nucleidos v30] No se pudo cargar nucleidos-v30.js');
    const status = document.getElementById('dataStatus');
    if (status) {
      status.textContent = 'No se pudo cargar la interfaz v30. Revisa la publicación de GitHub Pages.';
      status.dataset.state = 'error';
    }
  });
  document.body.appendChild(script);
})();
