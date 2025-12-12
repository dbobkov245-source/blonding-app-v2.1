import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function ChatRaw() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const send = async (messageText: string = text) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(m => [...m, userMessage]);
    setText('');
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: messageText,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      const assistantMessage: Message = {
        role: 'assistant',
        text: json.reply || json.error || 'Нет ответа',
        timestamp: new Date().toISOString()
      };

      setMessages(m => [...m, assistantMessage]);
    } catch (e) {
      const errorMessage: Message = {
        role: 'assistant',
        text: 'Ошибка при запросе к AI. Проверьте подключение.',
        timestamp: new Date().toISOString()
      };
      setMessages(m => [...m, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Очистить историю чата?')) {
      setMessages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && text.trim()) {
        send();
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex-none px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Свободный чат</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Qwen2.5-72B • Без ограничений
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-red-500 hover:text-red-600 px-3 py-1.5 border border-red-200 rounded-lg"
          >
            Очистить
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🤖</div>
            <p className="text-base">Начните свободное общение с AI</p>
            <p className="text-sm mt-1">Задавайте любые вопросы без ограничений</p>
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

      {/* Input area - Telegram style */}
      <div className="flex-none bg-white border-t border-gray-100 p-3 sm:p-4">
        <div className="flex items-end gap-2 bg-gray-100 rounded-2xl p-1.5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 placeholder:text-gray-400 resize-none py-2.5 px-2 max-h-36 min-h-[40px] text-base leading-relaxed"
            placeholder="Сообщение..."
            rows={1}
          />

          <button
            onClick={() => send()}
            disabled={loading || !text.trim()}
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${text.trim()
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
        <p className="text-xs text-gray-400 mt-2 text-center">
          Модель: Qwen/Qwen2.5-72B-Instruct
        </p>
      </div>
    </div>
  );
}
