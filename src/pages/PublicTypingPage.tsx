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
} from 'lucide-react';
import { typingSoundService } from '../services/typingSoundService';

export interface PassageItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  gender: 'man' | 'woman';
  text: string;
}

export const PUBLIC_PASSAGES: PassageItem[] = [
  {
    id: 'man-profile',
    title: 'Passage 1 — The Man',
    subtitle: 'Description: Tall, slim, dark hair, beard & glasses',
    tag: 'First Text',
    gender: 'man',
    text: 'The man is tall and slim, and he looks around 30 years old. He has short dark hair, a beard, and he wears glasses. He is wearing a dark T-shirt, pants, and black shoes.',
  },
  {
    id: 'woman-profile',
    title: 'Passage 2 — The Woman',
    subtitle: 'Description: Short, heavy, brown hair & happy smile',
    tag: 'Second Text',
    gender: 'woman',
    text: 'The woman is short and a little heavy, and she is around 40 years old. She has brown hair and a happy smile. She is wearing a light tunic shirt, pants, and flat shoes.',
  },
];

type TimerOption = 0 | 15 | 30 | 60 | 90 | 120; // 0 means untimed / free flow

export function PublicTypingPage() {
  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number>(0);
  const [timerMode, setTimerMode] = useState<TimerOption>(0); // 0 = untimed
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [inputVal, setInputVal] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const mistakeSetRef = useRef<Set<number>>(new Set());

  const currentPassage = PUBLIC_PASSAGES[selectedPassageIndex];
  const targetText = currentPassage.text;

  const stopAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, []);

  // Reset session when changing passage or timer mode
  const resetSession = useCallback(() => {
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
    }, 50);
  }, [timerMode, stopAudio]);

  useEffect(() => {
    resetSession();
  }, [selectedPassageIndex, timerMode, resetSession]);

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

    // Start timer on first character
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
      if (soundEnabled) {
        typingSoundService.playCompletion();
      }
    }
  };

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Global hotkeys (Escape to restart)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetSession]);

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
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleShareResults = () => {
    const textToCopy = `⌨️ My Learning Typing Practice:
Passage: ${currentPassage.title}
Speed: ${stats.wpm} WPM | Accuracy: ${stats.accuracy}% | Time: ${stats.durationSec}s`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextPassage = () => {
    setSelectedPassageIndex((prev) => (prev + 1) % PUBLIC_PASSAGES.length);
  };

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
                  Public Practice
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Zero login required • Instant typing training
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center gap-6">
        {/* Passage Selection Tabs */}
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

        {/* Time Limit Selector & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#14110e] border border-neutral-800/80">
          {/* Time options */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1 mr-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Time:</span>
            </span>
            {[
              { val: 0, label: 'Untimed / Free' },
              { val: 15, label: '15s' },
              { val: 30, label: '30s' },
              { val: 60, label: '60s' },
              { val: 90, label: '90s' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setTimerMode(opt.val as TimerOption)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  timerMode === opt.val
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm shadow-amber-500/30'
                    : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Audio Listen & Restart Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleListenText}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-amber-400 transition-all cursor-pointer"
              title="Listen to native pronunciation"
            >
              <Volume1 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-amber-400 animate-pulse' : ''}`} />
              <span>{isPlayingAudio ? 'Speaking...' : 'Listen'}</span>
            </button>

            <button
              onClick={resetSession}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Restart session (Esc)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* Live HUD Metrics Bar */}
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

        {/* Interactive Typing Canvas */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative rounded-3xl bg-[#110f0d] border border-neutral-800 p-6 sm:p-8 min-h-[220px] flex flex-col justify-between shadow-2xl cursor-text transition-all focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30"
        >
          {/* Passage Content with Interactive Character Highlighting */}
          <div className="text-lg sm:text-2xl leading-relaxed sm:leading-loose font-mono tracking-normal select-none">
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

          {/* Hidden native input for captures */}
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
              <span>Click anywhere or type to start</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>[Esc] to Reset</span>
              <span>•</span>
              <span>{inputVal.length} / {targetText.length} chars</span>
            </div>
          </div>
        </div>

        {/* Completion Modal / Scorecard Card */}
        {(isCompleted || isTimeUp) && (
          <div className="p-6 rounded-3xl bg-[#16120e] border border-amber-500/50 shadow-2xl shadow-amber-500/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-2xl font-black">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isCompleted ? '🎉 Passage Completed!' : '⏱️ Time’s Up!'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {currentPassage.title} — {stats.wpm} Words Per Minute
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
                <span>Try Again</span>
              </button>

              <button
                onClick={nextPassage}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>
                  {selectedPassageIndex === 0
                    ? 'Practice Second Text (The Woman)'
                    : 'Practice First Text (The Man)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
