import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CornerDownLeft, HelpCircle } from 'lucide-react';
import { LanguageLesson, LessonStage, DifficultWord } from '../../types/lessons';
import { useTypingEngine } from '../../hooks/useTypingEngine';
import { useLessonAudio } from '../../hooks/useLessonAudio';
import { LessonHeader } from './LessonHeader';
import { TypingText } from './TypingText';
import { LessonResults } from './LessonResults';
import { InteractiveLessonEngine } from './interactive/InteractiveLessonEngine';
import { PhonePlansLessonEngine } from './interactive/PhonePlansLessonEngine';
import { PaCafeLessonEngine } from './interactive/PaCafeLessonEngine';
import { SwedishStoryLessonEngine } from './interactive/SwedishStoryLessonEngine';
import { progressService } from '../../services/progress';
import {
  getStoredVoice,
  setStoredVoice,
  getStoredRate,
  setStoredRate,
  getStoredAutoplay,
  setStoredAutoplay,
  unlockAudio,
  TTSRate,
} from '../../services/tts';

interface FocusLessonProps {
  lesson: LanguageLesson;
  onExit?: () => void;
  onLessonComplete?: (stats: {
    accuracy: number;
    wpm: number;
    mistakes: number;
    difficultWords: DifficultWord[];
  }) => void;
}

