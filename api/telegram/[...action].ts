import crypto from 'node:crypto';


const SESSION_COOKIE_NAME = 'my_learning_session';

function getSigningSecret(): string {
  const password = process.env.MY_LEARNING_PASSWORD || '';
  const explicitSecret = process.env.SESSION_SECRET || '';
  const secretSource = explicitSecret || password;

  if (!secretSource) {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      return 'mylearning-dev-secret-local-only';
    }
    return 'mylearning-unconfigured-secret-fallback';
  }

  return crypto.createHash('sha256').update(`mylearning-salt:${secretSource}`).digest('hex');
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 4) return false;

  const [version, expStr, randomHex, signature] = parts;
  if (version !== 'v1') return false;

  const exp = parseInt(expStr, 10);
  if (isNaN(exp) || exp < Date.now()) {
    return false;
  }

  const payload = `v1.${expStr}.${randomHex}`;
  const expectedSignature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length || sigBuffer.length === 0) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return cookies;

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }

  return cookies;
}

function isAuthenticatedRequest(req: any): boolean {
  const cookieHeader = req?.headers?.cookie || req?.headers?.get?.('cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[SESSION_COOKIE_NAME];
  return verifySessionToken(sessionToken);
}

// --- DATA ---
/**
 * Data store and formats for the MY LEARNING Telegram Companion Bot
 * Reuses existing curriculum, mistake review records, and voice configuration.
 */

export interface TelegramVocabItem {
  id: string;
  subject: 'english' | 'swedish' | 'python';
  flag: string;
  word: string;
  meaning: string;
  somaliTranslation?: string;
  swedishTranslation?: string;
  exampleSentence: string;
  practicePath: string;
  voice: string;
}

export interface TelegramMistakeItem {
  id: string;
  subject: 'python' | 'swedish' | 'english';
  flag: string;
  topic: string;
  mistake: string;
  correction: string;
  explanation: string;
  audioExplanation: string;
  voice: string;
  practicePath: string;
}

export interface TelegramReviewItem {
  id: string;
  type: 'vocab' | 'mistake' | 'concept' | 'sentence';
  subjectName: string;
  flag: string;
  categoryLabel: string;
  title: string;
  contentLines: { label?: string; text: string; code?: boolean }[];
  audioWordText?: string;
  audioWordVoice?: string;
  audioSentenceText?: string;
  audioSentenceVoice?: string;
  practicePath: string;
}

export interface TelegramProgress {
  streakDays: number;
  englishPct: number;
  englishLesson: string;
  swedishPct: number;
  swedishLesson: string;
  pythonPct: number;
  pythonLesson: string;
  mistakesCount: number;
}

// 1. Curated Vocabulary matching MY LEARNING curriculum
export const TELEGRAM_VOCAB_ITEMS: TelegramVocabItem[] = [
  {
    id: 'vocab-1',
    subject: 'english',
    flag: '🇬🇧',
    word: 'pay-as-you-go',
    meaning: 'You pay for what you use.',
    somaliTranslation: 'Waxaad bixisaa inta aad isticmaasho.',
    exampleSentence: 'I use a pay-as-you-go phone plan.',
    practicePath: '/focus/english',
    voice: 'en-US-GuyNeural',
  },
  {
    id: 'vocab-2',
    subject: 'swedish',
    flag: '🇸🇪',
    word: 'obegränsad',
    meaning: 'unlimited / without limits.',
    somaliTranslation: 'aan xadidnayn.',
    exampleSentence: 'Jag har obegränsad surf på min mobil.',
    practicePath: '/focus/swedish',
    voice: 'sv-SE-MattiasNeural',
  },
  {
    id: 'vocab-3',
    subject: 'python',
    flag: '🐍',
    word: 'variable',
    meaning: 'A named container that stores a value.',
    somaliTranslation: 'Variable-ku wuxuu kaydiyaa qiime.',
    exampleSentence: 'name = "Ali"',
    practicePath: '/focus/python',
    voice: 'en-US-GuyNeural',
  },
  {
    id: 'vocab-4',
    subject: 'swedish',
    flag: '🇸🇪',
    word: 'påfyllning',
    meaning: 'refill / topping up.',
    somaliTranslation: 'buuxin / dib u buuxin.',
    exampleSentence: 'Ingår påfyllning av kaffet?',
    practicePath: '/focus/swedish',
    voice: 'sv-SE-MattiasNeural',
  },
  {
    id: 'vocab-5',
    subject: 'english',
    flag: '🇬🇧',
    word: 'coverage',
    meaning: 'The area where mobile phone service is available.',
    somaliTranslation: 'baaxadda caymiska adeegga taleefanka.',
    exampleSentence: 'Does this network have good coverage in the city?',
    practicePath: '/focus/english',
    voice: 'en-US-GuyNeural',
  },
  {
    id: 'vocab-6',
    subject: 'python',
    flag: '🐍',
    word: 'function',
    meaning: 'A reusable block of code that performs an action.',
    somaliTranslation: 'Function waa qayb koodh ah oo dib loo isticmaali karo.',
    exampleSentence: 'def greet(): print("Hello")',
    practicePath: '/focus/python',
    voice: 'en-US-GuyNeural',
  },
];

// 2. Curated Mistakes matching MY LEARNING Mistake Review
export const TELEGRAM_MISTAKE_ITEMS: TelegramMistakeItem[] = [
  {
    id: 'mistake-1',
    subject: 'python',
    flag: '🐍',
    topic: 'Python · Variables',
    mistake: 'print(Name)',
    correction: 'print(name)',
    explanation: 'Python is case-sensitive. Variable names must match exact casing.',
    audioExplanation: 'Remember: Python is case-sensitive. Variable names must match exact casing.',
    voice: 'en-US-GuyNeural',
    practicePath: '/review',
  },
  {
    id: 'mistake-2',
    subject: 'swedish',
    flag: '🇸🇪',
    topic: 'Swedish · På café',
    mistake: 'Jag vill ha en kaffe, tack',
    correction: 'Kan jag få en kaffe, tack?',
    explanation: 'In Swedish café dialogue, "Kan jag få..." is the natural, polite phrasing for ordering.',
    audioExplanation: 'Kom ihåg: I svenskan är "Kan jag få..." det mest naturliga och artiga sättet att beställa.',
    voice: 'sv-SE-MattiasNeural',
    practicePath: '/review',
  },
  {
    id: 'mistake-3',
    subject: 'english',
    flag: '🇬🇧',
    topic: 'English · Phone Plans',
    mistake: 'I need a plan with many datas',
    correction: 'I need a plan with lots of data',
    explanation: 'Data is an uncountable noun in everyday English. Use "lots of data" or "much data".',
    audioExplanation: 'Remember: Data is an uncountable noun in everyday English. Use "lots of data".',
    voice: 'en-US-GuyNeural',
    practicePath: '/review',
  },
];

// 3. Curated Today's Review Items
export const TELEGRAM_TODAY_ITEMS: TelegramReviewItem[] = [
  {
    id: 'today-1',
    type: 'vocab',
    subjectName: 'English',
    flag: '🇬🇧',
    categoryLabel: 'Vocabulary',
    title: 'pay-as-you-go',
    contentLines: [
      { label: 'Meaning', text: 'You pay for what you use.' },
      { label: 'Example', text: 'I use a pay-as-you-go phone plan.' },
    ],
    audioWordText: 'pay-as-you-go',
    audioWordVoice: 'en-US-GuyNeural',
    audioSentenceText: 'I use a pay-as-you-go phone plan.',
    audioSentenceVoice: 'en-US-GuyNeural',
    practicePath: '/focus/english',
  },
  {
    id: 'today-2',
    type: 'concept',
    subjectName: 'Python',
    flag: '🐍',
    categoryLabel: 'Programming Concept',
    title: 'variable',
    contentLines: [
      { label: 'Meaning', text: 'A variable stores a value in memory.' },
      { label: 'Somali', text: 'Variable-ku wuxuu kaydiyaa qiime.' },
      { label: 'Example', text: 'name = "Ali"', code: true },
    ],
    audioWordText: 'variable',
    audioWordVoice: 'en-US-GuyNeural',
    audioSentenceText: 'Variable-ku wuxuu kaydiyaa qiime.',
    audioSentenceVoice: 'so-SO-MuuseNeural',
    practicePath: '/focus/python',
  },
  {
    id: 'today-3',
    type: 'sentence',
    subjectName: 'Swedish',
    flag: '🇸🇪',
    categoryLabel: 'Café Dialogue',
    title: 'Kan jag få en kaffe, tack?',
    contentLines: [
      { label: 'Meaning', text: 'Could I have a coffee, please?' },
      { label: 'Somali', text: 'Ma heli karaa koob bun ah, fadlan?' },
      { label: 'Example', text: 'Kan jag få en kaffe och en kanelbulle, tack?' },
    ],
    audioWordText: 'Kan jag få en kaffe, tack?',
    audioWordVoice: 'sv-SE-MattiasNeural',
    audioSentenceText: 'Kan jag få en kaffe och en kanelbulle, tack?',
    audioSentenceVoice: 'sv-SE-MattiasNeural',
    practicePath: '/focus/swedish',
  },
  {
    id: 'today-4',
    type: 'mistake',
    subjectName: 'Python · Variables',
    flag: '🧠',
    categoryLabel: 'Mistake Review',
    title: 'Case Sensitivity',
    contentLines: [
      { label: 'You wrote', text: 'print(Name)', code: true },
      { label: 'Correct', text: 'print(name)', code: true },
      { label: 'Remember', text: 'Python is case-sensitive.' },
    ],
    audioWordText: 'Python is case-sensitive.',
    audioWordVoice: 'en-US-GuyNeural',
    audioSentenceText: 'Python is case-sensitive. Variable names must match exact casing.',
    audioSentenceVoice: 'en-US-GuyNeural',
    practicePath: '/review',
  },
];

// Live in-memory progress store (synchronized with client app)
export const liveTelegramProgress: TelegramProgress = {
  streakDays: 4,
  englishPct: 85,
  englishLesson: 'Phone Plans',
  swedishPct: 70,
  swedishLesson: 'På café',
  pythonPct: 60,
  pythonLesson: 'Variables',
  mistakesCount: 5,
};

// In-memory Telegram Bot User Preferences
export const liveTelegramSettings = {
  somaliVoice: 'so-SO-MuuseNeural' as 'so-SO-MuuseNeural' | 'so-SO-UbaxNeural',
  translation: 'so' as 'so' | 'sv' | 'off',
  notifications: true,
};

export function updateProgress(newProgress: Partial<TelegramProgress>): void {
  Object.assign(liveTelegramProgress, newProgress);
}

export function toggleSomaliVoice(): string {
  liveTelegramSettings.somaliVoice =
    liveTelegramSettings.somaliVoice === 'so-SO-MuuseNeural'
      ? 'so-SO-UbaxNeural'
      : 'so-SO-MuuseNeural';
  return liveTelegramSettings.somaliVoice === 'so-SO-MuuseNeural' ? 'Muuse' : 'Ubax';
}

export function toggleTranslation(): string {
  if (liveTelegramSettings.translation === 'so') {
    liveTelegramSettings.translation = 'sv';
  } else if (liveTelegramSettings.translation === 'sv') {
    liveTelegramSettings.translation = 'off';
  } else {
    liveTelegramSettings.translation = 'so';
  }
  return liveTelegramSettings.translation;
}

// --- LOGIC ---
/**
 * Server-side Telegram Bot Service for MY LEARNING
 * 
 * SECURITY RULES:
 * - TELEGRAM_BOT_TOKEN and TELEGRAM_ALLOWED_USER_ID are server-only secrets.
 * - NEVER sent or exposed to the client/browser bundle.
 * - Only the numeric TELEGRAM_ALLOWED_USER_ID is permitted to receive messages or interact with the bot.
 */



export interface TelegramConfig {
  botToken: string;
  allowedUserId: string;
  isConfigured: boolean;
}

export interface ReviewItem {
  subject: 'en' | 'sv' | 'python' | string;
  topic?: string;
  vocabulary?: string;
  meaning?: string;
  translation?: {
    so?: string;
    sv?: string;
    en?: string;
  } | string;
  exampleSentence?: string;
  mistake?: string;
  correction?: string;
  explanation?: string;
  lessonId?: string;
  reviewId?: string;
  audioText?: string;
  audioLanguage?: 'en' | 'sv' | 'so';
  audioVoice?: string;
  practicePath?: string;
}

function normalizeTTSBaseUrl(raw?: string | null): string {
  const defaultUrl = 'https://muberes-my-piper-tts.hf.space/tts';
  if (!raw || typeof raw !== 'string') return defaultUrl;
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return defaultUrl;
  if (trimmed.endsWith('/tts')) {
    return trimmed;
  }
  return `${trimmed}/tts`;
}

const TTS_ENDPOINT = normalizeTTSBaseUrl(
  process.env.VITE_TTS_BASE_URL ||
  process.env.TTS_BASE_URL ||
  'https://muberes-my-piper-tts.hf.space/tts'
);

// Known working voices aligned with MY LEARNING client config
export const SERVER_TTS_VOICES = {
  en: 'en-US-GuyNeural',
  en_alt: 'en-GB-RyanNeural',
  sv: 'sv-SE-MattiasNeural',
  so: 'so-SO-MuuseNeural', // Verified Default Somali voice
  so_ubax: 'so-SO-UbaxNeural', // Verified Secondary Somali voice
} as const;

export function getTelegramConfig(): TelegramConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim().replace(/^["']|["']$/g, '') || '';
  const allowedUserId = process.env.TELEGRAM_ALLOWED_USER_ID?.trim().replace(/^["']|["']$/g, '') || '';
  return {
    botToken,
    allowedUserId,
    isConfigured: Boolean(botToken && allowedUserId),
  };
}

let cachedBotInfo: { username?: string; firstName?: string; valid: boolean } | null = null;
let chatKnownEstablished = false;

export async function getBotInfo(): Promise<{ username?: string; firstName?: string; valid: boolean }> {
  if (cachedBotInfo) return cachedBotInfo;
  const { botToken } = getTelegramConfig();
  if (!botToken) return { valid: false };

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = (await res.json()) as any;
    if (res.ok && data.ok) {
      cachedBotInfo = {
        username: data.result?.username,
        firstName: data.result?.first_name,
        valid: true,
      };
      return cachedBotInfo;
    }
  } catch (e) {
    console.error('[Telegram API] getMe error:', e);
  }
  return { valid: false };
}

export function isChatEstablished(): boolean {
  return chatKnownEstablished;
}

export function setChatEstablished(established: boolean = true) {
  chatKnownEstablished = established;
}

export function isUserAllowed(userId: number | string | undefined | null): boolean {
  if (userId === undefined || userId === null) return false;
  const { allowedUserId } = getTelegramConfig();
  if (!allowedUserId) return false;
  return String(userId).trim() === allowedUserId;
}

/**
 * Sends a text message to a specific Telegram chat/user using the Telegram Bot API.
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown';
    replyMarkup?: {
      inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
      keyboard?: Array<Array<{ text: string }>>;
      resize_keyboard?: boolean;
      one_time_keyboard?: boolean;
      is_persistent?: boolean;
    };
  }
): Promise<{ ok: boolean; description?: string; error?: string }> {
  const { botToken } = getTelegramConfig();
  if (!botToken) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN is not configured' };
  }

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: options?.parseMode || 'HTML',
  };

  if (options?.replyMarkup) {
    payload.reply_markup = options.replyMarkup;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as { ok: boolean; description?: string };
    if (!response.ok || !data.ok) {
      let description = data.description || response.statusText;
      if (description.toLowerCase().includes('chat not found')) {
        chatKnownEstablished = false;
        const info = await getBotInfo();
        const botMention = info.username ? `@${info.username} (https://t.me/${info.username})` : 'your bot';
        description = `Chat not found for user ID "${chatId}". Telegram bots cannot message you first! Please open ${botMention} in Telegram, tap "Start" (or send /start), then tap "Send Test" again.`;
      }
      console.error('[Telegram API] sendMessage failed:', description);
      return { ok: false, description };
    }

    chatKnownEstablished = true;
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Telegram API] sendMessage network error:', msg);
    return { ok: false, error: msg };
  }
}

/**
 * Edits an existing message text and inline keyboard in-place (clean page turns on mobile)
 */
export async function editTelegramMessageText(
  chatId: string | number,
  messageId: number,
  text: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown';
    replyMarkup?: {
      inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
    };
  }
): Promise<{ ok: boolean; description?: string }> {
  const { botToken } = getTelegramConfig();
  if (!botToken) return { ok: false, description: 'TELEGRAM_BOT_TOKEN not configured' };

  try {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: options?.parseMode || 'HTML',
    };
    if (options?.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as { ok: boolean; description?: string };
    return { ok: data.ok, description: data.description };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, description: msg };
  }
}

/**
 * Acknowledges an incoming callback query with an optional quick notification or alert
 */
export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  options?: {
    text?: string;
    showAlert?: boolean;
  }
): Promise<{ ok: boolean }> {
  const { botToken } = getTelegramConfig();
  if (!botToken) return { ok: false };

  try {
    const payload: Record<string, unknown> = {
      callback_query_id: callbackQueryId,
    };
    if (options?.text) payload.text = options.text;
    if (options?.showAlert) payload.show_alert = options.showAlert;

    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: true };
  } catch (e) {
    console.error('[Telegram API] answerCallbackQuery error:', e);
    return { ok: false };
  }
}

