# Full Project Code - Blonding App v2.1

Generated: 2025-12-11T19:09:34.677Z


# File: package.json
```json
{
  "name": "blonding-app-v2.2",
  "version": "2.2.8",
  "description": "PWA для обучения техникам блондирования с AI-генерацией тестов",
  "private": true,
  "type": "module",
  "engines": {
    "node": "24.x",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "npm run sync-version && npm run generate-lessons && next build",
    "build:with-quizzes": "npm run sync-version && npm run generate-all && next build",
    "sync-version": "node scripts/sync-version.js",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "generate-lessons": "node scripts/generate-md.js",
    "generate-all": "npm run generate-lessons",
    "validate-token": "node -e \"import('./src/lib/ai.js').then(m => m.validateHFToken(process.env.HF_TOKEN)).then(console.log)\"",
    "clean-cache": "rm -rf .next/cache && rm -rf node_modules/.cache",
    "ci:install": "npm ci --legacy-peer-deps",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "@tailwindcss/typography": "^0.5.15",
    "autoprefixer": "10.4.20",
    "lru-cache": "^10.4.3",
    "mammoth": "^1.8.0",
    "next": "15.5.7",
    "next-pwa": "^5.6.0",
    "postcss": "8.4.45",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-markdown": "9.0.1",
    "sharp": "^0.33.5",
    "tailwindcss": "3.4.10",
    "turndown": "^7.1.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@bubblewrap/cli": "^1.24.1",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.6.0",
    "@types/react": "^18.3.10",
    "@types/react-dom": "^18.3.0",
    "@types/turndown": "^5.0.5",
    "eslint": "^9.12.0",
    "eslint-config-next": "15.0.1",
    "jest": "^30.2.0",
    "ts-jest": "^29.4.6",
    "typescript": "^5.7.1"
  }
}
```

# File: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    },
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

# File: next.config.js
```javascript
import pwa from 'next-pwa';
import { readFileSync } from 'fs';
import { join } from 'path';

// Читаем версию из package.json для ревизии кеша
const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));
const APP_VERSION = packageJson.version;

/** @type {import('next').NextConfig} */
const withPWA = pwa({
  dest: 'public',
  register: true,
  skipWaiting: true, // Автоматическое обновление
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest.json$/],

  // Импортируем кастомный скрипт в основной SW
  importScripts: ['/sw-custom.js'],

  // Добавляем кастомный SW файл в precache (чтобы он обновлялся)
  additionalManifestEntries: [
    { url: '/sw-custom.js', revision: APP_VERSION }
  ],

  // Offline fallback
  fallbacks: {
    document: '/offline.html',
  },

  // Улучшенные стратегии кеширования
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 год
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
        },
      },
    },
    {
      urlPattern: /^https?.*\.(json|css|js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 день
        },
      },
    },
    {
      urlPattern: /\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 минут
        },
      },
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

const nextConfig = withPWA({
  reactStrictMode: true,
});

export default nextConfig;

```

# File: tailwind.config.cjs
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

```

# File: postcss.config.cjs
```javascript
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }

```

# File: jest.config.cjs
```javascript
/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
    ],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                module: 'commonjs',
                esModuleInterop: true,
                jsx: 'react',
            },
        }],
    },
};

module.exports = config;

```

# File: README.md
```markdown
# Blonding App v2.2

Интерактивное приложение для обучения техникам блондирования и тонирования волос.

## 🎯 Ключевые возможности

- **3 модуля обучения**: Фундаментальная теория (16 уроков), Блондирование (7 уроков), Тонирование (6 уроков)
- **29 интерактивных тестов** для проверки знаний
- **AI-консультант** на базе Hugging Face
- **Автоматическая генерация уроков** из `.docx` файлов
- **PWA** — работает оффлайн, можно установить на телефон

## 📁 Структура проекта

```
blonding-app-v2.1/
├── lessons/                          # Исходные .docx файлы
│   ├── ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ.../    # 16 уроков предобучения
│   ├── блондирование/                # 7 уроков
│   └── тонирование/                  # 6 уроков
├── public/
│   ├── lessons/                      # Сгенерированные Markdown уроки
│   └── content/quizzes/              # JSON файлы тестов
├── src/pages/
│   ├── index.tsx                     # Главная — выбор модуля
│   ├── module/[slug].tsx             # Список уроков модуля
│   ├── Theory/[slug].tsx             # Страница урока
│   ├── Test/[slug].tsx               # Страница теста
│   ├── Chat.tsx                      # AI-чат по урокам
│   └── ChatRaw.tsx                   # Свободный AI-чат
├── __tests__/                        # Unit-тесты Jest
└── scripts/
    └── generate-md.js                # Генератор уроков из .docx
```

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Генерация уроков (если есть новые .docx)
npm run generate-lessons

# Запуск dev-сервера
npm run dev
```

Откройте http://localhost:3000

## ⚙️ Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка для production |
| `npm run generate-lessons` | Генерация уроков из .docx |
| `npm test` | Запуск unit-тестов |
| `npm run lint` | Проверка ESLint |
| `npm run type-check` | Проверка TypeScript |

## 🔧 Переменные окружения

| Переменная | Описание |
|------------|----------|
| `HF_TOKEN` | Токен Hugging Face для AI-консультанта |

## 📦 Деплой на Vercel

1. Создайте репозиторий на GitHub
2. Подключите к Vercel
3. Добавьте `HF_TOKEN` в Environment Variables
4. Deploy!

## 📝 Добавление нового урока

1. Добавьте `.docx` файл в соответствующую папку `lessons/`
2. Запустите `npm run generate-lessons`
3. Урок автоматически появится в приложении

## 🧪 Создание теста

Создайте файл `public/content/quizzes/{slug}-quiz.json`:

```json
{
  "questions": [
    {
      "question": "Вопрос?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Пояснение"
    }
  ]
}
```

---

**Версия**: 2.2.8  
**Node.js**: 24.x  
**Дата обновления**: 2025-12-11

```

# File: .eslintrc.json
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off"
  }
}

```

# File: vercel.json
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "CDN-Cache-Control",
          "value": "max-age=0"
        }
      ]
    },
    {
      "source": "/sw-custom.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "CDN-Cache-Control",
          "value": "max-age=0"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

# File: next-env.d.ts
```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/pages/api-reference/config/typescript for more information.

