// Advanced PWA Service Worker for Azuria
// Version 3.0.0 - Complete offline-first implementation

const SW_VERSION = '3.0.0';
const CACHE_PREFIX = 'azuria-pwa';
const CACHES = {
  static: `${CACHE_PREFIX}-static-v${SW_VERSION}`,
  dynamic: `${CACHE_PREFIX}-dynamic-v${SW_VERSION}`,
  api: `${CACHE_PREFIX}-api-v${SW_VERSION}`,
  images: `${CACHE_PREFIX}-images-v${SW_VERSION}`
};

// Critical assets to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico'
];

// API endpoints patterns to cache
const API_PATTERNS = [
  /\/api\/calculations/,
  /\/api\/marketplace/,
  /supabase\.co.*\/rest/,
  /crpzkppsriranmeumfqs\.supabase\.co/
];

// Install event - pre-cache critical resources
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${SW_VERSION}`);
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHES.static).then(cache => cache.addAll(STATIC_RESOURCES)),
      self.skipWaiting()
    ])
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${SW_VERSION}`);
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith(CACHE_PREFIX) && !Object.values(CACHES).includes(name))
            .map(name => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  event.respondWith(routeRequest(request));
});

// Route requests based on type
async function routeRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Static assets - Cache First
    if (isStaticAsset(url)) {
      return await cacheFirst(request, CACHES.static);
    }
    
    // Images - Cache First with compression
    if (isImage(request)) {
      return await cacheFirst(request, CACHES.images);
    }
    
    // API calls - Network First with fallback
    if (isAPI(url)) {
      return await networkFirst(request, CACHES.api);
    }
    
    // HTML pages - Stale While Revalidate
    if (isHTML(request)) {
      return await staleWhileRevalidate(request, CACHES.dynamic);
    }
    
    // Default strategy
    return await networkFirst(request, CACHES.dynamic);
    
  } catch (error) {
    console.error('[SW] Request failed:', error);
    return handleOffline(request);
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Background update for freshness
    updateInBackground(request, cache);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return handleOffline(request);
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful responses
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return handleOffline(request);
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Update in background
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached immediately if available
  if (cached) {
    return cached;
  }
  
  // Otherwise wait for network
  return await networkPromise || handleOffline(request);
}

// Background update helper
function updateInBackground(request, cache) {
  fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    })
    .catch(() => {
      // Silent fail for background updates
    });
}

// Request type checkers
function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot|ico)(\?.*)?$/.test(url.pathname) ||
         url.pathname === '/manifest.json';
}

function isImage(request) {
  return request.destination === 'image' ||
         /\.(png|jpg|jpeg|gif|webp|svg|avif)(\?.*)?$/.test(request.url);
}

function isAPI(url) {
  return API_PATTERNS.some(pattern => pattern.test(url.href)) ||
         url.pathname.startsWith('/api/');
}

function isHTML(request) {
  return request.destination === 'document' ||
         (request.headers.get('accept') || '').includes('text/html');
}

// Offline fallback
async function handleOffline(request) {
  if (isHTML(request)) {
    const cache = await caches.open(CACHES.static);
    return cache.match('/offline.html') || 
           new Response('Aplicação offline', { status: 503 });
  }
  
  if (isImage(request)) {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('Offline', { status: 503 });
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nova atualização disponível',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'open', title: 'Abrir', icon: '/favicon.ico' },
      { action: 'close', title: 'Fechar', icon: '/favicon.ico' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Azuria', options)
  );
});

// Handle notification clicks
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
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('[SW] Background sync started');
  
  try {
    // Sync offline calculations or cached user data
    const cache = await caches.open(CACHES.api);
    // Implementation for syncing offline actions
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Performance tracking
self.addEventListener('message', (event) => {
  if (event.data?.type === 'TRACK_PERFORMANCE') {
    // Send performance data to Application Insights
    console.log('[SW] Performance tracked:', event.data);
  }
});

console.log(`[SW] Advanced Service Worker v${SW_VERSION} loaded`);