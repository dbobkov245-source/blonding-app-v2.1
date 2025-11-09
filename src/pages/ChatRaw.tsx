import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function ChatRaw() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemPromptInput, setSystemPromptInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async (messageText = text) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(m => [...m, userMessage]);
    setText('');
    setLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputs: messageText,
          systemPrompt: systemPromptInput || undefined
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
        text: 'Ошибка при запросе к AI. Проверьте подключение или попробуйте позже.',
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
      if (!loading) {
        send();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Чат с ИИ</h2>
          <p className="text-sm text-gray-600 mt-1">
            Общайтесь с моделью Qwen2.5-72B без специализированного контекста
          </p>
        </div>
        <button 
          onClick={clearHistory} 
          className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded-md"
        >
          Очистить историю
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Системный промпт (необязательно):
        </label>
        <textarea
          value={systemPromptInput}
          onChange={(e) => setSystemPromptInput(e.target.value)}
          placeholder="Оставьте пустым для стандартного поведения"
          className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="h-[500px] overflow-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-lg">Начните общение с AI</p>
              <p className="text-sm mt-2">Задайте любой вопрос или просто поболтайте</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                    m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                  }`}>
                    {m.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <p className={`text-xs mt-2 ${m.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ваше сообщение... (Shift+Enter для новой строки)"
              rows={2}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => send()}
              disabled={loading || !text.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Думает...
                </span>
              ) : (
                'Отправить'
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Модель: Qwen/Qwen2.5-72B-Instruct • Без специализированного контекста
          </p>
        </div>
      </div>
    </div>
  );
}
