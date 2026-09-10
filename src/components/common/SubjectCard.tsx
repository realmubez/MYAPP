import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, BookOpen, Layers, BarChart2 } from 'lucide-react';
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

  const isPython = subject.id === 'python';
  const unitNoun = isPython ? 'exercises' : 'lessons';
  const modeSequence = isPython
    ? 'Concept → Type → Code → Recall'
    : 'Listen → Type → Speak';
  const structureMeta = isPython
    ? { chapters: '20 chapters', modes: '4 stages', level: 'Beginner 1' }
    : { chapters: '20 chapters', modes: '3 modes', level: 'Beginner 1' };

  // Pick customized flag or icon
  const renderIcon = (size = 40) => {
    switch (subject.id) {
      case 'swedish':
        return <SwedishFlagIcon size={size} className="shrink-0" />;
      case 'english':
        return <BritishFlagIcon size={size} className="shrink-0" />;
      case 'python':
        return <PythonLogoIcon size={size} className="shrink-0" />;
      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-800 text-lg border border-neutral-700">
            {subject.flagOrIcon}
          </div>
        );
    }
  };

  return (
    <Link
      to={`/${subject.id}`}
      id={`subject-card-${subject.id}`}
      className="group relative flex flex-col justify-between rounded-3xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 transition-all hover:border-amber-500/40 hover:bg-[#181512] active:scale-[0.99] shadow-sm"
    >
      <div className="space-y-3.5">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {renderIcon(40)}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 truncate">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                  {subject.name}
                </h3>
                {subject.nativeName && subject.nativeName !== subject.name && (
                  <span className="text-xs text-neutral-400 font-normal truncate">
                    ({subject.nativeName})
                  </span>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                {modeSequence}
              </p>
            </div>
          </div>

          {/* Lesson count & Percentage header */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
              <span>{completedLessons} / {totalLessons} {unitNoun}</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
            </span>
            <span className="text-xs font-mono font-bold text-neutral-300 mt-0.5">
              {percentCompleted}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-neutral-800/90 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${Math.max(2, percentCompleted)}%` }}
          />
        </div>

        {/* Continue Learning Action Button matching reference */}
        <div className="pt-1">
          <div className="w-full py-2 px-3 rounded-xl bg-neutral-900/90 border border-neutral-800 group-hover:border-amber-500/30 group-hover:bg-amber-400/10 flex items-center justify-center gap-2 text-xs font-semibold text-amber-400/90 group-hover:text-amber-300 transition-all">
            <span>Continue Learning</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Footer structure meta */}
      <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 font-normal">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
          <span>{structureMeta.chapters}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-neutral-500" />
          <span>{structureMeta.modes}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-neutral-500" />
          <span>{structureMeta.level}</span>
        </span>
      </div>
    </Link>
  );
}
