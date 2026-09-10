import { Link } from 'react-router-dom';
import { BarChart2, BookOpen, Sparkles, Target } from 'lucide-react';

interface QuickActionsProps {
  onOpenVocabulary?: () => void;
  onOpenPractice?: () => void;
}

export function QuickActions({
  onOpenVocabulary,
  onOpenPractice,
}: QuickActionsProps) {
  const actions = [
    {
      id: 'quick-action-review',
      label: 'Review',
      icon: Sparkles,
      iconColor: 'text-amber-400',
      to: '/review',
    },
    {
      id: 'quick-action-progress',
      label: 'Progress',
      icon: BarChart2,
      iconColor: 'text-amber-300',
      to: '/progress',
    },
    {
      id: 'quick-action-all-lessons',
      label: 'Lessons',
      icon: BookOpen,
      iconColor: 'text-amber-400',
      to: '/swedish',
    },
    {
      id: 'quick-action-practice',
      label: 'Practice',
      icon: Target,
      iconColor: 'text-amber-500',
      to: '/typing',
      onClick: onOpenPractice,
    },
  ];

  return (
    <div id="quick-actions-section" className="space-y-3">
      <h2 className="text-base font-bold text-white">Quick Actions</h2>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            id={action.id}
            to={action.to}
            onClick={action.onClick}
            className="group flex flex-col items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-3 text-center transition-all hover:border-neutral-700/80 active:scale-95"
          >
            <action.icon
              className={`w-6 h-6 mb-2 ${action.iconColor} group-hover:scale-110 transition-transform`}
            />
            <span className="text-xs font-medium text-neutral-300 group-hover:text-white truncate w-full">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
