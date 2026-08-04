const CORE_CACHE = "paibp-smart-v54-core";
const DATA_CACHE = "paibp-smart-v54-data";
const MEDIA_CACHE = "paibp-smart-v54-media";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./app-config.js?v=54",
  "./final-ui-v54.css?v=54",
  "./final-ui-v54.js?v=54",
  "./realtime-v54.js?v=54",
  "./cp2025-exact-v54.js?v=54",
  "./spensus-ai-v54-patch.js?v=54",
  "./reset-cache-v54.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("paibp-smart") && ![CORE_CACHE, DATA_CACHE, MEDIA_CACHE].includes(key))
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CLEAR_ALL_CACHES") return;
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) || Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, CORE_CACHE).catch(() =>
        caches.match(new URL("./index.html", self.registration.scope).href)
      )
    );
    return;
  }

  if (/cp2025-|assets\/cp-2025\//i.test(url.pathname)) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (/assets\/simulasi-v54\//i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  if (/\.(?:js|css|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(networkFirst(request, CORE_CACHE));
    return;
  }

  if (/\.(?:png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, CORE_CACHE));
});