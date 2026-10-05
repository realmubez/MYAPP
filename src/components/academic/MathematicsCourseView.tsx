import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { MathSymbolIcon } from '../common/FlagIcons';
import { MATHEMATICS_UNITS, MATHEMATICS_ARITHMETIC_LESSON } from '../../data/courses/mathematics';
import { AcademicLesson } from '../../types/academic';
import { AcademicLessonEngine } from './AcademicLessonEngine';
import { useProgress } from '../../hooks/useProgress';

export function MathematicsCourseView() {
  const navigate = useNavigate();
  const { progress, isExerciseCompleted, updateLastPosition } = useProgress();
  const mathProgress = progress.subjects.mathematics;

  // Active academic lesson
  const [activeAcademicLesson, setActiveAcademicLesson] = useState<AcademicLesson | null>(null);

  // Collapsible units state
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'math-u01': true,
  });

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const handleStartLesson = (lesson: AcademicLesson) => {
    updateLastPosition({
      subjectId: 'mathematics',
      unitId: lesson.unitId,
      unitTitle: lesson.unitTitle,
      exerciseId: lesson.id,
      exerciseTitle: `${lesson.title} · Interactive Session`,
      stage: 'concept',
      sentenceIndex: 0,
    });
    setActiveAcademicLesson(lesson);
  };

  // If active, render the AcademicLessonEngine
  if (activeAcademicLesson) {
    return (
      <AcademicLessonEngine
        lesson={activeAcademicLesson}
        onExit={() => setActiveAcademicLesson(null)}
        onComplete={() => setActiveAcademicLesson(null)}
      />
    );
  }

  const completedCount = mathProgress?.completedLessons || 0;
  const totalCount = 1;
  const percentComplete = Math.min(100, Math.round((completedCount / totalCount) * 100));

  return (
    <div id="mathematics-course-view" className="w-full max-w-4xl mx-auto space-y-6 pb-24 lg:pb-12 text-neutral-100">
      {/* Back button & Subject Title Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-800/80 pb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          id="back-to-dashboard-math"
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-amber-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <MathSymbolIcon size={48} className="shrink-0 shadow-md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Mathematics
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-amber-400 border border-neutral-700">
                  Foundation 1
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                Master arithmetic, core operations, and problem-solving through step-by-step concepts, worked examples, and typing drills.
              </p>
            </div>
          </div>

          {/* Overall Progress Widget */}
          <div className="flex items-center gap-3 bg-[#141210] border border-neutral-800/80 px-4 py-2.5 rounded-2xl">
            <div className="text-right">
              <span className="text-xs text-neutral-400 block font-mono">
                {completedCount} of {totalCount} lesson completed
              </span>
              <span className="text-xs text-amber-400 font-bold font-mono">
                {percentComplete}% Complete
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-neutral-700 flex items-center justify-center font-bold text-xs font-mono text-white">
              {percentComplete}%
            </div>
          </div>
        </div>
      </div>

      {/* Course Units & Lessons list */}
      <div className="space-y-4">
        {MATHEMATICS_UNITS.map((unit) => {
          const isExpanded = expandedUnits[unit.id] ?? true;

          return (
            <div
              key={unit.id}
              className="rounded-3xl border border-neutral-800/80 bg-[#12100e] overflow-hidden shadow-sm"
            >
              {/* Unit Header */}
              <button
                type="button"
                onClick={() => toggleUnit(unit.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#161412] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-xs">
                    0{unit.unitNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {unit.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                      {unit.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                    {unit.lessons.length} lesson
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Lessons List */}
              {isExpanded && (
                <div className="border-t border-neutral-800/60 divide-y divide-neutral-800/40 p-2 sm:p-3">
                  {unit.lessons.map((les) => {
                    const isCompleted = isExerciseCompleted(les.id);

                    return (
                      <div
                        key={les.id}
                        onClick={() => handleStartLesson(les)}
                        className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-[#181512] transition-all cursor-pointer border border-transparent hover:border-amber-500/30"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-lg font-serif font-bold text-amber-400 group-hover:border-amber-500/40 transition-colors shrink-0">
                            ∑
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                                {les.title}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono shrink-0">
                                {les.steps.length} steps · {les.category}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 truncate mt-0.5">
                              {les.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <Check className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                              <span>Start</span>
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
