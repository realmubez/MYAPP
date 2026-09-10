import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { StatsRow } from '../components/common/StatsRow';
import { ContinueCard } from '../components/common/ContinueCard';
import { SubjectCard } from '../components/common/SubjectCard';
import { QuickActions } from '../components/common/QuickActions';
import { ReviewSummaryCard } from '../components/common/ReviewSummaryCard';
import { SettingsModal } from '../components/common/SettingsModal';
import { SUBJECTS } from '../data/mockData';
import { useProgress } from '../hooks/useProgress';

export function Dashboard() {
  const { progress, stats } = useProgress();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      id="dashboard-mobile-view"
      className="w-full max-w-md mx-auto space-y-6 pb-24 text-neutral-100"
    >
      {/* 1. Header: MY LEARNING, tagline, settings and menu */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
            &gt;_
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-wider text-white leading-tight">
              MY LEARNING
            </h1>
            <p className="text-[11px] text-neutral-400 font-normal">
              “I learn by typing.”
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Button */}
          <button
            type="button"
            id="dashboard-header-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
            title="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Menu Button */}
          <button
            type="button"
            id="dashboard-header-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Navigation Menu"
            title="Navigation Menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Slide-down Menu Drawer */}
      {isMenuOpen && (
        <div
          id="dashboard-mobile-menu"
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3 space-y-1 animate-in fade-in slide-in-from-top-2"
        >
          <div className="text-[10px] font-semibold text-neutral-500 px-3 py-1 uppercase tracking-wider">
            Switch Track
          </div>
          <Link
            to="/swedish"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60"
          >
            <span className="flex items-center gap-2">
              <span>🇸🇪</span>
              <span>Swedish Course</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </Link>
          <Link
            to="/english"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60"
          >
            <span className="flex items-center gap-2">
              <span>🇬🇧</span>
              <span>English Course</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </Link>
          <Link
            to="/python"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60"
          >
            <span className="flex items-center gap-2">
              <span>🐍</span>
              <span>Python Course</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </Link>
          <Link
            to="/typing"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60"
          >
            <span className="flex items-center gap-2">
              <span>⌨️</span>
              <span>Typing Practice</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </Link>
          <Link
            to="/review"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60"
          >
            <span className="flex items-center gap-2">
              <span>✨</span>
              <span>Difficult Words & Review</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </Link>
          <Link
            to="/progress"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60"
          >
            <span className="flex items-center gap-2">
              <span>📊</span>
              <span>Detailed Progress</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </Link>
        </div>
      )}

      {/* 2. Continue Learning Section */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Continue Learning</h2>
          <Link
            to="/swedish"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            View all &gt;
          </Link>
        </div>

        <ContinueCard />
      </section>

      {/* 2.5 Mistake Review Section */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Mistake Review</h2>
          <Link
            to="/review"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Manage items &gt;
          </Link>
        </div>

        <ReviewSummaryCard />
      </section>

      {/* 3. Your Subjects Section */}
      <section className="space-y-2.5">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Your Subjects</h2>
            <span className="text-xs text-neutral-400">3 active</span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Pick a subject to continue learning.
          </p>
        </div>

        <div className="space-y-2.5">
          <SubjectCard
            subject={SUBJECTS.swedish}
            progressData={progress.subjects.swedish}
          />
          <SubjectCard
            subject={SUBJECTS.english}
            progressData={progress.subjects.english}
          />
          <SubjectCard
            subject={SUBJECTS.python}
            progressData={progress.subjects.python}
          />
        </div>
      </section>

      {/* 4. Quick Actions */}
      <section>
        <QuickActions />
      </section>

      {/* 5. Today's Overview */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Today's Overview</h2>
          <Link
            to="/progress"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            See details &gt;
          </Link>
        </div>

        <StatsRow stats={stats} />
      </section>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
