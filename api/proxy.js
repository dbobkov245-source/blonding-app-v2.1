import { LRUCache } from 'lru-cache';

// ✅ ИЗМЕНЕНО: Теперь SYSTEM_PROMPT используется только как fallback для специализированных запросов
const BLONDING_SYSTEM_PROMPT = `Ты — эксперт-преподаватель по блондированию волос. Отвечай профессионально, кратко и по существу.`;

// Модель по умолчанию для свободного чата
const HF_MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 });

export default async function handler(req, res) {
  // ✅ Проверка метода
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  // ✅ Rate-limit 10 запросов/мин
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `rate:${ip}`;
  let count = cache.get(key) || 0;
  if (count >= 10) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите минуту.' });
  }
  cache.set(key, ++count);

  const HF_TOKEN = process.env.HF_TOKEN;
  
  // ✅ Ранняя проверка токена
  if (!HF_TOKEN) {
    console.error('[API] HF_TOKEN отсутствует в environment');
    return res.status(500).json({ 
      error: 'Сервер не настроен: отсутствует HF_TOKEN',
      details: 'Проверьте переменные окружения в Vercel'
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const { inputs, systemPrompt, image, jsonMode } = req.body;
    
    // ✅ Валидация запроса
    if (!inputs?.trim()) {
      return res.status(400).json({ error: 'Пустой запрос' });
    }

    // ✅ Проверка размера изображения
    if (image) {
      const base64Data = image.split(',')[1] || '';
      if (Buffer.from(base64Data, 'base64').length > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'Изображение слишком большое (макс. 2MB)' });
      }
    }

    // ✅ Подготовка сообщений
    const messages = [];
    
    // ✅ ИСПРАВЛЕНО: Используем промпт из запроса, если он есть. Если нет — НЕ добавляем системный промпт
    // Для ChatRaw.tsx systemPrompt не передается, поэтому AI будет вести свободный диалог
    if (systemPrompt && systemPrompt.trim()) {
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      // Для совместимости с другими компонентами (Chat.tsx, Assistant) можно использовать BLONDING_SYSTEM_PROMPT
      // Но здесь мы оставляем пустым для свободного чата
      console.log('[API] Свободный режим чата (без системного промпта)');
    }

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

    console.log(`[API] Запрос к модели: ${HF_MODEL}`);

    // ✅ Запрос с правильной моделью
    const resHF = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${HF_TOKEN}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        ...(jsonMode && { response_format: { type: "json_object" } })
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // ✅ Обработка HTTP-ошибок HF
    if (!resHF.ok) {
      const errorText = await resHF.text();
      console.error('[API] HF error:', resHF.status, errorText);
      
      if (resHF.status === 401) {
        return res.status(401).json({ 
          error: 'Неверный HF_TOKEN. Проверьте токен в Vercel',
          details: errorText
        });
      }
      if (resHF.status === 429) {
        return res.status(429).json({ 
          error: 'HF: Превышен лимит запросов',
          details: 'Подождите 1-2 минуты'
        });
      }
      if (resHF.status === 400 && errorText.includes('model_not_supported')) {
        return res.status(400).json({ 
          error: `Модель ${HF_MODEL} не поддерживается вашим HF аккаунтом`,
          details: 'Проверьте доступ и билинг в Hugging Face'
        });
      }
      
      return res.status(resHF.status).json({ 
        error: 'Ошибка Hugging Face API',
        details: errorText
      });
    }

    const data = await resHF.json();
    const reply = data.choices?.[0]?.message?.content || 'Нет ответа';
    return res.status(200).json({ reply });

  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[API] Proxy crash:', err);
    
    // ✅ Обработка network/abort ошибок
    if (err.name === 'AbortError') {
      return res.status(499).json({ error: 'Запрос отменён (timeout)' });
    }
    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return res.status(504).json({ error: 'Таймаут запроса (30с)' });
    }
    if (err.message?.includes('fetch failed')) {
      return res.status(503).json({ error: 'HF API недоступен' });
    }
    
    return res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
