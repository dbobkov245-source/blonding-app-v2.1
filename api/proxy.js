import { LRUCache } from 'lru-cache';

// ✅ Определение SYSTEM_PROMPT по умолчанию
const SYSTEM_PROMPT = `Ты — эксперт-преподаватель по блондированию волос. Отвечай профессионально, кратко и по существу.`;

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 });

export default async function handler(req, res) {
  // ✅ Проверка метода
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ✅ Rate-limit 10 запросов в минуту с IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `rate:${ip}`;
  let count = cache.get(key) || 0;
  if (count >= 10) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите минуту.' });
  }
  cache.set(key, ++count);

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    console.error('[API] HF_TOKEN отсутствует');
    return res.status(500).json({ error: 'Сервер не настроен' });
  }

  try {
    const { inputs, systemPrompt, image, jsonMode } = req.body;
    
    // ✅ Валидация запроса
    if (!inputs?.trim()) {
      return res.status(400).json({ error: 'Пустой запрос' });
    }

    // ✅ Проверка размера изображения (если есть)
    if (image) {
      const base64Data = image.split(',')[1] || '';
      if (Buffer.from(base64Data, 'base64').length > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'Изображение слишком большое (макс. 2MB)' });
      }
    }

    // ✅ Подготовка сообщений
    const messages = [];
    
    // Системный промпт (по умолчанию или кастомный)
    const sysPrompt = systemPrompt || SYSTEM_PROMPT;
    if (sysPrompt.trim()) {
      messages.push({ role: 'system', content: sysPrompt });
    }

    // ✅ Пользовательское сообщение (с изображением, если есть)
    if (image) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: inputs },
          { type: 'image_url', image_url: { url: image } }
        ]
      });
    } else {
      messages.push({ role: 'user', content: inputs });
    }

    // ✅ Запрос к Hugging Face
    const resHF = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${HF_TOKEN}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-32B-Instruct', // можно сделать параметром
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        // ✅ JSON mode для генерации тестов
        ...(jsonMode && { response_format: { type: "json_object" } })
      }),
      // @ts-ignore - timeout поддерживается в некоторых средах
      timeout: 25000
    });

    if (!resHF.ok) {
      const text = await resHF.text();
      console.error('[API] HF error:', resHF.status, text);
      return res.status(resHF.status).json({ error: 'Ошибка Hugging Face', details: text });
    }

    const data = await resHF.json();
    const reply = data.choices?.[0]?.message?.content || 'Нет ответа';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[API] Proxy crash:', err);
    
    // ✅ Обработка специфических ошибок
    if (err.name === 'AbortError') {
      return res.status(499).json({ error: 'Запрос отменён клиентом' });
    }
    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return res.status(504).json({ error: 'Таймаут запроса' });
    }
    
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
