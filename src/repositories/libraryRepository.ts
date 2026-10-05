import { getSupabase } from '../lib/supabaseClient';
import { DbLibraryFolder, DbLibraryFile, LibraryFileType } from './types';
import { defaultStorageProvider, StorageProvider } from '../services/storageProvider';

const STORAGE_BUCKET = 'library';
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const ALLOWED_MIME_TYPES: Record<string, LibraryFileType> = {
  'application/pdf': 'pdf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
};

const ALLOWED_EXTENSIONS: Record<string, LibraryFileType> = {
  pdf: 'pdf',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  webp: 'image',
};

export interface UploadFileParams {
  file: File;
  profileId: string;
  spaceId?: string | null;
  folderId?: string | null;
  subjectId?: string | null;
  title?: string;
  tags?: string[];
}

export interface GetFilesParams {
  profileId: string;
  spaceId?: string | null;
  folderId?: string | null;
  subjectId?: string;
  searchQuery?: string;
  favoritesOnly?: boolean;
}

export class LibraryRepository {
  private storageProvider: StorageProvider;

  constructor(storageProvider: StorageProvider = defaultStorageProvider) {
    this.storageProvider = storageProvider;
  }

  // ==========================================
  // LOCAL CACHE HELPERS (Scoped by profile & space)
  // ==========================================
  private getCacheKey(prefix: string, profileId: string, spaceId?: string | null): string {
    if (spaceId) {
      return `mylearning:${profileId}:space:${spaceId}:library:${prefix}`;
    }
    return `mylearning:${profileId}:library:${prefix}`;
  }

