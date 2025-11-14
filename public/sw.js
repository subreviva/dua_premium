/**
 * Service Worker para PWA
 * 
 * Implementa cache estratégico, sincronização offline e push notifications
 */

const CACHE_NAME = 'music-studio-v1.2.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const API_CACHE = `${CACHE_NAME}-api`;

// Recursos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/acesso',
  '/login',
  '/chat',
  '/offline',
  '/manifest.webmanifest',
  '/_next/static/css/app/globals.css',
  // Adicionar mais assets conforme necessário
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  networkFirst: ['/', '/chat', '/acesso', '/login'],
  cacheFirst: ['/_next/static/', '/icons/', '/images/'],
  staleWhileRevalidate: ['/api/'],
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Interceptação de requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determinar estratégia de cache
  const strategy = determineStrategy(url.pathname);
  
  event.respondWith(
    handleRequest(request, strategy)
      .catch((error) => {
        console.error('[SW] Fetch failed:', error);
        return handleOffline(request);
      })
  );
});

// Determinar estratégia baseada no path
function determineStrategy(pathname) {
  if (CACHE_STRATEGIES.networkFirst.some(path => pathname.startsWith(path))) {
    return 'networkFirst';
  }
  if (CACHE_STRATEGIES.cacheFirst.some(path => pathname.startsWith(path))) {
    return 'cacheFirst';
  }
  if (CACHE_STRATEGIES.staleWhileRevalidate.some(path => pathname.startsWith(path))) {
    return 'staleWhileRevalidate';
  }
  return 'networkFirst'; // Default
}

// Manipular request baseado na estratégia
async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);
    case 'networkFirst':
    default:
      return networkFirst(request);
  }
}

// Estratégia: Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Estratégia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // ✅ FIX: Só cachear requisições GET (POST/PUT/DELETE não podem ser cacheadas)
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Só tentar cache em requisições GET
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    throw error;
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(API_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Manipular requests offline
async function handleOffline(request) {
  // Se for uma navegação, retornar página offline
  if (request.mode === 'navigate') {
    const offlinePage = await caches.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  // Se for um recurso, tentar cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback response
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'No internet connection available' 
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manipular cliques em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      handleBackgroundSync()
    );
  }
});

async function handleBackgroundSync() {
  // Implementar sincronização de dados quando voltar online
  console.log('[SW] Performing background sync');
  
  try {
    // Sincronizar logs de auditoria pendentes
    const pendingLogs = await getStoredItem('pending-audit-logs') || [];
    
    if (pendingLogs.length > 0) {
      // Enviar logs pendentes
      for (const log of pendingLogs) {
        await fetch('/api/audit-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log)
        });
      }
      
      // Limpar logs enviados
      await setStoredItem('pending-audit-logs', []);
      console.log('[SW] Audit logs synchronized');
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Utilidades para IndexedDB
async function getStoredItem(key) {
  return new Promise((resolve) => {
    const request = indexedDB.open('MusicStudioCache', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.value);
      };
      
      getRequest.onerror = () => {
        resolve(null);
      };
    };
    
    request.onerror = () => {
      resolve(null);
    };
  });
}

async function setStoredItem(key, value) {
  return new Promise((resolve) => {
    const request = indexedDB.open('MusicStudioCache', 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      store.put({ key, value, timestamp: Date.now() });
      
      transaction.oncomplete = () => {
        resolve(true);
      };
      
      transaction.onerror = () => {
        resolve(false);
      };
    };
    
    request.onerror = () => {
      resolve(false);
    };
  });
}