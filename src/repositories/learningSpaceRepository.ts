import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  DbLearningSpace,
  DbLearningSpaceMember,
  DbLearningSpaceSubject,
  DbLearningSpaceModule,
  DbLearningSpaceLesson,
  DbLearningSpaceProgress,
} from './types';
import { LearningSpaceSummary } from '../services/experienceResolver';
import { SubjectId } from '../types';

export class LearningSpaceRepository {
  /**
   * Retrieves all spaces where the profile is an active member or owner.
   */
  public async getSpacesForProfile(profileId: string): Promise<LearningSpaceSummary[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      // Fetch space memberships for the profile
      const { data: memberships, error: memberErr } = await supabase
        .from('learning_space_members')
        .select(`
          space_id,
          role,
          status,
          learning_spaces (
            id,
            slug,
            title,
            owner_profile_id,
            status
          )
        `)
        .eq('profile_id', profileId)
        .eq('status', 'active');

      if (memberErr || !memberships) {
        console.warn('Failed to fetch space memberships:', memberErr);
        return [];
      }

      const summaries: LearningSpaceSummary[] = [];

      for (const m of memberships) {
        const space = (m as any).learning_spaces;
        if (!space || space.status !== 'active') continue;

        // Fetch subjects associated with this space
        const { data: subjects } = await supabase
          .from('learning_space_subjects')
          .select('subject_id')
          .eq('space_id', space.id);

        const assignedSubjects: SubjectId[] = (subjects || []).map(
          (s: { subject_id: string }) => s.subject_id as SubjectId
        );

        summaries.push({
          id: space.id,
          slug: space.slug,
          title: space.title,
          role: m.role as 'owner' | 'manager' | 'learner',
          assignedSubjects,
          isPrimary: true,
        });
      }

      return summaries;
    } catch (err) {
      console.warn('Error querying spaces for profile:', err);
      return [];
    }
  }

  /**
   * Fetches space metadata by its unique slug.
   */
  public async getSpaceBySlug(slug: string): Promise<DbLearningSpace | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('learning_spaces')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as DbLearningSpace;
  }

  /**
   * Fetches active members of a space (subject to RLS).
   */
  public async getSpaceMembers(spaceId: string): Promise<DbLearningSpaceMember[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('learning_space_members')
      .select('*')
      .eq('space_id', spaceId)
      .order('joined_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data as DbLearningSpaceMember[];
  }

  /**
   * Fetches subjects assigned to a space.
   */
  public async getSpaceSubjects(spaceId: string): Promise<DbLearningSpaceSubject[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('learning_space_subjects')
      .select('*')
      .eq('space_id', spaceId);

    if (error || !data) {
      return [];
    }

    return data as DbLearningSpaceSubject[];
  }

  /**
   * Fetches published curriculum (modules and lessons) for learners.
   * RLS strictly ensures learners only receive published records.
   */
  public async getPublishedCurriculum(
    spaceId: string,
    subjectId?: string
  ): Promise<{ modules: DbLearningSpaceModule[]; lessons: DbLearningSpaceLesson[] }> {
    const supabase = getSupabase();
    if (!supabase) return { modules: [], lessons: [] };

    let modQuery = supabase
      .from('learning_space_modules')
      .select('*')
      .eq('space_id', spaceId)
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (subjectId) {
      modQuery = modQuery.eq('subject_id', subjectId);
    }

    const { data: modules } = await modQuery;

    let lessonQuery = supabase
      .from('learning_space_lessons')
      .select('*')
      .eq('space_id', spaceId)
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (subjectId) {
      lessonQuery = lessonQuery.eq('subject_id', subjectId);
    }

    const { data: lessons } = await lessonQuery;

    return {
      modules: (modules || []) as DbLearningSpaceModule[],
      lessons: (lessons || []) as DbLearningSpaceLesson[],
    };
  }

  /**
   * Fetches full curriculum (including drafts) for Space Owners / Managers.
   */
  public async getFullCurriculum(
    spaceId: string,
    subjectId?: string
  ): Promise<{ modules: DbLearningSpaceModule[]; lessons: DbLearningSpaceLesson[] }> {
    const supabase = getSupabase();
    if (!supabase) return { modules: [], lessons: [] };

    let modQuery = supabase
      .from('learning_space_modules')
      .select('*')
      .eq('space_id', spaceId)
      .order('sort_order', { ascending: true });

    if (subjectId) {
      modQuery = modQuery.eq('subject_id', subjectId);
    }

    const { data: modules } = await modQuery;

    let lessonQuery = supabase
      .from('learning_space_lessons')
      .select('*')
      .eq('space_id', spaceId)
      .order('sort_order', { ascending: true });

    if (subjectId) {
      lessonQuery = lessonQuery.eq('subject_id', subjectId);
    }

    const { data: lessons } = await lessonQuery;

    return {
      modules: (modules || []) as DbLearningSpaceModule[],
      lessons: (lessons || []) as DbLearningSpaceLesson[],
    };
  }

  /**
   * Saves or updates a learner's space progress.
   * RLS strictly enforces that profile_id matches auth.uid().
   */
  public async saveLearnerProgress(
    progress: Omit<DbLearningSpaceProgress, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('learning_space_progress')
        .upsert(
          {
            space_id: progress.space_id,
            lesson_id: progress.lesson_id,
            profile_id: progress.profile_id,
            completed: progress.completed,
            completion_percent: progress.completion_percent,
            score: progress.score ?? null,
            time_spent_seconds: progress.time_spent_seconds,
            activity_data: progress.activity_data || {},
            last_studied_at: progress.last_studied_at || new Date().toISOString(),
          },
          {
            onConflict: 'space_id,lesson_id,profile_id',
          }
        );

      if (error) {
        console.warn('Failed to save space progress to Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Error saving learner space progress:', err);
      return false;
    }
  }

  /**
   * Fetches space progress records for a learner.
   * RLS allows the learner to view their own progress, and the space owner to view
   * progress within their owned space.
   */
  public async getLearnerProgress(
    spaceId: string,
    profileId: string
  ): Promise<DbLearningSpaceProgress[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('learning_space_progress')
      .select('*')
      .eq('space_id', spaceId)
      .eq('profile_id', profileId);

    if (error || !data) {
      return [];
    }

    return data as DbLearningSpaceProgress[];
  }
}

export const learningSpaceRepository = new LearningSpaceRepository();
