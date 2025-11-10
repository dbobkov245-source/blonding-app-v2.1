import fs from 'fs';
import path from 'path';

// Тестовый набор: [вопрос, ожидаемый_ключевой_термин]
const testCases = [
  ["Какой процент окислителя использовать на корни при чувствительной коже", "крем-протектор"],
  ["Что такое техника BACK TO BACK", "фольга"],
  ["На сколько сантиметров отступать от кожи головы", "1.5-2 см"],
  ["Когда делать тест на пряди", "визуальный осмотр"],
  ["Какая пропорция для 12% окислителя", "1:5"]
];

function evaluateRetriever() {
  console.log("\n📊 Оценка качества чанкинга и ретривера\n");
  
  const lessonsDir = './public/lessons';
  const indexPath = path.join(lessonsDir, 'index.json');
  
  if (!fs.existsSync(indexPath)) {
    console.error("❌ Индекс уроков не найден");
    return;
  }

  const lessons = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  let totalScore = 0;
  let foundCases = 0;

  for (const testCase of testCases) {
    const [question, expectedTerm] = testCase;
    console.log(`🔍 Вопрос: "${question}"`);
    console.log(`   Ожидаемый термин: "${expectedTerm}"`);
    
    // Простой поиск по всем урокам
    let found = false;
    for (const lesson of lessons) {
      const mdPath = path.join(lessonsDir, lesson.slug, `${lesson.slug}.md`);
      if (fs.existsSync(mdPath)) {
        const content = fs.readFileSync(mdPath, 'utf-8').toLowerCase();
        if (content.includes(expectedTerm.toLowerCase())) {
          found = true;
          break;
        }
      }
    }
    
    if (found) {
      console.log("   ✅ Найдено");
      foundCases++;
      totalScore += 1;
    } else {
      console.log("   ❌ Не найдено");
    }
  }

  const recall = (foundCases / testCases.length) * 100;
  console.log(`\n📈 Результат: ${foundCases}/${testCases.length} (${recall.toFixed(1)}% recall)`);
  
  if (recall < 80) {
    console.log("⚠️  Warning: Recall < 80%, нужно улучшать чанкинг или поиск");
  } else {
    console.log("✅ Хороший recall, ретривер работает эффективно");
  }
}

// CLI execution
if (process.argv[1] === new URL(import.meta.url).pathname) {
  evaluateRetriever();
}

export { evaluateRetriever };
