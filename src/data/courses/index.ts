import { Course, CourseSubject, CourseUnit, ExerciseItem, PythonCourseUnit, PythonExerciseItem } from './types';
import { SWEDISH_BEGINNER_1_COURSE, SWEDISH_BEGINNER_1_UNITS } from './swedish';
import { ENGLISH_BEGINNER_1_COURSE, ENGLISH_BEGINNER_1_UNITS } from './english';
import { PYTHON_BEGINNER_1_COURSE, PYTHON_BEGINNER_1_UNITS } from './python';

export * from './types';
export * from './swedish';
export * from './english';
export * from './python';

export const ALL_COURSES: Record<CourseSubject, Course> = {
  swedish: SWEDISH_BEGINNER_1_COURSE,
  english: ENGLISH_BEGINNER_1_COURSE,
  python: PYTHON_BEGINNER_1_COURSE,
};

export function getCourse(subject: CourseSubject): Course {
  return ALL_COURSES[subject] || SWEDISH_BEGINNER_1_COURSE;
}

export function getUnitById(subject: CourseSubject, unitId: string): CourseUnit | PythonCourseUnit | undefined {
  const course = getCourse(subject);
  return course.units.find((u) => u.id === unitId);
}

export function getExerciseById(
  subject: CourseSubject,
  unitId: string,
  exerciseId: string
): ExerciseItem | PythonExerciseItem | undefined {
  const unit = getUnitById(subject, unitId);
  if (!unit) return undefined;
  return (unit.exercises as Array<ExerciseItem | PythonExerciseItem>).find((ex) => ex.id === exerciseId);
}
