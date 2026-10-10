import { useState, useEffect, useCallback, useRef } from 'react';
import {
  lessonSpeechManager,
  LessonSpeechState,
  ENGLISH_VOICES,
  GERMAN_VOICES,
  SWEDISH_VOICES,
  SOMALI_VOICES,
  VoiceOption,
  AVAILABLE_RATES,
  TTSRate,
  getStoredVoice,
  setStoredVoice,
  getStoredRate,
  setStoredRate,
} from '../services/tts';

export interface UseEdgeTTSReturn {
  speechState: LessonSpeechState;
  playingKey: string | null;
  loadingKey: string | null;
  errorKey: string | null;
  errorMessage: string | null;
  selectedVoice: string;
  selectedRate: TTSRate;
  availableVoices: VoiceOption[];
  availableRates: readonly string[];
  play: (key: string, text: string, options?: { language?: string; voice?: string; rate?: TTSRate }) => Promise<void>;
  stop: () => void;
  repeatLast: () => void;
  changeVoice: (voiceId: string) => void;
  changeRate: (rate: TTSRate) => void;
  isSpeaking: boolean;
  activeSpeechId: string | null;
}

export function useEdgeTTS(defaultLanguage: 'en' | 'de' | 'sv' | 'so' = 'en'): UseEdgeTTSReturn {
  const [speechState, setSpeechState] = useState<LessonSpeechState>(() =>
    lessonSpeechManager.getState()
  );
  const [selectedVoice, setSelectedVoice] = useState<string>(() =>
    getStoredVoice(defaultLanguage)
  );
  const [selectedRate, setSelectedRate] = useState<TTSRate>(() =>
    getStoredRate(defaultLanguage)
  );

  const lastSpokenRef = useRef<{
    key: string;
    text: string;
    language?: string;
    voice?: string;
    rate?: TTSRate;
  } | null>(null);

  useEffect(() => {
    const unsub = lessonSpeechManager.subscribe((newState) => {
      setSpeechState({ ...newState });
    });
    return () => {
      unsub();
    };
  }, []);

  const play = useCallback(
    async (
      key: string,
      text: string,
      options?: { language?: string; voice?: string; rate?: TTSRate }
    ) => {
      if (!text || !text.trim()) return;

      const lang = options?.language || defaultLanguage;
      const voice = options?.voice || selectedVoice;
      const rate = options?.rate || selectedRate;

      lastSpokenRef.current = { key, text, language: lang, voice, rate };

      await lessonSpeechManager.playSpeech({
        key,
        text,
        language: lang,
        voice,
        rate,
      });
    },
    [defaultLanguage, selectedVoice, selectedRate]
  );

  const stop = useCallback(() => {
    lessonSpeechManager.stopSpeech();
  }, []);

  const repeatLast = useCallback(() => {
    if (lastSpokenRef.current) {
      const { key, text, language, voice, rate } = lastSpokenRef.current;
      lessonSpeechManager.playSpeech({
        key,
        text,
        language,
        voice,
        rate,
      });
    }
  }, []);

  const changeVoice = useCallback(
    (voiceId: string) => {
      setSelectedVoice(voiceId);
      setStoredVoice(defaultLanguage, voiceId);
    },
    [defaultLanguage]
  );

  const changeRate = useCallback(
    (newRate: TTSRate) => {
      setSelectedRate(newRate);
      setStoredRate(defaultLanguage, newRate);
    },
    [defaultLanguage]
  );

  // Group all available Edge neural voices, prioritizing the current language voices first
  const currentLangVoices =
    defaultLanguage === 'sv'
      ? SWEDISH_VOICES
      : defaultLanguage === 'de'
      ? GERMAN_VOICES
      : defaultLanguage === 'so'
      ? SOMALI_VOICES
      : ENGLISH_VOICES;

  const otherVoices = [
    ...ENGLISH_VOICES,
    ...GERMAN_VOICES,
    ...SWEDISH_VOICES,
    ...SOMALI_VOICES,
  ].filter((v) => !currentLangVoices.some((c) => c.id === v.id));

  const availableVoices = [...currentLangVoices, ...otherVoices];

  return {
    speechState,
    playingKey: speechState.playingKey,
    loadingKey: speechState.loadingKey,
    errorKey: speechState.errorKey,
    errorMessage: speechState.errorMessage,
    selectedVoice,
    selectedRate,
    availableVoices,
    availableRates: AVAILABLE_RATES,
    play,
    stop,
    repeatLast,
    changeVoice,
    changeRate,
    isSpeaking: !!(speechState.playingKey || speechState.loadingKey),
    activeSpeechId: speechState.playingKey || speechState.loadingKey,
  };
}
