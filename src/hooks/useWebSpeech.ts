import { useState, useEffect, useCallback, useRef } from 'react';
import { webSpeechService, SpeechVoiceOption } from '../services/webSpeechService';

export function useWebSpeech() {
  const [voices, setVoices] = useState<SpeechVoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() =>
    webSpeechService.getSavedVoiceURI()
  );
  const [rate, setRate] = useState<number>(() => webSpeechService.getSavedRate());
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSpokenRef = useRef<{ id: string; text: string } | null>(null);

  const isSupported = webSpeechService.isSupported();

  const refreshVoices = useCallback(() => {
    const list = webSpeechService.getEnglishVoices();
    setVoices(list);

    // If current selected voice is empty or invalid, pick the best available
    const savedUri = webSpeechService.getSavedVoiceURI();
    if (!savedUri && list.length > 0) {
      const best = webSpeechService.getBestVoice();
      if (best) {
        setSelectedVoiceURI(best.voiceURI);
        webSpeechService.setSavedVoiceURI(best.voiceURI);
      }
    }
  }, []);

  useEffect(() => {
    refreshVoices();
    const unsubscribe = webSpeechService.subscribe(() => {
      refreshVoices();
      setSelectedVoiceURI(webSpeechService.getSavedVoiceURI());
      setRate(webSpeechService.getSavedRate());
    });

    return () => {
      unsubscribe();
      webSpeechService.stop();
    };
  }, [refreshVoices]);

  const speak = useCallback(
    (text: string, id: string = 'global') => {
      if (!text.trim()) return;

      // If already speaking this item, toggle stop
      if (isSpeaking && activeSpeechId === id) {
        webSpeechService.stop();
        setIsSpeaking(false);
        setActiveSpeechId(null);
        return;
      }

      lastSpokenRef.current = { id, text };
      setActiveSpeechId(id);
      setIsSpeaking(true);

      webSpeechService.speak(text, {
        voiceURI: selectedVoiceURI,
        rate,
        onStart: () => {
          setActiveSpeechId(id);
          setIsSpeaking(true);
        },
        onEnd: () => {
          setActiveSpeechId((curr) => (curr === id ? null : curr));
          setIsSpeaking(false);
        },
        onError: () => {
          setActiveSpeechId((curr) => (curr === id ? null : curr));
          setIsSpeaking(false);
        },
      });
    },
    [isSpeaking, activeSpeechId, selectedVoiceURI, rate]
  );

  const repeatLast = useCallback(() => {
    if (lastSpokenRef.current) {
      speak(lastSpokenRef.current.text, lastSpokenRef.current.id);
    }
  }, [speak]);

  const stop = useCallback(() => {
    webSpeechService.stop();
    setIsSpeaking(false);
    setActiveSpeechId(null);
  }, []);

  const changeVoice = useCallback((uri: string) => {
    setSelectedVoiceURI(uri);
    webSpeechService.setSavedVoiceURI(uri);
  }, []);

  const changeRate = useCallback((newRate: number) => {
    setRate(newRate);
    webSpeechService.setSavedRate(newRate);
  }, []);

  return {
    isSupported,
    voices,
    selectedVoiceURI,
    rate,
    isSpeaking,
    activeSpeechId,
    speak,
    stop,
    repeatLast,
    changeVoice,
    changeRate,
  };
}