export function FocusLesson({
  lesson,
  onExit,
  onLessonComplete,
}: FocusLessonProps) {
  // If the lesson is the experimental Phone Plans lesson, use PhonePlansLessonEngine
  if (lesson.id === 'en-phone-plans' || lesson.id.includes('phone-plans')) {
    return (
      <PhonePlansLessonEngine
        lesson={lesson}
        onExit={onExit}
        onLessonComplete={onLessonComplete}
      />
    );
  }

  // If the lesson is the experimental Swedish På Café lesson, use PaCafeLessonEngine
  if (lesson.id === 'sv-pa-cafe' || lesson.id.includes('pa-cafe') || lesson.id === 'sv-b1-u08-ex4') {
    return (
      <PaCafeLessonEngine
        lesson={lesson}
        onExit={onExit}
        onLessonComplete={onLessonComplete}
      />
    );
  }

  // If the lesson is the Swedish Story lesson (Unit 2), use SwedishStoryLessonEngine
  if (lesson.id === 'sv-en-vanlig-morgon' || lesson.id.includes('en-vanlig-morgon') || lesson.id.includes('morgon')) {
    return (
      <SwedishStoryLessonEngine
        onExit={onExit}
        onComplete={() => {
          if (onLessonComplete) {
            onLessonComplete({
              accuracy: 100,
              wpm: 35,
              mistakes: 0,
              difficultWords: [],
            });
          }
        }}
      />
    );
  }

  // If the lesson contains structured interactive steps, use the InteractiveLessonEngine
  if (lesson.steps && lesson.steps.length > 0) {
    return (
      <InteractiveLessonEngine
        lesson={lesson}
        onExit={onExit}
        onLessonComplete={onLessonComplete}
      />
    );
  }

  const navigate = useNavigate();


  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [stage, setStage] = useState<LessonStage>('listen_type');
  const [showHint, setShowHint] = useState<boolean>(false);

  // Lesson state accumulators
  const [accumulatedMistakes, setAccumulatedMistakes] = useState<number>(0);
  const [accumulatedChars, setAccumulatedChars] = useState<number>(0);
  const [difficultWordsSession, setDifficultWordsSession] = useState<DifficultWord[]>([]);
  const [lessonStartTime] = useState<number>(() => Date.now());

  // Settings from localStorage
  const [voice, setVoice] = useState<string>(() => getStoredVoice(lesson.language));
  const [rate, setRate] = useState<TTSRate>(() => getStoredRate(lesson.language));
  const [autoPlay, setAutoPlay] = useState<boolean>(() => getStoredAutoplay());

  const currentSentence = lesson.sentences[currentSentenceIndex];
  const totalSentences = lesson.sentences.length;

  // Unified exit handler: always navigate to Dashboard ('/') cleanly
  const handleExit = useCallback(() => {
    stopAudio();
    if (onExit) {
      onExit();
    }
    navigate('/');
  }, [onExit, navigate]);

  // Audio setup
  const {
    play: playAudio,
    stop: stopAudio,
    isPlaying: isAudioPlaying,
    isLoading: isAudioLoading,
    error: audioError,
  } = useLessonAudio({
    text: currentSentence?.text || '',
    language: lesson.language,
    voice,
    rate,
    autoPlay: false,
  });

  // Manual replay with audio unlocking on user gesture
  const handleManualPlayAudio = useCallback(() => {
    unlockAudio();
    playAudio();
  }, [playAudio]);

  // Track sentence playback to ensure each sentence auto-plays strictly ONCE in listen_type stage
  const autoPlayedSentenceRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Only auto-play if setting is enabled
    if (!autoPlay) return;

    // 2. Only auto-play in Stage 1 (listen_type)
    if (stage !== 'listen_type') return;

    // 3. Must have a valid sentence
    if (!currentSentence || !currentSentence.text) return;

    // Stable sentence key: lesson ID + sentence index + sentence ID
    const sentenceKey = `${lesson.id}:${currentSentenceIndex}:${currentSentence.id}`;

    // 4. Do not replay if already played for this sentence
    if (autoPlayedSentenceRef.current === sentenceKey) return;

    // Mark as played BEFORE calling play to prevent duplicate triggers
    autoPlayedSentenceRef.current = sentenceKey;

    playAudio();
  }, [autoPlay, stage, currentSentenceIndex, currentSentence, lesson.id, playAudio]);

  // When transitioning to recall stage, silence any playing audio from understand stage
  useEffect(() => {
    if (stage === 'recall') {
      stopAudio();
    }
  }, [stage, stopAudio]);

  // Target text for typing engine
  const targetText = currentSentence ? currentSentence.text : '';

  // Container & Input references
  const containerRef = useRef<HTMLDivElement | null>(null);

  // When a sentence is completed
  const handleSentenceComplete = useCallback((stats?: { mistakes: number; totalChars: number }) => {
    if (stats) {
      setAccumulatedMistakes((prev) => prev + stats.mistakes);
    }
    if (stage === 'listen_type') {
      setStage('understand');
    } else if (stage === 'recall') {
      if (currentSentenceIndex + 1 < totalSentences) {
        setCurrentSentenceIndex((prev) => prev + 1);
        setStage('listen_type');
        setShowHint(false);
      } else {
        setStage('completed');
      }
    }
  }, [stage, currentSentenceIndex, totalSentences]);

  // Typing Engine Hook
  const {
    typedText,
    characters,
    handleInputChange,
    resetTyping,
    focusInput,
    inputRef,
  } = useTypingEngine({
    targetText: stage === 'understand' ? '' : targetText,
    language: lesson.language,
    onComplete: handleSentenceComplete,
    disabled: stage === 'understand' || stage === 'completed',
    sentenceContext: currentSentence
      ? {
          text: currentSentence.text,
          translation: currentSentence.translation,
          lessonId: lesson.id,
          unitTitle: lesson.title,
        }
      : undefined,
  });

  // Keep track of total typed characters
  useEffect(() => {
    if (targetText && (stage === 'listen_type' || stage === 'recall')) {
      setAccumulatedChars((prev) => prev + targetText.length);
    }
  }, [currentSentenceIndex, stage, targetText]);

  // Reset typed input when sentence or stage transitions
  useEffect(() => {
    resetTyping();
    setShowHint(false);
    if (stage === 'listen_type' || stage === 'recall') {
      requestAnimationFrame(() => {
        focusInput();
      });
    }
  }, [currentSentenceIndex, stage, resetTyping, focusInput]);

  // Keyboard navigation: ESC, Enter, Tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleExit();
      } else if (e.key === 'Enter' && stage === 'understand') {
        e.preventDefault();
        setStage('recall');
      } else if (e.key === 'Tab' && stage === 'recall') {
        e.preventDefault();
        setShowHint((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, handleExit]);

  // Settings Handlers
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

  // Replay sentence or restart lesson
  const handleRestartLesson = () => {
    stopAudio();
    autoPlayedSentenceRef.current = null;
    setCurrentSentenceIndex(0);
    setStage('listen_type');
    setAccumulatedMistakes(0);
    setAccumulatedChars(0);
    setShowHint(false);
    resetTyping();
  };

  const handleContainerInteraction = useCallback(() => {
    unlockAudio();
    focusInput();
  }, [focusInput]);

  // Calculate final metrics for completed stage
  const totalElapsedSeconds = Math.max(1, Math.round((Date.now() - lessonStartTime) / 1000));
  const totalCharsFinal = Math.max(1, accumulatedChars);
  const finalAccuracy = Math.max(
    0,
    Math.min(100, Math.round(((totalCharsFinal - accumulatedMistakes) / totalCharsFinal) * 100))
  );
  const finalWpm = Math.max(1, Math.round((totalCharsFinal / 5) / (totalElapsedSeconds / 60)));

  // Automatically update last position
  useEffect(() => {
    const subjectId = lesson.language === 'sv' ? 'swedish' : 'english';
    progressService.updateLastPosition({
      subjectId,
      exerciseId: lesson.id,
      exerciseTitle: lesson.title,
      stage,
      sentenceIndex: currentSentenceIndex,
    });
  }, [lesson.id, lesson.language, lesson.title, stage, currentSentenceIndex]);

  // Report and record completion
  const hasRecordedRef = useRef(false);
  useEffect(() => {
    if (stage === 'completed' && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      const subjectId = lesson.language === 'sv' ? 'swedish' : 'english';
      progressService.recordExerciseCompletion({
        subjectId,
        exerciseId: lesson.id,
        exerciseTitle: lesson.title,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        mistakes: accumulatedMistakes,
        durationSeconds: totalElapsedSeconds,
        difficultWords: difficultWordsSession.map((d) => d.word),
      });

      if (onLessonComplete) {
        onLessonComplete({
          accuracy: finalAccuracy,
          wpm: finalWpm,
          mistakes: accumulatedMistakes,
          difficultWords: difficultWordsSession,
        });
      }
    }
  }, [
    stage,
    lesson.id,
    lesson.language,
    lesson.title,
    finalAccuracy,
    finalWpm,
    accumulatedMistakes,
    totalElapsedSeconds,
    difficultWordsSession,
    onLessonComplete,
  ]);


  return (
    <div
      ref={containerRef}
      id="fullscreen-focus-mode"
      className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-[100dvh] w-full max-w-full selection:bg-amber-500/30 selection:text-white"
    >
      {/* Top Header */}
      <LessonHeader
        language={lesson.language}
        lessonTitle={lesson.title}
        currentIndex={currentSentenceIndex}
        totalSentences={totalSentences}
        stage={stage}
        isPlaying={isAudioPlaying}
        isLoadingAudio={isAudioLoading}
        audioError={audioError}
        onPlayAudio={handleManualPlayAudio}
        currentVoice={voice}
        onVoiceChange={handleVoiceChange}
        currentRate={rate}
        onRateChange={handleRateChange}
        autoPlay={autoPlay}
        onAutoPlayToggle={handleAutoPlayToggle}
        onExit={handleExit}
      />

      {/* Main Focus Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-8 w-full max-w-4xl mx-auto">
        {stage === 'listen_type' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
            {/* Stage Guidance */}
            <div className="text-[11px] sm:text-xs uppercase tracking-widest text-neutral-500 mb-2 font-mono text-center">
              Listen & Type
            </div>

            {/* Monkeytype-style typing text */}
            <TypingText
              characters={characters}
              typedLength={typedText.length}
              inputRef={inputRef}
              onInputChange={handleInputChange}
              typedValue={typedText}
              onContainerClick={handleContainerInteraction}
            />

            {/* Subtle translation preview underneath */}
            {currentSentence?.translation && (
              <div className="text-xs sm:text-sm text-neutral-500 font-sans mt-2 sm:mt-3 text-center select-none px-2 max-w-lg break-words">
                {currentSentence.translation}
              </div>
            )}
          </div>
        )}

        {stage === 'understand' && (
          <div className="w-full max-w-2xl text-center px-2 sm:px-4 py-4 sm:py-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-500/80 mb-3 sm:mb-4 font-mono">
              Stage 2 · Understand
            </div>

            {/* Target original sentence */}
            <div className="text-xl sm:text-3xl font-medium text-white mb-2 sm:mb-3 break-words px-2">
              {currentSentence?.text}
            </div>

            {/* Translation meaning */}
            <div className="text-base sm:text-xl text-amber-300/90 mb-6 sm:mb-8 font-serif italic break-words px-2">
              “{currentSentence?.translation}”
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-none mx-auto">
              <button
                type="button"
                id="understand-listen-again-btn"
                onClick={handleManualPlayAudio}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs sm:text-sm font-medium transition-colors text-center"
              >
                Listen again 🔊
              </button>

              <button
                type="button"
                id="understand-continue-recall-btn"
                onClick={() => setStage('recall')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 font-semibold text-xs sm:text-sm transition-colors shadow-lg"
              >
                <span>Continue to Recall</span>
                <span className="hidden sm:inline-flex items-center text-xs opacity-75 font-mono">
                  (Enter <CornerDownLeft size={12} className="inline ml-0.5" />)
                </span>
                <ArrowRight size={15} className="sm:hidden" />
              </button>
            </div>
          </div>
        )}

        {stage === 'recall' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
            {/* Stage Guidance */}
            <div className="text-[11px] sm:text-xs uppercase tracking-widest text-neutral-500 mb-1 font-mono text-center">
              Stage 3 · Recall from memory
            </div>

            {/* Prompt */}
            <div className="text-xs sm:text-base text-neutral-400 mb-4 sm:mb-6 text-center max-w-xl px-2">
              <span>Type in {lesson.language === 'sv' ? 'Swedish' : 'English'}:</span>
              <span className="block text-sm sm:text-xl text-neutral-200 font-serif italic mt-1 break-words">
                “{currentSentence?.translation}”
              </span>
            </div>

            {/* Typing text in recall mode */}
            <TypingText
              characters={characters}
              typedLength={typedText.length}
              inputRef={inputRef}
              onInputChange={handleInputChange}
              typedValue={typedText}
              isRecallMode={true}
              showHint={showHint}
              hintText={currentSentence?.hint || currentSentence?.text.slice(0, 8) + '...'}
              onContainerClick={handleContainerInteraction}
            />

            {/* Recall Action Controls */}
            <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3 w-full max-w-xs sm:max-w-none px-2">
              <button
                type="button"
                id="recall-hint-toggle-btn"
                onClick={() => setShowHint(!showHint)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/80 px-3 py-2 rounded-xl transition-colors font-mono"
              >
                <HelpCircle size={14} />
                <span className="sm:hidden">{showHint ? 'Hide' : 'Hint'}</span>
                <span className="hidden sm:inline">{showHint ? 'Hide Hint' : 'Need a Hint? (Tab)'}</span>
              </button>

              <button
                type="button"
                id="recall-listen-hint-btn"
                onClick={handleManualPlayAudio}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 text-xs text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/80 px-3 py-2 rounded-xl transition-colors font-mono"
              >
                <span>Audio</span>
                <span>🔊</span>
              </button>
            </div>
          </div>
        )}

        {stage === 'completed' && (
          <LessonResults
            lessonTitle={lesson.title}
            language={lesson.language}
            accuracy={finalAccuracy}
            wpm={finalWpm}
            mistakes={accumulatedMistakes}
            totalSeconds={totalElapsedSeconds}
            difficultWords={difficultWordsSession}
            onContinue={handleExit}
            onRetry={handleRestartLesson}
            onRetryDifficult={
              difficultWordsSession.length > 0 ? handleRestartLesson : undefined
            }
          />
        )}
      </main>

      {/* Ultra-minimal bottom footer */}
      <footer className="w-full py-2 px-3 sm:px-4 border-t border-neutral-900/60 flex items-center justify-between text-[11px] text-neutral-600 font-mono select-none">
        <div className="hidden sm:flex items-center gap-4">
          <span>Esc to exit</span>
          <span>Tab for hint</span>
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
