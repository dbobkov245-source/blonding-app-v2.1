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
  // Берем только первые 1500 символов, чтобы не перегрузить модель
  const shortContent = lessonContent.substring(0, 1500);
  
  return `Ты — эксперт по обучению колористов. Создай тест из 4 вопросов СТРОГО на основе этого урока.
Вопросы должны проверять конкретные знания из предоставленного материала.

НАЗВАНИЕ УРОКА: "${lessonTitle}"

ТЕКСТ УРОКА:
${shortContent}

ВАЖНО: Вопросы должны быть про зоны осветления, проценты окислителя, техники блондирования — и ТОЛЬКО из этого текста.

ВЕРНИ ТОЛЬКО JSON:
[
  {
    "question": "Вопрос?",
    "options": ["Ответ 1","Ответ 2","Ответ 3","Ответ 4"],
    "correctAnswer": "Ответ 1",
    "explanation": "Объяснение..."
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
    console.error('❌ Ошибка парсинга ответа AI:', e.message);
    console.error('📄 Сырой ответ (первые 500 символов):', response.substring(0, 500));
    throw e;
  }
}

async function generateQuizForLesson(lessonSlug, lessonData) {
  console.log(`\n📝 Генерация теста: ${lessonSlug}${isForce ? ' (принудительно)' : ''}`);
  const { title, content } = lessonData;
  
  // 🔍 ДЕБАГ: Проверка контента
  console.log(`📌 Тема урока: "${title}"`);
  console.log(`📄 Первые 500 символов контента:`);
  console.log(content.substring(0, 500) + '...');

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
  
  // 🔍 ДЕБАГ: Вывод промпта
  console.log(`🤖 Промпт для AI (первые 500 символов):`);
  console.log(prompt.substring(0, 500) + '...');

  let attempts = 0;
  let quiz;
  
  while (attempts < maxRetries) {
    attempts++;
    console.log(` 🤖 Запрос к AI (попытка ${attempts})...`);
    try {
      // ✅ Модель будет взята из src/lib/ai.js по умолчанию (Qwen)
      const response = await callHF(prompt, {
        hfToken: HF_TOKEN,
        maxTokens: 2048,
        temperature: 0.9,
        enableCache: false
      });
      console.log(` 📦 Получен ответ от AI, парсинг...`);
      quiz = parseAIResponse(response);
      
      // ✅ ПРОВЕРКА: Если вопросы про "мочить волосы" — это Урок 1, перегенерируем
      const hasWrongQuestions = quiz.some(q => 
        q.question.includes('мочить') || 
        q.question.includes('Пантенол') ||
        q.question.includes('пряди')
      );
      
      if (hasWrongQuestions && attempts < maxRetries) {
        console.warn(`⚠️ Обнаружены вопросы из другого урока, повтор...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      
      break;
    } catch (e) {
      if (attempts === maxRetries) throw e;
      console.warn(` ⚠️ Ошибка: ${e.message}, повтор через 5с...`);
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
