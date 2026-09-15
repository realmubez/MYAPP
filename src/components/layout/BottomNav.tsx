import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, BarChart2, User } from 'lucide-react';

interface BottomNavProps {
  onOpenSettings?: () => void;
}

export function BottomNav({ onOpenSettings }: BottomNavProps) {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Learn', path: '/swedish', icon: BookOpen },
    { label: 'Courses', path: '/english', icon: GraduationCap },
    { label: 'Progress', path: '/progress', icon: BarChart2 },
  ];

  return (
    <nav
      id="fixed-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-900 px-4 py-2"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              id={`bottom-nav-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[11px] tracking-tight">
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* Profile Tab */}
        <NavLink
          to="/profile"
          id="bottom-nav-profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 transition-colors ${
              isActive
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`
          }
          aria-label="Open Profile"
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium tracking-tight">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
