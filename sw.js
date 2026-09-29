// Offline support: cache the game so solo races work from the Home Screen without a connection.
// (Online races need the game server, so they only work while connected.)
const CACHE = 'turbo-karts-v3';
const FILES = [
  './', 'index.html', 'style.css', 'manifest.webmanifest',
  'js/main.js', 'js/sim.js', 'js/gl.js', 'js/math.js', 'js/input.js', 'js/audio.js', 'js/net.js', 'js/world.js',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
// Network first (so updates arrive), falling back to cache when offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).pathname.endsWith('/ws')) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
