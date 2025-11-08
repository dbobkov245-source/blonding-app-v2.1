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
  const slug = path.basename(file, path.extname(file));
  const ext = path.extname(file);

  let content = '';

  // Создаем папки для урока
  const lessonPublicDir = path.join(outPublicDir, slug);
  const lessonPublicImgDir = path.join(lessonPublicDir, 'images');
  if (!fs.existsSync(lessonPublicImgDir)) fs.mkdirSync(lessonPublicImgDir, { recursive: true });

  let imageCounter = 1;

  // *** ИСПРАВЛЕННАЯ ЛОГИКА ОБРАБОТКИ КАРТИНОК ***
  const mammothOptions = {
    // Мы будем использовать dataUri, а не imgElement
    convertImage: mammoth.images.dataUri(async (image) => {

      // 1. Получаем base64-строку
      const base64String = await image.read("base64");

      // 2. Конвертируем ее в Buffer, который поймет imageType
      const buffer = Buffer.from(base64String, 'base64');

      // 3. Определяем тип (jpg, png)
      const type = await imageType(buffer);

      if (!type) {
        console.warn(`Не удалось определить тип картинки (base64) для ${slug}, пропускаем.`);
        return { src: '' }; // Возвращаем пустой src, если не поняли
      }

      // 4. Генерируем имя файла
      const imgName = `image${imageCounter++}.${type.ext}`;
      const imgPath = path.join(lessonPublicImgDir, imgName);

      // 5. Сохраняем Buffer как файл
      fs.writeFileSync(imgPath, buffer);

      // 6. Возвращаем веб-путь
      const webPath = `/lessons/${slug}/images/${imgName}`;
      console.log(`Извлечена (из base64) и сохранена картинка: ${imgPath}`);

      return {
        src: webPath
      };
    })
  };

  // Читаем контент
  if (ext === '.txt' || ext === '.md') {
    content = fs.readFileSync(filePath, 'utf-8');
  } else if (ext === '.docx') {
    try {
      // mammoth.js теперь использует convertImage для .docx
      const result = await mammoth.convertToMarkdown({ path: filePath }, mammothOptions);
      content = result.value; // Это уже готовый Markdown
    } catch (e) {
      console.warn(`Ошибка чтения .docx ${filePath}:`, e.message);
      return null;
    }
  } else {
    console.log(`Пропускаем неподдерживаемый файл: ${file}`);
    return null;
  }

  const mdFile = `---\ntitle: "${slug}"\nslug: "${slug}"\ndate: "${new Date().toISOString().split('T')[0]}"\n---\n\n${content}`;

  fs.writeFileSync(path.join(lessonPublicDir, `${slug}.md`), mdFile, 'utf-8');

  console.log(`Сгенерирован урок: ${slug}`);
  return { slug, title: slug };
}

/**
 * Главная асинхронная функция
 */
async function generateLessons() {
  const lessonPromises = [];
  const files = fs.readdirSync(sourceDir).filter(f =>
    f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.docx')
  );

  console.log(`Найдено ${files.length} файлов уроков для обработки...`);

  for (const file of files) {
    lessonPromises.push(processLessonFile(file));
  }

  const lessons = (await Promise.all(lessonPromises)).filter(Boolean);

  const indexJsonPath = path.join(outPublicDir, 'index.json');
  fs.writeFileSync(indexJsonPath, JSON.stringify(lessons, null, 2), 'utf-8');
  console.log(`Обновлен ${indexJsonPath}`);

  if (lessons.length > 0) {
    let readme = fs.readFileSync(readmeFile, 'utf-8');
    const list = lessons.map(l => `- [${l.title}](/Theory?lesson=${l.slug})`).join('\n');
    const sectionHeader = '## 📚 Уроки';
    if (readme.includes(sectionHeader)) {
      readme = readme.replace(/## 📚 Уроки[\s\S]*?(?=##|$)/, `${sectionHeader}\n${list}\n\n`);
    } else {
      readme += `\n${sectionHeader}\n${list}\n\n`;
    }
    fs.writeFileSync(readmeFile, readme, 'utf-8');
    console.log('README.md обновлен.');
  }

  console.log(`✅ Готово! ${lessons.length} уроков обработано.`);
}

generateLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
