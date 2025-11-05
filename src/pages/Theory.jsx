import React, {useEffect, useState} from 'react'
import ReactMarkdown from 'react-markdown'
import { useLocation } from 'react-router-dom'
export default function Theory(){
  const [lessons, setLessons] = useState([])
  const [content, setContent] = useState('')
  const loc = useLocation()
  useEffect(()=>{fetch('/lessons/index.json').then(r=>r.json()).then(setLessons).catch(()=>{fetch('/lessons/generated/index.json').then(r=>r.json()).then(setLessons).catch(()=>{})})},[])
  useEffect(()=>{const params = new URLSearchParams(loc.search); const slug = params.get('lesson') || (lessons[0] && lessons[0].slug); if(slug){const path = `/lessons/${slug}/${slug}.md`; fetch(path).then(r=>r.text()).then(setContent).catch(()=>setContent('# Урок не найден'))}},[loc.search, lessons])
  return (
    <div className='flex gap-4'>
      <aside className='w-1/3'>
        <ul className='space-y-2'>{lessons.map(l=>(<li key={l.slug} className='p-2 bg-white rounded'>{l.title}</li>))}</ul>
      </aside>
      <article className='flex-1 bg-white p-4 rounded shadow'>
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </div>
  )
}
