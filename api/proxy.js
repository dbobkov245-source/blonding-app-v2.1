import LRUCache from 'lru-cache';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 }); // 500 IP, 1 мин ttl

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `rate:${ip}`;
  let count = cache.get(key) || 0;
  if (count >= 10) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }
  cache.set(key, ++count);

  const HF_TOKEN = process.env.HF_TOKEN;
  
  if (!HF_TOKEN) {
    console.error("HF_TOKEN is not set");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const body = req.body;
    const inputs = body?.inputs || body?.message || "";
    const image = body?.image; 

    if (!inputs) {
      return res.status(400).json({ error: 'No "inputs" field provided' });
    }

    if (image && Buffer.from(image.split(',')[1] || '', 'base64').length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large (max 2MB)' });
    }

    const systemPrompt = `Ты — опытный преподаватель и консультант по техникам 
блондирования волос. Твоя задача — помогать студентам разбираться в материале 
курса. Отвечай кратко и по существу, используй простой язык.`;

    let messages = [];

    if (image) {
      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: inputs },
            { type: "image_url", image_url: { url: image } }
          ]
        }
      ];
    } else {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: inputs }
      ];
    }

    // ✅ ИСПРАВЛЕНО: правильный URL
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

    // ✅ ИСПРАВЛЕНО: убраны двойные скобки
    const message = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ reply: message });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed", details: String(err) });
  }
}
