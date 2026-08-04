const CACHE_NAME = "paibp-smart-core-v44-ai-focus-cp";
const CP_CACHE = "paibp-smart-cp2025-v44";
const CORE_ASSETS = [
  "./","./index.html","./fitur.html","./mapel-lain.html","./literasi-digital.html","./artikel-islam.html","./about-spensus.html","./contact.html","./privacy.html","./support.html","./terms.html","./akses-guru.html","./kendali-editor.html","./404.html",
  "./styles.css","./v28-ui.css","./v29-ui.css","./v30-ui.css","./v32-ui.css","./v33-multimapel.css","./v34-lite.css","./literasi-digital.css","./v37-final.css","./v38-upgrade.css","./v39-upgrade.css","./v40-upgrade.css","./realtime-v43.css","./spensus-ai-v44.css","./learning-guard-v44.css",
  "./manifest.webmanifest","./assets/icons/icon-192.png","./assets/icons/icon-512.png","./logo-spensus.png","./logo-spensus-hd.png","./gerbang.jpg","./sunarso.jpeg",
  "./app-config.js","./content-data.js","./teacher-source-data.js","./calendar-data.js","./staff-images.js","./school-data.js","./banjarnegara-school-directory.js","./islamic-data.js","./islamic-learning-data.js","./islamic-upgrade-v19.js","./islamic-upgrade-v20.js","./islamic-upgrade-v21.js","./islamic-upgrade-v22.js","./khutbah-source-data.js","./khutbah-verse-data.js","./hadith-data.js","./arabic-data.js","./assessment-data.js","./game-data.js","./video-data.js","./docx-export.js","./vendor/jszip.min.js","./vendor/pptxgen.min.js","./office-export.js","./assessment-ui.js","./script.js","./spensus-ai.js","./multimapel-loader.js","./v26-ui.js","./v28-ui.js","./v29-ui.js","./v30-ui.js","./public-pages.js","./v29-public.js","./v34-lite.js","./v38-upgrade.js","./v39-upgrade.js","./v40-upgrade.js","./realtime-v43.js","./learning-guard-v44.js","./cp2025-preview-pack.b64","./literasi-digital.js","./artikel-data.js","./artikel-islam.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(CORE_ASSETS.map(async (path) => {
      const url = new URL(path, self.registration.scope).href;
      const response = await fetch(url, { cache: "reload" });
      if (response.ok) await cache.put(url, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) =>
      (key.startsWith("paibp-smart-core-") && key !== CACHE_NAME)
      || (key.startsWith("paibp-smart-cp2025-") && key !== CP_CACHE)
    ).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function parseRange(value, total) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(String(value || "").trim());
  if (!match || !total) return null;
  let start, end;
  if (match[1] === "") {
    const suffix = Number(match[2]);
    if (!suffix) return null;
    start = Math.max(0, total - suffix); end = total - 1;
  } else {
    start = Number(match[1]); end = match[2] === "" ? total - 1 : Number(match[2]);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= total || end < start) return null;
  return { start, end: Math.min(end, total - 1) };
}

async function rangeResponse(request) {
  let response = await caches.match(request.url);
  if (!response || response.status === 206) {
    response = await fetch(new Request(request.url, { headers: { Accept: request.headers.get("Accept") || "*/*" }, cache: "no-store" }));
    if (response.ok && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request.url, response.clone());
    }
  }
  const bytes = await response.arrayBuffer();
  const range = parseRange(request.headers.get("Range"), bytes.byteLength);
  if (!range) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.byteLength}` } });
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${range.start}-${range.end}/${bytes.byteLength}`);
  headers.set("Content-Length", String(range.end - range.start + 1));
  return new Response(bytes.slice(range.start, range.end + 1), { status: 206, headers });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.headers.has("Range") && /\.(?:mp3|ogg|m4a|wav)$/i.test(url.pathname)) {
    event.respondWith(rangeResponse(request)); return;
  }

  if (url.origin === self.location.origin && /cp2025-(?:preview|source)-pack\.b64$/i.test(url.pathname)) {
    event.respondWith(fetch(request, { cache: "no-store" }).then((response) => {
      if (response.ok) caches.open(CP_CACHE).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(request, { ignoreSearch: true })));
    return;
  }

  if (url.origin !== self.location.origin) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok || response.type === "opaque") caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    })));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(async () => await caches.match(request) || caches.match(new URL("./index.html", self.registration.scope).href)));
    return;
  }

  if (/\.(?:js|css|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(fetch(request, { cache: "no-store" }).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(request, { ignoreSearch: true })));
    return;
  }

  event.respondWith(caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
    return response;
  })));
});
