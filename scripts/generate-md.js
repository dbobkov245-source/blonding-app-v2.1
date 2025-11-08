import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

// 1. СНАЧАЛА ЗАГРУЖАЕМ И ЖДЕМ БИБЛИОТЕКУ
const { imageType } = await import('image-type');

// 2. ТЕПЕРЬ ОПРЕДЕЛЯЕМ ПУТИ
const sourceDir = './lessons/source';
const outPublicDir = './public/lessons';
const readmeFile = './README.md';

// Убедимся, что все папки существуют
[sourceDir, outPublicDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Обрабатывает один файл урока (.txt, .md или .docx)
 */
async function processLessonFile(file) {
  const filePath = path.join(sourceDir, file);
  const slug = path.basename(file, path.extname(file)); // slug ОСТАЕТСЯ С КИРИЛЛИЦЕЙ
  const ext = path.extname(file);

  let content = '';

  // Папки на диске ОСТАЮТСЯ С КИРИЛЛИЦЕЙ
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
      const imgPath = path.join(lessonPublicImgDir, imgName); // Путь на диске (с кириллицей)

      fs.writeFileSync(imgPath, buffer);

      // *** ИСПРАВЛЕНИЕ БЕЗ СЛЭША: ***
      const webPath = `/lessons/${encodeURIComponent(slug)}/images/${encodeURIComponent(imgName)}`;

      console.log(`Извлечена и сохранена картинка: ${imgPath}`);
      console.log(`Создан Web-путь: ${webPath}`); 

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
      console.warn(`Ошибка чтения .docx ${filePath}:`, e.message);
      return null;
    }
  } else {
    console.log(`Пропускаем неподдерживаемый файл: ${file}`);
    return null;
  }

  const mdFile = `---
