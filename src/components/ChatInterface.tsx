import React, { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    id: string;
}

interface ChatInterfaceProps {
    onSendMessage?: (message: string) => Promise<void>;
    isLoading?: boolean;
}

export default function ChatInterface({ onSendMessage, isLoading = false }: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Привет! Я твой AI-помощник по колористике. Спроси меня про формулы блонда или нейтрализацию!' }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);

        const msgToSend = input;
        setInput('');

        if (onSendMessage) {
            await onSendMessage(msgToSend);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Область сообщений */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth no-scrollbar">
                {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`relative max-w-[85%] px-5 py-3 text-sm sm:text-base shadow-sm ${isUser ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                <span className={`text-[10px] absolute bottom-1 ${isUser ? 'right-2 text-purple-200' : 'left-2 text-slate-300'}`}>
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Индикатор загрузки */}
                {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Плавающая панель ввода */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
                <div className="relative flex items-end gap-2 bg-white rounded-3xl shadow-lg shadow-purple-900/5 border border-slate-100 p-2 pr-2">

                    <button className="p-3 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Задайте вопрос AI..."
                        rows={1}
                        className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none max-h-32 focus:outline-none"
                        style={{ minHeight: '44px' }}
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`p-3 rounded-full transition-all duration-200 transform ${input.trim() ? 'bg-purple-600 text-white shadow-md hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                        <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
