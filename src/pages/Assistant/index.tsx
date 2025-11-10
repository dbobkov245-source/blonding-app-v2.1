import React, { useState, useRef, useEffect, useCallback } from 'react'; // Добавлен useCallback

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
  const [isMobile, setIsMobile] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ---------- Отправка запроса (useCallback для стабильности) ---------- */
  const sendMessage = useCallback(async (text: string, isVoiceInput = false) => {
    if (!text.trim()) return;

    // ✅ Защита от спама (2 сек)
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      alert('Подождите немного перед следующим запросом');
      return;
    }
    setLastRequestTime(now);

    // ✅ Прерываем предыдущий запрос
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

    // ✅ Чистим старые ошибки
    setMessages((m) =>
      m.filter((msg) => !(msg.role === 'assistant' && msg.text.includes('Ошибка')))
    );

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: text,
          systemPrompt: `Ты — голосовой ассистент для колориста. Отвечай кратко, по существу.`,
        }),
        signal: controller.signal,
        // @ts-ignore
        timeout: 30000,
      });

      if (!res.ok) {
        const details = await res.text();
        throw new Error(`Сервер вернул ${res.status}: ${details}`);
      }

      const json = await res.json();
      const assistantMsg: VoiceMessage = {
        role: 'assistant',
        text: json.reply || 'Нет ответа',
        timestamp: new Date().toISOString(),
      };

      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      // ✅ Точная причина сбоя
      let userText = 'Ошибка соединения. Попробуйте позже.';
      if (err.name === 'AbortError') userText = 'Запрос отменён.';
      if (err.message?.includes('429')) userText = 'Слишком много запросов. Подождите минуту.';
      if (err.message?.includes('timeout')) userText = 'Таймаут запроса. Попробуйте ещё раз.';
      if (err.message?.includes('500')) userText = 'Сервер перегружен. Подождите минуту.';

      const errorMsg: VoiceMessage = {
        role: 'assistant',
        text: userText,
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, errorMsg]);

      console.error('[VoiceAssistant] Fetch error:', err);
    } finally {
      // ✅ ГАРАНТИРОВАННО снимаем флаг
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [lastRequestTime]); // Зависимости для useCallback

  /* ---------- Кнопка «Стоп» ---------- */
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  };

  /* ---------- Распознавание речи ---------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = 'ru-RU';
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (e: any) => {
      let finalTranscript = '';
      let interimTranscript = ''; // ✅ ИСПРАВЛЕНО: объявлена переменная
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript = t;
        } else {
          interimTranscript += t; // ✅ Используем правильную переменную
        }
      }
      setRecognizedText(finalTranscript || interimTranscript);

      if (finalTranscript.trim()) {
        setTimeout(() => {
          sendMessage(finalTranscript, true);
          setRecognizedText('');
        }, 500);
      }
    };

    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    recognitionRef.current = rec;
  }, [sendMessage]); // ✅ ИСПРАВЛЕНО: добавлена зависимость

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setRecognizedText('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  /* ---------- Синтез речи ---------- */
  const speakResponse = (text: string) => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ru-RU';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  /* ---------- Адаптивность ---------- */
  useEffect(() => {
    const check = () =>
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    check();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }
  }, []);

  /* ---------- UI ---------- */
  const buttonSize = isMobile ? 'w-20 h-20 text-3xl' : 'w-24 h-24 text-4xl';
  const messageSize = isMobile ? 'max-w-[85%] text-sm' : 'max-w-[75%]';

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <div className="mb-4 sm:mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">🎤 Голосовой ассистент</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Работайте руками в салоне - общайтесь голосом
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <button
            onClick={toggleRecording}
            disabled={isLoading}
            className={`relative ${buttonSize} rounded-full flex items-center justify-center transition-all
            ${isRecording ? 'bg-red-500 animate-pulse-record' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={isMobile ? 'text-3xl' : 'text-4xl'}>
              {isRecording ? '⏹️' : '🎤'}
            </span>
          </button>

          <div className="text-center px-4">
            <p className={`font-semibold ${isRecording ? 'text-red-500' : 'text-gray-700'} text-base sm:text-lg`}>
              {isRecording ? 'Слушаю... Говорите!' : 'Нажмите и говорите'}
            </p>
            {recognizedText && (
              <p className="text-sm text-gray-500 mt-1 break-words">
                Распознано: "{recognizedText}"
              </p>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 w-full justify-center">
            {synthesisAvailable && window.speechSynthesis?.speaking && (
              <button
                onClick={stopSpeaking}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
              >
                ⏸️ Стоп
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Очистить историю?')) setMessages([]);
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium"
            >
              🗑️ Очистить
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">История</h2>
        <div className="h-64 sm:h-96 overflow-y-auto space-y-2 sm:space-y-3 pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-400">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">💇‍♀️</div>
              <p className="text-sm sm:text-base">Начните голосовой диалог с AI</p>
              <p className="text-xs sm:text-sm mt-1 sm:mt-2">
                Спросите: "Какой окислитель на корни?"
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                  }`}
                >
                  {msg.role === 'user' ? (msg.isVoiceInput ? '🎤' : '👤') : '🤖'}
                </div>
                <div
                  className={`${messageSize} rounded-2xl px-3 sm:px-4 py-2 ${
                    msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className={`whitespace-pre-wrap leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                    {msg.text}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {msg.role === 'assistant' && synthesisAvailable && (
                    <button
                      onClick={() => speakResponse(msg.text)}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      🔊 Прослушать
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <span className="animate-pulse text-sm">🤖 Думаю...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="mt-4 sm:mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4">
        <h3 className="font-bold text-purple-900 mb-2 text-sm sm:text-base">
          💡 Что можно спросить:
        </h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {[
            'Какой окислитель на корни?',
            'Что делать с жёлтым оттенком?',
            'Как смешать 7,5 % окислитель?',
            'Сколько выдерживать на пористых волосах?',
          ].map((tip, i) => (
            <button
              key={i}
              onClick={() => sendMessage(tip)}
              disabled={isLoading}
              className="px-2 sm:px-3 py-1 bg-white border border-purple-200 rounded-full text-xs sm:text-sm hover:bg-purple-100 disabled:opacity-50"
            >
              {tip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
