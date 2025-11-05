--- a/src/pages/Theory.jsx
+++ b/src/pages/Theory.jsx
@@ -1,7 +1,8 @@
-import { useParams, Link } from "react-router-dom";
+import Link from "next/link";
+import { useRouter } from "next/router";
 import ReactMarkdown from "react-markdown";
 import { useEffect, useState } from "react";
 import fs from "fs";
 import path from "path";

 export default function Theory() {
-  const { slug } = useParams();
+  const router = useRouter();
+  const { slug } = router.query || {};
   const [content, setContent] = useState("");
@@ -25,7 +26,7 @@
     return (
       <main className="p-8">
         <Link
-          to="/"
+          href="/"
           className="text-blue-500 underline"
         >
           ← Назад
