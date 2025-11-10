import fs from 'fs';
import path from 'path';

const lessonsDir = './public/lessons';
const quizzesDir = './public/content/quizzes';
const isForce = process.argv.includes('--force');
const maxRetries = 5; // Увеличено до 5
const HF_MODEL = process.env.HF_MODEL_QUIZ || 'mistralai/Mixtral-8x22B-Instruct-v0.1';

if (!fs.existsSync(quizzesDir)) fs.mkdirSync(quizzesDir, { recursive: true });

// ✅ Очистка markdown
function cleanMarkdown(text) {
  return text.replace(/---[\s\S]*?---/, '').trim();
}

// ✅ Семантическое разбиение урока
function splitIntoSemanticChunks(markdown, maxTokens = 12000) {
  // Разбиваем по заголовкам второго уровня (##) и третьему (###)
  const sections = markdown.split(/^(?:##|###)\s+/m).filter(Boolean);
  
  const chunks = [];
  let currentChunk = { title: 'Введение', content: '', tokenEstimate: 0 };
  
  for (const section of sections) {
    const lines = section.split('\n');
    const title = lines[0]?.trim() || 'Раздел';
    const content = lines.slice(1).join('\n').trim();
    
    const tokenEstimate = (content.split(/\s+/).length * 1.5);
    
    // Если блок слишком большой или превышает лимит токенов
    if (tokenEstimate > maxTokens || currentChunk.tokenEstimate + tokenEstimate > maxTokens) {
      if (currentChunk.content) chunks.push(currentChunk);
      currentChunk = { title, content, tokenEstimate };
    } else {
      currentChunk.content += `\n\n## ${title}\n${content}`;
      currentChunk.tokenEstimate += tokenEstimate;
    }
  }
  
  if (currentChunk.content) chunks.push(currentChunk);
  
  // Фильтруем слишком короткие блоки
  return chunks.filter(chunk => chunk.content.length > 200);
}

// ✅ JSON Schema для валидации
const JSON_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      question: { type: "string", minLength: 10 },
      options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
      correctAnswer: { type: "string", minLength: 1 },
      explanation: { type: "string", minLength: 30 }
    },
    required: ["question", "options", "correctAnswer", "explanation"]
  },
  minItems: 1,
  maxItems: 3 // До 3 вопросов на чанк
};

// ✅ Улучшенный системный промпт с цитированием
const JSON_GENERATION_SYSTEM_PROMPT = `Ты — профессиональная система генерации тестов для колористов. 
Твоя задача — создавать вопросы, строго основанные на предоставленном тексте урока.

СТРОГИЕ ТРЕБОВАНИЯ:
1. ВСЕ вопросы должны проверять КОНКРЕТНЫЕ факты из текста: цифры, проценты, названия техник, последовательности действий
2. Для каждого вопроса в поле "explanation" ОБЯЗАТЕЛЬНО укажи точную цитату (5-15 слов) из текста, подтверждающую ответ
3. Варианты ответов должны быть правдоподобными, но только один — правильный
4. Вопросы должны быть на русском языке, профессиональными, без воды
5. Верни ТОЛЬКО валидный JSON-массив без лишних комментариев

ФОРМАТ:
[{"question":"...","options":["a","b","c","d"],"correctAnswer":"a","explanation":"Цитата: ..."}]`;

// ✅ Создание промпта для пользователя
function createQuizUserPrompt(title, chunk) {
  return `НАЗВАНИЕ УРОКА: "${title}"
БЛОК: "${chunk.title}"

СОДЕРЖАНИЕ:
${chunk.content.substring(0, 15000)}

---
ЗАДАНИЕ: Создай до 3 вопросов с 4 вариантами ответов, строго по содержанию этого блока. Каждый вопрос должен проверять конкретный факт. В explanation ОБЯЗАТЕЛЬНО укажи цитату из текста. ВЕРНИ ТОЛЬКО JSON.`;
}

