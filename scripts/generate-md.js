import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

// Динамический импорт image-type, так как он ESM
let imageType;
import('image-type').then(mod => {
  imageType = mod.imageType;
});

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

  // 1. Создаем папки для урока
  const lessonPublicDir = path.join(outPublicDir, slug);
  const lessonPublicImgDir = path.join(lessonPublicDir, 'images');
  if (!fs.existsSync(lessonPublicImgDir)) fs.mkdirSync(lessonPublicImgDir, { recursive: true });

  let imageCounter = 1;

  // 2. Настраиваем опции для mammoth (обработчик картинок)
  const mammothOptions = {
    convertImage: mammoth.images.imgElement(async (image) => {
      if (!imageType) {
        console.warn('image-type aсинхронно не загрузился, картинки могут быть пропущены');
        return { src: '' };
      }

      const buffer = await image.read();
      const type = await imageType(buffer);

      if (!type) {
        console.warn(`Не удалось определить тип картинки для ${slug}, пропускаем.`);
        return { src: '' };
      }

      // Генерируем имя файла
      const imgName = `image${imageCounter++}.${type.ext}`;
      const imgPath = path.join(lessonPublicImgDir, imgName);

      // Сохраняем картинку
      fs.writeFileSync(imgPath, buffer);

      // Возвращаем веб-путь, который будет вставлен в .md
      const webPath = `/lessons/${slug}/images/${imgName}`;
      console.log(`Извлечена и сохранена картинка: ${imgPath}`);

      return {
        src: webPath
      };
    })
  };

  // 3. Читаем контент
  if (ext === '.txt' || ext === '.md') {
    content = fs.readFileSync(filePath, 'utf-8');
  } else if (ext === '.docx') {
    try {
      const result = await mammoth.convertToMarkdown({ path: filePath }, mammothOptions);
      content = result.value; // Это уже готовый Markdown
    } catch (e) {
      console.warn(`Ошибка чтения .docx ${filePath}:`, e.message);
      return null;
    }
  } else {
    console.log(`Пропускаем неподдерживаемый файл: ${file}`);
    return null; // Неподдерживаемый тип файла
  }

  // 4. Создание .md файла с "шапкой"
  const mdFile = `---\ntitle: "${slug}"\nslug: "${slug}"\ndate: "${new Date().toISOString().split('T')[0]}"\n---\n\n${content}`;

  // 5. Запись .md файла
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

  const lessons = (await Promise.all(lessonPromises)).filter(Boolean); // .filter(Boolean) убирает null (пропущенные)

  // 6. Обновление index.json (списка уроков)
  const indexJsonPath = path.join(outPublicDir, 'index.json');
  fs.writeFileSync(indexJsonPath, JSON.stringify(lessons, null, 2), 'utf-8');
  console.log(`Обновлен ${indexJsonPath}`);

  // 7. Обновление README.md
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

// Запускаем главную функцию
generateLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
