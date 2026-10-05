import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Folder,
  FileText,
  Search,
  Upload,
  Plus,
  Clock,
  Star,
  BookOpen,
  ArrowUpRight,
  MoreVertical,
  ChevronRight,
  Trash2,
  Edit2,
  FolderInput,
  ImageIcon,
  Loader2,
  Filter,
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { DbLibraryFile, DbLibraryFolder } from '../repositories/types';
import { libraryRepository } from '../repositories/libraryRepository';
import { SUBJECT_REGISTRY } from '../services/subjectRegistry';
import { SubjectDefinition } from '../types';
import { UploadFileModal } from '../components/library/UploadFileModal';
import { CreateFolderModal } from '../components/library/CreateFolderModal';
import { FileActionModal } from '../components/library/FileActionModal';
import { FolderActionModal } from '../components/library/FolderActionModal';
import { FileViewerModal } from '../components/library/FileViewerModal';

type SortOption = 'date_desc' | 'date_asc' | 'title_asc' | 'size_desc';

export function LibraryPage() {
  const { profile } = useProfile();

  const [folders, setFolders] = useState<DbLibraryFolder[]>([]);
  const [files, setFiles] = useState<DbLibraryFile[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [fileAction, setFileAction] = useState<{
    file: DbLibraryFile;
    mode: 'rename' | 'move' | 'delete';
  } | null>(null);
  const [folderAction, setFolderAction] = useState<{
    folder: DbLibraryFolder;
    mode: 'rename' | 'delete';
  } | null>(null);
  const [viewingFile, setViewingFile] = useState<DbLibraryFile | null>(null);

  // Active file menu dropdown
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const [fetchedFolders, fetchedFiles] = await Promise.all([
        libraryRepository.getFolders(profile.id),
        libraryRepository.getFiles({ profileId: profile.id }),
      ]);
      setFolders(fetchedFolders);
      setFiles(fetchedFiles);
    } catch (err) {
      console.error('Error loading library data:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current folder object
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return folders.find((f) => f.id === currentFolderId) || null;
  }, [folders, currentFolderId]);

  // Count files per folder
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of files) {
      if (f.folder_id) {
        counts[f.folder_id] = (counts[f.folder_id] || 0) + 1;
      }
    }
    return counts;
  }, [files]);

  // Filtered and sorted files for the main view
  const displayFiles = useMemo(() => {
    let result = files;

    // Folder filtering: if a folder is selected, show files in that folder.
    // If no folder selected and searching, show all matching. If not searching, show root files (or all files)
    if (currentFolderId !== null) {
      result = result.filter((f) => f.folder_id === currentFolderId);
    }

    if (filterFavorites) {
      result = result.filter((f) => f.is_favorite);
    }

    if (selectedSubject) {
      result = result.filter((f) => f.subject_id === selectedSubject);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.file_name.toLowerCase().includes(q) ||
          (f.tags && f.tags.some((t) => t.toLowerCase().includes(q))) ||
          (f.subject_id && f.subject_id.toLowerCase().includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'size_desc') {
        return b.file_size - a.file_size;
      }
      return 0;
    });

    return result;
  }, [files, currentFolderId, filterFavorites, selectedSubject, searchQuery, sortBy]);

  // Recent files (up to 4 globally)
  const recentFiles = useMemo(() => {
    return [...files]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [files]);

  // Handlers
  const handleCreateFolder = async (name: string) => {
    if (!profile?.id) return;
    const newFolder = await libraryRepository.createFolder({
      name,
      owner_profile_id: profile.id,
      space_id: null,
    });
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    const updated = await libraryRepository.renameFolder(folderId, newName);
    setFolders((prev) => prev.map((f) => (f.id === folderId ? updated : f)));
  };

  const handleDeleteFolder = async (folderId: string) => {
    await libraryRepository.deleteFolder(folderId);
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setFiles((prev) => prev.map((f) => (f.folder_id === folderId ? { ...f, folder_id: null } : f)));
    if (currentFolderId === folderId) {
      setCurrentFolderId(null);
    }
  };

  const handleUploadFile = async (params: {
    file: File;
    title: string;
    folderId: string | null;
    subjectId: string | null;
    tags: string[];
  }) => {
    if (!profile?.id) return;
    const uploaded = await libraryRepository.uploadFile({
      file: params.file,
      profileId: profile.id,
      folderId: params.folderId,
      subjectId: params.subjectId,
      title: params.title,
      tags: params.tags,
    });
    setFiles((prev) => [uploaded, ...prev]);
  };

  const handleRenameFile = async (fileId: string, newTitle: string) => {
    const updated = await libraryRepository.renameFile(fileId, newTitle);
    setFiles((prev) => prev.map((f) => (f.id === fileId ? updated : f)));
  };

  const handleMoveFile = async (fileId: string, targetFolderId: string | null) => {
    const updated = await libraryRepository.moveFile(fileId, targetFolderId);
    setFiles((prev) => prev.map((f) => (f.id === fileId ? updated : f)));
  };

  const handleToggleFavorite = async (file: DbLibraryFile) => {
    const updated = await libraryRepository.toggleFavorite(file.id, !file.is_favorite);
    setFiles((prev) => prev.map((f) => (f.id === file.id ? updated : f)));
  };

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    await libraryRepository.deleteFile(fileId, storagePath);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoStr: string): string => {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Personal Study OS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Library
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Secure personal study documents, textbooks, PDFs, and learning references.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="new-folder-btn"
            onClick={() => setIsCreateFolderOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-[#15120f] hover:border-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Folder</span>
          </button>
          <button
            type="button"
            id="upload-file-btn"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-amber-500/10"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
        <button
          type="button"
          onClick={() => setCurrentFolderId(null)}
          className={`hover:text-white transition-colors cursor-pointer ${
            currentFolderId === null ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          All Library Files
        </button>
        {currentFolder && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              {currentFolder.name}
            </span>
          </>
        )}
      </div>

      {/* Folders Section (Shown in Root View) */}
      {currentFolderId === null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              <span>Folders</span>
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
            </span>
          </div>

          {folders.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-neutral-800 text-center text-xs text-neutral-400">
              No folders created yet. Click "New Folder" above to organize your study materials.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {folders.map((fld) => (
                <div
                  key={fld.id}
                  className="group relative p-3.5 rounded-xl border border-neutral-800/80 bg-[#14110e] hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentFolderId(fld.id)}
                    className="w-full text-left cursor-pointer"
                  >
                    <Folder className="w-5 h-5 mb-2 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-200 truncate leading-tight group-hover:text-white">
                        {fld.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {folderCounts[fld.id] || 0} items
                      </p>
                    </div>
                  </button>

                  {/* Folder Mini-Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderAction({ folder: fld, mode: 'rename' });
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                      title="Rename folder"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderAction({ folder: fld, mode: 'delete' });
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 cursor-pointer"
                      title="Delete folder"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toolbar: Search, Subject Filter, Sort, Favorites Toggle */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="library-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, PDFs, or tags..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#14110e] border border-neutral-800/80 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#14110e] border border-neutral-800/80 text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60 transition-colors"
          >
            <option value="">All Subjects</option>
            {(Object.values(SUBJECT_REGISTRY) as SubjectDefinition[]).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 px-3 rounded-xl bg-[#14110e] border border-neutral-800/80 text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60 transition-colors"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="title_asc">Title A-Z</option>
            <option value="size_desc">Largest Size</option>
          </select>

          <button
            type="button"
            onClick={() => setFilterFavorites((prev) => !prev)}
            className={`h-10 px-3 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              filterFavorites
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-[#14110e] border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Filter favorites"
          >
            <Star className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Favorites</span>
          </button>
        </div>
      </div>

      {/* Main Files Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>
              {currentFolder ? `Files in "${currentFolder.name}"` : 'All Study Documents'}
            </span>
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {displayFiles.length} {displayFiles.length === 1 ? 'document' : 'documents'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span>Loading study library...</span>
          </div>
        ) : displayFiles.length === 0 ? (
          <div className="p-12 rounded-2xl border border-neutral-800/80 bg-[#14110e] text-center space-y-3">
            <FileText className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-300 font-medium">No documents found</p>
            <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
              {searchQuery || selectedSubject || filterFavorites
                ? 'No documents match your filter criteria.'
                : 'Upload PDFs, worksheets, and study notes to build your personal knowledge base.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-800/80 bg-[#14110e] divide-y divide-neutral-800/60 overflow-hidden">
            {displayFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-900/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* File Type Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {file.file_type === 'image' ? (
                      <ImageIcon className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        onClick={() => setViewingFile(file)}
                        className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300 transition-colors truncate cursor-pointer"
                      >
                        {file.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(file)}
                        className="cursor-pointer text-neutral-500 hover:text-amber-400 transition-colors"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            file.is_favorite ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-neutral-400 font-mono">
                      <span>{file.file_name}</span>
                      {file.subject_id && (
                        <>
                          <span>·</span>
                          <span className="text-amber-400/90 capitalize">{file.subject_id}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{formatFileSize(file.file_size)}</span>
                      {file.file_type === 'pdf' && file.last_read_page && file.last_read_page > 1 && (
                        <>
                          <span>·</span>
                          <span className="text-neutral-300">Page {file.last_read_page}</span>
                        </>
                      )}
                    </div>

                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {file.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-[11px] text-neutral-500 font-mono hidden md:inline">
                    {formatDate(file.created_at)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setViewingFile(file)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>Open</span>
                    <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                  </button>

                  {/* Dropdown for Rename / Move / Delete */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuFileId === file.id && (
                      <div className="absolute right-0 top-8 z-30 w-36 rounded-xl bg-[#17130f] border border-neutral-800 shadow-xl py-1 text-xs text-neutral-300">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuFileId(null);
                            setFileAction({ file, mode: 'rename' });
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-neutral-800/80 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuFileId(null);
                            setFileAction({ file, mode: 'move' });
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-neutral-800/80 flex items-center gap-2 cursor-pointer"
                        >
                          <FolderInput className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Move</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuFileId(null);
                            setFileAction({ file, mode: 'delete' });
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-red-500/15 text-red-400 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isUploadOpen && (
        <UploadFileModal
          folders={folders}
          currentFolderId={currentFolderId}
          onClose={() => setIsUploadOpen(false)}
          onUpload={handleUploadFile}
        />
      )}

      {isCreateFolderOpen && (
        <CreateFolderModal
          onClose={() => setIsCreateFolderOpen(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {fileAction && (
        <FileActionModal
          file={fileAction.file}
          folders={folders}
          mode={fileAction.mode}
          onClose={() => setFileAction(null)}
          onRename={handleRenameFile}
          onMove={handleMoveFile}
          onDelete={handleDeleteFile}
        />
      )}

      {folderAction && (
        <FolderActionModal
          folder={folderAction.folder}
          mode={folderAction.mode}
          onClose={() => setFolderAction(null)}
          onRename={handleRenameFolder}
          onDelete={handleDeleteFolder}
        />
      )}

      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
          onPageUpdate={(fileId, page) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === fileId ? { ...f, last_read_page: page } : f))
            );
          }}
        />
      )}
    </div>
  );
}
