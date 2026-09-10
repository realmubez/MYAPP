/**
 * TTS Service for MY LEARNING
 * Integrates with Hugging Face Piper/Edge TTS endpoint:
 * https://muberes-my-piper-tts.hf.space/tts
 */

import { Language } from '../types/lessons';

export const TTS_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_TTS_BASE_URL) ||
  'https://muberes-my-piper-tts.hf.space/tts';

export interface TTSRequestOptions {
  text: string;
  voice: string;
  rate?: string; // e.g. "-15%", "0%", "+10%"
}

export interface VoiceOption {
  id: string;
  name: string;
  language: Language;
  gender: 'male' | 'female';
  region: string;
  description: string;
}

export const SWEDISH_VOICES: VoiceOption[] = [
  {
    id: 'sv-SE-MattiasNeural',
    name: 'Mattias (Neural)',
    language: 'sv',
    gender: 'male',
    region: 'Sweden',
    description: 'Natural, clear standard Swedish (default)',
  },
  {
    id: 'sv-SE-SofieNeural',
    name: 'Sofie (Neural)',
    language: 'sv',
    gender: 'female',
    region: 'Sweden',
    description: 'Warm, articulate Swedish',
  },
];

export const ENGLISH_VOICES: VoiceOption[] = [
  {
    id: 'en-GB-RyanNeural',
    name: 'Ryan (Neural)',
    language: 'en',
    gender: 'male',
    region: 'United Kingdom',
    description: 'Crisp British accent (default)',
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy (Neural)',
    language: 'en',
    gender: 'male',
    region: 'United States',
    description: 'Smooth American storytelling',
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny (Neural)',
    language: 'en',
    gender: 'female',
    region: 'United States',
    description: 'Expressive and natural American voice',
  },
];

export const SOMALI_VOICES: VoiceOption[] = [
  {
    id: 'so-SO-MuqdishoNeural',
    name: 'Muqdisho (Neural)',
    language: 'so' as unknown as Language,
    gender: 'male',
    region: 'Somalia',
    description: 'Natural standard Somali voice (default)',
  },
  {
    id: 'so-SO-UbaxNeural',
    name: 'Ubax (Neural)',
    language: 'so' as unknown as Language,
    gender: 'female',
    region: 'Somalia',
    description: 'Articulate female Somali voice',
  },
];

export const AVAILABLE_RATES = ['-20%', '-15%', '0%', '+10%'] as const;
export type TTSRate = typeof AVAILABLE_RATES[number];

// LocalStorage Keys
export const STORAGE_KEYS = {
  SWEDISH_VOICE: 'my-learning-swedish-voice',
  ENGLISH_VOICE: 'my-learning-english-voice',
  SOMALI_VOICE: 'my-learning-somali-voice',
  SWEDISH_RATE: 'my-learning-swedish-rate',
  ENGLISH_RATE: 'my-learning-english-rate',
  SOMALI_RATE: 'my-learning-somali-rate',
  AUTOPLAY_AUDIO: 'my-learning-autoplay-audio',
  DIFFICULT_WORDS: 'my-learning-difficult-words',
};

/**
 * Builds the URL safely using URLSearchParams to avoid unescaped text injection.
 */
export function getTTSUrl({ text, voice, rate }: TTSRequestOptions): string {
  const cleanText = text.trim();
  const params = new URLSearchParams();
  
  params.set('text', cleanText);
  params.set('voice', voice);

  if (rate && rate !== '0%') {
    params.set('rate', rate);
  }

  return `${TTS_BASE_URL}?${params.toString()}`;
}

export function getDefaultVoice(language: string): string {
  if (language === 'sv') return 'sv-SE-MattiasNeural';
  if (language === 'so') return 'so-SO-MuqdishoNeural';
  return 'en-US-GuyNeural';
}

export function getStoredVoice(language: Language): string {
  try {
    const key = language === 'sv' ? STORAGE_KEYS.SWEDISH_VOICE : STORAGE_KEYS.ENGLISH_VOICE;
    const stored = localStorage.getItem(key);
    if (stored) {
      const valid = language === 'sv' 
        ? SWEDISH_VOICES.some(v => v.id === stored)
        : ENGLISH_VOICES.some(v => v.id === stored);
      if (valid) return stored;
    }
  } catch (e) {
    console.warn('Failed to read voice setting from localStorage', e);
  }
  return getDefaultVoice(language);
}

export function setStoredVoice(language: Language, voice: string): void {
  try {
    const key = language === 'sv' ? STORAGE_KEYS.SWEDISH_VOICE : STORAGE_KEYS.ENGLISH_VOICE;
    localStorage.setItem(key, voice);
  } catch (e) {
    console.warn('Failed to save voice setting to localStorage', e);
  }
}

export function getStoredRate(language: Language): TTSRate {
  try {
    const key = language === 'sv' ? STORAGE_KEYS.SWEDISH_RATE : STORAGE_KEYS.ENGLISH_RATE;
    const stored = localStorage.getItem(key);
    if (stored && AVAILABLE_RATES.includes(stored as TTSRate)) {
      return stored as TTSRate;
    }
  } catch (e) {
    console.warn('Failed to read rate setting from localStorage', e);
  }
  return '0%';
}

export function setStoredRate(language: Language, rate: TTSRate): void {
  try {
    const key = language === 'sv' ? STORAGE_KEYS.SWEDISH_RATE : STORAGE_KEYS.ENGLISH_RATE;
    localStorage.setItem(key, rate);
  } catch (e) {
    console.warn('Failed to save rate setting to localStorage', e);
  }
}

export function getStoredAutoplay(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTOPLAY_AUDIO);
    if (stored === null) {
      // Default for language lessons is ON
      localStorage.setItem(STORAGE_KEYS.AUTOPLAY_AUDIO, 'true');
      return true;
    }
    return stored === 'true';
  } catch (e) {
    return true;
  }
}

export function setStoredAutoplay(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTOPLAY_AUDIO, String(enabled));
  } catch (e) {
    console.warn('Failed to save autoplay setting to localStorage', e);
  }
}

// Global audio unlock state for mobile browsers
let isAudioGloballyUnlocked = false;

export function isAudioUnlocked(): boolean {
  if (isAudioGloballyUnlocked) return true;
  try {
    return sessionStorage.getItem('my-learning-audio-unlocked') === 'true';
  } catch {
    return false;
  }
}

export function unlockAudio(): void {
  isAudioGloballyUnlocked = true;
  try {
    sessionStorage.setItem('my-learning-audio-unlocked', 'true');
    // Pre-warm HTMLAudio element on user interaction
    if (typeof window !== 'undefined') {
      const silentAudio = new Audio();
      silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      silentAudio.volume = 0.001;
      const promise = silentAudio.play();
      if (promise !== undefined) {
        promise.then(() => {
          silentAudio.pause();
        }).catch(() => {});
      }
    }
  } catch {
    // Ignore
  }
}
