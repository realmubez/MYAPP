import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowRight, CheckCircle2, Lock, Flame } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { SUBJECTS } from '../data/mockData';
import { progressService } from '../services/progress';
import { SubjectId } from '../types';

const SUBJECT_ORDER: SubjectId[] = [
  'swedish',
  'english',
  'german',
  'mathematics',
  'python',
  'typing',
];

const ROUTE_BY_SUBJECT: Record<SubjectId, string> = {
  swedish: '/swedish',
  english: '/english',
  german: '/german',
  mathematics: '/mathematics',
  python: '/python',
  typing: '/typing',
};

export function LearnPage() {
  const navigate = useNavigate();
  const { profile, isAdmin } = useProfile();
  const assigned = Array.isArray(profile.assignedSubjects) ? profile.assignedSubjects : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Curriculum & Subjects
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Learn Hub
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Choose a subject to continue your active study curriculum and exercises.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/review')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mistake Review</span>
          </button>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {SUBJECT_ORDER.map((subjectId) => {
          const subject = (SUBJECTS as any)[subjectId];
          if (!subject) return null;

          const isAssigned = isAdmin || assigned.length === 0 || assigned.includes(subjectId);
          const subProgress = progressService.getSubjectProgress(subjectId);
          const percent = subProgress?.percentComplete || 0;
          const targetRoute = ROUTE_BY_SUBJECT[subjectId] || `/${subjectId}`;

          return (
            <div
              key={subjectId}
              className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isAssigned
                  ? 'bg-[#14110e] border-[#292119] hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5'
                  : 'bg-[#100d0a]/60 border-neutral-900 opacity-60'
              }`}
            >
              {/* Card Top */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl filter drop-shadow-sm">
                      {subject.flagOrIcon || '📖'}
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                        {subject.name}
                      </h2>
                      {subject.nativeName && (
                        <p className="text-xs text-neutral-400 font-medium">
                          {subject.nativeName}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-neutral-800 bg-neutral-900/80 text-neutral-400 uppercase">
                    {subject.summary || 'Course'}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-5">
                  {subject.description}
                </p>

                {/* Progress bar */}
                {isAssigned && (
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800/60">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400 font-medium">Curriculum Progress</span>
                      <span className="font-mono text-amber-400 font-semibold">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Bottom CTA */}
              <div className="px-6 py-4 bg-[#0e0b08]/80 border-t border-neutral-800/60 flex items-center justify-between">
                {isAssigned ? (
                  <>
                    <span className="text-xs text-neutral-400 font-medium">
                      {percent === 100 ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : percent > 0 ? (
                        <span className="text-amber-300/90 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400" /> In Progress
                        </span>
                      ) : (
                        'Ready to start'
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(targetRoute)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>Open Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-neutral-400" /> Not Assigned
                    </span>
                    <span className="text-[11px] text-neutral-400 italic">Contact Admin</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
