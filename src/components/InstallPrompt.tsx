import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Проверяем, не установлено ли уже
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
        if (isInstalled) {
            return;
        }

        // Проверяем, не отклонял ли пользователь ранее
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed === 'true') {
            return;
        }

        // Слушаем событие установки
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Показываем промпт через 3 секунды после загрузки
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA установлено');
            }

            setDeferredPrompt(null);
            setShowPrompt(false);
        } catch (error) {
            console.error('Ошибка установки PWA:', error);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt || !deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 md:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                            Установить приложение
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Установите Blonding App на устройство для быстрого доступа и работы без интернета
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:from-purple-600 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                Установить
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-100 transition-colors active:scale-95"
                            >
                                Позже
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
