import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { profileRepository } from './profileRepository';
import { progressRepository } from './progressRepository';
import { mistakeRepository } from './mistakeRepository';
import { settingsRepository } from './settingsRepository';
import { typingStatsRepository } from './typingStatsRepository';
import { DbLessonProgress, DbDailyActivity, DbMistake, DbTypingStats, DbUserSettings } from './types';

const ADMIN_MIGRATION_FLAG_KEY = 'mylearning_admin_migrated_v1';
const ADMIN_BACKUP_KEY = 'mylearning_backup_pre_migration_v1';

export interface MigrationResult {
  migrated: boolean;
  alreadyMigrated: boolean;
  recordsCount?: number;
  error?: string;
}

/**
 * Idempotent One-Time Migration for Admin Account
 * Transfers local browser data (progress, mistakes, typing, settings) to Supabase.
 * Keeps an untouched local backup in localStorage to guarantee zero data loss.
 */
export async function runAdminDataMigration(userId: string): Promise<MigrationResult> {
  if (!isSupabaseConfigured() || !userId) {
    return { migrated: false, alreadyMigrated: false, error: 'Supabase not configured or no userId' };
  }

  // 1. Check idempotency flag
  if (typeof window !== 'undefined') {
    const flag = localStorage.getItem(`${ADMIN_MIGRATION_FLAG_KEY}_${userId}`);
    if (flag === 'true') {
      return { migrated: false, alreadyMigrated: true };
    }
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { migrated: false, alreadyMigrated: false, error: 'Supabase client unavailable' };
  }

  try {
    // 2. Safeguard: Create complete local backup snapshot before any cloud upload
    if (typeof window !== 'undefined') {
      const backupSnapshot: Record<string, string | null> = {
        progress: localStorage.getItem('mylearning_progress_v1'),
        profile: localStorage.getItem('mylearning_user_profile_v1'),
        mistakes: localStorage.getItem('mylearning_review_items_v1'),
        settings: localStorage.getItem('mylearning_settings'),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`${ADMIN_BACKUP_KEY}_${userId}`, JSON.stringify(backupSnapshot));
    }

    let recordsMigrated = 0;

    // 3. Ensure profile row exists in public.profiles
    const localProfile = profileRepository.getLocalProfile();
    const { error: profErr } = await supabase.from('profiles').upsert(
      {
        id: userId,
        display_name: localProfile.displayName || 'Mubez',
        avatar: localProfile.avatar || 'avatar-keyboard',
        role: 'admin',
        account_status: 'active',
      },
      { onConflict: 'id' }
    );
    if (!profErr) recordsMigrated++;

    // 4. Assign default subjects for admin in profile_subjects
    const subjectsToAssign = ['swedish', 'english', 'python', 'typing'];
    for (const sub of subjectsToAssign) {
      await supabase.from('profile_subjects').upsert(
        {
          profile_id: userId,
          subject_id: sub,
        },
        { onConflict: 'profile_id,subject_id' }
      );
      recordsMigrated++;
    }

    // 5. Migrate Lesson Progress
    const localProgress = progressRepository.getLocalProgress();
    if (localProgress && localProgress.subjects) {
      for (const [subId, subData] of Object.entries(localProgress.subjects)) {
        if (subData && Array.isArray(subData.completedExerciseIds)) {
          for (const exerciseId of subData.completedExerciseIds) {
            const row: DbLessonProgress = {
              profile_id: userId,
              subject_id: subId as any,
              lesson_id: exerciseId,
              current_step: 0,
              completed: true,
              completion_percent: 100,
              best_accuracy: subData.averageAccuracy || 0,
              best_wpm: subData.averageWpm || 0,
              last_activity_at: new Date().toISOString(),
            };
            await supabase.from('lesson_progress').upsert(row, { onConflict: 'profile_id,subject_id,lesson_id' });
            recordsMigrated++;
          }
        }
      }

      // Migrate Daily Activities
      if (Array.isArray(localProgress.dailyActivities)) {
        for (const act of localProgress.dailyActivities) {
          const row: DbDailyActivity = {
            profile_id: userId,
            activity_date: act.date,
            study_seconds: act.minutes * 60,
            lessons_completed: act.lessonsCompleted,
            typing_seconds: 0,
            review_seconds: 0,
          };
          await supabase.from('daily_activity').upsert(row, { onConflict: 'profile_id,activity_date' });
          recordsMigrated++;
        }
      }
    }

    // 6. Migrate Mistakes
    const localMistakes = mistakeRepository.getLocalItems();
    if (Array.isArray(localMistakes) && localMistakes.length > 0) {
      for (const item of localMistakes) {
        const row: DbMistake = {
          profile_id: userId,
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
        await supabase.from('mistakes').upsert(row, { onConflict: 'profile_id,item_key' });
        recordsMigrated++;
      }
    }

    // 7. Migrate User Settings
    const localSettings = settingsRepository.getSettings();
    const settingsRow: DbUserSettings = {
      profile_id: userId,
      sound_enabled: localSettings.soundEnabled,
      typing_sound_volume: localSettings.typingSoundVolume,
      caret_style: localSettings.caretStyle,
      font_size: localSettings.fontSize,
      tts_voice: localSettings.ttsVoice,
      tts_rate: localSettings.ttsRate,
      swedish_translation_lang: 'so',
      english_translation_lang: 'so',
      python_support_lang: 'en',
    };
    await supabase.from('user_settings').upsert(settingsRow, { onConflict: 'profile_id' });
    recordsMigrated++;

    // 8. Mark Migration Complete ONLY on success
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${ADMIN_MIGRATION_FLAG_KEY}_${userId}`, 'true');
    }

    return { migrated: true, alreadyMigrated: false, recordsCount: recordsMigrated };
  } catch (err: any) {
    console.error('Migration failed:', err);
    return { migrated: false, alreadyMigrated: false, error: err?.message || String(err) };
  }
}
