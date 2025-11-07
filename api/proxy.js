export default async function handler(req, res) {
  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    return res.status(500).json({ error: "HF_TOKEN not set in environment variables" });
  }

  const url = "https://router.huggingface.co/v1/chat/completions";

  try {
    const body = await (async ()=>{ try { return await req.json(); } catch(e){ return req.body; } })();
    const inputs = body?.inputs || body?.message || "";

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // ⚠️ ИСПРАВЛЕНИЕ: Используем более стандартную модель
        model: "meta-llama/Meta-Llama-3-8B-Instruct", 
        messages: [{ role: "user", content: inputs }],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.95
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("HF error:", text);
      // Отправляем более детальную ошибку
      return res.status(502).json({ error: "Hugging Face API error", details: text });
    }

    const data = await resp.json();
    const message = data.choices?.[0]?.message?.content || data.generated_text || "";
    res.status(200).json({ reply: message });

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed", details: String(err) });
  }
}
