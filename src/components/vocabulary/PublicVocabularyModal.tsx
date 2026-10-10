import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Volume2,
  Loader2,
  Keyboard,
  ArrowRight,
  Square,
  Sparkles,
  Check,
  Languages,
} from 'lucide-react';
import { VocabularyEntry } from '../../data/publicVocabulary';
import { getTTSUrl, fetchTTSAudioBlobUrl, cleanSpeechText } from '../../services/tts';

interface PublicVocabularyModalProps {
  entry: VocabularyEntry | null;
  onClose: () => void;
  onPracticeText?: (text: string) => void;
}

export function PublicVocabularyModal({ entry, onClose, onPracticeText }: PublicVocabularyModalProps) {
  // Currently playing: { lang: 'en' | 'de' | 'so', type: 'word' | 'sentence' }
  const [activePlayback, setActivePlayback] = useState<{
    lang: 'en' | 'de' | 'so';
    type: 'word' | 'sentence';
  } | null>(null);
  const [loadingPlayback, setLoadingPlayback] = useState<{
    lang: 'en' | 'de' | 'so';
    type: 'word' | 'sentence';
  } | null>(null);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActivePlayback(null);
    setLoadingPlayback(null);
  }, []);

  // Stop audio when modal closes or unmounts
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const playAudio = useCallback(async (text: string, lang: 'en' | 'de' | 'so', type: 'word' | 'sentence') => {
    if (activePlayback?.lang === lang && activePlayback?.type === type) {
      stopAudio();
      return;
    }

    stopAudio();
    setLoadingPlayback({ lang, type });

    const voice =
      lang === 'en'
        ? 'en-GB-RyanNeural' // Ryan (Neural) UK
        : lang === 'de'
        ? 'de-DE-KillianNeural' // German Neural
        : 'so-SO-MuuseNeural'; // Somali Neural

    const rate = lang === 'so' ? '-10%' : '0%';
    const clean = cleanSpeechText(text);

    try {
      const url = getTTSUrl({ text: clean, voice, rate });
      let resolvedSrc = url;
      try {
        resolvedSrc = await fetchTTSAudioBlobUrl(url);
      } catch {
        // fallback to direct URL
      }

      const audio = new Audio(resolvedSrc);
      activeAudioRef.current = audio;

      audio.onplaying = () => {
        setLoadingPlayback(null);
        setActivePlayback({ lang, type });
      };

      audio.onended = () => {
        setActivePlayback(null);
        setLoadingPlayback(null);
        activeAudioRef.current = null;
      };

      audio.onerror = () => {
        setLoadingPlayback(null);
        // Fallback to browser TTS if available
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(clean);
          utterance.lang = lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : 'so';
          utterance.onstart = () => setActivePlayback({ lang, type });
          utterance.onend = () => setActivePlayback(null);
          utterance.onerror = () => setActivePlayback(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setActivePlayback(null);
        }
      };

      await audio.play();
    } catch {
      setLoadingPlayback(null);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : 'so';
        utterance.onstart = () => setActivePlayback({ lang, type });
        utterance.onend = () => setActivePlayback(null);
        utterance.onerror = () => setActivePlayback(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setActivePlayback(null);
      }
    }
  }, [activePlayback, stopAudio]);

  if (!entry) return null;

  // Helper for audio button rendering
  const renderAudioButton = (
    textToSpeak: string,
    lang: 'en' | 'de' | 'so',
    type: 'word' | 'sentence',
    label?: string,
    colorClass: string = 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
  ) => {
    const isPlaying = activePlayback?.lang === lang && activePlayback?.type === type;
    const isLoading = loadingPlayback?.lang === lang && loadingPlayback?.type === type;

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          playAudio(textToSpeak, lang, type);
        }}
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
          isPlaying
            ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-sm shadow-amber-500/30'
            : colorClass
        }`}
        title={isPlaying ? 'Stop Audio' : `Listen to ${label || textToSpeak}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isPlaying ? (
          <Square className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
        {label && <span className="text-[11px] leading-none">{isPlaying ? 'Stop' : label}</span>}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        stopAudio();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-[#14110e] border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-amber-500/15 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 text-neutral-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Drag Handle on Mobile */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-3.5 border-b border-neutral-800/80 bg-[#17130f]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                <Languages className="w-3 h-3" />
                <span>Tri-Lingual Vocabulary</span>
              </span>
              <span className="text-[11px] text-neutral-400 italic">
                {entry.partOfSpeech}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                {entry.word}
              </h2>
              {/* English Ryan Audio button for the headword */}
              {renderAudioButton(
                entry.word,
                'en',
                'word',
                'Ryan (UK)',
                'text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-xs'
              )}
            </div>
          </div>

          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-all cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body with 3 Language Cards */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 overscroll-contain">
          
          {/* 1. English Card (Ryan Neural UK) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0e0c0a] border border-amber-500/20 hover:border-amber-500/40 transition-colors space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🇬🇧</span>
                <span className="text-xs font-bold text-amber-300 tracking-wide">
                  English
                </span>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">
                  Ryan Neural (UK)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {renderAudioButton(
                  entry.word,
                  'en',
                  'word',
                  'Word',
                  'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
                )}
                {renderAudioButton(
                  entry.englishExample,
                  'en',
                  'sentence',
                  'Sentence',
                  'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-300 font-medium leading-relaxed pl-0.5">
              {entry.englishMeaning}
            </p>

            <div className="p-2.5 rounded-xl bg-[#17130e] border border-amber-500/15 flex items-start justify-between gap-2">
              <p className="text-xs font-mono text-amber-200/90 italic leading-snug">
                “{entry.englishExample}”
              </p>
            </div>
          </div>

          {/* 2. German Card (Killian Neural DE) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0b0f14] border border-sky-500/25 hover:border-sky-500/45 transition-colors space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🇩🇪</span>
                <span className="text-xs font-bold text-sky-400 tracking-wide">
                  Deutsch
                </span>
                <span className="text-xs font-mono font-bold text-white bg-sky-500/15 px-2 py-0.5 rounded-md border border-sky-500/30">
                  {entry.germanWord}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {renderAudioButton(
                  entry.germanWord,
                  'de',
                  'word',
                  'Wort',
                  'text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30'
                )}
                {renderAudioButton(
                  entry.germanExample,
                  'de',
                  'sentence',
                  'Satz',
                  'text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30'
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-300 font-medium leading-relaxed pl-0.5">
              {entry.germanMeaning}
            </p>

            <div className="p-2.5 rounded-xl bg-[#0e141a] border border-sky-500/15">
              <p className="text-xs font-mono text-sky-200/90 italic leading-snug">
                „{entry.germanExample}“
              </p>
            </div>
          </div>

          {/* 3. Somali Card (Muuse Neural SO) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#09140f] border border-emerald-500/25 hover:border-emerald-500/45 transition-colors space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🇸🇴</span>
                <span className="text-xs font-bold text-emerald-400 tracking-wide">
                  Af-Soomaali
                </span>
                <span className="text-xs font-mono font-bold text-white bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {entry.somaliWord}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {renderAudioButton(
                  entry.somaliWord,
                  'so',
                  'word',
                  'Ereyga',
                  'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
                )}
                {renderAudioButton(
                  entry.somaliExample,
                  'so',
                  'sentence',
                  'Weedha',
                  'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-300 font-medium leading-relaxed pl-0.5">
              {entry.somaliMeaning}
            </p>

            <div className="p-2.5 rounded-xl bg-[#0c1813] border border-emerald-500/15">
              <p className="text-xs font-mono text-emerald-200/90 italic leading-snug">
                «{entry.somaliExample}»
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Practice in Typing Trainer button */}
        {onPracticeText && (
          <div className="p-4 sm:p-5 border-t border-neutral-800/80 bg-[#120f0c]">
            <button
              onClick={() => {
                stopAudio();
                onPracticeText(entry.englishExample);
                onClose();
              }}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>Practice "{entry.word}" in Typing Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
