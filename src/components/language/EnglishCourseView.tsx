import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Volume2,
  Check,
} from 'lucide-react';
import { BritishFlagIcon } from '../common/FlagIcons';
import { CourseUnit, ExerciseItem } from '../../data/englishUnits';
import { LanguageLesson } from '../../types/lessons';
import { FocusLesson } from '../focus/FocusLesson';
import { useProgress } from '../../hooks/useProgress';
import { PHONE_PLANS_LESSON } from '../../data/curriculumConfig';
import {
  ENGLISH_VOICES,
  AVAILABLE_RATES,
  TTSRate,
  getStoredVoice,
  setStoredVoice,
  getStoredRate,
  setStoredRate,
  getStoredAutoplay,
  setStoredAutoplay,
  unlockAudio,
} from '../../services/tts';

const CURATED_ENGLISH_UNITS: CourseUnit[] = [
  {
    id: 'en-b1-u-phone-plans',
    unitNumber: 1,
    title: 'Phone Plans',
    description: 'Learn how to understand and talk about mobile phone plans, contracts, data limits, and customer service requests through structured typing.',
    exercises: [
      {
        id: 'en-phone-plans',
        exerciseNumber: 1,
        title: 'Phone Plans',
        mode: 'Interactive Mode',
        icon: '📱',
        lesson: PHONE_PLANS_LESSON,
      },
    ],
  },
];

