import { LRUCache } from 'lru-cache';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 10 });
export const SYSTEM_PROMPT = `Ты — эксперт-преподаватель по блондированию волос. Отвечай профессионально, кратко и по существу.`;

function hashQuery(query) {
  return query.replace(/\s+/g, ' ').trim().slice(0, 1000);
}

export async function callHF(inputs, options = {}) {
  const {
    hfToken = process.env.HF_TOKEN,
    model: mainModel = "Qwen/Qwen2.5-72B-Instruct",
    fallbackModel = "Qwen/Qwen2.5-7B-Instruct",
    maxTokens = 2048,
    temperature = 0.7,
    topP = 0.9,
    systemPrompt = SYSTEM_PROMPT,
    enableCache = true,
    jsonMode = false
  } = options;

  if (!hfToken && process.env.NODE_ENV === 'production') {
    throw new Error("HF_TOKEN не установлен");
  }
  if (!hfToken) {
    console.warn("⚠️ HF_TOKEN не установлен, используется заглушка");
    return "Хороший вопрос! В production-режиме здесь был бы ответ AI. HF_TOKEN не установлен.";
  }
  if (!inputs?.trim()) throw new Error("Пустой запрос");

  const cacheKey = enableCache ? hashQuery(`${model}:${systemPrompt}:${inputs}`) : null;
  if (enableCache && cache.has(cacheKey)) return cache.get(cacheKey);

  const url = "https://router.huggingface.co/v1/chat/completions";
  const body = {
    model: mainModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: inputs }
    ],
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    ...(jsonMode && { response_format: { type: "json_object" } })
  };

  try {
    const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" }, body: JSON.stringify(body), timeout: 30000 });
    if (!res.ok) throw new Error(`HF API error (${res.status}): ${await res.text()}`);
    const data = await res.json();
    const message = data.choices?.[0]?.message?.content || "";
    if (enableCache) cache.set(cacheKey, message);
    return message;
  } catch (err) {
    console.error("HF API call failed:", err);
    throw err;
  }
}

export async function callHFWithContext(question, lessonContext, options = {}) {
  const { title, content } = lessonContext;
  const contextPrompt = `Урок: "${title}"\nСОДЕРЖАНИЕ: ${content.substring(0, 4000)}...\nВОПРОС: ${question}\nОтветь на основе урока.`;
  return callHF(contextPrompt, options);
}

export async function validateHFToken(token) {
  try {
    await callHF("test", { hfToken: token, maxTokens: 5, enableCache: false });
    return true;
  } catch {
    return false;
  }
}
