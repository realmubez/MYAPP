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
  CheckCircle2,
} from 'lucide-react';
import { SwedishFlagIcon } from '../common/FlagIcons';
import { SWEDISH_UNITS, CourseUnit, ExerciseItem } from '../../data/swedishUnits';
import { LanguageLesson } from '../../types/lessons';
import { FocusLesson } from '../focus/FocusLesson';
import { storageService } from '../../services/storage';
import { useProgress } from '../../hooks/useProgress';
import { typingSoundService } from '../../services/typingSoundService';
import {
  SWEDISH_VOICES,
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

export function SwedishCourseView() {
  const navigate = useNavigate();
  const { progress, isExerciseCompleted, updateLastPosition } = useProgress();
  const swedishProgress = progress.subjects.swedish;

  // Active focus lesson
  const [activeFocusLesson, setActiveFocusLesson] = useState<LanguageLesson | null>(null);

  // Collapsible units state: Unit 1 open by default
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'sv-b1-u01': true,
    'unit-1': true,
  });

  // Book reference modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Voice & rate settings
  const [voice, setVoice] = useState<string>(() => getStoredVoice('sv'));
  const [rate, setRate] = useState<TTSRate>(() => getStoredRate('sv'));
  const [autoPlay, setAutoPlay] = useState<boolean>(() => getStoredAutoplay());
  const [typingSoundEnabled, setTypingSoundEnabled] = useState<boolean>(() => {
    return storageService.getSettings().soundEnabled ?? true;
  });
  const [typingSoundVolume, setTypingSoundVolume] = useState<number>(() => {
    return storageService.getSettings().typingSoundVolume ?? 0.4;
  });

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const handleStartExercise = (exercise: ExerciseItem, unit: CourseUnit) => {
    unlockAudio();
    updateLastPosition({
      subjectId: 'swedish',
      unitId: unit.id,
      unitTitle: `Beginner 1 · ${unit.title}`,
      exerciseId: exercise.id,
      exerciseTitle: `${exercise.title} · ${exercise.mode}`,
    });
    setActiveFocusLesson(exercise.lesson);
  };


  const handleVoiceChange = (newVoice: string) => {
    setVoice(newVoice);
    setStoredVoice('sv', newVoice);
  };

  const handleRateChange = (newRate: TTSRate) => {
    setRate(newRate);
    setStoredRate('sv', newRate);
  };

  const handleAutoPlayChange = (checked: boolean) => {
    setAutoPlay(checked);
    setStoredAutoplay(checked);
  };

  const handleToggleTypingSound = (enabled: boolean) => {
    setTypingSoundEnabled(enabled);
    const settings = storageService.getSettings();
    const updated = { ...settings, soundEnabled: enabled };
    storageService.saveSettings(updated);
    typingSoundService.setEnabled(enabled);
    if (enabled) {
      typingSoundService.playCorrectKey();
    }
  };

  const handleTypingVolumeChange = (vol: number) => {
    setTypingSoundVolume(vol);
    const settings = storageService.getSettings();
    const updated = { ...settings, typingSoundVolume: vol };
    storageService.saveSettings(updated);
    typingSoundService.setVolume(vol);
  };

  return (
    <div
      id="swedish-course-page"
      className="w-full max-w-md mx-auto space-y-6 pb-24 text-neutral-100"
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

        {/* Center Title with Flag */}
        <div className="flex items-center gap-3">
          <SwedishFlagIcon size={38} className="shrink-0" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              Swedish
            </h1>
            <span className="text-xs text-neutral-400 font-medium">
              Beginner 1
            </span>
          </div>
        </div>

        {/* Book Button */}
        <button
          type="button"
          id="open-swedish-book-btn"
          onClick={() => setIsBookModalOpen(true)}
          aria-label="Course Guide & Voice Settings"
          title="Course Guide & Voice Settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Short Subtitle */}
      <p className="text-xs text-neutral-400 text-center px-4 leading-relaxed">
        Learn everyday Swedish through listening and typing.
      </p>

      {/* Overall Progress Pill Card */}
      <div
        id="swedish-progress-card"
        className="rounded-full border border-neutral-800/90 bg-neutral-900/90 py-2 px-3.5 flex items-center justify-between gap-3 shadow-inner"
      >
        <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
          {swedishProgress.percentComplete}%
        </span>

        <div className="h-2 flex-1 rounded-full bg-neutral-800/90 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${Math.max(2, swedishProgress.percentComplete)}%` }}
          />
        </div>

        <span className="text-xs font-mono text-neutral-400 shrink-0">
          {swedishProgress.completedLessons} / {swedishProgress.totalLessons} lessons
        </span>
      </div>

      {/* Course Units Section */}
      <div className="space-y-6 pt-2">
        {SWEDISH_UNITS.map((unit: CourseUnit) => {
          const isExpanded = expandedUnits[unit.id] !== false;

          return (
            <div key={unit.id} id={unit.id} className="space-y-3">
              {/* Unit Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold tracking-wide text-amber-400">
                    Unit {unit.unitNumber}
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
                  aria-label={isExpanded ? 'Collapse unit' : 'Expand unit'}
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

              {/* Horizontal Exercise Cards */}
              {isExpanded && (
                <div className="space-y-2.5">
                  {unit.exercises.map((exercise: ExerciseItem) => {
                    const isDone = isExerciseCompleted(exercise.id) || isExerciseCompleted(exercise.lesson.id);

                    return (
                      <div
                        key={exercise.id}
                        id={`exercise-card-${exercise.id}`}
                        onClick={() => handleStartExercise(exercise, unit)}
                        className={`group flex items-center justify-between rounded-2xl border p-3 transition-all active:scale-[0.99] cursor-pointer ${
                          isDone
                            ? 'border-neutral-800/90 bg-neutral-900/60 hover:border-amber-500/40'
                            : 'border-neutral-800/80 bg-neutral-900/80 hover:border-neutral-700/80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Squircle Icon badge */}
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl shadow-sm relative ${
                            isDone ? 'bg-neutral-900 border-amber-500/30 text-amber-300' : 'bg-neutral-950 border-neutral-800'
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

                          {/* Title & Mode */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                                {exercise.title}
                              </h3>
                              {isDone && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20 shrink-0">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 truncate mt-0.5">
                              {exercise.mode}
                            </p>
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
          id="swedish-book-modal"
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
                  Swedish Course Guide & Audio
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
                <li>Listening comprehension via neural TTS</li>
                <li>Character-by-character keyboard muscle memory</li>
                <li>Greetings, introductions, daily life & food</li>
              </ul>
            </div>

            {/* Speaker Voice Selector */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Swedish Voice</span>
              </label>
              <div className="space-y-1.5">
                {SWEDISH_VOICES.map((v) => (
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
                htmlFor="modal-autoplay-toggle"
                className="text-xs text-neutral-300 cursor-pointer"
              >
                Auto-play sentence audio
              </label>
              <input
                id="modal-autoplay-toggle"
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
