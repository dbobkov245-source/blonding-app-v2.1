import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import sharp from 'sharp';

const sourceDir = './lessons/source';
const outPublicDir = './public/lessons';
const readmeFile = './README.md';

[sourceDir, outPublicDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const isDev = process.env.NODE_ENV === 'development';

function log(...args) {
  if (isDev) console.log(...args);
}

async function processLessonFile(file) {
  const filePath = path.join(sourceDir, file);
  const slug = path.basename(file, path.extname(file));
  const ext = path.extname(file);
  let content = '';

  const lessonPublicDir = path.join(outPublicDir, slug);
  const lessonPublicImgDir = path.join(lessonPublicDir, 'images');

  if (!fs.existsSync(lessonPublicImgDir)) {
    fs.mkdirSync(lessonPublicImgDir, { recursive: true });
  }

  let imageCounter = 1;

  const mammothOptions = {
    convertImage: mammoth.images.imgElement(async (image) => {
      const buffer = await image.read();
      if (buffer.length > 5 * 1024 * 1024) { // 5MB limit
        log(`Изображение слишком большое для ${slug}, пропускаем.`);
        return { src: '' };
      }
      const contentType = image.contentType;
      const extension = contentType.split('/')[1];

      if (!extension) {
        log(`Не удалось определить тип картинки для ${slug}, пропускаем.`);
        return { src: '' };
      }

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
      const result = await mammoth.convertToMarkdown({ path: filePath }, mammothOptions);
      content = result.value;
    } catch (e) {
      log(`Ошибка чтения .docx ${filePath}: ${e.message}`);
      return null;
    }
  } else {
    log(`Пропускаем неподдерживаемый файл: ${file}`);
    return null;
  }

  // Extract title from first # header
  const titleMatch = content.match(/^# (.*)$/m);
  const title = titleMatch ? titleMatch[1].trim() : slug;

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

  if (lessons.length > 0) {
    if (fs.existsSync(readmeFile)) {
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
    } else {
      log('README.md не найден, пропускаем обновление.');
    }
  }

  log(`Готово! ${lessons.length} уроков обработано.`);
}

generateLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
