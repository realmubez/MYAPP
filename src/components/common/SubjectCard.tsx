import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SubjectInfo, SubjectProgress } from '../../types';
import { SwedishFlagIcon, BritishFlagIcon, PythonLogoIcon } from './FlagIcons';

interface SubjectCardProps {
  subject: SubjectInfo;
  progressData?: SubjectProgress;
}

export function SubjectCard({ subject, progressData }: SubjectCardProps) {
  const completedLessons = progressData ? progressData.completedLessons : subject.completedLessons;
  const totalLessons = progressData ? progressData.totalLessons : subject.totalLessons;
  const percentCompleted = progressData
    ? progressData.percentComplete
    : Math.round((subject.completedLessons / subject.totalLessons) * 100);

  // Pick customized flag or icon
  const renderIcon = () => {
    switch (subject.id) {
      case 'swedish':
        return <SwedishFlagIcon size={40} className="shrink-0" />;
      case 'english':
        return <BritishFlagIcon size={40} className="shrink-0" />;
      case 'python':
        return <PythonLogoIcon size={40} className="shrink-0" />;
      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-800 text-lg border border-neutral-700">
            {subject.flagOrIcon}
          </div>
        );
    }
  };

  // Brand accent progress bar across all subjects
  const getProgressColor = () => 'bg-amber-400';

  return (
    <Link
      to={`/${subject.id}`}
      id={`subject-card-${subject.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-3.5 sm:p-4 transition-all hover:border-neutral-700/80 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {renderIcon()}

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 truncate">
              <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                {subject.name}
              </h3>
              {subject.nativeName && subject.nativeName !== subject.name && (
                <span className="text-xs text-neutral-400 font-normal truncate">
                  ({subject.nativeName})
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
              {subject.summary}
            </p>
          </div>
        </div>

        {/* Lesson count & Arrow */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-neutral-400">
            {completedLessons} / {totalLessons} lessons
          </span>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-neutral-800/90 overflow-hidden">
          <div
            className={`h-full rounded-full ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${Math.max(2, percentCompleted)}%` }}
          />
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400 shrink-0">
          {percentCompleted}%
        </span>
      </div>
    </Link>
  );
}
