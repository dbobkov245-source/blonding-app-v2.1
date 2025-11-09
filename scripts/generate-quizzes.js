import fs from 'fs';
import path from 'path';
import { callHF } from '../src/lib/ai.js';

const lessonsDir = './public/lessons';
const quizzesDir = './public/content/quizzes';
const isForce = process.argv.includes('--force');
const maxRetries = 3;

if (!fs.existsSync(quizzesDir)) fs.mkdirSync(quizzesDir, { recursive: true });

function cleanMarkdown(text) {
  return text.replace(/---[\s\S]*?---/, '').trim();
}

function createQuizPrompt(lessonTitle, lessonContent) {
  return `Ты - эксперт по созданию образовательных тестов. Создай тест из 4-6 вопросов на основе урока.
УРОК: "${lessonTitle}"
СОДЕРЖАНИЕ: ${lessonContent.substring(0, 4000)}
ТРЕБОВАНИЯ: 4 варианта ответа, 1 правильный, подробное объяснение, проверка практических знаний.
ФОРМАТ: Строго JSON массив без markdown.
[
  {
    "question": "Текст?",
    "options": ["В1","В2","В3","В4"],
    "correctAnswer": "В1",
    "explanation": "Почему..."
  }
]`;
}

function parseAIResponse(response) {
  try {
    let cleaned = response.trim().replace(/```(json)?\n?/g, '').replace(/```/g, '');
    if (!cleaned.startsWith('[')) cleaned = `[${cleaned}`;
    if (!cleaned.endsWith(']')) cleaned = `${cleaned}]`;
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error('Ответ не массив');
    parsed.forEach((q, i) => {
      if (!q.question?.trim()) throw new Error(`Вопрос ${i+1} пустой`);
      if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error(`Неверные опции в вопросе ${i+1}`);
      if (!q.options.includes(q.correctAnswer)) throw new Error(`Правильный ответ не найден в вопросе ${i+1}`);
      if (!q.explanation?.trim()) throw new Error(`Объяснение отсутствует в вопросе ${i+1}`);
    });
    return parsed;
  } catch (e) {
    console.error('Ошибка парсинга ответа AI:', e.message);
    console.error('Сырой ответ (первые 500 символов):', response.substring(0, 500));
    throw e;
  }
}

async function generateQuizForLesson(lessonSlug, lessonData) {
  console.log(`\n📝 Генерация теста: ${lessonSlug}${isForce ? ' (принудительно)' : ''}`);
  const { title, content } = lessonData;
  const quizPath = path.join(quizzesDir, `${lessonSlug}-quiz.json`);

  if (fs.existsSync(quizPath) && !isForce) {
    console.log(` ⏭️ Тест уже существует, пропуск...`);
    return { slug: lessonSlug, exists: true };
  }

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN не найден в переменных окружения');
  }

  const prompt = createQuizPrompt(title, content);
  
  // ✅ ЛОГИРОВАНИЕ КОНТЕНТА
  console.log(`📄 Контент урока (первые 300 символов): "${content.substring(0, 300)}..."`);
  
  let attempts = 0;
  let quiz;
  
  while (attempts < maxRetries) {
    attempts++;
    console.log(` 🤖 Запрос к AI (попытка ${attempts})...`);
    try {
      const response = await callHF(prompt, {
        hfToken: HF_TOKEN,
        maxTokens: 2048,
        temperature: 0.9, // ✅ ПОВЫШЕННАЯ КРЕАТИВНОСТЬ
        enableCache: false // ✅ ОТКЛЮЧЕН КЭШ
      });
      console.log(` 📦 Парсинг ответа...`);
      quiz = parseAIResponse(response);
      break;
    } catch (e) {
      if (attempts === maxRetries) throw e;
      console.warn(` ⚠️ Повтор после ошибки: ${e.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  fs.writeFileSync(quizPath, JSON.stringify(quiz, null, 2), 'utf-8');
  console.log(` ✅ Сохранено: ${quiz.length} вопросов`);
  return {
    slug: lessonSlug,
    title,
    questionsCount: quiz.length,
    path: quizPath
  };
}

function readLesson(lessonSlug) {
  try {
    const mdPath = path.join(lessonsDir, lessonSlug, `${lessonSlug}.md`);
    if (!fs.existsSync(mdPath)) {
      console.warn(` ⚠️ Файл урока не найден: ${mdPath}`);
      return null;
    }
    const rawContent = fs.readFileSync(mdPath, 'utf-8');
    const content = cleanMarkdown(rawContent);
    const titleMatch = rawContent.match(/title:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : lessonSlug;
    return { title, content };
  } catch (e) {
    console.error(` ❌ Ошибка чтения урока: ${e.message}`);
    return null;
  }
}

async function generateAllQuizzes() {
  console.log('\n🎓 Начало генерации тестов...\n');
  
  const indexPath = path.join(lessonsDir, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Индекс уроков не найден. Сначала запустите generate-lessons!');
    process.exit(1);
  }
  
  const lessons = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  console.log(`📚 Найдено ${lessons.length} уроков\n`);
  
  if (lessons.length === 0) {
    console.log('ℹ️ Нет уроков для обработки');
    return;
  }

  const results = [];
  for (const lesson of lessons) {
    const lessonData = readLesson(lesson.slug);
    if (!lessonData) {
      console.log(`⏭️ Пропуск ${lesson.slug} — не удалось прочитать урок`);
      continue;
    }
    const result = await generateQuizForLesson(lesson.slug, lessonData);
    if (result) {
      results.push(result);
    }
    if (lessons.indexOf(lesson) < lessons.length - 1) {
      console.log(' ⏳ Ожидание 2с перед следующим запросом...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const quizIndex = results.map(r => ({
    slug: r.slug,
    title: r.title,
    questionsCount: r.questionsCount,
    quizPath: `/content/quizzes/${r.slug}-quiz.json`
  }));
  
  const indexOutputPath = path.join(quizzesDir, 'index.json');
  fs.writeFileSync(indexOutputPath, JSON.stringify(quizIndex, null, 2), 'utf-8');
  
  console.log(`\n📋 Индекс тестов обновлен: ${indexOutputPath}`);
  console.log(`\n✅ Генерация завершена!`);
  console.log(` Всего уроков: ${lessons.length}`);
  console.log(` Тестов создано: ${results.filter(r => !r.exists).length}`);
  console.log(` Уже существовало: ${results.filter(r => r.exists).length}`);
  console.log(` Не удалось: ${lessons.length - results.length}\n`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  generateAllQuizzes().catch(e => {
    console.error('\n❌ Генерация тестов не удалась:', e);
    process.exit(1);
  });
}

export { generateQuizForLesson, generateAllQuizzes };
