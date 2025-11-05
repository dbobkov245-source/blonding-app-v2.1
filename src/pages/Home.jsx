--- a/src/pages/Home.jsx
+++ b/src/pages/Home.jsx
@@ -1,7 +1,7 @@
-import { Link } from "react-router-dom";
+import Link from "next/link";
 import { useEffect, useState } from "react";
 import fs from "fs";
 import path from "path";
 
 export default function Home() {
   const [lessons, setLessons] = useState([]);
@@ -20,10 +20,10 @@
     <main className="p-8">
       <h1 className="text-3xl font-bold mb-4">📘 Теория по блондированию</h1>
       <ul className="space-y-2">
-        {lessons.map((lesson) => (
-          <li key={lesson.slug}>
-            <Link to={`/theory/${lesson.slug}`} className="text-blue-500 underline">
-              {lesson.title}
-            </Link>
-          </li>
-        ))}
+        {lessons.map((lesson) => (
+          <li key={lesson.slug}>
+            <Link href={`/theory/${lesson.slug}`} className="text-blue-500 underline">
+              {lesson.title}
+            </Link>
+          </li>
+        ))}
       </ul>
     </main>
   );
