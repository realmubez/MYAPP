import { Course, CourseUnit } from '../types';
import { SWEDISH_BEGINNER_1_UNITS } from './beginner1';

export const SWEDISH_BEGINNER_1_COURSE: Course = {
  id: 'course-sv-b1',
  subject: 'swedish',
  level: 'Beginner 1',
  title: 'Swedish Beginner 1',
  description: 'Master practical everyday Swedish through typing, listening, and conversational drills.',
  units: SWEDISH_BEGINNER_1_UNITS,
};

export { SWEDISH_BEGINNER_1_UNITS };
