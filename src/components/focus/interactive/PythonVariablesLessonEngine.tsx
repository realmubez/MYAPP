import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CornerDownLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Check,
  Terminal,
  AlertTriangle,
  Code,
  Volume2,
  VolumeX,
  X,
  Languages,
} from 'lucide-react';
import {
  PYTHON_VARIABLES_STEPS,
  PythonInteractiveStep,
  PythonDrillItem,
} from '../../../data/courses/python/variablesLesson';
import { useTypingEngine, TypingSessionStats } from '../../../hooks/useTypingEngine';
import { TypingText } from '../TypingText';
import { storageService } from '../../../services/storage';
import { progressService } from '../../../services/progress';
import { reviewService } from '../../../services/reviewService';
import { typingSoundService } from '../../../services/typingSoundService';
import {
  translationService,
  PythonSupportLang,
  MultiLangTranslation,
} from '../../../services/translationPreference';
import { getTTSUrl } from '../../../services/tts';
import { PythonLogoIcon } from '../../common/FlagIcons';
import { motion, AnimatePresence } from 'motion/react';

interface PythonVariablesLessonEngineProps {
  onExit?: () => void;
  onComplete?: () => void;
}

export function PythonVariablesLessonEngine({
  onExit,
  onComplete,
}: PythonVariablesLessonEngineProps) {
  const navigate = useNavigate();

  // Step and drill state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [isDrillCompleted, setIsDrillCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [skippedDrills, setSkippedDrills] = useState<Set<string>>(new Set());

  // Translation support language preference ('en' | 'so' | 'sv' | 'off')
  const [supportLang, setSupportLang] = useState<PythonSupportLang>(() =>
    translationService.getPythonLanguage()
  );

  const handleSupportLangChange = (lang: PythonSupportLang) => {
    setSupportLang(lang);
    translationService.setPythonLanguage(lang);
  };

  // Sound settings
  const [typingSoundEnabled, setTypingSoundEnabled] = useState<boolean>(() => {
    return storageService.getSettings().soundEnabled ?? true;
  });

  const handleToggleTypingSound = (enabled: boolean) => {
    setTypingSoundEnabled(enabled);
    const settings = storageService.getSettings();
    storageService.saveSettings({ ...settings, soundEnabled: enabled });
    typingSoundService.setEnabled(enabled);
    if (enabled) {
      typingSoundService.playCorrectKey();
    }
  };

  // TTS playback state & controller
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const stopAudio = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioRef.current) {
      try {
        const audio = audioRef.current;
        audio.oncanplay = null;
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // Safe to ignore
      }
      audioRef.current = null;
    }
    setPlayingKey(null);
  }, []);

  const playTTS = useCallback(
    async (key: string, content: MultiLangTranslation | string | undefined) => {
      if (!content) return;
      if (playingKey === key) {
        stopAudio();
        return;
      }

      const ttsData = translationService.getPythonTTSText(content, supportLang);
      if (!ttsData || !ttsData.text.trim()) return;

      stopAudio();
      setPlayingKey(key);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const targetUrl = getTTSUrl({
        text: ttsData.text,
        voice: ttsData.voice,
        rate: '0%',
      });

      try {
        let resolvedSrc = targetUrl;
        try {
          const res = await fetch(targetUrl, { signal: abortController.signal });
          if (res.ok) {
            const blob = await res.blob();
            if (blob.size > 0) {
              resolvedSrc = URL.createObjectURL(blob);
            }
          }
        } catch {
          if (abortController.signal.aborted) return;
        }

        if (abortController.signal.aborted) return;

        const audio = new Audio();
        audio.src = resolvedSrc;
        audio.volume = 1;
        audioRef.current = audio;

        audio.onended = () => {
          setPlayingKey(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setPlayingKey(null);
          audioRef.current = null;
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setPlayingKey(null);
          });
        }
      } catch {
        setPlayingKey(null);
      }
    },
    [playingKey, stopAudio, supportLang]
  );

  // Stop audio on unmount or navigation
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Metrics accumulators
  const [accumulatedMistakes, setAccumulatedMistakes] = useState(0);
  const [accumulatedChars, setAccumulatedChars] = useState(0);
  const [wpmSamples, setWpmSamples] = useState<number[]>([]);
  const [accuracySamples, setAccuracySamples] = useState<number[]>([]);
  const [lessonStartTime] = useState<number>(() => Date.now());

  const currentStep: PythonInteractiveStep =
    PYTHON_VARIABLES_STEPS[currentStepIndex] || PYTHON_VARIABLES_STEPS[0];
  const totalSteps = PYTHON_VARIABLES_STEPS.length;
  const currentDrill: PythonDrillItem =
    currentStep?.drills[currentDrillIndex] || currentStep?.drills[0];

  // Track position in progressService
  useEffect(() => {
    progressService.updateLastPosition({
      subjectId: 'python',
      unitId: 'py-b1-u02',
      unitTitle: 'Variables & Storing Data',
      exerciseId: 'py-variables',
      exerciseTitle: `Variables · Step ${currentStep.stepNumber}`,
      stage: 'code_typing',
      sentenceIndex: currentStepIndex,
    });
  }, [currentStepIndex, currentStep.stepNumber]);

  // Handle drill completion
  const handleTypingComplete = useCallback(
    (stats: TypingSessionStats) => {
      setIsDrillCompleted(true);
      setAccumulatedMistakes((prev) => prev + stats.mistakes);
      setAccumulatedChars((prev) => prev + stats.totalChars);
      if (stats.wpm > 0) {
        setWpmSamples((prev) => [...prev, stats.wpm]);
      }
      if (stats.accuracy >= 0) {
        setAccuracySamples((prev) => [...prev, stats.accuracy]);
      }

      // Record any mistakes to reviewService
      if (stats.mistakes > 0 && currentDrill?.targetCode) {
        const promptText =
          typeof currentDrill.prompt === 'string'
            ? currentDrill.prompt
            : currentDrill.prompt?.en || 'Variable assignment';

        reviewService.recordPythonMistake({
          exerciseId: `py-var-${currentStep.stepNumber}-${currentDrill.id}`,
          exerciseTitle: `Variables · Step ${currentStep.stepNumber}`,
          conceptPrompt: promptText,
          contentToType: currentDrill.targetCode,
          unitId: 'py-b1-u02',
          unitTitle: 'Variables & Storing Data',
          mistakesCount: stats.mistakes,
        });
      }
    },
    [currentDrill, currentStep]
  );

  const {
    typedText,
    characters,
    handleInputChange,
    resetTyping,
    focusInput,
    inputRef,
  } = useTypingEngine({
    targetText: currentDrill?.targetCode || '',
    language: 'en',
    isCode: true,
    onComplete: handleTypingComplete,
    disabled: isDrillCompleted,
    sentenceContext: currentDrill
      ? {
          text: currentDrill.targetCode,
          lessonId: 'py-variables',
        }
      : undefined,
  });

  // Reset state on step / drill transition
  useEffect(() => {
    stopAudio();
    setIsDrillCompleted(false);
    setShowHint(false);
    resetTyping();
    requestAnimationFrame(() => {
      focusInput();
    });
  }, [currentStepIndex, currentDrillIndex, resetTyping, focusInput, stopAudio]);

  // Advance to next drill or next step
  const handleAdvance = useCallback(() => {
    stopAudio();
    if (currentDrillIndex + 1 < currentStep.drills.length) {
      setCurrentDrillIndex((prev) => prev + 1);
    } else if (currentStepIndex + 1 < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentDrillIndex(0);
    } else {
      setIsLessonCompleted(true);
    }
  }, [currentDrillIndex, currentStep, currentStepIndex, totalSteps, stopAudio]);

  // Skip current drill or step without counting as correct
  const handleSkip = useCallback(() => {
    stopAudio();
    const drillKey = `${currentStep.stepNumber}-${currentDrill.id}`;
    setSkippedDrills((prev) => new Set(prev).add(drillKey));

    // For interactive steps, register in reviewService for future practice (without marking mastered)
    if (currentStep.stepType !== 'concept' && currentDrill?.targetCode) {
      const promptText =
        typeof currentDrill.prompt === 'string'
          ? currentDrill.prompt
          : currentDrill.prompt?.en || 'Variable assignment';

      reviewService.recordPythonMistake({
        exerciseId: `py-var-${currentStep.stepNumber}-${currentDrill.id}`,
        exerciseTitle: `Variables · Step ${currentStep.stepNumber} (Skipped)`,
        conceptPrompt: promptText,
        contentToType: currentDrill.targetCode,
        unitId: 'py-b1-u02',
        unitTitle: 'Variables & Storing Data',
        mistakesCount: 1,
      });
    }

    // Advance immediately without revealing the answer
    if (currentDrillIndex + 1 < currentStep.drills.length) {
      setCurrentDrillIndex((prev) => prev + 1);
    } else if (currentStepIndex + 1 < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentDrillIndex(0);
    } else {
      setIsLessonCompleted(true);
    }
  }, [currentDrill, currentStep, currentDrillIndex, currentStepIndex, totalSteps, stopAudio]);

  // Keybindings: Enter to advance (when typing finished), Tab for hint, Alt+S to skip, Escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        stopAudio();
        if (onExit) onExit();
        navigate('/python');
      } else if (e.key === 'Tab' && currentDrill?.isRecallMode && !isDrillCompleted) {
        e.preventDefault();
        setShowHint((prev) => !prev);
      } else if (e.altKey && (e.key === 's' || e.key === 'S') && !isDrillCompleted) {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'Enter' && isDrillCompleted) {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrillCompleted, currentDrill, handleAdvance, handleSkip, onExit, navigate, stopAudio]);

  // Restart lesson
  const handleRestart = useCallback(() => {
    stopAudio();
    setCurrentStepIndex(0);
    setCurrentDrillIndex(0);
    setIsLessonCompleted(false);
    setIsDrillCompleted(false);
    setSkippedDrills(new Set());
    setAccumulatedMistakes(0);
    setAccumulatedChars(0);
    setWpmSamples([]);
    setAccuracySamples([]);
    resetTyping();
  }, [resetTyping, stopAudio]);

  const handleExit = useCallback(() => {
    stopAudio();
    if (onExit) onExit();
    navigate('/python');
  }, [onExit, navigate, stopAudio]);

  // Final statistics calculation
  const totalElapsedSeconds = Math.max(1, Math.round((Date.now() - lessonStartTime) / 1000));
  const avgWpm =
    wpmSamples.length > 0
      ? Math.round(wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length)
      : Math.max(30, Math.round((accumulatedChars / 5) / (totalElapsedSeconds / 60)));
  const avgAccuracy =
    accuracySamples.length > 0
      ? Math.round(accuracySamples.reduce((a, b) => a + b, 0) / accuracySamples.length)
      : Math.max(88, 100 - accumulatedMistakes * 2);

  // Save lesson completion on finish
  const hasRecordedRef = useRef(false);
  useEffect(() => {
    if (isLessonCompleted && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      progressService.recordExerciseCompletion({
        subjectId: 'python',
        exerciseId: 'py-variables',
        exerciseTitle: 'Variables · Python Beginner 1',
        wpm: avgWpm,
        accuracy: avgAccuracy,
        mistakes: accumulatedMistakes,
        durationSeconds: totalElapsedSeconds,
        difficultWords: [],
      });

      if (onComplete) {
        onComplete();
      }
    }
  }, [
    isLessonCompleted,
    avgWpm,
    avgAccuracy,
    accumulatedMistakes,
    totalElapsedSeconds,
    onComplete,
  ]);

  // Helper symbol buttons for mobile keyboard
  const insertSymbol = (sym: string) => {
    if (!inputRef.current || isDrillCompleted) return;
    const input = inputRef.current;
    const start = input.selectionStart || typedText.length;
    const end = input.selectionEnd || typedText.length;
    const nextVal = typedText.substring(0, start) + sym + typedText.substring(end);
    handleInputChange(nextVal);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + sym.length, start + sym.length);
    }, 10);
  };

  // Helper strings for display
  const titleText = translationService.getPythonText(currentStep.title, supportLang);
  const contextNoteText = translationService.getPythonText(currentStep.contextNote, supportLang);
  const promptText = translationService.getPythonText(currentDrill.prompt, supportLang);
  const hintTextResolved =
    typeof currentDrill.hint === 'string'
      ? currentDrill.hint
      : currentDrill.hint?.en || currentDrill.targetCode.slice(0, 8) + '...';

  return (
    <div
      id="fullscreen-python-focus"
      className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-[100dvh] w-full max-w-full selection:bg-amber-500/30 selection:text-white"
    >
      {/* Top Header */}
      <header className="w-full border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between z-10 sticky top-0 min-h-[44px] sm:min-h-[48px]">
        {/* Left: Close button + Python Icon + Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 mr-2">
          <button
            type="button"
            id="py-var-exit-btn"
            onClick={handleExit}
            className="p-1.5 -ml-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer shrink-0 touch-manipulation"
            title="Exit (Esc)"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 flex items-center justify-center">
              <PythonLogoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-tight truncate">
                Variables
              </span>
              <span className="hidden md:inline text-neutral-600 font-normal">·</span>
              <span className="hidden md:inline text-amber-400 text-xs font-mono truncate">
                Python Beginner 1
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Controls: Language Selector & Audio */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Explanation Language Selector */}
          <div className="relative flex items-center bg-neutral-900/90 border border-neutral-800 rounded-lg px-2 sm:px-2.5 py-1 text-xs shrink-0 hover:border-neutral-700 transition-colors">
            <Languages size={13} className="text-amber-400 shrink-0 mr-1 hidden sm:inline" />
            <span className="text-[11px] text-neutral-400 hidden md:inline select-none mr-1.5">
              Explanation:
            </span>
            {/* Mobile compact label: EN / SO / SV / OFF */}
            <span className="text-amber-400 font-semibold text-xs uppercase font-mono tracking-wider sm:hidden">
              {supportLang === 'off' ? 'OFF' : supportLang.toUpperCase()}
            </span>
            {/* Desktop label: Full name */}
            <span className="text-amber-400 font-medium text-xs hidden sm:inline font-sans">
              {supportLang === 'en'
                ? 'English'
                : supportLang === 'so'
                ? 'Somali'
                : supportLang === 'sv'
                ? 'Swedish'
                : 'Off'}
            </span>
            <span className="text-neutral-400 text-[10px] ml-1 pointer-events-none">▾</span>
            <select
              id="py-var-lang-select"
              value={supportLang}
              onChange={(e) => handleSupportLangChange(e.target.value as PythonSupportLang)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Select explanation language (Code is always Python)"
            >
              <option value="en" className="bg-neutral-900 text-neutral-100">
                English
              </option>
              <option value="so" className="bg-neutral-900 text-neutral-100">
                Somali (Af-Soomaali)
              </option>
              <option value="sv" className="bg-neutral-900 text-neutral-100">
                Swedish (Svenska)
              </option>
              <option value="off" className="bg-neutral-900 text-neutral-100">
                Off
              </option>
            </select>
          </div>

          {/* Typing Sound Toggle */}
          <button
            type="button"
            onClick={() => handleToggleTypingSound(!typingSoundEnabled)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              typingSoundEnabled
                ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
            }`}
            title={typingSoundEnabled ? 'Mute typing sounds' : 'Enable typing sounds'}
          >
            {typingSoundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </header>

      {/* Step Progress Bar & Step Row */}
      {!isLessonCompleted && (
        <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pt-2 sm:pt-3 flex flex-col gap-1.5 sm:gap-2">
          {/* ROW 2: Step number (Left) + Title (Right) on SAME horizontal line */}
          <div className="flex items-center justify-between text-xs font-mono gap-2 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-amber-400 font-semibold uppercase tracking-wider text-[11px] sm:text-xs">
                STEP {currentStep.stepNumber} OF {totalSteps}
              </span>
              {currentStep.drills.length > 1 && (
                <span className="text-neutral-500 text-[10px] sm:text-[11px]">
                  ({currentDrillIndex + 1}/{currentStep.drills.length})
                </span>
              )}
            </div>
            <div className="text-neutral-400 text-[11px] sm:text-xs font-mono truncate text-right min-w-0 flex-1">
              {titleText?.en}
            </div>
          </div>

          {/* ROW 3: Progress Bar */}
          <div className="w-full h-1 sm:h-1.5 bg-neutral-900 rounded-full overflow-hidden flex gap-0.5">
            {PYTHON_VARIABLES_STEPS.map((step, idx) => (
              <div
                key={step.stepNumber}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  idx < currentStepIndex
                    ? 'bg-amber-500'
                    : idx === currentStepIndex
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Focus & Code Typing Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 pt-2.5 sm:pt-5 pb-4 sm:pb-6 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!isLessonCompleted ? (
            <motion.div
              key={`${currentStep.stepNumber}-${currentDrill.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Badge Label */}
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Code size={12} />
                  <span>{currentStep.badgeLabel}</span>
                </span>
              </div>

              {/* Context Note / Core Concept (with TTS speaker & multi-language translation support) */}
              {contextNoteText && (
                <div className="w-full max-w-xl mx-auto mb-2.5 sm:mb-4 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-neutral-900/80 border border-neutral-800/90 text-left">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans whitespace-pre-line">
                        {contextNoteText.en}
                      </div>
                      {contextNoteText.translated && (
                        <div className="text-xs text-neutral-400 mt-1 sm:mt-1.5 font-sans leading-relaxed border-t border-neutral-800/60 pt-1 sm:pt-1.5">
                          {contextNoteText.translated}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => playTTS('context-note', currentStep.contextNote)}
                      className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                        playingKey === 'context-note'
                          ? 'text-amber-400 bg-amber-500/20 animate-pulse'
                          : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
                      }`}
                      title="Listen to explanation (Edge TTS)"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Visual Breakdown (Step 1) */}
              {currentDrill.visualBreakdown && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full max-w-xl mb-2.5 sm:mb-4 text-left">
                  {currentDrill.visualBreakdown.map((item) => {
                    const locDesc = translationService.getPythonText(item.description, supportLang);
                    return (
                      <div
                        key={item.label}
                        className="p-2.5 sm:p-3 rounded-xl bg-neutral-900/90 border border-neutral-800"
                      >
                        <div className="font-mono text-sm font-bold text-amber-400">
                          {item.label}
                        </div>
                        {locDesc && (
                          <>
                            <div className="text-[11px] text-neutral-300 mt-0.5">
                              {locDesc.en}
                            </div>
                            {locDesc.translated && (
                              <div className="text-[10px] text-neutral-400 mt-0.5 border-t border-neutral-800/50 pt-0.5">
                                {locDesc.translated}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Code Context / Reference Snippet */}
              {currentDrill.codeContext && (
                <div className="w-full max-w-xl mb-3 text-left">
                  <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1 px-1">
                    Python Code:
                  </div>
                  <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 font-mono text-sm sm:text-base text-amber-200/90 whitespace-pre-line shadow-inner">
                    {currentDrill.codeContext}
                  </div>
                </div>
              )}

              {/* Broken Code Box for Debugging (Steps 15, 16, 17) */}
              {currentDrill.brokenCode && (
                <div className="w-full max-w-xl mb-3 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-400 uppercase tracking-wider mb-1 px-1">
                    <AlertTriangle size={12} />
                    <span>Broken Code (Needs Fix):</span>
                  </div>
                  <div className="rounded-xl bg-red-950/20 border border-red-900/40 p-3.5 font-mono text-sm sm:text-base text-red-200 whitespace-pre-line">
                    {currentDrill.brokenCode}
                  </div>
                </div>
              )}

              {/* Drill Prompt / Instruction / Question (with TTS speaker & translation) */}
              {promptText && (
                <div className="w-full max-w-xl mx-auto mb-2 flex items-center justify-center gap-2">
                  <div className="text-xs sm:text-sm font-mono text-neutral-300 text-center">
                    <div>{promptText.en}</div>
                    {promptText.translated && (
                      <div className="text-xs text-neutral-400 mt-0.5 font-sans">
                        {promptText.translated}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => playTTS(`prompt-${currentDrill.id}`, currentDrill.prompt)}
                    className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                      playingKey === `prompt-${currentDrill.id}`
                        ? 'text-amber-400 bg-amber-500/20 animate-pulse'
                        : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
                    }`}
                    title="Listen to instruction (Edge TTS)"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              )}

              {/* Core Code Typing Area (TypingText with Python multiline support) */}
              <div
                className="w-full flex flex-col items-center justify-center min-h-[140px] cursor-text my-2"
                onClick={focusInput}
              >
                <TypingText
                  characters={characters}
                  typedLength={typedText.length}
                  inputRef={inputRef}
                  onInputChange={handleInputChange}
                  typedValue={typedText}
                  isRecallMode={currentDrill.isRecallMode && !isDrillCompleted}
                  showHint={showHint || isDrillCompleted}
                  hintText={hintTextResolved}
                  disabled={isDrillCompleted}
                  isCode={true}
                  onContainerClick={focusInput}
                />
              </div>

              {/* Simulated Terminal Output upon Completion (e.g. print output) */}
              {isDrillCompleted && currentDrill.expectedOutput && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-xl mt-3 text-left"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1 px-1">
                    <Terminal size={12} />
                    <span>Terminal Output:</span>
                  </div>
                  <div className="rounded-xl bg-black border border-emerald-500/30 p-3 font-mono text-sm text-emerald-400 shadow-md">
                    <div className="text-neutral-500 text-xs mb-1 select-none">$ python script.py</div>
                    <div className="text-emerald-300 font-bold whitespace-pre-line">
                      {currentDrill.expectedOutput}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Post Explanation Note (with TTS & translation) */}
              {isDrillCompleted && currentDrill.explanationAfter && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-left max-w-xl w-full flex items-start justify-between gap-2"
                >
                  <div className="flex-1">
                    <span className="font-semibold text-amber-400 mr-1 text-xs">Note:</span>
                    {(() => {
                      const locExp = translationService.getPythonText(
                        currentDrill.explanationAfter,
                        supportLang
                      );
                      if (!locExp) return null;
                      return (
                        <div className="inline">
                          <span className="text-xs text-neutral-300 whitespace-pre-line">
                            {locExp.en}
                          </span>
                          {locExp.translated && (
                            <div className="text-xs text-neutral-400 mt-1 border-t border-neutral-800/60 pt-1">
                              {locExp.translated}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    type="button"
                    onClick={() => playTTS(`after-${currentDrill.id}`, currentDrill.explanationAfter)}
                    className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                      playingKey === `after-${currentDrill.id}`
                        ? 'text-amber-400 bg-amber-500/20 animate-pulse'
                        : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
                    }`}
                    title="Listen to explanation (Edge TTS)"
                  >
                    <Volume2 size={15} />
                  </button>
                </motion.div>
              )}

              {/* Mobile Quick-Symbol Toolbar */}
              <div className="sm:hidden flex flex-wrap items-center justify-center gap-1.5 mt-3 w-full max-w-md">
                {['=', '"', '(', ')', '_', ':', 'print', 'name', 'Enter'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => insertSymbol(sym === 'Enter' ? '\n' : sym)}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 active:bg-neutral-800 active:text-amber-400"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {/* Bottom Action Controls */}
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full">
                {!isDrillCompleted ? (
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Recall Hint Toggle Button */}
                    {currentDrill.isRecallMode && (
                      <button
                        type="button"
                        id="py-var-hint-btn"
                        onClick={() => setShowHint((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 bg-neutral-900 border border-neutral-800 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-colors font-mono cursor-pointer"
                      >
                        <HelpCircle size={14} />
                        <span>{showHint ? 'Hide Hint' : 'Need Hint? (Tab)'}</span>
                      </button>
                    )}

                    {/* Subtle Skip Button */}
                    <button
                      type="button"
                      id="py-var-skip-btn"
                      onClick={handleSkip}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 active:text-white bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-colors font-mono cursor-pointer"
                      title="Skip to next item (Alt+S)"
                    >
                      <span>{currentStep.stepType === 'challenge' ? 'Skip challenge' : 'Skip'}</span>
                      <span className="text-neutral-600 ml-0.5">→</span>
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                  >
                    <button
                      type="button"
                      id="py-var-continue-btn"
                      onClick={handleAdvance}
                      className="inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
                    >
                      <span>Continue</span>
                      <span className="hidden sm:inline-flex items-center text-xs opacity-75 font-mono">
                        (Enter <CornerDownLeft size={12} className="inline ml-0.5" />)
                      </span>
                      <ArrowRight size={15} className="sm:hidden" />
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            /* COMPLETION SUMMARY SCREEN */
            <motion.div
              key="py-var-completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl mx-auto text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  CHALLENGE COMPLETE ✓
                </h2>
                <div className="text-lg font-semibold text-amber-400 mt-0.5">
                  VARIABLES MASTERY
                </div>
                <p className="text-sm text-neutral-400 mt-1">
                  You have understood, modified, predicted, debugged, and coded Python variables from scratch.
                </p>
              </div>

              {/* Mastered Python Concepts Checklist */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 text-left">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-3 font-semibold">
                  Concepts Practiced:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-mono text-neutral-200">
                  {[
                    'Variable assignment (=)',
                    'String variables ("Ali")',
                    'Integer variables (20, 100)',
                    'print(variable) vs print("text")',
                    'Variable reassignment flow',
                    'Case sensitivity in Python',
                    'Predicting terminal output',
                    'Debugging syntax errors',
                    'Writing multiline Python scripts',
                  ].map((concept) => (
                    <div key={concept} className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{concept}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Performance Statistics */}
              <div className="grid grid-cols-4 gap-2 bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-3">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-amber-400">{avgAccuracy}%</div>
                  <div className="text-[10px] sm:text-xs text-neutral-500">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-white">{avgWpm}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-500">WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-amber-300">{accumulatedMistakes}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-500">Mistakes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-neutral-300">
                    {Math.floor(totalElapsedSeconds / 60)}m {totalElapsedSeconds % 60}s
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-500">Study Time</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  id="py-var-retry-btn"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Practice Again</span>
                </button>
                <button
                  type="button"
                  id="py-var-finish-btn"
                  onClick={handleExit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
                >
                  <span>Finish & Return</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-2 px-3 sm:px-4 border-t border-neutral-900/60 flex items-center justify-between text-[11px] text-neutral-600 font-mono select-none">
        <div className="hidden sm:flex items-center gap-4">
          <span>Esc to exit</span>
          <span>Tab for hint</span>
          <span>Alt+S to skip</span>
        </div>
        <div className="mx-auto sm:mx-0 text-center truncate">
          MY LEARNING · Python Beginner 1 · I learn by typing
        </div>
        <div className="hidden sm:block">
          Python 3.x Syntax
        </div>
      </footer>
    </div>
  );
}
