import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
export default function Home(){
  const [lessons, setLessons] = useState([])
  useEffect(()=>{fetch('/lessons/index.json').then(r=>r.json()).then(setLessons).catch(()=>{fetch('/lessons/generated/index.json').then(r=>r.json()).then(setLessons).catch(()=>{})})},[])
  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Blonding App v2.1</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {lessons.length?lessons.map(l=>(<Link key={l.slug} to={`/theory?lesson=${l.slug}`} className='block bg-white rounded-2xl p-6 shadow hover:shadow-md transition'><h3 className='text-lg font-semibold mb-2'>{l.title}</h3><p className='text-sm text-gray-600'>Открыть урок</p></Link>)):<div className='p-6 bg-white rounded shadow'>Уроки не найдены. Запустите генерацию.</div>}
      </div>
    </div>
  )
}
