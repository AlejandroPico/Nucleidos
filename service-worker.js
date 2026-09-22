'use strict';

const CACHE_VERSION = 'nucleidos-34.4.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './favicon-32.png',
  './apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './styles.css',
  './nucleidos-v27.css',
  './nucleidos-v28.css',
  './nucleidos-v29.css',
  './nucleidos-v30.css',
  './nucleidos-v31.css',
  './nucleidos-v32.css',
  './nucleidos-v32-patch.css',
  './nucleidos-v33.css',
  './app.js',
  './pwa.js',
  './nuclides-data.js',
  './nuclides.csv',
  './nucleidos-ui-loader.js',
  './nucleidos-ui-css.b64',
  './nucleidos-ui-js-1.b64',
  './nucleidos-ui-js-2.b64',
  './nucleidos-ui-js-3.b64',
  './nucleidos-ui-js-4.b64',
  './nucleidos-v28.js',
  './nucleidos-v29.js',
  './nucleidos-v30.js',
  './nucleidos-v31.js',
  './nucleidos-v32-core.js',
  './nucleidos-v32-cards.js',
  './nucleidos-v32-compare.js',
  './nucleidos-v32-init.js',
  './nucleidos-v33.js',
  './data/iaea-sync.json'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.allSettled(APP_SHELL.map(path => cache.add(new Request(path, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('nucleidos-') && key !== CACHE_VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const cacheKey = new Request(`${url.origin}${url.pathname}`);

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_VERSION);
        cache.put('./index.html', response.clone());
        return response;
      } catch (_) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(cacheKey);
    const update = fetch(request).then(async response => {
      if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(cacheKey, response.clone());
      }
      return response;
    }).catch(() => null);
    return cached || (await update) || Response.error();
  })());
});
