import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ReviewItem, SubjectId } from '../types';
import { DbMistake } from './types';
import { syncQueue } from './syncQueue';
import { syncManager } from './syncManager';
import { profileRepository } from './profileRepository';

export const REVIEW_STORAGE_KEY = 'mylearning_review_items_v1';
export const REVIEW_UPDATED_EVENT = 'mylearning_review_changed';

class MistakeRepository {
  public getLocalItems(): ReviewItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load local review items:', e);
    }
    return [];
  }

  public saveLocalItems(items: ReviewItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent(REVIEW_UPDATED_EVENT, { detail: items }));
    } catch (e) {
      console.warn('Failed to save review items locally:', e);
    }
  }

  public syncMistake(item: ReviewItem): void {
    const profile = profileRepository.getLocalProfile();
    if (!profile?.id) return;

    const payload: DbMistake = {
      profile_id: profile.id,
      item_key: item.id,
      subject_id: item.subjectId,
      lesson_id: item.lessonId || null,
      unit_id: item.unitId || null,
      mistake_type: item.category || 'Vocabulary',
      target: item.text,
      context: item.concept || null,
      example_sentence: item.exampleSentence || null,
      mastery_score: item.masteryScore,
      mastery_level: item.masteryScore >= 80 ? 'mastered' : item.masteryScore >= 40 ? 'improving' : 'needs_practice',
      mistake_count: item.mistakeCount,
      correct_count: item.correctCount,
      last_mistake_at: item.lastMistakeDate,
      last_reviewed_at: item.lastReviewedDate || null,
    };

    syncQueue.enqueue('mistakes', 'upsert', payload, 'profile_id,item_key');
    syncManager.scheduleSync(1000);
  }

  public deleteMistake(itemId: string): void {
    const profile = profileRepository.getLocalProfile();
    if (!profile?.id) return;

    syncQueue.enqueue('mistakes', 'delete', { profile_id: profile.id, item_key: itemId });
    syncManager.scheduleSync(500);
  }

  public async pullRemoteMistakes(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data: remoteRows } = await supabase
        .from('mistakes')
        .select('*')
        .eq('profile_id', userId);

      if (!remoteRows || remoteRows.length === 0) return;

      const localItems = this.getLocalItems();
      const localMap = new Map(localItems.map((it) => [it.id, it]));

      for (const row of remoteRows as DbMistake[]) {
        const existing = localMap.get(row.item_key);
        if (!existing) {
          localMap.set(row.item_key, {
            id: row.item_key,
            subjectId: row.subject_id,
            text: row.target,
            displayTitle: row.target,
            category: row.mistake_type,
            unitId: row.unit_id || undefined,
            lessonId: row.lesson_id || undefined,
            concept: row.context || undefined,
            exampleSentence: row.example_sentence || undefined,
            mistakeCount: row.mistake_count,
            correctCount: row.correct_count,
            lastMistakeDate: row.last_mistake_at,
            lastReviewedDate: row.last_reviewed_at || undefined,
            masteryScore: row.mastery_score,
            language: row.subject_id === 'english' ? 'en' : row.subject_id === 'python' ? 'python' : 'sv',
          });
        } else {
          // Latest mistake count wins
          existing.mistakeCount = Math.max(existing.mistakeCount, row.mistake_count);
          existing.correctCount = Math.max(existing.correctCount, row.correct_count);
          existing.masteryScore = row.mastery_score;
        }
      }

      this.saveLocalItems(Array.from(localMap.values()));
    } catch (e) {
      console.warn('Failed to pull remote mistakes:', e);
    }
  }
}

export const mistakeRepository = new MistakeRepository();
