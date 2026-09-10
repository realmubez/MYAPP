import { ArrowLeft, Clock, Zap, Target, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';

export function ProgressPage() {
  const { stats, progress } = useProgress();

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const subjectRows = [
    {
      id: 'swedish',
      name: 'Swedish',
      flagOrIcon: '🇸🇪',
      data: progress.subjects.swedish,
    },
    {
      id: 'english',
      name: 'English',
      flagOrIcon: '🇬🇧',
      data: progress.subjects.english,
    },
    {
      id: 'python',
      name: 'Python',
      flagOrIcon: '🐍',
      data: progress.subjects.python,
    },
    {
      id: 'typing',
      name: 'Typing Practice',
      flagOrIcon: '⌨️',
      data: progress.subjects.typing,
    },
  ];

  return (
    <div id="progress-page" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <Link
            to="/"
            id="back-to-dashboard-progress"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Learning Progress</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Objective metrics tracking focus time, accuracy, and typing speed
          </p>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Total Learning Time</span>
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-100">{formatSeconds(stats.totalTimeSeconds)}</p>
          <span className="text-[11px] text-neutral-400 mt-1 block font-mono">{stats.completedExercisesCount} completed exercises</span>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
            <Target className="w-4 h-4 text-amber-300" />
            <span>Overall Accuracy</span>
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-100">{stats.averageAccuracy}%</p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Live calculated average</span>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Average Speed</span>
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-100">{stats.currentWpm} WPM</p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Measured across all exercises</span>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Daily Streak</span>
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-100">{stats.streakDays} {stats.streakDays === 1 ? 'day' : 'days'}</p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Consecutive active days</span>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-neutral-200">Track Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectRows.map(({ id, name, flagOrIcon, data }) => (
            <div
              key={id}
              className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{flagOrIcon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-100">{name}</h3>
                    <p className="text-[11px] text-neutral-400">
                      {data.completedLessons} / {data.totalLessons} lessons completed
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-medium text-amber-400">
                  {data.percentComplete}%
                </span>
              </div>

              {/* Progress Bar in Amber Brand Color */}
              <div className="h-1.5 w-full rounded-full bg-neutral-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{
                    width: `${Math.max(2, data.percentComplete)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-1">
                <span>Speed: {data.averageWpm || 0} WPM</span>
                <span>Accuracy: {data.accuracy || 0}%</span>
                <span>Time: {formatSeconds(data.timeSpentSeconds)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
