import React, { useState } from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

// --- Компонент для отображения результатов ---
function QuizResults({ score, total, lessonSlug }) {
  const percentage = Math.round((score / total) * 100);

  const messages = {
    excellent: { emoji: '🎉', text: 'Превосходно! Вы отлично усвоили материал.' },
    good: { emoji: '👍', text: 'Хорошая работа! Повторите некоторые моменты.' },
    needsWork: { emoji: '📚', text: 'Требуется повторение. Изучите урок еще раз.' }
  };

  let resultMessage;
  let bgColor;

  if (percentage >= 80) {
    resultMessage = messages.excellent;
    bgColor = 'bg-green-50 border-green-300';
  } else if (percentage >= 60) {
    resultMessage = messages.good;
    bgColor = 'bg-yellow-50 border-yellow-300';
  } else {
    resultMessage = messages.needsWork;
    bgColor = 'bg-red-50 border-red-300';
  }

  return (
    <div className={`p-6 rounded-lg border-2 ${bgColor} text-center`}>
      <div className="text-5xl mb-4">{resultMessage.emoji}</div>
      <h2 className="text-2xl font-bold mb-2">{resultMessage.text}</h2>
      <p className="text-lg mb-4">
        Ваш результат: <strong>{score}</strong> из <strong>{total}</strong> ({percentage}%)
      </p>
      <div className="flex justify-center gap-4">
        <Link 
          href={`/Theory/${lessonSlug}`}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Вернуться к уроку
        </Link>
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}


// --- Основной компонент страницы теста ---
export default function TestPage({ quiz, lessonSlug, lessonTitle }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = quiz || [];
  const totalQuestions = questions.length;

  const handleAnswerSelect = (questionIndex, option) => {
    // Не даём изменить ответ
    if (selectedAnswers[questionIndex] !== undefined) return;

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option,
    });
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return selectedAnswers[index] === question.correctAnswer ? score + 1 : score;
    }, 0);
  };

  const allAnswered = Object.keys(selectedAnswers).length === totalQuestions;
  const score = calculateScore();

  if (totalQuestions === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Тест не найден</h1>
        <p>Для этого урока тест еще не создан.</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          На главную
        </Link>
      </div>
    );
  }

  // --- Отображение результатов ---
  if (showResults) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Результаты теста: {lessonTitle}</h1>
        <QuizResults score={score} total={totalQuestions} lessonSlug={lessonSlug} />
      </div>
    );
  }

  // --- Отображение вопросов теста ---
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Тест: {lessonTitle}</h1>
      <p className="text-gray-600 mb-6">Проверьте свои знания по уроку.</p>

      <div className="space-y-8">
        {questions.map((item, qIndex) => {
          const answerGiven = selectedAnswers[qIndex] !== undefined;
          const isCorrect = selectedAnswers[qIndex] === item.correctAnswer;

          return (
            <div key={qIndex} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {qIndex + 1}. {item.question}
              </h3>
              <div className="space-y-3">
                {item.options.map((option, oIndex) => {
                  const isSelected = selectedAnswers[qIndex] === option;
                  let btnClass = 'bg-white hover:bg-gray-50 border-gray-300';

                  if (answerGiven) {
                    if (option === item.correctAnswer) {
                      btnClass = 'bg-green-100 border-green-400 text-green-800'; // Всегда зелёный для правильного
                    } else if (isSelected) {
                      btnClass = 'bg-red-100 border-red-400 text-red-800'; // Красный, если выбрал неверно
                    } else {
                      btnClass = 'bg-gray-100 border-gray-200 text-gray-500 opacity-70'; // Нейтральный для остальных
                    }
                  }

                  return (
                    <button
                      key={oIndex}
                      onClick={() => handleAnswerSelect(qIndex, option)}
                      disabled={answerGiven}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${btnClass} ${!answerGiven ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {answerGiven && (
                <div className={`mt-4 p-3 rounded-md ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="font-semibold">{isCorrect ? 'Верно!' : 'Неверно.'}</p>
                  <p className="text-sm text-gray-700">{item.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allAnswered && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowResults(true)}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Показать результаты
          </button>
        </div>
      )}
    </div>
  );
}


// --- Загрузка данных (SSG) ---

export async function getStaticPaths() {
  const quizzesIndexPath = path.join(process.cwd(), 'public', 'content', 'quizzes', 'index.json');
  let paths = [];

  try {
    const indexData = fs.readFileSync(quizzesIndexPath, 'utf-8');
    const quizzes = JSON.parse(indexData);
    paths = quizzes.map(quiz => ({
      params: { slug: quiz.slug },
    }));
  } catch (e) {
    console.error("Failed to read quizzes/index.json for getStaticPaths:", e.message);
  }

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const quizPath = path.join(process.cwd(), 'public', 'content', 'quizzes', `${slug}-quiz.json`);
  const lessonIndexPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');

  try {
    // 1. Читаем JSON теста
    const quizData = fs.readFileSync(quizPath, 'utf-8');
    const quiz = JSON.parse(quizData);

    // 2. Находим заголовок урока из индекса уроков
    const lessonIndexData = fs.readFileSync(lessonIndexPath, 'utf-8');
    const lessons = JSON.parse(lessonIndexData);
    const lesson = lessons.find(l => l.slug === slug);
    const lessonTitle = lesson ? lesson.title : slug;

    return {
      props: {
        quiz,
        lessonSlug: slug,
        lessonTitle,
      },
    };
  } catch (e) {
    console.error(`Failed to load quiz for slug ${slug}:`, e.message);
    return {
      props: {
        quiz: null,
        lessonSlug: slug,
        lessonTitle: slug,
      },
    };
  }
}
