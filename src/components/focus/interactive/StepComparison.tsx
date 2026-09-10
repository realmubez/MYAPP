import { ArrowRight, CornerDownLeft, Scale, CheckCircle2 } from 'lucide-react';
import { ComparisonStep } from '../../../types/lessons';
import { motion } from 'motion/react';

interface StepComparisonProps {
  step: ComparisonStep;
  onContinue: () => void;
}

export function StepComparison({ step, onContinue }: StepComparisonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-3xl mx-auto flex flex-col items-center px-2"
    >
      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Scale size={13} />
          <span>{step.stepTitle || 'Compare & Understand'}</span>
        </span>
      </div>

      {/* Heading */}
      <div className="text-center mb-6 max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {step.title}
        </h2>
        {step.subtitle && (
          <p className="text-sm sm:text-base text-neutral-400 mt-1.5">
            {step.subtitle}
          </p>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
        {/* Concept A */}
        <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-amber-300">
                {step.conceptA.title}
              </h3>
              {step.conceptA.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {step.conceptA.badge}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 mb-4 leading-relaxed">
              {step.conceptA.description}
            </p>

            <div className="space-y-2.5">
              {step.conceptA.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Concept B */}
        <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-100">
                {step.conceptB.title}
              </h3>
              {step.conceptB.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {step.conceptB.badge}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 mb-4 leading-relaxed">
              {step.conceptB.description}
            </p>

            <div className="space-y-2.5">
              {step.conceptB.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <CheckCircle2 size={16} className="text-neutral-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Difference takeaway note */}
      {step.keyDifference && (
        <div className="w-full rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 sm:p-5 text-xs sm:text-sm text-amber-200/90 leading-relaxed text-center">
          <span className="font-semibold text-amber-400">Key takeaway:</span> {step.keyDifference}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-6 sm:mt-8 w-full flex justify-end">
        <button
          type="button"
          id="comparison-continue-btn"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm sm:text-base transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98"
        >
          <span>Continue to typing drill</span>
          <span className="hidden sm:inline-flex items-center text-xs opacity-75 font-mono ml-1">
            (Enter <CornerDownLeft size={13} className="inline ml-0.5" />)
          </span>
          <ArrowRight size={16} className="sm:hidden" />
        </button>
      </div>
    </motion.div>
  );
}
