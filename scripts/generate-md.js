import fs from "fs";
import path from "path";

const sourceDir = "./lessons/source";
const sourceImgDir = path.join(sourceDir, "images");
const outMdDir = "./src/content/theory";
const outPublicDir = "./public/lessons";
const readmeFile = "./README.md";

if (!fs.existsSync(sourceDir)) fs.mkdirSync(sourceDir, { recursive: true });
if (!fs.existsSync(sourceImgDir)) fs.mkdirSync(sourceImgDir, { recursive: true });
if (!fs.existsSync(outMdDir)) fs.mkdirSync(outMdDir, { recursive: true });
if (!fs.existsSync(outPublicDir)) fs.mkdirSync(outPublicDir, { recursive: true });

const lessons = [];
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));

files.forEach(file => {
  const slug = path.basename(file, path.extname(file));
  const content = fs.readFileSync(path.join(sourceDir, file), 'utf-8');

  const lessonPublicImgDir = path.join(outPublicDir, slug, 'images');
  if (!fs.existsSync(lessonPublicImgDir)) fs.mkdirSync(lessonPublicImgDir, { recursive: true });

  const imgRegex = /\[\[(.*?)\]\]/g;
  let md = content.replace(imgRegex, (match, imgName) => {
    const srcImgPath = path.join(sourceImgDir, imgName);
    const destImgPath = path.join(lessonPublicImgDir, imgName);
    const webPath = `/lessons/${slug}/images/${imgName}`;

    if (fs.existsSync(srcImgPath)) {
      try { fs.copyFileSync(srcImgPath, destImgPath); console.log(`Copied image ${imgName} -> ${destImgPath}`); } catch(e){ console.warn(`Failed to copy ${imgName}: ${e.message}`); }
      return `![${imgName}](${webPath})`;
    } else {
      console.warn(`Image not found: ${srcImgPath}`);
      return `> ⚠️ Изображение ${imgName} не найдено`;
    }
  });

  const mdFile = `---\ntitle: "${slug}"\nslug: "${slug}"\ndate: "${new Date().toISOString().split('T')[0]}"\n---\n\n${md}`;

  fs.writeFileSync(path.join(outMdDir, `${slug}.md`), mdFile, 'utf-8');
  const publicLessonDir = path.join(outPublicDir, slug);
  if (!fs.existsSync(publicLessonDir)) fs.mkdirSync(publicLessonDir, { recursive: true });
  fs.writeFileSync(path.join(publicLessonDir, `${slug}.md`), mdFile, 'utf-8');

  lessons.push({ slug, title: slug });
  console.log(`Generated lesson: ${slug}`);
});

if (lessons.length > 0) {
  let readme = fs.readFileSync(readmeFile, 'utf-8');
  const list = lessons.map(l => `- [${l.title}](./src/content/theory/${l.slug}.md)`).join('\n');
  const sectionHeader = '## 📚 Уроки';
  if (readme.includes(sectionHeader)) {
    readme = readme.replace(/## 📚 Уроки[\s\S]*?(?=##|$)/, `${sectionHeader}\n${list}\n`);
  } else {
    readme += `\n${sectionHeader}\n${list}\n`;
  }
  fs.writeFileSync(readmeFile, readme, 'utf-8');
  console.log('README updated with lessons list.');
}

console.log(`✅ ${lessons.length} lessons generated.`);
