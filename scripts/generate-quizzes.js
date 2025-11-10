import fs from 'fs';
import path from 'path';

const lessonsDir   = './public/lessons';
const quizzesDir   = './public/content/quizzes';
const isForce      = process.argv.includes('--force');
const maxRetries   = 3;

if (!fs.existsSync(quizzesDir)) fs.mkdirSync(quizzesDir, { recursive: true });

function cleanMarkdown(text) {
  return text.replace(/---[\s\S]*?---/, '').trim();
}

// ✅ 1. Технический промпт (никакого «разговорчивого»)
const JSON_GENERATION_SYSTEM_PROMPT = `Ты — ETL-инструмент. Верни только валидный JSON-массив объектов строго формата:
[{"question":"...","options":["...", "..."],"correctAnswer":"...","explanation":"..."}]`;

// ✅ 2. Отправляем ПОЛНЫЙ текст урока (никакого substring(0, 1500))
function createQuizUserPrompt(title, content) {
  return `
НАЗВАНИЕ УРОКА: "${title}"
ПОЛНЫЙ ТЕКСТ УРОКА:
${content}
---
ЗАДАНИЕ: Создай 5 вопросов с 4 вариантами ответов, строго по содержанию урока. Вопросы должны проверять: цифры, технику, % окислителя, зонирование, последовательность нанесения. ВЕРНИ JSON-МАССИВ без слов «вот», «json» и прочего.`;
}

// ✅ 3. Прямой вызов Gemma-2-27b-it + JSON-режим
async function callHFDirect(systemPrompt, userPrompt, hfToken) {
  const url = "https://router.huggingface.co/v1/chat/completions";
  const body = {
    model: "google/gemma-2-27b-it",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt }
    ],
    max_tokens: 4096,
    temperature: 0.25,
    response_format: { type: "json_object" }
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : Object.values(parsed).find(Array.isArray) || [];
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
  if (!HF_TOKEN) throw new Error('HF_TOKEN не установлен');
  const userPrompt = createQuizUserPrompt(title, content);
  let attempts = 0, quizData;
  while (attempts < maxRetries) {
    attempts++;
    console.log(` 🤖 Запрос к Gemma 2 (попытка ${attempts})...`);
    try {
      quizData = await callHFDirect(JSON_GENERATION_SYSTEM_PROMPT, userPrompt, HF_TOKEN);
      if (!Array.isArray(quizData) || !quizData.length) throw new Error('Пустой массив');
      break;
    } catch (e) {
      console.error(` ❌ ${e.message}`);
      if (attempts === maxRetries) throw e;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  fs.writeFileSync(quizPath, JSON.stringify(quizData, null, 2), 'utf-8');
  console.log(` ✅ Сохранено: ${quizData.length} вопросов`);
  return { slug: lessonSlug, title, questionsCount: quizData.length, path: quizPath };
}

function readLesson(lessonSlug) {
  try {
    const mdPath = path.join(lessonsDir, lessonSlug, `${lessonSlug}.md`);
    if (!fs.existsSync(mdPath)) return null;
    const raw = fs.readFileSync(mdPath, 'utf-8');
    const content = cleanMarkdown(raw);
    const titleMatch = raw.match(/title:\s*"([^"]+)"/);
    return { title: titleMatch ? titleMatch[1] : lessonSlug, content };
  } catch (e) {
    console.error(` ❌ Ошибка чтения урока: ${e.message}`);
    return null;
  }
}

export async function generateAllQuizzes() {
  console.log('\n🎓 Начало генерации тестов...\n');
  const indexPath = path.join(lessonsDir, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Индекс уроков не найден');
    process.exit(1);
  }
  const lessons = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const results = [];
  for (const lesson of lessons) {
    const data = readLesson(lesson.slug);
    if (!data) continue;
    const res = await generateQuizForLesson(lesson.slug, data);
    if (res) results.push(res);
    if (lessons.indexOf(lesson) < lessons.length - 1) await new Promise(r => setTimeout(r, 2000));
  }
  const quizIndex = results.map(r => ({ slug: r.slug, title: r.title, questionsCount: r.questionsCount, quizPath: `/content/quizzes/${r.slug}-quiz.json` }));
  fs.writeFileSync(path.join(quizzesDir, 'index.json'), JSON.stringify(quizIndex, null, 2), 'utf-8');
  console.log(`\n📋 Индекс тестов обновлен. Создано: ${results.length}`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  generateAllQuizzes().catch(e => {
    console.error('\n❌ Генерация не удалась:', e);
    process.exit(1);
  });
}