  private loadFromCache<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveToCache<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save library metadata to cache', e);
    }
  }

  // ==========================================
  // FOLDERS
  // ==========================================
  public async getFolders(profileId: string, spaceId?: string | null): Promise<DbLibraryFolder[]> {
    const cacheKey = this.getCacheKey('folders', profileId, spaceId);
    const supabase = getSupabase();

    if (!supabase) {
      return this.loadFromCache<DbLibraryFolder[]>(cacheKey) || [];
    }

    try {
      let query = supabase
        .from('library_folders')
        .select('*')
        .order('name', { ascending: true });

      if (spaceId) {
        query = query.eq('space_id', spaceId);
      } else {
        query = query.is('space_id', null).eq('owner_profile_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const folders = data as DbLibraryFolder[];
      this.saveToCache(cacheKey, folders);
      return folders;
    } catch (err) {
      console.error('getFolders error, falling back to cache:', err);
      return this.loadFromCache<DbLibraryFolder[]>(cacheKey) || [];
    }
  }

  public async createFolder(params: {
    name: string;
    owner_profile_id: string;
    space_id?: string | null;
    parent_id?: string | null;
    icon?: string;
  }): Promise<DbLibraryFolder> {
    const trimmed = params.name.trim();
    if (!trimmed) {
      throw new Error('Folder name cannot be empty.');
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Database client not available.');
    }

    const newFolder = {
      name: trimmed,
      owner_profile_id: params.owner_profile_id,
      space_id: params.space_id || null,
      parent_id: params.parent_id || null,
      icon: params.icon || null,
      is_favorite: false,
    };

    const { data, error } = await supabase
      .from('library_folders')
      .insert(newFolder)
      .select()
      .single();

    if (error) throw error;
    return data as DbLibraryFolder;
  }

  public async renameFolder(folderId: string, name: string): Promise<DbLibraryFolder> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Folder name cannot be empty.');
    }

    const supabase = getSupabase();
    if (!supabase) throw new Error('Database client not available.');

    const { data, error } = await supabase
      .from('library_folders')
      .update({ name: trimmed })
      .eq('id', folderId)
      .select()
      .single();

    if (error) throw error;
    return data as DbLibraryFolder;
  }

  public async deleteFolder(folderId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Database client not available.');

    const { error } = await supabase.from('library_folders').delete().eq('id', folderId);
    if (error) throw error;
  }

  // ==========================================
  // FILES
  // ==========================================
  public async getFiles(params: GetFilesParams): Promise<DbLibraryFile[]> {
    const cacheKey = this.getCacheKey(
      `files:${params.folderId || 'all'}:${params.subjectId || 'all'}`,
      params.profileId,
      params.spaceId
    );
    const supabase = getSupabase();

    if (!supabase) {
      return this.loadFromCache<DbLibraryFile[]>(cacheKey) || [];
    }

    try {
      let query = supabase
        .from('library_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (params.spaceId) {
        query = query.eq('space_id', params.spaceId);
      } else {
        query = query.is('space_id', null).eq('owner_profile_id', params.profileId);
      }

      if (params.folderId !== undefined) {
        if (params.folderId === null) {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', params.folderId);
        }
      }

      if (params.subjectId) {
        query = query.eq('subject_id', params.subjectId);
      }

      if (params.favoritesOnly) {
        query = query.eq('is_favorite', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      let files = data as DbLibraryFile[];
      if (params.searchQuery && params.searchQuery.trim()) {
        const q = params.searchQuery.toLowerCase().trim();
        files = files.filter(
          (f) =>
            f.title.toLowerCase().includes(q) ||
            f.file_name.toLowerCase().includes(q) ||
            f.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      this.saveToCache(cacheKey, files);
      return files;
    } catch (err) {
      console.error('getFiles error, falling back to cache:', err);
      return this.loadFromCache<DbLibraryFile[]>(cacheKey) || [];
    }
  }

  public async uploadFile(params: UploadFileParams): Promise<DbLibraryFile> {
    const { file, profileId, spaceId, folderId, subjectId, title, tags } = params;

    // 1. File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `Upload failed: "${file.name}" (${sizeMB} MB) exceeds the allowed 50 MB file size.`
      );
    }

    // 2. MIME & Extension validation
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const detectedType = ALLOWED_MIME_TYPES[file.type] || ALLOWED_EXTENSIONS[ext];

    if (!detectedType) {
      throw new Error(
        `Upload failed: Unsupported file type for "${file.name}". Only PDF and images (PNG, JPEG, WEBP) are supported.`
      );
    }

    const mimeType = file.type || (ext === 'pdf' ? 'application/pdf' : `image/${ext}`);
    const fileId = crypto.randomUUID();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    // 3. Storage path partitioning
    // Personal: personal/{profileId}/{fileId}/{sanitizedFileName}
    // Space: spaces/{spaceId}/{fileId}/{sanitizedFileName}
    const storagePath = spaceId
      ? `spaces/${spaceId}/${fileId}/${sanitizedFileName}`
      : `personal/${profileId}/${fileId}/${sanitizedFileName}`;

    // 4. Upload object via StorageProvider
    const uploadResult = await this.storageProvider.upload(
      STORAGE_BUCKET,
      storagePath,
      file,
      { contentType: mimeType }
    );

    if (uploadResult.error) {
      throw new Error(`Upload failed: ${uploadResult.error}`);
    }

    // 5. Insert metadata into library_files table
    const supabase = getSupabase();
    if (!supabase) {
      // Revert uploaded object
      await this.storageProvider.delete(STORAGE_BUCKET, storagePath);
      throw new Error('Database client not available.');
    }

    const fileRecord = {
      id: fileId,
      owner_profile_id: profileId,
      space_id: spaceId || null,
      folder_id: folderId || null,
      subject_id: subjectId || null,
      title: title?.trim() || file.name.replace(/\.[^/.]+$/, ''),
      file_name: file.name,
      file_type: detectedType,
      mime_type: mimeType,
      file_size: file.size,
      storage_path: storagePath,
      source_type: 'upload',
      external_id: null,
      page_count: null,
      last_read_page: 1,
      tags: tags || [],
      is_favorite: false,
    };

    const { data, error } = await supabase
      .from('library_files')
      .insert(fileRecord)
      .select()
      .single();

    if (error) {
      // Revert uploaded storage object
      await this.storageProvider.delete(STORAGE_BUCKET, storagePath);
      throw new Error(`Failed to save file record: ${error.message}`);
    }

    return data as DbLibraryFile;
  }

  public async renameFile(fileId: string, title: string): Promise<DbLibraryFile> {
    const trimmed = title.trim();
    if (!trimmed) throw new Error('Title cannot be empty.');

    const supabase = getSupabase();
    if (!supabase) throw new Error('Database client not available.');

    const { data, error } = await supabase
      .from('library_files')
      .update({ title: trimmed })
      .eq('id', fileId)
      .select()
      .single();

    if (error) throw error;
    return data as DbLibraryFile;
  }

  public async moveFile(fileId: string, folderId: string | null): Promise<DbLibraryFile> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Database client not available.');

    const { data, error } = await supabase
      .from('library_files')
      .update({ folder_id: folderId })
      .eq('id', fileId)
      .select()
      .single();

    if (error) throw error;
    return data as DbLibraryFile;
  }

  public async toggleFavorite(fileId: string, isFavorite: boolean): Promise<DbLibraryFile> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Database client not available.');

    const { data, error } = await supabase
      .from('library_files')
      .update({ is_favorite: isFavorite })
      .eq('id', fileId)
      .select()
      .single();

    if (error) throw error;
    return data as DbLibraryFile;
  }

  public async updateLastReadPage(fileId: string, pageNumber: number): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase
      .from('library_files')
      .update({ last_read_page: pageNumber })
      .eq('id', fileId);
  }

  public async deleteFile(fileId: string, storagePath: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Database client not available.');

    // 1. Delete from database
    const { error } = await supabase.from('library_files').delete().eq('id', fileId);
    if (error) throw error;

    // 2. Delete storage object
    if (storagePath) {
      await this.storageProvider.delete(STORAGE_BUCKET, storagePath);
    }
  }

  public async getFileSignedUrl(storagePath: string): Promise<string> {
    const result = await this.storageProvider.getSignedUrl(STORAGE_BUCKET, storagePath, 7200);
    if (result.error || !result.url) {
      throw new Error(result.error || 'Failed to retrieve signed file URL.');
    }
    return result.url;
  }

  public async downloadFileBlob(storagePath: string): Promise<Blob> {
    const result = await this.storageProvider.download(STORAGE_BUCKET, storagePath);
    if (result.error || !result.blob) {
      throw new Error(result.error || 'Failed to download file data.');
    }
    return result.blob;
  }
}

export const libraryRepository = new LibraryRepository();
