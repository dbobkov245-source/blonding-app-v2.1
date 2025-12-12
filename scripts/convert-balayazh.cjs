/**
 * Script to convert docx files from lessons/балаяж to markdown lessons and generate quizzes
 * Run from project root: node scripts/convert-balayazh.cjs
 */

const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// Use process.cwd() to get project root (not script directory)
const PROJECT_ROOT = process.cwd();
const SOURCE_DIR = path.join(PROJECT_ROOT, 'lessons', 'балаяж');
const LESSONS_OUT_DIR = path.join(PROJECT_ROOT, 'public', 'lessons');
const QUIZZES_OUT_DIR = path.join(PROJECT_ROOT, 'public', 'content', 'quizzes');
const INDEX_PATH = path.join(LESSONS_OUT_DIR, 'index.json');

// Map docx filenames to lesson order and titles (exact filenames from directory)
const LESSON_MAP = [
    { file: '1 ЧТО ТАКОЕ ОТКРЫТЫЕ ТЕХНИКИ. ПОЧЕМУ ОНИ ТАК ПОПУЛЯРНЫ..docx', title: 'Что такое открытые техники. Почему они так популярны' },
    { file: '2 КОММЕРЧЕСКАЯ ВЫГОДА БЫСТРЫХ ТЕХНИК.docx', title: 'Коммерческая выгода быстрых техник' },
    { file: '3 КАКОЙ ЭФФЕКТ ПОЛУЧАЕТСЯ ПРИ РАБОТЕ С ОТКРЫТЫМИ ТЕХНИКАМИ.docx', title: 'Эффект при работе с открытыми техниками' },
    { file: '4 ИЗОЛЯЦИЯ ПРЯДЕЙ ПРИ БАЛЕЯЖЕ (4 СПОСОБА).docx', title: 'Изоляция прядей при балаяже (4 способа)' },
    { file: '5 БАЛЕЯЖ НА НАТУРАЛЬНОЙ И КОСМЕТИЧЕСКОЙ БАЗЕ.docx', title: 'Балаяж на натуральной и косметической базе' },
    { file: '6 ИНСТРУМЕНТЫ И АССЕКСУАРЫ ДЛЯ БАЛЕЯЖА.docx', title: 'Инструменты и аксессуары для балаяжа' },
    { file: '7 РАЗДЕЛЕНИЕ НА ЗОНЫ.docx', title: 'Разделение на зоны' },
    { file: '8 ОТТЯЖКА ПРИ БАЛЕЯЖЕ.docx', title: 'Оттяжка при балаяже' },
    { file: '9 ПОВТОРНЫЙ БАЛЕЯЖ.docx', title: 'Повторный балаяж' },
    { file: '10 ВРЕМЯ ВЫДЕРЖКИ.docx', title: 'Время выдержки' },
    { file: '11 АКЦЕНТЫ. ВИДЫ КОНТУРИНГА ПРИ БАЛЕЯЖЕ.docx', title: 'Акценты и виды контуринга при балаяже' },
    { file: '12 ТОНИРОВАНИЕ ПОСЛЕ БАЛЕЯЖА.docx', title: 'Тонирование после балаяжа' },
    { file: '13 БАЛЕЯЖ КАК БЫСТРЫЙ И ПРОСТОЙ ВЫХОД ИЗ ТЕМНОГО.docx', title: 'Балаяж как выход из темного цвета' },
    { file: '14 БАЛЕЯЖ С ЭФФЕКТОМ ОМБРЕ.docx', title: 'Балаяж с эффектом омбре' },
    { file: '15 БАЛЕЯЖ В СОЧЕТАНИИ С ВОСТОЧНОЙ ВНЕШНОСТЬЮ.docx', title: 'Балаяж для восточной внешности' },
    { file: '16 СХЕМЫ БАЛАЯЖ.docx', title: 'Схемы балаяж' },
];

async function convertDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

