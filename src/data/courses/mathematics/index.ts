import { Course } from '../types';
import { AcademicLesson } from '../../../types/academic';
import { MATHEMATICS_ARITHMETIC_LESSON } from './arithmeticLesson';

export interface MathUnit {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  lessons: AcademicLesson[];
}

export const MATHEMATICS_UNITS: MathUnit[] = [
  {
    id: 'math-u01',
    unitNumber: 1,
    title: 'Unit 1 · Arithmetic Essentials',
    description: 'Master core operations, mental math, addition, and subtraction with precision typing.',
    lessons: [MATHEMATICS_ARITHMETIC_LESSON],
  },
];

export const MATHEMATICS_FOUNDATION_COURSE: Course = {
  id: 'course-math-f1',
  subject: 'mathematics',
  level: 'Foundation 1',
  title: 'Mathematics Foundation 1',
  description: 'Master core arithmetic operations, signs, and mental math through interactive step-by-step problem solving.',
  units: MATHEMATICS_UNITS,
};

export { MATHEMATICS_ARITHMETIC_LESSON };
