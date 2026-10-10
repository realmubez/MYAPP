/**
 * Google Drive & Supabase Auth Integration Service
 * Connects user's Google Drive via Supabase OAuth to list, search, download,
 * and practice documents directly without manual file downloads.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { FileReaderService, StudyDocument, formatFileSize } from './fileReaderService';
import * as pdfjsLib from 'pdfjs-dist';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleDriveUser {
  email?: string;
  name?: string;
  avatarUrl?: string;
}

class GoogleDriveService {
  private cachedProviderToken: string | null = null;

  /**
   * Initiates Google OAuth sign-in via Supabase with Google Drive scopes.
   */
  async signInWithGoogleDrive(): Promise<{ error: Error | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: new Error('Supabase client is not configured. Please check your environment keys.') };
    }

    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/read` : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        scopes: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  }

  /**
   * Sign out from Supabase & Google Drive session.
   */
  async signOut(): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    this.cachedProviderToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gdrive_cached_token');
    }
  }

  /**
   * Retrieves the current Google OAuth provider token from active Supabase session.
   */
  async getProviderToken(): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        const token = data.session.provider_token || null;
        if (token) {
          this.cachedProviderToken = token;
          if (typeof window !== 'undefined') {
            localStorage.setItem('gdrive_cached_token', token);
          }
          return token;
        }
      }
    } catch (err) {
      console.warn('Error fetching Supabase session token:', err);
    }

    // Check cached fallback
    if (this.cachedProviderToken) return this.cachedProviderToken;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gdrive_cached_token');
      if (stored) return stored;
    }

    return null;
  }

  /**
   * Get the current signed-in Google user information from Supabase.
   */
  async getCurrentUser(): Promise<GoogleDriveUser | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        return {
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
          avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
        };
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * List files from user's Google Drive (supports searching & filtering document types).
   */
  async listFiles(searchQuery?: string): Promise<{ files: GoogleDriveFile[]; error: string | null }> {
    const token = await this.getProviderToken();
    if (!token) {
      return {
        files: [],
        error: 'Not connected to Google Drive. Please click "Connect Google Drive" to sign in.',
      };
    }

    try {
      // Query for documents: PDFs, Google Docs, Plain Text, Word docs
      let q = "trashed = false and (mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'text/markdown' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType = 'application/msword')";
      
      if (searchQuery && searchQuery.trim()) {
        const escaped = searchQuery.replace(/'/g, "\\'");
        q += ` and name contains '${escaped}'`;
      }

      const params = new URLSearchParams({
        q,
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)',
        orderBy: 'modifiedTime desc',
        pageSize: '30',
      });

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.cachedProviderToken = null;
          return {
            files: [],
            error: 'Google Drive session expired. Please sign in again with Google.',
          };
        }
        const errJson = await response.json().catch(() => ({}));
        return {
          files: [],
          error: errJson.error?.message || `Google Drive API error (${response.status})`,
        };
      }

      const data = await response.json();
      const files: GoogleDriveFile[] = (data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size ? formatFileSize(parseInt(f.size, 10)) : undefined,
        modifiedTime: f.modifiedTime,
        webViewLink: f.webViewLink,
        iconLink: f.iconLink,
      }));

      return { files, error: null };
    } catch (err: any) {
      return {
        files: [],
        error: err.message || 'Failed to communicate with Google Drive.',
      };
    }
  }

  /**
   * Downloads and parses a document from Google Drive into a StudyDocument
   * for the Document Reader and Typing Engine.
   */
  async importFile(file: GoogleDriveFile): Promise<StudyDocument> {
    const token = await this.getProviderToken();
    if (!token) {
      throw new Error('No Google Drive authorization token found. Please reconnect.');
    }

    let extractedText = '';
    let fileType: StudyDocument['fileType'] = 'txt';

    // 1. Google Docs -> Export as plain text
    if (file.mimeType === 'application/vnd.google-apps.document') {
      fileType = 'doc';
      const exportUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
      const response = await fetch(exportUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Could not export Google Doc (${response.status})`);
      }
      extractedText = await response.text();
    }
    // 2. PDF Files -> Download binary and extract with PDF.js
    else if (file.mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      fileType = 'pdf';
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Could not download PDF from Drive (${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStr = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        text += pageStr + '\n\n';
      }
      extractedText = text;
    }
    // 3. Plain Text / Markdown / CSV / JSON
    else {
      fileType = file.name.endsWith('.md') ? 'md' : 'txt';
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Could not download file from Drive (${response.status})`);
      }
      extractedText = await response.text();
    }

    // Clean text and calculate word count
    const cleaned = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleaned) {
      throw new Error(`The selected file "${file.name}" is empty or has no readable text.`);
    }

    const words = cleaned.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

    const studyDoc: StudyDocument = {
      id: `gdrive-${file.id}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      fileType,
      fileSizeFormatted: file.size || 'Google Drive',
      uploadedAt: Date.now(),
      content: cleaned,
      description: `Imported from Google Drive (${file.name})`,
      language: 'multi',
      wordCount,
      readingTimeMinutes,
    };

    // Save to local storage for offline continuity
    FileReaderService.saveFile(studyDoc);

    return studyDoc;
  }

  /**
   * Save / Export a practice text or notes to Google Drive
   */
  async saveTextToDrive(title: string, content: string): Promise<{ fileId?: string; error?: string }> {
    const token = await this.getProviderToken();
    if (!token) {
      return { error: 'Not connected to Google Drive' };
    }

    try {
      const metadata = {
        name: `${title}.txt`,
        mimeType: 'text/plain',
      };

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
        content +
        closeDelimiter;

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { error: errJson.error?.message || 'Failed to save to Drive.' };
      }

      const resData = await response.json();
      return { fileId: resData.id };
    } catch (err: any) {
      return { error: err.message || 'Failed to save file to Google Drive.' };
    }
  }
}

export const googleDriveService = new GoogleDriveService();
