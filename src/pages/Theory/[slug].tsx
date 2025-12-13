import fs from 'fs';
import path from 'path';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import type { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import { useLessonProgress } from '../../hooks/useLessonProgress';

interface Lesson {
  title: string;
  content: string;
  slug: string;
  module?: string;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when opening or adding messages
  useEffect(() => {
    if (isExpanded && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isExpanded]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const send = async (questionText = text) => {
    if (!questionText.trim()) return;

    const systemPrompt = `Ты — AI-помощник по уроку "${lessonTitle}". 
Отвечай на вопросы студента, используя ТОЛЬКО следующий контекст.
Не придумывай ничего, чего нет в тексте.

КОНТЕКСТ УРОКА:
${lessonContent.substring(0, 3000)}...`;

    setMessages((m) => [...m, { role: 'user', text: questionText }]);
    setText('');
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: questionText,
          systemPrompt: systemPrompt
        }),
      });

      if (!res.ok) throw new Error();
      const json = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: json.reply || 'Нет ответа' }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Ошибка связи с AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && text.trim()) send();
    }
  };

  const clearHistory = () => {
    if (confirm('Очистить историю диалога?')) {
      setMessages([]);
    }
  };

  const quickActions = [
    { emoji: '💡', text: 'Объясни проще' },
    { emoji: '📖', text: 'Приведи пример' },
    { emoji: '‼', text: 'Какие ошибки можно допустить?' },
    { emoji: '➡', text: 'Дай инструкцию' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden my-8 transition-all duration-300">
      {/* Header - Clickable to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between transition-colors hover:from-purple-700 hover:to-indigo-700"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl">🤖</span>
          </div>
          <div className="text-left">
            <h2 className="text-white font-bold text-lg leading-tight">AI-помощник</h2>
            <p className="text-purple-100 text-xs opacity-90">
              {isExpanded ? `Контекст: ${lessonTitle}` : 'Задай вопрос по уроку'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {messages.length > 0 && isExpanded && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                clearHistory();
              }}
              className="text-xs text-white/90 hover:text-white px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm cursor-pointer"
            >
              Очистить
            </div>
          )}
          <svg
            className={`w-6 h-6 text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 space-y-4">
          {/* Quick Questions - Optimized Chips */}
          {messages.length === 0 && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
                Быстрые вопросы
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => send(action.text)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all shadow-sm active:scale-95"
                  >
                    {action.emoji} {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="max-h-[500px] overflow-y-auto space-y-4 pr-1">
            {messages.length === 0 && (
              <div className="text-center py-6 text-slate-300">
                <p className="text-sm">Я изучил этот урок и готов отвечать на вопросы</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '75ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Telegram Style Input */}
          <div className="flex items-end gap-2 bg-gray-100 rounded-2xl p-1.5">
            <button
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-purple-600 hover:bg-white transition-all cursor-not-allowed"
              title="Функция в разработке"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Сообщение..."
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 placeholder:text-gray-400 resize-none py-2.5 px-1 max-h-32 min-h-[40px] text-base leading-relaxed"
              rows={1}
            />

            <button
              onClick={() => send()}
              disabled={loading || !text.trim()}
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${text.trim()
                ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700 active:scale-95'
                : 'bg-gray-200 text-gray-400'
                }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TheoryPage: React.FC<TheoryPageProps> = ({ lesson }) => {
  const { markSeen } = useLessonProgress();

  useEffect(() => {
    if (lesson?.slug) {
      markSeen(lesson.slug);
    }
  }, [lesson?.slug]);

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <h1 className="text-xl font-bold mb-4 text-slate-900">Урок не найден</h1>
          <Link href="/" className="text-purple-600 font-medium hover:underline">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{lesson.title} | Blonding Course</title>
      </Head>
      <article className="space-y-6 pb-8">
        <div className="pt-2">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            К списку
          </Link>
        </div>
        <header>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {lesson.title}
          </h1>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="prose prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-purple-600 hover:prose-a:text-purple-500 max-w-none">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        </div>

        {/* AI Assistant at the bottom - hide for materials */}
        {lesson.module !== 'dopolnitelnye-materialy' && (
          <LessonAIAssistant lessonTitle={lesson.title} lessonContent={lesson.content} />
        )}

        {/* Test CTA - hide for materials */}
        {lesson.module !== 'dopolnitelnye-materialy' && (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-center shadow-lg shadow-purple-200">
            <h3 className="text-lg font-bold text-white mb-2">Готовы проверить себя?</h3>
            <p className="text-purple-100 text-sm mb-4">Закрепите знания, пройдя короткий тест</p>
            <Link href={`/Test/${lesson.slug}`} className="inline-block px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-md active:scale-95">
              Пройти тест →
            </Link>
          </div>
        )}
      </article>
    </>
  );
};

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
    if (!fs.existsSync(mdPath)) return { props: { lesson: null } };
    const rawText = fs.readFileSync(mdPath, 'utf-8');
    const content = cleanMarkdown(rawText);
    const titleMatch = rawText.match(/title:\s*"([^"]+)"/);
    const moduleMatch = rawText.match(/module:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : decodedSlug;
    const lessonModule = moduleMatch ? moduleMatch[1] : undefined;
    return { props: { lesson: { title, content, slug: decodedSlug, module: lessonModule } } };
  } catch (e: any) {
    return { props: { lesson: null } };
  }
};

export default TheoryPage;
