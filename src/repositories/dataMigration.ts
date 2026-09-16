import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { profileRepository } from './profileRepository';
import { progressRepository } from './progressRepository';
import { mistakeRepository } from './mistakeRepository';
import { settingsRepository } from './settingsRepository';
import { vocabularyRepository } from './vocabularyRepository';
import { DbLessonProgress, DbDailyActivity, DbMistake, DbTypingStats, DbUserSettings, DbVocabulary } from './types';
import { getTouchTypingProgress } from '../data/typingCurriculum';

export const ADMIN_MIGRATION_FLAG_KEY = 'mylearning_admin_migrated_v1';
export const ADMIN_BACKUP_KEY = 'mylearning_backup_pre_supabase_v1';

export interface MigrationSummary {
  migrated: boolean;
  alreadyMigrated: boolean;
  userId?: string;
  counts: {
    profiles: number;
    subjects: number;
    lessonProgress: number;
    dailyActivity: number;
    mistakes: number;
    vocabulary: number;
    typingStats: number;
    settings: number;
  };
  error?: string;
}

/**
 * Idempotent One-Time Migration for Admin Account
 * Safely transfers local browser data (progress, mistakes, typing, vocabulary, settings) to Supabase.
 * Strictly verifies authenticated Admin identity first.
 * Creates an untouched local backup in localStorage (`mylearning_backup_pre_supabase_v1`).
 */
