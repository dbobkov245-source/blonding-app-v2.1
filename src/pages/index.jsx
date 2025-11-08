import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface Lesson {
  slug: string;
  title: string;
}

interface HomeProps {
  lessons: Lesson[];
}

export default function Home({ lessons }: HomeProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      {lessons.length ? (
        lessons.map(l => (
          <Link
            key={l.slug}
            href={`/Theory/${encodeURIComponent(l.slug)}`}
            className='block bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition'
          >
            <h3 className='text-lg font-semibold mb-2'>{l.title}</h3>
            <p className='text-sm text-blue-600'>Открыть урок</p>
          </Link>
        ))
      ) : (
        <div className='p-6 bg-white rounded shadow col-span-3'>
          Уроки не найдены. Загрузите .docx файл в 'lessons/source/'
        </div>
      )}
    </div>
  );
}

export async function getStaticProps() {
  let lessons: Lesson[] = [];
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    lessons = JSON.parse(data);
  } catch (e) {
    console.error("Не удалось прочитать index.json:", e.message);
  }

  return {
    props: {
      lessons,
    },
  };
}
