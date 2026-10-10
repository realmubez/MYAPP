/**
 * Exam Progress Persistence Service
 * Stores completed lessons, target exam date, practice scores, and mock exam results.
 * Uses localStorage safely and triggers subscriber updates.
 */

export interface MockExamResult {
  id: string;
  timestamp: number;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  grade: 'Distinction' | 'Merit' | 'Pass' | 'Needs Practice';
  breakdown: {
    grammar: { correct: number; total: number };
    vocabulary: { correct: number; total: number };
    reading: { correct: number; total: number };
    writing: { correct: number; total: number };
  };
}

export interface MistakeRecord {
  id: string; // unique key for the question (e.g. q-01-2 or pe-mc-1)
  questionPrompt: string;
  sourceType: 'lesson' | 'practice' | 'mock-exam';
  sourceTitle: string; // e.g. "Lesson 2: The Verb to be" or "Practice: Fill in Blanks"
  userAnswer: string;
  expectedAnswer: string;
  explanation: string;
  options?: string[]; // if multiple choice
  timestamp: number;
}

export interface ExamProgressState {
  targetExamDate: string | null; // ISO string or null
  completedLessonIds: string[];
  lastStudiedLessonId: string | null;
  bookmarkedLessonIds: string[];
  practiceStats: {
    attempted: number;
    correct: number;
  };
  mockExamHistory: MockExamResult[];
  mistakes: MistakeRecord[];
}

const STORAGE_KEY = 'my_learning_exam_prepare_progress_v1';

const DEFAULT_STATE: ExamProgressState = {
  targetExamDate: null,
  completedLessonIds: [],
  lastStudiedLessonId: 'lesson-01',
  bookmarkedLessonIds: [],
  practiceStats: {
    attempted: 0,
    correct: 0,
  },
  mockExamHistory: [],
  mistakes: [],
};

class ExamProgressService {
  private listeners: Set<() => void> = new Set();

  public getState(): ExamProgressState {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_STATE;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATE,
        ...parsed,
      };
    } catch {
      return DEFAULT_STATE;
    }
  }

  private saveState(state: ExamProgressState) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      this.listeners.forEach((fn) => fn());
    } catch (e) {
      console.warn('Failed to save exam progress', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public setExamDate(dateStr: string | null): void {
    const state = this.getState();
    state.targetExamDate = dateStr;
    this.saveState(state);
  }

  public setLessonCompleted(lessonId: string, completed: boolean = true): void {
    const state = this.getState();
    const set = new Set(state.completedLessonIds);
    if (completed) {
      set.add(lessonId);
    } else {
      set.delete(lessonId);
    }
    state.completedLessonIds = Array.from(set);
    state.lastStudiedLessonId = lessonId;
    this.saveState(state);
  }

  public toggleBookmark(lessonId: string): void {
    const state = this.getState();
    const set = new Set(state.bookmarkedLessonIds);
    if (set.has(lessonId)) {
      set.delete(lessonId);
    } else {
      set.add(lessonId);
    }
    state.bookmarkedLessonIds = Array.from(set);
    this.saveState(state);
  }

  public setLastStudied(lessonId: string): void {
    const state = this.getState();
    state.lastStudiedLessonId = lessonId;
    this.saveState(state);
  }

  public recordPracticeAnswer(isCorrect: boolean): void {
    const state = this.getState();
    state.practiceStats.attempted += 1;
    if (isCorrect) {
      state.practiceStats.correct += 1;
    }
    this.saveState(state);
  }

  public recordMistake(mistake: Omit<MistakeRecord, 'timestamp'>): void {
    const state = this.getState();
    const existingIndex = (state.mistakes || []).findIndex((m) => m.id === mistake.id);
    const newRecord: MistakeRecord = {
      ...mistake,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      state.mistakes[existingIndex] = newRecord;
    } else {
      state.mistakes = [newRecord, ...(state.mistakes || [])];
    }
    this.saveState(state);
  }

  public resolveMistake(questionId: string): void {
    const state = this.getState();
    if (!state.mistakes || state.mistakes.length === 0) return;
    state.mistakes = state.mistakes.filter((m) => m.id !== questionId);
    this.saveState(state);
  }

  public clearAllMistakes(): void {
    const state = this.getState();
    state.mistakes = [];
    this.saveState(state);
  }

  public recordMockExam(result: MockExamResult): void {
    const state = this.getState();
    state.mockExamHistory.unshift(result);
    // Keep last 10 mock exam attempts
    if (state.mockExamHistory.length > 10) {
      state.mockExamHistory = state.mockExamHistory.slice(0, 10);
    }
    this.saveState(state);
  }

  public resetAllProgress(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.listeners.forEach((fn) => fn());
    } catch {
      // ignore
    }
  }
}

export const examProgressService = new ExamProgressService();
