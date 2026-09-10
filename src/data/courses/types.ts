import { LanguageLesson, LessonSentence } from '../../types/lessons';

export type CourseSubject = 'swedish' | 'english' | 'python';

export interface ExerciseItem {
  id: string;
  exerciseNumber: number;
  title: string;
  mode: 'Word Mode' | 'Sentence Mode' | 'Dialogue Mode' | 'Concept' | 'Type' | 'Code' | 'Recall' | 'Typing' | 'Code / Recall';
  icon: string;
  lesson: LanguageLesson;
}

export interface CourseUnit {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  exercises: ExerciseItem[];
}

export interface PythonExerciseItem {
  id: string;
  exerciseNumber: number;
  title: string;
  mode: 'Concept' | 'Type' | 'Code' | 'Recall' | 'Typing' | 'Code / Recall';
  icon: string;
  prompt: string;
  contentToType: string;
  explanation: string;
}

export interface PythonCourseUnit {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  exercises: PythonExerciseItem[];
}

export interface Course {
  id: string;
  subject: CourseSubject;
  level: 'Beginner 1';
  title: string;
  description: string;
  units: CourseUnit[] | PythonCourseUnit[];
}
