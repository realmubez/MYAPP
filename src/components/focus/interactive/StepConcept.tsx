import { useEffect } from 'react';
import { Volume2, ArrowRight, CornerDownLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { ConceptStep, Language } from '../../../types/lessons';
import { motion } from 'motion/react';

interface StepConceptProps {
  step: ConceptStep;
  language: Language;
  onPlayAudio: (text: string) => void;
  isPlayingAudio: boolean;
  onContinue: () => void;
}

export function StepConcept({
  step,
  language,
  onPlayAudio,
  isPlayingAudio,
  onContinue,
}: StepConceptProps) {
  useEffect(() => {
    if (step.audioText) {
      onPlayAudio(step.audioText);
    }
  }, [step.id, step.audioText, onPlayAudio]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center text-left px-2"
    >
      {/* Step Badge */}
      <div className="flex items-center gap-2 mb-4 self-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Sparkles size={13} className="text-amber-400" />
          <span>{step.stepTitle || 'Core Concept'}</span>
        </span>
      </div>

      {/* Main Concept Card */}
      <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/50 via-amber-400 to-amber-600/50" />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {step.conceptName && (
              <span className="text-xs font-mono text-amber-500 uppercase tracking-wider block mb-1">
                {step.conceptName}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {step.title}
            </h2>
          </div>

          {(step.audioText || step.example?.text) && (
            <button
              type="button"
              id="concept-audio-btn"
              onClick={() => onPlayAudio(step.audioText || step.example?.text || '')}
              className={`p-3 rounded-xl border transition-all ${
                isPlayingAudio
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
              }`}
              title="Listen to pronunciation"
            >
              <Volume2 size={20} className={isPlayingAudio ? 'animate-pulse' : ''} />
            </button>
          )}
        </div>

        {/* Explanation Text */}
        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-sans mb-6">
          {step.explanation}
        </p>

        {/* Bullet Points */}
        {step.bulletPoints && step.bulletPoints.length > 0 && (
          <div className="space-y-2.5 mb-6 bg-neutral-950/60 rounded-xl p-4 sm:p-5 border border-neutral-800/80">
            {step.bulletPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-neutral-200">{point}</span>
              </div>
            ))}
          </div>
        )}

        {/* Example Box */}
        {step.example && (
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 sm:p-5 mb-2">
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              Example in Context
            </div>
            <div className="text-lg sm:text-xl font-medium text-white mb-1">
              “{step.example.text}”
            </div>
            {step.example.translation && (
              <div className="text-sm text-neutral-400 font-serif italic">
                {step.example.translation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 sm:mt-8 w-full flex justify-end">
        <button
          type="button"
          id="concept-continue-btn"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm sm:text-base transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98"
        >
          <span>Got it, continue</span>
          <span className="hidden sm:inline-flex items-center text-xs opacity-75 font-mono ml-1">
            (Enter <CornerDownLeft size={13} className="inline ml-0.5" />)
          </span>
          <ArrowRight size={16} className="sm:hidden" />
        </button>
      </div>
    </motion.div>
  );
}
