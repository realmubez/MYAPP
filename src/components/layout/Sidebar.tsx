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
} from 'lucide-react';

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenHelp?: () => void;
}

export function Sidebar({ onOpenSettings, onOpenHelp }: SidebarProps) {
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
      className="hidden lg:flex flex-col justify-between w-60 xl:w-64 h-screen sticky top-0 shrink-0 border-r border-neutral-800/80 bg-[#0d0c0a] p-5 select-none z-30"
    >
      {/* Top Header & Brand */}
      <div className="space-y-6">
        <NavLink
          to="/"
          id="sidebar-brand-logo"
          className="group flex items-center gap-3 px-1 py-1"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-sm font-bold shadow-sm shadow-amber-500/10 group-hover:border-amber-400 transition-colors">
            &gt;_
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white group-hover:text-amber-300 transition-colors leading-tight">
              MY LEARNING
            </h1>
            <p className="text-[11px] text-neutral-400 font-normal mt-0.5">
              “I learn by typing.”
            </p>
          </div>
        </NavLink>

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
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30 shadow-sm shadow-amber-500/10'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? 'text-amber-400' : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Profile link */}
          <button
            type="button"
            id="sidebar-nav-profile"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80 border border-transparent transition-all cursor-pointer text-left"
          >
            <User className="w-4 h-4 text-neutral-400" />
            <span>Profile</span>
          </button>
        </nav>
      </div>

      {/* Bottom Area: Settings, Help & Quote Card */}
      <div className="space-y-4 pt-4 border-t border-neutral-900">
        <div className="space-y-1">
          <button
            type="button"
            id="sidebar-nav-settings"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80 transition-all cursor-pointer text-left"
          >
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            id="sidebar-nav-help"
            onClick={onOpenHelp || onOpenSettings}
            className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80 transition-all cursor-pointer text-left"
          >
            <HelpCircle className="w-4 h-4 text-neutral-400" />
            <span>Help</span>
          </button>
        </div>

        {/* Motivational Sidebar Card matching reference image */}
        <div
          id="sidebar-quote-card"
          className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3.5"
        >
          <p className="text-xs text-neutral-300 italic leading-relaxed">
            “Progress happens one keystroke at a time.”
          </p>
        </div>
      </div>
    </aside>
  );
}
