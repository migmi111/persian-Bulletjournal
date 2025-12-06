// Service Worker برای PWA
const CACHE_NAME = 'bulletjournal-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.png',
  './fonts/Delbarbold.ttf',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// نصب Service Worker
self.addEventListener('install', event => {
  console.log('🔄 Service Worker در حال نصب...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ کش باز شد');
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('✅ همه منابع کش شدند');
            return self.skipWaiting();
          })
          .catch(error => {
            console.error('❌ خطا در کش کردن منابع:', error);
          });
      })
  );
});

// فعال‌سازی Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker فعال شد');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ حذف کش قدیمی: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ کش‌های قدیمی پاک شدند');
      return self.clients.claim();
    })
  );
});

// درخواست‌های شبکه
self.addEventListener('fetch', event => {
  // از کش کردن درخواست‌های POST و ... جلوگیری کن
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر در کش بود، از کش برگردان
        if (response) {
          console.log(`📦 استفاده از کش برای: ${event.request.url}`);
          return response;
        }
        
        // در غیر این صورت از شبکه بگیر
        console.log(`🌐 دریافت از شبکه: ${event.request.url}`);
        return fetch(event.request)
          .then(response => {
            // بررسی پاسخ معتبر
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // کلون پاسخ برای کش کردن
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
                  .then(() => {
                    console.log(`💾 ذخیره در کش: ${event.request.url}`);
                  });
              });
            
            return response;
          })
          .catch(error => {
            console.error('❌ خطا در دریافت:', error);
            // برای صفحات، صفحه اصلی را برگردان
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            return new Response('خطای شبکه', { 
              status: 408,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
          });
      })
  );
});

// نوتیفیکیشن Push (برای آینده)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const title = data.title || 'یادآوری BulletJournal';
    const options = {
      body: data.body || 'یادآوری جدید دارید',
      icon: './icon.png',
      badge: './icon.png',
      tag: data.tag || 'reminder',
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'مشاهده'
        },
        {
          action: 'close',
          title: 'بستن'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('❌ خطا در پردازش نوتیفیکیشن:', error);
  }
});

// کلیک روی نوتیفیکیشن
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // اگر پنجره‌ای باز است، روی آن فوکوس کن
          for (const client of clientList) {
            if (client.url.includes('/persian-Bulletjournal/') && 'focus' in client) {
              return client.focus();
            }
          }
          // اگر پنجره‌ای باز نیست، پنجره جدید باز کن
          if (clients.openWindow) {
            return clients.openWindow('./');
          }
        })
    );
  }
});
