import * as path from 'path';
import * as fs from 'fs';
import { normalizeQuizQuestion, loadQuiz, validateLessonStructure, loadLessonsIndex } from '../src/lib/quizUtils';

describe('Quiz Utils', () => {
    describe('normalizeQuizQuestion', () => {
        it('should convert number correctAnswer to string', () => {
            const question = {
                question: 'Test?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 1,
            };

            const result = normalizeQuizQuestion(question);
            expect(result.correctAnswer).toBe('B');
        });

        it('should keep string correctAnswer as is', () => {
            const question = {
                question: 'Test?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'B',
            };

            const result = normalizeQuizQuestion(question);
            expect(result.correctAnswer).toBe('B');
        });

        it('should handle index 0 correctly', () => {
            const question = {
                question: 'Test?',
                options: ['First', 'Second', 'Third'],
                correctAnswer: 0,
            };

            const result = normalizeQuizQuestion(question);
            expect(result.correctAnswer).toBe('First');
        });
    });

    describe('validateLessonStructure', () => {
        it('should return true for valid lesson', () => {
            const lesson = { slug: 'test-lesson', title: 'Test Lesson' };
            expect(validateLessonStructure(lesson)).toBe(true);
        });

        it('should return true for lesson with module', () => {
            const lesson = { slug: 'test', title: 'Test', module: 'theory' };
            expect(validateLessonStructure(lesson)).toBe(true);
        });

        it('should return false for missing slug', () => {
            const lesson = { title: 'Test' };
            expect(validateLessonStructure(lesson)).toBe(false);
        });

        it('should return false for null', () => {
            expect(validateLessonStructure(null)).toBe(false);
        });

        it('should return false for non-object', () => {
            expect(validateLessonStructure('string')).toBe(false);
        });
    });

    describe('loadLessonsIndex', () => {
        const indexPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');

        it('should load lessons from index.json', () => {
            if (!fs.existsSync(indexPath)) {
                console.warn('index.json not found, skipping test');
                return;
            }

            const lessons = loadLessonsIndex(indexPath);
            expect(Array.isArray(lessons)).toBe(true);
            expect(lessons.length).toBeGreaterThan(0);
        });

        it('should return empty array for non-existent file', () => {
            const lessons = loadLessonsIndex('/non/existent/path.json');
            expect(lessons).toEqual([]);
        });
    });

    describe('loadQuiz', () => {
        it('should return empty array for non-existent quiz', () => {
            const quiz = loadQuiz('/non/existent/quiz.json');
            expect(quiz).toEqual([]);
        });

        it('should load and normalize quiz from file', () => {
            const quizPath = path.join(process.cwd(), 'public', 'content', 'quizzes', 'urok-1-quiz.json');

            if (!fs.existsSync(quizPath)) {
                console.warn('Quiz file not found, skipping test');
                return;
            }

            const quiz = loadQuiz(quizPath);
            expect(Array.isArray(quiz)).toBe(true);

            // Проверяем что correctAnswer - строка
            quiz.forEach((q: { correctAnswer: unknown }) => {
                expect(typeof q.correctAnswer).toBe('string');
            });
        });
    });
});
