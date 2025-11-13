const CACHE_NAME = 'lutongulam-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/js/auth.js',
  '/js/orders.js',
  '/js/validation-fixed.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Try to cache local assets. External CDN resources won't be cached here.
      return cache.addAll(ASSETS.map(path => new Request(path, {mode: 'no-cors'}))).catch(() => {
        // Fallback: attempt to cache what we can without failing installation
        return Promise.resolve();
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Put a copy in cache for next time (best-effort)
        try {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
        } catch (err) {
          // ignore
        }
        return response;
      }).catch(() => {
        // If both cache and network fail, respond with a simple fallback
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