export function EnglishCourseView() {
  const navigate = useNavigate();
  const { progress, isExerciseCompleted, updateLastPosition } = useProgress();
  const englishProgress = progress.subjects.english;

  // Active focus lesson
  const [activeFocusLesson, setActiveFocusLesson] = useState<LanguageLesson | null>(null);

  // Collapsible units state
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'en-b1-u-phone-plans': true,
  });

  // Book reference modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Voice & rate settings for English
  const [voice, setVoice] = useState<string>(() => getStoredVoice('en'));
  const [rate, setRate] = useState<TTSRate>(() => getStoredRate('en'));
  const [autoPlay, setAutoPlay] = useState<boolean>(() => getStoredAutoplay());

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const handleStartExercise = (exercise: ExerciseItem, unit?: CourseUnit) => {
    unlockAudio();
    updateLastPosition({
      subjectId: 'english',
      unitId: unit?.id || 'en-b1-u-phone-plans',
      unitTitle: unit ? `Beginner 1 · ${unit.title}` : 'Beginner 1 · Phone Plans',
      exerciseId: exercise.id,
      exerciseTitle: `${exercise.title} · ${exercise.mode}`,
    });
    setActiveFocusLesson(exercise.lesson || PHONE_PLANS_LESSON);
  };

  const handleVoiceChange = (newVoice: string) => {
    setVoice(newVoice);
    setStoredVoice('en', newVoice);
  };

  const handleRateChange = (newRate: TTSRate) => {
    setRate(newRate);
    setStoredRate('en', newRate);
  };

  const handleAutoPlayChange = (checked: boolean) => {
    setAutoPlay(checked);
    setStoredAutoplay(checked);
  };

  return (
    <div
      id="english-course-page"
      className="w-full max-w-5xl lg:max-w-6xl space-y-4 sm:space-y-6 lg:space-y-8 pb-24 lg:pb-12 text-neutral-100"
    >
      {/* Active Focus Mode Overlay */}
      {activeFocusLesson && (
        <FocusLesson
          lesson={activeFocusLesson}
          onExit={() => setActiveFocusLesson(null)}
          onLessonComplete={() => {
            setActiveFocusLesson(null);
          }}
        />
      )}

      {/* Course Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-6 lg:p-7 space-y-3.5 sm:space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              id="back-to-dashboard-btn"
              onClick={() => navigate('/')}
              aria-label="Back to Dashboard"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="shrink-0 block sm:hidden">
                <BritishFlagIcon size={36} className="shrink-0" />
              </div>
              <div className="shrink-0 hidden sm:block">
                <BritishFlagIcon size={44} className="shrink-0" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    English
                  </h1>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                    Beginner 1
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 sm:mt-1">
                  Learn practical English through listening and typing.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <button
              type="button"
              id="open-english-book-btn"
              onClick={() => setIsBookModalOpen(true)}
              aria-label="Course Guide"
              title="Course Guide"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Course Guide</span>
            </button>
          </div>
        </div>

        {/* Progress Pill Bar */}
        <div
          id="english-progress-card"
          className="rounded-xl sm:rounded-2xl border border-neutral-800/90 bg-[#0d0c0a] py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-center justify-between gap-3 sm:gap-4 shadow-inner"
        >
          <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
            {englishProgress.percentComplete}% Complete
          </span>

          <div className="h-1.5 sm:h-2 flex-1 rounded-full bg-neutral-800/90 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${Math.max(2, englishProgress.percentComplete)}%` }}
            />
          </div>

          <span className="text-xs font-mono text-neutral-400 shrink-0">
            {englishProgress.completedLessons} / 1 lesson
          </span>
        </div>
      </div>

      {/* Course Units Section */}
      <div className="space-y-6">
        {CURATED_ENGLISH_UNITS.map((unit: CourseUnit) => {
          const isExpanded = expandedUnits[unit.id] !== false;

          return (
            <div
              key={unit.id}
              id={unit.id}
              className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-5 sm:p-6 space-y-4 shadow-sm"
            >
              {/* Unit Header */}
              <div
                onClick={() => toggleUnit(unit.id)}
                className="flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
                      Unit {unit.unitNumber.toString().padStart(2, '0')}
                    </span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-xs text-neutral-400">
                      {unit.exercises.length} {unit.exercises.length === 1 ? 'stage' : 'stages'}
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
                  aria-label={isExpanded ? 'Collapse unit' : 'Expand unit'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Responsive Grid of Exercise Progression Cards */}
              {isExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2 border-t border-neutral-800/60">
                  {unit.exercises.map((exercise: ExerciseItem, idx) => {
                    const isDone = isExerciseCompleted(exercise.id) || isExerciseCompleted(exercise.lesson.id);

                    return (
                      <div
                        key={exercise.id}
                        id={`exercise-card-${exercise.id}`}
                        onClick={() => handleStartExercise(exercise, unit)}
                        className={`group flex items-center justify-between rounded-2xl border p-3.5 transition-all active:scale-[0.99] cursor-pointer ${
                          isDone
                            ? 'border-neutral-800/90 bg-[#161412] hover:border-amber-500/40'
                            : 'border-neutral-800/80 bg-[#181512] hover:border-neutral-700/80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Squircle Icon badge */}
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl shadow-sm relative ${
                            isDone ? 'bg-neutral-900 border-amber-500/30 text-amber-300' : 'bg-neutral-950 border-neutral-800 group-hover:border-amber-500/30'
                          }`}>
                            <span role="img" aria-label={exercise.title}>
                              {exercise.icon}
                            </span>
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
                                {(idx + 1).toString().padStart(2, '0')} · Interactive Session
                              </span>
                              {isDone && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20 shrink-0">
                                  Done
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-300 font-medium truncate mt-0.5">
                              {exercise.title}
                            </p>
                            <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
                              23 interactive steps
                            </span>
                          </div>
                        </div>

                        {/* Right Amber Arrow */}
                        <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Course Guide & Voice Settings Modal */}
      {isBookModalOpen && (
        <div
          id="english-book-modal"
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
                  English Course Guide
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
                <li>Listening comprehension via British/American neural audio</li>
                <li>Letter-by-letter typing muscle memory & cadence</li>
                <li>Everyday phone plans, data queries & conversations</li>
              </ul>
            </div>

            {/* Speaker Voice Selector */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>English Voice</span>
              </label>
              <div className="space-y-1.5">
                {ENGLISH_VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVoiceChange(v.id)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors border ${
                      voice === v.id
                        ? 'border-amber-500/50 bg-amber-500/10 text-white font-medium'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span>
                      {v.name} ({v.description})
                    </span>
                    {voice === v.id && (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Speaking Rate */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300">
                Speaking Rate
              </label>
              <div className="flex items-center gap-1.5">
                {AVAILABLE_RATES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRateChange(r)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                      rate === r
                        ? 'border-amber-400 bg-amber-400/15 text-amber-300 font-bold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Autoplay Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <label
                htmlFor="modal-english-autoplay-toggle"
                className="text-xs text-neutral-300 cursor-pointer"
              >
                Auto-play sentence audio
              </label>
              <input
                id="modal-english-autoplay-toggle"
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => handleAutoPlayChange(e.target.checked)}
                className="rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-0 cursor-pointer"
              />
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

