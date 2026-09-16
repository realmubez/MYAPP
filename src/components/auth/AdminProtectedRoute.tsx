import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminProtectedRoute() {
  const { isAuthenticated, isLoading, role, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0d0c0a] flex flex-col items-center justify-center select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-base font-bold shadow-lg shadow-amber-500/10 animate-pulse">
          &gt;_
        </div>
        <p className="mt-4 text-xs font-mono tracking-widest text-neutral-500 uppercase">
          VERIFYING ADMIN PRIVILEGES
        </p>
      </div>
    );
  }

  const isAdmin = isAuthenticated && (role === 'admin' || user?.role === 'admin');

  if (!isAdmin) {
    // Non-admin or unauthenticated user is strictly redirected
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
