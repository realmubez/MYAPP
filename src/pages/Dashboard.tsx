import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Settings,
  Zap,
  Play,
  BarChart2,
  ChevronRight,
  Clock,
  BookOpen,
  Target,
  ArrowUp,
  Home,
  Folder,
  MoreHorizontal,
  Keyboard,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { SettingsModal } from '../components/common/SettingsModal';
import { MoreDrawer } from '../components/layout/MoreDrawer';

export function Dashboard() {
  const navigate = useNavigate();
  const { stats } = useProgress();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <div className="w-full max-w-[420px] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen px-4 md:px-6 lg:px-8 pt-4 md:pt-6 pb-24 lg:pb-12 flex flex-col gap-4 md:gap-6 relative text-[#f3ece4] select-none font-sans transition-all duration-200">
      {/* ========================================================
          1. HEADER (Mobile, Tablet & Desktop Responsive)
          ======================================================== */}
      <header className="flex items-center justify-between py-1 border-b border-transparent md:border-[#2b1d12]/50 md:pb-4">
        {/* Left: Avatar + Title + Subtitle */}
        <div className="flex items-center gap-2.5 md:gap-3.5">
          <img
            src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
            alt="MY LEARNING"
            className="w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full border-[1.5px] border-[#f59e0b] object-cover shadow-[0_0_10px_rgba(245,158,11,0.25)] shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://api.iconify.design/bi:robot.svg?color=%23f59e0b';
            }}
          />
          <div className="flex flex-col">
            <h1 className="text-[14px] md:text-[18px] font-bold text-white leading-tight tracking-wide">
              MY LEARNING
            </h1>
            <span className="text-[10px] md:text-[12px] text-[#8e7d70] italic leading-tight">
              "I learn by typing."
            </span>
          </div>
        </div>

        {/* Center: Desktop / Tablet Navigation Links (Hidden on Mobile) */}
        <nav
          aria-label="Desktop Top Navigation"
          className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-[#140e09] border border-[#2b1d12] rounded-full px-3 py-1.5"
        >
          <Link
            to="/"
            className="px-3 py-1 rounded-full text-xs font-bold bg-[#f59e0b] text-[#0c0805] shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5 fill-current" />
            <span>Home</span>
          </Link>
          <Link
            to="/read"
            className="px-3 py-1 rounded-full text-xs font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1f150d] flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reader & Trainer</span>
          </Link>
          <Link
            to="/learn"
            className="px-3 py-1 rounded-full text-xs font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1f150d] flex items-center gap-1.5 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Learn Hub</span>
          </Link>
          <Link
            to="/library"
            className="px-3 py-1 rounded-full text-xs font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1f150d] flex items-center gap-1.5 transition-colors"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Library</span>
          </Link>
          <Link
            to="/progress"
            className="px-3 py-1 rounded-full text-xs font-semibold text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#1f150d] flex items-center gap-1.5 transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Progress</span>
          </Link>
          <Link
            to="/tutor"
            className="px-3 py-1 rounded-full text-xs font-bold text-amber-400 hover:text-white bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Tutor</span>
          </Link>
        </nav>

        {/* Right: Streak Badge + Settings Button */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Streak Badge */}
          <Link
            to="/progress"
            className="bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] text-[11px] md:text-xs font-bold px-2.5 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs"
            title="Current Streak"
          >
            <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current text-[#f59e0b]" />
            <span>{stats?.streakDays || 5}d</span>
          </Link>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="bg-[#1a120a] border border-[#2b1d12] text-[#8e7d70] hover:text-[#f3ece4] w-[34px] h-[34px] md:w-[38px] md:h-[38px] rounded-[10px] md:rounded-[12px] flex items-center justify-center cursor-pointer transition-colors active:scale-95 shadow-xs"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 md:w-4.5 md:h-4.5" />
          </button>
        </div>
      </header>

      {/* ========================================================
          2. HERO BANNER (Responsive Mobile / Tablet / Desktop)
          ======================================================== */}
      <section
        className="rounded-[18px] md:rounded-[22px] border border-[#2b1d12] p-[18px] md:p-6 lg:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 shadow-[0_8px_24px_rgba(0,0,0,0.4)] relative overflow-hidden"
        style={{
          background: 'radial-gradient(circle at top right, #382210 0%, #150f09 70%)',
        }}
      >
        <div className="flex flex-col gap-1 max-w-xl">
          <div className="text-[20px] md:text-[26px] lg:text-[28px] font-extrabold text-white leading-tight">
            Welcome <span className="text-[#f59e0b]">back!</span>
          </div>
          <p className="text-[12px] md:text-[14px] text-[#8e7d70] leading-[1.4] mt-0.5">
            Small steps every day make a big difference. Build strong muscle memory with trilingual reading and typing drills.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-[1.6fr_1fr] md:flex md:items-center gap-2 md:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/learn')}
            className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0c0805] text-[12px] md:text-[13px] font-bold rounded-[10px] md:rounded-[12px] py-2.5 px-3.5 md:px-5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Continue Learning</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/read')}
            className="hidden md:flex bg-[#23170e] hover:bg-[#312013] border border-[#f59e0b]/40 text-[#f59e0b] text-[12px] md:text-[13px] font-bold rounded-[10px] md:rounded-[12px] py-2.5 px-4 items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Reader & Typing</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="bg-[#1a120a] hover:bg-[#261b11] border border-[#2b1d12] text-[#f3ece4] text-[12px] md:text-[13px] font-semibold rounded-[10px] md:rounded-[12px] p-2.5 md:px-4 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Progress</span>
          </button>
        </div>
      </section>

      {/* ========================================================
          3. TODAY'S OVERVIEW HEADER
          ======================================================== */}
      <div className="flex items-center justify-between mt-1 md:mt-2">
        <h2 className="text-[13px] md:text-[16px] font-bold text-[#f3ece4] flex items-center gap-1.5 md:gap-2">
          <BarChart2 className="w-4 h-4 md:w-5 md:h-5 text-[#f59e0b]" />
          <span>Today's Overview</span>
        </h2>
        <Link
          to="/progress"
          className="text-[11px] md:text-[13px] text-[#8e7d70] hover:text-[#f3ece4] flex items-center gap-0.5 transition-colors"
        >
          <span>See details</span>
          <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </Link>
      </div>

      {/* ========================================================
          4. STATS GRID (2x2 on Mobile, 4-Across on Tablet & Desktop)
          ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
        {/* 1. Study Time */}
        <div className="bg-[#140e09] border border-[#2b1d12] hover:border-[#3d291a] rounded-[14px] md:rounded-[16px] p-3 md:p-4 flex flex-col gap-2 shadow-sm transition-all hover:bg-[#1a120b]">
          <div className="flex items-center justify-between">
            <div className="w-[30px] h-[30px] md:w-[36px] md:h-[36px] rounded-[8px] md:rounded-[10px] flex items-center justify-center bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]">
              <Clock className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </div>
            <span className="text-[9.5px] md:text-[11px] text-[#8e7d70] font-semibold">Today</span>
          </div>
          <div className="text-[20px] md:text-[24px] font-extrabold text-white font-mono tracking-tight leading-none">
            {stats?.todayLearningMinutes || 32}{' '}
            <small className="text-[12px] md:text-[14px] text-[#8e7d70] font-medium ml-0.5 font-sans">
              min
            </small>
          </div>
          <div className="text-[11px] md:text-[13px] text-[#8e7d70]">Study Time</div>
        </div>

        {/* 2. Lessons Done */}
        <div className="bg-[#140e09] border border-[#2b1d12] hover:border-[#3d291a] rounded-[14px] md:rounded-[16px] p-3 md:p-4 flex flex-col gap-2 shadow-sm transition-all hover:bg-[#1a120b]">
          <div className="flex items-center justify-between">
            <div className="w-[30px] h-[30px] md:w-[36px] md:h-[36px] rounded-[8px] md:rounded-[10px] flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">
              <BookOpen className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </div>
            <span className="text-[9.5px] md:text-[11px] text-[#8e7d70] font-semibold">Today</span>
          </div>
          <div className="text-[20px] md:text-[24px] font-extrabold text-white font-mono tracking-tight leading-none">
            {stats?.lessonsCompletedToday ?? 0}
          </div>
          <div className="text-[11px] md:text-[13px] text-[#8e7d70]">Lessons Done</div>
        </div>

        {/* 3. Accuracy */}
        <div className="bg-[#140e09] border border-[#2b1d12] hover:border-[#3d291a] rounded-[14px] md:rounded-[16px] p-3 md:p-4 flex flex-col gap-2 shadow-sm transition-all hover:bg-[#1a120b]">
          <div className="flex items-center justify-between">
            <div className="w-[30px] h-[30px] md:w-[36px] md:h-[36px] rounded-[8px] md:rounded-[10px] flex items-center justify-center bg-[rgba(244,63,94,0.1)] text-[#f43f5e] border border-[rgba(244,63,94,0.2)]">
              <Target className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </div>
            <span className="text-[9.5px] md:text-[11px] text-[#22c55e] font-semibold flex items-center gap-0.5">
              <ArrowUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
              4%
            </span>
          </div>
          <div className="text-[20px] md:text-[24px] font-extrabold text-white font-mono tracking-tight leading-none">
            {stats?.averageAccuracy ? `${Math.round(stats.averageAccuracy)}%` : '96%'}
          </div>
          <div className="text-[11px] md:text-[13px] text-[#8e7d70]">Accuracy</div>
        </div>

        {/* 4. Current Streak */}
        <div className="bg-[#140e09] border border-[#2b1d12] hover:border-[#3d291a] rounded-[14px] md:rounded-[16px] p-3 md:p-4 flex flex-col gap-2 shadow-sm transition-all hover:bg-[#1a120b]">
          <div className="flex items-center justify-between">
            <div className="w-[30px] h-[30px] md:w-[36px] md:h-[36px] rounded-[8px] md:rounded-[10px] flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[#fbbf24] border border-[rgba(245,158,11,0.2)]">
              <Zap className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current" />
            </div>
            <span className="text-[9.5px] md:text-[11px] text-[#8e7d70] font-semibold">Keep going!</span>
          </div>
          <div className="text-[20px] md:text-[24px] font-extrabold text-white font-mono tracking-tight leading-none">
            {stats?.streakDays || 5}{' '}
            <small className="text-[12px] md:text-[14px] text-[#8e7d70] font-medium ml-0.5 font-sans">
              days
            </small>
          </div>
          <div className="text-[11px] md:text-[13px] text-[#8e7d70]">Current Streak</div>
        </div>
      </div>

      {/* ========================================================
          5. TABLET & DESKTOP LEARNING HUBS (Hidden on Mobile to preserve 1:1 view)
          ======================================================== */}
      <section className="hidden md:flex flex-col gap-3 mt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Interactive Learning Stations</span>
          </h3>
          <span className="text-xs text-[#8e7d70]">Quick Start</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Station 1: Public Reader & Trilingual Vocab */}
          <div
            onClick={() => navigate('/read')}
            className="group bg-[#140e09] border border-[#2b1d12] hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:bg-[#1a120b] shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                Trilingual
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Reader & Trilingual Audio
              </h4>
              <p className="text-xs text-[#8e7d70] mt-1 line-clamp-2">
                Explore "The Man" & "The Woman" with Ryan (UK) native speech and instant Somali/German vocab translations.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 pt-1 group-hover:translate-x-1 transition-transform">
              <span>Open Reader</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Station 2: Monkeytype Stealth Trainer */}
          <div
            onClick={() => navigate('/practice')}
            className="group bg-[#140e09] border border-[#2b1d12] hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:bg-[#1a120b] shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Keyboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                Stealth Typing
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Typing Trainer (Monkeytype)
              </h4>
              <p className="text-xs text-[#8e7d70] mt-1 line-clamp-2">
                Master rapid touch typing with live amber vertical caret, real-time WPM, accuracy, and audio sync.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 pt-1 group-hover:translate-x-1 transition-transform">
              <span>Start Typing Drill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Station 3: Full Course Library */}
          <div
            onClick={() => navigate('/library')}
            className="group bg-[#140e09] border border-[#2b1d12] hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:bg-[#1a120b] shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Folder className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
                Curriculum
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Languages & Science Library
              </h4>
              <p className="text-xs text-[#8e7d70] mt-1 line-clamp-2">
                Access structured coursework across Swedish, German, English, Mathematics, and Python programming.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 pt-1 group-hover:translate-x-1 transition-transform">
              <span>Browse Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Station 4: AI Voice Tutor & Multimodal Studio */}
          <div
            onClick={() => navigate('/tutor')}
            className="group bg-[#140e09] border border-amber-500/40 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:bg-[#1a120b] shadow-[0_0_20px_rgba(245,158,11,0.08)]"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Multimodal
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                AI Voice Tutor & Studio
              </h4>
              <p className="text-xs text-[#8e7d70] mt-1 line-clamp-2">
                Hands-free conversational tutor with live voice waveforms, camera exercise analysis, and WhatsApp-style chat in Somali, English, and German.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 pt-1 group-hover:translate-x-1 transition-transform">
              <span>Launch Voice Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. PINNED BOTTOM NAVIGATION BAR (Mobile & Tablet < 1024px)
          Hidden on desktop (lg:) where top header navigation takes over
          ======================================================== */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] md:max-w-3xl lg:hidden bg-[#0e0a07]/95 backdrop-blur-md border-t border-[#2b1d12] flex justify-around pt-2.5 pb-3.5 z-50 transition-all duration-200">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex flex-col items-center gap-[3px] text-[#f59e0b] text-[10px] md:text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/learn')}
          className="flex flex-col items-center gap-[3px] text-[#8e7d70] hover:text-[#f3ece4] text-[10px] md:text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
          <span>Learn</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/library')}
          className="flex flex-col items-center gap-[3px] text-[#8e7d70] hover:text-[#f3ece4] text-[10px] md:text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <Folder className="w-4 h-4 md:w-5 md:h-5" />
          <span>Library</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/progress')}
          className="flex flex-col items-center gap-[3px] text-[#8e7d70] hover:text-[#f3ece4] text-[10px] md:text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <BarChart2 className="w-4 h-4 md:w-5 md:h-5" />
          <span>Progress</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-col items-center gap-[3px] text-[#8e7d70] hover:text-[#f3ece4] text-[10px] md:text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* More Drawer */}
      <MoreDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onOpenSettings={() => {
          setIsMoreOpen(false);
          setIsSettingsOpen(true);
        }}
      />
    </div>
  );
}

export default Dashboard;
