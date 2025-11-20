import React, { useEffect, useState } from 'react';

interface UpdateNotificationProps {
    show: boolean;
    currentVersion: string | null;
    newVersion: string | null;
    onUpdate: () => void;
    onDismiss: () => void;
}

export default function UpdateNotification({
    show,
    currentVersion,
    newVersion,
    onUpdate,
    onDismiss,
}: UpdateNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            // Небольшая задержка для анимации
            setTimeout(() => setIsVisible(true), 100);
        } else {
            setIsVisible(false);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
        >
            <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-1 shadow-2xl">
                    <div className="relative rounded-xl bg-white/95 backdrop-blur-sm dark:bg-gray-900/95">
                        <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
                            {/* Иконка */}
                            <div className="flex-shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                                    <svg
                                        className="h-6 w-6 text-white animate-pulse"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Контент */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                    Доступно обновление! 🎉
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    Новая версия приложения готова к установке.
                                    {currentVersion && newVersion && (
                                        <span className="ml-1 font-mono text-xs">
                                            ({currentVersion} → {newVersion})
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Кнопки действий */}
                            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                                <button
                                    onClick={onUpdate}
                                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:px-6"
                                >
                                    <span className="relative z-10">Обновить сейчас</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </button>

                                <button
                                    onClick={onDismiss}
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 sm:px-4"
                                >
                                    Позже
                                </button>
                            </div>
                        </div>

                        {/* Прогресс-бар анимация */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-xl bg-gray-200 dark:bg-gray-700">
                            <div className="h-full w-full animate-pulse bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
