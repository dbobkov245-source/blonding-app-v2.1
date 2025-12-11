import React from 'react';
import BottomNav from './BottomNav';
import UpdateNotification from './UpdateNotification';
import { useServiceWorker } from '../hooks/useServiceWorker';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Логика PWA обновлений сохраняется
  const { updateAvailable, currentVersion, newVersion, updateServiceWorker, dismiss } = useServiceWorker();

  return (
    <>
      <Head>
        {/* Белый статус бар */}
        <meta name="theme-color" content="#ffffff" />
      </Head>

      {/* pb-24: отступ снизу, чтобы контент не перекрывался меню */}
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">

        {/* Минималистичный хедер */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-4 py-3 pt-safe">
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-center">
            Blonding App
          </h1>
        </header>

        {/* Контент с анимацией */}
        <main className="max-w-md mx-auto px-4 py-6 animate-fade-in">
          {children}
        </main>

        <BottomNav />

        <UpdateNotification
          show={updateAvailable}
          currentVersion={currentVersion}
          newVersion={newVersion}
          onUpdate={updateServiceWorker}
          onDismiss={dismiss}
        />
      </div>
    </>
  );
};

export default Layout;
