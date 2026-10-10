import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Layers,
  Check,
  Volume2,
  HelpCircle,
} from 'lucide-react';
import {
  generateMockExam,
  MockExamQuestion,
} from '../../data/examPrepare/mockExamQuestions';
import {
  examProgressService,
  MockExamResult,
} from '../../services/examProgressService';
import { useEdgeTTS } from '../../hooks/useEdgeTTS';

interface ExamMockTestViewProps {
  onBackToLessons: () => void;
  onReviewMistakes?: () => void;
}

export const ExamMockTestView: React.FC<ExamMockTestViewProps> = ({
  onBackToLessons,
  onReviewMistakes,
}) => {
  // TTS for question audio
  const { play, isSpeaking, activeSpeechId } = useEdgeTTS('en');

  // Test stages: 'setup' | 'testing' | 'results'
  const [stage, setStage] = useState<'setup' | 'testing' | 'results'>('setup');

  // Setup options
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [timerMinutes, setTimerMinutes] = useState<number>(20); // 0 = untimed

  // Active test state
  const [questions, setQuestions] = useState<MockExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);

  // Unanswered confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [unansweredCount, setUnansweredCount] = useState<number>(0);

  // Submission lock ref to ensure exactly one submit execution
  const isSubmittingRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Result state
  const [lastResult, setLastResult] = useState<MockExamResult | null>(null);

  // Clear timer safely
  const clearTestTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Submit test implementation
  const executeSubmission = useCallback(() => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    clearTestTimer();
    setShowConfirmModal(false);

    let score = 0;
    let totalPoints = 0;

    const breakdown = {
      grammar: { correct: 0, total: 0 },
      vocabulary: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      writing: { correct: 0, total: 0 },
    };

    questions.forEach((q) => {
      totalPoints += q.points;
      const rawUserAns = userAnswers[q.id];
      const userAns = (rawUserAns || '').trim().toLowerCase();
      const expected = q.expectedAnswer.toLowerCase().trim();
      const alternates = (q.alternateAnswers || []).map((a) => a.toLowerCase().trim());

      // Only evaluate if user gave an answer
      const hasAnswer = Boolean(userAns);
      const isCorrect = hasAnswer && (userAns === expected || alternates.includes(userAns));

      breakdown[q.section].total += 1;
      if (isCorrect) {
        score += q.points;
        breakdown[q.section].correct += 1;
        examProgressService.resolveMistake(q.id);
      } else {
        // Record as mistake for review queue
        examProgressService.recordMistake({
          id: q.id,
          questionPrompt: q.prompt,
          sourceType: 'mock-exam',
          sourceTitle: `Mock Exam (${q.section.toUpperCase()})`,
          userAnswer: rawUserAns && rawUserAns.trim() ? rawUserAns : '(unanswered)',
          expectedAnswer: q.expectedAnswer,
          explanation: q.explanation,
          options: q.options,
        });
      }
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    let grade: 'Distinction' | 'Merit' | 'Pass' | 'Needs Practice' = 'Needs Practice';
    if (percentage >= 85) grade = 'Distinction';
    else if (percentage >= 70) grade = 'Merit';
    else if (percentage >= 50) grade = 'Pass';

    // Calculate actual time spent
    const totalDuration = timerMinutes * 60;
    const timeSpent =
      timerMinutes > 0 ? Math.max(0, totalDuration - timeRemainingSeconds) : 0;

    const result: MockExamResult = {
      id: `mock-${Date.now()}`,
      timestamp: Date.now(),
      score,
      total: totalPoints,
      percentage,
      timeSpentSeconds: timeSpent,
      grade,
      breakdown,
    };

    setLastResult(result);
    examProgressService.recordMockExam(result);
    setStage('results');
  }, [clearTestTimer, questions, timerMinutes, timeRemainingSeconds, userAnswers]);

  // Handle timer countdown
  useEffect(() => {
    if (stage === 'testing' && timerMinutes > 0) {
      clearTestTimer();
      timerIntervalRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearTestTimer();
            // Timeout submits automatically once
            executeSubmission();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTestTimer();
      };
    } else {
      clearTestTimer();
    }
  }, [stage, timerMinutes, clearTestTimer, executeSubmission]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTestTimer();
    };
  }, [clearTestTimer]);

  const handleStartExam = () => {
    clearTestTimer();
    isSubmittingRef.current = false;
    setShowConfirmModal(false);

    const list = generateMockExam(questionCount);
    setQuestions(list);
    setCurrentIndex(0);
    setUserAnswers({});

    if (timerMinutes > 0) {
      setTimeRemainingSeconds(timerMinutes * 60);
    } else {
      setTimeRemainingSeconds(0);
    }

    setStage('testing');
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  // Called when user clicks "Submit Exam" button
  const handleRequestSubmit = () => {
    // Count unanswered questions
    let unanswered = 0;
    questions.forEach((q) => {
      const ans = (userAnswers[q.id] || '').trim();
      if (!ans) unanswered++;
    });

    setUnansweredCount(unanswered);
    setShowConfirmModal(true);
  };

  const currentQ = questions[currentIndex];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full space-y-5 animate-fadeIn">
      {/* ---------------- 1. SETUP STAGE ---------------- */}
      {stage === 'setup' && (
        <section className="bg-[#15120f] border border-amber-500/25 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block">
                Exam Simulator
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Elementary English Mock Exam
              </h2>
            </div>
            <Award className="w-8 h-8 text-amber-400 shrink-0" />
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Test your knowledge across Straightforward Elementary English (Units 1–2D). This exam simulates real test conditions covering Grammar, Vocabulary, Reading Comprehension, and Sentence Writing.
          </p>

          {/* Exam Instructions */}
          <div className="bg-[#1a1612] p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
            <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px]">
              Examination Rules:
            </span>
            <ul className="space-y-1.5 text-neutral-300 list-disc list-inside">
              <li>You can navigate back and forth between questions anytime using the Previous/Next buttons or the question palette.</li>
              <li>Your answers are automatically saved as you click or type them.</li>
              <li>You can submit your exam whenever you are ready. If questions remain unanswered, you will be prompted to confirm.</li>
              <li>Passing score: 50% · Merit: 70% · Distinction: 85%.</li>
            </ul>
          </div>

          {/* Configuration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Question count selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Number of Questions:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      questionCount === num
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-extrabold shadow'
                        : 'bg-[#1e1914] border-neutral-700 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Timer selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Timer Limit:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mins: 0, label: 'Untimed' },
                  { mins: 15, label: '15 Mins' },
                  { mins: 25, label: '25 Mins' },
                ].map((t) => (
                  <button
                    key={t.mins}
                    type="button"
                    onClick={() => setTimerMinutes(t.mins)}
                    className={`min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      timerMinutes === t.mins
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-extrabold shadow'
                        : 'bg-[#1e1914] border-neutral-700 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartExam}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <span>Begin Mock Exam</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ---------------- 2. TESTING IN PROGRESS STAGE ---------------- */}
      {stage === 'testing' && currentQ && (
        <div className="space-y-4">
          {/* Sticky Progress & Timer Bar */}
          <div className="sticky top-14 z-20 bg-[#16120e]/95 backdrop-blur-md border border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-md flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                {currentQ.section}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono hidden xs:inline">
                ({Object.keys(userAnswers).filter((k) => (userAnswers[k] || '').trim()).length}/{questions.length} answered)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {timerMinutes > 0 && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border ${
                    timeRemainingSeconds <= 120
                      ? 'bg-rose-950/40 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-[#1f1a15] border-neutral-700 text-neutral-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatTimer(timeRemainingSeconds)}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRequestSubmit}
                className="min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 transition-all cursor-pointer shadow active:scale-95"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-[#15120f] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            {/* Optional Reading Passage */}
            {currentQ.contextPassage && (
              <div className="p-4 rounded-2xl bg-[#1a1612] border border-sky-500/30 text-xs sm:text-sm text-neutral-200 leading-relaxed font-serif italic whitespace-pre-line space-y-2">
                <div className="flex items-center justify-between text-sky-400 text-xs font-bold font-sans">
                  <span>Reading Context Passage:</span>
                  <button
                    type="button"
                    onClick={() => play(`mock-passage-${currentQ.id}`, currentQ.contextPassage!)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/40 text-[10px] text-sky-300 hover:text-white"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Listen</span>
                  </button>
                </div>
                <p>"{currentQ.contextPassage}"</p>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-neutral-400">
                  Question {currentIndex + 1} ({currentQ.points} point{currentQ.points === 1 ? '' : 's'}):
                </span>
                <button
                  type="button"
                  onClick={() => play(`mock-q-${currentQ.id}`, currentQ.prompt)}
                  className={`min-h-[30px] px-2.5 py-0.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                    activeSpeechId === `mock-q-${currentQ.id}` && isSpeaking
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                      : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
                  }`}
                  title="Listen to question"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Pronounce</span>
                </button>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {currentQ.prompt}
              </h3>
            </div>

            {/* Multiple Choice Options or Text Input */}
            {currentQ.type === 'multiple-choice' && currentQ.options ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {currentQ.options.map((opt) => {
                  const isSelected = userAnswers[currentQ.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswerChange(currentQ.id, opt)}
                      className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-left border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow'
                          : 'bg-[#191511] border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="pt-1">
                <input
                  type="text"
                  value={userAnswers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[#191511] border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none"
                />
              </div>
            )}

            {/* Question Navigation Controls */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequestSubmit}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                >
                  Finish & Submit
                </button>

                <button
                  type="button"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                  }
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-neutral-950 transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Question Number Jump Palette */}
          <div className="bg-[#15120f] border border-neutral-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
              <span>Question Palette:</span>
              <span className="text-amber-400 font-normal">
                Green = answered · Dark = unanswered
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {questions.map((q, idx) => {
                const isAnswered = !!(userAnswers[q.id] || '').trim();
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-neutral-950 ring-2 ring-amber-300'
                        : isAnswered
                        ? 'bg-emerald-950/50 border border-emerald-500/60 text-emerald-300'
                        : 'bg-neutral-800/90 border border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUBMISSION CONFIRMATION MODAL ---------------- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171410] border border-amber-500/30 rounded-3xl p-5 sm:p-7 max-w-md w-full space-y-4 shadow-2xl text-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Ready to Submit Exam?
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  {questions.length - unansweredCount} of {questions.length} questions answered
                </span>
              </div>
            </div>

            {unansweredCount > 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                You still have <strong>{unansweredCount} unanswered question{unansweredCount === 1 ? '' : 's'}</strong>. Unanswered questions will receive 0 points. Do you want to submit now?
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                You have answered all {questions.length} questions! Click submit below to calculate your score and review every question.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              >
                Return to Exam
              </button>

              <button
                type="button"
                onClick={executeSubmission}
                className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all cursor-pointer shadow active:scale-95"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. RESULTS & REVIEW STAGE ---------------- */}
      {stage === 'results' && lastResult && (
        <div className="space-y-6">
          {/* Main Score Card */}
          <section className="bg-[#15120f] border border-amber-500/30 rounded-3xl p-6 sm:p-7 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-400">
                Mock Exam Results
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Grade: {lastResult.grade}
              </h2>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono">
                {lastResult.percentage}%
              </span>
              <span className="text-sm font-semibold text-neutral-400 font-mono self-end pb-1">
                ({lastResult.score} / {lastResult.total} pts)
              </span>
            </div>

            {/* Skill Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-neutral-800 text-left">
              {[
                { label: 'Grammar', data: lastResult.breakdown.grammar },
                { label: 'Vocabulary', data: lastResult.breakdown.vocabulary },
                { label: 'Reading', data: lastResult.breakdown.reading },
                { label: 'Writing', data: lastResult.breakdown.writing },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-2xl bg-[#1b1713] border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-medium">
                    {s.label}
                  </span>
                  <span className="text-sm font-bold text-white block">
                    {s.data.correct} / {s.data.total} correct
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons: Retake, Review Mistakes, Review Lessons */}
            <div className="flex items-center justify-center gap-2.5 pt-3 flex-wrap">
              <button
                type="button"
                onClick={handleStartExam}
                className="min-h-[44px] px-5 py-2 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-all cursor-pointer shadow active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Exam</span>
              </button>

              {onReviewMistakes && (
                <button
                  type="button"
                  onClick={onReviewMistakes}
                  className="min-h-[44px] px-5 py-2 rounded-2xl text-xs font-bold bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Review Missed Questions</span>
                </button>
              )}

              <button
                type="button"
                onClick={onBackToLessons}
                className="min-h-[44px] px-5 py-2 rounded-2xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
              >
                Review Lessons
              </button>
            </div>
          </section>

          {/* Detailed Question-by-Question Review */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Detailed Answers Review ({questions.length} Questions)
              </h3>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const rawUserAns = userAnswers[q.id];
                const userAns = (rawUserAns || '').trim().toLowerCase();
                const expected = q.expectedAnswer.toLowerCase().trim();
                const alternates = (q.alternateAnswers || []).map((a) => a.toLowerCase().trim());
                const isCorrect = Boolean(userAns) && (userAns === expected || alternates.includes(userAns));

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#15120f] border border-neutral-800 space-y-2 text-xs sm:text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        Question {idx + 1} ({q.section.toUpperCase()}):
                      </span>
                      <span
                        className={`text-xs font-bold flex items-center gap-1 ${
                          isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Correct (+{q.points} pt)
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-white flex-1">{q.prompt}</p>
                      <button
                        type="button"
                        onClick={() => play(`rev-${q.id}`, q.prompt)}
                        className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 shrink-0"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Audio</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-[#1b1713] border border-neutral-800">
                        <span className="text-[10px] uppercase text-neutral-500 font-mono block">
                          Your Answer:
                        </span>
                        <span className={isCorrect ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                          {rawUserAns && rawUserAns.trim() ? rawUserAns : '(No answer provided)'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#1b1713] border border-neutral-800">
                        <span className="text-[10px] uppercase text-neutral-500 font-mono block">
                          Correct Answer:
                        </span>
                        <span className="text-amber-400 font-bold font-mono">
                          {q.expectedAnswer}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 pt-1 leading-relaxed">
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
