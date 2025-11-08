import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import fs from 'fs';
import path from 'path';
import Link from 'next/link'; // <-- 1. ИМПОРТ ДОБАВЛЕН

function cleanMarkdown(rawText) {
  return rawText.replace(/---[\s\S]*?---/, '');
}

// Компонент мини-чата для боковой панели
function LessonAIAssistant({ lessonTitle, lessonContent }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async (questionText = text) => {
    if (!questionText.trim()) return;

    // Создаем промпт с контекстом урока
    const contextPrompt = `Урок: "${lessonTitle}"
    
Содержание урока:
${lessonContent.substring(0, 2000)}... 

Вопрос студента: ${questionText}

Пожалуйста, ответь на вопрос, используя информацию из урока выше.`;

    const userMessage = { role: 'user', text: questionText };
    setMessages(m => [...m, userMessage]);
    setText('');
    setLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: contextPrompt })
      });
      
      const json = await res.json();
      
      if (res.ok) {
        setMessages(m => [...m, {
          role: 'assistant',
          text: json.reply || 'Нет ответа'
        }]);
      } else {
        setMessages(m => [...m, {
          role: 'assistant',
          text: 'Ошибка: ' + (json.error || 'Неизвестная ошибка')
        }]);
      }
    } catch (e) {
      setMessages(m => [...m, {
        role: 'assistant',
        text: 'Ошибка соединения с AI'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    '💡 Объясни проще',
    '📝 Приведи пример',
    '🎯 Дай инструкцию'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 overflow-hidden">
      {/* Хедер */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between hover:from-purple-600 hover:to-pink-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div className="text-left">
            <div className="font-bold">AI-помощник</div>
            <div className="text-xs opacity-90">Задай вопрос по уроку</div>
          </div>
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Чат (раскрывается) */}
      {isExpanded && (
        <div className="p-4">
          {/* Быстрые действия */}
          {messages.length === 0 && (
            <div className="mb-3 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Быстрые вопросы:</p>
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => send(action)}
                  className="w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Сообщения */}
          <div className="max-h-64 overflow-auto mb-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm ${
                  m.role === 'user'
                    ? 'bg-blue-100 ml-4'
                    : 'bg-gray-100 mr-4'
                }`}
              >
                <div className="font-semibold mb-1">
                  {m.role === 'user' ? '👤 Вы' : '🤖 AI'}
                </div>
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Ввод */}
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  send();
                }
              }}
              placeholder="Ваш вопрос..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => send()}
              disabled={loading || !text.trim()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:bg-gray-400 text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              {loading ? '...' : '📤'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TheoryPage({ lesson }) {
  if (!lesson) {
    return <div>Урок не найден.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Основной контент */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
        <article className="prose prose-lg max-w-none">
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </article>

        {/* --- 2. БЛОК С ТЕСТОМ ДОБАВЛЕН ЗДЕСЬ --- */}
        <div className="mt-10 p-6 bg-blue-50 rounded-lg text-center border border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-3">Готовы проверить себя?</h3>
          <p className="text-blue-800 mb-4">Пройдите интерактивный тест по материалам этого урока.</p>
          <Link 
            href={`/Test/${lesson.slug}`} {/* Ссылка использует lesson.slug */}
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Пройти тест
          </Link>
        </div>
        {/* --- Конец блока с тестом --- */}

      </div>

      {/* Боковая панель с AI */}
      <div className="lg:w-80 space-y-4">
        <LessonAIAssistant 
          lessonTitle={lesson.title}
          lessonContent={lesson.content}
        />
        
        {/* Дополнительная информация */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">💡 Подсказка</h3>
          <p className="text-sm text-blue-800">
            Используй AI-помощника для разбора сложных моментов урока. 
            Он знает весь материал!
          </p>
        </div>
      </div>
    </div>
  );
}

// getStaticPaths и getStaticProps остаются без изменений
export async function getStaticPaths() {
  let lessons = [];
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    lessons = JSON.parse(data);
  } catch (e) {
    console.warn("index.json не найден для getStaticPaths");
  }

  const paths = lessons.map(lesson => ({
    params: { slug: lesson.slug },
  }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  try {
    const decodedSlug = decodeURIComponent(slug);
    const mdPath = path.join(process.cwd(), 'public', 'lessons', decodedSlug, `${decodedSlug}.md`);
    const rawText = fs.readFileSync(mdPath, 'utf-8');
    const content = cleanMarkdown(rawText);

    return {
      props: {
        lesson: {
          title: decodedSlug,
          content: content,
          slug: decodedSlug, // <-- 3. ВАЖНОЕ ИСПРАВЛЕНИЕ ДОБАВЛЕНО
        },
      },
    };
  } catch (e) {
    console.error(`Ошибка в getStaticProps для slug: ${slug}`, e.message);
    return { notFound: true };
  }
}
