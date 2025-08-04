
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('clockin-cache-v1').then(cache => {
      return cache.addAll([
        './index.html',
        './main.js',
        './manifest.json'
      ]);
    })
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
