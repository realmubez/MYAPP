import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  UserPlus,
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Key,
  Edit3,
  Power,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  Sparkles,
  ChevronRight,
  Database,
} from 'lucide-react';
import { SubjectId } from '../types';

interface AdminUserSummary {
  id: string;
  displayName: string;
  role: 'admin' | 'student';
  accountStatus: 'active' | 'disabled';
  createdAt: string;
  lastActiveAt?: string;
  assignedSubjects: string[];
  stats: {
    completedLessons: number;
    totalStudyMinutes: number;
    activeDaysCount: number;
  };
}

interface OverviewStats {
  totalUsers: number;
  studentCount: number;
  activeStudents: number;
  completedLessons: number;
  totalStudySeconds: number;
  totalTypingSeconds: number;
  dbStatus: string;
}

const ALL_SUBJECTS: { id: SubjectId; label: string; tag: string }[] = [
  { id: 'swedish', label: 'Swedish (Svenska)', tag: 'Language' },
  { id: 'english', label: 'English Essentials', tag: 'Language' },
  { id: 'python', label: 'Python 3 Mastery', tag: 'Programming' },
  { id: 'typing', label: 'Touch Typing 30-Day', tag: 'Speed & Accuracy' },
];

export function AdminPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAssignedSubjects, setNewAssignedSubjects] = useState<SubjectId[]>(['swedish', 'english']);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Edit subjects modal state
  const [editingSubjectsUser, setEditingSubjectsUser] = useState<AdminUserSummary | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>([]);
  const [isSavingSubjects, setIsSavingSubjects] = useState(false);

  // Reset password modal state
  const [resettingPasswordUser, setResettingPasswordUser] = useState<AdminUserSummary | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const navigate = useNavigate();

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [overviewRes, usersRes] = await Promise.all([
        fetch('/api/admin/overview', { headers: { Accept: 'application/json' } }),
        fetch('/api/admin/users', { headers: { Accept: 'application/json' } }),
      ]);

      if (!overviewRes.ok || !usersRes.ok) {
        throw new Error('Failed to load admin telemetry data');
      }

      const overviewData = await overviewRes.json();
      const usersData = await usersRes.json();

      if (overviewData.ok && overviewData.stats) {
        setStats(overviewData.stats);
      }
      if (usersData.ok && Array.isArray(usersData.users)) {
        setUsers(usersData.users);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to Admin Management Service');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newDisplayName.trim() || !newPassword.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsCreatingUser(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          displayName: newDisplayName.trim(),
          password: newPassword.trim(),
          assignedSubjects: newAssignedSubjects,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to create student user');
      }

      setSuccessMsg(`Student account "${newDisplayName}" created successfully.`);
      setIsCreateModalOpen(false);
      setNewUsername('');
      setNewDisplayName('');
      setNewPassword('');
      setNewAssignedSubjects(['swedish', 'english']);
      await fetchAdminData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleAccountStatus = async (user: AdminUserSummary) => {
    const nextStatus = user.accountStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update account status');
      }

      setSuccessMsg(`Account for "${user.displayName}" set to ${nextStatus}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, accountStatus: nextStatus } : u))
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update account status');
    }
  };

  const handleSaveAssignedSubjects = async () => {
    if (!editingSubjectsUser) return;
    setIsSavingSubjects(true);
    try {
      const res = await fetch(`/api/admin/users/${editingSubjectsUser.id}/subjects`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ subjects: selectedSubjects }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update assigned subjects');
      }

      setSuccessMsg(`Updated assigned curriculum for "${editingSubjectsUser.displayName}".`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingSubjectsUser.id ? { ...u, assignedSubjects: selectedSubjects } : u
        )
      );
      setEditingSubjectsUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update curriculum');
    } finally {
      setIsSavingSubjects(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resettingPasswordUser || !newResetPassword.trim()) return;
    setIsResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/users/${resettingPasswordUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ newPassword: newResetPassword.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccessMsg(`Password for "${resettingPasswordUser.displayName}" has been updated.`);
      setResettingPasswordUser(null);
      setNewResetPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.displayName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.role.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Admin Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-400/15 border border-amber-400/30 text-amber-400">
              MUBEZ OS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            Small Private Multi-User Management, Subject Assignments & Student Telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAdminData}
            title="Refresh telemetry"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            id="admin-create-user-btn"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white text-xs font-bold">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs font-bold">✕</button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-800/80 bg-[#12100e] p-4.5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Total Registered</span>
            <Users className="w-4 h-4 text-amber-400/80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats ? stats.totalUsers : users.length || 1}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              ({stats ? stats.studentCount : users.filter((u) => u.role === 'student').length} students)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#12100e] p-4.5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Active Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {stats ? stats.activeStudents + 1 : users.filter((u) => u.accountStatus !== 'disabled').length}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">operational</span>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#12100e] p-4.5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Completed Lessons</span>
            <BookOpen className="w-4 h-4 text-amber-400/80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats ? stats.completedLessons : users.reduce((acc, u) => acc + (u.stats?.completedLessons || 0), 0)}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">across all users</span>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#12100e] p-4.5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Total Study Time</span>
            <Clock className="w-4 h-4 text-amber-400/80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {stats ? Math.round(stats.totalStudySeconds / 60) : 0}m
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">logged</span>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Managed User Accounts</span>
              <span className="text-xs font-mono font-normal text-neutral-400">
                ({filteredUsers.length})
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Private access control. Only users registered here can log into MY LEARNING.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by name or role..."
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-[#12100e] border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* User Table / Cards */}
        <div className="rounded-2xl border border-neutral-800/80 bg-[#12100e] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-800/80 bg-neutral-900/50 text-neutral-400 font-mono">
                <tr>
                  <th className="px-5 py-3 font-semibold">User / Identity</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Assigned Subjects</th>
                  <th className="px-5 py-3 font-semibold text-center">Progress</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-neutral-500">
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isMubezAdmin = user.role === 'admin';

                    return (
                      <tr key={user.id} className="hover:bg-neutral-900/30 transition-colors">
                        {/* User Identity */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
                              isMubezAdmin
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                                : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'
                            }`}>
                              {isMubezAdmin ? '👑' : '🎓'}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{user.displayName}</span>
                                {isMubezAdmin && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-400 font-mono">
                                    Owner
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-400 font-mono">
                                {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold uppercase ${
                            isMubezAdmin
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            user.accountStatus === 'disabled'
                              ? 'bg-red-950/50 text-red-400 border border-red-800/50'
                              : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${user.accountStatus === 'disabled' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                            <span className="capitalize">{user.accountStatus}</span>
                          </span>
                        </td>

                        {/* Assigned Subjects */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                            {user.assignedSubjects && user.assignedSubjects.length > 0 ? (
                              user.assignedSubjects.map((subId) => (
                                <span
                                  key={subId}
                                  className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300 capitalize"
                                >
                                  {subId}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-neutral-500 italic">None</span>
                            )}
                            {!isMubezAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSubjectsUser(user);
                                  setSelectedSubjects((user.assignedSubjects as SubjectId[]) || []);
                                }}
                                title="Edit assigned subjects"
                                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Progress */}
                        <td className="px-5 py-4 text-center">
                          <div className="font-mono text-neutral-200 font-semibold">
                            {user.stats?.completedLessons || 0} lessons
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            {user.stats?.totalStudyMinutes || 0} mins logged
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Dossier */}
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                              title="View full learning dossier"
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Dossier</span>
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                            </button>

                            {/* Reset Password (students only) */}
                            {!isMubezAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setResettingPasswordUser(user);
                                  setNewResetPassword('');
                                }}
                                title="Reset student password"
                                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Enable / Disable toggle */}
                            {!isMubezAdmin && (
                              <button
                                type="button"
                                onClick={() => handleToggleAccountStatus(user)}
                                title={user.accountStatus === 'active' ? 'Disable student access' : 'Enable student access'}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  user.accountStatus === 'active'
                                    ? 'bg-neutral-900 hover:bg-red-950/40 border-neutral-800 hover:border-red-800/60 text-neutral-400 hover:text-red-400'
                                    : 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-800/60 text-emerald-400'
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Architecture & Security Audit Summary */}
      <div className="rounded-2xl border border-neutral-800/80 bg-[#12100e] p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm">
          <Database className="w-4 h-4 text-amber-400" />
          <span>System Security & Data Isolation Architecture</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-400">
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/60 space-y-1">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Tenant Local Isolation</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Storage is namespaced per user (`mylearning:uid:key`). Students on shared devices cannot access Admin progress.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/60 space-y-1">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Row-Level Security</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              RLS strictly enforces `auth.uid() = profile_id`. Students cannot read or write any other user's cloud progress.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/60 space-y-1">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Server-Authoritative User Admin</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Creation, subject assignment, and password resets occur exclusively via secure server APIs with zero service-role keys in the browser.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Create Student Account */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#141210] p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Add New Student</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Username / ID</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. friend1"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#090807] border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500/80"
                />
                <p className="text-[10px] text-neutral-500 font-mono">
                  Login username. Alphanumeric only.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Display Name</label>
                <input
                  type="text"
                  required
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#090807] border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500/80"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#090807] border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500/80"
                />
                <p className="text-[10px] text-neutral-500 font-mono">Minimum 6 characters.</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <label className="text-xs font-semibold text-neutral-300">Assigned Curriculum</label>
                <div className="grid grid-cols-1 gap-2">
                  {ALL_SUBJECTS.map((sub) => {
                    const isChecked = newAssignedSubjects.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/40 text-neutral-100'
                            : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAssignedSubjects([...newAssignedSubjects, sub.id]);
                              } else {
                                setNewAssignedSubjects(newAssignedSubjects.filter((s) => s !== sub.id));
                              }
                            }}
                            className="rounded border-neutral-700 text-amber-500 focus:ring-0"
                          />
                          <span className="font-medium">{sub.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500">{sub.tag}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingUser ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Assigned Subjects */}
      {editingSubjectsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#141210] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Edit Curriculum: {editingSubjectsUser.displayName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSubjectsUser(null)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-400">
                Choose which subjects this student can access. Existing learning data is preserved even if a subject is unassigned.
              </p>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {ALL_SUBJECTS.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/40 text-neutral-100'
                          : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
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
                          className="rounded border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <span className="font-semibold">{sub.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">{sub.tag}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingSubjectsUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingSubjects}
                onClick={handleSaveAssignedSubjects}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isSavingSubjects ? 'Saving...' : 'Save Curriculum'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reset Student Password */}
      {resettingPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#141210] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Reset Password: {resettingPasswordUser.displayName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setResettingPasswordUser(null)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-neutral-400">
                Enter a new password for {resettingPasswordUser.displayName}. The student can immediately use this new password on their next login.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#090807] border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500/80"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setResettingPasswordUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResettingPassword || !newResetPassword.trim() || newResetPassword.length < 6}
                onClick={handleResetPassword}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isResettingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
