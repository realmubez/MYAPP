import { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, ArrowRight, CornerDownLeft, MessageSquare, CheckCircle2 } from 'lucide-react';
import { DialogueStep, Language } from '../../../types/lessons';
import { useTypingEngine, TypingSessionStats } from '../../../hooks/useTypingEngine';
import { TypingText } from '../TypingText';
import { motion } from 'motion/react';

interface StepDialogueProps {
  step: DialogueStep;
  language: Language;
  onPlayAudio: (text: string) => void;
  isPlayingAudio: boolean;
  onComplete: (stats: TypingSessionStats) => void;
  onContinue: () => void;
}

export function StepDialogue({
  step,
  language,
  onPlayAudio,
  isPlayingAudio,
  onComplete,
  onContinue,
}: StepDialogueProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<number[]>([]);
  const [isTypingDoneForCurrentLine, setIsTypingDoneForCurrentLine] = useState(false);

  const currentLine = step.lines[currentLineIndex];
  const isLastLine = currentLineIndex === step.lines.length - 1;
  const isAssistantLine = currentLine?.speakerRole !== 'user';

  // Play audio when changing lines
  const playedLineRef = useRef<number | null>(null);
  useEffect(() => {
    setIsTypingDoneForCurrentLine(false);
    if (currentLine && playedLineRef.current !== currentLineIndex) {
      playedLineRef.current = currentLineIndex;
      onPlayAudio(currentLine.text);
    }
  }, [currentLineIndex, currentLine, onPlayAudio]);

  const handleLineTypingComplete = useCallback(
    (stats: TypingSessionStats) => {
      setIsTypingDoneForCurrentLine(true);
      setCompletedLines((prev) => (prev.includes(currentLineIndex) ? prev : [...prev, currentLineIndex]));
      onComplete(stats);
    },
    [currentLineIndex, onComplete]
  );

  const {
    typedText,
    characters,
    handleInputChange,
    resetTyping,
    focusInput,
    inputRef,
  } = useTypingEngine({
    targetText: currentLine && !isAssistantLine ? currentLine.text : '',
    language,
    onComplete: handleLineTypingComplete,
    disabled: isAssistantLine || isTypingDoneForCurrentLine,
    sentenceContext: currentLine
      ? {
          text: currentLine.text,
          translation: currentLine.translation,
          lessonId: step.id,
        }
      : undefined,
  });

  useEffect(() => {
    resetTyping();
    if (!isAssistantLine) {
      requestAnimationFrame(() => {
        focusInput();
      });
    }
  }, [currentLineIndex, isAssistantLine, resetTyping, focusInput]);

  const handleNextLine = useCallback(() => {
    if (!isLastLine) {
      setCurrentLineIndex((prev) => prev + 1);
    } else {
      onContinue();
    }
  }, [isLastLine, onContinue]);

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
          <MessageSquare size={13} />
          <span>{step.stepTitle || 'Interactive Dialogue'}</span>
        </span>
      </div>

      {/* Scenario header */}
      <div className="w-full text-center mb-4">
        <div className="text-xs font-mono text-neutral-400">
          {step.scenario}
        </div>
      </div>

      {/* Conversation Thread Box */}
      <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 sm:p-6 shadow-2xl space-y-4 mb-6">
        {step.lines.map((line, idx) => {
          const isCurrent = idx === currentLineIndex;
          const isPast = idx < currentLineIndex;
          const isUser = line.speakerRole === 'user';

          if (idx > currentLineIndex) return null; // Don't show future lines yet

          return (
            <motion.div
              key={line.id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-xs font-mono font-medium text-neutral-400">
                  {line.speaker}
                </span>
                {line.speakerRole === 'user' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    You
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onPlayAudio(line.text)}
                  className="text-neutral-500 hover:text-amber-400 transition-colors p-1"
                  title="Listen"
                >
                  <Volume2 size={13} />
                </button>
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-sm sm:text-base leading-relaxed ${
                  isUser
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-sm'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-tl-sm'
                }`}
              >
                {/* If it's a current line and user needs to type */}
                {isCurrent && isUser && !isTypingDoneForCurrentLine ? (
                  <div className="space-y-3">
                    <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                      Type your response:
                    </div>
                    <TypingText
                      characters={characters}
                      typedLength={typedText.length}
                      inputRef={inputRef}
                      onInputChange={handleInputChange}
                      typedValue={typedText}
                      onContainerClick={focusInput}
                    />
                    {line.translation && (
                      <div className="text-xs text-neutral-400 font-serif italic">
                        “{line.translation}”
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-white">{line.text}</div>
                    {line.translation && (
                      <div className="text-xs sm:text-sm text-neutral-400 font-serif italic mt-1">
                        “{line.translation}”
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="w-full flex items-center justify-between">
        <button
          type="button"
          onClick={() => onPlayAudio(currentLine?.text || '')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors"
        >
          <Volume2 size={14} />
          <span>Replay line</span>
        </button>

        {/* Continue button available if assistant line OR user finished typing current line */}
        {(isAssistantLine || isTypingDoneForCurrentLine) && (
          <button
            type="button"
            id="dialogue-continue-btn"
            onClick={handleNextLine}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-98"
          >
            <span>{isLastLine ? 'Finish Dialogue' : 'Next Turn'}</span>
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
