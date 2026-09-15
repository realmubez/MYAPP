import { SubjectId, UserRole } from '../types';

export interface DbProfile {
  id: string;
  display_name: string;
  avatar: string;
  role: UserRole;
  account_status: 'active' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface DbProfileSubject {
  id: string;
  profile_id: string;
  subject_id: SubjectId;
  assigned_by?: string | null;
  assigned_at: string;
}

export interface DbLessonProgress {
  id?: string;
  profile_id: string;
  subject_id: SubjectId;
  lesson_id: string;
  unit_id?: string | null;
  current_step: number;
  completed: boolean;
  completion_percent: number;
  best_accuracy: number;
  best_wpm: number;
  last_activity_at: string;
  updated_at?: string;
}

export interface DbDailyActivity {
  id?: string;
  profile_id: string;
  activity_date: string; // YYYY-MM-DD
  study_seconds: number;
  lessons_completed: number;
  typing_seconds: number;
  review_seconds: number;
  updated_at?: string;
}

export interface DbMistake {
  id?: string;
  profile_id: string;
  item_key: string;
  subject_id: SubjectId;
  lesson_id?: string | null;
  unit_id?: string | null;
  mistake_type: string;
  target: string;
  user_answer?: string | null;
  context?: string | null;
  example_sentence?: { text: string; translation?: string } | null;
  mastery_score: number;
  mastery_level: 'needs_practice' | 'improving' | 'mastered';
  mistake_count: number;
  correct_count: number;
  last_mistake_at: string;
  last_reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbVocabulary {
  id?: string;
  profile_id: string;
  language: string;
  term: string;
  meaning?: string | null;
  example_context?: string | null;
  mastery_score: number;
  mistake_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbTypingStats {
  id?: string;
  profile_id: string;
  typing_day: number;
  best_wpm: number;
  best_accuracy: number;
  characters_typed: number;
  mistakes_count: number;
  completed: boolean;
  attempts: number;
  exercise_results: any[];
  last_active_at: string;
  updated_at?: string;
}

export interface DbUserSettings {
  profile_id: string;
  sound_enabled: boolean;
  typing_sound_volume: number;
  caret_style: string;
  font_size: string;
  tts_voice: string;
  tts_rate: number;
  swedish_translation_lang: string;
  english_translation_lang: string;
  python_support_lang: string;
  updated_at?: string;
}

export type SyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
