import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Volume2,
  BookOpen,
  Keyboard,
  Sun,
  Moon,
  Play,
  Square,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { getTTSUrl, fetchTTSAudioBlobUrl, cleanSpeechText } from '../services/tts';
import { findVocabularyByWord, VocabularyEntry } from '../data/publicVocabulary';
import { PublicVocabularyModal } from '../components/vocabulary/PublicVocabularyModal';

interface Passage {
  id: string;
  name: string;
  text: string;
  // Discrete drill targets for "One-by-One" drill
  drills: string[];
  // Sentence drill targets for "Sentences" drill
  sentences: string[];
}

const PASSAGES: Passage[] = [
  {
    id: 'man',
    name: 'The Man',
    text: 'The man is tall and slim, and he looks around 30 years old. He has short dark hair, a beard, and he wears glasses. He is wearing a dark T-shirt, pants, and black shoes.',
    drills: [
      'The man is tall and slim,',
      'and he looks around 30 years old.',
      'He has short dark hair,',
      'a beard, and he wears glasses.',
      'He is wearing a dark T-shirt,',
      'pants, and black shoes.',
    ],
    sentences: [
      'The man is tall and slim, and he looks around 30 years old.',
      'He has short dark hair, a beard, and he wears glasses.',
      'He is wearing a dark T-shirt, pants, and black shoes.',
    ],
  },
  {
    id: 'woman',
    name: 'The Woman',
    text: 'The woman is short and a little heavy, and she is around 40 years old. She has brown hair and a happy smile. She is wearing a light tunic shirt, pants, and flat shoes.',
    drills: [
      'The woman is short and a little heavy,',
      'and she is around 40 years old.',
      'She has brown hair and a happy smile.',
      'She is wearing a light tunic shirt,',
      'pants, and flat shoes.',
    ],
    sentences: [
      'The woman is short and a little heavy, and she is around 40 years old.',
      'She has brown hair and a happy smile.',
      'She is wearing a light tunic shirt, pants, and flat shoes.',
    ],
  },
];

type TextSize = 'sm' | 'base' | 'lg';
type DrillMode = 'drill' | 'sentence' | 'full';

