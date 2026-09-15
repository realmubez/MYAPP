import { Router, Request, Response } from 'express';
import {
  getTelegramConfig,
  getBotInfo,
  isChatEstablished,
  getTelegramWebhookInfo,
  setTelegramWebhook,
  resolveAppBaseUrl,
  sendTelegramTest,
  sendTelegramVocabSample,
  sendTelegramSomaliSample,
  sendTelegramMistakeReview,
  handleTelegramWebhook,
} from './telegram.ts';
import { updateProgress, liveTelegramProgress } from './telegramData.ts';

export const telegramRouter = Router();

// 1. Safe status check for the UI (never exposes secret tokens)
telegramRouter.get('/status', async (req: Request, res: Response) => {
  const { botToken, allowedUserId, isConfigured } = getTelegramConfig();
  
  const botInfo = await getBotInfo();
  const webhookInfo = await getTelegramWebhookInfo();

  res.json({
    configured: isConfigured,
    hasBotToken: Boolean(botToken),
    hasAllowedUserId: Boolean(allowedUserId),
    // Masked indicator for convenience in settings UI (e.g. "ID ending in ...456")
    allowedUserMask: allowedUserId ? `***${allowedUserId.slice(-4)}` : null,
    botUsername: botInfo.username || null,
    botFirstName: botInfo.firstName || null,
    chatLink: botInfo.username ? `https://t.me/${botInfo.username}` : null,
    chatEstablished: isChatEstablished(),
    webhook: {
      url: webhookInfo.url || '',
      pendingUpdateCount: webhookInfo.pendingUpdateCount || 0,
      lastErrorMessage: webhookInfo.lastErrorMessage || null,
    },
  });
});

// 1b. Action: Setup Telegram Webhook
telegramRouter.post('/setup-webhook', async (req: Request, res: Response) => {
  try {
    const { url } = req.body || {};
    const appBase = resolveAppBaseUrl(url || (req.headers.origin || req.headers.referer || '').toString());
    if (!appBase) {
      return res.status(400).json({
        ok: false,
        error: 'Missing application URL. Configure APP_URL environment variable or supply url in body.',
      });
    }

    const webhookUrl = `${appBase}/api/telegram/webhook`;
    const result = await setTelegramWebhook(webhookUrl);
    const webhookInfo = await getTelegramWebhookInfo();

    return res.json({
      ok: result.ok,
      description: result.description,
      webhookUrl,
      webhook: webhookInfo,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
});

// 2. Action: Send Telegram Test
telegramRouter.post('/test', async (req: Request, res: Response) => {
  try {
    const result = await sendTelegramTest();
    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: errorMsg });
  }
});

// 3. Action: Send Sample Vocabulary Review
telegramRouter.post('/send-sample-vocab', async (req: Request, res: Response) => {
  try {
    const result = await sendTelegramVocabSample();
    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: errorMsg });
  }
});

// 4. Action: Send Sample Somali Concept
telegramRouter.post('/send-sample-somali', async (req: Request, res: Response) => {
  try {
    const result = await sendTelegramSomaliSample();
    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: errorMsg });
  }
});

// 5. Action: Send Mistake Review Item
telegramRouter.post('/send-mistake', async (req: Request, res: Response) => {
  try {
    const appUrl = (req.headers.origin || req.headers.referer || '').toString().replace(/\/$/, '');
    const result = await sendTelegramMistakeReview(req.body, appUrl);
    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: errorMsg });
  }
});

// 6. Telegram Bot API Webhook receiver
telegramRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const result = await handleTelegramWebhook(req.body);
    return res.json(result);
  } catch (err: unknown) {
    console.error('[Telegram Webhook Error]', err);
    return res.status(200).json({ ok: true }); // Telegram expects 200 to acknowledge webhook
  }
});

// 7. Sync learning progress from client to Telegram bot
telegramRouter.post('/sync-progress', (req: Request, res: Response) => {
  try {
    const { streakDays, englishPct, swedishPct, pythonPct, mistakesCount, currentLessons } = req.body || {};
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
    return res.json({ ok: true, progress: liveTelegramProgress });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: errorMsg });
  }
});

