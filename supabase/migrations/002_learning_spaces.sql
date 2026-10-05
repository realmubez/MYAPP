-- ==============================================================================
-- MY LEARNING — PHASE 2: GENERIC LEARNING SPACES, MEMBERSHIP & RLS
-- Migration: 002_learning_spaces.sql
-- Description:
--   Generic multi-tenant Learning Spaces foundation, membership roles, space subjects,
--   modular curriculum hierarchy, isolated learner progress, and recursive-safe RLS.
--   Strictly generic: no hardcoded names, accounts, or pre-assigned spaces.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: learning_spaces
-- Generic learning space container (can be managed, personal, or cohort-based)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'managed',
  primary_language TEXT NOT NULL DEFAULT 'en',
  support_languages TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_learning_spaces_type CHECK (type IN ('managed', 'personal', 'cohort')),
  CONSTRAINT chk_learning_spaces_status CHECK (status IN ('active', 'archived', 'suspended'))
);

CREATE INDEX IF NOT EXISTS idx_learning_spaces_owner ON public.learning_spaces(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_learning_spaces_slug ON public.learning_spaces(slug);
CREATE INDEX IF NOT EXISTS idx_learning_spaces_status ON public.learning_spaces(status);

-- ------------------------------------------------------------------------------
-- 2. TABLE: learning_space_members
-- Multi-role space memberships (owner, manager, learner) with status tracking
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_space_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.learning_spaces(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_space_member UNIQUE (space_id, profile_id),
  CONSTRAINT chk_space_member_role CHECK (role IN ('owner', 'manager', 'learner')),
  CONSTRAINT chk_space_member_status CHECK (status IN ('active', 'invited', 'suspended'))
);

CREATE INDEX IF NOT EXISTS idx_space_members_space ON public.learning_space_members(space_id);
CREATE INDEX IF NOT EXISTS idx_space_members_profile ON public.learning_space_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_space_members_lookup ON public.learning_space_members(space_id, profile_id, role, status);

-- ------------------------------------------------------------------------------
-- 3. TABLE: learning_space_subjects
-- Relational mapping of subjects assigned to a specific learning space
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_space_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.learning_spaces(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_space_subject UNIQUE (space_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_space_subjects_space ON public.learning_space_subjects(space_id);
CREATE INDEX IF NOT EXISTS idx_space_subjects_subject ON public.learning_space_subjects(subject_id);

-- ------------------------------------------------------------------------------
-- 4. TABLE: learning_space_modules
-- Curriculum module/topic grouping within a space and subject
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_space_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.learning_spaces(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_space_module_status CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_space_modules_space ON public.learning_space_modules(space_id);
CREATE INDEX IF NOT EXISTS idx_space_modules_sub_order ON public.learning_space_modules(space_id, subject_id, sort_order);

-- ------------------------------------------------------------------------------
-- 5. TABLE: learning_space_lessons
-- Structured lesson content supporting multi-mode exercises (READ, TYPE, RECALL, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_space_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.learning_spaces(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learning_space_modules(id) ON DELETE SET NULL,
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_space_lesson_status CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_space_lessons_space ON public.learning_space_lessons(space_id);
CREATE INDEX IF NOT EXISTS idx_space_lessons_module ON public.learning_space_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_space_lessons_status ON public.learning_space_lessons(space_id, status);

-- ------------------------------------------------------------------------------
-- 6. TABLE: learning_space_progress
-- Learner lesson progress owned strictly by the learner profile_id
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_space_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.learning_spaces(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.learning_space_lessons(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  score NUMERIC(5,2),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_studied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_space_lesson_profile UNIQUE (space_id, lesson_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_space_progress_learner ON public.learning_space_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_space_progress_space_learner ON public.learning_space_progress(space_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_space_progress_lesson ON public.learning_space_progress(lesson_id);

-- ------------------------------------------------------------------------------
-- 7. UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_learning_spaces_updated_at ON public.learning_spaces;
CREATE TRIGGER trg_learning_spaces_updated_at
  BEFORE UPDATE ON public.learning_spaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_learning_space_members_updated_at ON public.learning_space_members;
CREATE TRIGGER trg_learning_space_members_updated_at
  BEFORE UPDATE ON public.learning_space_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_learning_space_modules_updated_at ON public.learning_space_modules;
CREATE TRIGGER trg_learning_space_modules_updated_at
  BEFORE UPDATE ON public.learning_space_modules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_learning_space_lessons_updated_at ON public.learning_space_lessons;
CREATE TRIGGER trg_learning_space_lessons_updated_at
  BEFORE UPDATE ON public.learning_space_lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_learning_space_progress_updated_at ON public.learning_space_progress;
CREATE TRIGGER trg_learning_space_progress_updated_at
  BEFORE UPDATE ON public.learning_space_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 8. INVARIANT & DRIFT PREVENTION TRIGGERS
-- Prevents owner_profile_id from drifting from member role = 'owner'
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_space_owner_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.learning_space_members (space_id, profile_id, role, status)
  VALUES (NEW.id, NEW.owner_profile_id, 'owner', 'active')
  ON CONFLICT (space_id, profile_id) DO UPDATE
  SET role = 'owner', status = 'active', updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS trg_sync_space_owner_member ON public.learning_spaces;
CREATE TRIGGER trg_sync_space_owner_member
  AFTER INSERT OR UPDATE OF owner_profile_id ON public.learning_spaces
  FOR EACH ROW EXECUTE FUNCTION public.sync_space_owner_member();

CREATE OR REPLACE FUNCTION public.validate_space_member_role()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  SELECT owner_profile_id INTO v_owner_id
  FROM public.learning_spaces
  WHERE id = NEW.space_id;

  -- Only space owner_profile_id can hold owner role
  IF NEW.role = 'owner' AND NEW.profile_id <> v_owner_id THEN
    RAISE EXCEPTION 'Only the space owner_profile_id can hold the owner role.';
  END IF;

  -- The space owner cannot be demoted without reassigning owner_profile_id
  IF NEW.profile_id = v_owner_id AND NEW.role <> 'owner' THEN
    RAISE EXCEPTION 'The space owner cannot be demoted from owner role.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_space_member_role ON public.learning_space_members;
CREATE TRIGGER trg_validate_space_member_role
  BEFORE INSERT OR UPDATE ON public.learning_space_members
  FOR EACH ROW EXECUTE FUNCTION public.validate_space_member_role();

-- ------------------------------------------------------------------------------
-- 9. RECURSION-SAFE RLS HELPER FUNCTIONS
-- Using SECURITY DEFINER to avoid infinite recursion when querying space members
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_space_owner(p_space_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT (
    EXISTS (SELECT 1 FROM public.learning_spaces WHERE id = p_space_id AND owner_profile_id = p_user_id)
    OR
    EXISTS (SELECT 1 FROM public.learning_space_members WHERE space_id = p_space_id AND profile_id = p_user_id AND role = 'owner' AND status = 'active')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, auth, pg_temp STABLE;

CREATE OR REPLACE FUNCTION public.is_space_owner_or_manager(p_space_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT (
    public.is_space_owner(p_space_id, p_user_id)
    OR
    EXISTS (SELECT 1 FROM public.learning_space_members WHERE space_id = p_space_id AND profile_id = p_user_id AND role = 'manager' AND status = 'active')
    OR
    public.is_admin()
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, auth, pg_temp STABLE;

CREATE OR REPLACE FUNCTION public.is_space_active_member(p_space_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT (
    public.is_space_owner(p_space_id, p_user_id)
    OR
    EXISTS (SELECT 1 FROM public.learning_space_members WHERE space_id = p_space_id AND profile_id = p_user_id AND status = 'active')
    OR
    public.is_admin()
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, auth, pg_temp STABLE;

-- Grant execute permissions to standard client roles
GRANT EXECUTE ON FUNCTION public.is_space_owner(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_space_owner_or_manager(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_space_active_member(UUID, UUID) TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all 6 tables
ALTER TABLE public.learning_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_space_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_space_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_space_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_space_progress ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLICIES: learning_spaces
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "learning_spaces_select" ON public.learning_spaces;
CREATE POLICY "learning_spaces_select"
  ON public.learning_spaces FOR SELECT
  USING (
    owner_profile_id = auth.uid()
    OR public.is_space_active_member(id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_spaces_insert" ON public.learning_spaces;
CREATE POLICY "learning_spaces_insert"
  ON public.learning_spaces FOR INSERT
  WITH CHECK (
    owner_profile_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_spaces_update" ON public.learning_spaces;
CREATE POLICY "learning_spaces_update"
  ON public.learning_spaces FOR UPDATE
  USING (
    owner_profile_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    owner_profile_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_spaces_delete" ON public.learning_spaces;
CREATE POLICY "learning_spaces_delete"
  ON public.learning_spaces FOR DELETE
  USING (
    owner_profile_id = auth.uid()
    OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- POLICIES: learning_space_members
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "learning_space_members_select" ON public.learning_space_members;
CREATE POLICY "learning_space_members_select"
  ON public.learning_space_members FOR SELECT
  USING (
    profile_id = auth.uid()
    OR public.is_space_active_member(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_members_insert" ON public.learning_space_members;
CREATE POLICY "learning_space_members_insert"
  ON public.learning_space_members FOR INSERT
  WITH CHECK (
    public.is_space_owner(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_members_update" ON public.learning_space_members;
CREATE POLICY "learning_space_members_update"
  ON public.learning_space_members FOR UPDATE
  USING (
    public.is_space_owner(space_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_space_owner(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_members_delete" ON public.learning_space_members;
CREATE POLICY "learning_space_members_delete"
  ON public.learning_space_members FOR DELETE
  USING (
    public.is_space_owner(space_id)
    OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- POLICIES: learning_space_subjects
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "learning_space_subjects_select" ON public.learning_space_subjects;
CREATE POLICY "learning_space_subjects_select"
  ON public.learning_space_subjects FOR SELECT
  USING (
    public.is_space_active_member(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_subjects_insert" ON public.learning_space_subjects;
CREATE POLICY "learning_space_subjects_insert"
  ON public.learning_space_subjects FOR INSERT
  WITH CHECK (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_subjects_update" ON public.learning_space_subjects;
CREATE POLICY "learning_space_subjects_update"
  ON public.learning_space_subjects FOR UPDATE
  USING (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_subjects_delete" ON public.learning_space_subjects;
CREATE POLICY "learning_space_subjects_delete"
  ON public.learning_space_subjects FOR DELETE
  USING (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- POLICIES: learning_space_modules
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "learning_space_modules_select_staff" ON public.learning_space_modules;
CREATE POLICY "learning_space_modules_select_staff"
  ON public.learning_space_modules FOR SELECT
  USING (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_modules_select_learner" ON public.learning_space_modules;
CREATE POLICY "learning_space_modules_select_learner"
  ON public.learning_space_modules FOR SELECT
  USING (
    public.is_space_active_member(space_id)
    AND status = 'published'
  );

DROP POLICY IF EXISTS "learning_space_modules_insert" ON public.learning_space_modules;
CREATE POLICY "learning_space_modules_insert"
  ON public.learning_space_modules FOR INSERT
  WITH CHECK (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_modules_update" ON public.learning_space_modules;
CREATE POLICY "learning_space_modules_update"
  ON public.learning_space_modules FOR UPDATE
  USING (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_modules_delete" ON public.learning_space_modules;
CREATE POLICY "learning_space_modules_delete"
  ON public.learning_space_modules FOR DELETE
  USING (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- POLICIES: learning_space_lessons
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "learning_space_lessons_select_staff" ON public.learning_space_lessons;
CREATE POLICY "learning_space_lessons_select_staff"
  ON public.learning_space_lessons FOR SELECT
  USING (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_lessons_select_learner" ON public.learning_space_lessons;
CREATE POLICY "learning_space_lessons_select_learner"
  ON public.learning_space_lessons FOR SELECT
  USING (
    public.is_space_active_member(space_id)
    AND status = 'published'
  );

DROP POLICY IF EXISTS "learning_space_lessons_insert" ON public.learning_space_lessons;
CREATE POLICY "learning_space_lessons_insert"
  ON public.learning_space_lessons FOR INSERT
  WITH CHECK (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_lessons_update" ON public.learning_space_lessons;
CREATE POLICY "learning_space_lessons_update"
  ON public.learning_space_lessons FOR UPDATE
  USING (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_lessons_delete" ON public.learning_space_lessons;
CREATE POLICY "learning_space_lessons_delete"
  ON public.learning_space_lessons FOR DELETE
  USING (
    public.is_space_owner_or_manager(space_id)
    OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- POLICIES: learning_space_progress
-- Ownership rule: progress belongs strictly to profile_id (learner).
-- Owner can read progress in their owned space. Manager cannot read progress.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "learning_space_progress_select_owner_learner" ON public.learning_space_progress;
CREATE POLICY "learning_space_progress_select_owner_learner"
  ON public.learning_space_progress FOR SELECT
  USING (
    auth.uid() = profile_id
    OR public.is_space_owner(space_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "learning_space_progress_insert" ON public.learning_space_progress;
CREATE POLICY "learning_space_progress_insert"
  ON public.learning_space_progress FOR INSERT
  WITH CHECK (
    auth.uid() = profile_id
    AND public.is_space_active_member(space_id)
  );

DROP POLICY IF EXISTS "learning_space_progress_update" ON public.learning_space_progress;
CREATE POLICY "learning_space_progress_update"
  ON public.learning_space_progress FOR UPDATE
  USING (
    auth.uid() = profile_id
    AND public.is_space_active_member(space_id)
  )
  WITH CHECK (
    auth.uid() = profile_id
    AND public.is_space_active_member(space_id)
  );

DROP POLICY IF EXISTS "learning_space_progress_delete" ON public.learning_space_progress;
CREATE POLICY "learning_space_progress_delete"
  ON public.learning_space_progress FOR DELETE
  USING (
    auth.uid() = profile_id
    OR public.is_space_owner(space_id)
    OR public.is_admin()
  );
