# PWA Blonding App: UI/UX Complete Redesign Specification

## 🎯 Цель задачи
Полная переработка интерфейса приложения. Переход от "веб-сайта" к "мобильному приложению" (App-like UX).
Стиль: Modern Clean, iOS-inspired, Glassmorphism, цвета бренда (Purple/Violet).

## 🛠 Технические требования для AI
1. **Используй предоставленный код** полностью.
2. **Сохраняй бизнес-логику**:
   - В `src/pages/index.tsx`: НЕ трогай `getStaticProps` и логику получения уроков.
   - В `src/pages/lessons/[slug].tsx`: НЕ трогай `MDXRemote`, `serialize` и `getStaticPaths`.
   - В `src/components/ChatInterface.tsx`: Сохрани пропсы `onSendMessage` и `isLoading`.
3. **Icons**: Используй inline SVG (как в примерах), не устанавливай новые библиотеки иконок.

---

## 1. Global Styles & Theme
**Файл:** `src/index.css`
**Действие:** Полностью заменить содержимое.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    /* Светло-серый фон для контраста с белыми карточками */
    @apply bg-slate-50 text-slate-900 antialiased;
    /* Блокировка "пружинящего" скролла всей страницы на iOS */
    overscroll-behavior-y: none;
    -webkit-tap-highlight-color: transparent;
  }
}

/* Скрытие скроллбара, но сохранение функционала */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Анимация появления контента */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

/* Поддержка Safe Area для iPhone (челки и жесты) */
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
2. New Component: Bottom Navigation
Файл: src/components/BottomNav.tsx Действие: Создать новый файл.

TypeScript

import Link from 'next/link';
import { useRouter } from 'next/router';

