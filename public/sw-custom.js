// Кастомный public service worker для добавления логики обновления
// Этот файл будет добавлен в precache list через next-pwa

const APP_VERSION = 'v2.2.5';

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
    console.log('[Custom SW] Received message:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[Custom SW] SKIP_WAITING called');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        console.log('[Custom SW] Getting version:', APP_VERSION);
        event.ports[0].postMessage({ version: APP_VERSION });
    }
});

// Уведомление клиентов при активации новой версии
self.addEventListener('activate', (event) => {
    console.log('[Custom SW] Activating version:', APP_VERSION);

    event.waitUntil(
        (async () => {
            // Получаем контроль над всеми клиентами
            await self.clients.claim();

            // Уведомляем всех клиентов о новой версии
            const clients = await self.clients.matchAll({ type: 'window' });
            clients.forEach((client) => {
                client.postMessage({
                    type: 'NEW_VERSION_AVAILABLE',
                    version: APP_VERSION
                });
            });
        })()
    );
});

console.log('[Custom SW] Loaded version:', APP_VERSION);
