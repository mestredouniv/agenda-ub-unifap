
// Service Worker for Offline Support

const CACHE_NAME = 'unifap-app-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/pages/Index.tsx',
  '/src/pages/Consultas.tsx',
  '/src/pages/AgendaProfissional.tsx'
];

// Install Service Worker - Cache all important assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing new version');
  
  // Force waiting service worker to become active
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('[Service Worker] Cache error:', error);
      })
  );
});

// Activate event - Clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  
  // Take control of all clients immediately
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Network-first strategy with improved offline support
self.addEventListener('fetch', (event) => {
  // Skip for supabase realtime and non-GET requests
  if (event.request.url.includes('realtime') || event.request.method !== 'GET') {
    return;
  }
  
  // For HTML pages and app routes, use network-first strategy
  if (event.request.headers.get('accept')?.includes('text/html') || 
      event.request.url.includes('/src/') ||
      event.request.url.match(/\/$/) || 
      event.request.url.includes('/pages/')) {
      
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the successful response
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone))
            .catch(err => console.error('[Service Worker] Cache put error:', err));
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Fetch failed, returning from cache:', event.request.url);
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cached response, fall back to index.html for client-side routing
              return caches.match('/index.html');
            });
        })
    );
    return;
  }
  
  // For all other assets (JS, CSS, images), also use network first
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache the successful response
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone))
          .catch(err => console.error('[Service Worker] Cache put error:', err));
        return response;
      })
      .catch(() => {
        console.log('[Service Worker] Falling back to cache for:', event.request.url);
        return caches.match(event.request);
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.action === 'checkForUpdates') {
    self.registration.update();
  }
});

// Periodic background sync if supported
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-cache') {
      event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
          return cache.addAll(STATIC_ASSETS);
        })
      );
    }
  });
}
