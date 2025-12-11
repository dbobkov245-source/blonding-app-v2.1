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
