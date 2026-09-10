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
      className="w-full max-w-5xl lg:max-w-6xl space-y-6 lg:space-y-8 pb-24 lg:pb-12 text-neutral-100"
    >
      {/* Active Focus Mode Overlay */}
      {activeExercise && (
        <PythonFocusLesson
          exercise={activeExercise}
          parentUnit={activeUnit || undefined}
          onExit={() => setActiveExercise(null)}
          onComplete={() => {}}
        />
      )}

      {/* Course Header Banner */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              id="back-to-dashboard-btn"
              onClick={() => navigate('/')}
              aria-label="Back to Dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <PythonLogoIcon size={44} className="shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    Python
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                    Beginner 1
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Learn Python programming through typing, concept mastery, recall, and coding.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <button
              type="button"
              id="open-python-book-btn"
              onClick={() => setIsBookModalOpen(true)}
              aria-label="Python Course Guide"
              title="Python Course Guide"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Python Course Guide</span>
            </button>
          </div>
        </div>

        {/* Progress Pill Bar */}
        <div
          id="python-progress-card"
          className="rounded-2xl border border-neutral-800/90 bg-[#0d0c0a] py-3 px-4 flex items-center justify-between gap-4 shadow-inner"
        >
          <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
            {pythonProgress.percentComplete}% Complete
          </span>

          <div className="h-2 flex-1 rounded-full bg-neutral-800/90 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${Math.max(2, pythonProgress.percentComplete)}%` }}
            />
          </div>

          <span className="text-xs font-mono text-neutral-400 shrink-0">
            {pythonProgress.completedLessons} / {pythonProgress.totalLessons} exercises
          </span>
        </div>
      </div>

      {/* Course Chapters Section */}
      <div className="space-y-6">
        {PYTHON_UNITS.map((unit: PythonCourseUnit) => {
          const isExpanded = expandedUnits[unit.id] !== false;
          const steps = getProgressionSteps(unit);

          return (
            <div
              key={unit.id}
              id={unit.id}
              className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-5 sm:p-6 space-y-4 shadow-sm"
            >
              {/* Chapter Header */}
              <div
                onClick={() => toggleUnit(unit.id)}
                className="flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
                      Chapter {unit.unitNumber.toString().padStart(2, '0')}
                    </span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-xs text-neutral-400">
                      {unit.exercises.length} stages
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                    {unit.title}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    {unit.description}
                  </p>
                </div>

                {/* Toggle button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUnit(unit.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white shrink-0 transition-colors"
                  aria-label={isExpanded ? 'Collapse chapter' : 'Expand chapter'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Responsive Grid of 4-Stage Progression Cards */}
              {isExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-neutral-800/60">
                  {steps.map((step) => {
                    const isDone = step.exercise ? isExerciseCompleted(step.exercise.id) : false;

                    return (
                      <div
                        key={step.id}
                        id={`exercise-card-${step.id}`}
                        onClick={() => step.exercise && handleStartExercise(step.exercise, unit)}
                        className={`group flex items-center justify-between rounded-2xl border p-3.5 transition-all active:scale-[0.99] cursor-pointer ${
                          isDone
                            ? 'border-neutral-800/90 bg-[#161412] hover:border-amber-500/40'
                            : 'border-neutral-800/80 bg-[#181512] hover:border-neutral-700/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Squircle Icon badge */}
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg shadow-sm relative ${
                            isDone ? 'bg-neutral-900 border-amber-500/30 text-amber-300' : 'bg-neutral-950 border-neutral-800 group-hover:border-amber-500/30'
                          }`}>
                            {step.icon === '</>' ? (
                              <span className="font-mono text-xs font-bold text-amber-400">&lt;/&gt;</span>
                            ) : step.icon === 'list-check' ? (
                              <ListChecks className="w-4 h-4 text-amber-400" />
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
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-amber-400">
                                {step.stepNumber} · {step.label}
                              </span>
                              {isDone && (
                                <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1 py-0.2 text-[9px] font-medium text-amber-400 border border-amber-500/20 shrink-0">
                                  Done
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {step.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Right Amber Arrow */}
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform ml-1" />
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
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-2.5 text-xs font-semibold text-neutral-950 shadow-lg shadow-amber-500/10 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
