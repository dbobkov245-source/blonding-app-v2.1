import React, {useEffect, useState} from 'react'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Theory(){
  const [lessons, setLessons] = useState([])
  const [content, setContent] = useState("")
  const router = useRouter()

  // Загружаем список всех уроков (для боковой панели)
  useEffect(()=>{
    // И ЭТУ СТРОКУ МЫ ЧИНИМ:
    fetch('/lessons/index.json')
      .then(r=>r.json())
      .then(setLessons)
      .catch((e)=>{
        console.error("Ошибка загрузки списка уроков:", e);
      })
  },[])

  // Загружаем контент текущего урока (когда меняется URL)
  useEffect(()=>{
    const slug = router.query.lesson || (lessons[0] && lessons[0].slug)

    if(slug){
      const path = `/lessons/${slug}/${slug}.md`
      fetch(path).then(r=>r.text()).then(setContent)
    }
  },[router.query.lesson, lessons])

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4'>Теория</h2>
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='w-full md:w-1/3'>
          <ul className='space-y-2'>
            {lessons.map(l=>(
              <li key={l.slug}>
                <Link href={`/Theory?lesson=${l.slug}`} className='block p-2 bg-white rounded hover:bg-gray-100 shadow'>
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className='flex-1 bg-white p-4 rounded shadow'>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
