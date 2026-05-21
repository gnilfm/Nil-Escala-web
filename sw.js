const CACHE_NAME = 'nil-escala-v20';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon.png'
];

// Instalação: Cacheia a App Shell imediatamente
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o SW a ativar imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto: ', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Controla todos os clientes imediatamente
});

// Fetch: Estratégia Cache-First (Offline garantido)
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-http (ex: chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  // Se for navegação (abrir o app), retorna index.html do cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((response) => {
        return response || fetch(event.request).catch(() => {
          // Se falhar a rede e não tiver no cache (raro se instalado), retorna index.html
          return caches.match('/index.html');
        });
      })
    );
    return;
  }

  // Para outros arquivos (CSS, JS, Imagens)
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se existir
      if (response) {
        return response;
      }
      
      // Se não, busca na rede
      return fetch(event.request).then((networkResponse) => {
        // Verifica se a resposta é válida
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cacheia o novo recurso dinamicamente para o futuro
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});