import React, { useState, useEffect, useRef } from 'react';

export default function EnhancedChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Загрузка истории чата из localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Сохранение истории при изменении
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Автопрокрутка
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загрузка контекста текущего урока
  const loadLessonContext = async () => {
    // В реальном приложении это будет props или параметр URL
    // Здесь имитация загрузки урока
    const mockLesson = {
      title: "Подготовка к блондированию",
      content: `
        Важные правила перед блондированием:
        1. Мыть волосы за сутки до процедуры
        2. Обязательно делать тестовую прядь
        3. Проверять эластичность волос
        4. Смешивать продукт маленькими порциями
      `
    };
    setCurrentLesson(mockLesson);
  };

  useEffect(() => {
    loadLessonContext();
  }, []);

  // Обработка загрузки изображения
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Отправка сообщения
  const send = async (messageText = text, includeContext = true) => {
    if (!messageText.trim() && !uploadedImage) return;

    let fullPrompt = messageText;

    // Добавляем контекст урока
    if (includeContext && currentLesson) {
      fullPrompt = `Контекст урока "${currentLesson.title}":\n${currentLesson.content}\n\nВопрос студента: ${messageText}`;
    }

    // Добавляем информацию об изображении
    if (uploadedImage) {
      fullPrompt += "\n\n[Пользователь прикрепил изображение для анализа]";
    }

    const userMessage = {
      role: 'user',
      text: messageText,
      image: uploadedImage,
      timestamp: new Date().toISOString()
    };

    setMessages(m => [...m, userMessage]);
    setText('');
    setUploadedImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: fullPrompt })
      });
      
      const json = await res.json();
      
      if (res.ok) {
        setMessages(m => [...m, {
          role: 'assistant',
          text: json.reply || 'Нет ответа',
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(m => [...m, {
          role: 'assistant',
          text: json.error || 'Ошибка API',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (e) {
      setMessages(m => [...m, {
        role: 'assistant',
        text: 'Ошибка при запросе к AI.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Быстрые вопросы
  const quickQuestions = [
    { emoji: '💡', text: 'Объясни проще' },
    { emoji: '📝', text: 'Приведи пример' },
    { emoji: '❓', text: 'Что это значит?' },
    { emoji: '⚠️', text: 'Какие ошибки можно допустить?' },
    { emoji: '🎯', text: 'Дай пошаговую инструкцию' },
    { emoji: '🔍', text: 'Расскажи подробнее' }
  ];

  const handleQuickQuestion = (questionText) => {
    setText(questionText);
    send(questionText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        send();
      }
    }
  };

  const clearHistory = () => {
    if (confirm('Очистить историю чата?')) {
      setMessages([]);
      localStorage.removeItem('chatHistory');
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Хедер */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI-консультант 🤖</h2>
          {currentLesson && (
            <p className="text-sm text-gray-600 mt-1">
              📚 Контекст: {currentLesson.title}
            </p>
          )}
        </div>
        <button
          onClick={clearHistory}
          className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded-md"
        >
          🗑️ Очистить историю
        </button>
      </div>

      {/* Быстрые вопросы */}
      {messages.length === 0 && (
        <div className="mb-4 bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            💬 Быстрые вопросы:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q.text)}
                className="px-3 py-1.5 bg-white border border-blue-200 rounded-full text-sm hover:bg-blue-100 transition-colors"
              >
                {q.emoji} {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Контейнер чата */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Сообщения */}
        <div className="h-[500px] overflow-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg">Задайте вопрос по уроку</p>
              <p className="text-sm mt-2">Я помогу разобраться в материале</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[75%] ${
                    m.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Аватар */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                      m.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    }`}
                  >
                    {m.role === 'user' ? '👤' : '🤖'}
                  </div>

                  {/* Сообщение */}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      m.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {/* Изображение если есть */}
                    {m.image && (
                      <img
                        src={m.image}
                        alt="Uploaded"
                        className="max-w-xs rounded-lg mb-2"
                      />
                    )}
                    
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    
                    {/* Временная метка */}
                    <p
                      className={`text-xs mt-2 ${
                        m.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Панель ввода */}
        <div className="border-t border-gray-200 p-4">
          {/* Превью загруженного изображения */}
          {uploadedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={uploadedImage}
                alt="Preview"
                className="h-20 rounded-lg border-2 border-blue-400"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          {/* Быстрые действия над текущим ответом */}
          {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => handleQuickQuestion('Объясни проще')}
                className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
              >
                💡 Объясни проще
              </button>
              <button
                onClick={() => handleQuickQuestion('Приведи пример')}
                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
              >
                📝 Приведи пример
              </button>
            </div>
          )}

          <div className="flex gap-2">
            {/* Кнопка загрузки изображения */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Прикрепить изображение"
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Поле ввода */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Задайте вопрос... (Shift+Enter для новой строки)"
              rows="2"
              onKeyDown={handleKeyDown}
            />

            {/* Кнопка отправки */}
            <button
              onClick={() => send()}
              disabled={loading || (!text.trim() && !uploadedImage)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Думаю...
                </span>
              ) : (
                '📤 Отправить'
              )}
            </button>
          </div>

          {/* Подсказка */}
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Совет: Вопросы автоматически учитывают контекст текущего урока
          </p>
        </div>
      </div>

      {/* Статистика */}
      {messages.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          📊 Сообщений в истории: {messages.length}
        </div>
      )}
    </div>
  );
}
