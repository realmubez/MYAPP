import { ALL_COURSES, CourseSubject, CourseUnit, ExerciseItem, PythonCourseUnit, PythonExerciseItem } from '../data/courses';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  course: CourseSubject;
  unitId?: string;
  exerciseId?: string;
  message: string;
}

export interface ValidationReport {
  isValid: boolean;
  totalCourses: number;
  totalUnits: number;
  totalExercises: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: Record<CourseSubject, { unitsCount: number; exercisesCount: number }>;
}

export function validateCurriculum(): ValidationReport {
  const issues: ValidationIssue[] = [];
  const seenUnitIds = new Set<string>();
  const seenExerciseIds = new Set<string>();
  const seenItemIds = new Set<string>();

  const summary: Record<CourseSubject, { unitsCount: number; exercisesCount: number }> = {
    swedish: { unitsCount: 0, exercisesCount: 0 },
    english: { unitsCount: 0, exercisesCount: 0 },
    python: { unitsCount: 0, exercisesCount: 0 },
  };

  let totalUnits = 0;
  let totalExercises = 0;

  (Object.keys(ALL_COURSES) as CourseSubject[]).forEach((subject) => {
    const course = ALL_COURSES[subject];
    if (!course) {
      issues.push({ severity: 'error', course: subject, message: `Course ${subject} not found in ALL_COURSES` });
      return;
    }

    summary[subject].unitsCount = course.units.length;
    totalUnits += course.units.length;

    course.units.forEach((unit, uIdx) => {
      // Check unit ID uniqueness
      if (seenUnitIds.has(unit.id)) {
        issues.push({
          severity: 'error',
          course: subject,
          unitId: unit.id,
          message: `Duplicate unit ID: ${unit.id}`,
        });
      }
      seenUnitIds.add(unit.id);

      if (!unit.title || unit.title.trim() === '') {
        issues.push({
          severity: 'error',
          course: subject,
          unitId: unit.id,
          message: `Unit at index ${uIdx} has empty title`,
        });
      }

      summary[subject].exercisesCount += unit.exercises.length;
      totalExercises += unit.exercises.length;

      if (subject === 'python') {
        const pyUnit = unit as PythonCourseUnit;
        pyUnit.exercises.forEach((ex: PythonExerciseItem, exIdx: number) => {
          if (seenExerciseIds.has(ex.id)) {
            issues.push({
              severity: 'error',
              course: subject,
              unitId: unit.id,
              exerciseId: ex.id,
              message: `Duplicate Python exercise ID: ${ex.id}`,
            });
          }
          seenExerciseIds.add(ex.id);

          if (!ex.contentToType || ex.contentToType.trim() === '') {
            issues.push({
              severity: 'error',
              course: subject,
              unitId: unit.id,
              exerciseId: ex.id,
              message: `Exercise ${ex.id} has empty contentToType`,
            });
          }
          if (!ex.explanation || ex.explanation.trim() === '') {
            issues.push({
              severity: 'warning',
              course: subject,
              unitId: unit.id,
              exerciseId: ex.id,
              message: `Exercise ${ex.id} has empty explanation`,
            });
          }
        });
      } else {
        const langUnit = unit as CourseUnit;
        langUnit.exercises.forEach((ex: ExerciseItem, exIdx: number) => {
          if (seenExerciseIds.has(ex.id)) {
            issues.push({
              severity: 'error',
              course: subject,
              unitId: unit.id,
              exerciseId: ex.id,
              message: `Duplicate language exercise ID: ${ex.id}`,
            });
          }
          seenExerciseIds.add(ex.id);

          if (!ex.lesson) {
            issues.push({
              severity: 'error',
              course: subject,
              unitId: unit.id,
              exerciseId: ex.id,
              message: `Exercise ${ex.id} missing lesson object`,
            });
          } else {
            if (!ex.lesson.sentences || ex.lesson.sentences.length === 0) {
              issues.push({
                severity: 'error',
                course: subject,
                unitId: unit.id,
                exerciseId: ex.id,
                message: `Exercise ${ex.id} has no sentences/words to type`,
              });
            }
            ex.lesson.sentences?.forEach((sentence) => {
              if (seenItemIds.has(sentence.id)) {
                issues.push({
                  severity: 'error',
                  course: subject,
                  unitId: unit.id,
                  exerciseId: ex.id,
                  message: `Duplicate sentence/word ID: ${sentence.id}`,
                });
              }
              seenItemIds.add(sentence.id);

              if (!sentence.text || sentence.text.trim() === '') {
                issues.push({
                  severity: 'error',
                  course: subject,
                  unitId: unit.id,
                  exerciseId: ex.id,
                  message: `Sentence ${sentence.id} has empty text`,
                });
              }
            });
          }
        });
      }
    });
  });

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return {
    isValid: errors.length === 0,
    totalCourses: Object.keys(ALL_COURSES).length,
    totalUnits,
    totalExercises,
    errors,
    warnings,
    summary,
  };
}
