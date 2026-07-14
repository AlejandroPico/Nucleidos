(() => {
  'use strict';
  const parts = ['nucleidos-v27-runtime-1.part','nucleidos-v27-runtime-2.part','nucleidos-v27-runtime-3.part','nucleidos-v27-runtime-4.part','nucleidos-v27-runtime-5.part','nucleidos-v27-runtime-6.part'];
  Promise.all(parts.map(async path => {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.text();
  }))
    .then(sourceParts => {
      const script = document.createElement('script');
      script.id = 'nucleidos-v27-runtime';
      script.textContent = `${sourceParts.join('')}
//# sourceURL=nucleidos-v27-runtime.js`;
      document.body.appendChild(script);
    })
    .catch(error => {
      console.error('[Nucleidos v27] No se pudo cargar el módulo avanzado.', error);
      document.documentElement.classList.add('v27-load-error');
    });
})();
