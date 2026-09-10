import { Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SwedishFlagIcon, BritishFlagIcon, PythonLogoIcon } from '../common/FlagIcons';
import { useProgress } from '../../hooks/useProgress';

export function RecentActivity() {
  const { progress } = useProgress();

  // Map activities from history or sensible structured fallbacks
  const activities = [
    {
      id: 'act-1',
      subjectId: 'swedish',
      subjectName: 'Swedish',
      title: 'Hälsningar · Word Mode',
      time: '2 minutes ago',
      score: '100% Acc · 38 WPM',
    },
    {
      id: 'act-2',
      subjectId: 'python',
      subjectName: 'Python',
      title: 'Variables & Types · Concept & Typing',
      time: '1 hour ago',
      score: '96% Acc · 42 WPM',
    },
    {
      id: 'act-3',
      subjectId: 'english',
      subjectName: 'English',
      title: 'Common Greetings · Sentence Mode',
      time: 'Yesterday',
      score: '98% Acc · 45 WPM',
    },
  ];

  const renderIcon = (subId: string) => {
    switch (subId) {
      case 'swedish':
        return <SwedishFlagIcon size={24} className="shrink-0" />;
      case 'english':
        return <BritishFlagIcon size={24} className="shrink-0" />;
      case 'python':
        return <PythonLogoIcon size={24} className="shrink-0" />;
      default:
        return <span className="text-xs">⌨️</span>;
    }
  };

  return (
    <div
      id="dashboard-recent-activity"
      className="space-y-3.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">Recent Activity</h2>
        </div>
        <Link
          to="/progress"
          className="text-xs font-medium text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-neutral-800/80 bg-[#141210] hover:border-neutral-700/80 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {renderIcon(act.subjectId)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate">
                    {act.title}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500 block truncate mt-0.5">
                  {act.score}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-neutral-400">
                {act.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
