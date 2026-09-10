import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Play,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { SubjectId, ReviewItem } from '../types';
import { useReview } from '../hooks/useReview';
import { ReviewSession } from '../components/review/ReviewSession';
import { SwedishFlagIcon, BritishFlagIcon, PythonLogoIcon } from '../components/common/FlagIcons';
import { formatTimeAgo } from '../services/progress';

export function ReviewPage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [activeReviewSessionItems, setActiveReviewSessionItems] = useState<ReviewItem[] | null>(null);

  const { items, stats, needsPractice, improving, mastered, getSessionItems } = useReview(selectedSubject);

  // Filter chips
  const subjectFilters: { id: SubjectId | 'all'; label: string; count: number; icon?: string }[] = [
    { id: 'all', label: 'All Subjects', count: stats.totalCount },
    { id: 'swedish', label: 'Swedish', count: stats.swedishCount, icon: '🇸🇪' },
    { id: 'english', label: 'English', count: stats.englishCount, icon: '🇬🇧' },
    { id: 'python', label: 'Python', count: stats.pythonCount, icon: '🐍' },
  ];

  // Start curated review session
  const handleStartReview = (singleItem?: ReviewItem) => {
    if (singleItem) {
      setActiveReviewSessionItems([singleItem]);
    } else {
      const sessionItems = getSessionItems(8);
      if (sessionItems.length > 0) {
        setActiveReviewSessionItems(sessionItems);
      }
    }
  };

  // If a session is active, render the ReviewSession Focus Mode!
  if (activeReviewSessionItems && activeReviewSessionItems.length > 0) {
    return (
      <ReviewSession
        items={activeReviewSessionItems}
        onExit={() => setActiveReviewSessionItems(null)}
        onComplete={() => {}}
      />
    );
  }

  const renderSubjectIcon = (subId: SubjectId) => {
    switch (subId) {
      case 'swedish':
        return <SwedishFlagIcon size={24} className="shrink-0" />;
      case 'english':
        return <BritishFlagIcon size={24} className="shrink-0" />;
      case 'python':
        return <PythonLogoIcon size={24} className="shrink-0" />;
      default:
        return <span className="text-xs">⌨️</span>;
    }
  };

  const renderItemCard = (item: ReviewItem, badgeColor: string) => {
    return (
      <div
        key={item.id}
        id={`review-item-${item.id}`}
        className="group relative flex flex-col justify-between rounded-3xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 transition-all hover:border-neutral-700/80 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-0.5">{renderSubjectIcon(item.subjectId)}</div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.displayTitle}
                </h4>
                {item.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                    {item.category}
                  </span>
                )}
              </div>

              {/* Subtitle / Example sentence */}
              {item.subjectId === 'python' ? (
                <p className="text-xs text-neutral-400 font-mono mt-1 truncate">
                  {item.codeSnippet || item.text}
                </p>
              ) : item.exampleSentence ? (
                <p className="text-xs text-neutral-400 mt-1 italic line-clamp-2">
                  "{item.exampleSentence.text}"
                  {item.exampleSentence.translation && (
                    <span className="block text-[11px] text-neutral-500 not-italic mt-0.5">
                      {item.exampleSentence.translation}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-neutral-500 mt-1">
                  Vocabulary word
                </p>
              )}

              {/* Mistakes & Last Seen metadata */}
              <div className="flex items-center gap-3 mt-2.5 text-[11px] text-neutral-400 font-mono">
                <span className="flex items-center gap-1 text-amber-400/90 font-semibold">
                  <span>{item.mistakeCount} mistake{item.mistakeCount !== 1 ? 's' : ''}</span>
                </span>
                <span className="text-neutral-600">·</span>
                <span>
                  Last seen {formatTimeAgo(item.lastMistakeDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Practice button for single item */}
          <button
            type="button"
            onClick={() => handleStartReview(item)}
            aria-label={`Practice ${item.displayTitle}`}
            title="Practice this item"
            className="flex h-8 px-3 items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-400 hover:text-neutral-950 font-semibold text-xs transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Practice</span>
          </button>
        </div>

        {/* Mini Mastery Bar */}
        <div className="mt-3.5 pt-3 border-t border-neutral-800/60 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${badgeColor} transition-all duration-500`}
              style={{ width: `${Math.max(4, item.masteryScore)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-neutral-400 shrink-0">
            {item.masteryScore}% Mastery
          </span>
        </div>
      </div>
    );
  };

  const totalActionable = needsPractice.length + improving.length;

  return (
    <div
      id="review-page-container"
      className="w-full max-w-5xl lg:max-w-6xl space-y-6 lg:space-y-8 pb-24 lg:pb-12 text-neutral-100"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            to="/"
            id="review-back-to-home-btn"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              Difficult Words & Spaced Review
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Personalized spaced review queue automatically built from your typing mistakes
            </p>
          </div>
        </div>
      </div>

      {/* 2. Primary Action Hero Banner */}
      <section
        id="review-hero-banner"
        className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#241a12] via-[#1a140e] to-[#141210] p-6 sm:p-7 space-y-4 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 font-mono">
              SPACED REPETITION ENGINE
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {items.length === 0
                ? 'All Clear! No items currently in queue.'
                : `${items.length} Difficult Item${items.length !== 1 ? 's' : ''} Tracked`}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              {items.length === 0
                ? 'Make mistakes in any lesson to automatically build your targeted review queue.'
                : `${totalActionable} item${totalActionable !== 1 ? 's' : ''} currently need practice to reach full keyboard mastery.`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              id="start-review-session-hero-btn"
              onClick={() => handleStartReview()}
              className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-neutral-950 translate-x-0.5" />
              <span>Launch Review Session (8 Items)</span>
            </button>
          )}
        </div>
      </section>

      {/* 3. Subject Filter Chips */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {subjectFilters.map((filter) => {
          const isSelected = selectedSubject === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              id={`filter-chip-${filter.id}`}
              onClick={() => setSelectedSubject(filter.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-neutral-950 shadow-sm shadow-amber-400/20'
                  : 'bg-[#141210] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              {filter.icon && <span>{filter.icon}</span>}
              <span>{filter.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </section>

      {/* 4. Empty State */}
      {items.length === 0 && (
        <section
          id="review-empty-state"
          className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-10 text-center space-y-3"
        >
          <div className="mx-auto h-12 w-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
            <CheckCircle2 className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-white">
            Nothing to review yet.
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Keep learning — difficult items and mistyped words will appear here automatically for spaced practice.
          </p>
          <div className="pt-2">
            <Link
              to="/swedish"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-xs font-semibold text-amber-300 transition-colors"
            >
              <span>Explore Swedish Course</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 5. Section: Needs Practice (Mastery 0–39%) */}
      {needsPractice.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Needs Practice
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-400/90 font-medium">
              {needsPractice.length} item{needsPractice.length !== 1 ? 's' : ''} (0–39% Mastery)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {needsPractice.map((item) => renderItemCard(item, 'bg-amber-500'))}
          </div>
        </section>
      )}

      {/* 6. Section: Improving (Mastery 40–79%) */}
      {improving.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Improving
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {improving.length} item{improving.length !== 1 ? 's' : ''} (40–79% Mastery)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {improving.map((item) => renderItemCard(item, 'bg-amber-400'))}
          </div>
        </section>
      )}

      {/* 7. Section: Mastered (Mastery 80–100%) */}
      {mastered.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Mastered
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400/80">
              {mastered.length} item{mastered.length !== 1 ? 's' : ''} (80–100% Mastery)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {mastered.map((item) => renderItemCard(item, 'bg-emerald-400'))}
          </div>
        </section>
      )}
    </div>
  );
}
