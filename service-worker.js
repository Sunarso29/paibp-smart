const CORE_CACHE = "paibp-smart-v50-core";
const DATA_CACHE = "paibp-smart-v50-data";
const AUDIO_CACHE = "paibp-smart-v50-audio";
const CORE_ASSETS = [
  "./", "./index.html", "./app-config.js", "./final-ui-v50.css", "./final-ui-v50.js",
  "./gerbang.jpg", "./logo-spensus.png", "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await Promise.allSettled(CORE_ASSETS.map((path) => cache.add(new Request(path, { cache: "reload" }))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("paibp-smart") && ![CORE_CACHE, DATA_CACHE, AUDIO_CACHE].includes(key))
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CLEAR_ALL_CACHES") return;
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
});

function parseRange(value, total) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(String(value || ""));
  if (!match || !total) return null;
  let start;
  let end;
  if (match[1] === "") {
    const suffix = Number(match[2]);
    if (!suffix) return null;
    start = Math.max(0, total - suffix);
    end = total - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? total - 1 : Number(match[2]);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= total || end < start) return null;
  return { start, end: Math.min(end, total - 1) };
}

async function audioRange(request) {
  let response = await caches.match(request.url);
  if (!response) {
    response = await fetch(new Request(request.url, { headers: { Accept: request.headers.get("Accept") || "*/*" } }));
    if (response.ok) {
      const cache = await caches.open(AUDIO_CACHE);
      await cache.put(request.url, response.clone());
    }
  }
  const bytes = await response.arrayBuffer();
  const part = parseRange(request.headers.get("Range"), bytes.byteLength);
  if (!part) return new Response(null, { status: 416 });
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${part.start}-${part.end}/${bytes.byteLength}`);
  headers.set("Content-Length", String(part.end - part.start + 1));
  return new Response(bytes.slice(part.start, part.end + 1), { status: 206, headers });
}

async function networkFirst(request, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    return cached || fallback?.() || Response.error();
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

  if (request.headers.has("Range") && /\.(?:mp3|ogg|m4a|wav)$/i.test(url.pathname)) {
    event.respondWith(audioRange(request));
    return;
  }

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, CORE_CACHE, () => caches.match(new URL("./index.html", self.registration.scope).href)));
    return;
  }

  if (/cp2025-(?:manifest|data|source)-.+-v48\.(?:js|docx|xlsx)$/i.test(url.pathname)) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (/\.(?:js|css|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(networkFirst(request, CORE_CACHE));
    return;
  }

  if (/\.(?:png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CORE_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, CORE_CACHE));
});
