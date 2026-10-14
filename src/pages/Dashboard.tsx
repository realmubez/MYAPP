import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  GraduationCap,
  FolderOpen,
  FileText,
  Kanban,
  RefreshCw,
  BarChart2,
  User,
  Settings,
  Zap,
  Search,
  Bell,
  Sun,
  ChevronDown,
  ChevronRight,
  Play,
  Clock,
  Target,
  ArrowUp,
  Award,
  Sparkles,
  Languages,
  Clock3,
  MoreHorizontal,
  Folder,
} from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { SettingsModal } from '../components/common/SettingsModal';
import { MoreDrawer } from '../components/layout/MoreDrawer';

export function Dashboard() {
  const navigate = useNavigate();
  const { stats } = useProgress();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const streakCount = stats?.streakDays || 5;
  const studyMinutes = stats?.todayLearningMinutes || 32;
  const accuracyPct = stats?.averageAccuracy || 96;
  const lessonsDone = stats?.lessonsCompletedToday || 0;

  return (
    <div className="app-layout flex w-full min-h-screen relative bg-[#090705] text-[#f3ece4] font-sans selection:bg-[#f59e0b] selection:text-neutral-950">
      
      {/* =========================================================
         1. SIDEBAR (Hidden on Mobile, Leaner on iPad & Desktop)
         ========================================================= */}
      <aside className="sidebar hidden md:flex w-[200px] lg:w-[220px] bg-[#140e09] border-r border-[#2b1d12] flex-col justify-between p-3.5 shrink-0 sticky top-0 h-screen z-50">
        <div>
          {/* Brand Cluster */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#2b1d12]">
            <img
              src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
              alt="MY LEARNING"
              className="w-[34px] h-[34px] rounded-full border-[1.5px] border-[#f59e0b] object-cover shadow-[0_0_10px_rgba(245,158,11,0.25)] shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://api.iconify.design/bi:robot.svg?color=%23f59e0b';
              }}
            />
            <div className="flex flex-col min-w-0">
              <h2 className="text-[12.5px] font-extrabold text-white truncate leading-tight">
                MY LEARNING
              </h2>
              <span className="text-[9px] text-[#8e7d70] italic">"I learn by typing."</span>
            </div>
          </div>

          {/* Sidebar Navigation Links */}
          <nav className="sidebar-menu flex flex-col gap-1 mt-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-bold bg-gradient-to-r from-[rgba(245,158,11,0.22)] to-[rgba(245,158,11,0.05)] text-[#f59e0b] border border-[rgba(245,158,11,0.4)] shadow-xs transition-all"
            >
              <Home className="w-4 h-4 text-[#f59e0b]" />
              <span>Home</span>
            </Link>
            <Link
              to="/learn"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1a120a] transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Learn</span>
            </Link>
            <Link
              to="/exam-prepare"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1a120a] transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Exam Prepare</span>
            </Link>
            <Link
              to="/library"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1a120a] transition-all"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Library</span>
            </Link>
            <Link
              to="/notes"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1a120a] transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Notes</span>
            </Link>
            <Link
              to="/projects"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1a120a] transition-all"
            >
              <Kanban className="w-4 h-4" />
              <span>Projects</span>
            </Link>
            <Link
              to="/review"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1a120a] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Review</span>
            </Link>
            <Link
              to="/progress"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1a120a] transition-all"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Progress</span>
            </Link>
            <Link
              to="/tutor"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-bold text-amber-400 hover:text-white bg-amber-500/10 border border-amber-500/30 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Tutor Live</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer flex flex-col gap-1 pt-3 border-t border-[#2b1d12]">
          <Link
            to="/profile"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1a120a] transition-all"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1a120a] transition-all text-left cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* =========================================================
         2. MAIN CONTENT WRAPPER
         ========================================================= */}
      <div className="main-wrapper flex-1 flex flex-col min-w-0 min-h-screen pb-[85px] md:pb-6">

        {/* DESKTOP TOP HEADER (Tablet & Desktop Only) */}
        <header className="desktop-top-header hidden md:flex items-center justify-between gap-4 px-5 lg:px-7 py-3 border-b border-[#2b1d12] bg-[#090705] sticky top-0 z-40 backdrop-blur-md">
          {/* Global Search Bar */}
          <div className="global-search-bar flex-1 max-w-[440px] relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#8e7d70] absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lesson or Ctrl K..."
              className="w-full bg-[#140e09] border border-[#2b1d12] focus:border-[#f59e0b] rounded-xl text-xs text-[#f3ece4] placeholder-[#8e7d70] py-2 pl-9 pr-14 outline-none transition-all shadow-inner"
            />
            <span className="kbd-tag absolute right-2.5 text-[9.5px] bg-[#1a120a] border border-[#2b1d12] rounded px-1.5 py-0.5 text-[#8e7d70] font-mono">
              Ctrl K
            </span>
          </div>

          {/* Header User Cluster */}
          <div className="header-user-cluster flex items-center gap-2.5">
            <Link
              to="/progress"
              className="bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] text-[11px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-[#f59e0b]" />
              <span>{streakCount}d Streak</span>
            </Link>

            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-[#1a120a] border border-[#2b1d12] text-[#8e7d70] hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              title="Theme"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-[#1a120a] border border-[#2b1d12] text-[#8e7d70] hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <div className="user-pill-badge flex items-center gap-2 bg-[#140e09] border border-[#2b1d12] rounded-xl py-1 px-2.5 shadow-xs">
              <img
                src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
                alt="User"
                className="w-[22px] h-[22px] rounded-full object-cover border border-[#f59e0b]/50"
              />
              <div className="badge-label flex flex-col leading-tight">
                <span className="text-[11px] font-bold text-white">Mubez</span>
                <small className="text-[8.5px] font-black text-[#f59e0b] tracking-wide">ADMIN</small>
              </div>
              <ChevronDown className="w-3 h-3 text-[#8e7d70] ml-1" />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT CONTAINER (No hardcoded max-w-md constraint on tablet/desktop) */}
        <main className="content-area w-full max-w-[420px] md:max-w-[1140px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 flex flex-col gap-3 md:gap-4">

          {/* =========================================================
             3. MOBILE TOP BAR (Only visible on Mobile <768px)
             ========================================================= */}
          <header className="mobile-top-bar flex md:hidden items-center justify-between py-1">
            <div className="brand-group flex items-center gap-2.5">
              <img
                src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
                alt="MY LEARNING"
                className="w-[38px] h-[38px] rounded-full border-[1.5px] border-[#f59e0b] object-cover shadow-[0_0_10px_rgba(245,158,11,0.25)] shrink-0"
              />
              <div className="brand-meta flex flex-col">
                <h1 className="text-[14px] font-bold text-white leading-tight">MY LEARNING</h1>
                <span className="text-[10px] text-[#8e7d70] italic">"I learn by typing."</span>
              </div>
            </div>

            <div className="header-actions flex items-center gap-2">
              <Link
                to="/progress"
                className="streak-badge bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>{streakCount}d</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="icon-btn w-[34px] h-[34px] rounded-[10px] bg-[#1a120a] border border-[#2b1d12] text-[#8e7d70] flex items-center justify-center cursor-pointer shadow-xs"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* =========================================================
             4. HERO BANNER
             ========================================================= */}
          <section
            className="hero-banner rounded-[16px] md:rounded-[20px] border border-[#2b1d12] p-4 md:p-6 lg:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)] relative overflow-hidden"
            style={{
              background: 'radial-gradient(circle at top right, #382210 0%, #150f09 70%)',
            }}
          >
            <div className="flex flex-col gap-1.5 max-w-xl">
              <div className="hero-title text-[19px] md:text-[24px] lg:text-[26px] font-extrabold text-white leading-tight">
                Welcome <span className="text-[#f59e0b]">back!</span>
              </div>
              <p className="hero-subtitle text-[11.5px] md:text-[13px] text-[#8e7d70] leading-[1.4]">
                Small steps every day make a big difference. Build strong muscle memory with trilingual reading and typing drills.
              </p>
            </div>

            <div className="hero-cta-row grid grid-cols-2 md:flex md:items-center gap-2 md:min-w-[280px]">
              <Link
                to="/read"
                className="btn-main flex-1 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0c0805] text-[12px] md:text-[13px] font-bold rounded-xl py-2.5 px-3.5 flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] text-center cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Continue Learning</span>
              </Link>
              <Link
                to="/progress"
                className="btn-sub flex-1 md:flex-initial bg-[#1a120a] border border-[#2b1d12] hover:bg-[#22170e] text-[#f3ece4] text-[12px] md:text-[13px] font-semibold rounded-xl py-2.5 px-3.5 flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer active:scale-95 shadow-xs"
              >
                <BarChart2 className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Progress</span>
              </Link>
            </div>
          </section>

          {/* =========================================================
             5. TODAY'S OVERVIEW & 4-COLUMN STATS GRID
             ========================================================= */}
          <div className="section-head flex items-center justify-between mt-1">
            <h2 className="text-[12.5px] md:text-[14px] font-bold text-white flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-[#f59e0b]" />
              <span>Today's Overview</span>
            </h2>
            <Link
              to="/progress"
              className="text-[10.5px] md:text-xs text-[#8e7d70] hover:text-[#f3ece4] flex items-center gap-1 transition-colors"
            >
              <span>See details</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* STATS CARDS: 2x2 on Mobile, 4-Column Grid on Tablet/Desktop (grid-cols-4) */}
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
            {/* Study Time */}
            <div className="stat-card bg-[#140e09] border border-[#2b1d12] hover:border-[#f59e0b]/40 rounded-xl p-3 md:p-4 flex flex-col gap-1.5 transition-all shadow-sm">
              <div className="card-top flex items-center justify-between">
                <div className="icon-badge icon-time w-7 h-7 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#22c55e] flex items-center justify-center text-xs">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="tag-note text-[9.5px] text-[#8e7d70] font-semibold">Today</span>
              </div>
              <div className="stat-val text-[19px] md:text-[22px] font-extrabold text-white font-mono tracking-tight">
                {studyMinutes} <small className="text-[11px] text-[#8e7d70] font-medium">min</small>
              </div>
              <div className="stat-label text-[11px] text-[#8e7d70] font-medium">Study Time</div>
            </div>

            {/* Lessons Done */}
            <div className="stat-card bg-[#140e09] border border-[#2b1d12] hover:border-[#f59e0b]/40 rounded-xl p-3 md:p-4 flex flex-col gap-1.5 transition-all shadow-sm">
              <div className="card-top flex items-center justify-between">
                <div className="icon-badge icon-lessons w-7 h-7 rounded-lg bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b] flex items-center justify-center text-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="tag-note text-[9.5px] text-[#8e7d70] font-semibold">Today</span>
              </div>
              <div className="stat-val text-[19px] md:text-[22px] font-extrabold text-white font-mono tracking-tight">
                {lessonsDone}
              </div>
              <div className="stat-label text-[11px] text-[#8e7d70] font-medium">Lessons Done</div>
            </div>

            {/* Accuracy */}
            <div className="stat-card bg-[#140e09] border border-[#2b1d12] hover:border-[#f59e0b]/40 rounded-xl p-3 md:p-4 flex flex-col gap-1.5 transition-all shadow-sm">
              <div className="card-top flex items-center justify-between">
                <div className="icon-badge icon-acc w-7 h-7 rounded-lg bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.2)] text-[#f43f5e] flex items-center justify-center text-xs">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <span className="tag-note text-[9.5px] text-[#22c55e] font-bold flex items-center">
                  <ArrowUp className="w-2.5 h-2.5 mr-0.5" />4%
                </span>
              </div>
              <div className="stat-val text-[19px] md:text-[22px] font-extrabold text-white font-mono tracking-tight">
                {accuracyPct}%
              </div>
              <div className="stat-label text-[11px] text-[#8e7d70] font-medium">Accuracy</div>
            </div>

            {/* Current Streak */}
            <div className="stat-card bg-[#140e09] border border-[#2b1d12] hover:border-[#f59e0b]/40 rounded-xl p-3 md:p-4 flex flex-col gap-1.5 transition-all shadow-sm">
              <div className="card-top flex items-center justify-between">
                <div className="icon-badge icon-streak w-7 h-7 rounded-lg bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.2)] text-[#fbbf24] flex items-center justify-center text-xs">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="tag-note text-[9.5px] text-[#8e7d70] font-semibold">Keep going!</span>
              </div>
              <div className="stat-val text-[19px] md:text-[22px] font-extrabold text-white font-mono tracking-tight">
                {streakCount} <small className="text-[11px] text-[#8e7d70] font-medium">days</small>
              </div>
              <div className="stat-label text-[11px] text-[#8e7d70] font-medium">Current Streak</div>
            </div>
          </div>

          {/* =========================================================
             6. LOWER 2-COLUMN SPLIT ROW (Tablet & Desktop)
             ========================================================= */}
          <div className="dashboard-split-row flex flex-col md:flex-row gap-3">
            {/* Resume Lesson Card */}
            <div className="quick-lesson-card bg-[#140e09] border border-[#2b1d12] hover:border-[#f59e0b]/30 rounded-xl p-3.5 md:p-4 flex items-center justify-between gap-3 flex-1 shadow-sm transition-all">
              <div className="lesson-info flex items-center gap-3">
                <div className="lesson-icon-circle w-9 h-9 rounded-xl bg-[#1a120a] border border-[#2b1d12] flex items-center justify-center text-[#f59e0b] shrink-0">
                  <Languages className="w-4.5 h-4.5" />
                </div>
                <div className="lesson-details flex flex-col">
                  <h3 className="text-[12.5px] md:text-[13.5px] font-bold text-white">Trilingual Vocabulary Unit 4</h3>
                  <p className="text-[10.5px] md:text-[11.5px] text-[#8e7d70] mt-0.5">Somali • English • German (12 words left)</p>
                </div>
              </div>
              <Link
                to="/read"
                className="btn-main bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0c0805] text-[11px] md:text-[12px] font-bold rounded-lg py-2 px-3 shrink-0 transition-all shadow-xs text-center cursor-pointer active:scale-95"
              >
                Resume
              </Link>
            </div>

            {/* Recent Drills Card (Visible on Tablet & Desktop) */}
            <div className="recent-activity-card bg-[#140e09] border border-[#2b1d12] rounded-xl p-3.5 md:p-4 hidden md:flex flex-col gap-2 flex-1 shadow-sm">
              <h4 className="text-[11.5px] font-bold text-white flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Recent Drills</span>
              </h4>
              <div className="activity-chips flex flex-wrap gap-1.5 mt-0.5">
                <span className="activity-chip bg-[#1a120a] border border-[#2b1d12] rounded-lg px-2.5 py-1 text-[10px] text-[#8e7d70] font-medium">
                  🇸🇴 Somali Verbs
                </span>
                <span className="activity-chip bg-[#1a120a] border border-[#2b1d12] rounded-lg px-2.5 py-1 text-[10px] text-[#8e7d70] font-medium">
                  🇬🇧 Daily Phrases
                </span>
                <span className="activity-chip bg-[#1a120a] border border-[#2b1d12] rounded-lg px-2.5 py-1 text-[10px] text-[#8e7d70] font-medium">
                  🇩🇪 German Articles
                </span>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* =========================================================
         7. MOBILE FIXED BOTTOM NAVIGATION (Visible on Mobile <768px Only)
         ========================================================= */}
      <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 md:hidden bg-[#0e0a07]/95 backdrop-blur-md border-t border-[#2b1d12] flex justify-around py-2.5 pb-3 z-50 shadow-lg">
        <Link to="/" className="nav-item active flex flex-col items-center gap-1 text-[#f59e0b] text-[9.5px] font-bold">
          <Home className="w-4 h-4 fill-current" />
          <span>Home</span>
        </Link>
        <Link to="/learn" className="nav-item flex flex-col items-center gap-1 text-[#8e7d70] hover:text-[#f3ece4] text-[9.5px] font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>Learn</span>
        </Link>
        <Link to="/library" className="nav-item flex flex-col items-center gap-1 text-[#8e7d70] hover:text-[#f3ece4] text-[9.5px] font-semibold">
          <Folder className="w-4 h-4" />
          <span>Library</span>
        </Link>
        <Link to="/progress" className="nav-item flex flex-col items-center gap-1 text-[#8e7d70] hover:text-[#f3ece4] text-[9.5px] font-semibold">
          <BarChart2 className="w-4 h-4" />
          <span>Progress</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className="nav-item flex flex-col items-center gap-1 text-[#8e7d70] hover:text-[#f3ece4] text-[9.5px] font-semibold bg-transparent border-none cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Modals & Drawers */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <MoreDrawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} onOpenSettings={() => setIsSettingsOpen(true)} />
    </div>
  );
}
