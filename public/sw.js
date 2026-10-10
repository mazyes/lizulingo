// LIZULINGO service worker.
// HTML and JSON: network first (so every deploy shows up at once; cache only when offline).
// Hashed /assets/ and /audio/*.mp3: cache first (their file names change when content changes).
const CACHE_NAME = 'lizulingo-cache-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      // Drop old caches: v2 served a stale index.html forever.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
      // Reload open tabs once so they leave the old cached app.
      const tabs = await self.clients.matchAll({ type: 'window' });
      tabs.forEach((tab) => tab.navigate(tab.url).catch(() => {}));
    })()
  );
});

const isImmutable = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith('/assets/') || (url.pathname.startsWith('/audio/') && url.pathname.endsWith('.mp3')));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (isImmutable(url)) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) =>
          hit ||
          fetch(e.request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Network first for pages, manifest.json, audio/manifest.json, everything else.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((hit) => hit || (e.request.mode === 'navigate' ? caches.match('/') : undefined))
      )
  );
});
