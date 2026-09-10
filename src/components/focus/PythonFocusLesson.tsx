import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, X, Settings, Volume2, VolumeX } from 'lucide-react';
import { PythonLogoIcon } from '../common/FlagIcons';
import { PYTHON_UNITS, PythonCourseUnit, PythonExerciseItem } from '../../data/pythonUnits';
import { useTypingEngine } from '../../hooks/useTypingEngine';
import { TypingText } from './TypingText';
import { PythonVariablesLessonEngine } from './interactive/PythonVariablesLessonEngine';
import { storageService } from '../../services/storage';
import { progressService } from '../../services/progress';
import { reviewService } from '../../services/reviewService';
import { typingSoundService } from '../../services/typingSoundService';

interface PythonFocusLessonProps {
  exercise: PythonExerciseItem;
  parentUnit?: PythonCourseUnit;
  allExercises?: PythonExerciseItem[];
  onExit: () => void;
  onComplete?: () => void;
}

export function PythonFocusLesson({
  exercise: initialExercise,
  parentUnit: propParentUnit,
  allExercises,
  onExit,
  onComplete,
}: PythonFocusLessonProps) {
  // If the exercise is the experimental Variables lesson, use PythonVariablesLessonEngine
  if (
    initialExercise.id === 'py-variables' ||
    initialExercise.id === 'py-b1-u02-ex5' ||
    initialExercise.id.includes('variables')
  ) {
    return (
      <PythonVariablesLessonEngine
        onExit={onExit}
        onComplete={onComplete}
      />
    );
  }

  // Identify parent unit and exercises list
  const parentUnit =
    propParentUnit ||
    PYTHON_UNITS.find((u) => u.exercises.some((e) => e.id === initialExercise.id));
  const exerciseList = allExercises || parentUnit?.exercises || [initialExercise];

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const idx = exerciseList.findIndex((e) => e.id === initialExercise.id);
    return idx >= 0 ? idx : 0;
  });

  const currentExercise = exerciseList[currentIndex] || initialExercise;
  const totalExercises = exerciseList.length;

  const [isSessionCompleted, setIsSessionCompleted] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [typingSoundEnabled, setTypingSoundEnabled] = useState<boolean>(() => {
    return storageService.getSettings().soundEnabled ?? true;
  });
  const [typingSoundVolume, setTypingSoundVolume] = useState<number>(() => {
    return storageService.getSettings().typingSoundVolume ?? 0.4;
  });

  const handleToggleTypingSound = (enabled: boolean) => {
    setTypingSoundEnabled(enabled);
    const settings = storageService.getSettings();
    const updated = { ...settings, soundEnabled: enabled };
    storageService.saveSettings(updated);
    typingSoundService.setEnabled(enabled);
    if (enabled) {
      typingSoundService.playCorrectKey();
    }
  };

  const handleTypingVolumeChange = (vol: number) => {
    setTypingSoundVolume(vol);
    const settings = storageService.getSettings();
    const updated = { ...settings, typingSoundVolume: vol };
    storageService.saveSettings(updated);
    typingSoundService.setVolume(vol);
  };

  const [accumulatedMistakes, setAccumulatedMistakes] = useState<number>(0);
  const [accumulatedChars, setAccumulatedChars] = useState<number>(0);
  const [sessionStartTime] = useState<number>(() => Date.now());

  // Track last position whenever current exercise changes
  useEffect(() => {
    progressService.updateLastPosition({
      subjectId: 'python',
      unitId: parentUnit?.id,
      unitTitle: parentUnit?.title,
      exerciseId: currentExercise.id,
      exerciseTitle: `${currentExercise.title} · ${currentExercise.mode}`,
      stage: 'code_typing',
      sentenceIndex: currentIndex,
    });
  }, [currentExercise.id, currentExercise.title, currentExercise.mode, currentIndex, parentUnit?.id, parentUnit?.title]);

  // Proven useTypingEngine hook
  const {
    typedText,
    characters,
    handleInputChange,
    resetTyping,
    focusInput,
    inputRef,
    isCompleted,
  } = useTypingEngine({
    targetText: currentExercise.contentToType,
    language: 'python',
    isCode: true,
    onComplete: (sessionStats) => {
      setAccumulatedMistakes((prev) => prev + sessionStats.mistakes);
      setAccumulatedChars((prev) => prev + sessionStats.totalChars);

      const nextEx = exerciseList[currentIndex + 1];
      const exElapsed = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      const exChars = Math.max(1, sessionStats.totalChars || currentExercise.contentToType.length);
      const exAcc = Math.max(0, Math.min(100, Math.round(((exChars - sessionStats.mistakes) / exChars) * 100)));
      const exWpm = Math.max(1, Math.round((exChars / 5) / (exElapsed / 60)));

      progressService.recordExerciseCompletion({
        subjectId: 'python',
        exerciseId: currentExercise.id,
        exerciseTitle: currentExercise.title,
        unitId: parentUnit?.id,
        unitTitle: parentUnit?.title,
        wpm: exWpm,
        accuracy: exAcc,
        mistakes: sessionStats.mistakes,
        durationSeconds: exElapsed,
        nextExerciseId: nextEx?.id,
        nextExerciseTitle: nextEx?.title,
      });

      if (sessionStats.mistakes > 0) {
        reviewService.recordPythonMistake({
          exerciseId: currentExercise.id,
          exerciseTitle: currentExercise.title,
          conceptPrompt: currentExercise.prompt,
          contentToType: currentExercise.contentToType,
          unitId: parentUnit?.id,
          unitTitle: parentUnit?.title,
          explanation: currentExercise.explanation,
          mistakesCount: sessionStats.mistakes,
        });
      }

      if (currentIndex + 1 >= totalExercises) {
        setIsSessionCompleted(true);
        onComplete?.();
      }
    },
    disabled: isSessionCompleted,
  });

  // Focus input automatically on mount and whenever current exercise changes
  useEffect(() => {
    resetTyping();
    requestAnimationFrame(() => {
      focusInput();
    });
  }, [currentIndex, resetTyping, focusInput]);

  // Click anywhere on container to keep typing focus
  const handleContainerClick = useCallback(() => {
    focusInput();
  }, [focusInput]);

  // Advance to next exercise
  const handleNext = useCallback(() => {
    if (currentIndex + 1 < totalExercises) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onExit();
    }
  }, [currentIndex, totalExercises, onExit]);

  // Repeat current exercise
  const handleRepeat = useCallback(() => {
    resetTyping();
    requestAnimationFrame(() => {
      focusInput();
    });
  }, [resetTyping, focusInput]);

  // Keyboard navigation: ESC to exit, Enter to proceed when complete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      } else if (e.key === 'Enter' && (isCompleted || isSessionCompleted)) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, isSessionCompleted, onExit, handleNext]);

  // Metrics calculation
  const totalElapsedSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
  const totalCharsFinal = Math.max(1, accumulatedChars || currentExercise.contentToType.length);
  const finalAccuracy = Math.max(
    0,
    Math.min(100, Math.round(((totalCharsFinal - accumulatedMistakes) / totalCharsFinal) * 100))
  );
  const finalWpm = Math.max(1, Math.round((totalCharsFinal / 5) / (totalElapsedSeconds / 60)));

  return (
    <div
      id="fullscreen-focus-mode"
      className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-[100dvh] w-full max-w-full selection:bg-amber-500/30 selection:text-white"
      onClick={handleContainerClick}
    >
      {/* Top Header - exact same dimensions, layout, and spacing as English/Swedish */}
      <header className="relative w-full border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-sm z-30 select-none">
        <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2">
          {/* Left: Brand + Python Icon + "Python" */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <button
              type="button"
              id="python-focus-exit-brand-btn"
              onClick={onExit}
              className="hidden sm:inline-block text-xs font-semibold tracking-wider text-neutral-400 hover:text-white uppercase transition-colors shrink-0"
            >
              My Learning
            </button>
            <span className="hidden sm:inline-block text-neutral-700 text-xs shrink-0">•</span>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-200 truncate">
              <PythonLogoIcon size={20} className="!rounded-md !p-0.5 !border-0 !bg-transparent shrink-0" />
              <span className="font-semibold text-neutral-300">Python</span>
              {parentUnit && (
                <span className="hidden md:inline-block text-neutral-500 font-normal truncate">
                  · {parentUnit.title}
                </span>
              )}
            </div>
          </div>

          {/* Center: Progress counter e.g. "1 / 4" */}
          <div className="flex items-center justify-center shrink-0 px-2 py-0.5 rounded-full bg-neutral-900/80 border border-neutral-800/80 text-[11px] sm:text-xs font-mono text-neutral-400">
            <span className="text-amber-400 font-semibold mr-0.5">{currentIndex + 1}</span>
            <span className="text-neutral-600">/</span>
            <span className="ml-0.5">{totalExercises}</span>
          </div>

          {/* Right: Settings & Exit (ESC / X) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Typing Sound Settings Toggle */}
            <div className="relative">
              <button
                type="button"
                id="python-focus-settings-toggle-btn"
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg border text-neutral-400 hover:text-white transition-all ${
                  showSettings
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800'
                }`}
                title="Typing sound settings"
                aria-label="Settings"
              >
                <Settings size={15} />
              </button>

              {/* Compact Settings Dropdown */}
              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] p-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                    <span className="font-semibold text-neutral-200">Typing Settings</span>
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="text-neutral-500 hover:text-white p-0.5"
                      aria-label="Close"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Typing Sounds Feedback */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-200 font-medium">Typing Sounds</span>
                      <button
                        type="button"
                        id="python-typing-sound-toggle-btn"
                        onClick={() => handleToggleTypingSound(!typingSoundEnabled)}
                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                          typingSoundEnabled ? 'bg-amber-500' : 'bg-neutral-800'
                        }`}
                        aria-label="Toggle typing sound"
                      >
                        <span
                          className={`inline-block h-2.5 w-2.5 transform rounded-full bg-neutral-950 transition-transform ${
                            typingSoundEnabled ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className={`space-y-1 transition-opacity ${typingSoundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Volume</span>
                        <span className="font-mono text-amber-400 font-semibold">{Math.round(typingSoundVolume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <VolumeX className="w-3 h-3 text-neutral-500 shrink-0" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={typingSoundVolume}
                          onChange={(e) => handleTypingVolumeChange(parseFloat(e.target.value))}
                          onMouseUp={() => typingSoundService.playCorrectKey()}
                          onTouchEnd={() => typingSoundService.playCorrectKey()}
                          className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          aria-label="Typing sound volume"
                        />
                        <Volume2 className="w-3 h-3 text-neutral-400 shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              id="focus-exit-esc-btn"
              onClick={onExit}
              className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-xs font-mono shrink-0"
              title="Exit Focus Mode (ESC)"
              aria-label="Exit lesson"
            >
              <span className="hidden sm:inline">ESC</span>
              <X size={15} className="sm:hidden" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Focus Area: Center vertically and horizontally */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-8 w-full max-w-4xl mx-auto">
        {!isCompleted && !isSessionCompleted ? (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
            {/* Small label */}
            <div className="text-[11px] sm:text-xs uppercase tracking-widest text-neutral-500 mb-2 font-mono text-center">
              TYPE & LEARN
            </div>

            {/* The sentence itself IS the typing interface */}
            <TypingText
              characters={characters}
              typedLength={typedText.length}
              inputRef={inputRef}
              onInputChange={handleInputChange}
              typedValue={typedText}
              onContainerClick={focusInput}
              isCode={true}
            />

            {/* Optional subtle context underneath, like the translation in English/Swedish */}
            {currentExercise.explanation && (
              <div className="text-xs sm:text-sm text-neutral-500 font-sans mt-2 sm:mt-3 text-center select-none px-2 max-w-lg break-words">
                {currentExercise.explanation}
              </div>
            )}
          </div>
        ) : !isSessionCompleted ? (
          /* Interim Exercise Complete state */
          <div className="w-full max-w-xl mx-auto px-4 py-8 select-none text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
              <CheckCircle2 size={24} />
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Exercise Complete!
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              {currentExercise.title} · {currentExercise.mode}
            </p>

            {/* Subtle takeaway */}
            {currentExercise.explanation && (
              <div className="my-6 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-left text-xs text-neutral-300 leading-relaxed">
                <span className="text-amber-400 font-mono font-medium block mb-1">Key Takeaway:</span>
                {currentExercise.explanation}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                id="focus-repeat-exercise-btn"
                onClick={handleRepeat}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 text-sm font-medium transition-colors"
              >
                <RotateCcw size={16} />
                <span>Repeat</span>
              </button>

              <button
                type="button"
                id="focus-next-exercise-btn"
                onClick={handleNext}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 text-sm font-semibold transition-colors shadow-lg shadow-amber-500/10"
              >
                <span>Next Exercise</span>
                <span className="hidden sm:inline text-xs opacity-75 font-mono">(Enter)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Final Session Complete Results */
          <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 select-none text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
              <CheckCircle2 size={24} />
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Unit Complete
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              {parentUnit ? parentUnit.title : currentExercise.title}
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                <div className="text-xs text-neutral-400 mb-1">Accuracy</div>
                <div className="text-2xl font-mono font-semibold text-white">
                  {finalAccuracy}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                <div className="text-xs text-neutral-400 mb-1">Typing Speed</div>
                <div className="text-2xl font-mono font-semibold text-amber-400">
                  {finalWpm} <span className="text-xs font-normal text-neutral-400">WPM</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                <div className="text-xs text-neutral-400 mb-1">Mistakes</div>
                <div className="text-2xl font-mono font-semibold text-neutral-200">
                  {accumulatedMistakes}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                <div className="text-xs text-neutral-400 mb-1">Time</div>
                <div className="text-2xl font-mono font-semibold text-neutral-200">
                  {totalElapsedSeconds}s
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                id="focus-repeat-unit-btn"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsSessionCompleted(false);
                  resetTyping();
                  focusInput();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 text-sm font-medium transition-colors"
              >
                <RotateCcw size={16} />
                <span>Repeat Unit</span>
              </button>

              <button
                type="button"
                id="focus-finish-course-btn"
                onClick={onExit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-sm font-semibold transition-colors shadow-lg"
              >
                <span>Back to Course</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Ultra-minimal bottom footer */}
      <footer className="w-full py-2 px-3 sm:px-4 border-t border-neutral-900/60 flex items-center justify-between text-[11px] text-neutral-600 font-mono select-none">
        <div className="hidden sm:flex items-center gap-4">
          <span>Esc to exit</span>
        </div>
        <div className="mx-auto sm:mx-0 text-center truncate">
          I learn by typing · Python
        </div>
        <div className="hidden sm:block">
          Python
        </div>
      </footer>
    </div>
  );
}