// ✅ Прямой вызов HF API с JSON Mode и Function Calling
async function callHFDirect(systemPrompt, userPrompt, hfToken) {
  const url = "https://router.huggingface.co/v1/chat/completions";
  
  const body = {
    model: HF_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 4096,
    temperature: 0.25, // Низкая температура для стабильности
    top_p: 0.95,
    // ✅ JSON Mode
    response_format: { type: "json_object" },
    // ✅ Function Calling (для Mixtral)
    tools: [{
      type: "function",
      function: {
        name: "generate_quiz",
        description: "Generate quiz questions from lesson chunk",
        parameters: JSON_SCHEMA
      }
    }],
    tool_choice: { type: "function", function: { name: "generate_quiz" } }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${hfToken}`, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(body),
    timeout: 60000 // Увеличенный таймаут для большой модели
  });
  
  if (!res.ok) throw new Error(await res.text());
  
  const data = await res.json();
  
  // ✅ Извлекаем JSON из function calling или content
  let raw = data.choices?.[0]?.message?.content || "";
  
  if (data.choices?.[0]?.message?.tool_calls?.length > 0) {
    const toolCall = data.choices[0].message.tool_calls[0];
    raw = toolCall.function.arguments;
  }
  
  return raw;
}

// ✅ Валидация вопроса
function validateQuestion(q, chunkContent) {
  const required = ['question', 'options', 'correctAnswer', 'explanation'];
  for (const field of required) {
    if (!q[field]) throw new Error(`Отсутствует поле: ${field}`);
  }
  
  if (typeof q.question !== 'string' || q.question.length < 10) {
    throw new Error('Вопрос слишком короткий');
  }
  
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    throw new Error('Неверное количество опций (должно быть 4)');
  }
  
  if (!q.options.includes(q.correctAnswer)) {
    throw new Error('correctAnswer не найден в options');
  }
  
  if (q.explanation.length < 30) {
    throw new Error('explanation слишком короткое (< 30 символов)');
  }
  
  // ✅ Проверка цитаты: объяснение должно содержать "Цитата:"
  if (!q.explanation.includes('Цитата:')) {
    throw new Error('explanation не содержит цитату (должно начинаться с "Цитата:")');
  }
  
  // ✅ Проверка, что цитата действительно из текста
  const citation = q.explanation.replace('Цитата:', '').trim().toLowerCase();
  const contentLower = chunkContent.toLowerCase();
  
  if (citation.length > 10 && !contentLower.includes(citation)) {
    console.warn(` ⚠️ Цитата не найдена в тексте: "${citation}"`);
    // Не прерываем, но предупреждаем
  }
}

// ✅ Генерация теста с семантическим чанкингом и повторными попытками
async function generateQuizForLesson(lessonSlug, lessonData) {
  console.log(`\n📝 Генерация теста: ${lessonSlug}${isForce ? ' (принудительно)' : ''}`);
  
  const quizPath = path.join(quizzesDir, `${lessonSlug}-quiz.json`);
  if (fs.existsSync(quizPath) && !isForce) {
    console.log(` ⏭️ Тест уже существует, пропуск...`);
    return { slug: lessonSlug, exists: true };
  }

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) throw new Error('HF_TOKEN не установлен');

  // ✅ Разбиваем урок на семантические чанки
  const chunks = splitIntoSemanticChunks(lessonData.content);
  console.log(` 📄 Урок разбит на ${chunks.length} семантических блоков`);

  const allQuestions = [];
  
  // ✅ Генерируем вопросы для каждого чанка
  for (let i = 0; i < chunks.length && allQuestions.length < 5; i++) {
    const chunk = chunks[i];
    console.log(` 🤖 Генерация вопросов для блока ${i+1}: "${chunk.title}"`);
    
    const userPrompt = createQuizUserPrompt(lessonData.title, chunk);
    
    let attempts = 0;
    let quizData = null;
    
    // ✅ Экспоненциальные повторные попытки
    while (attempts < maxRetries) {
      attempts++;
      try {
        const rawResponse = await callHFDirect(JSON_GENERATION_SYSTEM_PROMPT, userPrompt, HF_TOKEN);
        
        // ✅ Парсим JSON
        let parsed = JSON.parse(rawResponse);
        
        // ✅ Если модель вернула объект с массивом, извлекаем
        if (parsed.questions && Array.isArray(parsed.questions)) {
          parsed = parsed.questions;
        } else if (!Array.isArray(parsed)) {
          parsed = Object.values(parsed).find(Array.isArray) || [];
        }
        
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Пустой или невалидный массив вопросов');
        }
        
        // ✅ Валидируем каждый вопрос
        for (const q of parsed) {
          validateQuestion(q, chunk.content);
        }
        
        allQuestions.push(...parsed);
        console.log(` ✅ Сгенерировано ${parsed.length} вопросов`);
        break;
        
      } catch (err) {
        console.warn(` ❌ Попытка ${attempts}/${maxRetries} не удалась: ${err.message}`);
        
        if (attempts === maxRetries) {
          console.error(` ❌ Все попытки исчерпаны для блока "${chunk.title}"`);
          break;
        }
        
        // ✅ Экспоненциальная задержка (3, 6, 9, 12, 15 сек)
        await new Promise(r => setTimeout(r, 3000 * attempts));
      }
    }
    
    // ✅ Пауза между чанками (rate limiting)
    if (i < chunks.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // ✅ Берем первые 5 вопросов
  const finalQuestions = allQuestions.slice(0, 5);
  
  if (finalQuestions.length === 0) {
    throw new Error('Не удалось сгенерировать ни одного валидного вопроса из всех блоков');
  }

  // ✅ Сохраняем
  fs.writeFileSync(quizPath, JSON.stringify(finalQuestions, null, 2), 'utf-8');
  console.log(` ✅ Сохранено: ${finalQuestions.length} вопросов`);

  return { 
    slug: lessonSlug, 
    title: lessonData.title, 
    questionsCount: finalQuestions.length, 
    path: quizPath 
  };
}

// ✅ Глобальная функция для CLI
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
  }

  // ✅ Обновляем индекс тестов
  const quizIndex = results.map(r => ({ 
    slug: r.slug, 
    title: r.title, 
    questionsCount: r.questionsCount, 
    quizPath: `/content/quizzes/${r.slug}-quiz.json` 
  }));
  
  fs.writeFileSync(
    path.join(quizzesDir, 'index.json'), 
    JSON.stringify(quizIndex, null, 2), 
    'utf-8'
  );
  
  console.log(`\n📋 Индекс тестов обновлен. Создано: ${results.length} тестов`);
}

// ✅ Чтение урока
function readLesson(lessonSlug) {
  try {
    const mdPath = path.join(lessonsDir, lessonSlug, `${lessonSlug}.md`);
    if (!fs.existsSync(mdPath)) return null;
    
    const raw = fs.readFileSync(mdPath, 'utf-8');
    const content = cleanMarkdown(raw);
    const titleMatch = raw.match(/title:\s*"([^"]+)"/);
    
    return { 
      title: titleMatch ? titleMatch[1] : lessonSlug, 
      content 
    };
  } catch (e) {
    console.error(` ❌ Ошибка чтения урока ${lessonSlug}: ${e.message}`);
    return null;
  }
}

// ✅ CLI execution
if (process.argv[1] === new URL(import.meta.url).pathname) {
  generateAllQuizzes().catch(e => {
    console.error('\n❌ Генерация не удалась:', e);
    process.exit(1);
  });
}
