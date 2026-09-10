import { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Keyboard, ArrowRight, CornerDownLeft, CheckCircle2 } from 'lucide-react';
import { TypeStep, Language } from '../../../types/lessons';
import { useTypingEngine, TypingSessionStats } from '../../../hooks/useTypingEngine';
import { TypingText } from '../TypingText';
import { motion } from 'motion/react';

interface StepTypeProps {
  step: TypeStep;
  language: Language;
  onPlayAudio: (text: string) => void;
  isPlayingAudio: boolean;
  onComplete: (stats: TypingSessionStats) => void;
  onContinue: () => void;
}

export function StepType({
  step,
  language,
  onPlayAudio,
  isPlayingAudio,
  onComplete,
  onContinue,
}: StepTypeProps) {
  const [isDone, setIsDone] = useState(false);
  const [lastStats, setLastStats] = useState<TypingSessionStats | null>(null);

  // Auto-play audio at start
  const hasAutoPlayedRef = useRef(false);
  useEffect(() => {
    setIsDone(false);
    setLastStats(null);
    if (!hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true;
      onPlayAudio(step.audioText || step.text);
    }
  }, [step.id, step.audioText, step.text, onPlayAudio]);

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
    targetText: step.text,
    language,
    onComplete: handleTypingComplete,
    disabled: isDone,
    sentenceContext: {
      text: step.text,
      translation: step.translation,
      lessonId: step.id,
    },
  });

  useEffect(() => {
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
          <Keyboard size={13} />
          <span>{step.stepTitle || 'Type to reinforce'}</span>
        </span>
      </div>

      {step.prompt && (
        <div className="text-xs sm:text-sm font-mono text-neutral-400 mb-2 text-center">
          {step.prompt}
        </div>
      )}

      {/* Typing Container */}
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
          disabled={isDone}
          onContainerClick={focusInput}
        />

        {step.translation && (
          <div className="text-sm sm:text-base text-neutral-400 font-serif italic mt-3 text-center px-4 max-w-lg select-none">
            “{step.translation}”
          </div>
        )}
      </div>

      {/* Bottom controls / Completed state */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        <button
          type="button"
          id="type-step-audio-btn"
          onClick={() => onPlayAudio(step.audioText || step.text)}
          className={`px-4 py-2 rounded-xl border transition-all text-xs sm:text-sm flex items-center gap-2 ${
            isPlayingAudio
              ? 'bg-amber-500 text-neutral-950 border-amber-400'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Volume2 size={16} />
          <span>Listen</span>
        </button>

        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-2 rounded-xl">
              <CheckCircle2 size={15} />
              <span>{lastStats ? `${lastStats.wpm} WPM · ${lastStats.accuracy}% acc` : 'Completed!'}</span>
            </span>

            <button
              type="button"
              id="type-step-continue-btn"
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
