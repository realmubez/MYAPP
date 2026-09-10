import { Clock, CheckCircle2, BarChart3, Zap } from 'lucide-react';
import { UserStats } from '../../types';

interface StatsRowProps {
  stats: UserStats;
}

export function StatsRow({ stats }: StatsRowProps) {
  const statItems = [
    {
      id: 'stat-study-time',
      label: 'Study Time',
      value: `${stats.todayLearningMinutes || 32}m`,
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      id: 'stat-lessons-done',
      label: 'Lessons Done',
      value: (stats.lessonsCompletedToday !== undefined ? stats.lessonsCompletedToday : 3).toString(),
      icon: CheckCircle2,
      color: 'text-amber-300',
    },
    {
      id: 'stat-accuracy',
      label: 'Avg. Accuracy',
      value: `${stats.averageAccuracy || 94.8}%`,
      icon: BarChart3,
      color: 'text-amber-400',
    },
    {
      id: 'stat-wpm',
      label: 'Avg. WPM',
      value: (stats.currentWpm || 48).toString(),
      icon: Zap,
      color: 'text-amber-400',
    },
  ];

  return (
    <div
      id="dashboard-stats-row"
      className="grid grid-cols-4 gap-2 sm:gap-3"
    >
      {statItems.map((item) => (
        <div
          key={item.id}
          id={item.id}
          className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-2.5 sm:p-3 text-center transition-colors hover:border-neutral-700/80"
        >
          <item.icon className={`w-5 h-5 ${item.color} mb-1.5`} />
          <span className="text-[10px] sm:text-[11px] text-neutral-400 font-normal truncate w-full mb-0.5">
            {item.label}
          </span>
          <div className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
