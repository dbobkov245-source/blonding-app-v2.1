/**
 * Автоматический генератор тестов из уроков с использованием AI
 * Читает уроки из public/lessons/ и создает тесты в public/content/quizzes/
 */

const fs = require('fs');
const path = require('path');
const { callHF } = require('../src/lib/ai.js');

const lessonsDir = './public/lessons';
const quizzesDir = './public/content/quizzes';

// Создаём директории если не существуют
if (!fs.existsSync(quizzesDir)) {
  fs.mkdirSync(quizzesDir, { recursive: true });
}

/**
 * Очистка Markdown от frontmatter
 */
function cleanMarkdown(text) {
  return text.replace(/---[\s\S]*?---/, '').trim();
}

/**
 * Промпт для генерации тестов
 */
function createQuizPrompt(lessonTitle, lessonContent) {
  return `Ты - эксперт по созданию образовательных тестов. На основе следующего урока по блондированию волос создай тест из 4-6 вопросов.

УРОК: "${lessonTitle}"

СОДЕРЖАНИЕ:
${lessonContent.substring(0, 4000)}

ТРЕБОВАНИЯ К ТЕСТУ:
1. Создай 4-6 вопросов на понимание материала урока
2. Каждый вопрос должен иметь 4 варианта ответа
3. Только один правильный ответ
4. Добавь подробное объяснение к каждому вопросу
5. Вопросы должны проверять практические знания, а не заучивание

ФОРМАТ ОТВЕТА (СТРОГО JSON, БЕЗ КОММЕНТАРИЕВ И MARKDOWN):
[
  {
    "question": "Текст вопроса?",
    "options": [
      "Вариант 1",
      "Вариант 2",
      "Вариант 3",
      "Вариант 4"
    ],
    "correctAnswer": "Правильный вариант (точная копия из options)",
    "explanation": "Подробное объяснение почему этот ответ правильный"
  }
]

ВАЖНО: Верни ТОЛЬКО валидный JSON массив, без текста до или после. Не используй markdown форматирование.`;
}

/**
 * Парсинг JSON из ответа AI (с очисткой от markdown)
 */
function parseAIResponse(response) {
  try {
    // Убираем markdown блоки если есть
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    cleaned = cleaned.trim();
    
    // Парсим JSON
    const parsed = JSON.parse(cleaned);
    
    // Валидация структуры
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    
    // Проверяем каждый вопрос
    parsed.forEach((q, i) => {
      if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
        throw new Error(`Question ${i + 1} is missing required fields`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${i + 1} must have exactly 4 options`);
      }
      if (!q.options.includes(q.correctAnswer)) {
        throw new Error(`Question ${i + 1}: correctAnswer not found in options`);
      }
    });
    
    return parsed;
  } catch (e) {
    console.error('Failed to parse AI response:', e.message);
    console.error('Raw response:', response.substring(0, 500));
    throw e;
  }
}

/**
 * Генерация теста для одного урока
 */
async function generateQuizForLesson(lessonSlug, lessonData) {
  console.log(`\n📝 Generating quiz for: ${lessonSlug}`);
  
  const { title, content } = lessonData;
  const quizPath = path.join(quizzesDir, `${lessonSlug}-quiz.json`);
  
  // Проверяем, существует ли уже тест
  if (fs.existsSync(quizPath)) {
    console.log(`   ⏭️  Quiz already exists, skipping...`);
    return { slug: lessonSlug, exists: true };
  }
  
  try {
    // Получаем токен из переменных окружения
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      console.error('   ❌ HF_TOKEN not found in environment variables');
      return null;
    }
    
    const prompt = createQuizPrompt(title, content);
    
    console.log(`   🤖 Calling AI...`);
    const response = await callHF(prompt, {
      hfToken: HF_TOKEN,
      maxTokens: 2048,
      temperature: 0.7
    });
    
    console.log(`   📦 Parsing response...`);
    const quiz = parseAIResponse(response);
    
    // Сохраняем тест
    fs.writeFileSync(quizPath, JSON.stringify(quiz, null, 2), 'utf-8');
    console.log(`   ✅ Saved: ${quiz.length} questions`);
    
    return { 
      slug: lessonSlug, 
      title,
      questionsCount: quiz.length,
      path: quizPath
    };
  } catch (e) {
    console.error(`   ❌ Failed: ${e.message}`);
    return null;
  }
}

/**
 * Чтение урока из файловой системы
 */
function readLesson(lessonSlug) {
  try {
    const mdPath = path.join(lessonsDir, lessonSlug, `${lessonSlug}.md`);
    
    if (!fs.existsSync(mdPath)) {
      console.warn(`   ⚠️  Lesson file not found: ${mdPath}`);
      return null;
    }
    
    const rawContent = fs.readFileSync(mdPath, 'utf-8');
    const content = cleanMarkdown(rawContent);
    
    // Извлекаем title из frontmatter или используем slug
    const titleMatch = rawContent.match(/title:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : lessonSlug;
    
    return { title, content };
  } catch (e) {
    console.error(`   ❌ Error reading lesson: ${e.message}`);
    return null;
  }
}

/**
 * Главная функция генерации всех тестов
 */
async function generateAllQuizzes() {
  console.log('\n🎓 Starting quiz generation...\n');
  
  // Читаем index.json со списком уроков
  const indexPath = path.join(lessonsDir, 'index.json');
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Lessons index not found. Run generate-lessons first!');
    process.exit(1);
  }
  
  const lessons = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  console.log(`📚 Found ${lessons.length} lesson(s)\n`);
  
  if (lessons.length === 0) {
    console.log('ℹ️  No lessons to process');
    return;
  }
  
  const results = [];
  
  // Генерируем тесты последовательно (чтобы не перегрузить API)
  for (const lesson of lessons) {
    const lessonData = readLesson(lesson.slug);
    
    if (!lessonData) {
      console.log(`⏭️  Skipping ${lesson.slug} - could not read lesson`);
      continue;
    }
    
    const result = await generateQuizForLesson(lesson.slug, lessonData);
    
    if (result) {
      results.push(result);
    }
    
    // Небольшая задержка между запросами к API
    if (lessons.indexOf(lesson) < lessons.length - 1) {
      console.log('   ⏳ Waiting 2s before next request...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Создаём индексный файл всех тестов
  const quizIndex = results.map(r => ({
    slug: r.slug,
    title: r.title,
    questionsCount: r.questionsCount,
    quizPath: `/content/quizzes/${r.slug}-quiz.json`
  }));
  
  const indexOutputPath = path.join(quizzesDir, 'index.json');
  fs.writeFileSync(indexOutputPath, JSON.stringify(quizIndex, null, 2), 'utf-8');
  
  console.log(`\n📋 Quiz index updated: ${indexOutputPath}`);
  console.log(`\n✅ Generation complete!`);
  console.log(`   Total lessons: ${lessons.length}`);
  console.log(`   Quizzes created: ${results.filter(r => !r.exists).length}`);
  console.log(`   Already existed: ${results.filter(r => r.exists).length}`);
  console.log(`   Failed: ${lessons.length - results.length}\n`);
}

// Запуск
if (require.main === module) {
  generateAllQuizzes().catch(e => {
    console.error('\n❌ Quiz generation failed:', e);
    process.exit(1);
  });
}

module.exports = { generateQuizForLesson, generateAllQuizzes };
