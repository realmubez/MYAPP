import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { profileService, PROFILE_UPDATED_EVENT } from '../services/profileService';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => profileService.getCurrentProfile());

  useEffect(() => {
    const handleProfileChange = (event: Event) => {
      const custom = event as CustomEvent<UserProfile>;
      if (custom.detail) {
        setProfile(custom.detail);
      } else {
        setProfile(profileService.getCurrentProfile());
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileChange);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileChange);
    };
  }, []);

  const updateProfile = (updates: Partial<Pick<UserProfile, 'displayName' | 'avatar' | 'assignedSubjects'>>) => {
    const updated = profileService.updateProfile(updates);
    setProfile(updated);
    return updated;
  };

  return {
    profile,
    updateProfile,
    isAdmin: profileService.isAdmin(profile),
  };
}
