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

        // Функция для принудительной проверки версии
        const forceVersionCheck = async () => {
            try {
                // Загружаем актуальную версию с сервера (без кеша)
                const response = await fetch('/sw-custom.js?t=' + Date.now(), {
                    cache: 'no-cache',
                    headers: { 'Cache-Control': 'no-cache' }
                });

                if (response.ok) {
                    const script = await response.text();
                    const serverVersionMatch = script.match(/const APP_VERSION = '(.+)'/);

                    if (serverVersionMatch) {
                        const serverVersion = serverVersionMatch[1];
                        console.log('[App] Server version:', serverVersion);

                        // Получаем локальную версию
                        const localResponse = await fetch('/sw-custom.js');
                        const localScript = await localResponse.text();
                        const localVersionMatch = localScript.match(/const APP_VERSION = '(.+)'/);

                        if (localVersionMatch) {
                            const localVersion = localVersionMatch[1];
                            console.log('[App] Local version:', localVersion);
                            setCurrentVersion(localVersion);

                            // Сравниваем версии
                            if (serverVersion !== localVersion) {
                                console.log('[App] Version mismatch detected! Update available.');
                                setNewVersion(serverVersion);
                                setUpdateAvailable(true);
                            } else {
                                console.log('[App] Versions match, no update needed');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('[App] Force version check failed:', error);
            }
        };

        // КРИТИЧНО: Проверяем версию сразу при загрузке (для TWA)
        forceVersionCheck();

        // Загружаем custom SW скрипт
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
            .then(async (reg) => {
                console.log('[App] Service Worker ready');
                setRegistration(reg);

                // Получаем текущую версию
                if (reg.active) {
                    fetch('/sw-custom.js')
                        .then(r => r.text())
                        .then(script => {
                            const versionMatch = script.match(/const APP_VERSION = '(.+)'/);
                            if (versionMatch && !currentVersion) {
                                setCurrentVersion(versionMatch[1]);
                                console.log('[App] Current version from SW:', versionMatch[1]);
                            }
                        });
                }

                // Принудительно проверяем обновления
                console.log('[App] Forcing SW update check...');
                await reg.update();

                // Слушаем изменения в регистрации
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;

                    console.log('[App] New Service Worker found');

                    newWorker.addEventListener('statechange', () => {
                        console.log('[App] SW state changed:', newWorker.state);

                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                console.log('[App] New version available - SW installed');

                                // Получаем версию нового SW
                                fetch('/sw-custom.js?t=' + Date.now(), { cache: 'no-cache' })
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

        // Проверяем обновления чаще для TWA (каждые 30 секунд)
        const interval = setInterval(() => {
            console.log('[App] Periodic update check...');
            forceVersionCheck();
            if (registration) {
                registration.update();
            }
        }, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [registration, currentVersion]);

    const updateServiceWorker = () => {
        console.log('[App] Reloading for update...');
        window.location.reload();
    };

    useEffect(() => {
        // Если контроллер изменился (новый SW активировался), перезагружаем страницу
        const handleControllerChange = () => {
            console.log('[App] Controller changed, reloading...');
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        return () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    }, []);

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
