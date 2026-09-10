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
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            id={item.id}
            className="flex items-center gap-3.5 rounded-3xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-4.5 transition-all hover:border-neutral-700/80 shadow-sm"
          >
            {/* Round Icon Container */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.iconBg}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Value & Label */}
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-neutral-400 font-medium block truncate">
                {item.label}
              </span>

              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight">
                  {item.value}
                </span>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded-md border ${item.badge.color}`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-neutral-400 block mt-0.5">
                {item.sublabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
