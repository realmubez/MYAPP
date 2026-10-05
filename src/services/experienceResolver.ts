import { UserProfile, SubjectId } from '../types';

export type ExperienceMode = 'personal_os' | 'managed_space';

export interface LearningSpaceSummary {
  id: string;
  slug: string;
  title: string;
  role: 'owner' | 'manager' | 'learner';
  assignedSubjects: SubjectId[];
  isPrimary?: boolean;
}

export interface UserExperience {
  mode: ExperienceMode;
  defaultRoute: string;
  primarySpaceSlug?: string;
  availableSpaces: LearningSpaceSummary[];
  hasPersonalOsAccess: boolean;
  canAccessAdmin: boolean;
  activeSubjects: SubjectId[];
}

/**
 * Resolves the primary user experience mode without hardcoding specific usernames or emails.
 * Uses role, assigned subjects, and space memberships to determine layout and default routing.
 */
export function resolveUserExperience(
  profile: UserProfile | null,
  assignedSubjects: SubjectId[] = [],
  spaceMemberships: LearningSpaceSummary[] = []
): UserExperience {
  // Unauthenticated or fallback
  if (!profile) {
    return {
      mode: 'personal_os',
      defaultRoute: '/',
      availableSpaces: [],
      hasPersonalOsAccess: true,
      canAccessAdmin: false,
      activeSubjects: assignedSubjects,
    };
  }

  const isAdmin = profile.role === 'admin';
  const hasAssignedPersonalSubjects = Array.isArray(assignedSubjects) && assignedSubjects.length > 0;
  
  // Find primary or first managed space if any
  const primarySpace = spaceMemberships.find((s) => s.isPrimary) || spaceMemberships[0];

  // A user is resolved to managed_space mode ONLY if they belong to a managed space
  // AND they have no independent personal OS subject assignments (and are not admin).
  const isDedicatedSpaceLearner =
    !isAdmin &&
    !hasAssignedPersonalSubjects &&
    spaceMemberships.length > 0 &&
    spaceMemberships.every((s) => s.role === 'learner');

  if (isDedicatedSpaceLearner && primarySpace) {
    return {
      mode: 'managed_space',
      defaultRoute: `/spaces/${primarySpace.slug}`,
      primarySpaceSlug: primarySpace.slug,
      availableSpaces: spaceMemberships,
      hasPersonalOsAccess: false,
      canAccessAdmin: false,
      activeSubjects: primarySpace.assignedSubjects || [],
    };
  }

  // Standard Personal Learning OS mode (Owner, Admin, or user with personal curriculum)
  return {
    mode: 'personal_os',
    defaultRoute: '/',
    primarySpaceSlug: primarySpace?.slug,
    availableSpaces: spaceMemberships,
    hasPersonalOsAccess: true,
    canAccessAdmin: isAdmin,
    activeSubjects: assignedSubjects,
  };
}
