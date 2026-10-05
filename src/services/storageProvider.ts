import { getSupabase } from '../lib/supabaseClient';

export interface StorageUploadResult {
  path: string;
  error?: string;
}

export interface StorageDownloadResult {
  blob?: Blob;
  error?: string;
}

export interface StorageSignedUrlResult {
  url?: string;
  error?: string;
}

export interface StorageDeleteResult {
  success: boolean;
  error?: string;
}

/**
 * StorageProvider Interface
 * Decouples file storage operations from specific backend vendors (Supabase, Google Drive, etc.)
 */
export interface StorageProvider {
  upload(
    bucket: string,
    path: string,
    file: Blob | File,
    options?: { contentType?: string }
  ): Promise<StorageUploadResult>;

  download(bucket: string, path: string): Promise<StorageDownloadResult>;

  getSignedUrl(
    bucket: string,
    path: string,
    expiresInSeconds?: number
  ): Promise<StorageSignedUrlResult>;

  delete(bucket: string, path: string): Promise<StorageDeleteResult>;
}

/**
 * SupabaseStorageProvider
 * Uses Supabase Storage with strict private buckets and authenticated signed URLs
 */
export class SupabaseStorageProvider implements StorageProvider {
  public async upload(
    bucket: string,
    path: string,
    file: Blob | File,
    options?: { contentType?: string }
  ): Promise<StorageUploadResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return { path: '', error: 'Storage client is not initialized.' };
    }

    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: options?.contentType || (file instanceof File ? file.type : undefined),
        upsert: true,
      });

      if (error) {
        return { path: '', error: error.message };
      }

      return { path: data.path };
    } catch (err: any) {
      return { path: '', error: err.message || 'Unexpected storage upload error' };
    }
  }

  public async download(bucket: string, path: string): Promise<StorageDownloadResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: 'Storage client is not initialized.' };
    }

    try {
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error || !data) {
        return { error: error?.message || 'Failed to download file object.' };
      }
      return { blob: data };
    } catch (err: any) {
      return { error: err.message || 'Unexpected storage download error' };
    }
  }

  public async getSignedUrl(
    bucket: string,
    path: string,
    expiresInSeconds: number = 3600
  ): Promise<StorageSignedUrlResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: 'Storage client is not initialized.' };
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresInSeconds);

      if (error || !data?.signedUrl) {
        return { error: error?.message || 'Failed to generate signed URL.' };
      }

      return { url: data.signedUrl };
    } catch (err: any) {
      return { error: err.message || 'Unexpected signed URL error' };
    }
  }

  public async delete(bucket: string, path: string): Promise<StorageDeleteResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Storage client is not initialized.' };
    }

    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unexpected storage delete error' };
    }
  }
}

export const defaultStorageProvider: StorageProvider = new SupabaseStorageProvider();
