import { SubjectId } from '../types';

export type AcademicStepType = 'concept' | 'example' | 'problem' | 'recall';

export interface WorkedExample {
  problem: string;
  solution: string;
  steps?: string[];
  note?: string;
}

export interface MathProblem {
  id: string;
  question: string;
  expression?: string; // e.g., "7 + 4 = ?" or "12 - 5 = ?"
  targetAnswer: string; // The canonical expected answer e.g. "11", "7", "-5", "3.5"
  prompt?: string;
  hint?: string;
  explanation?: string;
  allowNegative?: boolean;
  allowDecimal?: boolean;
}

export interface AcademicStep {
  id: string;
  stepNumber: number;
  type: AcademicStepType;
  badgeLabel: string;
  title: string;
  conceptExplanation?: string;
  bulletPoints?: string[];
  workedExample?: WorkedExample;
  problem?: MathProblem;
}

export interface AcademicLesson {
  id: string;
  subjectId: SubjectId;
  unitId: string;
  unitTitle: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  steps: AcademicStep[];
}
