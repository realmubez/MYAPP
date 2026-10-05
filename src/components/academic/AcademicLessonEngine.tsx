import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Check,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { AcademicLesson, AcademicStep } from '../../types/academic';
import { MathInput } from './MathInput';
import { progressService } from '../../services/progress';
import { progressRepository } from '../../repositories/progressRepository';
import { reviewService } from '../../services/reviewService';
import { typingSoundService } from '../../services/typingSoundService';

interface AcademicLessonEngineProps {
  lesson: AcademicLesson;
  onExit: () => void;
  onComplete?: () => void;
}

export function AcademicLessonEngine({
  lesson,
  onExit,
  onComplete,
}: AcademicLessonEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect' | null;
    message?: string;
  }>({ type: null });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [lessonStartTime] = useState<number>(Date.now());
  const [stepAttempts, setStepAttempts] = useState<Record<number, number>>({});
  const [mistakesCount, setMistakesCount] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);

  const steps = lesson.steps || [];
  const currentStep: AcademicStep | undefined = steps[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex) / steps.length) * 100);

  // Count problem steps
  useEffect(() => {
    const problems = steps.filter((s) => s.type === 'problem' || s.type === 'recall');
    setTotalProblems(problems.length);
  }, [steps]);

  // Reset input and hints when stepping forward
  useEffect(() => {
    setInputValue('');
    setShowHint(false);
    setFeedback({ type: null });
  }, [currentStepIndex]);

  const handleNextStep = useCallback(() => {
    if (currentStepIndex + 1 < steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Finished lesson!
      handleFinishLesson();
    }
  }, [currentStepIndex, steps.length]);

  const handleFinishLesson = () => {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - lessonStartTime) / 1000));
    const accuracy = totalProblems > 0
      ? Math.max(0, Math.min(100, Math.round((correctFirstTry / totalProblems) * 100)))
      : 100;
    const approxWpm = 35;

    // Record progress locally & queued sync
    progressService.recordExerciseCompletion({
      subjectId: 'mathematics',
      exerciseId: lesson.id,
      exerciseTitle: lesson.title,
      wpm: approxWpm,
      accuracy,
      mistakes: mistakesCount,
      durationSeconds: elapsedSeconds,
      unitId: lesson.unitId,
      unitTitle: lesson.unitTitle,
    });

    progressRepository.syncLessonProgress(
      'mathematics',
      lesson.id,
      lesson.unitId,
      steps.length,
      true,
      100,
      accuracy,
      approxWpm
    );

    setIsLessonFinished(true);
    if (onComplete) onComplete();
  };

  const handleCheckAnswer = () => {
    if (!currentStep || !currentStep.problem) return;
    const prob = currentStep.problem;
    const cleanUser = inputValue.trim();
    const cleanTarget = prob.targetAnswer.trim();

    // Check exact string match or mathematically equivalent number representation
    let isMatch = cleanUser.toLowerCase() === cleanTarget.toLowerCase();
    if (!isMatch && cleanUser !== '' && cleanTarget !== '') {
      const numUser = Number(cleanUser);
      const numTarget = Number(cleanTarget);
      if (!Number.isNaN(numUser) && !Number.isNaN(numTarget)) {
        isMatch = Math.abs(numUser - numTarget) < 1e-9;
      }
    }

    const currentAttempt = (stepAttempts[currentStepIndex] || 0) + 1;
    setStepAttempts((prev) => ({ ...prev, [currentStepIndex]: currentAttempt }));

    if (isMatch) {
      if (soundEnabled) typingSoundService.playLessonCompleted();
      if (currentAttempt === 1) {
        setCorrectFirstTry((prev) => prev + 1);
      }
      setFeedback({
        type: 'correct',
        message: prob.explanation || 'Correct!',
      });
      setTimeout(() => {
        handleNextStep();
      }, 900);
    } else {
      if (soundEnabled) typingSoundService.playKeyError();
      setMistakesCount((prev) => prev + 1);
      setFeedback({
        type: 'incorrect',
        message: 'Not quite. Check your calculation or click Hint below.',
      });

      // Record mistake to mistake review repository
      reviewService.recordMistake({
        subjectId: 'mathematics',
        itemId: `math:${prob.id}`,
        text: `${prob.expression || prob.question} = ${prob.targetAnswer}`,
        displayTitle: prob.expression || prob.question,
        category: 'Arithmetic',
        unitId: lesson.unitId,
        unitTitle: lesson.unitTitle,
        lessonId: lesson.id,
        prompt: prob.question,
      });
    }
  };

  if (isLessonFinished) {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - lessonStartTime) / 1000));
    const finalAccuracy = totalProblems > 0
      ? Math.max(0, Math.min(100, Math.round((correctFirstTry / totalProblems) * 100)))
      : 100;

    return (
      <div
        id="academic-lesson-complete"
        className="flex min-h-[85vh] flex-col items-center justify-center p-4 text-center select-none"
      >
        <div className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-[#12100e] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
              Lesson Complete
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {lesson.unitTitle}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4 text-left">
              <span className="text-xs text-neutral-400 block">First-Try Accuracy</span>
              <span className="text-2xl font-bold font-mono text-amber-400">
                {finalAccuracy}%
              </span>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4 text-left">
              <span className="text-xs text-neutral-400 block">Time Spent</span>
              <span className="text-2xl font-bold font-mono text-white">
                {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStepIndex(0);
                setIsLessonFinished(false);
                setStepAttempts({});
                setMistakesCount(0);
                setCorrectFirstTry(0);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-800/80 px-5 py-3 text-sm font-semibold text-neutral-200 transition-all hover:bg-neutral-700 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-amber-500 bg-amber-500 px-5 py-3 text-sm font-bold text-neutral-950 transition-all hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/20"
            >
              <span>Done</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="academic-lesson-engine" className="min-h-screen flex flex-col bg-[#0d0c0a] text-neutral-100 select-none pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-800/80 bg-[#0d0c0a]/95 px-4 sm:px-8 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 transition-all hover:border-neutral-700 hover:text-white"
            title="Exit Lesson"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 font-mono">
                MATHEMATICS
              </span>
              <span className="text-xs font-semibold text-neutral-300 truncate max-w-[140px] sm:max-w-xs">
                {lesson.title}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-neutral-400">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
          </div>
          <div className="w-20 sm:w-28 h-2 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 transition-all hover:border-neutral-700 hover:text-white"
            title={soundEnabled ? 'Mute typing audio' : 'Enable typing audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-2xl mx-auto w-full">
        {currentStep && (
          <div className="w-full space-y-6 animate-fadeIn">
            {/* Step Badge & Title */}
            <div className="text-center space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-neutral-800 text-amber-400 border border-neutral-700">
                {currentStep.badgeLabel}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentStep.title}
              </h2>
            </div>

            {/* 1. CONCEPT STEP */}
            {currentStep.type === 'concept' && (
              <div className="rounded-3xl border border-neutral-800 bg-[#141210] p-6 sm:p-8 space-y-5 shadow-lg">
                <p className="text-base sm:text-lg text-neutral-200 leading-relaxed">
                  {currentStep.conceptExplanation}
                </p>

                {currentStep.bulletPoints && currentStep.bulletPoints.length > 0 && (
                  <ul className="space-y-2.5 pt-2 border-t border-neutral-800">
                    {currentStep.bulletPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-2 rounded-2xl border border-amber-500 bg-amber-500 px-6 py-3 text-sm font-bold text-neutral-950 transition-all hover:bg-amber-400 active:scale-95 shadow-md"
                  >
                    <span>Understood, Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. WORKED EXAMPLE STEP */}
            {currentStep.type === 'example' && currentStep.workedExample && (
              <div className="rounded-3xl border border-neutral-800 bg-[#141210] p-6 sm:p-8 space-y-6 shadow-lg">
                {/* Expression Display */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 font-mono">
                  <span className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Problem</span>
                  <span className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {currentStep.workedExample.problem}
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">
                    Solution = {currentStep.workedExample.solution}
                  </span>
                </div>

                {/* Steps Breakdown */}
                {currentStep.workedExample.steps && (
                  <div className="space-y-2">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                      Step-by-Step Method
                    </span>
                    <div className="space-y-2">
                      {currentStep.workedExample.steps.map((st, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs sm:text-sm text-neutral-300 font-mono"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep.workedExample.note && (
                  <p className="text-xs text-neutral-400 italic">
                    💡 {currentStep.workedExample.note}
                  </p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-2 rounded-2xl border border-amber-500 bg-amber-500 px-6 py-3 text-sm font-bold text-neutral-950 transition-all hover:bg-amber-400 active:scale-95 shadow-md"
                  >
                    <span>Try Problems</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. PROBLEM & RECALL STEPS */}
            {(currentStep.type === 'problem' || currentStep.type === 'recall') && currentStep.problem && (
              <div className="rounded-3xl border border-neutral-800 bg-[#141210] p-6 sm:p-8 space-y-6 shadow-lg">
                {/* Problem Question & Expression */}
                <div className="text-center space-y-2">
                  <p className="text-sm sm:text-base text-neutral-300 font-medium">
                    {currentStep.problem.question}
                  </p>
                  {currentStep.problem.expression && (
                    <div className="inline-block font-mono text-3xl sm:text-4xl font-bold text-amber-400 bg-neutral-900/90 px-6 py-3 rounded-2xl border border-neutral-800">
                      {currentStep.problem.expression}
                    </div>
                  )}
                </div>

                {/* Math Interactive Keypad / Input */}
                <MathInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handleCheckAnswer}
                  soundEnabled={soundEnabled}
                  allowNegative={currentStep.problem.allowNegative !== false}
                  allowDecimal={currentStep.problem.allowDecimal !== false}
                  placeholder="?"
                />

                {/* Feedback message */}
                {feedback.type && (
                  <div
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                      feedback.type === 'correct'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {feedback.type === 'correct' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}

                {/* Hint toggle */}
                {currentStep.problem.hint && (
                  <div className="pt-2 text-center">
                    {!showHint ? (
                      <button
                        type="button"
                        onClick={() => setShowHint(true)}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 transition-colors"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Need a hint?</span>
                      </button>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 text-xs text-amber-200 text-left">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Hint:</span>
                        </div>
                        <p>{currentStep.problem.hint}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
