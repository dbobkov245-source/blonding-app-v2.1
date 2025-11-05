import Link from "next/link";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";

export default function Theory() {
  const router = useRouter();
  const { slug } = router.query || {};
  const [content, setContent] = useState("");

  useEffect(() => {
    async function loadLesson() {
      if (!slug) return;
      const res = await fetch(`/lessons/${slug}/${slug}.md`);
      if (res.ok) {
        const text = await res.text();
        setContent(text);
      }
    }
    loadLesson();
  }, [slug]);

  return (
    <main className="p-8">
      <Link href="/" className="text-blue-500 underline">
        ← Назад
      </Link>
      <article className="prose prose-invert max-w-none mt-4">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </main>
  );
}
