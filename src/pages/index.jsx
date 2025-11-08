import React, {useEffect, useState} from 'react'
import Link from 'next/link'

export default function Home(){
  const [lessons, setLessons] = useState([])

  useEffect(()=>{
    // Загружаем наш сгенерированный список уроков
    fetch('/lessons/index.json') 
      .then(r=>r.json())
      .then(setLessons)
      .catch((e)=>{
        console.error("Ошибка загрузки уроков:", e);
      })
  },[])

  return (
    // Эта страница теперь содержит ТОЛЬКО список уроков
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>

      {lessons.length ?
      lessons.map(l=>(
        // Используем encodeURIComponent для имен с кириллицей
        <Link 
          key={l.slug} 
          href={`/Theory?lesson=${encodeURIComponent(l.slug)}`} 
          className='block bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition'
        >
          <h3 className='text-lg font-semibold mb-2'>{l.title}</h3>
          <p className='text-sm text-blue-600'>Открыть урок</p>
        </Link>
      )) :
      // Сообщение о загрузке
      <div className='p-6 bg-white rounded shadow col-span-3'>
        Загрузка уроков...
      </div>}

    </div>
  )
}
