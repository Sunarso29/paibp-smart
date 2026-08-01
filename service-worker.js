const CACHE_NAME = "paibp-smart-core-v25";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./privacy.html",
  "./terms.html",
  "./support.html",
  "./contact.html",
  "./fitur.html",
  "./tenaga-pendidik.html",
  "./tenaga-kependidikan.html",
  "./404.html",
  "./manifest.webmanifest",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./styles.css",
  "./app-config.js",
  "./content-data.js",
  "./teacher-source-data.js",
  "./calendar-data.js",
  "./staff-images.js",
  "./school-data.js",
  "./banjarnegara-school-directory.js",
  "./islamic-data.js",
  "./islamic-learning-data.js",
  "./islamic-upgrade-v19.js",
  "./islamic-upgrade-v20.js",
  "./islamic-upgrade-v21.js",
  "./islamic-upgrade-v22.js",
  "./assets/audio/abu-yazid-nurdin-al-hijr-85-99.mp3",
  "./assets/audio/abu-yazid-nurdin-al-hijr-85-99.ogg",
  "./assets/audio/muflih-safitra-quran-central.mp3",
  "./assets/audio/muflih-safitra-quran-central.ogg",
  "./vendor/jszip.min.js",
  "./vendor/pptxgen.min.js",
  "./office-export.js",
  "./khutbah-source-data.js",
  "./khutbah-verse-data.js",
  "./hadith-data.js",
  "./arabic-data.js",
  "./game-data.js",
  "./video-data.js",
  "./docx-export.js",
  "./assets/data/quran-id.json",
  "./assets/data/QURAN-DATA-LICENSE.txt",
  "./assessment-data.js",
  "./assessment-ui.js",
  "./script.js",
  "./v25-ui.js",
  "./public-pages.js",
  "./logo-spensus.png",
  "./sunarso.jpeg",
  "./gerbang.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS.map((path) => new URL(path, self.registration.scope).href)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("paibp-smart-core-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function parseRange(rangeHeader, totalLength) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(String(rangeHeader || "").trim());
  if (!match || !totalLength) return null;
  let start;
  let end;
  if (match[1] === "" && match[2] !== "") {
    const suffixLength = Number(match[2]);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, totalLength - suffixLength);
    end = totalLength - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? totalLength - 1 : Number(match[2]);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= totalLength || end < start) return null;
  return { start, end: Math.min(end, totalLength - 1) };
}

async function rangeResponse(request) {
  const cached = await caches.match(request.url, { ignoreSearch: false });
  let fullResponse = cached;
  if (!fullResponse || fullResponse.status === 206) {
    try {
      const fullRequest = new Request(request.url, { method: "GET", headers: { Accept: request.headers.get("Accept") || "*/*" }, cache: "no-store", credentials: request.credentials });
      const network = await fetch(fullRequest);
      if (network.ok && network.status === 200) {
        fullResponse = network.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request.url, network.clone());
      } else {
        return network;
      }
    } catch {
      return new Response("Audio tidak tersedia.", { status: 503, headers: { "Content-Type": "text/plain;charset=utf-8" } });
    }
  }
  const bytes = await fullResponse.arrayBuffer();
  const range = parseRange(request.headers.get("Range"), bytes.byteLength);
  if (!range) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.byteLength}` } });
  }
  const headers = new Headers(fullResponse.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${range.start}-${range.end}/${bytes.byteLength}`);
  headers.set("Content-Length", String(range.end - range.start + 1));
  if (!headers.get("Content-Type")) {
    headers.set("Content-Type", /\.ogg(?:$|\?)/i.test(request.url) ? "audio/ogg" : "audio/mpeg");
  }
  return new Response(bytes.slice(range.start, range.end + 1), { status: 206, statusText: "Partial Content", headers });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const requestUrl = new URL(request.url);

  if (request.headers.has("Range") && /\.(?:mp3|ogg|m4a|wav)(?:$|\?)/i.test(requestUrl.pathname)) {
    event.respondWith(rangeResponse(request));
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
    return;
  }

  if (/\.(?:js|css|json|webmanifest)$/i.test(requestUrl.pathname)) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match(new URL("./index.html", self.registration.scope).href)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && response.status === 200) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    })),
  );
});
