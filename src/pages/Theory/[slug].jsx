import React from 'react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import fs from 'fs' // Node.js
import path from 'path' // Node.js

// --- Вспомогательная функция (остается как была) ---
function cleanMarkdown(rawText) {
  return rawText.replace(/---[\s\S]*?---/, '');
}

// --- 1. Компонент страницы ---
// Он теперь получает 'lessonContent' и 'allLessons' как пропсы
export default function TheoryPage({ lessonContent, allLessons }){
  
  // 2. Убрали useEffect, useState, useRouter. Вся информация уже есть.

  return (
    <div>
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='w-full md:w-1/3'>
          {/* 3. Боковая панель теперь использует 'allLessons' */}
          <ul className='space-y-2'>
            {allLessons.map(l=>(
              <li key={l.slug}>
                {/* 4. Ссылки обновлены на новый формат */}
                <Link 
                  href={`/Theory/${encodeURIComponent(l.slug)}`} 
                  className='block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition'
                >
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 5. Контент урока теперь использует 'lessonContent' */}
        <div className='flex-1 bg-white p-6 rounded-lg shadow-sm'>
          <article className="prose">
            <ReactMarkdown>{cleanMarkdown(lessonContent)}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  )
}


// --- 6. Функция getStaticPaths (Говорит Next.js, какие уроки существуют) ---
export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
  let lessons = [];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    lessons = JSON.parse(fileContent);
  } catch (error) {
    console.error("Ошибка в getStaticPaths:", error.message);
  }

  // Создаем массив путей, которые Next.js должен сгенерировать
  const paths = lessons.map(lesson => ({
    params: { slug: lesson.slug },
  }));

  // fallback: false означает, что если урока нет - будет 404
  return { paths, fallback: false };
}


// --- 7. Функция getStaticProps (Загружает контент ДЛЯ КАЖДОГО урока) ---
export async function getStaticProps(context) {
  // Получаем slug из URL (например, "Урок 1. ...")
  const { slug } = context.params;

  // --- Загружаем контент .md файла ---
  const mdFilePath = path.join(process.cwd(), 'public', 'lessons', slug, `${slug}.md`);
  let lessonContent = '';
  try {
    lessonContent = fs.readFileSync(mdFilePath, 'utf-8');
  } catch (error) {
    console.error(`Ошибка чтения .md урока ${slug}:`, error.message);
  }

  // --- Загружаем ВЕСЬ список уроков (для боковой панели) ---
  const indexFilePath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
  let allLessons = [];
  try {
    const indexContent = fs.readFileSync(indexFilePath, 'utf-8');
    allLessons = JSON.parse(indexContent);
  } catch (error) {
    //
  }

  // Передаем все данные в компонент TheoryPage
  return {
    props: {
      lessonContent: lessonContent,
      allLessons: allLessons
    }
  };
}