/**
 * Requests speech audio from the existing MY LEARNING TTS endpoint (HuggingFace Piper/Edge TTS)
 */
export async function fetchTTSAudio(
  text: string,
  voice: string,
  rate: string = '0%'
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const cleanText = text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*#~]/g, '')
    .replace(/^[•\-\d.]+\s+/g, '')
    .trim();

  if (!cleanText) return null;

  const params = new URLSearchParams();
  params.set('text', cleanText);
  params.set('voice', voice);
  if (rate && rate !== '0%') {
    params.set('rate', rate);
  }

  const url = `${TTS_ENDPOINT}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'audio/mpeg, audio/wav, audio/*;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`[TTS Service] Failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      console.error('[TTS Service] Empty audio buffer returned');
      return null;
    }

    return { buffer, contentType };
  } catch (err) {
    console.error('[TTS Service] Error fetching audio from endpoint:', err);
    return null;
  }
}

/**
 * Sends an audio clip to Telegram using sendAudio
 */
export async function sendTelegramAudio(
  chatId: string | number,
  audioBuffer: Buffer,
  options: {
    filename?: string;
    title?: string;
    performer?: string;
    caption?: string;
  }
): Promise<{ ok: boolean; description?: string; error?: string }> {
  const { botToken } = getTelegramConfig();
  if (!botToken) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN is not configured' };
  }

  try {
    const form = new FormData();
    form.append('chat_id', String(chatId));

    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    form.append('audio', blob, options.filename || 'audio.mp3');

    if (options.title) form.append('title', options.title);
    if (options.performer) form.append('performer', options.performer);
    if (options.caption) form.append('caption', options.caption);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendAudio`, {
      method: 'POST',
      body: form,
    });

    const data = await response.json() as { ok: boolean; description?: string };
    if (!response.ok || !data.ok) {
      let description = data.description || response.statusText;
      if (description.toLowerCase().includes('chat not found')) {
        chatKnownEstablished = false;
        const info = await getBotInfo();
        const botMention = info.username ? `@${info.username} (https://t.me/${info.username})` : 'your bot';
        description = `Chat not found for user ID "${chatId}". Please open ${botMention} in Telegram and tap "Start" (/start).`;
      }
      console.error('[Telegram API] sendAudio failed:', description);
      return { ok: false, description };
    }

    chatKnownEstablished = true;
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Telegram API] sendAudio network error:', msg);
    return { ok: false, error: msg };
  }
}

