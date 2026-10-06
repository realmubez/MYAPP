import React, { useState, useRef } from 'react';
import {
  X,
  Volume2,
  Loader2,
  BookOpen,
  Keyboard,
  ArrowRight,
  Square,
  Sparkles,
  Check,
} from 'lucide-react';
import { VocabularyEntry } from '../../data/publicVocabulary';
import { getTTSUrl, fetchTTSAudioBlobUrl, cleanSpeechText } from '../../services/tts';

interface PublicVocabularyModalProps {
  entry: VocabularyEntry | null;
  onClose: () => void;
  onPracticeText?: (text: string) => void;
}

export function PublicVocabularyModal({ entry, onClose, onPracticeText }: PublicVocabularyModalProps) {
  const [playingLang, setPlayingLang] = useState<'en' | 'de' | 'so' | null>(null);
  const [loadingLang, setLoadingLang] = useState<'en' | 'de' | 'so' | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!entry) return null;

  const stopAudio = () => {
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
    setPlayingLang(null);
    setLoadingLang(null);
  };

  const playAudio = async (text: string, lang: 'en' | 'de' | 'so') => {
    if (playingLang === lang) {
      stopAudio();
      return;
    }

    stopAudio();
    setLoadingLang(lang);

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
        // fallback
      }

      const audio = new Audio(resolvedSrc);
      activeAudioRef.current = audio;

      audio.onplaying = () => {
        setLoadingLang(null);
        setPlayingLang(lang);
      };

      audio.onended = () => {
        setPlayingLang(null);
        setLoadingLang(null);
        activeAudioRef.current = null;
      };

      audio.onerror = () => {
        setLoadingLang(null);
        // Fallback to browser TTS if available
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(clean);
          utterance.lang = lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : 'so';
          utterance.onstart = () => setPlayingLang(lang);
          utterance.onend = () => setPlayingLang(null);
          utterance.onerror = () => setPlayingLang(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setPlayingLang(null);
        }
      };

      await audio.play();
    } catch {
      setLoadingLang(null);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : 'so';
        utterance.onstart = () => setPlayingLang(lang);
        utterance.onend = () => setPlayingLang(null);
        utterance.onerror = () => setPlayingLang(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingLang(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#14110e] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/10 animate-in zoom-in-95 duration-200 text-neutral-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Interactive Vocabulary
              </span>
              <span className="text-[11px] text-neutral-400 italic">
                {entry.partOfSpeech}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight mt-1.5 flex items-center gap-3">
              <span>{entry.word}</span>
              <button
                onClick={() => playAudio(entry.word, 'en')}
                className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer"
                title="Listen with Ryan (Neural) (United Kingdom)"
              >
                {loadingLang === 'en' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : playingLang === 'en' ? (
                  <Square className="w-4 h-4 fill-amber-400 text-amber-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </h2>
          </div>

          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Languages Translations & Audio Strip */}
        <div className="space-y-3.5 my-5">
          {/* 1. English (Ryan UK) */}
          <div className="p-3.5 rounded-2xl bg-[#0d0c0a] border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🇬🇧</span>
                <span className="text-xs font-bold text-amber-300">English (Ryan Neural UK)</span>
              </div>
              <button
                onClick={() => playAudio(entry.englishExample, 'en')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-neutral-300 hover:text-amber-400 transition-all cursor-pointer"
              >
                {playingLang === 'en' ? (
                  <>
                    <Square className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-amber-400" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              {entry.englishMeaning}
            </p>
            <p className="text-xs font-mono text-amber-200/90 italic bg-[#17130e] p-2 rounded-xl border border-amber-500/10">
              “{entry.englishExample}”
            </p>
          </div>

          {/* 2. German (Killian Neural) */}
          <div className="p-3.5 rounded-2xl bg-[#0d0c0a] border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🇩🇪</span>
                <span className="text-xs font-bold text-sky-400">Deutsch (German Neural)</span>
                <span className="text-xs font-mono font-bold text-white bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                  {entry.germanWord}
                </span>
              </div>
              <button
                onClick={() => playAudio(entry.germanExample, 'de')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-neutral-300 hover:text-sky-400 transition-all cursor-pointer"
              >
                {playingLang === 'de' ? (
                  <>
                    <Square className="w-3 h-3 fill-sky-400 text-sky-400" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-sky-400" />
                    <span>Listen (DE)</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              {entry.germanMeaning}
            </p>
            <p className="text-xs font-mono text-sky-200/90 italic bg-[#0f1418] p-2 rounded-xl border border-sky-500/10">
              „{entry.germanExample}“
            </p>
          </div>

          {/* 3. Somali (Muuse Neural) */}
          <div className="p-3.5 rounded-2xl bg-[#0d0c0a] border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🇸🇴</span>
                <span className="text-xs font-bold text-emerald-400">Af-Soomaali (Somali Neural)</span>
                <span className="text-xs font-mono font-bold text-white bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {entry.somaliWord}
                </span>
              </div>
              <button
                onClick={() => playAudio(entry.somaliExample, 'so')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-neutral-300 hover:text-emerald-400 transition-all cursor-pointer"
              >
                {playingLang === 'so' ? (
                  <>
                    <Square className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-emerald-400" />
                    <span>Listen (SO)</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              {entry.somaliMeaning}
            </p>
            <p className="text-xs font-mono text-emerald-200/90 italic bg-[#0d1612] p-2 rounded-xl border border-emerald-500/10">
              «{entry.somaliExample}»
            </p>
          </div>
        </div>

        {/* Action Button */}
        {onPracticeText && (
          <div className="pt-2">
            <button
              onClick={() => {
                stopAudio();
                onPracticeText(entry.englishExample);
                onClose();
              }}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
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
