export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIStatusResponse {
  ok: boolean;
  hasGroqKey: boolean;
  hasGeminiKey: boolean;
  defaultModel: string;
  groqRateLimit: string;
  availableModels: Array<{
    id: string;
    name: string;
    provider: string;
    speed: string;
  }>;
}

export interface AIChatResponse {
  ok: boolean;
  provider: string;
  model: string;
  message: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: string;
}

export const aiService = {
  async getStatus(): Promise<AIStatusResponse> {
    try {
      const res = await fetch('/api/ai/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        ok: false,
        hasGroqKey: false,
        hasGeminiKey: false,
        defaultModel: 'llama-3.3-70b-versatile',
        groqRateLimit: '14,400 requests/day',
        availableModels: [
          { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq', speed: 'Ultra Fast' },
          { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', provider: 'groq', speed: 'Instant' },
        ],
      };
    }
  },

  async sendMessage(params: {
    messages: AIMessage[];
    model?: string;
    systemPrompt?: string;
    temperature?: number;
  }): Promise<AIChatResponse> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (e) {
      return {
        ok: false,
        provider: 'error',
        model: params.model || 'llama-3.3-70b-versatile',
        message: '',
        error: e instanceof Error ? e.message : 'Failed to connect to AI server',
      };
    }
  },

  async generateTypingPassage(topic: string, lengthWords: number = 35): Promise<string> {
    const prompt = `Write a clean, cohesive ${lengthWords}-word descriptive passage in English about "${topic}". 
Rules:
1. High-quality natural English suitable for a typing learning exercise.
2. Include natural punctuation (commas, periods, capitalization).
3. Return ONLY the passage itself with no preamble, quotes, or markdown.`;

    const response = await this.sendMessage({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    if (response.ok && response.message) {
      return response.message.trim().replace(/^["']|["']$/g, '');
    }

    return `The morning sun shines through the window, bringing warmth and energy to the start of a productive day filled with learning and new discoveries.`;
  },
};