/**
 * ACTION: Send Telegram Test
 * Sends standard greeting to allowed user only.
 */
export async function sendTelegramTest(): Promise<{ ok: boolean; message?: string; error?: string }> {
  const { isConfigured, allowedUserId } = getTelegramConfig();
  if (!isConfigured) {
    return {
      ok: false,
      error: 'Telegram integration is not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_ALLOWED_USER_ID in your environment.',
    };
  }

  const message = `🎓 <b>MY LEARNING</b>\n\nTelegram connected successfully.\n\nI learn by typing. ⌨️`;
  const result = await sendTelegramMessage(allowedUserId, message);
  if (!result.ok) {
    return { ok: false, error: result.description || result.error || 'Failed to send test message' };
  }

  return { ok: true, message: 'Telegram test message sent successfully to your allowed user ID.' };
}

/**
 * ACTION: Send Sample Vocabulary Review
 * Sends the requested vocabulary test content:
 * "pay-as-you-go" + word audio + example sentence audio
 */
export async function sendTelegramVocabSample(): Promise<{ ok: boolean; message?: string; error?: string }> {
  const { isConfigured, allowedUserId } = getTelegramConfig();
  if (!isConfigured) {
    return {
      ok: false,
      error: 'Telegram integration is not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_ALLOWED_USER_ID.',
    };
  }

  const textMessage = 
`🇬🇧 <b>MY LEARNING</b>

<b>WORD TO REMEMBER</b>

<code>pay-as-you-go</code>

<b>Meaning:</b>
You pay for what you use.

<b>Somali:</b>
Waxaad bixisaa inta aad isticmaasho.

<b>Example:</b>
I use a pay-as-you-go phone plan.

🎧 Listen below`;

  const msgRes = await sendTelegramMessage(allowedUserId, textMessage);
  if (!msgRes.ok) {
    return { ok: false, error: msgRes.description || msgRes.error };
  }

  // 1. Send word audio ("pay-as-you-go")
  const wordAudio = await fetchTTSAudio('pay-as-you-go', SERVER_TTS_VOICES.en);
  if (wordAudio) {
    await sendTelegramAudio(allowedUserId, wordAudio.buffer, {
      filename: 'pay-as-you-go.mp3',
      title: 'pay-as-you-go',
      performer: 'MY LEARNING • English',
      caption: '🔊 Vocabulary: pay-as-you-go',
    });
  }

  // 2. Send sentence audio ("I use a pay-as-you-go phone plan.")
  const sentenceAudio = await fetchTTSAudio('I use a pay-as-you-go phone plan.', SERVER_TTS_VOICES.en);
  if (sentenceAudio) {
    await sendTelegramAudio(allowedUserId, sentenceAudio.buffer, {
      filename: 'example-sentence.mp3',
      title: 'Example Sentence',
      performer: 'MY LEARNING • English',
      caption: '🔊 Example: "I use a pay-as-you-go phone plan."',
    });
  }

  return { ok: true, message: 'Sample vocabulary and audio sent to Telegram.' };
}

