import { useState, useEffect } from 'react';

const STORAGE_KEY = 'blonding_progress_seen';

export const useLessonProgress = () => {
    const [seenLessons, setSeenLessons] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Initial load from localStorage
        setMounted(true);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setSeenLessons(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse progress', e);
            }
        }
    }, []);

    const markSeen = (slug: string) => {
        setSeenLessons((prev) => {
            if (prev.includes(slug)) return prev;
            const updated = [...prev, slug];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const getProgress = (totalLyrics: number) => {
        if (totalLyrics === 0) return 0;
        return Math.min(100, Math.round((seenLessons.length / totalLyrics) * 100));
    };

    return {
        seenLessons,
        markSeen,
        getProgress,
        mounted // Useful to avoid hydration mismatch if needed
    };
};
