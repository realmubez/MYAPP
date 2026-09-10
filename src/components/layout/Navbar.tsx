import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings, Menu, X, Terminal, BookOpen, BarChart2, Sparkles } from 'lucide-react';
import { SettingsModal } from '../common/SettingsModal';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: BookOpen },
    { label: 'Swedish', path: '/swedish', badge: '🇸🇪' },
    { label: 'English', path: '/english', badge: '🇬🇧' },
    { label: 'Python', path: '/python', badge: '🐍' },
    { label: 'Typing', path: '/typing', badge: '⌨️' },
    { label: 'Review', path: '/review', icon: Sparkles },
    { label: 'Progress', path: '/progress', icon: BarChart2 },
  ];

  return (
    <>
      <header
        id="app-navbar"
        className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Tagline */}
          <NavLink
            to="/"
            id="nav-logo"
            className="group flex flex-col items-start gap-0.5"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
                &gt;_
              </span>
              <span className="text-sm sm:text-base font-semibold tracking-wider text-neutral-100 group-hover:text-white transition-colors">
                MY LEARNING
              </span>
            </div>
            <span className="text-[11px] font-normal tracking-normal text-neutral-400">
              “I learn by typing.”
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  id={`nav-link-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 border border-transparent'
                  }`}
                >
                  {item.badge && <span className="text-xs">{item.badge}</span>}
                  {item.icon && <item.icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              id="open-settings-btn"
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 transition-colors"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 md:hidden transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="border-b border-neutral-800 bg-neutral-900 px-4 py-3 md:hidden space-y-1 animate-in slide-in-from-top-2 duration-150"
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  id={`mobile-nav-${item.label.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-neutral-300 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.badge && <span className="text-base">{item.badge}</span>}
                    {item.icon && <item.icon className="w-4 h-4 text-neutral-400" />}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="text-xs text-amber-400">Current</span>}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
