import { useState, useCallback, useEffect } from 'react';
import { Volume2, ArrowRight, CornerDownLeft, Undo2, CheckCircle2, Layers } from 'lucide-react';
import { SentenceBuilderStep, Language } from '../../../types/lessons';
import { typingSoundService } from '../../../services/typingSoundService';
import { motion } from 'motion/react';

interface StepSentenceBuilderProps {
  step: SentenceBuilderStep;
  language: Language;
  onPlayAudio: (text: string) => void;
  isPlayingAudio: boolean;
  onRecordMistake: (mistakeText: string) => void;
  onContinue: () => void;
}

export function StepSentenceBuilder({
  step,
  language,
  onPlayAudio,
  isPlayingAudio,
  onRecordMistake,
  onContinue,
}: StepSentenceBuilderProps) {
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Shuffle or initialize tokens with unique keys
    setAvailableTokens([...step.scrambledTokens]);
    setSelectedTokens([]);
    setIsCompleted(false);
    setShowError(false);
  }, [step.id, step.scrambledTokens]);

  const handleSelectToken = useCallback(
    (tokenIndex: number) => {
      if (isCompleted) return;

      const token = availableTokens[tokenIndex];
      const newAvailable = availableTokens.filter((_, idx) => idx !== tokenIndex);
      const newSelected = [...selectedTokens, token];

      setAvailableTokens(newAvailable);
      setSelectedTokens(newSelected);
      setShowError(false);
      typingSoundService.playCorrectKey();

      // Check if all tokens have been placed
      if (newAvailable.length === 0) {
        const constructedSentence = newSelected.join(' ');
        const cleanTarget = step.targetSentence.replace(/[.,?!]/g, '').trim().toLowerCase();
        const cleanConstructed = constructedSentence.replace(/[.,?!]/g, '').trim().toLowerCase();

        if (cleanConstructed === cleanTarget) {
          setIsCompleted(true);
          typingSoundService.playCorrectKey();
          onPlayAudio(step.audioText || step.targetSentence);
        } else {
          setShowError(true);
          typingSoundService.playIncorrectKey();
          onRecordMistake(`Sentence builder: "${step.targetSentence}"`);
        }
      }
    },
    [availableTokens, selectedTokens, isCompleted, step.targetSentence, step.audioText, onPlayAudio, onRecordMistake]
  );

  const handleRemoveSelectedToken = useCallback(
    (selectedIndex: number) => {
      if (isCompleted) return;

      const token = selectedTokens[selectedIndex];
      const newSelected = selectedTokens.filter((_, idx) => idx !== selectedIndex);
      const newAvailable = [...availableTokens, token];

      setSelectedTokens(newSelected);
      setAvailableTokens(newAvailable);
      setShowError(false);
      typingSoundService.playIncorrectKey();
    },
    [selectedTokens, availableTokens, isCompleted]
  );

  const handleReset = useCallback(() => {
    setAvailableTokens([...step.scrambledTokens]);
    setSelectedTokens([]);
    setIsCompleted(false);
    setShowError(false);
  }, [step.scrambledTokens]);

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
          <Layers size={13} />
          <span>{step.stepTitle || 'Sentence Builder'}</span>
        </span>
      </div>

      {/* Meaning Prompt */}
      <div className="text-center mb-6 max-w-lg">
        <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
          {step.prompt || 'Assemble the English sentence'}
        </div>
        <div className="text-lg sm:text-2xl font-serif italic text-amber-300">
          “{step.translation}”
        </div>
      </div>

      {/* Target Construction Area */}
      <div className="w-full min-h-[100px] rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 sm:p-6 shadow-xl flex flex-wrap items-center gap-2 mb-6">
        {selectedTokens.length === 0 ? (
          <div className="text-neutral-600 text-sm sm:text-base font-mono mx-auto select-none">
            Tap words below in the correct sequence...
          </div>
        ) : (
          selectedTokens.map((token, idx) => (
            <button
              key={`${token}-${idx}`}
              type="button"
              onClick={() => handleRemoveSelectedToken(idx)}
              className={`px-3.5 py-2 rounded-xl text-sm sm:text-base font-medium transition-all ${
                isCompleted
                  ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                  : 'bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 active:scale-95'
              }`}
            >
              {token}
            </button>
          ))
        )}
      </div>

      {/* Error notification if order is incorrect */}
      {showError && (
        <div className="text-xs sm:text-sm font-mono text-red-400 bg-red-950/60 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between w-full">
          <span>Not quite right. Tap a word to remove it or reset!</span>
          <button
            type="button"
            onClick={handleReset}
            className="underline hover:text-red-300 ml-2"
          >
            Reset
          </button>
        </div>
      )}

      {/* Available Word Bank */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2.5 mb-6">
        {availableTokens.map((token, idx) => (
          <button
            key={`${token}-${idx}`}
            type="button"
            id={`word-token-${idx}`}
            onClick={() => handleSelectToken(idx)}
            className="px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 text-neutral-200 text-sm sm:text-base font-medium transition-all active:scale-95 shadow-sm"
          >
            {token}
          </button>
        ))}
      </div>

      {/* Bottom Action / Continue */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {selectedTokens.length > 0 && !isCompleted && (
            <button
              type="button"
              id="sentence-builder-reset-btn"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs border border-neutral-800 transition-colors"
            >
              <Undo2 size={14} />
              <span>Reset</span>
            </button>
          )}

          {isCompleted && (
            <button
              type="button"
              id="sentence-builder-audio-btn"
              onClick={() => onPlayAudio(step.audioText || step.targetSentence)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white text-xs border border-neutral-800 transition-colors"
            >
              <Volume2 size={15} />
              <span>Listen</span>
            </button>
          )}
        </div>

        {isCompleted && (
          <button
            type="button"
            id="sentence-builder-continue-btn"
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-98"
          >
            <span>Awesome! Continue</span>
            <span className="hidden sm:inline-flex items-center text-xs opacity-75 font-mono ml-1">
              (Enter <CornerDownLeft size={12} className="inline ml-0.5" />)
            </span>
            <ArrowRight size={15} className="sm:hidden" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
