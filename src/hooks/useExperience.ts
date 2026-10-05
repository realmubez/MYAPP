import { useMemo } from 'react';
import { useProfile } from './useProfile';
import { resolveUserExperience, UserExperience, LearningSpaceSummary } from '../services/experienceResolver';

export function useExperience(): UserExperience & {
  profile: ReturnType<typeof useProfile>['profile'];
  isAdmin: boolean;
} {
  const { profile, isAdmin } = useProfile();

  // For Phase 1, space memberships are initialized safely (empty array or mock-free)
  const spaceMemberships = useMemo<LearningSpaceSummary[]>(() => {
    // Extensible for future Phase 2 repository integration
    return [];
  }, []);

  const experience = useMemo(() => {
    return resolveUserExperience(
      profile,
      profile.assignedSubjects || [],
      spaceMemberships
    );
  }, [profile, spaceMemberships]);

  return {
    ...experience,
    profile,
    isAdmin,
  };
}
