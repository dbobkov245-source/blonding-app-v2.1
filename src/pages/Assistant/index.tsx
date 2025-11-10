import React, { useState, useRef, useEffect } from 'react';

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

  // ✅ Защита от спама (2 с)
  const lastReqRef = useRef<number>(0);

  // ✅ AbortController для прерывания старого запроса
  const abortRef = useRef<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ---------- helpers ---------- */
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ---------- отправка запроса ---------- */
  const sendMessage = async (text: string, isVoiceInput = false) => {
    if (!text.trim()) return;

    // ✅ анти-спам
    const now = Date.now();
    if (now - lastReqRef.current < 2000) {
      window.toast?.('Подождите немного перед следующим запросом');
      return;
    }
    lastReqRef.current = now;

    // ✅ прерываем предыдущий запрос, если он ещё летит
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

    // ✅ чистим старые «ошибки» ассистента (чтобы не плодились)
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
        timeout: 30000, // 30 с таймаут
      });

      if (!res.ok) {
        // ✅ точная причина
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
      // ✅ не показываем технические детали пользователю
      let userText = 'Ошибка соединения. Попробуйте позже.';
      if (err.name === 'AbortError') userText = 'Запрос отменён.';
      if (err.message.includes('500')) userText = 'Сервер перегружен. Подождите минуту.';

      const errorMsg: VoiceMessage = {
        role: 'assistant',
        text: userText,
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, errorMsg]);

      // ✅ лог для отладки
      console.error('[VoiceAssistant] Fetch error:', err);
    } finally {
      // ❗❗❗ главное: всегда снимаем флаг
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  /* ---------- кнопка «Стоп» ---------- */
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // ✅ если запрос ещё летит — прерываем
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  };

  /* ---------- распознавание речи ---------- */
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
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final = t;
      }
      setRecognizedText(final);
    };

    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    recognitionRef.current = rec;
  }, []);

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

  /* ---------- синтез речи ---------- */
  const speakResponse = (text: string) => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ru-RU';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  /* ---------- UI ---------- */
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* ... ваш существующий JSX ... */}

      {/* КНОПКИ УПРАВЛЕНИЯ */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={toggleRecording}
          disabled={isLoading}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all
            ${isRecording ? 'bg-red-500 animate-pulse-record' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>

        {isLoading && (
          <button
            onClick={stopSpeaking}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            ⏸️ Стоп
          </button>
        )}
      </div>

      {/* БЫСТРЫЕ ПОДСКАЗКИ */}
      <div className="mt-6 bg-purple-50 p-4 rounded-lg">
        <h3 className="font-bold text-purple-900 mb-2">Что можно спросить:</h3>
        <div className="flex flex-wrap gap-2">
          {['Какой окислитель на корни?', 'Что делать с жёлтым оттенком?', 'Как смешать 7,5 % окислитель?'].map((t) => (
            <button
              key={t}
              onClick={() => sendMessage(t)}
              disabled={isLoading}
              className="px-3 py-1 bg-white border border-purple-200 rounded-full text-sm hover:bg-purple-100 disabled:opacity-50"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
