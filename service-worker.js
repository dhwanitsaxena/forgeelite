

const CACHE_NAME = 'forge-cache-v1';
const urlsToCache = [
  './', // Cache the root index.html
  './index.html',
  './metadata.json',
  './manifest.json',
  './service-worker.js',
  // Local source files (assuming direct serving of ES modules)
  './index.tsx',
  './App.tsx',
  './types.ts',
  './services/geminiService.ts',
  './services/localStorageService.ts',
  './components/M3Button.tsx',
  './components/PlanDisplay.tsx',
  './components/ProgressTracker.tsx',
  './components/ExerciseGuideModal.tsx',
  './components/BodyMap.tsx',
  './components/HowItWorksSlidesheet.tsx', // Added new component to cache
  './components/SwipeToConfirmButton.tsx', // Added SwipeToConfirmButton to cache
  // Icons as defined in manifest.json
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  // External dependencies from importmap and CDN
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700&display=swap',
  // Note: Specific font files from fonts.gstatic.com are usually fetched by the CSS and cached dynamically.
  // We'll explicitly cache the CSS link.
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/client',
  'https://esm.sh/lucide-react@^0.562.0',
  'https://esm.sh/@google/genai@^1.34.0'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Fallback to network if not in cache
        return fetch(event.request).catch(() => {
          // Optional: Return a specific offline page if the network request fails and no cache entry
          // For now, it will just result in a network error for uncached assets.
          // console.log('Service Worker: Fetch failed and no cache match for', event.request.url);
          // return caches.match('/offline.html'); // Example for a dedicated offline page
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});