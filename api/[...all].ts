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
} from '../server/telegram';
import { updateProgress, liveTelegramProgress } from '../server/telegramData';
import {
  verifyPassword,
  createSessionCookie,
  clearSessionCookie,
  isAuthenticatedRequest,
} from '../server/auth';

/**
 * Vercel Serverless Function entry point for all /api/auth/* and /api/telegram/* routes
 */
export default async function handler(req: any, res: any) {
  // Normalize path
  const url = req.url || '';
  const method = req.method?.toUpperCase();

  // Helper to read JSON body if not parsed
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // keep as is
    }
  }

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // POST /api/auth/login
  if (url.includes('/auth/login') && method === 'POST') {
    const { password } = body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ ok: false, error: 'Password is required', message: 'Password is required' });
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    const result = verifyPassword(password, clientIp);
    if (!result.success) {
      const errorMsg = result.error || 'Incorrect password';
      return res.status(result.status || 401).json({
        ok: false,
        error: errorMsg,
        message: errorMsg,
      });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieHeader = createSessionCookie(isProduction);
    res.setHeader('Set-Cookie', cookieHeader);
    return res.status(200).json({ ok: true });
  }

  // GET /api/auth/check
  if (url.includes('/auth/check') && method === 'GET') {
    const authenticated = isAuthenticatedRequest(req);
    return res.status(200).json({ authenticated });
  }

  // POST /api/auth/logout
  if (url.includes('/auth/logout') && method === 'POST') {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieHeader = clearSessionCookie(isProduction);
    res.setHeader('Set-Cookie', cookieHeader);
    return res.status(200).json({ ok: true });
  }

  // ==========================================
  // TELEGRAM ROUTES (PROTECTED EXCEPT WEBHOOK)
  // ==========================================

  // 6. Webhook: POST /api/telegram/webhook (Open for Telegram servers)
  if (url.includes('/telegram/webhook') && method === 'POST') {
    const result = await handleTelegramWebhook(body);
    return res.status(200).json(result);
  }

  // All other Telegram routes require an authenticated session
  if (url.includes('/telegram/') && !isAuthenticatedRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  // 1. Status: GET /api/telegram/status
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

  // 2. Test: POST /api/telegram/test
  if (url.includes('/test') && method === 'POST') {
    const result = await sendTelegramTest();
    return res.status(result.ok ? 200 : 400).json(result);
  }

  // 3. Sample Vocab: POST /api/telegram/send-sample-vocab
  if (url.includes('/send-sample-vocab') && method === 'POST') {
    const result = await sendTelegramVocabSample();
    return res.status(result.ok ? 200 : 400).json(result);
  }

  // 4. Sample Somali: POST /api/telegram/send-sample-somali
  if (url.includes('/send-sample-somali') && method === 'POST') {
    const result = await sendTelegramSomaliSample();
    return res.status(result.ok ? 200 : 400).json(result);
  }

  // 5. Send Mistake: POST /api/telegram/send-mistake
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
}
