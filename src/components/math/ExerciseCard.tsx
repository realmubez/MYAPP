import React, { useState, useEffect, useId, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles,
  Delete,
} from 'lucide-react';
import { MathExercise } from '../../data/courses/mathematics/curriculumData';
import { MathView } from './MathView';
import { checkMathAnswer } from '../../utils/mathComparison';

interface ExerciseCardProps {
  exercise: MathExercise;
  exerciseIndex: number;
  totalExercises: number;
  showSomali: boolean;
  onSuccess?: () => void;
  onOpenVocab?: (termId?: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  totalExercises,
  showSomali,
  onSuccess,
  onOpenVocab,
}) => {
  const [userInput, setUserInput] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Restore completed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`math_done_${exercise.id}`);
      if (saved === 'true') {
        setIsCorrect(true);
        setHasSubmitted(true);
        setShowSolution(true);
        setUserInput(exercise.expectedAnswer);
      }
    } catch {
      // ignore
    }
  }, [exercise.id, exercise.expectedAnswer]);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const result = checkMathAnswer(userInput, exercise.expectedAnswer, exercise.alternateAnswers);
    setHasSubmitted(true);
    setIsCorrect(result.isCorrect);
    setAttempts((prev) => prev + 1);

    if (result.isCorrect) {
      setShowSolution(true);
      try {
        localStorage.setItem(`math_done_${exercise.id}`, 'true');
      } catch {
        // ignore
      }
      if (onSuccess) onSuccess();
    }
  };

  const handleReset = () => {
    setUserInput('');
    setHasSubmitted(false);
    setIsCorrect(false);
    setShowSolution(false);
    try {
      localStorage.removeItem(`math_done_${exercise.id}`);
    } catch {
      // ignore
    }
    inputRef.current?.focus();
  };

  const handleRevealSolution = () => {
    setShowSolution(true);
  };

  // Mobile quick math keyboard actions
  const appendSymbol = (sym: string) => {
    setUserInput((prev) => prev + sym);
    inputRef.current?.focus();
  };

  const handleBackspace = () => {
    setUserInput((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  const handleClearInput = () => {
    setUserInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full bg-[#121110] border border-neutral-800 rounded-2xl p-3.5 sm:p-5 shadow-lg space-y-3.5 transition-all">
      {/* Exercise badge & Index */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center justify-center shrink-0">
            {exerciseIndex + 1}
          </span>
          <span className="text-xs font-semibold text-neutral-300 truncate">
            {exercise.title}
          </span>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 shrink-0">
          Aufgabe {exerciseIndex + 1}/{totalExercises}
        </span>
      </div>

      {/* Instruction */}
      <div className="space-y-1">
        <p className="text-sm sm:text-base text-neutral-200 font-medium leading-snug">
          {exercise.instructionDe}
        </p>
        {showSomali && exercise.instructionSo && (
          <p className="text-xs text-amber-400/90 italic flex items-start gap-1.5 leading-snug">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0 mt-0.5">
              SO
            </span>
            <span>{exercise.instructionSo}</span>
          </p>
        )}
      </div>

      {/* Math Question Container (Textbook style, centered, high contrast, horizontal scroll escape) */}
      <div className="w-full bg-[#181614] border border-neutral-700/60 rounded-xl py-3.5 px-2.5 sm:px-4 text-center">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1 font-mono">
          Aufgabe
        </span>
        <div className="text-xl sm:text-2xl text-amber-300 font-serif overflow-x-auto scrollbar-none py-1 max-w-full">
          <MathView math={exercise.latexQuestion} block={true} />
        </div>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleCheck} className="space-y-2.5">
        <div>
          <label htmlFor={inputId} className="block text-xs font-medium text-neutral-400 mb-1">
            Deine Antwort:
          </label>
          <div className="relative">
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={exercise.placeholder}
              disabled={isCorrect}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className={`w-full min-h-[48px] px-3.5 sm:px-4 py-3 rounded-xl text-base sm:text-lg font-mono font-bold transition-all outline-none
                ${
                  hasSubmitted && isCorrect
                    ? 'bg-emerald-950/30 border-2 border-emerald-500 text-emerald-200 placeholder-emerald-700/50'
                    : hasSubmitted && !isCorrect
                    ? 'bg-rose-950/20 border-2 border-rose-500 text-rose-200 placeholder-rose-700/50'
                    : 'bg-[#1b1916] border border-neutral-700 focus:border-amber-400 text-white placeholder-neutral-500'
                }
              `}
            />

            {/* Status indicator icon in input */}
            {hasSubmitted && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Quick-Math Keypad Bar for Thumb Tapping (Highest Mobile Priority) */}
        {!isCorrect && (
          <div className="bg-[#171513] border border-neutral-800 rounded-xl p-2 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-400 px-0.5">
              <span>Mathe-Tastatur (Schnelltasten):</span>
              <span className="text-amber-400">Tippen statt tippen suchen</span>
            </div>

            {/* Row 1: Common math signs & variables */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {['-', '+', '·', ':', 'x', 'y', 'a', 'b', '²', '(', ')'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => appendSymbol(sym)}
                  className="min-h-[40px] min-w-[36px] sm:min-w-[40px] px-2 text-sm sm:text-base font-mono font-bold bg-[#221f1c] hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 text-neutral-200 border border-neutral-700/80 rounded-lg active:scale-95 transition-all flex items-center justify-center shrink-0"
                >
                  {sym}
                </button>
              ))}

              {/* Backspace & Clear keys */}
              <button
                type="button"
                onClick={handleBackspace}
                className="min-h-[40px] min-w-[40px] px-2 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 active:bg-rose-500 active:text-white text-neutral-300 border border-neutral-700 rounded-lg active:scale-95 transition-all flex items-center justify-center shrink-0"
                title="Letztes Zeichen löschen"
              >
                <Delete className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClearInput}
                className="min-h-[40px] px-2 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 active:bg-rose-500 text-rose-300 border border-neutral-700 rounded-lg active:scale-95 transition-all flex items-center justify-center shrink-0"
                title="Ganzes Feld leeren"
              >
                AC
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons: Min 46-48px touch height */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {!isCorrect ? (
            <button
              type="submit"
              disabled={!userInput.trim()}
              className="col-span-2 sm:col-span-1 min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-neutral-950 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Antwort prüfen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="col-span-2 sm:col-span-1 min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Richtig gelöst! 🎉</span>
            </div>
          )}

          {/* Hint button */}
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="min-h-[46px] px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#1a1714] hover:bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors active:scale-98"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{showHint ? 'Tipp verbergen' : 'Tipp (Caawin)'}</span>
          </button>

          {/* Try again button (if submitted and incorrect) */}
          {hasSubmitted && !isCorrect && (
            <button
              type="button"
              onClick={handleReset}
              className="col-span-2 sm:col-span-1 min-h-[46px] px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-neutral-300" />
              <span>Noch einmal versuchen</span>
            </button>
          )}

          {/* Solution button if student struggles after attempts or wants full steps */}
          {!isCorrect && (attempts >= 1 || showHint) && (
            <button
              type="button"
              onClick={handleRevealSolution}
              className="col-span-2 min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/40 border border-transparent hover:border-neutral-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lösungsweg anzeigen</span>
            </button>
          )}
        </div>
      </form>

      {/* Hint Alert Box */}
      {showHint && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tipp (Caawin):</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
            {exercise.hintDe}
          </p>
          {showSomali && exercise.hintSo && (
            <p className="text-xs text-amber-300/90 italic pt-1 border-t border-amber-500/20 leading-relaxed">
              {exercise.hintSo}
            </p>
          )}
        </div>
      )}

      {/* Step-by-Step Solution Breakdown */}
      {showSolution && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl border space-y-3 transition-all ${
            isCorrect ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-neutral-900 border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between border-b border-neutral-700/60 pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Schritt-für-Schritt Lösungsweg
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              Ergebnis: {exercise.expectedAnswer}
            </span>
          </div>

          {/* Simple German Explanation */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
              {exercise.explanationDe}
            </p>
            {showSomali && exercise.explanationSo && (
              <p className="text-xs text-amber-300/90 italic pt-1 border-t border-neutral-800 leading-relaxed">
                <span className="font-semibold text-amber-400">Sharaxaad: </span>
                {exercise.explanationSo}
              </p>
            )}
          </div>

          {/* Individual detailed calculation steps */}
          {exercise.steps && exercise.steps.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                Schritte:
              </span>
              {exercise.steps.map((st, i) => (
                <div
                  key={i}
                  className="bg-[#161412] p-2.5 rounded-lg border border-neutral-800 text-xs space-y-0.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-300 text-[9px] font-mono flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-neutral-200">{st.textDe}</p>
                  </div>
                  {st.latex && (
                    <div className="pl-6 text-sky-300 font-mono overflow-x-auto py-0.5">
                      <MathView math={st.latex} />
                    </div>
                  )}
                  {showSomali && st.textSo && (
                    <p className="text-[11px] text-neutral-400 italic pl-6">{st.textSo}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
