import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Menu, X, ChevronRight, BookOpen, Clock, BarChart2 } from 'lucide-react';
import { StatsRow } from '../components/common/StatsRow';
import { ContinueCard } from '../components/common/ContinueCard';
import { SubjectCard } from '../components/common/SubjectCard';
import { QuickActions } from '../components/common/QuickActions';
import { ReviewSummaryCard } from '../components/common/ReviewSummaryCard';
import { SettingsModal } from '../components/common/SettingsModal';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { KeepGoing } from '../components/dashboard/KeepGoing';
import { SUBJECTS } from '../data/mockData';
import { useProgress } from '../hooks/useProgress';

export function Dashboard() {
  const { progress, stats } = useProgress();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div id="dashboard-view" className="w-full space-y-5 sm:space-y-6 lg:space-y-8 text-neutral-100">
      {/* 1. Mobile-Only Header (< 1024px) */}
      <header className="flex lg:hidden items-center justify-between pt-0.5 pb-0.5">
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all cursor-pointer"
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all cursor-pointer"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Menu Drawer (< 1024px) */}
      {isMenuOpen && (
        <div
          id="dashboard-mobile-menu"
          className="lg:hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-3 space-y-1 animate-in fade-in slide-in-from-top-2 shadow-xl"
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
            to="/typing/day-1"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/10"
          >
            <span className="flex items-center gap-2">
              <span>⌨️</span>
              <span>Touch Typing · Day 1</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
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

      {/* 2. Hero Banner (Responsive for both Mobile & Desktop) */}
      <DashboardHero />

      {/* 3. Today's Overview / Stats Row */}
      <section className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">Today's Overview</h2>
          </div>
          <Link
            to="/progress"
            className="text-xs font-medium text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <span>See details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <StatsRow stats={stats} />
      </section>

      {/* 4. Continue Learning & Mistake Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-stretch">
        {/* Continue Learning (58% / col-span-7 on Desktop) */}
        <section className="lg:col-span-7 flex flex-col space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white">Continue Learning</h2>
            <Link
              to="/swedish"
              className="text-xs font-medium text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1">
            <ContinueCard />
          </div>
        </section>

        {/* Mistake Review (42% / col-span-5 on Desktop) */}
        <section className="lg:col-span-5 flex flex-col space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white">Mistake Review</h2>
            <Link
              to="/review"
              className="text-xs font-medium text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>Manage items</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1">
            <ReviewSummaryCard />
          </div>
        </section>
      </div>

      {/* 5. Your Subjects Section (3 Columns on Desktop) */}
      <section className="space-y-2.5 sm:space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-white">Your Subjects</h2>
              <span className="text-xs text-neutral-400 font-mono ml-1">· 3 active</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Pick a subject to continue learning.
            </p>
          </div>

          <Link
            to="/swedish"
            className="text-xs font-medium text-neutral-400 hover:text-amber-400 transition-colors hidden sm:flex items-center gap-1"
          >
            <span>View all courses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Grid: 1 col on mobile, 3 cols on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
          <SubjectCard
            subject={SUBJECTS.swedish}
            progressData={progress?.subjects?.swedish}
          />
          <SubjectCard
            subject={SUBJECTS.english}
            progressData={progress?.subjects?.english}
          />
          <SubjectCard
            subject={SUBJECTS.python}
            progressData={progress?.subjects?.python}
          />
        </div>
      </section>

      {/* 6. Lower Dashboard: Recent Activity & Keep Going Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 pt-0.5 sm:pt-2">
        {/* Recent Activity (col-span-7) */}
        <div className="lg:col-span-7">
          <RecentActivity />
        </div>

        {/* Keep Going (col-span-5) */}
        <div className="lg:col-span-5">
          <KeepGoing />
        </div>
      </div>

      {/* 7. Quick Actions Row */}
      <section className="pt-0.5 sm:pt-2">
        <QuickActions />
      </section>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
