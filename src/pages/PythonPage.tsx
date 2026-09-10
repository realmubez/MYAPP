import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Code2,
  ListChecks,
} from 'lucide-react';
import { PythonLogoIcon } from '../components/common/FlagIcons';
import {
  PYTHON_UNITS,
  PythonCourseUnit,
  PythonExerciseItem,
} from '../data/pythonUnits';
import { PythonFocusLesson } from '../components/focus/PythonFocusLesson';
import { useProgress } from '../hooks/useProgress';

export function PythonPage() {
  const navigate = useNavigate();
  const { progress, isExerciseCompleted, updateLastPosition } = useProgress();
  const pythonProgress = progress.subjects.python;

  // Active interactive focus exercise
  const [activeExercise, setActiveExercise] = useState<PythonExerciseItem | null>(null);
  const [activeUnit, setActiveUnit] = useState<PythonCourseUnit | null>(null);

  // Collapsible chapters state: Chapter 1 open by default
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'py-b1-u01': true,
    'unit-1': true,
  });

  // Course Guide modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const handleStartExercise = (exercise: PythonExerciseItem, unit?: PythonCourseUnit) => {
    if (unit) setActiveUnit(unit);
    updateLastPosition({
      subjectId: 'python',
      unitId: unit?.id,
      unitTitle: unit ? `Chapter ${unit.unitNumber.toString().padStart(2, '0')} · ${unit.title}` : undefined,
      exerciseId: exercise.id,
      exerciseTitle: `${exercise.title} · ${exercise.mode}`,
    });
    setActiveExercise(exercise);
  };

  // Progression steps helper for Python: Concept -> Type -> Code -> Recall
  const getProgressionSteps = (unit: PythonCourseUnit) => {
    const subtitleMap: Record<string, string> = {
      Concept: 'Understand the key concept',
      Type: 'Build muscle memory',
      Code: 'Write small code patterns',
      Recall: 'Test and reinforce knowledge',
    };

    return unit.exercises.map((exercise, idx) => ({
      id: exercise.id,
      stepNumber: (idx + 1).toString().padStart(2, '0'),
      label: exercise.mode,
      icon: exercise.icon || (idx === 0 ? '💡' : idx === 1 ? '⌨️' : idx === 2 ? '</>' : '🎯'),
      subtitle: subtitleMap[exercise.mode] || 'Practice Python syntax',
      itemCount: '1 exercise',
      exercise,
    }));
  };

  return (
    <div
      id="python-course-page"
      className="w-full max-w-md mx-auto space-y-6 pb-24 text-neutral-100"
    >
      {/* Active Focus Mode Overlay */}
      {activeExercise && (
        <PythonFocusLesson
          exercise={activeExercise}
          parentUnit={activeUnit || undefined}
          onExit={() => setActiveExercise(null)}
          onComplete={() => {
            // Can remain open or close
          }}
        />
      )}

      {/* Top Bar matching reference */}
      <div className="flex items-center justify-between pt-1">
        {/* Back button */}
        <button
          type="button"
          id="back-to-dashboard-btn"
          onClick={() => navigate('/')}
          aria-label="Back to Dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Title with Python Icon */}
        <div className="flex items-center gap-3">
          <PythonLogoIcon size={38} className="shrink-0" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              Python
            </h1>
            <span className="text-xs text-neutral-400 font-medium">
              Beginner 1
            </span>
          </div>
        </div>

        {/* Course Guide Book Button */}
        <button
          type="button"
          id="open-python-book-btn"
          onClick={() => setIsBookModalOpen(true)}
          aria-label="Python Course Guide"
          title="Python Course Guide"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Short Subtitle as specified */}
      <p className="text-xs text-neutral-400 text-center px-4 leading-relaxed">
        Learn Python concepts through typing, recall and coding.
      </p>

      {/* Overall Progress Pill Card */}
      <div
        id="python-progress-card"
        className="rounded-full border border-neutral-800/90 bg-neutral-900/90 py-2 px-3.5 flex items-center justify-between gap-3 shadow-inner"
      >
        <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
          {pythonProgress.percentComplete}%
        </span>

        <div className="h-2 flex-1 rounded-full bg-neutral-800/90 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${Math.max(2, pythonProgress.percentComplete)}%` }}
          />
        </div>

        <span className="text-xs font-mono text-neutral-400 shrink-0">
          {pythonProgress.completedLessons} / {pythonProgress.totalLessons} lessons
        </span>
      </div>

      {/* Course Chapters Section */}
      <div className="space-y-6 pt-2">
        {PYTHON_UNITS.map((unit: PythonCourseUnit) => {
          const isExpanded = expandedUnits[unit.id] !== false;
          const steps = getProgressionSteps(unit);

          return (
            <div key={unit.id} id={unit.id} className="space-y-3">
              {/* Chapter Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold tracking-wide text-amber-400">
                    Chapter {unit.unitNumber.toString().padStart(2, '0')}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                    {unit.title}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    {unit.description}
                  </p>
                </div>

                {/* Exercise count & Toggle button */}
                <button
                  type="button"
                  onClick={() => toggleUnit(unit.id)}
                  className="flex items-center gap-2 pt-1 shrink-0 text-neutral-400 hover:text-neutral-200"
                  aria-label={isExpanded ? 'Collapse chapter' : 'Expand chapter'}
                >
                  <span className="text-xs text-neutral-400">
                    {unit.exercises.length} exercises
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-300">
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
              </div>

              {/* Learning Progression Path Cards */}
              {isExpanded && (
                <div className="space-y-0 pt-0.5">
                  {steps.map((step, idx, arr) => {
                    const isLast = idx === arr.length - 1;
                    const isDone = step.exercise ? isExerciseCompleted(step.exercise.id) : false;

                    return (
                      <div key={step.id} className="relative">
                        <div
                          id={`exercise-card-${step.id}`}
                          onClick={() => step.exercise && handleStartExercise(step.exercise, unit)}
                          className={`group relative flex items-center justify-between rounded-2xl border p-3 sm:p-3.5 transition-all active:scale-[0.99] cursor-pointer ${
                            isDone
                              ? 'border-neutral-800/90 bg-neutral-900/60 hover:border-amber-500/40'
                              : 'border-neutral-800/80 bg-neutral-900/80 hover:border-neutral-700/80'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Squircle Icon badge */}
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl shadow-sm transition-colors relative ${
                              isDone ? 'bg-neutral-900 border-amber-500/30 text-amber-300' : 'bg-neutral-950 border-neutral-800 group-hover:border-amber-500/40'
                            }`}>
                              {step.icon === '</>' ? (
                                <span className="font-mono text-xs font-bold text-amber-400">&lt;/&gt;</span>
                              ) : step.icon === 'list-check' ? (
                                <ListChecks className="w-5 h-5 text-amber-400" />
                              ) : (
                                <span role="img" aria-label={step.label}>
                                  {step.icon}
                                </span>
                              )}
                              {isDone && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-neutral-950 text-[10px] font-bold">
                                  ✓
                                </span>
                              )}
                            </div>

                            {/* Progression Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-amber-400">
                                  {step.stepNumber} — {step.label}
                                </span>
                                {isDone && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20 shrink-0">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-300 font-medium truncate mt-0.5">
                                {step.subtitle}
                              </p>
                              <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
                                {step.itemCount}
                              </span>
                            </div>
                          </div>

                          {/* Right Amber Arrow */}
                          <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform ml-2" />
                        </div>

                        {/* Subtle vertical amber learning-path line */}
                        {!isLast && (
                          <div
                            className="flex items-center pl-[35px] py-1"
                            aria-hidden="true"
                          >
                            <div className="w-0.5 h-3.5 bg-gradient-to-b from-amber-400/70 to-amber-500/25 rounded-full" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Course Guide Modal */}
      {isBookModalOpen && (
        <div
          id="python-book-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setIsBookModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Python Course Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="text-neutral-400 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Beginner 1 Syllabus Info */}
            <div className="space-y-2 text-xs text-neutral-300">
              <p className="font-medium text-white">Beginner 1 Focus:</p>
              <ul className="list-disc list-inside space-y-1 text-neutral-400">
                <li>Concept internalisation through deliberate typing</li>
                <li>Memory models: variables, references & mutability</li>
                <li>Control flow, iteration & pure function structures</li>
              </ul>
            </div>

            {/* Syntax Reference */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Syntax Reference</span>
              </label>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="rounded-lg bg-neutral-950 border border-neutral-800 px-2.5 py-1.5 text-neutral-300">
                  <span className="text-amber-400"># Variable:</span> x = 42
                </div>
                <div className="rounded-lg bg-neutral-950 border border-neutral-800 px-2.5 py-1.5 text-neutral-300">
                  <span className="text-amber-400"># List:</span> fruits = [&quot;apple&quot;, &quot;pear&quot;]
                </div>
                <div className="rounded-lg bg-neutral-950 border border-neutral-800 px-2.5 py-1.5 text-neutral-300">
                  <span className="text-amber-400"># Loop:</span> for item in items: print(item)
                </div>
                <div className="rounded-lg bg-neutral-950 border border-neutral-800 px-2.5 py-1.5 text-neutral-300">
                  <span className="text-amber-400"># Function:</span> def add(a, b): return a + b
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-2.5 text-xs font-semibold text-neutral-950 shadow-lg shadow-amber-500/10 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
