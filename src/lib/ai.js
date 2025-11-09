/**
 * Централизованная библиотека для работы с Hugging Face API
 */

export const SYSTEM_PROMPT = `Ты — опытный преподаватель и консультант по техникам блондирования волос. 
Твоя задача - помогать студентам разбираться в материале курса.

Правила ответов:
- Отвечай кратко и по существу
- Используй простой язык, но сохраняй профессиональную терминологию
- Если студент просит "объяснить проще" - используй аналогии и примеры
- Если прикреплено изображение - анализируй его в контексте блондирования (цвет, техника, состояние волос)
- Всегда будь поддерживающим и мотивирующим
- При необходимости давай рекомендации по конкретным урокам`;

/**
 * Вызов Hugging Face Chat Completions API
 */
export async function callHF(inputs, options = {}) {
  const {
    hfToken = process.env.HF_TOKEN,
    model = "meta-llama/Meta-Llama-3-8B-Instruct",
    maxTokens = 1024,
    temperature = 0.7,
    topP = 0.95,
    systemPrompt = SYSTEM_PROMPT
  } = options;

  if (!hfToken) {
    throw new Error("HF_TOKEN not provided");
  }

  if (!inputs || typeof inputs !== "string") {
    throw new Error("Invalid inputs: must be a non-empty string");
  }

  // ✅ ИСПРАВЛЕНО: правильный URL
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
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // ✅ ИСПРАВЛЕНО: правильный доступ к данным
    const message = data.choices?.[0]?.message?.content || 
                    data.generated_text || 
                    "";

    if (!message) {
      throw new Error("Empty response from HF API");
    }

    return message;
  } catch (error) {
    console.error("HF API call failed:", error);
    throw error;
  }
}

/**
 * Вызов HF с контекстом урока
 */
export async function callHFWithContext(question, lessonContext, options = {}) {
  const { title, content } = lessonContext;
  
  const contextPrompt = `Урок: "${title}"

Содержание урока:
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

Вопрос студента: ${question}

Пожалуйста, ответь на вопрос, используя информацию из урока выше.`;

  return callHF(contextPrompt, options);
}

/**
 * Проверка валидности HF токена
 */
export async function validateHFToken(token) {
  try {
    await callHF("test", { hfToken: token, maxTokens: 5 });
    return true;
  } catch (error) {
    return false;
  }
}
