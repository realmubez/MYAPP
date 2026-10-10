import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Trash2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  MistakeRecord,
  examProgressService,
} from '../../services/examProgressService';
import { isAnswerAcceptable } from '../../utils/grammarValidation';

interface ExamMistakesReviewProps {
  mistakes: MistakeRecord[];
  onBackToStudy: () => void;
}

export const ExamMistakesReview: React.FC<ExamMistakesReviewProps> = ({
  mistakes,
  onBackToStudy,
}) => {
  const [retryAnswers, setRetryAnswers] = useState<Record<string, string>>({});
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  const handleAnswerChange = (id: string, val: string) => {
    setRetryAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleCheck = (m: MistakeRecord) => {
    const val = (retryAnswers[m.id] || '').trim().toLowerCase();
    if (!val) return;

    setCheckedIds((prev) => ({ ...prev, [m.id]: true }));
    const isCorrect = isAnswerAcceptable(val, m.expectedAnswer);

    if (isCorrect) {
      examProgressService.resolveMistake(m.id);
      examProgressService.recordPracticeAnswer(true);
    } else {
      examProgressService.recordPracticeAnswer(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all mistakes from your review queue?')) {
      examProgressService.clearAllMistakes();
    }
  };

  if (mistakes.length === 0) {
    return (
      <div className="bg-[#15120f] border border-emerald-500/30 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          No Mistakes to Review! 🎉
        </h3>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
          You currently have zero pending errors in your review queue. As you practise lessons, drills, and mock tests, any missed question is automatically saved here so you can master it before exam day!
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onBackToStudy}
            className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs sm:text-sm transition-all cursor-pointer inline-flex items-center gap-2 shadow"
          >
            <span>Continue Lesson Sprint</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header bar with count and Clear All button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#171310] border border-rose-500/30 p-4 sm:p-5 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold text-xs">
              {mistakes.length}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Questions Needing Review
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Retrying these questions until correct will automatically clear them from your list.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearAll}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All ({mistakes.length})</span>
        </button>
      </div>

      {/* List of mistakes */}
      <div className="space-y-4">
        {mistakes.map((m, idx) => {
          const isChecked = !!checkedIds[m.id];
          const val = (retryAnswers[m.id] || '').trim().toLowerCase();
          const isCorrect = isChecked && val === m.expectedAnswer.toLowerCase().trim();

          return (
            <div
              key={m.id}
              className="bg-[#15120f] border border-neutral-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      {m.sourceTitle}
                    </span>
                    <span className="text-neutral-500 text-xs">#{idx + 1}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-white pt-1">
                    {m.questionPrompt}
                  </h4>
                </div>

                {isChecked && (
                  <span
                    className={`text-xs font-bold flex items-center gap-1 shrink-0 ${
                      isCorrect ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Solved!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Not quite
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Previous mistake info */}
              <div className="bg-[#1b1713] p-3 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span>
                  Your previous answer: <strong className="text-rose-300 line-through">{m.userAnswer || '(none)'}</strong>
                </span>
              </div>

              {/* Retry Input */}
              {m.options && m.options.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {m.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={isChecked && isCorrect}
                      onClick={() => handleAnswerChange(m.id, opt)}
                      className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-left border transition-all cursor-pointer ${
                        retryAnswers[m.id] === opt
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-[#14110e] border-neutral-700/80 text-neutral-300 hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={retryAnswers[m.id] || ''}
                    disabled={isChecked && isCorrect}
                    onChange={(e) => handleAnswerChange(m.id, e.target.value)}
                    placeholder="Type the correct English answer..."
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#181410] border border-neutral-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {!isCorrect ? (
                  <button
                    type="button"
                    disabled={!(retryAnswers[m.id] || '').trim()}
                    onClick={() => handleCheck(m)}
                    className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 transition-all cursor-pointer shadow active:scale-95"
                  >
                    Check & Clear Mistake
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> This mistake has been cleared!
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setShowHint((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
                  className="min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint[m.id] ? 'Hide Explanation' : 'View Explanation'}</span>
                </button>
              </div>

              {/* Explanation Dropdown */}
              {(showHint[m.id] || (isChecked && !isCorrect)) && (
                <div className="p-3.5 rounded-2xl bg-[#1a1612] border border-neutral-700 text-xs text-neutral-300 space-y-1.5 leading-relaxed">
                  <div className="flex items-center justify-between font-bold text-amber-400">
                    <span>Correct Answer: {m.expectedAnswer}</span>
                  </div>
                  <p>{m.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
