import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Settings, X, Check, ArrowRight, RotateCcw, Award } from 'lucide-react';
import {
  DAY_1_TYPING,
  TypingDay,
  TouchTypingProgress,
  getTouchTypingProgress,
  saveTouchTypingProgress,
} from '../../data/typingCurriculum';
import { TypingGuideKeyboard } from './TypingGuideKeyboard';
import { HomeKeysIntro } from './HomeKeysIntro';
import { typingSoundService } from '../../services/typingSoundService';
import { SettingsModal } from '../common/SettingsModal';
import { progressService } from '../../services/progress';

interface TouchTypingEngineProps {
  dayData?: TypingDay;
  onExit?: () => void;
}

export const TouchTypingEngine: React.FC<TouchTypingEngineProps> = ({
  dayData = DAY_1_TYPING,
  onExit,
}) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => typingSoundService.isEnabled());

  // Load saved progress for this day (resumes at e.g. Exercise 6 if left there)
  const [progress, setProgress] = useState<TouchTypingProgress>(() =>
    getTouchTypingProgress(dayData.day)
  );

  // Show intro position only if not seen yet and currently on exercise 1
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return !progress.introSeen && progress.currentExerciseIndex === 0;
  });

  const currentExerciseIndex = Math.min(
    progress.currentExerciseIndex,
    dayData.exercises.length - 1
  );
  const currentExercise = dayData.exercises[currentExerciseIndex];
  const targetText = currentExercise.targetText;

  // Typing state for current drill
  const [typedText, setTypedText] = useState('');
  const [mistakeCount, setMistakeCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isExerciseComplete, setIsExerciseComplete] = useState(false);
  const [exerciseWpm, setExerciseWpm] = useState(0);
  const [exerciseAccuracy, setExerciseAccuracy] = useState(100);
  const [isDayComplete, setIsDayComplete] = useState(progress.completed);

  // References
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mistakeIndicesRef = useRef<Set<number>>(new Set());
  const typedTextRef = useRef('');
  typedTextRef.current = typedText;

  // Initialize sound on mount
  useEffect(() => {
    typingSoundService.init();
  }, []);

  const focusInput = useCallback(() => {
    if (!showIntro && !isDayComplete) {
      inputRef.current?.focus();
    }
  }, [showIntro, isDayComplete]);

  // Focus input on mount and whenever drill changes
  useEffect(() => {
    focusInput();
  }, [focusInput, currentExerciseIndex, showIntro]);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    typingSoundService.setEnabled(next);
    setSoundEnabled(next);
  };

  // Exit handler
  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate('/typing');
    }
  };

  // Handle start from intro
  const handleStartPractice = () => {
    setShowIntro(false);
    const updated = {
      ...progress,
      introSeen: true,
    };
    setProgress(updated);
    saveTouchTypingProgress(updated);
    setTimeout(() => {
      focusInput();
    }, 50);
  };

  // Reset current exercise
  const resetCurrentExercise = useCallback(() => {
    setTypedText('');
    typedTextRef.current = '';
    setMistakeCount(0);
    mistakeIndicesRef.current.clear();
    setStartTime(null);
    setIsExerciseComplete(false);
    setExerciseWpm(0);
    setExerciseAccuracy(100);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setTimeout(focusInput, 30);
  }, [focusInput]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isExerciseComplete || isDayComplete) return;

    const rawVal = e.target.value;
    const previousTyped = typedTextRef.current;
    const currentTarget = targetText;

    // Slice to target length
    const val = rawVal.slice(0, currentTarget.length);

    // Start timer on first keypress
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    // Forward typing check
    if (val.length > previousTyped.length) {
      for (let i = previousTyped.length; i < val.length; i++) {
        const expected = currentTarget[i];
        const actual = val[i];

        if (actual === expected) {
          typingSoundService.playCorrectKey();
        } else {
          typingSoundService.playIncorrectKey();
          if (!mistakeIndicesRef.current.has(i)) {
            mistakeIndicesRef.current.add(i);
            setMistakeCount((prev) => prev + 1);
          }
        }
      }
    } else if (val.length < previousTyped.length) {
      // Backspace
      mistakeIndicesRef.current.forEach((idx) => {
        if (idx >= val.length) {
          mistakeIndicesRef.current.delete(idx);
        }
      });
    }

    setTypedText(val);
    typedTextRef.current = val;

    // Calculate live speed and accuracy
    const durationSec = startTime ? Math.max(1, (Date.now() - startTime) / 1000) : 1;
    const currentMistakes = mistakeIndicesRef.current.size;
    const typedLength = val.length;

    const liveAccuracy = typedLength > 0
      ? Math.max(0, Math.round(((typedLength - currentMistakes) / typedLength) * 100))
      : 100;
    const liveWpm = typedLength > 0
      ? Math.max(1, Math.round((typedLength / 5) / (durationSec / 60)))
      : 0;

    setExerciseAccuracy(liveAccuracy);
    setExerciseWpm(liveWpm);

    // Check completion
    if (val.length === currentTarget.length && val === currentTarget) {
      typingSoundService.playCompletion();

      const finalDuration = startTime ? Math.max(1, (Date.now() - startTime) / 1000) : 1;
      const finalMistakes = mistakeIndicesRef.current.size;
      const finalAccuracy = Math.max(
        0,
        Math.round(((currentTarget.length - finalMistakes) / currentTarget.length) * 100)
      );
      const finalWpm = Math.max(1, Math.round((currentTarget.length / 5) / (finalDuration / 60)));

      setIsExerciseComplete(true);
      setExerciseAccuracy(finalAccuracy);
      setExerciseWpm(finalWpm);

      // Record result
      const newResult = {
        exerciseNumber: currentExercise.exerciseNumber,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        mistakes: finalMistakes,
        durationSeconds: finalDuration,
        completedAt: new Date().toISOString(),
      };

      const updatedResults = [
        ...progress.exerciseResults.filter(
          (r) => r.exerciseNumber !== currentExercise.exerciseNumber
        ),
        newResult,
      ];

      const newTotalChars = progress.totalCharactersTyped + currentTarget.length;
      const newTotalMistakes = progress.totalMistakes + finalMistakes;
      const avgAcc = Math.round(
        updatedResults.reduce((acc, r) => acc + r.accuracy, 0) / updatedResults.length
      );
      const bestWpm = Math.max(progress.bestWpm, finalWpm);

      const isLastExercise = currentExerciseIndex === dayData.exercises.length - 1;

      const updatedProgress: TouchTypingProgress = {
        ...progress,
        currentExerciseIndex: isLastExercise
          ? currentExerciseIndex
          : currentExerciseIndex + 1,
        completed: isLastExercise ? true : progress.completed,
        bestWpm,
        averageAccuracy: avgAcc,
        totalCharactersTyped: newTotalChars,
        totalMistakes: newTotalMistakes,
        exerciseResults: updatedResults,
        lastActiveAt: new Date().toISOString(),
      };

      setProgress(updatedProgress);
      saveTouchTypingProgress(updatedProgress);

      // Record in central progress service as subject 'typing'
      progressService.recordExerciseCompletion({
        subjectId: 'typing',
        exerciseId: `touch-day${dayData.day}-ex${currentExercise.exerciseNumber}`,
        exerciseTitle: `Day ${dayData.day} · Ex ${currentExercise.exerciseNumber}: ${currentTarget}`,
        unitId: `touch-day-${dayData.day}`,
        unitTitle: `Day ${dayData.day}: ${dayData.title}`,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        mistakes: finalMistakes,
        durationSeconds: finalDuration,
        nextExerciseId: isLastExercise
          ? undefined
          : `touch-day${dayData.day}-ex${currentExercise.exerciseNumber + 1}`,
        nextExerciseTitle: isLastExercise
          ? undefined
          : `Day ${dayData.day} · Ex ${currentExercise.exerciseNumber + 1}`,
      });

      if (isLastExercise) {
        setIsDayComplete(true);
      }
    }
  };

  // Advance to next exercise
  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < dayData.exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      const updated = {
        ...progress,
        currentExerciseIndex: nextIndex,
      };
      setProgress(updated);
      saveTouchTypingProgress(updated);
      resetCurrentExercise();
    } else {
      setIsDayComplete(true);
    }
  }, [currentExerciseIndex, dayData.exercises.length, progress, resetCurrentExercise]);

  // Restart Day 1 from exercise 1
  const handleRestartDay = () => {
    const freshProgress: TouchTypingProgress = {
      day: dayData.day,
      currentExerciseIndex: 0,
      completed: false,
      bestWpm: progress.bestWpm,
      averageAccuracy: 0,
      totalCharactersTyped: 0,
      totalMistakes: 0,
      exerciseResults: [],
      lastActiveAt: new Date().toISOString(),
      introSeen: true,
    };
    setProgress(freshProgress);
    saveTouchTypingProgress(freshProgress);
    setIsDayComplete(false);
    resetCurrentExercise();
  };

  // Keyboard shortcut listener for Enter on completion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showIntro) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleStartPractice();
        }
        return;
      }

      if (isDayComplete) {
        return;
      }

      if (isExerciseComplete) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleNextExercise();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIntro, isDayComplete, isExerciseComplete, handleNextExercise]);

  // Expected character right now (character at typedText.length)
  const expectedChar = useMemo(() => {
    if (typedText.length < targetText.length) {
      return targetText[typedText.length];
    }
    return null;
  }, [typedText, targetText]);

  // Virtual click from keyboard guide
  const handleVirtualKey = (char: string) => {
    if (isExerciseComplete || isDayComplete) return;
    const currentVal = typedText;
    if (currentVal.length < targetText.length) {
      const newVal = currentVal + char;
      if (inputRef.current) {
        inputRef.current.value = newVal;
      }
      handleInputChange({
        target: { value: newVal },
      } as React.ChangeEvent<HTMLInputElement>);
      focusInput();
    }
  };

  // Day 1 completion stats calculation
  const overallAccuracy = useMemo(() => {
    if (progress.exerciseResults.length === 0) return 100;
    return Math.round(
      progress.exerciseResults.reduce((sum, r) => sum + r.accuracy, 0) /
        progress.exerciseResults.length
    );
  }, [progress.exerciseResults]);

  const bestWpmOverall = useMemo(() => {
    if (progress.exerciseResults.length === 0) return exerciseWpm;
    return Math.max(...progress.exerciseResults.map((r) => r.wpm), exerciseWpm);
  }, [progress.exerciseResults, exerciseWpm]);

  // Accuracy rule text for Day 1
  const accuracyFeedback = useMemo(() => {
    if (typedText.length < 3) return null;
    if (exerciseAccuracy < 85 && mistakeCount >= 2) {
      return { text: 'Slow down — accuracy first.', type: 'warn' };
    }
    if (exerciseAccuracy >= 95 && typedText.length >= 4) {
      return { text: 'Nice rhythm.', type: 'good' };
    }
    return null;
  }, [typedText.length, exerciseAccuracy, mistakeCount]);

  return (
    <div
      id="touch-typing-focus-container"
      className="min-h-screen bg-[#0a0908] text-neutral-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-white"
    >
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 w-full border-b border-neutral-900/80 bg-[#0d0c0a]/90 backdrop-blur-md px-4 py-2.5 sm:py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button & Title */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="touch-typing-back-btn"
              onClick={handleExit}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
              title="Back to Typing Hub"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  DAY {dayData.day}
                </span>
                <span className="text-neutral-600 text-xs">·</span>
                <span className="text-xs font-medium text-neutral-200">
                  {dayData.title}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1 rounded-full">
            <span className="text-amber-400 font-bold">
              {currentExercise.exerciseNumber}
            </span>
            <span className="text-neutral-600">/</span>
            <span>{dayData.exercises.length}</span>
          </div>

          {/* Right Controls: Sound, Settings, Exit */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="touch-typing-sound-btn"
              onClick={handleToggleSound}
              className={`p-1.5 rounded-xl transition-colors ${
                soundEnabled
                  ? 'text-amber-400 hover:bg-amber-500/10'
                  : 'text-neutral-500 hover:bg-neutral-800/60'
              }`}
              title={soundEnabled ? 'Mute typing sound' : 'Enable typing sound'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button
              type="button"
              id="touch-typing-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </button>

            <button
              type="button"
              id="touch-typing-exit-btn"
              onClick={handleExit}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors ml-1"
              title="Exit Practice"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center items-center">
        {showIntro ? (
          /* F & J HOME POSITION INTRO */
          <HomeKeysIntro onStart={handleStartPractice} />
        ) : isDayComplete ? (
          /* DAY 1 COMPLETE SUMMARY */
          <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center py-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Award size={32} />
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
              Muscle Memory Check
            </span>
            <h1 className="text-3xl font-bold text-white mb-1">DAY 1 COMPLETE</h1>
            <h2 className="text-lg text-neutral-300 mb-4">{dayData.title}</h2>

            <div className="w-full bg-[#141210] border border-neutral-800 rounded-2xl p-5 mb-6">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">
                Keys Practiced
              </span>
              <div className="flex items-center justify-center gap-3 font-mono font-bold text-amber-300 text-lg mb-5">
                <span className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-xl">
                  A S D F
                </span>
                <span className="text-neutral-600">·</span>
                <span className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-xl">
                  J K L ;
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-neutral-800/80 pt-4">
                <div>
                  <span className="text-[11px] text-neutral-400 block">Accuracy</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {overallAccuracy}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block">Best WPM</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    {bestWpmOverall}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block">Characters</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {progress.totalCharactersTyped}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block">Mistakes</span>
                  <span className="text-xl font-bold text-neutral-300 font-mono">
                    {progress.totalMistakes}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
              <button
                type="button"
                id="continue-tomorrow-btn"
                onClick={handleExit}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue Tomorrow</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                id="practice-day-again-btn"
                onClick={handleRestartDay}
                className="w-full py-3 px-6 rounded-2xl bg-[#1a1714] hover:bg-[#24201c] border border-neutral-800 text-neutral-300 hover:text-white font-medium text-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw size={15} />
                <span>Practice Day 1 Again</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE TYPING PRACTICE VIEW */
          <div
            className="w-full flex flex-col items-center text-center cursor-text py-2 select-none"
            onClick={focusInput}
          >
            {/* MAIN LABEL */}
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                <span>⌨️ TYPE & PRACTICE</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {dayData.title}
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Practice: <span className="text-amber-300">a s d f</span> &nbsp;{' '}
                <span className="text-amber-300">j k l ;</span>
              </p>
            </div>

            {/* Hidden Input for Desktop + Mobile Keyboard (Gboard, iOS, etc.) */}
            <input
              ref={inputRef}
              type="text"
              id="touch-typing-hidden-input"
              value={typedText}
              onChange={handleInputChange}
              disabled={isExerciseComplete}
              autoFocus
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              className="fixed left-0 bottom-0 w-full h-12 opacity-0 text-base pointer-events-auto z-[-1]"
              aria-label="Type the touch typing target here"
            />

            {/* TYPING TARGET (Large, centered, monospace) */}
            <div className="w-full min-h-[90px] sm:min-h-[120px] flex items-center justify-center my-2 sm:my-4 px-2">
              <div className="font-mono font-medium text-center flex flex-wrap justify-center items-center text-[clamp(2.2rem,8vw,3.75rem)] leading-[1.3] break-all tracking-wider">
                {targetText.split('').map((char, index) => {
                  const isCurrent = index === typedText.length;
                  const isTyped = index < typedText.length;

                  let colorClass = 'text-neutral-600'; // untyped muted gray
                  let displayChar = char === ' ' ? '\u00A0' : char;

                  if (isTyped) {
                    if (typedText[index] === char) {
                      colorClass = 'text-white font-medium';
                      displayChar = typedText[index] === ' ' ? '\u00A0' : typedText[index];
                    } else {
                      colorClass = 'text-red-400 bg-red-950/70 rounded px-0.5 font-medium';
                      displayChar = typedText[index] === ' ' ? '\u00A0' : typedText[index];
                    }
                  }

                  return (
                    <span key={index} className="relative inline-block">
                      {/* Amber Caret */}
                      {isCurrent && !isExerciseComplete && (
                        <span
                          className="absolute -left-[2px] top-1 bottom-1 w-[2.5px] sm:w-[3.5px] bg-amber-400 animate-pulse rounded-full z-10 pointer-events-none"
                          title="Current position"
                        />
                      )}

                      <span className={`transition-colors duration-75 ${colorClass}`}>
                        {displayChar}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* LIVE METRICS (WPM, Accuracy & Day 1 Accuracy Rule) */}
            <div className="h-10 flex flex-col items-center justify-center my-1">
              <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                <span>
                  <strong className="text-neutral-200">{exerciseWpm}</strong> WPM
                </span>
                <span className="text-neutral-700">·</span>
                <span>
                  <strong
                    className={
                      exerciseAccuracy < 90 ? 'text-amber-400' : 'text-neutral-200'
                    }
                  >
                    {exerciseAccuracy}%
                  </strong>{' '}
                  Accuracy
                </span>
              </div>

              {/* Accuracy Feedback Rule Message */}
              {accuracyFeedback && !isExerciseComplete && (
                <div
                  className={`text-[11px] font-mono mt-0.5 animate-in fade-in duration-200 ${
                    accuracyFeedback.type === 'warn'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {accuracyFeedback.text}
                </div>
              )}
            </div>

            {/* DRILL COMPLETION TRANSITION / NEXT BUTTON */}
            {isExerciseComplete ? (
              <div className="w-full max-w-sm mx-auto my-3 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                    <Check size={14} className="text-emerald-400" />
                    Exercise complete
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Accuracy: <strong className="text-white">{exerciseAccuracy}%</strong> · WPM: <strong className="text-white">{exerciseWpm}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="next-touch-exercise-btn"
                    onClick={handleNextExercise}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {currentExerciseIndex === dayData.exercises.length - 1
                        ? 'Finish Day 1'
                        : 'Next →'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={resetCurrentExercise}
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                    title="Retry this drill"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* KEYBOARD GUIDE (A S D F  J K L ;) */
              <div className="w-full mt-2 sm:mt-3">
                <TypingGuideKeyboard
                  nextChar={expectedChar}
                  allowedKeys={dayData.allowedKeys}
                  onKeyClick={handleVirtualKey}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-neutral-900/80 bg-[#0d0c0a]/60 px-4 py-2.5 text-center text-[11px] text-neutral-500 font-mono">
        {!showIntro && !isDayComplete ? (
          <span>
            Touch type without looking down · Keys: <span className="text-amber-400/80">a s d f j k l ;</span>
          </span>
        ) : (
          <span>MY LEARNING · Touch Typing Muscle Memory</span>
        )}
      </footer>

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
