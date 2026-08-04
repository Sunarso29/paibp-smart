const CACHE_NAME = "paibp-smart-shell-v47";
const CP_CACHE = "paibp-smart-cp-v47";
const SHELL = ["./", "./index.html", "./styles.css", "./app-config.js", "./v34-lite.js", "./script.js", "./logo-spensus.png", "./assets/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(SHELL.map(async (path) => {
      const response = await fetch(new URL(path, self.registration.scope), { cache: "reload" });
      if (response.ok) await cache.put(new URL(path, self.registration.scope), response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME && key !== CP_CACHE && key.startsWith("paibp-smart-")).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request, cacheName = CACHE_NAME) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) caches.open(cacheName).then((cache) => cache.put(request, response.clone())).catch(() => {});
    return response;
  } catch {
    return (await caches.match(request, { ignoreSearch: true })) || Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone())).catch(() => {});
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request).catch(() => caches.match(new URL("./index.html", self.registration.scope))));
    return;
  }

  if (/cp2025-(?:manifest|chunk)-.*-v47\.json$/i.test(url.pathname) || /cp2025-manifest-v47\.json$/i.test(url.pathname)) {
    event.respondWith(networkFirst(request, CP_CACHE));
    return;
  }

  if (/\.(?:js|css|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.headers.has("Range") && /\.(?:mp3|ogg|m4a|wav)$/i.test(url.pathname)) {
    event.respondWith(fetch(request).catch(() => caches.match(request.url)));
    return;
  }

  event.respondWith(cacheFirst(request));
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CLEAR_OLD_CACHES") return;
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME && key !== CP_CACHE).map((key) => caches.delete(key)))));
});
