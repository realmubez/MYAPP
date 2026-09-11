import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Elegant, non-leaking loading screen while checking server authentication
    return (
      <div className="min-h-screen w-full bg-[#0d0c0a] flex flex-col items-center justify-center select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-base font-bold shadow-lg shadow-amber-500/10 animate-pulse">
          &gt;_
        </div>
        <p className="mt-4 text-xs font-mono tracking-widest text-neutral-500 uppercase">
          MY LEARNING
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the deep link for safe redirect after login
    const targetUrl = location.pathname + location.search;
    const redirectParam = targetUrl && targetUrl !== '/' ? `?redirect=${encodeURIComponent(targetUrl)}` : '';
    return <Navigate to={`/login${redirectParam}`} replace />;
  }

  return <Outlet />;
}
