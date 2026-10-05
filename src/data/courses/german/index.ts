import { Course } from '../types';
import { GERMAN_BEGINNER_1_UNITS } from './beginner1';

export const GERMAN_BEGINNER_1_COURSE: Course = {
  id: 'course-de-b1',
  subject: 'german',
  level: 'Beginner 1',
  title: 'German Beginner 1',
  description: 'Master practical everyday German through typing, listening, and structured conversational drills.',
  units: GERMAN_BEGINNER_1_UNITS,
};

export { GERMAN_BEGINNER_1_UNITS };
