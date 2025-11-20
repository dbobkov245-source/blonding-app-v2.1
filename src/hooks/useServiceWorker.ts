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
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        // Проверяем поддержку Service Worker
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        // Загружаем custom SW скрипт для добавления логики обновления
        const loadCustomSW = async () => {
            try {
                const response = await fetch('/sw-custom.js');
                if (response.ok) {
                    console.log('[App] Custom SW script loaded');
                }
            } catch (error) {
                console.error('[App] Failed to load custom SW:', error);
            }
        };

        loadCustomSW();

        // Получаем текущую регистрацию SW (next-pwa автоматически регистрирует)
        navigator.serviceWorker.ready
            .then((reg) => {
                console.log('[App] Service Worker ready');
                setRegistration(reg);

                // Получаем текущую версию
                if (reg.active) {
                    // Импортируем и запускаем кастомный SW скрипт
                    fetch('/sw-custom.js')
                        .then(r => r.text())
                        .then(script => {
                            // Извлекаем версию из скрипта
                            const versionMatch = script.match(/const APP_VERSION = '(.+)'/);
                            if (versionMatch) {
                                setCurrentVersion(versionMatch[1]);
                                console.log('[App] Current version from SW:', versionMatch[1]);
                            }
                        });
                }

                // Проверяем обновления при загрузке
                reg.update();

                // Слушаем изменения в регистрации
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;

                    console.log('[App] New Service Worker found');
                    setWaitingWorker(newWorker);

                    newWorker.addEventListener('statechange', () => {
                        console.log('[App] SW state changed:', newWorker.state);

                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // Новая версия доступна
                                console.log('[App] New version available - SW installed');

                                // Получаем версию нового SW
                                fetch('/sw-custom.js?t=' + Date.now())
                                    .then(r => r.text())
                                    .then(script => {
                                        const versionMatch = script.match(/const APP_VERSION = '(.+)'/);
                                        if (versionMatch) {
                                            const version = versionMatch[1];
                                            console.log('[App] New version detected:', version);
                                            setNewVersion(version);
                                            setUpdateAvailable(true);
                                        }
                                    });
                            } else {
                                // Первая установка
                                console.log('[App] SW installed for the first time');
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('[App] Service Worker ready error:', error);
            });

        // Слушаем сообщения от Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('[App] Received message from SW:', event.data);

            if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
                console.log('[App] New version available message:', event.data.version);
                setNewVersion(event.data.version);
                setUpdateAvailable(true);
            }
        });

        // Проверяем обновления каждые 60 секунд
        const interval = setInterval(() => {
            if (registration) {
                console.log('[App] Checking for updates...');
                registration.update();
            }
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, [registration]);

    const updateServiceWorker = () => {
        console.log('[App] Applying update...');

        const worker = waitingWorker || registration?.waiting;

        if (worker) {
            // Отправляем сообщение waiting SW для активации
            worker.postMessage({ type: 'SKIP_WAITING' });

            // Перезагружаем страницу после активации нового SW
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    console.log('[App] Controller changed, reloading...');
                    window.location.reload();
                }
            });
        } else {
            // Если нет waiting worker, просто перезагружаем
            console.log('[App] No waiting worker, reloading...');
            window.location.reload();
        }
    };

    const dismiss = () => {
        console.log('[App] Update dismissed');
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
