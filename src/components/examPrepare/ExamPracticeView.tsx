import React, { useState, useMemo } from 'react';
import {
  FileQuestion,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Layers,
  BookOpen,
  ArrowRight,
  Volume2,
  Award,
  Zap,
} from 'lucide-react';
import { PRACTICE_EXERCISES, PracticeExerciseItem } from '../../data/examPrepare/practiceQuestions';
import { useEdgeTTS } from '../../hooks/useEdgeTTS';
import { examProgressService } from '../../services/examProgressService';
import { isAnswerAcceptable } from '../../utils/grammarValidation';

export const ExamPracticeView: React.FC = () => {
  const { play, isSpeaking, activeSpeechId } = useEdgeTTS('en');

  // View modes: 'drills' (immediate feedback) vs 'challenge' (final mixed test without revealing answers before submit)
  const [activeMode, setActiveMode] = useState<'drills' | 'challenge'>('drills');

  // Drills state
  const [selectedType, setSelectedType] = useState<string>('all');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [orderedWords, setOrderedWords] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  // Challenge state
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, string>>({});
  const [challengeSubmitted, setChallengeSubmitted] = useState<boolean>(false);
  const [challengeScore, setChallengeScore] = useState<{ correct: number; total: number } | null>(null);

  const exerciseTypes = [
    { id: 'all', label: 'All Practice Types' },
    { id: 'multiple-choice', label: 'Multiple Choice' },
    { id: 'fill-blank', label: 'Fill in Blanks' },
    { id: 'sentence-order', label: 'Sentence Ordering' },
    { id: 'vocab-recall', label: 'Vocabulary Recall' },
    { id: 'reading-comp', label: 'Reading Comprehension' },
    { id: 'question-formation', label: 'Question Formation' },
    { id: 'describing-people', label: 'Describing People' },
    { id: 'short-writing', label: 'Short Writing' },
  ];

  const filteredExercises = PRACTICE_EXERCISES.filter((ex) => {
    return selectedType === 'all' || ex.type === selectedType;
  });

  // 10 Mixed grammar challenge questions across the core topics
  const challengeQuestions = useMemo(() => {
    return PRACTICE_EXERCISES.slice(0, 10);
  }, []);

  const handleWordTap = (exId: string, word: string) => {
    if (submitted[exId]) return;
    const current = orderedWords[exId] || [];
    const next = [...current, word];
    setOrderedWords((prev) => ({ ...prev, [exId]: next }));
    setAnswers((prev) => ({ ...prev, [exId]: next.join(' ') }));
  };

  const handleRemoveWord = (exId: string, index: number) => {
    if (submitted[exId]) return;
    const current = orderedWords[exId] || [];
    const next = current.filter((_, i) => i !== index);
    setOrderedWords((prev) => ({ ...prev, [exId]: next }));
    setAnswers((prev) => ({ ...prev, [exId]: next.join(' ') }));
  };

  const handleClearSentence = (exId: string) => {
    if (submitted[exId]) return;
    setOrderedWords((prev) => ({ ...prev, [exId]: [] }));
    setAnswers((prev) => ({ ...prev, [exId]: '' }));
  };

  const checkSingleAnswer = (ex: PracticeExerciseItem, userAns: string) => {
    if (ex.type === 'short-writing') {
      const wordCount = (userAns || '').trim().split(/\s+/).filter(Boolean).length;
      return wordCount >= 12;
    }
    return isAnswerAcceptable(userAns, ex.expectedAnswer, ex.alternateAnswers);
  };

  const handleCheck = (ex: PracticeExerciseItem) => {
    const userVal = (answers[ex.id] || '').trim();
    if (!userVal) return;

    setSubmitted((prev) => ({ ...prev, [ex.id]: true }));
    const isCorrect = checkSingleAnswer(ex, userVal);

    examProgressService.recordPracticeAnswer(isCorrect);

    if (isCorrect) {
      examProgressService.resolveMistake(ex.id);
    } else {
      examProgressService.recordMistake({
        id: ex.id,
        questionPrompt: ex.prompt,
        sourceType: 'practice',
        sourceTitle: `Practice Drill: ${ex.categoryLabel}`,
        userAnswer: answers[ex.id] || '',
        expectedAnswer: ex.expectedAnswer,
        explanation: ex.explanation,
        options: ex.options,
      });
    }
  };

  const handleRetry = (exId: string) => {
    setSubmitted((prev) => ({ ...prev, [exId]: false }));
    setAnswers((prev) => ({ ...prev, [exId]: '' }));
    setOrderedWords((prev) => ({ ...prev, [exId]: [] }));
  };

  // Submit Challenge all at once
  const handleSubmitChallenge = () => {
    let correctCount = 0;
    challengeQuestions.forEach((q) => {
      const userAns = challengeAnswers[q.id] || '';
      const isCorrect = checkSingleAnswer(q, userAns);
      if (isCorrect) {
        correctCount++;
        examProgressService.resolveMistake(q.id);
      } else {
        examProgressService.recordMistake({
          id: q.id,
          questionPrompt: q.prompt,
          sourceType: 'practice',
          sourceTitle: `Mixed Challenge: ${q.categoryLabel}`,
          userAnswer: userAns,
          expectedAnswer: q.expectedAnswer,
          explanation: q.explanation,
          options: q.options,
        });
      }
    });

    setChallengeScore({ correct: correctCount, total: challengeQuestions.length });
    setChallengeSubmitted(true);
  };

  const handleResetChallenge = () => {
    setChallengeAnswers({});
    setChallengeSubmitted(false);
    setChallengeScore(null);
  };

  const answeredChallengeCount = Object.keys(challengeAnswers).filter((k) =>
    (challengeAnswers[k] || '').trim()
  ).length;

  return (
    <div className="w-full space-y-5 animate-fadeIn">
      {/* Mode Switcher: Topic Drills vs. Mixed Grammar Challenge */}
      <div className="bg-[#15120f] p-2 rounded-2xl border border-neutral-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setActiveMode('drills')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'drills'
              ? 'bg-amber-500 text-neutral-950 font-extrabold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Topic Practice Drills</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('challenge')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'challenge'
              ? 'bg-amber-500 text-neutral-950 font-extrabold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Mixed Grammar Challenge (10 Qs)</span>
        </button>
      </div>

      {/* ================= MODE 1: TOPIC PRACTICE DRILLS ================= */}
      {activeMode === 'drills' && (
        <div className="space-y-4">
          {/* Type Filter Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
              Filter Practice Drills:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {exerciseTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id)}
                  className={`min-h-[34px] px-3.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedType === t.id
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                      : 'bg-[#16120e] text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-4">
            {filteredExercises.map((ex, idx) => {
              const isSub = !!submitted[ex.id];
              const currentAns = answers[ex.id] || '';
              const isCorrect = isSub && checkSingleAnswer(ex, currentAns);

              return (
                <div
                  key={ex.id}
                  className="bg-[#16120e] rounded-3xl p-4 sm:p-5 border border-neutral-800 space-y-3.5 shadow-sm"
                >
                  {/* Category & Badge */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                        {ex.categoryLabel}
                      </span>
                      <span className="text-neutral-500 text-xs font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    {isSub && (
                      <span
                        className={`text-xs font-bold flex items-center gap-1 ${
                          isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Instruction & Prompt */}
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-400 italic">
                      {ex.instruction}
                    </p>
                    {ex.contextText && (
                      <div className="p-3 rounded-xl bg-[#1c1813] border border-neutral-800 text-xs sm:text-sm text-neutral-200 leading-relaxed font-serif">
                        "{ex.contextText}"
                      </div>
                    )}
                    {ex.germanPrompt && (
                      <div className="p-2.5 rounded-xl bg-[#1d1814] border border-amber-500/30 text-xs sm:text-sm font-bold text-amber-300">
                        Deutsch: {ex.germanPrompt}
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 pt-1">
                      <p className="text-sm sm:text-base font-bold text-white tracking-tight flex-1">
                        {ex.prompt}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          play(
                            ex.id,
                            ex.contextText ? `${ex.contextText}. ${ex.prompt}` : ex.prompt
                          )
                        }
                        className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                          activeSpeechId === ex.id && isSpeaking
                            ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                            : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
                        }`}
                        title="Listen to question"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>

                  {/* Interaction Form based on Exercise Type */}
                  <div className="pt-1">
                    {/* 1. Multiple Choice / Reading Comp */}
                    {ex.type === 'multiple-choice' || ex.type === 'reading-comp' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ex.options?.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            disabled={isSub && isCorrect}
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [ex.id]: opt }))
                            }
                            className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-left border transition-all cursor-pointer ${
                              answers[ex.id] === opt
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow'
                                : 'bg-[#191511] border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : ex.type === 'sentence-order' && ex.wordsToOrder ? (
                      /* 2. Sentence Ordering with Tap Chips */
                      <div className="space-y-3">
                        <div className="min-h-[48px] p-3 rounded-2xl bg-[#100e0c] border border-neutral-700 flex items-center gap-1.5 flex-wrap">
                          {(orderedWords[ex.id] || []).length === 0 ? (
                            <span className="text-xs text-neutral-500 italic">
                              Tap words below in order to build the sentence...
                            </span>
                          ) : (
                            (orderedWords[ex.id] || []).map((word, wIdx) => (
                              <button
                                key={wIdx}
                                type="button"
                                disabled={isSub && isCorrect}
                                onClick={() => handleRemoveWord(ex.id, wIdx)}
                                className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 font-medium text-xs hover:bg-rose-500/20 transition-all cursor-pointer"
                                title="Tap to remove word"
                              >
                                {word} ✕
                              </button>
                            ))
                          )}
                        </div>

                        {!isSub && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {ex.wordsToOrder.map((w, wIdx) => {
                              const alreadyUsed = (orderedWords[ex.id] || []).includes(w);
                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  disabled={alreadyUsed}
                                  onClick={() => handleWordTap(ex.id, w)}
                                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                                    alreadyUsed
                                      ? 'opacity-30 border-neutral-800 bg-neutral-900 text-neutral-600 cursor-not-allowed'
                                      : 'bg-[#1b1713] border-neutral-700 text-neutral-200 hover:text-white hover:border-amber-400 cursor-pointer'
                                  }`}
                                >
                                  {w}
                                </button>
                              );
                            })}
                            {(orderedWords[ex.id] || []).length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleClearSentence(ex.id)}
                                className="px-2.5 py-1 rounded-xl text-neutral-400 hover:text-rose-400 text-xs transition-colors cursor-pointer"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* 3. Text Input (Fill-in-blank, vocab recall, writing) */
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={answers[ex.id] || ''}
                          disabled={isSub && isCorrect}
                          onChange={(e) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [ex.id]: e.target.value,
                            }))
                          }
                          placeholder={
                            ex.type === 'short-writing'
                              ? 'Write your response in English (minimum 15 words)...'
                              : 'Type your English answer here...'
                          }
                          className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#120f0d] border border-neutral-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {!isSub ? (
                      <button
                        type="button"
                        disabled={!(answers[ex.id] || '').trim()}
                        onClick={() => handleCheck(ex)}
                        className="min-h-[40px] px-5 py-2 rounded-2xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 transition-all cursor-pointer"
                      >
                        Check Answer
                      </button>
                    ) : (
                      !isCorrect && (
                        <button
                          type="button"
                          onClick={() => handleRetry(ex.id)}
                          className="min-h-[40px] px-4 py-2 rounded-2xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry Question</span>
                        </button>
                      )
                    )}

                    {ex.hint && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowHint((prev) => ({
                            ...prev,
                            [ex.id]: !prev[ex.id],
                          }))
                        }
                        className="min-h-[40px] px-3 py-2 rounded-2xl text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint[ex.id] ? 'Hide Hint' : 'Hint'}</span>
                      </button>
                    )}
                  </div>

                  {/* Hint */}
                  {showHint[ex.id] && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                      💡 <strong>Hint:</strong> {ex.hint}
                    </div>
                  )}

                  {/* Explanation upon check */}
                  {isSub && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs sm:text-sm space-y-1 ${
                        isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1">
                        {isCorrect ? '✅ Well done!' : '❌ Not quite right:'}
                      </div>
                      <p className="text-neutral-200">{ex.explanation}</p>
                      {!isCorrect && (
                        <div className="pt-1 font-mono text-xs text-amber-300">
                          Expected Answer: <strong>{ex.expectedAnswer}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODE 2: MIXED GRAMMAR CHALLENGE ================= */}
      {activeMode === 'challenge' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Challenge Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#1a1612] to-amber-500/10 border-2 border-amber-400/40 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Final Mixed Grammar Challenge
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Test your grammar across Simple Present, Verb TO BE, third-person -s, negatives (don't/doesn't), questions (do/does), short answers, and frequency adverbs.
              <strong> Answers are hidden until you submit the entire challenge!</strong>
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs font-mono text-amber-300">
              <span>Questions: {challengeQuestions.length}</span>
              <span>•</span>
              <span>Answered: {answeredChallengeCount} / {challengeQuestions.length}</span>
            </div>
          </div>

          {/* Results Summary if submitted */}
          {challengeSubmitted && challengeScore && (
            <div className="p-5 rounded-3xl bg-[#17130f] border-2 border-amber-400 space-y-3 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    Challenge Complete
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Score: {challengeScore.correct} / {challengeScore.total} (
                    {Math.round((challengeScore.correct / challengeScore.total) * 100)}%)
                  </h4>
                </div>
                <Award className="w-8 h-8 text-amber-400 shrink-0" />
              </div>
              <p className="text-xs text-neutral-300">
                {challengeScore.correct >= 8
                  ? '🎉 Outstanding work! Your understanding of Simple Present and core elementary grammar is ready for the exam.'
                  : '💡 Good practice! Review the explanations below, then retry the questions you missed.'}
              </p>
              <button
                type="button"
                onClick={handleResetChallenge}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Challenge</span>
              </button>
            </div>
          )}

          {/* Challenge Questions List */}
          <div className="space-y-4">
            {challengeQuestions.map((q, qIdx) => {
              const currentAns = challengeAnswers[q.id] || '';
              const isCorrect = challengeSubmitted && checkSingleAnswer(q, currentAns);

              return (
                <div
                  key={q.id}
                  className={`bg-[#16120e] rounded-3xl p-4 sm:p-5 border transition-all ${
                    challengeSubmitted
                      ? isCorrect
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-rose-500/40 bg-rose-500/5'
                      : 'border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      Challenge #{qIdx + 1}: {q.categoryLabel}
                    </span>
                    {challengeSubmitted && (
                      <span
                        className={`text-xs font-bold flex items-center gap-1 ${
                          isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-white text-sm sm:text-base pt-1">
                    {q.prompt}
                  </p>

                  {/* Input without answer reveal */}
                  <div className="pt-2">
                    {q.type === 'multiple-choice' && q.options ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            disabled={challengeSubmitted}
                            onClick={() =>
                              setChallengeAnswers((prev) => ({
                                ...prev,
                                [q.id]: opt,
                              }))
                            }
                            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-left border transition-all cursor-pointer ${
                              currentAns === opt
                                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow'
                                : 'bg-[#120f0d] border-neutral-700/80 text-neutral-300 hover:text-white'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={currentAns}
                        disabled={challengeSubmitted}
                        onChange={(e) =>
                          setChallengeAnswers((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        placeholder="Type your answer..."
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#120f0d] border border-neutral-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none"
                      />
                    )}
                  </div>

                  {/* Explanation shown ONLY after submit */}
                  {challengeSubmitted && (
                    <div className="mt-3 p-3 rounded-2xl bg-[#1c1813] border border-neutral-700 text-xs text-neutral-200 space-y-1">
                      <p>{q.explanation}</p>
                      {!isCorrect && (
                        <div className="font-mono text-xs text-amber-300">
                          Expected Answer: <strong>{q.expectedAnswer}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Challenge Action */}
          {!challengeSubmitted ? (
            <div className="pt-2">
              <button
                type="button"
                disabled={answeredChallengeCount === 0}
                onClick={handleSubmitChallenge}
                className="w-full min-h-[48px] py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-neutral-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Submit Mixed Grammar Challenge ({answeredChallengeCount}/{challengeQuestions.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetChallenge}
                className="w-full min-h-[48px] py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Challenge with Fresh Answers</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
