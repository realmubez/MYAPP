import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { MathSection } from '../../data/courses/mathematics/curriculumData';
import { MathView } from './MathView';
import { ExerciseCard } from './ExerciseCard';
import { InteractiveNumberLine } from './InteractiveNumberLine';
import { TermSorterLab } from './TermSorterLab';

interface MathSectionItemProps {
  section: MathSection;
  isOpen: boolean;
  onToggle: () => void;
  showSomali: boolean;
  onOpenVocab?: (termId?: string) => void;
}

export const MathSectionItem: React.FC<MathSectionItemProps> = ({
  section,
  isOpen,
  onToggle,
  showSomali,
  onOpenVocab,
}) => {
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    section.exercises.forEach((ex) => {
      try {
        if (localStorage.getItem(`math_done_${ex.id}`) === 'true') {
          initial[ex.id] = true;
        }
      } catch {
        // ignore
      }
    });
    return initial;
  });

  const handleExerciseSuccess = (exerciseId: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseId]: true,
    }));
  };

  const completedCount = Object.values(completedExercises).filter(Boolean).length;
  const totalCount = section.exercises.length;
  const isSectionComplete = completedCount === totalCount && totalCount > 0;

  return (
    <article
      id={`section-${section.id}`}
      className="w-full bg-[#141210] border border-neutral-800 rounded-2xl overflow-hidden shadow-md transition-all duration-200"
    >
      {/* Section Header / Accordion trigger */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full min-h-[58px] p-3.5 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-[#1a1715] transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/50"
      >
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-bold transition-colors ${
              isSectionComplete
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isSectionComplete ? <CheckCircle className="w-4 h-4" /> : section.number}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug truncate sm:whitespace-normal">
              {section.titleDe}
            </h2>
            {showSomali && (
              <p className="text-xs text-neutral-400 italic truncate sm:whitespace-normal mt-0.5">
                {section.titleSo}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/60">
            {completedCount}/{totalCount}
          </span>
          <div className="w-6 h-6 flex items-center justify-center text-neutral-400">
            {isOpen ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Expanded Content: 1. Idea -> 2. Worked Example -> 3. Interactive Lab/Exercises */}
      {isOpen && (
        <div className="border-t border-neutral-800/80 p-3 sm:p-5 space-y-5">
          {/* STEP 1: Concept & Simple Explanation */}
          <div className="bg-[#181613] border border-amber-500/20 rounded-2xl p-3.5 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>1. Die Idee einfach erklärt</span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
              {section.summaryDe}
            </p>

            {showSomali && (
              <p className="text-xs text-amber-200/90 italic pt-1 border-t border-neutral-800 leading-relaxed">
                <span className="font-semibold text-amber-400">Somali: </span>
                {section.summarySo}
              </p>
            )}

            {section.ruleLatex && (
              <div className="mt-2 bg-[#100e0d] border border-neutral-800 rounded-xl p-3 text-center overflow-x-auto scrollbar-none text-amber-300">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                  Merksatz / Regel
                </span>
                <MathView math={section.ruleLatex} block={true} />
              </div>
            )}
          </div>

          {/* Interactive tactile lab for Section 1 or 2: Interactive Number Line */}
          {(section.id === 'ganze-zahlen' || section.id === 'addieren-subtrahieren') && (
            <InteractiveNumberLine showSomali={showSomali} />
          )}

          {/* Interactive tactile lab for Section 5: Term Sorter */}
          {section.id === 'terme-zusammenfassen' && (
            <TermSorterLab showSomali={showSomali} />
          )}

          {/* STEP 2: Worked Example */}
          <div className="bg-[#161412] border border-neutral-800 rounded-2xl p-3.5 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <BookOpen className="w-4 h-4" />
              <span>2. Musterbeispiel (Tusaale La Shaqeeyay)</span>
            </div>

            <div className="bg-[#100e0c] border border-neutral-800/80 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-0.5">
                Aufgabe:
              </span>
              <div className="text-lg sm:text-xl text-neutral-100 font-serif overflow-x-auto scrollbar-none">
                <MathView math={section.workedExample.problemLatex} block={true} />
              </div>
            </div>

            <div className="space-y-1 text-xs sm:text-sm text-neutral-300">
              <p className="font-medium text-white">{section.workedExample.explanationDe}</p>
              {showSomali && (
                <p className="text-neutral-400 italic">{section.workedExample.explanationSo}</p>
              )}
            </div>

            {/* Example step by step breakdown */}
            <div className="space-y-2 pt-1 border-t border-neutral-800/60">
              <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                Lösungsschritte:
              </span>
              {section.workedExample.steps.map((st, i) => (
                <div
                  key={i}
                  className="bg-[#1b1916] rounded-xl p-2.5 sm:p-3 border border-neutral-800/80 space-y-1 text-xs sm:text-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-mono flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-neutral-200">{st.de}</p>
                  </div>
                  {st.latex && (
                    <div className="pl-7 text-sky-300 font-mono overflow-x-auto scrollbar-none py-0.5">
                      <MathView math={st.latex} />
                    </div>
                  )}
                  {showSomali && (
                    <p className="text-[11px] text-neutral-400 italic pl-7">{st.so}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
              <span className="font-semibold text-emerald-300">Endergebnis:</span>
              <span className="font-mono font-bold text-white text-base">
                <MathView math={section.workedExample.solutionLatex} />
              </span>
            </div>
          </div>

          {/* STEP 3: Interactive Practice Exercises */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>3. Jetzt bist du dran: Interaktive Übungen</span>
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                {completedCount} von {totalCount} gelöst
              </span>
            </div>

            <div className="space-y-3.5">
              {section.exercises.map((exercise, idx) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  exerciseIndex={idx}
                  totalExercises={section.exercises.length}
                  showSomali={showSomali}
                  onSuccess={() => handleExerciseSuccess(exercise.id)}
                  onOpenVocab={onOpenVocab}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
