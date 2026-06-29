const CACHE_NAME = "viders-shell-v20260509e";
const APP_SHELL = [
  "./",
  "./?source=pwa",
  "./index.html",
  "./parents.html",
  "./merch.html",
  "./trailer.html",
  "./styles.css?v=20260509d",
  "./merch.css?v=20260509e",
  "./app.js?v=20260509d",
  "./merch.js?v=20260509e",
  "./viders-bot.js?v=20260509d",
  "./parents.js?v=20260509d",
  "./trailer.js?v=20260509d",
  "./viders-logo-angled.svg",
  "./viders-merch-hero.png",
  "./viders-icon-angled-192.png",
  "./viders-icon-angled-512.png",
  "./viders-apple-touch-angled-120.png",
  "./viders-apple-touch-angled-152.png",
  "./viders-apple-touch-angled-167.png",
  "./viders-apple-touch-angled-180.png",
  "./manifest.webmanifest?v=20260509e"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("./index.html")));
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const shouldRefreshFirst =
    event.request.destination === "script" ||
    event.request.destination === "style" ||
    event.request.destination === "manifest" ||
    requestUrl.pathname.endsWith(".js") ||
    requestUrl.pathname.endsWith(".css") ||
    requestUrl.pathname.endsWith(".webmanifest");

  if (shouldRefreshFirst) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          return networkResponse;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
