import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  HelpCircle,
  ArrowRight,
  CornerDownLeft,
  CheckCircle2,
  Sparkles,
  Globe,
  RotateCcw,
  Check,
} from 'lucide-react';
import { LanguageLesson, DifficultWord } from '../../../types/lessons';
import {
  PA_CAFE_STEPS,
  InteractiveLessonStep,
  InteractiveDrillItem,
} from '../../../data/courses/swedish/paCafeLesson';
import {
  translationService,
  TranslationLang,
} from '../../../services/translationPreference';
import { useTypingEngine, TypingSessionStats } from '../../../hooks/useTypingEngine';
import { useLessonAudio } from '../../../hooks/useLessonAudio';
import { TypingText } from '../TypingText';
import { LessonHeader } from '../LessonHeader';
import { progressService } from '../../../services/progress';
import { reviewService } from '../../../services/reviewService';
import {
  getStoredVoice,
  setStoredVoice,
  getStoredRate,
  setStoredRate,
  getStoredAutoplay,
  setStoredAutoplay,
  unlockAudio,
  TTSRate,
} from '../../../services/tts';
import { motion, AnimatePresence } from 'motion/react';

interface PaCafeLessonEngineProps {
  lesson: LanguageLesson;
  onExit?: () => void;
  onLessonComplete?: (stats: {
    accuracy: number;
    wpm: number;
    mistakes: number;
    difficultWords: DifficultWord[];
  }) => void;
}

