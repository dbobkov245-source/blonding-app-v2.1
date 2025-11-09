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
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
          <Link href="/" className="font-bold text-xl text-purple-600">
            Blonding App v2.1
          </Link>
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/" className={`px-3 py-1 rounded-md hover:bg-purple-50 ${isActive('/') ? 'text-purple-600 bg-purple-50' : 'text-gray-700'}`}>
              Теория
            </Link>
            <Link href="/Chat" className={`px-3 py-1 rounded-md hover:bg-purple-50 ${isActive('/Chat') ? 'text-purple-600 bg-purple-50' : 'text-gray-700'}`}>
              AI-консультант
            </Link>
            <Link href="/ChatRaw" className={`px-3 py-1 rounded-md hover:bg-purple-50 ${isActive('/ChatRaw') ? 'text-purple-600 bg-purple-50' : 'text-gray-700'}`}>
              Чат с ИИ
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          Blonding App v2.1 • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
