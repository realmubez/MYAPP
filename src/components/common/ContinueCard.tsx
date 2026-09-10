import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { SwedishFlagIcon, BritishFlagIcon, PythonLogoIcon } from './FlagIcons';
import { useProgress } from '../../hooks/useProgress';

interface ContinueCardProps {
  onPlay?: () => void;
}

export function ContinueCard({ onPlay }: ContinueCardProps) {
  const { progress } = useProgress();
  const lastPos = progress.lastPosition;

  const subjectId = lastPos?.subjectId || 'swedish';
  const subjectProgress = progress.subjects[subjectId] || progress.subjects.swedish;

  const renderIcon = () => {
    switch (subjectId) {
      case 'english':
        return <BritishFlagIcon size={44} className="shrink-0" />;
      case 'python':
        return <PythonLogoIcon size={44} className="shrink-0" />;
      case 'typing':
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-xl">
            ⌨️
          </div>
        );
      case 'swedish':
      default:
        return <SwedishFlagIcon size={44} className="shrink-0" />;
    }
  };

  const getTargetRoute = () => {
    return `/${subjectId}`;
  };

  const subjectLabel = subjectId.toUpperCase();
  const unitTitle = lastPos?.unitTitle || 'Beginner 1 · Hälsningar';
  const exerciseTitle = lastPos?.exerciseTitle || 'Exercise 2 of 3 · Sentence Mode';
  const percentComplete = subjectProgress.percentComplete;

  return (
    <div
      id="continue-learning-card"
      className="group relative overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-4 transition-all hover:border-neutral-700/80"
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          to={getTargetRoute()}
          className="flex items-center gap-3 flex-1 min-w-0"
          id="continue-card-link"
        >
          {renderIcon()}

          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              {subjectLabel}
            </span>
            <h3 className="text-sm font-bold text-white truncate mt-0.5">
              {unitTitle}
            </h3>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {exerciseTitle}
            </p>
          </div>
        </Link>

        {/* Amber Play Button */}
        <Link
          to={getTargetRoute()}
          onClick={onPlay}
          id="continue-play-button"
          aria-label={`Continue ${subjectLabel} lesson`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20 hover:bg-amber-300 active:scale-95 transition-all"
        >
          <Play size={18} className="fill-neutral-950 translate-x-0.5" />
        </Link>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="mt-3.5 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-neutral-800/90 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${Math.max(2, percentComplete)}%` }}
          />
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400 shrink-0">
          {percentComplete}%
        </span>
      </div>
    </div>
  );
}
