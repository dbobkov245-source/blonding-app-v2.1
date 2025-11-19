import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import sharp from 'sharp';
import TurndownService from 'turndown';

const sourceDir = './lessons/source';
const outPublicDir = './public/lessons';
const readmeFile = './README.md';

const turndownService = new TurndownService();

function slugify(text) {
  // Более строгая и консистентная транслитерация
  const translit = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", 
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", 
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", 
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", 
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    "%": "percent", " ": "-", "_": "-", ".": ""
  };
  
  return text.toLowerCase().trim()
    // Сначала заменяем все кириллические буквы
    .replace(/[а-яё]/g, (char) => translit[char] || '')
    // Заменяем пробелы и спецсимволы
    .replace(/[%_\s.]+/g, '-')
    // Удаляем все что не латиница, цифры или дефис
    .replace(/[^a-z0-9-]/g, '')
    // Убираем множественные дефисы
    .replace(/-+/g, '-')
    // Убираем дефисы в начале и конце
    .replace(/^-|-$/g, '');
}

[sourceDir, outPublicDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function processLessonFile(file) {
  const filePath = path.join(sourceDir, file);
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
    const htmlResult = await mammoth.convertToHtml({ path: filePath }, mammothOptions);
    content = turndownService.turndown(htmlResult.value);
  } else {
    return null;
  }

  const titleMatch = content.match(/^# (.*)$/m);
  if (titleMatch?.[1]) title = titleMatch[1].trim();

  const mdFile = `---
title: "${title}"
slug: "${slug}"
date: "${new Date().toISOString().split('T')[0]}"
---

${content}`;

  fs.writeFileSync(path.join(lessonPublicDir, `${slug}.md`), mdFile, 'utf-8');
  return { slug, title };
}

async function generateLessons() {
  const files = fs.readdirSync(sourceDir).filter(f => 
    ['.txt', '.md', '.docx'].includes(path.extname(f))
  );

  const lessons = (await Promise.all(files.map(processLessonFile))).filter(Boolean);
  fs.writeFileSync(path.join(outPublicDir, 'index.json'), JSON.stringify(lessons, null, 2), 'utf-8');

  if (fs.existsSync(readmeFile)) {
    try {
      let readme = fs.readFileSync(readmeFile, 'utf-8');
      const list = lessons.map(l => `- [${l.title}](/Theory/${encodeURIComponent(l.slug)})`).join('\n');
      const sectionHeader = '## Уроки';
      if (readme.includes(sectionHeader)) {
        readme = readme.replace(/(## Уроки[\s\S]*?)(?=##|$)/, `${sectionHeader}\n${list}\n\n`);
      } else {
        readme += `\n${sectionHeader}\n${list}\n`;
      }
      fs.writeFileSync(readmeFile, readme, 'utf-8');
    } catch {}
  }

  console.log(`[generate-md] Готово! ${lessons.length} уроков обработано.`);
}

const generatedDir = './lessons/generated';
if (fs.existsSync(generatedDir)) fs.rmSync(generatedDir, { recursive: true, force: true });

generateLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
