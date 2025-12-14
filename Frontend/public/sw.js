// Frontend/public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('sgss-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/static/css/main.css',
        '/static/js/main.js',
      ]);
    })
  );
});