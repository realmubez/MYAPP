import { useState, useCallback } from 'react';
import { HelpCircle, Check, X, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { ChoiceStep } from '../../../types/lessons';
import { typingSoundService } from '../../../services/typingSoundService';
import { motion } from 'motion/react';

interface StepChoiceProps {
  step: ChoiceStep;
  onRecordMistake: (mistakeText: string) => void;
  onContinue: () => void;
}

export function StepChoice({ step, onRecordMistake, onContinue }: StepChoiceProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const selectedOption = step.options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (hasChecked && isCorrect) return; // already solved

      setSelectedOptionId(optionId);
      setHasChecked(true);

      const opt = step.options.find((o) => o.id === optionId);
      if (opt?.isCorrect) {
        typingSoundService.playCorrectKey();
      } else {
        typingSoundService.playIncorrectKey();
        onRecordMistake(`Distinguish quiz: "${step.question}"`);
      }
    },
    [hasChecked, isCorrect, step.options, step.question, onRecordMistake]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center px-2"
    >
      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <HelpCircle size={13} />
          <span>{step.stepTitle || 'Distinguish & Check'}</span>
        </span>
      </div>

      {/* Main Choice Card */}
      <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {step.scenario && (
          <div className="text-xs sm:text-sm font-sans text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 leading-relaxed">
            <span className="font-semibold text-amber-400">Scenario:</span> {step.scenario}
          </div>
        )}

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {step.question}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {step.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            let containerStyle = 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40 text-neutral-200';
            let icon = <span className="font-mono text-xs text-neutral-500">{idx + 1}</span>;

            if (hasChecked && isSelected) {
              if (option.isCorrect) {
                containerStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-md shadow-emerald-950/30';
                icon = <Check size={16} className="text-emerald-400" />;
              } else {
                containerStyle = 'bg-red-950/40 border-red-500/60 text-red-200 shadow-md shadow-red-950/30';
                icon = <X size={16} className="text-red-400" />;
              }
            } else if (hasChecked && option.isCorrect && !isCorrect) {
              // Show correct answer if wrong one was picked
              containerStyle = 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300';
              icon = <Check size={16} className="text-emerald-400" />;
            }

            return (
              <button
                key={option.id}
                type="button"
                id={`choice-option-${idx}`}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full text-left p-4 sm:p-4.5 rounded-xl border transition-all flex items-start gap-3.5 ${containerStyle} active:scale-99`}
              >
                <div className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm sm:text-base font-medium leading-snug">
                    {option.text}
                  </div>
                  {hasChecked && isSelected && option.explanation && (
                    <div className="text-xs sm:text-sm mt-1.5 opacity-90 leading-relaxed font-sans">
                      {option.explanation}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Global explanation banner after response */}
        {hasChecked && step.explanation && (
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            <span className="font-semibold text-amber-400 block mb-1">Key Distinction:</span>
            {step.explanation}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 w-full flex justify-end">
        {hasChecked && (
          <button
            type="button"
            id="choice-continue-btn"
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm sm:text-base transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98"
          >
            <span>{isCorrect ? 'Correct! Continue' : 'Understood, continue'}</span>
            <span className="hidden sm:inline-flex items-center text-xs opacity-75 font-mono ml-1">
              (Enter <CornerDownLeft size={13} className="inline ml-0.5" />)
            </span>
            <ArrowRight size={16} className="sm:hidden" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
