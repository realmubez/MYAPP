import { SubjectId } from '../types';
import { PHONE_PLANS_LESSON, PHONE_PLANS_STEPS } from './courses/english/phonePlansLesson';
import { PA_CAFE_LESSON, PA_CAFE_STEPS } from './courses/swedish/paCafeLesson';
import { PYTHON_VARIABLES_STEPS } from './courses/python/variablesLesson';

export interface CuratedLessonInfo {
  subjectId: SubjectId;
  lessonId: string;
  courseTitle: string;
  courseLevel: string;
  lessonTitle: string;
  lessonSubtitle: string;
  description: string;
  badge: string;
  stepCount: number;
  totalStepsLabel: string;
  route: string;
  focusRoute: string;
  modeSequence: string;
  tags: string[];
}

export const CURATED_LESSONS: Record<SubjectId, CuratedLessonInfo> = {
  english: {
    subjectId: 'english',
    lessonId: 'en-phone-plans',
    courseTitle: 'English Beginner 1',
    courseLevel: 'Beginner 1',
    lessonTitle: 'Phone Plans',
    lessonSubtitle: 'Mobile Data, Contracts & Customer Inquiries',
    description: 'Learn how to understand and talk about mobile phone plans, contracts, data limits, and customer service requests through structured typing.',
    badge: 'Interactive Session',
    stepCount: PHONE_PLANS_STEPS.length,
    totalStepsLabel: `${PHONE_PLANS_STEPS.length} interactive steps`,
    route: '/english',
    focusRoute: '/lesson/english/en-phone-plans',
    modeSequence: 'Listen → Type → Speak',
    tags: ['Vocabulary', 'Context Listening', 'Recall', 'Store Dialogue'],
  },
  swedish: {
    subjectId: 'swedish',
    lessonId: 'sv-pa-cafe',
    courseTitle: 'Swedish Beginner 1',
    courseLevel: 'Beginner 1',
    lessonTitle: 'På café',
    lessonSubtitle: 'At a Café — Ordering & Polite Inquiries',
    description: 'Master ordering coffee, requesting pastries, asking prices, and engaging in natural café conversations in Swedish through structured typing.',
    badge: 'Interactive Session',
    stepCount: PA_CAFE_STEPS.length,
    totalStepsLabel: `${PA_CAFE_STEPS.length} interactive steps`,
    route: '/swedish',
    focusRoute: '/lesson/swedish/sv-pa-cafe',
    modeSequence: 'Listen → Type → Speak',
    tags: ['Café Vocabulary', 'Polite Requests', 'Audio Recall', 'Dialogue'],
  },
  python: {
    subjectId: 'python',
    lessonId: 'py-variables',
    courseTitle: 'Python Beginner 1',
    courseLevel: 'Beginner 1',
    lessonTitle: 'Variables',
    lessonSubtitle: 'Values, Memory Names & Output',
    description: 'Master Python variables, naming conventions, value assignments, mental models, code prediction, syntax debugging, and interactive scripting.',
    badge: 'Interactive Session',
    stepCount: PYTHON_VARIABLES_STEPS.length,
    totalStepsLabel: `${PYTHON_VARIABLES_STEPS.length} interactive steps`,
    route: '/python',
    focusRoute: '/lesson/python/variables',
    modeSequence: 'Concept → Type → Predict → Code',
    tags: ['Mental Models', 'Type Code', 'Predict & Debug', 'Recall & Coding'],
  },
  typing: {
    subjectId: 'typing',
    lessonId: 'type-nordic-1',
    courseTitle: 'Typing Practice',
    courseLevel: 'Pure Focus',
    lessonTitle: 'Swedish Special Characters',
    lessonSubtitle: 'å, ä, ö Speed & Accuracy',
    description: 'Minimalist speed and accuracy practice with common words, quotes, and Nordic special characters.',
    badge: 'Speed Drill',
    stepCount: 10,
    totalStepsLabel: '10 drills',
    route: '/typing',
    focusRoute: '/typing',
    modeSequence: 'Top Words → Special Symbols → Speed Drills',
    tags: ['Swedish Symbols', 'Speed Drills', 'Muscle Memory'],
  },
};

export const CURATED_TOTAL_LESSONS: Record<SubjectId, number> = {
  swedish: 1,
  english: 1,
  python: 1,
  typing: 10,
};

export function getCuratedLesson(subjectId: SubjectId): CuratedLessonInfo {
  return CURATED_LESSONS[subjectId] || CURATED_LESSONS.swedish;
}

export function isCuratedLesson(subjectId: SubjectId, lessonId?: string): boolean {
  if (!lessonId) return true;
  const curated = CURATED_LESSONS[subjectId];
  if (!curated) return false;
  return (
    lessonId === curated.lessonId ||
    lessonId.includes(curated.lessonId) ||
    lessonId === 'phone-plans' ||
    lessonId === 'pa-cafe' ||
    lessonId === 'variables'
  );
}

export { PHONE_PLANS_LESSON, PA_CAFE_LESSON };
