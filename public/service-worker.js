
const CACHE_NAME = 'agenda-unifap-cache-v1';
const OFFLINE_FALLBACK_PAGE = '/';

// Recursos para pré-carregar no cache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
];

// Recursos estáticos que sempre devem ser armazenados em cache
const STATIC_ASSETS = [
  '/unifap-logo.png',
  '/favicon.ico',
  '/og-image.png',
  '/placeholder.svg',
  '/service-worker.js',
];

// Instala o service worker e armazena os recursos no cache
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Armazenando recursos em cache');
      // Pré-cache para recursos críticos
      return cache.addAll([...PRECACHE_ASSETS, ...STATIC_ASSETS])
        .then(() => self.skipWaiting());
    })
  );
});

// Limpa caches antigos quando uma nova versão do service worker é ativada
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos, exceto o atual
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de cache: Stale-While-Revalidate para API e Cache-First para recursos estáticos
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignorar solicitações não-GET e análise/telemetria
  if (event.request.method !== 'GET' || 
      url.pathname.startsWith('/api/analytics') || 
      url.hostname.includes('analytics')) {
    return;
  }

  // Estratégia para recursos estáticos - Cache First
  if (isStaticAsset(event.request)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Se encontrado no cache, retorna imediatamente
          return cachedResponse;
        }

        // Se não estiver no cache, busca da rede e armazena
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Se não conseguir buscar, retorna página offline
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_FALLBACK_PAGE);
            }
            return new Response('Conteúdo indisponível no modo offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
      })
    );
    return;
  }

  // Estratégia para solicitações de API - Stale-While-Revalidate
  if (isApiRequest(event.request)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              console.log('[ServiceWorker] Fallback para cache para API:', event.request.url);
              // Se offline e não há cache, retorna erro específico
              if (!cachedResponse) {
                return new Response(
                  JSON.stringify({ error: 'Você está offline e esta informação não está em cache.' }),
                  {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                      'Content-Type': 'application/json',
                    }),
                  }
                );
              }
              return null;
            });

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Estratégia padrão para outros recursos - Network First
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Se não estiver em cache e a solicitação é para navegação, retorne a página offline
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_FALLBACK_PAGE);
            }

            return new Response('Conteúdo indisponível no modo offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
      })
  );
});

// Helper para verificar se é um recurso estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  );
}

// Helper para verificar se é uma requisição de API
function isApiRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.includes('/api/') ||
    url.hostname.includes('supabase.co')
  );
}

// Evento de sincronização para enviar dados quando online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

// Função para sincronizar solicitações pendentes
async function syncPendingRequests() {
  try {
    // Aqui implementaríamos lógica para enviar solicitações armazenadas
    // quando o dispositivo estiver offline
    console.log('[ServiceWorker] Sincronizando solicitações pendentes');
  } catch (error) {
    console.error('[ServiceWorker] Erro na sincronização:', error);
  }
}