/**
 * ACTION: Send Sample Somali Concept
 * Sends the verified Somali TTS test:
 * "Variable-ku wuxuu kaydiyaa qiime." with voice: so-SO-MuuseNeural
 */
export async function sendTelegramSomaliSample(): Promise<{ ok: boolean; message?: string; error?: string }> {
  const { isConfigured, allowedUserId } = getTelegramConfig();
  if (!isConfigured) {
    return {
      ok: false,
      error: 'Telegram integration is not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_ALLOWED_USER_ID.',
    };
  }

  const textMessage =
`🐍 <b>MY LEARNING — Python Variables</b>

<b>PROGRAMMING WORD</b>

<code>variable</code>

<b>Meaning:</b>
A variable stores a value.

<b>Somali:</b>
Variable-ku wuxuu kaydiyaa qiime.

<b>Swedish:</b>
En variabel lagrar ett värde.

<b>Example:</b>
<code>name = "Ali"</code>

🎧 Listen to Somali explanation below`;

  const msgRes = await sendTelegramMessage(allowedUserId, textMessage);
  if (!msgRes.ok) {
    return { ok: false, error: msgRes.description || msgRes.error };
  }

  // Send Somali audio with verified voice so-SO-MuuseNeural and -10% rate
  const somaliAudio = await fetchTTSAudio(
    'Variable-ku wuxuu kaydiyaa qiime.',
    SERVER_TTS_VOICES.so,
    '-10%'
  );

  if (somaliAudio) {
    await sendTelegramAudio(allowedUserId, somaliAudio.buffer, {
      filename: 'somali-explanation.mp3',
      title: 'Variable-ku wuxuu kaydiyaa qiime',
      performer: 'MY LEARNING • Python (Somali)',
      caption: '🔊 Somali explanation (Muuse): "Variable-ku wuxuu kaydiyaa qiime."',
    });
  }

  return { ok: true, message: 'Sample Somali programming concept and audio sent to Telegram.' };
}

/**
 * Reusable Mistake Review sender
 */
export async function sendTelegramMistakeReview(
  item: ReviewItem,
  appBaseUrl?: string
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const { isConfigured, allowedUserId } = getTelegramConfig();
  if (!isConfigured) {
    return { ok: false, error: 'Telegram is not configured.' };
  }

  const isPython = item.subject === 'python';
  const flag = isPython ? '🐍' : item.subject === 'sv' ? '🇸🇪' : '🇬🇧';
  const subjectName = isPython ? 'Python' : item.subject === 'sv' ? 'Swedish' : 'English';

  let text = `${flag} <b>MY LEARNING — Mistake Review</b>\n\n`;
  if (item.topic) {
    text += `<b>${item.topic}</b>\n\n`;
  }

  if (item.mistake) {
    text += `You wrote:\n<code>${item.mistake}</code>\n\n`;
  }
  if (item.correction) {
    text += `Correct:\n<code>${item.correction}</code>\n\n`;
  }
  if (item.explanation) {
    text += `Remember:\n${item.explanation}\n\n`;
  }

  const replyMarkup = (appBaseUrl && item.practicePath) ? {
    inline_keyboard: [
      [
        {
          text: '⌨️ Practice in MY LEARNING',
          url: `${appBaseUrl.replace(/\/$/, '')}${item.practicePath.startsWith('/') ? '' : '/'}${item.practicePath}`,
        },
      ],
    ],
  } : undefined;

  const msgRes = await sendTelegramMessage(allowedUserId, text, { replyMarkup });
  if (!msgRes.ok) {
    return { ok: false, error: msgRes.description || msgRes.error };
  }

  // Audio explanation or sentence audio (Do NOT read code)
  if (item.audioText) {
    const voice = item.audioVoice || (isPython ? SERVER_TTS_VOICES.en : item.subject === 'sv' ? SERVER_TTS_VOICES.sv : SERVER_TTS_VOICES.en);
    const audio = await fetchTTSAudio(item.audioText, voice);
    if (audio) {
      await sendTelegramAudio(allowedUserId, audio.buffer, {
        filename: 'review-audio.mp3',
        title: item.topic || 'Pronunciation & Explanation',
        performer: `MY LEARNING • ${subjectName}`,
        caption: `🔊 ${item.audioText}`,
      });
    }
  }

  return { ok: true, message: 'Mistake review sent to Telegram.' };
}

export function getAppBaseUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  return 'https://ais-dev-yujrwrksrvdvcf4hpj3arr-163897255455.europe-west2.run.app';
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 8-section persistent Reply Keyboard for Telegram mobile
 */
