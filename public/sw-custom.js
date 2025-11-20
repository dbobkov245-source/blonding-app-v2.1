// Custom Service Worker with Auto-Update Logic
// Версия берется из package.json при сборке

const CACHE_VERSION = 'v2.2.1'; // Будет обновляться автоматически
const CACHE_NAME = `blonding-app-${CACHE_VERSION}`;

// Событие установки нового Service Worker
self.addEventListener('install', (event) => {
    console.log(`[SW] Installing new version: ${CACHE_VERSION}`);

    // Пропускаем ожидание и сразу переходим к активации
    // self.skipWaiting() вызывается только при явном запросе от клиента
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Cache opened');
            return cache.addAll([
                '/',
                '/offline.html',
                '/manifest.json'
            ]);
        })
    );
});

// Событие активации - очистка старых кешей
self.addEventListener('activate', (event) => {
    console.log(`[SW] Activating new version: ${CACHE_VERSION}`);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('blonding-app-')) {
                        console.log(`[SW] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Берем контроль над всеми клиентами
            return self.clients.claim();
        })
    );
});

// Сообщаем всем клиентам о доступном обновлении
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Received SKIP_WAITING message');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

// Уведомляем клиентов о новой версии при обновлении SW
self.addEventListener('updatefound', () => {
    console.log('[SW] Update found!');
});

// Отправляем сообщение всем клиентам о новой версии
async function notifyClients() {
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => {
        client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: CACHE_VERSION
        });
    });
}

// При контроле над клиентом проверяем версию
self.addEventListener('controllerchange', () => {
    console.log('[SW] Controller changed');
    notifyClients();
});
