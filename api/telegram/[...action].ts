import {
  getTelegramConfig,
  getBotInfo,
  isChatEstablished,
  pollTelegramUpdates,
  sendTelegramTest,
  sendTelegramVocabSample,
  sendTelegramSomaliSample,
  sendTelegramMistakeReview,
  handleTelegramWebhook,
} from '../../server/telegram.ts';
import { updateProgress, liveTelegramProgress } from '../../server/telegramData.ts';
import { isAuthenticatedRequest } from '../../server/auth.ts';

/**
 * Vercel Serverless Function scoped strictly to /api/telegram/*
 */
export default async function handler(req: any, res: any) {
  try {
    const url = req.url || '';
    const method = req.method?.toUpperCase();

    // Helper to read JSON body if string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // keep as is
      }
    }

    // 1. Webhook: POST /api/telegram/webhook (Open for Telegram servers)
    if (url.includes('/webhook') && method === 'POST') {
      const result = await handleTelegramWebhook(body);
      return res.status(200).json(result);
    }

    // All other Telegram routes require an authenticated session
    if (!isAuthenticatedRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    // 2. Status: GET /api/telegram/status
    if (url.includes('/status') && method === 'GET') {
      const { botToken, allowedUserId, isConfigured } = getTelegramConfig();
      await pollTelegramUpdates();
      const botInfo = await getBotInfo();

      return res.status(200).json({
        configured: isConfigured,
        hasBotToken: Boolean(botToken),
        hasAllowedUserId: Boolean(allowedUserId),
        allowedUserMask: allowedUserId ? `***${allowedUserId.slice(-4)}` : null,
        botUsername: botInfo.username || null,
        botFirstName: botInfo.firstName || null,
        chatLink: botInfo.username ? `https://t.me/${botInfo.username}` : null,
        chatEstablished: isChatEstablished(),
      });
    }

    // 3. Test: POST /api/telegram/test
    if (url.includes('/test') && method === 'POST') {
      const result = await sendTelegramTest();
      return res.status(result.ok ? 200 : 400).json(result);
    }

    // 4. Sample Vocab: POST /api/telegram/send-sample-vocab
    if (url.includes('/send-sample-vocab') && method === 'POST') {
      const result = await sendTelegramVocabSample();
      return res.status(result.ok ? 200 : 400).json(result);
    }

    // 5. Sample Somali: POST /api/telegram/send-sample-somali
    if (url.includes('/send-sample-somali') && method === 'POST') {
      const result = await sendTelegramSomaliSample();
      return res.status(result.ok ? 200 : 400).json(result);
    }

    // 6. Send Mistake: POST /api/telegram/send-mistake
    if (url.includes('/send-mistake') && method === 'POST') {
      const appUrl = (req.headers.origin || req.headers.referer || '').toString().replace(/\/$/, '');
      const result = await sendTelegramMistakeReview(body, appUrl);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    // 7. Sync Progress: POST /api/telegram/sync-progress
    if (url.includes('/sync-progress') && method === 'POST') {
      const { streakDays, englishPct, swedishPct, pythonPct, mistakesCount, currentLessons } = body || {};
      updateProgress({
        ...(streakDays !== undefined && { streakDays: Number(streakDays) }),
        ...(englishPct !== undefined && { englishPct: Math.round(Number(englishPct)) }),
        ...(swedishPct !== undefined && { swedishPct: Math.round(Number(swedishPct)) }),
        ...(pythonPct !== undefined && { pythonPct: Math.round(Number(pythonPct)) }),
        ...(mistakesCount !== undefined && { mistakesCount: Number(mistakesCount) }),
        ...(currentLessons?.english && { englishLesson: String(currentLessons.english) }),
        ...(currentLessons?.swedish && { swedishLesson: String(currentLessons.swedish) }),
        ...(currentLessons?.python && { pythonLesson: String(currentLessons.python) }),
      });
      return res.status(200).json({ ok: true, progress: liveTelegramProgress });
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  } catch (err) {
    console.error('[TELEGRAM_RUNTIME_ERROR]', {
      name: err instanceof Error ? err.name : 'UnknownError',
      message: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({ error: 'Telegram service error' });
  }
}
