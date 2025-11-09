import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';

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
  const [speakingText, setSpeakingText] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Инициализация Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
      
      // Проверка поддержки распознавания
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ru-RU';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setRecognizedText(transcript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Ошибка распознавания:', event.error);
          setIsRecording(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsRecording(false);
          // Автоматически отправляем распознанный текст
          if (recognizedText.trim()) {
            sendMessage(recognizedText, true);
            setRecognizedText('');
          }
        };
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Ваш браузер не поддерживает распознавание речи');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setRecognizedText('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const sendMessage = async (text: string, isVoiceInput = false) => {
    if (!text.trim()) return;

    const userMessage: VoiceMessage = {
      role: 'user',
      text: text,
      timestamp: new Date().toISOString(),
      isVoiceInput
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: text,
          systemPrompt: `Ты - голосовой ассистент для колориста. Отвечай КРАТКО и ПО СУЩЕСТВУ, как будто говоришь вслух. Используй термины: тон, окислитель, прядь, фон осветления.`
        }),
      });

      if (!res.ok) throw new Error('Ошибка запроса');
      
      const json = await res.json();
      const assistantText = json.reply || 'Извините, произошла ошибка';

      const assistantMessage: VoiceMessage = {
        role: 'assistant',
        text: assistantText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSpeakingText(assistantText);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant', 
        text: 'Ошибка соединения с AI',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!synthesisRef.current) return;

    // Останавливаем текущее воспроизведение
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    synthesisRef.current.speak(utterance);
  };

  const clearHistory = () => {
    if (confirm('Очистить историю?')) {
      setMessages([]);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">🎤 Голосовой ассистент</h1>
          <p className="text-gray-600">Работайте руками в салоне - общайтесь голосом</p>
        </div>

        {/* Интерфейс записи */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col items-center gap-4">
            {/* Кнопка записи */}
            <button
              onClick={toggleRecording}
              disabled={isLoading}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all
                ${isRecording 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="text-4xl">
                {isRecording ? '⏹️' : '🎤'}
              </span>
            </button>

            {/* Статус */}
            <div className="text-center">
              <p className={`font-semibold ${isRecording ? 'text-red-500' : 'text-gray-700'}`}>
                {isRecording ? 'Слушаю... Говорите!' : 'Нажмите и говорите'}
              </p>
              {recognizedText && isRecording && (
                <p className="text-sm text-gray-500 mt-1">Распознано: "{recognizedText}"</p>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => synthesisRef.current?.cancel()}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
              >
                ⏸️ Стоп
              </button>
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm"
              >
                🗑️ Очистить
              </button>
            </div>
          </div>
        </div>

        {/* История сообщений */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">История</h2>
          <div className="h-96 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">💇‍♀️</div>
                <p>Начните голосовой диалог с AI</p>
                <p className="text-sm mt-2">Спросите: "Какой окислитель на корни?"</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}>
                    {msg.role === 'user' ? (msg.isVoiceInput ? '🎤' : '👤') : '🤖'}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakResponse(msg.text)}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-700"
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
                  <span className="animate-pulse">🤖 Думаю...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Подсказки */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <h3 className="font-bold text-purple-900 mb-2">💡 Что можно спросить:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Какой окислитель на корни?',
              'Что делать с желтым оттенком?',
              'Как смешать 7.5% окислитель?',
              'Сколько выдерживать на пористых волосах?'
            ].map((tip, i) => (
              <button
                key={i}
                onClick={() => sendMessage(tip)}
                className="px-3 py-1 bg-white border border-purple-200 rounded-full text-sm hover:bg-purple-100"
              >
                {tip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
