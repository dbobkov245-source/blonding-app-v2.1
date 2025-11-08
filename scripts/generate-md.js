/**
 * Генератор уроков с поддержкой .txt, .md и .docx
 * Извлекает и сжимает изображения из .docx файлов
 */

const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const sharp = require('sharp');

const sourceDir = './lessons/source';
const outPublicDir = './public/lessons';
const readmeFile = './README.md';

// Создаём необходимые директории
[sourceDir, outPublicDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Создание уникального slug из имени файла
 */
function makeSlug(name, existing) {
  const base = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-а-яё]/gi, '');
  
  let slug = base || 'lesson';
  let counter = 1;
  
  while (existing.has(slug)) {
    slug = `${base}-${counter++}`;
  }
  
  existing.add(slug);
  return slug;
}

/**
 * Обработка одного файла урока
 */
async function processLessonFile(file, existingSlugs) {
  const filePath = path.join(sourceDir, file);
  const rawName = path.basename(file, path.extname(file));
  const slug = makeSlug(rawName, existingSlugs);
  const ext = path.extname(file).toLowerCase();
  
  console.log(`\n📄 Processing: ${file}`);
  console.log(`   Slug: ${slug}`);
  
  let content = '';
  
  // Подготовка директорий для урока
  const lessonPublicDir = path.join(outPublicDir, slug);
  const lessonPublicImgDir = path.join(lessonPublicDir, 'images');
  
  // Очистка старых файлов
  if (fs.existsSync(lessonPublicDir)) {
    try {
      fs.rmSync(lessonPublicDir, { recursive: true, force: true });
      console.log(`   🗑️  Cleaned old directory`);
    } catch (e) {
      console.warn(`   ⚠️  Failed to clean: ${e.message}`);
    }
  }
  
  // Создание директорий
  fs.mkdirSync(lessonPublicImgDir, { recursive: true });
  
  let imageCounter = 1;
  
  // Обработка .docx файлов
  if (ext === '.docx') {
    console.log(`   📦 Converting .docx...`);
    
    const mammothOptions = {
      convertImage: mammoth.images.imgElement(async (image) => {
        const buffer = await image.read();
        const contentType = image.contentType || 'image/png';
        const extension = contentType.split('/')[1] || 'png';
        
        const imgName = `image${imageCounter++}.${extension}`;
        const imgPath = path.join(lessonPublicImgDir, imgName);
        
        try {
          // Сжатие изображения через Sharp
          const sharpInstance = sharp(buffer);
          
          if (extension === 'png') {
            await sharpInstance
              .png({ quality: 80, compressionLevel: 9 })
              .toFile(imgPath);
          } else {
            await sharpInstance
              .jpeg({ quality: 80, progressive: true })
              .toFile(imgPath);
          }
          
          console.log(`   🖼️  Compressed: ${imgName}`);
        } catch (e) {
          // Fallback: сохранение без сжатия
          console.warn(`   ⚠️  Sharp failed for ${imgName}, saving raw`);
          fs.writeFileSync(imgPath, buffer);
        }
        
        // Возвращаем веб-путь для Markdown
        return {
          src: `/lessons/${encodeURIComponent(slug)}/images/${encodeURIComponent(imgName)}`
        };
      })
    };
    
    try {
      const result = await mammoth.convertToMarkdown(
        { path: filePath }, 
        mammothOptions
      );
      content = result.value;
      
      if (result.messages && result.messages.length > 0) {
        console.log(`   ℹ️  Mammoth messages:`);
        result.messages.forEach(msg => console.log(`      ${msg.message}`));
      }
    } catch (e) {
      console.error(`   ❌ Error reading .docx: ${e.message}`);
      return null;
    }
  } 
  // Обработка .txt и .md файлов
  else if (ext === '.txt' || ext === '.md') {
    console.log(`   📝 Reading text file...`);
    content = fs.readFileSync(filePath, 'utf-8');
  } 
  else {
    console.log(`   ⏭️  Skipping unsupported file type`);
    return null;
  }
  
  // Создание frontmatter и полного Markdown
  const mdFile = `---
title: "${rawName}"
slug: "${slug}"
date: "${new Date().toISOString().split('T')[0]}"
description: "Урок по блондированию"
tags: ["блондирование", "обучение"]
---

${content}`;
  
  // Сохранение .md файла
  const mdPath = path.join(lessonPublicDir, `${slug}.md`);
  fs.writeFileSync(mdPath, mdFile, 'utf-8');
  console.log(`   ✅ Saved: ${slug}.md`);
  
  // Получение превью изображения (первое найденное)
  let preview = '';
  try {
    const images = fs.readdirSync(lessonPublicImgDir);
    if (images.length > 0) {
      preview = `/lessons/${slug}/images/${images[0]}`;
    }
  } catch (e) {
    // Нет изображений
  }
  
  return { 
    slug, 
    title: rawName,
    preview,
    date: new Date().toISOString().split('T')[0]
  };
}

/**
 * Главная функция генерации
 */
async function generateLessons() {
  console.log('\n🚀 Starting lesson generation...\n');
  
  const files = fs.readdirSync(sourceDir).filter(f =>
    f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.docx')
  );
  
  console.log(`📚 Found ${files.length} lesson file(s)\n`);
  
  if (files.length === 0) {
    console.log('ℹ️  No lesson files found. Add .txt, .md or .docx files to lessons/source/\n');
    return;
  }
  
  const existingSlugs = new Set();
  const lessonPromises = [];
  
  for (const file of files) {
    lessonPromises.push(processLessonFile(file, existingSlugs));
  }
  
  const results = await Promise.all(lessonPromises);
  const lessons = results.filter(Boolean);
  
  console.log(`\n📊 Successfully processed: ${lessons.length}/${files.length}`);
  
  // Генерация index.json
  const indexJsonPath = path.join(outPublicDir, 'index.json');
  const indexData = lessons.map(l => ({
    slug: l.slug,
    title: l.title,
    preview: l.preview,
    date: l.date
  }));
  
  fs.writeFileSync(indexJsonPath, JSON.stringify(indexData, null, 2), 'utf-8');
  console.log(`\n📋 Updated: ${indexJsonPath}`);
  
  // Обновление README
  if (lessons.length > 0 && fs.existsSync(readmeFile)) {
    try {
      let readme = fs.readFileSync(readmeFile, 'utf-8');
      const list = lessons
        .map(l => `- [${l.title}](/Theory/${encodeURIComponent(l.slug)})`)
        .join('\n');
      
      const sectionHeader = '## 📚 Уроки';
      
      if (readme.includes(sectionHeader)) {
        readme = readme.replace(
          /## 📚 Уроки[\s\S]*?(?=##|$)/, 
          `${sectionHeader}\n${list}\n\n`
        );
      } else {
        readme += `\n${sectionHeader}\n${list}\n\n`;
      }
      
      fs.writeFileSync(readmeFile, readme, 'utf-8');
      console.log(`📝 Updated: README.md`);
    } catch (e) {
      console.warn(`⚠️  Failed to update README: ${e.message}`);
    }
  }
  
  console.log(`\n✅ Generation complete! ${lessons.length} lesson(s) ready.\n`);
}

// Запуск
generateLessons().catch(e => {
  console.error('\n❌ Generation failed:', e);
  process.exit(1);
});
