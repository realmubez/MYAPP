import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Target,
  ArrowUp,
  Zap,
  Play,
  BarChart2,
  Languages,
  Clock3,
  ChevronRight,
} from 'lucide-react';
import { useProgress } from '../hooks/useProgress';

export function Dashboard() {
  const { stats } = useProgress();

  const streakCount = stats?.streakDays || 5;
  const studyMinutes = stats?.todayLearningMinutes || 32;
  const accuracyPct = stats?.averageAccuracy || 96;
  const lessonsDone = stats?.lessonsCompletedToday || 0;

  return (
    <div id="dashboard-home" className="w-full max-w-5xl lg:max-w-6xl space-y-5 md:space-y-6 pb-24 lg:pb-12 text-[#f3ece4]">
      {/* =========================================================
         1. HERO BANNER
         ========================================================= */}
      <section
        className="hero-banner rounded-3xl border border-[#2b1d12] p-5 md:p-7 lg:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-2xl relative overflow-hidden"
        style={{
          background: 'radial-gradient(circle at top right, #382210 0%, #150f09 70%)',
        }}
      >
        <div className="flex flex-col gap-2 max-w-xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Welcome <span className="text-[#f59e0b]">back!</span>
          </h1>
          <p className="text-xs md:text-sm text-[#8e7d70] leading-relaxed">
            Small steps every day make a big difference. Build strong muscle memory with trilingual reading and typing drills.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/read"
            className="flex-1 md:flex-initial bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0c0805] text-xs md:text-sm font-bold rounded-xl py-3 px-5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Continue Learning</span>
          </Link>
          <Link
            to="/progress"
            className="flex-1 md:flex-initial bg-[#1a120a] border border-[#2b1d12] hover:bg-[#22170e] text-[#f3ece4] text-xs md:text-sm font-semibold rounded-xl py-3 px-5 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <BarChart2 className="w-4 h-4 text-[#f59e0b]" />
            <span>Progress</span>
          </Link>
        </div>
      </section>

      {/* =========================================================
         2. TODAY'S OVERVIEW & 4-COLUMN STATS GRID
         ========================================================= */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#f59e0b]" />
          <span>Today's Overview</span>
        </h2>
        <Link
          to="/progress"
          className="text-xs text-[#8e7d70] hover:text-[#f3ece4] flex items-center gap-1 transition-colors font-medium"
        >
          <span>See details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4-Column Stats Grid (2x2 on mobile, 4-col on tablet/desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Study Time */}
        <div className="rounded-2xl border border-[#2b1d12] bg-[#140e09] hover:border-[#f59e0b]/40 p-4 md:p-5 flex flex-col gap-2 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#22c55e] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[#8e7d70] font-semibold uppercase tracking-wider">Today</span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
            {studyMinutes} <small className="text-xs text-[#8e7d70] font-medium">min</small>
          </div>
          <div className="text-xs text-[#8e7d70] font-medium">Study Time</div>
        </div>

        {/* Lessons Done */}
        <div className="rounded-2xl border border-[#2b1d12] bg-[#140e09] hover:border-[#f59e0b]/40 p-4 md:p-5 flex flex-col gap-2 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[#8e7d70] font-semibold uppercase tracking-wider">Today</span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
            {lessonsDone}
          </div>
          <div className="text-xs text-[#8e7d70] font-medium">Lessons Done</div>
        </div>

        {/* Accuracy */}
        <div className="rounded-2xl border border-[#2b1d12] bg-[#140e09] hover:border-[#f59e0b]/40 p-4 md:p-5 flex flex-col gap-2 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.2)] text-[#f43f5e] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[#22c55e] font-bold flex items-center">
              <ArrowUp className="w-3 h-3 mr-0.5" />4%
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
            {accuracyPct}%
          </div>
          <div className="text-xs text-[#8e7d70] font-medium">Accuracy</div>
        </div>

        {/* Current Streak */}
        <div className="rounded-2xl border border-[#2b1d12] bg-[#140e09] hover:border-[#f59e0b]/40 p-4 md:p-5 flex flex-col gap-2 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.2)] text-[#fbbf24] flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[10px] text-[#8e7d70] font-semibold uppercase tracking-wider">Keep going!</span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
            {streakCount} <small className="text-xs text-[#8e7d70] font-medium">days</small>
          </div>
          <div className="text-xs text-[#8e7d70] font-medium">Current Streak</div>
        </div>
      </div>

      {/* =========================================================
         3. LOWER 2-COLUMN SPLIT ROW (Tablet & Desktop)
         ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Resume Lesson Card */}
        <div className="rounded-2xl border border-[#2b1d12] bg-[#140e09] hover:border-[#f59e0b]/30 p-4 md:p-5 flex items-center justify-between gap-4 shadow-sm transition-all">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#1a120a] border border-[#2b1d12] flex items-center justify-center text-[#f59e0b] shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm md:text-base font-bold text-white truncate">Trilingual Vocabulary Unit 4</h3>
              <p className="text-xs text-[#8e7d70] mt-0.5 truncate">Somali • English • German (12 words left)</p>
            </div>
          </div>
          <Link
            to="/read"
            className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0c0805] text-xs font-bold rounded-xl py-2.5 px-4 shrink-0 transition-all shadow-md text-center cursor-pointer active:scale-95"
          >
            Resume
          </Link>
        </div>

        {/* Recent Drills Card */}
        <div className="rounded-2xl border border-[#2b1d12] bg-[#140e09] p-4 md:p-5 flex flex-col justify-center gap-2.5 shadow-sm">
          <h4 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-[#f59e0b]" />
            <span>Recent Drills</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#1a120a] border border-[#2b1d12] rounded-xl px-3 py-1.5 text-xs text-[#8e7d70] font-medium">
              🇸🇴 Somali Verbs
            </span>
            <span className="bg-[#1a120a] border border-[#2b1d12] rounded-xl px-3 py-1.5 text-xs text-[#8e7d70] font-medium">
              🇬🇧 Daily Phrases
            </span>
            <span className="bg-[#1a120a] border border-[#2b1d12] rounded-xl px-3 py-1.5 text-xs text-[#8e7d70] font-medium">
              🇩🇪 German Articles
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
