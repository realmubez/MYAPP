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
