import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, CheckCircle2, RotateCcw } from 'lucide-react';
import { useReview } from '../../hooks/useReview';

interface ReviewSummaryCardProps {
  onStartSession?: () => void;
}

export function ReviewSummaryCard({ onStartSession }: ReviewSummaryCardProps) {
  const { items, stats, needsPractice } = useReview();

  const totalDifficult = items.length;
  const actionableCount = needsPractice.length;

  const getSubBreakdown = () => {
    const parts: string[] = [];
    if (stats.swedishCount > 0) parts.push(`${stats.swedishCount} Swedish`);
    if (stats.englishCount > 0) parts.push(`${stats.englishCount} English`);
    if (stats.pythonCount > 0) parts.push(`${stats.pythonCount} Python`);
    return parts.length > 0 ? parts.join(' · ') : 'All subjects clear';
  };

  return (
    <div
      id="dashboard-review-summary-card"
      className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 transition-all hover:border-amber-500/40 hover:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Mistake Review
              </h3>
              {totalDifficult > 0 && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {totalDifficult} {totalDifficult === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400 mt-0.5">
              {totalDifficult === 0
                ? 'No items to review · All clear'
                : getSubBreakdown()}
            </p>

            {totalDifficult > 0 && actionableCount > 0 && (
              <p className="text-[11px] text-amber-400/90 font-medium mt-1">
                {actionableCount} {actionableCount === 1 ? 'item needs' : 'items need'} practice
              </p>
            )}
          </div>
        </div>

        <Link
          to="/review"
          id="dashboard-review-card-action-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-neutral-950 text-xs font-semibold border border-amber-400/20 transition-all shrink-0 active:scale-95"
        >
          <span>{totalDifficult > 0 ? 'Practice' : 'View'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
