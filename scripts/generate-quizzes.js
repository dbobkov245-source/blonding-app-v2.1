import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lessonsDir = path.join(process.cwd(), 'public/lessons');
const quizzesDir = path.join(process.cwd(), 'public/content/quizzes');
const isForce = process.argv.includes('--force');
const maxRetries = 5;

const HF_MODEL = process.env.HF_MODEL_QUIZ || 'mistralai/Mixtral-8x22B-Instruct-v0.1';

if (!fs.existsSync(quizzesDir)) {
  fs.mkdirSync(quizzesDir, { recursive: true });
}

function cleanMarkdown(text) {
  return text.replace(/---[\s\S]*?---/, '').trim();
}

function splitIntoSemanticChunks(markdown, maxTokens = 12000) {
  const sections = markdown.split(/^(?:##|###)\s+/m).filter(Boolean);
  const chunks = [];
  let currentChunk = { title: 'Введение', content: '', tokenEstimate: 0 };
  
  for (const section of sections) {
    const lines = section.split('\n');
    const title = lines[0]?.trim() || 'Раздел';
    const content = lines.slice(1).join('\n').trim();
    const tokenEstimate = (content.split(/\s+/).length * 1.5);
    
    if (tokenEstimate > maxTokens || currentChunk.tokenEstimate + tokenEstimate > maxTokens) {
      if (currentChunk.content) chunks.push(currentChunk);
      currentChunk = { title, content, tokenEstimate };
    } else {
      currentChunk.content += `\n\n## ${title}\n${content}`;
      currentChunk.tokenEstimate += tokenEstimate;
    }
  }
  
  if (currentChunk.content) chunks.push(currentChunk);
  return chunks.filter(chunk => chunk.content.length > 200);
}

const SYSTEM_PROMPT = `Ты — профессиональная система генерации тестов для колористов. 
Создавай вопросы строго по предоставленному тексту.

ТРЕБОВАНИЯ:
1. Вопросы проверяют конкретные факты: цифры, проценты, техники, последовательности
2. В explanation ДОБАВЬ Цитата: [точная копия 5-15 слов из текста]
3. Один правильный ответ из 4-х вариантов
4. Всё на русском языке
5. Верни ТОЛЬКО JSON, без текста`;

function createPrompt(title, chunk) {
  return `УРОК: "${title}"
БЛОК: "${chunk.title}"

ТЕКСТ:
${chunk.content.substring(0, 15000)}

СОЗДАЙ 2-3 ВОПРОСА. Каждый explanation ДОЛЖЕН содержать "Цитата: [цитата]"
`;
}

async function callHFAPI(systemPrompt, userPrompt, token) {
  const url = "https://router.huggingface.co/v1/chat/completions";
  
  const body = {
    model: HF_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 4096,
    temperature: 0.25,
    top_p: 0.95,
    response_format: { type: "json_object" }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(body),
    timeout: 90000
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  try {
    return JSON.parse(content);
  } catch {
    throw new Error("Невалидный JSON от модели");
  }
}

function validateQuestion(q, chunkContent) {
  const required = ['question', 'options', 'correctAnswer', 'explanation'];
  for (const field of required) {
    if (!q[field]) throw new Error(`Отсутствует поле: ${field}`);
  }
  
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    throw new Error('Неверное количество опций');
  }
  
  if (!q.options.includes(q.correctAnswer)) {
    throw new Error('correctAnswer не найден в options');
  }
  
  if (q.explanation.length < 30) {
    throw new Error('explanation слишком короткое');
  }
  
  if (!q.explanation.includes('Цитата:')) {
    throw new Error('explanation не содержит цитату');
  }
}

export async function generateQuizForLesson(lessonSlug, lessonData) {
  console.log(`\n📝 Генерация теста: ${lessonSlug}`);
  
  const quizPath = path.join(quizzesDir, `${lessonSlug}-quiz.json`);
  if (fs.existsSync(quizPath) && !isForce) {
    console.log(` ⏭️ Уже существует`);
    return { slug: lessonSlug, exists: true };
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error('HF_TOKEN не установлен в окружении');
  }

  const chunks = splitIntoSemanticChunks(lessonData.content);
  console.log(` 📄 Урок разбит на ${chunks.length} блоков`);

  const allQuestions = [];
  
  for (let i = 0; i < chunks.length && allQuestions.length < 5; i++) {
    const chunk = chunks[i];
    console.log(` 🤖 Блок ${i+1}: "${chunk.title}"`);
    
    const prompt = createPrompt(lessonData.title, chunk);
    
    let attempts = 0;
    let success = false;
    
    while (attempts < maxRetries && !success) {
      attempts++;
      try {
        const questions = await callHFAPI(SYSTEM_PROMPT, prompt, token);
        
        if (!Array.isArray(questions)) {
          throw new Error("Ответ не массив");
        }
        
        for (const q of questions) {
          validateQuestion(q, chunk.content);
          allQuestions.push(q);
        }
        
        console.log(` ✅ Сгенерировано ${questions.length} вопросов`);
        success = true;
        
      } catch (err) {
        console.warn(` ❌ Попытка ${attempts}/${maxRetries}: ${err.message}`);
        if (attempts < maxRetries) {
          await new Promise(r => setTimeout(r, 3000 * attempts));
        }
      }
    }
    
    if (i < chunks.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const finalQuestions = allQuestions.slice(0, 5);
  
  if (finalQuestions.length === 0) {
    throw new Error('Ни одного валидного вопроса не сгенерировано');
  }

  fs.writeFileSync(quizPath, JSON.stringify(finalQuestions, null, 2), 'utf-8');
  console.log(` ✅ Сохранено ${finalQuestions.length} вопросов`);

  return { 
    slug: lessonSlug, 
    title: lessonData.title, 
    questionsCount: finalQuestions.length, 
    path: quizPath 
  };
}

export async function generateAllQuizzes() {
  console.log('\n🎓 Начало генерации тестов...\n');
  
  const indexPath = path.join(lessonsDir, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Индекс не найден');
    process.exit(1);
  }

  const lessons = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const results = [];

  for (const lesson of lessons) {
    const data = readLesson(lesson.slug);
    if (!data) continue;
    
    try {
      const res = await generateQuizForLesson(lesson.slug, data);
      results.push(res);
    } catch (err) {
      console.error(` ❌ Ошибка для ${lesson.slug}: ${err.message}`);
    }
  }

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
  
  console.log(`\n📋 Индекс обновлен. Создано: ${results.length} тестов`);
}

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
    console.error(` ❌ Ошибка чтения урока ${lesson.slug}: ${e.message}`);
    return null;
  }
}

// ✅ CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllQuizzes().catch(e => {
    console.error('\n❌ Генерация не удалась:', e);
    process.exit(1);
  });
}
