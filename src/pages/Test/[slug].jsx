import React, { useState } from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface TestPageProps {
  quiz: QuizItem[];
  lessonSlug: string;
}

function TestPage({ quiz, lessonSlug }: TestPageProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const handleAnswerClick = (questionIndex: number, selectedOption: string) => {
    if (selectedAnswers[questionIndex] !== undefined) {
      return;
    }
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: selectedOption,
    });
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
  };

  const getButtonClass = (questionIndex: number, option: string) => {
    const isSelected = selectedAnswers[questionIndex] === option;
    const isCorrect = quiz[questionIndex]?.correctAnswer === option;
    const answerGiven = selectedAnswers[questionIndex] !== undefined;

    if (!answerGiven) {
      return 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100';
    }
    if (isCorrect) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    return 'bg-slate-50 border-slate-200 text-gray-700 opacity-70';
  };

  const correctCount = quiz.filter((item, index) => selectedAnswers[index] === item.correctAnswer).length;
  const total = quiz.length;
  const allAnswered = Object.keys(selectedAnswers).length === total;

  if (quiz.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Тест для урока "{lessonSlug}" не найден</h1>
        <p className="text-gray-600">Добавьте файл {lessonSlug}-quiz.json в public/content/quizzes/</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          {'<'} Вернуться на главную
        </Link>
      </div>

      <header className="text-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          Тест: {lessonSlug}
        </h1>
        <p className="text-lg text-gray-600">
          Проверьте свои знания.
        </p>
      </header>

      <div className="space-y-6">
        {quiz.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {index + 1}. {item.question}
            </h3>
            <div className="space-y-2">
              {item.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerClick(index, option)}
                  disabled={selectedAnswers[index] !== undefined}
                  className={`
                    w-full p-3 rounded-md border text-left transition-colors
                    ${getButtonClass(index, option)}
                  `}
                >
                  <span className="flex items-center">
                    {selectedAnswers[index] !== undefined &&
                      item.correctAnswer === option && (
                        <span className="w-4 h-4 mr-2">✓</span>
                      )}
                    {selectedAnswers[index] === option &&
                      item.correctAnswer !== option && (
                        <span className="w-4 h-4 mr-2">X</span>
                      )}
                    {option}
                  </span>
                </button>
              ))}
            </div>
            {selectedAnswers[index] !== undefined && (
              <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-md">
                <p className="font-semibold text-blue-800">Объяснение:</p>
                <p className="text-sm text-gray-800">{item.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {allAnswered && (
        <div className="mt-8 p-4 bg-green-100 rounded-lg text-center">
          <h3 className="text-xl font-bold">Результат: {correctCount} / {total}</h3>
        </div>
      )}

      <div className="text-center mt-8">
        <button
          onClick={resetQuiz}
          className="font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-center transition-colors inline-flex items-center"
        >
          <span className="mr-2">↻</span>
          Сбросить тест
        </button>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  let lessons = [];
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    lessons = JSON.parse(data);
  } catch (e) {
    console.warn("index.json not found for getStaticPaths in Test");
  }

  const paths = lessons.map(lesson => ({
    params: { slug: lesson.slug },
  }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  let quiz: QuizItem[] = [];
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'content', 'quizzes', `${slug}-quiz.json`);  // Исправленный путь: ${slug}-quiz.json
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf-8');
      quiz = JSON.parse(data);
    } else {
      console.warn(`Quiz file not found: ${jsonPath}`);
    }
  } catch (e) {
    console.error(`Error loading quiz for slug: ${slug}`, e.message);
  }

  return {
    props: {
      quiz,
      lessonSlug: slug,
    },
  };
}

export default TestPage;
