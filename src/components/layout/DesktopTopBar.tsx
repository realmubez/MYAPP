import { useState, useRef, useEffect, FormEvent } from 'react';
import { Search, Bell, Sun, ChevronDown, Settings, LogOut, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { BUILT_IN_AVATARS } from '../../services/profileService';

interface DesktopTopBarProps {
  onOpenSettings: () => void;
}

export function DesktopTopBar({ onOpenSettings }: DesktopTopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile, isAdmin } = useProfile();

  const avatarOption = BUILT_IN_AVATARS.find((a) => a.id === profile.avatar) || BUILT_IN_AVATARS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate('/login');
  };

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
          onClick={() => navigate('/settings')}
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
          onClick={() => navigate('/settings')}
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

        {/* User Profile Pill with Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            id="desktop-user-profile-pill"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl border border-neutral-800 bg-[#141210] hover:border-neutral-700 transition-all cursor-pointer text-left"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl border text-sm font-bold ${avatarOption.bgColor}`}>
              {avatarOption.emoji}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                {profile.displayName}
              </span>
              <span className="text-[10px] text-amber-400 font-mono tracking-wider">
                {isAdmin ? 'ADMIN' : 'MEMBER'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-neutral-800 bg-[#141210] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-neutral-800/80 mb-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                  <Shield className="w-3 h-3" />
                  <span>{profile.displayName} · {isAdmin ? 'Admin' : 'Member'}</span>
                </div>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  “I learn by typing.”
                </p>
              </div>

              <button
                type="button"
                id="profile-dropdown-profile-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900/90 transition-colors text-left cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <span>Profile</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  id="profile-dropdown-admin-btn"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 transition-colors text-left cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Center</span>
                </button>
              )}

              <button
                type="button"
                id="profile-dropdown-settings-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900/90 transition-colors text-left cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-400" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                id="profile-dropdown-logout-btn"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-red-950/20 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
