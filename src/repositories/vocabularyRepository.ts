import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DbVocabulary } from './types';
import { syncQueue } from './syncQueue';
import { syncManager } from './syncManager';
import { profileRepository } from './profileRepository';

export interface VocabularyItem {
  id: string;
  language: string;
  term: string;
  meaning?: string;
  exampleContext?: string;
  masteryScore: number;
  mistakeCount: number;
}

const VOCAB_STORAGE_KEY = 'mylearning_vocabulary_v1';

class VocabularyRepository {
  public getLocalVocabulary(): VocabularyItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load local vocabulary:', e);
    }
    return [];
  }

  public saveLocalVocabulary(items: VocabularyItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save vocabulary locally:', e);
    }
  }

  public syncVocabularyItem(item: VocabularyItem): void {
    const profile = profileRepository.getLocalProfile();
    if (!profile?.id) return;

    const payload: DbVocabulary = {
      profile_id: profile.id,
      language: item.language,
      term: item.term,
      meaning: item.meaning || null,
      example_context: item.exampleContext || null,
      mastery_score: item.masteryScore,
      mistake_count: item.mistakeCount,
    };

    syncQueue.enqueue('vocabulary', 'upsert', payload, 'profile_id,language,term');
    syncManager.scheduleSync(1500);
  }

  public async pullRemoteVocabulary(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('profile_id', userId);

      if (data && data.length > 0) {
        const local = this.getLocalVocabulary();
        const map = new Map(local.map((i) => [`${i.language}:${i.term}`, i]));

        for (const row of data as DbVocabulary[]) {
          const key = `${row.language}:${row.term}`;
          map.set(key, {
            id: row.id || key,
            language: row.language,
            term: row.term,
            meaning: row.meaning || undefined,
            exampleContext: row.example_context || undefined,
            masteryScore: row.mastery_score,
            mistakeCount: row.mistake_count,
          });
        }

        this.saveLocalVocabulary(Array.from(map.values()));
      }
    } catch (e) {
      console.warn('Failed to pull remote vocabulary:', e);
    }
  }
}

export const vocabularyRepository = new VocabularyRepository();
