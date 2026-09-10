import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, BookOpen, Layers, BarChart2 } from 'lucide-react';
import { SubjectInfo, SubjectProgress } from '../../types';
import { CURATED_LESSONS } from '../../data/curriculumConfig';
import { SwedishFlagIcon, BritishFlagIcon, PythonLogoIcon } from './FlagIcons';

interface SubjectCardProps {
  subject: SubjectInfo;
  progressData?: SubjectProgress;
}

export function SubjectCard({ subject, progressData }: SubjectCardProps) {
  const completedLessons = progressData ? progressData.completedLessons : subject.completedLessons;
  const totalLessons = progressData ? progressData.totalLessons : (subject.totalLessons || 1);
  const percentCompleted = progressData
    ? progressData.percentComplete
    : Math.round((completedLessons / totalLessons) * 100);

  const curated = CURATED_LESSONS[subject.id as keyof typeof CURATED_LESSONS];
  const unitNoun = totalLessons === 1 ? 'lesson' : 'lessons';
  const modeSequence = curated?.modeSequence || (subject.id === 'python'
    ? 'Concept → Type → Predict → Code'
    : 'Listen → Type → Speak');
  
  const structureMeta = curated
    ? {
        chapters: `${curated.lessonTitle}`,
        modes: curated.totalStepsLabel,
        level: curated.courseLevel,
      }
    : {
        chapters: '1 lesson',
        modes: 'Interactive',
        level: 'Beginner 1',
      };

  // Pick customized flag or icon
  const renderIcon = () => {
    return (
      <div className="shrink-0">
        <div className="block sm:hidden">
          {subject.id === 'swedish' && <SwedishFlagIcon size={36} className="shrink-0" />}
          {subject.id === 'english' && <BritishFlagIcon size={36} className="shrink-0" />}
          {subject.id === 'python' && <PythonLogoIcon size={36} className="shrink-0" />}
          {!['swedish', 'english', 'python'].includes(subject.id) && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-base border border-neutral-700">
              {subject.flagOrIcon}
            </div>
          )}
        </div>
        <div className="hidden sm:block">
          {subject.id === 'swedish' && <SwedishFlagIcon size={40} className="shrink-0" />}
          {subject.id === 'english' && <BritishFlagIcon size={40} className="shrink-0" />}
          {subject.id === 'python' && <PythonLogoIcon size={40} className="shrink-0" />}
          {!['swedish', 'english', 'python'].includes(subject.id) && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-800 text-lg border border-neutral-700">
              {subject.flagOrIcon}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Link
      to={`/${subject.id}`}
      id={`subject-card-${subject.id}`}
      className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-neutral-800/80 bg-[#141210] p-3.5 sm:p-4.5 md:p-5 transition-all hover:border-amber-500/40 hover:bg-[#181512] active:scale-[0.99] shadow-sm"
    >
      <div className="space-y-3 sm:space-y-3.5">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {renderIcon()}

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
        <div className="pt-0.5">
          <div className="w-full py-1.5 sm:py-2 px-3 rounded-xl bg-neutral-900/90 border border-neutral-800 group-hover:border-amber-500/30 group-hover:bg-amber-400/10 flex items-center justify-center gap-2 text-xs font-semibold text-amber-400/90 group-hover:text-amber-300 transition-all">
            <span>Continue Learning</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Footer structure meta */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 font-normal">
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
