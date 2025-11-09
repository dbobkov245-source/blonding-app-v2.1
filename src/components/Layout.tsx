import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto p-4 flex gap-4 items-center">
          <Link href="/" className="font-semibold text-lg">
            Blonding App v2.1
          </Link>
          <Link href="/" className="text-sm hover:underline">
            Теория
          </Link>
          <Link href="/Chat" className="text-sm hover:underline">
            AI-консультант
          </Link>
          {/* Ссылка на /Test удалена, 
            чтобы избежать ошибки 404, так как /Test/index.tsx не существует.
          */}
        </div>
      </nav>
      <main className="max-w-4xl mx-auto p-6">{children}</main>
    </div>
  );
};

export default Layout;
