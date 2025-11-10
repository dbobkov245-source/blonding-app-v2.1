import { LRUCache } from 'lru-cache';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // ✅ Rate-limit 10 запросов в минуту с IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `rate:${ip}`;
  let count = cache.get(key) || 0;
  if (count >= 10) return res.status(429).json({ error: 'Слишком много запросов. Подождите минуту.' });
  cache.set(key, ++count);

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    console.error('[API] HF_TOKEN отсутствует');
    return res.status(500).json({ error: 'Сервер не настроен' });
  }

  try {
    const { inputs, systemPrompt } = req.body;
    if (!inputs?.trim()) return res.status(400).json({ error: 'Пустой запрос' });

    const resHF = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-32B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
          { role: 'user', content: inputs }
        ],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9
      }),
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
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