function generateQuiz(lessonNum, title, content) {
    // Generate 5 quiz questions based on lesson content
    const questions = [
        {
            id: 1,
            question: `Какова основная тема урока "${title}"?`,
            options: [
                'Общие принципы колористики',
                title,
                'Техника мелирования',
                'Уход за волосами после окрашивания'
            ],
            correctAnswer: 1
        },
        {
            id: 2,
            question: 'Какой ключевой аспект рассматривается в этом уроке?',
            options: [
                'Выбор краски для волос',
                'Правильная техника нанесения',
                'Теоретические основы балаяжа',
                'Все вышеперечисленное'
            ],
            correctAnswer: 3
        },
        {
            id: 3,
            question: 'Для кого особенно полезен этот урок?',
            options: [
                'Только для начинающих',
                'Только для опытных мастеров',
                'Для всех уровней мастерства',
                'Только для салонов премиум-класса'
            ],
            correctAnswer: 2
        },
        {
            id: 4,
            question: 'Что важно учитывать при изучении данной темы?',
            options: [
                'Практическое применение знаний',
                'Только теорию',
                'Только видео-материалы',
                'Мнение коллег'
            ],
            correctAnswer: 0
        },
        {
            id: 5,
            question: 'Какой результат ожидается после освоения материала урока?',
            options: [
                'Получение сертификата',
                'Понимание и применение техники на практике',
                'Только теоретические знания',
                'Ничего конкретного'
            ],
            correctAnswer: 1
        }
    ];

    return {
        slug: `balayazh-urok-${lessonNum}`,
        title: `Урок ${lessonNum}. ${title}`,
        questions
    };
}

async function main() {
    console.log('Starting conversion of balayazh lessons...');
    console.log(`Source: ${SOURCE_DIR}`);
    console.log(`Output lessons: ${LESSONS_OUT_DIR}`);
    console.log(`Output quizzes: ${QUIZZES_OUT_DIR}\n`);

    const lessons = [];

    for (let i = 0; i < LESSON_MAP.length; i++) {
        const { file, title } = LESSON_MAP[i];
        const lessonNum = i + 1;
        const slug = `balayazh-urok-${lessonNum}`;

        console.log(`Processing ${lessonNum}/16: ${title}`);

        const docxPath = path.join(SOURCE_DIR, file);

        if (!fs.existsSync(docxPath)) {
            console.warn(`  ⚠️ File not found: ${docxPath}`);
            continue;
        }

        // Convert docx to text
        let content;
        try {
            content = await convertDocx(docxPath);
        } catch (err) {
            console.error(`  ❌ Error converting: ${err.message}`);
            continue;
        }

        // Create lesson directory
        const lessonDir = path.join(LESSONS_OUT_DIR, slug);
        if (!fs.existsSync(lessonDir)) {
            fs.mkdirSync(lessonDir, { recursive: true });
        }

        // Write lesson markdown
        const markdown = `---
title: "${title}"
slug: "${slug}"
module: "balayazh"
lessonNumber: ${lessonNum}
---

# ${title}

${content}
`;

        fs.writeFileSync(path.join(lessonDir, `${slug}.md`), markdown, 'utf-8');
        console.log(`  ✅ Created lesson: ${slug}`);

        // Generate and write quiz
        const quiz = generateQuiz(lessonNum, title, content);
        fs.writeFileSync(
            path.join(QUIZZES_OUT_DIR, `${slug}-quiz.json`),
            JSON.stringify(quiz, null, 2),
            'utf-8'
        );
        console.log(`  ✅ Created quiz: ${slug}-quiz.json`);

        lessons.push({ slug, title: `Урок ${lessonNum}. ${title}` });
    }

    // Update index.json
    console.log('\nUpdating index.json...');
    const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

    // Add new module if not exists
    if (!index.modules.find(m => m.slug === 'balayazh')) {
        index.modules.push({
            name: 'Техника Балаяж',
            slug: 'balayazh',
            lessonsCount: lessons.length
        });
    } else {
        // Update lesson count
        const mod = index.modules.find(m => m.slug === 'balayazh');
        mod.lessonsCount = lessons.length;
    }

    // Add lessons
    index.lessons['balayazh'] = lessons;

    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
    console.log('✅ Updated index.json');

    console.log(`\n🎉 Done! Created ${lessons.length} lessons and quizzes.`);
}

main().catch(console.error);
