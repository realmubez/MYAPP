import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

  // If route is /lesson/:id, /focus/*, or /typing/day*, bypass standard nav wrappers for pure focus mode
  const isFocusLesson =
    location.pathname.startsWith('/lesson') ||
    location.pathname.startsWith('/focus') ||
    location.pathname.startsWith('/typing/day');

  if (isFocusLesson) {
    return (
      <div className="min-h-screen bg-[#0a0908] text-neutral-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-white">
        <Outlet />
      </div>
    );
  }

  // Determine if this is a secondary page that needs a mobile back button
  const isCustomHeaderPage =
    location.pathname === '/' ||
    location.pathname === '/swedish' ||
    location.pathname === '/english' ||
    location.pathname === '/python';

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/english':
        return 'English Course';
      case '/python':
        return 'Python Course';
      case '/typing':
        return 'Typing Practice';
      case '/progress':
        return 'Learning Progress';
      case '/review':
        return 'Mistake Review';
      case '/settings':
        return 'Settings';
      case '/profile':
        return 'Profile';
      default:
        return 'My Learning';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0908] text-neutral-100 flex flex-col lg:flex-row antialiased selection:bg-amber-500/30 selection:text-white">
      {/* Desktop Left Sidebar (Visible at >= 1024px) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenSettings={() => navigate('/settings')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-200 ease-in-out">
        {/* Mobile secondary page top header (Hidden on desktop) */}
        {!isCustomHeaderPage && (
          <header className="lg:hidden sticky top-0 z-30 w-full bg-neutral-950/95 backdrop-blur-md border-b border-neutral-900 px-4 py-2.5">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <span className="text-sm font-bold text-white">
                {getPageTitle()}
              </span>
              <div className="w-12" /> {/* Spacer for balance */}
            </div>
          </header>
        )}

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

