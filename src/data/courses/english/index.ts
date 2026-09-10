import { Course } from '../types';
import { ENGLISH_BEGINNER_1_UNITS } from './beginner1';
import { PHONE_PLANS_LESSON } from './phonePlansLesson';

export const ENGLISH_BEGINNER_1_COURSE: Course = {
  id: 'course-en-b1',
  subject: 'english',
  level: 'Beginner 1',
  title: 'English Beginner 1',
  description: 'Master essential British English vocabulary, grammar, and natural dialogue through typing and listening.',
  units: ENGLISH_BEGINNER_1_UNITS,
};

export { ENGLISH_BEGINNER_1_UNITS, PHONE_PLANS_LESSON };

