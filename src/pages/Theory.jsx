import React, {useEffect, useState} from 'react'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/router'
import Link from 'next/link'

// Эта функция очистит текст от служебной информации (--- ... ---)
function cleanMarkdown(rawText) {
  // Ищем блок, который начинается и заканчивается на ---
  // и заменяем его на пустую строку
  return rawText.replace(/---[\s\S]*?---/, '');
}

export default function Theory(){
  const [lessons, setLessons] = useState([])
  const [content, setContent] = useState("")
  const router = useRouter()

  // Загружаем список всех уроков (для боковой панели)
  useEffect(()=>{
    fetch('/lessons/index.json')
      .then(r=>r.json())
      .then(setLessons)
      .catch((e)=>{
        console.error("Ошибка загрузки списка уроков:", e);
      })
  },[])

  // Загружаем контент текущего урока
  useEffect(()=>{
    const slug = router.query.lesson || (lessons.length ? lessons[0].slug : null);

    if(slug){
      const path = `/lessons/${slug}/${slug}.md`
      fetch(path)
        .then(r=>r.text())
        .then(rawText => {
          // ИСПОЛЬЗУЕМ ОЧИСТКУ ПЕРЕД ЗАПИСЬЮ
          setContent(cleanMarkdown(rawText));
        })
    }
  },[router.query.lesson, lessons])

  return (
    <div>
      {/* Мы убрали h2, так как он теперь в _app.jsx */}
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='w-full md:w-1/3'>
          {/* Список уроков */}
          <ul className='space-y-2'>
            {lessons.map(l=>(
              <li key={l.slug}>
                <Link href={`/Theory?lesson=${l.slug}`} className='block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition'>
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Контент урока */}
        <div className='flex-1 bg-white p-6 rounded-lg shadow-sm'>
          {/* Добавляем 'prose' класс для красивого отображения markdown */}
          <article className="prose">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  )
}
