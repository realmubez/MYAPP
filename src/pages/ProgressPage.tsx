import { ArrowLeft, Clock, Zap, Target, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';

export function ProgressPage() {
  const { stats, progress } = useProgress();

  const formatSeconds = (sec?: number) => {
    const s = typeof sec === 'number' && !isNaN(sec) ? Math.max(0, sec) : 0;
    const hours = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const totalTime = progress?.overall?.totalTimeSeconds ?? (stats.todayLearningMinutes * 60);
  const totalExercises = progress?.overall?.totalExercisesCompleted ?? stats.totalExercisesCompleted;

  const subjectRows = [
    {
      id: 'swedish',
      name: 'Swedish (Svenska)',
      flagOrIcon: '🇸🇪',
      data: progress?.subjects?.swedish,
    },
    {
      id: 'english',
      name: 'English',
      flagOrIcon: '🇬🇧',
      data: progress?.subjects?.english,
    },
    {
      id: 'python',
      name: 'Python',
      flagOrIcon: '🐍',
      data: progress?.subjects?.python,
    },
    {
      id: 'typing',
      name: 'Typing Practice',
      flagOrIcon: '⌨️',
      data: progress?.subjects?.typing,
    },
  ];

  return (
    <div id="progress-page" className="w-full max-w-5xl lg:max-w-6xl space-y-6 lg:space-y-8 pb-24 lg:pb-12 text-neutral-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <Link
            to="/"
            id="back-to-dashboard-progress"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Learning Progress</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Objective metrics tracking focus time, accuracy, and keyboard typing speed across all tracks
          </p>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Total Learning Time</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-100">{formatSeconds(totalTime)}</p>
          <span className="text-[11px] text-neutral-400 mt-1 block font-mono">{totalExercises} completed exercises</span>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
            <Target className="w-4 h-4 text-amber-300" />
            <span>Overall Accuracy</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-100">{stats.averageAccuracy || 0}%</p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Live calculated average</span>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Average Speed</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-100">{stats.currentWpm || 0} WPM</p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Measured across all exercises</span>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Daily Streak</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-100">{stats.streakDays || 0} {(stats.streakDays || 0) === 1 ? 'day' : 'days'}</p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Consecutive active days</span>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-neutral-200">Track Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {subjectRows.map(({ id, name, flagOrIcon, data }) => {
            const completed = data?.completedLessons ?? 0;
            const total = data?.totalLessons ?? 1;
            const pct = data?.percentComplete ?? 0;
            const wpm = data?.averageWpm ?? 0;
            const accuracy = data?.averageAccuracy ?? 0;
            const studyTime = data?.totalStudyTimeSeconds ?? 0;

            return (
              <div
                key={id}
                className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{flagOrIcon}</span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-neutral-100">{name}</h3>
                      <p className="text-[11px] text-neutral-400">
                        {completed} / {total} lessons completed
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {pct}%
                  </span>
                </div>

                {/* Progress Bar in Amber Brand Color */}
                <div className="h-1.5 w-full rounded-full bg-neutral-950 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{
                      width: `${Math.max(2, pct)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-1">
                  <span>Speed: {wpm} WPM</span>
                  <span>Accuracy: {accuracy}%</span>
                  <span>Time: {formatSeconds(studyTime)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
