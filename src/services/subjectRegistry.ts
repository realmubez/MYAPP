import { SubjectDefinition, SubjectId } from '../types';

/**
 * Subject Registry
 *
 * Establishes a flexible, registry-based catalog of subjects.
 * Allows new subjects (such as German, Mathematics, etc.) to be registered
 * without rewriting core layouts, navigation, or profile logic.
 */
export const SUBJECT_REGISTRY: Record<SubjectId, SubjectDefinition> = {
  swedish: {
    id: 'swedish',
    name: 'Swedish',
    nativeName: 'Svenska',
    icon: '🇸🇪',
    type: 'language',
    route: '/swedish',
    description: 'Conversational Swedish through interactive keyboard drills',
    enabled: true,
  },
  english: {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    icon: '🇬🇧',
    type: 'language',
    route: '/english',
    description: 'Workplace and practical English scenarios and contracts',
    enabled: true,
  },
  python: {
    id: 'python',
    name: 'Python',
    nativeName: 'Python 3',
    icon: '🐍',
    type: 'programming',
    route: '/python',
    description: 'Core programming concepts, syntax, and typing exercises',
    enabled: true,
  },
  typing: {
    id: 'typing',
    name: 'Typing',
    nativeName: 'Touch Typing',
    icon: '⌨️',
    type: 'typing',
    route: '/typing',
    description: 'Muscle memory, Nordic symbols, and high-accuracy typing drills',
    enabled: true,
  },
};

/**
 * Helper to get all enabled subjects from registry
 */
export function getAllEnabledSubjects(): SubjectDefinition[] {
  return Object.values(SUBJECT_REGISTRY).filter((s) => s.enabled);
}

/**
 * Helper to get subject definitions assigned to a specific user profile
 */
export function getAssignedSubjectDefinitions(assignedIds: SubjectId[]): SubjectDefinition[] {
  return assignedIds
    .map((id) => SUBJECT_REGISTRY[id])
    .filter((def): def is SubjectDefinition => Boolean(def && def.enabled));
}
