import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  GraduationCap,
  BarChart2,
  Sparkles,
  User,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
      path: '/swedish',
      icon: BookOpen,
      matchPrefix: '/swedish',
    },
    {
      id: 'sidebar-nav-courses',
      label: 'Courses',
      path: '/english',
      icon: GraduationCap,
      matchPrefix: ['/english', '/python', '/typing'],
    },
    {
      id: 'sidebar-nav-progress',
      label: 'Progress',
      path: '/progress',
      icon: BarChart2,
    },
    {
      id: 'sidebar-nav-review',
      label: 'Review',
      path: '/review',
      icon: Sparkles,
    },
  ];

  const isItemActive = (item: (typeof mainNavItems)[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
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
      className={`hidden lg:flex flex-col justify-between h-screen sticky top-0 shrink-0 border-r border-neutral-800/80 bg-[#0d0c0a] select-none z-30 transition-[width,padding] duration-200 ease-in-out ${
        isCollapsed ? 'w-[72px] p-3' : 'w-60 xl:w-64 p-5'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="space-y-5">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between gap-2'
          }`}
        >
          <NavLink
            to="/"
            id="sidebar-brand-logo"
            title="MY LEARNING Dashboard"
            aria-label="MY LEARNING Dashboard"
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
                <p className="text-[11px] text-neutral-400 font-normal mt-0.5 truncate">
                  “I learn by typing.”
                </p>
              </div>
            )}
          </NavLink>
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
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
                    ? 'h-11 w-11 mx-auto justify-center'
                    : 'gap-3.5 px-3.5 py-2.5'
                } ${
                  active
                    ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30 shadow-sm shadow-amber-500/10'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80 border border-transparent'
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

          {/* Profile link */}
          <button
            type="button"
            id="sidebar-nav-profile"
            onClick={onOpenSettings}
            title={isCollapsed ? 'Profile' : undefined}
            aria-label="Profile"
            className={`flex items-center rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80 border border-transparent transition-all cursor-pointer ${
              isCollapsed
                ? 'h-11 w-11 mx-auto justify-center'
                : 'w-full gap-3.5 px-3.5 py-2.5 text-left'
            }`}
          >
            <User className="w-4 h-4 shrink-0 text-neutral-400" />
            {!isCollapsed && <span>Profile</span>}
          </button>
        </nav>
      </div>

      {/* Bottom Area: Settings, Help & Collapse Toggle */}
      <div className="space-y-3 pt-3 border-t border-neutral-900">
        <div className="space-y-1">
          <button
            type="button"
            id="sidebar-nav-settings"
            onClick={onOpenSettings}
            title={isCollapsed ? 'Settings' : undefined}
            aria-label="Settings"
            className={`flex items-center rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80 transition-all cursor-pointer ${
              isCollapsed
                ? 'h-10 w-10 mx-auto justify-center'
                : 'w-full gap-3.5 px-3.5 py-2 text-left'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0 text-neutral-400" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          <button
            type="button"
            id="sidebar-nav-help"
            onClick={onOpenHelp || onOpenSettings}
            title={isCollapsed ? 'Help' : undefined}
            aria-label="Help"
            className={`flex items-center rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80 transition-all cursor-pointer ${
              isCollapsed
                ? 'h-10 w-10 mx-auto justify-center'
                : 'w-full gap-3.5 px-3.5 py-2 text-left'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-neutral-400" />
            {!isCollapsed && <span>Help</span>}
          </button>
        </div>

        {/* Motivational Sidebar Card (expanded only) */}
        {!isCollapsed && (
          <div
            id="sidebar-quote-card"
            className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3.5 animate-in fade-in duration-150"
          >
            <p className="text-xs text-neutral-300 italic leading-relaxed">
              “Progress happens one keystroke at a time.”
            </p>
          </div>
        )}

        {/* Sidebar Collapse/Expand Toggle Button */}
        <button
          type="button"
          id="sidebar-collapse-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center rounded-xl border border-neutral-800/80 bg-neutral-900/90 text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all cursor-pointer text-xs font-semibold ${
            isCollapsed
              ? 'h-10 w-10 mx-auto justify-center'
              : 'w-full justify-between px-3.5 py-2.5'
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
              <span className="text-[10px] font-mono text-neutral-500">◀</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
