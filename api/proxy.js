/**
 * API Proxy для безопасного вызова Hugging Face
 * Использует централизованную библиотеку src/lib/ai.js
 */

// Импортируем централизованную функцию
const { callHF } = require('../src/lib/ai.js');

export default async function handler(req, res) {
  // Проверяем метод
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Получаем токен из переменных окружения
  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    console.error("HF_TOKEN is not set");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const body = req.body;
    const inputs = body?.inputs || body?.message || "";
    const image = body?.image; // Base64 изображение (для будущей поддержки)

    // Валидация входных данных
    if (!inputs) {
      return res.status(400).json({ error: 'No "inputs" field provided' });
    }

    if (typeof inputs !== "string" || inputs.length > 10000) {
      return res.status(400).json({ error: 'Invalid inputs: must be string under 10000 chars' });
    }

    // Если есть изображение, добавляем заметку в промпт
    let finalPrompt = inputs;
    if (image) {
      finalPrompt += "\n\n[Пользователь прикрепил изображение для анализа]";
    }

    // Вызываем централизованную функцию
    const reply = await callHF(finalPrompt, { 
      hfToken: HF_TOKEN,
      temperature: 0.7,
      topP: 0.9
    });
    
    // Отправляем ответ клиенту
    res.status(200).json({ reply });

  } catch (err) {
    console.error("Proxy error:", err);
    
    // Дружелюбное сообщение об ошибке
    const errorMessage = err.message || "Unknown error";
    
    if (errorMessage.includes("HF API error")) {
      return res.status(502).json({ 
        error: "AI service temporarily unavailable",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
    
    res.status(500).json({ 
      error: "Proxy failed", 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
