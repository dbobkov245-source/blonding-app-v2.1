import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Мы не будем импортировать 'lucide-react', чтобы не было ошибки
// Вместо иконок будем использовать эмодзи

function TestPage() {
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    // Мы загружаем JSON из папки /public
    fetch('/content/quizzes/lesson-1-quiz.json')
      .then(res => res.json())
      .then(data => {
        setQuiz(data);
      })
      .catch(err => console.error("Ошибка загрузки теста:", err));
  }, []);

  // Срабатывает при клике на вариант
  const handleAnswerClick = (questionIndex, selectedOption) => {
    if (selectedAnswers[questionIndex] !== undefined) {
      return;
    }
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: selectedOption,
    });
  };

  // Сброс теста
  const resetQuiz = () => {
    setSelectedAnswers({});
  };

  // Определяет, как покрасить кнопку
  const getButtonClass = (questionIndex, option) => {
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

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* --- Кнопка Назад (Используем <Link href> из Next.js) --- */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          {'<'} Вернуться на главную
        </Link>
      </div>

      {/* --- Заголовок --- */}
      <header className="text-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          Тест: Урок 1
        </h1>
        <p className="text-lg text-gray-600">
          Проверьте свои знания по подготовке к блондированию.
        </p>
      </header>

      {/* --- Контейнер с вопросами --- */}
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
                    {/* Показываем эмодзи вместо иконок */}
                    {selectedAnswers[index] !== undefined && item.correctAnswer === option && (
                      <span className="w-4 h-4 mr-2">✅</span>
                    )}
                    {selectedAnswers[index] === option && item.correctAnswer !== option && (
                      <span className="w-4 h-4 mr-2">❌</span>
                    )}
                    {option}
                  </span>
                </button>
              ))}
            </div>

            {/* Объяснение */}
            {selectedAnswers[index] !== undefined && (
              <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-md">
                <p className="font-semibold text-blue-800">Объяснение:</p>
                <p className="text-sm text-gray-800">{item.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- Кнопка "Сбросить" --- */}
      <div className="text-center mt-8">
        <button
          onClick={resetQuiz}
          className="font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-center transition-colors inline-flex items-center"
        >
          <span className="mr-2">🔄</span>
          Сбросить тест
        </button>
      </div>
    </div>
  );
}

export default TestPage;
