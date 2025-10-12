// Enhanced Service Worker v3.0.0 - Azuria PWA - Force Cache Clear
const SW_VERSION = '3.0.0';
const CACHE_NAME = 'azuria-cache-v3';
const IMAGE_CACHE = 'azuria-images-v2';
const API_CACHE = 'azuria-api-v2';
const STATIC_CACHE = 'azuria-static-v2';

// Cache strategy configurations
const CACHE_CONFIG = {
  staticMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  imageMaxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
  apiMaxAge: 5 * 60 * 1000,                // 5 minutes
  maxEntries: {
    images: 50,
    api: 30,
    static: 100
  }
};

// Assets para cache estratégico
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Assets estáticos para cache
const STATIC_ASSETS = [
  // Assets gerados pelo build (ajuste glob no build se usar workbox ou plugin-pwa)
  '/',
  '/manifest.json',
  '/offline.html'
];

// URLs de API para cache
const API_PATTERNS = [
  /\/api\/calculations/,
  /\/api\/user/,
  /\/api\/settings/,
  /\/api\/analytics/
];

// Padrões de imagem para cache
const IMAGE_PATTERNS = [
  /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i,
  /images\.unsplash\.com/,
  /cdn\./
];

// ============= INSTALAÇÃO =============
self.addEventListener('install', (event) => {
  console.log(`🔧 SW v${SW_VERSION}: Installing...`);
  
  event.waitUntil(
    Promise.all([
      cacheStaticAssets(),
      createOfflinePage()
    ]).then(() => {
      console.log('✅ SW: Installation complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ SW: Installation failed:', error);
    })
  );
});

// Cache de assets estáticos críticos
async function cacheStaticAssets() {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    await cache.addAll(CRITICAL_ASSETS);
    console.log('✅ SW: Critical assets cached');
  } catch (error) {
    console.warn('⚠️ SW: Some assets failed to cache:', error);
  }
}

// Criar página offline
async function createOfflinePage() {
  const cache = await caches.open(STATIC_CACHE);
  
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Azuria - Offline</title>
      <style>
        body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
        .container { text-align: center; max-width: 400px; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { color: #0066CC; margin-bottom: 16px; }
        p { color: #64748b; margin-bottom: 24px; }
        button { padding: 12px 24px; background: #0066CC; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0052A3; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔌 Você está offline</h1>
        <p>Verifique sua conexão com a internet e tente novamente.</p>
        <button onclick="window.location.reload()">Tentar Novamente</button>
      </div>
    </body>
    </html>
  `;
  
  await cache.put('/offline.html', new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  }));
}

// ============= ATIVAÇÃO =============
self.addEventListener('activate', (event) => {
  console.log(`🚀 SW v${SW_VERSION}: Activating...`);
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim()
    ]).then(() => {
      console.log('✅ SW: Activation complete');
      scheduleBackgroundSync();
    })
  );
});

// Limpar caches antigos
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [CACHE_NAME, IMAGE_CACHE, API_CACHE, STATIC_CACHE];
  
  await Promise.all(
    cacheNames.map(cacheName => {
      if (!validCaches.includes(cacheName)) {
        console.log('🗑️ SW: Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

// ============= ESTRATÉGIAS DE FETCH =============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Skip non-GET requests
  if (method !== 'GET') {
    return;
  }
  
  // Skip external requests (exceto imagens permitidas)
  if (!url.startsWith(self.location.origin) && !isAllowedExternalResource(url)) {
    return;
  }
  
  // Escolher estratégia baseada no tipo de recurso
  if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Verificações de tipo de recurso
function isImageRequest(url) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(url));
}

function isAPIRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url));
}

function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot)$/i.test(url) || 
         url.includes('/assets/') ||
         STATIC_ASSETS.some(asset => url.includes(asset));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isAllowedExternalResource(url) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(url));
}

// ============= HANDLERS DE ESTRATÉGIA =============

// Cache First para imagens
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    // Verificar se ainda está válido
    const cacheTime = cached.headers.get('sw-cache-time');
    if (cacheTime && Date.now() - parseInt(cacheTime) < CACHE_CONFIG.imageMaxAge) {
      return cached;
    }
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
  // Não é possível alterar headers do Response; encapsule metadados via cache key ou store paralela se necessário
  await cache.put(request, response.clone());
      await cleanupCache(IMAGE_CACHE, CACHE_CONFIG.maxEntries.images);
    }
    return response;
  } catch (error) {
    return cached || new Response('Image not available offline', { status: 503 });
  }
}

// Network First para APIs
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
  await cache.put(request, response.clone());
      await cleanupCache(API_CACHE, CACHE_CONFIG.maxEntries.api);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      const cacheTime = cached.headers.get('sw-cache-time');
      if (cacheTime && Date.now() - parseInt(cacheTime) < CACHE_CONFIG.apiMaxAge) {
        return cached;
      }
    }
    throw error;
  }
}

// Stale While Revalidate para assets estáticos
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
  cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Network First para navegação
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match('/offline.html') || 
           await cache.match('/') || 
           new Response('Offline', { status: 503 });
  }
}

// ============= UTILITÁRIOS =============

// Limpar cache quando exceder limite
async function cleanupCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}

// ============= BACKGROUND SYNC =============
self.addEventListener('sync', (event) => {
  console.log('🔄 SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sincronizar dados pendentes
    await syncPendingData();
    console.log('✅ SW: Background sync completed');
  } catch (error) {
    console.error('❌ SW: Background sync failed:', error);
  }
}

async function syncPendingData() {
  // Implementar sincronização de dados offline
  // Por exemplo: formulários salvos, configurações, etc.
  const pendingData = await getPendingData();
  
  for (const data of pendingData) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      await removePendingData(data.id);
    } catch (error) {
      console.warn('Failed to sync data:', data.id);
    }
  }
}

async function getPendingData() {
  // Implementar recuperação de dados pendentes do IndexedDB
  return [];
}

async function removePendingData(id) {
  // Implementar remoção de dados sincronizados do IndexedDB
}

function scheduleBackgroundSync() {
  // Agendar sync periódico se suportado
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register('background-sync');
    });
  }
}

// ============= PUSH NOTIFICATIONS =============
self.addEventListener('push', (event) => {
  console.log('📱 SW: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(showNotification(data));
  }
});

async function showNotification(data) {
  const options = {
    title: data.title || 'Azuria',
    body: data.body || 'Nova notificação',
  icon: '/lovable-uploads/f326ff5a-6129-4295-99bd-d185851a20a3.png',
  badge: '/lovable-uploads/f326ff5a-6129-4295-99bd-d185851a20a3.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };
  
  await self.registration.showNotification(options.title, options);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// ============= ERROR HANDLING =============
self.addEventListener('error', (event) => {
  console.error('❌ SW Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ SW Unhandled Rejection:', event.reason);
});

console.log(`🚀 Enhanced Service Worker v${SW_VERSION} loaded`);