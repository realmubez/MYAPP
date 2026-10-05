import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Folder, BarChart2, MoreHorizontal } from 'lucide-react';
import { MoreDrawer } from './MoreDrawer';

interface BottomNavProps {
  onOpenSettings: () => void;
}

export function BottomNav({ onOpenSettings }: BottomNavProps) {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryNavItems = [
    { label: 'Home', path: '/', icon: Home, exact: true },
    {
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
    { label: 'Library', path: '/library', icon: Folder, matchPrefix: '/library' },
    { label: 'Progress', path: '/progress', icon: BarChart2, matchPrefix: '/progress' },
  ];

  const isItemActive = (item: (typeof primaryNavItems)[0]) => {
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

  const isMoreActive =
    location.pathname.startsWith('/notes') ||
    location.pathname.startsWith('/projects') ||
    location.pathname.startsWith('/review') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/spaces');

  return (
    <>
      <nav
        id="mobile-bottom-nav"
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0a08]/95 backdrop-blur-lg border-t border-[#261f18] px-2 py-1.5"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {primaryNavItems.map((item) => {
            const isActive = isItemActive(item);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                id={`bottom-nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
                  isActive
                    ? 'text-amber-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}

          {/* More Action Trigger Button */}
          <button
            type="button"
            id="bottom-nav-more-btn"
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors cursor-pointer ${
              isMoreActive
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            aria-label="More Workspaces"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Bottom Sheet Drawer */}
      <MoreDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onOpenSettings={onOpenSettings}
      />
    </>
  );
}