export const MAIN_REPLY_KEYBOARD = {
  keyboard: [
    [{ text: '📚 Today’s Review' }, { text: '🧠 Mistakes' }],
    [{ text: '🗣️ Vocabulary' }, { text: '🐍 Python' }],
    [{ text: '🇬🇧 English' }, { text: '🇸🇪 Swedish' }],
    [{ text: '📊 Progress' }, { text: '⚙️ Settings' }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

export function buildMainMenuMessage(): { text: string; replyMarkup: any } {
  const text =
`🎓 <b>MY LEARNING</b>

Your private learning companion.

What would you like to practice?`;

  return {
    text,
    replyMarkup: MAIN_REPLY_KEYBOARD,
  };
}

export function buildTodayReviewMessage(index: number = 0): { text: string; replyMarkup: any } {
  const total = TELEGRAM_TODAY_ITEMS.length;
  const safeIdx = ((index % total) + total) % total;
  const item = TELEGRAM_TODAY_ITEMS[safeIdx];
  const baseUrl = getAppBaseUrl();

  let text = `📚 <b>TODAY'S REVIEW</b>\n\n`;
  text += `${item.flag} <b>${escapeHtml(item.categoryLabel)}</b>\n\n`;
  text += `<code>${escapeHtml(item.title)}</code>\n\n`;

  for (const line of item.contentLines) {
    if (line.label) {
      text += `<b>${escapeHtml(line.label)}:</b>\n`;
    }
    if (line.code) {
      text += `<code>${escapeHtml(line.text)}</code>\n\n`;
    } else {
      text += `${escapeHtml(line.text)}\n\n`;
    }
  }

  const nextIdx = (safeIdx + 1) % total;

  const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [
    [
      { text: '🔊 Word', callback_data: `audio:today:w:${item.id}` },
      { text: '🔊 Sentence', callback_data: `audio:today:s:${item.id}` },
    ],
    [
      { text: '⌨️ Practice', url: `${baseUrl}${item.practicePath}` },
      { text: '➡️ Next', callback_data: `today:idx:${nextIdx}` },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'menu:main' },
    ],
  ];

  return {
    text: text.trim(),
    replyMarkup: { inline_keyboard: inlineKeyboard },
  };
}

export function buildVocabMessage(index: number = 0, subjectFilter?: string): { text: string; replyMarkup: any } {
  let pool = TELEGRAM_VOCAB_ITEMS;
  if (subjectFilter && subjectFilter !== 'all') {
    pool = TELEGRAM_VOCAB_ITEMS.filter((v) => v.subject === subjectFilter);
    if (pool.length === 0) pool = TELEGRAM_VOCAB_ITEMS;
  }

  const total = pool.length;
  const safeIdx = ((index % total) + total) % total;
  const item = pool[safeIdx];
  const baseUrl = getAppBaseUrl();

  let text = `${item.flag} <b>VOCABULARY</b>\n\n`;
  text += `<code>${escapeHtml(item.word)}</code>\n\n`;
  text += `<b>Meaning:</b>\n${escapeHtml(item.meaning)}\n\n`;
  if (item.somaliTranslation) {
    text += `<b>Somali:</b>\n${escapeHtml(item.somaliTranslation)}\n\n`;
  }
  text += `<b>Example:</b>\n${escapeHtml(item.exampleSentence)}`;

  const prevIdx = (safeIdx - 1 + total) % total;
  const nextIdx = (safeIdx + 1) % total;
  const filterParam = subjectFilter ? `:${subjectFilter}` : '';

  const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [
    [
      { text: '🔊 Word', callback_data: `audio:vocab:w:${item.id}` },
      { text: '🔊 Sentence', callback_data: `audio:vocab:s:${item.id}` },
    ],
    [
      { text: '⌨️ Practice Again', url: `${baseUrl}${item.practicePath}` },
    ],
    [
      { text: '⬅️ Previous', callback_data: `vocab:idx:${prevIdx}${filterParam}` },
      { text: '➡️ Next', callback_data: `vocab:idx:${nextIdx}${filterParam}` },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'menu:main' },
    ],
  ];

  return {
    text: text.trim(),
    replyMarkup: { inline_keyboard: inlineKeyboard },
  };
}

export function buildMistakesMessage(index: number = 0, subjectFilter?: string): { text: string; replyMarkup: any } {
  let pool = TELEGRAM_MISTAKE_ITEMS;
  if (subjectFilter && subjectFilter !== 'all') {
    pool = TELEGRAM_MISTAKE_ITEMS.filter((m) => m.subject === subjectFilter);
    if (pool.length === 0) pool = TELEGRAM_MISTAKE_ITEMS;
  }

  const total = pool.length;
  const safeIdx = ((index % total) + total) % total;
  const item = pool[safeIdx];
  const baseUrl = getAppBaseUrl();

  let text = `🧠 <b>MISTAKE REVIEW</b>\n\n`;
  text += `${item.flag} <b>${escapeHtml(item.topic)}</b>\n\n`;
  text += `You wrote:\n<code>${escapeHtml(item.mistake)}</code>\n\n`;
  text += `Correct:\n<code>${escapeHtml(item.correction)}</code>\n\n`;
  text += `Remember:\n${escapeHtml(item.explanation)}`;

  const prevIdx = (safeIdx - 1 + total) % total;
  const nextIdx = (safeIdx + 1) % total;
  const filterParam = subjectFilter ? `:${subjectFilter}` : '';

  const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [
    [
      { text: '🔊 Explanation', callback_data: `audio:mistake:${item.id}` },
    ],
    [
      { text: '⌨️ Practice Again', url: `${baseUrl}${item.practicePath}` },
    ],
    [
      { text: '⬅️ Previous', callback_data: `mistake:idx:${prevIdx}${filterParam}` },
      { text: '➡️ Next Mistake', callback_data: `mistake:idx:${nextIdx}${filterParam}` },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'menu:main' },
    ],
  ];

  return {
    text: text.trim(),
    replyMarkup: { inline_keyboard: inlineKeyboard },
  };
}

export function buildPythonMessage(): { text: string; replyMarkup: any } {
  const baseUrl = getAppBaseUrl();
  const prog = liveTelegramProgress;

  const text =
`🐍 <b>PYTHON</b>

<b>Current topic:</b>
${escapeHtml(prog.pythonLesson || 'Variables')}

<b>Progress:</b>
${prog.pythonPct}% complete

<b>Review Categories:</b>
• Variables & Data Types
• Programming Vocabulary
• Case Sensitivity & Mistakes
• Interactive Recall`;

  const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [
    [
      { text: '▶️ Continue', url: `${baseUrl}/focus/python` },
    ],
    [
      { text: '🧠 Review Mistakes', callback_data: 'mistake:filter:python' },
      { text: '📖 Vocabulary', callback_data: 'vocab:filter:python' },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'menu:main' },
    ],
  ];

  return {
    text,
    replyMarkup: { inline_keyboard: inlineKeyboard },
  };
}

