import {
  SubjectId,
  LearningProgress,
  SubjectProgress,
  ExerciseProgress,
  LastPosition,
  RecentSessionRecord,
  DailyActivity,
  DifficultWordRecord,
  UserStats,
  ContinueInfo,
} from '../types';
import { CURATED_TOTAL_LESSONS, CURATED_LESSONS } from '../data/curriculumConfig';

export const PROGRESS_STORAGE_KEY = 'mylearning_progress_v1';
export const PROGRESS_UPDATED_EVENT = 'mylearning_progress_changed';

// Curriculum totals based on approved curated visible lessons
export const TOTAL_LESSONS_BY_SUBJECT: Record<SubjectId, number> = CURATED_TOTAL_LESSONS;

export const SUBJECT_DISPLAY_NAMES: Record<SubjectId, string> = {
  swedish: 'Swedish',
  english: 'English',
  python: 'Python',
  typing: 'Typing',
};

// Date utilities in YYYY-MM-DD format (local timezone)
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeAgo(timestampStr: string): string {
  try {
    const time = new Date(timestampStr).getTime();
    if (isNaN(time)) return timestampStr;
    const diff = Date.now() - time;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(timestampStr).toLocaleDateString();
  } catch {
    return timestampStr;
  }
}

export function createInitialProgress(): LearningProgress {
  const today = getTodayDateString();

  const subjects: Record<SubjectId, SubjectProgress> = {
    swedish: {
      subjectId: 'swedish',
      completedLessons: 0,
      totalLessons: TOTAL_LESSONS_BY_SUBJECT.swedish,
      percentComplete: 0,
      totalStudyTimeSeconds: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      lastUnitId: 'sv-pa-cafe',
      lastUnitTitle: 'Beginner 1 · På café',
      lastExerciseId: 'sv-pa-cafe',
      lastExerciseTitle: 'På café · Interactive Session',
      completedExerciseIds: [],
    },
    english: {
      subjectId: 'english',
      completedLessons: 0,
      totalLessons: TOTAL_LESSONS_BY_SUBJECT.english,
      percentComplete: 0,
      totalStudyTimeSeconds: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      lastUnitId: 'en-phone-plans',
      lastUnitTitle: 'Beginner 1 · Phone Plans',
      lastExerciseId: 'en-phone-plans',
      lastExerciseTitle: 'Phone Plans · Interactive Session',
      completedExerciseIds: [],
    },
    python: {
      subjectId: 'python',
      completedLessons: 0,
      totalLessons: TOTAL_LESSONS_BY_SUBJECT.python,
      percentComplete: 0,
      totalStudyTimeSeconds: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      lastUnitId: 'py-variables',
      lastUnitTitle: 'Beginner 1 · Variables',
      lastExerciseId: 'py-variables',
      lastExerciseTitle: 'Variables · Interactive Session',
      completedExerciseIds: [],
    },
    typing: {
      subjectId: 'typing',
      completedLessons: 0,
      totalLessons: TOTAL_LESSONS_BY_SUBJECT.typing,
      percentComplete: 0,
      totalStudyTimeSeconds: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      lastExerciseId: 'type-nordic-1',
      lastExerciseTitle: 'Swedish Special Characters (å, ä, ö)',
      completedExerciseIds: [],
    },
  };

  const initialLastPosition: LastPosition = {
    subjectId: 'swedish',
    unitId: 'sv-pa-cafe',
    unitTitle: 'Beginner 1 · På café',
    exerciseId: 'sv-pa-cafe',
    exerciseTitle: 'På café · Interactive Session',
    stage: 'listen_type',
    sentenceIndex: 0,
    updatedAt: new Date().toISOString(),
  };

  return {
    version: 1,
    lastPosition: initialLastPosition,
    subjects,
    exercises: {},
    recentSessions: [],
    dailyActivities: {
      [today]: {
        date: today,
        studyTimeSeconds: 0,
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        wpmSamples: [],
        accuracySamples: [],
      },
    },
    difficultWords: {},
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
    },
    overall: {
      totalTimeSeconds: 0,
      totalExercisesCompleted: 0,
      totalLessonsCompleted: 0,
      averageWpm: 0,
      averageAccuracy: 0,
    },
  };
}

class ProgressService {
  private memoryCache: LearningProgress | null = null;

