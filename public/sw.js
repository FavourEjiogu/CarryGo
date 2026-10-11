const CACHE='carrygo-v10';
const STATIC_SHELL=['/offline','/manifest.webmanifest','/icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(STATIC_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('carrygo-') && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
    .then(async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) client.postMessage({ type: 'CARRYGO_SW_UPDATED' });
    }));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  if (request.mode === 'navigate') {
    // Do not cache rendered pages: authenticated HTML may contain private user data.
    event.respondWith(fetch(request).catch(() => caches.match('/offline')));
    return;
  }

  if (!['script','style','font','image','manifest'].includes(request.destination)) return;
  event.respondWith(
    caches.match(request).then(cached => {
      const fresh = fetch(request).then(response => {
        if (response.ok && response.type === 'basic') {
          void caches.open(CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