export function buildEnglishMessage(): { text: string; replyMarkup: any } {
  const baseUrl = getAppBaseUrl();
  const prog = liveTelegramProgress;

  const text =
`🇬🇧 <b>ENGLISH</b>

<b>Current lesson:</b>
${escapeHtml(prog.englishLesson || 'Phone Plans')}

<b>Progress:</b>
${prog.englishPct}% complete

<b>Active Focus:</b>
• Mobile phone contracts & prepaid plans
• Uncountable nouns ("lots of data")
• Real-life dialogue typing`;

  const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [
    [
      { text: '▶️ Continue', url: `${baseUrl}/focus/english` },
    ],
    [
      { text: '🗣️ Vocabulary', callback_data: 'vocab:filter:english' },
      { text: '🧠 Mistakes', callback_data: 'mistake:filter:english' },
    ],
    [
      { text: '📚 Quick Review', callback_data: 'today:idx:0' },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'menu:main' },
    ],
  ];

  return {
    text,
    replyMarkup: { inline_keyboard: inlineKeyboard },
  };
}

export function buildSwedishMessage(): { text: string; replyMarkup: any } {
  const baseUrl = getAppBaseUrl();
  const prog = liveTelegramProgress;

  const text =
`🇸🇪 <b>SWEDISH</b>

<b>Current lesson:</b>
${escapeHtml(prog.swedishLesson || 'På café')}

<b>Progress:</b>
${prog.swedishPct}% complete

<b>Active Focus:</b>
• Polite café ordering ("Kan jag få...")
• Vocabulary & refill ("påfyllning")
• Natural spoken listening`;

  const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [
    [
      { text: '▶️ Continue', url: `${baseUrl}/focus/swedish` },
    ],
    [
      { text: '🗣️ Vocabulary', callback_data: 'vocab:filter:swedish' },
      { text: '🧠 Mistakes', callback_data: 'mistake:filter:swedish' },
    ],
    [
      { text: '📚 Quick Review', callback_data: 'today:idx:2' },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'menu:main' },
    ],
  ];

  return {
    text,
    replyMarkup: { inline_keyboard: inlineKeyboard },
  };
}

export function buildProgressMessage(): { text: string; replyMarkup: any } {
  const baseUrl = getAppBaseUrl();
  const prog = liveTelegramProgress;

  const text =
`📊 <b>MY PROGRESS</b>

🔥 <b>Streak:</b> ${prog.streakDays} days

🇬🇧 <b>English</b>
${prog.englishPct}%

🇸🇪 <b>Swedish</b>
${prog.swedishPct}%

🐍 <b>Python</b>
${prog.pythonPct}%

<b>Mistakes to review:</b>
${prog.mistakesCount}`;

  const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [
    [
      { text: '⌨️ Open MY LEARNING', url: `${baseUrl}/progress` },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'menu:main' },
    ],
  ];

  return {
    text,
    replyMarkup: { inline_keyboard: inlineKeyboard },
  };
}

export function buildSettingsMessage(): { text: string; replyMarkup: any } {
  const voiceLabel = liveTelegramSettings.somaliVoice === 'so-SO-MuuseNeural' ? 'Muuse' : 'Ubax';
  const transLabel =
    liveTelegramSettings.translation === 'so'
      ? 'Somali'
      : liveTelegramSettings.translation === 'sv'
      ? 'Swedish'
      : 'Off';

  const text =
`⚙️ <b>SETTINGS</b>

🔊 <b>Audio Engine:</b> Edge Neural TTS
🇸🇴 <b>Somali Voice:</b> ${voiceLabel}
🌐 <b>Translation:</b> ${transLabel}
🤖 <b>Companion Status:</b> Active

<i>Tap below to switch preferences:</i>`;

  const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [
    [
      { text: `🎙️ Somali Voice: ${voiceLabel} (Toggle)`, callback_data: 'settings:voice:toggle' },
    ],
    [
      { text: `🌐 Translation: ${transLabel} (Toggle)`, callback_data: 'settings:trans:toggle' },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'menu:main' },
    ],
  ];

  return {
    text,
    replyMarkup: { inline_keyboard: inlineKeyboard },
  };
}

/**
 * Handles incoming Telegram Webhook updates (messages, slash commands, and button callbacks).
 * Statically enforces that ONLY TELEGRAM_ALLOWED_USER_ID is permitted for both messages and callbacks.
 */