export default function BottomNav() {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    {
      label: 'Теория',
      path: '/',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      label: 'AI Чат',
      path: '/Chat',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      label: 'Ассистент',
      path: '/Assistant',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    {
      label: 'Профиль',
      path: '/Profile', // Если страницы нет, ссылка может быть неактивной или вести на заглушку
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${
                isActive ? 'text-purple-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.icon(isActive)}
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
3. Layout Update
Файл: src/components/Layout.tsx Действие: Заменить существующий Layout. Подключаем BottomNav, убираем старую шапку.

TypeScript

import React from 'react';
import BottomNav from './BottomNav';
import UpdateNotification from './UpdateNotification';
import { useServiceWorker } from '../hooks/useServiceWorker';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Логика PWA обновлений сохраняется
  const { updateAvailable, currentVersion, newVersion, updateServiceWorker, dismiss } = useServiceWorker();

  return (
    <>
      <Head>
        {/* Белый статус бар */}
        <meta name="theme-color" content="#ffffff" />
      </Head>
      
      {/* pb-24: отступ снизу, чтобы контент не перекрывался меню */}
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
        
        {/* Минималистичный хедер */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-4 py-3 pt-safe">
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-center">
              Blonding App
            </h1>
        </header>

        {/* Контент с анимацией */}
        <main className="max-w-md mx-auto px-4 py-6 animate-fade-in">
          {children}
        </main>

        <BottomNav />

        <UpdateNotification
          show={updateAvailable}
          currentVersion={currentVersion}
          newVersion={newVersion}
          onUpdate={updateServiceWorker}
          onDismiss={dismiss}
        />
      </div>
    </>
  );
};

export default Layout;
4. Главная страница (Dashboard)
Файл: src/pages/index.tsx Действие: Обновить JSX (return), но ОСТАВИТЬ getStaticProps без изменений.

TypeScript

import { GetStaticProps } from 'next';
import Link from 'next/link';
import { getAllLessons, Lesson } from '../lib/lessons';
import Head from 'next/head';

interface HomeProps {
  lessons: Lesson[];
}

export default function Home({ lessons }: HomeProps) {
  const sortedLessons = lessons.sort((a, b) => a.order - b.order);

  return (
    <>
      <Head>
        <title>Курс Блондирования | Главная</title>
      </Head>

      <div className="space-y-8 pb-10">
        
        {/* Dashboard / Welcome Block */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-purple-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Добро пожаловать</p>
              <h2 className="text-2xl font-bold tracking-tight">Мастер блонда</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-purple-100 mb-2">
              <span>Прогресс курса</span>
              <span>15%</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/90 w-[15%] rounded-full" />
            </div>
          </div>
        </div>

        {/* Заголовок списка */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900">Ваши уроки</h3>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            {sortedLessons.length} модулей
          </span>
        </div>

        {/* Список карточек */}
        <div className="space-y-4">
          {sortedLessons.map((lesson) => (
            <Link key={lesson.slug} href={`/lessons/${lesson.slug}`} className="block group">
              <div className="relative bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.98]">
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-purple-500 rounded-r-full opacity-80" />
                <div className="flex items-center justify-between ml-3">
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      Модуль {lesson.order}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 leading-tight mb-1 mt-1 group-hover:text-purple-700 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {lesson.excerpt || "Нажмите, чтобы начать изучение темы..."}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-600 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

// ВАЖНО: AI должен сохранить существующий getStaticProps!
export const getStaticProps: GetStaticProps = async () => {
  const lessons = getAllLessons(['title', 'slug', 'excerpt', 'order']);
  return { props: { lessons } };
};
5. Страница Урока (Magazine Style)
Файл: src/pages/lessons/[slug].tsx Действие: Обновить компонент. Использовать prose-lg и карточный дизайн.

TypeScript

import { GetStaticProps, GetStaticPaths } from 'next';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import Head from 'next/head';
import Link from 'next/link';
import { getAllLessons, getLessonBySlug, Lesson } from '../../lib/lessons';
import { useRouter } from 'next/router';

// Стилизованные компоненты Markdown
const components = {
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-purple-500 pl-4 italic text-slate-700 my-6 bg-purple-50 py-2 pr-2 rounded-r-lg" {...props} />
  ),
  img: (props: any) => (
    <img className="rounded-xl shadow-md my-6 w-full object-cover" {...props} />
  ),
};

interface LessonPageProps {
  source: any;
  frontMatter: Lesson;
  nextLesson: Lesson | null;
  prevLesson: Lesson | null;
}

export default function LessonPage({ source, frontMatter, nextLesson, prevLesson }: LessonPageProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div className="flex items-center justify-center min-h-screen text-purple-600">Загрузка...</div>;
  }

  return (
    <>
      <Head>
        <title>{frontMatter.title} | Blonding Course</title>
      </Head>

      <article className="max-w-2xl mx-auto">
        {/* Кнопка Назад */}
        <div className="mb-6 pt-2">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            К списку уроков
          </Link>
        </div>

        {/* Заголовок */}
        <header className="mb-8">
          <span className="text-xs font-bold tracking-wider text-purple-600 uppercase bg-purple-100 px-3 py-1 rounded-full">
            Урок {frontMatter.order}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {frontMatter.title}
          </h1>
          {frontMatter.excerpt && (
            <p className="mt-4 text-lg text-slate-600 leading-relaxed font-light border-l-2 border-slate-200 pl-4">
              {frontMatter.excerpt}
            </p>
          )}
        </header>

        {/* Контент (Белый лист) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 mb-8">
          <div className="prose prose-lg prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-purple-600 hover:prose-a:text-purple-500 max-w-none">
            <MDXRemote {...source} components={components} />
          </div>
        </div>

        {/* Навигация */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
          {prevLesson ? (
            <Link href={`/lessons/${prevLesson.slug}`} className="group block p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all">
              <span className="text-xs text-slate-400 font-medium uppercase mb-1 block">← Ранее</span>
              <span className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                {prevLesson.title}
              </span>
            </Link>
          ) : <div />}

          {nextLesson ? (
            <Link href={`/lessons/${nextLesson.slug}`} className="group block p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all text-white">
              <span className="text-xs text-purple-100 font-medium uppercase mb-1 block text-right">Далее →</span>
              <span className="font-bold text-white block text-right text-lg">
                {nextLesson.title}
              </span>
            </Link>
          ) : null}
        </div>
      </article>
    </>
  );
}

// ВАЖНО: AI должен сохранить getStaticPaths и getStaticProps!
export const getStaticPaths: GetStaticPaths = async () => {
  const lessons = getAllLessons(['slug']);
  return {
    paths: lessons.map((lesson) => ({ params: { slug: lesson.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const lesson = getLessonBySlug(slug, ['title', 'date', 'slug', 'content', 'excerpt', 'order']);
  const allLessons = getAllLessons(['slug', 'title', 'order']);
  
  const sortedLessons = allLessons.sort((a, b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex((l) => l.slug === slug);
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;

  const mdxSource = await serialize(lesson.content || '');

  return {
    props: {
      source: mdxSource,
      frontMatter: lesson,
      nextLesson,
      prevLesson,
    },
  };
};
6. Chat Interface (Messenger Style)
Файл: src/components/ChatInterface.tsx Действие: Полный редизайн.

TypeScript

import React, { useState, useRef, useEffect } from 'react';

// Если в проекте уже есть типы Message, импортируй их, иначе используй локальные
interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

interface ChatInterfaceProps {
  onSendMessage?: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatInterface({ onSendMessage, isLoading = false }: ChatInterfaceProps) {
  // Локальный стейт для UI, если нужно - синхронизируй с внешним
  const [input, setInput] = useState('');
  
  // Пример сообщений для демонстрации (AI должен подключить реальные props.messages если они есть)
  // Если messages приходят через props, используй их. Здесь пример локального стейта:
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Привет! Я твой AI-помощник по колористике. Спроси меня про формулы блонда или нейтрализацию!' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Добавляем сообщение пользователя визуально
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    
    const msgToSend = input;
    setInput('');

    if (onSendMessage) {
      await onSendMessage(msgToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]"> 
      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`relative max-w-[85%] px-5 py-3 text-sm sm:text-base shadow-sm ${isUser ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <span className={`text-[10px] absolute bottom-1 ${isUser ? 'right-2 text-purple-200' : 'left-2 text-slate-300'}`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Плавающая панель ввода */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        <div className="relative flex items-end gap-2 bg-white rounded-3xl shadow-lg shadow-purple-900/5 border border-slate-100 p-2 pr-2">
          
          <button className="p-3 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Задайте вопрос AI..."
            rows={1}
            className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none max-h-32 focus:outline-none"
            style={{ minHeight: '44px' }}
          />

          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-all duration-200 transform ${input.trim() ? 'bg-purple-600 text-white shadow-md hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
          >
            <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}