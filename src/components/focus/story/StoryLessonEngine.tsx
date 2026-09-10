import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Check,
  CheckCircle2,
  Globe,
  CornerDownLeft,
  Info,
} from 'lucide-react';
import { StoryChapter, StoryScene } from '../../../types/story';
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

interface StoryLessonEngineProps {
  chapter: StoryChapter;
  onExit?: () => void;
  onLessonComplete?: (stats: {
    accuracy: number;
    wpm: number;
    mistakes: number;
    studyTimeSeconds: number;
  }) => void;
}

export function StoryLessonEngine({
  chapter,
  onExit,
  onLessonComplete,
}: StoryLessonEngineProps) {
  const navigate = useNavigate();

  // Storage key for resuming progress inside this story chapter
  const storageProgressKey = `mylearning_story_scene_${chapter.id}`;

  // Current scene index with resume support
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageProgressKey);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < chapter.scenes.length) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [isTypingCompleted, setIsTypingCompleted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Translation setting for Swedish course: 'so' | 'en' | 'off'
  const [translationLang, setTranslationLang] = useState<TranslationLang>(() =>
    translationService.getLanguage('sv')
  );

  const handleTranslationChange = (newLang: TranslationLang) => {
    setTranslationLang(newLang);
    translationService.setLanguage(newLang, 'sv');
  };

  // Metrics accumulators
  const [accumulatedMistakes, setAccumulatedMistakes] = useState<number>(0);
  const [accumulatedChars, setAccumulatedChars] = useState<number>(0);
  const [wpmSamples, setWpmSamples] = useState<number[]>([]);
  const [accuracySamples, setAccuracySamples] = useState<number[]>([]);
  const [lessonStartTime] = useState<number>(() => Date.now());

  // Audio settings (Swedish voice, rate & autoplay)
  const [voice, setVoice] = useState<string>(() => getStoredVoice('sv'));
  const [rate, setRate] = useState<TTSRate>(() => getStoredRate('sv'));
  const [autoPlay, setAutoPlay] = useState<boolean>(() => getStoredAutoplay());

  const handleVoiceChange = (newVoice: string) => {
    setVoice(newVoice);
    setStoredVoice('sv', newVoice);
  };

  const handleRateChange = (newRate: TTSRate) => {
    setRate(newRate);
    setStoredRate('sv', newRate);
  };

  const handleAutoPlayToggle = (val: boolean) => {
    setAutoPlay(val);
    setStoredAutoplay(val);
  };

  const currentScene: StoryScene = chapter.scenes[currentSceneIndex] || chapter.scenes[0];
  const totalScenes = chapter.scenes.length;
  const isLastScene = currentSceneIndex === totalScenes - 1;
  const isSummaryScene = currentScene.type === 'chapter_summary' || isLastScene;

  // Active audio player state
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
      }, 30);
    },
    [playAudio]
  );

  // Save scene position and update central progress
  useEffect(() => {
    try {
      localStorage.setItem(storageProgressKey, currentSceneIndex.toString());
    } catch {
      // ignore
    }

    progressService.updateLastPosition({
      subjectId: 'swedish',
      unitId: chapter.unitId,
      unitTitle: `Beginner 1 · ${chapter.subtitle}`,
      exerciseId: 'sv-en-vanlig-morgon',
      exerciseTitle: `${chapter.title} · Story`,
      sentenceIndex: currentSceneIndex,
    });
  }, [currentSceneIndex, chapter, storageProgressKey]);

  // Autoplay audio on scene enter if autoplay is enabled
  const playedSceneRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentScene && playedSceneRef.current !== currentScene.id) {
      playedSceneRef.current = currentScene.id;
      if (autoPlay && currentScene.type !== 'chapter_summary') {
        const textToSpeak = currentScene.audioText || currentScene.typingTarget || currentScene.storyText;
        if (textToSpeak) {
          triggerAudio(textToSpeak);
        }
      }
    }
  }, [currentScene, autoPlay, triggerAudio]);

  // Typing completion handler
  const handleTypingComplete = useCallback(
    (stats: TypingSessionStats) => {
      setIsTypingCompleted(true);
      setAccumulatedMistakes((prev) => prev + stats.mistakes);
      setAccumulatedChars((prev) => prev + stats.totalChars);

      if (stats.wpm > 0) {
        setWpmSamples((prev) => [...prev, stats.wpm]);
      }
      if (stats.accuracy >= 0) {
        setAccuracySamples((prev) => [...prev, stats.accuracy]);
      }

      // Record meaningful mistakes in reviewService
      if (stats.mistakes > 0 && currentScene.typingTarget) {
        const target = currentScene.typingTarget;
        let wordToRecord = currentScene.highlightWord || target.slice(0, 30);
        if (target.includes('komma ihåg')) wordToRecord = 'komma ihåg';
        else if (target.includes('på väg till jobbet')) wordToRecord = 'på väg till jobbet';
        else if (target.includes('bli sen')) wordToRecord = 'bli sen';
        else if (target.includes('halv åtta')) wordToRecord = 'halv åtta';
        else if (target.includes('morgon')) wordToRecord = 'morgon';
        else if (target.includes('fönstret')) wordToRecord = 'fönstret';
        else if (target.includes('lägenhet')) wordToRecord = 'lägenhet';
        else if (target.includes('jobbet')) wordToRecord = 'jobbet';

        reviewService.recordLanguageMistake({
          word: wordToRecord,
          language: 'sv',
          sentenceText: currentScene.storyText || target,
          sentenceTranslation: translationService.getText(currentScene.storyTranslations, translationLang),
          unitId: chapter.unitId,
          unitTitle: chapter.subtitle,
          lessonId: 'sv-en-vanlig-morgon',
        });
      }
    },
    [currentScene, chapter, translationLang]
  );

  // Initialize typing engine
  const targetToType = currentScene.typingTarget || '';
  const hasTyping = Boolean(currentScene.typingTarget);

  const {
    typedText,
    characters,
    handleInputChange,
    resetTyping,
    focusInput,
    inputRef,
  } = useTypingEngine({
    targetText: targetToType,
    language: 'sv',
    onComplete: handleTypingComplete,
    disabled: isTypingCompleted,
    sentenceContext: hasTyping
      ? {
          text: targetToType,
          translation: translationService.getText(currentScene.typingTranslations, translationLang),
          lessonId: 'sv-en-vanlig-morgon',
        }
      : undefined,
  });

  // Reset typing state on scene change
  useEffect(() => {
    setIsTypingCompleted(false);
    setShowHint(false);
    resetTyping();
    if (hasTyping) {
      requestAnimationFrame(() => {
        focusInput();
      });
    }
  }, [currentSceneIndex, hasTyping, resetTyping, focusInput]);

  // Advance scene handler
  const handleAdvance = useCallback(() => {
    stopAudio();
    if (currentSceneIndex + 1 < totalScenes) {
      setCurrentSceneIndex((prev) => prev + 1);
    }
  }, [currentSceneIndex, totalScenes, stopAudio]);

  // Exit handler
  const handleExit = useCallback(() => {
    stopAudio();
    if (onExit) {
      onExit();
    } else {
      navigate('/swedish');
    }
  }, [onExit, navigate, stopAudio]);

  // Global keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleExit();
      } else if (e.key === 'Tab' && currentScene.isRecallMode && !isTypingCompleted) {
        e.preventDefault();
        setShowHint((prev) => !prev);
      } else if (e.key === 'Enter') {
        if (!hasTyping || isTypingCompleted || isSummaryScene) {
          e.preventDefault();
          if (isSummaryScene) {
            handleExit();
          } else {
            handleAdvance();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasTyping, isTypingCompleted, isSummaryScene, currentScene, handleAdvance, handleExit]);

  // Final stats calculation
  const totalElapsedSeconds = Math.max(1, Math.round((Date.now() - lessonStartTime) / 1000));
  const avgWpm =
    wpmSamples.length > 0
      ? Math.round(wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length)
      : Math.max(28, Math.round((accumulatedChars / 5) / (totalElapsedSeconds / 60)));
  const avgAccuracy =
    accuracySamples.length > 0
      ? Math.round(accuracySamples.reduce((a, b) => a + b, 0) / accuracySamples.length)
      : Math.max(88, 100 - accumulatedMistakes * 2);

  // Record completion when reaching summary
  const recordedCompletionRef = useRef(false);
  useEffect(() => {
    if (isSummaryScene && !recordedCompletionRef.current) {
      recordedCompletionRef.current = true;
      progressService.recordExerciseCompletion({
        subjectId: 'swedish',
        exerciseId: 'sv-en-vanlig-morgon',
        exerciseTitle: 'En vanlig morgon — Interactive Story',
        wpm: avgWpm,
        accuracy: avgAccuracy,
        mistakes: accumulatedMistakes,
        durationSeconds: totalElapsedSeconds,
        difficultWords: ['morgon', 'fönstret', 'komma ihåg', 'halv åtta'],
      });

      if (onLessonComplete) {
        onLessonComplete({
          accuracy: avgAccuracy,
          wpm: avgWpm,
          mistakes: accumulatedMistakes,
          studyTimeSeconds: totalElapsedSeconds,
        });
      }
    }
  }, [isSummaryScene, avgWpm, avgAccuracy, accumulatedMistakes, totalElapsedSeconds, onLessonComplete]);

  // Restart handler
  const handleRestart = () => {
    try {
      localStorage.removeItem(storageProgressKey);
    } catch {
      // ignore
    }
    setCurrentSceneIndex(0);
    setIsTypingCompleted(false);
    setAccumulatedMistakes(0);
    setAccumulatedChars(0);
    setWpmSamples([]);
    setAccuracySamples([]);
    resetTyping();
  };

  // Virtual Swedish characters helper
  const handleVirtualKey = (char: string) => {
    if (!hasTyping || isTypingCompleted) return;
    const nextVal = typedText + char;
    handleInputChange(nextVal);
    focusInput();
  };

  // Translation helpers
  const currentStoryTranslation = translationService.getText(
    currentScene.storyTranslations,
    translationLang
  );
  const currentTypingTranslation = translationService.getText(
    currentScene.typingTranslations,
    translationLang
  );

  // Determine stage for LessonHeader
  const headerStage = isSummaryScene
    ? 'completed'
    : currentScene.isRecallMode
    ? 'recall'
    : hasTyping
    ? 'listen_type'
    : 'understand';

  // Determine dynamic badge label
  const getBadgeLabel = () => {
    if (currentScene.isRecallMode) return 'RECALL';
    if (currentScene.type === 'type_sentence') return 'LISTEN & TYPE';
    if (currentScene.type === 'type_phrase') return 'TYPE THE PHRASE';
    if (currentScene.type === 'dialogue_thought') return 'DIALOGUE / THOUGHT';
    if (!hasTyping) return 'STORY';
    return currentScene.badgeLabel || 'TYPE & LEARN';
  };

  // Check if this scene is full-sentence typing where storyText matches typingTarget
  const isFullSentenceTyping =
    hasTyping &&
    currentScene.typingTarget &&
    currentScene.storyText.trim() === currentScene.typingTarget.trim();

  return (
    <div
      id="fullscreen-focus-mode"
      className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-[100dvh] w-full max-w-full selection:bg-amber-500/30 selection:text-white"
    >
      {/* Top Header - Reusing standard Swedish LessonHeader */}
      <LessonHeader
        language="sv"
        lessonTitle={`${chapter.title} — ${chapter.subtitle}`}
        currentIndex={currentSceneIndex}
        totalSentences={totalScenes}
        stage={headerStage}
        isPlaying={isAudioPlaying}
        isLoadingAudio={isAudioLoading}
        audioError={audioError}
        onPlayAudio={() =>
          triggerAudio(
            currentScene.audioText ||
              currentScene.typingTarget ||
              currentScene.storyText
          )
        }
        currentVoice={voice}
        onVoiceChange={handleVoiceChange}
        currentRate={rate}
        onRateChange={handleRateChange}
        autoPlay={autoPlay}
        onAutoPlayToggle={handleAutoPlayToggle}
        onExit={handleExit}
      />

      {/* Step Progress & Translation Selector Bar (Identical to På café) */}
      {!isSummaryScene && (
        <div className="w-full max-w-3xl mx-auto px-4 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            {/* Step Counter */}
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold uppercase tracking-wider">
                Step {currentScene.sceneNumber} of {totalScenes}
              </span>
            </div>

            {/* Translation Language Selector */}
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs">
              <Globe size={13} className="text-neutral-400" />
              <span className="text-[11px] text-neutral-400 font-mono">Translation:</span>
              <select
                id="story-translation-select"
                value={translationLang}
                onChange={(e) => handleTranslationChange(e.target.value as TranslationLang)}
                aria-label="Språkstöd"
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
            {chapter.scenes.map((scene, idx) => (
              <div
                key={scene.id}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  idx < currentSceneIndex
                    ? 'bg-amber-500'
                    : idx === currentSceneIndex
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Focus / Typing Canvas (No giant cards!) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-8 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!isSummaryScene ? (
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Activity Label Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles size={13} />
                  <span>{getBadgeLabel()}</span>
                </span>
              </div>

              {/* Story Context Sentence(s)
                  Displayed cleanly above the typing target.
                  If full-sentence typing, the typing target itself IS the sentence, so we don't duplicate it. */}
              {!isFullSentenceTyping && (
                <div className="max-w-xl mx-auto mb-3 text-center">
                  <p className="text-base sm:text-lg text-neutral-200 leading-relaxed font-sans whitespace-pre-line">
                    {currentScene.storyText}
                  </p>
                  {currentStoryTranslation && (
                    <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-serif italic">
                      “{currentStoryTranslation}”
                    </p>
                  )}
                </div>
              )}

              {/* Subtle Grammar Note (e.g. halv åtta time expression) */}
              {currentScene.grammarNote && (
                <div className="max-w-xl mx-auto mb-3 px-3.5 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-300 text-left flex items-start gap-2">
                  <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{currentScene.grammarNote}</span>
                </div>
              )}

              {/* Integrated Vocabulary (Natural typographic presentation, NOT a flashcard) */}
              {currentScene.highlightWord && !currentScene.isRecallMode && (
                <div className="mb-3 text-center">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                    Important phrase
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-amber-300 font-sans mt-0.5 block">
                    {currentScene.highlightWord}
                  </span>
                  <span className="text-xs text-neutral-400 font-serif block mt-0.5">
                    {currentScene.highlightMeaning?.en}
                    {currentScene.highlightMeaning?.so && ` · ${currentScene.highlightMeaning.so}`}
                  </span>
                </div>
              )}

              {/* Recall Mode Prompt */}
              {currentScene.isRecallMode && (
                <div className="mb-3 text-center">
                  {currentTypingTranslation && (
                    <div className="text-sm sm:text-base text-amber-300/90 font-serif italic">
                      “{currentTypingTranslation}”
                    </div>
                  )}
                  <div className="text-xs font-mono text-neutral-400 mt-1">
                    {currentScene.typingPrompt || 'Vad heter det på svenska? Type from memory:'}
                  </div>
                </div>
              )}

              {/* Prompt Note for full sentence typing (if applicable) */}
              {isFullSentenceTyping && currentScene.typingPrompt && (
                <div className="text-xs font-mono text-neutral-400 mb-1">
                  {currentScene.typingPrompt}
                </div>
              )}

              {/* LARGE Typing Target directly on the page (NO giant container around it!) */}
              {hasTyping && (
                <div
                  className="w-full flex flex-col items-center justify-center min-h-[120px] cursor-text my-2"
                  onClick={focusInput}
                >
                  <TypingText
                    characters={characters}
                    typedLength={typedText.length}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    typedValue={typedText}
                    isRecallMode={currentScene.isRecallMode && !isTypingCompleted}
                    showHint={showHint || isTypingCompleted}
                    hintText={currentScene.hint || currentScene.typingTarget?.slice(0, 10) + '...'}
                    disabled={isTypingCompleted}
                    onContainerClick={focusInput}
                  />
                </div>
              )}

              {/* Secondary Translation Support Underneath (Muted & Smaller) */}
              {hasTyping && currentTypingTranslation && !currentScene.isRecallMode && (
                <div className="text-xs sm:text-sm text-neutral-400 font-serif italic mt-1 max-w-lg">
                  “{currentTypingTranslation}”
                </div>
              )}

              {/* Compact Swedish Character Toolbar (Secondary, does not compete) */}
              {hasTyping && !isTypingCompleted && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <span className="text-[10px] text-neutral-500 font-mono mr-1">Quick keys:</span>
                  {['å', 'ä', 'ö', 'Å', 'Ä', 'Ö'].map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleVirtualKey(letter)}
                      className="h-7 w-7 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-xs border border-neutral-800 active:scale-95 transition-all cursor-pointer"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Action Controls (Listen button, Hint, and Continue) */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
                {!hasTyping || isTypingCompleted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                  >
                    {/* Audio Option */}
                    {(currentScene.audioText || currentScene.storyText) && (
                      <button
                        type="button"
                        id="story-listen-completed-btn"
                        onClick={() =>
                          triggerAudio(
                            currentScene.audioText ||
                              currentScene.typingTarget ||
                              currentScene.storyText
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl transition-colors font-mono cursor-pointer"
                      >
                        <Volume2 size={14} className="text-amber-400" />
                        <span>Lyssna</span>
                      </button>
                    )}

                    <button
                      type="button"
                      id="story-continue-btn"
                      onClick={handleAdvance}
                      className="inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
                    >
                      <span>{currentScene.actionLabel || 'Fortsätt'}</span>
                      <span className="hidden sm:inline-flex items-center text-xs opacity-75 font-mono">
                        (Enter <CornerDownLeft size={12} className="inline ml-0.5" />)
                      </span>
                      <ArrowRight size={15} className="sm:hidden" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Audio Listen Button */}
                    {(currentScene.audioText || currentScene.typingTarget || currentScene.storyText) && (
                      <button
                        type="button"
                        id="story-listen-btn"
                        onClick={() =>
                          triggerAudio(
                            currentScene.audioText ||
                              currentScene.typingTarget ||
                              currentScene.storyText
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl transition-colors font-mono cursor-pointer"
                      >
                        <Volume2 size={14} className="text-amber-400" />
                        <span>Lyssna</span>
                      </button>
                    )}

                    {/* Recall Hint Toggle Button */}
                    {currentScene.isRecallMode && (
                      <button
                        type="button"
                        id="story-hint-btn"
                        onClick={() => setShowHint((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl transition-colors font-mono cursor-pointer"
                      >
                        <HelpCircle size={14} />
                        <span>{showHint ? 'Dölj ledtråd' : 'Ledtråd? (Tab)'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* =======================================================
               CHAPTER 1 COMPLETION SUMMARY (BRA JOBBAT! ✓)
               Reusing På café's clean, unified completion layout
            ======================================================= */
            <motion.div
              key="story-completed"
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
                  KAPITEL 1 KLART · EN VANLIG MORGON
                </div>
                <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
                  Du har läst, lyssnat och skrivit dig igenom hela första kapitlet om Elias morgon i Stockholm.
                </p>
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

              {/* Learned Vocabulary Checklist */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 text-left">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-3 font-semibold">
                  Ord och fraser du lärt dig i kapitlet:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-mono text-neutral-200">
                  {chapter.vocabulary.map((vocab) => (
                    <div key={vocab.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{vocab.word}</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-sans truncate shrink-0">
                        {vocab.somaliTranslation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  id="story-retry-btn"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Öva igen</span>
                </button>
                <button
                  type="button"
                  id="story-exit-complete-btn"
                  onClick={handleExit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
                >
                  <span>Klar & Återgå</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Footer (Esc, Tab, Brand, Translation info) */}
      <footer className="w-full py-2 px-3 sm:px-4 border-t border-neutral-900/60 flex items-center justify-between text-[11px] text-neutral-600 font-mono select-none">
        <div className="hidden sm:flex items-center gap-4">
          <span>Esc för att avsluta</span>
          {currentScene.isRecallMode && <span>Tab för ledtråd</span>}
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
