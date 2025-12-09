import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { GetStaticProps } from 'next';

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

interface HomeProps {
  modules: Module[];
  lessons: Record<string, Lesson[]>;
}

const MODULE_ICONS: Record<string, string> = {
  'блондирование': '💇‍♀️',
  'тонирование': '🎨',
};

const Home = ({ modules, lessons }: HomeProps) => {
  const hasAnyLessons = modules.some(m => (lessons[m.slug]?.length || 0) > 0);

  return (
    <div className="space-y-8">
      {!hasAnyLessons ? (
        <div className="p-6 bg-white rounded shadow">
          Уроки не найдены. Загрузите .docx в папки модулей (lessons/блондирование/, lessons/тонирование/)
        </div>
      ) : (
        modules.map((module) => {
          const moduleLessons = lessons[module.slug] || [];
          if (moduleLessons.length === 0) return null;

          return (
            <section key={module.slug} className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>{MODULE_ICONS[module.name] || '📚'}</span>
                <span className="capitalize">{module.name}</span>
                <span className="text-sm font-normal text-gray-500">
                  ({moduleLessons.length} {moduleLessons.length === 1 ? 'урок' : 'уроков'})
                </span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {moduleLessons.map((lesson) => (
                  <Link
                    key={lesson.slug}
                    href={`/Theory/${encodeURIComponent(lesson.slug)}`}
                    className="block bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition"
                  >
                    <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
                    <p className="text-sm text-blue-600">Открыть урок</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  let modules: Module[] = [];
  let lessons: Record<string, Lesson[]> = {};

  try {
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    const indexData: IndexData = JSON.parse(data);

    // Поддержка нового формата с модулями
    if (indexData.modules) {
      modules = indexData.modules;
      lessons = indexData.lessons;
    } else {
      // Обратная совместимость со старым форматом (плоский массив)
      const oldLessons = indexData as unknown as Lesson[];
      modules = [{ name: 'Уроки', slug: 'default', lessonsCount: oldLessons.length }];
      lessons = { default: oldLessons };
    }
  } catch (e) {
    console.error('Error reading index.json:', (e as Error).message);
  }

  return {
    props: {
      modules,
      lessons,
    },
  };
};

export default Home;

