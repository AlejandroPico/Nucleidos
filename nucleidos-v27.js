(() => {
  'use strict';
  const parts = ['nucleidos-v27-runtime-1.b64','nucleidos-v27-runtime-2.b64','nucleidos-v27-runtime-3.b64','nucleidos-v27-runtime-4.b64'];

  async function load() {
    const responses = await Promise.all(parts.map(path => fetch(path, { cache: 'no-store' })));
    responses.forEach((response, index) => {
      if (!response.ok) throw new Error(`${parts[index]}: HTTP ${response.status}`);
    });

    const encoded = (await Promise.all(responses.map(response => response.text()))).join('').trim();
    if (typeof DecompressionStream !== 'function') {
      throw new Error('Este navegador no admite DecompressionStream.');
    }

    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const source = await new Response(stream).text();
    const script = document.createElement('script');
    script.id = 'nucleidos-v27-runtime';
    script.textContent = `${source}\n//# sourceURL=nucleidos-v27-runtime.js`;
    document.body.appendChild(script);
  }

  load().catch(error => {
    console.error('[Nucleidos v27] No se pudo cargar el módulo avanzado.', error);
    document.documentElement.classList.add('v27-load-error');
  });
})();
