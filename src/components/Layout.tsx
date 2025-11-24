import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import UpdateNotification from './UpdateNotification';
import { useServiceWorker } from '../hooks/useServiceWorker';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const isActive = (path: string) => router.asPath === path;
  const { updateAvailable, currentVersion, newVersion, updateServiceWorker, dismiss } = useServiceWorker();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <Link href="/" className="font-bold text-xl sm:text-2xl text-purple-600">
            Blonding App
          </Link>
          <div className="flex gap-2 sm:gap-3 text-base sm:text-sm font-medium flex-wrap w-full sm:w-auto">
            <Link href="/" className={`px-4 py-2.5 sm:py-2 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/') ? 'text-purple-600 bg-purple-50' : 'text-gray-700'}`}>
              Теория
            </Link>
            <Link href="/Assistant" className={`px-4 py-2.5 sm:py-2 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/Assistant') ? 'text-purple-600 bg-purple-50' : 'text-gray-700'}`}>
              Голосовой
            </Link>
            <Link href="/Chat" className={`px-4 py-2.5 sm:py-2 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/Chat') ? 'text-purple-600 bg-purple-50' : 'text-gray-700'}`}>
              AI
            </Link>
            <Link href="/ChatRaw" className={`px-4 py-2.5 sm:py-2 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/ChatRaw') ? 'text-purple-600 bg-purple-50' : 'text-gray-700'}`}>
              Чат
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
      <footer className="bg-white border-t mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-base sm:text-sm text-gray-600">
          <button
            onClick={async () => {
              if (window.confirm('Обновить приложение и сбросить кэш?')) {
                try {
                  if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                      await registration.unregister();
                    }
                  }
                  const keys = await caches.keys();
                  await Promise.all(keys.map(key => caches.delete(key)));
                  window.location.reload();
                } catch (e) {
                  console.error(e);
                  window.location.reload();
                }
              }
            }}
            className="hover:text-purple-600 transition-colors"
          >
            Blonding App v2.2.4 • {new Date().getFullYear()}
          </button>
        </div>
      </footer>
      <UpdateNotification
        show={updateAvailable}
        currentVersion={currentVersion}
        newVersion={newVersion}
        onUpdate={updateServiceWorker}
        onDismiss={dismiss}
      />
    </div>
  );
};

export default Layout;