```

# File: REDESIGN_MASTERPLAN.md
```markdown
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
```

# File: src/components/BottomNav.tsx
```typescript
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
            label: 'Свободный чат',
            path: '/ChatRaw',
            icon: (active: boolean) => (
                <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${isActive ? 'text-purple-600' : 'text-slate-500 hover:text-slate-900'
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

```

# File: src/components/ChatInterface.tsx
```typescript
import React, { useState, useRef, useEffect } from 'react';

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
    const [input, setInput] = useState('');
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
                        <svg className="w-5 h-5 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

```

# File: src/components/InstallPrompt.tsx
```typescript
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Проверяем, не установлено ли уже
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
        if (isInstalled) {
            return;
        }

        // Проверяем, не отклонял ли пользователь ранее
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed === 'true') {
            return;
        }

        // Слушаем событие установки
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Показываем промпт через 3 секунды после загрузки
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA установлено');
            }

            setDeferredPrompt(null);
            setShowPrompt(false);
        } catch (error) {
            console.error('Ошибка установки PWA:', error);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt || !deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 md:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                            Установить приложение
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Установите Blonding App на устройство для быстрого доступа и работы без интернета
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:from-purple-600 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                Установить
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-100 transition-colors active:scale-95"
                            >
                                Позже
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

```

# File: src/components/Layout.tsx
```typescript
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

```

# File: src/components/UpdateNotification.tsx
```typescript
import React, { useEffect, useState } from 'react';

interface UpdateNotificationProps {
    show: boolean;
    currentVersion: string | null;
    newVersion: string | null;
    onUpdate: () => void;
    onDismiss: () => void;
}

export default function UpdateNotification({
    show,
    currentVersion,
    newVersion,
    onUpdate,
    onDismiss,
}: UpdateNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            // Небольшая задержка для анимации
            setTimeout(() => setIsVisible(true), 100);
        } else {
            setIsVisible(false);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
        >
            <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-1 shadow-2xl">
                    <div className="relative rounded-xl bg-white/95 backdrop-blur-sm dark:bg-gray-900/95">
                        <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
                            {/* Иконка */}
                            <div className="flex-shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                                    <svg
                                        className="h-6 w-6 text-white animate-pulse"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Контент */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                    Доступно обновление! 🎉
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    Новая версия приложения готова к установке.
                                    {currentVersion && newVersion && (
                                        <span className="ml-1 font-mono text-xs">
                                            ({currentVersion} → {newVersion})
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Кнопки действий */}
                            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                                <button
                                    onClick={onUpdate}
                                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:px-6"
                                >
                                    <span className="relative z-10">Обновить сейчас</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </button>

                                <button
                                    onClick={onDismiss}
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 sm:px-4"
                                >
                                    Позже
                                </button>
                            </div>
                        </div>

                        {/* Прогресс-бар анимация */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-xl bg-gray-200 dark:bg-gray-700">
                            <div className="h-full w-full animate-pulse bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

```

# File: src/hooks/useServiceWorker.ts
```typescript
import { useEffect, useState } from 'react';

interface ServiceWorkerHook {
    updateAvailable: boolean;
    currentVersion: string | null;
    newVersion: string | null;
    updateServiceWorker: () => void;
    dismiss: () => void;
}

export function useServiceWorker(): ServiceWorkerHook {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [currentVersion, setCurrentVersion] = useState<string | null>(null);
    const [newVersion, setNewVersion] = useState<string | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Проверяем поддержку Service Worker
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        // Функция для принудительной проверки версии
        const forceVersionCheck = async () => {
            try {
                // Загружаем актуальную версию с сервера (без кеша)
                const response = await fetch('/sw-custom.js?t=' + Date.now(), {
                    cache: 'no-cache',
                    headers: { 'Cache-Control': 'no-cache' }
                });

                if (response.ok) {
                    const script = await response.text();
                    const serverVersionMatch = script.match(/const APP_VERSION = '(.+)'/);

                    if (serverVersionMatch) {
                        const serverVersion = serverVersionMatch[1];
                        console.log('[App] Server version:', serverVersion);

                        // Получаем локальную версию
                        const localResponse = await fetch('/sw-custom.js');
                        const localScript = await localResponse.text();
                        const localVersionMatch = localScript.match(/const APP_VERSION = '(.+)'/);

                        if (localVersionMatch) {
                            const localVersion = localVersionMatch[1];
                            console.log('[App] Local version:', localVersion);
                            setCurrentVersion(localVersion);

                            // Сравниваем версии
                            if (serverVersion !== localVersion) {
                                console.log('[App] Version mismatch detected! Update available.');
                                setNewVersion(serverVersion);
                                setUpdateAvailable(true);
                            } else {
                                console.log('[App] Versions match, no update needed');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('[App] Force version check failed:', error);
            }
        };

        // КРИТИЧНО: Проверяем версию сразу при загрузке (для TWA)
        forceVersionCheck();

        // Загружаем custom SW скрипт
        const loadCustomSW = async () => {
            try {
                const response = await fetch('/sw-custom.js');
                if (response.ok) {
                    console.log('[App] Custom SW script loaded');
                }
            } catch (error) {
                console.error('[App] Failed to load custom SW:', error);
            }
        };

        loadCustomSW();

        // Получаем текущую регистрацию SW (next-pwa автоматически регистрирует)
        navigator.serviceWorker.ready
            .then(async (reg) => {
                console.log('[App] Service Worker ready');
                setRegistration(reg);

                // Получаем текущую версию
                if (reg.active) {
                    fetch('/sw-custom.js')
                        .then(r => r.text())
                        .then(script => {
                            const versionMatch = script.match(/const APP_VERSION = '(.+)'/);
                            if (versionMatch && !currentVersion) {
                                setCurrentVersion(versionMatch[1]);
                                console.log('[App] Current version from SW:', versionMatch[1]);
                            }
                        });
                }

                // Принудительно проверяем обновления
                console.log('[App] Forcing SW update check...');
                await reg.update();

                // Слушаем изменения в регистрации
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;

                    console.log('[App] New Service Worker found');

                    newWorker.addEventListener('statechange', () => {
                        console.log('[App] SW state changed:', newWorker.state);

                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                console.log('[App] New version available - SW installed');

                                // Получаем версию нового SW
                                fetch('/sw-custom.js?t=' + Date.now(), { cache: 'no-cache' })
                                    .then(r => r.text())
                                    .then(script => {
                                        const versionMatch = script.match(/const APP_VERSION = '(.+)'/);
                                        if (versionMatch) {
                                            const version = versionMatch[1];
                                            console.log('[App] New version detected:', version);
                                            setNewVersion(version);
                                            setUpdateAvailable(true);
                                        }
                                    });
                            } else {
                                console.log('[App] SW installed for the first time');
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('[App] Service Worker ready error:', error);
            });

        // Слушаем сообщения от Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('[App] Received message from SW:', event.data);

            if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
                console.log('[App] New version available message:', event.data.version);
                setNewVersion(event.data.version);
                setUpdateAvailable(true);
            }
        });

        // Проверяем обновления чаще для TWA (каждые 30 секунд)
        const interval = setInterval(() => {
            console.log('[App] Periodic update check...');
            forceVersionCheck();
            if (registration) {
                registration.update();
            }
        }, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [registration, currentVersion]);

    const updateServiceWorker = () => {
        if (registration && registration.waiting) {
            console.log('[App] Sending SKIP_WAITING to new worker...');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
            console.log('[App] No waiting worker found, reloading...');
            window.location.reload();
        }
    };

    useEffect(() => {
        // Если контроллер изменился (новый SW активировался), перезагружаем страницу
        const handleControllerChange = () => {
            console.log('[App] Controller changed, reloading...');
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        return () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    }, []);

    const dismiss = () => {
        console.log('[App] Update dismissed');
        setUpdateAvailable(false);
    };

    return {
        updateAvailable,
        currentVersion,
        newVersion,
        updateServiceWorker,
        dismiss,
    };
}

```

# File: src/index.css
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

/* Сохраняем критичные анимации из старого файла */
@keyframes pulse-record {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
.animate-pulse-record {
  animation: pulse-record 1.5s infinite;
}

@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.4s ease-out forwards;
}

@media print {
  .no-print { display: none !important; }
}

/* Дополнительная мобильная оптимизация для standalone приложений */
@media (display-mode: standalone) {
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  html {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
}
```

# File: src/lib/ai.js
```javascript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 10 });
export const SYSTEM_PROMPT = `Ты — эксперт-преподаватель по блондированию волос. Отвечай профессионально, кратко и по существу.`;

function hashQuery(query) {
  return query.replace(/\s+/g, ' ').trim().slice(0, 1000);
}

export async function callHF(inputs, options = {}) {
  const {
    hfToken = process.env.HF_TOKEN,
    model: mainModel = "Qwen/Qwen2.5-72B-Instruct",
    fallbackModel = "Qwen/Qwen2.5-7B-Instruct",
    maxTokens = 2048,
    temperature = 0.7,
    topP = 0.9,
    systemPrompt = SYSTEM_PROMPT,
    enableCache = true,
    jsonMode = false
  } = options;

  if (!hfToken && process.env.NODE_ENV === 'production') {
    throw new Error("HF_TOKEN не установлен");
  }
  if (!hfToken) {
    console.warn("⚠️ HF_TOKEN не установлен, используется заглушка");
    return "Хороший вопрос! В production-режиме здесь был бы ответ AI. HF_TOKEN не установлен.";
  }
  if (!inputs?.trim()) throw new Error("Пустой запрос");

  const cacheKey = enableCache ? hashQuery(`${model}:${systemPrompt}:${inputs}`) : null;
  if (enableCache && cache.has(cacheKey)) return cache.get(cacheKey);

  const url = "https://router.huggingface.co/v1/chat/completions";
  const body = {
    model: mainModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: inputs }
    ],
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    ...(jsonMode && { response_format: { type: "json_object" } })
  };

  try {
    const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" }, body: JSON.stringify(body), timeout: 30000 });
    if (!res.ok) throw new Error(`HF API error (${res.status}): ${await res.text()}`);
    const data = await res.json();
    const message = data.choices?.[0]?.message?.content || "";
    if (enableCache) cache.set(cacheKey, message);
    return message;
  } catch (err) {
    console.error("HF API call failed:", err);
    throw err;
  }
}

export async function callHFWithContext(question, lessonContext, options = {}) {
  const { title, content } = lessonContext;
  const contextPrompt = `Урок: "${title}"\nСОДЕРЖАНИЕ: ${content.substring(0, 4000)}...\nВОПРОС: ${question}\nОтветь на основе урока.`;
  return callHF(contextPrompt, options);
}

export async function validateHFToken(token) {
  try {
    await callHF("test", { hfToken: token, maxTokens: 5, enableCache: false });
    return true;
  } catch {
    return false;
  }
}

```

# File: src/lib/quizUtils.ts
```typescript
import * as fs from 'fs';

/**
 * Нормализует correctAnswer: конвертирует индекс (number) в текст ответа (string)
 */
export function normalizeQuizQuestion(item: {
    options: string[];
    correctAnswer: number | string;
}) {
    return {
        ...item,
        correctAnswer:
            typeof item.correctAnswer === 'number'
                ? item.options[item.correctAnswer]
                : item.correctAnswer,
    };
}

/**
 * Загружает и парсит quiz файл, возвращает нормализованные вопросы
 */
export function loadQuiz(quizPath: string) {
    if (!fs.existsSync(quizPath)) {
        return [];
    }

    const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
    const rawQuiz = Array.isArray(quizData) ? quizData : (quizData.questions || []);

    return rawQuiz.map(normalizeQuizQuestion);
}

/**
 * Валидирует структуру урока из index.json
 */
export function validateLessonStructure(lesson: unknown): lesson is {
    slug: string;
    title: string;
    module?: string;
} {
    if (typeof lesson !== 'object' || lesson === null) return false;
    const l = lesson as Record<string, unknown>;
    return typeof l.slug === 'string' && typeof l.title === 'string';
}

/**
 * Загружает index.json и возвращает все уроки
 */
export function loadLessonsIndex(indexPath: string) {
    if (!fs.existsSync(indexPath)) {
        return [];
    }

    const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

    // Поддержка нового формата с модулями
    if (data.modules && data.lessons) {
        return Object.values(data.lessons).flat();
    }

    return data;
}

```

# File: src/pages/Assistant/index.tsx
```typescript
import React, { useState, useRef, useEffect, useCallback } from 'react'; // Добавлен useCallback

const synthesisAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

interface VoiceMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isVoiceInput?: boolean;
}

export default function VoiceAssistant() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ---------- Отправка запроса (useCallback для стабильности) ---------- */
  const sendMessage = useCallback(async (text: string, isVoiceInput = false) => {
    if (!text.trim()) return;

    // ✅ Защита от спама (2 сек)
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      alert('Подождите немного перед следующим запросом');
      return;
    }
    setLastRequestTime(now);

    // ✅ Прерываем предыдущий запрос
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    const userMsg: VoiceMessage = {
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
      isVoiceInput,
    };

    setMessages((m) => [...m, userMsg]);
    setIsLoading(true);

    // ✅ Чистим старые ошибки
    setMessages((m) =>
      m.filter((msg) => !(msg.role === 'assistant' && msg.text.includes('Ошибка')))
    );

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: text,
          systemPrompt: `Ты — голосовой ассистент для колориста. Отвечай кратко, по существу.`,
        }),
        signal: controller.signal,
        // @ts-ignore
        timeout: 30000,
      });

      if (!res.ok) {
        const details = await res.text();
        throw new Error(`Сервер вернул ${res.status}: ${details}`);
      }

      const json = await res.json();
      const assistantMsg: VoiceMessage = {
        role: 'assistant',
        text: json.reply || 'Нет ответа',
        timestamp: new Date().toISOString(),
      };

      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      // ✅ Точная причина сбоя
      let userText = 'Ошибка соединения. Попробуйте позже.';
      if (err.name === 'AbortError') userText = 'Запрос отменён.';
      if (err.message?.includes('429')) userText = 'Слишком много запросов. Подождите минуту.';
      if (err.message?.includes('timeout')) userText = 'Таймаут запроса. Попробуйте ещё раз.';
      if (err.message?.includes('500')) userText = 'Сервер перегружен. Подождите минуту.';

      const errorMsg: VoiceMessage = {
        role: 'assistant',
        text: userText,
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, errorMsg]);

      console.error('[VoiceAssistant] Fetch error:', err);
    } finally {
      // ✅ ГАРАНТИРОВАННО снимаем флаг
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [lastRequestTime]); // Зависимости для useCallback

  /* ---------- Кнопка «Стоп» ---------- */
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  };

  /* ---------- Распознавание речи ---------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = 'ru-RU';
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (e: any) => {
      let finalTranscript = '';
      let interimTranscript = ''; // ✅ ИСПРАВЛЕНО: объявлена переменная
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript = t;
        } else {
          interimTranscript += t; // ✅ Используем правильную переменную
        }
      }
      setRecognizedText(finalTranscript || interimTranscript);

      if (finalTranscript.trim()) {
        setTimeout(() => {
          sendMessage(finalTranscript, true);
          setRecognizedText('');
        }, 500);
      }
    };

    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    recognitionRef.current = rec;
  }, [sendMessage]); // ✅ ИСПРАВЛЕНО: добавлена зависимость

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setRecognizedText('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  /* ---------- Синтез речи ---------- */
  const speakResponse = (text: string) => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ru-RU';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  /* ---------- Адаптивность ---------- */
  useEffect(() => {
    const check = () =>
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    check();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }
  }, []);

  /* ---------- UI ---------- */
  const buttonSize = isMobile ? 'w-20 h-20 text-3xl' : 'w-24 h-24 text-4xl';
  const messageSize = isMobile ? 'max-w-[85%] text-sm' : 'max-w-[75%]';

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <div className="mb-4 sm:mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">🎤 Голосовой ассистент</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Работайте руками в салоне - общайтесь голосом
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <button
            onClick={toggleRecording}
            disabled={isLoading}
            className={`relative ${buttonSize} rounded-full flex items-center justify-center transition-all
            ${isRecording ? 'bg-red-500 animate-pulse-record' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={isMobile ? 'text-3xl' : 'text-4xl'}>
              {isRecording ? '⏹️' : '🎤'}
            </span>
          </button>

          <div className="text-center px-4">
            <p className={`font-semibold ${isRecording ? 'text-red-500' : 'text-gray-700'} text-base sm:text-lg`}>
              {isRecording ? 'Слушаю... Говорите!' : 'Нажмите и говорите'}
            </p>
            {recognizedText && (
              <p className="text-sm text-gray-500 mt-1 break-words">
                Распознано: "{recognizedText}"
              </p>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 w-full justify-center">
            {synthesisAvailable && window.speechSynthesis?.speaking && (
              <button
                onClick={stopSpeaking}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
              >
                ⏸️ Стоп
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Очистить историю?')) setMessages([]);
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium"
            >
              🗑️ Очистить
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">История</h2>
        <div className="h-64 sm:h-96 overflow-y-auto space-y-2 sm:space-y-3 pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-400">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">💇‍♀️</div>
              <p className="text-sm sm:text-base">Начните голосовой диалог с AI</p>
              <p className="text-xs sm:text-sm mt-1 sm:mt-2">
                Спросите: "Какой окислитель на корни?"
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                  }`}
                >
                  {msg.role === 'user' ? (msg.isVoiceInput ? '🎤' : '👤') : '🤖'}
                </div>
                <div
                  className={`${messageSize} rounded-2xl px-3 sm:px-4 py-2 ${
                    msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className={`whitespace-pre-wrap leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                    {msg.text}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {msg.role === 'assistant' && synthesisAvailable && (
                    <button
                      onClick={() => speakResponse(msg.text)}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      🔊 Прослушать
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <span className="animate-pulse text-sm">🤖 Думаю...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="mt-4 sm:mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4">
        <h3 className="font-bold text-purple-900 mb-2 text-sm sm:text-base">
          💡 Что можно спросить:
        </h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {[
            'Какой окислитель на корни?',
            'Что делать с жёлтым оттенком?',
            'Как смешать 7,5 % окислитель?',
            'Сколько выдерживать на пористых волосах?',
          ].map((tip, i) => (
            <button
              key={i}
              onClick={() => sendMessage(tip)}
              disabled={isLoading}
              className="px-2 sm:px-3 py-1 bg-white border border-purple-200 rounded-full text-xs sm:text-sm hover:bg-purple-100 disabled:opacity-50"
            >
              {tip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

```

# File: src/pages/Chat.tsx
```typescript
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  image?: string | null;
  timestamp: string;
}

interface LessonContext {
  title: string;
  content: string;
}

export default function EnhancedChat() {
  // ✅ ИСПРАВЛЕНО: убран localStorage, данные хранятся только в памяти
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentLesson, setCurrentLesson] = useState<LessonContext | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadLessonContext = async () => {
    const mockLesson: LessonContext = {
      title: "Подготовка к блондированию",
      content: "Важные правила перед блондированием: 1. Мыть волосы за сутки до процедуры 2. Обязательно делать тестовую прядь 3. Проверять эластичность волос 4. Смешивать продукт маленькими порциями"
    };
    setCurrentLesson(mockLesson);
  };

  useEffect(() => {
    loadLessonContext();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string | null);
      };
      reader.readAsDataURL(file);
    }
  };

  const send = async (messageText: string = text, includeContext: boolean = true) => {
    if (!messageText.trim() && !uploadedImage) return;

    // ✅ ДОБАВЛЕНО: защита от спама (минимум 2 секунды между запросами)
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      alert('Подождите немного перед следующим запросом');
      return;
    }
    setLastRequestTime(now);

    let fullPrompt = messageText;

    if (includeContext && currentLesson) {
      fullPrompt = `Контекст урока "${currentLesson.title}":\n${currentLesson.content}\n\nВопрос студента: ${messageText}`;
    }
    if (uploadedImage) {
      fullPrompt += `\n\n[Пользователь прикрепил изображение для анализа]`;
    }

    const userMessage: Message = {
      role: 'user',
      text: messageText,
      image: uploadedImage,
      timestamp: new Date().toISOString()
    };

    setMessages((m) => [...m, userMessage]);
    setText('');
    setUploadedImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: fullPrompt, image: uploadedImage })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: { reply?: string; error?: string } = await res.json();

      const assistantMessage: Message = {
        role: 'assistant',
        text: json.reply || json.error || 'Нет ответа',
        timestamp: new Date().toISOString()
      };

      setMessages((m) => [...m, assistantMessage]);
    } catch (e) {
      const errorMessage: Message = {
        role: 'assistant',
        text: 'Ошибка при запросе к AI. Проверьте подключение или попробуйте позже.',
        timestamp: new Date().toISOString()
      };
      setMessages((m) => [...m, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  interface QuickQuestion {
    emoji: string;
    text: string;
  }

  const quickQuestions: QuickQuestion[] = [
    { emoji: '\u{1F4A1}', text: 'Объясни проще' },
    { emoji: '\u{1F4D6}', text: 'Приведи пример' },
    { emoji: '\u{2753}', text: 'Что это значит?' },
    { emoji: '\u{203C}', text: 'Какие ошибки можно допустить?' },
    { emoji: '\u{27A1}', text: 'Дай пошаговую инструкцию' },
    { emoji: '\u{1F50D}', text: 'Расскажи подробнее' }
  ];

  const handleQuickQuestion = (questionText: string) => {
    setText(questionText);
    send(questionText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        send();
      }
    }
  };

  const clearHistory = () => {
    if (window.confirm('Очистить историю чата?')) {
      setMessages([]);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI-консультант</h2>
          {currentLesson && (
            <p className="text-sm text-gray-600 mt-1">
              Контекст: {currentLesson.title}
            </p>
          )}
        </div>
        <button
          onClick={clearHistory}
          className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded-md"
        >
          Очистить историю
        </button>
      </div>

      {messages.length === 0 && (
        <div className="mb-4 bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Быстрые вопросы:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q.text)}
                className="px-3 py-1.5 bg-white border border-blue-200 rounded-full text-sm hover:bg-blue-100 transition-colors"
              >
                {q.emoji} {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="h-[500px] overflow-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-lg">Задайте вопрос по уроку</p>
              <p className="text-sm mt-2">Я помогу разобраться в материале</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    }`}>
                    {m.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {m.image && (
                      <img src={m.image} alt="Uploaded" className="max-w-xs rounded-lg mb-2" />
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <p className={`text-xs mt-2 ${m.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          {uploadedImage && (
            <div className="mb-3 relative inline-block">
              <img src={uploadedImage} alt="Preview" className="h-20 rounded-lg border-2 border-blue-400" />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => handleQuickQuestion('Объясни проще')}
                className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
              >
                Объясни проще
              </button>
              <button
                onClick={() => handleQuickQuestion('Приведи пример')}
                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
              >
                Приведи пример
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Прикрепить изображение"
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
              placeholder="Задайте вопрос..."
              rows={3}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => send()}
              disabled={loading || (!text.trim() && !uploadedImage)}
              className={`p-3 rounded-full transition-all duration-200 ${text.trim() || uploadedImage ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Совет: Вопросы автоматически учитывают контекст текущего урока
          </p>
        </div>
      </div>
    </div>
  );
}

```

# File: src/pages/ChatRaw.tsx
```typescript
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function ChatRaw() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async (messageText: string = text) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(m => [...m, userMessage]);
    setText('');
    setLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: messageText,
          // Свободный режим чата без системного промпта
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      const assistantMessage: Message = {
        role: 'assistant',
        text: json.reply || json.error || 'Нет ответа',
        timestamp: new Date().toISOString()
      };

      setMessages(m => [...m, assistantMessage]);
    } catch (e) {
      const errorMessage: Message = {
        role: 'assistant',
        text: 'Ошибка при запросе к AI. Проверьте подключение или попробуйте позже.',
        timestamp: new Date().toISOString()
      };
      setMessages(m => [...m, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Очистить историю чата?')) {
      setMessages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        send();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Чат с ИИ</h2>
          <p className="text-sm text-gray-600 mt-1">
            Свободное общение с Qwen2.5-72B без ограничений
          </p>
        </div>
        <button
          onClick={clearHistory}
          className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded-md"
        >
          Очистить историю
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="h-[500px] overflow-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-lg">Начните свободное общение с AI</p>
              <p className="text-sm mt-2">Задавайте любые вопросы без ограничений</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    }`}>
                    {m.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <p className={`text-xs mt-2 ${m.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
              placeholder="Ваше сообщение..."
              rows={3}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => send()}
              disabled={loading || !text.trim()}
              className={`p-3 rounded-full transition-all duration-200 ${text.trim() ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Режим: Свободный чат • Модель: Qwen/Qwen2.5-72B-Instruct
          </p>
        </div>
      </div>
    </div>
  );
}

```

# File: src/pages/Test/[slug].tsx
```typescript
import React, { useState } from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import type { GetStaticProps, GetStaticPaths } from 'next';

// --- Типы ---
interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface TestPageProps {
  quiz: QuizItem[];
  lessonSlug: string;
}

// --- Компонент ---
const TestPage: React.FC<TestPageProps> = ({ quiz, lessonSlug }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const handleAnswerClick = (questionIndex: number, selectedOption: string) => {
    if (selectedAnswers[questionIndex] !== undefined) {
      return;
    }
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: selectedOption,
    });
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
  };

  const getButtonClass = (questionIndex: number, option: string) => {
    const isSelected = selectedAnswers[questionIndex] === option;
    const isCorrect = quiz[questionIndex]?.correctAnswer === option;
    const answerGiven = selectedAnswers[questionIndex] !== undefined;

    if (!answerGiven) {
      return 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100';
    }
    if (isCorrect) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    return 'bg-slate-50 border-slate-200 text-gray-700 opacity-70';
  };

  const correctCount = quiz.filter((item, index) => selectedAnswers[index] === item.correctAnswer).length;
  const total = quiz.length;
  const allAnswered = Object.keys(selectedAnswers).length === total;

  // --- UI: Тест не найден ---
  if (!quiz || quiz.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Тест для урока "{lessonSlug}" не найден</h1>
        <p className="text-gray-600">Убедитесь, что файл {lessonSlug}-quiz.json существует в public/content/quizzes/</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Вернуться на главную</Link>
      </div>
    );
  }

  // --- UI: Тест ---
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          К списку
        </Link>
      </div>

      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Тест
        </h1>
      </header>

      <div className="space-y-6">
        {quiz.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {index + 1}. {item.question}
            </h3>
            <div className="space-y-2">
              {item.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerClick(index, option)}
                  disabled={selectedAnswers[index] !== undefined}
                  className={`
                    w-full p-3 rounded-md border text-left transition-colors
                    ${getButtonClass(index, option)}
                  `}
                >
                  <span className="flex items-center">
                    {selectedAnswers[index] !== undefined &&
                      item.correctAnswer === option && (
                        <span className="w-4 h-4 mr-2">✓</span>
                      )}
                    {selectedAnswers[index] === option &&
                      item.correctAnswer !== option && (
                        <span className="w-4 h-4 mr-2">X</span>
                      )}
                    {option}
                  </span>
                </button>
              ))}
            </div>
            {selectedAnswers[index] !== undefined && (
              <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-md">
                <p className="font-semibold text-blue-800">Объяснение:</p>
                <p className="text-sm text-gray-800">{item.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {allAnswered && (
        <div className="mt-8 p-4 bg-green-100 rounded-lg text-center">
          <h3 className="text-xl font-bold">Результат: {correctCount} / {total}</h3>
        </div>
      )}

      <div className="text-center mt-8">
        <button
          onClick={resetQuiz}
          className="font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-center transition-colors inline-flex items-center"
        >
          <span className="mr-2">↻</span>
          Сбросить тест
        </button>
      </div>
    </div>
  );
};

// --- Загрузка данных (SSG) ---
export const getStaticPaths: GetStaticPaths = async () => {
  let lessons: { slug: string }[] = [];
  try {
    // ВАЖНО: Тесты создаются на основе `lessons/index.json`
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    const indexData = JSON.parse(data);

    // Поддержка нового формата с модулями
    if (indexData.modules && indexData.lessons) {
      lessons = Object.values(indexData.lessons).flat() as { slug: string }[];
    } else {
      lessons = indexData;
    }
  } catch (e) {
    console.warn("index.json not found for getStaticPaths in Test");
  }

  const paths = lessons.map(lesson => ({
    params: { slug: lesson.slug },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };
  const quizPath = path.join(process.cwd(), 'public', 'content', 'quizzes', `${slug}-quiz.json`);

  // ✅ Добавь явную проверку существования
  if (!fs.existsSync(quizPath)) {
    console.warn(`⚠️ Quiz not found: ${quizPath}`);
    return {
      props: {
        quiz: [], // Пустой массив = безопасная заглушка
        lessonSlug: slug,
      },
    };
  }

  const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
  // Support both formats: array or object with questions property
  const rawQuiz = Array.isArray(quizData) ? quizData : (quizData.questions || []);

  // Normalize correctAnswer: convert index (number) to actual answer text (string)
  const quiz = rawQuiz.map((item: { options: string[]; correctAnswer: number | string; explanation?: string }) => ({
    ...item,
    correctAnswer: typeof item.correctAnswer === 'number'
      ? item.options[item.correctAnswer]
      : item.correctAnswer,
    explanation: item.explanation || 'Правильный ответ выделен зеленым.'
  }));

  return { props: { quiz, lessonSlug: slug } };
};

export default TestPage;

```

# File: src/pages/Theory/[slug].tsx
```typescript
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

```

# File: src/pages/_app.tsx
```typescript
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import InstallPrompt from '../components/InstallPrompt';
import '../index.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <InstallPrompt />
    </Layout>
  );
}

export default MyApp;

```

# File: src/pages/_document.tsx
```typescript
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ru">
        <Head>
          {/* Viewport для мобильных устройств - КРИТИЧНО для APK */}
          <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover" />

          {/* TWA/APK оптимизация */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Blonding" />
          <meta name="application-name" content="Blonding App" />

          {/* Favicon */}
          <link rel="icon" href="/icon-192x192.png" />

          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* PWA Meta Tags */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Blonding" />
          <meta name="application-name" content="Blonding App" />
          <meta name="msapplication-TileColor" content="#8b5cf6" />
          <meta name="msapplication-TileImage" content="/icon-144x144.png" />

          {/* Icons for iOS */}
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

          {/* Theme Color */}
          <meta name="theme-color" content="#8b5cf6" />
          <meta name="theme-color" media="(prefers-color-scheme: light)" content="#8b5cf6" />
          <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#6d28d9" />

          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Blonding App" />
          <meta property="og:title" content="Blonding App - Обучение Блондированию" />
          <meta property="og:description" content="PWA для обучения техникам блондирования с AI-консультантом и интерактивными тестами" />
          <meta property="og:image" content="/icon-512x512.png" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Blonding App" />
          <meta name="twitter:description" content="Обучение техникам блондирования с AI" />
          <meta name="twitter:image" content="/icon-512x512.png" />

          {/* Service Worker Registration - для PWABuilder */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('Service Worker registered:', registration.scope);
                      },
                      function(err) {
                        console.log('Service Worker registration failed:', err);
                      }
                    );
                  });
                }
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

```

# File: src/pages/index.tsx
```typescript
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { GetStaticProps } from 'next';
import Head from 'next/head';

interface Module {
  name: string;
  slug: string;
  lessonsCount: number;
}

interface IndexData {
  modules: Module[];
}

interface HomeProps {
  modules: Module[];
}

// Иконки и цвета для модулей (сохранены из оригинала)
const MODULE_STYLES: Record<string, { icon: string; color: string; bgColor: string }> = {
  'fundamentalnaya-teoriya-koloristiki-predobuchenie': {
    icon: '📚',
    color: 'text-purple-600',
    bgColor: 'from-purple-500 to-indigo-600',
  },
  'blondirovanie': {
    icon: '💇‍♀️',
    color: 'text-amber-600',
    bgColor: 'from-amber-500 to-orange-600',
  },
  'tonirovanie': {
    icon: '🎨',
    color: 'text-blue-600',
    bgColor: 'from-blue-500 to-cyan-600',
  },
};

const DEFAULT_STYLE = {
  icon: '📖',
  color: 'text-gray-600',
  bgColor: 'from-gray-500 to-slate-600',
};

// Склонение слова "урок"
function getLessonsWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'уроков';
  if (lastDigit === 1) return 'урок';
  if (lastDigit >= 2 && lastDigit <= 4) return 'урока';
  return 'уроков';
}

const Home = ({ modules }: HomeProps) => {
  // Рассчитываем общий прогресс (заглушка 15%)
  const totalLessons = modules.reduce((acc, m) => acc + m.lessonsCount, 0);
  const progressPercent = 15;

  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          Модули не найдены. Загрузите .docx в папки модулей.
        </div>
      </div>
    );
  }

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
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/90 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Заголовок списка */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900">Ваши модули</h3>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            {totalLessons} уроков
          </span>
        </div>

        {/* Список карточек модулей */}
        <div className="space-y-4">
          {modules.map((module) => {
            const style = MODULE_STYLES[module.slug] || DEFAULT_STYLE;
            return (
              <Link key={module.slug} href={`/module/${module.slug}`} className="block group">
                <div className="relative bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.98]">
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b ${style.bgColor} rounded-r-full opacity-80" />
                  <div className="flex items-center justify-between ml-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${style.bgColor} flex items-center justify-center text-2xl shadow-sm`}>
                        {style.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-800 leading-tight mb-1 group-hover:text-purple-700 transition-colors line-clamp-2">
                          {module.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {module.lessonsCount} {getLessonsWord(module.lessonsCount)}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-600 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ВАЖНО: getStaticProps сохранен из оригинала!
export const getStaticProps: GetStaticProps = async () => {
  let modules: Module[] = [];

  try {
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    const indexData: IndexData = JSON.parse(data);

    if (indexData.modules) {
      modules = indexData.modules;
    }
  } catch (e) {
    console.error('Error reading index.json:', (e as Error).message);
  }

  return {
    props: {
      modules,
    },
  };
};

export default Home;

```

# File: src/pages/module/[slug].tsx
```typescript
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { GetStaticProps, GetStaticPaths } from 'next';

interface Lesson {
    slug: string;
    title: string;
}

interface Module {
    name: string;
    slug: string;
    lessonsCount: number;
}

interface IndexData {
    modules: Module[];
    lessons: Record<string, Lesson[]>;
}

interface ModulePageProps {
    moduleData: Module;
    lessons: Lesson[];
}

const ModulePage = ({ moduleData, lessons }: ModulePageProps) => {
    if (!moduleData || lessons.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Модуль не найден</h1>
                <Link href="/" className="text-blue-600 hover:underline">
                    ← Вернуться на главную
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                    ← Вернуться к модулям
                </Link>
            </div>

            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{moduleData.name}</h1>
                <p className="text-lg text-gray-600">
                    {lessons.length} {lessons.length === 1 ? 'урок' : 'уроков'}
                </p>
            </header>

            <div className="space-y-4">
                {lessons.map((lesson, index) => (
                    <Link
                        key={lesson.slug}
                        href={`/Theory/${encodeURIComponent(lesson.slug)}`}
                        className="block bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition border border-gray-100"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                                <p className="text-sm text-blue-600">Открыть урок →</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    let modules: Module[] = [];
    try {
        const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
        const data = fs.readFileSync(jsonPath, 'utf-8');
        const indexData: IndexData = JSON.parse(data);
        if (indexData.modules) {
            modules = indexData.modules;
        }
    } catch (e) {
        console.warn("index.json not found for getStaticPaths in Module");
    }

    const paths = modules.map((m) => ({
        params: { slug: m.slug },
    }));

    return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params as { slug: string };

    let moduleData: Module | null = null;
    let lessons: Lesson[] = [];

    try {
        const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
        const data = fs.readFileSync(jsonPath, 'utf-8');
        const indexData: IndexData = JSON.parse(data);

        if (indexData.modules) {
            moduleData = indexData.modules.find((m) => m.slug === slug) || null;
            lessons = indexData.lessons[slug] || [];
        }
    } catch (e) {
        console.error('Error reading index.json:', (e as Error).message);
    }

    if (!moduleData) {
        return { notFound: true };
    }

    return {
        props: {
            moduleData,
            lessons,
        },
    };
};

export default ModulePage;

```

# File: scripts/evaluate-retriever.js
```javascript
import fs from 'fs';
import path from 'path';

// Тестовый набор: [вопрос, ожидаемый_ключевой_термин]
const testCases = [
  ["Какой процент окислителя использовать на корни при чувствительной коже", "крем-протектор"],
  ["Что такое техника BACK TO BACK", "фольга"],
  ["На сколько сантиметров отступать от кожи головы", "1.5-2 см"],
  ["Когда делать тест на пряди", "визуальный осмотр"],
  ["Какая пропорция для 12% окислителя", "1:5"]
];

function evaluateRetriever() {
  console.log("\n📊 Оценка качества чанкинга и ретривера\n");
  
  const lessonsDir = './public/lessons';
  const indexPath = path.join(lessonsDir, 'index.json');
  
  if (!fs.existsSync(indexPath)) {
    console.error("❌ Индекс уроков не найден");
    return;
  }

  const lessons = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  let totalScore = 0;
  let foundCases = 0;

  for (const testCase of testCases) {
    const [question, expectedTerm] = testCase;
    console.log(`🔍 Вопрос: "${question}"`);
    console.log(`   Ожидаемый термин: "${expectedTerm}"`);
    
    // Простой поиск по всем урокам
    let found = false;
    for (const lesson of lessons) {
      const mdPath = path.join(lessonsDir, lesson.slug, `${lesson.slug}.md`);
      if (fs.existsSync(mdPath)) {
        const content = fs.readFileSync(mdPath, 'utf-8').toLowerCase();
        if (content.includes(expectedTerm.toLowerCase())) {
          found = true;
          break;
        }
      }
    }
    
    if (found) {
      console.log("   ✅ Найдено");
      foundCases++;
      totalScore += 1;
    } else {
      console.log("   ❌ Не найдено");
    }
  }

  const recall = (foundCases / testCases.length) * 100;
  console.log(`\n📈 Результат: ${foundCases}/${testCases.length} (${recall.toFixed(1)}% recall)`);
  
  if (recall < 80) {
    console.log("⚠️  Warning: Recall < 80%, нужно улучшать чанкинг или поиск");
  } else {
    console.log("✅ Хороший recall, ретривер работает эффективно");
  }
}

// CLI execution
if (process.argv[1] === new URL(import.meta.url).pathname) {
  evaluateRetriever();
}

export { evaluateRetriever };

```

# File: scripts/generate-md.js
```javascript
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import sharp from 'sharp';
import TurndownService from 'turndown';

// Мультимодульная структура курса
const lessonsDir = './lessons';
const outPublicDir = './public/lessons';
const readmeFile = './README.md';

// Список модулей курса (папки в lessons/)
const MODULES = ['ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)', 'блондирование', 'тонирование'];

const turndownService = new TurndownService();

function slugify(text) {
  const translit = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    "%": "percent", " ": "-", "_": "-", ".": ""
  };

  return text.toLowerCase().trim()
    .replace(/[а-яё]/g, (char) => translit[char] || '')
    .replace(/[%_\s.]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80); // Limit length to 80 chars
}

function slugifyModule(moduleName) {
  return slugify(moduleName);
}

if (!fs.existsSync(outPublicDir)) fs.mkdirSync(outPublicDir, { recursive: true });

async function processLessonFile(file, moduleSourceDir, moduleSlug) {
  const filePath = path.join(moduleSourceDir, file);
  const baseName = path.basename(file, path.extname(file));
  const slug = slugify(baseName);
  const ext = path.extname(file);
  const lessonPublicDir = path.join(outPublicDir, slug);
  const lessonPublicImgDir = path.join(lessonPublicDir, 'images');

  if (fs.existsSync(lessonPublicDir)) {
    fs.rmSync(lessonPublicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(lessonPublicImgDir, { recursive: true });

  let content = '';
  let title = baseName;
  let imageCounter = 1;

  const mammothOptions = {
    convertImage: mammoth.images.imgElement(async (image) => {
      try {
        const buffer = await image.read();
        if (buffer.length > 5 * 1024 * 1024) return { src: '' };
        const contentType = image.contentType;
        const extension = contentType.split('/')[1] || 'png';
        const imgName = `image-${imageCounter++}.${extension}`;
        const imgPath = path.join(lessonPublicImgDir, imgName);
        await sharp(buffer).jpeg({ quality: 85, progressive: true }).toFile(imgPath);
        const webPath = `/lessons/${slug}/images/${imgName}`;
        return { src: webPath };
      } catch { return { src: '' }; }
    })
  };

  if (ext === '.txt' || ext === '.md') {
    content = fs.readFileSync(filePath, 'utf-8');
  } else if (ext === '.docx') {
    try {
      const htmlResult = await mammoth.convertToHtml({ path: filePath }, mammothOptions);
      content = turndownService.turndown(htmlResult.value);
    } catch (err) {
      console.warn(`[generate-md] ⚠️ Ошибка обработки файла ${file}: ${err.message}`);
      return null;
    }
  } else {
    return null;
  }

  // Use filename as title if it has readable Russian text (contains lesson number)
  // Fallback to content extraction only if filename is a slug
  const hasReadableName = /[а-яА-ЯёЁ]/.test(baseName);

  if (!hasReadableName) {
    // Filename is a slug like "urok1...", try to extract title from content
    const titleMatch = content.match(/^# (.*)$/m);
    const boldTitleMatch = content.match(/^\*\*(.+?)\*\*/m);

    if (titleMatch?.[1]) {
      title = titleMatch[1].trim();
    } else if (boldTitleMatch?.[1]) {
      title = boldTitleMatch[1].trim();
    }
  }
  // else: keep title = baseName (filename with lesson number)

  const mdFile = `---
title: "${title}"
slug: "${slug}"
module: "${moduleSlug}"
date: "${new Date().toISOString().split('T')[0]}"
---

${content}`;

  fs.writeFileSync(path.join(lessonPublicDir, `${slug}.md`), mdFile, 'utf-8');
  return { slug, title, module: moduleSlug };
}

async function processModule(moduleName) {
  const moduleSourceDir = path.join(lessonsDir, moduleName);
  const moduleSlug = slugifyModule(moduleName);

  if (!fs.existsSync(moduleSourceDir)) {
    console.warn(`[generate-md] ⚠️ Модуль не найден: ${moduleName}`);
    return { name: moduleName, slug: moduleSlug, lessons: [] };
  }

  const files = fs.readdirSync(moduleSourceDir).filter(f =>
    ['.txt', '.md', '.docx'].includes(path.extname(f))
  );

  console.log(`[generate-md] 📚 Модуль "${moduleName}": ${files.length} файлов`);

  const lessons = (await Promise.all(
    files.map(file => processLessonFile(file, moduleSourceDir, moduleSlug))
  )).filter(Boolean);

  // Sort lessons numerically based on slug (most reliable)
  lessons.sort((a, b) => {
    const getNum = (item) => {
      // Slug format: "urok-1..." or "urok1..." - extract number
      const match = item.slug.match(/^urok-?(\d+)/i);
      return match ? parseInt(match[1], 10) : 999;
    };
    return getNum(a) - getNum(b);
  });

  return { name: moduleName, slug: moduleSlug, lessons };
}

// Описания уроков для Фундаментальной теории (из файловых имён)
const LESSON_DESCRIPTIONS = {
  'urok-1': 'Введение в колористику',
  'urok-2': 'Тестовые пряди и портфолио оттенков для тонирования',
  'urok-3': 'Натуральные пигменты: эумеланин и феомеланин',
  'urok-4': 'Процесс окрашивания с осветлением и блондирование',
  'urok-5': 'Уровни глубины тона и фоны осветления',
  'urok-6': 'Шкала УГТ и ФО, идеальный фон осветления',
  'urok-7': 'Цветовой круг и правила колористики',
  'urok-8': 'Нейтрализация желтого и желто-оранжевого ФО',
  'urok-9': 'Значение pH при блондировании',
  'urok-10': 'Блондирование на 12% окислителе',
  'urok-11': 'Классификация блондирующих препаратов',
  'urok-12': 'Оптимизация расхода продукта',
  'urok-13': 'Как избежать ожога кожи',
  'urok-14': 'Добавки в обесцвечивающий порошок',
  'urok-15': 'Вопросы для диалога с клиентом',
  'urok-16': 'Техническое досье и памятка по уходу',
};

async function generateLessons() {
  console.log('[generate-md] 🚀 Начало генерации...\n');

  const modulesData = await Promise.all(MODULES.map(processModule));

  // Формируем index.json с группировкой по модулям
  const indexData = {
    modules: modulesData.map(m => ({
      name: m.name,
      slug: m.slug,
      lessonsCount: m.lessons.length
    })),
    lessons: modulesData.reduce((acc, m) => {
      acc[m.slug] = m.lessons.map(l => {
        // Для уроков фундаментальной теории используем описания
        const description = LESSON_DESCRIPTIONS[l.slug] || l.title;
        return { slug: l.slug, title: description };
      });
      return acc;
    }, {})
  };

  // Также сохраняем плоский список для обратной совместимости
  const flatLessons = modulesData.flatMap(m => m.lessons);

  fs.writeFileSync(path.join(outPublicDir, 'index.json'), JSON.stringify(indexData, null, 2), 'utf-8');

  const totalLessons = flatLessons.length;
  console.log(`\n[generate-md] ✅ Готово! ${totalLessons} уроков в ${modulesData.length} модулях.`);
}

const generatedDir = './lessons/generated';
if (fs.existsSync(generatedDir)) fs.rmSync(generatedDir, { recursive: true, force: true });

generateLessons().catch(e => {
  console.error(e);
  process.exit(1);
});

```

# File: scripts/generate_full_code.cjs
```javascript
const fs = require('fs');
const path = require('path');

const outputFile = 'BLOND_FULL_PROJECT_CODE.md';
const rootDir = process.cwd();

const includeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.md', '.cjs', '.mjs', '.html'];
const excludeDirs = ['node_modules', '.next', '.git', '.github', 'lessons', 'fonts', 'images', 'icons'];
const excludeFiles = ['package-lock.json', 'yarn.lock', 'BLOND_FULL_PROJECT_CODE.md', 'FULL_PROJECT_CODE.md', '.DS_Store'];

const targetPaths = [
    'src',
    'scripts',
    '__tests__',
    'api',
    'public/lessons/index.json'
];

const rootFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.cjs',
    'postcss.config.cjs',
    'jest.config.cjs',
    'README.md',
    '.eslintrc.json',
    'vercel.json',
    'next-env.d.ts',
    'REDESIGN_MASTERPLAN.md'
];

let output = `# Full Project Code - Blonding App v2.1\n\nGenerated: ${new Date().toISOString()}\n\n`;

function processFile(filePath) {
    try {
        const ext = path.extname(filePath);
        if (!includeExtensions.includes(ext)) return;

        if (ext === '.json' && fs.statSync(filePath).size > 50000 && !filePath.endsWith('index.json')) return;

        const content = fs.readFileSync(filePath, 'utf-8');
        const relPath = path.relative(rootDir, filePath);

        let lang = ext.slice(1);
        if (lang === 'js' || lang === 'jsx' || lang === 'cjs' || lang === 'mjs') lang = 'javascript';
        if (lang === 'ts' || lang === 'tsx') lang = 'typescript';
        if (lang === 'md') lang = 'markdown';

        output += `\n# File: ${relPath}\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
        console.log(`Included: ${relPath}`);
    } catch (e) {
        console.error(`Error processing ${filePath}: ${e.message}`);
    }
}

function processDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(item)) {
                processDir(fullPath);
            }
        } else {
            if (!excludeFiles.includes(item)) {
                processFile(fullPath);
            }
        }
    }
}

for (const file of rootFiles) {
    if (fs.existsSync(file)) processFile(path.join(rootDir, file));
}

for (const target of targetPaths) {
    const fullPath = path.join(rootDir, target);
    if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

fs.writeFileSync(outputFile, output);
console.log(`\nGenerated ${outputFile} with size ${fs.statSync(outputFile).size} bytes`);

```

# File: scripts/generate_full_code.js
```javascript
const fs = require('fs');
const path = require('path');

const outputFile = 'BLOND_FULL_PROJECT_CODE.md';
const rootDir = process.cwd();

const includeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.md', '.cjs', '.mjs', '.html'];
const excludeDirs = ['node_modules', '.next', '.git', '.github', 'lessons', 'fonts', 'images', 'icons'];
const excludeFiles = ['package-lock.json', 'yarn.lock', 'BLOND_FULL_PROJECT_CODE.md', 'FULL_PROJECT_CODE.md', '.DS_Store'];

const targetPaths = [
    'src',
    'scripts',
    '__tests__',
    'api',
    'public/lessons/index.json'
];

const rootFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.cjs',
    'postcss.config.cjs',
    'jest.config.cjs',
    'README.md',
    '.eslintrc.json',
    'vercel.json',
    'next-env.d.ts',
    'REDESIGN_MASTERPLAN.md'
];

let output = `# Full Project Code - Blonding App v2.1\n\nGenerated: ${new Date().toISOString()}\n\n`;

function processFile(filePath) {
    try {
        const ext = path.extname(filePath);
        if (!includeExtensions.includes(ext)) return;

        if (ext === '.json' && fs.statSync(filePath).size > 50000 && !filePath.endsWith('index.json')) return;

        const content = fs.readFileSync(filePath, 'utf-8');
        const relPath = path.relative(rootDir, filePath);

        let lang = ext.slice(1);
        if (lang === 'js' || lang === 'jsx' || lang === 'cjs' || lang === 'mjs') lang = 'javascript';
        if (lang === 'ts' || lang === 'tsx') lang = 'typescript';
        if (lang === 'md') lang = 'markdown';

        output += `\n# File: ${relPath}\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
        console.log(`Included: ${relPath}`);
    } catch (e) {
        console.error(`Error processing ${filePath}: ${e.message}`);
    }
}

function processDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(item)) {
                processDir(fullPath);
            }
        } else {
            if (!excludeFiles.includes(item)) {
                processFile(fullPath);
            }
        }
    }
}

for (const file of rootFiles) {
    if (fs.existsSync(file)) processFile(path.join(rootDir, file));
}

for (const target of targetPaths) {
    const fullPath = path.join(rootDir, target);
    if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

fs.writeFileSync(outputFile, output);
console.log(`\nGenerated ${outputFile} with size ${fs.statSync(outputFile).size} bytes`);

```

# File: scripts/generate_full_project_code.js
```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'FULL_PROJECT_CODE.md');

// Configuration
const dirsToInclude = ['src', 'api', 'scripts', 'lessons'];
const filesToInclude = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.cjs',
    'postcss.config.cjs',
    '.eslintrc.json',
    'README.md',
    'vercel.json'
];

const excludeDirs = ['node_modules', '.next', '.git', 'generated'];
const excludeExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.mp3', '.wav', '.pdf', '.DS_Store', '.lock'];
const excludeFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'FULL_PROJECT_CODE.md'];

// Helper to determine language for markdown code block
function getLanguage(ext) {
    switch (ext) {
        case '.js': return 'javascript';
        case '.jsx': return 'jsx';
        case '.ts': return 'typescript';
        case '.tsx': return 'tsx';
        case '.css': return 'css';
        case '.scss': return 'scss';
        case '.html': return 'html';
        case '.json': return 'json';
        case '.md': return 'markdown';
        case '.sh': return 'bash';
        case '.yml':
        case '.yaml': return 'yaml';
        default: return '';
    }
}

let outputContent = `# Full Project Code\n\nGenerated on: ${new Date().toISOString()}\n\n`;

function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    if (excludeExtensions.includes(ext) || excludeFiles.includes(fileName)) {
        return;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(rootDir, filePath);
        const language = getLanguage(ext);

        outputContent += `## File: ${relativePath}\n\n`;
        outputContent += `\`\`\`${language}\n`;
        outputContent += content;
        outputContent += `\n\`\`\`\n\n`;
        outputContent += `---\n\n`;
        console.log(`Processed: ${relativePath}`);
    } catch (err) {
        console.error(`Error reading ${filePath}: ${err.message}`);
    }
}

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(item)) {
                processDirectory(fullPath);
            }
        } else {
            processFile(fullPath);
        }
    }
}

// 1. Process specific root files
filesToInclude.forEach(file => {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
        processFile(fullPath);
    }
});

// 2. Process directories
dirsToInclude.forEach(dirName => {
    const fullPath = path.join(rootDir, dirName);
    processDirectory(fullPath);
});

// Write output
fs.writeFileSync(outputFile, outputContent, 'utf-8');
console.log(`\n✅ Project code dumped to: ${outputFile}`);

```

# File: scripts/rename-lessons.js
```javascript
import fs from 'fs';
import path from 'path';

const LESSONS_DIR = path.join(process.cwd(), 'lessons');

const translit = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya', ' ': '-', '.': '', ',': ''
};

function slugify(text) {
    return text.toLowerCase().trim()
        .replace(/[а-яё]/g, (char) => translit[char] || '')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else {
            const ext = path.extname(file);
            const name = path.basename(file, ext);

            // Keep first 50 chars of the name, but make it safe
            // We also want to preserve the logical structure if possible, but safety is priority.
            let safeName = slugify(name).slice(0, 50);

            // Ensure specific lesson prefixes (like "Urok 4") are preserved if they are at the start
            // slugify handles "Urok 4" -> "urok-4"

            const newFilename = `${safeName}${ext}`;
            const newFilePath = path.join(dir, newFilename);

            if (file !== newFilename) {
                console.log(`Renaming: ${file} -> ${newFilename}`);
                fs.renameSync(filePath, newFilePath);
            }
        }
    }
}

if (fs.existsSync(LESSONS_DIR)) {
    processDirectory(LESSONS_DIR);
    console.log('Renaming complete.');
} else {
    console.error('Lessons directory not found.');
}

```

# File: scripts/sync-version.js
```javascript
#!/usr/bin/env node

/**
 * Скрипт для синхронизации версии между package.json и manifest.json
 * Автоматически запускается перед сборкой
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
    // Читаем версию из package.json
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const version = packageJson.version;

    console.log(`📦 Current version: ${version}`);

    // Обновляем manifest.json
    const manifestPath = join(rootDir, 'public', 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.version = version;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated manifest.json version to ${version}`);

    // Обновляем sw-custom.js
    const swCustomPath = join(rootDir, 'public', 'sw-custom.js');
    let swContent = readFileSync(swCustomPath, 'utf8');
    swContent = swContent.replace(
        /const APP_VERSION = 'v[\d.]+';/,
        `const APP_VERSION = 'v${version}';`
    );
    writeFileSync(swCustomPath, swContent, 'utf8');
    console.log(`✅ Updated sw-custom.js version to v${version}`);

    console.log('🎉 Version sync completed!');
} catch (error) {
    console.error('❌ Error syncing version:', error);
    process.exit(1);
}

```

# File: __tests__/quizUtils.test.ts
```typescript
import * as path from 'path';
import * as fs from 'fs';
import { normalizeQuizQuestion, loadQuiz, validateLessonStructure, loadLessonsIndex } from '../src/lib/quizUtils';

describe('Quiz Utils', () => {
    describe('normalizeQuizQuestion', () => {
        it('should convert number correctAnswer to string', () => {
            const question = {
                question: 'Test?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 1,
            };

            const result = normalizeQuizQuestion(question);
            expect(result.correctAnswer).toBe('B');
        });

        it('should keep string correctAnswer as is', () => {
            const question = {
                question: 'Test?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'B',
            };

            const result = normalizeQuizQuestion(question);
            expect(result.correctAnswer).toBe('B');
        });

        it('should handle index 0 correctly', () => {
            const question = {
                question: 'Test?',
                options: ['First', 'Second', 'Third'],
                correctAnswer: 0,
            };

            const result = normalizeQuizQuestion(question);
            expect(result.correctAnswer).toBe('First');
        });
    });

    describe('validateLessonStructure', () => {
        it('should return true for valid lesson', () => {
            const lesson = { slug: 'test-lesson', title: 'Test Lesson' };
            expect(validateLessonStructure(lesson)).toBe(true);
        });

        it('should return true for lesson with module', () => {
            const lesson = { slug: 'test', title: 'Test', module: 'theory' };
            expect(validateLessonStructure(lesson)).toBe(true);
        });

        it('should return false for missing slug', () => {
            const lesson = { title: 'Test' };
            expect(validateLessonStructure(lesson)).toBe(false);
        });

        it('should return false for null', () => {
            expect(validateLessonStructure(null)).toBe(false);
        });

        it('should return false for non-object', () => {
            expect(validateLessonStructure('string')).toBe(false);
        });
    });

    describe('loadLessonsIndex', () => {
        const indexPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');

        it('should load lessons from index.json', () => {
            if (!fs.existsSync(indexPath)) {
                console.warn('index.json not found, skipping test');
                return;
            }

            const lessons = loadLessonsIndex(indexPath);
            expect(Array.isArray(lessons)).toBe(true);
            expect(lessons.length).toBeGreaterThan(0);
        });

        it('should return empty array for non-existent file', () => {
            const lessons = loadLessonsIndex('/non/existent/path.json');
            expect(lessons).toEqual([]);
        });
    });

    describe('loadQuiz', () => {
        it('should return empty array for non-existent quiz', () => {
            const quiz = loadQuiz('/non/existent/quiz.json');
            expect(quiz).toEqual([]);
        });

        it('should load and normalize quiz from file', () => {
            const quizPath = path.join(process.cwd(), 'public', 'content', 'quizzes', 'urok-1-quiz.json');

            if (!fs.existsSync(quizPath)) {
                console.warn('Quiz file not found, skipping test');
                return;
            }

            const quiz = loadQuiz(quizPath);
            expect(Array.isArray(quiz)).toBe(true);

            // Проверяем что correctAnswer - строка
            quiz.forEach((q: { correctAnswer: unknown }) => {
                expect(typeof q.correctAnswer).toBe('string');
            });
        });
    });
});

```

# File: api/proxy.js
```javascript
import { LRUCache } from 'lru-cache';

// ✅ ИЗМЕНЕНО: Теперь SYSTEM_PROMPT используется только как fallback для специализированных запросов
const BLONDING_SYSTEM_PROMPT = `Ты — эксперт-преподаватель по блондированию волос. Отвечай профессионально, кратко и по существу.`;

// Модель по умолчанию для свободного чата
const HF_MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 });

export default async function handler(req, res) {
  // ✅ Проверка метода
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  // ✅ Rate-limit 10 запросов/мин
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `rate:${ip}`;
  let count = cache.get(key) || 0;
  if (count >= 10) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите минуту.' });
  }
  cache.set(key, ++count);

  const HF_TOKEN = process.env.HF_TOKEN;
  
  // ✅ Ранняя проверка токена
  if (!HF_TOKEN) {
    console.error('[API] HF_TOKEN отсутствует в environment');
    return res.status(500).json({ 
      error: 'Сервер не настроен: отсутствует HF_TOKEN',
      details: 'Проверьте переменные окружения в Vercel'
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const { inputs, systemPrompt, image, jsonMode } = req.body;
    
    // ✅ Валидация запроса
    if (!inputs?.trim()) {
      return res.status(400).json({ error: 'Пустой запрос' });
    }

    // ✅ Проверка размера изображения
    if (image) {
      const base64Data = image.split(',')[1] || '';
      if (Buffer.from(base64Data, 'base64').length > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'Изображение слишком большое (макс. 2MB)' });
      }
    }

    // ✅ Подготовка сообщений
    const messages = [];
    
    // ✅ ИСПРАВЛЕНО: Используем промпт из запроса, если он есть. Если нет — НЕ добавляем системный промпт
    // Для ChatRaw.tsx systemPrompt не передается, поэтому AI будет вести свободный диалог
    if (systemPrompt && systemPrompt.trim()) {
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      // Для совместимости с другими компонентами (Chat.tsx, Assistant) можно использовать BLONDING_SYSTEM_PROMPT
      // Но здесь мы оставляем пустым для свободного чата
      console.log('[API] Свободный режим чата (без системного промпта)');
    }

    if (image) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: inputs },
          { type: 'image_url', image_url: { url: image } }
        ]
      });
    } else {
      messages.push({ role: 'user', content: inputs });
    }

    console.log(`[API] Запрос к модели: ${HF_MODEL}`);

    // ✅ Запрос с правильной моделью
    const resHF = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${HF_TOKEN}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        ...(jsonMode && { response_format: { type: "json_object" } })
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // ✅ Обработка HTTP-ошибок HF
    if (!resHF.ok) {
      const errorText = await resHF.text();
      console.error('[API] HF error:', resHF.status, errorText);
      
      if (resHF.status === 401) {
        return res.status(401).json({ 
          error: 'Неверный HF_TOKEN. Проверьте токен в Vercel',
          details: errorText
        });
      }
      if (resHF.status === 429) {
        return res.status(429).json({ 
          error: 'HF: Превышен лимит запросов',
          details: 'Подождите 1-2 минуты'
        });
      }
      if (resHF.status === 400 && errorText.includes('model_not_supported')) {
        return res.status(400).json({ 
          error: `Модель ${HF_MODEL} не поддерживается вашим HF аккаунтом`,
          details: 'Проверьте доступ и билинг в Hugging Face'
        });
      }
      
      return res.status(resHF.status).json({ 
        error: 'Ошибка Hugging Face API',
        details: errorText
      });
    }

    const data = await resHF.json();
    const reply = data.choices?.[0]?.message?.content || 'Нет ответа';
    return res.status(200).json({ reply });

  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[API] Proxy crash:', err);
    
    // ✅ Обработка network/abort ошибок
    if (err.name === 'AbortError') {
      return res.status(499).json({ error: 'Запрос отменён (timeout)' });
    }
    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return res.status(504).json({ error: 'Таймаут запроса (30с)' });
    }
    if (err.message?.includes('fetch failed')) {
      return res.status(503).json({ error: 'HF API недоступен' });
    }
    
    return res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

```

# File: public/lessons/index.json
```json
{
  "modules": [
    {
      "name": "ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)",
      "slug": "fundamentalnaya-teoriya-koloristiki-predobuchenie",
      "lessonsCount": 16
    },
    {
      "name": "блондирование",
      "slug": "blondirovanie",
      "lessonsCount": 7
    },
    {
      "name": "тонирование",
      "slug": "tonirovanie",
      "lessonsCount": 6
    }
  ],
  "lessons": {
    "fundamentalnaya-teoriya-koloristiki-predobuchenie": [
      {
        "slug": "urok-1",
        "title": "Введение в колористику"
      },
      {
        "slug": "urok-2",
        "title": "Тестовые пряди и портфолио оттенков для тонирования"
      },
      {
        "slug": "urok-3",
        "title": "Натуральные пигменты: эумеланин и феомеланин"
      },
      {
        "slug": "urok-4",
        "title": "Процесс окрашивания с осветлением и блондирование"
      },
      {
        "slug": "urok-5",
        "title": "Уровни глубины тона и фоны осветления"
      },
      {
        "slug": "urok-6",
        "title": "Шкала УГТ и ФО, идеальный фон осветления"
      },
      {
        "slug": "urok-7",
        "title": "Цветовой круг и правила колористики"
      },
      {
        "slug": "urok-8",
        "title": "Нейтрализация желтого и желто-оранжевого ФО"
      },
      {
        "slug": "urok-9",
        "title": "Значение pH при блондировании"
      },
      {
        "slug": "urok-10",
        "title": "Блондирование на 12% окислителе"
      },
      {
        "slug": "urok-11",
        "title": "Классификация блондирующих препаратов"
      },
      {
        "slug": "urok-12",
        "title": "Оптимизация расхода продукта"
      },
      {
        "slug": "urok-13",
        "title": "Как избежать ожога кожи"
      },
      {
        "slug": "urok-14",
        "title": "Добавки в обесцвечивающий порошок"
      },
      {
        "slug": "urok-15",
        "title": "Вопросы для диалога с клиентом"
      },
      {
        "slug": "urok-16",
        "title": "Техническое досье и памятка по уходу"
      }
    ],
    "blondirovanie": [
      {
        "slug": "urok1podgotovkaklientakblondirovaniyu",
        "title": "Чистые или грязные?"
      },
      {
        "slug": "urok2zonyosvetleniyavyborokislitelyapervichnoeosv",
        "title": "Как осветляются волосы на разных участках. 4 участка осветления."
      },
      {
        "slug": "urok3opbonusnyjurok",
        "title": "12% окислитель при блондировании волос."
      },
      {
        "slug": "urok4blondirovanieochentemnyhiaziatskihvolosdvojno",
        "title": "Резистентные волосы. Осветление очень темных волос."
      },
      {
        "slug": "urok5blondirovaniekornejraznojdlinyblondirovaniene",
        "title": "Блондированние корней."
      },
      {
        "slug": "urok6blondirovanieosvetlyonnyhvolosblondirovaniese",
        "title": "Блондирование ранее осветленных волос."
      },
      {
        "slug": "urok7dopolnitelnoeteplopriblondirovaniivremyavyder",
        "title": "Дополнительное тепло при блондировании. Время выдержки при блондировании. Предельное время выдержки.  Постобработка волос - 4 концепции финального мытья."
      }
    ],
    "tonirovanie": [
      {
        "slug": "urok-1-vybor-krasitelya-i-okislitelya-pri-tonirovanii-pravilnoe-nanesenie-pri-to",
        "title": "Урок 1. Выбор красителя и окислителя при тонировании. Правильное нанесение при тонировании. Время выдержки. Последующий уход."
      },
      {
        "slug": "urok-2-neitralizatsiya-zheltogo-i-zhelto-oranzhevogo-fo-individualnoe-portfolio-",
        "title": "Урок 2. Нейтрализация желтого и желто-оранжевого ФО. Индивидуальное портфолио колориста."
      },
      {
        "slug": "urok-3-tonirovanie-blondirovannyh-volos-holodnymi-ottenkami-tonirovanie-teplo-ho",
        "title": "Урок 3. Тонирование блондированных волос холодными оттенками. Тонирование тепло-холодными и теплыми оттенками."
      },
      {
        "slug": "urok-4-predotvrashchenie-nezhelatelnyh-ottenkov-pri-tonirovanii",
        "title": "Урок 4. Предотвращение нежелательных оттенков при тонировании."
      },
      {
        "slug": "urok-5-vyravnivanie-neodnorodnoi-bazy-pri-tonirovanii-repigmentatsiya-pereosvetl",
        "title": "Урок 5. Выравнивание неоднородной базы при тонировании. Репигментация переосветленных участков."
      },
      {
        "slug": "urok-6-snezhno-belye-formuly-tonirovaniya",
        "title": "Урок 6. Снежно-белые формулы тонирования."
      }
    ]
  }
}
```
