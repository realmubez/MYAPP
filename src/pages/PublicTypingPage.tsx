import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Trophy,
  Gauge,
  Target,
  FileText,
  Volume1,
  Share2,
  Check,
  Flame,
  ListOrdered,
  BookOpen,
  FastForward,
} from 'lucide-react';
import { typingSoundService } from '../services/typingSoundService';

export interface TrainingStep {
  id: string;
  title: string;
  chunk: string;
  hint?: string;
}

export interface PassageItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  gender: 'man' | 'woman';
  fullText: string;
  progressiveSteps: TrainingStep[];
  sentenceSteps: TrainingStep[];
}

export const PUBLIC_PASSAGES: PassageItem[] = [
  {
    id: 'man-profile',
    title: 'Passage 1 — The Man',
    subtitle: 'Description: Tall, slim, dark hair, beard & glasses',
    tag: 'First Subject',
    gender: 'man',
    fullText:
      'The man is tall and slim, and he looks around 30 years old. He has short dark hair, a beard, and he wears glasses. He is wearing a dark T-shirt, pants, and black shoes.',
    progressiveSteps: [
      { id: 'm-1', title: 'Start: Subject', chunk: 'The man', hint: 'Start with the subject' },
      { id: 'm-2', title: 'Physical Build', chunk: 'The man is tall', hint: 'Describe height' },
      { id: 'm-3', title: 'Complete Clause 1', chunk: 'The man is tall and slim,', hint: 'Height and build with comma' },
      { id: 'm-4', title: 'Age Clause', chunk: 'and he looks around 30 years old.', hint: 'Estimated age' },
      {
        id: 'm-5',
        title: 'Master Sentence 1',
        chunk: 'The man is tall and slim, and he looks around 30 years old.',
        hint: 'Full first sentence',
      },
      { id: 'm-6', title: 'Hair Description', chunk: 'He has short dark hair,', hint: 'Short dark hair with comma' },
      { id: 'm-7', title: 'Beard & Glasses', chunk: 'a beard, and he wears glasses.', hint: 'Facial details' },
      {
        id: 'm-8',
        title: 'Master Sentence 2',
        chunk: 'He has short dark hair, a beard, and he wears glasses.',
        hint: 'Full second sentence',
      },
      { id: 'm-9', title: 'Clothing: Top', chunk: 'He is wearing a dark T-shirt,', hint: 'Shirt details (capital T)' },
      { id: 'm-10', title: 'Pants & Shoes', chunk: 'pants, and black shoes.', hint: 'Bottom and footwear' },
      {
        id: 'm-11',
        title: 'Master Sentence 3',
        chunk: 'He is wearing a dark T-shirt, pants, and black shoes.',
        hint: 'Full third sentence',
      },
      {
        id: 'm-12',
        title: 'Complete Passage Mastery',
        chunk:
          'The man is tall and slim, and he looks around 30 years old. He has short dark hair, a beard, and he wears glasses. He is wearing a dark T-shirt, pants, and black shoes.',
        hint: 'Type the entire paragraph fluidly',
      },
    ],
    sentenceSteps: [
      {
        id: 'm-s1',
        title: 'Sentence 1: Appearance & Age',
        chunk: 'The man is tall and slim, and he looks around 30 years old.',
      },
      {
        id: 'm-s2',
        title: 'Sentence 2: Facial Features',
        chunk: 'He has short dark hair, a beard, and he wears glasses.',
      },
      {
        id: 'm-s3',
        title: 'Sentence 3: Outfit & Shoes',
        chunk: 'He is wearing a dark T-shirt, pants, and black shoes.',
      },
    ],
  },
  {
    id: 'woman-profile',
    title: 'Passage 2 — The Woman',
    subtitle: 'Description: Short, heavy, brown hair & happy smile',
    tag: 'Second Subject',
    gender: 'woman',
    fullText:
      'The woman is short and a little heavy, and she is around 40 years old. She has brown hair and a happy smile. She is wearing a light tunic shirt, pants, and flat shoes.',
    progressiveSteps: [
      { id: 'w-1', title: 'Start: Subject', chunk: 'The woman', hint: 'Start with the subject' },
      { id: 'w-2', title: 'Physical Build', chunk: 'The woman is short', hint: 'Describe height' },
      {
        id: 'w-3',
        title: 'Complete Clause 1',
        chunk: 'The woman is short and a little heavy,',
        hint: 'Height and weight with comma',
      },
      { id: 'w-4', title: 'Age Clause', chunk: 'and she is around 40 years old.', hint: 'Estimated age' },
      {
        id: 'w-5',
        title: 'Master Sentence 1',
        chunk: 'The woman is short and a little heavy, and she is around 40 years old.',
        hint: 'Full first sentence',
      },
      { id: 'w-6', title: 'Hair Description', chunk: 'She has brown hair', hint: 'Hair color' },
      { id: 'w-7', title: 'Smile Expression', chunk: 'and a happy smile.', hint: 'Facial expression' },
      {
        id: 'w-8',
        title: 'Master Sentence 2',
        chunk: 'She has brown hair and a happy smile.',
        hint: 'Full second sentence',
      },
      { id: 'w-9', title: 'Clothing: Top', chunk: 'She is wearing a light tunic shirt,', hint: 'Tunic shirt with comma' },
      { id: 'w-10', title: 'Pants & Shoes', chunk: 'pants, and flat shoes.', hint: 'Bottom and flat shoes' },
      {
        id: 'w-11',
        title: 'Master Sentence 3',
        chunk: 'She is wearing a light tunic shirt, pants, and flat shoes.',
        hint: 'Full third sentence',
      },
      {
        id: 'w-12',
        title: 'Complete Passage Mastery',
        chunk:
          'The woman is short and a little heavy, and she is around 40 years old. She has brown hair and a happy smile. She is wearing a light tunic shirt, pants, and flat shoes.',
        hint: 'Type the entire paragraph fluidly',
      },
    ],
    sentenceSteps: [
      {
        id: 'w-s1',
        title: 'Sentence 1: Appearance & Age',
        chunk: 'The woman is short and a little heavy, and she is around 40 years old.',
      },
      {
        id: 'w-s2',
        title: 'Sentence 2: Hair & Smile',
        chunk: 'She has brown hair and a happy smile.',
      },
      {
        id: 'w-s3',
        title: 'Sentence 3: Outfit & Footwear',
        chunk: 'She is wearing a light tunic shirt, pants, and flat shoes.',
      },
    ],
  },
];

