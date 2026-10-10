import React, { useState } from 'react';
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
} from 'lucide-react';
import { PRACTICE_EXERCISES, PracticeExerciseItem } from '../../data/examPrepare/practiceQuestions';
import { useEdgeTTS } from '../../hooks/useEdgeTTS';
import { examProgressService } from '../../services/examProgressService';

export const ExamPracticeView: React.FC = () => {
  const { play, isSpeaking, activeSpeechId } = useEdgeTTS('en');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [orderedWords, setOrderedWords] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

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

  const handleCheck = (ex: PracticeExerciseItem) => {
    const userVal = (answers[ex.id] || '').trim().toLowerCase();
    if (!userVal) return;

    setSubmitted((prev) => ({ ...prev, [ex.id]: true }));

    const expected = ex.expectedAnswer.toLowerCase().trim();
    const alternates = (ex.alternateAnswers || []).map((a) => a.toLowerCase().trim());

    let isCorrect = false;
    if (ex.type === 'short-writing') {
      // For short writing, check minimum word length of 12+ words
      const wordCount = userVal.split(/\s+/).filter(Boolean).length;
      isCorrect = wordCount >= 12;
    } else {
      isCorrect = userVal === expected || alternates.includes(userVal);
    }

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

  return (
    <div className="w-full space-y-5 animate-fadeIn">
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
          const userVal = (answers[ex.id] || '').trim().toLowerCase();
          const expected = ex.expectedAnswer.toLowerCase().trim();
          const alternates = (ex.alternateAnswers || []).map((a) => a.toLowerCase().trim());

          let isCorrect = false;
          if (ex.type === 'short-writing') {
            const count = userVal.split(/\s+/).filter(Boolean).length;
            isCorrect = count >= 12;
          } else {
            isCorrect = userVal === expected || alternates.includes(userVal);
          }

          return (
            <div
              key={ex.id}
              className="bg-[#15120f] border border-neutral-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-mono font-semibold text-amber-400">
                    {ex.categoryLabel}
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
                <p className="text-xs text-neutral-400 font-medium">
                  {ex.instruction}
                </p>
                {ex.contextText && (
                  <div className="p-3.5 rounded-2xl bg-[#1b1713] border border-neutral-800 text-xs text-neutral-200 leading-relaxed font-serif italic my-2">
                    "{ex.contextText}"
                  </div>
                )}
                {ex.germanPrompt && (
                  <div className="p-3 rounded-xl bg-[#1d1814] border border-amber-500/30 text-sm font-bold text-amber-300">
                    Deutsch: {ex.germanPrompt}
                  </div>
                )}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <p className="text-sm sm:text-base font-bold text-white tracking-tight flex-1">
                    {ex.prompt}
                  </p>
                  <button
                    type="button"
                    onClick={() => play(ex.id, ex.contextText ? `${ex.contextText}. ${ex.prompt}` : ex.prompt)}
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
                {/* 1. Multiple Choice */}
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
                    {/* Selected Sentence Box */}
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
                            className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500 text-neutral-950 active:scale-95 transition-all shadow"
                            title="Tap to remove"
                          >
                            {word} ✕
                          </button>
                        ))
                      )}
                    </div>

                    {/* Word pool */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-neutral-400 uppercase font-mono mr-1">
                        Available words:
                      </span>
                      {ex.wordsToOrder.map((word, wIdx) => {
                        const countUsed = (orderedWords[ex.id] || []).filter(
                          (w) => w === word
                        ).length;
                        const countTotal = ex.wordsToOrder!.filter(
                          (w) => w === word
                        ).length;
                        const isUsedUp = countUsed >= countTotal;

                        return (
                          <button
                            key={wIdx}
                            type="button"
                            disabled={isUsedUp || (isSub && isCorrect)}
                            onClick={() => handleWordTap(ex.id, word)}
                            className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                              isUsedUp
                                ? 'opacity-30 border-neutral-800 bg-neutral-900 text-neutral-600'
                                : 'bg-[#201b16] border-neutral-700 text-neutral-200 hover:text-white active:scale-95'
                            }`}
                          >
                            {word}
                          </button>
                        );
                      })}

                      {(orderedWords[ex.id] || []).length > 0 && !isSub && (
                        <button
                          type="button"
                          onClick={() => handleClearSentence(ex.id)}
                          className="text-[11px] text-rose-400 hover:underline px-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                ) : ex.type === 'short-writing' ? (
                  /* 3. Short Writing Textarea */
                  <div className="space-y-1.5">
                    <textarea
                      rows={4}
                      disabled={isSub && isCorrect}
                      value={answers[ex.id] || ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [ex.id]: e.target.value }))
                      }
                      placeholder="Write your answer in English here (minimum 15 words)..."
                      className="w-full p-3.5 rounded-2xl bg-[#181410] border border-neutral-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none resize-y"
                    />
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Word count:{' '}
                      {(answers[ex.id] || '').split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                ) : (
                  /* 4. Standard text input */
                  <div>
                    <input
                      type="text"
                      value={answers[ex.id] || ''}
                      disabled={isSub && isCorrect}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [ex.id]: e.target.value }))
                      }
                      placeholder="Type your answer in English..."
                      className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#181410] border border-neutral-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {!isSub ? (
                  <button
                    type="button"
                    disabled={!(answers[ex.id] || '').trim()}
                    onClick={() => handleCheck(ex)}
                    className="min-h-[42px] px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 transition-all cursor-pointer shadow active:scale-95"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {!isCorrect && (
                      <button
                        type="button"
                        onClick={() => handleRetry(ex.id)}
                        className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                      </button>
                    )}
                  </div>
                )}

                {ex.hint && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowHint((prev) => ({ ...prev, [ex.id]: !prev[ex.id] }))
                    }
                    className="min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint[ex.id] ? 'Hide Hint' : 'Hint'}</span>
                  </button>
                )}
              </div>

              {/* Hint Box */}
              {showHint[ex.id] && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  💡 <strong>Hint:</strong> {ex.hint}
                </div>
              )}

              {/* Post Submission Explanation */}
              {isSub && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{isCorrect ? 'Well done!' : 'Explanation:'}</span>
                    {ex.type !== 'short-writing' && (
                      <span className="font-mono text-amber-400">
                        Expected: {ex.expectedAnswer}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {ex.explanation}
                  </p>

                  {ex.modelAnswer && (
                    <div className="pt-2 border-t border-neutral-800 space-y-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block">
                        Model Answer Example:
                      </span>
                      <p className="text-xs text-neutral-200 italic">
                        "{ex.modelAnswer}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
