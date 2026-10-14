import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
  Home,
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
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
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
            className="border-b-2 border-dashed border-[#f59e0b] text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/10 rounded-xs cursor-pointer transition-colors px-0.5"
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

  // Handler when user clicks "PRACTICE [WORD] IN TYPING ENGINE →" from the modal
  const handlePracticeWordFromModal = (word: string) => {
    setSelectedVocabEntry(null);
    setActiveTab('trainer');
    navigate('/practice', { replace: true });

    // Determine whether Word is in "The Man" or "The Woman"
    const manHasWord = PASSAGES[0].text.toLowerCase().includes(word.toLowerCase());
    const womanHasWord = PASSAGES[1].text.toLowerCase().includes(word.toLowerCase());

    const targetPassageIdx = manHasWord ? 0 : womanHasWord ? 1 : selectedPassageIndex;
    setSelectedPassageIndex(targetPassageIdx);
    setDrillMode('drill');

    const p = PASSAGES[targetPassageIdx];
    const matchIdx = p.drills.findIndex((d) => d.toLowerCase().includes(word.toLowerCase()));
    if (matchIdx !== -1) {
      setDrillIndex(matchIdx);
    } else {
      setDrillIndex(0);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center py-3 sm:py-6 px-3 sm:px-4 antialiased transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      {/* APP CONTAINER (Matches 480px mobile card hierarchy & scalable tablet/desktop) */}
      <div className="w-full max-w-[480px] md:max-w-2xl lg:max-w-4xl flex flex-col gap-3 md:gap-4 transition-all duration-200">
        {/* ========================================================
            1. HEADER (Both Views)
            Left: Avatar + MY LEARNING + Online badge
            Right: Dashboard link (tablet/desktop) + Sun/Moon button + AI button
            ======================================================== */}
        <header className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 shadow-sm transition-all bg-[var(--card-bg)] border border-[var(--border)]">
          {/* Left: Avatar + Title + Online Badge */}
          <div className="flex items-center gap-2.5">
            <img
              src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
              alt="MY LEARNING"
              className="w-8 h-8 rounded-full object-cover border-2 shrink-0 border-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.35)]"
            />
            <span className="text-[13px] font-black tracking-wider text-[var(--text-heading)]">
              MY LEARNING
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online</span>
            </span>
          </div>

          {/* Right: Dashboard link + Theme Toggle + AI Button */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer"
              title="Back to Dashboard"
            >
              <Home className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)]"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-amber-600" />
              )}
            </button>

            <Link
              to="/tutor"
              title="AI Multimodal Voice Tutor"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-amber-600 dark:text-amber-400"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="font-mono text-[11px] font-semibold">⚡ AI</span>
            </Link>
          </div>
        </header>

        {/* ========================================================
            2. NAVIGATION ROW 1 (MAIN TABS)
            2-Button Grid: [📖 Reader & Audio] vs [⌨️ Typing Trainer]
            Active tab has amber background (#f59e0b) with dark text
            ======================================================== */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('reader');
              navigate('/read', { replace: true });
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reader'
                ? 'bg-[#f59e0b] text-neutral-950 shadow-sm font-black'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
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
                ? 'bg-[#f59e0b] text-neutral-950 shadow-sm font-black'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
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
                className={`py-2.5 px-3 rounded-2xl text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'border-2 border-[#f59e0b] bg-amber-500/12 text-[var(--text-heading)] font-black'
                    : 'bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                }`}
              >
                <span>{idx === 0 ? '👤' : '👗'}</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            VIEW 1: READER & AUDIO (Matches 18769_2.jpg & Light Mode screenshot)
            - Toolbar Strip: [A-] [A] [A+] on left | [((•)) Ryan (UK)] badge + [▶ Read Aloud] button on right
            - Reader Body: Single continuous prose paragraph with amber dotted underlines on vocab
            - Bottom Card Strip: "Translations: 🇩🇪 German & 🇸🇴 Somali" on soft surface
            - Footer: Centered italic quote '"I learn by reading and typing."'
            ======================================================== */}
        {activeTab === 'reader' && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            {/* TOOLBAR STRIP */}
            <div className="flex items-center justify-between rounded-2xl p-2.5 transition-all bg-[var(--card-bg)] border border-[var(--border)] shadow-xs">
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
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'bg-[var(--surface-hover)] border border-[#f59e0b] text-amber-600 dark:text-amber-400'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Right: [((•)) Ryan (UK)] badge + [▶ Read Aloud] button */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
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
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white font-black'
                      : 'bg-[#f59e0b] hover:bg-[#fbbf24] text-neutral-950 font-black'
                  }`}
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
            <div className="rounded-2xl p-4 sm:p-5 md:p-6 transition-all bg-[var(--card-bg)] border border-[var(--border)] shadow-xs">
              <p
                className={`leading-relaxed md:leading-loose font-sans text-[var(--text-heading)] ${
                  textSize === 'sm'
                    ? 'text-sm md:text-base'
                    : textSize === 'lg'
                    ? 'text-lg sm:text-xl md:text-2xl'
                    : 'text-base sm:text-lg md:text-xl'
                }`}
              >
                {renderReadableTextWithVocab(currentPassage.text)}
              </p>
            </div>

            {/* BOTTOM CARD STRIP: Translations: 🇩🇪 German & 🇸🇴 Somali */}
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-center bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
              <span>Translations: 🇩🇪 German & 🇸🇴 Somali</span>
            </div>

            {/* FOOTER: Centered italic quote */}
            <footer className="text-center py-2">
              <p className="text-xs italic text-[var(--text-muted)]">
                "I learn by reading and typing."
              </p>
            </footer>
          </div>
        )}

        {/* ========================================================
            VIEW 2: TYPING TRAINER (Matches 18778.jpg & dual theme)
            - Row 1: Mode chips [One-by-One] [Sentences] [Full Text]
            - Row 2: 1-Row Compact Stats HUD: SPEED | ACCURACY | TIME | MISTAKES
            - Typing Stage Card:
              * Header: "WORD / PHRASE DRILL" + [Listen (Ryan)] button
              * Typing Box: Centered box with glowing amber border (#f59e0b)
              * Amber cursor/caret highlight; stealth input capturing keystrokes
              * Footer navigation: [← Prev] | "1 of 6" | [Next →]
            - Footer: Centered italic quote '"I learn by reading and typing."'
            ======================================================== */}
        {activeTab === 'trainer' && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
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
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 border border-[#f59e0b] text-amber-600 dark:text-amber-400'
                        : 'bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* ROW 2: 1-ROW COMPACT STATS HUD */}
            <div className="grid grid-cols-4 rounded-2xl py-2 px-1 transition-all bg-[var(--card-bg)] border border-[var(--border)] shadow-xs">
              {/* SPEED */}
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono font-medium text-[var(--text-muted)]">
                  SPEED
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-[var(--text-heading)]">
                  {stats.wpm}{' '}
                  <span className="text-[10px] font-normal font-mono text-[var(--text-muted)]">
                    wpm
                  </span>
                </span>
              </div>

              {/* ACCURACY */}
              <div className="flex flex-col items-center justify-center text-center border-l border-[var(--border)]">
                <span className="text-[10px] font-mono font-medium text-[var(--text-muted)]">
                  ACCURACY
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {stats.accuracy}%
                </span>
              </div>

              {/* TIME */}
              <div className="flex flex-col items-center justify-center text-center border-l border-[var(--border)]">
                <span className="text-[10px] font-mono font-medium text-[var(--text-muted)]">
                  TIME
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-amber-600 dark:text-amber-400">
                  {stats.time}s
                </span>
              </div>

              {/* MISTAKES */}
              <div className="flex flex-col items-center justify-center text-center border-l border-[var(--border)]">
                <span className="text-[10px] font-mono font-medium text-[var(--text-muted)]">
                  MISTAKES
                </span>
                <span
                  className={`text-sm sm:text-base font-black font-mono ${
                    stats.mistakes > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {stats.mistakes}
                </span>
              </div>
            </div>

            {/* TYPING STAGE CARD */}
            <div
              onClick={handleFocusInput}
              className="rounded-2xl p-4 sm:p-5 flex flex-col gap-4 transition-all cursor-text relative bg-[var(--card-bg)] border border-[var(--border)] shadow-xs"
            >
              {/* Card Header: "WORD / PHRASE DRILL" + [Listen (Ryan)] */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
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
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white font-black'
                      : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-amber-600 dark:text-amber-400'
                  }`}
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
              <div className="rounded-xl p-4 md:p-6 min-h-[90px] md:min-h-[120px] flex items-center justify-center text-center transition-all bg-[var(--surface)] border-2 border-[#f59e0b] shadow-[0_0_16px_rgba(245,158,11,0.22)]">
                <div className="font-mono text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed select-none tracking-normal">
                  {activeTargetString.split('').map((char, idx) => {
                    const isTyped = idx < inputVal.length;
                    const isCurrent = idx === inputVal.length;
                    const isCorrect = isTyped && inputVal[idx] === char;
                    const isError = isTyped && inputVal[idx] !== char;

                    return (
                      <span key={idx} className="relative inline">
                        {/* Amber Cursor / Caret highlight */}
                        {isCurrent && !isCompleted && (
                          <span className="inline-block w-[2.5px] h-[1.15em] align-middle animate-pulse -mr-[2.5px] bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
                        )}

                        <span
                          className={
                            isCorrect
                              ? 'text-[var(--text-heading)] font-semibold'
                              : isError
                              ? 'text-white bg-rose-600/90 rounded-xs px-0.5'
                              : 'opacity-50 text-[var(--text-muted)]'
                          }
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <span className="text-xs font-mono font-medium text-[var(--text-muted)]">
                  {drillIndex + 1} of {activeTargetsList.length}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextDrill();
                  }}
                  disabled={drillIndex >= activeTargetsList.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* FOOTER: Centered italic quote */}
            <footer className="text-center py-2">
              <p className="text-xs italic text-[var(--text-muted)]">
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
              onPracticeText={handlePracticeWordFromModal}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PublicTypingPage;
