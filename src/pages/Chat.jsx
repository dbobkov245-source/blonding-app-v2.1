import React, {useState} from 'react'
export default function Chat(){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  async function send(){if(!text.trim()) return; setMessages(m=>[...m, {role:'user', text}]); setText(''); setLoading(true); try{const res = await fetch('/api/proxy',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({inputs: text})}); const json = await res.json(); setMessages(m=>[...m, {role:'assistant', text: json.reply || json.error || 'Нет ответа'}])}catch(e){setMessages(m=>[...m, {role:'assistant', text:'Ошибка при запросе к AI.'}])}finally{setLoading(false)}}
  return (
    <div>
      <h2 className='text-xl font-semibold mb-4'>AI-консультант</h2>
      <div className='bg-white p-4 rounded shadow min-h-[300px] flex flex-col'>
        <div className='flex-1 overflow-auto mb-4 space-y-2'>{messages.map((m,i)=>(<div key={i} className={m.role==='user' ? 'text-right' : 'text-left'}><div className='inline-block p-2 rounded bg-gray-100'>{m.text}</div></div>))}</div>
        <div className='flex gap-2'>
          <input value={text} onChange={e=>setText(e.target.value)} className='flex-1 p-2 border rounded' placeholder='Ваш вопрос...'/>
          <button onClick={send} className='px-4 py-2 bg-blue-600 text-white rounded'>{loading ? '...' : 'Отправить'}</button>
        </div>
      </div>
    </div>
  )
}
