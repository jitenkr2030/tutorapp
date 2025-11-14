const CACHE_NAME = 'tutorconnect-v1';
const API_CACHE_NAME = 'tutorconnect-api-v1';
const IMAGE_CACHE_NAME = 'tutorconnect-images-v1';

// Cache URLs
const CACHE_URLS = [
  '/',
  '/dashboard',
  '/search',
  '/auth/signin',
  '/auth/signup',
  '/manifest.json',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/auth/session',
  '/api/tutors/search',
  '/api/calendar/events',
  '/api/notifications'
];

// Static assets to cache
const STATIC_ASSETS = [
  '/logo.svg',
  '/placeholder-avatar.svg',
  '/placeholder-avatar.jpg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Cached app shell');
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle image requests
  if (event.request.destination === 'image') {
    event.respondWith(handleImageRequest(event.request));
    return;
  }
  
  // Handle page requests
  event.respondWith(handlePageRequest(event.request));
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first for API requests
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful GET requests
      if (request.method === 'GET' && API_CACHE_URLS.some(url => request.url.includes(url))) {
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    }
    
    throw new Error('Network response was not ok');
  } catch (error) {
    // Try cache if network fails
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return offline response for critical API endpoints
    if (request.url.includes('/api/auth/session')) {
      return new Response(JSON.stringify({ error: 'Offline', authenticated: false }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Handle image requests
async function handleImageRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
    
    throw new Error('Network response was not ok');
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return placeholder image if not found
    if (request.url.includes('avatar')) {
      return fetch('/placeholder-avatar.svg');
    }
    
    throw error;
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache page responses
      if (CACHE_URLS.includes(new URL(request.url).pathname)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    }
    
    throw new Error('Network response was not ok');
  } catch (error) {
    // Try cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessions());
  }
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification from TutorConnect',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin + '/notifications'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TutorConnect', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Sync functions (placeholder implementations)
async function syncMessages() {
  // Sync offline messages with server
  console.log('Syncing messages...');
}

async function syncSessions() {
  // Sync offline session updates with server
  console.log('Syncing sessions...');
}

async function syncNotifications() {
  // Sync offline notification preferences with server
  console.log('Syncing notifications...');
}

// Message handling from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});