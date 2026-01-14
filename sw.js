const CACHE_NAME = 'aquahabit-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './src/css/tokens.css',
    './src/css/base.css',
    './src/css/theme.css',
    './src/css/app.css',
    './src/js/main.js',
    './src/js/storage.js',
    './src/js/hydration.js',
    './src/js/notifications.js',
    './src/js/ui.js',
    './assets/icons/android-launchericon-192-192.png'
];

// Instalação: Cacheia arquivos essenciais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching shell assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

// Fetch: Estratégia Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retorna do cache se existir
                if (response) {
                    return response;
                }
                // Se não, busca na rede
                return fetch(event.request).catch(() => {
                    // Fallback opcional para quando offline e sem cache (ex: página 404 offline)
                    // Para este app, como cacheamos tudo no install, isso raramente ocorre
                });
            })
    );
});