/* ============================================
   sw.js — Service Worker (Cache-first)
   Cache name: learn-llms-v1
   ============================================ */

const CACHE_NAME = 'learn-llms-v2';
const PRECACHE_URLS = [
  '/learn-llms/',
  '/learn-llms/index.html',
  '/learn-llms/style.css',
  '/learn-llms/app.js',
  '/learn-llms/manifest.json',
  '/learn-llms/404.html',
  '/learn-llms/chapters/01-neurons.html',
  '/learn-llms/chapters/02-networks.html',
  '/learn-llms/chapters/03-training.html',
  '/learn-llms/chapters/04-llms.html',
  '/learn-llms/chapters/05-attention.html',
  '/learn-llms/chapters/06-practical.html',
  '/learn-llms/chapters/07-finetuning.html',
  '/learn-llms/chapters/08-evaluation.html',
  '/learn-llms/chapters/09-agents.html',
  '/learn-llms/assets/icon-192.svg',
  '/learn-llms/assets/icon-512.svg',
];

// Install — pre-cache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first strategy
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache valid responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/learn-llms/404.html');
        }
      });
    })
  );
});
