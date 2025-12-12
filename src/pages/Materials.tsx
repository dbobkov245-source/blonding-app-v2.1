import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

interface Material {
    id: string;
    title: string;
    type: 'pdf' | 'doc';
    url: string;
    description?: string;
}

const materials: Material[] = [
    {
        id: 'vk-telegram',
        title: 'Как оформить сообщество ВКонтакте и Телеграм канал',
        type: 'pdf',
        url: '/materials/vk-telegram-guide.pdf',
        description: 'Подробная инструкция по оформлению профессиональных страниц'
    },
    {
        id: '14-questions',
        title: '14 вопросов для консультации',
        type: 'doc',
        url: '/Theory/14-voprosov',
        description: 'Чек-лист вопросов для первичной консультации клиента'
    },
    {
        id: 'target-analysis',
        title: 'Анализ целевой аудитории (пример)',
        type: 'doc',
        url: '/Theory/analiz-tsa-primer',
        description: 'Образец анализа ЦА для парикмахера'
    },
    {
        id: 'consent-form',
        title: 'Информированное согласие – расписка',
        type: 'doc',
        url: '/Theory/informirovannoe-soglasie-raspiska',
        description: 'Шаблон документа для защиты мастера'
    },
    {
        id: 'aftercare',
        title: 'Описание ухода после сложного блондирования',
        type: 'doc',
        url: '/Theory/opisanie-uhoda-posle-slozhnogo-blondirovaniya-na-ranee-melirovannoi-baze',
        description: 'Рекомендации по уходу для клиентов'
    },
    {
        id: 'care-memo',
        title: 'Продающая памятка по уходу',
        type: 'doc',
        url: '/Theory/prodayushchaya-pamyatka-po-uhodu',
        description: 'Шаблон памятки для увеличения продаж'
    }
];

export default function MaterialsPage() {
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

    return (
        <>
            <Head>
                <title>Дополнительные материалы | Blonding Course</title>
            </Head>

            <div className="max-w-2xl mx-auto pb-8">
                {/* Header */}
                <div className="pt-2 mb-6">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors">
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        На главную
                    </Link>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                    Дополнительные материалы
                </h1>
                <p className="text-slate-500 mb-6">{materials.length} материалов</p>

                {/* PDF Viewer Modal */}
                {selectedPdf && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
                        <div className="flex items-center justify-between p-4 bg-slate-900">
                            <h3 className="text-white font-bold truncate">Просмотр PDF</h3>
                            <button
                                onClick={() => setSelectedPdf(null)}
                                className="text-white p-2 hover:bg-white/10 rounded-full"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-800">
                            <iframe
                                src={selectedPdf}
                                className="w-full h-full min-h-[80vh]"
                                title="PDF Viewer"
                            />
                        </div>
                        <div className="p-4 bg-slate-900 flex justify-center gap-4">
                            <a
                                href={selectedPdf}
                                download
                                className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
                            >
                                📥 Скачать
                            </a>
                            <button
                                onClick={() => window.open(selectedPdf, '_blank')}
                                className="px-6 py-2 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600"
                            >
                                🔗 Открыть в новой вкладке
                            </button>
                        </div>
                    </div>
                )}

                {/* Materials List */}
                <div className="space-y-3">
                    {materials.map((material) => (
                        <div
                            key={material.id}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${material.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {material.type === 'pdf' ? (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 mb-1">{material.title}</h3>
                                    {material.description && (
                                        <p className="text-sm text-slate-500 mb-3">{material.description}</p>
                                    )}
                                    {material.type === 'pdf' ? (
                                        <button
                                            onClick={() => setSelectedPdf(material.url)}
                                            className="text-sm text-purple-600 font-medium hover:text-purple-700"
                                        >
                                            Открыть PDF →
                                        </button>
                                    ) : (
                                        <Link
                                            href={material.url}
                                            className="text-sm text-purple-600 font-medium hover:text-purple-700"
                                        >
                                            Читать →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
