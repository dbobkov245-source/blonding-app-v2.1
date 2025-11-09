import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { GetStaticProps } from 'next';

interface Lesson {
  slug: string;
  title: string;
}

interface HomeProps {
  lessons: Lesson[];
}

const Home = ({ lessons }: HomeProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {lessons.length ? (
        lessons.map((l) => (
          <Link
            key={l.slug}
            href={`/Theory/${encodeURIComponent(l.slug)}`}
            className="block bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold mb-2">{l.title}</h3>
            <p className="text-sm text-blue-600">Открыть урок</p>
          </Link>
        ))
      ) : (
        <div className="p-6 bg-white rounded shadow col-span-3">
          Уроки не найдены. Загрузите .docx в 'lessons/source/'
        </div>
      )}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  let lessons: Lesson[] = [];
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    lessons = JSON.parse(data);
  } catch (e) {
    console.error('Error reading index.json:', (e as Error).message);
  }

  return {
    props: {
      lessons,
    },
  };
};

export default Home;
