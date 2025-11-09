import { LRUCache } from 'lru-cache';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 10 });
export const SYSTEM_PROMPT = `Ты — эксперт-преподаватель по блондированию волос. Отвечай профессионально, кратко и по существу.
Используй терминологию курса: тон, осветление, окислитель, прядь, волосы.
При анализе изображений оценивай: состояние волос, тон, технику, рекомендуй % окислителя.
Будь мотивирующим и конструктивным.`;

function hashQuery(query) {
  // ✅ УВЕЛИЧЕН ЛИМИТ С 200 ДО 1000 СИМВОЛОВ
  return query.replace(/\s+/g, ' ').trim().slice(0, 1000);
}

export async function callHF(inputs, options = {}) {
  const {
    hfToken = process.env.HF_TOKEN,
    model = "meta-llama/Meta-Llama-3-8B-Instruct",
    maxTokens = 1024,
    temperature = 0.7,
    topP = 0.9,
    systemPrompt = SYSTEM_PROMPT,
    enableCache = true // По умолчанию кэш включен
  } = options;

  if (!hfToken && process.env.NODE_ENV === 'production') {
    throw new Error("HF_TOKEN не установлен. Добавьте его в переменные окружения.");
  }

  if (!hfToken) {
    console.warn("⚠️ HF_TOKEN не установлен, используется заглушка для разработки");
    return "Хороший вопрос! В production-режиме здесь был бы ответ AI. HF_TOKEN не установлен.";
  }

  if (!inputs?.trim()) {
    throw new Error("Пустой запрос");
  }

  const cacheKey = enableCache ? hashQuery(`${model}:${systemPrompt}:${inputs}`) : null;
  if (enableCache && cache.has(cacheKey)) {
    console.log('📦 Ответ из кэша');
    return cache.get(cacheKey);
  }

  const url = "https://router.huggingface.co/v1/chat/completions";
  
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: inputs }
    ],
    max_tokens: maxTokens,
    temperature,
    top_p: topP
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      timeout: 30000
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "";

    if (!message) {
      throw new Error("Пустой ответ от HF API");
    }

    if (enableCache) {
      cache.set(cacheKey, message);
    }

    return message;
  } catch (error) {
    console.error("HF API call failed:", error);
    throw error;
  }
}

export async function callHFWithContext(question, lessonContext, options = {}) {
  const { title, content } = lessonContext;
  const contextPrompt = `Вы обучаете студента по уроку: "${title}"
СОДЕРЖАНИЕ: ${content.substring(0, 4000)}...
ВОПРОС: ${question}
ИНСТРУКЦИИ: Ответь строго на основе урока.`;
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