  public getProgress(): LearningProgress {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LearningProgress;
        if (parsed && parsed.version === 1 && parsed.subjects && parsed.streak) {
          this.memoryCache = this.validateAndHydrateProgress(parsed);
          return this.memoryCache;
        }
      }
    } catch (e) {
      console.warn('Failed to load learning progress from localStorage:', e);
    }

    const fresh = createInitialProgress();
    this.memoryCache = fresh;
    this.saveProgress(fresh);
    return fresh;
  }

  public saveProgress(progress: LearningProgress): void {
    this.memoryCache = progress;
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save learning progress to localStorage:', e);
    }

    // Notify listeners across app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT, { detail: progress }));
      syncTelegramProgress(progress);
    }
  }

  private validateAndHydrateProgress(p: LearningProgress): LearningProgress {
    const today = getTodayDateString();
    const defaults = createInitialProgress();

    // Ensure all subjects exist
    const subjects = { ...defaults.subjects, ...p.subjects };
    Object.keys(defaults.subjects).forEach((subKey) => {
      const key = subKey as SubjectId;
      subjects[key].totalLessons = TOTAL_LESSONS_BY_SUBJECT[key];
      
      let completedCount = 0;
      if (key === 'swedish') {
        const u1 = p.exercises?.['sv-pa-cafe']?.completed || 
          p.subjects?.swedish?.completedExerciseIds?.includes('sv-pa-cafe') ? 1 : 0;
        const u2 = p.exercises?.['sv-en-vanlig-morgon']?.completed || 
          p.subjects?.swedish?.completedExerciseIds?.includes('sv-en-vanlig-morgon') ? 1 : 0;
        completedCount = u1 + u2;
        if (completedCount === 0 && (p.subjects?.swedish?.completedLessons ?? 0) > 0) {
          completedCount = Math.min(2, p.subjects?.swedish?.completedLessons || 1);
        }
      } else if (key === 'english') {
        const isCompleted = p.exercises?.['en-phone-plans']?.completed || 
          p.subjects?.english?.completedExerciseIds?.includes('en-phone-plans') ||
          (p.subjects?.english?.completedLessons ?? 0) > 0;
        completedCount = isCompleted ? 1 : 0;
      } else if (key === 'python') {
        const isCompleted = p.exercises?.['py-variables']?.completed || 
          p.subjects?.python?.completedExerciseIds?.includes('py-variables') ||
          (p.subjects?.python?.completedLessons ?? 0) > 0;
        completedCount = isCompleted ? 1 : 0;
      } else {
        completedCount = Math.min(subjects[key].totalLessons, subjects[key].completedExerciseIds?.length || subjects[key].completedLessons || 0);
      }

      subjects[key].completedLessons = completedCount;
      subjects[key].percentComplete = Math.min(
        100,
        Math.round((completedCount / subjects[key].totalLessons) * 100)
      );
    });

    // Ensure today daily activity entry exists
    const dailyActivities = { ...p.dailyActivities };
    if (!dailyActivities[today]) {
      dailyActivities[today] = {
        date: today,
        studyTimeSeconds: 0,
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        wpmSamples: [],
        accuracySamples: [],
      };
    }

    return {
      ...defaults,
      ...p,
      subjects,
      dailyActivities,
      exercises: p.exercises || {},
      recentSessions: p.recentSessions || [],
      difficultWords: p.difficultWords || {},
      streak: p.streak || defaults.streak,
      overall: p.overall || defaults.overall,
    };
  }

  /**
   * Updates last position in the app (e.g. when opening a lesson or changing sentence)
   */
  public updateLastPosition(position: Partial<LastPosition> & { subjectId: SubjectId }): void {
    const current = this.getProgress();
    const updatedPosition: LastPosition = {
      ...current.lastPosition,
      ...position,
      updatedAt: new Date().toISOString(),
    };

    const sub = current.subjects[position.subjectId];
    if (sub) {
      if (position.unitId) sub.lastUnitId = position.unitId;
      if (position.unitTitle) sub.lastUnitTitle = position.unitTitle;
      if (position.exerciseId) sub.lastExerciseId = position.exerciseId;
      if (position.exerciseTitle) sub.lastExerciseTitle = position.exerciseTitle;
    }

    this.saveProgress({
      ...current,
      lastPosition: updatedPosition,
    });
  }

  /**
   * Main completion recorder: Call whenever an exercise or typing drill is finished
   */
  public recordExerciseCompletion(data: {
    subjectId: SubjectId;
    exerciseId: string;
    exerciseTitle: string;
    unitId?: string;
    unitTitle?: string;
    wpm: number;
    accuracy: number;
    mistakes: number;
    durationSeconds: number;
    difficultWords?: string[];
    nextExerciseId?: string;
    nextExerciseTitle?: string;
  }): void {
    const current = this.getProgress();
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    const nowIso = new Date().toISOString();

    const existingEx = current.exercises[data.exerciseId];
    const isFirstTimeCompletion = !existingEx || !existingEx.completed;

    // 1. Update Exercise Record
    const updatedEx: ExerciseProgress = {
      id: data.exerciseId,
      subjectId: data.subjectId,
      unitId: data.unitId || existingEx?.unitId,
      unitTitle: data.unitTitle || existingEx?.unitTitle,
      exerciseTitle: data.exerciseTitle || existingEx?.exerciseTitle || data.exerciseId,
      completed: true,
      completedAt: nowIso,
      bestWpm: Math.max(existingEx?.bestWpm || 0, data.wpm),
      lastWpm: data.wpm,
      bestAccuracy: Math.max(existingEx?.bestAccuracy || 0, data.accuracy),
      lastAccuracy: data.accuracy,
      mistakes: (existingEx?.mistakes || 0) + data.mistakes,
      studyTimeSeconds: (existingEx?.studyTimeSeconds || 0) + data.durationSeconds,
      difficultWords: data.difficultWords || existingEx?.difficultWords || [],
      attemptsCount: (existingEx?.attemptsCount || 0) + 1,
    };
    current.exercises[data.exerciseId] = updatedEx;

    // 2. Update Subject Progress
    const sub = current.subjects[data.subjectId];
    if (sub) {
      if (!sub.completedExerciseIds.includes(data.exerciseId)) {
        sub.completedExerciseIds.push(data.exerciseId);
      }
      sub.completedLessons = Math.min(sub.totalLessons, sub.completedExerciseIds.length);
      sub.percentComplete = Math.min(
        100,
        Math.round((sub.completedLessons / sub.totalLessons) * 100)
      );
      sub.totalStudyTimeSeconds += data.durationSeconds;
      sub.lastCompletedAt = nowIso;
      if (data.unitId) sub.lastUnitId = data.unitId;
      if (data.unitTitle) sub.lastUnitTitle = data.unitTitle;
      sub.lastExerciseId = data.nextExerciseId || data.exerciseId;
      sub.lastExerciseTitle = data.nextExerciseTitle || data.exerciseTitle;

      // Recalculate subject average WPM & Accuracy from completed exercises
      const subExercises = Object.values(current.exercises).filter(
        (e) => e.subjectId === data.subjectId && e.completed
      );
      if (subExercises.length > 0) {
        const totalSubWpm = subExercises.reduce((sum, e) => sum + e.lastWpm, 0);
        const totalSubAcc = subExercises.reduce((sum, e) => sum + e.lastAccuracy, 0);
        sub.averageWpm = Math.round(totalSubWpm / subExercises.length);
        sub.averageAccuracy = Math.round((totalSubAcc / subExercises.length) * 10) / 10;
      } else {
        sub.averageWpm = data.wpm;
        sub.averageAccuracy = data.accuracy;
      }
    }

    // 3. Update Daily Activity
    if (!current.dailyActivities[today]) {
      current.dailyActivities[today] = {
        date: today,
        studyTimeSeconds: 0,
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        wpmSamples: [],
        accuracySamples: [],
      };
    }
    const dayRecord = current.dailyActivities[today];
    dayRecord.studyTimeSeconds += data.durationSeconds;
    dayRecord.exercisesCompleted += 1;
    if (isFirstTimeCompletion) {
      dayRecord.lessonsCompleted += 1;
    }
    if (data.wpm > 0) dayRecord.wpmSamples.push(data.wpm);
    if (data.accuracy > 0) dayRecord.accuracySamples.push(data.accuracy);

    // 4. Update Streak
    const lastActive = current.streak.lastActiveDate;
    if (lastActive === today) {
      // already active today, streak intact
      if (current.streak.currentStreak === 0) {
        current.streak.currentStreak = 1;
      }
    } else if (lastActive === yesterday) {
      // consecutive day!
      current.streak.currentStreak += 1;
      current.streak.lastActiveDate = today;
    } else {
      // streak reset or first day
      current.streak.currentStreak = 1;
      current.streak.lastActiveDate = today;
    }
    current.streak.longestStreak = Math.max(
      current.streak.longestStreak,
      current.streak.currentStreak
    );

    // 5. Update Difficult Words
    if (data.difficultWords && data.difficultWords.length > 0) {
      data.difficultWords.forEach((word) => {
        const clean = word.trim().toLowerCase();
        if (clean) {
          if (!current.difficultWords[clean]) {
            current.difficultWords[clean] = {
              word: clean,
              subjectId: data.subjectId,
              mistakes: 1,
              lastMistakeAt: Date.now(),
            };
          } else {
            current.difficultWords[clean].mistakes += 1;
            current.difficultWords[clean].lastMistakeAt = Date.now();
          }
        }
      });
    }

    // 6. Prepend to Recent Sessions
    const newSession: RecentSessionRecord = {
      id: `rec-${Date.now()}`,
      subjectId: data.subjectId,
      title: `${SUBJECT_DISPLAY_NAMES[data.subjectId]}: ${data.exerciseTitle}`,
      subtitle: data.unitTitle ? `${data.unitTitle} · ${Math.round(data.durationSeconds)}s` : `${Math.round(data.durationSeconds)}s typing drill`,
      wpm: data.wpm,
      accuracy: data.accuracy,
      mistakes: data.mistakes,
      durationSeconds: data.durationSeconds,
      timestamp: nowIso,
      createdAt: Date.now(),
    };
    current.recentSessions = [newSession, ...current.recentSessions.slice(0, 29)];

    // 7. Recalculate Overall Stats
    const allCompleted = Object.values(current.exercises).filter((e) => e.completed);
    const totalExercises = allCompleted.length;
    const totalLessons = Object.values(current.subjects).reduce(
      (sum, s) => sum + s.completedLessons,
      0
    );
    const totalStudyTime = Object.values(current.dailyActivities).reduce(
      (sum, d) => sum + d.studyTimeSeconds,
      0
    );

    let avgWpm = data.wpm;
    let avgAcc = data.accuracy;
    if (allCompleted.length > 0) {
      const sumWpm = allCompleted.reduce((s, e) => s + e.lastWpm, 0);
      const sumAcc = allCompleted.reduce((s, e) => s + e.lastAccuracy, 0);
      avgWpm = Math.round(sumWpm / allCompleted.length);
      avgAcc = Math.round((sumAcc / allCompleted.length) * 10) / 10;
    }

    current.overall = {
      totalTimeSeconds: totalStudyTime,
      totalExercisesCompleted: totalExercises,
      totalLessonsCompleted: totalLessons,
      averageWpm: avgWpm,
      averageAccuracy: avgAcc,
    };

    // 8. Advance lastPosition
    current.lastPosition = {
      subjectId: data.subjectId,
      unitId: data.unitId,
      unitTitle: data.unitTitle,
      exerciseId: data.nextExerciseId || data.exerciseId,
      exerciseTitle: data.nextExerciseTitle || data.exerciseTitle,
      stage: 'listen_type',
      sentenceIndex: 0,
      updatedAt: nowIso,
    };

    this.saveProgress(current);
  }

  public isExerciseCompleted(exerciseId: string): boolean {
    const progress = this.getProgress();
    return !!progress.exercises[exerciseId]?.completed;
  }

  public getExerciseProgress(exerciseId: string): ExerciseProgress | undefined {
    return this.getProgress().exercises[exerciseId];
  }

  public getSubjectProgress(subjectId: SubjectId): SubjectProgress {
    return this.getProgress().subjects[subjectId] || createInitialProgress().subjects[subjectId];
  }

  public getUserStats(): UserStats {
    const progress = this.getProgress();
    const today = getTodayDateString();
    const day = progress.dailyActivities[today];

    const todayMinutes = day ? Math.round(day.studyTimeSeconds / 60) : 0;
    const lessonsToday = day ? day.lessonsCompleted : 0;

    // Calculate accuracy & WPM from today or overall
    let accuracy = progress.overall.averageAccuracy;
    let wpm = progress.overall.averageWpm;

    if (day && day.accuracySamples.length > 0) {
      const sum = day.accuracySamples.reduce((a, b) => a + b, 0);
      accuracy = Math.round((sum / day.accuracySamples.length) * 10) / 10;
    }
    if (day && day.wpmSamples.length > 0) {
      const sum = day.wpmSamples.reduce((a, b) => a + b, 0);
      wpm = Math.round(sum / day.wpmSamples.length);
    }

    return {
      todayLearningMinutes: todayMinutes,
      lessonsCompletedToday: lessonsToday,
      averageAccuracy: accuracy || 0,
      currentWpm: wpm || 0,
      streakDays: progress.streak.currentStreak || 0,
      totalExercisesCompleted: progress.overall.totalExercisesCompleted || 0,
    };
  }

  public getContinueInfo(): ContinueInfo {
    const progress = this.getProgress();
    const lastPos = progress.lastPosition;
    const subjectId = lastPos?.subjectId || 'swedish';
    const subject = progress.subjects[subjectId] || progress.subjects.swedish;
    const curated = CURATED_LESSONS[subjectId] || CURATED_LESSONS.swedish;

    const subjectName = SUBJECT_DISPLAY_NAMES[subjectId] || 'Swedish';
    
    // Use curated module & lesson title if old/hidden IDs are present
    const isLegacyUnit =
      !lastPos.unitId ||
      lastPos.unitId.startsWith('unit-') ||
      lastPos.unitTitle?.includes('Hälsningar') ||
      lastPos.unitTitle?.includes('Greetings');

    const moduleName = isLegacyUnit ? `${curated.courseLevel} · ${curated.lessonTitle}` : (lastPos.unitTitle || `${curated.courseLevel} · ${curated.lessonTitle}`);
    const lessonTitle = isLegacyUnit ? `${curated.lessonTitle} · ${curated.badge}` : (lastPos.exerciseTitle || `${curated.lessonTitle} · ${curated.badge}`);
    
    let exerciseSnippet = 'Listen and type directly to build muscle memory.';
    let stage = lastPos.stage || 'interactive';
    let nextStep = 'Start curated interactive lesson';
    let targetRoute = curated.route;

    if (subjectId === 'swedish') {
      if (lastPos.exerciseId === 'sv-en-vanlig-morgon' || lastPos.unitId?.includes('morgon')) {
        exerciseSnippet = 'Kapitel 1: Det var en kall morgon i november.';
        nextStep = 'Continue Swedish story';
        targetRoute = '/focus/swedish/en-vanlig-morgon';
      } else {
        exerciseSnippet = 'Lyssna och skriv: Jag skulle vilja ha en kaffe.';
        nextStep = 'Type Swedish café dialogue';
        targetRoute = '/swedish';
      }
    } else if (subjectId === 'english') {
      exerciseSnippet = 'Listen and type: I need a plan with lots of data.';
      nextStep = 'Type English phone plan dialogue';
      targetRoute = '/english';
    } else if (subjectId === 'python') {
      exerciseSnippet = 'Concept & Code: name = "Ali"';
      nextStep = 'Type Python variables & code';
      targetRoute = '/python';
    } else if (subjectId === 'typing') {
      exerciseSnippet = 'Nordic special characters: å, ä, ö';
      nextStep = 'Practice typing speed';
      targetRoute = '/typing';
    }

    return {
      subjectId,
      subjectName,
      moduleName,
      lessonTitle,
      exerciseSnippet,
      stage,
      nextStep,
      percentComplete: subject.percentComplete || 0,
      targetRoute,
    };
  }

  public getRecentSessions(): RecentSessionRecord[] {
    return this.getProgress().recentSessions;
  }

  public resetProgress(): void {
    const fresh = createInitialProgress();
    this.saveProgress(fresh);
  }
}

export const progressService = new ProgressService();

export function syncTelegramProgress(progress: LearningProgress): void {
  try {
    const streakDays = progress.streak?.currentStreak || 4;
    const englishPct = progress.subjects?.english?.percentComplete ?? 85;
    const swedishPct = progress.subjects?.swedish?.percentComplete ?? 70;
    const pythonPct = progress.subjects?.python?.percentComplete ?? 60;

    let mistakesCount = 5;
    try {
      const raw = localStorage.getItem('mylearning_review_items');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) mistakesCount = parsed.length;
      }
    } catch {
      // safe fallback
    }

    fetch('/api/telegram/sync-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streakDays,
        englishPct,
        swedishPct,
        pythonPct,
        mistakesCount,
      }),
    }).catch(() => {});
  } catch {
    // Non-blocking
  }
}

// Perform initial background sync if in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      syncTelegramProgress(progressService.getProgress());
    } catch {}
  }, 1500);
}

