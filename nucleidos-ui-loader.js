(() => {
  'use strict';
  const assets = {
    css: ['nucleidos-ui-css.b64'],
    js: ['nucleidos-ui-js-1.b64','nucleidos-ui-js-2.b64','nucleidos-ui-js-3.b64','nucleidos-ui-js-4.b64']
  };
  async function read(paths) {
    const responses = await Promise.all(paths.map(path => fetch(path, { cache: 'no-store' })));
    responses.forEach((response, index) => { if (!response.ok) throw new Error(`${paths[index]}: HTTP ${response.status}`); });
    return (await Promise.all(responses.map(response => response.text()))).join('').trim();
  }
  async function inflate(encoded) {
    const bytes = Uint8Array.from(atob(encoded), ch => ch.charCodeAt(0));
    if (typeof DecompressionStream !== 'function') throw new Error('El navegador no admite descompresión gzip.');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  }
  Promise.all([read(assets.css), read(assets.js)])
    .then(([cssPayload, jsPayload]) => Promise.all([inflate(cssPayload), inflate(jsPayload)]))
    .then(([css, js]) => {
      const style = document.createElement('style');
      style.id = 'nucleidos-ui-v26';
      style.textContent = css;
      document.head.appendChild(style);
      (0, eval)(`${js}\n//# sourceURL=nucleidos-ui.js`);
    })
    .catch(error => {
      console.error('[Nucleidos UI] No se pudieron cargar las mejoras.', error);
      document.documentElement.classList.add('ui-load-error');
    });
})();
