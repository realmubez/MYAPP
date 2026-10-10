import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Sparkles,
  Check,
  Bookmark,
  Layers,
} from 'lucide-react';
import { ExamLesson, LessonPracticeQuestion } from '../../data/examPrepare/straightforwardUnits';
import { EXAM_VOCABULARY_LIST } from '../../data/examPrepare/vocabularyBank';
import { useEdgeTTS } from '../../hooks/useEdgeTTS';
import { examProgressService } from '../../services/examProgressService';

interface ExamLessonDetailProps {
  lesson: ExamLesson;
  isCompleted: boolean;
  isBookmarked: boolean;
  onBackToList: () => void;
  onSelectLesson: (lessonId: string) => void;
  onToggleComplete: (completed: boolean) => void;
  onToggleBookmark: () => void;
  allLessons: ExamLesson[];
}

export const ExamLessonDetail: React.FC<ExamLessonDetailProps> = ({
  lesson,
  isCompleted,
  isBookmarked,
  onBackToList,
  onSelectLesson,
  onToggleComplete,
  onToggleBookmark,
  allLessons,
}) => {
  const { play, isSpeaking, activeSpeechId, loadingKey } = useEdgeTTS('en');

  // State for practice questions in this lesson
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Filter vocabulary relevant to this lesson
  const lessonVocab = EXAM_VOCABULARY_LIST.filter((v) =>
    lesson.keyVocabularyIds.includes(v.id)
  );

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleCheckAnswer = (q: LessonPracticeQuestion) => {
    const userVal = (answers[q.id] || '').trim().toLowerCase();
    if (!userVal) return;

    setSubmitted((prev) => ({ ...prev, [q.id]: true }));

    const expected = q.expectedAnswer.toLowerCase().trim();
    const alternates = (q.alternateAnswers || []).map((a) => a.toLowerCase().trim());
    const isCorrect = userVal === expected || alternates.includes(userVal);

    examProgressService.recordPracticeAnswer(isCorrect);

    if (isCorrect) {
      examProgressService.resolveMistake(q.id);
    } else {
      examProgressService.recordMistake({
        id: q.id,
        questionPrompt: q.prompt,
        sourceType: 'lesson',
        sourceTitle: `Lesson ${lesson.number}: ${lesson.title}`,
        userAnswer: answers[q.id] || '',
        expectedAnswer: q.expectedAnswer,
        explanation: q.explanation,
        options: q.options,
      });
    }
  };

  const handleRetry = (questionId: string) => {
    setSubmitted((prev) => ({ ...prev, [questionId]: false }));
    setAnswers((prev) => ({ ...prev, [questionId]: '' }));
  };

  return (
    <article className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Top Nav: Back to list & Bookmark toggle */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <button
          type="button"
          onClick={onBackToList}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All 16 Lessons</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white border-neutral-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleComplete(!isCompleted)}
            className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* Lesson Header Card */}
      <header className="bg-[#15120f] border border-amber-500/25 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center justify-center">
                {lesson.number}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {lesson.unit}
              </span>
              <span className="text-xs font-medium text-neutral-400">
                {lesson.category} · ~{lesson.estimatedMinutes} min
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {lesson.title}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          {lesson.description}
        </p>
      </header>

      {/* 1. Clear Grammar / Topic Explanation */}
      <section className="bg-[#15120f] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Explanation & Rules
            </h3>
          </div>

          <button
            type="button"
            onClick={() => play(`lesson-exp-${lesson.id}`, lesson.explanation)}
            className={`min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              activeSpeechId === `lesson-exp-${lesson.id}` && isSpeaking
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
            }`}
            title="Listen to explanation"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Listen</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
          {lesson.explanation}
        </p>

        {/* Rules Box */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
            Key Grammar Rules:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {lesson.rules.map((r, i) => (
              <div
                key={i}
                className="bg-[#1c1814] rounded-2xl p-3.5 border border-neutral-800/80 space-y-1 text-xs"
              >
                <span className="font-bold text-neutral-100 block">
                  • {r.rule}
                </span>
                <span className="text-amber-300/90 font-mono block text-[11px]">
                  Eg: {r.example}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Reading Passage (if applicable) */}
      {lesson.readingPassage && (
        <section className="bg-[#171310] border border-sky-500/30 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-xs">
                📖
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider block">
                  Reading Text
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {lesson.readingPassage.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                play(`reading-${lesson.id}`, lesson.readingPassage!.text)
              }
              className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                activeSpeechId === `reading-${lesson.id}` && isSpeaking
                  ? 'bg-sky-500 text-neutral-950 font-bold border-sky-400'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen to Text</span>
            </button>
          </div>

          <div className="bg-[#110e0c] p-4 rounded-2xl border border-neutral-800 text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-line font-serif italic">
            "{lesson.readingPassage.text}"
          </div>
        </section>
      )}

      {/* 3. Examples with Individual Listen Buttons */}
      <section className="bg-[#15120f] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-neutral-800 pb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Straightforward Example Sentences</span>
        </div>

        <div className="space-y-2">
          {lesson.examples.map((ex) => {
            const isPlaying = activeSpeechId === ex.id && isSpeaking;
            return (
              <div
                key={ex.id}
                className="bg-[#1b1713] rounded-2xl p-3.5 border border-neutral-800 flex items-start justify-between gap-3 text-xs sm:text-sm"
              >
                <div className="space-y-1 min-w-0">
                  <p className="font-semibold text-white tracking-tight">
                    {ex.english}
                  </p>
                  <p className="text-neutral-400 text-xs italic">
                    {ex.german}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => play(ex.id, ex.english)}
                  className={`min-h-[36px] min-w-[36px] p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isPlaying
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md ring-1 ring-amber-300'
                      : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
                  }`}
                  title="Listen to sentence"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Lesson Vocabulary (English - German) */}
      {lessonVocab.length > 0 && (
        <section className="bg-[#15120f] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Unit Vocabulary & Meanings ({lessonVocab.length})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {lessonVocab.map((v) => {
              const isPlaying = activeSpeechId === v.id && isSpeaking;
              return (
                <div
                  key={v.id}
                  className="bg-[#1c1814] rounded-2xl p-3 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-white text-sm">
                        {v.word}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        ({v.partOfSpeech})
                      </span>
                    </div>
                    <span className="text-amber-400/90 font-medium block truncate">
                      {v.germanTranslation}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => play(v.id, `${v.word}. ${v.exampleSentence}`)}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isPlaying
                        ? 'bg-amber-500 text-neutral-950 border-amber-400'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
                    }`}
                    title="Listen to word and example"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Practice Questions with Instant Checking */}
      <section className="bg-[#15120f] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Interactive Practice Questions</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
              {lesson.practiceQuestions.length} questions
            </span>
          </h3>
        </div>

        <div className="space-y-4">
          {lesson.practiceQuestions.map((q, idx) => {
            const isSub = !!submitted[q.id];
            const currentAns = answers[q.id] || '';
            const isCorrect =
              isSub &&
              (currentAns.toLowerCase().trim() === q.expectedAnswer.toLowerCase().trim() ||
                (q.alternateAnswers || []).some(
                  (a) => a.toLowerCase().trim() === currentAns.toLowerCase().trim()
                ));

            return (
              <div
                key={q.id}
                className="bg-[#1b1713] rounded-2xl p-4 border border-neutral-800 space-y-3 text-xs sm:text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    Question {idx + 1}:
                  </span>
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

                <p className="font-semibold text-white leading-snug">
                  {q.prompt}
                </p>

                {/* Question Inputs: Multiple choice or text field */}
                {q.type === 'multiple-choice' && q.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={isSub && isCorrect}
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-left border transition-all cursor-pointer ${
                          currentAns === opt
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-[#14110e] border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={currentAns}
                      disabled={isSub && isCorrect}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#14110e] border border-neutral-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none"
                    />
                  </div>
                )}

                {/* Form Controls */}
                <div className="flex items-center gap-2 pt-1">
                  {!isSub ? (
                    <button
                      type="button"
                      disabled={!currentAns.trim()}
                      onClick={() => handleCheckAnswer(q)}
                      className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 transition-all cursor-pointer"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {!isCorrect && (
                        <button
                          type="button"
                          onClick={() => handleRetry(q.id)}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Try Again</span>
                        </button>
                      )}
                    </div>
                  )}

                  {q.hint && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowHint((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className="min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint[q.id] ? 'Hide Hint' : 'Hint'}</span>
                    </button>
                  )}
                </div>

                {/* Hint Alert */}
                {showHint[q.id] && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    💡 <strong>Hint:</strong> {q.hint}
                  </div>
                )}

                {/* Post-submit feedback & simple English explanation */}
                {isSub && (
                  <div
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{isCorrect ? 'Well done!' : 'Explanation:'}</span>
                      <span className="font-mono text-amber-400">
                        Answer: {q.expectedAnswer}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Lesson Navigation (Prev & Next) */}
      <footer className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-800">
        {prevLesson ? (
          <button
            type="button"
            onClick={() => onSelectLesson(prevLesson.id)}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev:</span> Lesson {prevLesson.number}
          </button>
        ) : (
          <div></div>
        )}

        <button
          type="button"
          onClick={() => onToggleComplete(!isCompleted)}
          className={`min-h-[44px] px-5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{isCompleted ? 'Lesson Completed ✓' : 'Mark as Complete'}</span>
        </button>

        {nextLesson ? (
          <button
            type="button"
            onClick={() => onSelectLesson(nextLesson.id)}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="hidden xs:inline">Next:</span> Lesson {nextLesson.number}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div></div>
        )}
      </footer>
    </article>
  );
};
