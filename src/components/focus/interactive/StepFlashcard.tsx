import { useState, useEffect, useCallback } from 'react';
import { Volume2, ArrowRight, CornerDownLeft, RotateCw, BookOpen } from 'lucide-react';
import { FlashcardStep, Language } from '../../../types/lessons';
import { motion, AnimatePresence } from 'motion/react';

interface StepFlashcardProps {
  step: FlashcardStep;
  language: Language;
  onPlayAudio: (text: string) => void;
  isPlayingAudio: boolean;
  onContinue: () => void;
}

export function StepFlashcard({
  step,
  language,
  onPlayAudio,
  isPlayingAudio,
  onContinue,
}: StepFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Auto-play pronunciation once when card loads
  useEffect(() => {
    setIsFlipped(false);
    onPlayAudio(step.audioText || step.term);
  }, [step.id, step.audioText, step.term, onPlayAudio]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-xl mx-auto flex flex-col items-center px-2"
    >
      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <BookOpen size={13} />
          <span>{step.stepTitle || 'Vocabulary Flashcard'}</span>
        </span>
      </div>

      {/* Interactive Flashcard with Flip */}
      <div
        id="flashcard-main"
        onClick={handleFlip}
        className="w-full min-h-[300px] sm:min-h-[340px] rounded-2xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 shadow-2xl relative cursor-pointer select-none transition-all hover:border-neutral-700 flex flex-col justify-between"
      >
        {/* Top bar with part of speech and audio button */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {step.partOfSpeech && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-neutral-800 text-amber-400 border border-neutral-700">
                {step.partOfSpeech}
              </span>
            )}
            <span className="text-xs font-mono text-neutral-500">
              {isFlipped ? 'Meaning & Example' : 'Click to flip card'}
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              id="flashcard-audio-btn"
              onClick={() => onPlayAudio(step.audioText || step.term)}
              className={`p-2.5 rounded-xl border transition-all ${
                isPlayingAudio
                  ? 'bg-amber-500 text-neutral-950 border-amber-400'
                  : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
              }`}
              title="Play audio"
            >
              <Volume2 size={18} className={isPlayingAudio ? 'animate-pulse' : ''} />
            </button>
          </div>
        </div>

        {/* Card Content Area with Animated Transition */}
        <div className="my-auto py-4 text-center">
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {step.term}
                </h3>
                {step.phonetic && (
                  <div className="text-sm sm:text-base font-mono text-amber-400/80">
                    {step.phonetic}
                  </div>
                )}
                <div className="text-xs text-neutral-500 flex items-center justify-center gap-1.5 pt-2">
                  <RotateCw size={13} />
                  <span>Click anywhere to reveal meaning</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-500 mb-1">
                    Definition / Translation
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-white">
                    {step.translation}
                  </div>
                </div>

                {step.explanation && (
                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                    {step.explanation}
                  </p>
                )}

                {step.exampleSentence && (
                  <div className="bg-neutral-950/70 rounded-xl p-4 border border-neutral-800">
                    <div className="text-xs font-mono text-neutral-400 mb-1">Example:</div>
                    <div className="text-sm sm:text-base font-medium text-amber-200">
                      “{step.exampleSentence.text}”
                    </div>
                    {step.exampleSentence.translation && (
                      <div className="text-xs sm:text-sm text-neutral-400 font-serif italic mt-0.5">
                        {step.exampleSentence.translation}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card bottom hint */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs text-neutral-500 font-mono">
          <span>{step.term}</span>
          <span>Space to flip</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 w-full flex items-center justify-between gap-3">
        <button
          type="button"
          id="flashcard-flip-btn"
          onClick={handleFlip}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs sm:text-sm font-medium transition-all"
        >
          <RotateCw size={14} />
          <span>{isFlipped ? 'Show Term' : 'Show Meaning (Space)'}</span>
        </button>

        <button
          type="button"
          id="flashcard-continue-btn"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98"
        >
          <span>Continue</span>
          <span className="hidden sm:inline-flex items-center text-xs opacity-75 font-mono ml-1">
            (Enter <CornerDownLeft size={12} className="inline ml-0.5" />)
          </span>
          <ArrowRight size={15} className="sm:hidden" />
        </button>
      </div>
    </motion.div>
  );
}
