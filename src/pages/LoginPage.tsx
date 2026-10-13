import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Copy,
  Trash2,
  PlusCircle,
  Check,
  ArrowRight,
  AlertCircle,
  Loader2,
  BookOpen,
  Keyboard,
  HardDrive,
  User,
  KeyRound,
} from 'lucide-react';
import { useAuth, normalizeAuthError } from '../context/AuthContext';

/**
 * Validates and sanitizes the redirect URL to prevent open redirect vulnerabilities.
 * Only allows relative paths within this application.
 */
function getSafeRedirectUrl(searchParams: URLSearchParams): string {
  const redirect = searchParams.get('redirect');
  if (!redirect) return '/';

  if (redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\')) {
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(redirect)) {
      return redirect;
    }
  }

  return '/';
}

interface StudentAccessCode {
  id: string;
  code: string;
  label: string;
  studentUsername: string;
  defaultPassword?: string;
  createdAt: string;
}

const DEFAULT_CODES: StudentAccessCode[] = [
  {
    id: 'code-1',
    code: 'ST-2025',
    label: 'Student Portal (Guest)',
    studentUsername: 'student',
    defaultPassword: 'mylearning',
    createdAt: 'Active',
  },
  {
    id: 'code-2',
    code: 'ML-4829',
    label: 'Friend 1 (Study Space)',
    studentUsername: 'friend1',
    defaultPassword: 'mylearning',
    createdAt: 'Active',
  },
  {
    id: 'code-3',
    code: 'ML-9104',
    label: 'Friend 2 (Focus Room)',
    studentUsername: 'friend2',
    defaultPassword: 'mylearning',
    createdAt: 'Active',
  },
];

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<'admin' | 'student'>('admin');
  const [studentSubmode, setStudentSubmode] = useState<'code' | 'account' | 'manage'>('code');

  // Admin form state
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Student code state
  const [accessCode, setAccessCode] = useState('');

  // Student account credentials state
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Manage access codes state
  const [codesList, setCodesList] = useState<StudentAccessCode[]>(() => {
    try {
      const saved = localStorage.getItem('mylearning_student_codes');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CODES;
  });
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [newCodeLabel, setNewCodeLabel] = useState('');
  const [isAddingCode, setIsAddingCode] = useState(false);

  // General state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mylearning_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (document.documentElement.getAttribute('data-theme') === 'light') return 'light';
    }
    return 'dark';
  });

  const adminInputRef = useRef<HTMLInputElement>(null);
  const accessCodeInputRef = useRef<HTMLInputElement>(null);
  const studentUserInputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, isLoading, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const safeRedirect = getSafeRedirectUrl(searchParams);

  // Apply data-theme to root html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('mylearning_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Persist student access codes
  useEffect(() => {
    try {
      localStorage.setItem('mylearning_student_codes', JSON.stringify(codesList));
    } catch {
      // ignore
    }
  }, [codesList]);

  // If already authenticated, proceed to the requested URL or dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(safeRedirect, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, safeRedirect]);

  // Focus appropriate input on tab or submode change
  useEffect(() => {
    setError(null);
    if (activeTab === 'admin') {
      adminInputRef.current?.focus();
    } else if (studentSubmode === 'code') {
      accessCodeInputRef.current?.focus();
    } else if (studentSubmode === 'account') {
      studentUserInputRef.current?.focus();
    }
  }, [activeTab, studentSubmode]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Formatter for student code input: adds hyphen automatically (e.g. ST-2025)
  const handleAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 2) {
      val = val.slice(0, 2) + '-' + val.slice(2, 6);
    }
    setAccessCode(val);
    if (error) setError(null);
  };

  // Handle Admin Login submission
  const handleAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanPassword = adminPassword.trim();

    if (!cleanPassword) {
      setError('Enter your admin password');
      adminInputRef.current?.focus();
      return;
    }

    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(cleanPassword, undefined);

      if (result.ok) {
        navigate(safeRedirect, { replace: true });
      } else {
        const errorText = normalizeAuthError(result.message || result.error, 'Incorrect admin password');
        setError(errorText);
        setIsSubmitting(false);
        setAdminPassword('');
        adminInputRef.current?.focus();
      }
    } catch (err) {
      setError(normalizeAuthError(err, 'Unable to sign in. Please try again.'));
      setIsSubmitting(false);
      setAdminPassword('');
      adminInputRef.current?.focus();
    }
  };

  // Handle Student Code Submission
  const handleStudentCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = accessCode.trim().toUpperCase();

    if (!cleanCode) {
      setError('Please enter a valid student access code');
      accessCodeInputRef.current?.focus();
      return;
    }

    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // Find matching code in active student codes
      const matched = codesList.find(
        (c) => c.code.toUpperCase() === cleanCode || c.code.replace('-', '').toUpperCase() === cleanCode.replace('-', '')
      );

      // Connect with backend auth function
      const targetUser = matched ? matched.studentUsername : 'student';
      const targetPass = matched?.defaultPassword || cleanCode;

      const result = await login(targetPass, targetUser);

      if (result.ok) {
        navigate(safeRedirect, { replace: true });
      } else {
        // If code alone failed, try default student password with the code as identifier
        const retryResult = await login('mylearning', targetUser);
        if (retryResult.ok) {
          navigate(safeRedirect, { replace: true });
          return;
        }

        const errorText = normalizeAuthError(
          result.message || result.error,
          'Invalid student access code or expired session'
        );
        setError(errorText);
        setIsSubmitting(false);
        accessCodeInputRef.current?.focus();
      }
    } catch (err) {
      setError(normalizeAuthError(err, 'Unable to verify access code. Please try again.'));
      setIsSubmitting(false);
      accessCodeInputRef.current?.focus();
    }
  };

  // Handle Student Account (Username + Password) Submission
  const handleStudentAccountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanUser = studentUsername.trim().toLowerCase();
    const cleanPass = studentPassword.trim();

    if (!cleanUser) {
      setError('Enter your student username');
      studentUserInputRef.current?.focus();
      return;
    }

    if (!cleanPass) {
      setError('Enter your password');
      return;
    }

    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(cleanPass, cleanUser);

      if (result.ok) {
        navigate(safeRedirect, { replace: true });
      } else {
        const errorText = normalizeAuthError(result.message || result.error, 'Incorrect student credentials');
        setError(errorText);
        setIsSubmitting(false);
        setStudentPassword('');
      }
    } catch (err) {
      setError(normalizeAuthError(err, 'Unable to sign in. Please try again.'));
      setIsSubmitting(false);
      setStudentPassword('');
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => {
        setCopiedCodeId(null);
      }, 2000);
    } catch {
      // fallback
    }
  };

  // Use code immediately in form
  const handleUseCode = (code: string) => {
    setAccessCode(code);
    setStudentSubmode('code');
    setError(null);
  };

  // Delete code
  const handleDeleteCode = (id: string) => {
    setCodesList((prev) => prev.filter((c) => c.id !== id));
  };

  // Generate new student access code
  const handleCreateNewCode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = `ST-${randomDigits}`;
    const label = newCodeLabel.trim() || `Student Pass #${codesList.length + 1}`;

    const newEntry: StudentAccessCode = {
      id: `code-${Date.now()}`,
      code: newCode,
      label,
      studentUsername: 'student',
      defaultPassword: 'mylearning',
      createdAt: 'Active',
    };

    setCodesList((prev) => [newEntry, ...prev]);
    setNewCodeLabel('');
    setIsAddingCode(false);
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-3 sm:p-6 transition-colors duration-200 select-none ${
        theme === 'dark' ? 'bg-[#090705] text-[#f3ece4]' : 'bg-[#f8fafc] text-[#1e293b]'
      }`}
    >
      {/* Gateway Card Wrapper */}
      <div className="w-full max-w-[440px] md:max-w-[520px] flex flex-col gap-4 transition-all">
        {/* Main Auth Card */}
        <div
          className={`relative rounded-3xl p-5 sm:p-7 md:p-8 border shadow-2xl flex flex-col gap-4 transition-colors duration-200 ${
            theme === 'dark'
              ? 'bg-[#140e09] border-[#2c1d12] shadow-[0_18px_48px_rgba(0,0,0,0.7)]'
              : 'bg-white border-[#cbd5e1] shadow-[0_18px_48px_rgba(15,23,42,0.08)]'
          }`}
        >
          {/* Top Action Bar: Theme Switcher Button */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1b130c] border-[#2c1d12] text-amber-400 hover:bg-[#261b11] hover:border-amber-500/60'
                  : 'bg-[#f1f5f9] border-[#cbd5e1] text-amber-600 hover:bg-[#e2e8f0] hover:border-amber-600/60'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-amber-600" />
              )}
            </button>
          </div>

          {/* Brand Header */}
          <div className="flex flex-col items-center text-center gap-2.5 pt-1">
            {/* Avatar with glow and online ping */}
            <div className="relative inline-flex items-center justify-center">
              <img
                src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
                alt="My Learning Mascot"
                className="w-14 h-14 rounded-full border-2 border-[#f59e0b] object-cover bg-black shadow-[0_0_18px_rgba(245,158,11,0.3)]"
              />
              <span
                className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#22c55e] border-2 shadow-[0_0_8px_#22c55e] ${
                  theme === 'dark' ? 'border-[#140e09]' : 'border-white'
                }`}
              />
            </div>

            {/* Brand Titles */}
            <div className="flex flex-col items-center">
              <h1
                className={`text-base sm:text-lg font-black tracking-wider uppercase flex items-center justify-center gap-1.5 ${
                  theme === 'dark' ? 'text-white' : 'text-[#0f172a]'
                }`}
              >
                <span>MY LEARNING</span>
              </h1>
              <p
                className={`text-xs mt-0.5 font-medium ${
                  theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                }`}
              >
                SECURE ACCESS GATEWAY
              </p>
            </div>
          </div>

          {/* Portal Tabs: Admin Portal vs Student Access */}
          <div
            className={`p-1 rounded-2xl border grid grid-cols-2 gap-1 ${
              theme === 'dark'
                ? 'bg-[#1b130c] border-[#2c1d12]'
                : 'bg-[#f1f5f9] border-[#cbd5e1]'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? theme === 'dark'
                    ? 'bg-[#140e09] text-[#f59e0b] border border-amber-500/20 shadow-sm'
                    : 'bg-white text-[#d97706] border border-amber-600/20 shadow-sm'
                  : theme === 'dark'
                  ? 'text-[#8e7d70] hover:text-[#f3ece4]'
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'student'
                  ? theme === 'dark'
                    ? 'bg-[#140e09] text-[#f59e0b] border border-amber-500/20 shadow-sm'
                    : 'bg-white text-[#d97706] border border-amber-600/20 shadow-sm'
                  : theme === 'dark'
                  ? 'text-[#8e7d70] hover:text-[#f3ece4]'
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Access</span>
            </button>
          </div>

          {/* TAB 1: ADMIN PORTAL */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="flex flex-col gap-3.5 animate-fadeIn">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span
                    className={`flex items-center gap-1.5 ${
                      theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                    }`}
                  >
                    <KeyRound className="w-3 h-3 text-[#f59e0b]" />
                    <span>ADMIN MASTER KEY</span>
                  </span>
                  <span className="text-[10px] text-[#f59e0b] font-mono uppercase tracking-wider">
                    REQUIRED
                  </span>
                </div>

                <div
                  className={`relative flex items-center rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-[#1b130c] border-[#2c1d12] focus-within:border-[#f59e0b] focus-within:ring-2 focus-within:ring-[#f59e0b]/20'
                      : 'bg-[#f1f5f9] border-[#cbd5e1] focus-within:border-[#d97706] focus-within:ring-2 focus-within:ring-[#d97706]/20'
                  }`}
                >
                  <Lock
                    className={`absolute left-3 w-4 h-4 pointer-events-none ${
                      theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                    }`}
                  />
                  <input
                    ref={adminInputRef}
                    id="admin-master-password"
                    name="password"
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter master password"
                    className="w-full h-11 pl-9 pr-10 bg-transparent text-sm font-mono focus:outline-none placeholder:text-neutral-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                    className={`absolute right-3 p-1 rounded-md transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'text-[#8e7d70] hover:text-[#f3ece4]'
                        : 'text-[#64748b] hover:text-[#1e293b]'
                    }`}
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="admin-login-submit-btn"
                disabled={isSubmitting || !adminPassword.trim()}
                className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-[#f59e0b] hover:bg-[#fbbf24] active:bg-[#d97706] text-black shadow-amber-500/20'
                    : 'bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] text-white shadow-amber-600/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Master Key...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    <span>Authenticate & Enter</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: STUDENT PORTAL */}
          {activeTab === 'student' && (
            <div className="flex flex-col gap-3.5 animate-fadeIn">
              {/* Student Submode Switch */}
              <div
                className={`p-1 rounded-xl border flex items-center gap-1 ${
                  theme === 'dark'
                    ? 'bg-[#1b130c] border-[#2c1d12]'
                    : 'bg-[#f1f5f9] border-[#cbd5e1]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStudentSubmode('code');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    studentSubmode === 'code'
                      ? theme === 'dark'
                        ? 'bg-[#140e09] text-white border border-amber-500/20 shadow-xs'
                        : 'bg-white text-[#0f172a] border border-amber-600/20 shadow-xs'
                      : theme === 'dark'
                      ? 'text-[#8e7d70] hover:text-[#f3ece4]'
                      : 'text-[#64748b] hover:text-[#1e293b]'
                  }`}
                >
                  <Lock className="w-3 h-3 text-[#f59e0b]" />
                  <span>Access Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudentSubmode('account');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    studentSubmode === 'account'
                      ? theme === 'dark'
                        ? 'bg-[#140e09] text-white border border-amber-500/20 shadow-xs'
                        : 'bg-white text-[#0f172a] border border-amber-600/20 shadow-xs'
                      : theme === 'dark'
                      ? 'text-[#8e7d70] hover:text-[#f3ece4]'
                      : 'text-[#64748b] hover:text-[#1e293b]'
                  }`}
                >
                  <User className="w-3 h-3 text-[#f59e0b]" />
                  <span>User Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudentSubmode('manage');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    studentSubmode === 'manage'
                      ? theme === 'dark'
                        ? 'bg-[#140e09] text-white border border-amber-500/20 shadow-xs'
                        : 'bg-white text-[#0f172a] border border-amber-600/20 shadow-xs'
                      : theme === 'dark'
                      ? 'text-[#8e7d70] hover:text-[#f3ece4]'
                      : 'text-[#64748b] hover:text-[#1e293b]'
                  }`}
                >
                  <PlusCircle className="w-3 h-3 text-[#f59e0b]" />
                  <span>Codes ({codesList.length})</span>
                </button>
              </div>

              {/* Submode 1: Student Access Code Input */}
              {studentSubmode === 'code' && (
                <form onSubmit={handleStudentCodeSubmit} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span
                        className={`flex items-center gap-1.5 ${
                          theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                        }`}
                      >
                        <GraduationCap className="w-3 h-3 text-[#f59e0b]" />
                        <span>STUDENT ACCESS CODE</span>
                      </span>
                      <span className="text-[10px] text-[#f59e0b] font-mono uppercase tracking-wider">
                        E.G. ST-2025
                      </span>
                    </div>

                    <div
                      className={`relative flex items-center rounded-xl border transition-all ${
                        theme === 'dark'
                          ? 'bg-[#1b130c] border-[#2c1d12] focus-within:border-[#f59e0b] focus-within:ring-2 focus-within:ring-[#f59e0b]/20'
                          : 'bg-[#f1f5f9] border-[#cbd5e1] focus-within:border-[#d97706] focus-within:ring-2 focus-within:ring-[#d97706]/20'
                      }`}
                    >
                      <Lock
                        className={`absolute left-3 w-4 h-4 pointer-events-none ${
                          theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                        }`}
                      />
                      <input
                        ref={accessCodeInputRef}
                        id="student-access-code"
                        name="accessCode"
                        type="text"
                        maxLength={7}
                        required
                        value={accessCode}
                        onChange={handleAccessCodeChange}
                        placeholder="ST-2025"
                        className="w-full h-11 pl-9 pr-4 bg-transparent text-sm font-mono tracking-widest uppercase focus:outline-none placeholder:text-neutral-500"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="student-code-submit-btn"
                    disabled={isSubmitting || !accessCode.trim()}
                    className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      theme === 'dark'
                        ? 'bg-[#f59e0b] hover:bg-[#fbbf24] active:bg-[#d97706] text-black shadow-amber-500/20'
                        : 'bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] text-white shadow-amber-600/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4" />
                        <span>Enter Student Portal</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>

                  {/* Quick sample chips */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span
                      className={`text-[10px] font-medium ${
                        theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                      }`}
                    >
                      Quick Fill:
                    </span>
                    {codesList.slice(0, 2).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleUseCode(item.code)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-[#1b130c] border-[#2c1d12] text-amber-400 hover:border-amber-500/50'
                            : 'bg-[#f1f5f9] border-[#cbd5e1] text-amber-700 hover:border-amber-600/50'
                        }`}
                      >
                        {item.code}
                      </button>
                    ))}
                  </div>
                </form>
              )}

              {/* Submode 2: Student Account (Username & Password) */}
              {studentSubmode === 'account' && (
                <form onSubmit={handleStudentAccountSubmit} className="flex flex-col gap-3">
                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="student-username"
                      className={`text-[11px] font-bold flex items-center justify-between ${
                        theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-[#f59e0b]" />
                        <span>STUDENT USERNAME / ID</span>
                      </span>
                    </label>
                    <div
                      className={`relative flex items-center rounded-xl border transition-all ${
                        theme === 'dark'
                          ? 'bg-[#1b130c] border-[#2c1d12] focus-within:border-[#f59e0b] focus-within:ring-2 focus-within:ring-[#f59e0b]/20'
                          : 'bg-[#f1f5f9] border-[#cbd5e1] focus-within:border-[#d97706] focus-within:ring-2 focus-within:ring-[#d97706]/20'
                      }`}
                    >
                      <User
                        className={`absolute left-3 w-4 h-4 pointer-events-none ${
                          theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                        }`}
                      />
                      <input
                        ref={studentUserInputRef}
                        id="student-username"
                        name="username"
                        type="text"
                        required
                        value={studentUsername}
                        onChange={(e) => {
                          setStudentUsername(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. friend1 or student"
                        className="w-full h-11 pl-9 pr-4 bg-transparent text-sm font-mono focus:outline-none placeholder:text-neutral-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="student-password"
                      className={`text-[11px] font-bold flex items-center justify-between ${
                        theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-[#f59e0b]" />
                        <span>PASSWORD</span>
                      </span>
                    </label>
                    <div
                      className={`relative flex items-center rounded-xl border transition-all ${
                        theme === 'dark'
                          ? 'bg-[#1b130c] border-[#2c1d12] focus-within:border-[#f59e0b] focus-within:ring-2 focus-within:ring-[#f59e0b]/20'
                          : 'bg-[#f1f5f9] border-[#cbd5e1] focus-within:border-[#d97706] focus-within:ring-2 focus-within:ring-[#d97706]/20'
                      }`}
                    >
                      <Lock
                        className={`absolute left-3 w-4 h-4 pointer-events-none ${
                          theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                        }`}
                      />
                      <input
                        id="student-password"
                        name="password"
                        type={showStudentPassword ? 'text' : 'password'}
                        required
                        value={studentPassword}
                        onChange={(e) => {
                          setStudentPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="••••••••••••"
                        className="w-full h-11 pl-9 pr-10 bg-transparent text-sm font-mono focus:outline-none placeholder:text-neutral-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        aria-label={showStudentPassword ? 'Hide password' : 'Show password'}
                        className={`absolute right-3 p-1 rounded-md transition-colors cursor-pointer ${
                          theme === 'dark'
                            ? 'text-[#8e7d70] hover:text-[#f3ece4]'
                            : 'text-[#64748b] hover:text-[#1e293b]'
                        }`}
                      >
                        {showStudentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !studentUsername.trim() || !studentPassword.trim()}
                    className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1 ${
                      theme === 'dark'
                        ? 'bg-[#f59e0b] hover:bg-[#fbbf24] active:bg-[#d97706] text-black shadow-amber-500/20'
                        : 'bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] text-white shadow-amber-600/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4" />
                        <span>Sign In as Student</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Submode 3: Student Access Codes Manager */}
              {studentSubmode === 'manage' && (
                <div className="flex flex-col gap-3">
                  {/* Top Header / Add Button */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold ${
                        theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                      }`}
                    >
                      ACTIVE STUDENT PASSES
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCode(!isAddingCode)}
                      className={`text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        theme === 'dark'
                          ? 'text-[#f59e0b] hover:text-[#fbbf24]'
                          : 'text-[#d97706] hover:text-[#b45309]'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{isAddingCode ? 'Cancel' : 'Generate Code'}</span>
                    </button>
                  </div>

                  {/* Add New Code Expandable Form */}
                  {isAddingCode && (
                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-2.5 animate-fadeIn ${
                        theme === 'dark'
                          ? 'bg-[#1b130c] border-[#2c1d12]'
                          : 'bg-[#f1f5f9] border-[#cbd5e1]'
                      }`}
                    >
                      <label
                        className={`text-[10px] font-bold ${
                          theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                        }`}
                      >
                        STUDENT NAME OR LABEL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCodeLabel}
                          onChange={(e) => setNewCodeLabel(e.target.value)}
                          placeholder="e.g. Study Group / Alex"
                          className={`flex-1 h-9 px-3 rounded-lg border text-xs focus:outline-none ${
                            theme === 'dark'
                              ? 'bg-[#140e09] border-[#2c1d12] text-white focus:border-[#f59e0b]'
                              : 'bg-white border-[#cbd5e1] text-neutral-900 focus:border-[#d97706]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleCreateNewCode}
                          className={`px-3 h-9 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            theme === 'dark'
                              ? 'bg-[#f59e0b] hover:bg-[#fbbf24] text-black'
                              : 'bg-[#d97706] hover:bg-[#b45309] text-white'
                          }`}
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Create</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Codes List */}
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                    {codesList.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          theme === 'dark'
                            ? 'bg-[#1b130c] border-[#2c1d12] hover:border-amber-500/40'
                            : 'bg-[#f1f5f9] border-[#cbd5e1] hover:border-amber-600/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-1 rounded-md border ${
                              theme === 'dark'
                                ? 'bg-[#140e09] border-amber-500/30 text-amber-400'
                                : 'bg-white border-amber-600/30 text-amber-700'
                            }`}
                          >
                            {item.code}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span
                              className={`text-xs font-semibold truncate ${
                                theme === 'dark' ? 'text-[#f3ece4]' : 'text-[#1e293b]'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                              Active Pass
                            </span>
                          </div>
                        </div>

                        {/* Action buttons: Use, Copy, Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUseCode(item.code)}
                            title="Fill in form"
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              theme === 'dark'
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 border border-amber-600/30'
                            }`}
                          >
                            Use
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(item.code, item.id)}
                            title="Copy code"
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              theme === 'dark'
                                ? 'border-[#2c1d12] text-[#8e7d70] hover:text-[#f3ece4] hover:bg-[#261b11]'
                                : 'border-[#cbd5e1] text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0]'
                            }`}
                          >
                            {copiedCodeId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {codesList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCode(item.id)}
                              title="Delete code"
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                theme === 'dark'
                                  ? 'border-[#2c1d12] text-[#8e7d70] hover:text-rose-400 hover:bg-[#261b11]'
                                  : 'border-[#cbd5e1] text-[#64748b] hover:text-rose-600 hover:bg-[#e2e8f0]'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Public Free Study Links (No login required) */}
          <div
            className={`pt-3 border-t flex flex-col gap-2 ${
              theme === 'dark' ? 'border-[#2c1d12]' : 'border-[#cbd5e1]'
            }`}
          >
            <div
              className={`text-[10px] font-mono text-center uppercase tracking-wider ${
                theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
              }`}
            >
              Free Study · No Login Needed
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/read"
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-[#1b130c] hover:bg-[#261b11] border-[#2c1d12] hover:border-amber-500/40 text-neutral-200'
                    : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] border-[#cbd5e1] hover:border-amber-600/40 text-neutral-800'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#f59e0b] mb-1" />
                <span className={theme === 'dark' ? 'text-white' : 'text-neutral-900'}>
                  Read & Listen
                </span>
                <span
                  className={`text-[9px] ${
                    theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                  }`}
                >
                  PDF & Multi-Voice
                </span>
              </Link>

              <Link
                to="/practice"
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-[#1b130c] hover:bg-[#261b11] border-[#2c1d12] hover:border-amber-500/40 text-neutral-200'
                    : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] border-[#cbd5e1] hover:border-amber-600/40 text-neutral-800'
                }`}
              >
                <Keyboard className="w-4 h-4 text-[#f59e0b] mb-1" />
                <span className={theme === 'dark' ? 'text-white' : 'text-neutral-900'}>
                  Typing Trainer
                </span>
                <span
                  className={`text-[9px] ${
                    theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
                  }`}
                >
                  Ryan UK Audio
                </span>
              </Link>
            </div>

            {/* Google Drive Connect Shortcut */}
            <Link
              to="/read"
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Connect & Read from Google Drive</span>
            </Link>
          </div>

          {/* Bottom Tagline */}
          <div
            className={`pt-3 border-t text-center ${
              theme === 'dark' ? 'border-[#2c1d12]' : 'border-[#cbd5e1]'
            }`}
          >
            <p
              className={`text-xs font-mono italic ${
                theme === 'dark' ? 'text-[#8e7d70]' : 'text-[#64748b]'
              }`}
            >
              “I learn by typing.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
