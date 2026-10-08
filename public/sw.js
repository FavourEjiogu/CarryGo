const CACHE='carrygo-v9';
const SHELL=['/','/login','/do','/earn','/campus','/orders','/you','/wallet','/merchants','/profile','/offline','/manifest.webmanifest','/icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) void caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/offline')))
    );
    return;
  }

  const cacheable = ['script','style','font','image','manifest'].includes(event.request.destination);
  if (!cacheable) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response.ok) void caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
