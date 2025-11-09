import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import sharp from 'sharp';
import TurndownService from 'turndown'; // Убедись, что он в package.json

const sourceDir = './lessons/source';
const outPublicDir = './public/lessons';
const readmeFile = './README.md';

const turndownService = new TurndownService();

// --- 1. ДОБАВЛЕНА ФУНКЦИЯ SLUGIFY ---
function slugify(text) {
  const a = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z", "и": "i", "й": "y",
    "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f",
    "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "shch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    "%": "percent"
  };

  return text.toString().toLowerCase().trim()
    .replace(/[а-яё%]/g, (char) => a[char] || '')
    .replace(/[^a-z0-9 -]/g, '') // убираем все, кроме букв, цифр и дефиса
    .replace(/\s+/g, '-') // заменяем пробелы на дефис
    .replace(/-+/g, '-'); // убираем двойные дефисы
}
// ------------------------------------

[sourceDir, outPublicDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const isDev = process.env.NODE_ENV === 'development';
function log(...args) {
  if (isDev) console.log(...args);
}

async function processLessonFile(file) {
  const filePath = path.join(sourceDir, file);
  const baseName = path.basename(file, path.extname(file));
  const slug = slugify(baseName); // <-- 2. ИСПОЛЬЗУЕМ SLUGIFY
  const ext = path.extname(file);
  let content = '';
  let title = baseName; 

  const lessonPublicDir = path.join(outPublicDir, slug);
  const lessonPublicImgDir = path.join(lessonPublicDir, 'images');

  // Очищаем старую папку урока (важно для обновления)
  if (fs.existsSync(lessonPublicDir)) {
    fs.rmSync(lessonPublicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(lessonPublicImgDir, { recursive: true });

  let imageCounter = 1;

  const mammothOptions = {
    convertImage: mammoth.images.imgElement(async (image) => {
      const buffer = await image.read();
      if (buffer.length > 5 * 1024 * 1024) { // 5MB limit
        log(`Изображение слишком большое для ${slug}, пропускаем.`);
        return { src: '' };
      }
      const contentType = image.contentType;
      const extension = contentType.split('/')[1] || 'png';
      const imgName = `image${imageCounter++}.${extension}`;
      const imgPath = path.join(lessonPublicImgDir, imgName);

      try {
        await sharp(buffer)
          .jpeg({ quality: 80 })
          .png({ quality: 80 })
          .toFile(imgPath);
      } catch (e) {
        log(`Ошибка сжатия картинки ${imgName}: ${e.message}. Сохраняем как есть.`);
        fs.writeFileSync(imgPath, buffer);
      }
      
      const webPath = `/lessons/${encodeURIComponent(slug)}/images/${encodeURIComponent(imgName)}`;
      log(`Извлечена и СЖАТА картинка: ${imgPath}`);
      return { src: webPath };
    })
  };

  if (ext === '.txt' || ext === '.md') {
    content = fs.readFileSync(filePath, 'utf-8');
  } else if (ext === '.docx') {
    try {
      const htmlResult = await mammoth.convertToHtml({ path: filePath }, mammothOptions);
      content = turndownService.turndown(htmlResult.value);
    } catch (e) {
      log(`Ошибка чтения .docx ${filePath}: ${e.message}`);
      return null;
    }
  } else {
    log(`Пропускаем неподдерживаемый файл: ${file}`);
    return null;
  }

  // Извлекаем title из первого H1, если он есть
  const titleMatch = content.match(/^# (.*)$/m);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  const mdFile = `---
title: "${title}"
slug: "${slug}"
date: "${new Date().toISOString().split('T')[0]}"
---

${content}`;

  fs.writeFileSync(path.join(lessonPublicDir, `${slug}.md`), mdFile, 'utf-8');
  log(`Сгенерирован урок: ${slug}`);
  return { slug, title };
}

async function generateLessons() {
  const lessonPromises = [];
  const files = fs.readdirSync(sourceDir).filter(f =>
    f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.docx')
  );

  log(`Найдено ${files.length} файлов уроков для обработки...`);

  for (const file of files) {
    lessonPromises.push(processLessonFile(file));
  }

  const lessons = (await Promise.all(lessonPromises)).filter(Boolean);

  const indexJsonPath = path.join(outPublicDir, 'index.json');
  fs.writeFileSync(indexJsonPath, JSON.stringify(lessons, null, 2), 'utf-8');
  log(`Обновлен ${indexJsonPath}`);

  if (lessons.length > 0 && fs.existsSync(readmeFile)) {
    try {
      let readme = fs.readFileSync(readmeFile, 'utf-8');
      const list = lessons.map(l => `- [${l.title}](/Theory/${encodeURIComponent(l.slug)})`).join('\n');
      const sectionHeader = '## Уроки';

      if (readme.includes(sectionHeader)) {
        readme = readme.replace(/(## Уроки[\s\S]*?)(?=##|$)/, `${sectionHeader}\n${list}\n\n`);
      } else {
        readme += `\n${sectionHeader}\n${list}\n\n`;
      }

      fs.writeFileSync(readmeFile, readme, 'utf-8');
      log('README.md обновлен.');
    } catch (e) {
      log(`Ошибка обновления README.md: ${e.message}`);
    }
  }

  console.log(`[generate-md] Готово! ${lessons.length} уроков обработано.`);
}

generateLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
