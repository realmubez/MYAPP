import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Volume2,
  Loader2,
  Keyboard,
  ArrowRight,
  Square,
  Sparkles,
  BookOpen,
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
  // Default active tab must be SOMALI as requested
  const [activeLang, setActiveLang] = useState<LangTab>('so');

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

  const playAudio = useCallback(
    async (text: string, lang: 'en' | 'de' | 'so', type: 'word' | 'sentence') => {
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
    },
    [activePlayback, stopAudio]
  );

  if (!entry) return null;

  // Helper for audio buttons
  const renderAudioButton = (
    textToSpeak: string,
    lang: 'en' | 'de' | 'so',
    type: 'word' | 'sentence',
    label: string,
    badgeColorClass = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
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
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
          isPlaying
            ? 'bg-[#f59e0b] text-neutral-950 border-[#f59e0b] font-black shadow-sm'
            : badgeColorClass
        }`}
        title={isPlaying ? 'Stop Audio' : `Listen to ${label}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isPlaying ? (
          <Square className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
        <span>{isPlaying ? 'Stop' : label}</span>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        stopAudio();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg flex flex-col bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 text-[var(--text)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: 'var(--shadow)',
        }}
      >
        {/* HEADER BAR */}
        <div className="flex items-start justify-between px-5 sm:px-6 pt-5 pb-3 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25 flex items-center gap-1">
                <Languages className="w-3 h-3" />
                <span>Tri-Lingual Vocabulary</span>
              </span>
              <span className="text-xs text-[var(--text-muted)] italic font-mono">
                {entry.partOfSpeech}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-heading)] tracking-tight">
                {entry.word}
              </h2>
              {/* Quick Ryan UK Audio button for root word */}
              {renderAudioButton(
                entry.word,
                'en',
                'word',
                'Ryan (UK)',
                'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-xs'
              )}
            </div>
          </div>

          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="p-2 rounded-xl bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-heading)] border border-[var(--border)] transition-all cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-TAB LANGUAGE SWITCHER: [🇸🇴 Soomaali] | [🇬🇧 English] | [🇩🇪 Deutsch] */}
        <div className="px-5 sm:px-6 pt-3.5 pb-2 bg-[var(--surface)] border-b border-[var(--border)]">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
            <button
              type="button"
              onClick={() => {
                stopAudio();
                setActiveLang('so');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeLang === 'so'
                  ? 'bg-[#f59e0b] text-neutral-950 font-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              <span>🇸🇴</span>
              <span className="truncate">Soomaali</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopAudio();
                setActiveLang('en');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeLang === 'en'
                  ? 'bg-[#f59e0b] text-neutral-950 font-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              <span>🇬🇧</span>
              <span className="truncate">English</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopAudio();
                setActiveLang('de');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeLang === 'de'
                  ? 'bg-[#f59e0b] text-neutral-950 font-black shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              <span>🇩🇪</span>
              <span className="truncate">Deutsch</span>
            </button>
          </div>
        </div>

        {/* DYNAMIC EXPLANATION CARD MATCHING ACTIVE LANGUAGE */}
        <div className="px-5 sm:px-6 py-4 flex-1 overflow-y-auto space-y-3.5 overscroll-contain">
          {activeLang === 'so' && (
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              {/* Top row: Word + grammatical form + Audio pronunciation chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-mono text-[var(--text-heading)]">
                      {entry.somaliWord}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">
                      Af-Soomaali
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] italic">
                    {entry.partOfSpeech}
                  </span>
                </div>

                {/* Pronunciation chips: [Erey] and [Weedh] */}
                <div className="flex items-center gap-1.5">
                  {renderAudioButton(
                    entry.somaliWord,
                    'so',
                    'word',
                    'Erey',
                    'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
                  )}
                  {renderAudioButton(
                    entry.somaliExample,
                    'so',
                    'sentence',
                    'Weedh',
                    'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
                  )}
                </div>
              </div>

              {/* Full meaning definition */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Micnaha / Definition
                </span>
                <p className="text-sm font-medium leading-relaxed text-[var(--text)]">
                  {entry.somaliMeaning}
                </p>
              </div>

              {/* Monospace example quote block */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Tusaale / Example Context
                </span>
                <div className="p-3 rounded-xl bg-[var(--card-bg)] border-l-4 border-l-[#f59e0b] border-y border-r border-[var(--border)] space-y-1">
                  <p className="text-xs sm:text-sm font-mono text-[var(--text-heading)] italic leading-relaxed">
                    «{entry.somaliExample}»
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono">
                    EN: "{entry.englishExample}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeLang === 'en' && (
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              {/* Top row: Word + grammatical form + Audio pronunciation chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-mono text-[var(--text-heading)]">
                      {entry.word}
                    </span>
                    <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                      English (UK)
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] italic">
                    {entry.partOfSpeech}
                  </span>
                </div>

                {/* Pronunciation chips: [Word] and [Sentence] */}
                <div className="flex items-center gap-1.5">
                  {renderAudioButton(
                    entry.word,
                    'en',
                    'word',
                    'Word',
                    'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
                  )}
                  {renderAudioButton(
                    entry.englishExample,
                    'en',
                    'sentence',
                    'Sentence',
                    'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
                  )}
                </div>
              </div>

              {/* Full meaning definition */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Meaning
                </span>
                <p className="text-sm font-medium leading-relaxed text-[var(--text)]">
                  {entry.englishMeaning}
                </p>
              </div>

              {/* Monospace example quote block */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Sentence in Context
                </span>
                <div className="p-3 rounded-xl bg-[var(--card-bg)] border-l-4 border-l-[#f59e0b] border-y border-r border-[var(--border)]">
                  <p className="text-xs sm:text-sm font-mono text-[var(--text-heading)] italic leading-relaxed">
                    “{entry.englishExample}”
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeLang === 'de' && (
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              {/* Top row: Word + grammatical form + Audio pronunciation chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-mono text-[var(--text-heading)]">
                      {entry.germanWord}
                    </span>
                    <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/25">
                      Deutsch
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] italic">
                    {entry.partOfSpeech}
                  </span>
                </div>

                {/* Pronunciation chips: [Wort] and [Satz] */}
                <div className="flex items-center gap-1.5">
                  {renderAudioButton(
                    entry.germanWord,
                    'de',
                    'word',
                    'Wort',
                    'text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30'
                  )}
                  {renderAudioButton(
                    entry.germanExample,
                    'de',
                    'sentence',
                    'Satz',
                    'text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30'
                  )}
                </div>
              </div>

              {/* Full meaning definition */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Bedeutung / Definition
                </span>
                <p className="text-sm font-medium leading-relaxed text-[var(--text)]">
                  {entry.germanMeaning}
                </p>
              </div>

              {/* Monospace example quote block */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Beispielsatz
                </span>
                <div className="p-3 rounded-xl bg-[var(--card-bg)] border-l-4 border-l-[#f59e0b] border-y border-r border-[var(--border)] space-y-1">
                  <p className="text-xs sm:text-sm font-mono text-[var(--text-heading)] italic leading-relaxed">
                    „{entry.germanExample}“
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono">
                    EN: "{entry.englishExample}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PINNED CTA BUTTON: PRACTICE [WORD] IN TYPING ENGINE → */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--surface)]">
          <button
            type="button"
            onClick={() => {
              stopAudio();
              onPracticeText?.(entry.word);
              onClose();
            }}
            className="w-full h-11 sm:h-12 flex items-center justify-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-500/25 active:scale-98 cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
            <span>PRACTICE "{entry.word.toUpperCase()}" IN TYPING ENGINE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublicVocabularyModal;
