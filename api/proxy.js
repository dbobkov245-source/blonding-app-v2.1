import { LRUCache } from 'lru-cache';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `rate:${ip}`;
  let count = cache.get(key) || 0;
  if (count >= 10) {
    return res.status(429).json({ error: 'Слишком много запросов. Попробуйте позже.' });
  }
  cache.set(key, ++count);

  const HF_TOKEN = process.env.HF_TOKEN;
  
  if (!HF_TOKEN) {
    console.error("HF_TOKEN не установлен");
    return res.status(500).json({ error: 'Ошибка конфигурации сервера' });
  }

  try {
    const body = req.body;
    const inputs = body?.inputs || body?.message || "";
    const image = body?.image; 
    const customSystemPrompt = body?.systemPrompt;

    if (!inputs) {
      return res.status(400).json({ error: 'Не предоставлено поле "inputs"' });
    }

    if (image && Buffer.from(image.split(',')[1] || '', 'base64').length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'Изображение слишком большое (макс. 2MB)' });
    }

    // Готовим сообщения для модели
    const messages = [];

    // ✅ ДОБАВЛЯЕМ СИСТЕМНЫЙ ПРОМПТ ТОЛЬКО ЕСЛИ ОН НЕ ПУСТОЙ
    if (customSystemPrompt && customSystemPrompt.trim().length > 0) {
      messages.push({ 
        role: "system", 
        content: customSystemPrompt 
      });
    }

    // ✅ ДОБАВЛЯЕМ ПОЛЬЗОВАТЕЛЬСКОЕ СООБЩЕНИЕ
    if (image) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: inputs },
          { type: "image_url", image_url: { url: image } }
        ]
      });
    } else {
      messages.push({ 
        role: "user", 
        content: inputs 
      });
    }

    // ✅ ВАЖНО: Если системный промпт НЕ передан, сообщений будет только 1 (user)
    // Это гарантирует, что модель не получит никакой специализации

    const url = "https://router.huggingface.co/v1/chat/completions";
    
    const hfResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    const data = await hfResponse.json();

    if (!hfResponse.ok) {
      console.error("HF API Error:", data);
      return res.status(hfResponse.status).json({
        error: "Ошибка Hugging Face API",
        details: data.error
      });
    }

    const message = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ reply: message });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Ошибка прокси", details: String(err) });
  }
}
