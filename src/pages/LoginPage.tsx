import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth, normalizeAuthError } from '../context/AuthContext';

/**
 * Validates and sanitizes the redirect URL to prevent open redirect vulnerabilities.
 * Only allows relative paths within this application.
 */
function getSafeRedirectUrl(searchParams: URLSearchParams): string {
  const redirect = searchParams.get('redirect');
  if (!redirect) return '/';

  // Must begin with a single slash and not double slashes or backslashes
  if (redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\')) {
    // Must not contain protocols like http:, https:, javascript:, data:
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(redirect)) {
      return redirect;
    }
  }

  return '/';
}

export function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, isLoading, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const safeRedirect = getSafeRedirectUrl(searchParams);

  // If already authenticated, proceed to the requested URL or dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(safeRedirect, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, safeRedirect]);

  // Focus input automatically on mount
  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanPassword = password.trim();

    if (!cleanPassword) {
      setError('Enter your password');
      passwordInputRef.current?.focus();
      return;
    }

    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(cleanPassword);

      if (result.ok) {
        navigate(safeRedirect, { replace: true });
      } else {
        const errorText = normalizeAuthError(result.message || result.error, 'Incorrect password');
        setError(errorText);
        setIsSubmitting(false);
        setPassword('');
        passwordInputRef.current?.focus();
      }
    } catch (err) {
      setError(normalizeAuthError(err, 'Unable to sign in. Please try again.'));
      setIsSubmitting(false);
      setPassword('');
      passwordInputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0908] bg-radial from-[#17130e] via-[#0d0c0a] to-[#070605] flex flex-col items-center justify-center p-4 select-none">
      {/* Centered Minimal Authentication Card */}
      <div className="w-full max-w-sm rounded-3xl border border-neutral-800/90 bg-[#12100e]/95 backdrop-blur-md p-7 sm:p-8 shadow-2xl shadow-black/80">
        {/* Terminal Brand & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-base font-bold shadow-md shadow-amber-500/10 mb-4">
            &gt;_
          </div>

          <h1 className="text-base font-bold tracking-wider text-white">
            MY LEARNING
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-normal tracking-wide">
            Private Learning Space
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="private-access-password"
                className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400/80" />
                <span>Password</span>
              </label>
            </div>

            <div className="relative">
              <input
                ref={passwordInputRef}
                id="private-access-password"
                name="password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••••••"
                className="w-full h-12 px-4 rounded-xl bg-[#090807] border border-neutral-800 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/60 transition-all font-mono"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && typeof error === 'string' && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            id="private-login-submit-btn"
            disabled={isSubmitting || !password.trim()}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Enter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Tagline */}
        <div className="mt-8 pt-5 border-t border-neutral-900 text-center">
          <p className="text-xs font-mono text-neutral-500 italic">
            “I learn by typing.”
          </p>
        </div>
      </div>
    </div>
  );
}