export async function handleTelegramWebhook(
  update: any
): Promise<{ ok: boolean; responseMessage?: string; unauthorized?: boolean }> {
  // 1. HANDLE INLINE BUTTON CALLBACK QUERIES
  if (update?.callback_query) {
    const cq = update.callback_query;
    const senderId = cq.from?.id;
    const chatId = cq.message?.chat?.id || senderId;
    const messageId = cq.message?.message_id;
    const data = (cq.data || '').trim();

    // CALLBACK SECURITY: Verify sender against TELEGRAM_ALLOWED_USER_ID
    if (!isUserAllowed(senderId)) {
      console.warn(`[Telegram Security] Blocked callback from unauthorized user: ${senderId}`);
      await answerTelegramCallbackQuery(cq.id, {
        text: 'This bot is private.',
        showAlert: true,
      });
      return { ok: true, unauthorized: true };
    }

    chatKnownEstablished = true;

    // --- Action: Navigation to Main Menu ---
    if (data === 'menu:main') {
      const card = buildMainMenuMessage();
      if (messageId) {
        await editTelegramMessageText(chatId, messageId, card.text, { replyMarkup: card.replyMarkup }).catch(() =>
          sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup })
        );
      } else {
        await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
      }
      await answerTelegramCallbackQuery(cq.id);
      return { ok: true, responseMessage: 'Main menu' };
    }

    // --- Action: Today's Review index pagination ---
    if (data.startsWith('today:idx:')) {
      const idx = parseInt(data.split(':')[2], 10) || 0;
      const card = buildTodayReviewMessage(idx);
      if (messageId) {
        await editTelegramMessageText(chatId, messageId, card.text, { replyMarkup: card.replyMarkup }).catch(() =>
          sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup })
        );
      } else {
        await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
      }
      await answerTelegramCallbackQuery(cq.id);
      return { ok: true, responseMessage: 'Today review updated' };
    }

    // --- Action: Vocabulary index pagination & filtering ---
    if (data.startsWith('vocab:idx:')) {
      const parts = data.split(':');
      const idx = parseInt(parts[2], 10) || 0;
      const filter = parts[3];
      const card = buildVocabMessage(idx, filter);
      if (messageId) {
        await editTelegramMessageText(chatId, messageId, card.text, { replyMarkup: card.replyMarkup }).catch(() =>
          sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup })
        );
      } else {
        await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
      }
      await answerTelegramCallbackQuery(cq.id);
      return { ok: true, responseMessage: 'Vocab updated' };
    }

    if (data.startsWith('vocab:filter:')) {
      const filter = data.split(':')[2];
      const card = buildVocabMessage(0, filter);
      if (messageId) {
        await editTelegramMessageText(chatId, messageId, card.text, { replyMarkup: card.replyMarkup }).catch(() =>
          sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup })
        );
      } else {
        await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
      }
      await answerTelegramCallbackQuery(cq.id);
      return { ok: true, responseMessage: 'Vocab filter updated' };
    }

    // --- Action: Mistakes index pagination & filtering ---
    if (data.startsWith('mistake:idx:')) {
      const parts = data.split(':');
      const idx = parseInt(parts[2], 10) || 0;
      const filter = parts[3];
      const card = buildMistakesMessage(idx, filter);
      if (messageId) {
        await editTelegramMessageText(chatId, messageId, card.text, { replyMarkup: card.replyMarkup }).catch(() =>
          sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup })
        );
      } else {
        await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
      }
      await answerTelegramCallbackQuery(cq.id);
      return { ok: true, responseMessage: 'Mistake updated' };
    }

    if (data.startsWith('mistake:filter:')) {
      const filter = data.split(':')[2];
      const card = buildMistakesMessage(0, filter);
      if (messageId) {
        await editTelegramMessageText(chatId, messageId, card.text, { replyMarkup: card.replyMarkup }).catch(() =>
          sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup })
        );
      } else {
        await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
      }
      await answerTelegramCallbackQuery(cq.id);
      return { ok: true, responseMessage: 'Mistake filter updated' };
    }

    // --- Action: Audio Buttons (On-Demand only) ---
    if (data.startsWith('audio:vocab:w:')) {
      const vocabId = data.split(':')[3];
      const item = TELEGRAM_VOCAB_ITEMS.find((v) => v.id === vocabId);
      if (item) {
        const tts = await fetchTTSAudio(item.word, item.voice);
        if (tts) {
          await sendTelegramAudio(chatId, tts.buffer, {
            title: item.word,
            performer: 'MY LEARNING · Vocabulary',
            filename: `${item.word.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp3`,
          });
        }
      }
      await answerTelegramCallbackQuery(cq.id, { text: 'Playing word pronunciation 🔊' });
      return { ok: true };
    }

    if (data.startsWith('audio:vocab:s:')) {
      const vocabId = data.split(':')[3];
      const item = TELEGRAM_VOCAB_ITEMS.find((v) => v.id === vocabId);
      if (item) {
        const tts = await fetchTTSAudio(item.exampleSentence, item.voice);
        if (tts) {
          await sendTelegramAudio(chatId, tts.buffer, {
            title: item.exampleSentence,
            performer: 'MY LEARNING · Example',
            filename: `sentence_${item.id}.mp3`,
          });
        }
      }
      await answerTelegramCallbackQuery(cq.id, { text: 'Playing sentence audio 🔊' });
      return { ok: true };
    }

    if (data.startsWith('audio:mistake:')) {
      const mistakeId = data.split(':')[2];
      const item = TELEGRAM_MISTAKE_ITEMS.find((m) => m.id === mistakeId);
      if (item) {
        // Do NOT read code automatically — only read human-language explanation
        const tts = await fetchTTSAudio(item.audioExplanation, item.voice);
        if (tts) {
          await sendTelegramAudio(chatId, tts.buffer, {
            title: 'Explanation',
            performer: 'MY LEARNING · Mistake Review',
            filename: `explanation_${item.id}.mp3`,
          });
        }
      }
      await answerTelegramCallbackQuery(cq.id, { text: 'Playing explanation 🔊' });
      return { ok: true };
    }

    if (data.startsWith('audio:today:w:')) {
      const todayId = data.split(':')[3];
      const item = TELEGRAM_TODAY_ITEMS.find((t) => t.id === todayId);
      if (item && item.audioWordText) {
        const voice = item.audioWordVoice || SERVER_TTS_VOICES.en;
        const tts = await fetchTTSAudio(item.audioWordText, voice);
        if (tts) {
          await sendTelegramAudio(chatId, tts.buffer, {
            title: item.audioWordText,
            performer: 'MY LEARNING · Review',
            filename: `today_word_${item.id}.mp3`,
          });
        }
      }
      await answerTelegramCallbackQuery(cq.id, { text: 'Playing pronunciation 🔊' });
      return { ok: true };
    }

    if (data.startsWith('audio:today:s:')) {
      const todayId = data.split(':')[3];
      const item = TELEGRAM_TODAY_ITEMS.find((t) => t.id === todayId);
      if (item && item.audioSentenceText) {
        const voice = item.audioSentenceVoice || SERVER_TTS_VOICES.en;
        const tts = await fetchTTSAudio(item.audioSentenceText, voice);
        if (tts) {
          await sendTelegramAudio(chatId, tts.buffer, {
            title: item.audioSentenceText,
            performer: 'MY LEARNING · Review',
            filename: `today_sentence_${item.id}.mp3`,
          });
        }
      }
      await answerTelegramCallbackQuery(cq.id, { text: 'Playing sentence audio 🔊' });
      return { ok: true };
    }

    // --- Action: Settings Toggles ---
    if (data === 'settings:voice:toggle') {
      const newVoice = toggleSomaliVoice();
      const card = buildSettingsMessage();
      if (messageId) {
        await editTelegramMessageText(chatId, messageId, card.text, { replyMarkup: card.replyMarkup }).catch(() =>
          sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup })
        );
      }
      await answerTelegramCallbackQuery(cq.id, { text: `Somali voice: ${newVoice}` });
      return { ok: true };
    }

    if (data === 'settings:trans:toggle') {
      const newTrans = toggleTranslation();
      const card = buildSettingsMessage();
      if (messageId) {
        await editTelegramMessageText(chatId, messageId, card.text, { replyMarkup: card.replyMarkup }).catch(() =>
          sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup })
        );
      }
      await answerTelegramCallbackQuery(cq.id, { text: `Translation: ${newTrans.toUpperCase()}` });
      return { ok: true };
    }

    await answerTelegramCallbackQuery(cq.id);
    return { ok: true };
  }

  // 2. HANDLE STANDARD MESSAGES AND REPLY KEYBOARD BUTTONS
  const message = update?.message || update?.edited_message;
  if (!message) {
    return { ok: true };
  }

  const senderId = message.from?.id;
  const chatId = message.chat?.id || senderId;
  const text = (message.text || '').trim();

  // SECURITY CHECK: Verify sender against TELEGRAM_ALLOWED_USER_ID
  if (!isUserAllowed(senderId)) {
    console.warn(`[Telegram Security] Blocked message from unauthorized user: ${senderId}`);
    // Non-revealing private bot response
    await sendTelegramMessage(chatId, 'This bot is private.');
    return { ok: true, unauthorized: true };
  }

  // User is confirmed authorized and communicating with the bot
  chatKnownEstablished = true;

  const lower = text.toLowerCase();

  // Route 1: Start or Main Menu
  if (lower.startsWith('/start') || lower.includes('main menu') || lower === 'menu' || lower === '🏠') {
    const card = buildMainMenuMessage();
    await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
    return { ok: true, responseMessage: 'Main menu sent' };
  }

  // Route 2: Today's Review
  if (
    text.includes('Today’s Review') ||
    text.includes("Today's Review") ||
    lower.startsWith('/today') ||
    lower === 'today'
  ) {
    const card = buildTodayReviewMessage(0);
    await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
    return { ok: true, responseMessage: 'Today review sent' };
  }

  // Route 3: Mistakes
  if (text.includes('Mistakes') || lower.startsWith('/mistake') || lower === 'mistakes') {
    const card = buildMistakesMessage(0);
    await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
    return { ok: true, responseMessage: 'Mistakes sent' };
  }

  // Route 4: Vocabulary
  if (text.includes('Vocabulary') || lower.startsWith('/vocab') || lower === 'vocab') {
    const card = buildVocabMessage(0);
    await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
    return { ok: true, responseMessage: 'Vocab sent' };
  }

  // Route 5: Python
  if (text.includes('Python') || lower.startsWith('/python') || lower === 'python') {
    const card = buildPythonMessage();
    await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
    return { ok: true, responseMessage: 'Python sent' };
  }

  // Route 6: English
  if (text.includes('English') || lower.startsWith('/english') || lower === 'english') {
    const card = buildEnglishMessage();
    await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
    return { ok: true, responseMessage: 'English sent' };
  }

  // Route 7: Swedish
  if (text.includes('Swedish') || lower.startsWith('/swedish') || lower === 'swedish') {
    const card = buildSwedishMessage();
    await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
    return { ok: true, responseMessage: 'Swedish sent' };
  }

  // Route 8: Progress
  if (text.includes('Progress') || lower.startsWith('/progress') || lower === 'progress') {
    const card = buildProgressMessage();
    await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
    return { ok: true, responseMessage: 'Progress sent' };
  }

  // Route 9: Settings
  if (text.includes('Settings') || lower.startsWith('/settings') || lower === 'settings') {
    const card = buildSettingsMessage();
    await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
    return { ok: true, responseMessage: 'Settings sent' };
  }

  // Testing hooks
  if (text.startsWith('/test')) {
    await sendTelegramTest();
    return { ok: true, responseMessage: 'Test sent' };
  }

  if (text.startsWith('/somali')) {
    await sendTelegramSomaliSample();
    return { ok: true, responseMessage: 'Somali test sent' };
  }

  // Default: Return the clean main menu
  const card = buildMainMenuMessage();
  await sendTelegramMessage(chatId, card.text, { replyMarkup: card.replyMarkup });
  return { ok: true };
}

