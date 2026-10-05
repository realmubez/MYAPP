-- ==============================================================================
-- MY LEARNING — PHASE 3: SHARED LIBRARY & STORAGE FOUNDATION + PROGRESS DELETE FIX
-- Migration: 003_library_and_progress_security.sql
-- Description:
--   1. Security correction: Restrict learning_space_progress DELETE strictly to the learner.
--   2. Storage provider & shared library foundation (personal OS + managed spaces).
--   3. Tables: library_folders, library_files with strict RLS policies.
--   4. Private storage bucket 'library' with strict storage.objects RLS policies.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. SECURITY CORRECTION: learning_space_progress DELETE
-- Strict ownership: Space owners and managers CANNOT delete learner progress.
-- ONLY the learner (auth.uid() = profile_id) can delete their own progress.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "learning_space_progress_delete" ON public.learning_space_progress;
CREATE POLICY "learning_space_progress_delete"
  ON public.learning_space_progress FOR DELETE
  USING (auth.uid() = profile_id);

-- ------------------------------------------------------------------------------
-- 1. HELPER: try_cast_uuid
-- Safely converts a string to UUID without throwing SQL exceptions on invalid paths
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.try_cast_uuid(p_text TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN p_text::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.try_cast_uuid(TEXT) TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- 2. TABLE: library_folders
-- Organizational hierarchy for library documents (personal or managed space)
-- Folders are organization, NOT subjects.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.library_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  space_id UUID REFERENCES public.learning_spaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.library_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_folders_owner ON public.library_folders(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_library_folders_space ON public.library_folders(space_id);
CREATE INDEX IF NOT EXISTS idx_library_folders_parent ON public.library_folders(parent_id);

-- ------------------------------------------------------------------------------
-- 3. TABLE: library_files
-- File metadata registry supporting both Personal OS and Shared Space files.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.library_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  space_id UUID REFERENCES public.learning_spaces(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.library_folders(id) ON DELETE SET NULL,
  subject_id TEXT,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'upload',
  external_id TEXT,
  page_count INTEGER,
  last_read_page INTEGER DEFAULT 1,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_library_file_source_type CHECK (source_type IN ('upload', 'google_drive')),
  CONSTRAINT chk_library_file_type CHECK (file_type IN ('pdf', 'image', 'document', 'other'))
);

CREATE INDEX IF NOT EXISTS idx_library_files_owner ON public.library_files(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_library_files_space ON public.library_files(space_id);
CREATE INDEX IF NOT EXISTS idx_library_files_folder ON public.library_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_library_files_subject ON public.library_files(subject_id);
CREATE INDEX IF NOT EXISTS idx_library_files_favorite ON public.library_files(is_favorite);

-- ------------------------------------------------------------------------------
-- 4. UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_library_folders_updated_at ON public.library_folders;
CREATE TRIGGER trg_library_folders_updated_at
  BEFORE UPDATE ON public.library_folders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_library_files_updated_at ON public.library_files;
CREATE TRIGGER trg_library_files_updated_at
  BEFORE UPDATE ON public.library_files
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. RLS POLICIES: library_folders
-- ------------------------------------------------------------------------------
ALTER TABLE public.library_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "library_folders_select" ON public.library_folders;
CREATE POLICY "library_folders_select"
  ON public.library_folders FOR SELECT
  USING (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_active_member(space_id))
  );

DROP POLICY IF EXISTS "library_folders_insert" ON public.library_folders;
CREATE POLICY "library_folders_insert"
  ON public.library_folders FOR INSERT
  WITH CHECK (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_owner_or_manager(space_id))
  );

DROP POLICY IF EXISTS "library_folders_update" ON public.library_folders;
CREATE POLICY "library_folders_update"
  ON public.library_folders FOR UPDATE
  USING (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_owner_or_manager(space_id))
  )
  WITH CHECK (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_owner_or_manager(space_id))
  );

DROP POLICY IF EXISTS "library_folders_delete" ON public.library_folders;
CREATE POLICY "library_folders_delete"
  ON public.library_folders FOR DELETE
  USING (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_owner_or_manager(space_id))
  );

