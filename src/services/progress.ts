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

import { storageNamespace } from '../repositories/storageNamespace';

export const PROGRESS_STORAGE_KEY = 'progress';
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

export function formatTimeAgo(timestampStr?: string | null): string {
  if (!timestampStr || typeof timestampStr !== 'string') return 'Recently';
  try {
    const time = new Date(timestampStr).getTime();
    if (isNaN(time) || time <= 0) return 'Recently';
    const diff = Date.now() - time;
    if (diff < 0) return 'Just now';
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
    return 'Recently';
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

  public clearCache(): void {
    this.memoryCache = null;
  }

  public getProgress(): LearningProgress {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    try {
      const raw = storageNamespace.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
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
      storageNamespace.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save learning progress to localStorage:', e);
    }

    // Notify listeners across app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT, { detail: progress }));
      syncTelegramProgress(progress);
    }
  }

  private validateAndHydrateProgress(p: any): LearningProgress {
    const today = getTodayDateString();
    const defaults = createInitialProgress();

    // Deep merge and validate each subject
    const rawSubjects = (p && typeof p.subjects === 'object' && p.subjects !== null) ? p.subjects : {};
    const subjects: Record<SubjectId, SubjectProgress> = { ...defaults.subjects };

    (Object.keys(defaults.subjects) as SubjectId[]).forEach((key) => {
      const defSub = defaults.subjects[key];
      const rawSub = rawSubjects[key] && typeof rawSubjects[key] === 'object' ? rawSubjects[key] : {};

      const completedExerciseIds: string[] = Array.isArray(rawSub.completedExerciseIds)
        ? rawSub.completedExerciseIds.filter((id: any): id is string => typeof id === 'string')
        : [];

      let completedCount = typeof rawSub.completedLessons === 'number' ? rawSub.completedLessons : 0;

      if (key === 'swedish') {
        const u1 = p?.exercises?.['sv-pa-cafe']?.completed ||
          completedExerciseIds.includes('sv-pa-cafe') ? 1 : 0;
        const u2 = p?.exercises?.['sv-en-vanlig-morgon']?.completed ||
          completedExerciseIds.includes('sv-en-vanlig-morgon') ? 1 : 0;
        const derived = u1 + u2;
        if (derived > 0) {
          completedCount = derived;
        } else if (completedCount === 0 && (rawSub.completedLessons ?? 0) > 0) {
          completedCount = Math.min(2, rawSub.completedLessons || 1);
        }
      } else if (key === 'english') {
        const isCompleted = p?.exercises?.['en-phone-plans']?.completed ||
          completedExerciseIds.includes('en-phone-plans') ||
          (rawSub.completedLessons ?? 0) > 0;
        completedCount = isCompleted ? 1 : completedCount;
      } else if (key === 'python') {
        const isCompleted = p?.exercises?.['py-variables']?.completed ||
          completedExerciseIds.includes('py-variables') ||
          (rawSub.completedLessons ?? 0) > 0;
        completedCount = isCompleted ? 1 : completedCount;
      }

      const totalLessons = TOTAL_LESSONS_BY_SUBJECT[key] || defSub.totalLessons || 1;
      const finalCompleted = Math.min(totalLessons, Math.max(0, completedCount));
      const percentComplete = Math.min(100, Math.round((finalCompleted / totalLessons) * 100));

      subjects[key] = {
        subjectId: key,
        completedLessons: finalCompleted,
        totalLessons,
        percentComplete,
        totalStudyTimeSeconds: typeof rawSub.totalStudyTimeSeconds === 'number' ? rawSub.totalStudyTimeSeconds : 0,
        averageWpm: typeof rawSub.averageWpm === 'number' ? rawSub.averageWpm : 0,
        averageAccuracy: typeof rawSub.averageAccuracy === 'number' ? rawSub.averageAccuracy : 0,
        lastUnitId: rawSub.lastUnitId || defSub.lastUnitId,
        lastUnitTitle: rawSub.lastUnitTitle || defSub.lastUnitTitle,
        lastExerciseId: rawSub.lastExerciseId || defSub.lastExerciseId,
        lastExerciseTitle: rawSub.lastExerciseTitle || defSub.lastExerciseTitle,
        lastCompletedAt: rawSub.lastCompletedAt,
        completedExerciseIds,
      };
    });

    // Ensure daily activities structure
    const dailyActivities: Record<string, DailyActivity> = {};
    if (p?.dailyActivities && typeof p.dailyActivities === 'object') {
      Object.entries(p.dailyActivities).forEach(([dateStr, rec]: [string, any]) => {
        if (rec && typeof rec === 'object') {
          dailyActivities[dateStr] = {
            date: dateStr,
            studyTimeSeconds: typeof rec.studyTimeSeconds === 'number' ? rec.studyTimeSeconds : 0,
            lessonsCompleted: typeof rec.lessonsCompleted === 'number' ? rec.lessonsCompleted : 0,
            exercisesCompleted: typeof rec.exercisesCompleted === 'number' ? rec.exercisesCompleted : 0,
            wpmSamples: Array.isArray(rec.wpmSamples) ? rec.wpmSamples.filter((w: any) => typeof w === 'number') : [],
            accuracySamples: Array.isArray(rec.accuracySamples) ? rec.accuracySamples.filter((a: any) => typeof a === 'number') : [],
          };
        }
      });
    }

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

    // Validate streak
    const streak = {
      currentStreak: typeof p?.streak?.currentStreak === 'number' ? p.streak.currentStreak : defaults.streak.currentStreak,
      longestStreak: typeof p?.streak?.longestStreak === 'number' ? p.streak.longestStreak : defaults.streak.longestStreak,
      lastActiveDate: typeof p?.streak?.lastActiveDate === 'string' ? p.streak.lastActiveDate : defaults.streak.lastActiveDate,
    };

    // Validate overall
    const overall = {
      totalTimeSeconds: typeof p?.overall?.totalTimeSeconds === 'number' ? p.overall.totalTimeSeconds : defaults.overall.totalTimeSeconds,
      totalExercisesCompleted: typeof p?.overall?.totalExercisesCompleted === 'number' ? p.overall.totalExercisesCompleted : defaults.overall.totalExercisesCompleted,
      totalLessonsCompleted: typeof p?.overall?.totalLessonsCompleted === 'number' ? p.overall.totalLessonsCompleted : defaults.overall.totalLessonsCompleted,
      averageWpm: typeof p?.overall?.averageWpm === 'number' ? p.overall.averageWpm : defaults.overall.averageWpm,
      averageAccuracy: typeof p?.overall?.averageAccuracy === 'number' ? p.overall.averageAccuracy : defaults.overall.averageAccuracy,
    };

    // Validate last position
    const rawPos = p?.lastPosition && typeof p.lastPosition === 'object' ? p.lastPosition : {};
    const lastPosSubjectId = (rawPos.subjectId && defaults.subjects[rawPos.subjectId as SubjectId])
      ? (rawPos.subjectId as SubjectId)
      : 'swedish';

    const lastPosition: LastPosition = {
      ...defaults.lastPosition,
      ...rawPos,
      subjectId: lastPosSubjectId,
      updatedAt: rawPos.updatedAt || new Date().toISOString(),
    };

    return {
      version: 1,
      lastPosition,
      subjects,
      dailyActivities,
      exercises: p?.exercises && typeof p.exercises === 'object' ? p.exercises : {},
      recentSessions: Array.isArray(p?.recentSessions) ? p.recentSessions : [],
      difficultWords: p?.difficultWords && typeof p.difficultWords === 'object' ? p.difficultWords : {},
      streak,
      overall,
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
    try {
      const progress = this.getProgress();
      const today = getTodayDateString();
      const day = progress?.dailyActivities?.[today];

      const todayMinutes = (day && typeof day.studyTimeSeconds === 'number')
        ? Math.round(day.studyTimeSeconds / 60)
        : 0;
      const lessonsToday = (day && typeof day.lessonsCompleted === 'number')
        ? day.lessonsCompleted
        : 0;

      // Calculate accuracy & WPM from today or overall
      let accuracy = progress?.overall?.averageAccuracy ?? 0;
      let wpm = progress?.overall?.averageWpm ?? 0;

      if (day && Array.isArray(day.accuracySamples) && day.accuracySamples.length > 0) {
        const sum = day.accuracySamples.reduce((a, b) => a + (Number(b) || 0), 0);
        accuracy = Math.round((sum / day.accuracySamples.length) * 10) / 10;
      }
      if (day && Array.isArray(day.wpmSamples) && day.wpmSamples.length > 0) {
        const sum = day.wpmSamples.reduce((a, b) => a + (Number(b) || 0), 0);
        wpm = Math.round(sum / day.wpmSamples.length);
      }

      return {
        todayLearningMinutes: todayMinutes,
        lessonsCompletedToday: lessonsToday,
        averageAccuracy: accuracy || 0,
        currentWpm: wpm || 0,
        streakDays: progress?.streak?.currentStreak || 0,
        totalExercisesCompleted: progress?.overall?.totalExercisesCompleted || 0,
      };
    } catch (e) {
      console.warn('Error in getUserStats:', e);
      return {
        todayLearningMinutes: 0,
        lessonsCompletedToday: 0,
        averageAccuracy: 0,
        currentWpm: 0,
        streakDays: 0,
        totalExercisesCompleted: 0,
      };
    }
  }

  public getContinueInfo(): ContinueInfo {
    try {
      const progress = this.getProgress();
      const lastPos: LastPosition = progress?.lastPosition || {
        subjectId: 'swedish',
        unitId: 'sv-pa-cafe',
        unitTitle: 'Beginner 1 · På café',
        exerciseId: 'sv-pa-cafe',
        exerciseTitle: 'På café · Interactive Session',
        stage: 'interactive',
        updatedAt: new Date().toISOString(),
      };
      const subjectId = (lastPos.subjectId && CURATED_LESSONS[lastPos.subjectId])
        ? lastPos.subjectId
        : 'swedish';
      const subject = progress?.subjects?.[subjectId] || progress?.subjects?.swedish || { percentComplete: 0 };
      const curated = CURATED_LESSONS[subjectId] || CURATED_LESSONS.swedish;

      const subjectName = SUBJECT_DISPLAY_NAMES[subjectId] || 'Swedish';

      // Use curated module & lesson title if old/hidden IDs are present
      const isLegacyUnit =
        !lastPos.unitId ||
        (typeof lastPos.unitId === 'string' && lastPos.unitId.startsWith('unit-')) ||
        (typeof lastPos.unitTitle === 'string' && (lastPos.unitTitle.includes('Hälsningar') || lastPos.unitTitle.includes('Greetings')));

      const moduleName = isLegacyUnit
        ? `${curated.courseLevel} · ${curated.lessonTitle}`
        : (lastPos.unitTitle || `${curated.courseLevel} · ${curated.lessonTitle}`);
      const lessonTitle = isLegacyUnit
        ? `${curated.lessonTitle} · ${curated.badge}`
        : (lastPos.exerciseTitle || `${curated.lessonTitle} · ${curated.badge}`);

      let exerciseSnippet = 'Listen and type directly to build muscle memory.';
      let stage = lastPos.stage || 'interactive';
      let nextStep = 'Start curated interactive lesson';
      let targetRoute = curated.route;

      if (subjectId === 'swedish') {
        if (lastPos.exerciseId === 'sv-en-vanlig-morgon' || (typeof lastPos.unitId === 'string' && lastPos.unitId.includes('morgon'))) {
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
        percentComplete: typeof subject.percentComplete === 'number' ? subject.percentComplete : 0,
        targetRoute,
      };
    } catch (e) {
      console.warn('Error in getContinueInfo:', e);
      return {
        subjectId: 'swedish',
        subjectName: 'Swedish',
        moduleName: 'Beginner 1 · På café',
        lessonTitle: 'På café · Interactive Session',
        exerciseSnippet: 'Lyssna och skriv: Jag skulle vilja ha en kaffe.',
        stage: 'listen_type',
        nextStep: 'Type Swedish café dialogue',
        percentComplete: 0,
        targetRoute: '/swedish',
      };
    }
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

