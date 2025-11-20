import { useEffect, useState } from 'react';

interface ServiceWorkerHook {
    updateAvailable: boolean;
    currentVersion: string | null;
    newVersion: string | null;
    updateServiceWorker: () => void;
    dismiss: () => void;
}

export function useServiceWorker(): ServiceWorkerHook {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [currentVersion, setCurrentVersion] = useState<string | null>(null);
    const [newVersion, setNewVersion] = useState<string | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Проверяем поддержку Service Worker
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        // Регистрируем Service Worker
        navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => {
                console.log('[App] Service Worker registered');
                setRegistration(reg);

                // Получаем текущую версию
                if (reg.active) {
                    const messageChannel = new MessageChannel();
                    messageChannel.port1.onmessage = (event) => {
                        if (event.data && event.data.version) {
                            setCurrentVersion(event.data.version);
                        }
                    };
                    reg.active.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
                }

                // Проверяем обновления при загрузке
                reg.update();

                // Обработчик обновления SW
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;

                    console.log('[App] New Service Worker found');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Новая версия доступна
                            console.log('[App] New version available');

                            // Получаем версию нового SW
                            const messageChannel = new MessageChannel();
                            messageChannel.port1.onmessage = (event) => {
                                if (event.data && event.data.version) {
                                    setNewVersion(event.data.version);
                                    setUpdateAvailable(true);
                                }
                            };
                            newWorker.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('[App] Service Worker registration failed:', error);
            });

        // Слушаем сообщения от Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
                console.log('[App] Received NEW_VERSION_AVAILABLE message');
                setNewVersion(event.data.version);
                setUpdateAvailable(true);
            }
        });

        // Проверяем обновления каждые 60 секунд
        const interval = setInterval(() => {
            if (registration) {
                registration.update();
            }
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, [registration]);

    const updateServiceWorker = () => {
        if (!registration || !registration.waiting) {
            // Если нет ожидающего SW, просто перезагружаем страницу
            window.location.reload();
            return;
        }

        // Отправляем сообщение ожидающему SW для активации
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Перезагружаем страницу после активации нового SW
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    };

    const dismiss = () => {
        setUpdateAvailable(false);
    };

    return {
        updateAvailable,
        currentVersion,
        newVersion,
        updateServiceWorker,
        dismiss,
    };
}
