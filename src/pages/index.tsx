import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { GetStaticProps } from 'next';

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

// Иконки и цвета для модулей
const MODULE_STYLES: Record<string, { icon: string; color: string; bgColor: string }> = {
  'fundamentalnaya-teoriya-koloristiki-predobuchenie': {
    icon: '📚',
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
  },
  'blondirovanie': {
    icon: '💇‍♀️',
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
  },
  'tonirovanie': {
    icon: '🎨',
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
  },
};

const DEFAULT_STYLE = {
  icon: '📖',
  color: 'text-gray-600',
  bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
};

const Home = ({ modules }: HomeProps) => {
  if (modules.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="p-6 bg-white rounded-lg shadow">
          Модули не найдены. Загрузите .docx в папки модулей.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Курс Колористики</h1>
        <p className="text-lg text-gray-600">Выберите модуль для изучения</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((module) => {
          const style = MODULE_STYLES[module.slug] || DEFAULT_STYLE;

          return (
            <Link
              key={module.slug}
              href={`/module/${module.slug}`}
              className={`block rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 ${style.bgColor}`}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">{style.icon}</div>
                <h2 className={`text-xl font-bold mb-2 ${style.color}`}>
                  {module.name}
                </h2>
                <p className="text-gray-600">
                  {module.lessonsCount} {getLessonsWord(module.lessonsCount)}
                </p>
                <div className={`mt-4 inline-block px-4 py-2 rounded-full text-sm font-medium ${style.color} bg-white/60`}>
                  Открыть →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// Склонение слова "урок"
function getLessonsWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'уроков';
  }
  if (lastDigit === 1) {
    return 'урок';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'урока';
  }
  return 'уроков';
}

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
