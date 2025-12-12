# Final UI/UX Updates Masterplan

## Задача
Внедрить современный дизайн (Telegram-style), улучшить UX чатов и исправить логику голосового ассистента.

---

## 1. Обновление `src/pages/Chat.tsx`
**Что нового:**
- Модальное окно для выбора контекста (конкретный урок или общий чат).
- Поле ввода в стиле мессенджеров (серая капсула, авто-высота).
- Быстрые вопросы в виде горизонтальной ленты.

**Код:**
```tsx
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
  slug: string;
}

interface LessonItem {
  slug: string;
  title: string;
}

interface ModuleData {
  name: string;
  slug: string;
  lessonsCount: number;
}

interface IndexData {
  modules: ModuleData[];
  lessons: Record<string, LessonItem[]>;
}

export default function EnhancedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [currentLesson, setCurrentLesson] = useState<LessonContext | null>(null);
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function fetchIndex() {
      try {
        const res = await fetch('/lessons/index.json');
        if (res.ok) {
          const data: IndexData = await res.json();
          setIndexData(data);
        }
      } catch (e) {
        console.error("Ошибка загрузки индекса уроков", e);
      }
    }
    fetchIndex();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const loadLessonContent = async (slug: string, title: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/lessons/${slug}/${slug}.md`);
      if (res.ok) {
        const rawText = await res.text();
        const cleanContent = rawText.replace(/---[\s\S]*?---/, '').trim();
        setCurrentLesson({ title, slug, content: cleanContent });
        setIsContextModalOpen(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `Контекст изменен на урок: "${title}". Я готов отвечать!`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (e) {
      console.error("Ошибка загрузки урока", e);
      alert("Не удалось загрузить текст урока");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Файл слишком большой (макс 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const send = async (messageText: string = text) => {
    if (!messageText.trim() && !uploadedImage) return;

    const now = Date.now();
    if (now - lastRequestTime < 2000) return; 
    setLastRequestTime(now);

    let fullPrompt = messageText;
    if (currentLesson) {
      fullPrompt = `Контекст урока "${currentLesson.title}":\n${currentLesson.content.substring(0, 3000)}...\n\nВопрос: ${messageText}`;
    } else {
      fullPrompt = messageText;
    }
    if (uploadedImage) fullPrompt += `\n\n[Изображение прикреплено]`;

    const userMessage: Message = {
      role: 'user',
      text: messageText,
      image: uploadedImage,
      timestamp: new Date().toISOString()
    };

    setMessages(m => [...m, userMessage]);
    setText('');
    setUploadedImage(null);
    setLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: fullPrompt, image: uploadedImage })
      });

      if (!res.ok) throw new Error();
      const json = await res.json();
      
      setMessages(m => [...m, {
        role: 'assistant',
        text: json.reply || 'Нет ответа',
        timestamp: new Date().toISOString()
      }]);
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        text: 'Ошибка связи с AI.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) send();
    }
  };

  const quickQuestions = [
    { emoji: '💡', text: 'Объясни проще' },
    { emoji: '📖', text: 'Приведи пример' },
    { emoji: '❓', text: 'Что это значит?' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] max-w-2xl mx-auto">
      <div className="flex-none px-4 py-2 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex flex-col overflow-hidden mr-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Контекст</span>
          <span className="text-sm font-bold text-slate-800 truncate leading-tight">
            {currentLesson ? currentLesson.title : "Общий чат"}
          </span>
        </div>
        <button onClick={() => setIsContextModalOpen(true)} className="shrink-0 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
          {currentLesson ? 'Изменить' : 'Выбрать урок'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-3xl">🤖</div>
            <h3 className="text-lg font-bold text-slate-700">AI-Консультант</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">Задайте вопрос по окрашиванию.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm sm:text-base leading-relaxed ${
              m.role === 'user' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
            }`}>
              {m.image && <img src={m.image} className="max-w-full rounded-lg mb-2" alt="upload" />}
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none bg-white border-t border-slate-100 p-2 sm:p-4 pb-safe">
        {messages.length > 0 && !loading && (
          <div className="flex gap-2 overflow-x-auto pb-3 px-1 no-scrollbar mask-gradient-r">
            {quickQuestions.map((q, i) => (
              <button key={i} onClick={() => { setText(q.text); send(q.text); }} className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium rounded-full hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors">
                {q.emoji} {q.text}
              </button>
            ))}
             <button onClick={() => setMessages([])} className="whitespace-nowrap px-3 py-1.5 bg-red-50 border border-red-100 text-red-500 text-xs font-medium rounded-full">🗑️</button>
          </div>
        )}

        {uploadedImage && (
            <div className="relative inline-block mb-2 ml-2">
               <img src={uploadedImage} className="h-16 w-16 object-cover rounded-xl border border-slate-200" />
               <button onClick={() => setUploadedImage(null)} className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">×</button>
            </div>
        )}

        <div className="flex items-end gap-2 bg-slate-100 p-1.5 rounded-[24px]">
           <button onClick={() => fileInputRef.current?.click()} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-purple-600 hover:bg-white transition-all active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
           </button>
           <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
           
           <textarea
             ref={textareaRef}
             value={text}
             onChange={(e) => setText(e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder={currentLesson ? "Вопрос по уроку..." : "Сообщение..."}
             className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 resize-none py-2.5 max-h-32 min-h-[40px] leading-relaxed"
             rows={1}
           />
           
           {text.trim() || uploadedImage ? (
             <button onClick={() => send()} className="shrink-0 w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all mb-0.5">
               <svg className="w-4 h-4 translate-x-0.5 -translate-y-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
             </button>
           ) : (<div className="w-2" />)}
        </div>
      </div>

      {isContextModalOpen && indexData && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Выбор контекста</h3>
              <button onClick={() => setIsContextModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              <button onClick={() => { setCurrentLesson(null); setIsContextModalOpen(false); }} className="w-full p-4 border border-slate-200 rounded-2xl flex items-center gap-3 hover:border-purple-500 hover:bg-purple-50 transition-all group">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-purple-100">🌍</div>
                 <div className="text-left"><div className="font-bold text-slate-700">Общий чат</div><div className="text-xs text-slate-500">Без привязки к уроку</div></div>
              </button>
              {indexData.modules.map((module) => (
                <div key={module.slug} className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{module.name}</h4>
                  <div className="space-y-1">
                    {indexData.lessons[module.slug]?.map((lesson) => (
                      <button key={lesson.slug} onClick={() => loadLessonContent(lesson.slug, lesson.title)} className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-colors ${currentLesson?.slug === lesson.slug ? 'bg-purple-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                         <span className="text-lg opacity-80">{currentLesson?.slug === lesson.slug ? '📖' : '📄'}</span>
                         <span className="text-sm font-medium line-clamp-1">{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
2. Обновление src/pages/Theory/[slug].tsx
import fs from 'fs';
import path from 'path';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import type { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';

interface Lesson {
  title: string;
  content: string;
  slug: string;
}

interface TheoryPageProps {
  lesson: Lesson | null;
}

const cleanMarkdown = (rawText: string): string => rawText.replace(/---[\s\S]*?---/, '');

interface LessonAIAssistantProps {
  lessonTitle: string;
  lessonContent: string;
}

const LessonAIAssistant: React.FC<LessonAIAssistantProps> = ({ lessonTitle, lessonContent }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const send = async (questionText = text) => {
    if (!questionText.trim()) return;

    const systemPrompt = `Ты — AI-помощник по уроку "${lessonTitle}". 
Отвечай на вопросы студента, используя ТОЛЬКО следующий контекст.
Не придумывай ничего, чего нет в тексте.

КОНТЕКСТ УРОКА:
${lessonContent.substring(0, 3000)}...`;

    const inputs = questionText;

    setMessages((m) => [...m, { role: 'user', text: questionText }]);
    setText('');
    setLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: inputs,
          systemPrompt: systemPrompt
        }),
      });

      if (!res.ok) throw new Error();
      const json = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: json.reply || 'Нет ответа' }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Ошибка связи с AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) send();
    }
  };

  const quickActions = [
    { emoji: '💡', text: 'Объясни проще' },
    { emoji: '📖', text: 'Приведи пример' },
    { emoji: '❓', text: 'Что это значит?' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden my-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between transition-all ${
          isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'bg-white hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isExpanded ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
          }`}>
            <span className="text-xl">🤖</span>
          </div>
          <div className="text-left">
            <div className="font-bold text-slate-800 text-sm">AI-Помощник</div>
            <div className="text-xs text-slate-500">
              {isExpanded ? 'Задайте вопрос по этому уроку' : 'Нажмите, если есть вопросы'}
            </div>
          </div>
        </div>
        <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="bg-slate-50/50">
          <div className="max-h-[400px] overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.length === 0 && (
               <div className="text-center py-6 text-slate-400 text-sm">
                 <p>Я прочитал этот урок и готов отвечать.</p>
               </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                 <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            {!loading && messages.length === 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 px-1 no-scrollbar">
                {quickActions.map((q, i) => (
                  <button key={i} onClick={() => send(q.text)} className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium rounded-full hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors">
                    {q.emoji} {q.text}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 bg-slate-100 p-1.5 rounded-[24px]">
               <textarea
                 ref={textareaRef}
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Вопрос по уроку..."
                 className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 resize-none py-2.5 max-h-32 min-h-[40px] text-sm leading-relaxed"
                 rows={1}
               />
               
               {text.trim() ? (
                 <button onClick={() => send()} className="shrink-0 w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md hover:bg-purple-700 transition-all mb-0.5 active:scale-95">
                   <svg className="w-4 h-4 translate-x-0.5 -translate-y-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </button>
               ) : (<div className="w-2" />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TheoryPage: React.FC<TheoryPageProps> = ({ lesson }) => {
  if (!lesson) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <h1 className="text-xl font-bold mb-4 text-slate-900">Урок не найден</h1>
          <Link href="/" className="text-purple-600 font-medium hover:underline">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{lesson.title} | Blonding Course</title>
      </Head>
      <article className="space-y-6 pb-8">
        <div className="pt-2">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            К списку
          </Link>
        </div>
        <header>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {lesson.title}
          </h1>
        </header>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="prose prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-purple-600 hover:prose-a:text-purple-500 max-w-none">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        </div>
        <LessonAIAssistant lessonTitle={lesson.title} lessonContent={lesson.content} />
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-center shadow-lg shadow-purple-200">
          <h3 className="text-lg font-bold text-white mb-2">Готовы проверить себя?</h3>
          <p className="text-purple-100 text-sm mb-4">Закрепите знания, пройдя короткий тест</p>
          <Link href={`/Test/${lesson.slug}`} className="inline-block px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-md active:scale-95">
            Пройти тест →
          </Link>
        </div>
      </article>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  let lessons: { slug: string }[] = [];
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    const indexData = JSON.parse(data);
    if (indexData.modules && indexData.lessons) {
      lessons = Object.values(indexData.lessons).flat() as { slug: string }[];
    } else {
      lessons = indexData;
    }
  } catch (e) {
    console.warn("index.json not found");
  }
  const paths = lessons.map((lesson) => ({ params: { slug: lesson.slug } }));
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };
  try {
    const decodedSlug = decodeURIComponent(slug);
    const mdPath = path.join(process.cwd(), 'public', 'lessons', decodedSlug, `${decodedSlug}.md`);
    if (!fs.existsSync(mdPath)) return { props: { lesson: null } };
    const rawText = fs.readFileSync(mdPath, 'utf-8');
    const content = cleanMarkdown(rawText);
    const titleMatch = rawText.match(/title:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : decodedSlug;
    return { props: { lesson: { title, content, slug: decodedSlug } } };
  } catch (e: any) {
    return { props: { lesson: null } };
  }
};

export default TheoryPage;
3. Обновление src/pages/Assistant/index.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

const synthesisAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

interface VoiceMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isVoiceInput?: boolean;
}

export default function VoiceAssistant() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages, recognizedText]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const sendMessage = useCallback(async (text: string, isVoiceInput = false) => {
    if (!text.trim()) return;

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    const userMsg: VoiceMessage = {
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
      isVoiceInput,
    };

    setMessages((m) => [...m, userMsg]);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: text,
          systemPrompt: `Ты — голосовой ассистент для колориста. Твои ответы должны быть краткими (1-3 предложения).`,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const json = await res.json();
      const assistantMsg: VoiceMessage = {
        role: 'assistant',
        text: json.reply || 'Нет ответа',
        timestamp: new Date().toISOString(),
      };

      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages((m) => [...m, { role: 'assistant', text: 'Ошибка связи.', timestamp: new Date().toISOString() }]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, []);

  const toggleSpeech = (text: string, index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (playingIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ru-RU';
    utter.rate = 1.0;
    
    utter.onend = () => { setPlayingIndex(null); };
    utter.onerror = () => { setPlayingIndex(null); };

    window.speechSynthesis.speak(utter);
    setPlayingIndex(index);
  };

  const toggleRecording = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает голосовой ввод");
      return;
    }

    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.lang = 'ru-RU';
      rec.interimResults = true;
      rec.continuous = false;

      rec.onresult = (e: any) => {
        let final = '';
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        setRecognizedText(final || interim);
        if (final) {
          setTimeout(() => {
            sendMessage(final, true);
            setRecognizedText('');
          }, 400);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        setRecognizedText('');
      };
      
      recognitionRef.current = rec;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setRecognizedText('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex flex-col p-4">
      <div className="flex-none mb-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 text-center border border-purple-50 relative overflow-hidden">
           {isRecording && <div className="absolute inset-0 bg-red-50 animate-pulse z-0" />}
           <div className="relative z-10">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{isRecording ? 'Говорите...' : 'Нажмите и говорите'}</h2>
              <button
                onClick={toggleRecording}
                disabled={isLoading}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 mx-auto shadow-lg mb-4 ${
                  isRecording ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-gradient-to-br from-purple-600 to-indigo-600 hover:scale-105 shadow-purple-200'
                } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <span className="text-4xl text-white">{isRecording ? '⏹' : '🎤'}</span>
              </button>
              <div className="h-6">
                 {recognizedText ? (
                   <p className="text-sm text-slate-600 animate-fade-in font-medium">"{recognizedText}"</p>
                 ) : (
                   <p className="text-xs text-slate-400">Коснитесь, чтобы спросить</p>
                 )}
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar pb-4">
        {messages.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">История диалога пуста</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className="flex flex-col gap-1 max-w-[85%]">
               <div className={`px-5 py-4 rounded-2xl text-base leading-relaxed shadow-sm ${
                 msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
               }`}>
                 <p>{msg.text}</p>
               </div>
               {msg.role === 'assistant' && synthesisAvailable && (
                 <button
                   onClick={() => toggleSpeech(msg.text, i)}
                   className={`self-start mt-1 flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 ${
                     playingIndex === i ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-white text-purple-600 border border-purple-100 shadow-sm hover:bg-purple-50'
                   }`}
                 >
                   {playingIndex === i ? (<><span className="animate-pulse">⏹</span><span className="text-sm font-bold">Стоп</span></>) : (<><span>🔊</span><span className="text-sm font-medium">Слушать</span></>)}
                 </button>
               )}
               <span className={`text-[10px] text-slate-400 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                 {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
               <div className="flex gap-1.5">
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && (
         <div className="flex-none flex justify-center pt-2">
            <button onClick={() => { if(confirm('Удалить историю?')) setMessages([]); }} className="text-xs text-slate-400 flex items-center gap-1 hover:text-red-500 transition-colors py-2">
              🗑 Очистить историю
            </button>
         </div>
      )}
    </div>
  );
}