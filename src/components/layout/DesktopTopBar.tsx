import { useState, FormEvent } from 'react';
import { Search, Bell, Sun, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DesktopTopBarProps {
  onOpenSettings: () => void;
}

export function DesktopTopBar({ onOpenSettings }: DesktopTopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    if (q.includes('swed') || q.includes('svens')) {
      navigate('/swedish');
    } else if (q.includes('eng') || q.includes('brit')) {
      navigate('/english');
    } else if (q.includes('pyth') || q.includes('code')) {
      navigate('/python');
    } else if (q.includes('rev') || q.includes('mist')) {
      navigate('/review');
    } else if (q.includes('prog') || q.includes('stat')) {
      navigate('/progress');
    } else if (q.includes('typ') || q.includes('speed')) {
      navigate('/typing');
    } else {
      navigate('/swedish');
    }
  };

  return (
    <header
      id="desktop-top-bar"
      className="hidden lg:flex items-center justify-between w-full pb-6 pt-1 gap-6"
    >
      {/* Search Bar matching reference */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-xl relative"
        role="search"
      >
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none" />
          <input
            id="desktop-global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons, topics, or skills..."
            className="w-full h-11 pl-11 pr-16 rounded-2xl bg-[#141210] border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all"
          />
          <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400">
              Ctrl
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400">
              K
            </kbd>
          </div>
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Theme button */}
        <button
          type="button"
          id="desktop-theme-toggle-btn"
          onClick={onOpenSettings}
          aria-label="Theme Settings"
          title="Theme Settings"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-[#141210] text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
        >
          <Sun className="w-4 h-4 text-neutral-300" />
        </button>

        {/* Notifications button with badge */}
        <button
          type="button"
          id="desktop-notifications-btn"
          onClick={onOpenSettings}
          aria-label="Notifications"
          title="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-[#141210] text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4 text-neutral-300" />
          <span className="absolute 1.5 top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
        </button>

        {/* User Profile Pill matching reference */}
        <button
          type="button"
          id="desktop-user-profile-pill"
          onClick={onOpenSettings}
          className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl border border-neutral-800 bg-[#141210] hover:border-neutral-700 transition-all cursor-pointer text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 text-white font-bold text-xs">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white leading-tight">
              Welcome back
            </span>
            <span className="text-[11px] text-neutral-400 font-normal">
              Keep learning!
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-500 ml-1" />
        </button>
      </div>
    </header>
  );
}
