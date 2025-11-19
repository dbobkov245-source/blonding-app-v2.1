import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const isActive = (path: string) => router.asPath === path;

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
          Blonding App v2.2 • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
