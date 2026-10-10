import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  X,
  FileText,
  FolderKanban,
  Sparkles,
  GraduationCap,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';

interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function MoreDrawer({ isOpen, onClose, onOpenSettings }: MoreDrawerProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile, isAdmin } = useProfile();

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleItemClick = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Card */}
      <div
        id="mobile-more-bottom-sheet"
        className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-neutral-800 bg-[#120f0c] p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200"
      >
        {/* Top bar & close */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
              &gt;_
            </span>
            <span className="text-sm font-bold text-white tracking-wide">
              More Workspaces & Tools
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Mini Card */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-base">
              {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{profile.displayName}</p>
              <p className="text-[10px] font-mono text-amber-400 mt-0.5 uppercase">
                {isAdmin ? 'Owner / Admin' : 'Student'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleItemClick('/profile')}
            className="text-xs text-amber-400 font-medium hover:underline"
          >
            View
          </button>
        </div>

        {/* Exam Prepare Featured Quick Action */}
        <button
          type="button"
          onClick={() => handleItemClick('/exam-prepare')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Exam Prepare</p>
              <p className="text-[10px] text-amber-300/80">Straightforward Elementary (Units 1–2D)</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400" />
        </button>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleItemClick('/notes')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#17130f] border border-neutral-800/80 hover:border-amber-500/40 text-left transition-all"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Notes</p>
              <p className="text-[10px] text-neutral-400">Scratchpad & Rules</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('/projects')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#17130f] border border-neutral-800/80 hover:border-amber-500/40 text-left transition-all"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Projects</p>
              <p className="text-[10px] text-neutral-400">Goals & Spaces</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('/review')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#17130f] border border-neutral-800/80 hover:border-amber-500/40 text-left transition-all"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Review</p>
              <p className="text-[10px] text-neutral-400">Mistake Hub</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('/profile')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#17130f] border border-neutral-800/80 hover:border-amber-500/40 text-left transition-all"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Profile</p>
              <p className="text-[10px] text-neutral-400">Account & Stats</p>
            </div>
          </button>
        </div>

        {/* Administration link if Admin */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => handleItemClick('/admin')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">Admin Center</p>
                <p className="text-[10px] text-amber-300/80">Manage users, curriculum & telemetry</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        )}

        {/* Bottom Actions: Settings & Logout */}
        <div className="flex items-center gap-3 pt-2 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/settings');
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/30 border border-red-900/40 text-xs font-semibold text-red-300 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
