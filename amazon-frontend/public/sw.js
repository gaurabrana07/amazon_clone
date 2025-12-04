// Service Worker for Amazon Clone PWA
const CACHE_NAME = 'amazon-clone-v1.0.0';
const STATIC_CACHE_NAME = 'amazon-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'amazon-dynamic-v1.0.0';
const IMAGE_CACHE_NAME = 'amazon-images-v1.0.0';

// Cache different types of resources
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/amazon-favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png'
];

const RUNTIME_CACHE = [
  '/cart',
  '/wishlist',
  '/orders',
  '/profile',
  '/search'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache app shell
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(['/']);
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== DYNAMIC_CACHE_NAME &&
            cacheName !== IMAGE_CACHE_NAME
          ) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests (like chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    // API requests - Network First with Cache Fallback
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME));
    }
    // Images - Cache First with Network Fallback
    else if (request.destination === 'image') {
      event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE_NAME));
    }
    // Static assets - Cache First
    else if (
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'manifest'
    ) {
      event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
    }
    // Navigation requests - Network First with Cache Fallback
    else if (request.mode === 'navigate') {
      event.respondWith(networkFirstStrategy(request, CACHE_NAME));
    }
    // Other requests - Stale While Revalidate
    else {
      event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE_NAME));
    }
  }
});

// Caching Strategies

// Network First - Try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, serving from cache:', request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache First - Try cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache and network failed for:', request.url);
    throw error;
  }
}

// Stale While Revalidate - Serve from cache, update in background
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  return cachedResponse || networkResponsePromise;
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-cart') {
    event.waitUntil(syncCartData());
  } else if (event.tag === 'background-sync-wishlist') {
    event.waitUntil(syncWishlistData());
  } else if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncOrderData());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'You have new updates in your Amazon Clone app!',
    icon: '/icon-192.png',
    badge: '/icon-maskable-192.png',
    tag: 'amazon-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Amazon Clone';
    options.icon = data.icon || options.icon;
  }

  event.waitUntil(
    self.registration.showNotification('Amazon Clone', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Sync functions for offline actions
async function syncCartData() {
  try {
    const offlineActions = await getOfflineActions('cart');
    for (const action of offlineActions) {
      await processOfflineAction(action);
    }
    await clearOfflineActions('cart');
    console.log('Service Worker: Cart data synced successfully');
  } catch (error) {
    console.error('Service Worker: Failed to sync cart data:', error);
  }
}

async function syncWishlistData() {
  try {
    const offlineActions = await getOfflineActions('wishlist');
    for (const action of offlineActions) {
      await processOfflineAction(action);
    }
    await clearOfflineActions('wishlist');
    console.log('Service Worker: Wishlist data synced successfully');
  } catch (error) {
    console.error('Service Worker: Failed to sync wishlist data:', error);
  }
}

async function syncOrderData() {
  try {
    const offlineActions = await getOfflineActions('orders');
    for (const action of offlineActions) {
      await processOfflineAction(action);
    }
    await clearOfflineActions('orders');
    console.log('Service Worker: Order data synced successfully');
  } catch (error) {
    console.error('Service Worker: Failed to sync order data:', error);
  }
}

// Helper functions for offline data management
async function getOfflineActions(type) {
  // This would typically read from IndexedDB
  return [];
}

async function processOfflineAction(action) {
  // Process the offline action when back online
  return fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action)
  });
}

async function clearOfflineActions(type) {
  // Clear processed offline actions from storage
  console.log(`Cleared offline actions for ${type}`);
}

// Handle app updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Loaded successfully');