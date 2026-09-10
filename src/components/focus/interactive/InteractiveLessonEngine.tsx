import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageLesson, LessonStep, DifficultWord } from '../../../types/lessons';
import { useLessonAudio } from '../../../hooks/useLessonAudio';
import { TypingSessionStats } from '../../../hooks/useTypingEngine';
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
import { LessonHeader } from '../LessonHeader';
import { LessonResults } from '../LessonResults';
import { StepConcept } from './StepConcept';
import { StepFlashcard } from './StepFlashcard';
import { StepChoice } from './StepChoice';
import { StepComparison } from './StepComparison';
import { StepType } from './StepType';
import { StepSentenceBuilder } from './StepSentenceBuilder';
import { StepDialogue } from './StepDialogue';
import { StepRecall } from './StepRecall';
import { AnimatePresence } from 'motion/react';

interface InteractiveLessonEngineProps {
  lesson: LanguageLesson;
  onExit?: () => void;
  onLessonComplete?: (stats: {
    accuracy: number;
    wpm: number;
    mistakes: number;
    difficultWords: DifficultWord[];
  }) => void;
}

export function InteractiveLessonEngine({
  lesson,
  onExit,
  onLessonComplete,
}: InteractiveLessonEngineProps) {
  const navigate = useNavigate();
  const steps: LessonStep[] = lesson.steps || [];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Metrics tracking
  const [accumulatedMistakes, setAccumulatedMistakes] = useState(0);
  const [accumulatedChars, setAccumulatedChars] = useState(0);
  const [wpmSamples, setWpmSamples] = useState<number[]>([]);
  const [accuracySamples, setAccuracySamples] = useState<number[]>([]);
  const [difficultWordsSession, setDifficultWordsSession] = useState<DifficultWord[]>([]);
  const [lessonStartTime] = useState<number>(() => Date.now());

  // Audio setup
  const [voice, setVoice] = useState<string>(() => getStoredVoice(lesson.language));
  const [rate, setRate] = useState<TTSRate>(() => getStoredRate(lesson.language));
  const [autoPlay, setAutoPlay] = useState<boolean>(() => getStoredAutoplay());

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;

  const [activeAudioText, setActiveAudioText] = useState<string>('');

  const {
    play: playAudio,
    stop: stopAudio,
    isPlaying: isAudioPlaying,
    isLoading: isAudioLoading,
    error: audioError,
  } = useLessonAudio({
    text: activeAudioText,
    language: lesson.language,
    voice,
    rate,
    autoPlay: false,
  });

  const handlePlayAudio = useCallback(
    (textToPlay: string) => {
      if (!textToPlay) return;
      unlockAudio();
      setActiveAudioText(textToPlay);
      // Wait microtask to ensure state set
      setTimeout(() => {
        playAudio();
      }, 20);
    },
    [playAudio]
  );

  const handleExit = useCallback(() => {
    stopAudio();
    if (onExit) {
      onExit();
    }
    navigate('/');
  }, [onExit, navigate, stopAudio]);

  const handleStepCompleteTyping = useCallback(
    (stats: TypingSessionStats) => {
      setAccumulatedMistakes((prev) => prev + stats.mistakes);
      setAccumulatedChars((prev) => prev + stats.totalChars);
      if (stats.wpm > 0) {
        setWpmSamples((prev) => [...prev, stats.wpm]);
      }
      if (stats.accuracy >= 0) {
        setAccuracySamples((prev) => [...prev, stats.accuracy]);
      }
    },
    []
  );

  const handleRecordStepMistake = useCallback(
    (mistakeText: string) => {
      setAccumulatedMistakes((prev) => prev + 1);
      reviewService.recordLanguageMistake({
        word: mistakeText.slice(0, 30),
        language: lesson.language,
        sentenceText: mistakeText,
        lessonId: lesson.id,
        unitTitle: lesson.title,
      });
    },
    [lesson.language, lesson.id, lesson.title]
  );

  const handleNextStep = useCallback(() => {
    stopAudio();
    if (currentStepIndex + 1 < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentStepIndex, totalSteps, stopAudio]);

  // Restart lesson
  const handleRestart = useCallback(() => {
    stopAudio();
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setAccumulatedMistakes(0);
    setAccumulatedChars(0);
    setWpmSamples([]);
    setAccuracySamples([]);
  }, [stopAudio]);

  // Settings handlers
  const handleVoiceChange = (newVoice: string) => {
    setVoice(newVoice);
    setStoredVoice(lesson.language, newVoice);
  };

  const handleRateChange = (newRate: TTSRate) => {
    setRate(newRate);
    setStoredRate(lesson.language, newRate);
  };

  const handleAutoPlayToggle = (enabled: boolean) => {
    setAutoPlay(enabled);
    setStoredAutoplay(enabled);
  };

  // Keyboard navigation: Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);

  // Save last position
  useEffect(() => {
    const subjectId = lesson.language === 'sv' ? 'swedish' : 'english';
    progressService.updateLastPosition({
      subjectId,
      exerciseId: lesson.id,
      exerciseTitle: lesson.title,
      stage: currentStep ? `Step ${currentStepIndex + 1} (${currentStep.type})` : 'Interactive',
      sentenceIndex: currentStepIndex,
    });
  }, [lesson.id, lesson.language, lesson.title, currentStep, currentStepIndex]);

  // Calculate final metrics
  const totalElapsedSeconds = Math.max(1, Math.round((Date.now() - lessonStartTime) / 1000));
  const avgWpm =
    wpmSamples.length > 0
      ? Math.round(wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length)
      : Math.max(25, Math.round((accumulatedChars / 5) / (totalElapsedSeconds / 60)));
  const avgAccuracy =
    accuracySamples.length > 0
      ? Math.round(accuracySamples.reduce((a, b) => a + b, 0) / accuracySamples.length)
      : Math.max(80, 100 - accumulatedMistakes * 3);

  // Record completion
  const hasRecordedRef = useRef(false);
  useEffect(() => {
    if (isCompleted && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      const subjectId = lesson.language === 'sv' ? 'swedish' : 'english';
      progressService.recordExerciseCompletion({
        subjectId,
        exerciseId: lesson.id,
        exerciseTitle: lesson.title,
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
    isCompleted,
    lesson.id,
    lesson.language,
    lesson.title,
    avgWpm,
    avgAccuracy,
    accumulatedMistakes,
    totalElapsedSeconds,
    difficultWordsSession,
    onLessonComplete,
  ]);

  return (
    <div
      id="fullscreen-focus-mode"
      className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-[100dvh] w-full max-w-full selection:bg-amber-500/30 selection:text-white"
    >
      {/* Top Header */}
      <LessonHeader
        language={lesson.language}
        lessonTitle={lesson.title}
        currentIndex={currentStepIndex}
        totalSentences={totalSteps}
        stage={isCompleted ? 'completed' : 'listen_type'}
        isPlaying={isAudioPlaying}
        isLoadingAudio={isAudioLoading}
        audioError={audioError}
        onPlayAudio={() => handlePlayAudio(activeAudioText)}
        currentVoice={voice}
        onVoiceChange={handleVoiceChange}
        currentRate={rate}
        onRateChange={handleRateChange}
        autoPlay={autoPlay}
        onAutoPlayToggle={handleAutoPlayToggle}
        onExit={handleExit}
      />

      {/* Interactive Step Progress Tracker */}
      {!isCompleted && (
        <div className="w-full max-w-2xl mx-auto px-4 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-1.5">
            <span>
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="capitalize text-amber-400/90 font-medium">
              {currentStep?.type.replace('_', ' ')}
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
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

      {/* Main Focus / Interactive Step Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!isCompleted && currentStep && (
            <div key={currentStep.id || currentStepIndex} className="w-full flex justify-center">
              {currentStep.type === 'concept' && (
                <StepConcept
                  step={currentStep}
                  language={lesson.language}
                  onPlayAudio={handlePlayAudio}
                  isPlayingAudio={isAudioPlaying}
                  onContinue={handleNextStep}
                />
              )}

              {currentStep.type === 'flashcard' && (
                <StepFlashcard
                  step={currentStep}
                  language={lesson.language}
                  onPlayAudio={handlePlayAudio}
                  isPlayingAudio={isAudioPlaying}
                  onContinue={handleNextStep}
                />
              )}

              {currentStep.type === 'choice' && (
                <StepChoice
                  step={currentStep}
                  onRecordMistake={handleRecordStepMistake}
                  onContinue={handleNextStep}
                />
              )}

              {currentStep.type === 'comparison' && (
                <StepComparison
                  step={currentStep}
                  onContinue={handleNextStep}
                />
              )}

              {currentStep.type === 'type' && (
                <StepType
                  step={currentStep}
                  language={lesson.language}
                  onPlayAudio={handlePlayAudio}
                  isPlayingAudio={isAudioPlaying}
                  onComplete={handleStepCompleteTyping}
                  onContinue={handleNextStep}
                />
              )}

              {currentStep.type === 'sentence_builder' && (
                <StepSentenceBuilder
                  step={currentStep}
                  language={lesson.language}
                  onPlayAudio={handlePlayAudio}
                  isPlayingAudio={isAudioPlaying}
                  onRecordMistake={handleRecordStepMistake}
                  onContinue={handleNextStep}
                />
              )}

              {currentStep.type === 'dialogue' && (
                <StepDialogue
                  step={currentStep}
                  language={lesson.language}
                  onPlayAudio={handlePlayAudio}
                  isPlayingAudio={isAudioPlaying}
                  onComplete={handleStepCompleteTyping}
                  onContinue={handleNextStep}
                />
              )}

              {currentStep.type === 'recall' && (
                <StepRecall
                  step={currentStep}
                  language={lesson.language}
                  onPlayAudio={handlePlayAudio}
                  isPlayingAudio={isAudioPlaying}
                  onComplete={handleStepCompleteTyping}
                  onContinue={handleNextStep}
                />
              )}
            </div>
          )}

          {isCompleted && (
            <LessonResults
              lessonTitle={lesson.title}
              language={lesson.language}
              accuracy={avgAccuracy}
              wpm={avgWpm}
              mistakes={accumulatedMistakes}
              totalSeconds={totalElapsedSeconds}
              difficultWords={difficultWordsSession}
              onContinue={handleExit}
              onRetry={handleRestart}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-2 px-3 sm:px-4 border-t border-neutral-900/60 flex items-center justify-between text-[11px] text-neutral-600 font-mono select-none">
        <div className="hidden sm:flex items-center gap-4">
          <span>Esc to exit</span>
          <span>Interactive Session</span>
        </div>
        <div className="mx-auto sm:mx-0 text-center truncate">
          I learn by typing · {lesson.language === 'sv' ? 'Svenska' : 'English'}
        </div>
        <div className="hidden sm:block">
          Voice: {voice.split('-')[2] || voice}
        </div>
      </footer>
    </div>
  );
}
