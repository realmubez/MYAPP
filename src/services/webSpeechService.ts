/**
 * Web Speech API Service for Exam Prepare
 * Utilizes native browser window.speechSynthesis and SpeechSynthesisUtterance.
 * Specifically prioritizes and highlights Microsoft Edge Natural voices when available,
 * while gracefully supporting any browser (Chrome, Safari, Firefox).
 */

export interface SpeechVoiceOption {
  voice: SpeechSynthesisVoice;
  isMicrosoft: boolean;
  isNatural: boolean;
  isEnglish: boolean;
  displayName: string;
}

const STORAGE_KEYS = {
  VOICE_URI: 'my_learning_exam_voice_uri',
  SPEECH_RATE: 'my_learning_exam_speech_rate',
};

class WebSpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private listeners: Set<() => void> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const available = window.speechSynthesis.getVoices();
    if (available && available.length > 0) {
      this.voices = available;
      this.isInitialized = true;
      this.notifyListeners();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getVoices(): SpeechVoiceOption[] {
    if (!this.isSupported()) return [];
    if (this.voices.length === 0) {
      this.initVoices();
    }

    return this.voices.map((v) => {
      const isEnglish = v.lang.toLowerCase().startsWith('en');
      const nameLower = v.name.toLowerCase();
      const isMicrosoft = nameLower.includes('microsoft') || nameLower.includes('edge');
      const isNatural = nameLower.includes('natural') || nameLower.includes('online');

      let displayName = v.name;
      // Clean up common lengthy vendor prefixes for clean UI
      displayName = displayName
        .replace(/^Microsoft\s+/i, '')
        .replace(/\s+Online\s+\(Natural\)/i, ' (Natural)')
        .replace(/\s+-\s+English\s+\(.*\)/i, '');

      return {
        voice: v,
        isMicrosoft,
        isNatural,
        isEnglish,
        displayName: `${isMicrosoft ? 'Microsoft ' : ''}${displayName} (${v.lang})`,
      };
    });
  }

  public getEnglishVoices(): SpeechVoiceOption[] {
    const all = this.getVoices();
    const englishOnly = all.filter((v) => v.isEnglish);

    // Sort: Microsoft Natural first, then other Microsoft English, then standard English
    englishOnly.sort((a, b) => {
      if (a.isMicrosoft && a.isNatural && !(b.isMicrosoft && b.isNatural)) return -1;
      if (!(a.isMicrosoft && a.isNatural) && b.isMicrosoft && b.isNatural) return 1;
      if (a.isMicrosoft && !b.isMicrosoft) return -1;
      if (!a.isMicrosoft && b.isMicrosoft) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    return englishOnly.length > 0 ? englishOnly : all;
  }

  public getSavedVoiceURI(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.VOICE_URI) || '';
  }

  public setSavedVoiceURI(uri: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.VOICE_URI, uri);
    this.notifyListeners();
  }

  public getSavedRate(): number {
    if (typeof window === 'undefined') return 1.0;
    const saved = localStorage.getItem(STORAGE_KEYS.SPEECH_RATE);
    if (!saved) return 1.0;
    const parsed = parseFloat(saved);
    return isNaN(parsed) ? 1.0 : parsed;
  }

  public setSavedRate(rate: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SPEECH_RATE, rate.toString());
    this.notifyListeners();
  }

  /**
   * Finds the best voice to use:
   * 1. Saved voice URI if available and present
   * 2. First Microsoft Natural English voice (Edge optimal)
   * 3. Any Microsoft English voice
   * 4. Any English voice
   * 5. Default voice
   */
  public getBestVoice(): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;
    const all = this.getVoices();
    if (all.length === 0) return null;

    const savedUri = this.getSavedVoiceURI();
    if (savedUri) {
      const match = all.find((v) => v.voice.voiceURI === savedUri);
      if (match) return match.voice;
    }

    const english = this.getEnglishVoices();
    if (english.length > 0) {
      // Find Microsoft Natural first (Edge best experience)
      const msNatural = english.find((v) => v.isMicrosoft && v.isNatural);
      if (msNatural) return msNatural.voice;

      const ms = english.find((v) => v.isMicrosoft);
      if (ms) return ms.voice;

      return english[0].voice;
    }

    return all[0].voice;
  }

  /**
   * Speaks the provided text cleanly.
   * Cancels any ongoing utterance first.
   */
  public speak(
    text: string,
    options?: {
      rate?: number;
      voiceURI?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (!this.isSupported() || !text.trim()) {
      options?.onEnd?.();
      return;
    }

    // Cancel existing playback to prevent overlapping speech
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      const rate = options?.rate ?? this.getSavedRate();
      utterance.rate = Math.min(Math.max(rate, 0.5), 2.0);

      // Select voice
      let selectedVoice: SpeechSynthesisVoice | null = null;
      if (options?.voiceURI) {
        const found = this.voices.find((v) => v.voiceURI === options.voiceURI);
        if (found) selectedVoice = found;
      }
      if (!selectedVoice) {
        selectedVoice = this.getBestVoice();
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('SpeechSynthesis error:', e.error);
          options?.onError?.(e);
        }
        options?.onEnd?.();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis invocation failed', err);
      options?.onEnd?.();
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis.speaking
    );
  }
}

export const webSpeechService = new WebSpeechService();