export async function runAdminDataMigration(userId: string): Promise<MigrationSummary> {
  const emptyCounts = {
    profiles: 0,
    subjects: 0,
    lessonProgress: 0,
    dailyActivity: 0,
    mistakes: 0,
    vocabulary: 0,
    typingStats: 0,
    settings: 0,
  };

  if (!isSupabaseConfigured() || !userId) {
    return { migrated: false, alreadyMigrated: false, counts: emptyCounts, error: 'Supabase not configured or no userId' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { migrated: false, alreadyMigrated: false, counts: emptyCounts, error: 'Supabase client unavailable' };
  }

  try {
    // 1. Authenticated Identity Verification
    const { data: authSession } = await supabase.auth.getSession();
    const sessionUid = authSession?.session?.user?.id;
    if (!sessionUid || sessionUid !== userId) {
      return {
        migrated: false,
        alreadyMigrated: false,
        counts: emptyCounts,
        error: `Identity check failed: session UID (${sessionUid || 'null'}) does not match requested userId (${userId})`,
      };
    }

    const { data: profileRow, error: profFetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUid)
      .single();

    if (profFetchErr || !profileRow) {
      return {
        migrated: false,
        alreadyMigrated: false,
        counts: emptyCounts,
        error: `Profile verification failed: ${profFetchErr?.message || 'Profile row not found'}`,
      };
    }

    if (profileRow.role !== 'admin') {
      return {
        migrated: false,
        alreadyMigrated: false,
        counts: emptyCounts,
        error: `Profile role is '${profileRow.role}', expected 'admin'`,
      };
    }

    // 2. Check Idempotency Flag
    if (typeof window !== 'undefined') {
      const flag = localStorage.getItem(`${ADMIN_MIGRATION_FLAG_KEY}_${userId}`) || localStorage.getItem(ADMIN_MIGRATION_FLAG_KEY);
      if (flag === 'true') {
        return { migrated: false, alreadyMigrated: true, counts: emptyCounts, userId };
      }
    }

    // 3. SAFEGUARD: Create complete local backup snapshot before any cloud operations
    // NEVER overwrite a valid existing backup
    if (typeof window !== 'undefined') {
      const existingBackup = localStorage.getItem(ADMIN_BACKUP_KEY) || localStorage.getItem(`${ADMIN_BACKUP_KEY}_${userId}`);
      if (!existingBackup) {
        const typingDaysBackup: Record<string, string | null> = {};
        for (let d = 1; d <= 30; d++) {
          const val = localStorage.getItem(`my_learning_typing_day_${d}`);
          if (val) typingDaysBackup[`day_${d}`] = val;
        }

        const backupSnapshot = {
          progress: localStorage.getItem('mylearning_progress_v1'),
          profile: localStorage.getItem('mylearning_user_profile_v1'),
          mistakes: localStorage.getItem('mylearning_review_items_v1'),
          settings: localStorage.getItem('mylearning_settings'),
          vocabulary: localStorage.getItem('mylearning_vocabulary_v1'),
          touchTypingDays: typingDaysBackup,
          createdAt: new Date().toISOString(),
          userId,
        };

        localStorage.setItem(ADMIN_BACKUP_KEY, JSON.stringify(backupSnapshot));
        localStorage.setItem(`${ADMIN_BACKUP_KEY}_${userId}`, JSON.stringify(backupSnapshot));
      }
    }

    const counts = { ...emptyCounts };

    // 4. Update Profile in public.profiles
    const localProfile = profileRepository.getLocalProfile();
    const { error: profErr } = await supabase.from('profiles').upsert(
      {
        id: userId,
        display_name: localProfile.displayName || profileRow.display_name || 'Mubez',
        avatar: localProfile.avatar || profileRow.avatar || 'avatar-keyboard',
        role: 'admin',
        account_status: 'active',
      },
      { onConflict: 'id' }
    );
    if (!profErr) counts.profiles = 1;

    // 5. Assign default subjects for admin in profile_subjects
    const subjectsToAssign = ['swedish', 'english', 'python', 'typing'];
    for (const sub of subjectsToAssign) {
      const { error: subErr } = await supabase.from('profile_subjects').upsert(
        {
          profile_id: userId,
          subject_id: sub,
        },
        { onConflict: 'profile_id,subject_id' }
      );
      if (!subErr) counts.subjects++;
    }

    // 6. Migrate Lesson Progress
    const localProgress = progressRepository.getLocalProgress();
    if (localProgress) {
      const lessonMap = new Map<string, DbLessonProgress>();

      // A. Granular exercises
      if (localProgress.exercises) {
        for (const [exerciseId, exData] of Object.entries(localProgress.exercises)) {
          if (exData) {
            lessonMap.set(`${exData.subjectId}:${exerciseId}`, {
              profile_id: userId,
              subject_id: exData.subjectId,
              lesson_id: exerciseId,
              unit_id: exData.unitId || null,
              current_step: 0,
              completed: exData.completed ?? true,
              completion_percent: exData.completed ? 100 : 0,
              best_accuracy: exData.bestAccuracy || 0,
              best_wpm: exData.bestWpm || 0,
              last_activity_at: exData.completedAt || new Date().toISOString(),
            });
          }
        }
      }

      // B. Subject completed exercise IDs (ensure none missed)
      if (localProgress.subjects) {
        for (const [subId, subData] of Object.entries(localProgress.subjects)) {
          if (subData && Array.isArray(subData.completedExerciseIds)) {
            for (const exerciseId of subData.completedExerciseIds) {
              const key = `${subId}:${exerciseId}`;
              if (!lessonMap.has(key)) {
                lessonMap.set(key, {
                  profile_id: userId,
                  subject_id: subId as any,
                  lesson_id: exerciseId,
                  unit_id: null,
                  current_step: 0,
                  completed: true,
                  completion_percent: 100,
                  best_accuracy: subData.averageAccuracy || 0,
                  best_wpm: subData.averageWpm || 0,
                  last_activity_at: new Date().toISOString(),
                });
              }
            }
          }
        }
      }

      // Upsert all unique lesson progresses
      for (const row of lessonMap.values()) {
        const { error: lessonErr } = await supabase
          .from('lesson_progress')
          .upsert(row, { onConflict: 'profile_id,subject_id,lesson_id' });
        if (!lessonErr) counts.lessonProgress++;
      }

      // Migrate Daily Activities
      if (localProgress.dailyActivities) {
        const activitiesList = Array.isArray(localProgress.dailyActivities)
          ? localProgress.dailyActivities
          : Object.values(localProgress.dailyActivities);

        for (const act of activitiesList) {
          if (act && act.date) {
            const row: DbDailyActivity = {
              profile_id: userId,
              activity_date: act.date,
              study_seconds: (act as any).studyTimeSeconds ?? ((act as any).minutes ? (act as any).minutes * 60 : 0),
              lessons_completed: act.lessonsCompleted || 0,
              typing_seconds: 0,
              review_seconds: 0,
            };
            const { error: actErr } = await supabase
              .from('daily_activity')
              .upsert(row, { onConflict: 'profile_id,activity_date' });
            if (!actErr) counts.dailyActivity++;
          }
        }
      }
    }

    // 7. Migrate Mistakes / Review Items
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
          last_mistake_at: item.lastMistakeDate || new Date().toISOString(),
          last_reviewed_at: item.lastReviewedDate || null,
        };
        const { error: mistErr } = await supabase.from('mistakes').upsert(row, { onConflict: 'profile_id,item_key' });
        if (!mistErr) counts.mistakes++;
      }
    }

    // 8. Migrate Vocabulary
    const localVocab = vocabularyRepository.getLocalVocabulary();
    if (Array.isArray(localVocab) && localVocab.length > 0) {
      for (const item of localVocab) {
        const row: DbVocabulary = {
          profile_id: userId,
          language: item.language,
          term: item.term,
          meaning: item.meaning || null,
          example_context: item.exampleContext || null,
          mastery_score: item.masteryScore || 0,
          mistake_count: item.mistakeCount || 0,
        };
        const { error: vocabErr } = await supabase
          .from('vocabulary')
          .upsert(row, { onConflict: 'profile_id,language,term' });
        if (!vocabErr) counts.vocabulary++;
      }
    }

    // 9. Migrate Touch Typing Stats (Days 1 to 30)
    for (let day = 1; day <= 30; day++) {
      const typingProg = getTouchTypingProgress(day);
      if (typingProg && (typingProg.completed || typingProg.bestWpm > 0 || typingProg.totalCharactersTyped > 0 || (typingProg.exerciseResults && typingProg.exerciseResults.length > 0))) {
        const row: DbTypingStats = {
          profile_id: userId,
          typing_day: day,
          best_wpm: typingProg.bestWpm,
          best_accuracy: typingProg.averageAccuracy,
          characters_typed: typingProg.totalCharactersTyped,
          mistakes_count: typingProg.totalMistakes,
          completed: typingProg.completed,
          attempts: 1,
          exercise_results: typingProg.exerciseResults || [],
          last_active_at: typingProg.lastActiveAt || new Date().toISOString(),
        };
        const { error: typErr } = await supabase
          .from('typing_stats')
          .upsert(row, { onConflict: 'profile_id,typing_day' });
        if (!typErr) counts.typingStats++;
      }
    }

    // 10. Migrate User Settings
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
    const { error: setErr } = await supabase.from('user_settings').upsert(settingsRow, { onConflict: 'profile_id' });
    if (!setErr) counts.settings = 1;

    // 11. Mark Migration Complete ONLY on success
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_MIGRATION_FLAG_KEY, 'true');
      localStorage.setItem(`${ADMIN_MIGRATION_FLAG_KEY}_${userId}`, 'true');
    }

    return { migrated: true, alreadyMigrated: false, counts, userId };
  } catch (err: any) {
    console.error('Migration failed:', err);
    return { migrated: false, alreadyMigrated: false, counts: emptyCounts, error: err?.message || String(err) };
  }
}

