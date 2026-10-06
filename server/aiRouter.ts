import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const aiRouter = Router();

// System prompt tailored for MY LEARNING Operating System
export const DEFAULT_SYSTEM_PROMPT = `You are the AI Learning Tutor & Assistant for "MY LEARNING" — a Personal Learning OS and Managed Learning Space.
You assist learners (including Mubez and students) across languages (English, German B1, Swedish, Somali), Mathematics, and Python programming.
Your communication style:
- Direct, clear, pedagogical, concise, and highly encouraging.
- When explaining grammar, provide clear examples with translations and pronunciation notes where helpful.
- When asked to generate typing texts, provide clean, punctuation-rich, engaging paragraphs suitable for typing drills.
- When solving mathematics or coding problems, provide step-by-step reasoning followed by the final answer.`;

export async function generateAIResponse(options: {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ ok: boolean; provider: string; model: string; message: string; error?: string }> {
  const {
    messages = [],
    model = 'llama-3.3-70b-versatile',
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    temperature = 0.7,
    maxTokens = 1500,
  } = options;

  const groqApiKey = process.env.GROQ_API_KEY?.trim();

  // 1. Try Groq API first
  if (groqApiKey) {
    const candidateModels = [
      model,
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
    ].filter((v, i, a) => a.indexOf(v) === i);

    for (const targetModel of candidateModels) {
      try {
        const payloadMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        ];

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages: payloadMessages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (groqResponse.ok) {
          const data = (await groqResponse.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const text = data.choices?.[0]?.message?.content || '';
          if (text) {
            return {
              ok: true,
              provider: 'groq',
              model: targetModel,
              message: text,
            };
          }
        }
      } catch (groqErr) {
        console.warn(`[GROQ_API_ERROR] Failed model ${targetModel}:`, groqErr);
      }
    }
  }

  // 2. Fallback to Gemini if GEMINI_API_KEY is present
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\nUser Question: ${lastUserMessage}`,
      });

      return {
        ok: true,
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        message: response.text || '',
      };
    } catch (geminiErr) {
      console.warn('[GEMINI_API_ERROR] Failed to generate Gemini content:', geminiErr);
    }
  }

  // 3. Fallback message if no keys are present
  const lastMsg = messages[messages.length - 1]?.content || '';
  return {
    ok: true,
    provider: 'local-assistant',
    model: 'demo-mode',
    message: `🤖 **AI Tutor Response**\n\nQuery: "${lastMsg}"\n\n💡 Tip: Configure GROQ_API_KEY in your environment for live Groq Llama 3.3 (14.4k/day) responses.`,
  };
}

aiRouter.get('/status', (_req: Request, res: Response) => {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

  res.json({
    ok: true,
    hasGroqKey,
    hasGeminiKey,
    defaultModel: 'llama-3.3-70b-versatile',
    groqRateLimit: '14,400 requests/day (Free Tier)',
    availableModels: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Versatile)', provider: 'groq', speed: 'Ultra Fast' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Instant)', provider: 'groq', speed: 'Sub-second' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', speed: 'Fast' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'groq', speed: 'Fast' },
    ],
  });
});

aiRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      messages = [],
      model = 'llama-3.3-70b-versatile',
      systemPrompt = DEFAULT_SYSTEM_PROMPT,
      temperature = 0.7,
      maxTokens = 1500,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const result = await generateAIResponse({
      messages,
      model,
      systemPrompt,
      temperature,
      maxTokens,
    });

    res.json(result);
  } catch (error) {
    console.error('[AI_CHAT_ERROR]', error);
    res.status(500).json({
      error: 'An error occurred while processing AI request',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});
