import fs from 'fs';
import path from 'path';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import type { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';

interface Lesson {
  title: string;
  content: string;
  slug: string;
}

interface TheoryPageProps {
  lesson: Lesson | null;
}

const cleanMarkdown = (rawText: string): string => rawText.replace(/---[\s\S]*?---/, '');

interface LessonAIAssistantProps {
  lessonTitle: string;
  lessonContent: string;
}

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

    const systemPrompt = `Ты — AI-помощник по уроку "${lessonTitle}". 
Отвечай на вопросы студента, используя ТОЛЬКО следующий контекст.
Не придумывай ничего, чего нет в тексте.

КОНТЕКСТ УРОКА:
${lessonContent.substring(0, 4000)}...`;

    const inputs = questionText;

    setMessages((m) => [...m, { role: 'user', text: questionText }]);
    setText('');
    setLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: inputs,
          systemPrompt: systemPrompt
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      const json = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: json.reply || 'Нет ответа' }]);
    } catch (e: any) {
      console.error("[LessonAIAssistant] Ошибка:", e);
      setMessages((m) => [...m, { role: 'assistant', text: `Ошибка AI: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = ['💡 Объясни проще', '📖 Приведи пример', '🎯 Дай инструкцию'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl">🤖</span>
          </div>
          <div className="text-left">
            <div className="font-bold text-sm">AI-помощник</div>
            <div className="text-xs text-purple-100">Задай вопрос по уроку</div>
          </div>
        </div>
        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Быстрые вопросы</p>
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => send(action)}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-purple-50 rounded-xl text-sm transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
          <div className="max-h-64 overflow-auto space-y-3 no-scrollbar">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl text-sm ${m.role === 'user'
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white ml-6 rounded-br-none'
                  : 'bg-slate-100 text-slate-800 mr-6 rounded-bl-none'}`}
              >
                <div className="font-medium text-xs mb-1 opacity-75">
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
              className="flex-1 px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => send()}
              disabled={loading || !text.trim()}
              className={`p-3 rounded-xl transition-all ${text.trim()
                ? 'bg-purple-600 text-white shadow-md hover:scale-105 active:scale-95'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TheoryPage: React.FC<TheoryPageProps> = ({ lesson }) => {
  if (!lesson) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <h1 className="text-xl font-bold mb-4 text-slate-900">Урок не найден</h1>
          <Link href="/" className="text-purple-600 font-medium hover:underline">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{lesson.title} | Blonding Course</title>
      </Head>

      <article className="space-y-6">
        {/* Кнопка Назад */}
        <div className="pt-2">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            К списку
          </Link>
        </div>

        {/* Заголовок */}
        <header>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {lesson.title}
          </h1>
        </header>

        {/* AI Помощник */}
        <LessonAIAssistant lessonTitle={lesson.title} lessonContent={lesson.content} />

        {/* Контент (Белый лист) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="prose prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-purple-600 hover:prose-a:text-purple-500 max-w-none">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        </div>

        {/* CTA: Пройти тест */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-center shadow-lg shadow-purple-200">
          <h3 className="text-lg font-bold text-white mb-2">Готовы проверить себя?</h3>
          <p className="text-purple-100 text-sm mb-4">Пройдите тест по материалу урока</p>
          <Link
            href={`/Test/${lesson.slug}`}
            className="inline-block px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-md"
          >
            Пройти тест →
          </Link>
        </div>
      </article>
    </>
  );
};

// ВАЖНО: getStaticPaths и getStaticProps сохранены из оригинала!
export const getStaticPaths: GetStaticPaths = async () => {
  let lessons: { slug: string }[] = [];
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    const indexData = JSON.parse(data);

    if (indexData.modules && indexData.lessons) {
      lessons = Object.values(indexData.lessons).flat() as { slug: string }[];
    } else {
      lessons = indexData;
    }
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

    if (!fs.existsSync(mdPath)) {
      console.warn(`Lesson file not found: ${mdPath}`);
      return { props: { lesson: null } };
    }

    const rawText = fs.readFileSync(mdPath, 'utf-8');
    const content = cleanMarkdown(rawText);

    const titleMatch = rawText.match(/title:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : decodedSlug;

    return {
      props: {
        lesson: {
          title: title,
          content,
          slug: decodedSlug,
        },
      },
    };
  } catch (e: any) {
    console.error(`Error for slug: ${slug}`, e.message);
    return { props: { lesson: null } };
  }
};

export default TheoryPage;
