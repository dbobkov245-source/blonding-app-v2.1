import * as fs from 'fs';

/**
 * Нормализует correctAnswer: конвертирует индекс (number) в текст ответа (string)
 */
export function normalizeQuizQuestion(item: {
    options: string[];
    correctAnswer: number | string;
}) {
    return {
        ...item,
        correctAnswer:
            typeof item.correctAnswer === 'number'
                ? item.options[item.correctAnswer]
                : item.correctAnswer,
    };
}

/**
 * Загружает и парсит quiz файл, возвращает нормализованные вопросы
 */
export function loadQuiz(quizPath: string) {
    if (!fs.existsSync(quizPath)) {
        return [];
    }

    const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
    const rawQuiz = Array.isArray(quizData) ? quizData : (quizData.questions || []);

    return rawQuiz.map(normalizeQuizQuestion);
}

/**
 * Валидирует структуру урока из index.json
 */
export function validateLessonStructure(lesson: unknown): lesson is {
    slug: string;
    title: string;
    module?: string;
} {
    if (typeof lesson !== 'object' || lesson === null) return false;
    const l = lesson as Record<string, unknown>;
    return typeof l.slug === 'string' && typeof l.title === 'string';
}

/**
 * Загружает index.json и возвращает все уроки
 */
export function loadLessonsIndex(indexPath: string) {
    if (!fs.existsSync(indexPath)) {
        return [];
    }

    const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

    // Поддержка нового формата с модулями
    if (data.modules && data.lessons) {
        return Object.values(data.lessons).flat();
    }

    return data;
}
