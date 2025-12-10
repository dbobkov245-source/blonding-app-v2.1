import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { GetStaticProps, GetStaticPaths } from 'next';

interface Lesson {
    slug: string;
    title: string;
}

interface Module {
    name: string;
    slug: string;
    lessonsCount: number;
}

interface IndexData {
    modules: Module[];
    lessons: Record<string, Lesson[]>;
}

interface ModulePageProps {
    module: Module;
    lessons: Lesson[];
}

const ModulePage = ({ module, lessons }: ModulePageProps) => {
    if (!module || lessons.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Модуль не найден</h1>
                <Link href="/" className="text-blue-600 hover:underline">
                    ← Вернуться на главную
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                    ← Вернуться к модулям
                </Link>
            </div>

            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{module.name}</h1>
                <p className="text-lg text-gray-600">
                    {lessons.length} {lessons.length === 1 ? 'урок' : 'уроков'}
                </p>
            </header>

            <div className="space-y-4">
                {lessons.map((lesson, index) => (
                    <Link
                        key={lesson.slug}
                        href={`/Theory/${encodeURIComponent(lesson.slug)}`}
                        className="block bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition border border-gray-100"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                                <p className="text-sm text-blue-600">Открыть урок →</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    let modules: Module[] = [];
    try {
        const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
        const data = fs.readFileSync(jsonPath, 'utf-8');
        const indexData: IndexData = JSON.parse(data);
        if (indexData.modules) {
            modules = indexData.modules;
        }
    } catch (e) {
        console.warn("index.json not found for getStaticPaths in Module");
    }

    const paths = modules.map((m) => ({
        params: { slug: m.slug },
    }));

    return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params as { slug: string };

    let module: Module | null = null;
    let lessons: Lesson[] = [];

    try {
        const jsonPath = path.join(process.cwd(), 'public', 'lessons', 'index.json');
        const data = fs.readFileSync(jsonPath, 'utf-8');
        const indexData: IndexData = JSON.parse(data);

        if (indexData.modules) {
            module = indexData.modules.find((m) => m.slug === slug) || null;
            lessons = indexData.lessons[slug] || [];
        }
    } catch (e) {
        console.error('Error reading index.json:', (e as Error).message);
    }

    if (!module) {
        return { notFound: true };
    }

    return {
        props: {
            module,
            lessons,
        },
    };
};

export default ModulePage;
