import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Volume2,
  Check,
  BookOpen,
} from 'lucide-react';
import { GermanFlagIcon } from '../common/FlagIcons';
import { GERMAN_BEGINNER_1_UNITS } from '../../data/courses/german';
import { GERMAN_BEGRUSSUNGEN_LESSON } from '../../data/courses/german/begrussungenLesson';
import { LanguageLesson } from '../../types/lessons';
import { FocusLesson } from '../focus/FocusLesson';
import { storageService } from '../../services/storage';
import { useProgress } from '../../hooks/useProgress';
import {
  GERMAN_VOICES,
  AVAILABLE_RATES,
  TTSRate,
  getStoredVoice,
  setStoredVoice,
  getStoredRate,
  setStoredRate,
  getStoredAutoplay,
  setStoredAutoplay,
} from '../../services/tts';

export function GermanCourseView() {
  const navigate = useNavigate();
  const { progress, isExerciseCompleted, updateLastPosition } = useProgress();
  const germanProgress = progress.subjects.german;

  // Active focus lesson
  const [activeFocusLesson, setActiveFocusLesson] = useState<LanguageLesson | null>(null);

  // Collapsible units state
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'de-b1-u01': true,
  });

  // Voice & rate settings
  const [voice, setVoice] = useState<string>(() => getStoredVoice('de'));
  const [rate, setRate] = useState<TTSRate>(() => getStoredRate('de'));
  const [autoPlay, setAutoPlay] = useState<boolean>(() => getStoredAutoplay());
  const [typingSoundEnabled, setTypingSoundEnabled] = useState<boolean>(() => {
    return storageService.getSettings().soundEnabled ?? true;
  });

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const handleStartLesson = (lesson: LanguageLesson) => {
    updateLastPosition({
      subjectId: 'german',
      unitId: lesson.unitId || 'de-b1-u01',
      unitTitle: lesson.unitTitle || 'Beginner 1 · Begrüßungen',
      exerciseId: lesson.id,
      exerciseTitle: `${lesson.title} · Interactive Session`,
      stage: 'listen_type',
      sentenceIndex: 0,
    });
    setActiveFocusLesson(lesson);
  };

  // If focus lesson is active, render full-screen FocusLesson
  if (activeFocusLesson) {
    return (
      <FocusLesson
        lesson={activeFocusLesson}
        onExit={() => setActiveFocusLesson(null)}
        onLessonComplete={() => setActiveFocusLesson(null)}
      />
    );
  }

  const completedCount = germanProgress?.completedLessons || 0;
  const totalCount = 1;
  const percentComplete = Math.min(100, Math.round((completedCount / totalCount) * 100));

  return (
    <div id="german-course-view" className="w-full max-w-4xl mx-auto space-y-6 pb-24 lg:pb-12 text-neutral-100">
      {/* Back button & Subject Title Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-800/80 pb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          id="back-to-dashboard-german"
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-amber-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <GermanFlagIcon size={48} className="shrink-0 shadow-md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  German
                </h1>
                <span className="text-sm font-normal text-neutral-400 font-serif italic">
                  (Deutsch)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-amber-400 border border-neutral-700">
                  Beginner 1
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                Master practical conversational German through active typing drills, listening, and structured recall.
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

      {/* Voice & Sound Settings Drawer */}
      <div className="rounded-2xl border border-neutral-800 bg-[#141210] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-300">
        <div className="flex items-center gap-2 text-neutral-400">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-neutral-200">German Audio Settings:</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={voice}
            onChange={(e) => {
              const v = e.target.value;
              setVoice(v);
              setStoredVoice('de', v);
            }}
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
          >
            {GERMAN_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.gender})
              </option>
            ))}
          </select>

          <select
            value={rate}
            onChange={(e) => {
              const r = e.target.value as TTSRate;
              setRate(r);
              setStoredRate('de', r);
            }}
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
          >
            {AVAILABLE_RATES.map((r) => (
              <option key={r} value={r}>
                Speed: {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Units & Lessons list */}
      <div className="space-y-4">
        {GERMAN_BEGINNER_1_UNITS.map((unit) => {
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
                    {unit.exercises.length} lesson
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Exercises / Lessons List */}
              {isExpanded && (
                <div className="border-t border-neutral-800/60 divide-y divide-neutral-800/40 p-2 sm:p-3">
                  {unit.exercises.map((ex) => {
                    const isCompleted = isExerciseCompleted(ex.lesson.id);

                    return (
                      <div
                        key={ex.id}
                        onClick={() => handleStartLesson(ex.lesson)}
                        className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-[#181512] transition-all cursor-pointer border border-transparent hover:border-amber-500/30"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-lg group-hover:border-amber-500/40 transition-colors shrink-0">
                            {ex.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                                {ex.title}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono shrink-0">
                                {ex.lesson.sentences.length} phrases
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 truncate mt-0.5">
                              {ex.lesson.description}
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
