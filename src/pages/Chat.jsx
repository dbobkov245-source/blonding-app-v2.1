import React, { useState, useEffect, useRef } from 'react'; // Добавили useRef, useEffect

export default function Chat(){
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 1. Ref для контейнера сообщений
  const messagesEndRef = useRef(null);

  // 2. Функция автопрокрутки
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 3. Вызываем прокрутку при каждом новом сообщении
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async () => {
    if(!text.trim()) return;
    const userMessage = text;
    setMessages(m => [...m, {role:'user', text: userMessage}]);
    setText(''); 
    setLoading(true);
    
    try{
      const res = await fetch('/api/proxy',{
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({inputs: userMessage})
      });
      
      const json = await res.json();
      
      if (res.ok) {
        setMessages(m => [...m, {role:'assistant', text: json.reply || 'Нет ответа'}]);
      } else {
        setMessages(m => [...m, {role:'assistant', text: json.error || 'Ошибка API'}]);
        console.error("API Error:", json.details);
      }
      
    } catch(e) {
      setMessages(m => [...m, {role:'assistant', text:'Ошибка при запросе к AI.'}]);
    } finally {
      setLoading(false);
    }
  };

  // 4. Обработчик нажатия Enter (и Shift+Enter)
  const handleKeyDown = (e) => {
    // Если нажат Enter БЕЗ Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Запретить перенос строки
      if (!loading) {
        send();
      }
    }
    // Если нажат Shift+Enter, он просто вставит новую строку (стандартное поведение)
  };

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4'>AI-консультант</h2>
      <div className='bg-white p-4 rounded-lg shadow-md min-h-[400px] flex flex-col'>
        
        {/* 5. Контейнер сообщений */}
        <div className='flex-1 overflow-auto mb-4 space-y-4 p-2'>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-xs md:max-w-md ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                {/* 6. Аватарки */}
                <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xl flex-shrink-0'>
                  {m.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className={`inline-block p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {m.text}
                </div>

              </div>
            </div>
          ))}
          
          {/* 7. Пустой div для автопрокрутки */}
          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода */}
        <div className='flex gap-2 border-t pt-4'>
          {/* 8. Заменили input на textarea для поддержки Shift+Enter */}
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            className='flex-1 p-2 border rounded-md resize-none' 
            placeholder='Ваш вопрос... (Shift+Enter для новой строки)'
            rows="2" // 9. Позволяем 2 строки
            onKeyDown={handleKeyDown} // 10. Добавили обработчик
          />
          <button 
            onClick={send} 
            className='px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 self-end'
            disabled={loading}
          >
            {loading ? '...' : 'Отправить'}
          </button>
        </div>
      </div>
    </div>
  );
}
