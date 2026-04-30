const CACHE_NAME = ‘bestway-bjj-v1’;
const ASSETS = [
‘/’,
‘/index.html’,
‘/logo.png’,
‘/manifest.json’
];

// Instala e cacheia os arquivos principais
self.addEventListener(‘install’, (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(ASSETS);
})
);
self.skipWaiting();
});

// Limpa caches antigos
self.addEventListener(‘activate’, (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(
keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
)
)
);
self.clients.claim();
});

// Estratégia: Network First (tenta online, cai pro cache se offline)
self.addEventListener(‘fetch’, (event) => {
// Ignora requisições Firebase (sempre precisam de rede)
if (event.request.url.includes(‘firebase’) ||
event.request.url.includes(‘firestore’) ||
event.request.url.includes(‘googleapis’)) {
return;
}

event.respondWith(
fetch(event.request)
.then((response) => {
// Cacheia a resposta fresca
const clone = response.clone();
caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
return response;
})
.catch(() => {
// Offline: serve do cache
return caches.match(event.request).then((cached) => {
return cached || caches.match(’/index.html’);
});
})
);
});

// Notificações push (para uso futuro)
self.addEventListener(‘push’, (event) => {
const data = event.data ? event.data.json() : {};
const title = data.title || ‘Best Way BJJ’;
const options = {
body: data.body || ‘’,
icon: ‘/logo.png’,
badge: ‘/logo.png’
};
event.waitUntil(self.registration.showNotification(title, options));
});