-- ------------------------------------------------------------------------------
-- 6. RLS POLICIES: library_files
-- Personal files: Strictly private to the owner (auth.uid() = owner_profile_id).
-- Space files: Active space members can read; Owners/Managers can insert/update/delete.
-- ------------------------------------------------------------------------------
ALTER TABLE public.library_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "library_files_select" ON public.library_files;
CREATE POLICY "library_files_select"
  ON public.library_files FOR SELECT
  USING (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_active_member(space_id))
  );

DROP POLICY IF EXISTS "library_files_insert" ON public.library_files;
CREATE POLICY "library_files_insert"
  ON public.library_files FOR INSERT
  WITH CHECK (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_owner_or_manager(space_id))
  );

DROP POLICY IF EXISTS "library_files_update" ON public.library_files;
CREATE POLICY "library_files_update"
  ON public.library_files FOR UPDATE
  USING (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_owner_or_manager(space_id))
  )
  WITH CHECK (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_owner_or_manager(space_id))
  );

DROP POLICY IF EXISTS "library_files_delete" ON public.library_files;
CREATE POLICY "library_files_delete"
  ON public.library_files FOR DELETE
  USING (
    (space_id IS NULL AND owner_profile_id = auth.uid())
    OR
    (space_id IS NOT NULL AND public.is_space_owner_or_manager(space_id))
  );

-- ------------------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKET: 'library'
-- Private bucket (public = false), 50MB file size limit, strict allowed MIME types
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'library',
  'library',
  false,
  52428800, -- 50 MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']::text[];

-- ------------------------------------------------------------------------------
-- 8. STORAGE OBJECT RLS POLICIES (storage.objects)
-- Partitions:
--   personal/{profileId}/{fileId}/{fileName}
--   spaces/{spaceId}/{fileId}/{fileName}
-- ------------------------------------------------------------------------------

-- 8.1 SELECT / DOWNLOAD
DROP POLICY IF EXISTS "storage_library_select" ON storage.objects;
CREATE POLICY "storage_library_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'library'
    AND (
      -- Personal file: only the owner profile can read
      (
        split_part(name, '/', 1) = 'personal'
        AND split_part(name, '/', 2) = auth.uid()::text
      )
      OR
      -- Space file: any active member of the space can read
      (
        split_part(name, '/', 1) = 'spaces'
        AND public.is_space_active_member(public.try_cast_uuid(split_part(name, '/', 2)))
      )
    )
  );

-- 8.2 INSERT / UPLOAD
DROP POLICY IF EXISTS "storage_library_insert" ON storage.objects;
CREATE POLICY "storage_library_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'library'
    AND (
      -- Personal file: only owner profile can upload to their personal folder
      (
        split_part(name, '/', 1) = 'personal'
        AND split_part(name, '/', 2) = auth.uid()::text
      )
      OR
      -- Space file: only owner or manager of the space can upload
      (
        split_part(name, '/', 1) = 'spaces'
        AND public.is_space_owner_or_manager(public.try_cast_uuid(split_part(name, '/', 2)))
      )
    )
  );

-- 8.3 UPDATE / OVERWRITE
DROP POLICY IF EXISTS "storage_library_update" ON storage.objects;
CREATE POLICY "storage_library_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'library'
    AND (
      (
        split_part(name, '/', 1) = 'personal'
        AND split_part(name, '/', 2) = auth.uid()::text
      )
      OR
      (
        split_part(name, '/', 1) = 'spaces'
        AND public.is_space_owner_or_manager(public.try_cast_uuid(split_part(name, '/', 2)))
      )
    )
  )
  WITH CHECK (
    bucket_id = 'library'
    AND (
      (
        split_part(name, '/', 1) = 'personal'
        AND split_part(name, '/', 2) = auth.uid()::text
      )
      OR
      (
        split_part(name, '/', 1) = 'spaces'
        AND public.is_space_owner_or_manager(public.try_cast_uuid(split_part(name, '/', 2)))
      )
    )
  );

-- 8.4 DELETE
DROP POLICY IF EXISTS "storage_library_delete" ON storage.objects;
CREATE POLICY "storage_library_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'library'
    AND (
      (
        split_part(name, '/', 1) = 'personal'
        AND split_part(name, '/', 2) = auth.uid()::text
      )
      OR
      (
        split_part(name, '/', 1) = 'spaces'
        AND public.is_space_owner_or_manager(public.try_cast_uuid(split_part(name, '/', 2)))
      )
    )
  );
