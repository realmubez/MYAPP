import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile, SubjectId } from '../types';
import { DbProfile } from './types';
import { syncQueue } from './syncQueue';
import { syncManager } from './syncManager';
import { storageNamespace } from './storageNamespace';

export const PROFILE_STORAGE_KEY = 'profile';
export const PROFILE_UPDATED_EVENT = 'mylearning_profile_changed';

export const DEFAULT_ADMIN_PROFILE: UserProfile = {
  id: '25993506-b5e2-4432-8e4d-c97ddd818e09',
  displayName: 'Mubez',
  avatar: 'avatar-keyboard',
  role: 'admin',
  accountStatus: 'active',
  assignedSubjects: ['swedish', 'english', 'python', 'typing'] as SubjectId[],
  joinedAt: '2026-01-01T00:00:00.000Z',
};

class ProfileRepository {
  private cachedProfile: UserProfile | null = null;

  public clearCache(): void {
    this.cachedProfile = null;
  }

  /**
   * Switches the active user session, sets storage namespace, and clears caches.
   */
  public switchUserSession(user: {
    id: string;
    displayName: string;
    role?: 'admin' | 'student';
    accountStatus?: 'active' | 'disabled';
    assignedSubjects?: SubjectId[];
    avatar?: string;
  }): UserProfile {
    this.clearCache();
    storageNamespace.setActiveProfileId(user.id);

    const profile: UserProfile = {
      id: user.id,
      displayName: user.displayName,
      avatar: user.avatar || (user.role === 'admin' ? 'avatar-keyboard' : 'avatar-student'),
      role: user.role || 'student',
      accountStatus: user.accountStatus || 'active',
      assignedSubjects: Array.isArray(user.assignedSubjects) && user.assignedSubjects.length > 0
        ? user.assignedSubjects
        : (user.role === 'admin' ? ['swedish', 'english', 'python', 'typing'] : ['swedish', 'english']),
      joinedAt: new Date().toISOString(),
    };

    this.saveLocalProfile(profile);
    return profile;
  }

  /**
   * Reads the profile from memory, namespaced localStorage, or initializes defaults.
   */
  public getLocalProfile(): UserProfile {
    if (this.cachedProfile) {
      return this.cachedProfile;
    }

    if (typeof window === 'undefined') {
      return DEFAULT_ADMIN_PROFILE;
    }

    try {
      const raw = storageNamespace.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.displayName) {
          const profile: UserProfile = {
            id: String(parsed.id),
            displayName: String(parsed.displayName),
            avatar: String(parsed.avatar || DEFAULT_ADMIN_PROFILE.avatar),
            role: parsed.role === 'student' || parsed.role === 'member' ? (parsed.role as any) : 'admin',
            accountStatus: parsed.accountStatus || 'active',
            assignedSubjects: Array.isArray(parsed.assignedSubjects) && parsed.assignedSubjects.length > 0
              ? parsed.assignedSubjects
              : (['swedish', 'english', 'python', 'typing'] as SubjectId[]),
            joinedAt: parsed.joinedAt || DEFAULT_ADMIN_PROFILE.joinedAt,
          };
          this.cachedProfile = profile;
          return profile;
        }
      }
    } catch (err) {
      console.warn('Error reading profile from local storage:', err);
    }

    // Default for current active user
    const activeUid = storageNamespace.getActiveProfileId();
    const defaultProfile: UserProfile = activeUid === DEFAULT_ADMIN_PROFILE.id || activeUid === 'mubez'
      ? DEFAULT_ADMIN_PROFILE
      : {
          id: activeUid,
          displayName: 'Student',
          avatar: 'avatar-student',
          role: 'student',
          accountStatus: 'active',
          assignedSubjects: ['swedish', 'english'],
          joinedAt: new Date().toISOString(),
        };

    this.cachedProfile = defaultProfile;
    this.saveLocalProfile(defaultProfile);
    return defaultProfile;
  }

  public saveLocalProfile(profile: UserProfile): void {
    this.cachedProfile = profile;
    if (typeof window !== 'undefined') {
      try {
        storageNamespace.setActiveProfileId(profile.id);
        storageNamespace.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: profile }));
      } catch (err) {
        console.warn('Error saving profile to localStorage:', err);
      }
    }
  }

  /**
   * Loads the current user's profile from Supabase with assigned subjects.
   * If remote profile exists, updates local storage cleanly.
   */
  public async fetchRemoteProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !userId) return null;
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr || !profileRow) {
        return null;
      }

      // Fetch assigned subjects from profile_subjects table
      const { data: subjectsData } = await supabase
        .from('profile_subjects')
        .select('subject_id')
        .eq('profile_id', userId);

      const assignedSubjects: SubjectId[] = subjectsData && subjectsData.length > 0
        ? (subjectsData.map((s: any) => s.subject_id) as SubjectId[])
        : (['swedish', 'english', 'python', 'typing'] as SubjectId[]);

      const mergedProfile: UserProfile = {
        id: (profileRow as DbProfile).id,
        displayName: (profileRow as DbProfile).display_name,
        avatar: (profileRow as DbProfile).avatar || 'avatar-keyboard',
        role: (profileRow as DbProfile).role || 'student',
        accountStatus: (profileRow as DbProfile).account_status || 'active',
        assignedSubjects,
        joinedAt: (profileRow as DbProfile).created_at,
      };

      this.saveLocalProfile(mergedProfile);
      return mergedProfile;
    } catch (err) {
      console.warn('Failed to fetch remote profile:', err);
      return null;
    }
  }

  /**
   * Updates display name and/or avatar locally first, then queues Supabase sync.
   */
  public updateProfile(updates: Partial<Pick<UserProfile, 'displayName' | 'avatar' | 'assignedSubjects'>>): UserProfile {
    const current = this.getLocalProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
      displayName: updates.displayName?.trim() ? updates.displayName.trim() : current.displayName,
    };

    this.saveLocalProfile(updated);

    // Queue cloud sync
    if (isSupabaseConfigured()) {
      syncQueue.enqueue(
        'profiles',
        'upsert',
        {
          id: updated.id,
          display_name: updated.displayName,
          avatar: updated.avatar,
        },
        'id'
      );
      syncManager.scheduleSync(500);
    }

    return updated;
  }
}

export const profileRepository = new ProfileRepository();

