import { UserProfile, SubjectId } from '../types';
import { profileRepository, PROFILE_STORAGE_KEY, PROFILE_UPDATED_EVENT } from '../repositories/profileRepository';

export { PROFILE_STORAGE_KEY, PROFILE_UPDATED_EVENT };

/**
 * Built-in avatar identifiers and their visual metadata
 */
export interface AvatarOption {
  id: string;
  label: string;
  emoji: string;
  bgColor: string;
}

export const BUILT_IN_AVATARS: AvatarOption[] = [
  { id: 'avatar-keyboard', label: 'Typist', emoji: '⌨️', bgColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'avatar-student', label: 'Learner', emoji: '🎓', bgColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'avatar-book', label: 'Scholar', emoji: '📚', bgColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { id: 'avatar-sparkles', label: 'Focus', emoji: '✨', bgColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'avatar-crown', label: 'Admin', emoji: '👑', bgColor: 'bg-amber-500/25 text-amber-400 border-amber-500/50' },
  { id: 'avatar-rocket', label: 'Builder', emoji: '🚀', bgColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
];

class ProfileService {
  public getCurrentProfile(): UserProfile {
    return profileRepository.getLocalProfile();
  }

  public updateProfile(updates: Partial<Pick<UserProfile, 'displayName' | 'avatar' | 'assignedSubjects'>>): UserProfile {
    return profileRepository.updateProfile(updates);
  }

  public isAdmin(profile?: UserProfile): boolean {
    const p = profile || this.getCurrentProfile();
    return p.role === 'admin';
  }

  public async fetchRemoteProfile(userId: string): Promise<UserProfile | null> {
    return profileRepository.fetchRemoteProfile(userId);
  }
}

export const profileService = new ProfileService();
