import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { LearningProgress, SubjectId } from '../types';
import { DbLessonProgress, DbDailyActivity } from './types';
import { syncQueue } from './syncQueue';
import { syncManager } from './syncManager';
import { profileRepository } from './profileRepository';
import { storageNamespace } from './storageNamespace';

export const PROGRESS_STORAGE_KEY = 'progress';
export const PROGRESS_UPDATED_EVENT = 'mylearning_progress_changed';

class ProgressRepository {
  /**
   * Reads learning progress from namespaced localStorage.
   */
  public getLocalProgress(): LearningProgress | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = storageNamespace.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load local progress:', e);
    }
    return null;
  }

  /**
   * Saves learning progress to namespaced localStorage and queues granular cloud updates.
   */
  public saveLocalProgress(progress: LearningProgress): void {
    if (typeof window === 'undefined') return;
    try {
      storageNamespace.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT, { detail: progress }));
    } catch (e) {
      console.warn('Failed to save progress locally:', e);
    }
  }

  /**
   * Queues an exercise completion event to Supabase `lesson_progress` table.
   */
  public syncLessonProgress(
    subjectId: SubjectId,
    lessonId: string,
    unitId: string | undefined,
    currentStep: number,
    completed: boolean,
    completionPercent: number,
    bestAccuracy: number,
    bestWpm: number
  ): void {
    const profile = profileRepository.getLocalProfile();
    if (!profile?.id) return;

    const payload: DbLessonProgress = {
      profile_id: profile.id,
      subject_id: subjectId,
      lesson_id: lessonId,
      unit_id: unitId || null,
      current_step: currentStep,
      completed,
      completion_percent: completionPercent,
      best_accuracy: bestAccuracy,
      best_wpm: bestWpm,
      last_activity_at: new Date().toISOString(),
    };

    syncQueue.enqueue('lesson_progress', 'upsert', payload, 'profile_id,subject_id,lesson_id');
    syncManager.scheduleSync(1000);
  }

  /**
   * Queues daily activity update to Supabase `daily_activity` table.
   */
  public syncDailyActivity(
    activityDate: string,
    studySeconds: number,
    lessonsCompleted: number,
    typingSeconds: number,
    reviewSeconds: number
  ): void {
    const profile = profileRepository.getLocalProfile();
    if (!profile?.id) return;

    const payload: DbDailyActivity = {
      profile_id: profile.id,
      activity_date: activityDate,
      study_seconds: studySeconds,
      lessons_completed: lessonsCompleted,
      typing_seconds: typingSeconds,
      review_seconds: reviewSeconds,
    };

    syncQueue.enqueue('daily_activity', 'upsert', payload, 'profile_id,activity_date');
    syncManager.scheduleSync(2000);
  }

  /**
   * Pulls remote progress for the user from Supabase and merges deterministically.
   * Latest valid update / highest accuracy wins.
   */
  public async pullRemoteProgress(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data: remoteLessons } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('profile_id', userId);

      if (!remoteLessons || remoteLessons.length === 0) return;

      const current = this.getLocalProgress();
      if (!current) return;

      let changed = false;
      for (const row of remoteLessons as DbLessonProgress[]) {
        const sub = current.subjects[row.subject_id];
        if (sub) {
          if (row.completed && !sub.completedExerciseIds.includes(row.lesson_id)) {
            sub.completedExerciseIds.push(row.lesson_id);
            sub.completedLessons = sub.completedExerciseIds.length;
            changed = true;
          }
        }
      }

      if (changed) {
        this.saveLocalProgress(current);
      }
    } catch (e) {
      console.warn('Failed to pull remote progress:', e);
    }
  }
}

export const progressRepository = new ProgressRepository();
