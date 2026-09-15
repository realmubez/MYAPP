-- ==============================================================================
-- MY LEARNING — PHASE 3: SUPABASE + MULTI-USER CLOUD FOUNDATION
-- Migration: 001_initial_schema.sql
-- Description:
--   Normalized relational schema, custom types, constraints, row-level security
--   (RLS), and automated updated_at triggers for multi-user learning platform.
-- ==============================================================================

-- Enable UUID extension (built-in pgcrypto or uuid-ossp)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('active', 'disabled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mastery_level AS ENUM ('needs_practice', 'improving', 'mastered');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. TABLE: profiles
-- User profiles mapped 1:1 with auth.users (id = auth.uid())
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'avatar-keyboard',
  role user_role NOT NULL DEFAULT 'member',
  account_status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(account_status);

-- ------------------------------------------------------------------------------
-- 3. TABLE: profile_subjects
-- Stores subject assignments per user. Subject definitions stay in app code.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_profile_subject UNIQUE (profile_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_subjects_profile ON public.profile_subjects(profile_id);

-- ------------------------------------------------------------------------------
-- 4. TABLE: lesson_progress
-- Granular lesson progress per user and subject
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  unit_id TEXT,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  best_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  best_wpm NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_lesson_progress UNIQUE (profile_id, subject_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_profile ON public.lesson_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_sub_lesson ON public.lesson_progress(profile_id, subject_id, lesson_id);

-- ------------------------------------------------------------------------------
-- 5. TABLE: daily_activity
-- Daily learning time, streak accounting, and exercise counts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  study_seconds INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  typing_seconds INTEGER NOT NULL DEFAULT 0,
  review_seconds INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_daily_activity UNIQUE (profile_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_activity_profile_date ON public.daily_activity(profile_id, activity_date DESC);

-- ------------------------------------------------------------------------------
-- 6. TABLE: mistakes
-- Persistent Mistake Review items (words, code syntax, sentence errors)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mistakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  lesson_id TEXT,
  unit_id TEXT,
  mistake_type TEXT NOT NULL DEFAULT 'Vocabulary',
  target TEXT NOT NULL,
  user_answer TEXT,
  context TEXT,
  example_sentence JSONB,
  mastery_score INTEGER NOT NULL DEFAULT 30,
  mastery_level mastery_level NOT NULL DEFAULT 'needs_practice',
  mistake_count INTEGER NOT NULL DEFAULT 1,
  correct_count INTEGER NOT NULL DEFAULT 0,
  last_mistake_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_mistakes_item UNIQUE (profile_id, item_key)
);

CREATE INDEX IF NOT EXISTS idx_mistakes_profile ON public.mistakes(profile_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_subject ON public.mistakes(profile_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_mastery ON public.mistakes(profile_id, mastery_score);

-- ------------------------------------------------------------------------------
-- 7. TABLE: vocabulary
-- User-specific vocabulary terms and mastery state
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  term TEXT NOT NULL,
  meaning TEXT,
  example_context TEXT,
  mastery_score INTEGER NOT NULL DEFAULT 30,
  mistake_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_vocabulary_term UNIQUE (profile_id, language, term)
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_profile ON public.vocabulary(profile_id, language);

-- ------------------------------------------------------------------------------
-- 8. TABLE: typing_stats
-- Daily touch typing curriculum results and high scores
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.typing_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  typing_day INTEGER NOT NULL,
  best_wpm NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  best_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  characters_typed INTEGER NOT NULL DEFAULT 0,
  mistakes_count INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  attempts INTEGER NOT NULL DEFAULT 1,
  exercise_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_typing_stats UNIQUE (profile_id, typing_day)
);

CREATE INDEX IF NOT EXISTS idx_typing_stats_profile ON public.typing_stats(profile_id, typing_day);

-- ------------------------------------------------------------------------------
-- 9. TABLE: user_settings
-- User preferences that follow the user across devices (no secrets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  typing_sound_volume NUMERIC(3,2) NOT NULL DEFAULT 0.4,
  caret_style TEXT NOT NULL DEFAULT 'line',
  font_size TEXT NOT NULL DEFAULT 'large',
  tts_voice TEXT NOT NULL DEFAULT 'default',
  tts_rate NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  swedish_translation_lang TEXT NOT NULL DEFAULT 'so',
  english_translation_lang TEXT NOT NULL DEFAULT 'so',
  python_support_lang TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. AUTOMATED updated_at TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_lesson_progress_updated_at ON public.lesson_progress;
CREATE TRIGGER trg_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_daily_activity_updated_at ON public.daily_activity;
CREATE TRIGGER trg_daily_activity_updated_at
  BEFORE UPDATE ON public.daily_activity
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_mistakes_updated_at ON public.mistakes;
CREATE TRIGGER trg_mistakes_updated_at
  BEFORE UPDATE ON public.mistakes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_vocabulary_updated_at ON public.vocabulary;
CREATE TRIGGER trg_vocabulary_updated_at
  BEFORE UPDATE ON public.vocabulary
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_typing_stats_updated_at ON public.typing_stats;
CREATE TRIGGER trg_typing_stats_updated_at
  BEFORE UPDATE ON public.typing_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: Is the caller an active Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND account_status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- POLICIES: profiles
-- Users can view their own profile. Admins can view all profiles.
-- Users can update display_name and avatar on their own profile.
-- Only Admins can change roles and account_status.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile or admin views all" ON public.profiles;
CREATE POLICY "Users can view own profile or admin views all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile display_name and avatar" ON public.profiles;
CREATE POLICY "Users can update own profile display_name and avatar"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    -- Non-admin cannot elevate role or change account status
    (auth.uid() = id AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) AND account_status = 'active')
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: profile_subjects
-- Users can view their own assigned subjects. Admins can view and manage all.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own subjects or admin views all" ON public.profile_subjects;
CREATE POLICY "Users can view own subjects or admin views all"
  ON public.profile_subjects FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Only admin can insert profile subjects" ON public.profile_subjects;
CREATE POLICY "Only admin can insert profile subjects"
  ON public.profile_subjects FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can delete profile subjects" ON public.profile_subjects;
CREATE POLICY "Only admin can delete profile subjects"
  ON public.profile_subjects FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: lesson_progress
-- Private to the profile owner (auth.uid() = profile_id). Admin can view for overview.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users own lesson_progress select" ON public.lesson_progress;
CREATE POLICY "Users own lesson_progress select"
  ON public.lesson_progress FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Users own lesson_progress insert" ON public.lesson_progress;
CREATE POLICY "Users own lesson_progress insert"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users own lesson_progress update" ON public.lesson_progress;
CREATE POLICY "Users own lesson_progress update"
  ON public.lesson_progress FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ------------------------------------------------------------------------------
-- POLICIES: daily_activity
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users own daily_activity select" ON public.daily_activity;
CREATE POLICY "Users own daily_activity select"
  ON public.daily_activity FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Users own daily_activity insert" ON public.daily_activity;
CREATE POLICY "Users own daily_activity insert"
  ON public.daily_activity FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users own daily_activity update" ON public.daily_activity;
CREATE POLICY "Users own daily_activity update"
  ON public.daily_activity FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ------------------------------------------------------------------------------
-- POLICIES: mistakes
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users own mistakes select" ON public.mistakes;
CREATE POLICY "Users own mistakes select"
  ON public.mistakes FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Users own mistakes insert" ON public.mistakes;
CREATE POLICY "Users own mistakes insert"
  ON public.mistakes FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users own mistakes update" ON public.mistakes;
CREATE POLICY "Users own mistakes update"
  ON public.mistakes FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users own mistakes delete" ON public.mistakes;
CREATE POLICY "Users own mistakes delete"
  ON public.mistakes FOR DELETE
  USING (auth.uid() = profile_id);

-- ------------------------------------------------------------------------------
-- POLICIES: vocabulary
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users own vocabulary select" ON public.vocabulary;
CREATE POLICY "Users own vocabulary select"
  ON public.vocabulary FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Users own vocabulary insert" ON public.vocabulary;
CREATE POLICY "Users own vocabulary insert"
  ON public.vocabulary FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users own vocabulary update" ON public.vocabulary;
CREATE POLICY "Users own vocabulary update"
  ON public.vocabulary FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ------------------------------------------------------------------------------
-- POLICIES: typing_stats
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users own typing_stats select" ON public.typing_stats;
CREATE POLICY "Users own typing_stats select"
  ON public.typing_stats FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Users own typing_stats insert" ON public.typing_stats;
CREATE POLICY "Users own typing_stats insert"
  ON public.typing_stats FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users own typing_stats update" ON public.typing_stats;
CREATE POLICY "Users own typing_stats update"
  ON public.typing_stats FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ------------------------------------------------------------------------------
-- POLICIES: user_settings
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users own user_settings select" ON public.user_settings;
CREATE POLICY "Users own user_settings select"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users own user_settings insert" ON public.user_settings;
CREATE POLICY "Users own user_settings insert"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users own user_settings update" ON public.user_settings;
CREATE POLICY "Users own user_settings update"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ------------------------------------------------------------------------------
-- 12. INITIAL ADMIN BOOTSTRAP TRIGGER (OPTIONAL HELPER)
-- Automatically creates public.profiles row when a new user signs up in auth.users
-- The very first user created in the system or a designated admin email automatically
-- receives the 'admin' role and all subjects assigned.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_count INTEGER;
  user_initial_role user_role;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;

  -- The very first user to register becomes the Admin; subsequent users are members
  IF profile_count = 0 THEN
    user_initial_role := 'admin';
  ELSE
    user_initial_role := 'member';
  END IF;

  INSERT INTO public.profiles (id, display_name, avatar, role, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Mubez'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'avatar-keyboard'),
    user_initial_role,
    'active'
  );

  -- Assign default subjects for the Admin
  IF user_initial_role = 'admin' THEN
    INSERT INTO public.profile_subjects (profile_id, subject_id)
    VALUES
      (NEW.id, 'swedish'),
      (NEW.id, 'english'),
      (NEW.id, 'python'),
      (NEW.id, 'typing');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