export function PaCafeLessonEngine({
  lesson,
  onExit,
  onLessonComplete,
}: PaCafeLessonEngineProps) {
  const navigate = useNavigate();

  // Step and drill state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [isDrillCompleted, setIsDrillCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Translation setting for Swedish course: 'so' | 'en' | 'off'
  const [translationLang, setTranslationLang] = useState<TranslationLang>(() =>
    translationService.getLanguage('sv')
  );

  const handleTranslationChange = (newLang: TranslationLang) => {
    setTranslationLang(newLang);
    translationService.setLanguage(newLang, 'sv');
  };

  // Metrics accumulators
  const [accumulatedMistakes, setAccumulatedMistakes] = useState(0);
  const [accumulatedChars, setAccumulatedChars] = useState(0);
  const [wpmSamples, setWpmSamples] = useState<number[]>([]);
  const [accuracySamples, setAccuracySamples] = useState<number[]>([]);
  const [difficultWordsSession] = useState<DifficultWord[]>([]);
  const [lessonStartTime] = useState<number>(() => Date.now());

  // Audio settings (Swedish voice & rate)
  const [voice, setVoice] = useState<string>(() => getStoredVoice('sv'));
  const [rate, setRate] = useState<TTSRate>(() => getStoredRate('sv'));
  const [autoPlay, setAutoPlay] = useState<boolean>(() => getStoredAutoplay());

  const currentStep: InteractiveLessonStep = PA_CAFE_STEPS[currentStepIndex] || PA_CAFE_STEPS[0];
  const totalSteps = PA_CAFE_STEPS.length; // 23 interactive steps + 24th completion screen
  const currentDrill: InteractiveDrillItem = currentStep?.drills[currentDrillIndex] || currentStep?.drills[0];

  const [activeAudioText, setActiveAudioText] = useState<string>('');

  const {
    play: playAudio,
    stop: stopAudio,
    isPlaying: isAudioPlaying,
    isLoading: isAudioLoading,
    error: audioError,
  } = useLessonAudio({
    text: activeAudioText,
    language: 'sv',
    voice,
    rate,
    autoPlay: false,
  });

  const triggerAudio = useCallback(
    (textToPlay: string) => {
      if (!textToPlay) return;
      unlockAudio();
      setActiveAudioText(textToPlay);
      setTimeout(() => {
        playAudio();
      }, 25);
    },
    [playAudio]
  );

  // Auto-play audio for Listen & Type or Assistant dialogue turns
  const playedDrillIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentDrill && playedDrillIdRef.current !== currentDrill.id) {
      playedDrillIdRef.current = currentDrill.id;
      if (currentDrill.speaker?.audioText) {
        triggerAudio(currentDrill.speaker.audioText);
      } else if (currentDrill.playAudioOnStart && currentDrill.audioText) {
        triggerAudio(currentDrill.audioText);
      }
    }
  }, [currentDrill, triggerAudio]);

  // Handle typing completion for the current drill
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

      // Record any mistakes in reviewService
      if (stats.mistakes > 0 && currentDrill?.targetText) {
        reviewService.recordLanguageMistake({
          word: currentDrill.targetText.slice(0, 30),
          language: 'sv',
          sentenceText: currentDrill.targetText,
          lessonId: 'sv-pa-cafe',
          unitTitle: 'På café',
        });
      }
    },
    [currentDrill]
  );

  const {
    typedText,
    characters,
    handleInputChange,
    resetTyping,
    focusInput,
    inputRef,
  } = useTypingEngine({
    targetText: currentDrill?.targetText || '',
    language: 'sv',
    onComplete: handleTypingComplete,
    disabled: isDrillCompleted,
    sentenceContext: currentDrill
      ? {
          text: currentDrill.targetText,
          translation: translationService.getText(currentDrill.translations, translationLang),
          lessonId: 'sv-pa-cafe',
        }
      : undefined,
  });

  // Reset state on step / drill transition
  useEffect(() => {
    setIsDrillCompleted(false);
    setShowHint(false);
    resetTyping();
    requestAnimationFrame(() => {
      focusInput();
    });
  }, [currentStepIndex, currentDrillIndex, resetTyping, focusInput]);

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

  // Keybindings: Enter to advance (when typing finished), Tab for hint, Escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        stopAudio();
        if (onExit) onExit();
        navigate('/');
      } else if (e.key === 'Tab' && currentDrill?.isRecallMode && !isDrillCompleted) {
        e.preventDefault();
        setShowHint((prev) => !prev);
      } else if (e.key === 'Enter' && isDrillCompleted) {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrillCompleted, currentDrill, handleAdvance, onExit, navigate, stopAudio]);

  // Restart lesson
  const handleRestart = useCallback(() => {
    stopAudio();
    setCurrentStepIndex(0);
    setCurrentDrillIndex(0);
    setIsLessonCompleted(false);
    setIsDrillCompleted(false);
    setAccumulatedMistakes(0);
    setAccumulatedChars(0);
    setWpmSamples([]);
    setAccuracySamples([]);
    resetTyping();
  }, [stopAudio, resetTyping]);

  // Voice & rate settings handlers
  const handleVoiceChange = (newVoice: string) => {
    setVoice(newVoice);
    setStoredVoice('sv', newVoice);
  };

  const handleRateChange = (newRate: TTSRate) => {
    setRate(newRate);
    setStoredRate('sv', newRate);
  };

  const handleAutoPlayToggle = (enabled: boolean) => {
    setAutoPlay(enabled);
    setStoredAutoplay(enabled);
  };

  const handleExit = useCallback(() => {
    stopAudio();
    if (onExit) onExit();
    navigate('/');
  }, [onExit, navigate, stopAudio]);

  // Calculate final stats
  const totalElapsedSeconds = Math.max(1, Math.round((Date.now() - lessonStartTime) / 1000));
  const avgWpm =
    wpmSamples.length > 0
      ? Math.round(wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length)
      : Math.max(26, Math.round((accumulatedChars / 5) / (totalElapsedSeconds / 60)));
  const avgAccuracy =
    accuracySamples.length > 0
      ? Math.round(accuracySamples.reduce((a, b) => a + b, 0) / accuracySamples.length)
      : Math.max(85, 100 - accumulatedMistakes * 2);

  // Save lesson completion on finish
  const hasRecordedRef = useRef(false);
  useEffect(() => {
    if (isLessonCompleted && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      progressService.recordExerciseCompletion({
        subjectId: 'swedish',
        exerciseId: 'sv-pa-cafe',
        exerciseTitle: 'På café — At a Café',
        wpm: avgWpm,
        accuracy: avgAccuracy,
        mistakes: accumulatedMistakes,
        durationSeconds: totalElapsedSeconds,
        difficultWords: difficultWordsSession.map((d) => d.word),
      });

      if (onLessonComplete) {
        onLessonComplete({
          accuracy: avgAccuracy,
          wpm: avgWpm,
          mistakes: accumulatedMistakes,
          difficultWords: difficultWordsSession,
        });
      }
    }
  }, [
    isLessonCompleted,
    avgWpm,
    avgAccuracy,
    accumulatedMistakes,
    totalElapsedSeconds,
    difficultWordsSession,
    onLessonComplete,
  ]);

  // Translation helpers
  const drillTranslation = translationService.getText(currentDrill?.translations, translationLang);
  const contextTranslation = translationService.getText(currentStep?.contextTranslations, translationLang);

  return (
    <div
      id="fullscreen-focus-mode"
      className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-[100dvh] w-full max-w-full selection:bg-amber-500/30 selection:text-white"
    >
      {/* Top Header */}
      <LessonHeader
        language="sv"
        lessonTitle="På café — At a Café"
        currentIndex={currentStepIndex}
        totalSentences={totalSteps}
        stage={isLessonCompleted ? 'completed' : 'listen_type'}
        isPlaying={isAudioPlaying}
        isLoadingAudio={isAudioLoading}
        audioError={audioError}
        onPlayAudio={() => triggerAudio(currentDrill?.audioText || currentDrill?.targetText || '')}
        currentVoice={voice}
        onVoiceChange={handleVoiceChange}
        currentRate={rate}
        onRateChange={handleRateChange}
        autoPlay={autoPlay}
        onAutoPlayToggle={handleAutoPlayToggle}
        onExit={handleExit}
      />

      {/* Interactive Step Progress & Translation Selector Bar */}
      {!isLessonCompleted && (
        <div className="w-full max-w-3xl mx-auto px-4 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            {/* Step & Sub-drill Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold uppercase tracking-wider">
                Step {currentStep.stepNumber} of 23
              </span>
              {currentStep.drills.length > 1 && (
                <span className="text-neutral-500 text-[11px]">
                  ({currentDrillIndex + 1}/{currentStep.drills.length})
                </span>
              )}
            </div>

            {/* Translation Language Selector for Swedish (Somali / English / Off) */}
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs">
              <Globe size={13} className="text-neutral-400" />
              <span className="text-[11px] text-neutral-400 font-mono">Translation:</span>
              <select
                id="pa-cafe-translation-select"
                value={translationLang}
                onChange={(e) => handleTranslationChange(e.target.value as TranslationLang)}
                className="bg-transparent text-amber-400 font-medium text-xs focus:outline-none cursor-pointer"
              >
                <option value="so" className="bg-neutral-900 text-neutral-200">
                  Somali
                </option>
                <option value="en" className="bg-neutral-900 text-neutral-200">
                  English
                </option>
                <option value="off" className="bg-neutral-900 text-neutral-400">
                  Off
                </option>
              </select>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden flex gap-0.5">
            {PA_CAFE_STEPS.map((step, idx) => (
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

      {/* Main Focus / Typing Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-8 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!isLessonCompleted ? (
            <motion.div
              key={`${currentStep.stepNumber}-${currentDrill.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Badge Label */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles size={13} />
                  <span>{currentStep.badgeLabel}</span>
                </span>
              </div>

              {/* Context Note or Scenario */}
              {currentStep.contextNote && (
                <div className="max-w-xl mx-auto mb-4 px-4 py-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  <div className="font-sans whitespace-pre-line">{currentStep.contextNote}</div>
                  {contextTranslation && (
                    <div className="mt-1 text-xs text-neutral-500 font-serif italic">
                      “{contextTranslation}”
                    </div>
                  )}
                </div>
              )}

              {/* Assistant Speech Bubble (if conversational turn) */}
              {currentDrill.speaker && (
                <div className="w-full max-w-xl mb-4 text-left">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-mono text-neutral-400 font-semibold">
                      {currentDrill.speaker.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerAudio(currentDrill.speaker?.audioText || '')}
                      className="text-neutral-500 hover:text-amber-400 transition-colors p-0.5"
                      title="Lyssna"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                  <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-3.5 sm:p-4 text-sm sm:text-base text-neutral-100 rounded-tl-sm shadow-md">
                    <div className="font-medium">{currentDrill.speaker.text}</div>
                    {translationService.getText(currentDrill.speaker.translation, translationLang) && (
                      <div className="text-xs text-neutral-400 font-serif italic mt-1">
                        “{translationService.getText(currentDrill.speaker.translation, translationLang)}”
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prompt Text */}
              {currentDrill.prompt && (
                <div className="text-xs sm:text-sm font-mono text-neutral-400 mb-2">
                  {currentDrill.prompt}
                </div>
              )}

              {/* Fill-in Context View (if applicable) */}
              {currentDrill.fillIn && (
                <div className="mb-4 text-base sm:text-lg text-neutral-300 font-serif">
                  <span>{currentDrill.fillIn.prefix}</span>
                  <span className="inline-block px-2 py-0.5 mx-1 rounded border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-300 font-mono font-bold">
                    {isDrillCompleted ? currentDrill.targetText : '______'}
                  </span>
                  <span>{currentDrill.fillIn.suffix}</span>
                </div>
              )}

              {/* Core Typing Interaction (TypingText supporting Swedish å/ä/ö) */}
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
                  hintText={currentDrill.hint || currentDrill.targetText.slice(0, 10) + '...'}
                  disabled={isDrillCompleted}
                  onContainerClick={focusInput}
                />
              </div>

              {/* Secondary Translation Support Underneath (Muted & Smaller) */}
              {drillTranslation && !currentDrill.isRecallMode && (
                <div className="text-xs sm:text-sm text-neutral-400 font-serif italic mt-2 max-w-lg">
                  “{drillTranslation}”
                </div>
              )}

              {/* In Recall Mode: Show translation as prompt if available */}
              {currentDrill.isRecallMode && drillTranslation && (
                <div className="mt-2 text-sm sm:text-base text-amber-300/90 font-serif italic max-w-lg">
                  “{drillTranslation}”
                </div>
              )}

              {/* Post Explanation Note */}
              {isDrillCompleted && currentDrill.postExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 text-left max-w-xl"
                >
                  <span className="font-semibold text-amber-400 mr-1">Obs:</span>
                  {currentDrill.postExplanation}
                </motion.div>
              )}

              {/* Bottom Action Controls */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
                {!isDrillCompleted ? (
                  <div className="flex items-center gap-2">
                    {/* Audio Listen Button */}
                    {currentDrill.audioText && (
                      <button
                        type="button"
                        id="pa-cafe-listen-btn"
                        onClick={() => triggerAudio(currentDrill.audioText || '')}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl transition-colors font-mono"
                      >
                        <Volume2 size={14} />
                        <span>Lyssna (TTS)</span>
                      </button>
                    )}

                    {/* Recall Hint Toggle Button */}
                    {currentDrill.isRecallMode && (
                      <button
                        type="button"
                        id="pa-cafe-hint-btn"
                        onClick={() => setShowHint((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl transition-colors font-mono"
                      >
                        <HelpCircle size={14} />
                        <span>{showHint ? 'Dölj ledtråd' : 'Ledtråd? (Tab)'}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                  >
                    <button
                      type="button"
                      id="pa-cafe-continue-btn"
                      onClick={handleAdvance}
                      className="inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
                    >
                      <span>Fortsätt</span>
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
            /* STEP 24 — COMPLETION SUMMARY (BRA JOBBAT! ✓) */
            <motion.div
              key="pa-cafe-completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl mx-auto text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  BRA JOBBAT! ✓
                </h2>
                <div className="text-lg font-semibold text-amber-400 mt-0.5">
                  PÅ CAFÉ COMPLETE
                </div>
                <p className="text-sm text-neutral-400 mt-1">
                  Du har bemästrat att beställa och samtala på café på naturlig svenska genom aktiv maskinskrivning.
                </p>
              </div>

              {/* Learned Vocabulary Checklist */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 text-left">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-3 font-semibold">
                  Ord och fraser du lärt dig:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-mono text-neutral-200">
                  {[
                    'kaffe',
                    'te',
                    'vatten',
                    'tack',
                    'ja tack',
                    'nej tack',
                    'Jag skulle vilja ha...',
                    'Jag tar...',
                    'Kan jag få...?',
                    'Vill du ha något mer?',
                    'Vad kostar det?',
                    'Det kostar...',
                    'kronor',
                  ].map((vocab) => (
                    <div key={vocab} className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{vocab}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Performance Statistics */}
              <div className="grid grid-cols-4 gap-2 bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-3">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-amber-400">{avgAccuracy}%</div>
                  <div className="text-[10px] sm:text-xs text-neutral-500">Pricksäkerhet</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-white">{avgWpm}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-500">WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-amber-300">{accumulatedMistakes}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-500">Misstag</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-neutral-300">
                    {Math.floor(totalElapsedSeconds / 60)}m {totalElapsedSeconds % 60}s
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-500">Tid</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  id="pa-cafe-retry-btn"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>Öva igen</span>
                </button>
                <button
                  type="button"
                  id="pa-cafe-exit-btn"
                  onClick={handleExit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-98"
                >
                  <span>Klar & Återgå</span>
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
          <span>Esc för att avsluta</span>
          <span>Tab för ledtråd</span>
        </div>
        <div className="mx-auto sm:mx-0 text-center truncate">
          MY LEARNING · Svenska · I learn by typing
        </div>
        <div className="hidden sm:block">
          Översättning: {translationLang === 'so' ? 'Somaliska' : translationLang === 'en' ? 'Engelska' : 'Av'}
        </div>
      </footer>
    </div>
  );
}
