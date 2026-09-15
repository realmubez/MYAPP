import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Clock,
  Zap,
  BookOpen,
  Target,
  ChevronRight,
  Edit2,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useProgress } from '../hooks/useProgress';
import { getAssignedSubjectDefinitions } from '../services/subjectRegistry';
import { BUILT_IN_AVATARS, AvatarOption } from '../services/profileService';
import { SwedishFlagIcon, BritishFlagIcon, PythonLogoIcon } from '../components/common/FlagIcons';
import { SubjectId } from '../types';

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile, isAdmin } = useProfile();
  const { progress, stats } = useProgress();

  const [isEditing, setIsEditing] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(profile.displayName);
  const [selectedAvatarId, setSelectedAvatarId] = useState(profile.avatar);

  // Real existing statistics
  const currentStreak = progress?.streak?.currentStreak ?? stats.streakDays ?? 0;
  const totalStudySeconds = progress?.overall?.totalTimeSeconds ?? 0;
  const totalStudyMinutes = Math.round(totalStudySeconds / 60);
  const totalLessonsDone = progress?.overall?.totalLessonsCompleted ?? 0;
  const averageAccuracy = progress?.overall?.averageAccuracy ?? stats.averageAccuracy ?? 0;

  // Format study time cleanly
  const formattedStudyTime = totalStudyMinutes >= 60
    ? `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`
    : `${totalStudyMinutes} min`;

  // Assigned subjects resolved through registry
  const assignedDefinitions = getAssignedSubjectDefinitions(profile.assignedSubjects);

  // Helper to find selected avatar details
  const currentAvatar = BUILT_IN_AVATARS.find((a) => a.id === profile.avatar) || BUILT_IN_AVATARS[0];

  const handleStartEdit = () => {
    setDisplayNameInput(profile.displayName);
    setSelectedAvatarId(profile.avatar);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDisplayNameInput(profile.displayName);
    setSelectedAvatarId(profile.avatar);
    setIsEditing(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayNameInput.trim()) return;
    updateProfile({
      displayName: displayNameInput.trim(),
      avatar: selectedAvatarId,
    });
    setIsEditing(false);
  };

  const renderSubjectIcon = (subId: SubjectId) => {
    switch (subId) {
      case 'swedish':
        return <SwedishFlagIcon size={32} className="shrink-0" />;
      case 'english':
        return <BritishFlagIcon size={32} className="shrink-0" />;
      case 'python':
        return <PythonLogoIcon size={32} className="shrink-0" />;
      case 'typing':
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm shrink-0">
            ⌨️
          </div>
        );
    }
  };

  return (
    <div
      id="profile-page-container"
      className="w-full max-w-3xl lg:max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-24 lg:pb-16 text-neutral-100"
    >
      {/* 1. Page Header with Back Button */}
      <div className="flex items-center justify-between pt-1 sm:pt-2">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            id="profile-back-btn"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-[#141210] text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              Profile
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Personal learning profile and preferences
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            id="profile-edit-trigger-btn"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 text-xs font-semibold transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* 2. Top Profile Hero Card (Avatar, Name, Role Badge) */}
      <div
        id="profile-header-card"
        className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-5 sm:p-6 shadow-sm"
      >
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center gap-4 sm:gap-5">
          {/* Avatar Icon */}
          <div
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-inner ${currentAvatar.bgColor}`}
          >
            {currentAvatar.emoji}
          </div>

          {/* Name, Role & Status */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                {profile.displayName}
              </h2>
              {/* ADMIN Badge */}
              <span
                id="profile-role-badge"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40"
              >
                <Shield className="w-3 h-3" />
                <span>{isAdmin ? 'ADMIN' : 'MEMBER'}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400">
              Personal Learning OS · Active Learner
            </p>
          </div>
        </div>

        {/* Inline Edit Form */}
        {isEditing && (
          <form
            onSubmit={handleSaveEdit}
            className="mt-5 pt-5 border-t border-neutral-800/80 space-y-4"
          >
            <div>
              <label
                htmlFor="profile-displayname-input"
                className="block text-xs font-semibold text-neutral-300 mb-1.5"
              >
                Display Name
              </label>
              <input
                id="profile-displayname-input"
                type="text"
                maxLength={30}
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                placeholder="Enter display name"
                className="w-full sm:max-w-md px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <span className="block text-xs font-semibold text-neutral-300 mb-2">
                Choose Avatar
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                {BUILT_IN_AVATARS.map((av: AvatarOption) => {
                  const isSelected = selectedAvatarId === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatarId(av.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-amber-300 scale-102 shadow-sm'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-2xl">{av.emoji}</span>
                      <span className="text-[10px] font-medium">{av.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="submit"
                id="profile-save-btn"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
              <button
                type="button"
                id="profile-cancel-btn"
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. LEARNING OVERVIEW (Real existing stats) */}
      <section id="profile-section-overview" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
            Learning Overview
          </span>
          <span className="text-xs text-neutral-500">Tracked stats</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Card 1: Streak */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-400">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold text-neutral-300">Streak</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
            <p className="text-[10px] text-neutral-500">
              {currentStreak > 0 ? 'Consistent practice' : 'Start a streak today'}
            </p>
          </div>

          {/* Card 2: Total Study Time */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold text-neutral-300">Study Time</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">
              {formattedStudyTime}
            </p>
            <p className="text-[10px] text-neutral-500">
              Across all exercises
            </p>
          </div>

          {/* Card 3: Lessons Completed */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-sky-400">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-semibold text-neutral-300">Lessons</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">
              {totalLessonsDone}
            </p>
            <p className="text-[10px] text-neutral-500">
              Completed units
            </p>
          </div>

          {/* Card 4: Average Accuracy */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-rose-400">
              <Target className="w-4 h-4" />
              <span className="text-xs font-semibold text-neutral-300">Accuracy</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">
              {averageAccuracy > 0 ? `${averageAccuracy}%` : '—'}
            </p>
            <p className="text-[10px] text-neutral-500">
              Typing precision
            </p>
          </div>
        </div>
      </section>

      {/* 4. MY SUBJECTS (Dynamic Registry-Based & Assigned to Profile) */}
      <section id="profile-section-subjects" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
            My Subjects
          </span>
          <span className="text-xs text-neutral-500">
            {assignedDefinitions.length} assigned
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] divide-y divide-neutral-800/80 overflow-hidden shadow-sm">
          {assignedDefinitions.map((subDef) => {
            const subProgress = progress?.subjects?.[subDef.id];
            const percent = subProgress?.percentComplete ?? 0;
            const completed = subProgress?.completedLessons ?? 0;
            const total = subProgress?.totalLessons ?? 0;

            return (
              <Link
                key={subDef.id}
                to={subDef.route}
                id={`profile-subject-row-${subDef.id}`}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3.5 hover:bg-neutral-900/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {renderSubjectIcon(subDef.id)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                        {subDef.name}
                      </p>
                      {subDef.nativeName && (
                        <span className="text-[11px] text-neutral-500 hidden sm:inline">
                          · {subDef.nativeName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate">
                      {subDef.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-bold font-mono text-amber-400">
                      {percent}%
                    </span>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {completed}/{total} lessons
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. ACCOUNT SECTION (Role & Administration Status) */}
      <section id="profile-section-account" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
            Account
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-white">Role</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-neutral-800 text-amber-400 border border-neutral-700">
                  {isAdmin ? 'Admin' : 'Member'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {isAdmin
                  ? 'Administrator of this learning space'
                  : 'Member of this learning space'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <p className="text-xs text-neutral-400">
              Want to adjust learning sounds, translations, or Telegram?
            </p>
            <Link
              to="/settings"
              id="profile-go-to-settings-btn"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors self-start sm:self-auto"
            >
              <span>Learning Settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
