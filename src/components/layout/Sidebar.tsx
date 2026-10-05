import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Folder,
  FileText,
  FolderKanban,
  Sparkles,
  BarChart2,
  User,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
  onOpenHelp?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onOpenSettings,
  onOpenHelp,
}: SidebarProps) {
  const location = useLocation();
  const { role, user } = useAuth();
  const isAdmin = role === 'admin' || user?.role === 'admin';

  const mainNavItems = [
    {
      id: 'sidebar-nav-home',
      label: 'Home',
      path: '/',
      icon: Home,
      exact: true,
    },
    {
      id: 'sidebar-nav-learn',
      label: 'Learn',
      path: '/learn',
      icon: BookOpen,
      matchPrefix: [
        '/learn',
        '/swedish',
        '/english',
        '/german',
        '/mathematics',
        '/python',
        '/typing',
      ],
    },
    {
      id: 'sidebar-nav-library',
      label: 'Library',
      path: '/library',
      icon: Folder,
      matchPrefix: '/library',
    },
    {
      id: 'sidebar-nav-notes',
      label: 'Notes',
      path: '/notes',
      icon: FileText,
      matchPrefix: '/notes',
    },
    {
      id: 'sidebar-nav-projects',
      label: 'Projects',
      path: '/projects',
      icon: FolderKanban,
      matchPrefix: ['/projects', '/spaces'],
    },
    {
      id: 'sidebar-nav-review',
      label: 'Review',
      path: '/review',
      icon: Sparkles,
      matchPrefix: '/review',
    },
    {
      id: 'sidebar-nav-progress',
      label: 'Progress',
      path: '/progress',
      icon: BarChart2,
      matchPrefix: '/progress',
    },
  ];

  const isItemActive = (item: (typeof mainNavItems)[0]) => {
    if (item.exact) {
      return location.pathname === '/' || location.pathname === '/home';
    }
    if (item.matchPrefix) {
      if (Array.isArray(item.matchPrefix)) {
        return item.matchPrefix.some((p) => location.pathname.startsWith(p));
      }
      return location.pathname.startsWith(item.matchPrefix);
    }
    return location.pathname === item.path;
  };

  return (
    <aside
      id="desktop-sidebar"
      aria-label="Desktop Navigation Sidebar"
      className={`hidden lg:flex flex-col justify-between h-screen sticky top-0 shrink-0 border-r border-[#261f18] bg-[#0d0a08] select-none z-30 transition-[width,padding] duration-200 ease-in-out ${
        isCollapsed ? 'w-[72px] p-3' : 'w-60 xl:w-64 p-5'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="space-y-4">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between gap-2'
          }`}
        >
          <NavLink
            to="/"
            id="sidebar-brand-logo"
            title="MY LEARNING OS"
            aria-label="MY LEARNING OS"
            className="group flex items-center gap-3 px-1 py-1 min-w-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-sm font-bold shadow-sm shadow-amber-500/10 group-hover:border-amber-400 transition-colors">
              &gt;_
            </div>
            {!isCollapsed && (
              <div className="min-w-0 animate-in fade-in duration-150">
                <h1 className="text-sm font-bold tracking-wider text-white group-hover:text-amber-300 transition-colors leading-tight truncate">
                  MY LEARNING
                </h1>
                <p className="text-[10px] text-amber-400/80 font-mono mt-0.5 truncate uppercase tracking-wider">
                  Personal Learning OS
                </p>
              </div>
            )}
          </NavLink>
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {mainNavItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                id={item.id}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  isCollapsed
                    ? 'h-10 w-10 mx-auto justify-center'
                    : 'gap-3 px-3 py-2.5'
                } ${
                  active
                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm shadow-amber-500/10'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#18130f] border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-amber-400' : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile, Settings, Admin, Collapse */}
      <div className="space-y-2 pt-3 border-t border-[#261f18]">
        <div className="space-y-1">
          {/* Profile link */}
          <NavLink
            to="/profile"
            id="sidebar-nav-profile"
            title={isCollapsed ? 'Profile' : undefined}
            aria-label="Profile"
            className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
              location.pathname === '/profile'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm shadow-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#18130f] border border-transparent'
            } ${
              isCollapsed
                ? 'h-10 w-10 mx-auto justify-center'
                : 'w-full gap-3 px-3 py-2 text-left'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Profile</span>}
          </NavLink>

          {/* Settings link */}
          <NavLink
            to="/settings"
            id="sidebar-nav-settings"
            title={isCollapsed ? 'Settings' : undefined}
            aria-label="Settings"
            className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
              location.pathname === '/settings'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm shadow-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#18130f] border border-transparent'
            } ${
              isCollapsed
                ? 'h-10 w-10 mx-auto justify-center'
                : 'w-full gap-3 px-3 py-2 text-left'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>

          {/* Admin link for Admin Users */}
          {isAdmin && (
            <NavLink
              to="/admin"
              id="sidebar-nav-admin"
              title={isCollapsed ? 'Admin Center' : undefined}
              aria-label="Admin Center"
              className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/admin')
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-500/20'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/20 border border-transparent'
              } ${
                isCollapsed
                  ? 'h-10 w-10 mx-auto justify-center'
                  : 'w-full gap-3 px-3 py-2 text-left'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0 text-amber-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Admin</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                    CONTROL
                  </span>
                </div>
              )}
            </NavLink>
          )}
        </div>

        {/* Sidebar Collapse/Expand Toggle Button */}
        <button
          type="button"
          id="sidebar-collapse-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center rounded-xl border border-neutral-800/80 bg-[#14110e] text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all cursor-pointer text-xs font-semibold ${
            isCollapsed
              ? 'h-10 w-10 mx-auto justify-center'
              : 'w-full justify-between px-3 py-2'
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-amber-400" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4 text-amber-400" />
                <span>Collapse</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">◀</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
