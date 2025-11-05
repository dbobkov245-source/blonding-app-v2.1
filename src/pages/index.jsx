import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    async function loadLessons() {
      const res = await fetch("/api/lessons.json");
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      }
    }
    loadLessons();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">📘 Теория по блондированию</h1>
      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <Link href={`/theory/${lesson.slug}`} className="text-blue-500 underline">
              {lesson.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
