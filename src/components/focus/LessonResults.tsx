import { RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DifficultWord } from '../../types/lessons';

interface LessonResultsProps {
  lessonTitle: string;
  language: 'sv' | 'en';
  accuracy: number;
  wpm: number;
  mistakes: number;
  totalSeconds: number;
  difficultWords: DifficultWord[];
  onContinue: () => void;
  onRetry: () => void;
  onRetryDifficult?: () => void;
}

export function LessonResults({
  lessonTitle,
  accuracy,
  wpm,
  mistakes,
  totalSeconds,
  difficultWords,
  onContinue,
  onRetry,
  onRetryDifficult,
}: LessonResultsProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 select-none text-center">
      {/* Icon & Title */}
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
        <CheckCircle2 size={24} />
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
        Lesson Complete
      </h2>
      <p className="text-sm text-neutral-400 mt-1">{lessonTitle}</p>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="text-xs text-neutral-400 mb-1">Accuracy</div>
          <div className="text-2xl font-mono font-semibold text-white">
            {accuracy}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="text-xs text-neutral-400 mb-1">Typing Speed</div>
          <div className="text-2xl font-mono font-semibold text-amber-400">
            {wpm} <span className="text-xs font-normal text-neutral-400">WPM</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="text-xs text-neutral-400 mb-1">Mistakes</div>
          <div className="text-2xl font-mono font-semibold text-neutral-200">
            {mistakes}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="text-xs text-neutral-400 mb-1">Time</div>
          <div className="text-2xl font-mono font-semibold text-neutral-200">
            {formatTime(totalSeconds)}
          </div>
        </div>
      </div>

      {/* Difficult Words Preview if any */}
      {difficultWords.length > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-neutral-950 border border-neutral-900 text-left">
          <div className="text-xs font-medium text-neutral-400 mb-2">
            Words to review:
          </div>
          <div className="flex flex-wrap gap-2">
            {difficultWords.slice(0, 6).map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-xs font-mono text-amber-300/90"
              >
                {item.word}
                {item.mistakes > 1 && (
                  <span className="text-neutral-500 text-[10px] ml-1">
                    ({item.mistakes}x)
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          id="focus-retry-btn"
          onClick={onRetry}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 text-sm font-medium transition-colors"
        >
          <RotateCcw size={16} />
          Repeat Lesson
        </button>

        {difficultWords.length > 0 && onRetryDifficult && (
          <button
            type="button"
            id="focus-retry-difficult-btn"
            onClick={onRetryDifficult}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-sm font-medium transition-colors"
          >
            Retry Difficult Sentences
          </button>
        )}

        <button
          type="button"
          id="focus-continue-btn"
          onClick={onContinue}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-sm font-semibold transition-colors shadow-lg"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
