export type SubjectId = 'swedish' | 'english' | 'python' | 'typing';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  nativeName?: string;
  flagOrIcon: string;
  description: string;
  summary: string;
  currentLesson: string;
  completedLessons: number;
  totalLessons: number;
  averageWpm: number;
  accuracy: number;
  colorAccent: string; // Hex or tailwind color
}

export type LessonType = 'sentence' | 'vocabulary' | 'conversation' | 'concept' | 'recall' | 'code' | 'pure_typing';

export interface LessonExercise {
  id: string;
  subjectId: SubjectId;
  title: string;
  type: LessonType;
  conceptPrompt?: string; // e.g., "What is a variable?" or translation meaning
  audioText?: string; // Text to speak via TTS
  contentToType: string; // The primary text the learner types directly through
  explanation?: string;
  language?: 'sv' | 'en' | 'python';
}

export interface UserStats {
  todayLearningMinutes: number;
  lessonsCompletedToday: number;
  averageAccuracy: number;
  currentWpm: number;
  streakDays: number;
  totalExercisesCompleted: number;
}

export interface RecentActivity {
  id: string;
  subjectId: SubjectId;
  title: string;
  subtitle: string;
  wpm: number;
  accuracy: number;
  timestamp: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  typingSoundVolume: number;
  caretStyle: 'line' | 'block' | 'underline';
  fontSize: 'medium' | 'large' | 'extra-large';
  ttsVoice: string;
  ttsRate: number;
}

/* =======================================================
   CENTRAL PROGRESS TRACKING DATA MODELS
======================================================= */

export interface ExerciseProgress {
  id: string;
  subjectId: SubjectId;
  unitId?: string;
  unitTitle?: string;
  exerciseTitle: string;
  completed: boolean;
  completedAt?: string; // ISO date string
  bestWpm: number;
  lastWpm: number;
  bestAccuracy: number;
  lastAccuracy: number;
  mistakes: number;
  studyTimeSeconds: number;
  difficultWords?: string[];
  attemptsCount: number;
}

export interface SubjectProgress {
  subjectId: SubjectId;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  totalStudyTimeSeconds: number;
  averageWpm: number;
  averageAccuracy: number;
  lastUnitId?: string;
  lastUnitTitle?: string;
  lastExerciseId?: string;
  lastExerciseTitle?: string;
  lastCompletedAt?: string;
  completedExerciseIds: string[];
}

export interface LastPosition {
  subjectId: SubjectId;
  unitId?: string;
  unitTitle?: string;
  exerciseId?: string;
  exerciseTitle?: string;
  stage?: string;
  sentenceIndex?: number;
  updatedAt: string;
}

export interface RecentSessionRecord {
  id: string;
  subjectId: SubjectId;
  title: string;
  subtitle: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  durationSeconds: number;
  timestamp: string;
  createdAt: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  studyTimeSeconds: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  wpmSamples: number[];
  accuracySamples: number[];
}

export interface DifficultWordRecord {
  word: string;
  subjectId: SubjectId;
  mistakes: number;
  lastMistakeAt: number;
}

/* =======================================================
   DIFFICULT ITEMS & REVIEW DATA MODELS
======================================================= */

export type MasteryLevel = 'needs_practice' | 'improving' | 'mastered';

export interface ReviewItem {
  id: string; // unique ID: e.g. "sv:tack", "en:because", "py:py-u1-ex2"
  subjectId: SubjectId; // 'swedish' | 'english' | 'python'
  text: string; // The primary word, phrase, or code text to type
  displayTitle: string; // Display heading (e.g. "because", "Variables", "for loops")
  category?: string; // e.g. "Vocabulary", "Syntax", "Grammar", "Keywords"
  unitId?: string;
  unitTitle?: string;
  lessonId?: string;
  concept?: string; // e.g. "Variables", "Functions", "Greetings"
  prompt?: string; // Concept prompt or translation meaning
  exampleSentence?: {
    text: string;
    translation?: string;
  };
  codeSnippet?: string; // Python code snippet to type
  mistakeCount: number;
  correctCount: number;
  lastMistakeDate: string; // ISO date string
  lastReviewedDate?: string; // ISO date string
  masteryScore: number; // 0 to 100
  language?: 'sv' | 'en' | 'python';
}

export interface ReviewSessionSummary {
  id: string;
  subjectId?: SubjectId | 'all';
  itemsCount: number;
  correctCount: number;
  mistakesCount: number;
  accuracy: number;
  wpm: number;
  durationSeconds: number;
  timestamp: string;
}

export interface LearningProgress {
  version: number;
  lastPosition: LastPosition;
  subjects: Record<SubjectId, SubjectProgress>;
  exercises: Record<string, ExerciseProgress>;
  recentSessions: RecentSessionRecord[];
  dailyActivities: Record<string, DailyActivity>;
  difficultWords: Record<string, DifficultWordRecord>;
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // YYYY-MM-DD
  };
  overall: {
    totalTimeSeconds: number;
    totalExercisesCompleted: number;
    totalLessonsCompleted: number;
    averageWpm: number;
    averageAccuracy: number;
  };
}

export interface ContinueInfo {
  subjectId: SubjectId;
  subjectName: string;
  moduleName: string;
  lessonTitle: string;
  exerciseSnippet: string;
  stage: string;
  nextStep: string;
  percentComplete: number;
  targetRoute: string;
}

