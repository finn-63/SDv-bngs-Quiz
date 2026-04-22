const CACHE_NAME = 'sdv-quiz-v1';
const urlsToCache = [
  '/',
  '/SDvQuiz4.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install: Cache alle wichtigen Dateien
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('SDV Quiz: Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
      .catch(function(err) {
        console.log('SDV Quiz: Cache-Fehler', err);
      })
  );
  self.skipWaiting();
});

// Activate: Alte Caches löschen
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('SDV Quiz: Alter Cache gelöscht:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Aus Cache oder Netzwerk laden (Cache-First Strategie)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache-Hit: Datei aus Cache zurückgeben
        if (response) {
          return response;
        }
        // Kein Cache-Hit: Aus dem Netzwerk laden
        return fetch(event.request)
          .then(function(networkResponse) {
            // Nur erfolgreiche Anfragen cachen
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Kopie im Cache speichern
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          })
          .catch(function() {
            // Offline und nicht im Cache: Fallback anzeigen
            console.log('SDV Quiz: Offline, Datei nicht im Cache');
          });
      })
  );
});