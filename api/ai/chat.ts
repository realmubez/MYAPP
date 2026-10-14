import { GoogleGenAI } from '@google/genai';

export const DEFAULT_SYSTEM_PROMPT = `You are the AI Learning Tutor & Assistant for "MY LEARNING" — a Personal Learning OS and Managed Learning Space.
You assist learners across languages (Somali, English, German B1), Mathematics, and Python programming.
Your communication style:
- Direct, clear, pedagogical, concise, and highly encouraging.
- When explaining grammar, provide clear examples with translations and pronunciation notes.
- When answering spoken voice queries, keep responses natural, engaging, and compact so they can be spoken clearly.`;

async function parseRequestBody(req: any): Promise<any> {
  if (req?.body !== undefined && req?.body !== null) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
  }

  if (typeof req?.on === 'function') {
    return new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk: any) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      });
      req.on('error', () => resolve({}));
    });
  }

  return {};
}

function sendJsonResponse(res: any, status: number, data: any): void {
  if (res.headersSent) return;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(status).json(data);
    return;
  }

  if (typeof res.writeHead === 'function' && typeof res.end === 'function') {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJsonResponse(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    return sendJsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const body = await parseRequestBody(req);
    const {
      messages = [],
      model = 'gemini-2.5-flash',
      systemPrompt = DEFAULT_SYSTEM_PROMPT,
      image,
      imageType = 'image/jpeg',
      customApiKey,
    } = body;

    const clientProvidedKey =
      (typeof customApiKey === 'string' && customApiKey.trim().length > 5 ? customApiKey.trim() : null) ||
      (typeof req.headers?.['x-gemini-key'] === 'string' && req.headers['x-gemini-key'].trim().length > 5 ? req.headers['x-gemini-key'].trim() : null);

    const geminiApiKey = (
      clientProvidedKey ||
      process.env.MY_REALTIME_GEMINI_KEY ||
      process.env.VITE_MY_REALTIME_GEMINI_KEY ||
      process.env.NEXT_PUBLIC_MY_REALTIME_GEMINI_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY
    )?.trim();
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    // 1. If Gemini key is available, use Gemini
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const lastUserMessage =
          [...messages].reverse().find((m: any) => m.role === 'user')?.content ||
          'Please help me learn.';

        if (image) {
          const cleanBase64 = image.includes(',') ? image.split(',')[1] : image;
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              {
                parts: [
                  { inlineData: { data: cleanBase64, mimeType: imageType } },
                  { text: `${systemPrompt}\n\nUser Question: ${lastUserMessage}` },
                ],
              },
            ],
          });

          return sendJsonResponse(res, 200, {
            ok: true,
            provider: 'gemini-vision',
            model: 'gemini-2.5-flash',
            message: response.text || 'I analyzed the image.',
          });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nUser Question: ${lastUserMessage}`,
        });

        return sendJsonResponse(res, 200, {
          ok: true,
          provider: 'gemini',
          model: 'gemini-2.5-flash',
          message: response.text || "I'm here to help you learn! Ask me anything.",
        });
      } catch (geminiErr: any) {
        console.warn('[VERCEL_AI_GEMINI_ERROR]', geminiErr?.message || geminiErr);
      }
    }

    // 2. If Groq API key is present
    if (groqApiKey && !image) {
      try {
        const payloadMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        ];

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: payloadMessages,
            temperature: 0.7,
            max_tokens: 1200,
          }),
        });

        if (groqRes.ok) {
          const groqData = (await groqRes.json()) as any;
          const text = groqData.choices?.[0]?.message?.content;
          if (text) {
            return sendJsonResponse(res, 200, {
              ok: true,
              provider: 'groq',
              model: 'llama-3.3-70b-versatile',
              message: text,
            });
          }
        }
      } catch (groqErr) {
        console.warn('[VERCEL_AI_GROQ_ERROR]', groqErr);
      }
    }

    // 3. Fallback response if no keys or service returned empty
    const lastUserQuery =
      [...messages].reverse().find((m: any) => m.role === 'user')?.content || 'Hello';
    return sendJsonResponse(res, 200, {
      ok: true,
      provider: 'hybrid-tutor',
      model: 'smart-response',
      message: `MaashaAllah! I heard your question: "${lastUserQuery}". I am your AI Learning Tutor ready to practice Somali, English, German, and Math with you!`,
    });
  } catch (err: any) {
    console.error('[VERCEL_AI_CHAT_ERROR]', err);
    return sendJsonResponse(res, 500, {
      ok: false,
      error: 'Failed to process AI chat query',
      details: err?.message || String(err),
    });
  }
}
