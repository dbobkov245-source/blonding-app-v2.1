import React from 'react'
import Link from 'next/link'
import fs from 'fs' // Node.js 'file system'
import path from 'path' // Node.js 'path'

// 1. Компонент теперь получает 'lessons' как пропс (props)
export default function Home({ lessons }){
  
  // 2. Убрали useEffect и useState. Данные приходят сразу.

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      
      {lessons.length ?
      lessons.map(l=>(
        // 3. ОБНОВЛЯЕМ ССЫЛКУ на динамический маршрут
        <Link 
          key={l.slug} 
          href={`/Theory/${encodeURIComponent(l.slug)}`} 
          className='block bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition'
        >
          <h3 className='text-lg font-semibold mb-2'>{l.title}</h3>
          <p className='text-sm text-blue-600'>Открыть урок</p>
        </Link>
      )) :
      <div className='p-6 bg-white rounded shadow col-span-3'>
        Уроки не найдены.
      </div>}
      
    </div>
  )
}

// 4. НОВАЯ ФУНКЦИЯ: getStaticProps
// Этот код выполняется на сервере (Vercel) во время сборки
export async function getStaticProps() {
  // Находим путь к нашему index.json
  const filePath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
  let lessons = [];

  try {
    // Читаем файл
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    lessons = JSON.parse(fileContent);
  } catch (error) {
    console.error("Ошибка чтения index.json:", error.message);
    // Если файла нет, просто вернем пустой массив
  }

  // 5. Передаем 'lessons' в компонент Home как пропс
  return {
    props: {
      lessons: lessons
    },
    // revalidate: 60 // (Опционально) Можно добавить, чтобы Vercel пересобирал эту страницу каждые 60 сек
  };
}
