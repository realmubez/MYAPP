import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  FileText,
  Loader2,
  RefreshCw,
  LogOut,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Keyboard,
  ArrowRight,
} from 'lucide-react';
import {
  googleDriveService,
  GoogleDriveFile,
  GoogleDriveUser,
} from '../../services/googleDriveService';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { StudyDocument } from '../../services/fileReaderService';

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentImported: (doc: StudyDocument) => void;
}

export function GoogleDrivePickerModal({
  isOpen,
  onClose,
  onDocumentImported,
}: GoogleDrivePickerModalProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [user, setUser] = useState<GoogleDriveUser | null>(null);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isImportingId, setIsImportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const checkConnectionAndLoadFiles = useCallback(async (query?: string) => {
    setIsLoadingFiles(true);
    setError(null);

    const token = await googleDriveService.getProviderToken();
    if (!token) {
      setIsConnected(false);
      setUser(null);
      setFiles([]);
      setIsLoadingFiles(false);
      return;
    }

    setIsConnected(true);
    const currentUser = await googleDriveService.getCurrentUser();
    setUser(currentUser);

    const { files: fetchedFiles, error: fetchErr } = await googleDriveService.listFiles(query);
    if (fetchErr) {
      setError(fetchErr);
      if (fetchErr.includes('expired') || fetchErr.includes('Not connected')) {
        setIsConnected(false);
      }
    } else {
      setFiles(fetchedFiles);
    }
    setIsLoadingFiles(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkConnectionAndLoadFiles();
    }
  }, [isOpen, checkConnectionAndLoadFiles]);

  if (!isOpen) return null;

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    setError(null);
    const { error: signErr } = await googleDriveService.signInWithGoogleDrive();
    if (signErr) {
      setError(signErr.message);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await googleDriveService.signOut();
    setIsConnected(false);
    setUser(null);
    setFiles([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkConnectionAndLoadFiles(searchQuery);
  };

  const handleImportFile = async (file: GoogleDriveFile) => {
    setIsImportingId(file.id);
    setError(null);
    try {
      const studyDoc = await googleDriveService.importFile(file);
      onDocumentImported(studyDoc);
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to import ${file.name}`);
    } finally {
      setIsImportingId(null);
    }
  };

  const getFileBadge = (mimeType: string, name: string) => {
    if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25">PDF</span>;
    }
    if (mimeType === 'application/vnd.google-apps.document') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/25">Google Doc</span>;
    }
    if (name.endsWith('.md')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">Markdown</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">Text</span>;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-[#14110e] border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-amber-500/15 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 text-neutral-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top handle */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-800/80 bg-[#17130f]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Google Drive Integration</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Supabase Auth
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Import and read your Drive PDFs, Docs, & notes with Ryan UK voice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {/* Connection Status Banner */}
          {isConnected ? (
            <div className="p-3.5 rounded-2xl bg-[#0e1410] border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full border border-emerald-400/40 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {user?.name?.[0] || 'G'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-emerald-400 truncate flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Connected to Google Drive</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {user?.email || user?.name || 'Google Account'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => checkConnectionAndLoadFiles(searchQuery)}
                  disabled={isLoadingFiles}
                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer"
                  title="Refresh files"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin text-amber-400' : ''}`} />
                </button>
                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-neutral-800 text-[11px] transition-all cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#17130e] border border-amber-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Connect Google Drive</h3>
                <p className="text-xs text-neutral-300 max-w-md mx-auto mt-1">
                  Sign in with your Google account via Supabase to browse, import, and practice any of your documents directly.
                </p>
              </div>

              {!isSupabaseConfigured() ? (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Supabase API Keys Needed</span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    To connect Google Drive via Supabase, set the following environment variables in your project settings or secrets:
                  </p>
                  <div className="font-mono text-[10px] bg-black/60 p-2 rounded-lg border border-neutral-800 space-y-1 text-amber-200/90">
                    <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                    <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
                  </div>
                  <p className="text-neutral-400 text-[10px]">
                    Also ensure Google is enabled under <strong>Supabase &gt; Authentication &gt; Providers &gt; Google</strong>.
                  </p>
                </div>
              ) : null}

              <button
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in with Google</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Box when connected */}
          {isConnected && (
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PDFs, Docs, or notes in Google Drive..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0a0908] border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/80 font-sans"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 transition-all cursor-pointer"
              >
                Search
              </button>
            </form>
          )}

          {/* File List */}
          {isConnected && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Available Drive Documents ({files.length}):</span>
                {isLoadingFiles && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
              </div>

              {isLoadingFiles && files.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span>Loading files from your Google Drive...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-400 border border-dashed border-neutral-800 rounded-2xl p-6">
                  <FileText className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="font-semibold text-neutral-300">No documents found in Google Drive</p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Try searching for another filename or upload PDF/text files to your Drive.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-800/60 rounded-2xl border border-neutral-800 bg-[#0e0c0a] overflow-hidden">
                  {files.map((file) => {
                    const isImporting = isImportingId === file.id;
                    return (
                      <div
                        key={file.id}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                                {file.name}
                              </span>
                              {getFileBadge(file.mimeType, file.name)}
                            </div>
                            <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                              {file.size && <span>{file.size}</span>}
                              {file.modifiedTime && (
                                <span>Updated {new Date(file.modifiedTime).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleImportFile(file)}
                            disabled={Boolean(isImportingId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            {isImporting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Importing...</span>
                              </>
                            ) : (
                              <>
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Import & Read</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-neutral-800/80 bg-[#120f0c] flex items-center justify-between text-xs text-neutral-400">
          <span className="text-[11px] font-mono">Audio Engine: Ryan (Neural) UK</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
