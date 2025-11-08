import React from 'react';
import Link from 'next/link';
import '../index.css'; // 1. ИМПОРТИРУЕМ СТИЛИ

// Это главный компонент твоего приложения
export default function MyApp({ Component, pageProps }) {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      
      {/* 2. ДОБАВЛЯЕМ НАВИГАЦИЮ */}
      <nav className='bg-white shadow-sm'>
        <div className='max-w-4xl mx-auto p-4 flex gap-4 items-center'>
          <Link href='/' className='font-semibold text-lg'>
            Blonding App v2.1
          </Link>
          
          {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
          {/* Ссылка "Теория" теперь ведет на главную, где находится список уроков */}
          <Link href='/' className='text-sm hover:underline'>
            Теория
          </Link>
          
          <Link href='/Chat' className='text-sm hover:underline'>
            AI-консультант
          </Link>
          <Link href='/Test' className='text-sm hover:underline'>
            Тест
          </Link>
        </div>
      </nav>

      {/* 3. Здесь будет отображаться текущая страница (Home, Theory и т.д.) */}
      <main className='max-w-4xl mx-auto p-6'>
        <Component {...pageProps} />
      </main>

    </div>
  );
}
