import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { DesktopTopBar } from './DesktopTopBar';
import { SettingsModal } from '../common/SettingsModal';
import { PwaUpdatePrompt } from '../common/PwaUpdatePrompt';
import { storageService } from '../../services/storage';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() =>
    storageService.getSidebarCollapsed()
  );

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      storageService.setSidebarCollapsed(next);
      return next;
    });
  };

  // If route is /lesson/:id, /focus/*, or /typing/day*, bypass all nav wrappers for pure focus mode
  const isFocusLesson =
    location.pathname.startsWith('/lesson') ||
    location.pathname.startsWith('/focus') ||
    location.pathname.startsWith('/exercise') ||
    location.pathname.startsWith('/typing/day');

  if (isFocusLesson) {
    return (
      <div className="min-h-screen bg-[#0a0908] text-neutral-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-white">
        <Outlet />
      </div>
    );
  }

  // Determine page title for mobile top header
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/' || p === '/home') return 'Home';
    if (p === '/learn') return 'Learn Hub';
    if (p === '/library') return 'Library';
    if (p === '/notes') return 'Notes';
    if (p === '/projects') return 'Projects';
    if (p === '/swedish') return 'Swedish Course';
    if (p === '/english') return 'English Course';
    if (p === '/german') return 'German Course';
    if (p === '/mathematics') return 'Mathematics Course';
    if (p === '/python') return 'Python Course';
    if (p === '/typing') return 'Typing Practice';
    if (p === '/progress') return 'Progress';
    if (p === '/review') return 'Review';
    if (p === '/settings') return 'Settings';
    if (p === '/profile') return 'Profile';
    if (p.startsWith('/admin')) return 'Admin Center';
    if (p.startsWith('/spaces')) return 'Learning Space';
    return 'MY LEARNING';
  };

  const isHomeOrHub = location.pathname === '/' || location.pathname === '/home';

  return (
    <div className="min-h-screen bg-[#0a0806] text-neutral-100 flex flex-col lg:flex-row antialiased selection:bg-amber-500/30 selection:text-white">
      {/* Desktop Left Sidebar (Visible at >= 1024px) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenSettings={() => navigate('/settings')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-200 ease-in-out">
        {/* Mobile & Tablet Top Bar (Hidden on Desktop >= 1024px) */}
        <header className="lg:hidden sticky top-0 z-30 w-full bg-[#0d0a08]/95 backdrop-blur-md border-b border-[#261f18] px-4 py-3">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            {!isHomeOrHub ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
                  &gt;_
                </span>
                <span className="text-xs font-bold tracking-wider text-white uppercase font-mono">
                  MY LEARNING
                </span>
              </div>
            )}

            <h1 className="text-sm font-bold text-white truncate max-w-[160px] text-center">
              {getPageTitle()}
            </h1>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#18130f] border border-neutral-800 text-amber-400 text-xs font-bold"
              aria-label="Profile"
            >
              👤
            </button>
          </div>
        </header>

        {/* Responsive Content Container */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-3 lg:pt-6 pb-24 lg:pb-12 transition-all duration-200">
          <DesktopTopBar onOpenSettings={() => navigate('/settings')} />
          <Outlet />
        </main>
      </div>

      {/* Fixed Bottom Navigation (Mobile & Tablet < 1024px only) */}
      <div className="lg:hidden">
        <BottomNav onOpenSettings={() => navigate('/settings')} />
      </div>

      {/* Global Settings Modal fallback if opened */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Non-intrusive PWA Update Notice */}
      <PwaUpdatePrompt />
    </div>
  );
}
