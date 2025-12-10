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
const MODULES = ['ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)', 'блондирование', 'тонирование'];

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

async function processLessonFile(file, moduleSourceDir, moduleSlug) {
  const filePath = path.join(moduleSourceDir, file);
  const baseName = path.basename(file, path.extname(file));
  const slug = slugify(baseName);
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

  // Extract title from content
  const titleMatch = content.match(/^# (.*)$/m);
  const boldTitleMatch = content.match(/^\*\*(.*)\*\*/m);

  if (titleMatch?.[1]) {
    title = titleMatch[1].trim();
  } else if (boldTitleMatch?.[1]) {
    title = boldTitleMatch[1].trim();
    // Optional: If the bold title is very long, maybe we shouldn't use it? 
    // But for now, it's better than the filename.
  }

  const mdFile = `---
title: "${title}"
slug: "${slug}"
module: "${moduleSlug}"
date: "${new Date().toISOString().split('T')[0]}"
---

${content}`;

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
    files.map(file => processLessonFile(file, moduleSourceDir, moduleSlug))
  )).filter(Boolean);

  // Sort lessons numerically based on slug (most reliable)
  lessons.sort((a, b) => {
    const getNum = (item) => {
      // Slug always starts with "urok" followed by number due to our renaming
      const match = item.slug.match(/^urok(\d+)/i);
      return match ? parseInt(match[1], 10) : 999;
    };
    return getNum(a) - getNum(b);
  });

  return { name: moduleName, slug: moduleSlug, lessons };
}

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
      acc[m.slug] = m.lessons.map(l => ({ slug: l.slug, title: l.title }));
      return acc;
    }, {})
  };

  // Также сохраняем плоский список для обратной совместимости
  const flatLessons = modulesData.flatMap(m => m.lessons);

  fs.writeFileSync(path.join(outPublicDir, 'index.json'), JSON.stringify(indexData, null, 2), 'utf-8');

  // Обновляем README
  if (fs.existsSync(readmeFile)) {
    try {
      let readme = fs.readFileSync(readmeFile, 'utf-8');
      const list = modulesData.map(m =>
        `### ${m.name}\n` + m.lessons.map(l => `- [${l.title}](/Theory/${encodeURIComponent(l.slug)})`).join('\n')
      ).join('\n\n');
      const sectionHeader = '## Уроки';
      if (readme.includes(sectionHeader)) {
        readme = readme.replace(/(## Уроки[\s\S]*?)(?=##|$)/, `${sectionHeader}\n\n${list}\n\n`);
      } else {
        readme += `\n${sectionHeader}\n\n${list}\n`;
      }
      fs.writeFileSync(readmeFile, readme, 'utf-8');
    } catch { }
  }

  const totalLessons = flatLessons.length;
  console.log(`\n[generate-md] ✅ Готово! ${totalLessons} уроков в ${modulesData.length} модулях.`);
}

const generatedDir = './lessons/generated';
if (fs.existsSync(generatedDir)) fs.rmSync(generatedDir, { recursive: true, force: true });

generateLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
