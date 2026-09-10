import { useState, useEffect, useCallback } from 'react';
import { Volume2, HelpCircle, Brain, ArrowRight, CornerDownLeft, CheckCircle2 } from 'lucide-react';
import { RecallStep, Language } from '../../../types/lessons';
import { useTypingEngine, TypingSessionStats } from '../../../hooks/useTypingEngine';
import { TypingText } from '../TypingText';
import { motion } from 'motion/react';

interface StepRecallProps {
  step: RecallStep;
  language: Language;
  onPlayAudio: (text: string) => void;
  isPlayingAudio: boolean;
  onComplete: (stats: TypingSessionStats) => void;
  onContinue: () => void;
}

export function StepRecall({
  step,
  language,
  onPlayAudio,
  isPlayingAudio,
  onComplete,
  onContinue,
}: StepRecallProps) {
  const [showHint, setShowHint] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [lastStats, setLastStats] = useState<TypingSessionStats | null>(null);

  const handleTypingComplete = useCallback(
    (stats: TypingSessionStats) => {
      setIsDone(true);
      setLastStats(stats);
      onComplete(stats);
    },
    [onComplete]
  );

  const {
    typedText,
    characters,
    handleInputChange,
    resetTyping,
    focusInput,
    inputRef,
  } = useTypingEngine({
    targetText: step.targetText,
    language,
    onComplete: handleTypingComplete,
    disabled: isDone,
    sentenceContext: {
      text: step.targetText,
      translation: step.translation,
      lessonId: step.id,
    },
  });

  useEffect(() => {
    setIsDone(false);
    setLastStats(null);
    setShowHint(false);
    resetTyping();
    requestAnimationFrame(() => {
      focusInput();
    });
  }, [step.id, resetTyping, focusInput]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center px-2"
    >
      {/* Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Brain size={13} />
          <span>{step.stepTitle || 'Recall from Memory'}</span>
        </span>
      </div>

      {/* Meaning Prompt */}
      <div className="text-center mb-4 max-w-xl">
        <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
          {step.prompt || `Type in ${language === 'sv' ? 'Swedish' : 'English'}:`}
        </div>
        <div className="text-xl sm:text-2xl font-serif italic text-amber-300">
          “{step.translation}”
        </div>
      </div>

      {/* Typing Container in Recall Mode */}
      <div
        className="w-full flex flex-col items-center justify-center min-h-[160px] cursor-text"
        onClick={focusInput}
      >
        <TypingText
          characters={characters}
          typedLength={typedText.length}
          inputRef={inputRef}
          onInputChange={handleInputChange}
          typedValue={typedText}
          isRecallMode={!isDone}
          showHint={showHint || isDone}
          hintText={step.hint || step.targetText.slice(0, 10) + '...'}
          disabled={isDone}
          onContainerClick={focusInput}
        />
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
        {!isDone ? (
          <>
            <button
              type="button"
              id="recall-hint-btn"
              onClick={() => setShowHint((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl transition-colors font-mono"
            >
              <HelpCircle size={14} />
              <span>{showHint ? 'Hide Hint' : 'Need a Hint? (Tab)'}</span>
            </button>

            <button
              type="button"
              id="recall-audio-btn"
              onClick={() => onPlayAudio(step.audioText || step.targetText)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl transition-colors font-mono"
            >
              <Volume2 size={14} />
              <span>Audio Clue</span>
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-2 rounded-xl">
              <CheckCircle2 size={15} />
              <span>{lastStats ? `${lastStats.wpm} WPM · ${lastStats.accuracy}% acc` : 'Mastered!'}</span>
            </span>

            <button
              type="button"
              id="recall-continue-btn"
              onClick={onContinue}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-98"
            >
              <span>Next</span>
              <span className="hidden sm:inline-flex items-center text-xs opacity-75 font-mono">
                (Enter <CornerDownLeft size={12} className="inline ml-0.5" />)
              </span>
              <ArrowRight size={15} className="sm:hidden" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
