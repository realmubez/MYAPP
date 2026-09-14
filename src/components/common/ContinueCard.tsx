import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { SwedishFlagIcon, BritishFlagIcon, PythonLogoIcon } from './FlagIcons';
import { useProgress } from '../../hooks/useProgress';
import { CURATED_LESSONS } from '../../data/curriculumConfig';

interface ContinueCardProps {
  onPlay?: () => void;
}

export function ContinueCard({ onPlay }: ContinueCardProps) {
  const { progress } = useProgress();
  const lastPos = progress?.lastPosition;

  const subjectId = lastPos?.subjectId || 'swedish';
  const subjectProgress = progress?.subjects?.[subjectId] || progress?.subjects?.swedish;
  const curated = CURATED_LESSONS[subjectId] || CURATED_LESSONS.swedish;

  const renderIcon = () => {
    switch (subjectId) {
      case 'english':
        return <BritishFlagIcon size={46} className="shrink-0" />;
      case 'python':
        return <PythonLogoIcon size={46} className="shrink-0" />;
      case 'typing':
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-2xl">
            ⌨️
          </div>
        );
      case 'swedish':
      default:
        return <SwedishFlagIcon size={46} className="shrink-0" />;
    }
  };

  const getTargetRoute = () => {
    return `/${subjectId}`;
  };

  const subjectLabel = subjectId.toUpperCase();
  
  const isLegacyUnit =
    !lastPos?.unitId ||
    (typeof lastPos.unitId === 'string' && lastPos.unitId.startsWith('unit-')) ||
    (typeof lastPos.unitTitle === 'string' && (lastPos.unitTitle.includes('Hälsningar') || lastPos.unitTitle.includes('Greetings')));

  const unitTitle = isLegacyUnit
    ? `${curated.courseLevel} · ${curated.lessonTitle}`
    : (lastPos?.unitTitle || `${curated.courseLevel} · ${curated.lessonTitle}`);

  const exerciseTitle = isLegacyUnit
    ? `${curated.lessonTitle} · ${curated.badge}`
    : (lastPos?.exerciseTitle || `${curated.lessonTitle} · ${curated.badge}`);

  const percentComplete = typeof subjectProgress?.percentComplete === 'number' ? subjectProgress.percentComplete : 0;

  return (
    <div
      id="continue-learning-card"
      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800/80 bg-[#141210] p-3.5 sm:p-4.5 md:p-5 transition-all hover:border-neutral-700/80 shadow-sm flex flex-col justify-between h-full min-h-[125px] sm:min-h-[140px]"
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
            <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5 group-hover:text-amber-300 transition-colors">
              {unitTitle}
            </h3>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {exerciseTitle}
            </p>
          </div>
        </Link>

        {/* Amber Round Play Button matching reference */}
        <Link
          to={getTargetRoute()}
          onClick={onPlay}
          id="continue-play-button"
          aria-label={`Continue ${subjectLabel} lesson`}
          className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20 hover:bg-amber-300 active:scale-95 transition-all cursor-pointer"
        >
          <Play size={18} className="fill-neutral-950 translate-x-0.5" />
        </Link>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="mt-3 sm:mt-4 flex items-center gap-3">
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
