import fs from 'fs';
import path from 'path';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import type { GetStaticProps, GetStaticPaths } from 'next';

interface Lesson {
  title: string;
  content: string;
  slug: string;
}

interface TheoryPageProps {
  lesson: Lesson | null; // Разрешаем null на случай ошибки
}

const cleanMarkdown = (rawText: string): string => rawText.replace(/---[\s\S]*?---/, '');

interface LessonAIAssistantProps {
  lessonTitle: string;
  lessonContent: string;
}

// Компонент AI-помощника (типизированный)
const LessonAIAssistant: React.FC<LessonAIAssistantProps> = ({ lessonTitle, lessonContent }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (questionText = text) => {
    if (!questionText.trim()) return;

    const contextPrompt = `Урок: "${lessonTitle}"
Содержание: ${lessonContent.substring(0, 4000)}...
Вопрос: ${questionText}
Ответь на основе урока.`;

    setMessages((m) => [...m, { role: 'user', text: questionText }]);
    setText('');
    setLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: contextPrompt }),
      });
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: json.reply || 'Нет ответа' }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Ошибка AI' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = ['💡 Объясни проще', '📝 Приведи пример', '🎯 Дай инструкцию'];

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 overflow-hidden">
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

      {isExpanded && (
        <div className="p-4">
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
          <div className="max-h-64 overflow-auto mb-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'}`}
              >
                <div className="font-semibold mb-1">
                  {m.role === 'user' ? '👤 Вы' : '🤖 AI'}
                </div>
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) send();
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
};

// Главный компонент страницы
const TheoryPage: React.FC<TheoryPageProps> = ({ lesson }) => {
  if (!lesson) {
    return <div>Урок не найден.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
        <article className="prose prose-lg max-w-none">
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </article>
        <div className="mt-8 p-6 bg-blue-50 rounded-lg text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-3">Готовы проверить себя?</h3>
          <p className="text-blue-800 mb-4">Пройдите тест.</p>
          <Link href={`/Test/${lesson.slug}`} className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
            Пройти тест
          </Link>
        </div>
      </div>
      <div className="lg:w-80 space-y-4">
        <LessonAIAssistant lessonTitle={lesson.title} lessonContent={lesson.content} />
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">💡 Подсказка</h3>
          <p className="text-sm text-blue-800">Используй AI для разбора урока.</p>
        </div>
      </div>
    </div>
  );
};

// --- Загрузка данных (SSG) ---
export const getStaticPaths: GetStaticPaths = async () => {
  let lessons: { slug: string }[] = [];
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    lessons = JSON.parse(data);
  } catch (e) {
    console.warn("index.json not found");
  }

  const paths = lessons.map((lesson) => ({ params: { slug: lesson.slug } }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };
  try {
    const decodedSlug = decodeURIComponent(slug);
    const mdPath = path.join(process.cwd(), 'public', 'lessons', decodedSlug, `${decodedSlug}.md`);
    const rawText = fs.readFileSync(mdPath, 'utf-8');
    const content = cleanMarkdown(rawText);
    return {
      props: {
        lesson: {
          title: decodedSlug, // Используем slug (имя папки) как title по умолчанию
          content,
          slug: decodedSlug,
        },
      },
    };
  } catch (e) {
    console.error(`Error for slug: ${slug}`, (e as Error).message);
    // Важно вернуть props: { lesson: null }, чтобы страница отрендерила "Урок не найден"
    return { props: { lesson: null } }; 
  }
};

export default TheoryPage;
