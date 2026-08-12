const RECOVERY_URL = new URL('./index.html?recovery=v130', self.location.href).href;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => /paibp|smart|spensus/i.test(k)).map(k => caches.delete(k)));
    } catch (_) {}
    try { await self.registration.unregister(); } catch (_) {}
    try {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(windows.map(client => client.navigate(RECOVERY_URL).catch(() => null)));
    } catch (_) {}
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request, { cache: 'no-store' }).catch(() => new Response('PAIBP SMART sedang memulihkan alamat lama.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
  })));
});
