// Service Worker برای PWA
const CACHE_NAME = 'bulletjournal-v1';
const urlsToCache = [
  '/persian-Bulletjournal/',
  '/persian-Bulletjournal/index.html',
  '/persian-Bulletjournal/style.css',
  '/persian-Bulletjournal/script.js',
  '/persian-Bulletjournal/manifest.json',
  '/persian-Bulletjournal/icon.png',
  '/persian-Bulletjournal/icons/icon-192.png',
  '/persian-Bulletjournal/icons/icon-512.png'
];

// نصب Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// فعال‌سازی Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// درخواست‌های شبکه
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر در کش بود، از کش برگردان
        if (response) {
          return response;
        }
        
        // در غیر این صورت از شبکه بگیر
        return fetch(event.request)
          .then(response => {
            // فقط پاسخ‌های معتبر را کش کن
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // کلون پاسخ برای کش کردن
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});