function sendJsonResponse(res: any, status: number, data: any): void {
  if (res.headersSent) return;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

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
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  const hasGeminiKey = Boolean(
    (process.env.MY_REALTIME_GEMINI_KEY ||
      process.env.VITE_MY_REALTIME_GEMINI_KEY ||
      process.env.NEXT_PUBLIC_MY_REALTIME_GEMINI_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY) &&
      (process.env.MY_REALTIME_GEMINI_KEY ||
        process.env.VITE_MY_REALTIME_GEMINI_KEY ||
        process.env.NEXT_PUBLIC_MY_REALTIME_GEMINI_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY)!.trim().length > 0
  );

  return sendJsonResponse(res, 200, {
    ok: true,
    hasGroqKey,
    hasGeminiKey,
    environment: 'vercel-serverless',
    availableModels: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini' },
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq' },
    ],
  });
}
