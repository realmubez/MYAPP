import { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  Target,
  HelpCircle,
} from 'lucide-react';
import { ReviewItem, SubjectId } from '../../types';
import { SwedishFlagIcon, BritishFlagIcon, PythonLogoIcon } from '../common/FlagIcons';
import { useTypingEngine } from '../../hooks/useTypingEngine';
import { TypingText } from '../focus/TypingText';
import { useLessonAudio } from '../../hooks/useLessonAudio';
import { reviewService, getMasteryLevel } from '../../services/reviewService';
import { progressService } from '../../services/progress';
import { typingSoundService } from '../../services/typingSoundService';
import { getStoredVoice, getStoredRate } from '../../services/tts';

interface ReviewSessionProps {
  items: ReviewItem[];
  onExit: () => void;
  onComplete?: () => void;
}

interface ItemResult {
  itemId: string;
  isCorrect: boolean;
  mistakes: number;
  wpm: number;
  accuracy: number;
}

export function ReviewSession({ items, onExit, onComplete }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<ItemResult[]>([]);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [sessionStartTime] = useState<number>(Date.now());
  const [showHint, setShowHint] = useState(false);

  // Audio / Sound state
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentItem: ReviewItem | undefined = items[currentIndex];
  const totalItems = items.length;

  // Target text for current review item
  const targetText = currentItem
    ? currentItem.subjectId === 'python'
      ? currentItem.codeSnippet || currentItem.text
      : currentItem.exampleSentence?.text || currentItem.text
    : '';

  const languageCode: 'sv' | 'en' =
    currentItem?.subjectId === 'swedish' ? 'sv' : 'en';

  const storedVoice = getStoredVoice(languageCode);
  const storedRate = getStoredRate(languageCode);

  // TTS audio for language items
  const { play: playAudio, isPlaying: isAudioPlaying } = useLessonAudio({
    text: currentItem?.subjectId !== 'python' ? targetText : '',
    language: languageCode,
    voice: storedVoice,
    rate: storedRate,
    autoPlay: currentItem?.subjectId !== 'python',
  });

  const handleManualPlayAudio = useCallback(() => {
    if (currentItem?.subjectId !== 'python') {
      playAudio();
    }
  }, [currentItem, playAudio]);

  // Handle completion of typing the current review item
  const handleItemComplete = useCallback(
    (stats: { wpm: number; accuracy: number; mistakes: number; totalChars: number; durationSeconds: number }) => {
      if (!currentItem) return;

      const isClean = stats.mistakes === 0;

      // Update mastery for this item in review service
      reviewService.recordSessionItemResult(currentItem.id, isClean, stats.mistakes);

      const result: ItemResult = {
        itemId: currentItem.id,
        isCorrect: isClean,
        mistakes: stats.mistakes,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
      };

      setSessionResults((prev) => [...prev, result]);

      // Move to next item or finish session
      if (currentIndex + 1 < totalItems) {
        setCurrentIndex((prev) => prev + 1);
        setShowHint(false);
      } else {
        // Finalize review session in progress service
        const totalDuration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
        const allResults = [...sessionResults, result];
        const totalMistakes = allResults.reduce((sum, r) => sum + r.mistakes, 0);
        const correctCount = allResults.filter((r) => r.isCorrect).length;
        const avgAcc = Math.round(
          allResults.reduce((sum, r) => sum + r.accuracy, 0) / allResults.length
        );
        const avgWpm = Math.round(
          allResults.reduce((sum, r) => sum + r.wpm, 0) / allResults.length
        );

        // Record to central progress service
        const firstSubId: SubjectId = currentItem.subjectId || 'swedish';
        progressService.recordExerciseCompletion({
          subjectId: firstSubId,
          exerciseId: `review-session-${Date.now()}`,
          exerciseTitle: `Mistake Review (${totalItems} items)`,
          unitTitle: 'Personalized Review',
          wpm: avgWpm,
          accuracy: avgAcc,
          mistakes: totalMistakes,
          durationSeconds: totalDuration,
        });

        setIsSessionFinished(true);
        onComplete?.();
      }
    },
    [currentItem, currentIndex, totalItems, sessionStartTime, sessionResults, onComplete]
  );

  const isItemCode = currentItem?.subjectId === 'python' || targetText.includes('\n');

  // Typing Engine
  const {
    typedText,
    characters,
    handleInputChange,
    resetTyping,
    focusInput,
    inputRef,
  } = useTypingEngine({
    targetText,
    language: isItemCode ? 'python' : languageCode,
    isCode: isItemCode,
    onComplete: handleItemComplete,
    disabled: isSessionFinished || !currentItem,
  });

  // Focus input on item change
  useEffect(() => {
    resetTyping();
    requestAnimationFrame(() => {
      focusInput();
    });
  }, [currentIndex, resetTyping, focusInput]);

  // Click container to re-focus
  const handleContainerClick = useCallback(() => {
    focusInput();
  }, [focusInput]);

  // Sound toggle
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      typingSoundService.setVolume(next ? 0.4 : 0);
      return next;
    });
  };

  // Keyboard navigation: Escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Summary Metrics
  if (isSessionFinished) {
    const totalDuration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
    const correctCount = sessionResults.filter((r) => r.isCorrect).length;
    const avgAcc =
      sessionResults.length > 0
        ? Math.round(sessionResults.reduce((sum, r) => sum + r.accuracy, 0) / sessionResults.length)
        : 100;
    const avgWpm =
      sessionResults.length > 0
        ? Math.round(sessionResults.reduce((sum, r) => sum + r.wpm, 0) / sessionResults.length)
        : 45;

    return (
      <div
        id="review-session-summary"
        className="min-h-screen bg-[#0a0908] text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6"
      >
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              SESSION COMPLETE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Review Completed!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {correctCount === totalItems
                ? 'Flawless recall! Mastery scores increased across all items.'
                : `Practiced ${totalItems} items · ${correctCount} correct with 0 mistakes.`}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Accuracy</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {avgAcc}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Speed</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {avgWpm} <span className="text-xs font-normal text-neutral-500">WPM</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Items Clean</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {correctCount} / {totalItems}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Study Time</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {totalDuration}s
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              id="review-summary-continue-btn"
              onClick={onExit}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-amber-400/20"
            >
              Back to Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-[#0a0908] text-neutral-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-neutral-400">No items available to review.</p>
          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 font-semibold text-xs"
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  const renderSubjectIcon = () => {
    switch (currentItem.subjectId) {
      case 'swedish':
        return <SwedishFlagIcon size={24} />;
      case 'english':
        return <BritishFlagIcon size={24} />;
      case 'python':
        return <PythonLogoIcon size={24} />;
      default:
        return <span>⌨️</span>;
    }
  };

  const masteryTier = getMasteryLevel(currentItem.masteryScore);

  return (
    <div
      id="review-session-screen"
      onClick={handleContainerClick}
      className="min-h-screen bg-[#0a0908] text-neutral-100 flex flex-col justify-between select-none cursor-text"
    >
      {/* 1. Header Bar */}
      <header className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="review-session-exit-btn"
            onClick={onExit}
            aria-label="Exit Review"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {renderSubjectIcon()}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Mistake Review
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {currentIndex + 1} / {totalItems}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {currentItem.displayTitle} · {currentItem.mistakeCount} past mistake{currentItem.mistakeCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {currentItem.subjectId !== 'python' && (
            <button
              type="button"
              id="review-session-audio-btn"
              onClick={handleManualPlayAudio}
              disabled={isAudioPlaying}
              aria-label="Play audio"
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                isAudioPlaying
                  ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            id="review-session-sound-toggle-btn"
            onClick={toggleSound}
            aria-label="Toggle typing sound"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-3">
        <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex) / totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* 2. Main Typing Area */}
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex-1 flex flex-col justify-center items-center">
        {/* Context / Prompt Card */}
        <div className="w-full bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-6 mb-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
              {currentItem.subjectId === 'python' ? 'PYTHON RECALL & CODE' : 'LISTEN & TYPE'}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400">
              Mastery: {currentItem.masteryScore}% ({masteryTier.replace('_', ' ')})
            </span>
          </div>

          {currentItem.subjectId === 'python' ? (
            <div className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-semibold text-white">
                {currentItem.prompt || 'Type the Python syntax statement:'}
              </h3>
              {currentItem.concept && (
                <p className="text-xs text-neutral-400 font-mono">
                  Topic: {currentItem.concept}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-medium text-white">
                {currentItem.exampleSentence?.translation || `Type: "${currentItem.text}"`}
              </h3>
              {currentItem.exampleSentence && (
                <p className="text-xs text-amber-300/80">
                  Target word: <span className="font-semibold underline decoration-amber-400/50">{currentItem.text}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Typing Surface */}
        <div className="w-full py-4 text-center">
          <TypingText
            characters={characters}
            typedLength={typedText.length}
            inputRef={inputRef}
            onInputChange={(val) => {
              handleInputChange({ target: { value: val } } as any);
            }}
            typedValue={typedText}
            disabled={isSessionFinished}
            onContainerClick={handleContainerClick}
            isRecallMode={false}
            isCode={isItemCode}
          />
        </div>

        {/* Hint toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            id="review-hint-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowHint(!showHint);
              focusInput();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{showHint ? 'Hide Hint' : 'Show Target Text'}</span>
          </button>
        </div>

        {showHint && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300 animate-in fade-in duration-150">
            {targetText}
          </div>
        )}
      </main>

      {/* 3. Footer Bar */}
      <footer className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-900">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Type directly to reinforce muscle memory
        </span>
        <span className="hidden sm:inline-block font-mono">
          ESC to exit session
        </span>
      </footer>
    </div>
  );
}
