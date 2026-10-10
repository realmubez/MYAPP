import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Award,
  ArrowRight,
  Flame,
  CheckCircle2,
  ListOrdered,
  Layers,
  FileQuestion,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ExamProgressState } from '../../services/examProgressService';

interface ExamDashboardHeaderProps {
  progressState: ExamProgressState;
  activeTab: 'lessons' | 'vocabulary' | 'practice' | 'mock-exam' | 'mistakes';
  onTabChange: (tab: 'lessons' | 'vocabulary' | 'practice' | 'mock-exam' | 'mistakes') => void;
  onContinueStudying: () => void;
  onOpenSetDateModal: () => void;
  onOpenScratchpad: () => void;
  totalLessons: number;
}

export const ExamDashboardHeader: React.FC<ExamDashboardHeaderProps> = ({
  progressState,
  activeTab,
  onTabChange,
  onContinueStudying,
  onOpenSetDateModal,
  onOpenScratchpad,
  totalLessons,
}) => {
  const [countdownString, setCountdownString] = useState<string | null>(null);

  // Live countdown calculation
  useEffect(() => {
    if (!progressState.targetExamDate) {
      setCountdownString(null);
      return;
    }

    const updateCountdown = () => {
      try {
        const target = new Date(progressState.targetExamDate!).getTime();
        const now = Date.now();
        const diff = target - now;

        if (diff <= 0) {
          setCountdownString('Exam date has arrived!');
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setCountdownString(`${days}d ${hours}h ${minutes}m left`);
        } else {
          setCountdownString(`${hours}h ${minutes}m left`);
        }
      } catch {
        setCountdownString(null);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // update every minute
    return () => clearInterval(timer);
  }, [progressState.targetExamDate]);

  const completedCount = progressState.completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const practiceAccuracy =
    progressState.practiceStats.attempted > 0
      ? Math.round(
          (progressState.practiceStats.correct / progressState.practiceStats.attempted) * 100
        )
      : null;

  const mockExamBest =
    progressState.mockExamHistory.length > 0
      ? Math.max(...progressState.mockExamHistory.map((m) => m.percentage))
      : null;

  const formattedDate = progressState.targetExamDate
    ? new Date(progressState.targetExamDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Top Banner Card: Exam Name, Subject, Countdown & Continue Button */}
      <section className="w-full bg-gradient-to-b from-[#181410] to-[#120f0d] border border-amber-500/25 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                <span>Subject: English (Elementary A1–A2)</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-neutral-800/80 border border-neutral-700 px-2 py-0.5 rounded-full">
                Straightforward Units 1–2D
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Exam Prepare: Elementary English
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Complete revision course for vocabulary, essential grammar rules, reading comprehension, and practice drills with native Microsoft Edge speech pronunciation.
            </p>
          </div>

          {/* Continue Studying CTA Button & Quick Tools */}
          <div className="shrink-0 self-stretch sm:self-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={onContinueStudying}
              className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-neutral-950 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Continue Sprint</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenScratchpad}
              className="w-full sm:w-auto min-h-[44px] px-3.5 py-2 rounded-2xl font-semibold text-xs bg-[#1e1914] hover:bg-[#27201a] border border-amber-500/30 text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Open handwriting scratchpad"
            >
              <span>✍️ Scratchpad</span>
            </button>
          </div>
        </div>

        {/* Stats & Countdown Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-neutral-800/80">
          {/* 1. Exam Date & Countdown */}
          <button
            type="button"
            onClick={onOpenSetDateModal}
            className="p-3 rounded-2xl bg-[#1b1713] hover:bg-[#221c17] border border-neutral-800 hover:border-amber-500/30 text-left transition-all active:scale-98 cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Exam Date
              </span>
              <span className="text-[10px] text-amber-400 font-semibold underline">Edit</span>
            </div>

            {progressState.targetExamDate ? (
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block truncate">
                  {formattedDate}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold block truncate">
                  {countdownString || 'Scheduled'}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold text-neutral-300 block">
                  Not configured
                </span>
                <span className="text-[10px] text-amber-400/90 block">
                  + Click to set date
                </span>
              </div>
            )}
          </button>

          {/* 2. Lessons Completed */}
          <div className="p-3 rounded-2xl bg-[#1b1713] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Lessons
              </span>
              <span className="text-[11px] font-mono text-white font-bold">{progressPercent}%</span>
            </div>
            <span className="text-sm sm:text-base font-extrabold text-white block">
              {completedCount} / {totalLessons}
            </span>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3. Practice Accuracy */}
          <div className="p-3 rounded-2xl bg-[#1b1713] border border-neutral-800 space-y-1">
            <span className="flex items-center gap-1 text-neutral-400 text-[11px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Practice Accuracy
            </span>
            {practiceAccuracy !== null ? (
              <div>
                <span className="text-sm sm:text-base font-extrabold text-emerald-300 block">
                  {practiceAccuracy}%
                </span>
                <span className="text-[10px] text-neutral-400 font-mono block">
                  {progressState.practiceStats.correct}/{progressState.practiceStats.attempted} correct
                </span>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold text-neutral-400 block">
                  No drills yet
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  Start practice below
                </span>
              </div>
            )}
          </div>

          {/* 4. Mock Exam High Score */}
          <div className="p-3 rounded-2xl bg-[#1b1713] border border-neutral-800 space-y-1">
            <span className="flex items-center gap-1 text-neutral-400 text-[11px] font-medium">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Mock Exam Best
            </span>
            {mockExamBest !== null ? (
              <div>
                <span className="text-sm sm:text-base font-extrabold text-amber-300 block">
                  {mockExamBest}%
                </span>
                <span className="text-[10px] text-neutral-400 font-mono block">
                  {progressState.mockExamHistory.length} attempt{progressState.mockExamHistory.length === 1 ? '' : 's'}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold text-neutral-400 block">
                  Not taken
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  Simulate real test
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Study Section Tabs (Lessons, Vocabulary, Practice, Mock Exam, Mistakes) */}
      <nav aria-label="Study Mode Navigation" className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            {
              id: 'lessons',
              label: '1. Lessons',
              sub: '16 Study Units',
              icon: BookOpen,
            },
            {
              id: 'vocabulary',
              label: '2. Vocabulary',
              sub: 'EN / DE with Audio',
              icon: Layers,
            },
            {
              id: 'practice',
              label: '3. Practice Drills',
              sub: 'Interactive Drills',
              icon: FileQuestion,
            },
            {
              id: 'mock-exam',
              label: '4. Mock Exam',
              sub: 'Exam Simulation',
              icon: Award,
            },
            {
              id: 'mistakes',
              label: `5. Review Mistakes ${
                (progressState.mistakes || []).length > 0
                  ? `(${(progressState.mistakes || []).length})`
                  : ''
              }`,
              sub: 'Retry Missed Questions',
              icon: RotateCcw,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id as any)}
                className={`min-h-[54px] p-3 rounded-2xl text-left transition-all active:scale-98 border flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/5 ring-1 ring-amber-500/40'
                    : 'bg-[#15120f] border-neutral-800 text-neutral-400 hover:text-white hover:bg-[#1a1613]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800/80 text-neutral-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className={`text-xs font-bold block truncate ${isActive ? 'text-amber-300' : 'text-neutral-200'}`}>
                    {tab.label}
                  </span>
                  <span className="text-[10px] text-neutral-400 block truncate">
                    {tab.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
