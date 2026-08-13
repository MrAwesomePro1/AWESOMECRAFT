const ROBOX_CACHE = 'robox-offline-v27';
const ROBOX_CORE_ASSETS = [
  './',
  './index.html',
  './styles.css?v=27',
  './update-27.css?v=27',
  './config.js?v=27',
  './game.js?v=27',
  './version.json',
  './manifest.webmanifest',
  './assets/robox-main-screen.png',
  './robox-world-template.roboxworld',
  './steal-a-brainrot.roboxworld',
  './robox-update-27-download.zip'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(ROBOX_CACHE).then(cache => cache.addAll(ROBOX_CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('robox-offline-') && key !== ROBOX_CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(ROBOX_CACHE).then(cache => cache.put('./index.html', copy));
      return response;
    }).catch(() => caches.match('./index.html').then(response => response || caches.match('./'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(ROBOX_CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => cached)));
});
