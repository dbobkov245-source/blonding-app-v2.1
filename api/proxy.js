// api/proxy.js - Улучшенная версия с поддержкой изображений

export default async function handler(req, res) {
  // Проверяем метод
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    console.error("HF_TOKEN is not set");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const body = req.body;
    const inputs = body?.inputs || body?.message || "";
    const image = body?.image; // Base64 изображение

    if (!inputs) {
      return res.status(400).json({ error: 'No "inputs" field provided' });
    }

    // Формируем системный промпт для контекста
    const systemPrompt = `Ты - опытный преподаватель и консультант по техникам блондирования волос. 
Твоя задача - помогать студентам разбираться в материале курса.

Правила ответов:
- Отвечай кратко и по существу
- Используй простой язык, но сохраняй профессиональную терминологию
- Если студент просит "объяснить проще" - используй аналогии и примеры
- Если прикреплено изображение - анализируй его в контексте блондирования (цвет, техника, состояние волос)
- Всегда будь поддерживающим и мотивирующим`;

    // Определяем, есть ли изображение
    let messages = [];
    
    if (image) {
      // Если есть изображение - используем multimodal модель
      messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: inputs },
            { type: "image_url", image_url: { url: image } }
          ]
        }
      ];
    } else {
      // Обычный текстовый запрос
      messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: inputs
        }
      ];
    }

    const url = "https://router.huggingface.co/v1/chat/completions";
    
    const hfResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    const data = await hfResponse.json();

    if (!hfResponse.ok) {
      console.error("HF API Error:", data);
      return res.status(hfResponse.status).json({
        error: "Hugging Face API error",
        details: data.error
      });
    }

    // Извлекаем ответ
    const message = data.choices?.[0]?.message?.content || "";
    
    // Отправляем ответ клиенту
    res.status(200).json({ reply: message });

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed", details: String(err) });
  }
}
