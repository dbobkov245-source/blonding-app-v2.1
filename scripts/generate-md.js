import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import sharp from 'sharp';
import TurndownService from 'turndown';

// Мультимодульная структура курса
const lessonsDir = './lessons';
const outPublicDir = './public/lessons';
const readmeFile = './README.md';

// Список модулей курса (папки в lessons/)
const MODULES = ['ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)', 'блондирование', 'тонирование', 'балаяж', 'ДОПОЛНИТЕЛЬНЫЕ МАТЕРИАЛЫ'];

const turndownService = new TurndownService();

function slugify(text) {
  const translit = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    "%": "percent", " ": "-", "_": "-", ".": ""
  };

  return text.toLowerCase().trim()
    .replace(/[а-яё]/g, (char) => translit[char] || '')
    .replace(/[%_\s.]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80); // Limit length to 80 chars
}

function slugifyModule(moduleName) {
  return slugify(moduleName);
}

if (!fs.existsSync(outPublicDir)) fs.mkdirSync(outPublicDir, { recursive: true });

async function processLessonFile(file, moduleSourceDir, moduleSlug, moduleName) {
  const filePath = path.join(moduleSourceDir, file);
  const baseName = path.basename(file, path.extname(file));

  // Special handling for балаяж module: use numbered slugs
  let slug;
  if (moduleName === 'балаяж') {
    const lessonNumMatch = baseName.match(/^(\d+)/);
    const lessonNum = lessonNumMatch ? lessonNumMatch[1] : '0';
    slug = `balayazh-urok-${lessonNum}`;
  } else {
    slug = slugify(baseName);
  }

  const ext = path.extname(file);
  const lessonPublicDir = path.join(outPublicDir, slug);
  const lessonPublicImgDir = path.join(lessonPublicDir, 'images');

  if (fs.existsSync(lessonPublicDir)) {
    fs.rmSync(lessonPublicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(lessonPublicImgDir, { recursive: true });

  let content = '';
  let title = baseName;
  let imageCounter = 1;

  const mammothOptions = {
    convertImage: mammoth.images.imgElement(async (image) => {
      try {
        const buffer = await image.read();
        if (buffer.length > 5 * 1024 * 1024) return { src: '' };
        const contentType = image.contentType;
        const extension = contentType.split('/')[1] || 'png';
        const imgName = `image-${imageCounter++}.${extension}`;
        const imgPath = path.join(lessonPublicImgDir, imgName);
        await sharp(buffer).jpeg({ quality: 85, progressive: true }).toFile(imgPath);
        const webPath = `/lessons/${slug}/images/${imgName}`;
        return { src: webPath };
      } catch { return { src: '' }; }
    })
  };

  if (ext === '.txt' || ext === '.md') {
    content = fs.readFileSync(filePath, 'utf-8');
  } else if (ext === '.docx') {
    try {
      const htmlResult = await mammoth.convertToHtml({ path: filePath }, mammothOptions);
      content = turndownService.turndown(htmlResult.value);
    } catch (err) {
      console.warn(`[generate-md] ⚠️ Ошибка обработки файла ${file}: ${err.message}`);
      return null;
    }
  } else {
    return null;
  }

  // Use filename as title if it has readable Russian text (contains lesson number)
  // Fallback to content extraction only if filename is a slug
  const hasReadableName = /[а-яА-ЯёЁ]/.test(baseName);

  if (!hasReadableName) {
    // Filename is a slug like "urok1...", try to extract title from content
    const titleMatch = content.match(/^# (.*)$/m);
    const boldTitleMatch = content.match(/^\*\*(.+?)\*\*/m);

    if (titleMatch?.[1]) {
      title = titleMatch[1].trim();
    } else if (boldTitleMatch?.[1]) {
      title = boldTitleMatch[1].trim();
    }
  }
  // else: keep title = baseName (filename with lesson number)

  // Clean up excessive horizontal rules and empty lines
  let cleanContent = content
    .replace(/_{3,}/g, '')           // Remove ___ horizontal rules
    .replace(/-{3,}/g, '')           // Remove --- horizontal rules  
    .replace(/\*{3,}/g, '')          // Remove *** horizontal rules
    .replace(/\n{4,}/g, '\n\n\n')    // Max 2 empty lines
    .trim();

  const mdFile = `---
title: "${title}"
slug: "${slug}"
module: "${moduleSlug}"
date: "${new Date().toISOString().split('T')[0]}"
---

${cleanContent}`;

  fs.writeFileSync(path.join(lessonPublicDir, `${slug}.md`), mdFile, 'utf-8');
  return { slug, title, module: moduleSlug };
}

async function processModule(moduleName) {
  const moduleSourceDir = path.join(lessonsDir, moduleName);
  const moduleSlug = slugifyModule(moduleName);

  if (!fs.existsSync(moduleSourceDir)) {
    console.warn(`[generate-md] ⚠️ Модуль не найден: ${moduleName}`);
    return { name: moduleName, slug: moduleSlug, lessons: [] };
  }

  const files = fs.readdirSync(moduleSourceDir).filter(f =>
    ['.txt', '.md', '.docx'].includes(path.extname(f))
  );

  console.log(`[generate-md] 📚 Модуль "${moduleName}": ${files.length} файлов`);

  const lessons = (await Promise.all(
    files.map(file => processLessonFile(file, moduleSourceDir, moduleSlug, moduleName))
  )).filter(Boolean);

  // Sort lessons numerically based on slug
  lessons.sort((a, b) => {
    const getNum = (item) => {
      // Extract number from slug: "urok-1", "balayazh-urok-2", etc.
      const match = item.slug.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 999;
    };
    return getNum(a) - getNum(b);
  });

  return { name: moduleName, slug: moduleSlug, lessons };
}

// Описания уроков для Фундаментальной теории (из файловых имён)
const LESSON_DESCRIPTIONS = {
  'urok-1': 'Введение в колористику',
  'urok-2': 'Тестовые пряди и портфолио оттенков для тонирования',
  'urok-3': 'Натуральные пигменты: эумеланин и феомеланин',
  'urok-4': 'Процесс окрашивания с осветлением и блондирование',
  'urok-5': 'Уровни глубины тона и фоны осветления',
  'urok-6': 'Шкала УГТ и ФО, идеальный фон осветления',
  'urok-7': 'Цветовой круг и правила колористики',
  'urok-8': 'Нейтрализация желтого и желто-оранжевого ФО',
  'urok-9': 'Значение pH при блондировании',
  'urok-10': 'Блондирование на 12% окислителе',
  'urok-11': 'Классификация блондирующих препаратов',
  'urok-12': 'Оптимизация расхода продукта',
  'urok-13': 'Как избежать ожога кожи',
  'urok-14': 'Добавки в обесцвечивающий порошок',
  'urok-15': 'Вопросы для диалога с клиентом',
  'urok-16': 'Техническое досье и памятка по уходу',
};

async function generateLessons() {
  console.log('[generate-md] 🚀 Начало генерации...\n');

  const modulesData = await Promise.all(MODULES.map(processModule));

  // Формируем index.json с группировкой по модулям
  const indexData = {
    modules: modulesData.map(m => ({
      name: m.name,
      slug: m.slug,
      lessonsCount: m.lessons.length
    })),
    lessons: modulesData.reduce((acc, m) => {
      acc[m.slug] = m.lessons.map(l => {
        // Для уроков фундаментальной теории используем описания
        const description = LESSON_DESCRIPTIONS[l.slug] || l.title;
        return { slug: l.slug, title: description };
      });
      return acc;
    }, {})
  };

  // Также сохраняем плоский список для обратной совместимости
  const flatLessons = modulesData.flatMap(m => m.lessons);

  fs.writeFileSync(path.join(outPublicDir, 'index.json'), JSON.stringify(indexData, null, 2), 'utf-8');

  const totalLessons = flatLessons.length;
  console.log(`\n[generate-md] ✅ Готово! ${totalLessons} уроков в ${modulesData.length} модулях.`);
}

const generatedDir = './lessons/generated';
if (fs.existsSync(generatedDir)) fs.rmSync(generatedDir, { recursive: true, force: true });

generateLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
