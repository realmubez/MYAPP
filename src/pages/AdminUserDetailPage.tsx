import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Key,
  Edit3,
  Power,
  Keyboard,
  Sparkles,
  Calendar,
  Lock,
} from 'lucide-react';
import { SubjectId } from '../types';

const ALL_SUBJECTS: { id: SubjectId; label: string }[] = [
  { id: 'swedish', label: 'Swedish (Svenska)' },
  { id: 'english', label: 'English Essentials' },
  { id: 'python', label: 'Python 3 Mastery' },
  { id: 'typing', label: 'Touch Typing 30-Day' },
];

export function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password reset modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Subject assignment modal state
  const [isEditSubjectsOpen, setIsEditSubjectsOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>([]);
  const [isSavingSubjects, setIsSavingSubjects] = useState(false);

  const fetchUserDossier = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to fetch student dossier');
      }
      setUserData(data.user);
      setSelectedSubjects(data.user.assignedSubjects || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading user data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDossier();
  }, [fetchUserDossier]);

  const handleToggleStatus = async () => {
    if (!userData) return;
    const nextStatus = userData.account_status === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userData.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to update status');

      setSuccessMsg(`Account status updated to ${nextStatus}`);
      setUserData((prev: any) => ({ ...prev, account_status: nextStatus }));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update status');
    }
  };

  const handleSaveSubjects = async () => {
    if (!userData) return;
    setIsSavingSubjects(true);
    try {
      const res = await fetch(`/api/admin/users/${userData.id}/subjects`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ subjects: selectedSubjects }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to update subjects');

      setSuccessMsg('Assigned curriculum updated');
      setUserData((prev: any) => ({ ...prev, assignedSubjects: selectedSubjects }));
      setIsEditSubjectsOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update curriculum');
    } finally {
      setIsSavingSubjects(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userData || !newPassword.trim()) return;
    setIsResetting(true);
    try {
      const res = await fetch(`/api/admin/users/${userData.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccessMsg('Password updated successfully');
      setIsResetOpen(false);
      setNewPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-spin">
          &gt;_
        </div>
        <p className="mt-4 text-xs font-mono text-neutral-500">LOADING STUDENT DOSSIER...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="space-y-4 py-12">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Center</span>
        </button>
        <div className="p-6 rounded-2xl bg-[#12100e] border border-neutral-800 text-center text-neutral-400 text-sm">
          User record could not be found.
        </div>
      </div>
    );
  }

  const completedLessons = (userData.lessons || []).filter((l: any) => l.completed);
  const mistakes = userData.mistakes || [];
  const activities = userData.activity || [];
  const typingStats = userData.typingStats || [];

  const totalStudySeconds = activities.reduce((acc: number, a: any) => acc + (Number(a.study_seconds) || 0), 0);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Center</span>
        </button>

        <div className="flex items-center gap-2">
          {userData.role !== 'admin' && (
            <>
              <button
                type="button"
                onClick={() => setIsResetOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditSubjectsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Curriculum</span>
              </button>

              <button
                type="button"
                onClick={handleToggleStatus}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  userData.account_status === 'active'
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-800/50'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{userData.account_status === 'active' ? 'Disable Account' : 'Enable Account'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}>✕</button>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}

      {/* Header Dossier Card */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#12100e] p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-2xl shadow-md">
              {userData.role === 'admin' ? '👑' : '🎓'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{userData.display_name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                  userData.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-neutral-800 text-neutral-300'
                }`}>
                  {userData.role.toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  userData.account_status === 'disabled'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {userData.account_status}
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-500 mt-1">
                ID: {userData.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-neutral-400 mr-1">Curriculum:</span>
            {(userData.assignedSubjects || []).map((sub: string) => (
              <span
                key={sub}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200 capitalize"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

        {/* Quick telemetry metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-800/80">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/60">
            <div className="text-[11px] text-neutral-400">Completed Lessons</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {completedLessons.length}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/60">
            <div className="text-[11px] text-neutral-400">Active Study Time</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {Math.round(totalStudySeconds / 60)} mins
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/60">
            <div className="text-[11px] text-neutral-400">Mistakes Tracked</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-0.5">
              {mistakes.length}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/60">
            <div className="text-[11px] text-neutral-400">Typing Days Reached</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {typingStats.length} / 30
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Progress Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Curriculum Mastery & Lesson History</span>
        </h2>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#12100e] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-800/80 bg-neutral-900/50 text-neutral-400 font-mono">
                <tr>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Lesson ID</th>
                  <th className="px-5 py-3 font-semibold text-center">Status</th>
                  <th className="px-5 py-3 font-semibold text-center">Best Accuracy</th>
                  <th className="px-5 py-3 font-semibold text-center">Best WPM</th>
                  <th className="px-5 py-3 font-semibold text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {(userData.lessons || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-neutral-500">
                      No lesson activity recorded for this student yet.
                    </td>
                  </tr>
                ) : (
                  userData.lessons.map((lesson: any) => (
                    <tr key={`${lesson.subject_id}_${lesson.lesson_id}`} className="hover:bg-neutral-900/30">
                      <td className="px-5 py-3.5 font-semibold text-white capitalize">
                        {lesson.subject_id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-neutral-300">
                        {lesson.lesson_id}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          lesson.completed
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        }`}>
                          {lesson.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono text-neutral-200">
                        {lesson.best_accuracy ? `${lesson.best_accuracy}%` : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono text-neutral-200">
                        {lesson.best_wpm || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-neutral-500 text-[11px]">
                        {lesson.last_activity_at ? new Date(lesson.last_activity_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review & Mistake History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Active Review Items & Identified Weak Points</span>
        </h2>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#12100e] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-800/80 bg-neutral-900/50 text-neutral-400 font-mono">
                <tr>
                  <th className="px-5 py-3 font-semibold">Target Word / Phrase</th>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold text-center">Mistakes</th>
                  <th className="px-5 py-3 font-semibold text-center">Mastery Score</th>
                  <th className="px-5 py-3 font-semibold text-right">Last Mistake Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {mistakes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-neutral-500">
                      No mistakes or review items currently logged.
                    </td>
                  </tr>
                ) : (
                  mistakes.map((m: any) => (
                    <tr key={m.id || m.item_key} className="hover:bg-neutral-900/30">
                      <td className="px-5 py-3.5 font-semibold text-neutral-100">
                        {m.target}
                      </td>
                      <td className="px-5 py-3.5 capitalize font-mono text-neutral-400">
                        {m.subject_id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-neutral-400 text-[11px]">
                        {m.mistake_type}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono text-red-400 font-bold">
                        {m.mistake_count}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono text-amber-300">
                        {m.mastery_score}%
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-neutral-500 text-[11px]">
                        {m.last_mistake_at ? new Date(m.last_mistake_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Password Reset */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#141210] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Reset Password: {userData.display_name}</span>
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">New Password</label>
              <input
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 px-3.5 rounded-xl bg-[#090807] border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500/80"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsResetOpen(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting || newPassword.length < 6}
                onClick={handleResetPassword}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase disabled:opacity-50"
              >
                {isResetting ? 'Saving...' : 'Set Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Subjects */}
      {isEditSubjectsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#141210] p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Assign Curriculum: {userData.display_name}
            </h3>
            <div className="space-y-2">
              {ALL_SUBJECTS.map((sub) => {
                const isChecked = selectedSubjects.includes(sub.id);
                return (
                  <label
                    key={sub.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500/40 text-neutral-100'
                        : 'bg-neutral-900/40 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjects([...selectedSubjects, sub.id]);
                          } else {
                            setSelectedSubjects(selectedSubjects.filter((s) => s !== sub.id));
                          }
                        }}
                      />
                      <span className="font-medium">{sub.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsEditSubjectsOpen(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingSubjects}
                onClick={handleSaveSubjects}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase disabled:opacity-50"
              >
                {isSavingSubjects ? 'Saving...' : 'Save Curriculum'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
