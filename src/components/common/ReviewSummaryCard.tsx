import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useReview } from '../../hooks/useReview';

interface ReviewSummaryCardProps {
  onStartSession?: () => void;
}

export function ReviewSummaryCard({ onStartSession }: ReviewSummaryCardProps) {
  const { items = [], stats, needsPractice = [] } = useReview();

  const totalDifficult = Array.isArray(items) ? items.length : 0;
  const actionableCount = Array.isArray(needsPractice) ? needsPractice.length : 0;

  const getSubBreakdown = () => {
    const parts: string[] = [];
    if ((stats?.swedishCount ?? 0) > 0) parts.push(`${stats.swedishCount} Swedish`);
    if ((stats?.englishCount ?? 0) > 0) parts.push(`${stats.englishCount} English`);
    if ((stats?.pythonCount ?? 0) > 0) parts.push(`${stats.pythonCount} Python`);
    return parts.length > 0 ? parts.join(' · ') : 'All clear';
  };

  return (
    <div
      id="dashboard-review-summary-card"
      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800/80 bg-[#141210] p-3.5 sm:p-4.5 md:p-5 transition-all hover:border-amber-500/40 shadow-sm flex flex-col justify-between h-full min-h-[125px] sm:min-h-[140px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Sparkle badge */}
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                Mistake Review
              </h3>
              {totalDifficult > 0 && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {totalDifficult} {totalDifficult === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400 mt-0.5 sm:mt-1">
              {totalDifficult === 0
                ? 'No items to review · All clear'
                : getSubBreakdown()}
            </p>

            <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
              {totalDifficult === 0
                ? 'Great job! Keep learning!'
                : `${actionableCount} item${actionableCount === 1 ? '' : 's'} ready for practice`}
            </p>
          </div>
        </div>
      </div>

      {/* Footer link / button */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-neutral-800/60 flex items-center justify-between">
        <span className="text-[11px] text-neutral-400">
          Personalized spaced repetition
        </span>
        <Link
          to="/review"
          id="dashboard-review-card-action-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <span>{totalDifficult > 0 ? 'Practice →' : 'View →'}</span>
        </Link>
      </div>
    </div>
  );
}
