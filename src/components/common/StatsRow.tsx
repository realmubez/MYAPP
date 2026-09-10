import { Clock, BookOpen, Target, Zap, ChevronRight } from 'lucide-react';
import { UserStats } from '../../types';

interface StatsRowProps {
  stats: UserStats;
}

export function StatsRow({ stats }: StatsRowProps) {
  // Format study time minutes
  const studyMinutes = stats.todayLearningMinutes || 32;
  const lessonsCompleted = stats.lessonsCompletedToday !== undefined ? stats.lessonsCompletedToday : (stats.totalExercisesCompleted || 3);
  const accuracy = stats.averageAccuracy || 96;
  const streak = stats.streakDays || 5;

  const statItems = [
    {
      id: 'stat-study-time',
      label: 'Study Time',
      value: `${studyMinutes} min`,
      sublabel: 'Today',
      icon: Clock,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badge: null,
    },
    {
      id: 'stat-lessons-done',
      label: 'Lessons Done',
      value: lessonsCompleted.toString(),
      sublabel: 'Today',
      icon: BookOpen,
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      badge: null,
    },
    {
      id: 'stat-accuracy',
      label: 'Accuracy',
      value: `${accuracy}%`,
      sublabel: 'Today',
      icon: Target,
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      badge: { text: '↑ 4%', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    },
    {
      id: 'stat-streak',
      label: 'Current Streak',
      value: `${streak} ${streak === 1 ? 'day' : 'days'}`,
      sublabel: 'Keep going!',
      icon: Zap,
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      badge: null,
    },
  ];

  return (
    <div
      id="dashboard-stats-row"
      className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4"
    >
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            id={item.id}
            className="flex flex-col justify-between min-h-[112px] sm:min-h-[120px] rounded-2xl sm:rounded-3xl border border-neutral-800/80 bg-[#141210] p-3.5 sm:p-4 lg:p-4.5 transition-all hover:border-neutral-700/80 shadow-sm"
          >
            {/* Top row: Icon + Sublabel / Badge */}
            <div className="flex items-center justify-between gap-1.5">
              <div
                className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${item.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {item.badge ? (
                <span
                  className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded-md border ${item.badge.color}`}
                >
                  {item.badge.text}
                </span>
              ) : (
                <span className="text-[11px] text-neutral-500 font-medium tracking-tight">
                  {item.sublabel}
                </span>
              )}
            </div>

            {/* Bottom info: Label + Prominent Value */}
            <div className="mt-2 min-w-0">
              <span className="text-xs sm:text-[13px] text-neutral-400 font-medium block leading-tight whitespace-normal">
                {item.label}
              </span>

              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
