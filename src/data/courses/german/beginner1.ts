import { CourseUnit } from '../types';
import { GERMAN_BEGRUSSUNGEN_LESSON } from './begrussungenLesson';

export const GERMAN_BEGINNER_1_UNITS: CourseUnit[] = [
  {
    id: 'de-b1-u01',
    unitNumber: 1,
    title: 'Grundlagen & Begrüßungen',
    description: 'Learn foundational German greetings, polite everyday responses, and accurate typing.',
    exercises: [
      {
        id: 'de-begrussungen',
        exerciseNumber: 1,
        title: 'Begrüßungen',
        mode: 'Interactive Mode',
        icon: '🇩🇪',
        lesson: GERMAN_BEGRUSSUNGEN_LESSON,
      },
    ],
  },
];
