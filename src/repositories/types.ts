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

/* =======================================================
   LEARNING SPACES DATA MODELS (PHASE 2)
======================================================= */
export type SpaceType = 'managed' | 'personal' | 'cohort';
export type SpaceStatus = 'active' | 'archived' | 'suspended';
export type SpaceMemberRole = 'owner' | 'manager' | 'learner';
export type SpaceMemberStatus = 'active' | 'invited' | 'suspended';
export type CurriculumItemStatus = 'draft' | 'published' | 'archived';

export interface DbLearningSpace {
  id: string;
  owner_profile_id: string;
  title: string;
  slug: string;
  description?: string | null;
  type: SpaceType;
  primary_language: string;
  support_languages: string[];
  status: SpaceStatus;
  created_at: string;
  updated_at: string;
}

export interface DbLearningSpaceMember {
  id: string;
  space_id: string;
  profile_id: string;
  role: SpaceMemberRole;
  status: SpaceMemberStatus;
  joined_at: string;
  last_active_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbLearningSpaceSubject {
  id: string;
  space_id: string;
  subject_id: SubjectId | string;
  created_at: string;
}

export interface DbLearningSpaceModule {
  id: string;
  space_id: string;
  subject_id: SubjectId | string;
  title: string;
  description?: string | null;
  sort_order: number;
  status: CurriculumItemStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbLearningSpaceLesson {
  id: string;
  space_id: string;
  module_id?: string | null;
  subject_id: SubjectId | string;
  title: string;
  description?: string | null;
  content: Record<string, any>;
  status: CurriculumItemStatus;
  sort_order: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbLearningSpaceProgress {
  id: string;
  space_id: string;
  lesson_id: string;
  profile_id: string;
  completed: boolean;
  completion_percent: number;
  score?: number | null;
  time_spent_seconds: number;
  activity_data: Record<string, any>;
  last_studied_at: string;
  created_at: string;
  updated_at: string;
}

/* =======================================================
   SHARED LIBRARY & STORAGE DATA MODELS (PHASE 3)
======================================================= */
export type LibraryFileType = 'pdf' | 'image' | 'document' | 'other';
export type LibrarySourceType = 'upload' | 'google_drive';

export interface DbLibraryFolder {
  id: string;
  owner_profile_id: string;
  space_id?: string | null;
  parent_id?: string | null;
  name: string;
  icon?: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbLibraryFile {
  id: string;
  owner_profile_id: string;
  space_id?: string | null;
  folder_id?: string | null;
  subject_id?: string | null;
  title: string;
  file_name: string;
  file_type: LibraryFileType;
  mime_type: string;
  file_size: number;
  storage_path: string;
  source_type: LibrarySourceType;
  external_id?: string | null;
  page_count?: number | null;
  last_read_page?: number | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
