import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Volume2,
  Loader2,
  Keyboard,
  ArrowRight,
  Square,
  Languages,
} from 'lucide-react';
import { VocabularyEntry } from '../../data/publicVocabulary';
import { getTTSUrl, fetchTTSAudioBlobUrl, cleanSpeechText } from '../../services/tts';

interface PublicVocabularyModalProps {
  entry: VocabularyEntry | null;
  onClose: () => void;
  onPracticeText?: (text: string) => void;
}

type LangTab = 'so' | 'en' | 'de';

export function PublicVocabularyModal({ entry, onClose, onPracticeText }: PublicVocabularyModalProps) {
  // 1. Default active tab MUST be SOMALI as requested
  const [activeLang, setActiveLang] = useState<LangTab>('so');

  // Reset tab to Somali whenever a new entry opens
  useEffect(() => {
    if (entry) {
      setActiveLang('so');
    }
  }, [entry?.id]);

  // Audio playback state
  const [activeAudioKey, setActiveAudioKey] = useState<string | null>(null);
  const [loadingAudioKey, setLoadingAudioKey] = useState<string | null>(null);
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
    setActiveAudioKey(null);
    setLoadingAudioKey(null);
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const playSpeech = useCallback(
    async (text: string, voiceLang: 'en' | 'de' | 'so', key: string) => {
      if (activeAudioKey === key) {
        stopAudio();
        return;
      }

      stopAudio();
      setLoadingAudioKey(key);

      const voice =
        voiceLang === 'en'
          ? 'en-GB-RyanNeural'
          : voiceLang === 'de'
          ? 'de-DE-KillianNeural'
          : 'so-SO-MuuseNeural';

      const rate = voiceLang === 'so' ? '-10%' : '0%';
      const cleaned = cleanSpeechText(text);

      try {
        const url = getTTSUrl({ text: cleaned, voice, rate });
        let resolvedSrc = url;
        try {
          resolvedSrc = await fetchTTSAudioBlobUrl(url);
        } catch {
          // fallback to direct url
        }

        const audio = new Audio(resolvedSrc);
        activeAudioRef.current = audio;

        audio.onplaying = () => {
          setLoadingAudioKey(null);
          setActiveAudioKey(key);
        };

        audio.onended = () => {
          setActiveAudioKey(null);
          setLoadingAudioKey(null);
          activeAudioRef.current = null;
        };

        audio.onerror = () => {
          setLoadingAudioKey(null);
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(cleaned);
            utterance.lang = voiceLang === 'en' ? 'en-GB' : voiceLang === 'de' ? 'de-DE' : 'so';
            utterance.onstart = () => setActiveAudioKey(key);
            utterance.onend = () => setActiveAudioKey(null);
            utterance.onerror = () => setActiveAudioKey(null);
            window.speechSynthesis.speak(utterance);
          } else {
            setActiveAudioKey(null);
          }
        };

        await audio.play();
      } catch {
        setLoadingAudioKey(null);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(cleaned);
          utterance.lang = voiceLang === 'en' ? 'en-GB' : voiceLang === 'de' ? 'de-DE' : 'so';
          utterance.onstart = () => setActiveAudioKey(key);
          utterance.onend = () => setActiveAudioKey(null);
          utterance.onerror = () => setActiveAudioKey(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setActiveAudioKey(null);
        }
      }
    },
    [activeAudioKey, stopAudio]
  );

  if (!entry) return null;

  const renderChipAudioButton = (
    textToSpeak: string,
    voiceLang: 'en' | 'de' | 'so',
    key: string,
    label: string
  ) => {
    const isPlaying = activeAudioKey === key;
    const isLoading = loadingAudioKey === key;

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          playSpeech(textToSpeak, voiceLang, key);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
          isPlaying
            ? 'bg-[#f59e0b] text-neutral-950 font-bold shadow-xs'
            : 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border)]'
        }`}
        title={isPlaying ? 'Stop' : `Listen to ${label}`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isPlaying ? (
          <Square className="w-3 h-3 fill-current" />
        ) : (
          <Volume2 className="w-3 h-3" />
        )}
        <span>{isPlaying ? 'Stop' : label}</span>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        stopAudio();
        onClose();
      }}
    >
      {/* 1. MODAL POSITION & STYLE: CENTER FLOATING DIALOG (NOT A BOTTOM SHEET) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vocab-modal-title"
        className="relative w-full max-w-[440px] rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-[var(--text)] transition-all animate-in zoom-in-95 duration-200 bg-[var(--card-bg)] border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.1)',
        }}
      >
        {/* TOP ROW: Tag + Part of Speech + Close button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase text-amber-500 bg-amber-500/10 border border-amber-500/30">
              <Languages className="w-3 h-3" />
              <span>TRILINGUAL VOCABULARY</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] italic font-mono">
              ({entry.partOfSpeech})
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer border border-[var(--border)]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* HEADWORD + PRONOUNCE (UK) BUTTON */}
        <div className="flex items-center justify-between gap-3">
          <h2
            id="vocab-modal-title"
            className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[var(--text-heading)]"
          >
            {entry.word}
          </h2>

          <button
            type="button"
            onClick={() => playSpeech(entry.word, 'en', 'root-word')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
              activeAudioKey === 'root-word'
                ? 'bg-[#f59e0b] text-neutral-950 font-black'
                : 'border border-amber-500/40 text-amber-500 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>
              {activeAudioKey === 'root-word' ? 'Stop' : 'Pronounce (UK)'}
            </span>
          </button>
        </div>

        {/* 2. 3-TAB LANGUAGE PICKER: [🇸🇴 Soomaali] | [🇬🇧 English] | [🇩🇪 Deutsch] */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              stopAudio();
              setActiveLang('so');
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeLang === 'so'
                ? 'bg-[#f59e0b] text-neutral-950 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <span>🇸🇴</span>
            <span>Soomaali</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopAudio();
              setActiveLang('en');
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeLang === 'en'
                ? 'bg-[#f59e0b] text-neutral-950 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopAudio();
              setActiveLang('de');
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeLang === 'de'
                ? 'bg-[#f59e0b] text-neutral-950 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <span>🇩🇪</span>
            <span>Deutsch</span>
          </button>
        </div>

        {/* 3. SINGLE EXPLANATION PANEL: ONLY ONE LANGUAGE CARD AT A TIME */}
        <div className="w-full">
          {/* SOMALI TAB (DEFAULT ACTIVE) */}
          {activeLang === 'so' && (
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              {/* Word badge + [Word] and [Sentence] audio buttons */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-base sm:text-lg text-emerald-500 dark:text-emerald-400">
                  {entry.somaliWord}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {renderChipAudioButton(entry.somaliWord, 'so', 'so-word', 'Erey')}
                  {renderChipAudioButton(entry.somaliExample, 'so', 'so-sentence', 'Weedh')}
                </div>
              </div>

              {/* Full meaning definition text */}
              <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed font-normal">
                {entry.somaliMeaning}
              </p>

              {/* Monospace example quote box with amber border */}
              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border-l-3 border-amber-500 font-mono text-xs sm:text-sm text-[var(--text)] italic leading-relaxed">
                «{entry.somaliExample}»
              </div>
            </div>
          )}

          {/* ENGLISH TAB */}
          {activeLang === 'en' && (
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              {/* Word badge + [Word] and [Sentence] audio buttons */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-base sm:text-lg text-amber-500 dark:text-amber-400">
                  {entry.word}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {renderChipAudioButton(entry.word, 'en', 'en-word', 'Word')}
                  {renderChipAudioButton(entry.englishExample, 'en', 'en-sentence', 'Sentence')}
                </div>
              </div>

              {/* Full meaning definition text */}
              <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed font-normal">
                {entry.englishMeaning}
              </p>

              {/* Monospace example quote box with amber border */}
              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border-l-3 border-amber-500 font-mono text-xs sm:text-sm text-[var(--text)] italic leading-relaxed">
                "{entry.englishExample}"
              </div>
            </div>
          )}

          {/* DEUTSCH TAB */}
          {activeLang === 'de' && (
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              {/* Word badge + [Word] and [Sentence] audio buttons */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-base sm:text-lg text-sky-500 dark:text-sky-400">
                  {entry.germanWord}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {renderChipAudioButton(entry.germanWord, 'de', 'de-word', 'Wort')}
                  {renderChipAudioButton(entry.germanExample, 'de', 'de-sentence', 'Satz')}
                </div>
              </div>

              {/* Full meaning definition text */}
              <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed font-normal">
                {entry.germanMeaning}
              </p>

              {/* Monospace example quote box with amber border */}
              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border-l-3 border-amber-500 font-mono text-xs sm:text-sm text-[var(--text)] italic leading-relaxed">
                „{entry.germanExample}“
              </div>
            </div>
          )}
        </div>

        {/* 4. BOTTOM ACTION: PINNED PRACTICE CTA */}
        <button
          type="button"
          onClick={() => {
            stopAudio();
            onPracticeText?.(entry.word);
            onClose();
          }}
          className="w-full h-11 sm:h-12 flex items-center justify-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wide transition-all shadow-md shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
        >
          <Keyboard className="w-4 h-4" />
          <span>PRACTICE "{entry.word.toUpperCase()}" IN TYPING ENGINE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default PublicVocabularyModal;
