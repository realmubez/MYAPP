import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DbTypingStats } from './types';
import { syncQueue } from './syncQueue';
import { syncManager } from './syncManager';
import { profileRepository } from './profileRepository';
import { storageNamespace } from './storageNamespace';

export interface TouchTypingProgress {
  day: number;
  completed: boolean;
  bestWpm: number;
  averageAccuracy: number;
  totalCharactersTyped: number;
  totalMistakes: number;
  exerciseResults: any[];
  lastActiveAt: string;
  introSeen: boolean;
}

class TypingStatsRepository {
  public getTouchTypingProgress(day: number): TouchTypingProgress {
    const defaults: TouchTypingProgress = {
      day,
      completed: false,
      bestWpm: 0,
      averageAccuracy: 0,
      totalCharactersTyped: 0,
      totalMistakes: 0,
      exerciseResults: [],
      lastActiveAt: new Date().toISOString(),
      introSeen: false,
    };

    try {
      const raw = storageNamespace.getItem(`typing_day_${day}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...defaults,
            ...parsed,
            exerciseResults: Array.isArray(parsed.exerciseResults) ? parsed.exerciseResults : [],
          };
        }
      }
    } catch (e) {
      console.warn('Failed to read touch typing progress:', e);
    }

    return defaults;
  }

  public saveTouchTypingProgress(progress: TouchTypingProgress): void {
    try {
      storageNamespace.setItem(
        `typing_day_${progress.day}`,
        JSON.stringify({
          ...progress,
          lastActiveAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Failed to save touch typing progress locally:', e);
    }

    const profile = profileRepository.getLocalProfile();
    if (!profile?.id) return;

    const payload: DbTypingStats = {
      profile_id: profile.id,
      typing_day: progress.day,
      best_wpm: progress.bestWpm,
      best_accuracy: progress.averageAccuracy,
      characters_typed: progress.totalCharactersTyped,
      mistakes_count: progress.totalMistakes,
      completed: progress.completed,
      attempts: 1,
      exercise_results: progress.exerciseResults,
      last_active_at: progress.lastActiveAt,
    };

    syncQueue.enqueue('typing_stats', 'upsert', payload, 'profile_id,typing_day');
    syncManager.scheduleSync(1500);
  }

  public async pullRemoteTypingStats(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data } = await supabase
        .from('typing_stats')
        .select('*')
        .eq('profile_id', userId);

      if (data && data.length > 0) {
        for (const row of data as DbTypingStats[]) {
          const current = this.getTouchTypingProgress(row.typing_day);
          if (row.best_wpm > current.bestWpm || (row.completed && !current.completed)) {
            const merged: TouchTypingProgress = {
              ...current,
              bestWpm: Math.max(current.bestWpm, Number(row.best_wpm) || 0),
              averageAccuracy: Math.max(current.averageAccuracy, Number(row.best_accuracy) || 0),
              completed: current.completed || row.completed,
              totalCharactersTyped: Math.max(current.totalCharactersTyped, row.characters_typed),
              totalMistakes: Math.max(current.totalMistakes, row.mistakes_count),
              exerciseResults: Array.isArray(row.exercise_results) ? row.exercise_results : current.exerciseResults,
              lastActiveAt: row.last_active_at || current.lastActiveAt,
            };
            storageNamespace.setItem(`typing_day_${row.typing_day}`, JSON.stringify(merged));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to pull remote typing stats:', e);
    }
  }
}

export const typingStatsRepository = new TypingStatsRepository();

