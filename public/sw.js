/*
 * CarryGo service worker.
 *
 * Privacy rule: never cache navigations, server-rendered pages, RSC payloads,
 * API responses, account data, or user-generated resources. Cache only the
 * generic offline fallback and immutable same-origin static assets.
 */
const CACHE_PREFIX = 'carrygo-v';
const CACHE_NAME = 'carrygo-v9';
const OFFLINE_URL = '/offline';
const PUBLIC_ASSETS = new Set([
  '/manifest.webmanifest',
  '/icon.svg',
]);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(OFFLINE_URL, { cache: 'reload' });
      if (response.ok && response.type === 'basic') {
        await cache.put(OFFLINE_URL, response);
      }
    } catch {
      // Installation should still succeed when the network is temporarily down.
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    // Never persist HTML: routes may contain private, account-specific data.
    event.respondWith(fetch(request).catch(async () => {
      const offline = await caches.match(OFFLINE_URL);
      return offline || Response.error();
    }));
    return;
  }

  // Only immutable Next build assets and a tiny explicit public allowlist may
  // enter Cache Storage. In particular, do not cache RSC or arbitrary GETs.
  const immutableAsset = url.pathname.startsWith('/_next/static/') && url.search === '';
  const publicAsset = PUBLIC_ASSETS.has(url.pathname) && url.search === '';
  if (!immutableAsset && !publicAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
