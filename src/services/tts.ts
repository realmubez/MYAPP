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
    id: 'so-SO-MuuseNeural',
    name: 'Muuse (Neural)',
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

export const TTS_DEFAULT_VOICES: Record<string, string> = {
  en: 'en-US-GuyNeural',
  sv: 'sv-SE-MattiasNeural',
  so: 'so-SO-MuuseNeural',
};

export const AVAILABLE_RATES = ['-20%', '-15%', '-10%', '0%', '+10%'] as const;
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
 * Builds the URL safely using URLSearchParams to avoid unescaped text injection and handle encoding.
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
  if (language === 'sv') return TTS_DEFAULT_VOICES.sv;
  if (language === 'so') return TTS_DEFAULT_VOICES.so;
  return TTS_DEFAULT_VOICES.en;
}

export function getVoiceForLanguage(language: 'en' | 'sv' | 'so' | Language | string): string {
  if (language === 'sv') {
    return getStoredVoice('sv');
  }
  if (language === 'so') {
    return getStoredVoice('so');
  }
  return getStoredVoice('en');
}

/**
 * Strips code formatting like backticks or markdown bullets before sending to TTS
 * while preserving Somali text, apostrophes, hyphens, and natural punctuation.
 */
export function cleanSpeechText(text: string): string {
  if (!text) return '';
  return text
    .replace(/`([^`]+)`/g, '$1') // remove backticks
    .replace(/[*#~]/g, '') // remove markdown symbols but preserve hyphens/apostrophes
    .replace(/^[•\-\d.]+\s+/g, '') // remove leading bullet points/numbers
    .replace(/\s+/g, ' ')
    .trim();
}

// In-memory cache for audio object URLs to allow instant replay without network re-fetching
export const ttsAudioBlobCache = new Map<string, string>();

export async function fetchTTSAudioBlobUrl(url: string, signal?: AbortSignal): Promise<string> {
  const cached = ttsAudioBlobCache.get(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url, signal ? { signal } : undefined);
  if (!response.ok) {
    throw new Error(`TTS server responded with ${response.status}: ${response.statusText}`);
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error('TTS server returned an empty audio file');
  }

  const objectUrl = URL.createObjectURL(blob);
  ttsAudioBlobCache.set(url, objectUrl);
  return objectUrl;
}

export interface LessonSpeechState {
  playingKey: string | null;
  loadingKey: string | null;
  errorKey: string | null;
  errorMessage: string | null;
}

type SpeechListener = (state: LessonSpeechState) => void;

class LessonSpeechManager {
  private activeAudio: HTMLAudioElement | null = null;
  private activeAbortController: AbortController | null = null;
  private listeners = new Set<SpeechListener>();
  private state: LessonSpeechState = {
    playingKey: null,
    loadingKey: null,
    errorKey: null,
    errorMessage: null,
  };

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): LessonSpeechState {
    return this.state;
  }

  public stopSpeech(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }

    if (this.activeAudio) {
      try {
        const audio = this.activeAudio;
        audio.oncanplay = null;
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // Safe to ignore
      }
      this.activeAudio = null;
    }

    this.state = {
      playingKey: null,
      loadingKey: null,
      errorKey: null,
      errorMessage: null,
    };
    this.notify();
  }

  public async playSpeech({
    key,
    text,
    language = 'en',
    rate,
  }: {
    key: string;
    text: string;
    language?: 'en' | 'sv' | 'so' | string;
    rate?: TTSRate;
  }): Promise<void> {
    const cleanedText = cleanSpeechText(text);
    if (!cleanedText) return;

    // Toggle: if currently playing this exact key, stop it
    if (this.state.playingKey === key || this.state.loadingKey === key) {
      this.stopSpeech();
      return;
    }

    // Stop any ongoing speech
    this.stopSpeech();

    const voice = getVoiceForLanguage(language);
    const effectiveRate = rate ?? getStoredRate(language);
    const targetUrl = getTTSUrl({ text: cleanedText, voice, rate: effectiveRate });

    this.state = {
      playingKey: null,
      loadingKey: key,
      errorKey: null,
      errorMessage: null,
    };
    this.notify();

    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      let resolvedSrc = targetUrl;
      try {
        resolvedSrc = await fetchTTSAudioBlobUrl(targetUrl, abortController.signal);
      } catch (fetchErr) {
        if (abortController.signal.aborted) return;
        console.warn('TTS blob fetch fallback to direct URL:', fetchErr);
      }

      if (abortController.signal.aborted) return;

      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 1;
      audio.muted = false;
      audio.src = resolvedSrc;
      this.activeAudio = audio;

      audio.onplaying = () => {
        if (this.activeAudio === audio) {
          this.state = {
            playingKey: key,
            loadingKey: null,
            errorKey: null,
            errorMessage: null,
          };
          this.notify();
        }
      };

      audio.onended = () => {
        if (this.activeAudio === audio) {
          this.activeAudio = null;
          this.state = {
            playingKey: null,
            loadingKey: null,
            errorKey: null,
            errorMessage: null,
          };
          this.notify();
        }
      };

      audio.onerror = () => {
        if (this.activeAudio !== audio) return;
        if (audio.error && audio.error.code === MediaError.MEDIA_ERR_ABORTED) return;

        this.activeAudio = null;
        this.state = {
          playingKey: null,
          loadingKey: null,
          errorKey: key,
          errorMessage: 'Audio unavailable',
        };
        this.notify();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err: unknown) {
      if (abortController.signal.aborted) return;
      const playErr = err as { name?: string };
      if (playErr?.name === 'AbortError') return;

      this.activeAudio = null;
      this.state = {
        playingKey: null,
        loadingKey: null,
        errorKey: key,
        errorMessage: 'Audio unavailable',
      };
      this.notify();
    }
  }
}

export const lessonSpeechManager = new LessonSpeechManager();

export function getStoredVoice(language: 'en' | 'sv' | 'so' | Language | string): string {
  try {
    const key =
      language === 'sv'
        ? STORAGE_KEYS.SWEDISH_VOICE
        : language === 'so'
        ? STORAGE_KEYS.SOMALI_VOICE
        : STORAGE_KEYS.ENGLISH_VOICE;

    const stored = localStorage.getItem(key);
    if (stored) {
      const valid =
        language === 'sv'
          ? SWEDISH_VOICES.some((v) => v.id === stored)
          : language === 'so'
          ? SOMALI_VOICES.some((v) => v.id === stored)
          : ENGLISH_VOICES.some((v) => v.id === stored);
      if (valid) return stored;
    }
  } catch (e) {
    console.warn('Failed to read voice setting from localStorage', e);
  }
  return getDefaultVoice(language);
}

export function setStoredVoice(
  language: 'en' | 'sv' | 'so' | Language | string,
  voice: string
): void {
  try {
    const key =
      language === 'sv'
        ? STORAGE_KEYS.SWEDISH_VOICE
        : language === 'so'
        ? STORAGE_KEYS.SOMALI_VOICE
        : STORAGE_KEYS.ENGLISH_VOICE;
    localStorage.setItem(key, voice);
  } catch (e) {
    console.warn('Failed to save voice setting to localStorage', e);
  }
}

export function getStoredRate(language: 'en' | 'sv' | 'so' | Language | string): TTSRate {
  try {
    const key =
      language === 'sv'
        ? STORAGE_KEYS.SWEDISH_RATE
        : language === 'so'
        ? STORAGE_KEYS.SOMALI_RATE
        : STORAGE_KEYS.ENGLISH_RATE;
    const stored = localStorage.getItem(key);
    if (stored && AVAILABLE_RATES.includes(stored as TTSRate)) {
      return stored as TTSRate;
    }
  } catch (e) {
    console.warn('Failed to read rate setting from localStorage', e);
  }
  return language === 'so' ? '-10%' : '0%';
}

export function setStoredRate(
  language: 'en' | 'sv' | 'so' | Language | string,
  rate: TTSRate
): void {
  try {
    const key =
      language === 'sv'
        ? STORAGE_KEYS.SWEDISH_RATE
        : language === 'so'
        ? STORAGE_KEYS.SOMALI_RATE
        : STORAGE_KEYS.ENGLISH_RATE;
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