type PracticeMode = 'progressive' | 'sentence' | 'full';
type TimerOption = 0 | 15 | 30 | 60 | 90; // 0 = untimed

export function PublicTypingPage() {
  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number>(0);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('progressive');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [timerMode, setTimerMode] = useState<TimerOption>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  const [inputVal, setInputVal] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Completed steps tracking for current passage
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const mistakeSetRef = useRef<Set<number>>(new Set());
  const autoAdvanceTimeoutRef = useRef<number | null>(null);

  const currentPassage = PUBLIC_PASSAGES[selectedPassageIndex];

  // Determine current active steps array based on practice mode
  const currentStepsList: TrainingStep[] =
    practiceMode === 'progressive'
      ? currentPassage.progressiveSteps
      : practiceMode === 'sentence'
      ? currentPassage.sentenceSteps
      : [
          {
            id: `${currentPassage.id}-full`,
            title: 'Full Passage',
            chunk: currentPassage.fullText,
          },
        ];

  const currentStep =
    currentStepsList[Math.min(currentStepIndex, currentStepsList.length - 1)] ||
    currentStepsList[0];
  const targetText = currentStep.chunk;

  const stopAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, []);

  // Reset session for typing
  const resetSession = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setInputVal('');
    setStartTime(null);
    setEndTime(null);
    setTimeLeft(timerMode > 0 ? timerMode : null);
    setMistakesCount(0);
    setIsCompleted(false);
    setIsTimeUp(false);
    mistakeSetRef.current.clear();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopAudio();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
  }, [timerMode, stopAudio]);

  // When changing passage or practice mode, reset step index and clear state
  useEffect(() => {
    setCurrentStepIndex(0);
    resetSession();
  }, [selectedPassageIndex, practiceMode]);

  // When step changes, reset input
  useEffect(() => {
    resetSession();
  }, [currentStepIndex, resetSession]);

  // Timer countdown / count-up effect
  useEffect(() => {
    if (startTime && !endTime && !isCompleted && !isTimeUp) {
      timerIntervalRef.current = window.setInterval(() => {
        if (timerMode > 0) {
          const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
          const remaining = Math.max(0, timerMode - elapsedSec);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            setEndTime(Date.now());
            setIsTimeUp(true);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          }
        }
      }, 100);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [startTime, endTime, isCompleted, isTimeUp, timerMode]);

  // Handle keyboard typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted || isTimeUp) return;

    const value = e.target.value;
    const now = Date.now();

    // Start timer on first keystroke
    if (!startTime) {
      setStartTime(now);
      if (timerMode > 0) {
        setTimeLeft(timerMode);
      }
    }

    // Play click sound if enabled
    if (soundEnabled && value.length > inputVal.length) {
      const lastChar = value[value.length - 1];
      const targetChar = targetText[value.length - 1];
      if (lastChar === targetChar) {
        typingSoundService.playCorrectKey();
      } else {
        typingSoundService.playIncorrectKey();
      }
    }

    // Track mistakes
    const currentIndex = value.length - 1;
    if (currentIndex >= 0 && currentIndex < targetText.length) {
      if (value[currentIndex] !== targetText[currentIndex]) {
        if (!mistakeSetRef.current.has(currentIndex)) {
          mistakeSetRef.current.add(currentIndex);
          setMistakesCount((prev) => prev + 1);
        }
      }
    }

    setInputVal(value);

    // Check completion
    if (value.length >= targetText.length) {
      setEndTime(now);
      setIsCompleted(true);
      setCompletedStepIds((prev) => new Set([...prev, currentStep.id]));

      if (soundEnabled) {
        typingSoundService.playCompletion();
      }

      // Auto advance to next step if enabled and not at the last step
      if (autoAdvance && currentStepIndex < currentStepsList.length - 1) {
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          goToNextStep();
        }, 800);
      }
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < currentStepsList.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Global hotkeys (Escape to restart, Enter to advance when completed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetSession();
      } else if (e.key === 'Enter' && isCompleted) {
        if (currentStepIndex < currentStepsList.length - 1) {
          goToNextStep();
        } else {
          // Switch to other passage or restart
          setSelectedPassageIndex((prev) => (prev + 1) % PUBLIC_PASSAGES.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetSession, isCompleted, currentStepIndex, currentStepsList.length]);

  // Compute live / final stats
  const calculateStats = () => {
    const currentTime = endTime || (startTime ? Date.now() : Date.now());
    const durationSec = startTime ? Math.max(1, (currentTime - startTime) / 1000) : 1;
    const minutes = durationSec / 60;

    let correctChars = 0;
    for (let i = 0; i < inputVal.length; i++) {
      if (i < targetText.length && inputVal[i] === targetText[i]) {
        correctChars++;
      }
    }

    const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
    const totalTyped = inputVal.length;
    const accuracy =
      totalTyped > 0 ? Math.max(0, Math.round(((totalTyped - mistakesCount) / totalTyped) * 100)) : 100;

    return {
      wpm,
      accuracy,
      durationSec: Math.round(durationSec * 10) / 10,
      correctChars,
      totalTyped,
      mistakes: mistakesCount,
    };
  };

  const stats = calculateStats();

  const handleListenText = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        stopAudio();
        const utterance = new SpeechSynthesisUtterance(targetText);
        utterance.lang = 'en-US';
        utterance.rate = 0.92;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleShareResults = () => {
    const textToCopy = `⌨️ My Learning Typing:
${currentPassage.title} — ${currentStep.title}
Speed: ${stats.wpm} WPM | Accuracy: ${stats.accuracy}% | Time: ${stats.durationSec}s`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = currentStepsList.filter((s) => completedStepIds.has(s.id)).length;
  const progressPercent = Math.round((completedCount / currentStepsList.length) * 100);

  return (
    <div className="min-h-screen w-full bg-[#0a0908] text-neutral-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-neutral-800/80 bg-[#120f0c]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">⌨️</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                  MY LEARNING
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Public Trainer
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Step-by-step progressive learning • No login required
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound Toggle */}
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                typingSoundService.setEnabled(nextState);
                if (nextState) typingSoundService.playCorrectKey();
              }}
              title={soundEnabled ? 'Mute typing sounds' : 'Enable typing sounds'}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            </button>

            {/* Login Link */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center gap-5">
        {/* 1. Passage Selector Tabs (Man vs Woman) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PUBLIC_PASSAGES.map((passage, idx) => {
            const isSelected = selectedPassageIndex === idx;
            return (
              <button
                key={passage.id}
                onClick={() => setSelectedPassageIndex(idx)}
                className={`relative flex items-start gap-3 p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'bg-[#14110e] border-neutral-800/80 hover:border-neutral-700 opacity-75 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 font-bold ${
                    isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-900 text-neutral-500'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      {passage.tag}
                    </span>
                    {isSelected && (
                      <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-neutral-100 truncate mt-0.5">
                    {passage.title}
                  </div>
                  <div className="text-xs text-neutral-400 truncate mt-0.5">
                    {passage.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 2. Practice Mode Selector (One-by-One Progressive vs Sentence vs Full) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#14110e] border border-neutral-800/80">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Training Mode:</span>
            </span>
            <button
              onClick={() => setPracticeMode('progressive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                practiceMode === 'progressive'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>🎯 Step-by-Step (One-by-One)</span>
            </button>

            <button
              onClick={() => setPracticeMode('sentence')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                practiceMode === 'sentence'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sentence by Sentence</span>
            </button>

            <button
              onClick={() => setPracticeMode('full')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                practiceMode === 'full'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Passage</span>
            </button>
          </div>

          {/* Auto Advance Toggle */}
          {practiceMode !== 'full' && (
            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Auto-advance next step</span>
            </label>
          )}
        </div>

        {/* 3. Progressive Steps Stepper Strip (When in progressive or sentence mode) */}
        {practiceMode !== 'full' && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#120f0d] border border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-neutral-300">
                <span className="text-amber-400 font-bold">
                  Step {currentStepIndex + 1} of {currentStepsList.length}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 truncate">{currentStep.title}</span>
              </div>
              <div className="text-neutral-400 font-mono text-[11px]">
                {completedCount}/{currentStepsList.length} Mastered ({progressPercent}%)
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>

            {/* Step Pills Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {currentStepsList.map((step, idx) => {
                const isCurrent = currentStepIndex === idx;
                const isDone = completedStepIds.has(step.id);
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm shadow-amber-500/20'
                        : isDone
                        ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/80'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {isDone && !isCurrent && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{idx + 1}</span>
                    <span className="hidden md:inline max-w-[90px] truncate">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Live HUD Metrics & Timer Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#14110e] border border-neutral-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                {stats.wpm}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Speed (WPM)
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14110e] border border-neutral-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                {stats.accuracy}%
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Accuracy
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14110e] border border-neutral-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-blue-400">
                {timerMode > 0 ? `${timeLeft ?? timerMode}s` : `${stats.durationSec}s`}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                {timerMode > 0 ? 'Time Left' : 'Elapsed'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14110e] border border-neutral-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">
                {stats.mistakes}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Mistakes
              </div>
            </div>
          </div>
        </div>

        {/* 5. Interactive Typing Canvas */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative rounded-3xl bg-[#110f0d] border border-neutral-800 p-6 sm:p-8 min-h-[220px] flex flex-col justify-between shadow-2xl cursor-text transition-all focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30"
        >
          {/* Current Step Prompt Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-900 mb-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-semibold text-neutral-200">{currentStep.title}</span>
              {currentStep.hint && (
                <span className="text-neutral-500 italic hidden sm:inline">
                  — {currentStep.hint}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleListenText();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-amber-400 transition-all cursor-pointer"
                title="Listen to native voice"
              >
                <Volume1 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-amber-400 animate-pulse' : ''}`} />
                <span>{isPlayingAudio ? 'Speaking...' : 'Listen'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetSession();
                }}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
                title="Restart this step"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Character-by-character live interactive coloring */}
          <div className="text-xl sm:text-3xl leading-relaxed sm:leading-loose font-mono tracking-normal select-none my-auto">
            {targetText.split('').map((char, index) => {
              const isTyped = index < inputVal.length;
              const isCurrent = index === inputVal.length;
              const isCorrect = isTyped && inputVal[index] === char;
              const isIncorrect = isTyped && inputVal[index] !== char;

              let charClass = 'text-neutral-500';
              if (isCorrect) {
                charClass = 'text-amber-300 font-semibold';
              } else if (isIncorrect) {
                charClass = 'text-red-400 bg-red-950/80 underline decoration-red-500';
              }

              return (
                <span
                  key={index}
                  className={`relative ${charClass} ${
                    isCurrent ? 'border-b-2 border-amber-400 bg-amber-500/20 text-white animate-pulse' : ''
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* Hidden native input for typing captures */}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            disabled={isCompleted || isTimeUp}
            className="absolute opacity-0 inset-0 pointer-events-auto cursor-text w-full h-full"
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Bottom helper prompt */}
          <div className="mt-6 pt-4 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Type the highlighted text • Exact spelling & punctuation</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>[Esc] to Reset</span>
              <span>•</span>
              <span>{inputVal.length} / {targetText.length} chars</span>
            </div>
          </div>
        </div>

        {/* 6. Step Navigation Controls & Completion Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {practiceMode !== 'full' && (
              <>
                <button
                  onClick={goToPrevStep}
                  disabled={currentStepIndex === 0}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#14110e] border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                <button
                  onClick={goToNextStep}
                  disabled={currentStepIndex >= currentStepsList.length - 1}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#14110e] border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setSelectedPassageIndex((prev) => (prev + 1) % PUBLIC_PASSAGES.length);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
            >
              <span>
                Switch to {selectedPassageIndex === 0 ? 'Passage 2 (The Woman)' : 'Passage 1 (The Man)'}
              </span>
              <FastForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7. Completion Scorecard Card */}
        {(isCompleted || isTimeUp) && (
          <div className="p-6 rounded-3xl bg-[#16120e] border border-amber-500/50 shadow-2xl shadow-amber-500/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-2xl font-black">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isCompleted ? '🎉 Step Mastered!' : '⏱️ Time’s Up!'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {currentStep.title} — {stats.wpm} WPM • {stats.accuracy}% Accuracy
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareResults}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-neutral-400" />}
                  <span>{copied ? 'Copied!' : 'Copy Stats'}</span>
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              <div className="p-3.5 rounded-2xl bg-[#0e0c0a] border border-neutral-800 text-center">
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                  {stats.wpm}
                </div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase mt-1">
                  Speed (WPM)
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0e0c0a] border border-neutral-800 text-center">
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {stats.accuracy}%
                </div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase mt-1">
                  Accuracy
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0e0c0a] border border-neutral-800 text-center">
                <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400">
                  {stats.durationSec}s
                </div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase mt-1">
                  Duration
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0e0c0a] border border-neutral-800 text-center">
                <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                  {stats.mistakes}
                </div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase mt-1">
                  Mistakes
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={resetSession}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repeat Step</span>
              </button>

              {currentStepIndex < currentStepsList.length - 1 ? (
                <button
                  onClick={goToNextStep}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <span>Next Step: {currentStepsList[currentStepIndex + 1]?.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedPassageIndex((prev) => (prev + 1) % PUBLIC_PASSAGES.length);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <span>
                    🎉 Mastered! Go to {selectedPassageIndex === 0 ? 'Passage 2' : 'Passage 1'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 bg-[#0c0a09] py-4 text-center text-xs text-neutral-500">
        <p className="font-mono">“I learn by typing.”</p>
      </footer>
    </div>
  );
}
