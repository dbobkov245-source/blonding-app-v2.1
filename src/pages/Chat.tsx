import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  image?: string | null;
  timestamp: string;
}

interface LessonContext {
  title: string;
  content: string;
  slug?: string;
}

interface LessonSummary {
  title: string;
  slug: string;
}

export default function EnhancedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Context State
  const [currentLesson, setCurrentLesson] = useState<LessonContext | null>(null);
  const [availableLessons, setAvailableLessons] = useState<LessonSummary[]>([]);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [text]);

  // Fetch available lessons on mount
  useEffect(() => {
    async function fetchLessons() {
      try {
        const res = await fetch('/lessons/index.json');
        if (!res.ok) throw new Error('Failed to fetch lessons');
        const data = await res.json();

        let lessons: LessonSummary[] = [];
        if (data.lessons) {
          // Flatten lessons from all modules
          Object.values(data.lessons).forEach((moduleLessons: any) => {
            if (Array.isArray(moduleLessons)) {
              lessons = [...lessons, ...moduleLessons];
            }
          });
        }
        setAvailableLessons(lessons);
      } catch (error) {
        console.error("Error loading lessons:", error);
      }
    }
    fetchLessons();
  }, []);

  // Fetch specific lesson content when selected
  const selectLesson = async (lesson: LessonSummary) => {
    setIsContextModalOpen(false);
    setLoading(true); // Temporary loading indication if needed, though we just switch context
    try {
      // Decode slug just in case, then fetch the markdown file
      // Construct path: /lessons/[slug]/[slug].md
      // The slug might need decoding/encoding depending on how it's stored. 
      // Typically public files are accessed via URL encoded paths.
      const res = await fetch(`/lessons/${lesson.slug}/${lesson.slug}.md`);
      if (!res.ok) {
        setCurrentLesson({ title: lesson.title, content: "" }); // Fallback
        alert("Не удалось загрузить текст урока. Контекст будет ограничен заголовком.");
        return;
      }
      let content = await res.text();
      // Remove frontmatter
      content = content.replace(/---[\s\S]*?---/, '');

      setCurrentLesson({
        title: lesson.title,
        content: content,
        slug: lesson.slug
      });
      setMessages([]); // Clear history on context switch? Usually good practice.
    } catch (e) {
      console.error("Error fetching lesson content", e);
    } finally {
      setLoading(false);
    }
  };

  const selectGeneralChat = () => {
    setCurrentLesson(null);
    setIsContextModalOpen(false);
    setMessages([]); // Clear history for fresh start
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string | null);
      };
      reader.readAsDataURL(file);
    }
  };

  const send = async (messageText: string = text, includeContext: boolean = true) => {
    if (!messageText.trim() && !uploadedImage) return;

    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      return;
    }
    setLastRequestTime(now);

    let fullPrompt = messageText;

    if (includeContext && currentLesson) {
      fullPrompt = `Контекст урока "${currentLesson.title}":\n${currentLesson.content.substring(0, 4000)}\n\nВопрос студента: ${messageText}`;
    }
    if (uploadedImage) {
      fullPrompt += `\n\n[Пользователь прикрепил изображение для анализа]`;
    }

    const userMessage: Message = {
      role: 'user',
      text: messageText,
      image: uploadedImage,
      timestamp: new Date().toISOString()
    };

    setMessages((m) => [...m, userMessage]);
    setText('');
    setUploadedImage(null);
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: fullPrompt, image: uploadedImage })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: { reply?: string; error?: string } = await res.json();

      const assistantMessage: Message = {
        role: 'assistant',
        text: json.reply || json.error || 'Нет ответа',
        timestamp: new Date().toISOString()
      };

      setMessages((m) => [...m, assistantMessage]);
    } catch (e) {
      const errorMessage: Message = {
        role: 'assistant',
        text: 'Ошибка при запросе к AI. Проверьте подключение.',
        timestamp: new Date().toISOString()
      };
      setMessages((m) => [...m, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  interface QuickQuestion {
    emoji: string;
    text: string;
  }

  const quickQuestions: QuickQuestion[] = [
    { emoji: '💡', text: 'Объясни проще' },
    { emoji: '📖', text: 'Приведи пример' },
    { emoji: '❓', text: 'Что это значит?' },
    { emoji: '‼', text: 'Какие ошибки можно допустить?' },
    { emoji: '➡', text: 'Дай пошаговую инструкцию' },
    { emoji: '🔍', text: 'Расскажи подробнее' }
  ];

  const handleQuickQuestion = (questionText: string) => {
    send(questionText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && text.trim()) {
        send();
      }
    }
  };

  const clearHistory = () => {
    if (window.confirm('Очистить историю чата?')) {
      setMessages([]);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  const filteredLessons = availableLessons.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)] relative">
      {/* Header */}
      <div className="flex-none px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-white z-10">
        <div
          onClick={() => setIsContextModalOpen(true)}
          className="cursor-pointer group hover:bg-slate-50 rounded-lg p-1 -ml-1 pr-3 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
              AI-консультант
            </h2>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px] sm:max-w-sm">
            {currentLesson ? currentLesson.title : 'Выбрать контекст урока'}
          </p>
        </div>
        <button
          onClick={clearHistory}
          className="text-xs text-red-500 hover:text-red-600 px-3 py-1.5 border border-red-200 rounded-lg"
        >
          Очистить
        </button>
      </div>

      {/* Context Selection Modal */}
      {isContextModalOpen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200">
          <div className="flex-none px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <button onClick={() => setIsContextModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="font-bold text-lg">Выбор контекста</h3>
          </div>

          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <input
              type="text"
              placeholder="Поиск урока..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <button
              onClick={selectGeneralChat}
              className={`w-full text-left p-3 rounded-xl mb-2 flex items-center gap-3 transition-colors ${!currentLesson ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50'
                }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!currentLesson ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                ∞
              </div>
              <div>
                <div className={`font-bold ${!currentLesson ? 'text-purple-900' : 'text-slate-800'}`}>Свободный чат</div>
                <div className="text-xs text-slate-500">Без привязки к конкретному уроку</div>
              </div>
              {!currentLesson && <div className="ml-auto text-purple-600">✓</div>}
            </button>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide px-3 py-2">Уроки</div>

            {filteredLessons.map((lesson) => (
              <button
                key={lesson.slug}
                onClick={() => selectLesson(lesson)}
                className={`w-full text-left p-3 rounded-xl mb-1 flex items-center gap-3 transition-colors ${currentLesson?.slug === lesson.slug ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50'
                  }`}
              >
                <div className="font-medium text-sm text-slate-700">{lesson.title}</div>
                {currentLesson?.slug === lesson.slug && <div className="ml-auto text-purple-600">✓</div>}
              </button>
            ))}

            {filteredLessons.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                Уроки не найдены
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick questions when empty - 3 row wrapped layout */}
      {messages.length === 0 && !isContextModalOpen && (
        <div className="flex-none p-3 bg-slate-50/80 border-b border-slate-100">
          <div className="flex flex-wrap justify-center gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q.text)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all shadow-sm active:scale-95"
              >
                {q.emoji} {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-5xl mb-3">🤖</div>
            <p className="text-base">{currentLesson ? 'Я изучил урок и готов помочь' : 'Задавайте любые вопросы'}</p>
            <p className="text-sm mt-1 text-slate-400">{currentLesson ? currentLesson.title : 'Qwen2.5-72B'}</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-sm'
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                }`}>
                {m.image && (
                  <img src={m.image} alt="Uploaded" className="max-w-full rounded-lg mb-2" />
                )}
                <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{m.text}</p>
                <p className={`text-xs mt-2 ${m.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                  {new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '75ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - Telegram/ChatGPT style */}
      <div className="flex-none bg-white border-t border-gray-100 p-3 sm:p-4">
        {uploadedImage && (
          <div className="mb-3 relative inline-block">
            <img src={uploadedImage} alt="Preview" className="h-16 rounded-lg border border-gray-200" />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        )}

        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickQuestion('Объясни проще')}
              className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100"
            >
              💡 Объясни проще
            </button>
            <button
              onClick={() => handleQuickQuestion('Приведи пример')}
              className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
            >
              📖 Приведи пример
            </button>
          </div>
        )}

        {/* Modern input container */}
        <div className="flex items-end gap-2 bg-gray-100 rounded-2xl p-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-purple-600 hover:bg-white transition-all"
            title="Прикрепить изображение"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 placeholder:text-gray-400 resize-none py-2.5 px-1 max-h-36 min-h-[40px] text-base leading-relaxed"
            placeholder="Сообщение..."
            rows={1}
          />

          <button
            onClick={() => send()}
            disabled={loading || (!text.trim() && !uploadedImage)}
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${text.trim() || uploadedImage
              ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700 active:scale-95'
              : 'bg-gray-200 text-gray-400'
              }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
