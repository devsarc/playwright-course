const CACHE_NAME = 'lumio-v3';

// Only cache truly static assets — never page HTML
const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add('/offline')));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // API routes: always network, offline fallback returns error JSON
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        }),
      ),
    );
    return;
  }

  // Static assets (_next/static, fonts, images): cache-first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // All page navigation: network-first so auth state is always fresh.
  // Fall back to /offline only when truly offline.
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/offline')),
  );
});