export function PublicTypingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab: 'reader' or 'trainer'
  const isReaderRoute =
    location.pathname.includes('/read') ||
    location.pathname.includes('/lesen') ||
    location.pathname.includes('/file-reader');

  const [activeTab, setActiveTab] = useState<'reader' | 'trainer'>(
    isReaderRoute ? 'reader' : 'trainer'
  );

  useEffect(() => {
    if (isReaderRoute) {
      setActiveTab('reader');
    } else {
      setActiveTab('trainer');
    }
  }, [isReaderRoute]);

  // Passage: 0 = The Man, 1 = The Woman
  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number>(0);
  const currentPassage = PASSAGES[selectedPassageIndex];

  // Reader Text Size: A- ('sm'), A ('base'), A+ ('lg')
  const [textSize, setTextSize] = useState<TextSize>('base');

  // Typing Trainer Mode: One-by-One ('drill'), Sentences ('sentence'), Full Text ('full')
  const [drillMode, setDrillMode] = useState<DrillMode>('drill');
  const [drillIndex, setDrillIndex] = useState<number>(0);

  // Theme state: dark / light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mylearning_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (document.documentElement.getAttribute('data-theme') === 'light') return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('mylearning_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Trilingual vocabulary modal
  const [selectedVocabEntry, setSelectedVocabEntry] = useState<VocabularyEntry | null>(null);

  // Audio Playback (Ryan UK)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
    setIsLoadingAudio(false);
  }, []);

  const playRyanAudio = useCallback(
    async (textToSpeak: string) => {
      stopAudio();
      setIsLoadingAudio(true);

      const cleaned = cleanSpeechText(textToSpeak);
      const audioUrl = getTTSUrl({
        text: cleaned,
        voice: 'en-GB-RyanNeural',
        rate: '0%',
      });
      const url = await fetchTTSAudioBlobUrl(audioUrl);

      if (!url) {
        setIsLoadingAudio(false);
        return;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoadingAudio(false);
        setIsPlayingAudio(true);
      };

      audio.onended = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsLoadingAudio(false);
        setIsPlayingAudio(false);
        audioRef.current = null;
      };

      try {
        await audio.play();
      } catch {
        setIsLoadingAudio(false);
        setIsPlayingAudio(false);
      }
    },
    [stopAudio]
  );

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Current Target Drill Text depending on drillMode & drillIndex
  const activeTargetsList = useMemo(() => {
    if (drillMode === 'drill') return currentPassage.drills;
    if (drillMode === 'sentence') return currentPassage.sentences;
    return [currentPassage.text];
  }, [drillMode, currentPassage]);

  // Keep drillIndex in range
  useEffect(() => {
    if (drillIndex >= activeTargetsList.length) {
      setDrillIndex(0);
    }
  }, [activeTargetsList, drillIndex]);

  const activeTargetString = activeTargetsList[drillIndex] || activeTargetsList[0] || '';

  // ==========================================
  // TYPING TRAINER ENGINE (Monkeytype Inline Stealth)
  // ==========================================
  const [inputVal, setInputVal] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const mistakesSetRef = useRef<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  const resetTrainer = useCallback(() => {
    setInputVal('');
    setStartTime(null);
    setEndTime(null);
    setMistakesCount(0);
    setIsCompleted(false);
    mistakesSetRef.current.clear();
    stopAudio();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [stopAudio]);

  // Reset when passage or drill changes
  useEffect(() => {
    resetTrainer();
  }, [selectedPassageIndex, drillMode, drillIndex, resetTrainer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted) return;

    const val = e.target.value;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    if (val.length > inputVal.length) {
      const idx = val.length - 1;
      const targetChar = activeTargetString[idx];
      const typedChar = val[idx];

      if (typedChar !== targetChar) {
        if (!mistakesSetRef.current.has(idx)) {
          mistakesSetRef.current.add(idx);
          setMistakesCount((prev) => prev + 1);
        }
      }
    }

    setInputVal(val);

    if (val === activeTargetString) {
      setEndTime(Date.now());
      setIsCompleted(true);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const currentTime = endTime || (startTime ? Date.now() : Date.now());
    const durationSec = startTime ? Math.max(1, (currentTime - startTime) / 1000) : 0;
    const minutes = durationSec > 0 ? durationSec / 60 : 0;

    let correctChars = 0;
    for (let i = 0; i < inputVal.length; i++) {
      if (i < activeTargetString.length && inputVal[i] === activeTargetString[i]) {
        correctChars++;
      }
    }

    const words = correctChars / 5;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

    const totalTyped = inputVal.length;
    const accuracy =
      totalTyped > 0 ? Math.max(0, Math.round(((totalTyped - mistakesCount) / totalTyped) * 100)) : 100;

    return {
      wpm: Math.min(220, wpm),
      accuracy,
      time: Math.round(durationSec),
      mistakes: mistakesCount,
    };
  }, [inputVal, activeTargetString, startTime, endTime, mistakesCount]);

  const handleFocusInput = () => {
    inputRef.current?.focus();
  };

  // ==========================================
  // VOCABULARY WORD RENDERING (with subtle dashed underline)
  // ==========================================
  const renderReadableTextWithVocab = (passageText: string) => {
    const tokens = passageText.split(/(\s+|[.,;!?]+)/);

    return tokens.map((token, idx) => {
      if (!token || /^\s+$/.test(token) || /^[.,;!?]+$/.test(token)) {
        return <span key={idx}>{token}</span>;
      }

      const cleanWord = token.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = findVocabularyByWord(cleanWord);

      if (match) {
        return (
          <span
            key={idx}
            onClick={() => setSelectedVocabEntry(match)}
            title="Tap for German & Somali translations with Ryan UK audio"
            className="border-b border-dashed border-[#f59e0b] text-[#fbbf24] hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 rounded-xs cursor-pointer transition-colors px-0.5"
          >
            {token}
          </span>
        );
      }

      return <span key={idx}>{token}</span>;
    });
  };

  const handlePrevDrill = () => {
    if (drillIndex > 0) {
      setDrillIndex((prev) => prev - 1);
    }
  };

  const handleNextDrill = () => {
    if (drillIndex < activeTargetsList.length - 1) {
      setDrillIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center py-3 sm:py-6 px-3 sm:px-4 antialiased transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg, #090705)',
        color: 'var(--text, #f3ece4)',
      }}
    >
      {/* APP CONTAINER (Matches 480px mobile card hierarchy & scalable desktop) */}
      <div className="w-full max-w-[480px] flex flex-col gap-3">
        
        {/* ========================================================
            1. HEADER (Both Views)
            Left: Avatar + MY LEARNING + Online badge
            Right: Sun/Moon button + AI button
            ======================================================== */}
        <header
          className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 shadow-sm transition-all"
          style={{
            backgroundColor: 'var(--card-bg, #140e09)',
            border: '1px solid var(--border, #2c1d12)',
          }}
        >
          {/* Left: Avatar + Title + Online Badge */}
          <div className="flex items-center gap-2.5">
            <img
              src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
              alt="MY LEARNING"
              className="w-8 h-8 rounded-full object-cover border-2 shrink-0"
              style={{
                borderColor: 'var(--primary, #f59e0b)',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.35)',
              }}
            />
            <span className="text-[13px] font-black tracking-wider text-white">
              MY LEARNING
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </span>
          </div>

          {/* Right: Theme Toggle + AI Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer text-amber-400 hover:text-amber-300"
              style={{
                backgroundColor: 'var(--surface, #1b130c)',
                border: '1px solid var(--border, #2c1d12)',
              }}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-amber-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                // Focus / trigger learning helper
                if (activeTab === 'reader') {
                  playRyanAudio(currentPassage.text);
                } else {
                  playRyanAudio(activeTargetString);
                }
              }}
              title="Ryan UK Speech AI"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-amber-400 hover:text-amber-300"
              style={{
                backgroundColor: 'var(--surface, #1b130c)',
                border: '1px solid var(--border, #2c1d12)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="font-mono text-[11px] font-semibold">AI</span>
            </button>
          </div>
        </header>

        {/* ========================================================
            2. NAVIGATION ROW 1 (MAIN TABS)
            2-Button Grid: [📖 Reader & Audio] vs [⌨️ Typing Trainer]
            Active tab has amber background (#f59e0b) with dark text
            ======================================================== */}
        <div
          className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl"
          style={{
            backgroundColor: 'var(--card-bg, #140e09)',
            border: '1px solid var(--border, #2c1d12)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('reader');
              navigate('/read', { replace: true });
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reader'
                ? 'bg-[#f59e0b] text-neutral-950 shadow-sm font-extrabold'
                : 'text-[#8e7d70] hover:text-[#f3ece4]'
            }`}
            style={{
              backgroundColor: activeTab === 'reader' ? '#f59e0b' : 'transparent',
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reader & Audio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('trainer');
              navigate('/practice', { replace: true });
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trainer'
                ? 'bg-[#f59e0b] text-neutral-950 shadow-sm font-extrabold'
                : 'text-[#8e7d70] hover:text-[#f3ece4]'
            }`}
            style={{
              backgroundColor: activeTab === 'trainer' ? '#f59e0b' : 'transparent',
            }}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Typing Trainer</span>
          </button>
        </div>

        {/* ========================================================
            3. NAVIGATION ROW 2 (SUBJECT PILLS)
            2-Column Grid: [👤 The Man] vs [👗 The Woman]
            Active subject gets amber border and subtle amber background tint
            ======================================================== */}
        <div className="grid grid-cols-2 gap-2">
          {PASSAGES.map((p, idx) => {
            const isSelected = selectedPassageIndex === idx;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPassageIndex(idx)}
                className="py-2.5 px-3 rounded-2xl text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'var(--card-bg, #140e09)',
                  border: isSelected
                    ? '1.5px solid #f59e0b'
                    : '1px solid var(--border, #2c1d12)',
                  color: isSelected ? '#ffffff' : '#8e7d70',
                }}
              >
                <span>{idx === 0 ? '👤' : '👗'}</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            VIEW 1: READER & AUDIO (Match 18769_2.jpg exactly)
            - Toolbar Strip: [A-] [A] [A+] on left | [((•)) Ryan (UK)] badge + [▶ Read Aloud] button on right
            - Reader Body: Single continuous prose paragraph with amber dotted underlines on vocab
            - Bottom Card Strip: "Translations: 🇩🇪 German & 🇸🇴 Somali"
            - Footer: Centered italic quote '"I learn by reading and typing."'
            ======================================================== */}
        {activeTab === 'reader' && (
          <div className="flex flex-col gap-3">
            {/* TOOLBAR STRIP */}
            <div
              className="flex items-center justify-between rounded-2xl p-2.5 transition-all"
              style={{
                backgroundColor: 'var(--card-bg, #140e09)',
                border: '1px solid var(--border, #2c1d12)',
              }}
            >
              {/* Size chips [A-] [A] [A+] */}
              <div className="flex items-center gap-1">
                {(['sm', 'base', 'lg'] as TextSize[]).map((size) => {
                  const label = size === 'sm' ? 'A-' : size === 'base' ? 'A' : 'A+';
                  const isActive = textSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTextSize(size)}
                      className="w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                      style={{
                        backgroundColor: isActive
                          ? 'var(--surface-hover, #261b11)'
                          : 'transparent',
                        color: isActive ? '#f59e0b' : '#8e7d70',
                        border: isActive ? '1px solid #f59e0b' : 'none',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Right: [((•)) Ryan (UK)] badge + [▶ Read Aloud] button */}
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-medium"
                  style={{
                    backgroundColor: 'var(--surface, #1b130c)',
                    border: '1px solid var(--border, #2c1d12)',
                    color: '#8e7d70',
                  }}
                >
                  <Radio className="w-3 h-3 text-[#f59e0b]" />
                  <span>Ryan (UK)</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (isPlayingAudio) {
                      stopAudio();
                    } else {
                      playRyanAudio(currentPassage.text);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                  style={{
                    backgroundColor: isPlayingAudio ? '#f43f5e' : '#f59e0b',
                    color: isPlayingAudio ? '#ffffff' : '#090705',
                  }}
                >
                  {isLoadingAudio ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isPlayingAudio ? (
                    <Square className="w-3 h-3 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>{isPlayingAudio ? 'Stop' : 'Read Aloud'}</span>
                </button>
              </div>
            </div>

            {/* READER BODY: ONE SINGLE CONTINUOUS PROSE PARAGRAPH */}
            <div
              className="rounded-2xl p-4 sm:p-5 transition-all"
              style={{
                backgroundColor: 'var(--card-bg, #140e09)',
                border: '1px solid var(--border, #2c1d12)',
              }}
            >
              <p
                className={`leading-relaxed font-sans ${
                  textSize === 'sm'
                    ? 'text-sm'
                    : textSize === 'lg'
                    ? 'text-lg sm:text-xl'
                    : 'text-base sm:text-lg'
                }`}
                style={{ color: 'var(--text, #f3ece4)' }}
              >
                {renderReadableTextWithVocab(currentPassage.text)}
              </p>
            </div>

            {/* BOTTOM CARD STRIP: Translations: 🇩🇪 German & 🇸🇴 Somali */}
            <div
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-center"
              style={{
                backgroundColor: 'var(--card-bg, #140e09)',
                border: '1px solid var(--border, #2c1d12)',
                color: '#8e7d70',
              }}
            >
              <span>Translations: 🇩🇪 German & 🇸🇴 Somali</span>
            </div>

            {/* FOOTER: Centered italic quote */}
            <footer className="text-center py-2">
              <p className="text-xs italic" style={{ color: '#8e7d70' }}>
                "I learn by reading and typing."
              </p>
            </footer>
          </div>
        )}

        {/* ========================================================
            VIEW 2: TYPING TRAINER (Match 18778.jpg exactly)
            - Row 1: Mode chips [One-by-One] [Sentences] [Full Text]
            - Row 2: 1-Row Compact Stats HUD: SPEED (0 wpm) | ACCURACY (100%) | TIME (0s) | MISTAKES (0)
            - Typing Stage Card:
              * Header: "WORD / PHRASE DRILL" (amber) on left, [Listen (Ryan)] button on right
              * Typing Box: Centered box with glowing amber border (#f59e0b) and large monospace text
              * Amber cursor/caret highlight; stealth input capturing keystrokes
              * Footer navigation: [← Prev] on left, "1 of 6" in center, [Next →] on right
            - Footer: Centered italic quote '"I learn by reading and typing."'
            ======================================================== */}
        {activeTab === 'trainer' && (
          <div className="flex flex-col gap-3">
            
            {/* ROW 1: MODE CHIPS [One-by-One] [Sentences] [Full Text] */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'drill', label: 'One-by-One' },
                { id: 'sentence', label: 'Sentences' },
                { id: 'full', label: 'Full Text' },
              ].map((m) => {
                const isActive = drillMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setDrillMode(m.id as DrillMode);
                      setDrillIndex(0);
                    }}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer"
                    style={{
                      backgroundColor: isActive
                        ? 'var(--surface-hover, #261b11)'
                        : 'var(--card-bg, #140e09)',
                      border: isActive
                        ? '1px solid #f59e0b'
                        : '1px solid var(--border, #2c1d12)',
                      color: isActive ? '#f59e0b' : '#8e7d70',
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* ROW 2: 1-ROW COMPACT STATS HUD */}
            <div
              className="grid grid-cols-4 rounded-2xl py-2 px-1 transition-all"
              style={{
                backgroundColor: 'var(--card-bg, #140e09)',
                border: '1px solid var(--border, #2c1d12)',
              }}
            >
              {/* SPEED */}
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono font-medium" style={{ color: '#8e7d70' }}>
                  SPEED
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-white">
                  {stats.wpm} <span className="text-[10px] font-normal font-mono" style={{ color: '#8e7d70' }}>wpm</span>
                </span>
              </div>

              {/* ACCURACY */}
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{ borderLeft: '1px solid var(--border, #2c1d12)' }}
              >
                <span className="text-[10px] font-mono font-medium" style={{ color: '#8e7d70' }}>
                  ACCURACY
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
                  {stats.accuracy}%
                </span>
              </div>

              {/* TIME */}
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{ borderLeft: '1px solid var(--border, #2c1d12)' }}
              >
                <span className="text-[10px] font-mono font-medium" style={{ color: '#8e7d70' }}>
                  TIME
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-amber-400">
                  {stats.time}s
                </span>
              </div>

              {/* MISTAKES */}
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{ borderLeft: '1px solid var(--border, #2c1d12)' }}
              >
                <span className="text-[10px] font-mono font-medium" style={{ color: '#8e7d70' }}>
                  MISTAKES
                </span>
                <span
                  className="text-sm sm:text-base font-black font-mono"
                  style={{ color: stats.mistakes > 0 ? '#f43f5e' : '#8e7d70' }}
                >
                  {stats.mistakes}
                </span>
              </div>
            </div>

            {/* TYPING STAGE CARD */}
            <div
              onClick={handleFocusInput}
              className="rounded-2xl p-4 sm:p-5 flex flex-col gap-4 transition-all cursor-text relative"
              style={{
                backgroundColor: 'var(--card-bg, #140e09)',
                border: '1px solid var(--border, #2c1d12)',
              }}
            >
              {/* Card Header: "WORD / PHRASE DRILL" + [Listen (Ryan)] */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#f59e0b] uppercase">
                  {drillMode === 'drill'
                    ? 'WORD / PHRASE DRILL'
                    : drillMode === 'sentence'
                    ? 'SENTENCE DRILL'
                    : 'FULL TEXT DRILL'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPlayingAudio) {
                      stopAudio();
                    } else {
                      playRyanAudio(activeTargetString);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                  style={{
                    backgroundColor: isPlayingAudio
                      ? '#f43f5e'
                      : 'var(--surface, #1b130c)',
                    border: '1px solid var(--border, #2c1d12)',
                    color: isPlayingAudio ? '#ffffff' : '#f59e0b',
                  }}
                >
                  {isLoadingAudio ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isPlayingAudio ? (
                    <Square className="w-3 h-3 fill-current" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                  <span>Listen (Ryan)</span>
                </button>
              </div>

              {/* Stealth input capturing keystrokes */}
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="absolute inset-0 opacity-0 cursor-default"
                aria-label="Stealth typing input"
              />

              {/* TYPING BOX: CENTERED BOX WITH GLOWING AMBER BORDER (#f59e0b) */}
              <div
                className="rounded-xl p-4 min-h-[90px] flex items-center justify-center text-center transition-all"
                style={{
                  backgroundColor: 'var(--surface, #1b130c)',
                  border: '1.5px solid #f59e0b',
                  boxShadow: '0 0 16px rgba(245, 158, 11, 0.22)',
                }}
              >
                <div className="font-mono text-base sm:text-lg leading-relaxed select-none tracking-normal">
                  {activeTargetString.split('').map((char, idx) => {
                    const isTyped = idx < inputVal.length;
                    const isCurrent = idx === inputVal.length;
                    const isCorrect = isTyped && inputVal[idx] === char;
                    const isError = isTyped && inputVal[idx] !== char;

                    return (
                      <span key={idx} className="relative inline">
                        {/* Amber Cursor / Caret highlight */}
                        {isCurrent && !isCompleted && (
                          <span
                            className="inline-block w-[2px] h-[1.15em] align-middle animate-pulse -mr-[2px]"
                            style={{
                              backgroundColor: '#f59e0b',
                              boxShadow: '0 0 8px #f59e0b',
                            }}
                          />
                        )}

                        <span
                          className={
                            isCorrect
                              ? 'text-white font-semibold'
                              : isError
                              ? 'text-white bg-rose-600/90 rounded-xs'
                              : 'opacity-40'
                          }
                          style={{
                            color: !isTyped ? '#8e7d70' : undefined,
                          }}
                        >
                          {char}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* FOOTER NAVIGATION: [← Prev] | "1 of 6" | [Next →] */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevDrill();
                  }}
                  disabled={drillIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--surface, #1b130c)',
                    border: '1px solid var(--border, #2c1d12)',
                    color: '#8e7d70',
                  }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <span className="text-xs font-mono font-medium" style={{ color: '#8e7d70' }}>
                  {drillIndex + 1} of {activeTargetsList.length}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextDrill();
                  }}
                  disabled={drillIndex >= activeTargetsList.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--surface, #1b130c)',
                    border: '1px solid var(--border, #2c1d12)',
                    color: '#8e7d70',
                  }}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* FOOTER: Centered italic quote */}
            <footer className="text-center py-2">
              <p className="text-xs italic" style={{ color: '#8e7d70' }}>
                "I learn by reading and typing."
              </p>
            </footer>
          </div>
        )}

        {/* TRILINGUAL VOCABULARY MODAL */}
        <AnimatePresence>
          {selectedVocabEntry && (
            <PublicVocabularyModal
              entry={selectedVocabEntry}
              onClose={() => setSelectedVocabEntry(null)}
              onPracticeText={() => {
                setSelectedVocabEntry(null);
                setActiveTab('trainer');
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PublicTypingPage;
