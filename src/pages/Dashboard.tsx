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
    <div className="w-full max-w-[420px] mx-auto min-h-screen px-4 pt-4 pb-24 flex flex-col gap-4 relative text-[#f3ece4] select-none font-sans">
      {/* 1. UNIFIED SINGLE HEADER */}
      <header className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2.5">
          <img
            src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
            alt="MY LEARNING"
            className="w-[38px] h-[38px] rounded-full border-[1.5px] border-[#f59e0b] object-cover shadow-[0_0_10px_rgba(245,158,11,0.25)] shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://api.iconify.design/bi:robot.svg?color=%23f59e0b';
            }}
          />
          <div className="flex flex-col">
            <h1 className="text-[14px] font-bold text-white leading-tight tracking-wide">
              MY LEARNING
            </h1>
            <span className="text-[10px] text-[#8e7d70] italic leading-tight">
              "I learn by typing."
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak Badge */}
          <Link
            to="/progress"
            className="bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Streak"
          >
            <Zap className="w-3 h-3 fill-current text-[#f59e0b]" />
            <span>{stats?.streakDays || 5}d</span>
          </Link>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="bg-[#1a120a] border border-[#2b1d12] text-[#8e7d70] hover:text-[#f3ece4] w-[34px] h-[34px] rounded-[10px] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. HERO BANNER */}
      <section
        className="rounded-[18px] border border-[#2b1d12] p-[18px] flex flex-col gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        style={{
          background: 'radial-gradient(circle at top right, #382210 0%, #150f09 70%)',
        }}
      >
        <div>
          <div className="text-[20px] font-extrabold text-white leading-tight">
            Welcome <span className="text-[#f59e0b]">back!</span>
          </div>
          <p className="text-[12px] text-[#8e7d70] leading-[1.4] mt-0.5">
            Small steps every day make a big difference.
          </p>
        </div>

        <div className="grid grid-cols-[1.6fr_1fr] gap-2 mt-1">
          <button
            type="button"
            onClick={() => navigate('/learn')}
            className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0c0805] text-[12px] font-bold rounded-[10px] py-2.5 px-3.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Continue Learning</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="bg-[#1a120a] hover:bg-[#261b11] border border-[#2b1d12] text-[#f3ece4] text-[12px] font-semibold rounded-[10px] p-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Progress</span>
          </button>
        </div>
      </section>

      {/* 3. TODAY'S OVERVIEW HEADER */}
      <div className="flex items-center justify-between mt-1">
        <h2 className="text-[13px] font-bold text-[#f3ece4] flex items-center gap-1.5">
          <BarChart2 className="w-4 h-4 text-[#f59e0b]" />
          <span>Today's Overview</span>
        </h2>
        <Link
          to="/progress"
          className="text-[11px] text-[#8e7d70] hover:text-[#f3ece4] flex items-center gap-0.5 transition-colors"
        >
          <span>See details</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 4. 2x2 STATS GRID */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Study Time */}
        <div className="bg-[#140e09] border border-[#2b1d12] rounded-[14px] p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[9.5px] text-[#8e7d70] font-semibold">Today</span>
          </div>
          <div className="text-[20px] font-extrabold text-white font-mono tracking-tight leading-none">
            {stats?.todayLearningMinutes || 32}{' '}
            <small className="text-[12px] text-[#8e7d70] font-medium ml-0.5 font-sans">
              min
            </small>
          </div>
          <div className="text-[11px] text-[#8e7d70]">Study Time</div>
        </div>

        {/* Lessons Done */}
        <div className="bg-[#140e09] border border-[#2b1d12] rounded-[14px] p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[9.5px] text-[#8e7d70] font-semibold">Today</span>
          </div>
          <div className="text-[20px] font-extrabold text-white font-mono tracking-tight leading-none">
            {stats?.lessonsCompletedToday ?? 0}
          </div>
          <div className="text-[11px] text-[#8e7d70]">Lessons Done</div>
        </div>

        {/* Accuracy */}
        <div className="bg-[#140e09] border border-[#2b1d12] rounded-[14px] p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-[rgba(244,63,94,0.1)] text-[#f43f5e] border border-[rgba(244,63,94,0.2)]">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[9.5px] text-[#22c55e] font-semibold flex items-center">
              <ArrowUp className="w-2.5 h-2.5" />
              4%
            </span>
          </div>
          <div className="text-[20px] font-extrabold text-white font-mono tracking-tight leading-none">
            {stats?.averageAccuracy ? `${Math.round(stats.averageAccuracy)}%` : '96%'}
          </div>
          <div className="text-[11px] text-[#8e7d70]">Accuracy</div>
        </div>

        {/* Current Streak */}
        <div className="bg-[#140e09] border border-[#2b1d12] rounded-[14px] p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[#fbbf24] border border-[rgba(245,158,11,0.2)]">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[9.5px] text-[#8e7d70] font-semibold">Keep going!</span>
          </div>
          <div className="text-[20px] font-extrabold text-white font-mono tracking-tight leading-none">
            {stats?.streakDays || 5}{' '}
            <small className="text-[12px] text-[#8e7d70] font-medium ml-0.5 font-sans">
              days
            </small>
          </div>
          <div className="text-[11px] text-[#8e7d70]">Current Streak</div>
        </div>
      </div>

      {/* 5. FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-[#0e0a07]/95 backdrop-blur-md border-t border-[#2b1d12] flex justify-around pt-2.5 pb-3.5 z-50">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex flex-col items-center gap-[3px] text-[#f59e0b] text-[10px] font-semibold transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 fill-current" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/learn')}
          className="flex flex-col items-center gap-[3px] text-[#8e7d70] hover:text-[#f3ece4] text-[10px] font-semibold transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Learn</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/library')}
          className="flex flex-col items-center gap-[3px] text-[#8e7d70] hover:text-[#f3ece4] text-[10px] font-semibold transition-colors cursor-pointer"
        >
          <Folder className="w-4 h-4" />
          <span>Library</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/progress')}
          className="flex flex-col items-center gap-[3px] text-[#8e7d70] hover:text-[#f3ece4] text-[10px] font-semibold transition-colors cursor-pointer"
        >
          <BarChart2 className="w-4 h-4" />
          <span>Progress</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-col items-center gap-[3px] text-[#8e7d70] hover:text-[#f3ece4] text-[10px] font-semibold transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
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