/**
 * Resolves the application URL defensively from environment variables or request headers.
 */
export function resolveAppBaseUrl(providedUrl?: string | null): string | null {
  const raw = providedUrl || process.env.APP_URL;
  if (!raw || typeof raw !== 'string') return null;
  let trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Registers the Telegram Webhook for this bot.
 */
export async function setTelegramWebhook(webhookUrl: string): Promise<{ ok: boolean; description?: string }> {
  const { botToken } = getTelegramConfig();
  if (!botToken) return { ok: false, description: 'TELEGRAM_BOT_TOKEN not configured' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: false,
      }),
    });
    const data = (await res.json()) as { ok: boolean; description?: string };
    return { ok: Boolean(data.ok), description: data.description };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, description: msg };
  }
}

/**
 * Gets the current Telegram Webhook information from Telegram Bot API.
 */
export async function getTelegramWebhookInfo(): Promise<{
  url?: string;
  hasCustomCertificate?: boolean;
  pendingUpdateCount?: number;
  lastErrorDate?: number;
  lastErrorMessage?: string;
}> {
  const { botToken } = getTelegramConfig();
  if (!botToken) return {};

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const data = (await res.json()) as any;
    if (res.ok && data.ok && data.result) {
      return {
        url: data.result.url || '',
        hasCustomCertificate: Boolean(data.result.has_custom_certificate),
        pendingUpdateCount: data.result.pending_update_count,
        lastErrorDate: data.result.last_error_date,
        lastErrorMessage: data.result.last_error_message,
      };
    }
  } catch (e) {
    console.error('[Telegram API] getWebhookInfo error:', e);
  }
  return {};
}



/**
 * Vercel Serverless Function scoped strictly to /api/telegram/*
 * Fully self-contained with ZERO local relative imports.
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

    // 1. Webhook Receiver: POST /api/telegram/webhook (Open for Telegram servers)
    if (url.includes('/webhook') && method === 'POST') {
      const result = await handleTelegramWebhook(body);
      return res.status(200).json(result);
    }

    // All management routes require an authenticated session
    if (!isAuthenticatedRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    // 2. Status: GET /api/telegram/status
    if (url.includes('/status') && method === 'GET') {
      const { botToken, allowedUserId, isConfigured } = getTelegramConfig();
      const botInfo = await getBotInfo();
      const webhookInfo = await getTelegramWebhookInfo();

      return res.status(200).json({
        configured: isConfigured,
        hasBotToken: Boolean(botToken),
        hasAllowedUserId: Boolean(allowedUserId),
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
    }

    // 3. Webhook Setup: POST /api/telegram/setup-webhook
    if (url.includes('/setup-webhook') && method === 'POST') {
      const providedUrl = body?.url || (req.headers?.origin || req.headers?.referer || '').toString();
      const appBase = resolveAppBaseUrl(providedUrl);
      if (!appBase) {
        return res.status(400).json({
          ok: false,
          error: 'Missing application URL. Configure APP_URL environment variable or supply url in body.',
        });
      }

      const webhookUrl = `${appBase}/api/telegram/webhook`;
      const result = await setTelegramWebhook(webhookUrl);
      const webhookInfo = await getTelegramWebhookInfo();

      return res.status(result.ok ? 200 : 400).json({
        ok: result.ok,
        description: result.description,
        webhookUrl,
        webhook: webhookInfo,
      });
    }

    // 4. Test: POST /api/telegram/test
    if (url.includes('/test') && method === 'POST') {
      const result = await sendTelegramTest();
      return res.status(result.ok ? 200 : 400).json(result);
    }

    // 5. Sample Vocab: POST /api/telegram/send-sample-vocab
    if (url.includes('/send-sample-vocab') && method === 'POST') {
      const result = await sendTelegramVocabSample();
      return res.status(result.ok ? 200 : 400).json(result);
    }

    // 6. Sample Somali: POST /api/telegram/send-sample-somali
    if (url.includes('/send-sample-somali') && method === 'POST') {
      const result = await sendTelegramSomaliSample();
      return res.status(result.ok ? 200 : 400).json(result);
    }

    // 7. Send Mistake: POST /api/telegram/send-mistake
    if (url.includes('/send-mistake') && method === 'POST') {
      const appUrl = (req.headers?.origin || req.headers?.referer || '').toString().replace(/\/$/, '');
      const result = await sendTelegramMistakeReview(body, appUrl);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    // 8. Sync Progress: POST /api/telegram/sync-progress
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
