import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import sharp from 'sharp'; // 1. ИМПОРТИРУЕМ SHARP

const sourceDir = './lessons/source';
const outPublicDir = './public/lessons';
const readmeFile = './README.md';

[sourceDir, outPublicDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function processLessonFile(file) {
  const filePath = path.join(sourceDir, file);
  const slug = path.basename(file, path.extname(file));
  const ext = path.extname(file);
  
  let content = '';
  
  const lessonPublicDir = path.join(outPublicDir, slug);
  const lessonPublicImgDir = path.join(lessonPublicDir, 'images');
  if (!fs.existsSync(lessonPublicImgDir)) fs.mkdirSync(lessonPublicImgDir, { recursive: true });
  
  let imageCounter = 1;
  
  const mammothOptions = {
    convertImage: mammoth.images.imgElement(async (image) => {
      
      const buffer = await image.read();
      const contentType = image.contentType; 
      const extension = contentType.split('/')[1];
      if (!extension) {
        console.warn(`Не удалось определить тип картинки для ${slug}, пропускаем.`);
        return { src: '' };
      }
      
      const imgName = `image${imageCounter++}.${extension}`;
      const imgPath = path.join(lessonPublicImgDir, imgName);
      
      // 2. СЖИМАЕМ КАРТИНКУ ПЕРЕД СОХРАНЕНИЕМ
      try {
        await sharp(buffer)
          .jpeg({ quality: 80 }) // Сжимаем JPEG
          .png({ quality: 80 })  // Сжимаем PNG
          .toFile(imgPath);
      } catch (e) {
        console.warn(`Ошибка сжатия картинки ${imgName}: ${e.message}. Сохраняем как есть.`);
        fs.writeFileSync(imgPath, buffer); // Если сжатие не удалось, просто сохраняем
      }
      
      const webPath = `/lessons/${encodeURIComponent(slug)}/images/${encodeURIComponent(imgName)}`;
      console.log(`Извлечена и СЖАТА картинка: ${imgPath}`);
      
      return {
        src: webPath
      };
    })
  };
  
  if (ext === '.txt' || ext === '.md') {
    content = fs.readFileSync(filePath, 'utf-8');
  } else if (ext === '.docx') {
    try {
      const result = await mammoth.convertToMarkdown({ path: filePath }, mammothOptions);
      content = result.value;
    } catch (e) {
      console.warn(`Ошибка чтения .docx ${filePath}: ${e.message}`);
      return null;
    }
  } else {
    console.log(`Пропускаем неподдерживаемый файл: ${file}`);
    return null;
  }
  
  const mdFile = `---
title: "${slug}"
slug: "${slug}"
date: "${new Date().toISOString().split('T')[0]}"
---

${content}`;
  
  fs.writeFileSync(path.join(lessonPublicDir, `${slug}.md`), mdFile, 'utf-8');
  
  console.log(`Сгенерирован урок: ${slug}`);
  return { slug, title: slug };
}

async function generateLessons() {
  const lessonPromises = [];
  const files = fs.readdirSync(sourceDir).filter(f =>
    f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.docx')
  );
  
  console.log(`Найдено ${files.length} файлов уроков обработки...`);
  
  for (const file of files) {
    lessonPromises.push(processLessonFile(file));
  }
  
  const lessons = (await Promise.all(lessonPromises)).filter(Boolean);
  
  const indexJsonPath = path.join(outPublicDir, 'index.json');
  fs.writeFileSync(indexJsonPath, JSON.stringify(lessons, null, 2), 'utf-8');
  console.log(`Обновлен ${indexJsonPath}`);
  
  if (lessons.length > 0) {
    if (fs.existsSync(readmeFile)) { // 3. ПРОВЕРЯЕМ, что README существует
      try {
        let readme = fs.readFileSync(readmeFile, 'utf-8');
        const list = lessons.map(l => `- [${l.title}](/Theory?lesson=${encodeURIComponent(l.slug)})`).join('\n');
        const sectionHeader = '## 📚 Уроки';
        if (readme.includes(sectionHeader)) {
          readme = readme.replace(/## 📚 Уроки[\s\S]*?(?=##|$)/, `${sectionHeader}\n${list}\n\n`);
        } else {
          readme += `\n${sectionHeader}\n${list}\n\n`;
        }
        fs.writeFileSync(readmeFile, readme, 'utf-8');
        console.log('README.md обновлен.');
      } catch (e) {
        console.warn(`Ошибка обновления README.md: ${e.message}`);
      }
    } else {
      console.log('README.md не найден, пропускаем обновление.');
    }
  }
  
  console.log(`✅ Готово! ${lessons.length} уроков обработано.`);
}

generateLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
```eof
